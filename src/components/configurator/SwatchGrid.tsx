'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface MaterialSwatchItem {
  id: string;
  code: string;
  brand?: string;
  nameAr: string;
  nameEn: string;
  textureUrl?: string | null;
  roughness?: number;
  inStock: boolean;
  swatchHex?: string;
}

interface SwatchGridProps {
  title: string;
  swatches: MaterialSwatchItem[];
  selectedCode: string;
  onSelect: (swatch: MaterialSwatchItem) => void;
  locale?: string;
}

const DEFAULT_SWATCH_COLORS: Record<string, string> = {
  'EGG-H1180-ST37': '#b68b5a',
  'EGG-W1000-PM': '#f3f1ed',
  'EGG-U708-ST9': '#8d9092',
  'EGG-U999-PM': '#262729',
};

/**
 * Interactive material swatch grid that updates the 3D cabinet textures in real-time.
 */
export function SwatchGrid({
  title,
  swatches,
  selectedCode,
  onSelect,
  locale = 'en',
}: SwatchGridProps) {
  const isArabic = locale === 'ar';

  return (
    <div className="space-y-2.5">
      <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {swatches.map((swatch) => {
          const isSelected = swatch.code === selectedCode;
          const fallbackBg =
            swatch.swatchHex ?? DEFAULT_SWATCH_COLORS[swatch.code] ?? '#c8a982';

          return (
            <button
              key={swatch.code}
              type="button"
              disabled={!swatch.inStock}
              onClick={() => onSelect(swatch)}
              className={`group relative flex items-center gap-2.5 rounded-xl border p-2.5 text-start transition-all ${
                isSelected
                  ? 'border-stone-900 bg-stone-900/5 ring-1 ring-stone-900'
                  : 'border-stone-200 bg-white hover:border-stone-400'
              } ${!swatch.inStock ? 'cursor-not-allowed opacity-45' : ''}`}
            >
              <span
                className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-stone-300 shadow-inner"
                style={{ backgroundColor: fallbackBg }}
              >
                {swatch.textureUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={swatch.textureUrl}
                    alt={isArabic ? swatch.nameAr : swatch.nameEn}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                {isSelected && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-stone-900">
                  {isArabic ? swatch.nameAr : swatch.nameEn}
                </p>
                <p className="truncate text-[11px] text-stone-500">{swatch.code}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
