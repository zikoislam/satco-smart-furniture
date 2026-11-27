import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Decimal, toDecimal } from '@/lib/decimal';
import { DomainRuleError, ValidationError } from '@/lib/api/errors';

export const CreateCouponSchema = z.object({
  code: z.string().min(3).max(50).transform((s) => s.trim().toUpperCase()),
  discountType: z.enum(['PERCENTAGE', 'FIXED_SAR']).default('PERCENTAGE'),
  discountValue: z.string().regex(/^\d+(\.\d{1,4})?$/),
  minOrderSar: z.string().regex(/^\d+(\.\d{1,4})?$/).default('0.0000'),
  maxDiscountSar: z.string().regex(/^\d+(\.\d{1,4})?$/).optional(),
  budgetCapSar: z.string().regex(/^\d+(\.\d{1,4})?$/).optional(),
  maxUsesTotal: z.number().int().positive().optional(),
  maxUsesPerCustomer: z.number().int().positive().default(1),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  isActive: z.boolean().default(true),
});

export interface CouponValidationInput {
  code: string;
  netSubtotalSar: Decimal;
  customerId?: string;
  hasDiscretionaryDiscount?: boolean;
}

export interface CouponApplicationResult {
  couponId: string;
  code: string;
  discountSar: Decimal;
  discountedNetSubtotalSar: Decimal;
}

export class CouponService {
  public static async listCoupons() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async createCoupon(input: z.infer<typeof CreateCouponSchema>) {
    const data = CreateCouponSchema.parse(input);

    if (data.validUntil <= data.validFrom) {
      throw new ValidationError('validUntil must be after validFrom');
    }
    if (data.discountType === 'PERCENTAGE' && toDecimal(data.discountValue).gt(50)) {
      throw new DomainRuleError(
        'DISCOUNT_CEILING_EXCEEDED',
        'Promotional percentage coupon cannot exceed 50% hard ceiling',
        undefined,
        422
      );
    }

    return prisma.coupon.create({ data });
  }

  /**
   * Validates promotional coupon against BR-PRICE-005 (non-stackable),
   * expiry window, min order, per-customer usage cap, and budget ceiling.
   */
  public static async validateAndComputeDiscount(
    input: CouponValidationInput
  ): Promise<CouponApplicationResult> {
    if (input.hasDiscretionaryDiscount) {
      throw new DomainRuleError(
        'COUPON_NOT_STACKABLE_WITH_DISCOUNT',
        'Promotional coupons cannot be stacked with discretionary staff discounts (BR-PRICE-005).',
        undefined,
        422
      );
    }

    const normalizedCode = input.code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon || !coupon.isActive) {
      throw new DomainRuleError('COUPON_INVALID', 'Coupon code is invalid or inactive', undefined, 422);
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      throw new DomainRuleError('COUPON_EXPIRED', 'Coupon code has expired or is not yet active', undefined, 422);
    }

    if (input.netSubtotalSar.lt(toDecimal(coupon.minOrderSar.toString()))) {
      throw new DomainRuleError(
        'COUPON_MIN_ORDER_NOT_MET',
        `Minimum order of ${coupon.minOrderSar.toFixed(2)} SAR is required for this coupon.`,
        undefined,
        422
      );
    }

    if (coupon.maxUsesTotal !== null && coupon.usedCount >= coupon.maxUsesTotal) {
      throw new DomainRuleError('COUPON_USAGE_LIMIT_REACHED', 'Coupon usage limit reached', undefined, 422);
    }

    if (input.customerId) {
      const customerUses = await prisma.order.count({
        where: { customerId: input.customerId, couponId: coupon.id },
      });
      if (customerUses >= coupon.maxUsesPerCustomer) {
        throw new DomainRuleError(
          'COUPON_CUSTOMER_LIMIT_REACHED',
          'You have already used this coupon the maximum allowed times.',
          undefined,
          422
        );
      }
    }

    let discountSar: Decimal;
    if (coupon.discountType === 'PERCENTAGE') {
      discountSar = input.netSubtotalSar
        .times(toDecimal(coupon.discountValue.toString()))
        .dividedBy(100)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      if (coupon.maxDiscountSar !== null) {
        const cap = toDecimal(coupon.maxDiscountSar.toString());
        if (discountSar.gt(cap)) {
          discountSar = cap;
        }
      }
    } else {
      discountSar = toDecimal(coupon.discountValue.toString()).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    }

    if (discountSar.gt(input.netSubtotalSar)) {
      discountSar = input.netSubtotalSar;
    }

    if (coupon.budgetCapSar !== null) {
      const remainingBudget = toDecimal(coupon.budgetCapSar.toString()).minus(
        toDecimal(coupon.budgetUsedSar.toString())
      );
      if (remainingBudget.lte(0) || discountSar.gt(remainingBudget)) {
        throw new DomainRuleError(
          'COUPON_BUDGET_EXHAUSTED',
          'Promotional campaign budget has been exhausted.',
          undefined,
          422
        );
      }
    }

    const discountedNetSubtotalSar = input.netSubtotalSar
      .minus(discountSar)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountSar,
      discountedNetSubtotalSar,
    };
  }
}
