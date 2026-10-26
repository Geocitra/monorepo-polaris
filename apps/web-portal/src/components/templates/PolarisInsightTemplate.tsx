'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRight,
  Search,
  X,
  Menu,
  ShieldCheck,
  CheckCircle2,
  Send,
  Building2,
  FileText,
  PieChart,
  Users,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Instagram,
  Calendar,
  Clock,
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface TemplateProps {
  member: any;
  theme: any;
  recentArticles?: any[];
  recentInfographics?: any[];
  documents?: any[];
  subdomain?: string;
}

export function PolarisInsightTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: TemplateProps) {
  // 1. Data Resolvers
  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Dr. Ir. Sangsoro Mowo Berkah, M.Sc.';

  const officialPhotoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-standing-full.png';

  const partyName = member?.partyAffiliation || 'Fraksi Parlemen';
  const dapilName = member?.dapilName || member?.customDapilName || 'Jawa Barat I';
  const heroBannerUrl =
    theme?.heroBannerUrl ||
    '/images/parliament-panoramic-banner.png';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'ahmadfauzi';

  // State Management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInfographic, setSelectedInfographic] = useState<any | null>(null);

  // Default Reference Articles exactly matching the reference image
  const defaultArticles = [
    {
      id: 'ref-art-1',
      title: 'Undang-Undang Cipta Kerja: Dampak bagi UMKM',
      slug: 'undang-undang-cipta-kerja-dampak-bagi-umkm',
      category: 'Ekonomi',
      date: '01 Sep 2026',
      summary:
        'Mendorong pertumbuhan ekonomi lokal melalui penyederhanaan regulasi dan dukungan bagi usaha mikro.',
      thumbnail: '/images/ref-article-1.jpg',
    },
    {
      id: 'ref-art-2',
      title: 'Program Pembangunan Infrastruktur',
      slug: 'program-pembangunan-infrastruktur',
      category: 'Infrastruktur',
      date: '30 Agu 2026',
      summary:
        'Mengawal realisasi proyek jalan dan jembatan untuk konektivitas dan kesejahteraan masyarakat.',
      thumbnail: '/images/ref-article-2.jpg',
    },
    {
      id: 'ref-art-3',
      title: 'Sosialisasi Pendidikan Karakter di Sekolah',
      slug: 'sosialisasi-pendidikan-karakter-di-sekolah',
      category: 'Pendidikan',
      date: '28 Agu 2026',
      summary:
        'Meningkatkan kualitas pendidikan dengan fokus pada nilai-nilai kebangsaan dan moralitas.',
      thumbnail: '/images/ref-article-3.jpg',
    },
  ];

  // Merge real articles if available with reference styling
  const displayArticles =
    recentArticles.length >= 3
      ? recentArticles.slice(0, 3).map((a, idx) => ({
          id: a.id || `art-${idx}`,
          title: a.title,
          slug: a.slug || `artikel-${idx}`,
          category: a.sector || (idx === 0 ? 'Ekonomi' : idx === 1 ? 'Infrastruktur' : 'Pendidikan'),
          date: a.publishedAt ? formatDateIndonesian(a.publishedAt) : defaultArticles[idx]?.date || '01 Sep 2026',
          summary: a.excerpt || a.summary || defaultArticles[idx]?.summary,
          thumbnail: a.thumbnailUrl || a.featuredImageUrl || defaultArticles[idx]?.thumbnail || '/images/ref-article-1.jpg',
        }))
      : defaultArticles;

  const pathname = usePathname();

  const getNavLinkHref = (path: string) => {
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      return path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    return path;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#96702c]/20 selection:text-[#96702c]">
      {/* ========================================================= */}
      {/* TOP FLOATING NAVBAR (Signature POLARIS Negarawan Parlemen) */}
      {/* ========================================================= */}
      <header className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/90 px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-2.5 sm:gap-3 pointer-events-auto transition-all">
          {/* Sisi Kiri: Lambang Garuda Parlemen + Nama Anggota */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/parliament-emblem.png"
              alt="Lambang Parlemen DPR RI"
              className="w-7 h-7 sm:w-9 sm:h-9 object-contain shrink-0 drop-shadow-xs hover:scale-105 transition-transform"
            />
            <Link
              href={getNavLinkHref('/')}
              className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate max-w-[140px] xs:max-w-[190px] sm:max-w-xs md:max-w-sm hover:text-[#96702c] transition-colors"
            >
              {officialFullName}
            </Link>
          </div>

          {/* Sisi Tengah: Menu Navigasi (Hanya tampil di Desktop lg: agar tidak overlap di Tablet md) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs sm:text-[13px] font-semibold tracking-wide text-slate-600 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <Link
              href={getNavLinkHref('/')}
              className="relative py-1 text-slate-950 font-bold group flex flex-col items-center"
            >
              <span>Beranda</span>
              <span className="w-full h-0.5 bg-[#96702c] rounded-full mt-1" />
            </Link>
            <Link href={getNavLinkHref('/profil')} className="hover:text-[#96702c] transition-colors py-1">
              Profil
            </Link>
            <Link href={getNavLinkHref('/artikel')} className="hover:text-[#96702c] transition-colors py-1">
              Artikel
            </Link>
            <Link href={getNavLinkHref('/infografis')} className="hover:text-[#96702c] transition-colors py-1">
              Infografis
            </Link>
            <Link href={getNavLinkHref('/kontak')} className="hover:text-[#96702c] transition-colors py-1">
              Kontak
            </Link>
          </nav>

          {/* Sisi Kanan: Instagram Pill Button + Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-bold text-xs sm:text-[13px] shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none shrink-0"
              style={{
                background: 'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span className="hidden sm:inline truncate max-w-[90px] sm:max-w-none">@{instagramUsername}</span>
            </a>

            {/* Mobile / Tablet Drawer Hamburger (Tampil di < lg) */}
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
              <Link
                href={getNavLinkHref('/')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl bg-amber-50 text-[#96702c] font-black flex items-center justify-between"
              >
                <span>Beranda</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#96702c]" />
              </Link>
              <Link
                href={getNavLinkHref('/profil')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-[#96702c]"
              >
                Profil
              </Link>
              <Link
                href={getNavLinkHref('/artikel')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-[#96702c]"
              >
                Artikel
              </Link>
              <Link
                href={getNavLinkHref('/infografis')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-[#96702c]"
              >
                Infografis
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-[#96702c]"
              >
                Kontak
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* SECTION 1: HERO PARLEMEN (PANORAMIC BANNER GEDUNG DPR RI) */}
      {/* ========================================================= */}
      <section
        id="beranda"
        className="relative min-h-[100dvh] lg:min-h-0 pt-20 sm:pt-22 md:pt-24 lg:pt-24 pb-8 md:pb-12 overflow-hidden bg-white border-b border-slate-100"
      >
        {/* TOP MASTHEAD BANNER */}
        <div className="absolute top-0 left-0 right-0 h-[215px] sm:h-[235px] md:h-[255px] lg:h-[265px] xl:h-[275px] pointer-events-none select-none z-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroBannerUrl}
            alt="Banner Parlemen DPR RI"
            className="w-full h-full object-cover object-right md:object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white/95 lg:to-transparent" />
        </div>

        {/* ========================================================= */}
        {/* KHUSUS MOBILE & TABLET (< lg): FULL 100dvh HERO */}
        {/* Layout: Tagline Atas -> GAMBAR GEDE Tengah -> ARTIKEL Bawah */}
        {/* Menjamin Section 1 tampil 100% penuh di layar awal tanpa bocor Infografis */}
        {/* ========================================================= */}
        <div className="lg:hidden w-full relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 flex flex-col justify-between flex-1 min-h-[calc(100dvh-7rem)]">
          {/* 1. TOP: Name Badge & Bold Parliamentary Headline */}
          <div className="pt-2 sm:pt-3 text-center space-y-1 sm:space-y-1.5 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-md text-amber-300 text-[10px] xs:text-[11px] font-bold tracking-wide uppercase border border-amber-400/30 shadow-xs max-w-[90%] mx-auto">
              <span className="truncate">{officialFullName}</span>
            </div>

            <h1 className="text-xs xs:text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-tight uppercase drop-shadow-xs">
              MELAYANI DENGAN INTEGRITAS.
              <span className="block text-[#96702c] mt-0.5">
                MENGABDI UNTUK RAKYAT.
              </span>
            </h1>
          </div>

          {/* 2. CENTER: GAMBAR GEDE (Foto Dewan Berdiri Gagah & Berwibawa) */}
          <div className="relative flex-1 flex items-end justify-center min-h-[220px] max-h-[44vh] xs:max-h-[46vh] sm:max-h-[50vh] my-1 sm:my-2 overflow-visible">
            {/* Ambient Gold Glow di belakang figur dewan */}
            <div className="absolute bottom-0 w-48 xs:w-60 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative h-full max-h-[38vh] xs:max-h-[42vh] sm:max-h-[48vh] drop-shadow-[0_16px_32px_rgba(0,0,0,0.24)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={officialPhotoUrl}
                alt={officialFullName}
                className="w-auto h-full max-h-[38vh] xs:max-h-[42vh] sm:max-h-[48vh] object-contain object-bottom filter contrast-[1.03]"
              />
            </div>
          </div>

          {/* 3. BOTTOM: LALU ARTIKEL TERKINI (Horizontal Swipeable Track Berkelas) */}
          <div className="shrink-0 pb-1 sm:pb-2 space-y-1.5 sm:space-y-2">
            {/* Header: ARTIKEL TERKINI — & Lihat Semua -> */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[11px] xs:text-xs sm:text-sm font-black text-slate-900 tracking-tight uppercase">
                  ARTIKEL TERKINI
                </h2>
                <span className="w-5 h-0.5 bg-[#96702c] rounded-full" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-400 hidden xs:inline">Geser artikel</span>
                <Link
                  href={getNavLinkHref('/artikel')}
                  className="text-[10px] xs:text-[11px] font-bold text-[#96702c] hover:text-[#805f24] flex items-center gap-1 transition-colors group"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Swipeable Horizontal Track: Menampilkan kartu artikel dengan format rapi tanpa memenuhi layar */}
            <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1.5 pt-0.5 snap-x snap-mandatory scrollbar-none -mx-1 px-1">
              {displayArticles.slice(0, 3).map((art) => (
                <Link
                  key={art.id}
                  href={`/artikel/${art.slug}`}
                  className="w-[82vw] xs:w-[76vw] sm:w-[300px] shrink-0 snap-start group flex items-center gap-2.5 p-2 rounded-xl bg-white/95 hover:bg-amber-50/70 border border-slate-200/90 hover:border-[#96702c]/60 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="relative w-12 h-12 xs:w-13 xs:h-13 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.thumbnail}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-0.5">
                    <div className="flex items-center gap-1 text-[8.5px] xs:text-[9.5px] font-bold text-[#96702c] uppercase tracking-wider">
                      <span>{art.category}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 font-normal">{art.date}</span>
                    </div>
                    <h3 className="text-[10px] xs:text-[11px] font-bold text-slate-900 group-hover:text-[#96702c] transition-colors line-clamp-2 leading-tight mt-0.5">
                      {art.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* KHUSUS DESKTOP (lg+): SIGNATURE PARLIAMENT SPLIT LAYOUT */}
        {/* Foto Standing Besar di Paling Kiri, Konten Mengikuti Berdampingan */}
        {/* ========================================================= */}
        <div className="hidden lg:block w-full relative z-10 max-w-[1600px] mx-auto px-4 lg:px-6 xl:px-10">
          <div className="relative min-h-[540px] xl:min-h-[580px] flex flex-row items-start gap-5 lg:gap-6 xl:gap-7">
            {/* SISI KIRI: Foto Standing Formal Jas (Besar & Ditaruh di Paling Kiri) */}
            <div className="shrink-0 z-20 self-end -mb-12 flex justify-start -ml-3 lg:-ml-6 xl:-ml-8">
              <div className="relative w-[380px] lg:w-[420px] xl:w-[460px] 2xl:w-[490px] drop-shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={officialPhotoUrl}
                  alt={officialFullName}
                  className="w-full h-auto object-contain object-bottom filter contrast-[1.03]"
                />
              </div>
            </div>

            {/* SISI KANAN: Text Headline & 3 Editorial Cards Grid (Mengikuti di Samping Foto, Tidak Terlalu ke Kanan) */}
            <div className="flex-1 z-10 w-full min-w-0 self-start pt-2 pb-2">
              {/* 1. Headline & Subtitle (Digeser lebih ke kiri mendekati foto & memberi ruang kubah DPR) */}
              <div className="max-w-xl lg:max-w-2xl xl:max-w-3xl space-y-2 text-left -ml-10 lg:-ml-28 xl:-ml-36">
                {/* Nama Gelar Dewan */}
                <div className="text-slate-800 text-[13px] font-bold tracking-wide uppercase">
                  <span>{officialFullName}</span>
                </div>

                {/* Headline Utama */}
                <h1 className="text-[32px] xl:text-[38px] font-black text-slate-900 tracking-tight leading-[1.15] uppercase drop-shadow-xs">
                  MELAYANI DENGAN INTEGRITAS.
                  <span className="block text-[#96702c] mt-0.5">
                    MENGABDI UNTUK RAKYAT.
                  </span>
                </h1>

                {/* Sub Action Link */}
                <div className="pt-0.5">
                  <Link
                    href={getNavLinkHref('/profil')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#96702c] hover:text-[#805f24] group transition-colors cursor-pointer"
                  >
                    <span>Pelajari Rekam Jejak Dewan</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* 2. ARTIKEL TERKINI Header */}
              <div id="artikel" className="mt-8 lg:mt-10 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                      ARTIKEL TERKINI
                    </h2>
                    <span className="w-8 h-0.5 bg-[#96702c] rounded-full" />
                  </div>

                  <Link
                    href={getNavLinkHref('/artikel')}
                    className="text-[13px] font-bold text-[#96702c] hover:text-[#805f24] flex items-center gap-1 transition-colors group"
                  >
                    <span>Lihat Semua</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* VERSI DESKTOP: Kartu Editorial Lengkap dengan Gambar Besar, Badge Tanggal, dan Cuplikan Paragraf */}
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 xl:gap-6">
                  {displayArticles.map((art) => (
                    <article
                      key={art.id}
                      className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_32px_-8px_rgba(150,112,44,0.18)] hover:border-[#96702c]/50 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
                    >
                      <div>
                        {/* Thumbnail Image dengan Overlay Halus & Date Badge Pill */}
                        <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={art.thumbnail}
                            alt={art.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                          {/* Badge Tanggal (Frosted Glass Pill dengan Icon Calendar) */}
                          <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white/95 text-[10.5px] font-medium shadow-sm">
                            <Calendar className="w-3 h-3 text-amber-300 shrink-0" />
                            <span>{art.date}</span>
                          </div>

                          {/* Estimasi Waktu Baca di Kanan Atas */}
                          <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/15 text-white/85 text-[10px] font-medium">
                            <Clock className="w-2.5 h-2.5 text-amber-200" />
                            <span>3 mnt baca</span>
                          </div>
                        </div>

                        {/* Konten Artikel */}
                        <div className="p-4 space-y-2.5">
                          {/* Sektor Kategori dengan Gold Accent Dot Pill */}
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-[#96702c] border border-amber-200/70">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#96702c]" />
                              {art.category}
                            </span>
                          </div>

                          {/* Judul Artikel */}
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#96702c] transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
                            <Link href={`/artikel/${art.slug}`} className="hover:underline decoration-[#96702c]/40 underline-offset-2">
                              {art.title}
                            </Link>
                          </h3>

                          {/* Ringkasan Paragraf */}
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2rem]">
                            {art.summary}
                          </p>
                        </div>
                      </div>

                      {/* Footer: Kategori Publikasi & Baca Selengkapnya */}
                      <div className="pt-2.5 pb-3 px-4 border-t border-slate-100 flex items-center justify-between mt-auto bg-slate-50/50">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-400">
                          <BookOpen className="w-3 h-3 text-[#96702c]/70" />
                          <span>Kajian Resmi</span>
                        </div>

                        <Link
                          href={`/artikel/${art.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#96702c] group-hover:text-[#7d5c21] transition-colors"
                        >
                          <span>Baca Selengkapnya</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: INFOGRAFIS (DATA REAL PUBLIKASI RESMI)         */}
      {/* ========================================================= */}
      <section id="infografis" className="py-12 sm:py-16 bg-[#F8F4E9] border-t border-amber-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header: INFOGRAFIS — & Lihat Semua Infografis -> */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                INFOGRAFIS
              </h2>
              <span className="w-8 h-0.5 bg-slate-400 rounded-full" />
            </div>

            <Link
              href={getNavLinkHref('/infografis')}
              className="text-xs sm:text-sm font-bold text-[#96702c] hover:text-[#805f24] inline-flex items-center gap-1.5 transition-colors group"
            >
              <span>Lihat Semua Infografis</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Real Infographics Grid */}
          {recentInfographics && recentInfographics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentInfographics.map((info: any, idx: number) => {
                const img =
                  info.imageUrl ||
                  info.posterUrl ||
                  info.featuredImageUrl ||
                  '/images/showcase-infografis-apbd.jpg';
                const dateLabel = info.publishedAt
                  ? formatDateIndonesian(info.publishedAt)
                  : 'Terbaru';
                const category =
                  info.issueCategory?.replace(/_/g, ' ') || 'INFOGRAFIS';

                return (
                  <div
                    key={info.id || idx}
                    onClick={() => setSelectedInfographic(info)}
                    className="group bg-white rounded-2xl overflow-hidden border border-amber-100/80 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail with Aspect Ratio */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={info.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Date badge */}
                        <div className="absolute bottom-3 left-3 bg-[#96702c] text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-sm">
                          {dateLabel}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        {/* Category Tag */}
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <span className="text-[#96702c] font-black">|</span>
                          <span className="uppercase tracking-wide text-[11px]">{category}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#96702c] transition-colors line-clamp-2 leading-snug">
                          {info.title}
                        </h3>

                        {/* Summary / Excerpt */}
                        {(info.leadParagraph || info.excerpt || info.summary) && (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {info.leadParagraph || info.excerpt || info.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-5 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between text-xs font-bold text-[#96702c] group-hover:translate-x-0.5 transition-transform">
                      <span>Lihat Infografis</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-amber-200/80 bg-white/70 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-[#96702c] mx-auto flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Belum Ada Infografis Publikasi</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Materi visualisasi kebijakan, transparansi, dan edukasi publik yang dirilis resmi oleh dewan akan tampil di sini.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: PROFIL SINGKAT & DAPIL (Navigasi Beranda)        */}
      {/* ========================================================= */}
      <section id="profil" className="py-12 sm:py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[#96702c] text-xs font-bold border border-amber-200/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mandat Keparlemenan &amp; Daerah Pemilihan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Mendedikasikan Diri untuk Kemajuan {dapilName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sebagai representasi rakyat, komitmen utama kami adalah mengawal aspirasi daerah pemilihan,
                memastikan setiap rancangan undang-undang berpihak pada kesejahteraan warga, dan menegakkan fungsi
                pengawasan anggaran yang akuntabel dan transparan.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-amber-200/60">
                  <div className="text-[11px] font-medium text-slate-500">Fraksi Partai</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{partyName}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-amber-200/60">
                  <div className="text-[11px] font-medium text-slate-500">Daerah Pemilihan</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{dapilName}</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-amber-200/60 col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-medium text-slate-500">Lembaga Perwakilan</div>
                  <div className="text-xs sm:text-sm font-bold text-[#96702c] mt-0.5">DPR RI</div>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="lg:col-span-5 xl:col-span-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white space-y-4 shadow-xl border border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>Kantor Aspirasi Warga</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Punya masukan terkait infrastruktur, UMKM, atau pendidikan di wilayah Anda?
                Hubungi saluran korespondensi resmi kantor dewan.
              </p>
              <Link
                href={getNavLinkHref('/kontak')}
                className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-[#96702c] hover:bg-[#805f24] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
              >
                Kanal Kontak &amp; Aspirasi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER RESMI KENEGARAAN                                   */}
      {/* ========================================================= */}
      <footer id="kontak" className="bg-slate-900 text-white py-12 border-t border-slate-800">
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
                Website resmi akuntabilitas kerja parlemen dan saluran aspirasi konstituen Daerah Pemilihan {dapilName}.
              </p>
            </div>

            {/* Kolom 2: Navigasi Cepat */}
            <div className="space-y-2">
              <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Navigasi Cepat
              </div>
              <ul className="space-y-1.5 text-slate-400">
                <li><Link href={getNavLinkHref('/')} className="hover:text-amber-400 transition-colors">Beranda</Link></li>
                <li><Link href={getNavLinkHref('/profil')} className="hover:text-amber-400 transition-colors">Profil Dewan</Link></li>
                <li><Link href={getNavLinkHref('/artikel')} className="hover:text-amber-400 transition-colors">Artikel Terkini</Link></li>
                <li><Link href={getNavLinkHref('/infografis')} className="hover:text-amber-400 transition-colors">Infografis Capaian</Link></li>
                <li><Link href={getNavLinkHref('/kontak')} className="hover:text-amber-400 transition-colors">Kontak & Sekretariat</Link></li>
              </ul>
            </div>

            {/* Kolom 3: Layanan Publik */}
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
                  <a href={`https://instagram.com/${member?.username || 'ahmadfauzi'}`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                    Instagram Resmi
                  </a>
                </li>
                <li><Link href={getNavLinkHref('/infografis')} className="hover:text-amber-400 transition-colors">Laporan Triwulan</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} {officialFullName}. Seluruh Hak Dilindungi Undang-Undang.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
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
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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
                {['UU Cipta Kerja', 'Infrastruktur Jalan', 'Pendidikan Karakter', 'APBD & Anggaran', 'UMKM'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSearchQuery(t)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-amber-50 hover:text-[#96702c] text-slate-600 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <Link
                href={`/artikel?q=${encodeURIComponent(searchQuery)}`}
                onClick={() => setSearchModalOpen(false)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#96702c] text-white text-xs font-bold hover:bg-[#805f24]"
              >
                <span>Lihat Hasil</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================= */}
      {/* MODAL 3: PREVIEW INFOGRAFIS STUDIO                        */}
      {/* ========================================================= */}
      {selectedInfographic && (
        <div
          onClick={() => setSelectedInfographic(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {selectedInfographic.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedInfographic(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedInfographic.imageUrl || selectedInfographic.posterUrl}
                alt={selectedInfographic.title}
                className="max-h-[65vh] w-auto object-contain mx-auto"
              />
            </div>

            {selectedInfographic.description && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedInfographic.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
