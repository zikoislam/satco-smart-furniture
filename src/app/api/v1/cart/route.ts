import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { CartService } from '@/modules/cart/cart.service';
import { extractCartIdentity } from '@/modules/cart/cart-identity';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const identity = extractCartIdentity(req);
  const cart = await CartService.getActiveCart(identity);
  return successResponse(cart, 'Active cart retrieved', 200, 'CART_RETRIEVED');
});
