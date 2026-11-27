export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { CartService } from '@/modules/cart/cart.service';
import { extractCartIdentity } from '@/modules/cart/cart-identity';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const identity = extractCartIdentity(req);
  const body = await req.json();
  const result = await CartService.addItem(identity, body);

  return successResponse(
    result,
    'Configured furniture added to cart.',
    201,
    'ITEM_ADDED_TO_CART'
  );
});
