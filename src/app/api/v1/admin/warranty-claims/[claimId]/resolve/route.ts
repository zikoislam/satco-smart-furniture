import { withAuth } from '@/lib/api/auth-guard';
import type { RouteContext } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { WarrantyService } from '@/modules/warranty/warranty.service';

export const PATCH = withAuth<RouteContext<{ claimId: string }>>(
  async (req, context) => {
    const { claimId } = await context.params;
    const body = await req.json();
    const claim = await WarrantyService.resolveClaim(claimId, body);

    return successResponse({ claim }, 'Warranty claim updated.', 200, 'WARRANTY_CLAIM_UPDATED');
  },
  { roles: ['FACTORY_MANAGER', 'SUPER_ADMIN'] }
);
