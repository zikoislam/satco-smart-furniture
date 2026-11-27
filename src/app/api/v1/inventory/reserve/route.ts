import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { InventoryService } from '@/modules/inventory/inventory.service';

export const POST = withAuth(
  async (req) => {
    const body = await req.json();
    const reservation = await InventoryService.reserveForProductionJob(
      req.currentUser.sub,
      body
    );
    return successResponse(
      { reservation },
      'Material sheets reserved for production job.',
      201,
      'MATERIAL_RESERVED'
    );
  },
  { roles: ['FACTORY_MANAGER', 'SUPER_ADMIN'] }
);
