export const dynamic = 'force-dynamic';
import { withAuth } from '@/lib/api/auth-guard';
import { withIdempotency } from '@/lib/api/idempotency';
import { successResponse } from '@/lib/api/response';
import { PaymentService } from '@/modules/payments/payment.service';

export const POST = withAuth(
  async (req) => {
    return withIdempotency(req, async () => {
      const body = await req.json();
      const result = await PaymentService.initializeMilestonePayment(
        req.currentUser.sub,
        body
      );

      return successResponse(
        result,
        'Payment session initialized.',
        200,
        'PAYMENT_INITIALIZED'
      );
    });
  },
  { roles: ['CUSTOMER', 'SUPER_ADMIN'] }
);
