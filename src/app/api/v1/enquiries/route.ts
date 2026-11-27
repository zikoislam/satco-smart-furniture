export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api/middleware';
import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { QuotationService } from '@/modules/quotations/quotation.service';

export const GET = withAuth(
  async () => {
    const result = await QuotationService.listEnquiries();
    return successResponse(result, 'Enquiries retrieved.', 200, 'ENQUIRIES_LISTED');
  },
  { roles: ['ESTIMATOR', 'DESIGNER', 'FACTORY_MANAGER', 'SUPER_ADMIN'] }
);

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const enquiry = await QuotationService.createEnquiry(body);
  return successResponse({ enquiry }, 'Enquiry submitted.', 201, 'ENQUIRY_CREATED');
});
