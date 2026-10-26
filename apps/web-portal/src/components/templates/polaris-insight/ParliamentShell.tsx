'use client';

import React, { useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  X,
  Menu,
  Instagram,
  ShieldCheck,
  CheckCircle2,
  Send,
  Building2,
  MapPin,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Phone,
  MessageCircle,
} from 'lucide-react';

interface ParliamentShellContextType {
  openSearchModal: () => void;
}

const ParliamentShellContext = createContext<ParliamentShellContextType>({
  openSearchModal: () => {},
});

export const useParliamentShell = () => useContext(ParliamentShellContext);

export interface ParliamentShellProps {
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

export function ParliamentShell({
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
}: ParliamentShellProps) {
  // 1. Data Resolvers
  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Dr. Ir. Sangsoro Mowo Berkah, M.Sc.';

  const partyName = member?.partyAffiliation || 'Fraksi Parlemen';
  const dapilName =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
  const heroBannerUrl =
    theme?.heroBannerUrl || '/images/parliament-panoramic-banner.png';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'ahmadfauzi';

  // State Management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  const pathname = usePathname();

  const getNavLinkHref = (path: string) => {
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      return path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    return path;
  };

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '/' },
    { id: 'profil', label: 'Profil', href: '/profil' },
    { id: 'artikel', label: 'Artikel', href: '/artikel' },
    { id: 'infografis', label: 'Infografis', href: '/infografis' },
    { id: 'kontak', label: 'Kontak', href: '/kontak' },
  ];

  return (
    <ParliamentShellContext.Provider
      value={{
        openSearchModal: () => setSearchModalOpen(true),
      }}
    >
      <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#96702c]/20 selection:text-[#96702c] flex flex-col justify-between">
        {/* ========================================================= */}
        {/* TOP FLOATING NAVBAR (Signature POLARIS Negarawan Parlemen) */}
        {/* ========================================================= */}
        <header className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
          <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/90 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 pointer-events-auto transition-all">
            {/* Sisi Kiri: Lambang Garuda Parlemen + Nama Anggota */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/parliament-emblem.png"
                alt="Lambang Parlemen DPR RI"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 drop-shadow-xs hover:scale-105 transition-transform"
              />
              <Link
                href={getNavLinkHref('/')}
                className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate max-w-[190px] sm:max-w-xs md:max-w-sm hover:text-[#96702c] transition-colors"
              >
                {officialFullName}
              </Link>
            </div>

            {/* Sisi Tengah: Menu Navigasi (Hanya tampil di Desktop lg: agar tidak overlap di Tablet md) */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs sm:text-[13px] font-semibold tracking-wide text-slate-600 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                const targetHref = getNavLinkHref(item.href);

                return isActive ? (
                  <Link
                    key={item.id}
                    href={targetHref}
                    className="relative py-1 text-slate-950 font-bold group flex flex-col items-center"
                  >
                    <span>{item.label}</span>
                    <span className="w-full h-0.5 bg-[#96702c] rounded-full mt-1 animate-in fade-in" />
                  </Link>
                ) : (
                  <Link
                    key={item.id}
                    href={targetHref}
                    className="hover:text-[#96702c] transition-colors py-1"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Sisi Kanan: Search Icon + Instagram Pill Button + Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Search Trigger Button */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="p-1.5 sm:p-2 rounded-full text-slate-500 hover:text-[#96702c] hover:bg-amber-50/80 transition-colors cursor-pointer"
                aria-label="Pencarian Portal"
                title="Cari artikel, regulasi, atau isu"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Instagram Pill Button */}
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-bold text-xs sm:text-[13px] shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none shrink-0"
                style={{
                  background:
                    'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
                }}
              >
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                <span className="hidden sm:inline truncate max-w-[90px] sm:max-w-none">@{instagramUsername}</span>
              </a>

              {/* Mobile / Tablet Drawer Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile & Tablet Dropdown Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden max-w-7xl mx-auto mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-4 space-y-1.5 pointer-events-auto animate-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col space-y-1 text-xs sm:text-sm font-bold text-slate-700">
                {navItems.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={getNavLinkHref(item.href)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3.5 py-2.5 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-amber-50 text-[#96702c] font-black flex items-center justify-between'
                          : 'hover:bg-slate-50 text-slate-700 hover:text-[#96702c]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#96702c]" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </header>

        {/* ========================================================= */}
        {/* SUBPAGE MASTHEAD BANNER (Panoramic Parliament Architectural)*/}
        {/* ========================================================= */}
        {showMasthead && (
          <section className="relative pt-24 sm:pt-28 pb-10 sm:pb-12 bg-slate-950 overflow-hidden text-white border-b border-amber-900/40">
            {/* Background Image Parlemen dengan Dark Gradient Overlay */}
            <div className="absolute inset-0 pointer-events-none select-none z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroBannerUrl}
                alt="Banner Parlemen DPR RI"
                className="w-full h-full object-cover object-center opacity-30 filter brightness-90 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/90" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-3.5">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Link href={getNavLinkHref('/')} className="hover:text-amber-400 transition-colors">
                  Beranda
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-amber-400 font-bold">
                  {breadcrumbTitle || pageTitle || 'Halaman'}
                </span>
              </div>

              {/* Page Badge Pill */}
              {pageBadge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#96702c]/20 text-amber-300 border border-[#96702c]/40 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{pageBadge}</span>
                </div>
              )}

              {/* Page Heading & Subtitle */}
              <div className="max-w-3xl space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
                    {pageTitle}
                  </h1>
                  <span className="hidden sm:inline-block w-10 h-1 bg-[#96702c] rounded-full" />
                </div>
                {pageSubtitle && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    {pageSubtitle}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* MAIN BODY CONTENT                                         */}
        {/* ========================================================= */}
        <div className="flex-1 w-full">{children}</div>

        {/* ========================================================= */}
        {/* FOOTER RESMI KENEGARAAN                                   */}
        {/* ========================================================= */}
        <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-xs">
              {/* Kolom 1: Profil */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/parliament-emblem.png"
                    alt="Lambang Parlemen DPR RI"
                    className="w-7 h-7 object-contain drop-shadow-sm brightness-110"
                  />
                  <span className="font-bold text-sm text-white tracking-tight">
                    {officialFullName}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                  Website resmi akuntabilitas kerja parlemen dan saluran aspirasi konstituen Daerah Pemilihan {dapilName} • {partyName}.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href={getNavLinkHref('/kontak')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#96702c] hover:bg-[#805f24] text-white text-[11px] font-bold transition shadow-xs cursor-pointer"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Kontak &amp; Aspirasi</span>
                  </Link>
                  <a
                    href="https://wa.me/?text=Halo%20Sekretariat%20Dewan,%20saya%20ingin%20mengajukan%20aspirasi."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition border border-slate-700 cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-400" />
                    <span>WhatsApp Staf Ahli</span>
                  </a>
                </div>
              </div>

              {/* Kolom 2: Navigasi Cepat */}
              <div className="space-y-2">
                <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  Navigasi Cepat
                </div>
                <ul className="space-y-1.5 text-slate-400">
                  <li>
                    <Link href={getNavLinkHref('/')} className="hover:text-amber-400 transition-colors">
                      Beranda Utama
                    </Link>
                  </li>
                  <li>
                    <Link href={getNavLinkHref('/profil')} className="hover:text-amber-400 transition-colors">
                      Profil & Rekam Jejak
                    </Link>
                  </li>
                  <li>
                    <Link href={getNavLinkHref('/artikel')} className="hover:text-amber-400 transition-colors">
                      Katalog Artikel
                    </Link>
                  </li>
                  <li>
                    <Link href={getNavLinkHref('/infografis')} className="hover:text-amber-400 transition-colors">
                      Infografis Capaian
                    </Link>
                  </li>
                  <li>
                    <Link href={getNavLinkHref('/kontak')} className="hover:text-amber-400 transition-colors">
                      Kontak & Sekretariat
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Kolom 3: Layanan & Bantuan */}
              <div className="space-y-2">
                <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  Layanan & Bantuan
                </div>
                <ul className="space-y-1.5 text-slate-400">
                  <li>
                    <Link
                      href={getNavLinkHref('/kontak')}
                      className="hover:text-amber-400 transition-colors text-left"
                    >
                      Kanal Kontak & Sekretariat
                    </Link>
                  </li>
                  <li>
                    <a
                      href={`https://instagram.com/${instagramUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-amber-400 transition-colors"
                    >
                      Instagram Resmi @{instagramUsername}
                    </a>
                  </li>
                  <li>
                    <Link href={getNavLinkHref('/infografis')} className="hover:text-amber-400 transition-colors">
                      Laporan Kinerja & Triwulan
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://wa.me/?text=Halo%20Sekretariat%20Dewan,%20saya%20ingin%20mengajukan%20aspirasi."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-amber-400 transition-colors flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-400" />
                      <span>WhatsApp Hotline Dewan</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
              <div>
                © {new Date().getFullYear()} {officialFullName}. Seluruh Hak Dilindungi Undang-Undang.
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sistem Informasi Portal POLARIS Negarawan</span>
              </div>
            </div>
          </div>
        </footer>

        {/* ========================================================= */}
        {/* MODAL 1: PENCARIAN PORTAL                                 */}
        {/* ========================================================= */}
        {searchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Search className="w-4 h-4 text-[#96702c]" />
                  <span>Pencarian Portal Publik</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik topik artikel, regulasi, atau infografis..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#96702c] text-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-slate-400 font-semibold block">Topik Populer:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['UU Cipta Kerja', 'Infrastruktur Jalan', 'Pendidikan Karakter', 'APBD & Anggaran', 'UMKM'].map(
                    (t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSearchQuery(t)}
                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-amber-50 hover:text-[#96702c] text-slate-600 transition-colors cursor-pointer"
                      >
                        {t}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="pt-2 text-right">
                <Link
                  href={`/artikel?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setSearchModalOpen(false)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#96702c] text-white text-xs font-bold hover:bg-[#805f24] transition-colors"
                >
                  <span>Lihat Hasil</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}


      </div>
    </ParliamentShellContext.Provider>
  );
}
