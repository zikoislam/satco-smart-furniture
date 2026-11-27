import { createHash, randomInt } from 'crypto';
import { redis } from '@/lib/redis';
import { queues } from '@/lib/queue';
import { AuthError, RateLimitError } from '@/lib/api/errors';
import { sendSmsOtp } from '@/modules/auth/sms.adapter';

const OTP_TTL_SECONDS = 180; // 3 minutes
const RESEND_COOLDOWN_SECONDS = 60;
const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 3;

export function hashOtp(phone: string, otpCode: string): string {
  const secret = process.env.OTP_HASH_SECRET || process.env.JWT_SECRET || 'satco-dev-otp-secret';
  return createHash('sha256').update(`${phone}:${otpCode}:${secret}`).digest('hex');
}

export function generateFourDigitOtp(): string {
  return String(randomInt(1000, 10000));
}

export interface RequestOtpResult {
  normalizedPhone: string;
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
}

/**
 * Generates a 4-digit OTP, enforces 3 requests / 10 minutes rate limit,
 * stores SHA-256 hash in Redis (180s TTL), and dispatches SMS.
 */
export async function requestSaudiOtp(normalizedPhone: string): Promise<RequestOtpResult> {
  const rateKey = `otp:rate:${normalizedPhone}`;
  const cooldownKey = `otp:cooldown:${normalizedPhone}`;
  const otpKey = `otp:code:${normalizedPhone}`;

  const inCooldown = await redis.get(cooldownKey);
  if (inCooldown) {
    throw new RateLimitError(
      'Please wait before requesting another OTP.',
      'OTP_RESEND_COOLDOWN',
      { resendAvailableInSeconds: RESEND_COOLDOWN_SECONDS }
    );
  }

  const currentCount = await redis.incr(rateKey);
  if (currentCount === 1) {
    await redis.expire(rateKey, RATE_LIMIT_WINDOW_SECONDS);
  }
  if (currentCount > RATE_LIMIT_MAX_REQUESTS) {
    throw new RateLimitError(
      'Too many OTP requests. Please try again after 10 minutes.',
      'OTP_RATE_LIMIT_EXCEEDED'
    );
  }

  const otpCode = generateFourDigitOtp();
  const hashed = hashOtp(normalizedPhone, otpCode);

  await redis.set(otpKey, hashed, 'EX', OTP_TTL_SECONDS);
  await redis.set(cooldownKey, '1', 'EX', RESEND_COOLDOWN_SECONDS);

  // Queue background delivery record & dispatch SMS
  try {
    await queues.smsOtp.add('send-otp', { phone: normalizedPhone, requestedAt: new Date().toISOString() });
  } catch {
    // Non-fatal if BullMQ queue is unavailable in unit/mock environments
  }

  await sendSmsOtp(normalizedPhone, otpCode);

  return {
    normalizedPhone,
    expiresInSeconds: OTP_TTL_SECONDS,
    resendAvailableInSeconds: RESEND_COOLDOWN_SECONDS,
  };
}

/**
 * Verifies the 4-digit OTP against Redis and invalidates it on success.
 */
export async function verifySaudiOtp(normalizedPhone: string, otpCode: string): Promise<void> {
  const otpKey = `otp:code:${normalizedPhone}`;
  const storedHash = await redis.get(otpKey);

  if (!storedHash) {
    throw new AuthError('OTP has expired or was not requested.', 'OTP_EXPIRED');
  }

  const incomingHash = hashOtp(normalizedPhone, otpCode);
  if (storedHash !== incomingHash) {
    throw new AuthError('Invalid OTP verification code.', 'OTP_INVALID');
  }

  await redis.del(otpKey);
}
