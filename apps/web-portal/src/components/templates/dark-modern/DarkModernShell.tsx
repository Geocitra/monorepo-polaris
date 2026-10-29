'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Instagram,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export interface DarkModernShellProps {
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

export function DarkModernShell({
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
}: DarkModernShellProps) {
  const primaryColor = theme?.primaryHexColor || '#1877F2';
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
    <div className="min-h-screen bg-[#111215] text-slate-100 font-jakarta selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* ─── 1. TOP NAVBAR ─── */}
      <header className="border-b border-white/5 bg-[#111215]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
          {/* Left: Brand Monogram / Avatar */}
          <Link
            href={getNavLinkHref('/')}
            className="flex items-center gap-2.5 group transition-transform hover:scale-105"
          >
            <div
              className="w-8 h-8 rounded-full text-white font-black flex items-center justify-center text-xs shadow-md shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              {member?.fullName ? member.fullName.charAt(0) : 'P'}
            </div>
            <span className="font-bold text-xs sm:text-sm text-white hidden sm:inline-block truncate max-w-[150px] lg:max-w-none group-hover:text-blue-400 transition-colors">
              {officialFullName}
            </span>
          </Link>

          {/* Centered Navigation (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-xs sm:text-sm font-medium tracking-wide text-slate-300 md:absolute md:left-1/2 md:-translate-x-1/2">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={getNavLinkHref(item.href)}
                  className={`pb-1 transition-all ${
                    isActive
                      ? 'text-white font-semibold border-b-[2.5px] border-white'
                      : 'text-slate-400 hover:text-white border-b-[2.5px] border-transparent hover:border-slate-500'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Instagram Pill Button + Mobile Hamburger */}
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
                className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Buka navigasi menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 bg-[#111215]/98 backdrop-blur-xl px-4 py-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
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
                          ? 'bg-blue-600/10 text-blue-400 font-bold border border-blue-500/20'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </header>

        {/* ─── 2. SUBPAGE MASTHEAD BANNER (IF ENABLED) ─── */}
        {showMasthead && (
          <div className="relative border-b border-white/5 bg-[#0e0f11] overflow-hidden">
            {/* Ambient Radial Electric-Blue Glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 50% 15%, rgba(59, 130, 246, 0.22) 0%, rgba(24, 119, 242, 0.08) 45%, rgba(14, 15, 17, 0) 75%)',
              }}
            />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-4">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Link
                  href={getNavLinkHref('/')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Beranda
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-slate-200 font-semibold">
                  {breadcrumbTitle || activePage.toUpperCase()}
                </span>
              </div>

              {/* Title & Badge */}
              <div className="space-y-3">
                {pageBadge && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
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
        <main className="flex-1 bg-[#111215]">{children}</main>

        {/* ─── 4. FOOTER & ASPIRASI (MATCHING DARK MODERN DESIGN) ─── */}
        <footer className="bg-[#070A12] py-16 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Banner Callout Aspirasi */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950/60 via-[#0B0F19] to-slate-900 border border-blue-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  KANAL SUARA WARGA
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Sampaikan Aspirasi Anda Secara Langsung
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
                  Setiap masukan, keluhan fasilitas umum, dan usulan kebijakan daerah Anda akan dicatat dan ditindaklanjuti oleh staf ahli parlemen.
                </p>
              </div>
              <Link
                href={getNavLinkHref('/kontak')}
                className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xl hover:opacity-95 transition-all shrink-0 cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Hubungi Sekretariat Dewan →
              </Link>
            </div>

            {/* 4 Footer Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-slate-400 pt-6">
              <div className="space-y-3">
                <span className="text-white font-extrabold text-sm">{officialFullName}</span>
                <p className="leading-relaxed">
                  Portal komunikasi resmi transparansi kinerja legislatif konstituen Dapil{' '}
                  {member?.dapilName || 'Jawa Barat I'}.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-white font-bold block mb-1">Sekretariat Parlemen</span>
                <p>Gedung Nusantara I DPR RI, Senayan, Jakarta Pusat 10270</p>
                <p className="text-slate-500">Ruang Kerja Fraksi & Komisi Dewan</p>
              </div>

              <div className="space-y-2">
                <span className="text-white font-bold block mb-1">Kontak Resmi</span>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" /> aspirasi@{subdomain || 'dewan'}.polaris.id
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400" /> 0812-9876-5432 (Hotline Tim Sahabat)
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-white font-bold block mb-1">Integritas Sistem</span>
                <p>Terhubung langsung dengan POLARIS Legislative Intelligence OS.</p>
                <p className="text-slate-600">
                  &copy; {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi Undang-Undang.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}
