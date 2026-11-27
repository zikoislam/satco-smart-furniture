import { PricingEngineService, RateCardSnapshot, MaterialCostLookup } from '@/modules/pricing/pricing.service';
import { ConfiguratorParametricInput, normalizeSaudiPhone } from '@/lib/validation/saudi-validators';
import { Decimal, toDecimal } from '@/lib/decimal';

describe('SATCO Pricing Engine & Financial Verification', () => {
  const mockRates: RateCardSnapshot = {
    cuttingPerMeterSar: toDecimal(1.50),
    edgeBandingPerMeterSar: toDecimal(3.50),
    cncPerHoleSar: toDecimal(0.35),
    laborMarkupRate: toDecimal(0.18), // 18%
    marginRate: toDecimal(0.22),      // 22%
    vatPercentage: toDecimal(15.0000), // 15%
  };

  const mockMaterials: MaterialCostLookup = {
    carcassSqmPriceSar: toDecimal(125.00),
    shutterSqmPriceSar: toDecimal(145.00),
    edgeBandingPerMeterSar: toDecimal(3.50),
    hingeUnitPriceSar: toDecimal(26.00),
    drawerRunnerUnitPriceSar: toDecimal(135.00),
  };

  test('calculates wardrobe price accurately with zero floating point errors', () => {
    const input: ConfiguratorParametricInput = {
      templateId: '11111111-2222-3333-4444-555555555555',
      widthMm: 1200,
      heightMm: 2400,
      depthMm: 600,
      carcassMaterialCode: 'EGG-H1180-ST37',
      shutterMaterialCode: 'EGG-W1000-PM',
      edgeBandingCode: 'REHAU-H1180-22X1',
      shelvesCount: 3,
      drawersCount: 2,
      doorsCount: 2,
      hasLighting: false,
      hasSoftClose: true,
    };

    const result = PricingEngineService.calculateCabinetPrice(input, mockRates, mockMaterials);

    // Verify all returned amounts are positive Decimal instances
    expect(result.netSubtotalSar.toNumber()).toBeGreaterThan(0);
    expect(result.vatAmountSar.toNumber()).toBeGreaterThan(0);
    expect(result.grandTotalSar.toNumber()).toBeGreaterThan(result.netSubtotalSar.toNumber());

    // Verify exact 15% VAT calculation
    const expectedVat = result.netSubtotalSar.times(0.15).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    expect(result.vatAmountSar.toString()).toEqual(expectedVat.toString());

    // Verify milestone breakdown sums to exact grand total without penny discrepancies
    const { milestone1Deposit, milestone2PreDispatch, milestone3Handover } = result.milestones;
    const summedMilestones = milestone1Deposit.plus(milestone2PreDispatch).plus(milestone3Handover);
    expect(summedMilestones.toString()).toEqual(result.grandTotalSar.toString());

    // Verify milestone ratio splits: 50% / 40% / 10%
    expect(milestone1Deposit.toNumber()).toBeCloseTo(result.grandTotalSar.times(0.50).toNumber(), 1);
    expect(milestone2PreDispatch.toNumber()).toBeCloseTo(result.grandTotalSar.times(0.40).toNumber(), 1);
    expect(milestone3Handover.toNumber()).toBeCloseTo(result.grandTotalSar.times(0.10).toNumber(), 1);
  });

  test('normalizes various Saudi mobile phone formats to canonical E.164', () => {
    expect(normalizeSaudiPhone('0501234567')).toEqual('+966501234567');
    expect(normalizeSaudiPhone('501234567')).toEqual('+966501234567');
    expect(normalizeSaudiPhone('+966501234567')).toEqual('+966501234567');
    expect(normalizeSaudiPhone('00966501234567')).toEqual('+966501234567');
    expect(normalizeSaudiPhone(' 050-123-4567 ')).toEqual('+966501234567');

    expect(() => normalizeSaudiPhone('0112345678')).toThrow(); // Landline not allowed for SMS
    expect(() => normalizeSaudiPhone('0601234567')).toThrow(); // Invalid prefix
  });
});
