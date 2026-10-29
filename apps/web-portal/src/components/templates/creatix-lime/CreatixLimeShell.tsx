'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Building2,
  MapPin,
  Menu,
  X,
  Share2,
  Instagram,
  ChevronRight,
  Home,
  ArrowRight,
} from 'lucide-react';

export function LimeStarburst({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill="#84CC16">
        {[...Array(12)].map((_, i) => (
          <rect
            key={i}
            x="46"
            y="4"
            width="8"
            height="32"
            rx="4"
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="14" fill="#84CC16" />
      </g>
    </svg>
  );
}

export function LimeSparkle({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

import { resolvePortalMemberData } from '@/lib/template-resolver';

interface CreatixLimeShellProps {
  member: any;
  theme?: any;
  subdomain?: string;
  activePage: 'beranda' | 'profil' | 'artikel' | 'infografis' | 'kontak';
  breadcrumbTitle?: string;
  pageBadge?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  showMasthead?: boolean;
  children: React.ReactNode;
}

export function CreatixLimeShell({
  member,
  theme,
  subdomain,
  activePage,
  breadcrumbTitle,
  pageBadge = 'Mandat & Transparansi Publik',
  pageTitle,
  pageSubtitle,
  showMasthead = true,
  children,
}: CreatixLimeShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');
  const previewColor = searchParams?.get('preview_color');

  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#84CC16',
  });

  const {
    officialFullName,
    firstName,
    dapil,
    party,
    legislativeLevel,
    commissionName,
    officialEmail,
  } = resolved;

  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    '';

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

  const navLinks = [
    { key: 'beranda', label: 'Beranda', href: '/' },
    { key: 'profil', label: 'Profil', href: '/profil' },
    { key: 'artikel', label: 'Artikel', href: '/artikel' },
    { key: 'infografis', label: 'Infografis', href: '/infografis' },
    { key: 'kontak', label: 'Kontak', href: '/kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#070A07] text-white font-sans selection:bg-[#84CC16] selection:text-black overflow-x-hidden antialiased flex flex-col justify-between">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          1. FLOATING DARK PILL NAVBAR (RIGEL / CREATIX SIGNATURE)
          ────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full pt-4 sm:pt-6 px-4 sm:px-8 bg-gradient-to-b from-[#070A07] via-[#070A07]/90 to-transparent pb-3 backdrop-blur-xs">
        <nav className="max-w-3xl mx-auto bg-[#0B0E0B]/95 text-white rounded-full px-5 sm:px-8 py-2.5 sm:py-3 border border-white/10 shadow-2xl flex items-center justify-between">
          
          {/* Left Nav Links */}
          <div className="hidden sm:flex items-center gap-5 sm:gap-7 text-xs sm:text-[13px] font-medium">
            <Link
              href={getNavLinkHref('/')}
              className={`transition-colors ${
                activePage === 'beranda'
                  ? 'text-[#84CC16] font-bold'
                  : 'text-white/70 hover:text-[#84CC16]'
              }`}
            >
              Beranda
            </Link>
            <Link
              href={getNavLinkHref('/profil')}
              className={`transition-colors ${
                activePage === 'profil'
                  ? 'text-[#84CC16] font-bold'
                  : 'text-white/70 hover:text-[#84CC16]'
              }`}
            >
              Profil
            </Link>
          </div>

          {/* Center Brand with Glowing Lime Starburst */}
          <Link
            href={getNavLinkHref('/')}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <LimeStarburst className="w-5 h-5 sm:w-6 sm:h-6 text-[#84CC16] group-hover:scale-110 transition-transform" />
            <span className="font-black text-sm sm:text-base tracking-tight text-white group-hover:text-[#84CC16] transition-colors">
              {firstName.toUpperCase()}
              <span className="text-[#84CC16]">.</span>
            </span>
          </Link>

          {/* Right Nav Links */}
          <div className="hidden sm:flex items-center gap-5 sm:gap-7 text-xs sm:text-[13px] font-medium">
            <Link
              href={getNavLinkHref('/artikel')}
              className={`transition-colors ${
                activePage === 'artikel'
                  ? 'text-[#84CC16] font-bold'
                  : 'text-white/70 hover:text-[#84CC16]'
              }`}
            >
              Artikel
            </Link>
            <Link
              href={getNavLinkHref('/infografis')}
              className={`transition-colors ${
                activePage === 'infografis'
                  ? 'text-[#84CC16] font-bold'
                  : 'text-white/70 hover:text-[#84CC16]'
              }`}
            >
              Infografis
            </Link>
            <Link
              href={getNavLinkHref('/kontak')}
              className={`transition-colors ${
                activePage === 'kontak'
                  ? 'text-[#84CC16] font-bold'
                  : 'text-white/70 hover:text-[#84CC16]'
              }`}
            >
              Kontak
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="sm:hidden p-1.5 rounded-full text-white hover:text-[#84CC16] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-3 max-w-sm mx-auto bg-[#0B0E0B] border border-white/10 rounded-3xl p-4 shadow-2xl space-y-2 text-xs font-bold uppercase tracking-wider text-white">
            {navLinks.map((item) => (
              <Link
                key={item.key}
                href={getNavLinkHref(item.href)}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2.5 px-4 rounded-full transition-colors ${
                  activePage === item.key
                    ? 'bg-[#84CC16] text-slate-950 font-black'
                    : 'hover:bg-white/5 text-white/80'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. MASTHEAD / SUBPAGE HERO BANNER
          ────────────────────────────────────────────────────────────────────────── */}
      {showMasthead && (
        <section className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16 max-w-7xl mx-auto w-full">
          {/* Ambient Lime Glow behind header */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#84CC16]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-slate-400">
              <Link href={getNavLinkHref('/')} className="hover:text-[#84CC16] flex items-center gap-1 transition-colors">
                <Home className="w-3.5 h-3.5" />
                <span>Beranda</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-[#84CC16] font-bold uppercase">{breadcrumbTitle || activePage}</span>
            </div>

            {/* Badge with Lime Sparkle */}
            {pageBadge && (
              <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-[#84CC16]">
                <span>{pageBadge}</span>
              </div>
            )}

            {/* Title with Rigel Lime Slashes */}
            {pageTitle && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl flex items-center gap-3 flex-wrap">
                <span>{pageTitle}</span>
                <span className="inline-flex items-center gap-1 text-[#84CC16]">
                  <span className="w-1.5 h-6 bg-[#84CC16] rounded-full rotate-[24deg]" />
                  <span className="w-1.5 h-6 bg-[#84CC16] rounded-full rotate-[24deg]" />
                </span>
              </h1>
            )}

            {/* Subtitle */}
            {pageSubtitle && (
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                {pageSubtitle}
              </p>
            )}

            {/* Mandate Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0E150E] border border-white/10 text-slate-300 text-[11px] font-semibold">
                <Building2 className="w-3.5 h-3.5 text-[#84CC16]" />
                <span>{legislativeLevel} • {party}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0E150E] border border-white/10 text-slate-300 text-[11px] font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#84CC16]" />
                <span>Dapil: {dapil}</span>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          3. MAIN CHILDREN CONTENT
          ────────────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. FOOTER (OBSIDIAN DARK + LIME ACCENTS)
          ────────────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#050705] py-14 sm:py-20 px-4 sm:px-6 lg:px-8 text-white relative mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LimeStarburst className="w-7 h-7 text-[#84CC16]" />
                <span className="text-xl font-black tracking-tight text-white">
                  {officialFullName}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                Portal informasi dan transparansi publik resmi {officialFullName}, mewakili aspirasi masyarakat di {dapil}.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#84CC16] hover:text-[#84CC16] flex items-center justify-center transition-all"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${officialEmail}`}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#84CC16] hover:text-[#84CC16] flex items-center justify-center transition-all"
                title="Email Aspirasi"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#84CC16] mb-4">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link href={getNavLinkHref('/')} className="hover:text-white transition-colors">
                  Beranda Utama
                </Link>
              </li>
              <li>
                <Link href={getNavLinkHref('/profil')} className="hover:text-white transition-colors">
                  Profil & Rekam Jejak
                </Link>
              </li>
              <li>
                <Link href={getNavLinkHref('/artikel')} className="hover:text-white transition-colors">
                  Risalah & Kebijakan
                </Link>
              </li>
              <li>
                <Link href={getNavLinkHref('/infografis')} className="hover:text-white transition-colors">
                  Infografis Transparansi
                </Link>
              </li>
              <li>
                <Link href={getNavLinkHref('/kontak')} className="hover:text-white transition-colors">
                  Kontak & Lokasi Aspirasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Parliamentary Mandate */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#84CC16] mb-4">
              Mandat Parlemen
            </h4>
            <div className="p-4 rounded-2xl bg-[#0D120D] border border-white/10 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Building2 className="w-4 h-4 text-[#84CC16]" />
                <span>{legislativeLevel}</span>
              </div>
              <p className="text-slate-400">
                {commissionName} • {party}
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-[#84CC16]" />
                <span>Daerah Pemilihan: {dapil}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16]" />
            <span>Didukung oleh POLARIS Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
