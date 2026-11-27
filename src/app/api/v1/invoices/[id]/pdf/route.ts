export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-guard';
import type { RouteContext } from '@/lib/api/middleware';
import { InvoicePdfService } from '@/modules/invoicing/invoice-pdf.service';

export const GET = withAuth<RouteContext<{ id: string }>>(
  async (req, context) => {
    const { id } = await context.params;
    const { filename, buffer } = await InvoicePdfService.generateInvoicePdf(
      id,
      req.currentUser.sub,
      req.currentUser.role
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  },
  { roles: ['CUSTOMER', 'SUPER_ADMIN', 'FACTORY_MANAGER'] }
);
