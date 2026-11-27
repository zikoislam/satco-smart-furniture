'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  Sparkles,
  UploadCloud,
  AlertTriangle,
  RefreshCw,
  Box,
  Ruler,
  Sun,
  Moon,
  Flame,
  Layers,
  Cpu,
  ShieldCheck,
  CreditCard,
  SlidersHorizontal,
  ArrowUpRight,
  Wrench,
} from 'lucide-react';
import {
  RoomType,
  InteriorStyle,
  GeneratedConceptResult,
} from '@/modules/ai-studio/ai-studio.types';

interface AIStudioStudioProps {
  onConceptConfirmed?: (
    concept: GeneratedConceptResult,
    dimensions: { widthMm: number; lengthMm: number; heightMm: number }
  ) => void;
}

type LightingMode = 'DAYLIGHT_4000K' | 'WARM_2700K' | 'BRONZE_ACCENT';

const STYLE_PRESET_CHIPS = [
  {
    id: 'bronze-fluted',
    labelEn: 'Bronze Fluted Glass & Warm LED Profiles',
    labelAr: 'زجاج مضلع برونزي مع إنارة LED دافئة',
  },
  {
    id: 'floating-marble',
    labelEn: 'Floating Marble TV Unit with Acoustic Slats',
    labelAr: 'وحدة تلفزيون رخامية معلقة مع شرائح صوتية',
  },
  {
    id: 'his-her-closet',
    labelEn: 'His & Her Luxury Walk-in Wardrobe with Island',
    labelAr: 'غرفة ملابس فاخرة مزدوجة مع جزيرة وسطية',
  },
  {
    id: 'blum-corner',
    labelEn: 'Hidden Soft-Close Blum Corner Storage',
    labelAr: 'تخزين زاوية مخفي بسكك Blum ناعمة الإغلاق',
  },
];

