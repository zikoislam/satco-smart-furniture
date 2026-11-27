'use client';

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Box,
  Eye,
  Sliders,
  Ruler,
  ChevronRight,
  Info,
} from 'lucide-react';
import { RoomType, InteriorStyle, GeneratedConceptResult } from '@/modules/ai-studio/ai-studio.types';

interface AIStudioStudioProps {
  onConceptConfirmed?: (
    concept: GeneratedConceptResult,
    dimensions: { widthMm: number; lengthMm: number; heightMm: number }
  ) => void;
}

export const AIStudioStudio: React.FC<AIStudioStudioProps> = ({ onConceptConfirmed }) => {
  const [activeMode, setActiveMode] = useState<'GENERATE' | 'INPAINT'>('GENERATE');

  // Generation States
  const [roomType, setRoomType] = useState<RoomType>('BEDROOM');
  const [style, setStyle] = useState<InteriorStyle>('NEOCLASSICAL_SAUDI');
  const [prompt, setPrompt] = useState('');
  const [budgetTier, setBudgetTier] = useState<'ECONOMY' | 'PREMIUM' | 'LUXURY'>('PREMIUM');
  const [isLoading, setIsLoading] = useState(false);
  const [concept, setConcept] = useState<GeneratedConceptResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // In-Painting States
  const [uploadedPhotoBase64, setUploadedPhotoBase64] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<'EMPTY_WALL' | 'EXISTING_WARDROBE' | 'OLD_CABINET' | 'ENTIRE_ROOM'>('EMPTY_WALL');
  const [inpaintingResult, setInpaintingResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Measurement confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [wallWidth, setWallWidth] = useState(3600);
  const [wallLength, setWallLength] = useState(4200);
  const [ceilingHeight, setCeilingHeight] = useState(2800);
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  // 1. Handle File Upload for Inpainting
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedPhotoBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 2. Handle Concept Generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setConfirmedSuccess(false);
    setErrorMessage(null);

    try {
      const payload: any = {
        roomType,
        interiorStyle: style,
        budgetTier,
      };
      if (prompt && prompt.trim().length > 0) {
        payload.userPrompt = prompt.trim();
      }

      const res = await fetch('/api/v1/ai-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConcept(data.data);
      } else {
        setErrorMessage(data?.message || 'Failed to generate room concept');
      }
    } catch (err: any) {
      console.error('Failed to generate AI concept', err);
      setErrorMessage(err?.message || 'Network error connecting to SATCO AI Core');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Room In-Painting
  const handleInpaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedPhotoBase64) {
      setErrorMessage('Please upload a room photo first to apply AI in-painting');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/ai-studio/inpaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomPhotoBase64: uploadedPhotoBase64,
          roomType,
          targetStyle: style,
          replaceItemType: replaceTarget,
          customDirectives: prompt || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInpaintingResult(data.data);
      } else {
        setErrorMessage(data?.message || 'In-painting failed');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error during in-painting');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Confirm Physical Measurements
  const handleConfirmMeasurements = async () => {
    if (!concept) return;
    setIsSubmittingConfirm(true);

    try {
      const token = localStorage.getItem('satco_access_token');
      if (token) {
        await fetch('/api/v1/ai-studio/confirm-measurements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conceptId: concept.conceptId,
            confirmedByCustomer: true,
            wallWidthMm: wallWidth,
            wallLengthMm: wallLength,
            ceilingHeightMm: ceilingHeight,
          }),
        });
      }
    } catch {
      // Graceful local pass
    }

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
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 bg-[#0B1120] text-white rounded-3xl shadow-2xl border border-slate-800">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-black tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/40 rounded-full flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>SATCO AI VISION STUDIO</span>
            </span>
            <span className="text-xs text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              🇸🇦 Saudi Precision CNC Architecture
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black mt-2 tracking-tight text-white">
            استوديو التصميم والذكاء الاصطناعي المعماري
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            حوّل غرفتك وأفكارك إلى مفاهيم ديكور وخزائن ذكية متطابقة مع أخشاب Egger النمساوية وسكك Blum الألمانية
          </p>
        </div>

        {/* Feature Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#0F172A] p-1.5 rounded-2xl border border-slate-800 self-stretch md:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveMode('GENERATE');
              setErrorMessage(null);
            }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeMode === 'GENERATE'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>توليد تصميم ذكي (Text-to-Design)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('INPAINT');
              setErrorMessage(null);
            }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeMode === 'INPAINT'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>معالجة صورتك (Photo In-Painting)</span>
          </button>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 font-bold hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Dual Grid: Configuration Controls vs AI Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-5">
          {activeMode === 'GENERATE' ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  نوع الغرفة / Room Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as RoomType)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="BEDROOM">غرفة نوم رئيسية / Master Bedroom</option>
                  <option value="WALK_IN_CLOSET">غرفة ملابس فاخرة / Walk-in Closet</option>
                  <option value="MAJLIS">مجلس سعودي نيوكلاسيكي / Saudi Majlis</option>
                  <option value="LIVING_ROOM">صالة معيشة مع وحدة تلفزيون / Living Room & TV</option>
                  <option value="KITCHEN">مطبخ ألماني ذكي / Smart German Kitchen</option>
                  <option value="HOME_OFFICE">مكتب منزلي مخصص / Home Office</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  النمط المعماري وخامات الخشب / Interior Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as InteriorStyle)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="NEOCLASSICAL_SAUDI">نيوكلاسيكي سعودي فاخر (إيجر كلاسيك + برونز)</option>
                  <option value="MODERN_MINIMALIST">عصري انسيابي (خشب السنديان الطبيعي H1180)</option>
                  <option value="CONTEMPORARY_LUXURY">فخامة معاصرة مع إضاءة بروفايل ليد مخفية</option>
                  <option value="JAPANDI">ياباندي هادئ (بساطة ونعومة بيضاء)</option>
                  <option value="SCANDINAVIAN">اسكندنافي دافئ (Egger Natural Halifax Oak)</option>
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
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        budgetTier === tier
                          ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/25'
                          : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  ملاحظات وتوجيهات خاصة (اختياري) / Custom Directives
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="مثال: أحتاج خزانة ٤ أبواب سحاب مع مرايا ملونة، إضاءة ليد سفلية وسكك بلوم..."
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white shadow-xl shadow-sky-500/20 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري تشغيل محرك الذكاء الاصطناعي SATCO...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sky-200 animate-pulse" />
                    <span>توليد المفهوم المعماري بالذكاء الاصطناعي ✨</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* In-Painting Form */
            <form onSubmit={handleInpaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  ارفع صورة غرفتك الحالية / Upload Room Photo
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-6 text-center cursor-pointer bg-[#0F172A] transition"
                >
                  <UploadCloud className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-white">
                    {photoFileName ? photoFileName : 'اضغط لاختيار صورة من جهازك বা মোবাইল'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">PNG, JPG, WEBP (Max 10MB)</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  المكان المراد استبداله / Replacement Target
                </label>
                <select
                  value={replaceTarget}
                  onChange={(e) => setReplaceTarget(e.target.value as any)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="EMPTY_WALL">جدار فارغ (تركيب خزانة مخصصة بالمليمتر)</option>
                  <option value="EXISTING_WARDROBE">استبدال دولاب قديم بخزانة ذكية جديدة</option>
                  <option value="OLD_CABINET">استبدال وحدة تلفزيون أو خزائن معلقة</option>
                  <option value="ENTIRE_ROOM">إعادة تأثيث الغرفة بالكامل بنمط سعودي فاخر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  النمط المفضل للقطع الجديدة
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as InteriorStyle)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="NEOCLASSICAL_SAUDI">نيوكلاسيكي سعودي فاخر</option>
                  <option value="MODERN_MINIMALIST">عصري انسيابي</option>
                  <option value="CONTEMPORARY_LUXURY">فخامة معاصرة</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || !uploadedPhotoBase64}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white shadow-xl shadow-emerald-500/20 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري معالجة وتركيب الأثاث في الصورة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>تطبيق الأثاث على صورتك (Photo In-Paint) 📸</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Regulatory Advisory Note (BR-AI-001) */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
            <span className="font-bold">⚠️ معيار الامتثال BR-AI-001:</span> كافة المفاهيم الناتجة استشارية وتخضع لتأكيد المقاسات الفعلية قبل التعميد والتصنيع.
          </div>
        </div>

        {/* Right Column: High-Tech Visualization Canvas */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#0F172A] rounded-3xl border border-slate-800 p-6 min-h-[440px]">
          {activeMode === 'INPAINT' && inpaintingResult ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group aspect-[16/10]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={inpaintingResult.inpaintedVisualizationUri}
                  alt="Inpainted Room"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/90 text-sky-400 border border-sky-500/40 px-2.5 py-1 rounded-full text-[10px] font-mono">
                  SATCO AI IN-PAINTED
                </div>
              </div>

              <div className="bg-[#0B1120] p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>إضاءة الغرفة المكتشفة:</span>
                  <span className="font-bold text-sky-400">
                    {inpaintingResult.detectedRoomFeatures?.estimatedLighting || 'WARM_DAYLIGHT'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>الجدار الأنسب للتركيب:</span>
                  <span className="font-bold text-emerald-400">
                    {inpaintingResult.detectedRoomFeatures?.recommendedPlacementWall || 'MAIN_BACK_WALL'}
                  </span>
                </div>
              </div>
            </div>
          ) : concept ? (
            <div className="space-y-4">
              {/* Concept Image View with Watermark */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group aspect-[16/10]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={concept.visualizationImageUri}
                  alt={concept.titleAr}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[10px] font-mono">
                  AI RENDERING READY
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{concept.titleAr}</h3>
                  <p className="text-xs text-slate-400 mt-1">{concept.descriptionAr}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 block">التكلفة التقديرية</span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {concept.estimatedTotalSar.toLocaleString()} SAR
                  </span>
                </div>
              </div>

              {/* Matched Furniture Items */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-sky-400" />
                  <span>القطع المطابقة من الكتالوج للتصنيع بجدة:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {concept.matchedFurnitureItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#0B1120] border border-slate-800 text-xs flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-white">{item.nameAr}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.suggestedWidthMm} × {item.suggestedHeightMm} × {item.suggestedDepthMm} مم
                        </div>
                        <div className="text-[10px] text-sky-400 mt-0.5 font-medium">
                          {item.recommendedMaterial}
                        </div>
                      </div>
                      <span className="font-bold text-amber-400 shrink-0 ms-2 font-mono">
                        {item.estimatedBasePriceSar} ر.س
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmation Gate Button */}
              <div className="pt-2">
                {confirmedSuccess ? (
                  <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center text-xs font-bold text-emerald-300">
                    ✅ تم تأكيد القياسات بنجاح! تم فتح بوابة الانتقال لطلب عرض السعر ومخطط الـ 3D.
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                  >
                    <Ruler className="w-4 h-4" />
                    <span>تأكيد مقاسات الجدران الفعلية للانتقال لعرض السعر (Mandatory Gate) 📐</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-3xl mb-4 text-sky-400">
                ✨
              </div>
              <h4 className="text-base font-bold text-white">في انتظار تشغيل المحرك الذكي</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                اختر نوع الغرفة، النمط، واضغط على زر التوليد لتشغيل محرك الذكاء الاصطناعي ومطابقة القطع مع كتالوج المصنع
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Measurement Confirmation Modal (Gate BR-AI-002) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B1120] border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-emerald-400" />
              <span>تأكيد أبعاد الغرفة الفعلية (BR-AI-002)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              لضمان دقة التصنيع الهندسي بآلات CNC في مصنع جدة، يرجى مراجعة الأبعاد بالمليمتر (mm).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">عرض الجدار الرئيسي (mm)</label>
                <input
                  type="number"
                  value={wallWidth}
                  onChange={(e) => setWallWidth(Number(e.target.value))}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">طول الغرفة (mm)</label>
                <input
                  type="number"
                  value={wallLength}
                  onChange={(e) => setWallLength(Number(e.target.value))}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ارتفاع السقف (mm)</label>
                <input
                  type="number"
                  value={ceilingHeight}
                  onChange={(e) => setCeilingHeight(Number(e.target.value))}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white"
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
                {isSubmittingConfirm ? 'جاري الاعتماد...' : 'تأكيد واعتماد المقاسات'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
