import Decimal from 'decimal.js';

// Configure Decimal.js for strict financial arithmetic
Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -9,
  toExpPos: 28,
});

export { Decimal };

/**
 * Creates a Decimal instance from string, number, or Decimal.
 */
export function toDecimal(value: string | number | Decimal): Decimal {
  if (value instanceof Decimal) return value;
  return new Decimal(value);
}

/**
 * Formats SAR amount to standard display string (2 decimal places).
 * Example: "1,250.50 SAR" or "1250.50"
 */
export function formatSar(amount: string | number | Decimal, includeCurrency: boolean = false): string {
  const dec = toDecimal(amount);
  const formatted = dec.toFixed(2);
  return includeCurrency ? `${formatted} SAR` : formatted;
}

/**
 * Formats financial ledger amounts to exact 4 decimal places for database storage.
 */
export function formatSarLedger(amount: string | number | Decimal): string {
  return toDecimal(amount).toFixed(4);
}

/**
 * Calculates exact ZATCA 15% VAT on a given net amount.
 * Formula: netAmount * 0.15
 */
export function calculateZatcaVat(netAmount: string | number | Decimal, vatPercentage: string | number | Decimal = 15.0000): Decimal {
  const net = toDecimal(netAmount);
  const rate = toDecimal(vatPercentage).dividedBy(100);
  return net.times(rate);
}

/**
 * Calculates Grand Total inclusive of VAT.
 * Formula: netAmount + VAT
 */
export function calculateGrandTotal(netAmount: string | number | Decimal, vatAmount: string | number | Decimal): Decimal {
  return toDecimal(netAmount).plus(toDecimal(vatAmount));
}

/**
 * Splits grand total into standard SATCO 3-tier milestone obligations:
 * Milestone 1: 50% Commitment Deposit
 * Milestone 2: 40% Pre-Dispatch Balance
 * Milestone 3: 10% Handover on-site Balance
 */
export interface MilestoneSplit {
  milestone1Deposit: Decimal;
  milestone2PreDispatch: Decimal;
  milestone3Handover: Decimal;
}

export function calculateMilestones(grandTotal: string | number | Decimal): MilestoneSplit {
  const total = toDecimal(grandTotal);
  const m1 = total.times(0.50).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const m2 = total.times(0.40).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  // Ensure exact zero-penny discrepancy on milestone 3
  const m3 = total.minus(m1).minus(m2);

  return {
    milestone1Deposit: m1,
    milestone2PreDispatch: m2,
    milestone3Handover: m3,
  };
}
