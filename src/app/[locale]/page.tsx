import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

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
            <h1 className="text-2xl font-black tracking-tight">
              {tBrand('name')}
            </h1>
          </div>
          <p className="text-xs text-theme-muted mt-1">{tBrand('tagline')}</p>
        </div>

        {/* Navigation & Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <Link href={`/${locale}`} className="hover:text-brand-primary transition">
              {tNav('home')}
            </Link>
            <Link href={`/${locale}/ai-studio`} className="text-brand-primary hover:opacity-85 font-bold flex items-center gap-1 transition">
              <span>✨</span>
              <span>{locale === 'ar' ? 'استوديو الذكاء الاصطناعي' : 'AI Design Studio'}</span>
            </Link>
            <Link href={`/${locale}/configurator`} className="hover:text-brand-primary transition">
              {tNav('configurator')}
            </Link>
            <Link href={`/${locale}/sample-box`} className="hover:text-brand-primary transition">
              {tNav('sampleBox')}
            </Link>
            <Link href={`/${locale}/cart`} className="hover:text-brand-primary transition">
              {locale === 'ar' ? 'السلة' : 'Cart'}
            </Link>
            <Link href={`/${locale}/dashboard`} className="hover:text-brand-primary transition">
              {tNav('orders')}
            </Link>
            <Link href={`/${locale}/admin`} className="text-theme-muted hover:text-brand-primary transition">
              {locale === 'ar' ? 'لوحة التحكم' : 'ERP Portal'}
            </Link>
          </nav>

          {/* Theme Color Switcher & Language Switcher */}
          <div className="flex items-center gap-2 border-s ps-3 border-surface-border">
            <ThemeSwitcher />
            <div className="flex gap-1 bg-surface-card p-1 rounded-xl border border-surface-border">
              <Link
                href="/ar"
                className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
                  locale === 'ar' ? 'bg-brand-primary text-white' : 'text-theme-muted hover:text-brand-primary'
                }`}
              >
                العربية
              </Link>
              <Link
                href="/en"
                className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
                  locale === 'en' ? 'bg-brand-primary text-white' : 'text-theme-muted hover:text-brand-primary'
                }`}
              >
                EN
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="my-auto py-12 md:py-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-surface-card border border-surface-border px-4 py-1.5 text-xs font-bold text-brand-primary mb-6 shadow-sm">
          <span>🇸🇦</span>
          <span>{tCommon('vatIncluded')} · ZATCA Phase 2 E-Invoicing</span>
        </div>
        <h2 className="max-w-4xl text-4xl md:text-6xl font-black leading-tight tracking-tight">
          {tHero('title')}
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-theme-muted leading-relaxed font-normal">
          {tHero('subtitle')}
        </p>

        {/* Feature CTA Grid */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={`/${locale}/ai-studio`}
            className="rounded-xl bg-brand-gradient hover:opacity-90 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-500/25 transition transform hover:-translate-y-0.5"
          >
            {locale === 'ar' ? 'جرّب استوديو التصميم الذكي AI ✨' : 'Launch AI Design Studio ✨'}
          </Link>
          <Link
            href={`/${locale}/configurator`}
            className="rounded-xl bg-surface-card hover:border-brand-primary border border-surface-border px-7 py-3.5 text-sm font-bold transition shadow-sm"
          >
            {tHero('ctaPrimary')}
          </Link>
          <Link
            href={`/${locale}/sample-box`}
            className="rounded-xl border border-surface-border bg-surface-card px-7 py-3.5 text-sm font-semibold text-theme-muted hover:text-brand-primary transition shadow-sm"
          >
            {tNav('sampleBox')}
          </Link>
        </div>

        {/* 4 Pillars Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-surface-border">
          <div className="p-6 bg-surface-card rounded-2xl border border-surface-border hover:border-brand-primary transition shadow-sm">
            <div className="text-3xl mb-3">📐</div>
            <h4 className="font-bold text-base">تصميم وتصنيع بالمليمتر</h4>
            <p className="text-xs text-theme-muted mt-1.5 leading-relaxed">توليد تلقائي لكود ماكينات Homag CNC وBOM دقيق</p>
          </div>
          <div className="p-6 bg-surface-card rounded-2xl border border-surface-border hover:border-brand-primary transition shadow-sm">
            <div className="text-3xl mb-3">🤖</div>
            <h4 className="font-bold text-base">ذكاء اصطناعي تفاعلي</h4>
            <p className="text-xs text-theme-muted mt-1.5 leading-relaxed">تصميم الغرف والمفروشات مع التحقق الإلزامي من المقاسات</p>
          </div>
          <div className="p-6 bg-surface-card rounded-2xl border border-surface-border hover:border-brand-primary transition shadow-sm">
            <div className="text-3xl mb-3">📱</div>
            <h4 className="font-bold text-base">واقع معزز 1:1 AR</h4>
            <p className="text-xs text-theme-muted mt-1.5 leading-relaxed">معاينة القطع داخل منزلك بالحجم الحقيقي قبل الشراء</p>
          </div>
          <div className="p-6 bg-surface-card rounded-2xl border border-surface-border hover:border-brand-primary transition shadow-sm">
            <div className="text-3xl mb-3">🛡️</div>
            <h4 className="font-bold text-base">دفعات مجدولة وضمان</h4>
            <p className="text-xs text-theme-muted mt-1.5 leading-relaxed">دفع ٥٠٪-٤٠٪-١٠٪ مع فواتير زكاة وضمان رقمي معتمد</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border pt-6 text-xs text-theme-muted flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          SATCO Smart Furniture Platform · Riyadh, Kingdom of Saudi Arabia ({tCommon('currency')})
        </div>
        <div className="flex gap-4">
          <Link href={`/${locale}/admin`} className="hover:text-brand-primary transition">
            {locale === 'ar' ? 'بوابة المصنع والموظفين' : 'Factory & Staff Portal'}
          </Link>
          <Link href={`/${locale}/dashboard`} className="hover:text-brand-primary transition">
            {locale === 'ar' ? 'بوابة العملاء' : 'Customer Portal'}
          </Link>
        </div>
      </footer>
    </main>
  );
}
