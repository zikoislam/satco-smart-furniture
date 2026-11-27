export const dynamic = 'force-dynamic';
import { withAuth } from '@/lib/api/auth-guard';
import type { RouteContext } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { AddressService } from '@/modules/addresses/address.service';

export const PATCH = withAuth<RouteContext<{ addressId: string }>>(
  async (req, context) => {
    const { addressId } = await context.params;
    const body = await req.json();
    const address = await AddressService.updateAddress(req.currentUser.sub, addressId, body);
    return successResponse({ address }, 'Address updated.', 200, 'ADDRESS_UPDATED');
  },
  { roles: ['CUSTOMER', 'SUPER_ADMIN'] }
);

export const DELETE = withAuth<RouteContext<{ addressId: string }>>(
  async (req, context) => {
    const { addressId } = await context.params;
    const result = await AddressService.deleteAddress(req.currentUser.sub, addressId);
    return successResponse(result, 'Address deleted.', 200, 'ADDRESS_DELETED');
  },
  { roles: ['CUSTOMER', 'SUPER_ADMIN'] }
);
