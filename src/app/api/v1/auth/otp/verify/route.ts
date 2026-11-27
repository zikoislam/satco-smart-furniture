import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { SaudiPhoneSchema } from '@/lib/validation/saudi-validators';
import { assertNotBlacklisted } from '@/modules/auth/blacklist.service';
import { verifySaudiOtp } from '@/modules/auth/otp.service';
import { signAccessToken } from '@/modules/auth/jwt.service';
import { CartService } from '@/modules/cart/cart.service';

const VerifyOtpBodySchema = z.object({
  phoneNumber: SaudiPhoneSchema,
  otpCode: z.string().regex(/^\d{4}$/, 'OTP code must be 4 digits'),
  fullName: z.string().min(2).max(255).optional(),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { phoneNumber, otpCode, fullName } = VerifyOtpBodySchema.parse(body);

  // 1. Verify OTP in Redis
  await verifySaudiOtp(phoneNumber, otpCode);

  // 2. Enforce fraud blacklist check (BR-SEC-001)
  await assertNotBlacklisted(phoneNumber);

  // 3. Upsert customer User + CustomerProfile atomically
  const user = await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { phone: phoneNumber },
      include: { customerProfile: true },
    });

    if (existing) {
      if (!existing.customerProfile) {
        await tx.customerProfile.create({
          data: { userId: existing.id, city: 'Riyadh' },
        });
      }
      return existing;
    }

    return tx.user.create({
      data: {
        phone: phoneNumber,
        fullName: fullName ?? 'SATCO Customer',
        role: 'CUSTOMER',
        preferredLocale: 'ar',
        customerProfile: {
          create: { city: 'Riyadh' },
        },
      },
    });
  });

  // 4. Auto-merge guest cart if X-Session-ID is present
  const guestSessionId = req.headers.get('x-session-id')?.trim();
  if (guestSessionId) {
    await CartService.mergeGuestCartToUser(guestSessionId, user.id);
  }

  // 5. Issue HS256 Bearer JWT
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
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        preferredLocale: user.preferredLocale,
      },
    },
    'Authenticated successfully.',
    200,
    'AUTH_SUCCESS'
  );
});
