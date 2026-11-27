'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { CabinetViewer } from '@/components/3d/CabinetViewer';
import { computeAutoShelvesCount } from '@/components/3d/wardrobe-math';
import { SwatchGrid, type MaterialSwatchItem } from '@/components/configurator/SwatchGrid';
import { PriceBreakdownPanel } from '@/components/configurator/PriceBreakdownPanel';

interface TemplateItem {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  minDepthMm: number;
  maxDepthMm: number;
  defaultWidthMm: number;
  defaultHeightMm: number;
  defaultDepthMm: number;
}

const FALLBACK_SWATCHES: MaterialSwatchItem[] = [
  {
    id: 'ms-1',
    code: 'EGG-H1180-ST37',
    nameEn: 'Halifax Oak Natural',
    nameAr: 'خشب بلوط هاليفاكس طبيعي',
    swatchHex: '#b68b5a',
    inStock: true,
    roughness: 0.42,
  },
  {
    id: 'ms-2',
    code: 'EGG-W1000-PM',
    nameEn: 'Premium Alpine White',
    nameAr: 'أبيض ألبين مطفي',
    swatchHex: '#f3f1ed',
    inStock: true,
    roughness: 0.28,
  },
  {
    id: 'ms-3',
    code: 'EGG-U708-ST9',
    nameEn: 'Light Grey Matte',
    nameAr: 'رمادي فاتح مطفي',
    swatchHex: '#8d9092',
    inStock: true,
    roughness: 0.35,
  },
];

