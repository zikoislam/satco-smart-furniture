'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface PriceBreakdownData {
  breakdown: {
    rawMaterialCostSar: string;
    edgeBandingCostSar: string;
    hardwareCostSar: string;
    cuttingLaborSar: string;
    cncMachiningLaborSar: string;
    factoryLaborMarkupSar: string;
    netSubtotalSar: string;
    discountSar: string;
    vatAmountSar: string;
    grandTotalSar: string;
  };
  milestones: {
    milestone1DepositSar: string;
    milestone2PreDispatchSar: string;
    milestone3HandoverSar: string;
  };
}

export interface PriceBreakdownPanelProps {
  templateId: string;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  carcassMaterialCode: string;
  shutterMaterialCode: string;
  edgeBandingCode: string;
  shelvesCount: number;
  drawersCount: number;
  doorsCount: number;
  onAddToCart?: () => Promise<void>;
  addingToCart?: boolean;
}

/**
 * Debounced real-time SAR price breakdown panel calling POST /api/v1/configurator/calculate-price.
 */
export function PriceBreakdownPanel(props: PriceBreakdownPanelProps) {
  const t = useTranslations('Configurator');
  const tCommon = useTranslations('Common');

  const [pricing, setPricing] = useState<PriceBreakdownData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!props.templateId) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/v1/configurator/calculate-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: props.templateId,
            widthMm: props.widthMm,
            heightMm: props.heightMm,
            depthMm: props.depthMm,
            carcassMaterialCode: props.carcassMaterialCode,
            shutterMaterialCode: props.shutterMaterialCode,
            edgeBandingCode: props.edgeBandingCode,
            shelvesCount: props.shelvesCount,
            drawersCount: props.drawersCount,
            doorsCount: props.doorsCount,
          }),
        });

        const json = await res.json();
        if (!res.ok) {
          setError(json.message ?? 'Unable to calculate price');
          setPricing(null);
        } else {
          setPricing(json.data);
        }
      } catch {
        setError('Network error while calculating live price');
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [
    props.templateId,
    props.widthMm,
    props.heightMm,
    props.depthMm,
    props.carcassMaterialCode,
    props.shutterMaterialCode,
    props.edgeBandingCode,
    props.shelvesCount,
    props.drawersCount,
    props.doorsCount,
  ]);

  const currency = tCommon('currency');

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 className="text-base font-bold text-stone-900">{t('priceBreakdown')}</h3>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-stone-500" />}
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          {error}
        </div>
      )}

      {pricing && (
        <div className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>{t('rawMaterial')}</span>
            <span>{pricing.breakdown.rawMaterialCostSar} {currency}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>{t('edgeBandingCost')}</span>
            <span>{pricing.breakdown.edgeBandingCostSar} {currency}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>{t('hardwareCost')}</span>
            <span>{pricing.breakdown.hardwareCostSar} {currency}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>{t('laborAndMargin')}</span>
            <span>
              {(
                Number(pricing.breakdown.cuttingLaborSar) +
                Number(pricing.breakdown.cncMachiningLaborSar) +
                Number(pricing.breakdown.factoryLaborMarkupSar)
              ).toFixed(2)}{' '}
              {currency}
            </span>
          </div>

          <div className="border-t border-stone-100 pt-2.5">
            <div className="flex justify-between font-medium text-stone-800">
              <span>{t('netSubtotal')}</span>
              <span>{pricing.breakdown.netSubtotalSar} {currency}</span>
            </div>
            <div className="mt-1 flex justify-between text-stone-600">
              <span>{t('vat15')}</span>
              <span>{pricing.breakdown.vatAmountSar} {currency}</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between border-t border-stone-200 pt-3">
            <span className="text-base font-bold text-stone-900">{t('grandTotal')}</span>
            <span className="text-2xl font-extrabold text-stone-900">
              {pricing.breakdown.grandTotalSar} {currency}
            </span>
          </div>

          <div className="mt-3 rounded-xl bg-stone-50 p-3 text-xs text-stone-600">
            <p className="mb-1.5 font-semibold text-stone-800">{t('milestones')}</p>
            <div className="flex justify-between">
              <span>50% Deposit (CNC Unlock)</span>
              <span className="font-semibold">{pricing.milestones.milestone1DepositSar} {currency}</span>
            </div>
            <div className="flex justify-between">
              <span>40% Pre-Dispatch</span>
              <span className="font-semibold">{pricing.milestones.milestone2PreDispatchSar} {currency}</span>
            </div>
            <div className="flex justify-between">
              <span>10% On-Site Handover</span>
              <span className="font-semibold">{pricing.milestones.milestone3HandoverSar} {currency}</span>
            </div>
          </div>
        </div>
      )}

      {props.onAddToCart && (
        <button
          type="button"
          disabled={!pricing || props.addingToCart}
          onClick={props.onAddToCart}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {props.addingToCart ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          {t('addToCart')}
        </button>
      )}
    </div>
  );
}
