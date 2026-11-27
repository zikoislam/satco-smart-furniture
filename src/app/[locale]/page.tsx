'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import AiSoftwareNavbar from '@/components/navigation/AiSoftwareNavbar';

export default function HomePage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [searchCategory, setSearchCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // 4 Luxury Furniture Banner Images for 3-Second Auto-Slider
  const bannerImages = [
    {
      url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format&fit=crop&q=85',
      titleAr: 'خزائن ملابس نيوكلاسيكية وعصرية متكاملة',
      titleEn: 'Luxury Integrated Bespoke Wardrobes',
    },
    {
      url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&auto=format&fit=crop&q=85',
      titleAr: 'مطابخ ألمانية ذكية بسكك بلوم الهيدروليكية',
      titleEn: 'Smart German Kitchens with Blum Systems',
    },
    {
      url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&auto=format&fit=crop&q=85',
      titleAr: 'وحدات تلفزيون معلقة مع بديل الرخام وخشب إيجر',
      titleEn: 'Floating TV Units with Halifax Natural Oak',
    },
    {
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&auto=format&fit=crop&q=85',
      titleAr: 'ديكورات مجالس وغرف معيشة سعودية فاخرة',
      titleEn: 'Luxury Saudi Majlis & Living Room Concepts',
    },
  ];

  // Auto-rotate banner every 3 seconds (3000ms)
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  // Categories aligned with SATCO custom furniture
  const categories = [
    { id: 'wardrobes', nameAr: 'خزائن ملابس مخصصة', nameEn: 'Custom Wardrobes', icon: '🚪' },
    { id: 'kitchens', nameAr: 'مطابخ ألمانية وبلوم', nameEn: 'Kitchen Cabinets', icon: '🍳' },
    { id: 'tv_units', nameAr: 'طاولات ووحدات تلفزيون', nameEn: 'TV Entertainment', icon: '📺' },
    { id: 'majlis', nameAr: 'ديكورات مجالس نجدية', nameEn: 'Saudi Majlis Fit-outs', icon: '🛋️' },
    { id: 'sample_box', nameAr: 'صناديق عينات الخشب', nameEn: 'Material Sample Boxes', icon: '📦' },
    { id: 'ai_studio', nameAr: 'استوديو الذكاء الاصطناعي', nameEn: 'AI Design Studio', icon: '✨' },
    { id: 'hardware', nameAr: 'مفصلات وسكك Blum', nameEn: 'Blum Hardware', icon: '⚙️' },
  ];

  // Best selling products in eBay card format
  const featuredFurniture = [
    {
      id: 'w-01',
      titleAr: 'خزانة ملابس فاخرة ٤ أبواب سحاب مع مرآة ذكية وإضاءة داخلية',
      titleEn: '4-Door Sliding Wardrobe with Smart LED & Integrated Mirror',
      rating: '4.9',
      reviews: 142,
      priceSar: 4850,
      prevPriceSar: 5600,
      freeShipping: true,
      tag: 'BESTSELLER',
      imageUrl: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'k-02',
      titleAr: 'طقم خزائن مطبخ ألماني مع أرفف مقاومة للرطوبة وسكك بلوم ناعمة',
      titleEn: 'German Modular Kitchen Pantry with Blum Soft-Close Systems',
      rating: '4.8',
      reviews: 89,
      priceSar: 7900,
      prevPriceSar: 8950,
      freeShipping: true,
      tag: 'TOP RATED',
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 't-03',
      titleAr: 'وحدة تلفزيون جدارية بتصميم مينيمال مع بديل الرخام وخشب السنديان',
      titleEn: 'Floating Minimalist Wall TV Unit with Egger Halifax Natural Oak',
      rating: '4.9',
      reviews: 215,
      priceSar: 2850,
      prevPriceSar: 3200,
      freeShipping: true,
      tag: 'TRENDING',
      imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 's-04',
      titleAr: 'صندوق عينات خشب إيجر النمساوي (١٠ خامات + ألوان مع شحن مجاني)',
      titleEn: 'Egger Material Sample Box (10 Finishes + Rehau Edge-banding)',
      rating: '5.0',
      reviews: 630,
      priceSar: 150,
      prevPriceSar: 250,
      freeShipping: true,
      tag: 'REFUNDABLE',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#191919] font-sans">
      {/* 0. Top Enterprise AI Software Menu Bar & Live Status */}
      <AiSoftwareNavbar />

      {/* 1. eBay-Style Top Notification Bar */}
      <div className="bg-[#FFFFFF] border-b border-[#E5E5E5] text-[12px] text-[#707070] py-1.5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>
              {isAr ? 'مرحباً بك في منصة ساتكو للأثاث الذكي!' : 'Welcome to SATCO Smart Furniture!'}
            </span>
            <span className="hidden sm:inline text-[#E5E5E5]">|</span>
            <Link href={`/${locale}/login`} className="text-[#3665F3] hover:underline font-semibold">
              {isAr ? 'تسجيل الدخول / حساب جديد' : 'Sign in or register'}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline font-medium">🇸🇦 {isAr ? 'ضريبة القيمة المضافة ١٥٪ مشمولة' : '15% ZATCA VAT Included'}</span>
            <Link href={`/${locale}/admin`} className="hover:underline">
              {isAr ? 'بوابة الإدارة والمصنع' : 'Factory Portal'}
            </Link>
            <div className="flex gap-1 border-s ps-2 border-[#E5E5E5]">
              <Link href="/ar" className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${isAr ? 'bg-[#3665F3] text-white' : 'hover:bg-gray-100'}`}>
                العربية
              </Link>
              <Link href="/en" className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${!isAr ? 'bg-[#3665F3] text-white' : 'hover:bg-gray-100'}`}>
                EN
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. eBay-Style Clean White Header & Iconic Search Bar */}
      <header className="bg-[#FFFFFF] border-b border-[#E5E5E5] py-3.5 px-4 md:px-8 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo with eBay-style friendly clean typography */}
          <Link href={`/${locale}`} className="flex items-center gap-1.5 text-2xl font-black tracking-tight shrink-0">
            <span className="text-[#E53238]">S</span>
            <span className="text-[#3665F3]">A</span>
            <span className="text-[#F5AF02]">T</span>
            <span className="text-[#86B817]">C</span>
            <span className="text-[#3665F3]">O</span>
            <span className="text-[11px] bg-[#F2F2F2] px-2 py-0.5 rounded-full text-[#707070] font-bold ms-1">
              FURNITURE
            </span>
          </Link>

          {/* Large eBay Pill Search Bar */}
          <div className="flex-1 w-full max-w-3xl flex items-center">
            <div className="w-full flex items-center border-2 border-[#191919] rounded-full overflow-hidden hover:border-[#3665F3] focus-within:border-[#3665F3] transition bg-white shadow-xs">
              <span className="ps-4 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن أي خزانة، مطبخ، خامات Egger، أو تصميم...' : 'Search for any wardrobe, kitchen, materials, or custom piece...'}
                className="w-full py-2.5 px-3 text-sm focus:outline-none bg-transparent"
              />
              <div className="hidden sm:block border-s border-[#E5E5E5] px-2">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="text-xs text-[#707070] bg-transparent py-2 px-1 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">{isAr ? 'جميع الأقسام' : 'All Categories'}</option>
                  <option value="WARDROBES">{isAr ? 'خزائن' : 'Wardrobes'}</option>
                  <option value="KITCHENS">{isAr ? 'مطابخ' : 'Kitchens'}</option>
                  <option value="TV">{isAr ? 'وحدات تلفزيون' : 'TV Units'}</option>
                </select>
              </div>
              <button
                type="button"
                className="bg-[#3665F3] hover:bg-[#2B54CF] text-white px-7 py-3 text-sm font-bold transition flex items-center justify-center shrink-0"
              >
                {isAr ? 'بحث' : 'Search'}
              </button>
            </div>
          </div>

          {/* Quick Cart & Action Links */}
          <div className="flex items-center gap-5 text-sm font-semibold shrink-0">
            <Link href={`/${locale}/dashboard`} className="flex flex-col text-xs text-[#707070] hover:text-[#191919]">
              <span className="text-[11px] text-gray-400">{isAr ? 'متابعة' : 'Track'}</span>
              <span className="font-bold text-[#191919]">{isAr ? 'طلباتي' : 'My Orders'}</span>
            </Link>
            <Link
              href={`/${locale}/cart`}
              className="relative p-2.5 bg-[#F2F2F2] hover:bg-[#E5E5E5] rounded-full transition flex items-center justify-center text-lg"
            >
              🛒
              <span className="absolute -top-1 -right-1 bg-[#E53238] text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                1
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Category Strip - High-Tech Highlighted & Sticky On Scroll */}
      <nav className="bg-white/95 backdrop-blur-md border-b-2 border-[#3665F3]/30 px-4 md:px-8 py-2.5 overflow-x-auto sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-5 text-xs font-bold whitespace-nowrap text-[#333333]">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3665F3] text-white shadow-sm hover:bg-[#2B54CF] transition-all transform hover:scale-105"
          >
            <span>🏠</span>
            <span>{isAr ? 'الرئيسية' : 'Home'}</span>
          </Link>
          <Link
            href={`/${locale}/ai-studio`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 to-pink-500/10 text-[#E53238] border border-red-500/30 hover:bg-[#E53238] hover:text-white transition-all transform hover:scale-105 shadow-xs"
          >
            <span className="animate-pulse">✨</span>
            <span>{isAr ? 'استوديو الذكاء الاصطناعي (AI Studio)' : 'AI Room Designer'}</span>
          </Link>
          <Link
            href={`/${locale}/configurator`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-300 hover:bg-sky-600 hover:text-white transition-all transform hover:scale-105 shadow-xs"
          >
            <span>📦</span>
            <span>{isAr ? 'المصمم ثلاثي الأبعاد 3D' : '3D Customizer'}</span>
          </Link>
          <Link
            href={`/${locale}/sample-box`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-500 hover:text-white transition-all transform hover:scale-105 shadow-xs"
          >
            <span>🪵</span>
            <span>{isAr ? 'طلب صندوق العينات (١٥٠ ر.س)' : 'Sample Box Kit'}</span>
          </Link>
          <Link
            href={`/${locale}/configurator?cat=wardrobes`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 hover:bg-[#3665F3] hover:text-white transition-all transform hover:scale-105"
          >
            <span>🚪</span>
            <span>{isAr ? 'خزائن ملابس' : 'Wardrobes'}</span>
          </Link>
          <Link
            href={`/${locale}/configurator?cat=kitchens`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 hover:bg-[#3665F3] hover:text-white transition-all transform hover:scale-105"
          >
            <span>🍳</span>
            <span>{isAr ? 'مطابخ حديثة' : 'Kitchens'}</span>
          </Link>
          <Link
            href={`/${locale}/dispatch`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-400/50 hover:bg-emerald-600 hover:text-white transition-all transform hover:scale-105 shadow-xs"
          >
            <span className="animate-bounce">🚚</span>
            <span>{isAr ? 'مركز الشحن والترحيل الذكي' : 'AI Dispatch Center'}</span>
          </Link>
          <Link
            href={`/${locale}/admin`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white transition-all ms-auto"
          >
            <span>⚙️</span>
            <span>{isAr ? 'لوحة تحكم التصنيع' : 'ERP Factory'}</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">
        {/* 4. eBay-Style Hero Section + Hero-Matched Sample Box Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Full-Bleed Hero 3-Second Slider Card */}
          <div className="lg:col-span-8 bg-[#191919] rounded-2xl md:rounded-3xl border border-[#E5E5E5] overflow-hidden shadow-md relative min-h-[460px] md:min-h-[500px] flex items-center justify-center text-center">
            {/* Full-Cover Background Image Carousel (3-Second Auto-Rotation) */}
            <div className="absolute inset-0 z-0">
              {bannerImages.map((b, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    activeBannerIndex === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.url}
                    alt={b.titleEn}
                    className="w-full h-full object-cover object-center brightness-90"
                  />
                  {/* Dark Vignette Overlay for High Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35" />
                </div>
              ))}
            </div>

            {/* Centered Floating Text with Animated Shimmer Light */}
            <div className="relative z-10 px-4 md:px-8 py-8 max-w-2xl mx-auto space-y-3.5 text-white flex flex-col items-center">
              <div className="inline-flex items-center gap-2 bg-[#E53238] text-white px-3.5 py-1 rounded-full text-xs font-black shadow-lg animate-badge-flash">
                <span className="animate-spin text-sm">⚡</span>
                <span className="tracking-wide">
                  {isAr ? 'عروض التصنيع الرقمي المباشر بجدة' : 'Direct Digital CNC Fabrication in KSA (Jeddah)'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-2xl animate-text-shimmer">
                {isAr ? 'صمّم أثاثك بالمليمتر مع تسعير فوري' : 'Custom Precision Furniture Built to the Millimeter'}
              </h2>

              <p className="text-xs sm:text-sm text-slate-100 max-w-xl leading-relaxed drop-shadow-md font-medium">
                {isAr
                  ? 'خزائن ومطابخ مصنعة بماكينات Homag وخامات Egger مع معاينة 1:1 AR ودفع على ٣ مراحل.'
                  : 'Wardrobes & kitchens engineered with German CNC precision and Austrian Egger wood. Preview in 1:1 AR and pay in 3 milestone stages.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href={`/${locale}/configurator`}
                  className="bg-[#3665F3] hover:bg-[#2B54CF] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-black shadow-xl shadow-blue-500/40 transition transform hover:scale-105 border border-white/20"
                >
                  {isAr ? 'ابدأ التصميم ثلاثي الأبعاد 3D →' : 'Launch 3D Configurator →'}
                </Link>
                <Link
                  href={`/${locale}/ai-studio`}
                  className="bg-white/95 hover:bg-white text-[#191919] px-5 py-3 rounded-full text-xs sm:text-sm font-black transition transform hover:scale-105 shadow-xl flex items-center gap-1.5 border border-white"
                >
                  <span className="animate-bounce">✨</span>
                  <span>{isAr ? 'استوديو الذكاء الاصطناعي' : 'AI Room Designer'}</span>
                </Link>
              </div>
            </div>

            {/* Slider Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
              {bannerImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveBannerIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeBannerIndex === idx
                      ? 'w-6 bg-[#F5AF02] ring-2 ring-white/60'
                      : 'w-2 bg-white/50 hover:bg-white'
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Current Active Image Category Badge */}
            <div className="absolute bottom-4 end-5 z-20 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 hidden sm:block">
              {isAr ? bannerImages[activeBannerIndex]?.titleAr : bannerImages[activeBannerIndex]?.titleEn}
            </div>
          </div>

          {/* Right Highlight Side-Card: Material Sample Box Kit (Styling perfectly matched with Hero) */}
          <div className="lg:col-span-4 rounded-2xl md:rounded-3xl border border-[#E5E5E5] overflow-hidden shadow-md relative min-h-[460px] md:min-h-[500px] flex flex-col justify-between p-6 sm:p-7 text-white bg-[#121212]">
            {/* Full-Cover Background Image for Sample Box */}
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=85"
                alt="Material Sample Box Wood Swatches"
                className="w-full h-full object-cover object-center brightness-75 hover:scale-105 transition duration-700"
              />
              {/* Dark Gradient Overlay for Maximum Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/45" />
            </div>

            {/* Card Content Floating Over Background */}
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-[#E53238] text-white px-3 py-1 rounded-full text-[11px] font-black tracking-wider shadow-md animate-badge-flash">
                <span>🛡️</span>
                <span>{isAr ? 'ضمان استرداد ١٠٠٪' : '100% REFUNDABLE'}</span>
              </div>

              <h3 className="text-2xl font-black text-white drop-shadow-md animate-text-shimmer">
                {isAr ? 'صندوق عينات الخشب والمفصلات' : 'Material Sample Box Kit'}
              </h3>

              <p className="text-xs text-slate-100 leading-relaxed font-medium drop-shadow-sm">
                {isAr
                  ? 'اطلب عينات خشب إيجر ومفصلات بلوم لتفحص الجودة في منزلك. يسترد المبلغ كاملاً عند تعميد أول طلب أثاث!'
                  : 'Touch and feel premium Austrian Egger wood panels and Blum hardware before ordering. Fee 100% refunded on your first order!'}
              </p>

              {/* Price Display Matching Hero Bar */}
              <div className="pt-2 flex items-baseline gap-2.5 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/15 w-fit">
                <span className="text-2xl font-black text-amber-300">150 SAR</span>
                <span className="text-xs text-slate-300 line-through">250 SAR</span>
                <span className="text-xs font-black text-[#86B817] bg-[#86B817]/20 px-2 py-0.5 rounded-full">
                  {isAr ? 'خصم ٤٠٪' : '40% OFF'}
                </span>
              </div>
            </div>

            {/* Action Button Matching Hero Styling */}
            <div className="relative z-10 pt-4">
              <Link
                href={`/${locale}/sample-box`}
                className="w-full text-center block bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black py-3.5 px-6 rounded-full text-xs shadow-xl shadow-orange-500/30 transition transform hover:scale-[1.02] border border-amber-300"
              >
                {isAr ? 'اطلب صندوق العينات الآن (١٥٠ ر.س مستردة)' : 'Order Sample Box Kit (150 SAR Refundable)'}
              </Link>
            </div>
          </div>
        </div>

        {/* 5. Circular Category Quick Icons (Like eBay Visual Category browser) */}
        <section className="bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#191919] mb-4">
            {isAr ? 'تصفح حسب فئات الأثاث والمشاريع' : 'Explore Custom Furniture Categories'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/${locale}/configurator`}
                className="group flex flex-col items-center text-center p-3 rounded-xl hover:bg-[#F7F7F7] transition"
              >
                <div className="w-14 h-14 rounded-full bg-[#F2F2F2] group-hover:bg-[#E5E5E5] flex items-center justify-center text-2xl transition shadow-2xs">
                  {c.icon}
                </div>
                <span className="text-xs font-semibold text-[#191919] mt-2 group-hover:text-[#3665F3] transition">
                  {isAr ? c.nameAr : c.nameEn}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. eBay-Style Product Grid ("Today's Featured Custom Furniture") */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#191919]">
                {isAr ? 'القطع الأكثر طلباً للتفصيل والتصنيع' : 'Trending Bespoke Furniture Designs'}
              </h3>
              <p className="text-xs text-[#707070] mt-0.5">
                {isAr ? 'تصاميم جاهزة للتعديل حسب مقاسات غرفتك مع تسعير بالريال' : 'Fully customizable templates ready for your room dimensions'}
              </p>
            </div>
            <Link href={`/${locale}/configurator`} className="text-xs font-bold text-[#3665F3] hover:underline">
              {isAr ? 'مشاهدة الكل في المصمم ←' : 'See all designs →'}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredFurniture.map((item) => (
              <div
                key={item.id}
                className="bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] hover:border-[#CCCCCC] p-4 flex flex-col justify-between hover:shadow-md transition duration-200 group"
              >
                <div>
                  {/* Image Container with Badge */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#F2F2F2] mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 start-2 bg-white/95 backdrop-blur-xs text-[#191919] text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-semibold text-[#191919] line-clamp-2 leading-snug group-hover:text-[#3665F3] transition">
                    {isAr ? item.titleAr : item.titleEn}
                  </h4>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-2 text-xs">
                    <span className="text-[#F5AF02]">★</span>
                    <span className="font-bold text-[#191919]">{item.rating}</span>
                    <span className="text-[#707070] text-[11px]">({item.reviews})</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2F2F2] mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-[#191919]">
                      {item.priceSar.toLocaleString()} SAR
                    </span>
                    <span className="text-xs text-[#707070] line-through">
                      {item.prevPriceSar.toLocaleString()} SAR
                    </span>
                  </div>
                  <div className="text-[11px] text-[#86B817] font-semibold mt-0.5">
                    {isAr ? 'تركيب وشحن مجاني في جدة' : 'Free Delivery & Installation in Jeddah'}
                  </div>

                  <Link
                    href={`/${locale}/configurator`}
                    className="mt-3 block w-full text-center bg-[#F2F2F2] hover:bg-[#3665F3] hover:text-white text-[#191919] py-2 rounded-xl text-xs font-bold transition duration-150"
                  >
                    {isAr ? 'تعديل المقاسات ثلاثي الأبعاد' : 'Customize in 3D'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. eBay-Style 4 Value Proposition Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] p-6 shadow-xs text-xs">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏭</span>
            <div>
              <div className="font-bold text-[#191919]">{isAr ? 'تصنيع رقمي مباشر' : 'Direct Digital Factory'}</div>
              <p className="text-[#707070] mt-0.5">{isAr ? 'قص آلي Homag CNC بدون وسيط' : 'Homag CNC milling with zero middlemen'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <div className="font-bold text-[#191919]">{isAr ? 'ضمان ١٠ سنوات معتمد' : '10-Year Warranty'}</div>
              <p className="text-[#707070] mt-0.5">{isAr ? 'شهادة ضمان رقمية مسجلة' : 'Official digital warranty certificate'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <div className="font-bold text-[#191919]">{isAr ? 'دفعات مجدولة ٥٠-٤٠-١٠' : 'Milestone Payments'}</div>
              <p className="text-[#707070] mt-0.5">{isAr ? 'مدى، أبل باي، وفواتير زكاة' : 'Mada, Apple Pay & ZATCA e-Invoicing'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📱</span>
            <div>
              <div className="font-bold text-[#191919]">{isAr ? 'واقع معزز 1:1 AR' : '1:1 True Scale AR'}</div>
              <p className="text-[#707070] mt-0.5">{isAr ? 'معاينة في غرفتك قبل التصنيع' : 'Preview in your room before ordering'}</p>
            </div>
          </div>
        </div>
      </main>

      {/* 8. eBay-Style Full Breadth Clean Footer */}
      <footer className="bg-[#FFFFFF] border-t border-[#E5E5E5] mt-12 py-10 px-4 md:px-8 text-xs text-[#707070]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-[#191919] mb-3">{isAr ? 'منصة ساتكو' : 'About SATCO'}</h4>
            <ul className="space-y-2">
              <li><Link href={`/${locale}`} className="hover:underline">{isAr ? 'عن الشركة' : 'About Us'}</Link></li>
              <li><Link href={`/${locale}/admin`} className="hover:underline">{isAr ? 'المصنع بجدة' : 'Jeddah Factory'}</Link></li>
              <li><Link href={`/${locale}/ai-studio`} className="hover:underline">{isAr ? 'استوديو الذكاء الاصطناعي' : 'AI Studio'}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#191919] mb-3">{isAr ? 'خدمات العملاء' : 'Customer Service'}</h4>
            <ul className="space-y-2">
              <li><Link href={`/${locale}/dashboard`} className="hover:underline">{isAr ? 'متابعة مراحل الطلب' : 'Order Tracking'}</Link></li>
              <li><Link href={`/${locale}/sample-box`} className="hover:underline">{isAr ? 'طلب صندوق العينات' : 'Order Sample Box'}</Link></li>
              <li><Link href={`/${locale}/installer`} className="hover:underline">{isAr ? 'خدمات التركيب بالمنزل' : 'Installation Services'}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#191919] mb-3">{isAr ? 'الدفع والامتثال' : 'Payment & ZATCA'}</h4>
            <ul className="space-y-2">
              <li><span>{isAr ? 'فواتير هيئة الزكاة والضريبة (ZATCA)' : 'ZATCA e-Invoicing Phase 2'}</span></li>
              <li><span>{isAr ? 'مدى · فيزا · أبل باي · تابي · تمارا' : 'Mada, Apple Pay, Tabby, Tamara'}</span></li>
              <li><span>{isAr ? 'نظام الدفعات ٥٠٪ - ٤٠٪ - ١٠٪' : '50%-40%-10% Milestones'}</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#191919] mb-3">{isAr ? 'المساعدة والضمان' : 'Help & Warranty'}</h4>
            <ul className="space-y-2">
              <li><span>{isAr ? 'ضمان رسمي ١٠ سنوات' : '10-Year Warranty'}</span></li>
              <li><span>{isAr ? 'مطابقة الكود السعودي للمباني' : 'SBC Compliance'}</span></li>
              <li><span>{isAr ? 'حماية البيانات السعودية PDPL' : 'Saudi PDPL Privacy'}</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-[#E5E5E5] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            Copyright © 2026 SATCO Smart Furniture Platform. All Rights Reserved. (Jeddah, Kingdom of Saudi Arabia)
          </div>
          <div className="flex gap-4">
            <Link href="#" className="hover:underline">{isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}</Link>
            <Link href="#" className="hover:underline">{isAr ? 'سياسة الخصوصية' : 'Privacy Notice'}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