export default function ConfiguratorPage() {
  const locale = useLocale();
  const t = useTranslations('Configurator');
  const tNav = useTranslations('Nav');

  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [swatches, setSwatches] = useState<MaterialSwatchItem[]>(FALLBACK_SWATCHES);

  const [widthMm, setWidthMm] = useState(1600);
  const [heightMm, setHeightMm] = useState(2400);
  const [depthMm, setDepthMm] = useState(600);
  const [doorsCount, setDoorsCount] = useState(2);
  const [drawersCount, setDrawersCount] = useState(2);
  const [openDoors, setOpenDoors] = useState(true);

  const [carcassSwatch, setCarcassSwatch] = useState<MaterialSwatchItem>(FALLBACK_SWATCHES[0]);
  const [shutterSwatch, setShutterSwatch] = useState<MaterialSwatchItem>(FALLBACK_SWATCHES[1]);
  const [edgeBandingCode] = useState('REHAU-OAK-2MM');

  const [addingToCart, setAddingToCart] = useState(false);
  const [cartNotice, setCartNotice] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/configurator/templates').then((r) => r.json()).catch(() => null),
      fetch('/api/v1/configurator/materials').then((r) => r.json()).catch(() => null),
    ]).then(([tplRes, matRes]) => {
      if (tplRes?.data?.templates?.length) {
        const first = tplRes.data.templates[0] as TemplateItem;
        setTemplates(tplRes.data.templates);
        setSelectedTemplate(first);
        setWidthMm(first.defaultWidthMm);
        setHeightMm(first.defaultHeightMm);
        setDepthMm(first.defaultDepthMm);
      }
      if (matRes?.data?.materialSheets?.length) {
        const loaded = matRes.data.materialSheets as MaterialSwatchItem[];
        setSwatches(loaded);
        setCarcassSwatch(loaded[0]);
        setShutterSwatch(loaded[1] ?? loaded[0]);
      }
    });
  }, []);

  const shelvesCount = computeAutoShelvesCount(heightMm);

  async function handleAddToCart() {
    if (!selectedTemplate) return;
    setAddingToCart(true);
    setCartNotice(null);

    try {
      let sessionId = localStorage.getItem('satco_session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('satco_session_id', sessionId);
      }

      const token = localStorage.getItem('satco_access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch('/api/v1/cart/items', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          configuredWidthMm: widthMm,
          configuredHeightMm: heightMm,
          configuredDepthMm: depthMm,
          configurationJson: {
            carcass: carcassSwatch.code,
            shutter: shutterSwatch.code,
            edgeBanding: edgeBandingCode,
            shelves: shelvesCount,
            drawers: drawersCount,
            doors: doorsCount,
          },
          quantity: 1,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setCartNotice(locale === 'ar' ? 'تمت إضافة التصميم إلى السلة بنجاح' : 'Configured unit added to cart.');
      } else {
        setCartNotice(json.message ?? 'Could not add item to cart');
      }
    } finally {
      setAddingToCart(false);
    }
  }

  const minW = selectedTemplate?.minWidthMm ?? 800;
  const maxW = selectedTemplate?.maxWidthMm ?? 2400;
  const minH = selectedTemplate?.minHeightMm ?? 1800;
  const maxH = selectedTemplate?.maxHeightMm ?? 3000;
  const minD = selectedTemplate?.minDepthMm ?? 450;
  const maxD = selectedTemplate?.maxDepthMm ?? 750;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>
          {templates.length > 0 && selectedTemplate && (
            <p className="text-sm text-stone-500">
              {locale === 'ar' ? selectedTemplate.nameAr : selectedTemplate.nameEn}
            </p>
          )}
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href={`/${locale}`} className="text-stone-600 hover:text-stone-900">
            {tNav('home')}
          </Link>
          <Link href={`/${locale}/dashboard`} className="text-stone-600 hover:text-stone-900">
            {tNav('orders')}
          </Link>
        </nav>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <CabinetViewer
            widthMm={widthMm}
            heightMm={heightMm}
            depthMm={depthMm}
            doorsCount={doorsCount}
            drawersCount={drawersCount}
            shelvesCount={shelvesCount}
            carcassTextureUrl={carcassSwatch.textureUrl}
            carcassColor={carcassSwatch.swatchHex}
            shutterTextureUrl={shutterSwatch.textureUrl}
            shutterColor={shutterSwatch.swatchHex}
            roughness={shutterSwatch.roughness}
            openDoors={openDoors}
          />

          <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs text-stone-600">
            <span>
              {t('shelvesAuto')}: <strong>{shelvesCount}</strong>
            </span>
            <label className="flex cursor-pointer items-center gap-2 font-medium text-stone-800">
              <input
                type="checkbox"
                checked={openDoors}
                onChange={(e) => setOpenDoors(e.target.checked)}
                className="rounded border-stone-300"
              />
              {locale === 'ar' ? 'فتح الأبواب لمعاينة الأرفف' : 'Open Doors Preview'}
            </label>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-stone-900">{t('dimensions')}</h2>

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-stone-700">
                <span>{t('width')}</span>
                <span>{widthMm} mm</span>
              </div>
              <input
                type="range"
                min={minW}
                max={maxW}
                step={50}
                value={widthMm}
                onChange={(e) => setWidthMm(Number(e.target.value))}
                className="w-full accent-stone-900"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-stone-700">
                <span>{t('height')}</span>
                <span>{heightMm} mm</span>
              </div>
              <input
                type="range"
                min={minH}
                max={maxH}
                step={50}
                value={heightMm}
                onChange={(e) => setHeightMm(Number(e.target.value))}
                className="w-full accent-stone-900"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-stone-700">
                <span>{t('depth')}</span>
                <span>{depthMm} mm</span>
              </div>
              <input
                type="range"
                min={minD}
                max={maxD}
                step={25}
                value={depthMm}
                onChange={(e) => setDepthMm(Number(e.target.value))}
                className="w-full accent-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-700">
                  {t('doors')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={doorsCount}
                  onChange={(e) => setDoorsCount(Math.max(1, Math.min(6, Number(e.target.value))))}
                  className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-700">
                  {t('drawers')}
                </label>
                <input
                  type="number"
                  min={0}
                  max={8}
                  value={drawersCount}
                  onChange={(e) => setDrawersCount(Math.max(0, Math.min(8, Number(e.target.value))))}
                  className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <SwatchGrid
              title={t('carcassMaterial')}
              swatches={swatches}
              selectedCode={carcassSwatch.code}
              onSelect={setCarcassSwatch}
              locale={locale}
            />
            <SwatchGrid
              title={t('shutterMaterial')}
              swatches={swatches}
              selectedCode={shutterSwatch.code}
              onSelect={setShutterSwatch}
              locale={locale}
            />
          </div>

          {cartNotice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
              {cartNotice}
            </div>
          )}

          <PriceBreakdownPanel
            templateId={selectedTemplate?.id ?? ''}
            widthMm={widthMm}
            heightMm={heightMm}
            depthMm={depthMm}
            carcassMaterialCode={carcassSwatch.code}
            shutterMaterialCode={shutterSwatch.code}
            edgeBandingCode={edgeBandingCode}
            shelvesCount={shelvesCount}
            drawersCount={drawersCount}
            doorsCount={doorsCount}
            onAddToCart={handleAddToCart}
            addingToCart={addingToCart}
          />
        </div>
      </div>
    </main>
  );
}