export const AIStudioStudio: React.FC<AIStudioStudioProps> = ({ onConceptConfirmed }) => {
  const currentLocale = useLocale();
  const [lang, setLang] = useState<'ar' | 'en'>(currentLocale === 'ar' ? 'ar' : 'en');
  const isAr = lang === 'ar';

  const [activeMode, setActiveMode] = useState<'GENERATE' | 'INPAINT'>('GENERATE');

  // Phase 1: Generation & Room Dimensions Auto-Calculator States
  const [roomType, setRoomType] = useState<RoomType>('BEDROOM');
  const [style, setStyle] = useState<InteriorStyle>('NEOCLASSICAL_SAUDI');
  const [prompt, setPrompt] = useState('');
  const [budgetTier, setBudgetTier] = useState<'ECONOMY' | 'PREMIUM' | 'LUXURY'>('PREMIUM');
  const [roomWidthM, setRoomWidthM] = useState<number>(4.0);
  const [roomLengthM, setRoomLengthM] = useState<number>(5.0);
  const [ceilingHeightM, setCeilingHeightM] = useState<number>(3.0);
  const [lightingMode, setLightingMode] = useState<LightingMode>('DAYLIGHT_4000K');

  const [isLoading, setIsLoading] = useState(false);
  const [concept, setConcept] = useState<GeneratedConceptResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Phase 3: In-Painting & Before/After Slider States
  const [uploadedPhotoBase64, setUploadedPhotoBase64] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<
    'EMPTY_WALL' | 'EXISTING_WARDROBE' | 'OLD_CABINET' | 'ENTIRE_ROOM'
  >('EMPTY_WALL');
  const [inpaintingResult, setInpaintingResult] = useState<any | null>(null);
  const [compareSlider, setCompareSlider] = useState<number>(55);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Measurement confirmation modal (BR-AI-002)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [wallWidth, setWallWidth] = useState(4000);
  const [wallLength, setWallLength] = useState(5000);
  const [ceilingHeight, setCeilingHeight] = useState(3000);
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  // Auto-calculated room layout recommendation
  const autoLayout = useMemo(() => {
    const safeW = Math.min(20, Math.max(1.5, Number(roomWidthM) || 4));
    const safeL = Math.min(20, Math.max(1.5, Number(roomLengthM) || 5));
    const safeH = Math.min(6, Math.max(2.0, Number(ceilingHeightM) || 3));
    const areaSqm = +(safeW * safeL).toFixed(1);

    // Recommended primary cabinetry run (leaves ergonomic clearance)
    const maxWallM = Math.max(safeW, safeL);
    const recommendedRunM = +(Math.max(1.8, maxWallM - 0.8)).toFixed(2);
    const recommendedRunMm = Math.round(recommendedRunM * 1000);
    const recommendedHeightMm = Math.min(2900, Math.round((safeH - 0.15) * 1000));
    const bayCount = Math.max(2, Math.min(8, Math.floor(recommendedRunM / 0.6)));

    let unitLabelEn = 'Custom Parametric Wardrobe';
    let unitLabelAr = 'خزانة ملابس مخصصة بالمليمتر';
    if (roomType === 'KITCHEN') {
      unitLabelEn = 'Modular Kitchen Counter & Pantry';
      unitLabelAr = 'كاونتر مطبخ ألماني مع خزائن علوية';
    } else if (roomType === 'LIVING_ROOM' || roomType === 'MAJLIS') {
      unitLabelEn = 'Floating TV & Architectural Wall Unit';
      unitLabelAr = 'وحدة تلفزيون معلقة وديكور جداري';
    } else if (roomType === 'HOME_OFFICE') {
      unitLabelEn = 'Executive Desk & Bookshelf Wall';
      unitLabelAr = 'مكتب تنفيذي مع مكتبة جدارية';
    }

    return {
      areaSqm,
      widthMm: Math.round(safeW * 1000),
      lengthMm: Math.round(safeL * 1000),
      heightMm: Math.round(safeH * 1000),
      recommendedRunM,
      recommendedRunMm,
      recommendedHeightMm,
      bayCount,
      unitLabelEn,
      unitLabelAr,
    };
  }, [roomWidthM, roomLengthM, ceilingHeightM, roomType]);

  // Automated Estimated BOM summary (from matched items or autoLayout fallback)
  const estimatedBom = useMemo(() => {
    if (concept?.matchedFurnitureItems?.length) {
      let totalBoardAreaSqm = 0;
      let totalEdgeMeters = 0;
      let totalHinges = 0;

      concept.matchedFurnitureItems.forEach((item) => {
        const w = item.suggestedWidthMm / 1000;
        const h = item.suggestedHeightMm / 1000;
        const d = item.suggestedDepthMm / 1000;
        // Approximate carcass + doors + shelves surface area
        const itemArea = 2 * (w * h) + 2 * (h * d) + 4 * (w * d);
        totalBoardAreaSqm += itemArea;
        totalEdgeMeters += 2 * (w + h) * 3;
        const doorsEstimate = Math.max(2, Math.round(w / 0.5));
        totalHinges += doorsEstimate * 4;
      });

      const boardArea = +totalBoardAreaSqm.toFixed(1);
      const eggerSheets = Math.max(1, Math.ceil(boardArea / 5.2)); // 2800x2070mm minus kerf/waste
      return {
        boardAreaSqm: boardArea,
        eggerSheets,
        rehauEdgeMeters: Math.round(totalEdgeMeters),
        blumHinges: totalHinges,
      };
    }

    const w = autoLayout.recommendedRunM;
    const h = autoLayout.recommendedHeightMm / 1000;
    const boardArea = +(w * h * 2.8).toFixed(1);
    return {
      boardAreaSqm: boardArea,
      eggerSheets: Math.max(2, Math.ceil(boardArea / 5.2)),
      rehauEdgeMeters: Math.round((w + h) * 8),
      blumHinges: autoLayout.bayCount * 4,
    };
  }, [concept, autoLayout]);

  // ZATCA 15% VAT & 3-Stage Milestone Payment Breakdown
  const financialBreakdown = useMemo(() => {
    const subtotal = concept?.estimatedTotalSar ?? Math.round(autoLayout.recommendedRunM * 2450);
    const vat15 = +(subtotal * 0.15).toFixed(2);
    const grandTotal = +(subtotal + vat15).toFixed(2);
    const stage1Deposit30 = +(grandTotal * 0.3).toFixed(2);
    const stage2PreDispatch40 = +(grandTotal * 0.4).toFixed(2);
    const stage3Handover30 = +(grandTotal - stage1Deposit30 - stage2PreDispatch40).toFixed(2);

    return {
      subtotal,
      vat15,
      grandTotal,
      stage1Deposit30,
      stage2PreDispatch40,
      stage3Handover30,
    };
  }, [concept, autoLayout.recommendedRunM]);

  // Lighting simulator CSS overlay & filter
  const lightingConfig = useMemo(() => {
    switch (lightingMode) {
      case 'WARM_2700K':
        return {
          filterClass: 'brightness-90 sepia-[0.22] saturate-125 contrast-105',
          overlayClass: 'bg-amber-500/15 mix-blend-soft-light',
          badgeText: isAr ? 'إضاءة ليلية دافئة 2700K' : 'Warm Ambient 2700K',
          swatches: ['#1E1B18', '#B68B5A', '#F59E0B', '#3E2C1E'],
        };
      case 'BRONZE_ACCENT':
        return {
          filterClass: 'brightness-95 contrast-110 saturate-110',
          overlayClass: 'bg-gradient-to-tr from-amber-700/25 via-transparent to-orange-400/20',
          badgeText: isAr ? 'إضاءة بروفايل برونزية' : 'Bronze Accent LED',
          swatches: ['#0F172A', '#92400E', '#D97706', '#78350F'],
        };
      case 'DAYLIGHT_4000K':
      default:
        return {
          filterClass: 'brightness-105 contrast-100',
          overlayClass: 'bg-sky-200/5',
          badgeText: isAr ? 'إضاءة نهارية طبيعية 4000K' : 'Daylight 4000K',
          swatches: ['#F8FAFC', '#C7A97E', '#38BDF8', '#1E293B'],
        };
    }
  }, [lightingMode, isAr]);

  const handlePresetClick = (chipEn: string, chipAr: string) => {
    const text = isAr ? chipAr : chipEn;
    setPrompt((prev) => {
      if (!prev.trim()) return text;
      if (prev.includes(text)) return prev;
      return `${prev.trim()}, ${text}`;
    });
  };

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
        roomDimensions: {
          widthMm: autoLayout.widthMm,
          lengthMm: autoLayout.lengthMm,
          heightMm: autoLayout.heightMm,
        },
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
        setWallWidth(autoLayout.widthMm);
        setWallLength(autoLayout.lengthMm);
        setCeilingHeight(autoLayout.heightMm);
      } else {
        setErrorMessage(
          data?.message || (isAr ? 'فشل توليد التصميم الذكي' : 'Failed to generate room concept')
        );
      }
    } catch (err: any) {
      console.error('Failed to generate AI concept', err);
      setErrorMessage(
        err?.message ||
          (isAr ? 'خطأ في الاتصال بمحرك الذكاء الاصطناعي' : 'Network error connecting to SATCO AI Core')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInpaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedPhotoBase64) {
      setErrorMessage(
        isAr
          ? 'يرجى رفع صورة الغرفة أولاً لتطبيق التعديل الذكي'
          : 'Please upload a room photo first to apply AI in-painting'
      );
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
        setErrorMessage(data?.message || (isAr ? 'فشلت معالجة الصورة' : 'In-painting failed'));
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || (isAr ? 'حدث خطأ أثناء معالجة الصورة' : 'Network error during in-painting')
      );
    } finally {
      setIsLoading(false);
    }
  };

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
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="w-full max-w-7xl mx-auto p-4 md:p-7 bg-[#0B1120] text-white rounded-3xl shadow-[0_0_60px_-15px_rgba(56,189,248,0.22)] border border-slate-800/90 relative overflow-hidden"
    >
      {/* Subtle Cyber-Gold & Neon Sky Ambient Glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Top Header & Language Toggle */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-black tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/40 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>SATCO AI VISION STUDIO</span>
            </span>
            <span className="text-xs text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-400/30">
              {isAr ? '🇸🇦 هندسة CNC ألمانية — مصنع جدة' : '🇸🇦 German CNC Precision — Jeddah Hub'}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black mt-2.5 tracking-tight bg-gradient-to-r from-white via-sky-100 to-amber-200 bg-clip-text text-transparent">
            {isAr ? 'استوديو التصميم الذكي للغرف والمفروشات' : 'AI Room Designer & Engineering Studio'}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {isAr
              ? 'ذكاء اصطناعي متكامل لحساب المقاسات، قائمة المواد (BOM)، والأسعار مع ضريبة القيمة المضافة ١٥٪'
              : 'Intelligent room layout, live lighting simulation, Austrian Egger specs, automated BOM & ZATCA 15% VAT breakdown.'}
          </p>
        </div>

        {/* Right Action: Language Switcher + Feature Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 self-stretch lg:self-auto">
          <div className="flex items-center bg-[#0F172A]/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/70 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition ${
                !isAr
                  ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
            <button
              type="button"
              onClick={() => setLang('ar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition ${
                isAr
                  ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇸🇦</span>
              <span>العربية</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#0F172A]/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/70">
            <button
              type="button"
              onClick={() => {
                setActiveMode('GENERATE');
                setErrorMessage(null);
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeMode === 'GENERATE'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'توليد ذكي' : 'AI Generator'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode('INPAINT');
                setErrorMessage(null);
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeMode === 'INPAINT'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isAr ? 'معالجة صورتك (Before/After)' : 'Photo In-Paint'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="relative z-10 mt-4 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 font-bold hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Dual Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-7 mt-6">
        {/* Left Column: Controls, Dimensions Auto-Calculator & Preset Chips */}
        <div className="lg:col-span-5 space-y-5">
          {activeMode === 'GENERATE' ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Room Type & Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {isAr ? 'نوع الغرفة' : 'Room Space'}
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as RoomType)}
                    className="w-full bg-[#0F172A]/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="BEDROOM">{isAr ? 'غرفة نوم رئيسية' : 'Master Bedroom'}</option>
                    <option value="WALK_IN_CLOSET">{isAr ? 'غرفة ملابس فاخرة' : 'Walk-in Closet'}</option>
                    <option value="MAJLIS">{isAr ? 'مجلس سعودي' : 'Saudi Majlis'}</option>
                    <option value="LIVING_ROOM">{isAr ? 'صالة معيشة و TV' : 'Living Room & TV'}</option>
                    <option value="KITCHEN">{isAr ? 'مطبخ ألماني ذكي' : 'Modular Kitchen'}</option>
                    <option value="HOME_OFFICE">{isAr ? 'مكتب منزلي' : 'Home Office'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {isAr ? 'النمط المعماري' : 'Interior Style'}
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as InteriorStyle)}
                    className="w-full bg-[#0F172A]/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="NEOCLASSICAL_SAUDI">
                      {isAr ? 'نيوكلاسيكي سعودي فاخر' : 'Neoclassical Saudi'}
                    </option>
                    <option value="MODERN_MINIMALIST">
                      {isAr ? 'عصري انسيابي (H1180)' : 'Modern Minimalist'}
                    </option>
                    <option value="CONTEMPORARY_LUXURY">
                      {isAr ? 'فخامة معاصرة + LED' : 'Contemporary Luxury'}
                    </option>
                    <option value="JAPANDI">{isAr ? 'ياباندي هادئ' : 'Japandi Calm'}</option>
                    <option value="SCANDINAVIAN">
                      {isAr ? 'اسكندنافي دافئ' : 'Scandinavian Warm'}
                    </option>
                  </select>
                </div>
              </div>

              {/* Phase 1: AI Room Dimensions Auto-Calculator */}
              <div className="p-4 rounded-2xl bg-[#0F172A]/80 backdrop-blur-xl border border-sky-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-sky-400 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5" />
                    <span>
                      {isAr
                        ? 'حاسبة أبعاد الغرفة التلقائية (AI Auto-Fit)'
                        : 'AI Room Dimensions Auto-Calculator'}
                    </span>
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    {autoLayout.areaSqm} m²
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      {isAr ? 'العرض (متر)' : 'Width (m)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={1.5}
                      max={20}
                      value={roomWidthM}
                      onChange={(e) => setRoomWidthM(Number(e.target.value))}
                      className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      {isAr ? 'الطول (متر)' : 'Length (m)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={1.5}
                      max={20}
                      value={roomLengthM}
                      onChange={(e) => setRoomLengthM(Number(e.target.value))}
                      className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      {isAr ? 'الارتفاع (متر)' : 'Height (m)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={2.0}
                      max={6.0}
                      value={ceilingHeightM}
                      onChange={(e) => setCeilingHeightM(Number(e.target.value))}
                      className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/25 text-[11px] text-amber-200 flex items-center justify-between gap-2">
                  <span>
                    <strong className="text-amber-400">
                      {isAr ? 'التوصية الذكية:' : 'AI Fit Suggestion:'}
                    </strong>{' '}
                    {isAr ? autoLayout.unitLabelAr : autoLayout.unitLabelEn}
                  </span>
                  <span className="font-mono font-bold text-amber-300 shrink-0">
                    {autoLayout.recommendedRunMm}×{autoLayout.recommendedHeightMm}mm ({autoLayout.bayCount}{' '}
                    {isAr ? 'أبواب' : 'bays'})
                  </span>
                </div>
              </div>

              {/* Budget Tier */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {isAr ? 'فئة الميزانية والمواصفات' : 'Hardware & Finish Tier'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ECONOMY', 'PREMIUM', 'LUXURY'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setBudgetTier(tier)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        budgetTier === tier
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/20'
                          : 'bg-[#0F172A]/80 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tier === 'ECONOMY'
                        ? isAr
                          ? 'اقتصادي'
                          : 'Economy'
                        : tier === 'PREMIUM'
                          ? isAr
                            ? 'مميز'
                            : 'Premium'
                          : isAr
                            ? 'فاخر'
                            : 'Luxury'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phase 1: Interactive Style Preset Chips */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {isAr
                    ? 'اقتراحات ذكية بضغطة واحدة (Preset Chips)'
                    : 'One-Click Intelligent Style Presets'}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {STYLE_PRESET_CHIPS.map((chip) => {
                    const text = isAr ? chip.labelAr : chip.labelEn;
                    const active = prompt.includes(text);
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => handlePresetClick(chip.labelEn, chip.labelAr)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition font-medium ${
                          active
                            ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                            : 'bg-[#0F172A] border-slate-700/80 text-slate-300 hover:border-amber-400/60 hover:text-amber-300'
                        }`}
                      >
                        + {text}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    isAr
                      ? 'أضف تفاصيل مخصصة أو اختر من الاقتراحات أعلاه...'
                      : 'Add custom details or click preset chips above...'
                  }
                  className="w-full bg-[#0F172A]/90 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-500 hover:from-sky-400 hover:to-amber-400 text-white shadow-xl shadow-sky-500/25 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>
                      {isAr
                        ? 'جاري تحليل الغرفة وتوليد المخطط...'
                        : 'Analyzing Dimensions & Rendering AI Concept...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                    <span>
                      {isAr ? 'توليد التصميم والمواصفات الهندسية ✨' : 'Generate AI Concept & Specs ✨'}
                    </span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* In-Painting Form */
            <form onSubmit={handleInpaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  {isAr ? 'ارفع صورة غرفتك الفارغة أو الحالية' : 'Upload Empty or Current Room Photo'}
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
                  className="border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer bg-[#0F172A]/80 backdrop-blur-md transition"
                >
                  <UploadCloud className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-white">
                    {photoFileName
                      ? photoFileName
                      : isAr
                        ? 'اضغط لاختيار صورة من جهازك أو جوالك'
                        : 'Click to upload room photo for Before/After AI'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">PNG, JPG, WEBP (Max 10MB)</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  {isAr ? 'الهدف المراد تعديله' : 'Replacement Target'}
                </label>
                <select
                  value={replaceTarget}
                  onChange={(e) => setReplaceTarget(e.target.value as any)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="EMPTY_WALL">
                    {isAr ? 'جدار فارغ (تركيب خزانة مخصصة)' : 'Empty Wall (Custom Millimeter Wardrobe)'}
                  </option>
                  <option value="EXISTING_WARDROBE">
                    {isAr ? 'استبدال دولاب قديم بخزانة ذكية' : 'Replace Old Wardrobe with Smart Cabinetry'}
                  </option>
                  <option value="OLD_CABINET">
                    {isAr ? 'استبدال وحدة تلفزيون معلقة' : 'Replace Floating TV Unit / Console'}
                  </option>
                  <option value="ENTIRE_ROOM">
                    {isAr ? 'إعادة تصميم الغرفة بالكامل' : 'Complete Room Makeover'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  {isAr ? 'النمط المفضل' : 'Target Luxury Style'}
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as InteriorStyle)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="NEOCLASSICAL_SAUDI">
                    {isAr ? 'نيوكلاسيكي سعودي فاخر' : 'Neoclassical Saudi Luxury'}
                  </option>
                  <option value="MODERN_MINIMALIST">
                    {isAr ? 'عصري انسيابي' : 'Modern Minimalist'}
                  </option>
                  <option value="CONTEMPORARY_LUXURY">
                    {isAr ? 'فخامة معاصرة' : 'Contemporary Luxury'}
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || !uploadedPhotoBase64}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-xl shadow-amber-500/20 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>
                      {isAr ? 'جاري تركيب الأثاث بالذكاء الاصطناعي...' : 'Inpainting AI Furniture...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isAr
                        ? 'تطبيق الأثاث ومعاينة قبل/بعد 📸'
                        : 'Apply AI Furniture & Compare Before/After 📸'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Phase 2: German CNC & Austrian Egger Specification Cards */}
          <div className="p-4 rounded-2xl bg-[#0F172A]/80 backdrop-blur-xl border border-slate-700/70 space-y-2.5">
            <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>
                {isAr
                  ? 'مواصفات التصنيع الألماني والخامات النمساوية'
                  : 'German CNC & Austrian Egger Specifications'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#0B1120]/90 border border-slate-800">
                <span className="text-slate-400">{isAr ? 'ألواح الخشب:' : 'Wood Panels:'}</span>
                <span className="font-bold text-white">Egger Halifax Oak / PerfectSense Matt</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#0B1120]/90 border border-slate-800">
                <span className="text-slate-400">{isAr ? 'شريط الحواف:' : 'Edge-Banding:'}</span>
                <span className="font-bold text-sky-300">Rehau 1mm Polyurethane Laser Edge</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#0B1120]/90 border border-slate-800">
                <span className="text-slate-400">{isAr ? 'المفصلات والسكك:' : 'Hardware:'}</span>
                <span className="font-bold text-amber-300">Blum Tandembox / Aventos HF Lift</span>
              </div>
            </div>
          </div>

          {/* Regulatory Advisory Note (BR-AI-001) */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] leading-relaxed">
            <span className="font-bold">⚠️ {isAr ? 'معيار الامتثال BR-AI-001:' : 'Compliance BR-AI-001:'}</span>{' '}
            {isAr
              ? 'التصاميم استشارية وتتطلب تأكيد المقاسات الفعلية قبل التعميد.'
              : 'Advisory concepts require physical room measurement verification before CNC fabrication.'}
          </div>
        </div>

        {/* Right Column: Live Lighting Simulator, Before/After Canvas, BOM & ZATCA */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#0F172A]/80 backdrop-blur-xl rounded-3xl border border-slate-700/70 p-5 md:p-6 space-y-5">
          {/* Phase 1: Live AI Moodboard & Lighting Simulator Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 me-1">
                {isAr ? 'محاكي الإضاءة:' : 'Lighting:'}
              </span>
              <button
                type="button"
                onClick={() => setLightingMode('DAYLIGHT_4000K')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                  lightingMode === 'DAYLIGHT_4000K'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                    : 'bg-[#0B1120] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>4000K</span>
              </button>
              <button
                type="button"
                onClick={() => setLightingMode('WARM_2700K')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                  lightingMode === 'WARM_2700K'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-[#0B1120] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>2700K</span>
              </button>
              <button
                type="button"
                onClick={() => setLightingMode('BRONZE_ACCENT')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                  lightingMode === 'BRONZE_ACCENT'
                    ? 'bg-orange-500/20 border-orange-400 text-orange-300'
                    : 'bg-[#0B1120] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>{isAr ? 'برونز' : 'Bronze'}</span>
              </button>
            </div>

            {/* Live Moodboard Swatches */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">
                {isAr ? 'لوحة الألوان:' : 'Moodboard:'}
              </span>
              {lightingConfig.swatches.map((hex) => (
                <span
                  key={hex}
                  title={hex}
                  className="w-4 h-4 rounded-full border border-white/25 shadow-sm"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          {/* Phase 3: Split-Screen Before / After Interactive Comparison (Photo In-Painting) */}
          {activeMode === 'INPAINT' && inpaintingResult && uploadedPhotoBase64 ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 aspect-[16/10] select-none">
                {/* After Image (Full Base) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={inpaintingResult.inpaintedVisualizationUri}
                  alt="After AI In-Painting"
                  className={`w-full h-full object-cover transition-all duration-300 ${lightingConfig.filterClass}`}
                />
                <div className={`absolute inset-0 pointer-events-none ${lightingConfig.overlayClass}`} />

                {/* Before Image (Clipped by Slider) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - compareSlider}% 0 0)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uploadedPhotoBase64}
                    alt="Before Original Room"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Vertical Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] pointer-events-none"
                  style={{ left: `${compareSlider}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                </div>

                {/* Labels */}
                <span className="absolute top-3 left-3 bg-slate-950/85 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold">
                  {isAr ? 'قبل (الصورة الأصلية)' : 'BEFORE (Original)'}
                </span>
                <span className="absolute top-3 right-3 bg-amber-500/90 text-slate-950 px-2.5 py-1 rounded-full text-[10px] font-black">
                  {isAr ? 'بعد (SATCO AI)' : 'AFTER (SATCO AI)'}
                </span>
              </div>

              {/* Draggable Range Slider */}
              <div className="flex items-center gap-3 bg-[#0B1120] px-4 py-2.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400">
                  {isAr ? 'اسحب للمقارنة:' : 'Compare Slider:'}
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={compareSlider}
                  onChange={(e) => setCompareSlider(Number(e.target.value))}
                  className="flex-1 accent-amber-400 cursor-ew-resize"
                />
                <span className="text-xs font-mono text-amber-400 w-9 text-right">
                  {compareSlider}%
                </span>
              </div>
            </div>
          ) : concept ? (
            <div className="space-y-4">
              {/* Concept Visualization with Live Lighting Overlay */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 aspect-[16/10]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={concept.visualizationImageUri}
                  alt={isAr ? concept.titleAr : concept.titleEn}
                  className={`w-full h-full object-cover transition-all duration-300 ${lightingConfig.filterClass}`}
                />
                <div className={`absolute inset-0 pointer-events-none ${lightingConfig.overlayClass}`} />
                <div className="absolute top-3 left-3 bg-slate-950/85 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[10px] font-mono">
                  {lightingConfig.badgeText}
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isAr ? concept.titleAr : concept.titleEn}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAr ? concept.descriptionAr : concept.descriptionEn}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block">
                    {isAr ? 'الإجمالي شامل الضريبة ١٥٪' : 'Grand Total (15% VAT)'}
                  </span>
                  <span className="text-xl font-black text-amber-400 font-mono">
                    {financialBreakdown.grandTotal.toLocaleString()} SAR
                  </span>
                </div>
              </div>

              {/* Matched Furniture Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {concept.matchedFurnitureItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0B1120]/90 border border-slate-800 text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-white">
                        {isAr ? item.nameAr : item.nameEn}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {item.suggestedWidthMm} × {item.suggestedHeightMm} × {item.suggestedDepthMm} mm
                      </div>
                      <div className="text-[10px] text-sky-400 mt-0.5 font-medium">
                        {item.recommendedMaterial}
                      </div>
                    </div>
                    <span className="font-bold text-amber-400 shrink-0 ms-2 font-mono">
                      {item.estimatedBasePriceSar.toLocaleString()} SAR
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-2xl bg-[#0B1120]/50">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-amber-500/20 border border-sky-500/30 flex items-center justify-center text-2xl mb-3">
                ✨
              </div>
              <h4 className="text-base font-bold text-white">
                {isAr ? 'في انتظار تشغيل المحرك الهندسي الذكي' : 'Ready for Intelligent AI Generation'}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                {isAr
                  ? 'حدد أبعاد الغرفة أو اختر من الاقتراحات الذكية لتوليد التصميم وحساب كميات الخشب والأسعار فوراً.'
                  : 'Set your room dimensions or click a style preset chip to generate your bespoke concept, BOM & ZATCA pricing.'}
              </p>
            </div>
          )}

          {/* Phase 2: Automated Estimated BOM & ZATCA 15% VAT 3-Stage Milestone Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Automated BOM Summary */}
            <div className="p-4 rounded-2xl bg-[#0B1120]/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isAr ? 'ملخص قائمة المواد (Auto-BOM)' : 'Automated Estimated BOM'}</span>
                </span>
                <Wrench className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-[#0F172A] border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">
                    {isAr ? 'مساحة الألواح' : 'Board Area'}
                  </span>
                  <strong className="text-white font-mono">{estimatedBom.boardAreaSqm} m²</strong>
                </div>
                <div className="p-2 rounded-xl bg-[#0F172A] border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">
                    {isAr ? 'ألواح Egger' : 'Egger Sheets'}
                  </span>
                  <strong className="text-amber-300 font-mono">
                    {estimatedBom.eggerSheets} {isAr ? 'لوح' : 'sheets'}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-[#0F172A] border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">
                    {isAr ? 'مفصلات Blum' : 'Blum Hinges'}
                  </span>
                  <strong className="text-sky-300 font-mono">{estimatedBom.blumHinges} pcs</strong>
                </div>
                <div className="p-2 rounded-xl bg-[#0F172A] border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">
                    {isAr ? 'شريط Rehau' : 'Rehau Edge'}
                  </span>
                  <strong className="text-emerald-300 font-mono">
                    {estimatedBom.rehauEdgeMeters} m
                  </strong>
                </div>
              </div>
            </div>

            {/* ZATCA 15% VAT & 3-Stage Milestone Payment */}
            <div className="p-4 rounded-2xl bg-[#0B1120]/90 border border-amber-500/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isAr ? 'الضريبة ١٥٪ والدفعات (ZATCA)' : 'ZATCA 15% VAT & 3 Milestones'}</span>
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              <div className="text-[11px] space-y-1 border-b border-slate-800 pb-2">
                <div className="flex justify-between text-slate-400">
                  <span>{isAr ? 'المبلغ الأساسي:' : 'Subtotal:'}</span>
                  <span className="font-mono text-white">
                    {financialBreakdown.subtotal.toLocaleString()} SAR
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{isAr ? 'ضريبة القيمة المضافة (١٥٪):' : 'ZATCA VAT (15%):'}</span>
                  <span className="font-mono text-sky-300">
                    {financialBreakdown.vat15.toLocaleString()} SAR
                  </span>
                </div>
                <div className="flex justify-between font-bold text-amber-400">
                  <span>{isAr ? 'الإجمالي النهائي:' : 'Grand Total:'}</span>
                  <span className="font-mono">
                    {financialBreakdown.grandTotal.toLocaleString()} SAR
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <div className="p-1.5 rounded-lg bg-[#0F172A] text-center border border-slate-800">
                  <span className="text-slate-400 block">30% {isAr ? 'تقطيع' : 'Cut'}</span>
                  <strong className="text-emerald-400 font-mono">
                    {financialBreakdown.stage1Deposit30.toLocaleString()}
                  </strong>
                </div>
                <div className="p-1.5 rounded-lg bg-[#0F172A] text-center border border-slate-800">
                  <span className="text-slate-400 block">40% {isAr ? 'شحن' : 'Ship'}</span>
                  <strong className="text-sky-400 font-mono">
                    {financialBreakdown.stage2PreDispatch40.toLocaleString()}
                  </strong>
                </div>
                <div className="p-1.5 rounded-lg bg-[#0F172A] text-center border border-slate-800">
                  <span className="text-slate-400 block">30% {isAr ? 'تسليم' : 'Done'}</span>
                  <strong className="text-amber-400 font-mono">
                    {financialBreakdown.stage3Handover30.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 3: Direct 3D Parametric Configurator Handoff & Measurement Gate */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Link
              href={`/${lang}/configurator`}
              className="flex-1 py-3.5 px-5 rounded-2xl font-black text-xs bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2"
            >
              <Box className="w-4 h-4" />
              <span>
                {isAr
                  ? 'فتح في المصمم ثلاثي الأبعاد (3D Configurator)'
                  : 'Open in 3D Parametric Configurator'}
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            {concept &&
              (confirmedSuccess ? (
                <div className="flex-1 py-3 px-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center text-xs font-bold text-emerald-300 flex items-center justify-center">
                  {isAr
                    ? '✅ تم تأكيد المقاسات واعتماد التصميم!'
                    : '✅ Measurements Confirmed for Quotation!'}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="flex-1 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                >
                  <Ruler className="w-4 h-4" />
                  <span>
                    {isAr ? 'تأكيد المقاسات الفعلية (BR-AI-002)' : 'Confirm Room Dimensions (Gate)'}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Measurement Confirmation Modal (Gate BR-AI-002) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B1120] border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-emerald-400" />
              <span>
                {isAr ? 'تأكيد أبعاد الغرفة الفعلية (BR-AI-002)' : 'Confirm Room Dimensions (BR-AI-002)'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {isAr
                ? 'لضمان دقة التصنيع الهندسي بآلات CNC في مصنع جدة، يرجى مراجعة الأبعاد بالمليمتر (mm).'
                : 'To ensure precision German CNC fabrication in our Jeddah factory, please verify dimensions in millimeters (mm).'}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {isAr ? 'عرض الجدار الرئيسي (mm)' : 'Main Wall Width (mm)'}
                </label>
                <input
                  type="number"
                  value={wallWidth}
                  onChange={(e) => setWallWidth(Number(e.target.value))}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {isAr ? 'طول الغرفة (mm)' : 'Room Length (mm)'}
                </label>
                <input
                  type="number"
                  value={wallLength}
                  onChange={(e) => setWallLength(Number(e.target.value))}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {isAr ? 'ارتفاع السقف (mm)' : 'Ceiling Height (mm)'}
                </label>
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
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isSubmittingConfirm}
                onClick={handleConfirmMeasurements}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30"
              >
                {isSubmittingConfirm
                  ? isAr
                    ? 'جاري الاعتماد...'
                    : 'Confirming...'
                  : isAr
                    ? 'تأكيد واعتماد المقاسات'
                    : 'Confirm Measurements'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
