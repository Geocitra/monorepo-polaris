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
  Sparkles,
  Terminal,
  Cpu,
} from 'lucide-react';

export interface NeonGlowShellProps {
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

export function NeonGlowShell({
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
}: NeonGlowShellProps) {
  const primaryColor = theme?.primaryHexColor || '#8B5CF6';
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

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '/' },
    { id: 'profil', label: 'Profil', href: '/profil' },
    { id: 'artikel', label: 'Artikel', href: '/artikel' },
    { id: 'infografis', label: 'Infografis', href: '/infografis' },
    { id: 'kontak', label: 'Kontak', href: '/kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans selection:bg-purple-600 selection:text-white flex flex-col justify-between relative overflow-x-hidden">
      {/* ─── AMBIENT BACKGROUND GLOW BURSTS ─── */}
      <div className="absolute top-0 right-1/4 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ─── 1. TOP NAVBAR ─── */}
      <header className="border-b border-purple-900/30 bg-[#070913]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
          {/* Left: Brand Monogram & Name */}
          <Link
            href={getNavLinkHref('/')}
            className="flex items-center gap-2.5 group transition-transform hover:scale-105"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-md shadow-purple-900/50 shrink-0">
              {member?.fullName ? member.fullName.charAt(0) : 'P'}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white hidden sm:inline-block truncate max-w-[150px] lg:max-w-none group-hover:text-purple-300 transition-colors">
                {officialFullName}
              </span>
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
                {member?.partyAffiliation || 'FRAKSI PARLEMEN'}
              </span>
            </div>
          </Link>

          {/* Centered Navigation (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium tracking-wide text-slate-300 md:absolute md:left-1/2 md:-translate-x-1/2">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={getNavLinkHref(item.href)}
                  className={`pb-0.5 transition-all ${
                    isActive
                      ? 'text-white font-semibold border-b-[2px] border-purple-500'
                      : 'text-slate-400 hover:text-white border-b-[2px] border-transparent hover:border-slate-500'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Instagram Gradient Pill Button + Mobile Hamburger (NO Search button) */}
          <div className="ml-auto flex items-center gap-2">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-bold text-[11px] sm:text-xs md:text-sm shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none"
              style={{
                background:
                  'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span className="truncate max-w-[90px] xs:max-w-[120px] sm:max-w-none">
                @{instagramUsername}
              </span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
              aria-label="Buka navigasi menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-purple-900/40 bg-[#070913]/98 backdrop-blur-xl px-4 py-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 text-sm font-semibold">
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <Link
                    key={item.id}
                    href={getNavLinkHref(item.href)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300 font-bold border border-purple-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-purple-900/30'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
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
        <div className="relative border-b border-purple-900/30 bg-[#070913] overflow-hidden">
          {/* Subtle cyber grid and ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 15%, rgba(139, 92, 246, 0.22) 0%, rgba(6, 182, 212, 0.08) 45%, rgba(7, 9, 19, 0) 75%)',
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Link
                href={getNavLinkHref('/')}
                className="hover:text-purple-400 transition-colors"
              >
                BERANDA
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-cyan-300 font-semibold uppercase tracking-wider">
                {breadcrumbTitle || activePage}
              </span>
            </div>

            {/* Title & Badge */}
            <div className="space-y-3">
              {pageBadge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono uppercase tracking-widest bg-purple-500/10 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/20">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{pageBadge}</span>
                </div>
              )}
              {pageTitle && (
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  {pageTitle}
                </h1>
              )}
              {pageSubtitle && (
                <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-3xl leading-relaxed">
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. MAIN CONTENT BODY ─── */}
      <main className="flex-1 bg-[#070913] relative z-10">{children}</main>

      {/* ─── 4. FOOTER & ASPIRASI (MATCHING NEON GLOW CYBER OS) ─── */}
      <footer className="py-16 bg-[#04060C] border-t border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Banner Callout Aspirasi */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#0A0E22] to-indigo-950/30 border border-purple-900/40">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-mono uppercase text-purple-400 tracking-widest block font-bold">
                SALURKAN GAGASAN &amp; ASPIRASI
              </span>
              <h2 className="text-2xl sm:text-3xl xl:text-4xl font-black text-white">
                Punya Masukan Kebijakan atau Aspirasi Daerah?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                Kami percaya transparansi dan partisipasi publik adalah pondasi utama demokrasi yang sehat. Sampaikan suara Anda langsung ke meja kerja anggota dewan.
              </p>
              <div className="pt-2">
                <Link
                  href={getNavLinkHref('/kontak')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-purple-600/30 inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Hubungi Sekretariat Dewan</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950/70 border border-purple-900/40 space-y-3 font-mono text-xs">
              <div className="text-purple-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>KANTOR ASPIRASI:</span>
              </div>
              <div className="text-slate-300">
                Gedung Nusantara I DPR RI, Ruang Kerja Fraksi, Senayan, Jakarta.
              </div>
              <div className="text-slate-400 text-[11px] pt-1">
                Email: aspirasi@{subdomain || 'dewan'}.polaris.id
              </div>
              <div className="text-slate-400 text-[11px]">
                WA Center: 0812-9876-5432
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 pt-4">
            <div>
              &copy; {new Date().getFullYear()} {officialFullName}. POLARIS Legislative Intelligence OS.
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-purple-400 transition-colors">TWITTER</a>
              <a href="#" className="hover:text-purple-400 transition-colors">INSTAGRAM</a>
              <a href="#" className="hover:text-purple-400 transition-colors">LINKEDIN</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
