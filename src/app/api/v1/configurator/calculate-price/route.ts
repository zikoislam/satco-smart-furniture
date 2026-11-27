export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withErrorHandler } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { DomainRuleError, NotFoundError } from '@/lib/api/errors';
import { prisma } from '@/lib/prisma';
import {
  Decimal,
  toDecimal,
  calculateZatcaVat,
  calculateGrandTotal,
  calculateMilestones,
} from '@/lib/decimal';
import { ConfiguratorParametricInputSchema } from '@/lib/validation/saudi-validators';
import { PricingEngineService } from '@/modules/pricing/pricing.service';
import { CouponService } from '@/modules/pricing/coupon.service';

const CalculatePriceBodySchema = ConfiguratorParametricInputSchema.extend({
  couponCode: z.string().min(1).max(50).optional(),
  discretionaryDiscountPercent: z.number().min(0).max(50).optional(),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const input = CalculatePriceBodySchema.parse(body);

  // 1. Load ProductTemplate and enforce template-specific dimension bounds
  const template = await prisma.productTemplate.findUnique({
    where: { id: input.templateId },
  });
  if (!template || !template.isActive) {
    throw new NotFoundError('Product template not found or inactive', 'TEMPLATE_NOT_FOUND');
  }

  if (
    input.widthMm < template.minWidthMm ||
    input.widthMm > template.maxWidthMm ||
    input.heightMm < template.minHeightMm ||
    input.heightMm > template.maxHeightMm ||
    input.depthMm < template.minDepthMm ||
    input.depthMm > template.maxDepthMm
  ) {
    throw new DomainRuleError(
      'DIMENSIONS_OUT_OF_BOUNDS',
      'Configured dimensions exceed template engineering limits',
      {
        widthRange: [template.minWidthMm, template.maxWidthMm],
        heightRange: [template.minHeightMm, template.maxHeightMm],
        depthRange: [template.minDepthMm, template.maxDepthMm],
      },
      422
    );
  }

  // 2. Load active PricingRule & materials (BR-PRICE-003: Zero Guesswork Fallback)
  const now = new Date();
  const [activeRule, carcassSheet, shutterSheet, edgeBanding, hardwareItems] = await Promise.all([
    prisma.pricingRule.findFirst({
      where: {
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    }),
    prisma.materialSheet.findUnique({ where: { code: input.carcassMaterialCode } }),
    prisma.materialSheet.findUnique({ where: { code: input.shutterMaterialCode } }),
    prisma.edgeBanding.findUnique({ where: { code: input.edgeBandingCode } }),
    prisma.hardwareItem.findMany({ where: { isActive: true } }),
  ]);

  if (!activeRule || !carcassSheet || !shutterSheet || !edgeBanding) {
    throw new DomainRuleError(
      'REQUIRES_MANUAL_QUOTE',
      'Pricing rate or material specification unavailable; please submit a manual quote request.',
      undefined,
      422
    );
  }

  const hingeItem = hardwareItems.find((h) => h.unitType.toLowerCase().includes('hinge'));
  const runnerItem = hardwareItems.find((h) => h.unitType.toLowerCase().includes('runner'));

  if (!hingeItem || !runnerItem) {
    throw new DomainRuleError(
      'REQUIRES_MANUAL_QUOTE',
      'Hardware rate unavailable; please submit a manual quote request.',
      undefined,
      422
    );
  }

  // 3. Execute deterministic Decimal.js pricing engine
  const breakdown = PricingEngineService.calculateCabinetPrice(
    input,
    {
      cuttingPerMeterSar: toDecimal(activeRule.cuttingPerMeterSar.toString()),
      edgeBandingPerMeterSar: toDecimal(activeRule.edgeBandingPerMeterSar.toString()),
      cncPerHoleSar: toDecimal(activeRule.cncPerHoleSar.toString()),
      laborMarkupRate: toDecimal(activeRule.laborMarkupRate.toString()),
      marginRate: toDecimal(activeRule.marginRate.toString()),
      vatPercentage: toDecimal(activeRule.vatPercentage.toString()),
    },
    {
      carcassSqmPriceSar: toDecimal(carcassSheet.sellingPricePerSqmSar.toString()),
      shutterSqmPriceSar: toDecimal(shutterSheet.sellingPricePerSqmSar.toString()),
      edgeBandingPerMeterSar: toDecimal(edgeBanding.sellingPricePerMeterSar.toString()),
      hingeUnitPriceSar: toDecimal(hingeItem.sellingPriceSar.toString()),
      drawerRunnerUnitPriceSar: toDecimal(runnerItem.sellingPriceSar.toString()),
    }
  );

  // 4. Apply discretionary discount OR promotional coupon (BR-PRICE-005 non-stackable)
  let discountSar = new Decimal(0);
  let netSubtotalSar = breakdown.netSubtotalSar;
  let vatAmountSar = breakdown.vatAmountSar;
  let grandTotalSar = breakdown.grandTotalSar;
  let milestones = breakdown.milestones;
  let appliedCouponCode: string | null = null;

  const hasDiscretionary =
    typeof input.discretionaryDiscountPercent === 'number' &&
    input.discretionaryDiscountPercent > 0;

  if (input.couponCode) {
    const couponResult = await CouponService.validateAndComputeDiscount({
      code: input.couponCode,
      netSubtotalSar,
      hasDiscretionaryDiscount: hasDiscretionary,
    });
    discountSar = couponResult.discountSar;
    netSubtotalSar = couponResult.discountedNetSubtotalSar;
    appliedCouponCode = couponResult.code;
  } else if (hasDiscretionary) {
    discountSar = netSubtotalSar
      .times(toDecimal(input.discretionaryDiscountPercent!))
      .dividedBy(100)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    netSubtotalSar = netSubtotalSar.minus(discountSar).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }

  if (discountSar.gt(0)) {
    const vatPct = toDecimal(activeRule.vatPercentage.toString());
    vatAmountSar = calculateZatcaVat(netSubtotalSar, vatPct).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    grandTotalSar = calculateGrandTotal(netSubtotalSar, vatAmountSar);
    milestones = calculateMilestones(grandTotalSar);
  }

  return successResponse(
    {
      pricingRuleId: activeRule.id,
      appliedCouponCode,
      breakdown: {
        rawMaterialCostSar: breakdown.rawMaterialCostSar.toFixed(4),
        edgeBandingCostSar: breakdown.edgeBandingCostSar.toFixed(4),
        hardwareCostSar: breakdown.hardwareCostSar.toFixed(4),
        cuttingLaborSar: breakdown.cuttingLaborSar.toFixed(4),
        cncMachiningLaborSar: breakdown.cncMachiningLaborSar.toFixed(4),
        factoryLaborMarkupSar: breakdown.factoryLaborMarkupSar.toFixed(4),
      },
      totals: {
        netSubtotalSar: netSubtotalSar.toFixed(2),
        discountSar: discountSar.toFixed(2),
        vatPercentage: toDecimal(activeRule.vatPercentage.toString()).toFixed(2),
        vatAmountSar: vatAmountSar.toFixed(2),
        grandTotalSar: grandTotalSar.toFixed(2),
      },
      milestones: {
        milestone1Deposit50: milestones.milestone1Deposit.toFixed(2),
        milestone2PreDispatch40: milestones.milestone2PreDispatch.toFixed(2),
        milestone3Handover10: milestones.milestone3Handover.toFixed(2),
      },
    },
    'Price calculated successfully',
    200,
    'PRICE_CALCULATED'
  );
});
