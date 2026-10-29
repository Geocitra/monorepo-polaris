'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Instagram,
  Facebook,
  Linkedin,
  Menu,
  X,
  ChevronRight,
  Landmark,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { getGoldenMemberInfo, useGoldenHref } from './utils';

export interface GoldenSplitShellProps {
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

export function GoldenSplitShell({
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
}: GoldenSplitShellProps) {
  const info = getGoldenMemberInfo(member, theme, subdomain);
  const href = useGoldenHref(subdomain);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '/' },
    { id: 'profil', label: 'Profil', href: '/profil' },
    { id: 'artikel', label: 'Artikel', href: '/artikel' },
    { id: 'infografis', label: 'Infografis', href: '/infografis' },
    { id: 'kontak', label: 'Kontak', href: '/kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-[#E0E0E0] font-sans antialiased overflow-x-hidden flex flex-col selection:bg-[#FFA800] selection:text-[#1E1E1E]">
      {/* ─── NAVBAR ─── */}
      <header className="sticky top-0 z-50 bg-[#1E1E1E]/95 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link href={href('/')} className="flex items-center gap-2.5 group select-none">
            <span
              className="w-9 h-9 rounded flex items-center justify-center text-[#1E1E1E] shadow-md group-hover:scale-105 transition-transform"
              style={{ backgroundColor: info.primaryColor }}
            >
              <Landmark className="w-5 h-5 font-bold" />
            </span>
            <div className="flex flex-col">
              <span className="font-outfit font-extrabold text-lg sm:text-xl tracking-wider text-white uppercase leading-none">
                {info.portalTitle || 'POLARIS'}
              </span>
              <span
                className="text-[9px] uppercase tracking-[0.25em] font-semibold mt-1"
                style={{ color: info.primaryColor }}
              >
                PARLEMEN &amp; ADVOKASI
              </span>
            </div>
          </Link>

          {/* Nav Items (Beranda, Profil, Artikel, Infografis, Kontak) */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-xs sm:text-sm font-semibold tracking-wide">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={href(item.href)}
                  className={`relative py-1 transition-all ${
                    isActive ? 'font-bold' : 'text-neutral-300 hover:text-white'
                  }`}
                  style={isActive ? { color: info.primaryColor } : {}}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: info.primaryColor }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Instagram Pill Button + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <a
              href={`https://instagram.com/${info.instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Resmi"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none"
              style={{
                background:
                  'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span className="truncate max-w-[100px] xs:max-w-[130px] sm:max-w-none">
                @{info.instagramUsername}
              </span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#252525] px-6 py-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={href(item.href)}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 text-sm font-semibold tracking-wide border-b border-white/5 ${
                  activePage === item.id ? 'font-bold' : 'text-neutral-200'
                }`}
                style={activePage === item.id ? { color: info.primaryColor } : {}}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ─── MASTHEAD (FOR SUB-PAGES) ─── */}
      {showMasthead && pageTitle && (
        <section className="relative bg-[#252525] border-b border-white/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-[#FFA800]/10 blur-[130px] pointer-events-none" />
          <div className="relative max-w-[1240px] mx-auto px-6 lg:px-10 py-14 sm:py-20">
            <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-4 font-medium">
              <Link href={href('/')} className="hover:text-white transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-[#FFA800] font-semibold">{breadcrumbTitle || pageTitle}</span>
            </nav>

            {pageBadge && (
              <div className="inline-flex items-center px-3 py-1 rounded bg-[#FFA800]/15 border border-[#FFA800]/40 text-[#FFA800] text-xs font-bold uppercase tracking-wider mb-3">
                <span>{pageBadge}</span>
              </div>
            )}

            <h1 className="font-outfit font-extrabold text-3xl sm:text-5xl text-white uppercase tracking-tight leading-tight max-w-3xl">
              {pageTitle}
            </h1>

            {pageSubtitle && (
              <p className="mt-4 text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
                {pageSubtitle}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 w-full">{children}</main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#181818] border-t border-white/10 text-neutral-400 pt-14 pb-8">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
            {/* Col 1: Identity */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded bg-[#FFA800] flex items-center justify-center text-[#1E1E1E]">
                  <Landmark className="w-4 h-4 font-bold" />
                </span>
                <span className="font-outfit font-extrabold text-xl text-white uppercase tracking-wider">
                  {info.officialFullName}
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-md">
                Anggota {info.legislativeLevel} · {info.party} · Daerah Pemilihan {info.dapil}.
                Berkomitmen menghadirkan advokasi kebijakan berbasis data dan akuntabilitas terbuka untuk seluruh warga.
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Navigasi Cepat
              </h4>
              <ul className="space-y-2 text-xs">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={href(item.href)}
                      className="hover:text-[#FFA800] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Contact & Posko */}
            <div className="md:col-span-4 space-y-2 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Posko Aspirasi Rakyat
              </h4>
              <p className="text-neutral-300">
                Email: <span className="text-white font-medium">{info.officialEmail}</span>
              </p>
              <p className="text-neutral-300">
                WhatsApp: <span className="text-white font-medium">{info.officialPhone}</span>
              </p>
              <p className="text-neutral-300">
                Dapil: <span className="text-white font-medium">{info.dapil}</span>
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <p>© {new Date().getFullYear()} {info.officialFullName}. Seluruh Hak Cipta Dilindungi.</p>
            <p className="flex items-center gap-1.5">
              <span>Platform Portal Advokasi</span>
              <strong className="text-white font-bold tracking-wider">POLARIS</strong>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
