export const dynamic = 'force-dynamic';
import { withAuth } from '@/lib/api/auth-guard';
import { successResponse } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { toDecimal } from '@/lib/decimal';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const GET = withAuth(
  async (req) => {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');

    const whereClause: any = {};
    if (statusParam && statusParam !== 'ALL') {
      whereClause.status = statusParam;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        address: {
          select: {
            city: true,
            district: true,
            streetName: true,
            buildingNumber: true,
            postalCode: true,
            latitude: true,
            longitude: true,
          },
        },
        items: {
          include: {
            template: {
              select: { nameEn: true, nameAr: true, slug: true },
            },
          },
        },
        installationJobs: {
          select: {
            id: true,
            status: true,
            installerId: true,
            scheduledDate: true,
            timeSlot: true,
          },
        },
        milestoneSchedules: {
          orderBy: { milestone: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const formatted = orders.map((order) => {
      const m2 = order.milestoneSchedules.find((m) => m.milestone === 'MILESTONE_2_PRE_DISPATCH');
      const m2Paid = m2 ? m2.status === 'PAID' : false;

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        m2Paid,
        customerName: order.customer?.fullName || 'Walk-in Customer',
        customerPhone: order.customer?.phone || '',
        destinationCity: order.address?.city || 'Jeddah',
        district: order.address?.district || 'Al-Shati',
        street: order.address?.streetName || 'Prince Sultan Rd',
        grandTotalSar: toDecimal(order.grandTotalSar.toString()).toFixed(2),
        paidAmountSar: toDecimal(order.paidAmountSar.toString()).toFixed(2),
        dueAmountSar: toDecimal(order.dueAmountSar.toString()).toFixed(2),
        itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        itemsPreview: order.items.map((i) => i.template?.nameEn || 'Custom Furniture Item'),
        installationStatus: order.installationJobs?.[0]?.status || 'UNASSIGNED',
        scheduledDate: order.installationJobs?.[0]?.scheduledDate || null,
        createdAt: order.createdAt,
      };
    });

    // Provide Dispatch AI Metrics
    const metrics = {
      totalReadyForDelivery: formatted.filter((o) => o.status === 'READY_FOR_DELIVERY').length,
      totalOutForDelivery: formatted.filter((o) => o.status === 'OUT_FOR_DELIVERY').length,
      totalDispatchHold: formatted.filter((o) => o.status === 'DISPATCH_HOLD_DUE_PAYMENT').length,
      totalDelivered: formatted.filter((o) => o.status === 'DELIVERED').length,
    };

    return successResponse(
      { orders: formatted, metrics },
      'Dispatch orders retrieved successfully',
      200,
      'DISPATCH_ORDERS_LISTED'
    );
  },
  { roles: ['FACTORY_MANAGER', 'SUPER_ADMIN'] }
);

const DispatchActionSchema = z.object({
  orderId: z.string().uuid(),
  action: z.enum(['RELEASE_TO_DISPATCH', 'DISPATCH_TRUCK', 'MARK_DELIVERED']),
  driverName: z.string().optional(),
  truckPlate: z.string().optional(),
  notes: z.string().optional(),
});

export const POST = withAuth(
  async (req) => {
    const body = await req.json();
    const { orderId, action, notes } = DispatchActionSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        milestoneSchedules: true,
      },
    });

    if (!order) {
      return successResponse(null, 'Order not found', 404, 'ORDER_NOT_FOUND');
    }

    let nextStatus: OrderStatus = order.status;

    if (action === 'RELEASE_TO_DISPATCH') {
      const m2 = order.milestoneSchedules.find((m) => m.milestone === 'MILESTONE_2_PRE_DISPATCH');
      if (m2 && m2.status !== 'PAID') {
        return successResponse(
          null,
          'Cannot release order to dispatch: Milestone 2 pre-dispatch 40% payment is still due (BR-ORD-005)',
          422,
          'DISPATCH_HOLD_UNPAID_MILESTONE'
        );
      }
      nextStatus = 'READY_FOR_DELIVERY';
    } else if (action === 'DISPATCH_TRUCK') {
      if (order.status !== 'READY_FOR_DELIVERY') {
        return successResponse(
          null,
          'Only orders in READY_FOR_DELIVERY status can be dispatched on factory truck',
          422,
          'INVALID_DISPATCH_STATUS'
        );
      }
      nextStatus = 'OUT_FOR_DELIVERY';
    } else if (action === 'MARK_DELIVERED') {
      nextStatus = 'DELIVERED';
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        timeline: {
          create: {
            fromStatus: order.status,
            toStatus: nextStatus,
            actionBy: req.currentUser.sub,
            notes: notes || `AI Dispatch Operations Action: ${action}`,
          },
        },
      },
    });

    return successResponse(
      { order: updated },
      `Order status successfully transitioned to ${nextStatus}`,
      200,
      'ORDER_DISPATCH_UPDATED'
    );
  },
  { roles: ['FACTORY_MANAGER', 'SUPER_ADMIN'] }
);
