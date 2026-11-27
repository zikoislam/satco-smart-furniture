'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { CreditCard, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

interface CartItemView {
  id: string;
  templateSlug: string;
  titleAr: string;
  titleEn: string;
  configuredDimensions: { widthMm: number; heightMm: number; depthMm: number };
  quantity: number;
  unitPriceSar: string;
  totalPriceSar: string;
}

interface CartView {
  cartId: string;
  totalItems: number;
  netSubtotalSar: string;
  vatAmountSar: string;
  grandTotalSar: string;
  items: CartItemView[];
}

interface AddressOption {
  id: string;
  title: string;
  district: string;
  city: string;
}

export default function CartAndCheckoutPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [cart, setCart] = useState<CartView | null>(null);
  const [addresses, setAddresses] = useState<AddressOption[]>([]);
  const [addressId, setAddressId] = useState('');
  const [warrantyYears, setWarrantyYears] = useState<1 | 2>(2);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'MADA' | 'APPLE_PAY' | 'VISA_MASTERCARD'>('MADA');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<{
    orderId: string;
    orderNumber: string;
    depositRequiredSar: string;
    checkoutUrl?: string;
  } | null>(null);

  function getHeaders(): Record<string, string> {
    let sessionId = localStorage.getItem('satco_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('satco_session_id', sessionId);
    }
    const token = localStorage.getItem('satco_access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Session-ID': sessionId,
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async function loadData() {
    setLoading(true);
    const headers = getHeaders();
    const cartRes = await fetch('/api/v1/cart', { headers }).then((r) => r.json()).catch(() => null);
    if (cartRes?.data) setCart(cartRes.data);

    if (headers.Authorization) {
      const addrRes = await fetch('/api/v1/addresses', { headers }).then((r) => r.json()).catch(() => null);
      if (addrRes?.data?.addresses?.length) {
        setAddresses(addrRes.data.addresses);
        setAddressId(addrRes.data.addresses[0].id);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateQty(itemId: string, quantity: number) {
    if (quantity < 1) return;
    await fetch(`/api/v1/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ quantity }),
    });
    await loadData();
  }

  async function removeItem(itemId: string) {
    await fetch(`/api/v1/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    await loadData();
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!cart) return;

    const token = localStorage.getItem('satco_access_token');
    if (!token) {
      setError(isArabic ? 'يرجى تسجيل الدخول لإتمام الطلب.' : 'Please sign in via OTP to checkout.');
      return;
    }

    const res = await fetch('/api/v1/orders/checkout', {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        cartId: cart.cartId,
        addressId,
        warrantyYears,
        ...(couponCode.trim() ? { appliedCouponCode: couponCode.trim() } : {}),
        ...(notes.trim() ? { customerNotes: notes.trim() } : {}),
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.message ?? 'Checkout failed');
      return;
    }

    const orderId = json.data.orderId;
    const payRes = await fetch('/api/v1/payments/initialize', {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        orderId,
        milestone: 'MILESTONE_1_DEPOSIT',
        paymentMethod,
        callbackUrl: `${window.location.origin}/${locale}/orders/${orderId}/payment-return`,
      }),
    });
    const payJson = await payRes.json();

    setCheckoutResult({
      orderId,
      orderNumber: json.data.orderNumber,
      depositRequiredSar: json.data.depositRequiredSar,
      checkoutUrl: payJson?.data?.checkoutUrl,
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2.5">
          <ShoppingBag className="h-6 w-6 text-stone-800" />
          <h1 className="text-2xl font-bold text-stone-900">
            {isArabic ? 'سلة التسوق وإتمام الطلب' : 'Shopping Cart & Checkout'}
          </h1>
        </div>
        <nav className="flex gap-4 text-sm font-medium">
          <Link href={`/${locale}/configurator`} className="text-stone-600 hover:text-stone-900">
            {isArabic ? 'المصمم' : 'Configurator'}
          </Link>
          <Link href={`/${locale}/addresses`} className="text-stone-600 hover:text-stone-900">
            {isArabic ? 'العناوين' : 'Addresses'}
          </Link>
        </nav>
      </header>

      {checkoutResult ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-bold text-emerald-900">
            Order {checkoutResult.orderNumber} Created!
          </h2>
          <p className="mt-2 text-sm text-emerald-800">
            50% Commitment Deposit Required: <strong>{checkoutResult.depositRequiredSar} SAR</strong>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {checkoutResult.checkoutUrl && (
              <a
                href={checkoutResult.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
              >
                <CreditCard className="h-4 w-4" />
                Pay Deposit via Moyasar
              </a>
            )}
            <Link
              href={`/${locale}/dashboard/orders/${checkoutResult.orderId}`}
              className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800"
            >
              View Order Tracking
            </Link>
          </div>
        </div>
      ) : loading ? (
        <p className="text-sm text-stone-500">Loading cart...</p>
      ) : !cart || cart.items.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
          <p className="text-sm text-stone-600">
            {isArabic ? 'سلة التسوق فارغة.' : 'Your cart is empty.'}
          </p>
          <Link
            href={`/${locale}/configurator`}
            className="mt-4 inline-block rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            {isArabic ? 'ابدأ التصميم' : 'Design Custom Furniture'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <h3 className="font-bold text-stone-900">
                    {isArabic ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {item.configuredDimensions.widthMm} × {item.configuredDimensions.heightMm} ×{' '}
                    {item.configuredDimensions.depthMm} mm · {item.unitPriceSar} SAR/unit
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-stone-200">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-stone-100"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-stone-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="min-w-[85px] text-end text-sm font-bold">
                    {item.totalPriceSar} SAR
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCheckout}
            className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-5"
          >
            <h2 className="text-base font-bold text-stone-900">Checkout Summary</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Net Subtotal</span>
                <span>{cart.netSubtotalSar} SAR</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>ZATCA VAT (15%)</span>
                <span>{cart.vatAmountSar} SAR</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 font-bold text-stone-900">
                <span>Grand Total</span>
                <span>{cart.grandTotalSar} SAR</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-stone-700">
                Delivery Address
              </label>
              <select
                required
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                {addresses.length === 0 ? (
                  <option value="">No saved addresses — add one in Addresses</option>
                ) : (
                  addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} — {a.district}, {a.city}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">Warranty</label>
                <select
                  value={warrantyYears}
                  onChange={(e) => setWarrantyYears(Number(e.target.value) as 1 | 2)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                >
                  <option value={2}>2 Years (Standard)</option>
                  <option value={1}>1 Year</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-700">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as 'MADA' | 'APPLE_PAY' | 'VISA_MASTERCARD')
                  }
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                >
                  <option value="MADA">Mada</option>
                  <option value="APPLE_PAY">Apple Pay</option>
                  <option value="VISA_MASTERCARD">Visa / Mastercard</option>
                </select>
              </div>
            </div>

            <input
              type="text"
              placeholder="Coupon Code (Optional)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Installation site notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-stone-300 p-2.5 text-sm"
            />

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!addressId}
              className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
            >
              Place Binding Order & Pay 50% Deposit
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
