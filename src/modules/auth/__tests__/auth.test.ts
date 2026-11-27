import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { signAccessToken, verifyAccessToken } from '@/modules/auth/jwt.service';
import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { hashOtp, requestSaudiOtp, verifySaudiOtp } from '@/modules/auth/otp.service';
import { POST as otpRequestHandler } from '@/app/api/v1/auth/otp/request/route';
import { POST as otpVerifyHandler } from '@/app/api/v1/auth/otp/verify/route';
import { POST as staffLoginHandler } from '@/app/api/v1/auth/staff/login/route';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock('@/lib/queue', () => ({
  queues: {
    smsOtp: { add: jest.fn().mockResolvedValue({ id: 'job-1' }) },
  },
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    blacklistEntry: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    customerProfile: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('Phase 2: Authentication, OTP, Blacklist, Staff Login & RBAC Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Feature 2.1: SMS OTP Request', () => {
    it('normalizes 0501234567 to +966501234567 and returns 180s expiry', async () => {
      (prisma.blacklistEntry.findUnique as jest.Mock).mockResolvedValue(null);
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.incr as jest.Mock).mockResolvedValue(1);
      (redis.expire as jest.Mock).mockResolvedValue(1);
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '0501234567' }),
      });

      const res = await otpRequestHandler(req, { params: Promise.resolve({}) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.code).toBe('OTP_SENT');
      expect(body.data.normalizedPhone).toBe('+966501234567');
      expect(body.data.expiresInSeconds).toBe(180);
    });

    it('enforces 3 requests / 10 min rate limit', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.incr as jest.Mock).mockResolvedValue(4);

      await expect(requestSaudiOtp('+966501234567')).rejects.toMatchObject({
        statusCode: 429,
        code: 'OTP_RATE_LIMIT_EXCEEDED',
      });
    });
  });

  describe('Feature 2.2: OTP Verification, Blacklist & JWT', () => {
    it('returns 403 ACCOUNT_BLACKLISTED for blacklisted phone', async () => {
      const validHash = hashOtp('+966501234567', '4892');
      (redis.get as jest.Mock).mockResolvedValue(validHash);
      (redis.del as jest.Mock).mockResolvedValue(1);
      (prisma.blacklistEntry.findUnique as jest.Mock).mockResolvedValue({
        id: 'bl-1',
        reason: 'SUSPECTED_FRAUD',
      });

      const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '0501234567', otpCode: '4892' }),
      });

      const res = await otpVerifyHandler(req, { params: Promise.resolve({}) });
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body.code).toBe('ACCOUNT_BLACKLISTED');
    });

    it('issues Bearer JWT for clean verified customer', async () => {
      const validHash = hashOtp('+966501234567', '4892');
      (redis.get as jest.Mock).mockResolvedValue(validHash);
      (redis.del as jest.Mock).mockResolvedValue(1);
      (prisma.blacklistEntry.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.$transaction as jest.Mock).mockResolvedValue({
        id: 'user-uuid-1',
        phone: '+966501234567',
        email: null,
        fullName: 'Faisal Al-Otaibi',
        role: 'CUSTOMER',
        preferredLocale: 'ar',
        companyId: null,
      });

      const req = new NextRequest('http://localhost:3000/api/v1/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: '+966501234567', otpCode: '4892' }),
      });

      const res = await otpVerifyHandler(req, { params: Promise.resolve({}) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.code).toBe('AUTH_SUCCESS');
      expect(body.data.tokenType).toBe('Bearer');
      expect(body.data.accessToken).toBeDefined();

      const decoded = verifyAccessToken(body.data.accessToken);
      expect(decoded.sub).toBe('user-uuid-1');
      expect(decoded.role).toBe('CUSTOMER');
    });

    it('rejects invalid OTP code with 401 OTP_INVALID', async () => {
      (redis.get as jest.Mock).mockResolvedValue(hashOtp('+966501234567', '1111'));
      await expect(verifySaudiOtp('+966501234567', '9999')).rejects.toMatchObject({
        statusCode: 401,
        code: 'OTP_INVALID',
      });
    });
  });

  describe('Feature 2.3: Staff Email/Password Login', () => {
    it('authenticates active staff user with valid Bcrypt password', async () => {
      const hash = await bcrypt.hash('SecurePass123!', 4);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'staff-1',
        email: 'operations@satco.sa',
        phone: '+966500000001',
        passwordHash: hash,
        fullName: 'Tariq Al-Otaibi',
        role: 'SUPER_ADMIN',
        isActive: true,
        companyId: 'comp-1',
      });

      const req = new NextRequest('http://localhost:3000/api/v1/auth/staff/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'operations@satco.sa', password: 'SecurePass123!' }),
      });

      const res = await staffLoginHandler(req, { params: Promise.resolve({}) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.code).toBe('STAFF_AUTH_SUCCESS');
      expect(body.data.user.role).toBe('SUPER_ADMIN');
      expect(body.data.accessToken).toBeDefined();
    });
  });

  describe('Feature 2.4: Auth Guard & RBAC Middleware', () => {
    const protectedHandler = withAuth(
      async (req) => successResponse({ userId: req.currentUser.sub, role: req.currentUser.role }),
      { roles: ['SUPER_ADMIN', 'FACTORY_MANAGER'] }
    );

    it('returns 401 without Authorization header', async () => {
      const req = new NextRequest('http://localhost:3000/api/v1/admin/test');
      const res = await protectedHandler(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(401);
    });

    it('returns 403 for insufficient role (CUSTOMER)', async () => {
      const { accessToken } = signAccessToken({ sub: 'cust-1', role: 'CUSTOMER' });
      const req = new NextRequest('http://localhost:3000/api/v1/admin/test', {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const res = await protectedHandler(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(403);
    });

    it('allows authorized role (SUPER_ADMIN) and injects currentUser', async () => {
      const { accessToken } = signAccessToken({ sub: 'admin-1', role: 'SUPER_ADMIN' });
      const req = new NextRequest('http://localhost:3000/api/v1/admin/test', {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const res = await protectedHandler(req, { params: Promise.resolve({}) });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data).toEqual({ userId: 'admin-1', role: 'SUPER_ADMIN' });
    });
  });
});
