import { withAuth } from '@/lib/api/auth-guard';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';
import type { RouteContext } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { toDecimal } from '@/lib/decimal';

export const GET = withAuth<RouteContext<{ orderId: string }>>(
  async (req, context) => {
    const { orderId } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        address: true,
        items: {
          include: {
            template: {
              select: { slug: true, nameAr: true, nameEn: true },
            },
          },
        },
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
        milestoneSchedules: {
          orderBy: { milestone: 'asc' },
        },
        invoices: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    if (
      order.customerId !== req.currentUser.sub &&
      req.currentUser.role !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenError('You do not have access to this order', 'FORBIDDEN');
    }

    return successResponse(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        warrantyYears: order.warrantyYears,
        warrantyExpiresAt: order.warrantyExpiresAt,
        depositVerifiedAt: order.depositVerifiedAt,
        netSubtotalSar: toDecimal(order.netSubtotalSar.toString()).toFixed(2),
        discountSar: toDecimal(order.discountSar.toString()).toFixed(2),
        vatAmountSar: toDecimal(order.vatAmountSar.toString()).toFixed(2),
        grandTotalSar: toDecimal(order.grandTotalSar.toString()).toFixed(2),
        paidAmountSar: toDecimal(order.paidAmountSar.toString()).toFixed(2),
        dueAmountSar: toDecimal(order.dueAmountSar.toString()).toFixed(2),
        notes: order.notes,
        createdAt: order.createdAt,
        address: order.address,
        items: order.items.map((item) => ({
          id: item.id,
          templateSlug: item.template.slug,
          titleAr: item.template.nameAr,
          titleEn: item.template.nameEn,
          configuredWidthMm: item.configuredWidthMm,
          configuredHeightMm: item.configuredHeightMm,
          configuredDepthMm: item.configuredDepthMm,
          configurationJson: item.configurationJson,
          quantity: item.quantity,
          unitPriceSar: toDecimal(item.unitPriceSar.toString()).toFixed(2),
          totalPriceSar: toDecimal(item.totalPriceSar.toString()).toFixed(2),
        })),
        timeline: order.timeline,
        milestones: order.milestoneSchedules.map((m) => ({
          milestone: m.milestone,
          percentage: Number(m.percentage),
          amountSar: toDecimal(m.amountSar.toString()).toFixed(2),
          status: m.status,
          dueDate: m.dueDate,
          paidAt: m.paidAt,
        })),
        invoices: order.invoices.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          invoiceType: inv.invoiceType,
          status: inv.status,
          issueDate: inv.issueDate,
          totalWithVatSar: toDecimal(inv.totalWithVatSar.toString()).toFixed(2),
          zatcaTlvQrBase64: inv.zatcaTlvQrBase64,
        })),
      },
      'Order details retrieved',
      200,
      'ORDER_DETAIL_RETRIEVED'
    );
  },
  { roles: ['CUSTOMER', 'SUPER_ADMIN'] }
);
