'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function PaymentReturnPage() {
  const locale = useLocale();
  const params = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') ?? 'paid';
  const isSuccess = status === 'paid' || status === 'captured';

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        {isSuccess ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        ) : (
          <XCircle className="mx-auto h-12 w-12 text-red-600" />
        )}
        <h1 className="mt-4 text-xl font-bold text-stone-900">
          {isSuccess ? 'Payment Received — Moyasar Verified' : 'Payment Failed or Cancelled'}
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          {isSuccess
            ? 'Your milestone payment has been recorded. Manufacturing CNC scheduling updates automatically.'
            : 'Please retry your milestone payment from your order dashboard.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={`/${locale}/dashboard/orders/${params?.orderId}`}
            className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
          >
            Track Order
          </Link>
          <Link
            href={`/${locale}/dashboard`}
            className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-800"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
