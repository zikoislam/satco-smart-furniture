'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { KeyRound, Loader2, Phone, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';

  const [mode, setMode] = useState<'customer' | 'staff'>('customer');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch('/api/v1/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? 'Failed to send OTP');
      } else {
        setOtpSent(true);
        setInfo(
          isArabic
            ? `تم إرسال رمز التحقق إلى ${json.data.phoneNumber}`
            : `OTP sent to ${json.data.phoneNumber} (expires in ${json.data.expiresInSeconds}s)`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const sessionId = localStorage.getItem('satco_session_id');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionId) headers['X-Session-ID'] = sessionId;

      const res = await fetch('/api/v1/auth/otp/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phoneNumber,
          otpCode,
          ...(fullName.trim() ? { fullName: fullName.trim() } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? 'OTP verification failed');
      } else {
        localStorage.setItem('satco_access_token', json.data.accessToken);
        localStorage.setItem('satco_user', JSON.stringify(json.data.user));
        router.push(`/${locale}/dashboard`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? 'Staff login failed');
      } else {
        localStorage.setItem('satco_access_token', json.data.accessToken);
        localStorage.setItem('satco_user', JSON.stringify(json.data.user));
        router.push(`/${locale}/admin`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">
            {isArabic ? 'تسجيل الدخول — ساتكو' : 'SATCO Sign In'}
          </h1>
          <Link href={`/${locale}`} className="text-xs font-medium text-stone-500 hover:text-stone-900">
            {isArabic ? 'الرئيسية' : 'Home'}
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('customer');
              setError(null);
            }}
            className={`rounded-lg py-2 transition ${
              mode === 'customer' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
            }`}
          >
            {isArabic ? 'العملاء (OTP)' : 'Customer (OTP)'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('staff');
              setError(null);
            }}
            className={`rounded-lg py-2 transition ${
              mode === 'staff' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
            }`}
          >
            {isArabic ? 'الموظفون والإدارة' : 'Staff / Admin'}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
            {info}
          </div>
        )}

        {mode === 'customer' ? (
          !otpSent ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  {isArabic ? 'رقم الجوال السعودي' : 'Saudi Mobile Number'}
                </label>
                <div className="relative">
                  <Phone className="absolute start-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="tel"
                    required
                    placeholder="0501234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 py-2 pe-3 ps-9 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isArabic ? 'إرسال رمز التحقق' : 'Send 4-Digit OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  {isArabic ? 'رمز التحقق (4 أرقام)' : '4-Digit OTP Code'}
                </label>
                <div className="relative">
                  <KeyRound className="absolute start-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="1234"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 py-2 pe-3 ps-9 text-sm tracking-widest"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  {isArabic ? 'الاسم الكامل (اختياري)' : 'Full Name (Optional for new customers)'}
                </label>
                <input
                  type="text"
                  placeholder="Faisal Al-Otaibi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isArabic ? 'تأكيد الدخول' : 'Verify & Sign In'}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-700">
                {isArabic ? 'البريد الإلكتروني' : 'Staff Email'}
              </label>
              <input
                type="email"
                required
                placeholder="admin@satco.sa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-700">
                {isArabic ? 'كلمة المرور' : 'Password'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              {isArabic ? 'دخول الإدارة' : 'Staff Sign In'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
