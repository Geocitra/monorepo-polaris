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
  Sparkles,
  BookOpen,
} from 'lucide-react';

export interface CleanEditorialShellProps {
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

export function CleanEditorialShell({
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
}: CleanEditorialShellProps) {
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
    { id: 'beranda', label: 'BERANDA', href: '/' },
    { id: 'profil', label: 'PROFIL', href: '/profil' },
    { id: 'artikel', label: 'ARTIKEL', href: '/artikel' },
    { id: 'infografis', label: 'INFOGRAFIS', href: '/infografis' },
    { id: 'kontak', label: 'KONTAK', href: '/kontak' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900 flex flex-col justify-between">
      {/* ─── 1. TOP NAVBAR (CLEAN EDITORIAL STUDIO STYLE) ─── */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative">
          
          {/* Left: Brand Monogram & Name */}
          <Link
            href={getNavLinkHref('/')}
            className="flex items-center gap-3.5 select-none shrink-0 group transition-opacity hover:opacity-90"
          >
            <div className="font-editorial-serif font-bold text-3xl sm:text-[2.35rem] text-slate-950 tracking-tighter leading-none group-hover:text-[#6366F1] transition-colors">
              {initial}\
            </div>
            <div className="leading-tight">
              <span className="font-sans font-bold text-xs sm:text-sm tracking-[0.18em] text-slate-950 uppercase block">
                {cleanName.toUpperCase()}
              </span>
              <span className="font-sans text-[9.5px] sm:text-[10.5px] tracking-[0.22em] text-slate-400 uppercase block font-medium mt-0.5">
                {member?.legislativeLevel ? `ANGGOTA ${formatLegislativeLevel(member.legislativeLevel)}` : 'WAKIL RAKYAT'}
              </span>
            </div>
          </Link>

          {/* Centered Navigation (5 Links with Purple Pill Indicator on Active) */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-10 text-xs lg:text-[13px] font-semibold tracking-[0.16em] uppercase md:absolute md:left-1/2 md:-translate-x-1/2">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={getNavLinkHref(item.href)}
                  className={`flex flex-col items-center transition-colors pb-1.5 ${
                    isActive
                      ? 'text-slate-950 font-bold'
                      : 'text-slate-500 hover:text-slate-950 font-medium'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-6 h-[2.5px] bg-[#6366F1] rounded-full mt-1.5" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Instagram Pill Button + Mobile Hamburger (NO SEARCH ICON) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-bold text-xs sm:text-[13px] shadow-sm hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none shrink-0"
              style={{
                background: 'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span className="truncate max-w-[90px] sm:max-w-none">@{instagramUsername}</span>
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-md text-slate-800 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 text-sm font-semibold tracking-wider uppercase">
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <Link
                    key={item.id}
                    href={getNavLinkHref(item.href)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-purple-50 text-slate-950 font-bold border-l-4 border-[#6366F1]'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
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
        <div className="border-b border-slate-200/80 bg-[#F8F9FD]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-4">
            
            {/* Breadcrumb Navigation (Clean without //) */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Link
                href={getNavLinkHref('/')}
                className="hover:text-slate-900 transition-colors font-semibold"
              >
                BERANDA
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#6366F1] font-bold uppercase tracking-wider">
                {breadcrumbTitle || activePage}
              </span>
            </div>

            {/* Title & Badge */}
            <div className="space-y-3">
              {pageBadge && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest bg-purple-100/70 text-[#6366F1] border border-purple-200">
                  <span>{pageBadge}</span>
                </div>
              )}
              {pageTitle && (
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-editorial-serif font-black text-slate-900 tracking-tight leading-tight">
                  {pageTitle}
                </h1>
              )}
              {pageSubtitle && (
                <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-3xl leading-relaxed font-normal">
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. MAIN CONTENT BODY ─── */}
      <main className="flex-1 bg-white relative z-10">{children}</main>

      {/* ─── 4. CLEAN EDITORIAL FOOTER & CTA BANNER ─── */}
      <footer className="border-t border-slate-200 bg-[#FAFAFC] text-slate-600 text-xs">
        {/* Banner Callout Let's Work Together */}
        <div className="border-b border-slate-200/80 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="p-8 sm:p-12 rounded-3xl bg-[#F8F9FD] border border-purple-100 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center lg:text-left">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#6366F1] font-bold block">
                  PARTISIPASI PUBLIK &amp; ASPIRASI
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-editorial-serif font-black text-slate-950">
                  Sampaikan Suara &amp; Gagasan Kebijakan Anda
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
                  Keterbukaan informasi dan dialog langsung bersama konstituen adalah komitmen utama kami dalam mengawal aspirasi daerah.
                </p>
              </div>

              <Link
                href={getNavLinkHref('/kontak')}
                className="px-8 py-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md shrink-0 inline-flex items-center gap-2 group"
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
              <div className="flex items-center gap-2.5">
                <div className="font-editorial-serif font-bold text-2xl text-slate-950 tracking-tighter leading-none">
                  {initial}\
                </div>
                <div>
                  <span className="font-editorial-serif font-black text-sm text-slate-950 block">
                    {officialFullName}
                  </span>
                  <span className="text-[10px] font-mono text-[#6366F1] uppercase tracking-wider block font-bold">
                    {member?.partyAffiliation || 'FRAKSI PARLEMEN'}
                  </span>
                </div>
              </div>
              <p className="text-slate-500 leading-relaxed max-w-sm text-xs">
                Portal komunikasi resmi transparansi kinerja legislasi, pengawasan anggaran, dan advokasi warga Daerah Pemilihan {member?.dapilName || 'Jawa Barat I'}.
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2 space-y-2">
              <span className="font-bold text-slate-900 block uppercase text-[11px] tracking-wider font-mono">
                MENU UTAMA
              </span>
              <ul className="space-y-1.5 text-slate-500 font-medium">
                <li><Link href={getNavLinkHref('/')} className="hover:text-[#6366F1] transition-colors">Beranda</Link></li>
                <li><Link href={getNavLinkHref('/profil')} className="hover:text-[#6366F1] transition-colors">Profil Dewan</Link></li>
                <li><Link href={getNavLinkHref('/artikel')} className="hover:text-[#6366F1] transition-colors">Katalog Artikel</Link></li>
                <li><Link href={getNavLinkHref('/infografis')} className="hover:text-[#6366F1] transition-colors">Infografis Capaian</Link></li>
                <li><Link href={getNavLinkHref('/kontak')} className="hover:text-[#6366F1] transition-colors">Kontak Resmi</Link></li>
              </ul>
            </div>

            {/* Penugasan */}
            <div className="md:col-span-3 space-y-2">
              <span className="font-bold text-slate-900 block uppercase text-[11px] tracking-wider font-mono">
                PENUGASAN PARLEMEN
              </span>
              <p className="text-slate-600 leading-relaxed font-medium">
                {member?.commissionName || 'Komisi IX DPR RI'}
              </p>
              <p className="text-slate-500 text-xs">
                Dapil {member?.dapilName || 'Jawa Barat I'}
              </p>
              <p className="text-slate-400 text-[11px] pt-1">
                Gedung Nusantara I DPR RI, Jl. Jenderal Gatot Subroto, Senayan, Jakarta Pusat.
              </p>
            </div>

            {/* Contact & Socials */}
            <div className="md:col-span-3 space-y-2">
              <span className="font-bold text-slate-900 block uppercase text-[11px] tracking-wider font-mono">
                KONTAK &amp; MEDIA SOSIAL
              </span>
              <p className="text-slate-500 text-xs">
                Email: aspirasi@{subdomain || 'dewan'}.polaris.id
              </p>
              <p className="text-slate-500 text-xs">
                Hotline WA: 0812-9876-5432
              </p>
              <div className="pt-2 flex items-center gap-3 text-slate-700 font-bold text-[11px] font-mono">
                <a
                  href={`https://instagram.com/${instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#6366F1] transition-colors"
                >
                  INSTAGRAM
                </a>
                <span>•</span>
                <span className="text-slate-400">TWITTER</span>
                <span>•</span>
                <span className="text-slate-400">LINKEDIN</span>
              </div>
            </div>

          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              &copy; {new Date().getFullYear()} {officialFullName}. Seluruh Hak Cipta Dilindungi.
            </div>
            <div>
              Didukung oleh POLARIS Legislative Intelligence OS.
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
