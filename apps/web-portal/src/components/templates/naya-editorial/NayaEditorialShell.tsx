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
  Send,
  MessageCircle,
  Landmark,
} from 'lucide-react';
import { resolvePortalMemberData } from '@/lib/template-resolver';

export interface NayaEditorialShellProps {
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

export function NayaEditorialShell({
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
}: NayaEditorialShellProps) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#272A20',
  });

  const {
    officialFullName,
    firstName,
    party,
    dapil,
    legislativeLevel,
    commissionName,
    officialEmail,
    formattedPhoneNumber,
    waNumber,
    waHotlineLink,
    instagramUsername,
  } = resolved;

  const primaryColor = theme?.primaryHexColor || '#272A20';

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
    const sp = new URLSearchParams();
    if (previewTemplate) sp.set('preview_template', previewTemplate);
    if (previewColor) sp.set('preview_color', previewColor);
    const qs = sp.toString();
    return qs ? `${base}${base.includes('?') ? '&' : '?'}${qs}` : base;
  };

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '/' },
    { id: 'profil', label: 'Profil Dewan', href: '/profil' },
    { id: 'artikel', label: 'Artikel & Risalah', href: '/artikel' },
    { id: 'infografis', label: 'Infografis Data', href: '/infografis' },
    { id: 'kontak', label: 'Posko Aspirasi', href: '/kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#24271D] font-sans selection:bg-[#35382B] selection:text-white antialiased overflow-x-hidden flex flex-col justify-between">
      
      {/* ─── STICKY BOUTIQUE HEADER (MATCHING NAYA+ DIGITAL AESTHETIC) ─── */}
      <header className="sticky top-0 z-50 bg-[#F7F5EE]/90 backdrop-blur-md border-b border-[#E7E2D6] transition-all">
        <div className="max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href={getNavLinkHref('/')} className="flex flex-col group select-none">
            <div className="flex items-start gap-0.5">
              <span className="font-outfit font-black text-xl sm:text-2xl tracking-[0.14em] text-[#24271D] uppercase">
                {theme?.portalTitle || 'POLARIS'}
              </span>
              <span
                className="font-black text-sm leading-none mt-0.5 group-hover:rotate-45 transition-transform duration-300"
                style={{ color: primaryColor }}
              >
                ✦
              </span>
            </div>
            <span className="text-[9px] tracking-[0.3em] font-semibold text-[#76796A] uppercase -mt-0.5">
              ADVOKASI PUBLIK
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-[13px] font-medium text-[#5B5F4E]">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={getNavLinkHref(item.href)}
                  className={`transition-colors relative py-1 ${
                    isActive ? 'font-bold' : 'hover:text-[#24271D]'
                  }`}
                  style={isActive ? { color: primaryColor } : {}}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 inset-x-0 h-0.5"
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Header Right Action */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href={getNavLinkHref('/kontak')}
              className="px-6 py-2.5 rounded-full text-white text-xs font-semibold hover:brightness-110 transition-all duration-200 inline-flex items-center gap-2 shadow-sm group cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Sampaikan Aspirasi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#24271D] hover:bg-[#EAE6DA] rounded-full transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 inset-x-4 bg-white/95 backdrop-blur-xl border border-[#E5E0D5] p-6 rounded-2xl shadow-xl z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={getNavLinkHref(item.href)}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm py-2.5 border-b border-[#F0ECE1] ${
                  activePage === item.id
                    ? 'font-bold text-[#24271D]'
                    : 'font-medium text-[#5B5F4E]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={getNavLinkHref('/kontak')}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 w-full text-center py-3 rounded-full bg-[#272A20] text-white text-xs font-bold"
            >
              Sampaikan Aspirasi ➔
            </Link>
          </div>
        )}
      </header>

      {/* ─── MASTHEAD HEADER (FOR SUBPAGES) ─── */}
      {showMasthead && (
        <section className="relative w-full pt-12 pb-10 sm:pt-16 sm:pb-14 px-6 sm:px-10 lg:px-16 border-b border-[#E7E2D6] bg-gradient-to-b from-[#FAF8F2] to-[#F7F5EE]">
          <div className="max-w-[1520px] mx-auto">
            {/* Breadcrumb Trail */}
            <nav className="flex items-center gap-2 text-xs text-[#7A7E6E] font-medium mb-5">
              <Link href={getNavLinkHref('/')} className="hover:text-[#24271D] transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#A5A99B]" />
              <span className="text-[#24271D] font-semibold">{breadcrumbTitle || pageTitle}</span>
            </nav>

            {/* Micro Badge */}
            {pageBadge && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#D8D3C4] bg-[#EFECE1]/80 text-[#606453] text-[11.5px] sm:text-xs font-medium mb-3.5 shadow-2xs">
                <span>{pageBadge}</span>
              </div>
            )}

            {/* Page Title in Cormorant Garamond */}
            {pageTitle && (
              <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.03em] text-[#24271D] leading-[1.08]">
                {pageTitle}
              </h1>
            )}

            {/* Page Subtitle */}
            {pageSubtitle && (
              <p className="mt-4 text-sm sm:text-base text-[#6E7162] max-w-3xl font-normal leading-relaxed">
                {pageSubtitle}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ─── MAIN CHILDREN CONTENT ─── */}
      <main className="flex-1 w-full">{children}</main>

      {/* ─── DARK BOUTIQUE FOOTER (MATCHING NAYA EDITORIAL) ─── */}
      <footer className="w-full bg-[#131510] text-[#9EA392] pt-16 pb-10 px-6 sm:px-10 lg:px-16 border-t border-white/10 select-none">
        <div className="max-w-[1520px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10">
            
            {/* Col 1: Brand & Bio */}
            <div className="lg:col-span-4 select-text">
              <div className="flex items-start gap-1">
                <span className="font-outfit font-black text-2xl tracking-[0.14em] text-white uppercase">
                  {theme?.portalTitle || 'POLARIS'}
                </span>
                <span className="text-[#848B72] font-black text-base leading-none mt-0.5">✦</span>
              </div>
              <span className="text-[10px] tracking-[0.25em] font-semibold text-[#7D8271] uppercase block mt-0.5">
                ADVOKASI PUBLIK &amp; PARLEMEN
              </span>
              <p className="mt-4 text-xs sm:text-[13px] text-[#8C9180] leading-relaxed max-w-sm">
                Portal resmi publikasi kinerja, pemikiran kebijakan, transparansi alokasi anggaran,
                dan kanal aspirasi dua arah bersama <strong>{officialFullName}</strong>.
              </p>
              
              <div className="mt-6 flex items-center gap-3">
                <a
                  href={`https://instagram.com/${instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-[#131510] text-white flex items-center justify-center transition-all"
                  aria-label="Instagram dewan"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:${officialEmail}`}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-[#131510] text-white flex items-center justify-center transition-all"
                  aria-label="Email resmi aspirasi"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href={waHotlineLink || (waNumber ? `https://wa.me/${waNumber}` : getNavLinkHref('/kontak'))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-[#131510] text-white flex items-center justify-center transition-all"
                  aria-label="WhatsApp Posko Reses"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Nav Links */}
            <div className="lg:col-span-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                Navigasi Halaman
              </h4>
              <ul className="space-y-2.5 text-xs text-[#8C9180]">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <Link href={getNavLinkHref(item.href)} className="hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Institutional Info */}
            <div className="lg:col-span-3 select-text">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                Mandat &amp; Lembaga
              </h4>
              <ul className="space-y-2 text-xs text-[#8C9180]">
                <li>
                  <span className="text-white/60 block text-[11px]">Tingkat Lembaga:</span>
                  <span className="text-white font-medium">{legislativeLevel}</span>
                </li>
                <li>
                  <span className="text-white/60 block text-[11px]">Fraksi Partai:</span>
                  <span className="text-white font-medium">{party}</span>
                </li>
                <li>
                  <span className="text-white/60 block text-[11px]">Alat Kelengkapan Dewan:</span>
                  <span className="text-white font-medium">{commissionName}</span>
                </li>
                <li>
                  <span className="text-white/60 block text-[11px]">Daerah Pemilihan:</span>
                  <span className="text-white font-medium">{dapil}</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Rotating Circular Seal Stamp */}
            <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg
                  className="w-full h-full animate-[spin_24s_linear_infinite]"
                  viewBox="0 0 160 160"
                >
                  <path
                    id="nayaSealPathShell"
                    d="M 80, 80 m -60, 0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0"
                    fill="none"
                  />
                  <text className="text-[10px] uppercase font-bold tracking-[0.24em] fill-[#848B72]">
                    <textPath href="#nayaSealPathShell" startOffset="0%">
                      • POLARIS ADVOKASI • SUARA RAKYAT • DEDIKASI NYATA •
                    </textPath>
                  </text>
                </svg>

                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <Sparkles className="w-6 h-6 text-[#AAB09D]" />
                </div>
              </div>
              <span className="text-[11px] text-[#7A7F6E] mt-3 font-medium">
                Akuntabilitas Publik Terverifikasi
              </span>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737867]">
            <p>© {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="flex items-center gap-1.5">
              <span>Ditenagai oleh platform</span>
              <strong className="text-white/80 font-bold">POLARIS</strong>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
