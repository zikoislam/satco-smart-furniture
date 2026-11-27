'use client';

import React, { useState } from 'react';
import {
  GeneratedConceptResult,
  RoomType,
  InteriorStyle,
} from '@/modules/ai-studio/ai-studio.types';

interface AIStudioStudioProps {
  onConceptConfirmed?: (concept: GeneratedConceptResult, dimensions: {
    widthMm: number;
    lengthMm: number;
    heightMm: number;
  }) => void;
}

export const AIStudioStudio: React.FC<AIStudioStudioProps> = ({ onConceptConfirmed }) => {
  const [roomType, setRoomType] = useState<RoomType>('BEDROOM');
  const [style, setStyle] = useState<InteriorStyle>('NEOCLASSICAL_SAUDI');
  const [prompt, setPrompt] = useState('');
  const [budgetTier, setBudgetTier] = useState<'ECONOMY' | 'PREMIUM' | 'LUXURY'>('PREMIUM');
  const [isLoading, setIsLoading] = useState(false);
  const [concept, setConcept] = useState<GeneratedConceptResult | null>(null);

  // Measurement confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [wallWidth, setWallWidth] = useState(3600);
  const [wallLength, setWallLength] = useState(4200);
  const [ceilingHeight, setCeilingHeight] = useState(2800);
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setConfirmedSuccess(false);

    try {
      const res = await fetch('/api/v1/ai-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomType,
          interiorStyle: style,
          userPrompt: prompt || undefined,
          budgetTier,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setConcept(data.data);
      }
    } catch (err) {
      console.error('Failed to generate AI concept', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmMeasurements = () => {
    if (!concept) return;
    setIsSubmittingConfirm(true);

    setTimeout(() => {
      setIsSubmittingConfirm(false);
      setConfirmedSuccess(true);
      setShowConfirmModal(false);
      if (onConceptConfirmed) {
        onConceptConfirmed(concept, {
          widthMm: wallWidth,
          lengthMm: wallLength,
          heightMm: ceilingHeight,
        });
      }
    }, 600);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold tracking-wider bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded-full">
              ATCO AI VISION STUDIO
            </span>
            <span className="text-xs text-amber-400 font-medium">KSA Vision 2030 Ready</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight text-white">
            استوديو التصميم الذكي للغرف والمفروشات
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            حوّل أفكارك أو مساحاتك إلى مفاهيم ديكور ذكية مع مطابقة دقيقة لمواد Egger و Blum
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                نوع المساحة / Room Type
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="BEDROOM">غرفة نوم رئيسية / Master Bedroom</option>
                <option value="MAJLIS">مجلس فاخر / Saudi Majlis</option>
                <option value="LIVING_ROOM">صالة معيشة / Living Room</option>
                <option value="WALK_IN_CLOSET">غرفة ملابس / Walk-in Closet</option>
                <option value="KITCHEN">مطبخ عصري / Modern Kitchen</option>
                <option value="HOME_OFFICE">مكتب منزلي / Home Office</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                النمط المعماري والديكور / Interior Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as InteriorStyle)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="NEOCLASSICAL_SAUDI">نيوكلاسيكي سعودي فاخر / Neoclassical Saudi</option>
                <option value="MODERN_MINIMALIST">عصري انسيابي / Modern Minimalist</option>
                <option value="SCANDINAVIAN">اسكندنافي دافئ / Scandinavian</option>
                <option value="JAPANDI">ياباندي هادئ / Japandi</option>
                <option value="CONTEMPORARY_LUXURY">فخامة معاصرة / Contemporary Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                فئة الميزانية / Budget Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['ECONOMY', 'PREMIUM', 'LUXURY'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setBudgetTier(tier)}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      budgetTier === tier
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                ملاحظات مخصصة (اختياري) / Custom Prompt
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="مثال: أحتاج إنارة دافئة مخفية، إطارات برونزية، وأماكن مخصصة للملابس الطويلة..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-indigo-600/25 transition duration-200 disabled:opacity-50"
            >
              {isLoading ? 'جاري توليد التصميم الذكي...' : 'توليد المفهوم بالذكاء الاصطناعي ✨'}
            </button>
          </form>

          {/* Regulatory Advisory Note (BR-AI-001) */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
            <span className="font-bold">⚠️ معيار الامتثال BR-AI-001:</span> كافة المفاهيم الناتجة استشارية وتخضع لتأكيد المقاسات الفعلية قبل التعميد.
          </div>
        </div>

        {/* Right Column: Visualization Display */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5">
          {concept ? (
            <div className="space-y-4">
              {/* Concept Image View with Watermark */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group aspect-[16/10]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={concept.visualizationImageUri}
                  alt={concept.titleAr}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Description */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{concept.titleAr}</h3>
                  <p className="text-xs text-slate-400 mt-1">{concept.descriptionAr}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">التكلفة التقديرية</span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {concept.estimatedTotalSar.toLocaleString()} SAR
                  </span>
                </div>
              </div>

              {/* Matched Furniture Items */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  القطع المطابقة من الكتالوج للتصنيع:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {concept.matchedFurnitureItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold text-white">{item.nameAr}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.suggestedWidthMm} × {item.suggestedHeightMm} × {item.suggestedDepthMm} مم
                        </div>
                        <div className="text-[10px] text-indigo-400 mt-0.5">
                          {item.recommendedMaterial}
                        </div>
                      </div>
                      <span className="font-bold text-amber-400 shrink-0">
                        {item.estimatedBasePriceSar} ر.س
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmation Gate Button */}
              <div className="pt-2">
                {confirmedSuccess ? (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-xs font-bold text-emerald-300">
                    ✅ تم تأكيد القياسات بنجاح! تم اعتماد التصميم للانتقال لطلب عرض السعر والـ 3D.
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition"
                  >
                    تأكيد مقاسات الجدران للانتقال لعرض السعر (Mandatory Gate) 📐
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-3xl mb-3">
                🛋️
              </div>
              <h4 className="text-base font-semibold text-slate-300">في انتظار توليد المفهوم</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                اختر نوع الغرفة، النمط، والميزانية ثم اضغط على زر التوليد لتشغيل محرك الذكاء الاصطناعي
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Measurement Confirmation Modal (Gate BR-AI-002) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              تأكيد أبعاد الغرفة الفعلية (BR-AI-002)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              لضمان دقة التصنيع الهندسي وجودة التركيب، يرجى إدخال أبعاد الغرفة بالملمتر (mm).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">عرض الجدار الرئيسي (mm)</label>
                <input
                  type="number"
                  value={wallWidth}
                  onChange={(e) => setWallWidth(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">طول الغرفة (mm)</label>
                <input
                  type="number"
                  value={wallLength}
                  onChange={(e) => setWallLength(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ارتفاع السقف (mm)</label>
                <input
                  type="number"
                  value={ceilingHeight}
                  onChange={(e) => setCeilingHeight(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isSubmittingConfirm}
                onClick={handleConfirmMeasurements}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30"
              >
                {isSubmittingConfirm ? 'جاري التأكيد...' : 'تأكيد واعتماد المقاسات'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
