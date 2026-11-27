export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { SaudiPhoneSchema } from '@/lib/validation/saudi-validators';
import { assertNotBlacklisted } from '@/modules/auth/blacklist.service';
import { requestSaudiOtp } from '@/modules/auth/otp.service';

const RequestOtpBodySchema = z.object({
  phoneNumber: SaudiPhoneSchema,
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { phoneNumber } = RequestOtpBodySchema.parse(body);

  await assertNotBlacklisted(phoneNumber);
  const result = await requestSaudiOtp(phoneNumber);

  return successResponse(
    result,
    `OTP verification code sent to ${result.normalizedPhone}.`,
    200,
    'OTP_SENT'
  );
});
