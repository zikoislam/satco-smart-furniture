'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { CheckCircle2, Package } from 'lucide-react';

const FINISH_OPTIONS = [
  { code: 'EGG-H1180-ST37', label: 'Halifax Oak Natural' },
  { code: 'EGG-W1000-PM', label: 'Premium Alpine White' },
  { code: 'EGG-U708-ST9', label: 'Light Grey Matte' },
  { code: 'EGG-U999-PM', label: 'Black Matte' },
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
  const [city, setCity] = useState('Riyadh');
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
    const token = localStorage.getItem('satco_access_token');
    if (!token) {
      setError(isArabic ? 'يرجى تسجيل الدخول أولاً.' : 'Please sign in via OTP first.');
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
        setError(json.message ?? 'Could not place sample box order');
      } else {
        setResult(json.data);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2.5">
          <Package className="h-6 w-6 text-amber-700" />
          <h1 className="text-2xl font-bold text-stone-900">
            {isArabic ? 'صندوق عينات الأخشاب (100 ر.س مستردة)' : 'Material Sample Box (100 SAR Refundable)'}
          </h1>
        </div>
        <Link href={`/${locale}`} className="text-sm font-medium text-stone-600 hover:text-stone-900">
          {isArabic ? 'الرئيسية' : 'Home'}
        </Link>
      </header>

      {result ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center gap-2 text-emerald-900">
            <CheckCircle2 className="h-6 w-6" />
            <h2 className="text-lg font-bold">Sample Box Ordered!</h2>
          </div>
          <p className="mt-2 text-sm text-emerald-800">Order ID: {result.sampleBoxOrderId}</p>
          <p className="mt-1 text-xs text-emerald-700">{result.creditPolicy}</p>
        </div>
      ) : (
        <form
          onSubmit={handleOrderSampleBox}
          className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <p className="rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-900">
            {isArabic
              ? 'تُخصم قيمة 100 ر.س تلقائياً من أول طلب أثاث تتجاوز قيمته 2,000 ر.س.'
              : '100.00 SAR fee is automatically credited toward your first furniture order exceeding 2,000 SAR.'}
          </p>

          <div>
            <h2 className="mb-2 text-sm font-bold text-stone-900">Select Egger Swatches</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {FINISH_OPTIONS.map((f) => {
                const active = selectedFinishes.includes(f.code);
                return (
                  <button
                    key={f.code}
                    type="button"
                    onClick={() => toggleFinish(f.code)}
                    className={`rounded-xl border p-3 text-start text-xs font-semibold transition ${
                      active
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-800'
                    }`}
                  >
                    {f.label} ({f.code})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              required
              maxLength={4}
              placeholder="Building Number (4 digits)"
              value={buildingNumber}
              onChange={(e) => setBuildingNumber(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              maxLength={5}
              placeholder="Postal Code (5 digits)"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <input
            type="text"
            required
            placeholder="Street Name"
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Order Sample Box — 100.00 SAR'}
          </button>
        </form>
      )}
    </main>
  );
}
