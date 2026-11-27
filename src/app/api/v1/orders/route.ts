import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { toDecimal } from '@/lib/decimal';

export const GET = withAuth(
  async (req) => {
    const orders = await prisma.order.findMany({
      where: { customerId: req.currentUser.sub },
      include: {
        items: {
          include: {
            template: {
              select: { slug: true, nameAr: true, nameEn: true },
            },
          },
        },
        milestoneSchedules: {
          orderBy: { milestone: 'asc' },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            invoiceType: true,
            status: true,
            totalWithVatSar: true,
            issueDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      warrantyYears: order.warrantyYears,
      warrantyExpiresAt: order.warrantyExpiresAt,
      grandTotalSar: toDecimal(order.grandTotalSar.toString()).toFixed(2),
      paidAmountSar: toDecimal(order.paidAmountSar.toString()).toFixed(2),
      dueAmountSar: toDecimal(order.dueAmountSar.toString()).toFixed(2),
      createdAt: order.createdAt,
      itemsCount: order.items.reduce((acc, i) => acc + i.quantity, 0),
      milestones: order.milestoneSchedules.map((m) => ({
        milestone: m.milestone,
        percentage: Number(m.percentage),
        amountSar: toDecimal(m.amountSar.toString()).toFixed(2),
        status: m.status,
        dueDate: m.dueDate,
        paidAt: m.paidAt,
      })),
      invoices: order.invoices.map((inv) => ({
        ...inv,
        totalWithVatSar: toDecimal(inv.totalWithVatSar.toString()).toFixed(2),
      })),
    }));

    return successResponse(
      { orders: formatted },
      'Customer orders retrieved',
      200,
      'ORDERS_LISTED'
    );
  },
  { roles: ['CUSTOMER', 'SUPER_ADMIN'] }
);
