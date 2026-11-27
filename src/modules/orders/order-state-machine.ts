import { OrderStatus, Prisma } from '@prisma/client';
import { ConflictError, NotFoundError } from '@/lib/api/errors';

/**
 * Full 15-state SATCO Order Lifecycle transition map (prisma/prompt.md Feature 4.3).
 * CANCELLED is allowed from any pre-production state.
 */
export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  DRAFT: ['PENDING_DEPOSIT', 'CANCELLED'],
  PENDING_DEPOSIT: ['PAID_DEPOSIT', 'CANCELLED'],
  PAID_DEPOSIT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PRODUCTION_QUEUED', 'CANCELLED'],
  PRODUCTION_QUEUED: ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['QC_COMPLETED'],
  QC_COMPLETED: ['DISPATCH_HOLD_DUE_PAYMENT', 'READY_FOR_DELIVERY'],
  DISPATCH_HOLD_DUE_PAYMENT: ['READY_FOR_DELIVERY'],
  READY_FOR_DELIVERY: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['INSTALLATION_SCHEDULED'],
  INSTALLATION_SCHEDULED: ['INSTALLATION_IN_PROGRESS'],
  INSTALLATION_IN_PROGRESS: ['HANDOVER_COMPLETED'],
  HANDOVER_COMPLETED: [],
  CANCELLED: [],
};

/**
 * Validates whether a transition from `fromStatus` to `toStatus` is permitted.
 * Throws 409 STATE_MACHINE_TRANSITION_INVALID if disallowed.
 */
export function assertValidOrderTransition(
  fromStatus: OrderStatus,
  toStatus: OrderStatus
): void {
  const allowed = ALLOWED_ORDER_TRANSITIONS[fromStatus] ?? [];
  if (!allowed.includes(toStatus)) {
    throw new ConflictError(
      `Invalid order state transition from ${fromStatus} to ${toStatus}`,
      'STATE_MACHINE_TRANSITION_INVALID',
      { fromStatus, toStatus, allowedNextStatuses: allowed }
    );
  }
}

export interface TransitionOrderStatusParams {
  orderId: string;
  toStatus: OrderStatus;
  actionBy: string;
  notes?: string;
  extraOrderData?: Prisma.OrderUpdateInput;
}

/**
 * Atomically validates and transitions an order's status, recording an entry
 * in `order_timelines` inside the provided Prisma transaction client.
 */
export async function transitionOrderStatus(
  tx: Prisma.TransactionClient,
  params: TransitionOrderStatusParams
) {
  const order = await tx.order.findUnique({
    where: { id: params.orderId },
    select: { id: true, status: true },
  });

  if (!order) {
    throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
  }

  assertValidOrderTransition(order.status, params.toStatus);

  const updatedOrder = await tx.order.update({
    where: { id: params.orderId },
    data: {
      ...params.extraOrderData,
      status: params.toStatus,
    },
  });

  await tx.orderTimeline.create({
    data: {
      orderId: params.orderId,
      fromStatus: order.status,
      toStatus: params.toStatus,
      actionBy: params.actionBy,
      notes: params.notes,
    },
  });

  return updatedOrder;
}
