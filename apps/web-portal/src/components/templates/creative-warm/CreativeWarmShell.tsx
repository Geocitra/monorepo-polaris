'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Instagram,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Sparkles,
} from 'lucide-react';

export interface CreativeWarmShellProps {
  member: any;
  theme?: any;
  subdomain?: string;
  activePage: 'beranda' | 'profil' | 'artikel' | 'infografis' | 'kontak';
  breadcrumbTitle?: string;
  pageBadge?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  children: React.ReactNode;
  showMasthead?: boolean;
}

export function CreativeWarmShell({
  member,
  theme,
  subdomain,
  activePage,
  breadcrumbTitle,
  pageBadge,
  pageTitle,
  pageSubtitle,
  children,
  showMasthead = true,
}: CreativeWarmShellProps) {
  const officialFullName = member?.fullName || theme?.officialFullName || 'Wakil Rakyat';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'ahmadfauzi';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');

  const getNavLinkHref = (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    if (previewTemplate) {
      base += `${base.includes('?') ? '&' : '?'}preview_template=${previewTemplate}`;
    }
    return base;
  };

  function formatLegislativeLevel(level?: string): string {
    if (!level) return 'DPR RI';
    const clean = level.replace(/_/g, ' ').toUpperCase();
    if (clean === 'DPR RI' || clean === 'DPD RI') return clean;
    if (clean.includes('PROVINSI')) return 'DPRD Provinsi';
    if (clean.includes('KAB') || clean.includes('KOTA')) return 'DPRD Kab/Kota';
    return clean;
  }

  function parseCleanIdentity(fullName?: string) {
    if (!fullName) {
      return { cleanName: 'Ahmad Fauzi', initial: 'A' };
    }
    let clean = fullName.split(',')[0].trim();
    while (/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i.test(clean)) {
      clean = clean.replace(/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i, '').trim();
    }
    const words = clean.split(/\s+/).filter(Boolean);
    const firstName = words[0] || 'Ahmad';
    const initial = firstName.charAt(0).toUpperCase();

    return {
      cleanName: clean || 'Ahmad Fauzi',
      initial: initial || 'A',
    };
  }

  const { cleanName, initial } = parseCleanIdentity(member?.fullName);

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '/' },
    { id: 'profil', label: 'Profil', href: '/profil' },
    { id: 'artikel', label: 'Artikel', href: '/artikel' },
    { id: 'infografis', label: 'Infografis', href: '/infografis' },
    { id: 'kontak', label: 'Kontak', href: '/kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-stone-800 font-sans selection:bg-amber-400 selection:text-stone-900 flex flex-col justify-between">
      {/* ─── 1. TOP NAVBAR (CREATIVE WARM FOREST STYLE) ─── */}
      <header className="border-b border-stone-200/80 bg-[#FBFBFA]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between relative">
          
          {/* Left: Brand Monogram & Name */}
          <Link
            href={getNavLinkHref('/')}
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-stone-900 font-black flex items-center justify-center text-xs sm:text-base shadow-md group-hover:scale-105 transition-transform shrink-0">
              {initial}
            </div>
            <div className="leading-tight">
              <span className="font-serif font-black text-sm sm:text-base lg:text-lg tracking-tight text-stone-900 block group-hover:text-amber-700 transition-colors">
                {cleanName}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-amber-700 font-bold uppercase block">
                {member?.legislativeLevel ? formatLegislativeLevel(member.legislativeLevel) : 'DPR RI'} • DAPIL {member?.dapilName || 'INDONESIA'}
              </span>
            </div>
          </Link>

          {/* Centered Navigation (5 Links with Amber Underline Indicator) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-sm font-semibold tracking-wide text-stone-600 md:absolute md:left-1/2 md:-translate-x-1/2">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={getNavLinkHref(item.href)}
                  className={`border-b-[2px] pb-1 transition-all ${
                    isActive
                      ? 'text-stone-900 font-bold border-amber-500'
                      : 'text-stone-600 hover:text-stone-900 border-transparent hover:border-amber-400'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Instagram Pill Button + Mobile Hamburger (NO SEARCH ICON) */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-bold text-[11px] sm:text-xs md:text-sm shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none shrink-0"
              style={{
                background: 'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span className="truncate max-w-[90px] xs:max-w-[120px] sm:max-w-none">@{instagramUsername}</span>
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-stone-700 hover:text-stone-950 hover:bg-stone-200/60 transition-colors cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-[#FBFBFA]/98 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 text-sm font-semibold">
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <Link
                    key={item.id}
                    href={getNavLinkHref(item.href)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-amber-100 text-stone-950 font-bold border-l-4 border-amber-500'
                        : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* ─── 2. SUBPAGE MASTHEAD BANNER (IF ENABLED) ─── */}
      {showMasthead && (
        <div className="border-b border-stone-200 bg-[#F3F3EF] relative overflow-hidden">
          {/* Subtle warm decorative background aura */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-300/20 blur-3xl pointer-events-none select-none"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10 space-y-4">
            {/* Breadcrumb Navigation (Clean without //) */}
            <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
              <Link
                href={getNavLinkHref('/')}
                className="hover:text-stone-900 transition-colors font-semibold"
              >
                BERANDA
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-amber-700 font-bold uppercase tracking-wider">
                {breadcrumbTitle || activePage}
              </span>
            </div>

            {/* Title & Badge */}
            <div className="space-y-3">
              {pageBadge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border-2 border-stone-800 text-stone-800 text-xs font-mono font-bold tracking-wider bg-white/70 backdrop-blur-xs">
                  <span>[ {pageBadge} ]</span>
                </div>
              )}
              {pageTitle && (
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-stone-900 tracking-tight leading-tight">
                  {pageTitle}
                </h1>
              )}
              {pageSubtitle && (
                <p className="text-xs sm:text-sm md:text-base text-stone-600 max-w-3xl leading-relaxed font-normal">
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. MAIN CONTENT BODY ─── */}
      <main className="flex-1 bg-[#FBFBFA] relative z-10">{children}</main>

      {/* ─── 4. CREATIVE WARM FOOTER & ASPIRASI CALLOUT ─── */}
      <footer className="border-t border-stone-200 bg-[#F3F3EF] text-stone-600 text-xs">
        {/* Forest Green Callout Banner */}
        <div className="bg-[#1A382B] text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center lg:text-left">
                <span className="text-xs font-mono uppercase text-amber-400 tracking-widest font-bold block">
                  — KANAL ASPIRASI &amp; LAYANAN KONSTITUEN
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-white">
                  Satu Suara Anda Berharga Bagi Kami
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
                  Kirimkan aspirasi perbaikan fasilitas, konsultasi program bantuan daerah, atau ajukan audiensi langsung ke kantor perwakilan dewan.
                </p>
              </div>

              <Link
                href={getNavLinkHref('/kontak')}
                className="px-7 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 shrink-0 inline-flex items-center gap-2 group"
              >
                <span>HUBUNGI SEKRETARIAT</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Brand Logo & Name */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-900 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                  {initial}
                </div>
                <div>
                  <span className="font-serif font-black text-base text-stone-900 block">
                    {officialFullName}
                  </span>
                  <span className="text-[10px] font-mono text-amber-700 uppercase tracking-wider block font-bold">
                    {member?.partyAffiliation || 'FRAKSI PARLEMEN'}
                  </span>
                </div>
              </div>
              <p className="text-stone-500 leading-relaxed max-w-sm text-xs">
                Portal komunikasi resmi transparansi kebijakan, rekam jejak pengabdian konstituen, dan akuntabilitas publik di Daerah Pemilihan {member?.dapilName || 'Jawa Barat I'}.
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2 space-y-2">
              <span className="font-bold text-stone-900 block uppercase text-[11px] tracking-wider font-mono">
                MENU UTAMA
              </span>
              <ul className="space-y-1.5 text-stone-600 font-medium">
                <li><Link href={getNavLinkHref('/')} className="hover:text-amber-700 transition-colors">Beranda</Link></li>
                <li><Link href={getNavLinkHref('/profil')} className="hover:text-amber-700 transition-colors">Profil Dewan</Link></li>
                <li><Link href={getNavLinkHref('/artikel')} className="hover:text-amber-700 transition-colors">Katalog Artikel</Link></li>
                <li><Link href={getNavLinkHref('/infografis')} className="hover:text-amber-700 transition-colors">Infografis Capaian</Link></li>
                <li><Link href={getNavLinkHref('/kontak')} className="hover:text-amber-700 transition-colors">Kontak Resmi</Link></li>
              </ul>
            </div>

            {/* Penugasan Parlemen */}
            <div className="md:col-span-3 space-y-2">
              <span className="font-bold text-stone-900 block uppercase text-[11px] tracking-wider font-mono">
                PENUGASAN PARLEMEN
              </span>
              <p className="text-stone-700 leading-relaxed font-medium">
                {member?.commissionName || 'Komisi DPR RI'}
              </p>
              <p className="text-stone-500 text-xs">
                Dapil {member?.dapilName || 'Jawa Barat I'}
              </p>
              <p className="text-stone-400 text-[11px] pt-1">
                Gedung Nusantara I DPR RI, Jl. Jenderal Gatot Subroto, Senayan, Jakarta Pusat.
              </p>
            </div>

            {/* Kontak & Media Sosial */}
            <div className="md:col-span-3 space-y-2">
              <span className="font-bold text-stone-900 block uppercase text-[11px] tracking-wider font-mono">
                KONTAK &amp; MEDIA SOSIAL
              </span>
              <p className="text-stone-600 text-xs">
                Email: aspirasi@{subdomain || 'dewan'}.polaris.id
              </p>
              <p className="text-stone-600 text-xs">
                WhatsApp: 0812-9876-5432
              </p>
              <div className="pt-2 flex items-center gap-3 text-stone-800 font-bold text-[11px] font-mono">
                <a
                  href={`https://instagram.com/${instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-700 transition-colors"
                >
                  INSTAGRAM
                </a>
                <span>•</span>
                <span className="text-stone-400">TWITTER</span>
                <span>•</span>
                <span className="text-stone-400">YOUTUBE</span>
              </div>
            </div>

          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-stone-300/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
            <div>
              &copy; {new Date().getFullYear()} {officialFullName}. Seluruh Hak Cipta Dilindungi.
            </div>
            <div>
              Didukung oleh POLARIS Parlemen Engine.
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
