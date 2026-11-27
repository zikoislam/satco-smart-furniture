'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { CheckCircle2, Package, Sparkles, ArrowRight } from 'lucide-react';

const FINISH_OPTIONS = [
  { code: 'EGG-H1180-ST37', label: 'Halifax Oak Natural', hex: '#B59477' },
  { code: 'EGG-W1000-PM', label: 'Premium Alpine White', hex: '#FFFFFF' },
  { code: 'EGG-U708-ST9', label: 'Light Grey Matte', hex: '#CCCCCC' },
  { code: 'EGG-U999-PM', label: 'Black Matte', hex: '#1E1E1E' },
  { code: 'EGG-H3303-ST10', label: 'Natural Hamilton Oak', hex: '#A88358' },
  { code: 'REH-EDGE-2MM', label: 'Rehau 2mm Laser Edge', hex: '#8C6D4F' },
];

export default function SampleBoxPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [selectedFinishes, setSelectedFinishes] = useState<string[]>([
    'EGG-H1180-ST37',
    'EGG-W1000-PM',
  ]);
  const [buildingNumber, setBuildingNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('Jeddah');
  const [postalCode, setPostalCode] = useState('');

  const [result, setResult] = useState<{ sampleBoxOrderId: string; creditPolicy: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleFinish(code: string) {
    setSelectedFinishes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  async function handleOrderSampleBox(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('satco_access_token') : null;
    if (!token) {
      setError(isArabic ? 'يرجى تسجيل الدخول أولاً للمتابعة.' : 'Please sign in via OTP first to place order.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/sample-box/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            buildingNumber,
            streetName,
            district,
            city,
            postalCode,
          },
          preferredFinishes: selectedFinishes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to order sample box');
      }
      setResult(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#191919] font-sans pb-16">
      {/* 1. Hero-Matched Cinematic Header Banner with Shimmer & Glass Overlay */}
      <section className="relative w-full min-h-[380px] md:min-h-[420px] bg-[#121212] overflow-hidden flex items-center justify-center text-center">
        {/* Full-bleed wood & architectural luxury background matching Hero */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=85"
            alt="Material Sample Kit Interior"
            className="w-full h-full object-cover object-center brightness-75 scale-105"
          />
          {/* Cinematic Dark Gradient for High-Contrast Visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40" />
        </div>

        {/* Floating Content Over Background */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-4 text-white flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-[#E53238] text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg animate-badge-flash">
            <span className="animate-spin text-sm">⚡</span>
            <span>{isArabic ? 'ضمان استرداد ١٠٠٪' : '100% REFUNDABLE UPON ORDER'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-2xl animate-text-shimmer">
            {isArabic ? 'صندوق عينات الأخشاب والرخام' : 'Material Sample Box Kit'}
          </h1>

          <p className="text-sm sm:text-base text-slate-100 max-w-2xl leading-relaxed drop-shadow-md font-medium">
            {isArabic
              ? 'المس وافحص خامات إيجر النمساوية (Egger) ومفصلات بلوم الهيدروليكية في منزلك قبل بدء التصنيع. قيمة الصندوق مستردة بالكامل عند تعميد طلبك!'
              : 'Touch and feel premium Austrian Egger wood panels and Blum hardware before ordering. Fee 100% refunded on your first furniture order!'}
          </p>

          <div className="inline-flex items-baseline gap-3 bg-black/60 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 shadow-xl">
            <span className="text-2xl font-black text-amber-300">150 SAR</span>
            <span className="text-sm text-slate-300 line-through">250 SAR</span>
            <span className="text-xs font-black text-[#86B817] bg-[#86B817]/20 px-2 py-0.5 rounded-full">
              {isArabic ? 'خصم ٤٠٪' : '40% OFF'}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Order Form & Swatch Customization Container */}
      <main className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-10 shadow-xl space-y-8">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-[#3665F3]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#191919]">
                {isArabic ? 'تخصيص عينات الخامات المفضلة' : 'Select Preferred Material Samples'}
              </h2>
            </div>
            <Link
              href={`/${locale}`}
              className="text-xs font-bold text-[#3665F3] hover:underline flex items-center gap-1"
            >
              <span>{isArabic ? 'العودة للرئيسية' : 'Back to Home'}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {result ? (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <h3 className="text-lg font-bold">
                  {isArabic ? 'تم تأكيد طلب صندوق العينات بنجاح!' : 'Sample Box Ordered Successfully!'}
                </h3>
              </div>
              <p className="text-sm font-semibold">Order ID: {result.sampleBoxOrderId}</p>
              <p className="text-xs text-emerald-800">{result.creditPolicy}</p>
            </div>
          ) : (
            <form onSubmit={handleOrderSampleBox} className="space-y-6">
              {/* Swatches Grid */}
              <div>
                <label className="block text-xs font-bold text-[#707070] uppercase mb-3">
                  {isArabic ? 'اختر العينات التي تود فحصها:' : 'Choose Swatches to include in your box:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FINISH_OPTIONS.map((f) => {
                    const active = selectedFinishes.includes(f.code);
                    return (
                      <button
                        key={f.code}
                        type="button"
                        onClick={() => toggleFinish(f.code)}
                        className={`p-3.5 rounded-2xl border text-start flex flex-col justify-between min-h-[90px] transition duration-150 ${
                          active
                            ? 'border-[#3665F3] bg-blue-50/50 shadow-sm ring-2 ring-[#3665F3]/30'
                            : 'border-[#E5E5E5] hover:border-gray-400 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: f.hex }}
                          />
                          {active && <CheckCircle2 className="h-4 w-4 text-[#3665F3]" />}
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-bold text-[#191919]">{f.label}</div>
                          <div className="text-[10px] text-[#707070]">{f.code}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* National Address Delivery Input (Saudi Standard) */}
              <div className="space-y-4 pt-4 border-t border-[#E5E5E5]">
                <h3 className="text-sm font-bold text-[#191919]">
                  {isArabic ? 'عنوان التوصيل (العنوان الوطني السعودي)' : 'Delivery Address (Saudi National Address)'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#707070] mb-1">Building Number (4 digits)</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="1234"
                      value={buildingNumber}
                      onChange={(e) => setBuildingNumber(e.target.value)}
                      className="w-full rounded-xl border border-[#E5E5E5] px-3.5 py-2.5 text-sm focus:border-[#3665F3] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#707070] mb-1">Postal Code (5 digits)</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="12345"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full rounded-xl border border-[#E5E5E5] px-3.5 py-2.5 text-sm focus:border-[#3665F3] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#707070] mb-1">Street Name</label>
                  <input
                    type="text"
                    required
                    placeholder="King Abdulaziz Branch Rd"
                    value={streetName}
                    onChange={(e) => setStreetName(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E5E5] px-3.5 py-2.5 text-sm focus:border-[#3665F3] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#707070] mb-1">District</label>
                    <input
                      type="text"
                      required
                      placeholder="Al-Shati / Al-Malqa"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full rounded-xl border border-[#E5E5E5] px-3.5 py-2.5 text-sm focus:border-[#3665F3] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#707070] mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Jeddah"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-[#E5E5E5] px-3.5 py-2.5 text-sm focus:border-[#3665F3] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-full bg-[#3665F3] hover:bg-[#2B54CF] text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {submitting
                    ? isArabic
                      ? 'جاري تأكيد الطلب...'
                      : 'Processing Order...'
                    : isArabic
                    ? 'طلب صندوق العينات الآن — 150.00 ر.س (مستردة بالكامل)'
                    : 'Order Sample Box Now — 150.00 SAR (100% Refundable)'}
                </span>
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
