'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Instagram,
  Menu,
  X,
  BookOpen,
  Share2,
  Download,
  Eye,
  Maximize2,
  Users,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronDown,
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

export function MidnightGoldTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: TemplateProps) {
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-standing-full.png';
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Anggota Dewan';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || '';
  const party = member?.partyAffiliation || 'Fraksi Parlemen';
  const officialEmail = member?.email || (subdomain ? `aspirasi@${subdomain}.polaris.id` : 'aspirasi@polaris.id');
  const officialPhone = member?.phoneNumber || '+62 812-3456-7890';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    '';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);

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

  function parseCleanIdentity(fullName?: string) {
    if (!fullName) {
      return { cleanName: 'Wakil Rakyat', firstName: 'Wakil', lastName: 'Rakyat', brandName: 'POLARIS' };
    }
    let clean = fullName.split(',')[0].trim();
    while (/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i.test(clean)) {
      clean = clean.replace(/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i, '').trim();
    }
    const words = clean.split(/\s+/).filter(Boolean);
    const firstName = words[0] || 'Wakil';
    const lastName = words.length > 1 ? words.slice(1).join(' ') : '';
    const brandName = (words[words.length - 1] || firstName).toUpperCase();

    return {
      cleanName: clean || 'Wakil Rakyat',
      firstName,
      lastName,
      brandName,
    };
  }

  const { cleanName, firstName, lastName, brandName } = parseCleanIdentity(member?.fullName);

  // Real Account Publications
  const articles = Array.isArray(recentArticles) ? recentArticles : [];
  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const remainingArticles = articles.length > 1 ? articles.slice(1, 4) : [];
  const infographics = Array.isArray(recentInfographics) ? recentInfographics : [];

  const getArticleImage = (art: any) => {
    return (
      art?.featuredImageUrl ||
      art?.coverUrl ||
      art?.imageUrl ||
      art?.posterUrl ||
      art?.coverImageUrl ||
      art?.thumbnailUrl ||
      '/images/showcase-artikel-pertanian.jpg'
    );
  };

  const getInfographicImage = (info: any) => {
    return (
      info?.imageUrl ||
      info?.posterUrl ||
      info?.thumbnailUrl ||
      info?.fileUrl ||
      '/images/showcase-infografis-apbd.jpg'
    );
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#FFBD39] selection:text-black overflow-x-hidden">
      
      {/* ─── FULL-SCREEN HERO VIEWPORT (STICKY NAVBAR + SECTION 1 FULL HEIGHT 100VH) ─── */}
      <div className="min-h-screen flex flex-col justify-between relative bg-[#000000]">
        
        {/* ─── STICKY PITCH BLACK NAVBAR (PERSIS GAMBAR) ─── */}
        <header className="sticky top-0 z-50 bg-[#000000]/95 backdrop-blur-md border-b border-white/[0.06] shrink-0">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
            
            {/* Brand Logo (e.g. SHEHAN / FAUZI) */}
            <Link
              href={getNavLinkHref('/')}
              className="text-xl sm:text-2xl font-black tracking-[0.25em] text-white hover:text-[#FFBD39] uppercase transition-colors select-none"
            >
              {brandName}
            </Link>

            {/* Desktop Nav Links (Active has yellow underline) */}
            <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-xs sm:text-sm font-semibold tracking-wider">
              <Link
                href={getNavLinkHref('/')}
                className="text-[#FFBD39] border-b-2 border-[#FFBD39] pb-1 transition-all"
              >
                Beranda
              </Link>
              <Link
                href={getNavLinkHref('/profil')}
                className="text-white/80 hover:text-white pb-1 transition-colors"
              >
                Profil
              </Link>
              <Link
                href={getNavLinkHref('/artikel')}
                className="text-white/80 hover:text-white pb-1 transition-colors"
              >
                Artikel
              </Link>
              <Link
                href={getNavLinkHref('/infografis')}
                className="text-white/80 hover:text-white pb-1 transition-colors"
              >
                Infografis
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                className="text-white/80 hover:text-white pb-1 transition-colors"
              >
                Kontak
              </Link>
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
            <div className="md:hidden bg-[#0a0a0a] border-b border-white/[0.08] px-6 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {[
                { label: 'Beranda', href: '/' },
                { label: 'Profil', href: '/profil' },
                { label: 'Artikel', href: '/artikel' },
                { label: 'Infografis', href: '/infografis' },
                { label: 'Kontak', href: '/kontak' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={getNavLinkHref(item.href)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-white/80 hover:text-[#FFBD39] hover:bg-white/[0.04] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* ─── SECTION 1: HERO SHOWCASE (PERSIS FORMAT GAMBAR REFERENSI) ─── */}
        <section className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center relative overflow-hidden py-8 lg:py-0">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Tracker (HELLO!), Giant Headline, Subtitle, 2 Capsule Buttons */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7 z-10">
              
              {/* Yellow Tracker Tag (Persis HELLO! pada gambar) */}
              <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-[#FFBD39] block">
                AMANAH WAKIL RAKYAT
              </span>

              {/* Giant Headline: Saya {firstName} {lastName} (Persis I'm Shasika Shehan pada gambar) */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] font-black tracking-tight leading-[1.08] text-white">
                Saya <span className="text-[#FFBD39]">{firstName}</span>
                <br />
                <span className="text-[#FFBD39]">{lastName}</span>
              </h1>

              {/* Subtitle / Role (Persis Fullstack Web Developer pada gambar) */}
              <p className="text-xl sm:text-2xl md:text-[26px] text-white/90 font-medium tracking-normal max-w-xl leading-snug mt-5 sm:mt-6">
                {theme?.headlineTagline || `Wakil Rakyat DPR RI • Daerah Pemilihan ${dapil}`}
              </p>

              {/* Two Capsule Buttons (Persis HIRE ME & MY WORKS pada gambar) */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-4 sm:pt-6">
                <Link
                  href={getNavLinkHref('/kontak')}
                  className="bg-[#FFBD39] hover:bg-[#e5a823] text-black font-black text-xs uppercase tracking-[0.2em] px-8 sm:px-9 py-4 rounded-full shadow-[0_0_25px_rgba(255,189,57,0.35)] hover:scale-105 active:scale-95 transition-all"
                >
                  SAMPAIKAN ASPIRASI
                </Link>

                <Link
                  href={getNavLinkHref('/profil')}
                  className="bg-transparent border border-white/35 hover:border-white text-white font-black text-xs uppercase tracking-[0.2em] px-8 sm:px-9 py-4 rounded-full hover:bg-white/[0.06] transition-all"
                >
                  PROFIL & REKAM JEJAK
                </Link>
              </div>

            </div>

            {/* Right Column: Clean Portrait Cutout Photo (Persis foto besar pada gambar) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end items-end">
              <div className="relative w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[520px]">
                <img
                  src={photoUrl}
                  alt={officialFullName}
                  className="w-full h-auto max-h-[500px] sm:max-h-[580px] lg:max-h-[min(680px,82vh)] object-contain object-bottom drop-shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
                />
              </div>
            </div>

          </div>
        </section>

        {/* Subtle Scroll Down Indicator */}
        <div className="hidden sm:flex pb-4 justify-center items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#FFBD39]">Gulir ke Bawah</span>
          <ChevronDown className="w-4 h-4 text-[#FFBD39] animate-bounce" />
        </div>
      </div>

      {/* ─── SECTION 2: ARTIKEL (KEBIJAKAN & RISALAH PARLEMEN) ─── */}
      <section className="relative overflow-hidden py-20 sm:py-28 border-t border-white/[0.08] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Giant Watermark Background Text: ARTIKEL */}
        <div className="absolute top-8 left-4 sm:left-8 text-7xl sm:text-8xl md:text-9xl font-black text-white/[0.03] uppercase select-none pointer-events-none tracking-widest">
          ARTIKEL
        </div>

        {/* Section Header */}
        <div className="relative z-10 mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#FFBD39] block mb-2">
            GAGASAN & ADVOKASI REGULASI
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Kajian Kebijakan & Risalah Parlemen
          </h2>
          <p className="text-[#999999] text-xs sm:text-sm leading-relaxed mt-3 max-w-2xl">
            Naskah analisis regulasi, telaah perundang-undangan kenegaraan, dan laporan pertanggungjawaban kebijakan resmi dari dewan untuk masyarakat Daerah Pemilihan {dapil}.
          </p>
        </div>

        {articles.length === 0 ? (
          /* Authentic Empty State (No Dummy Data) */
          <div className="py-20 px-6 text-center rounded-2xl bg-[#0a0a0a] border border-dashed border-white/[0.1] space-y-4 relative z-10">
            <div className="w-14 h-14 mx-auto rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[#FFBD39]">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Belum Ada Artikel yang Diterbitkan</h3>
            <p className="text-xs sm:text-sm text-[#999999] max-w-md mx-auto leading-relaxed">
              Artikel kajian dan risalah kebijakan publik resmi akan segera ditampilkan di sini setelah dipublikasikan melalui dasbor akun dewan.
            </p>
          </div>
        ) : (
          <div className="space-y-12 relative z-10">
            {/* Featured Article Highlight (With Prominent Image) */}
            {featuredArticle && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#0a0a0a] rounded-3xl border border-white/[0.08] hover:border-[#FFBD39]/60 p-6 sm:p-8 lg:p-10 transition-all shadow-2xl">
                
                {/* Left Column: Article Cover Image */}
                <div className="lg:col-span-6">
                  <Link
                    href={getNavLinkHref(`/artikel/${featuredArticle.slug}`)}
                    className="block relative aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-white/[0.1] group"
                  >
                    <img
                      src={getArticleImage(featuredArticle)}
                      alt={featuredArticle.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[#FFBD39] text-[10px] font-black uppercase tracking-wider border border-[#FFBD39]/30">
                        {featuredArticle.issueCategory || featuredArticle.category || 'Kajian Utama'}
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Right Column: Metadata, Title, Excerpt, Action Buttons */}
                <div className="lg:col-span-6 space-y-5">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#999999]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#FFBD39]" />
                      {featuredArticle.publishedAt ? formatDateIndonesian(featuredArticle.publishedAt) : 'Terbaru'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-white/50" />
                      {featuredArticle.readingTimeMinutes || 4} mnt baca
                    </span>
                  </div>

                  <Link href={getNavLinkHref(`/artikel/${featuredArticle.slug}`)}>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white hover:text-[#FFBD39] transition-colors leading-tight">
                      {featuredArticle.title}
                    </h3>
                  </Link>

                  <p className="text-xs sm:text-sm text-[#999999] leading-relaxed line-clamp-3">
                    {featuredArticle.excerpt || featuredArticle.summary || 'Kajian komprehensif mengenai kebijakan publik dan langkah advokasi parlemen untuk kesejahteraan rakyat.'}
                  </p>

                  {/* 2-Column Metadata Key-Value List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 font-medium">Penulis:</span>
                      <span className="font-bold text-white truncate">{officialFullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 font-medium">Wilayah:</span>
                      <span className="font-bold text-white truncate">Dapil {dapil}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      href={getNavLinkHref(`/artikel/${featuredArticle.slug}`)}
                      className="inline-flex items-center gap-2 bg-[#FFBD39] hover:bg-[#e5a823] text-black font-black text-xs uppercase tracking-[0.15em] px-6 py-3.5 rounded-full shadow-[0_0_20px_rgba(255,189,57,0.3)] hover:scale-105 active:scale-95 transition-all"
                    >
                      <span>BACA KAJIAN LENGKAP</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href={getNavLinkHref('/artikel')}
                      className="inline-flex items-center gap-2 bg-transparent border border-white/20 hover:border-white text-white font-bold text-xs uppercase tracking-[0.15em] px-6 py-3.5 rounded-full hover:bg-white/[0.05] transition-all"
                    >
                      <span>LIHAT SEMUA KAJIAN ({articles.length})</span>
                    </Link>
                  </div>
                </div>

              </div>
            )}

            {/* Additional Articles Grid (With Cover Images) */}
            {remainingArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {remainingArticles.map((art, idx) => (
                  <Link
                    key={art.id || art.slug || idx}
                    href={getNavLinkHref(`/artikel/${art.slug}`)}
                    className="group rounded-2xl bg-[#0a0a0a] border border-white/[0.08] hover:border-[#FFBD39] transition-all overflow-hidden flex flex-col justify-between"
                  >
                    {/* Article Card Image */}
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img
                        src={getArticleImage(art)}
                        alt={art.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-sm text-[10px] font-black uppercase tracking-wider text-[#FFBD39] border border-white/[0.1]">
                          {art.issueCategory || art.category || 'Kebijakan Publik'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] text-[#999999]">
                          <Calendar className="w-3 h-3 text-[#FFBD39]" />
                          <span>{art.publishedAt ? formatDateIndonesian(art.publishedAt) : 'Terbaru'}</span>
                          <span>•</span>
                          <span>{art.readingTimeMinutes || 4} mnt</span>
                        </div>

                        <h4 className="text-base font-bold text-white group-hover:text-[#FFBD39] transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h4>

                        <p className="text-xs text-[#999999] line-clamp-2 leading-relaxed">
                          {art.excerpt || art.summary || 'Kajian kebijakan dan telaah komprehensif dari parlemen.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#FFBD39] font-bold">
                        <span>Baca Selengkapnya</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      </section>

      {/* ─── SECTION 3: INFOGRAFIS (TRANSPARANSI DATA PARLEMEN) ─── */}
      <section className="relative overflow-hidden py-20 sm:py-28 border-t border-white/[0.08] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Giant Watermark Background Text: INFOGRAFIS */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-7xl sm:text-8xl md:text-9xl font-black text-white/[0.03] uppercase select-none pointer-events-none tracking-widest text-center whitespace-nowrap">
          INFOGRAFIS
        </div>

        {/* Centered Title & Subtitle */}
        <div className="text-center space-y-3 relative z-10 mb-14">
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#FFBD39] block">
            TRANSPARANSI & AKUNTABILITAS PUBLIK
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Infografis & Transparansi Data Parlemen
          </h2>
          <p className="text-[#999999] text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Transparansi berbasis data terbuka mengenai kinerja legislasi, pengawasan alokasi anggaran belanja publik, serta serapan aspirasi masyarakat Daerah Pemilihan {dapil}.
          </p>
        </div>

        {infographics.length === 0 ? (
          /* Authentic Empty State (No Dummy Data) */
          <div className="py-20 px-6 text-center rounded-2xl bg-[#0a0a0a] border border-dashed border-white/[0.1] space-y-4 relative z-10">
            <div className="w-14 h-14 mx-auto rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[#FFBD39]">
              <Eye className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Belum Ada Infografis yang Diterbitkan</h3>
            <p className="text-xs sm:text-sm text-[#999999] max-w-md mx-auto leading-relaxed">
              Poster infografis transparansi data dan visualisasi akuntabilitas dewan akan segera ditampilkan di sini setelah dipublikasikan melalui dasbor akun dewan.
            </p>
          </div>
        ) : (
          <div className="relative z-10 space-y-10">
            {/* Real Infographics Posters Grid (Portrait aspect-[4/5] With Real Images) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {infographics.map((info, idx) => {
                const img = getInfographicImage(info);
                const formattedDate = info.publishedAt
                  ? formatDateIndonesian(info.publishedAt)
                  : 'Terbaru';

                return (
                  <div
                    key={info.id || idx}
                    className="group bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[#FFBD39] transition-all flex flex-col justify-between shadow-lg"
                  >
                    {/* Infographic Poster Image (aspect-[4/5] with Hover Zoom) */}
                    <div
                      onClick={() => setActiveModalInfo(info)}
                      className="relative aspect-[4/5] bg-black cursor-pointer overflow-hidden"
                    >
                      <img
                        src={img}
                        alt={info.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFBD39] text-black font-extrabold text-xs shadow-lg">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Perbesar Dokumen</span>
                        </span>
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-sm text-[#FFBD39] text-[10px] font-black uppercase tracking-wider border border-white/[0.1]">
                          {info.category || 'DATA PARLEMEN'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content & Action Bar */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-[#999999] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#FFBD39]" />
                          {formattedDate}
                        </span>
                        <h4
                          onClick={() => setActiveModalInfo(info)}
                          className="font-bold text-base text-white group-hover:text-[#FFBD39] transition-colors cursor-pointer line-clamp-2 leading-snug"
                        >
                          {info.title}
                        </h4>
                        {info.excerpt && (
                          <p className="text-xs text-[#999999] line-clamp-2 leading-relaxed">
                            {info.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                        <button
                          onClick={() => setActiveModalInfo(info)}
                          className="inline-flex items-center gap-1.5 font-bold text-white hover:text-[#FFBD39] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#FFBD39]" />
                          <span>Pratinjau Penuh</span>
                        </button>

                        <a
                          href={img}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-[#999999] hover:text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Button to Infographics Gallery */}
            <div className="text-center pt-4">
              <Link
                href={getNavLinkHref('/infografis')}
                className="inline-flex items-center gap-2 bg-transparent border border-white/20 hover:border-[#FFBD39] text-white hover:text-[#FFBD39] font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-full transition-all"
              >
                <span>LIHAT SELURUH INFOGRAFIS ({infographics.length})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </section>

      {/* ─── FULLSCREEN LIGHTBOX MODAL ─── */}
      {activeModalInfo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-[#0c0c0c] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/[0.15] shadow-2xl">
            <div className="px-6 py-4 bg-black flex items-center justify-between border-b border-white/[0.1]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD39]" />
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-lg">
                  {activeModalInfo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalInfo(null)}
                className="p-1 rounded-full text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black flex items-center justify-center">
              <img
                src={getInfographicImage(activeModalInfo)}
                alt={activeModalInfo.title}
                className="max-h-[60vh] w-auto object-contain rounded-lg border border-white/[0.1]"
              />
            </div>

            <div className="p-4 sm:p-6 bg-[#0c0c0c] border-t border-white/[0.1] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#999999] max-w-md">
                {activeModalInfo.excerpt || 'Visualisasi data resmi transparansi parlemen.'}
              </p>
              <a
                href={getInfographicImage(activeModalInfo)}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFBD39] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#e5a823] transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar Penuh</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── PITCH BLACK FOOTER ─── */}
      <footer className="bg-black text-[#999999] py-16 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/[0.08]">
            <div className="md:col-span-6 space-y-3">
              <span className="text-xl font-black tracking-[0.25em] text-white">
                {brandName}
              </span>
              <p className="text-xs text-[#999999] max-w-md leading-relaxed">
                Portal resmi akuntabilitas keparlemenan {officialFullName}. Menjunjung tinggi transparansi, dedikasi penuh, dan keterbukaan akses bagi seluruh konstituen.
              </p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Tautan</h4>
              <p><Link href={getNavLinkHref('/')} className="hover:text-[#FFBD39]">Beranda</Link></p>
              <p><Link href={getNavLinkHref('/profil')} className="hover:text-[#FFBD39]">Profil & Rekam Jejak</Link></p>
              <p><Link href={getNavLinkHref('/artikel')} className="hover:text-[#FFBD39]">Kajian & Artikel</Link></p>
              <p><Link href={getNavLinkHref('/infografis')} className="hover:text-[#FFBD39]">Infografis Capaian</Link></p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Kontak Parlemen</h4>
              <p>Sekretariat Fraksi DPR RI Senayan, Jakarta Pusat</p>
              <p className="text-[#FFBD39]">{officialPhone}</p>
              <p className="text-white/60">{officialEmail}</p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="text-white/40">Powered by POLARIS Parlemen Engine</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
