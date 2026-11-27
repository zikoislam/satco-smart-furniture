import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { WarrantyService } from '@/modules/warranty/warranty.service';

export const GET = withAuth(
  async (req) => {
    const result = await WarrantyService.listClaims(
      req.currentUser.sub,
      req.currentUser.role
    );
    return successResponse(result, 'Warranty claims retrieved.', 200, 'WARRANTY_CLAIMS_LISTED');
  },
  { roles: ['CUSTOMER', 'FACTORY_MANAGER', 'SUPER_ADMIN'] }
);

export const POST = withAuth(
  async (req) => {
    const body = await req.json();
    const claim = await WarrantyService.submitClaim(req.currentUser.sub, body);
    return successResponse({ claim }, 'Warranty claim submitted.', 201, 'WARRANTY_CLAIM_SUBMITTED');
  },
  { roles: ['CUSTOMER', 'SUPER_ADMIN'] }
);
