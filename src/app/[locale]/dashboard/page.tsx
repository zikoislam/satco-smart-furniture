'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, PackageCheck, ShieldCheck } from 'lucide-react';

interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  warrantyYears: number;
  grandTotalSar: string;
  paidAmountSar: string;
  dueAmountSar: string;
  createdAt: string;
  itemsCount: number;
}

export default function CustomerDashboardPage() {
  const locale = useLocale();
  const t = useTranslations('Dashboard');
  const tNav = useTranslations('Nav');
  const tCommon = useTranslations('Common');

  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('satco_access_token');
    if (!token) {
      setAuthError(true);
      setLoading(false);
      return;
    }

    fetch('/api/v1/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          setAuthError(true);
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json?.data?.orders) {
          setOrders(json.data.orders);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-stone-500">{t('subtitle')}</p>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href={`/${locale}`} className="text-stone-600 hover:text-stone-900">
            {tNav('home')}
          </Link>
          <Link
            href={`/${locale}/configurator`}
            className="rounded-lg bg-stone-900 px-4 py-2 text-white hover:bg-stone-800"
          >
            {tNav('configurator')}
          </Link>
        </nav>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
          Loading orders...
        </div>
      ) : authError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-sm font-semibold text-amber-900">
            {locale === 'ar'
              ? 'يرجى تسجيل الدخول برقم الجوال عبر رمز التحقق (OTP) لعرض طلباتك.'
              : 'Please sign in with your Saudi mobile OTP to view your orders and invoices.'}
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
          <PackageCheck className="mx-auto h-10 w-10 text-stone-400" />
          <p className="mt-3 text-sm text-stone-600">{t('noOrders')}</p>
          <Link
            href={`/${locale}/configurator`}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
          >
            {tNav('configurator')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/${locale}/dashboard/orders/${order.id}`}
              className="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-400"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-stone-900">
                      {order.orderNumber}
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-900">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      {order.warrantyYears}-Year Warranty
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-end">
                    <p className="text-xs text-stone-500">Grand Total</p>
                    <p className="text-lg font-bold text-stone-900">
                      {order.grandTotalSar} {tCommon('currency')}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-stone-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
