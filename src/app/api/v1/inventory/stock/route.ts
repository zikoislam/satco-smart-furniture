export const dynamic = 'force-dynamic';
import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { InventoryService } from '@/modules/inventory/inventory.service';

export const GET = withAuth(
  async () => {
    const result = await InventoryService.listStockBalances();
    return successResponse(result, 'Stock balances retrieved.', 200, 'STOCK_LISTED');
  },
  { roles: ['FACTORY_MANAGER', 'SUPER_ADMIN'] }
);

export const POST = withAuth(
  async (req) => {
    const body = await req.json();
    const result = await InventoryService.recordMovement(req.currentUser.sub, body);
    return successResponse(result, 'Stock movement recorded.', 201, 'STOCK_MOVEMENT_RECORDED');
  },
  { roles: ['FACTORY_MANAGER', 'SUPER_ADMIN'] }
);
