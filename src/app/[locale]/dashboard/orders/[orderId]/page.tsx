'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { FileText, ShieldCheck } from 'lucide-react';
import { OrderTimeline, type TimelineEntry } from '@/components/orders/OrderTimeline';

interface OrderDetailData {
  id: string;
  orderNumber: string;
  status: string;
  warrantyYears: number;
  warrantyExpiresAt?: string | null;
  grandTotalSar: string;
  paidAmountSar: string;
  dueAmountSar: string;
  timeline: TimelineEntry[];
  milestones: Array<{
    milestone: string;
    percentage: number;
    amountSar: string;
    status: string;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    invoiceType: string;
    status: string;
    totalWithVatSar: string;
  }>;
}

export default function OrderDetailPage() {
  const locale = useLocale();
  const params = useParams<{ orderId: string }>();
  const t = useTranslations('Dashboard');
  const tCommon = useTranslations('Common');

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('satco_access_token');
    if (!token || !params?.orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/v1/orders/${params.orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data) setOrder(json.data);
      })
      .finally(() => setLoading(false));
  }, [params?.orderId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 text-center text-sm text-stone-500">
        Loading order details...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 text-center">
        <p className="text-sm text-stone-600">Order not found or authentication required.</p>
        <Link
          href={`/${locale}/dashboard`}
          className="mt-4 inline-block text-sm font-semibold text-stone-900 underline"
        >
          Back to Dashboard
        </Link>
      </main>
    );
  }

  const currency = tCommon('currency');

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <Link
            href={`/${locale}/dashboard`}
            className="text-xs font-medium text-stone-500 hover:text-stone-900"
          >
            ← {t('title')}
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-stone-900">{order.orderNumber}</h1>
        </div>
        <span className="rounded-full bg-amber-100 px-4 py-1 text-xs font-bold text-amber-900">
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-7">
          <h2 className="text-base font-bold text-stone-900">{t('timeline')}</h2>
          <OrderTimeline
            currentStatus={order.status}
            timeline={order.timeline}
            locale={locale}
          />
        </section>

        <aside className="space-y-6 lg:col-span-5">
          {/* Financial Summary & Milestones */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Grand Total</span>
              <span className="font-bold text-stone-900">
                {order.grandTotalSar} {currency}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-stone-600">Paid</span>
              <span className="font-semibold text-emerald-700">
                {order.paidAmountSar} {currency}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-stone-600">Remaining Due</span>
              <span className="font-semibold text-amber-700">
                {order.dueAmountSar} {currency}
              </span>
            </div>

            <div className="mt-4 space-y-2 border-t border-stone-100 pt-3 text-xs">
              {order.milestones.map((m) => (
                <div key={m.milestone} className="flex items-center justify-between">
                  <span className="text-stone-700">
                    {m.milestone} ({m.percentage}%)
                  </span>
                  <span className="font-semibold">
                    {m.amountSar} {currency} · {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ZATCA e-Invoices */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-stone-900">{t('invoices')}</h3>
            {order.invoices.length === 0 ? (
              <p className="mt-2 text-xs text-stone-500">No invoices issued yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {order.invoices.map((inv) => (
                  <a
                    key={inv.id}
                    href={`/api/v1/invoices/${inv.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-stone-200 px-3 py-2.5 text-xs hover:bg-stone-50"
                  >
                    <span className="flex items-center gap-2 font-semibold text-stone-800">
                      <FileText className="h-4 w-4 text-stone-500" />
                      {inv.invoiceNumber}
                    </span>
                    <span className="font-medium text-stone-600">
                      {inv.totalWithVatSar} {currency} · {t('downloadPdf')}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Warranty Card */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
            <div className="flex items-center gap-2.5 text-emerald-900">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-sm font-bold">{t('warrantyCard')}</h3>
            </div>
            <p className="mt-2 text-xs text-emerald-800">
              {order.warrantyYears}-Year SATCO Structural & Blum Hardware Warranty
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              {order.warrantyExpiresAt
                ? `Valid until ${new Date(order.warrantyExpiresAt).toLocaleDateString()}`
                : 'Activates upon final on-site handover signature'}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
