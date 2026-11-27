import { withAuth } from '@/lib/api/auth-guard';
import { withIdempotency } from '@/lib/api/idempotency';
import { successResponse } from '@/lib/api/response';
import { OrderService } from '@/modules/orders/order.service';

export const POST = withAuth(
  async (req) => {
    return withIdempotency(req, async () => {
      const body = await req.json();
      const order = await OrderService.checkoutCart(req.currentUser.sub, body);

      return successResponse(
        order,
        'Order created successfully; awaiting 50% commitment deposit.',
        201,
        'ORDER_CREATED'
      );
    });
  },
  { roles: ['CUSTOMER', 'SUPER_ADMIN'] }
);
