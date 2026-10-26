'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Instagram,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export interface QurifolioShellProps {
  member: any;
  theme?: any;
  subdomain?: string;
  activePage: 'beranda' | 'profil' | 'artikel' | 'infografis' | 'kontak';
  breadcrumbTitle?: string;
  pageBadge?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  headerImage?: string;
  children: React.ReactNode;
  showMasthead?: boolean;
}

export function QurifolioShell({
  member,
  theme,
  subdomain,
  activePage,
  breadcrumbTitle,
  pageBadge,
  pageTitle,
  pageSubtitle,
  headerImage,
  children,
  showMasthead = true,
}: QurifolioShellProps) {
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
  const officialEmail = `aspirasi@${subdomain || 'ahmadfauzi'}.polaris.id`;
  const officialPhone = '+62 812-9876-5432';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'ahmadfauzi';

  const defaultHeaderImages: Record<string, string> = {
    profil: '/images/qurifolio/header-profil-bg.jpg',
    artikel: '/images/qurifolio/header-artikel-bg.jpg',
    infografis: '/images/qurifolio/header-infografis-bg.jpg',
    kontak: '/images/qurifolio/header-kontak-bg.jpg',
  };
  const bgImage = headerImage || defaultHeaderImages[activePage] || '/images/qurifolio/header-profil-bg.jpg';

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
      return { cleanName: 'Ahmad Fauzi', firstName: 'Ahmad', lastName: 'Fauzi', brandName: 'Ahmad Fauzi' };
    }
    let clean = fullName.split(',')[0].trim();
    while (/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i.test(clean)) {
      clean = clean.replace(/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i, '').trim();
    }
    const words = clean.split(/\s+/).filter(Boolean);
    const firstName = words[0] || 'Ahmad';
    const lastName = words.length > 1 ? words.slice(1).join(' ') : 'Fauzi';

    return {
      cleanName: clean || 'Ahmad Fauzi',
      firstName,
      lastName,
      brandName: clean || 'Ahmad Fauzi',
    };
  }

  const { firstName, brandName } = parseCleanIdentity(member?.fullName);

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '/' },
    { id: 'profil', label: 'Profil', href: '/profil' },
    { id: 'artikel', label: 'Artikel', href: '/artikel' },
    { id: 'infografis', label: 'Infografis', href: '/infografis' },
    { id: 'kontak', label: 'Kontak', href: '/kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#161616] font-sans selection:bg-[#FF6B00] selection:text-white overflow-x-hidden">
      
      {/* ─── STICKY NAVBAR (PERSIS PADA GAMBAR) ─── */}
      <header className="sticky top-0 z-50 bg-[#F4EFEA]/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand: Orange Asterisk Icon + Member Name */}
          <Link
            href={getNavLinkHref('/')}
            className="flex items-center gap-2.5 select-none group"
          >
            {/* Brand: Orange Asterisk Icon + Member Name */}
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center font-black shadow-md group-hover:rotate-45 transition-transform duration-300 p-1.5">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                <g fill="white">
                  <rect x="41.75" y="4" width="16.5" height="92" />
                  <rect x="4" y="41.75" width="92" height="16.5" />
                  <rect x="41.75" y="4" width="16.5" height="92" transform="rotate(45 50 50)" />
                  <rect x="41.75" y="4" width="16.5" height="92" transform="rotate(135 50 50)" />
                </g>
              </svg>
            </div>
            <span className="font-extrabold text-lg sm:text-xl text-[#161616] tracking-tight group-hover:text-[#FF6B00] transition-colors">
              {brandName}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-sm font-bold tracking-wider uppercase text-stone-700">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={getNavLinkHref(item.href)}
                  className={`flex items-center gap-1 transition-colors ${
                    isActive
                      ? 'text-[#FF6B00]'
                      : 'hover:text-[#FF6B00]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id !== 'kontak' && (
                    <ChevronDown className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF6B00] opacity-80' : 'opacity-40'}`} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Instagram Pill Button & Mobile Hamburger */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-bold text-xs shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none shrink-0"
              style={{
                background: 'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="truncate max-w-[85px] sm:max-w-none">@{instagramUsername}</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-black rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#F4EFEA] border-b border-stone-200 px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.href}
                  href={getNavLinkHref(item.href)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'text-[#FF6B00] bg-orange-50 font-black'
                      : 'text-stone-800 hover:text-[#FF6B00] hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* ─── HERO HEADER BANNER (PERSIS LAYOUT GAMBAR REFERENSI PT FASINDO) ─── */}
      {showMasthead && (
        <section className="relative w-full overflow-hidden bg-[#0A1118] border-b border-stone-800">
          {/* Background Image with Dark Scrim Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={bgImage}
              alt={pageTitle || 'Header Background'}
              className="w-full h-full object-cover object-center"
            />
            {/* Dark Cinematic Gradient Scrim matching reference image */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070D18]/95 via-[#0A1424]/85 to-[#0F1D32]/65" />
            <div className="absolute inset-0 bg-[#070D18]/40" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28 lg:py-32">
            <div className="max-w-4xl space-y-3.5 sm:space-y-4">
              {/* Breadcrumbs: Beranda > [Page] */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wider pb-1">
                <Link
                  href={getNavLinkHref('/')}
                  className="text-[#FF6B00] hover:text-[#ff8533] hover:underline transition-colors"
                >
                  Beranda
                </Link>
                <span className="text-stone-400 font-normal">&gt;</span>
                <span className="text-stone-200">
                  {breadcrumbTitle || (activePage === 'profil' ? 'Tentang' : activePage.charAt(0).toUpperCase() + activePage.slice(1))}
                </span>
              </div>

              {/* Sub-label Badge (PROFIL PT FASINDO style) */}
              {pageBadge && (
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#FF6B00] block">
                  {pageBadge}
                </span>
              )}

              {/* Big Bold White Headline */}
              {pageTitle && (
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                  {pageTitle}
                </h1>
              )}

              {/* Description Paragraph */}
              {pageSubtitle && (
                <p className="text-stone-200/90 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed font-normal pt-1">
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {children}
      </main>

      {/* ─── SLEEK DARK FOOTER (PERSIS TEMA SECTION 2 HITAM) ─── */}
      <footer className="bg-[#181818] text-stone-400 py-16 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-stone-800">
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center font-black p-1">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
                    <g fill="white">
                      <rect x="41.75" y="4" width="16.5" height="92" />
                      <rect x="4" y="41.75" width="92" height="16.5" />
                      <rect x="41.75" y="4" width="16.5" height="92" transform="rotate(45 50 50)" />
                      <rect x="41.75" y="4" width="16.5" height="92" transform="rotate(135 50 50)" />
                    </g>
                  </svg>
                </div>
                <span className="text-lg font-bold text-white tracking-wider">
                  {brandName}
                </span>
              </div>
              <p className="text-xs text-stone-400 max-w-md leading-relaxed">
                Portal resmi akuntabilitas keparlemenan {officialFullName}. Menjunjung tinggi transparansi, dedikasi penuh, dan keterbukaan akses bagi seluruh konstituen Daerah Pemilihan {dapil}.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Tautan</h4>
              <p><Link href={getNavLinkHref('/')} className="hover:text-[#FF6B00]">Beranda</Link></p>
              <p><Link href={getNavLinkHref('/profil')} className="hover:text-[#FF6B00]">Profil & Rekam Jejak</Link></p>
              <p><Link href={getNavLinkHref('/artikel')} className="hover:text-[#FF6B00]">Gagasan & Artikel</Link></p>
              <p><Link href={getNavLinkHref('/infografis')} className="hover:text-[#FF6B00]">Infografis Layanan</Link></p>
              <p><Link href={getNavLinkHref('/kontak')} className="hover:text-[#FF6B00]">Kontak Resmi</Link></p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Kontak Parlemen</h4>
              <p>Sekretariat Fraksi DPR RI Senayan, Jakarta Pusat</p>
              <p className="text-[#FF6B00]">{officialPhone}</p>
              <p className="text-white/60">{officialEmail}</p>
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
