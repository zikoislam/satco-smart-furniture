export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { withErrorHandler, type RouteContext } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { CartService } from '@/modules/cart/cart.service';
import { extractCartIdentity } from '@/modules/cart/cart-identity';

export const PATCH = withErrorHandler<RouteContext<{ id: string }>>(
  async (req: NextRequest, context) => {
    const { id } = await context.params;
    const identity = extractCartIdentity(req);
    const body = await req.json();
    const updated = await CartService.updateItemQuantity(id, identity, body);

    return successResponse(updated, 'Cart item updated.', 200, 'CART_ITEM_UPDATED');
  }
);

export const DELETE = withErrorHandler<RouteContext<{ id: string }>>(
  async (req: NextRequest, context) => {
    const { id } = await context.params;
    const identity = extractCartIdentity(req);
    const deleted = await CartService.removeItem(id, identity);

    return successResponse(deleted, 'Cart item removed.', 200, 'CART_ITEM_REMOVED');
  }
);
