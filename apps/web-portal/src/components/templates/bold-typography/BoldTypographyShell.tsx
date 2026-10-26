'use client';

import React, { useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  Menu,
  Instagram,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react';

interface BoldTypographyShellContextType {
  openSearchModal: () => void;
}

const BoldTypographyShellContext = createContext<BoldTypographyShellContextType>({
  openSearchModal: () => {},
});

export const useBoldTypographyShell = () => useContext(BoldTypographyShellContext);

export interface BoldTypographyShellProps {
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

export function BoldTypographyShell({
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
}: BoldTypographyShellProps) {
  const primaryColor = theme?.primaryHexColor || '#DC2626';
  const officialFullName = member?.fullName || theme?.officialFullName || 'Wakil Rakyat';
  const watermarkText = theme?.layoutSchema?.watermarkText || theme?.watermarkText || 'PARLEMEN';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'ahmadfauzi';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    <BoldTypographyShellContext.Provider
      value={{
        openSearchModal: () => setSearchModalOpen(true),
      }}
    >
      <div className="min-h-screen bg-[#070707] text-slate-100 font-sans selection:bg-red-600 selection:text-white flex flex-col justify-between">
        {/* ─── STICKY NAVBAR (MATCHING BOLD RED TYPOGRAPHY) ─── */}
        <header className="border-b border-white/10 bg-[#070707]/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
            {/* Left: Brand Monogram / Avatar */}
            <Link href={getNavLinkHref('/')} className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-full text-white font-black flex items-center justify-center text-xs shadow-md shrink-0 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: primaryColor }}
              >
                {member?.fullName ? member.fullName.charAt(0) : 'P'}
              </div>
              <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[150px] sm:max-w-xs group-hover:text-red-400 transition-colors">
                {officialFullName}
              </span>
            </Link>

            {/* Centered Navigation (Desktop) */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-xs sm:text-sm font-medium tracking-wide text-slate-300 md:absolute md:left-1/2 md:-translate-x-1/2">
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                const targetHref = getNavLinkHref(item.href);

                return isActive ? (
                  <Link
                    key={item.id}
                    href={targetHref}
                    className="text-white font-semibold border-b-[2.5px] pb-1 transition-colors"
                    style={{ borderColor: primaryColor }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    key={item.id}
                    href={targetHref}
                    className="text-slate-400 hover:text-white border-b-[2.5px] border-transparent hover:border-slate-500 pb-1 transition-all"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Search + Instagram Pill + Hamburger */}
            <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Cari risalah kebijakan"
                title="Cari risalah atau artikel"
              >
                <Search className="w-4 h-4" />
              </button>

              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-bold text-[11px] sm:text-xs md:text-sm shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none"
                style={{
                  background: 'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
                }}
              >
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                <span className="truncate max-w-[80px] xs:max-w-[110px] sm:max-w-none">@{instagramUsername}</span>
              </a>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Buka menu navigasi"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 bg-[#070707]/98 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col space-y-1 text-sm font-semibold">
                {navItems.map((item) => {
                  const isActive = activePage === item.id;
                  const targetHref = getNavLinkHref(item.href);

                  return (
                    <Link
                      key={item.id}
                      href={targetHref}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        isActive
                          ? 'bg-red-600/20 text-white border-l-4 border-red-600'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="text-[10px] font-mono text-red-400 font-bold">AKTIF</span>}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 bg-white/5 hover:bg-white/10 text-xs font-mono"
                >
                  <Search className="w-4 h-4 text-red-500" />
                  <span>Cari Risalah &amp; Dokumen...</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* ─── MASTHEAD BANNER FOR SUBPAGES ─── */}
        {showMasthead && (
          <div className="relative overflow-hidden bg-[#060606] border-b border-white/10 pt-8 sm:pt-12 pb-10 sm:pb-14">
            {/* GIANT RED BACKGROUND WATERMARK TYPOGRAPHY */}
            <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none select-none overflow-hidden z-0">
              <span
                className="font-bebas text-[18vw] sm:text-[20vw] font-black uppercase tracking-tight leading-none text-center block opacity-30 select-none whitespace-nowrap"
                style={{
                  backgroundImage: `linear-gradient(180deg, ${primaryColor} 0%, #B91C1C 45%, #7F1D1D 85%, #450A0A 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {watermarkText}
              </span>
            </div>

            {/* Ambient Red Glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] h-[350px] rounded-full blur-[110px] pointer-events-none opacity-20"
              style={{ backgroundColor: primaryColor }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Link href={getNavLinkHref('/')} className="hover:text-white transition-colors">
                  BERANDA
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-red-400 font-bold uppercase">{breadcrumbTitle || activePage}</span>
              </div>

              {/* Page Badge */}
              {pageBadge && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-[11px] font-mono font-bold text-red-400 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>{pageBadge}</span>
                </div>
              )}

              {/* Page Title & Subtitle */}
              <div className="space-y-2">
                <h1 className="font-bebas text-4xl sm:text-6xl md:text-7xl font-black text-white uppercase tracking-tight leading-[0.9]">
                  {pageTitle || breadcrumbTitle || activePage}
                </h1>
                {pageSubtitle && (
                  <p className="text-xs sm:text-sm md:text-base text-slate-300/80 max-w-3xl font-normal leading-relaxed">
                    {pageSubtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 bg-[#070707]">{children}</main>

        {/* ─── BRUTALIST DARK FOOTER (MATCHING DESIGN 2) ─── */}
        <footer className="py-16 bg-[#050505] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/10 pb-12">
              <div className="lg:col-span-7 space-y-3">
                <span className="text-xs font-mono uppercase text-red-500 tracking-widest block font-bold">
                  BERSAMA MEMBANGUN DAPIL
                </span>
                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white uppercase leading-tight">
                  SUARAKAN ASPIRASI BERSAMA
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
                  Pintu kantor dan ruang aspirasi senantiasa terbuka untuk kritik, masukan kebijakan, dan pendampingan warga konstituen.
                </p>
                <div className="pt-2">
                  <Link
                    href={getNavLinkHref('/kontak')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-mono font-bold text-xs uppercase tracking-wider transition-all hover:opacity-90 active:scale-95 shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>KIRIM ASPIRASI RESMI</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3 font-mono text-xs text-slate-300">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-red-600/30 transition-colors">
                  <Mail className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="truncate">aspirasi@{subdomain || 'dewan'}.polaris.id</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-red-600/30 transition-colors">
                  <Phone className="w-4 h-4 text-red-500 shrink-0" />
                  <span>+62 812-9876-5432 (Hotline Resmi Staf Ahli)</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-red-600/30 transition-colors">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Gedung Nusantara I DPR RI, Jakarta Pusat</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
              <div>
                &copy; {new Date().getFullYear()} {officialFullName}. PROTOKOL KEBIJAKAN PARLEMEN POLARIS.
              </div>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-white transition-colors">
                  TWITTER
                </a>
                <a
                  href={`https://instagram.com/${instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  INSTAGRAM
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  LINKEDIN
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* ─── SEARCH MODAL ─── */}
        {searchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-6 relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-red-500 font-bold uppercase tracking-widest">
                  <Search className="w-4 h-4" />
                  <span>PENCARIAN ARTIKEL &amp; DOKUMEN</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik kata kunci (misal: Cipta Kerja, Infrastruktur, APBN, Reses)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Topik Cepat Populer:</div>
                <div className="flex flex-wrap gap-2">
                  {['UU Cipta Kerja', 'Anggaran Pendidikan', 'Infrastruktur Jalan', 'Pupuk Subsidi', 'Rancangan Perda'].map(
                    (tag) => (
                      <Link
                        key={tag}
                        href={getNavLinkHref(`/artikel?q=${encodeURIComponent(tag)}`)}
                        onClick={() => setSearchModalOpen(false)}
                        className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-red-600/20 hover:border-red-500/50 border border-white/5 text-xs text-slate-300 hover:text-white font-mono transition-colors"
                      >
                        #{tag}
                      </Link>
                    )
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  href={getNavLinkHref(searchQuery ? `/artikel?q=${encodeURIComponent(searchQuery)}` : '/artikel')}
                  onClick={() => setSearchModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all"
                >
                  LIHAT HASIL PENCARIAN →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </BoldTypographyShellContext.Provider>
  );
}
