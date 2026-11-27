import { NextRequest } from 'next/server';
import { z, ZodError } from 'zod';
import {
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  DomainRuleError,
  RateLimitError,
} from '@/lib/api/errors';
import { successResponse } from '@/lib/api/response';
import { withErrorHandler, maskPdplData } from '@/lib/api/middleware';

function createMockRequest(url = 'http://localhost:3000/api/v1/test'): NextRequest {
  return new NextRequest(url, {
    headers: { 'x-request-id': 'test-req-123' },
  });
}

describe('Phase 1.4 Global API Response Envelope & Error Handler', () => {
  it('returns standardized success envelope', async () => {
    const handler = withErrorHandler(async () => {
      return successResponse({ orderNumber: 'ORD-2026-00001' }, 'Created', 201, 'ORDER_CREATED');
    });

    const res = await handler(createMockRequest(), { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.code).toBe('ORDER_CREATED');
    expect(body.data).toEqual({ orderNumber: 'ORD-2026-00001' });
    expect(body.meta.timestamp).toBeDefined();
    expect(body.meta.requestId).toBeDefined();
  });

  it.each([
    [new ValidationError('Invalid dimensions', { width: 'too small' }), 400, 'VALIDATION_ERROR'],
    [new AuthError('OTP expired'), 401, 'UNAUTHORIZED'],
    [new ForbiddenError('Admin only'), 403, 'FORBIDDEN'],
    [new NotFoundError('Order missing'), 404, 'NOT_FOUND'],
    [new ConflictError('Duplicate phone'), 409, 'CONFLICT'],
    [new DomainRuleError('DISPATCH_HOLD_DUE_PAYMENT', 'Milestone 2 unpaid'), 422, 'DISPATCH_HOLD_DUE_PAYMENT'],
    [new RateLimitError('Slow down'), 429, 'RATE_LIMIT_EXCEEDED'],
  ])('maps %p to RFC 7807 error envelope', async (err, expectedStatus, expectedCode) => {
    const handler = withErrorHandler(async () => {
      throw err;
    });

    const res = await handler(createMockRequest(), { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(expectedStatus);
    expect(body.success).toBe(false);
    expect(body.status).toBe(expectedStatus);
    expect(body.code).toBe(expectedCode);
    expect(body.detail).toBe(err.message);
    expect(body.meta.requestId).toBe('test-req-123');
  });

  it('catches ZodError and returns 400 VALIDATION_ERROR', async () => {
    const handler = withErrorHandler(async () => {
      try {
        z.object({ widthMm: z.number().min(400) }).parse({ widthMm: 100 });
      } catch (e) {
        if (e instanceof ZodError) throw e;
      }
      return successResponse({});
    });

    const res = await handler(createMockRequest(), { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.details.fieldErrors.widthMm).toBeDefined();
  });

  it('masks Saudi mobile numbers and sensitive keys for PDPL logging', () => {
    const masked = maskPdplData({
      phone: '+966501234567',
      passwordHash: 'secret-hash',
      otp: '1234',
      note: 'Call 0501234567 tomorrow',
    }) as Record<string, unknown>;

    expect(masked.phone).toBe('+9665*****567');
    expect(masked.passwordHash).toBe('[REDACTED]');
    expect(masked.otp).toBe('[REDACTED]');
    expect(masked.note).toBe('Call +9665*****567 tomorrow');
  });
});
