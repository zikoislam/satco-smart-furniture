export const dynamic = 'force-dynamic';
import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { QuotationService } from '@/modules/quotations/quotation.service';

export const GET = withAuth(
  async (req) => {
    const result = await QuotationService.listQuotations(
      req.currentUser.sub,
      req.currentUser.role
    );
    return successResponse(result, 'Quotations retrieved.', 200, 'QUOTATIONS_LISTED');
  },
  { roles: ['CUSTOMER', 'ESTIMATOR', 'DESIGNER', 'FACTORY_MANAGER', 'SUPER_ADMIN'] }
);

export const POST = withAuth(
  async (req) => {
    const body = await req.json();
    const quotation = await QuotationService.createQuotation(
      req.currentUser.sub,
      req.currentUser.role,
      body
    );
    return successResponse({ quotation }, 'Quotation issued.', 201, 'QUOTATION_ISSUED');
  },
  { roles: ['ESTIMATOR', 'DESIGNER', 'FACTORY_MANAGER', 'SUPER_ADMIN'] }
);
