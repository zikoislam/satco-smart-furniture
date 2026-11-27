import { z } from 'zod';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import {
  Decimal,
  toDecimal,
  calculateZatcaVat,
  calculateGrandTotal,
} from '@/lib/decimal';
import {
  DomainRuleError,
  ForbiddenError,
  NotFoundError,
} from '@/lib/api/errors';
import { CouponService } from '@/modules/pricing/coupon.service';
import { MilestoneService } from '@/modules/orders/milestone.service';

export const CheckoutOrderSchema = z.object({
  cartId: z.string().uuid(),
  addressId: z.string().uuid(),
  warrantyYears: z.union([z.literal(1), z.literal(2)]).default(2),
  appliedCouponCode: z.string().min(1).max(50).optional(),
  customerNotes: z.string().max(1000).optional(),
});

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(10000 + Math.random() * 90000);
  const rand = randomUUID().slice(0, 4).toUpperCase();
  return `ORD-${year}-${suffix}${rand}`;
}

export class OrderService {
  /**
   * Converts a customer's active cart into a binding Order (`PENDING_DEPOSIT`),
   * locks the pricing snapshot (BR-ORD-001), applies optional coupon & 100 SAR
   * sample box credit (> 2000 SAR), creates 3-stage milestones (50/40/10%),
   * generates Milestone 1 invoice, and clears the cart.
   */
  public static async checkoutCart(
    customerId: string,
    rawInput: z.infer<typeof CheckoutOrderSchema>
  ) {
    const input = CheckoutOrderSchema.parse(rawInput);

    return prisma.$transaction(async (tx) => {
      // 1. Load cart with items and verify ownership
      const cart = await tx.cart.findUnique({
        where: { id: input.cartId },
        include: { items: true },
      });

      if (!cart) {
        throw new NotFoundError('Shopping cart not found', 'CART_NOT_FOUND');
      }

      if (cart.userId && cart.userId !== customerId) {
        throw new ForbiddenError('You do not own this shopping cart', 'FORBIDDEN');
      }

      if (cart.items.length === 0) {
        throw new DomainRuleError(
          'CART_EMPTY',
          'Cannot checkout an empty shopping cart',
          undefined,
          422
        );
      }

      // 2. Verify shipping/installation address belongs to customer
      const address = await tx.address.findUnique({
        where: { id: input.addressId },
      });

      if (!address || address.userId !== customerId) {
        throw new NotFoundError(
          'Customer delivery address not found',
          'ADDRESS_NOT_FOUND'
        );
      }

      // 3. Load active PricingRule for BR-ORD-001 snapshot
      const now = new Date();
      const activeRule = await tx.pricingRule.findFirst({
        where: {
          effectiveFrom: { lte: now },
          OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
        },
        orderBy: { effectiveFrom: 'desc' },
      });

      if (!activeRule) {
        throw new DomainRuleError(
          'REQUIRES_MANUAL_QUOTE',
          'No active pricing rule available for checkout',
          undefined,
          422
        );
      }

      // 4. Compute locked net subtotal from cart items
      let netSubtotal = new Decimal(0);
      for (const item of cart.items) {
        netSubtotal = netSubtotal.plus(toDecimal(item.totalPriceSar.toString()));
      }
      netSubtotal = netSubtotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      // 5. Apply optional promotional coupon
      let discountSar = new Decimal(0);
      let couponId: string | null = null;

      if (input.appliedCouponCode) {
        const couponResult = await CouponService.validateAndComputeDiscount({
          code: input.appliedCouponCode,
          netSubtotalSar: netSubtotal,
          customerId,
          hasDiscretionaryDiscount: false,
        });
        discountSar = couponResult.discountSar;
        couponId = couponResult.couponId;

        await tx.coupon.update({
          where: { id: couponId },
          data: {
            usedCount: { increment: 1 },
            budgetUsedSar: { increment: Number(discountSar.toFixed(4)) },
          },
        });
      }

      // 6. Apply 100 SAR refundable Material Sample Box credit if netSubtotal > 2000 SAR
      let sampleBoxToApplyId: string | null = null;
      if (netSubtotal.gt(2000)) {
        const unusedSampleBox = await tx.materialSampleBoxOrder.findFirst({
          where: {
            userId: customerId,
            isRefundedOrApplied: false,
            status: { in: ['ORDERED', 'SAMPLE_DISPATCHED', 'DELIVERED'] },
          },
          orderBy: { createdAt: 'asc' },
        });

        if (unusedSampleBox) {
          const sampleCredit = toDecimal(unusedSampleBox.sampleBoxFeeSar.toString());
          discountSar = discountSar.plus(sampleCredit);
          sampleBoxToApplyId = unusedSampleBox.id;
        }
      }

      const discountedNet = Decimal.max(
        new Decimal(0),
        netSubtotal.minus(discountSar)
      ).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      const vatPercentage = toDecimal(activeRule.vatPercentage.toString());
      const vatAmountSar = calculateZatcaVat(discountedNet, vatPercentage).toDecimalPlaces(
        2,
        Decimal.ROUND_HALF_UP
      );
      const grandTotalSar = calculateGrandTotal(discountedNet, vatAmountSar);

      // 7. Create binding Order in PENDING_DEPOSIT state
      const orderNumber = generateOrderNumber();
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          addressId: input.addressId,
          pricingRuleId: activeRule.id,
          couponId,
          status: 'PENDING_DEPOSIT',
          warrantyYears: input.warrantyYears,
          netSubtotalSar: netSubtotal.toFixed(4),
          discountSar: discountSar.toFixed(4),
          vatAmountSar: vatAmountSar.toFixed(4),
          grandTotalSar: grandTotalSar.toFixed(4),
          paidAmountSar: '0.0000',
          dueAmountSar: grandTotalSar.toFixed(4),
          notes: input.customerNotes,
        },
      });

