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
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';

export interface FoliobloxShellProps {
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

export function FoliobloxShell({
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
}: FoliobloxShellProps) {
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] || 'Jonanda';

  const rawDapil = member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I';
  const dapil = rawDapil.replace(/_/g, ' ');

  const rawParty = member?.partyAffiliation || 'Fraksi Parlemen';
  const party = rawParty.replace(/_/g, ' ');

  const rawLevel = member?.legislativeLevel || 'DPRD PROVINSI';
  const legislativeLevel = rawLevel.replace(/_/g, ' ');

  const rawCommission = member?.commissionName || 'KOMISI I (PEMERINTAHAN & HUKUM)';
  const commissionName = rawCommission.replace(/_/g, ' ');

  const officialEmail = `aspirasi@${subdomain || 'polaris'}.id`;
  const officialPhone = '+62 812-3456-7890';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'polaris.advokasi';

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
    { id: 'profil', label: 'Profil Dewan', href: '/profil' },
    { id: 'artikel', label: 'Artikel & Risalah', href: '/artikel' },
    { id: 'infografis', label: 'Infografis Data', href: '/infografis' },
    { id: 'kontak', label: 'Posko Aspirasi', href: '/kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#FF4500] selection:text-white antialiased overflow-x-hidden flex flex-col justify-between">
      
      {/* ─── 1. TOP STICKY NAVBAR (MATCHING FOLIOBLOX OBSIDIAN NOIR & CAPSULE) ─── */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
          
          {/* Brand Name */}
          <Link href={getNavLinkHref('/')} className="flex items-center gap-2 group select-none shrink-0">
            <span className="font-outfit font-black text-xl sm:text-2xl text-white tracking-tight group-hover:text-orange-400 transition-colors">
              {officialFullName}
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-[13.5px] font-semibold text-white/80">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={getNavLinkHref(item.href)}
                  className={`transition-colors relative py-1 ${
                    isActive
                      ? 'text-[#FF4500] font-bold after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-[#FF4500]'
                      : 'hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: White Capsule Button with Orange Circle Arrow */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href={getNavLinkHref('/kontak')}
              className="inline-flex items-center gap-2 pl-5 pr-2 py-2 rounded-full bg-white text-stone-950 text-xs font-bold hover:bg-stone-100 transition-all shadow-md group cursor-pointer"
            >
              <span>Sampaikan Aspirasi</span>
              <div className="w-5 h-5 rounded-full bg-[#FF4500] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 inset-x-4 bg-[#141414]/98 backdrop-blur-xl border border-white/15 p-6 rounded-2xl shadow-2xl z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={getNavLinkHref(item.href)}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm py-2.5 border-b border-white/10 ${
                  activePage === item.id
                    ? 'font-bold text-[#FF4500]'
                    : 'font-medium text-white/80'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={getNavLinkHref('/kontak')}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 w-full text-center py-3 rounded-full bg-[#FF4500] text-white text-xs font-bold"
            >
              Sampaikan Aspirasi ➔
            </Link>
          </div>
        )}
      </header>

      {/* ─── 2. MASTHEAD WITH SUNSET ORANGE GLOW ATMOSPHERE ─── */}
      {showMasthead && (
        <section className="relative w-full pt-14 pb-12 sm:pt-20 sm:pb-16 px-6 sm:px-10 lg:px-16 border-b border-white/10 overflow-hidden bg-[#0A0A0A]">
          {/* Sunset Orange Atmosphere Radial Glow */}
          <div
            className="absolute inset-0 pointer-events-none select-none z-0"
            style={{
              background:
                'radial-gradient(ellipse 90% 80% at 50% -25%, rgba(255, 69, 0, 0.45) 0%, rgba(234, 54, 4, 0.22) 40%, rgba(94, 12, 2, 0.1) 70%, transparent 95%)',
            }}
          />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[350px] bg-[#FF4500]/25 blur-[120px] pointer-events-none -z-0" />

          <div className="relative z-10 max-w-[1600px] mx-auto select-text">
            {/* Breadcrumb Trail */}
            <nav className="flex items-center gap-2 text-xs text-white/60 font-semibold mb-4">
              <Link href={getNavLinkHref('/')} className="hover:text-white transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-white font-bold">{breadcrumbTitle || pageTitle}</span>
            </nav>

            {/* Micro Badge */}
            {pageBadge && (
              <span className="text-xs sm:text-sm font-bold text-orange-500 uppercase tracking-wider block mb-2.5">
                {pageBadge}
              </span>
            )}

            {/* Page Title in Outfit Black */}
            {pageTitle && (
              <h1 className="font-outfit font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08]">
                {pageTitle}
              </h1>
            )}

            {/* Page Subtitle */}
            {pageSubtitle && (
              <p className="mt-4 text-sm sm:text-base text-white/70 max-w-3xl font-normal leading-relaxed">
                {pageSubtitle}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ─── 3. MAIN CHILDREN CONTENT ─── */}
      <main className="flex-1 w-full bg-[#0A0A0A]">{children}</main>

      {/* ─── 4. INSTITUTIONAL AKD PARTNERS STRIP (MATCHING FOLIOBLOX HERO FOOTER) ─── */}
      <div className="w-full bg-[#080201] py-3.5 px-6 sm:px-10 lg:px-16 border-t border-white/10">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3 text-white/60 text-xs font-semibold">
          <span className="font-outfit text-white/40 uppercase tracking-widest text-[10px] font-bold">
            Kemitraan Komisi &amp; Alat Kelengkapan Dewan:
          </span>
          <div className="flex items-center gap-6 sm:gap-10 flex-wrap">
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <Landmark className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>{commissionName}</span>
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <Scale className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Badan Pembentukan Perda</span>
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Badan Anggaran APBD</span>
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <Users className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Posko Reses Dapil {dapil}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── 5. OBSIDIAN NOIR FOOTER (MATCHING FOLIOBLOX THEME) ─── */}
      <footer className="w-full bg-[#060606] text-white/70 pt-16 pb-10 px-6 sm:px-10 lg:px-16 border-t border-white/10 select-none">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10">
            
            {/* Col 1: Brand & Mandat */}
            <div className="lg:col-span-4 select-text">
              <h3 className="font-outfit font-black text-2xl text-white tracking-tight">
                {officialFullName}
              </h3>
              <span className="text-[11px] uppercase tracking-wider text-orange-400 font-bold block mt-1">
                {legislativeLevel} • {party}
              </span>
              <p className="mt-4 text-xs sm:text-[13px] text-white/60 leading-relaxed max-w-sm">
                Portal resmi publikasi kinerja, pemikiran kebijakan, transparansi alokasi anggaran,
                dan kanal aspirasi dua arah bersama masyarakat di Dapil {dapil}.
              </p>
              
              <div className="mt-6 flex items-center gap-3">
                <a
                  href={`https://instagram.com/${instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#FF4500] hover:text-white text-white flex items-center justify-center transition-all"
                  aria-label="Instagram dewan"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:${officialEmail}`}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#FF4500] hover:text-white text-white flex items-center justify-center transition-all"
                  aria-label="Email resmi aspirasi"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#FF4500] hover:text-white text-white flex items-center justify-center transition-all"
                  aria-label="WhatsApp Posko Reses"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Nav Links */}
            <div className="lg:col-span-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                Navigasi Cepat
              </h4>
              <ul className="space-y-2.5 text-xs text-white/60">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <Link href={getNavLinkHref(item.href)} className="hover:text-orange-400 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Institutional Info */}
            <div className="lg:col-span-3 select-text">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                Mandat Lembaga
              </h4>
              <ul className="space-y-2 text-xs text-white/60">
                <li>
                  <span className="text-white/40 block text-[11px]">Lembaga:</span>
                  <span className="text-white font-medium">{legislativeLevel}</span>
                </li>
                <li>
                  <span className="text-white/40 block text-[11px]">Fraksi Partai:</span>
                  <span className="text-white font-medium">{party}</span>
                </li>
                <li>
                  <span className="text-white/40 block text-[11px]">Penugasan Komisi:</span>
                  <span className="text-white font-medium">{commissionName}</span>
                </li>
                <li>
                  <span className="text-white/40 block text-[11px]">Wilayah Pemilihan:</span>
                  <span className="text-white font-medium">{dapil}</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Posko Reses Quick Card */}
            <div className="lg:col-span-3 bg-[#111111] border border-white/10 rounded-2xl p-5">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-1">
                Posko Reses Konstituen
              </span>
              <p className="text-xs text-white/80 leading-relaxed">
                Kanal aspirasi tatap muka dan pengaduan digital aktif melayani warga masyarakat setiap hari kerja.
              </p>
              <Link
                href={getNavLinkHref('/kontak')}
                className="mt-4 w-full py-2.5 rounded-full bg-[#FF4500] hover:bg-[#E03E00] text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Hubungi Posko</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
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
