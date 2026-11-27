import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { AddressService } from '@/modules/addresses/address.service';

export const GET = withAuth(
  async (req) => {
    const result = await AddressService.listAddresses(req.currentUser.sub);
    return successResponse(result, 'Customer addresses retrieved.', 200, 'ADDRESSES_LISTED');
  },
  { roles: ['CUSTOMER', 'SUPER_ADMIN'] }
);

export const POST = withAuth(
  async (req) => {
    const body = await req.json();
    const address = await AddressService.createAddress(req.currentUser.sub, body);
    return successResponse({ address }, 'Saudi National Address saved.', 201, 'ADDRESS_CREATED');
  },
  { roles: ['CUSTOMER', 'SUPER_ADMIN'] }
);
