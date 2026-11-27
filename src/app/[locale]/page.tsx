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
      <header className="flex flex-col md:flex-row items-center justify-between border-b border-surface-border pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-brand-primary text-white font-black text-xs px-2.5 py-0.5 rounded-full shadow-md shadow-brand-500/20">
              KSA 2030
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {tBrand('name')}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">{tBrand('tagline')}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-300">
          <Link href={`/${locale}`} className="hover:text-brand-400 transition">
            {tNav('home')}
          </Link>
          <Link href={`/${locale}/ai-studio`} className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 transition">
            <span>✨</span>
            <span>{locale === 'ar' ? 'استوديو الذكاء الاصطناعي' : 'AI Design Studio'}</span>
          </Link>
          <Link href={`/${locale}/configurator`} className="hover:text-brand-400 transition">
            {tNav('configurator')}
          </Link>
          <Link href={`/${locale}/sample-box`} className="hover:text-brand-400 transition">
            {tNav('sampleBox')}
          </Link>
          <Link href={`/${locale}/cart`} className="hover:text-brand-400 transition">
            {locale === 'ar' ? 'السلة' : 'Cart'}
          </Link>
          <Link href={`/${locale}/dashboard`} className="hover:text-brand-400 transition">
            {tNav('orders')}
          </Link>
          <Link href={`/${locale}/admin`} className="text-slate-400 hover:text-white transition">
            {locale === 'ar' ? 'لوحة التحكم' : 'ERP Portal'}
          </Link>
          <div className="flex gap-1 border-s ps-3 ms-2 border-surface-border">
            <Link href="/ar" className="rounded px-2 py-1 text-xs hover:bg-surface-card transition">
              العربية
            </Link>
            <Link href="/en" className="rounded px-2 py-1 text-xs hover:bg-surface-card transition">
              EN
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="my-auto py-12 md:py-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-950/70 border border-brand-800/60 px-3.5 py-1 text-xs font-bold text-brand-300 mb-6">
          <span>🇸🇦</span>
          <span>{tCommon('vatIncluded')} · ZATCA Phase 2 E-Invoicing</span>
        </div>
        <h2 className="max-w-4xl text-4xl md:text-6xl font-black leading-tight text-white">
          {tHero('title')}
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-300 leading-relaxed">
          {tHero('subtitle')}
        </p>

        {/* Feature CTA Grid */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={`/${locale}/ai-studio`}
            className="rounded-xl bg-brand-gradient hover:opacity-90 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-600/30 transition transform hover:-translate-y-0.5"
          >
            {locale === 'ar' ? 'جرّب استوديو التصميم الذكي AI ✨' : 'Launch AI Design Studio ✨'}
          </Link>
          <Link
            href={`/${locale}/configurator`}
            className="rounded-xl bg-surface-card hover:bg-slate-700/80 border border-surface-border px-6 py-3.5 text-sm font-bold text-white transition"
          >
            {tHero('ctaPrimary')}
          </Link>
          <Link
            href={`/${locale}/sample-box`}
            className="rounded-xl border border-surface-border bg-surface-card/60 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-surface-card transition"
          >
            {tNav('sampleBox')}
          </Link>
        </div>

        {/* 4 Pillars Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-surface-border">
          <div className="p-5 bg-surface-card rounded-2xl border border-surface-border hover:border-brand-500/40 transition">
            <div className="text-3xl mb-2">📐</div>
            <h4 className="font-bold text-sm text-white">تصميم وتصنيع بالمليمتر</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">توليد تلقائي لكود ماكينات Homag CNC وBOM دقيق</p>
          </div>
          <div className="p-5 bg-surface-card rounded-2xl border border-surface-border hover:border-brand-500/40 transition">
            <div className="text-3xl mb-2">🤖</div>
            <h4 className="font-bold text-sm text-white">ذكاء اصطناعي تفاعلي</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">تصميم الغرف والمفروشات مع التحقق الإلزامي من المقاسات</p>
          </div>
          <div className="p-5 bg-surface-card rounded-2xl border border-surface-border hover:border-brand-500/40 transition">
            <div className="text-3xl mb-2">📱</div>
            <h4 className="font-bold text-sm text-white">واقع معزز 1:1 AR</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">معاينة القطع داخل منزلك بالحجم الحقيقي قبل الشراء</p>
          </div>
          <div className="p-5 bg-surface-card rounded-2xl border border-surface-border hover:border-brand-500/40 transition">
            <div className="text-3xl mb-2">🛡️</div>
            <h4 className="font-bold text-sm text-white">دفعات مجدولة وضمان</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">دفع ٥٠٪-٤٠٪-١٠٪ مع فواتير زكاة وضمان رقمي معتمد</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border pt-6 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          SATCO Smart Furniture Platform · Riyadh, Kingdom of Saudi Arabia ({tCommon('currency')})
        </div>
        <div className="flex gap-4">
          <Link href={`/${locale}/admin`} className="hover:text-brand-400 transition">
            {locale === 'ar' ? 'بوابة المصنع والموظفين' : 'Factory & Staff Portal'}
          </Link>
          <Link href={`/${locale}/dashboard`} className="hover:text-brand-400 transition">
            {locale === 'ar' ? 'بوابة العملاء' : 'Customer Portal'}
          </Link>
        </div>
      </footer>
    </main>
  );
}
