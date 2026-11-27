'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { MapPin, Plus, Trash2 } from 'lucide-react';

interface AddressItem {
  id: string;
  title: string;
  buildingNumber: string;
  streetName: string;
  district: string;
  city: string;
  postalCode: string;
  additionalNumber?: string | null;
  isDefault: boolean;
}

export default function AddressesPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('Home');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('Jeddah');
  const [postalCode, setPostalCode] = useState('');
  const [additionalNumber, setAdditionalNumber] = useState('');
  const [isDefault, setIsDefault] = useState(true);

  async function fetchAddresses() {
    const token = localStorage.getItem('satco_access_token');
    if (!token) {
      setError(isArabic ? 'يرجى تسجيل الدخول أولاً.' : 'Please sign in to manage addresses.');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/v1/addresses', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok && json.data?.addresses) {
      setAddresses(json.data.addresses);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('satco_access_token');
    if (!token) return;

    const res = await fetch('/api/v1/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        buildingNumber,
        streetName,
        district,
        city,
        postalCode,
        ...(additionalNumber ? { additionalNumber } : {}),
        isDefault,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.message ?? 'Validation failed');
    } else {
      setBuildingNumber('');
      setStreetName('');
      setDistrict('');
      setPostalCode('');
      setAdditionalNumber('');
      await fetchAddresses();
    }
  }

  async function handleDelete(id: string) {
    const token = localStorage.getItem('satco_access_token');
    if (!token) return;

    await fetch(`/api/v1/addresses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchAddresses();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2.5">
          <MapPin className="h-6 w-6 text-stone-800" />
          <h1 className="text-2xl font-bold text-stone-900">
            {isArabic ? 'دفتر العناوين الوطنية السعودية' : 'Saudi National Address Book'}
          </h1>
        </div>
        <nav className="flex gap-4 text-sm font-medium">
          <Link href={`/${locale}/cart`} className="text-stone-600 hover:text-stone-900">
            {isArabic ? 'السلة' : 'Cart'}
          </Link>
          <Link href={`/${locale}/dashboard`} className="text-stone-600 hover:text-stone-900">
            {isArabic ? 'طلباتي' : 'Dashboard'}
          </Link>
        </nav>
      </header>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <form
          onSubmit={handleCreate}
          className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:col-span-5"
        >
          <h2 className="flex items-center gap-2 text-base font-bold text-stone-900">
            <Plus className="h-4 w-4" />
            {isArabic ? 'إضافة عنوان جديد' : 'Add New Address'}
          </h2>
          <input
            type="text"
            required
            placeholder="Title (Home / Villa)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              required
              maxLength={4}
              placeholder="Building (4 digits)"
              value={buildingNumber}
              onChange={(e) => setBuildingNumber(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              maxLength={5}
              placeholder="Postal Code (5)"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <input
            type="text"
            required
            placeholder="Street Name (e.g. King Fahd Road)"
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              required
              placeholder="District (Al Olaya)"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              required
              placeholder="City (Jeddah)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <input
            type="text"
            maxLength={4}
            placeholder="Additional No. (Optional 4 digits)"
            value={additionalNumber}
            onChange={(e) => setAdditionalNumber(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-xs text-stone-700">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            {isArabic ? 'تعيين كعنوان افتراضي' : 'Set as default delivery address'}
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
          >
            {isArabic ? 'حفظ العنوان' : 'Save Address'}
          </button>
        </form>

        <div className="space-y-3 md:col-span-7">
          {loading ? (
            <p className="text-sm text-stone-500">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
              {isArabic ? 'لا توجد عناوين محفوظة بعد.' : 'No saved addresses yet.'}
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-start justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{addr.title}</span>
                    {addr.isDefault && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-stone-600">
                    Bldg {addr.buildingNumber}, {addr.streetName}, {addr.district}, {addr.city}{' '}
                    {addr.postalCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(addr.id)}
                  className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
