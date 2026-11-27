import { Decimal, toDecimal, calculateZatcaVat, calculateGrandTotal, calculateMilestones, MilestoneSplit } from '@/lib/decimal';
import { ConfiguratorParametricInput } from '@/lib/validation/saudi-validators';

export interface RateCardSnapshot {
  cuttingPerMeterSar: Decimal;
  edgeBandingPerMeterSar: Decimal;
  cncPerHoleSar: Decimal;
  laborMarkupRate: Decimal; // e.g. 0.18 (18%)
  marginRate: Decimal;      // e.g. 0.22 (22%)
  vatPercentage: Decimal;   // e.g. 15.0000
}

export interface MaterialCostLookup {
  carcassSqmPriceSar: Decimal;
  shutterSqmPriceSar: Decimal;
  edgeBandingPerMeterSar: Decimal;
  hingeUnitPriceSar: Decimal;
  drawerRunnerUnitPriceSar: Decimal;
}

export interface DetailedPriceBreakdown {
  rawMaterialCostSar: Decimal;
  edgeBandingCostSar: Decimal;
  hardwareCostSar: Decimal;
  cuttingLaborSar: Decimal;
  cncMachiningLaborSar: Decimal;
  factoryLaborMarkupSar: Decimal;
  netSubtotalSar: Decimal;
  vatAmountSar: Decimal;
  grandTotalSar: Decimal;
  milestones: MilestoneSplit;
}

/**
 * SATCO Core Pricing Engine
 * Strictly follows BR-PRICE-001, BR-PRICE-002, BR-PRICE-003, and BR-ORD-005.
 * Zero floating-point math; all arithmetic operated through Decimal.js.
 */
export class PricingEngineService {
  /**
   * Computes exact manufacturing BOM and pricing for custom parametric cabinetry.
   */
  public static calculateCabinetPrice(
    config: ConfiguratorParametricInput,
    rates: RateCardSnapshot,
    materialPrices: MaterialCostLookup
  ): DetailedPriceBreakdown {
    const widthM = toDecimal(config.widthMm).dividedBy(1000);
    const heightM = toDecimal(config.heightMm).dividedBy(1000);
    const depthM = toDecimal(config.depthMm).dividedBy(1000);

    // 1. Carcass Panel Area (2 sides + top + bottom + back panel + shelves)
    // Sides: 2 * (height * depth)
    const sidesArea = toDecimal(2).times(heightM).times(depthM);
    // Top & Bottom: 2 * (width * depth)
    const topBottomArea = toDecimal(2).times(widthM).times(depthM);
    // Back Panel: width * height
    const backPanelArea = widthM.times(heightM);
    // Shelves: count * (width * depth)
    const shelvesArea = toDecimal(config.shelvesCount).times(widthM).times(depthM);
    
    const totalCarcassSqm = sidesArea.plus(topBottomArea).plus(backPanelArea).plus(shelvesArea);
    const rawCarcassCost = totalCarcassSqm.times(materialPrices.carcassSqmPriceSar);

    // 2. Front Shutters Area (doorsCount * individual door area)
    const totalShutterSqm = widthM.times(heightM);
    const rawShutterCost = totalShutterSqm.times(materialPrices.shutterSqmPriceSar);

    const rawMaterialCostSar = rawCarcassCost.plus(rawShutterCost);

    // 3. Edge Banding Linear Meters
    // Approximated from panel perimeters:
    // Shelves front: count * width
    // Doors: 2 * (width + height)
    // Carcass front exposed edges: 2 * height + 2 * width
    const exposedLinearMeters = toDecimal(config.shelvesCount).times(widthM)
      .plus(toDecimal(2).times(widthM.plus(heightM)))
      .plus(toDecimal(2).times(heightM).plus(toDecimal(2).times(widthM)));

    const edgeBandingCostSar = exposedLinearMeters.times(materialPrices.edgeBandingPerMeterSar);

    // 4. Hardware Calculation
    // Hinges: 4 hinges per door for tall units (> 2000mm)
    const hingesPerDoor = config.heightMm > 2000 ? 4 : 3;
    const totalHinges = toDecimal(config.doorsCount * hingesPerDoor);
    const hingesCost = totalHinges.times(materialPrices.hingeUnitPriceSar);

    // Drawers: 1 pair per drawer
    const totalDrawers = toDecimal(config.drawersCount);
    const drawersCost = totalDrawers.times(materialPrices.drawerRunnerUnitPriceSar);

    const hardwareCostSar = hingesCost.plus(drawersCost);

    // 5. Machine Operations & Labor
    // Cutting meters: carcass & shutter saw travel
    const estimatedCuttingMeters = exposedLinearMeters.times(1.2);
    const cuttingLaborSar = estimatedCuttingMeters.times(rates.cuttingPerMeterSar);

    // CNC holes: 6 dowels/cam holes per joint + hinge boring cups (2 holes per hinge)
    const estimatedCncHoles = totalHinges.times(2).plus(toDecimal(config.shelvesCount * 4 + 12));
    const cncMachiningLaborSar = estimatedCncHoles.times(rates.cncPerHoleSar);

    // Direct Cost of Production
    const directProductionCost = rawMaterialCostSar
      .plus(edgeBandingCostSar)
      .plus(hardwareCostSar)
      .plus(cuttingLaborSar)
      .plus(cncMachiningLaborSar);

    // Factory labor overhead
    const factoryLaborMarkupSar = directProductionCost.times(rates.laborMarkupRate);

    // Subtotal before margin
    const productionSubtotal = directProductionCost.plus(factoryLaborMarkupSar);

    // Commercial Margin
    const grossMarginSar = productionSubtotal.times(rates.marginRate);

    // Net Commercial Subtotal
    const netSubtotalSar = productionSubtotal.plus(grossMarginSar).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    // ZATCA 15% VAT
    const vatAmountSar = calculateZatcaVat(netSubtotalSar, rates.vatPercentage).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    // Grand Total
    const grandTotalSar = calculateGrandTotal(netSubtotalSar, vatAmountSar);

    // Milestone Splitting (50% / 40% / 10%)
    const milestones = calculateMilestones(grandTotalSar);

    return {
      rawMaterialCostSar: rawMaterialCostSar.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      edgeBandingCostSar: edgeBandingCostSar.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      hardwareCostSar: hardwareCostSar.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      cuttingLaborSar: cuttingLaborSar.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      cncMachiningLaborSar: cncMachiningLaborSar.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      factoryLaborMarkupSar: factoryLaborMarkupSar.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      netSubtotalSar,
      vatAmountSar,
      grandTotalSar,
      milestones,
    };
  }
}
