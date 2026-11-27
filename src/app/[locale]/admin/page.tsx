'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ShieldAlert, Tag, Factory, DollarSign, MessageSquare } from 'lucide-react';

type AdminTab = 'aging' | 'fraud' | 'coupons' | 'production' | 'reviews';

export default function AdminDashboardPage() {
  const locale = useLocale();
  const [tab, setTab] = useState<AdminTab>('aging');
  const [aging, setAging] = useState<{
    totalOverdueSar: string;
    buckets: Record<string, { count: number; totalDueSar: string }>;
  } | null>(null);
  const [blacklist, setBlacklist] = useState<Array<{ id: string; phone: string; reason: string }>>([]);
  const [coupons, setCoupons] = useState<Array<{ id: string; code: string; discountValue: string }>>([]);
  const [prodJobs, setProdJobs] = useState<Array<{ id: string; jobNumber: string; currentStage: string; status: string }>>([]);
  const [reviews, setReviews] = useState<Array<{ id: string; rating: number; commentEn?: string; status: string }>>([]);

  const [phoneInput, setPhoneInput] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponValue, setCouponValue] = useState('10');
  const [notice, setNotice] = useState<string | null>(null);

  function authHeaders(): Record<string, string> {
    const token = localStorage.getItem('satco_access_token') ?? '';
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  }

  async function loadTab(activeTab: AdminTab) {
    const headers = authHeaders();
    if (activeTab === 'aging') {
      const res = await fetch('/api/v1/admin/due-manager/aging', { headers }).then((r) => r.json()).catch(() => null);
      if (res?.data) setAging(res.data);
    } else if (activeTab === 'fraud') {
      const res = await fetch('/api/v1/admin/fraud/blacklist', { headers }).then((r) => r.json()).catch(() => null);
      if (res?.data?.entries) setBlacklist(res.data.entries);
    } else if (activeTab === 'coupons') {
      const res = await fetch('/api/v1/admin/coupons', { headers }).then((r) => r.json()).catch(() => null);
      if (res?.data?.coupons) setCoupons(res.data.coupons);
    } else if (activeTab === 'production') {
      const res = await fetch('/api/v1/production/jobs', { headers }).then((r) => r.json()).catch(() => null);
      if (res?.data?.jobs) setProdJobs(res.data.jobs);
    } else if (activeTab === 'reviews') {
      const res = await fetch('/api/v1/reviews', { headers }).then((r) => r.json()).catch(() => null);
      if (res?.data?.reviews) setReviews(res.data.reviews);
    }
  }

  useEffect(() => {
    loadTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleBlacklistAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/v1/admin/fraud/blacklist', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ phone: phoneInput, reason: 'MANUAL_ADMIN_BLOCK' }),
    });
    const json = await res.json();
    setNotice(json.message ?? 'Updated blacklist');
    setPhoneInput('');
    loadTab('fraud');
  }

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date();
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const res = await fetch('/api/v1/admin/coupons', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        code: couponCode,
        discountType: 'PERCENTAGE',
        discountValue: couponValue,
        validFrom: now.toISOString(),
        validUntil: nextMonth.toISOString(),
      }),
    });
    const json = await res.json();
    setNotice(json.message ?? 'Coupon created');
    setCouponCode('');
    loadTab('coupons');
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-bold text-stone-900">SATCO Operations & Admin Console</h1>
        <nav className="flex gap-4 text-sm font-medium">
          <Link href={`/${locale}`} className="text-stone-600 hover:text-stone-900">Home</Link>
          <Link href={`/${locale}/login`} className="text-stone-600 hover:text-stone-900">Sign In</Link>
        </nav>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: 'aging', label: 'Due Manager', icon: DollarSign },
          { id: 'fraud', label: 'Fraud Shield', icon: ShieldAlert },
          { id: 'coupons', label: 'Coupons', icon: Tag },
          { id: 'production', label: 'Production & CNC', icon: Factory },
          { id: 'reviews', label: 'Reviews', icon: MessageSquare },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as AdminTab)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                tab === item.id
                  ? 'bg-stone-900 text-white'
                  : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {notice && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-900">
          {notice}
        </div>
      )}

      {tab === 'aging' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-stone-900">Accounts Receivable Aging Report</h2>
          {aging ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(aging.buckets).map(([name, val]) => (
                <div key={name} className="rounded-xl border border-stone-200 p-4">
                  <p className="text-xs font-semibold text-stone-500">{name}</p>
                  <p className="mt-1 text-xl font-bold text-stone-900">{val.totalDueSar} SAR</p>
                  <p className="text-xs text-stone-500">{val.count} milestones</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-stone-500">Sign in as SUPER_ADMIN or FACTORY_MANAGER to view aging data.</p>
          )}
        </div>
      )}

      {tab === 'fraud' && (
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleBlacklistAdd} className="flex flex-wrap gap-2">
            <input
              type="tel"
              required
              placeholder="0555999888"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white">
              Block Phone
            </button>
          </form>
          <div className="space-y-2 text-xs">
            {blacklist.map((b) => (
              <div key={b.id} className="flex justify-between rounded-lg border border-stone-100 p-2.5">
                <span className="font-semibold">{b.phone}</span>
                <span className="text-stone-500">{b.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'coupons' && (
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleCreateCoupon} className="flex flex-wrap gap-2">
            <input
              type="text"
              required
              placeholder="RIYADH2026"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              required
              min={1}
              max={50}
              value={couponValue}
              onChange={(e) => setCouponValue(e.target.value)}
              className="w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold text-white">
              Create Coupon (%)
            </button>
          </form>
          <div className="space-y-2 text-xs">
            {coupons.map((c) => (
              <div key={c.id} className="flex justify-between rounded-lg border border-stone-100 p-2.5">
                <span className="font-bold">{c.code}</span>
                <span>{c.discountValue}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'production' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-stone-900">Factory Production Jobs</h2>
          <div className="space-y-2 text-xs">
            {prodJobs.length === 0 ? (
              <p className="text-stone-500">No production jobs loaded.</p>
            ) : (
              prodJobs.map((j) => (
                <div key={j.id} className="flex justify-between rounded-lg border border-stone-100 p-3">
                  <span className="font-bold">{j.jobNumber}</span>
                  <span>{j.currentStage} · {j.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-stone-900">Approved Customer Reviews</h2>
          <div className="space-y-2 text-xs">
            {reviews.length === 0 ? (
              <p className="text-stone-500">No approved reviews yet.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-stone-100 p-3">
                  <span className="font-bold">{r.rating} / 5</span> — {r.commentEn ?? 'Verified Buyer'}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </main>
  );
}
