'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  MapPin,
  Menu,
  X,
  Share2,
  Instagram,
  Sparkles,
  ChevronRight,
  Home,
} from 'lucide-react';

import { resolvePortalMemberData } from '@/lib/template-resolver';

interface StudioEditorialShellProps {
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

export function StudioEditorialShell({
  member,
  theme,
  subdomain,
  activePage,
  breadcrumbTitle,
  pageBadge = 'MANDAT & PENGABDIAN RAKYAT',
  pageTitle,
  pageSubtitle,
  showMasthead = true,
  children,
}: StudioEditorialShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');
  const previewColor = searchParams?.get('preview_color');

  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#252422',
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

  const monogram = firstName ? firstName.charAt(0).toUpperCase() : 'P';

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
    { key: 'profil', label: 'Tentang', href: '/profil' },
    { key: 'artikel', label: 'Risalah', href: '/artikel' },
    { key: 'infografis', label: 'Infografis', href: '/infografis' },
    { key: 'kontak', label: 'Kontak', href: '/kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#EDEAE4] text-stone-900 font-sans selection:bg-stone-900 selection:text-white antialiased flex flex-col justify-between">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          1. TOP NAVIGATION BAR (CAPELLA EDITORIAL STUDIO HEADER)
          ────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[#EDEAE4]/95 backdrop-blur-md border-b border-stone-300/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-4 sm:py-5 flex items-center justify-between">
          
          {/* Brand Monogram */}
          <Link href={getNavLinkHref('/')} className="flex items-center gap-2 group shrink-0">
            <span className="font-serif text-3xl sm:text-4xl font-black text-stone-950 tracking-tight group-hover:text-stone-600 transition-colors">
              {monogram}.
            </span>
            <div className="hidden sm:block leading-none">
              <span className="text-xs font-bold text-stone-950 block tracking-tight">
                {officialFullName}
              </span>
              <span className="text-[10px] text-stone-500 font-semibold tracking-wider uppercase">
                {legislativeLevel}
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            {navLinks.map((item) => {
              const isActive = activePage === item.key;
              return (
                <Link
                  key={item.key}
                  href={getNavLinkHref(item.href)}
                  className={`transition-colors py-1 ${
                    isActive
                      ? 'text-stone-950 font-black border-b-2 border-stone-950'
                      : 'hover:text-stone-950'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Instagram Capsule CTA & Mobile Menu Button */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-950 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-sm group"
            >
              <Instagram className="w-3.5 h-3.5 text-stone-300 group-hover:text-white transition-colors" />
              <span>Instagram</span>
              <ArrowUpRight className="w-3 h-3 text-stone-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-stone-900 hover:bg-stone-200/80 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#EDEAE4] border-b border-stone-300 px-6 py-4 space-y-2 text-xs font-bold uppercase tracking-wider text-stone-800">
            {navLinks.map((item) => (
              <Link
                key={item.key}
                href={getNavLinkHref(item.href)}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2.5 px-3 rounded-lg ${
                  activePage === item.key
                    ? 'bg-stone-950 text-white'
                    : 'hover:bg-stone-200 text-stone-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-stone-300/80">
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-stone-200/70 text-stone-900"
              >
                <span>Instagram Resmi</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. MASTHEAD / SUBPAGE HERO BANNER
          ────────────────────────────────────────────────────────────────────────── */}
      {showMasthead && (
        <section className="border-b border-stone-300/80 bg-[#F9F8F5] py-12 sm:py-16 px-6 sm:px-10 lg:px-16">
          <div className="max-w-7xl mx-auto space-y-4">
            
            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">
              <Link href={getNavLinkHref('/')} className="hover:text-stone-950 flex items-center gap-1">
                <Home className="w-3 h-3" />
                <span>Beranda</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-stone-400" />
              <span className="text-stone-950">{breadcrumbTitle || activePage}</span>
            </div>

            {/* Micro Badge */}
            {pageBadge && (
              <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.25em] text-stone-500">
                <span>{pageBadge}</span>
              </span>
            )}

            {/* Page Title & Subtitle */}
            <div className="max-w-4xl space-y-3">
              {pageTitle && (
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-950 leading-[1.15] tracking-tight">
                  {pageTitle}
                </h1>
              )}
              {pageSubtitle && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans max-w-2xl">
                  {pageSubtitle}
                </p>
              )}
            </div>

            {/* Mandate Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-200/70 text-stone-800 text-[11px] font-bold tracking-wider uppercase rounded-sm">
                <Building2 className="w-3 h-3 text-stone-600" />
                <span>{legislativeLevel} • {party}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-200/70 text-stone-800 text-[11px] font-bold tracking-wider uppercase rounded-sm">
                <MapPin className="w-3 h-3 text-stone-600" />
                <span>Dapil: {dapil}</span>
              </span>
            </div>

          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          3. MAIN CONTENT
          ────────────────────────────────────────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. FOOTER (WARM EDITORIAL STONE - EXACT MATCH CAPELLA)
          ────────────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-stone-300 bg-[#E2DDD5] py-16 sm:py-20 px-6 sm:px-10 lg:px-16 text-stone-900 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-serif text-3xl font-black text-stone-950 tracking-tight">
                  {monogram}.
                </span>
                <span className="text-lg font-bold text-stone-950 tracking-tight">
                  {officialFullName}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm">
                Portal komunikasi, transparansi kebijakan, dan saluran advokasi aspirasi konstituen Daerah Pemilihan {dapil}.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-stone-300 hover:border-stone-950 hover:text-stone-950 text-stone-700 flex items-center justify-center transition-all shadow-2xs"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${officialEmail}`}
                className="w-9 h-9 rounded-full bg-white border border-stone-300 hover:border-stone-950 hover:text-stone-950 text-stone-700 flex items-center justify-center transition-all shadow-2xs"
                title="Email Aspirasi"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-4">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700 font-medium">
              <li>
                <Link href={getNavLinkHref('/')} className="hover:text-stone-950 transition-colors">
                  Beranda Utama
                </Link>
              </li>
              <li>
                <Link href={getNavLinkHref('/profil')} className="hover:text-stone-950 transition-colors">
                  Tentang & Rekam Jejak
                </Link>
              </li>
              <li>
                <Link href={getNavLinkHref('/artikel')} className="hover:text-stone-950 transition-colors">
                  Risalah & Kajian
                </Link>
              </li>
              <li>
                <Link href={getNavLinkHref('/infografis')} className="hover:text-stone-950 transition-colors">
                  Infografis Transparansi
                </Link>
              </li>
              <li>
                <Link href={getNavLinkHref('/kontak')} className="hover:text-stone-950 transition-colors">
                  Saluran Aspirasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Parliamentary Mandate */}
          <div className="md:col-span-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-4">
              Mandat Konstituen
            </h4>
            <div className="p-4 rounded-xl bg-white/80 border border-stone-300 text-xs text-stone-700 space-y-2">
              <div className="flex items-center gap-2 text-stone-950 font-bold">
                <Building2 className="w-4 h-4 text-stone-700" />
                <span>{legislativeLevel}</span>
              </div>
              <p className="text-stone-600">
                {commissionName} • {party}
              </p>
              <div className="pt-2 border-t border-stone-200 flex items-center gap-1.5 text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-stone-700" />
                <span>Daerah Pemilihan: {dapil}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            © {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-950" />
            <span>Didukung oleh POLARIS Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
