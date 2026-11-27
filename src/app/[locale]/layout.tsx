import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Cairo, Inter } from 'next/font/google';
import { routing } from '@/i18n/routing';
import '../globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SATCO AI Smart Furniture Platform | ساتكو للأثاث الذكي',
  description:
    'Parametric 3D Custom Furniture, Automated BOM/Nesting & ZATCA e-Invoicing in Riyadh, KSA',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'ar' | 'en')) {
    notFound();
  }

  const messages = await getMessages();
  const isArabic = locale === 'ar';

  return (
    <html
      lang={locale}
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${cairo.variable} ${inter.variable}`}
    >
      <body
        className={`min-h-screen bg-stone-50 text-stone-900 antialiased ${
          isArabic ? 'font-[family-name:var(--font-cairo)]' : 'font-[family-name:var(--font-inter)]'
        }`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
