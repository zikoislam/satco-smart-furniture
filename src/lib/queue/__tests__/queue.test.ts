import { QUEUE_NAMES } from '@/lib/queue';

describe('Phase 1.5 Queue Definitions', () => {
  it('defines all four required SATCO BullMQ queue names', () => {
    expect(QUEUE_NAMES.SMS_OTP).toBe('sms-otp');
    expect(QUEUE_NAMES.PAYMENT_WEBHOOK).toBe('payment-webhook');
    expect(QUEUE_NAMES.ZATCA_CLEARANCE).toBe('zatca-clearance');
    expect(QUEUE_NAMES.INSTALLATION_NOTIFICATION).toBe('installation-notification');
  });
});
