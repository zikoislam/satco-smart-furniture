import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { PaymentService } from '@/modules/payments/payment.service';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature');
  const parsedBody = JSON.parse(rawBody);

  const result = await PaymentService.handleWebhook(rawBody, signature, parsedBody);
  return NextResponse.json(result, { status: 200 });
});
