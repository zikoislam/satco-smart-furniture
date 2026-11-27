export const dynamic = 'force-dynamic';
import { withAuth } from '@/lib/api/auth-guard';
import type { RouteContext } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { QuotationService } from '@/modules/quotations/quotation.service';

export const POST = withAuth<RouteContext<{ quotationId: string }>>(
  async (req, context) => {
    const { quotationId } = await context.params;
    const quotation = await QuotationService.acceptQuotation(
      req.currentUser.sub,
      quotationId
    );
    return successResponse({ quotation }, 'Quotation accepted.', 200, 'QUOTATION_ACCEPTED');
  },
  { roles: ['CUSTOMER', 'SUPER_ADMIN'] }
);
