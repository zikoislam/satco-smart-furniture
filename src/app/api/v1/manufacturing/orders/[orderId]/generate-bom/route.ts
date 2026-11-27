export const dynamic = 'force-dynamic';
import { withAuth } from '@/lib/api/auth-guard';
import type { RouteContext } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { BomGeneratorService } from '@/modules/manufacturing/bom-generator.service';

export const POST = withAuth<RouteContext<{ orderId: string }>>(
  async (req, context) => {
    const { orderId } = await context.params;
    const result = await BomGeneratorService.generateOrderBom(
      orderId,
      req.currentUser.sub
    );

    return successResponse(
      result,
      'Order BOM generated successfully.',
      200,
      'BOM_GENERATED'
    );
  },
  { roles: ['FACTORY_MANAGER', 'SUPER_ADMIN'] }
);
