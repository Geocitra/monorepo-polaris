'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Instagram,
  Menu,
  X,
  ChevronRight,
  ArrowUpRight,
  Send,
  Sparkles,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { resolvePortalMemberData } from '@/lib/template-resolver';

export interface PlatinumSlateShellProps {
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

export function PlatinumSlateShell({
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
}: PlatinumSlateShellProps) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#A0AFB7',
  });

  const officialFullName = resolved.officialFullName;
  const dapil = resolved.dapil || 'Dapil Terkait';
  const party = resolved.party;
  const legislativeLevel = resolved.legislativeLevel;
  const officialEmail = resolved.officialEmail;
  const officialPhone = resolved.formattedPhoneNumber || resolved.phone || '';
  const instagramUsername = resolved.instagramUsername;
  const instagramUrl = resolved.instagramUrl;

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

  const monogramInitials = officialFullName
    ? officialFullName
        .replace(/^(Dr\.|Ir\.|H\.|Hj\.|Prof\.)\s+/gi, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n: string) => n[0]?.toUpperCase())
        .join('')
    : 'AV';

  return (
    <div className="min-h-screen bg-[#131518] text-slate-100 font-sans selection:bg-white selection:text-black antialiased flex flex-col justify-between">
      
      {/* ─── TOP NAVBAR (STANDARD POLARIS NAVIGATION) ─── */}
      <header className="border-b border-white/10 bg-[#131518]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between relative">
          
          {/* Left: Brand Monogram "AV" Style + Official Name */}
          <Link href={getNavLinkHref('/')} className="flex items-center gap-3.5 group">
            <span className="font-serif italic font-bold text-2xl sm:text-3xl tracking-tight text-white group-hover:text-slate-300 transition-colors">
              {monogramInitials}
            </span>
            <div className="hidden sm:flex flex-col text-left border-l border-white/10 pl-3">
              <span className="font-bold text-xs sm:text-sm text-white tracking-tight truncate max-w-[190px]">
                {officialFullName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {party} • {dapil}
              </span>
            </div>
          </Link>

          {/* Centered Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-xs sm:text-sm font-medium tracking-wide text-slate-300 md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link
              href={getNavLinkHref('/')}
              className={`pb-1 transition-colors ${
                activePage === 'beranda'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              BERANDA
            </Link>
            <Link
              href={getNavLinkHref('/profil')}
              className={`pb-1 transition-colors ${
                activePage === 'profil'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PROFIL
            </Link>
            <Link
              href={getNavLinkHref('/artikel')}
              className={`pb-1 transition-colors ${
                activePage === 'artikel'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ARTIKEL
            </Link>
            <Link
              href={getNavLinkHref('/infografis')}
              className={`pb-1 transition-colors ${
                activePage === 'infografis'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              INFOGRAFIS
            </Link>
            <Link
              href={getNavLinkHref('/kontak')}
              className={`pb-1 transition-colors ${
                activePage === 'kontak'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              KONTAK
            </Link>
          </nav>

          {/* Right Action: Pill Button INSTAGRAM ↗ */}
          <div className="hidden sm:flex items-center">
            <a
              href={instagramUrl || 'https://instagram.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-gradient-to-r from-[#FFFFFF] via-[#E2E6EA] to-[#BAC2CC] text-slate-950 text-xs font-bold tracking-wider uppercase shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Instagram className="w-3.5 h-3.5 text-slate-950" />
              <span>INSTAGRAM</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0D1117] px-4 pt-3 pb-6 space-y-3">
            <div className="flex flex-col space-y-1 font-semibold text-sm">
              <Link
                href={getNavLinkHref('/')}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg ${
                  activePage === 'beranda' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                BERANDA
              </Link>
              <Link
                href={getNavLinkHref('/profil')}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg ${
                  activePage === 'profil' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                PROFIL
              </Link>
              <Link
                href={getNavLinkHref('/artikel')}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg ${
                  activePage === 'artikel' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ARTIKEL
              </Link>
              <Link
                href={getNavLinkHref('/infografis')}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg ${
                  activePage === 'infografis' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                INFOGRAFIS
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg ${
                  activePage === 'kontak' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                KONTAK
              </Link>
            </div>

            <div className="pt-2 border-t border-white/10">
              <a
                href={instagramUrl || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-gradient-to-r from-white via-slate-200 to-slate-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-md"
              >
                <Instagram className="w-4 h-4 text-slate-950" />
                <span>INSTAGRAM</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ─── MASTHEAD BANNER (OPTIONAL SUBPAGE HERO) ─── */}
      {showMasthead && (
        <section className="relative border-b border-white/10 bg-[#151B23]/40 py-12 sm:py-16 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-white/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4 text-left">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Link href={getNavLinkHref('/')} className="hover:text-white transition-colors">
                BERANDA
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white font-semibold uppercase">{breadcrumbTitle || activePage}</span>
            </div>

            {pageBadge && (
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/10 text-white border border-white/15">
                  <span>{pageBadge}</span>
                </span>
              </div>
            )}

            {pageTitle && (
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans max-w-4xl">
                {pageTitle}
              </h1>
            )}

            {pageSubtitle && (
              <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
                {pageSubtitle}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ─── MAIN CONTENT INJECTION ─── */}
      <main className="flex-1">{children}</main>

      {/* ─── BOTTOM CALLOUT BANNER & FOOTER (MATCHING DESIGN REFERENCE) ─── */}
      <footer className="border-t border-white/10 bg-[#0D1117] pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Metallic Liquid Chrome Callout Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#151B23] p-8 sm:p-12 shadow-2xl">
            {/* Liquid chrome ambient gradient highlight */}
            <div className="absolute -top-24 left-1/4 w-96 h-48 bg-gradient-to-r from-white/10 via-slate-300/20 to-transparent rounded-full blur-[60px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-5 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wider leading-none">
                    SUARAKAN KEBUTUHAN WARGA
                  </h3>
                  <Sparkles className="w-6 h-6 text-slate-300 animate-pulse hidden sm:inline-block shrink-0" />
                </div>
                <p className="text-xs text-slate-400">
                  Pengawalan perda, anggaran publik, dan transparansi kebijakan daerah untuk kemajuan bersama.
                </p>
              </div>

              <div className="lg:col-span-4 text-left space-y-3">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Pintu komunikasi resmi selalu terbuka untuk konsultasi kebijakan, kolaborasi daerah, dan audiensi kedewanan.
                </p>
                <a
                  href={instagramUrl || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-white via-slate-200 to-slate-400 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-lg hover:shadow-white/20 transition-all cursor-pointer"
                >
                  <Instagram className="w-4 h-4 text-slate-950" />
                  <span>KUNJUNGI INSTAGRAM</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              <div className="lg:col-span-3 text-left space-y-3 text-xs text-slate-400 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-8">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{officialEmail}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{officialPhone || 'Hubungi Sekretariat'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Gedung {legislativeLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Legal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-4 border-t border-white/5 font-mono">
            <div>
              &copy; {new Date().getFullYear()} {officialFullName}. Portal Resmi Parlemen POLARIS.
            </div>

            <div className="flex items-center gap-6">
              <span className="text-slate-500 uppercase tracking-widest">LET&apos;S CONNECT</span>
              <a
                href={instagramUrl || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </a>
              <span className="text-slate-600">|</span>
              <Link href={getNavLinkHref('/kontak')} className="hover:text-slate-300 transition-colors">
                Kontak &amp; Sekretariat
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
