import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import type { PaymentMethod } from '@prisma/client';
import { Decimal } from '@/lib/decimal';

export interface MoyasarCheckoutRequest {
  orderId: string;
  milestone: string;
  amountSar: Decimal;
  paymentMethod: PaymentMethod;
  callbackUrl: string;
}

export interface MoyasarCheckoutResponse {
  gatewayReference: string;
  checkoutUrl: string;
  rawPayload: Record<string, unknown>;
}

/**
 * Moyasar Payment Gateway Adapter (Mada / Apple Pay / Visa / Mastercard).
 * Runs in deterministic mock mode when MOYASAR_MOCK_MODE=true or MOYASAR_SECRET_KEY is unset.
 */
export class MoyasarAdapter {
  public static async createCheckout(
    req: MoyasarCheckoutRequest
  ): Promise<MoyasarCheckoutResponse> {
    const amountHalalas = req.amountSar.times(100).toDecimalPlaces(0).toNumber();
    const isMockMode =
      process.env.MOYASAR_MOCK_MODE === 'true' || !process.env.MOYASAR_SECRET_KEY;

    if (isMockMode) {
      const ref = `moyasar_ch_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
      return {
        gatewayReference: ref,
        checkoutUrl: `https://api.moyasar.com/v1/checkouts/${ref}`,
        rawPayload: {
          mode: 'MOCK',
          id: ref,
          amount: amountHalalas,
          currency: 'SAR',
          paymentMethod: req.paymentMethod,
          callbackUrl: req.callbackUrl,
        },
      };
    }

    const secretKey = process.env.MOYASAR_SECRET_KEY!;
    const authHeader = `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;

    const response = await fetch('https://api.moyasar.com/v1/invoices', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountHalalas,
        currency: 'SAR',
        description: `SATCO Order ${req.orderId} (${req.milestone})`,
        callback_url: req.callbackUrl,
        metadata: {
          orderId: req.orderId,
          milestone: req.milestone,
          paymentMethod: req.paymentMethod,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Moyasar API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as { id: string; url: string };
    return {
      gatewayReference: data.id,
      checkoutUrl: data.url,
      rawPayload: data as Record<string, unknown>,
    };
  }

  /**
   * Verifies HMAC-SHA256 webhook signature (`X-Signature` header) using timing-safe comparison.
   */
  public static verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
    if (!signatureHeader) return false;

    const secret = process.env.MOYASAR_WEBHOOK_SECRET || 'satco-dev-webhook-secret';
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');

    const providedBuffer = Buffer.from(signatureHeader.trim(), 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedBuffer, expectedBuffer);
  }
}
