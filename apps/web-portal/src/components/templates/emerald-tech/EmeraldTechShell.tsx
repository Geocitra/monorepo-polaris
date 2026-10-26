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

export interface EmeraldTechShellProps {
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

export function EmeraldTechShell({
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
}: EmeraldTechShellProps) {
  const officialFullName = member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
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
    <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-[#00DF82] selection:text-black overflow-x-hidden">
      
      {/* ─── STICKY NAVBAR ─── */}
      <header className="sticky top-0 z-50 bg-[#111111]/95 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand: [Initial Circle] Name */}
          <Link
            href={getNavLinkHref('/')}
            className="flex items-center gap-2.5 select-none group"
          >
            <div className="w-8 h-8 rounded-full bg-[#00DF82] text-black font-black flex items-center justify-center text-xs shadow-md group-hover:scale-105 transition-transform">
              {initial}
            </div>
            <span className="font-extrabold text-base sm:text-lg text-white tracking-wider group-hover:text-[#00DF82] transition-colors">
              {firstName} <span className="text-[#00DF82]">{lastName || 'Parlemen'}</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-xs sm:text-sm font-bold tracking-widest uppercase">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={getNavLinkHref(item.href)}
                  className={`transition-colors ${
                    isActive
                      ? 'text-[#00DF82]'
                      : 'text-white hover:text-[#00DF82]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Instagram Pill Button & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all select-none"
              style={{
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Instagram</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#161616] border-b border-white/[0.08] px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.href}
                  href={getNavLinkHref(item.href)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'text-[#00DF82] bg-white/[0.06]'
                      : 'text-white hover:text-[#00DF82] hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/[0.08]">
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white hover:bg-white/[0.04] transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#e6683c]" />
                <span>Instagram Resmi</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ─── MASTHEAD BANNER (IF ENABLED) ─── */}
      {showMasthead && (
        <section className="relative overflow-hidden pt-14 pb-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
          <div className="space-y-4">
            {/* Breadcrumb without // */}
            <div className="flex items-center gap-2 text-xs font-bold text-stone-400 tracking-wider">
              <Link href={getNavLinkHref('/')} className="hover:text-white transition-colors">
                BERANDA
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#00DF82]" />
              <span className="text-[#00DF82] font-black">{breadcrumbTitle?.toUpperCase() || activePage.toUpperCase()}</span>
            </div>

            {pageBadge && (
              <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-[#00DF82]">
                {pageBadge}
              </span>
            )}

            {pageTitle && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase">
                {pageTitle}
              </h1>
            )}

            {pageSubtitle && (
              <p className="text-stone-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
                {pageSubtitle}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {children}
      </main>

      {/* ─── SLEEK DARK FOOTER ─── */}
      <footer className="bg-[#0c0c0c] text-stone-400 py-16 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/[0.08]">
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#00DF82] text-black font-black flex items-center justify-center text-xs">
                  {initial}
                </div>
                <span className="text-lg font-bold text-white tracking-wider">
                  {firstName} <span className="text-[#00DF82]">{lastName || 'Parlemen'}</span>
                </span>
              </div>
              <p className="text-xs text-stone-400 max-w-md leading-relaxed">
                Portal resmi akuntabilitas keparlemenan {officialFullName}. Menjunjung tinggi transparansi, dedikasi penuh, dan keterbukaan akses bagi seluruh konstituen.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Tautan</h4>
              <p><Link href={getNavLinkHref('/')} className="hover:text-[#00DF82]">Beranda</Link></p>
              <p><Link href={getNavLinkHref('/profil')} className="hover:text-[#00DF82]">Profil & Rekam Jejak</Link></p>
              <p><Link href={getNavLinkHref('/artikel')} className="hover:text-[#00DF82]">Gagasan & Artikel</Link></p>
              <p><Link href={getNavLinkHref('/infografis')} className="hover:text-[#00DF82]">Infografis Layanan</Link></p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Kontak Parlemen</h4>
              <p>Sekretariat Fraksi DPR RI Senayan, Jakarta Pusat</p>
              <p className="text-[#00DF82]">+62 812-9876-5432</p>
              <p className="text-white/60">aspirasi@polaris.id</p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="text-stone-600">Powered by POLARIS Parlemen Engine</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