      // 8. Copy CartItems into OrderItems with locked item VAT
      for (const item of cart.items) {
        const lineNet = toDecimal(item.totalPriceSar.toString());
        const itemVat = calculateZatcaVat(lineNet, vatPercentage).toDecimalPlaces(
          2,
          Decimal.ROUND_HALF_UP
        );

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            templateId: item.templateId,
            configuredWidthMm: item.configuredWidthMm,
            configuredHeightMm: item.configuredHeightMm,
            configuredDepthMm: item.configuredDepthMm,
            configurationJson: item.configurationJson ?? {},
            quantity: item.quantity,
            unitPriceSar: item.unitPriceSar,
            totalPriceSar: item.totalPriceSar,
            itemVatSar: itemVat.toFixed(4),
          },
        });
      }

      // 9. Mark sample box as applied if credited
      if (sampleBoxToApplyId) {
        await tx.materialSampleBoxOrder.update({
          where: { id: sampleBoxToApplyId },
          data: {
            isRefundedOrApplied: true,
            appliedFurnitureOrderId: order.id,
            status: 'APPLIED_TO_FURNITURE_ORDER',
          },
        });
      }

      // 10. Record initial OrderTimeline entry
      await tx.orderTimeline.create({
        data: {
          orderId: order.id,
          fromStatus: null,
          toStatus: 'PENDING_DEPOSIT',
          actionBy: customerId,
          notes: 'Order created via checkout; awaiting 50% commitment deposit.',
        },
      });

      // 11. Generate 3-stage Milestones (50% / 40% / 10%)
      const milestones = await MilestoneService.createOrderMilestones(
        tx,
        order.id,
        grandTotalSar
      );

      // 12. Generate Milestone 1 Deposit Invoice if Company is provisioned
      const company = await tx.company.findFirst();
      let milestone1InvoiceNumber: string | null = null;
      if (company) {
        const m1Amount = toDecimal(milestones[0].amountSar);
        const m1Vat = m1Amount
          .times(vatPercentage)
          .dividedBy(toDecimal(100).plus(vatPercentage))
          .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        const m1Subtotal = m1Amount.minus(m1Vat);
        milestone1InvoiceNumber = `INV-${orderNumber}-M1`;

        await tx.invoice.create({
          data: {
            invoiceNumber: milestone1InvoiceNumber,
            orderId: order.id,
            companyId: company.id,
            invoiceType: 'DEPOSIT_ADVANCE',
            status: 'DRAFT',
            subtotalSar: m1Subtotal.toFixed(4),
            vatAmountSar: m1Vat.toFixed(4),
            totalWithVatSar: m1Amount.toFixed(4),
            zatcaTlvQrBase64: Buffer.from(
              `SATCO|${milestone1InvoiceNumber}|${m1Amount.toFixed(2)}`
            ).toString('base64'),
          },
        });
      }

      // 13. Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        netSubtotalSar: netSubtotal.toFixed(2),
        discountSar: discountSar.toFixed(2),
        vatAmountSar: vatAmountSar.toFixed(2),
        grandTotalSar: grandTotalSar.toFixed(2),
        depositRequiredSar: milestones[0].amountSar,
        warrantyYears: order.warrantyYears,
        milestone1InvoiceNumber,
        sampleBoxCredited: Boolean(sampleBoxToApplyId),
        milestones,
      };
    });
  }
}
