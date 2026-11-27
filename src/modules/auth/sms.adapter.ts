import { maskPdplData } from '@/lib/api/middleware';

export interface SmsSendResult {
  provider: 'MOCK' | 'TAQNYAT' | 'UNIFONIC';
  messageId: string;
  delivered: boolean;
}

/**
 * SMS Gateway Adapter supporting Taqnyat, Unifonic, and local mock mode.
 */
export async function sendSmsOtp(
  normalizedPhone: string,
  otpCode: string
): Promise<SmsSendResult> {
  const provider = (process.env.SMS_PROVIDER || 'MOCK').toUpperCase();

  if (provider === 'MOCK' || process.env.NODE_ENV !== 'production') {
    const masked = maskPdplData(normalizedPhone);
    console.info(`[SMS-MOCK] OTP queued for ${String(masked)}`);
    return {
      provider: 'MOCK',
      messageId: `mock-${Date.now()}`,
      delivered: true,
    };
  }

  // Production Taqnyat / Unifonic HTTP dispatch
  const apiUrl = process.env.SMS_API_URL;
  const apiKey = process.env.SMS_API_KEY;
  if (!apiUrl || !apiKey) {
    throw new Error('SMS_API_URL and SMS_API_KEY must be configured in production');
  }

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      recipients: [normalizedPhone],
      body: `رمز التحقق الخاص بك في ساتكو للأثاث الذكي هو: ${otpCode} (صالح لمدة 3 دقائق)`,
      sender: process.env.SMS_SENDER_NAME || 'SATCO',
    }),
  });

  if (!res.ok) {
    throw new Error(`SMS gateway responded with status ${res.status}`);
  }

  return {
    provider: provider === 'UNIFONIC' ? 'UNIFONIC' : 'TAQNYAT',
    messageId: `sms-${Date.now()}`,
    delivered: true,
  };
}
