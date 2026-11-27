import { withAuth } from '@/lib/api/auth-guard';
import type { RouteContext } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { ZatcaService } from '@/modules/invoicing/zatca.service';

export const POST = withAuth<RouteContext<{ id: string }>>(
  async (_req, context) => {
    const { id } = await context.params;
    const invoice = await ZatcaService.issueInvoice(id);

    return successResponse(
      invoice,
      'ZATCA Phase 2 e-Invoice issued and cleared.',
      201,
      'INVOICE_ISSUED'
    );
  },
  { roles: ['SUPER_ADMIN', 'FACTORY_MANAGER'] }
);
