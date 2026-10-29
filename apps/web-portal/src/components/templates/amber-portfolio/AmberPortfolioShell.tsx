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
  Send,
} from 'lucide-react';

import { resolvePortalMemberData } from '@/lib/template-resolver';

export interface AmberPortfolioShellProps {
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

export function AmberPortfolioShell({
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
}: AmberPortfolioShellProps) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#EA580C',
  });

  const {
    officialFullName,
    dapil,
    party,
    formattedPhoneNumber,
    officialEmail,
  } = resolved;

  const primaryColor = theme?.primaryHexColor || '#EA580C';
  const officialPhone = formattedPhoneNumber || '+62 812-3456-7890';
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

  return (
    <div className="min-h-screen bg-[#0A0908] text-stone-100 font-sans selection:bg-[#EA580C] selection:text-white antialiased flex flex-col justify-between">
      
      {/* ─── TOP NAVBAR (POLARIS STANDARD) ─── */}
      <header className="border-b border-white/10 bg-[#0A0908]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between relative">
          
          {/* Left: Brand Monogram / Avatar + Official Name */}
          <Link href={getNavLinkHref('/')} className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-full text-white font-black flex items-center justify-center text-xs shadow-md shrink-0 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: primaryColor }}
            >
              {officialFullName ? officialFullName.charAt(0) : 'P'}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[170px] sm:max-w-none group-hover:text-orange-400 transition-colors">
                {officialFullName}
              </span>
              <span className="text-[10px] text-stone-400 font-mono hidden sm:inline-block">
                {party} • {dapil}
              </span>
            </div>
          </Link>

          {/* Centered Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-10 text-xs sm:text-sm font-medium tracking-wide text-stone-300 md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link
              href={getNavLinkHref('/')}
              className={`pb-1 transition-colors ${
                activePage === 'beranda'
                  ? 'text-white font-semibold border-b-[2.5px]'
                  : 'text-stone-400 hover:text-white border-b-[2.5px] border-transparent'
              }`}
              style={{ borderColor: activePage === 'beranda' ? primaryColor : 'transparent' }}
            >
              Beranda
            </Link>
            <Link
              href={getNavLinkHref('/profil')}
              className={`pb-1 transition-colors ${
                activePage === 'profil'
                  ? 'text-white font-semibold border-b-[2.5px]'
                  : 'text-stone-400 hover:text-white border-b-[2.5px] border-transparent'
              }`}
              style={{ borderColor: activePage === 'profil' ? primaryColor : 'transparent' }}
            >
              Profil
            </Link>
            <Link
              href={getNavLinkHref('/artikel')}
              className={`pb-1 transition-colors ${
                activePage === 'artikel'
                  ? 'text-white font-semibold border-b-[2.5px]'
                  : 'text-stone-400 hover:text-white border-b-[2.5px] border-transparent'
              }`}
              style={{ borderColor: activePage === 'artikel' ? primaryColor : 'transparent' }}
            >
              Artikel
            </Link>
            <Link
              href={getNavLinkHref('/infografis')}
              className={`pb-1 transition-colors ${
                activePage === 'infografis'
                  ? 'text-white font-semibold border-b-[2.5px]'
                  : 'text-stone-400 hover:text-white border-b-[2.5px] border-transparent'
              }`}
              style={{ borderColor: activePage === 'infografis' ? primaryColor : 'transparent' }}
            >
              Infografis
            </Link>
            <Link
              href={getNavLinkHref('/kontak')}
              className={`pb-1 transition-colors ${
                activePage === 'kontak'
                  ? 'text-white font-semibold border-b-[2.5px]'
                  : 'text-stone-400 hover:text-white border-b-[2.5px] border-transparent'
              }`}
              style={{ borderColor: activePage === 'kontak' ? primaryColor : 'transparent' }}
            >
              Kontak
            </Link>
          </nav>

          {/* Right Action: Pill Button + Mobile Hamburger */}
          <div className="ml-auto flex items-center gap-2.5">
            <Link
              href={getNavLinkHref('/kontak')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all select-none cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Sampaikan Aspirasi</span>
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-2.5 h-2.5 text-white" />
              </div>
            </Link>

            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white font-bold text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 transition-all select-none"
            >
              <Instagram className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate max-w-[80px] xs:max-w-[110px] sm:max-w-none">@{instagramUsername}</span>
            </a>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0F0E0C] px-4 py-4 space-y-2 text-sm font-medium animate-in slide-in-from-top-2 duration-150">
            <Link
              href={getNavLinkHref('/')}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/5"
            >
              Beranda
            </Link>
            <Link
              href={getNavLinkHref('/profil')}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/5"
            >
              Profil Dewan
            </Link>
            <Link
              href={getNavLinkHref('/artikel')}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/5"
            >
              Artikel & Berita
            </Link>
            <Link
              href={getNavLinkHref('/infografis')}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/5"
            >
              Infografis Kinerja
            </Link>
            <Link
              href={getNavLinkHref('/kontak')}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/5"
            >
              Kontak Aspirasi
            </Link>
          </div>
        )}
      </header>

      {/* ─── MASTHEAD HEADER (IF SHOWMASTHEAD IS TRUE) ─── */}
      {showMasthead && (
        <section className="relative overflow-hidden py-12 sm:py-16 border-b border-white/10 bg-gradient-to-b from-[#14110E] to-[#0A0908]">
          <div
            className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none blur-[90px] opacity-25"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-4 font-mono">
              <Link href={getNavLinkHref('/')} className="hover:text-white transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
              <span className="text-orange-400 font-semibold">{breadcrumbTitle || pageTitle}</span>
            </div>

            {pageBadge && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[11px] font-bold uppercase tracking-wider mb-3">
                {pageBadge}
              </span>
            )}

            {pageTitle && (
              <h1 className="font-bebas text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight max-w-3xl">
                {pageTitle}
              </h1>
            )}

            {pageSubtitle && (
              <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-2 leading-relaxed">
                {pageSubtitle}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ─── MAIN CONTENT BODY ─── */}
      <main className="flex-1 w-full">{children}</main>

      {/* ─── SLEEK DARK AMBER FOOTER ─── */}
      <footer className="bg-[#080706] text-stone-400 py-14 sm:py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
            <div className="md:col-span-6 space-y-3 text-left">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full text-white font-black flex items-center justify-center text-xs shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  {officialFullName ? officialFullName.charAt(0) : 'P'}
                </div>
                <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {officialFullName}
                </span>
              </div>
              <p className="text-xs text-stone-400 max-w-md leading-relaxed">
                Portal resmi akuntabilitas keparlemenan {officialFullName}. Menjunjung tinggi transparansi, dedikasi penuh, dan keterbukaan akses bagi seluruh warga {dapil}.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs text-left">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Tautan Portal</h4>
              <p><Link href={getNavLinkHref('/')} className="hover:text-orange-400 transition-colors">Beranda</Link></p>
              <p><Link href={getNavLinkHref('/profil')} className="hover:text-orange-400 transition-colors">Profil Dewan</Link></p>
              <p><Link href={getNavLinkHref('/artikel')} className="hover:text-orange-400 transition-colors">Artikel &amp; Risalah</Link></p>
              <p><Link href={getNavLinkHref('/infografis')} className="hover:text-orange-400 transition-colors">Infografis Publik</Link></p>
              <p><Link href={getNavLinkHref('/kontak')} className="hover:text-orange-400 transition-colors">Kontak Aspirasi</Link></p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs text-left">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Kantor Aspirasi</h4>
              <p>Gedung Dewan Perwakilan Rakyat Daerah</p>
              <p className="text-orange-400 font-semibold">{officialPhone}</p>
              <p className="text-stone-400">{officialEmail}</p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <p>© {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="flex items-center gap-1.5">
              <span>Powered by</span>
              <span className="font-bold text-orange-400">POLARIS Engine</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
