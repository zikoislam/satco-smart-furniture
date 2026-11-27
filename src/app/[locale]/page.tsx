import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage() {
  const locale = useLocale();
  const tBrand = useTranslations('Brand');
  const tNav = useTranslations('Nav');
  const tHero = useTranslations('Hero');
  const tCommon = useTranslations('Common');

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-6 py-8">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-center justify-between border-b border-stone-200 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full">
              KSA 2030
            </span>
            <h1 className="text-2xl font-black tracking-tight text-stone-900">
              {tBrand('name')}
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">{tBrand('tagline')}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-stone-700">
          <Link href={`/${locale}`} className="hover:text-stone-900">
            {tNav('home')}
          </Link>
          <Link href={`/${locale}/ai-studio`} className="text-indigo-600 hover:text-indigo-800">
            {locale === 'ar' ? 'استوديو الذكاء الاصطناعي ✨' : 'AI Design Studio ✨'}
          </Link>
          <Link href={`/${locale}/configurator`} className="hover:text-stone-900">
            {tNav('configurator')}
          </Link>
          <Link href={`/${locale}/sample-box`} className="hover:text-stone-900">
            {tNav('sampleBox')}
          </Link>
          <Link href={`/${locale}/cart`} className="hover:text-stone-900">
            {locale === 'ar' ? 'السلة' : 'Cart'}
          </Link>
          <Link href={`/${locale}/dashboard`} className="hover:text-stone-900">
            {tNav('orders')}
          </Link>
          <Link href={`/${locale}/admin`} className="text-slate-600 hover:text-slate-900">
            {locale === 'ar' ? 'لوحة التحكم' : 'ERP Portal'}
          </Link>
          <div className="flex gap-1 border-s ps-3 ms-2 border-stone-300">
            <Link href="/ar" className="rounded px-2 py-1 text-xs hover:bg-stone-200">
              العربية
            </Link>
            <Link href="/en" className="rounded px-2 py-1 text-xs hover:bg-stone-200">
              EN
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="my-auto py-12 md:py-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold text-amber-900 mb-6">
          <span>🇸🇦</span>
          <span>{tCommon('vatIncluded')} · ZATCA Phase 2 E-Invoicing</span>
        </div>
        <h2 className="max-w-4xl text-4xl md:text-6xl font-black leading-tight text-stone-900">
          {tHero('title')}
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-stone-600 leading-relaxed">
          {tHero('subtitle')}
        </p>

        {/* Feature CTA Grid */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={`/${locale}/ai-studio`}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:opacity-95"
          >
            {locale === 'ar' ? 'جرّب استوديو التصميم الذكي AI' : 'Launch AI Design Studio'}
          </Link>
          <Link
            href={`/${locale}/configurator`}
            className="rounded-xl bg-stone-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-stone-800"
          >
            {tHero('ctaPrimary')}
          </Link>
          <Link
            href={`/${locale}/sample-box`}
            className="rounded-xl border border-stone-300 bg-white px-6 py-3.5 text-sm font-semibold text-stone-800 hover:bg-stone-100"
          >
            {tNav('sampleBox')}
          </Link>
        </div>

        {/* 4 Pillars Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-stone-200/80">
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/60">
            <div className="text-2xl mb-1">📐</div>
            <h4 className="font-bold text-sm text-stone-900">تصميم وتصنيع بالمليمتر</h4>
            <p className="text-xs text-stone-500 mt-1">توليد تلقائي لكود ماكينات Homag CNC وBOM دقيق</p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/60">
            <div className="text-2xl mb-1">🤖</div>
            <h4 className="font-bold text-sm text-stone-900">ذكاء اصطناعي تفاعلي</h4>
            <p className="text-xs text-stone-500 mt-1">تصميم الغرف والمفروشات مع التحقق الإلزامي من المقاسات</p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/60">
            <div className="text-2xl mb-1">📱</div>
            <h4 className="font-bold text-sm text-stone-900">واقع معزز 1:1 AR</h4>
            <p className="text-xs text-stone-500 mt-1">معاينة القطع داخل منزلك بالحجم الحقيقي قبل الشراء</p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/60">
            <div className="text-2xl mb-1">🛡️</div>
            <h4 className="font-bold text-sm text-stone-900">دفعات مجدولة وضمان</h4>
            <p className="text-xs text-stone-500 mt-1">دفع ٥٠٪-٤٠٪-١٠٪ مع فواتير زكاة وضمان رقمي معتمد</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 pt-6 text-xs text-stone-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          SATCO Smart Furniture Platform · Riyadh, Kingdom of Saudi Arabia ({tCommon('currency')})
        </div>
        <div className="flex gap-4">
          <Link href={`/${locale}/admin`} className="hover:underline">
            {locale === 'ar' ? 'بوابة المصنع والموظفين' : 'Factory & Staff Portal'}
          </Link>
          <Link href={`/${locale}/dashboard`} className="hover:underline">
            {locale === 'ar' ? 'بوابة العملاء' : 'Customer Portal'}
          </Link>
        </div>
      </footer>
    </main>
  );
}
