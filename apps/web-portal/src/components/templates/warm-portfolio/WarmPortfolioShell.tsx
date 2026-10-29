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
} from 'lucide-react';

import { resolvePortalMemberData } from '@/lib/template-resolver';

export interface WarmPortfolioShellProps {
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

export function WarmPortfolioShell({
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
}: WarmPortfolioShellProps) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#F59E0B',
  });

  const {
    officialFullName,
    dapil,
    party,
    formattedPhoneNumber,
    officialEmail,
  } = resolved;

  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    '';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');
  const previewColor = searchParams?.get('preview_color');

  const getNavLinkHref = (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    const params = new URLSearchParams();
    if (previewTemplate) params.set('preview_template', previewTemplate);
    if (previewColor) params.set('preview_color', previewColor);
    const qs = params.toString();
    if (qs) {
      base += `${base.includes('?') ? '&' : '?'}${qs}`;
    }
    return base;
  };

  function parseCleanIdentity(fullName?: string) {
    if (!fullName) {
      return { cleanName: 'Ahmad Fauzi', firstName: 'Ahmad', lastName: 'Fauzi', initial: 'A' };
    }
    let clean = fullName.split(',')[0].trim();
    while (/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i.test(clean)) {
      clean = clean.replace(/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i, '').trim();
    }
    const words = clean.split(/\s+/).filter(Boolean);
    const firstName = words[0] || 'Ahmad';
    const lastName = words.length > 1 ? words.slice(1).join(' ') : 'Fauzi';
    const initial = firstName.charAt(0).toUpperCase();

    return {
      cleanName: clean || 'Ahmad Fauzi',
      firstName,
      lastName,
      initial: initial || 'A',
    };
  }

  const { cleanName, firstName, lastName, initial } = parseCleanIdentity(member?.fullName);

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '/' },
    { id: 'profil', label: 'Profil', href: '/profil' },
    { id: 'artikel', label: 'Artikel', href: '/artikel' },
    { id: 'infografis', label: 'Infografis', href: '/infografis' },
    { id: 'kontak', label: 'Kontak', href: '/kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 font-sans selection:bg-[#F59E0B] selection:text-stone-950 overflow-x-hidden">
      
      {/* ─── FLOATING DARK PILL NAVBAR ─── */}
      <div className="sticky top-4 z-50 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <header className="rounded-full bg-[#181311] text-white px-4 sm:px-6 py-2.5 sm:py-3 shadow-2xl border border-stone-800 flex items-center justify-between">
          
          {/* Brand */}
          <Link
            href={getNavLinkHref('/')}
            className="flex items-center gap-2.5 group select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-[#F59E0B] text-stone-950 font-black flex items-center justify-center text-xs shadow-md group-hover:scale-105 transition-transform">
              {initial}
            </div>
            <span className="font-serif font-black text-sm sm:text-base text-white tracking-tight group-hover:text-[#F59E0B] transition-colors">
              {firstName}.
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold tracking-wide text-stone-300">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={getNavLinkHref(item.href)}
                  className={`transition-colors ${
                    isActive
                      ? 'text-[#F59E0B] font-bold'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none"
              style={{
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Instagram</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="mt-2 p-4 rounded-3xl bg-[#181311] border border-stone-800 shadow-2xl flex flex-col gap-2 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={getNavLinkHref(item.href)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-[#F59E0B] text-stone-950 font-bold'
                      : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── MASTHEAD BANNER (IF ENABLED) ─── */}
      {showMasthead && (
        <section className="pt-10 pb-8 px-4 sm:px-6 max-w-5xl mx-auto">
          {/* Breadcrumbs (clean, no slashes //) */}
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-4">
            <Link href={getNavLinkHref('/')} className="hover:text-stone-900 transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-800 font-bold">{breadcrumbTitle || activePage}</span>
          </div>

          {/* Section badge + Title */}
          <div className="flex flex-col gap-3">
            {pageBadge && (
              <div className="inline-flex items-center w-fit px-3.5 py-1.5 rounded-full bg-white text-stone-800 text-xs font-bold border border-stone-200 shadow-sm">
                <span>{pageBadge}</span>
              </div>
            )}
            {pageTitle && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-stone-950 tracking-tight leading-tight">
                {pageTitle}{' '}
                <span className="text-[#F59E0B] font-sans inline-block">✦</span>
              </h1>
            )}
            {pageSubtitle && (
              <p className="text-stone-600 text-sm sm:text-base max-w-3xl leading-relaxed">
                {pageSubtitle}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ─── PAGE BODY CONTENT ─── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        {children}
      </main>

      {/* ─── DARK ESPRESSO FOOTER (MATCHING WARM PORTFOLIO) ─── */}
      <footer className="bg-[#181311] text-stone-300 pt-16 pb-12 border-t border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone-800">
            {/* Identity & Quote */}
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F59E0B] text-stone-950 font-black flex items-center justify-center text-sm shadow">
                  {initial}
                </div>
                <span className="font-serif font-black text-xl text-white">
                  {officialFullName}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 max-w-md leading-relaxed font-light">
                &ldquo;Dedikasi mengawal amanah konstituen dengan transparansi, ketulusan bekerja, dan karya nyata untuk kemajuan daerah.&rdquo;
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F59E0B]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Portal Resmi Dewan Parlemen Indonesia</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold tracking-wider uppercase text-stone-400">
                Navigasi Cepat
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link href={getNavLinkHref('/')} className="hover:text-[#F59E0B] transition-colors">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link href={getNavLinkHref('/profil')} className="hover:text-[#F59E0B] transition-colors">
                    Profil & Rekam Jejak
                  </Link>
                </li>
                <li>
                  <Link href={getNavLinkHref('/artikel')} className="hover:text-[#F59E0B] transition-colors">
                    Gagasan & Artikel Kebijakan
                  </Link>
                </li>
                <li>
                  <Link href={getNavLinkHref('/infografis')} className="hover:text-[#F59E0B] transition-colors">
                    Visualisasi Data & Infografis
                  </Link>
                </li>
                <li>
                  <Link href={getNavLinkHref('/kontak')} className="hover:text-[#F59E0B] transition-colors">
                    Saluran Aspirasi & Kontak
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Direct */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold tracking-wider uppercase text-stone-400">
                Pusat Kontak
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Kantor Fraksi & Sekretariat Parlemen DPR RI, Senayan, Jakarta Pusat.
              </p>
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F59E0B] hover:text-[#fbbf24] transition-colors pt-2"
              >
                <span>Hubungi Dewan Langsung</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <p>© {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="flex items-center gap-1">
              <span>Didukung oleh</span>
              <span className="font-bold text-stone-400">POLARIS Engine</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
