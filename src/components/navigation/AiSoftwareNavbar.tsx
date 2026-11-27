'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Sparkles,
  Box,
  Truck,
  Layers,
  Settings,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Activity,
  Cpu,
  PackageCheck,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function AiSoftwareNavbar() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<'OPERATIONAL' | 'SYNCING'>('OPERATIONAL');

  // Check if link is active
  const isActive = (path: string) => {
    return pathname === `/${locale}${path}` || (path === '' && pathname === `/${locale}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A] text-slate-100 border-b border-slate-800 shadow-xl backdrop-blur-md bg-opacity-95">
      {/* 1. Top Enterprise AI Telemetry Bar */}
      <div className="bg-[#0B1120] border-b border-slate-800/80 px-4 py-1 text-[11px] font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              SATCO AI CORE v2.4
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-300">
              📍 {isAr ? 'مركز تصنيع جدة الذكي - المملكة العربية السعودية' : 'Jeddah Smart CNC Hub, KSA'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1 text-sky-400">
              <Cpu className="w-3 h-3" />
              <span>{isAr ? 'محرك التقطيع الآلي: فعال' : 'Homag Nesting Engine: Active'}</span>
            </span>
            <div className="flex items-center gap-1 border-s border-slate-800 ps-3">
              <Link
                href="/ar"
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  isAr ? 'bg-sky-600 text-white' : 'hover:text-white'
                }`}
              >
                العربية
              </Link>
              <Link
                href="/en"
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  !isAr ? 'bg-sky-600 text-white' : 'hover:text-white'
                }`}
              >
                EN
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main AI Software Menu Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center font-black text-sky-400 text-lg">
                  ⚡
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 font-black text-lg tracking-wider text-white">
                  <span>SATCO</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold tracking-normal">
                    AI OS
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 -mt-1 font-medium tracking-tight">
                  {isAr ? 'نظام التصنيع واللوجستيات الذكي' : 'Digital Fabrication & Dispatch OS'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href={`/${locale}`}
              className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                isActive('')
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>

            <Link
              href={`/${locale}/ai-studio`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive('/ai-studio')
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-300 border border-pink-500/30'
                  : 'text-slate-300 hover:text-pink-300 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>{isAr ? 'استوديو الذكاء الاصطناعي' : 'AI Studio'}</span>
            </Link>

            <Link
              href={`/${locale}/configurator`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive('/configurator')
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? 'المصمم ثلاثي الأبعاد 3D' : '3D Configurator'}</span>
            </Link>

            <Link
              href={`/${locale}/sample-box`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive('/sample-box')
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'صندوق العينات' : 'Sample Box'}</span>
            </Link>

            {/* AI Dispatch & Logistics - Highlighted Feature */}
            <Link
              href={`/${locale}/dispatch`}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                isActive('/dispatch')
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{isAr ? 'مركز الشحن والترحيل الذكي' : 'AI Dispatch Center'}</span>
              <span className="text-[9px] px-1 py-0.2 bg-emerald-950/40 text-emerald-300 rounded font-mono border border-emerald-400/30">
                LIVE
              </span>
            </Link>

            <Link
              href={`/${locale}/installer`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive('/installer')
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>{isAr ? 'بوابة الفني الميداني' : 'Field Technician'}</span>
            </Link>
          </nav>

          {/* User & Right Quick Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href={`/${locale}/dashboard`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{isAr ? 'طلباتي' : 'Orders'}</span>
            </Link>

            <Link
              href={`/${locale}/cart`}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-sky-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                1
              </span>
            </Link>

            <Link
              href={`/${locale}/admin`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition"
            >
              <Settings className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? 'إدارة المصنع' : 'Admin ERP'}</span>
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href={`/${locale}/dispatch`}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            >
              <Truck className="w-3 h-3" />
              <span>{isAr ? 'الشحن' : 'Dispatch'}</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B1120] border-b border-slate-800 px-4 pt-3 pb-5 space-y-2">
          <Link
            href={`/${locale}`}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {isAr ? 'الرئيسية' : 'Home'}
          </Link>
          <Link
            href={`/${locale}/dispatch`}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
          >
            <Truck className="w-4 h-4" />
            <span>{isAr ? 'مركز الشحن والترحيل الذكي (AI Dispatch)' : 'AI Dispatch Operations'}</span>
          </Link>
          <Link
            href={`/${locale}/ai-studio`}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-pink-400 hover:bg-slate-800"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? 'استوديو الذكاء الاصطناعي (AI Studio)' : 'AI Room Designer'}</span>
          </Link>
          <Link
            href={`/${locale}/configurator`}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-sky-400 hover:bg-slate-800"
          >
            <Box className="w-4 h-4" />
            <span>{isAr ? 'المصمم ثلاثي الأبعاد 3D' : '3D Wardrobe & Kitchens'}</span>
          </Link>
          <Link
            href={`/${locale}/sample-box`}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-amber-400 hover:bg-slate-800"
          >
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'طلب صندوق عينات الخشب' : 'Order Sample Box'}</span>
          </Link>
          <Link
            href={`/${locale}/dashboard`}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            <User className="w-4 h-4" />
            <span>{isAr ? 'لوحة تحكم طلباتي' : 'Customer Dashboard'}</span>
          </Link>
          <Link
            href={`/${locale}/admin`}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:bg-slate-800"
          >
            <Settings className="w-4 h-4" />
            <span>{isAr ? 'بوابة إدارة المصنع ERP' : 'Factory Admin ERP'}</span>
          </Link>
        </div>
      )}
    </header>
  );
}
