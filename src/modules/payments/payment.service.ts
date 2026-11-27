import { z } from 'zod';
import { MilestoneNumber, PaymentMethod, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { Decimal, toDecimal } from '@/lib/decimal';
import {
  AuthError,
  DomainRuleError,
  ForbiddenError,
  NotFoundError,
} from '@/lib/api/errors';
import { MoyasarAdapter } from '@/modules/payments/moyasar.adapter';
import { transitionOrderStatus } from '@/modules/orders/order-state-machine';

export const InitializePaymentSchema = z.object({
  orderId: z.string().uuid(),
  milestone: z.enum([
    'MILESTONE_1_DEPOSIT',
    'MILESTONE_2_PRE_DISPATCH',
    'MILESTONE_3_HANDOVER',
  ]),
  paymentMethod: z.enum([
    'MADA',
    'VISA_MASTERCARD',
    'APPLE_PAY',
    'TABBY',
    'TAMARA',
    'BANK_TRANSFER',
  ]),
  callbackUrl: z.string().url(),
});

export const WebhookPayloadSchema = z.object({
  id: z.string().min(1).optional(),
  gatewayReference: z.string().min(1),
  status: z.enum(['paid', 'captured', 'failed', 'refunded']),
  amountHalalas: z.number().int().positive().optional(),
  paidAt: z.string().datetime().optional(),
});

export class PaymentService {
  /**
   * Initializes a Moyasar payment session for a specific order milestone.
   */
  public static async initializeMilestonePayment(
    customerId: string,
    rawInput: z.infer<typeof InitializePaymentSchema>
  ) {
    const input = InitializePaymentSchema.parse(rawInput);

    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        milestoneSchedules: true,
        invoices: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenError('You do not own this order', 'FORBIDDEN');
    }

    if (order.status === 'CANCELLED') {
      throw new DomainRuleError(
        'ORDER_CANCELLED',
        'Cannot pay for a cancelled order',
        undefined,
        422
      );
    }

    const targetMilestone = order.milestoneSchedules.find(
      (m) => m.milestone === (input.milestone as MilestoneNumber)
    );

    if (!targetMilestone) {
      throw new NotFoundError(
        `Milestone ${input.milestone} schedule not found`,
        'MILESTONE_NOT_FOUND'
      );
    }

    if (targetMilestone.status === 'PAID') {
      throw new DomainRuleError(
        'MILESTONE_ALREADY_PAID',
        `Milestone ${input.milestone} has already been paid`,
        undefined,
        422
      );
    }

    const amountSar = toDecimal(targetMilestone.amountSar.toString()).toDecimalPlaces(
      2,
      Decimal.ROUND_HALF_UP
    );

    const checkout = await MoyasarAdapter.createCheckout({
      orderId: order.id,
      milestone: input.milestone,
      amountSar,
      paymentMethod: input.paymentMethod as PaymentMethod,
      callbackUrl: input.callbackUrl,
    });

    const transaction = await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        invoiceId: order.invoices[0]?.id ?? null,
        milestone: input.milestone as MilestoneNumber,
        paymentMethod: input.paymentMethod as PaymentMethod,
        amountSar: amountSar.toFixed(4),
        currency: 'SAR',
        gatewayReference: checkout.gatewayReference,
        status: 'PENDING',
        rawResponsePayload: checkout.rawPayload as Prisma.InputJsonValue,
      },
    });

    return {
      transactionId: transaction.id,
      gatewayReference: transaction.gatewayReference,
      amountSar: amountSar.toFixed(2),
      checkoutUrl: checkout.checkoutUrl,
    };
  }

  /**
   * Idempotent Moyasar webhook processor:
   * - Verifies HMAC-SHA256 signature.
   * - BR-SEC-005: Milestone 1 deposit confirmation transitions PENDING_DEPOSIT -> PAID_DEPOSIT (unlocks CNC).
   * - BR-ORD-005: Milestone 2 payment unlocks DISPATCH_HOLD_DUE_PAYMENT -> READY_FOR_DELIVERY.
   */
  public static async handleWebhook(
    rawBody: string,
    signatureHeader: string | null,
    parsedBody: unknown
  ) {
    if (!MoyasarAdapter.verifyWebhookSignature(rawBody, signatureHeader)) {
      throw new AuthError('Invalid webhook HMAC signature', 'INVALID_WEBHOOK_SIGNATURE');
    }

    const payload = WebhookPayloadSchema.parse(parsedBody);

    return prisma.$transaction(async (tx) => {
      const txRecord = await tx.paymentTransaction.findUnique({
        where: { gatewayReference: payload.gatewayReference },
        include: { order: true },
      });

      if (!txRecord) {
        throw new NotFoundError(
          'Payment transaction not found for gatewayReference',
          'PAYMENT_TRANSACTION_NOT_FOUND'
        );
      }

      // Idempotency guard: already finalized
      if (txRecord.status === 'CAPTURED' || txRecord.status === 'FAILED') {
        return { received: true, processed: false, duplicate: true };
      }

      if (payload.status === 'failed') {
        await tx.paymentTransaction.update({
          where: { id: txRecord.id },
          data: {
            status: 'FAILED',
            rawResponsePayload: parsedBody as Prisma.InputJsonValue,
          },
        });
        return { received: true, processed: true, status: 'FAILED' };
      }

      const paidAt = payload.paidAt ? new Date(payload.paidAt) : new Date();

      // 1. Mark PaymentTransaction CAPTURED
      await tx.paymentTransaction.update({
        where: { id: txRecord.id },
        data: {
          status: 'CAPTURED',
          paidAt,
          rawResponsePayload: parsedBody as Prisma.InputJsonValue,
        },
      });

      // 2. Mark MilestonePayment PAID
      await tx.milestonePayment.update({
        where: {
          orderId_milestone: {
            orderId: txRecord.orderId,
            milestone: txRecord.milestone,
          },
        },
        data: {
          status: 'PAID',
          paidAt,
        },
      });

      // 3. Recompute Order paidAmountSar & dueAmountSar
      const txAmount = toDecimal(txRecord.amountSar.toString());
      const newPaid = toDecimal(txRecord.order.paidAmountSar.toString()).plus(txAmount);
      const grandTotal = toDecimal(txRecord.order.grandTotalSar.toString());
      const newDue = Decimal.max(new Decimal(0), grandTotal.minus(newPaid));

      await tx.order.update({
        where: { id: txRecord.orderId },
        data: {
          paidAmountSar: newPaid.toFixed(4),
          dueAmountSar: newDue.toFixed(4),
        },
      });

      // 4. Enforce Business Rule state transitions
      if (
        txRecord.milestone === 'MILESTONE_1_DEPOSIT' &&
        txRecord.order.status === 'PENDING_DEPOSIT'
      ) {
        await transitionOrderStatus(tx, {
          orderId: txRecord.orderId,
          toStatus: 'PAID_DEPOSIT',
          actionBy: 'PAYMENT_WEBHOOK',
          notes: `BR-SEC-005: Milestone 1 deposit (${txAmount.toFixed(2)} SAR) verified; CNC unlocked.`,
          extraOrderData: { depositVerifiedAt: paidAt },
        });
      } else if (
        txRecord.milestone === 'MILESTONE_2_PRE_DISPATCH' &&
        (txRecord.order.status === 'DISPATCH_HOLD_DUE_PAYMENT' ||
          txRecord.order.status === 'QC_COMPLETED')
      ) {
        await transitionOrderStatus(tx, {
          orderId: txRecord.orderId,
          toStatus: 'READY_FOR_DELIVERY',
          actionBy: 'PAYMENT_WEBHOOK',
          notes: `BR-ORD-005: Milestone 2 pre-dispatch (${txAmount.toFixed(2)} SAR) verified; dispatch hold released.`,
        });
      } else if (
        txRecord.milestone === 'MILESTONE_3_HANDOVER' &&
        txRecord.order.status === 'INSTALLATION_IN_PROGRESS'
      ) {
        const warrantyExpiresAt = new Date(paidAt);
        warrantyExpiresAt.setFullYear(
          warrantyExpiresAt.getFullYear() + txRecord.order.warrantyYears
        );

        await transitionOrderStatus(tx, {
          orderId: txRecord.orderId,
          toStatus: 'HANDOVER_COMPLETED',
          actionBy: 'PAYMENT_WEBHOOK',
          notes: `Milestone 3 final settlement (${txAmount.toFixed(2)} SAR) verified; handover completed.`,
          extraOrderData: { warrantyExpiresAt },
        });
      }

      return { received: true, processed: true, status: 'CAPTURED' };
    });
  }
}
