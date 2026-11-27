import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { AuthError, ForbiddenError } from '@/lib/api/errors';
import { prisma } from '@/lib/prisma';
import { signAccessToken } from '@/modules/auth/jwt.service';
import { verifyStaffPassword } from '@/modules/auth/password.service';

const StaffLoginBodySchema = z.object({
  email: z.string().email('Valid work email is required').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { email, password } = StaffLoginBodySchema.parse(body);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (user.role === 'CUSTOMER') {
    throw new ForbiddenError('Customers must authenticate via SMS OTP', 'STAFF_ONLY_ENDPOINT');
  }

  if (!user.isActive) {
    throw new ForbiddenError('Staff account is deactivated', 'ACCOUNT_DEACTIVATED');
  }

  const passwordValid = await verifyStaffPassword(password, user.passwordHash);
  if (!passwordValid) {
    throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const { accessToken, expiresIn } = signAccessToken({
    sub: user.id,
    role: user.role,
    phone: user.phone,
    email: user.email,
    companyId: user.companyId,
  });

  return successResponse(
    {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    },
    'Staff authenticated successfully.',
    200,
    'STAFF_AUTH_SUCCESS'
  );
});
