'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Clock,
  Instagram,
  Menu,
  X,
  BookOpen,
  Download,
  Eye,
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

export function WarmPortfolioTemplate({
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
    '/images/dewan-ahmad-fauzi-cutout.webp';
  const headline =
    theme?.headlineTagline ||
    'Mendedikasikan pemikiran dan aksi nyata demi kesejahteraan konstituen dan kemajuan bangsa.';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Anggota Dewan';
  const dapil =
    (member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I').replace(/_/g, ' ');
  const party = (member?.partyAffiliation || 'Fraksi Parlemen').replace(/_/g, ' ');
  const legislativeLevel = (member?.legislativeLevel || 'DPRD PROVINSI').replace(/_/g, ' ');
  const commissionName = (member?.commissionName || 'KOMISI I (PEMERINTAHAN & HUKUM)').replace(/_/g, ' ');
  const officialEmail = member?.email || (subdomain ? `kontak@${subdomain}.polaris.id` : 'kontak@polaris.id');
  const officialPhone = member?.phoneNumber || '+62 812-3456-7890';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    '';

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');
  const previewColor = searchParams?.get('preview_color');

  const isHomePage =
    !pathname ||
    pathname === '/' ||
    pathname === `/${subdomain}` ||
    (subdomain ? pathname.endsWith(`/${subdomain}`) : false);

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

  const articlesHref = isHomePage ? '#articles' : getNavLinkHref('/artikel');
  const infographicsHref = isHomePage ? '#infographics' : getNavLinkHref('/infografis');

  function parseCleanIdentity(fullName?: string) {
    if (!fullName) {
      return { cleanName: 'Wakil Rakyat', firstName: 'Wakil', lastName: 'Rakyat', initial: 'W' };
    }
    let clean = fullName.split(',')[0].trim();
    while (/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i.test(clean)) {
      clean = clean.replace(/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i, '').trim();
    }
    const words = clean.split(/\s+/).filter(Boolean);
    const firstName = words[0] || 'Wakil';
    const lastName = words.length > 1 ? words.slice(1).join(' ') : '';
    const initial = firstName.charAt(0).toUpperCase();

    return {
      cleanName: clean || 'Wakil Rakyat',
      firstName,
      lastName,
      initial: initial || 'W',
    };
  }

  const { cleanName, firstName, initial } = parseCleanIdentity(officialFullName);

  // Real publications from member account (No dummy fallback data)
  const articles = recentArticles || [];
  const infographics = recentInfographics || [];

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
      info?.featuredImageUrl ||
      info?.coverUrl ||
      info?.coverImageUrl ||
      info?.thumbnailUrl ||
      info?.fileUrl ||
      '/images/showcase-infografis-apbd.jpg'
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 font-sans selection:bg-[#F59E0B] selection:text-stone-950 overflow-x-hidden antialiased">
      
      {/* ─── FULL-SCREEN HERO VIEWPORT (STICKY NAVBAR + SECTION 1 FULL HEIGHT 100VH) ─── */}
      <div className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between relative bg-[#FAF7F2] overflow-hidden select-none">
        
        {/* ─── 1. FLOATING DARK PILL NAVBAR (JENNY SCOTT REFERENSI PERSIS) ─── */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 z-50 shrink-0">
          <header className="rounded-full bg-[#181311] text-white px-4 sm:px-6 py-2.5 sm:py-3 shadow-2xl border border-stone-800 flex items-center justify-between">
            
            {/* Left: Orange Circle Initial + Name */}
            <Link
              href={getNavLinkHref('/')}
              className="flex items-center gap-2.5 group select-none shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-[#F59E0B] text-stone-950 font-black flex items-center justify-center text-xs shadow-md group-hover:scale-105 transition-transform">
                {initial}
              </div>
              <span className="font-serif font-black text-sm sm:text-base text-white tracking-tight group-hover:text-[#F59E0B] transition-colors">
                {firstName}.
              </span>
            </Link>

            {/* Center: Nav links (Beranda, Profil, Artikel, Infografis, Kontak) */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold tracking-wide text-stone-300">
              <Link
                href={getNavLinkHref('/')}
                className="text-[#F59E0B] font-bold transition-colors"
              >
                Beranda
              </Link>
              <Link
                href={getNavLinkHref('/profil')}
                className="text-stone-300 hover:text-white transition-colors"
              >
                Profil
              </Link>
              <Link
                href={articlesHref}
                className="text-stone-300 hover:text-white transition-colors"
              >
                Artikel
              </Link>
              <Link
                href={infographicsHref}
                className="text-stone-300 hover:text-white transition-colors"
              >
                Infografis
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                className="text-stone-300 hover:text-white transition-colors"
              >
                Kontak
              </Link>
            </nav>

            {/* Right: Instagram Gradient Pill Button + Mobile Hamburger */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white font-bold text-xs shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none"
                style={{
                  background: 'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
                }}
              >
                <Instagram className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="truncate max-w-[85px] sm:max-w-none">@{instagramUsername}</span>
              </a>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 rounded-2xl bg-[#181311]/95 backdrop-blur-xl border border-stone-800 p-4 space-y-1 shadow-2xl animate-in slide-in-from-top-2 text-xs font-semibold text-stone-200">
              <Link
                href={getNavLinkHref('/')}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-[#F59E0B] font-bold hover:bg-white/5"
              >
                Beranda
              </Link>
              <Link
                href={getNavLinkHref('/profil')}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:text-white hover:bg-white/5"
              >
                Profil Dewan
              </Link>
              <Link
                href={articlesHref}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:text-white hover:bg-white/5"
              >
                Artikel &amp; Risalah
              </Link>
              <Link
                href={infographicsHref}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:text-white hover:bg-white/5"
              >
                Infografis Kinerja
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:text-white hover:bg-white/5"
              >
                Kontak Parlemen
              </Link>
            </div>
          )}
        </div>

        {/* ─── 2. SECTION 1: HERO BODY (VERTICALLY CENTERED & BALANCED) ─── */}
        <section className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col justify-center min-h-0 py-2 sm:py-3 overflow-hidden">
          
          {/* Main Headline: I'm Ahmad Fauzi ✦ */}
          <div className="text-center space-y-1 mb-2 sm:mb-4 relative shrink-0">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-black tracking-tight text-stone-900 leading-none">
              <span>I&apos;m </span>
              <span className="text-[#F59E0B]">{cleanName}</span>
              <span className="inline-block text-stone-800 text-2xl sm:text-4xl ml-1 align-top select-none">
                ✦
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm font-medium text-stone-500 max-w-lg mx-auto pt-0.5">
              Anggota {legislativeLevel} Dapil {dapil} • {party}
            </p>

            {/* Rotating Circular Stamp Badge on Top-Right (Exact Jenny Scott Style) */}
            <div className="hidden lg:block absolute -top-3 right-4 xl:right-10 z-20 pointer-events-none select-none">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full animate-[spin_30s_linear_infinite]"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="#181311"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <path
                    id="warmStampArc"
                    d="M 50, 50 m -33, 0 a 33,33 0 1,1 66,0 a 33,33 0 1,1 -66,0"
                    fill="none"
                  />
                  <text className="text-[7.5px] font-mono uppercase tracking-[0.22em] fill-white font-bold">
                    <textPath href="#warmStampArc" startOffset="0%">
                      • SERAP ASPIRASI • WAKIL RAKYAT
                    </textPath>
                  </text>
                </svg>
                {/* Center orange circle with arrow */}
                <div className="absolute inset-0 m-auto w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F59E0B] text-stone-950 flex items-center justify-center shadow-md">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>

          {/* 3-Column Hero Grid: Left (Follow & Reviews), Center (Photo & Dual Pill), Right (Quote & Badges) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-end shrink-0">
            
            {/* Left Column: Follow Me On & Reviews */}
            <div className="lg:col-span-3 space-y-3 sm:space-y-4 pb-2 sm:pb-3 text-left order-2 lg:order-1">
              {/* Follow Me On */}
              <div className="space-y-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400 block font-mono">
                  FOLLOW ME ON
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://instagram.com/${instagramUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-full bg-[#181311] hover:bg-[#F59E0B] text-white hover:text-stone-950 transition-colors flex items-center justify-center text-xs shadow-xs"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="#"
                    className="w-7 h-7 rounded-full bg-[#181311] hover:bg-[#F59E0B] text-white hover:text-stone-950 transition-colors flex items-center justify-center text-[11px] font-bold font-mono shadow-xs"
                    aria-label="Twitter / X"
                  >
                    X
                  </a>
                  <a
                    href="#"
                    className="w-7 h-7 rounded-full bg-[#181311] hover:bg-[#F59E0B] text-white hover:text-stone-950 transition-colors flex items-center justify-center text-[11px] font-bold font-mono shadow-xs"
                    aria-label="LinkedIn"
                  >
                    in
                  </a>
                </div>
              </div>

              {/* Reviews / Constituent Trust Badge */}
              <div className="space-y-1">
                <div className="flex items-center -space-x-1.5">
                  <div className="w-6 h-6 rounded-full border-2 border-[#FAF7F2] bg-amber-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    JK
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-[#FAF7F2] bg-stone-700 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    AD
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-[#FAF7F2] bg-stone-900 text-[#F59E0B] text-[9px] font-black flex items-center justify-center shadow-xs">
                    +10k
                  </div>
                </div>

                <div className="leading-tight">
                  <div className="text-xs sm:text-sm font-bold text-stone-900">
                    <span className="text-[#F59E0B]">100K+ Warga Terwakili</span>{' '}
                    <span className="text-stone-500 font-normal text-[10.5px]">(100% Tuntas)</span>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Aspirasi konstituen tervalidasi di Daerah Pemilihan {dapil}
                  </p>
                </div>
              </div>
            </div>

            {/* Center Column: Cutout Portrait & Dual Capsule Button */}
            <div className="lg:col-span-6 flex flex-col items-center justify-end relative order-1 lg:order-2">
              
              {/* Concentric Watermark Circle behind the photo */}
              <div
                aria-hidden="true"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[240px] sm:w-[290px] lg:w-[330px] aspect-square rounded-full border border-stone-300/60 pointer-events-none select-none z-0"
                style={{
                  background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, rgba(250, 247, 242, 0.6) 70%, transparent 100%)',
                }}
              />

              {/* Portrait Image (Compact responsive height) */}
              <div className="relative w-[220px] sm:w-[270px] lg:w-[310px] xl:w-[340px] h-[220px] sm:h-[260px] lg:h-[290px] xl:h-[320px] flex items-end justify-center z-10 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={cleanName}
                  className="w-full h-full object-contain object-bottom filter contrast-[1.03] select-none block"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('/images/default-avatar.png')) {
                      target.src = '/images/default-avatar.png';
                    }
                  }}
                />
              </div>

              {/* Floating Dual Capsule Button (Persis Jenny Scott: Portfolio ➔ | Hire Me) */}
              <div className="relative z-20 -mt-5 sm:-mt-6 mb-1 sm:mb-2">
                <div className="inline-flex items-center rounded-full bg-white p-1 border border-stone-300/90 shadow-xl shadow-stone-300/40">
                  <a
                    href={articlesHref}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-xs group cursor-pointer"
                  >
                    <span>Risalah Parlemen</span>
                    <div className="w-4 h-4 rounded-full bg-stone-950 text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="w-2.5 h-2.5 text-[#F59E0B]" />
                    </div>
                  </a>
                  <Link
                    href={getNavLinkHref('/profil')}
                    className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-stone-700 hover:text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Profil Dewan
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Quote & Floating Pills Badges */}
            <div className="lg:col-span-3 space-y-2.5 sm:space-y-3 pb-2 sm:pb-3 text-left order-3">
              {/* Quote */}
              <div className="space-y-0.5">
                <span className="text-2xl sm:text-3xl font-serif text-[#F59E0B] leading-none block select-none">
                  ““
                </span>
                <p className="text-[11px] sm:text-xs font-semibold text-stone-800 leading-snug">
                  Mendedikasikan kerja keparlemenan yang berpihak pada martabat dan kesejahteraan rakyat kecil.
                </p>
              </div>

              {/* Floating Pills Arrangement (Murni Parlemen & Advokasi Publik - Tanpa Istilah IT) */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-3 py-1 rounded-full bg-[#181311] text-white font-sans text-[11px] font-semibold shadow-xs">
                  Legislasi Parlemen
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F59E0B] text-stone-950 font-sans text-[11px] font-bold shadow-xs">
                  Pengawasan APBN
                </span>
                <span className="px-3 py-1 rounded-full bg-[#181311] text-white font-sans text-[11px] font-semibold shadow-xs">
                  Advokasi UMKM
                </span>
                <span className="px-3 py-1 rounded-full bg-[#181311] text-white font-sans text-[11px] font-semibold shadow-xs">
                  Ketahanan Pangan
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F59E0B] text-stone-950 font-sans text-[11px] font-bold shadow-xs">
                  Pendidikan 3T
                </span>
                <span className="px-3 py-1 rounded-full bg-[#181311] text-white font-sans text-[11px] font-semibold shadow-xs">
                  Infrastruktur Publik
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ─── TICKER MARQUEE BAR (BASELINE GROUND - PINNED TO BOTTOM OF 100VH VIEWPORT) ─── */}
        <div className="relative z-20 bg-[#181311] text-white py-2.5 sm:py-3 border-t border-stone-800 overflow-hidden font-mono font-bold text-[10.5px] sm:text-xs uppercase tracking-widest select-none shrink-0 w-full">
          <div className="flex items-center gap-6 sm:gap-8 justify-around whitespace-nowrap overflow-x-auto scrollbar-none">
            <span className="flex items-center gap-2">
              <span className="text-[#F59E0B]">✦</span> PENGAWALAN ANGGARAN
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#F59E0B]">✦</span> KUNJUNGAN RESES DAPIL
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#F59E0B]">✦</span> ADVOKASI KERAKYATAN
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#F59E0B]">✦</span> KETERBUKAAN INFORMASI
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#F59E0B]">✦</span> AKUNTABILITAS PUBLIK 100%
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#F59E0B]">✦</span> LEGISLASI PARLEMEN
            </span>
          </div>
        </div>

      </div>


      {/* ─── 3. SECTION 2: ARTIKEL (RISALAH & GAGASAN KEBIJAKAN PARLEMEN) ─── */}
      <section id="articles" className="py-16 sm:py-24 bg-[#FAF7F2] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 text-left">
              {/* Eyebrow with 2 dots */}
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="w-2 h-2 rounded-full bg-stone-900" />
                <span>Risalah &amp; Gagasan Kebijakan</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black text-stone-900 tracking-tight leading-tight">
                Kajian Kebijakan &amp; <span className="text-[#F59E0B]">Catatan Parlemen</span>
                <span className="inline-block text-stone-800 text-2xl sm:text-3xl ml-1 align-top select-none">
                  ✦
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                Naskah telaah regulasi, analisis kebijakan publik, dan laporan pertanggungjawaban dewan untuk Daerah Pemilihan {dapil}.
              </p>
            </div>

            {/* View All Articles Button */}
            {articles.length > 0 && (
              <Link
                href={getNavLinkHref('/artikel')}
                className="px-5 py-2.5 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 shrink-0 shadow-sm"
              >
                <span>Lihat Seluruh Kajian ({articles.length})</span>
                <div className="w-5 h-5 rounded-full bg-stone-950 text-white flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-[#F59E0B]" />
                </div>
              </Link>
            )}
          </div>

          {/* Real Articles Grid or Authentic Empty State (No Dummy Data) */}
          {articles.length === 0 ? (
            <div className="py-20 px-6 text-center rounded-3xl bg-white border border-dashed border-stone-300 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-[#F59E0B]">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900">Belum Ada Artikel yang Diterbitkan</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                Artikel kajian dan risalah kebijakan publik resmi akan segera ditampilkan di sini setelah dipublikasikan melalui dasbor akun dewan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {articles.slice(0, 6).map((art: any) => {
                const coverImg = getArticleImage(art);
                return (
                  <Link
                    key={art.id || art.slug}
                    href={getNavLinkHref(`/artikel/${art.slug}`)}
                    className="rounded-2xl bg-white border border-stone-200/90 hover:border-[#F59E0B] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group text-left"
                  >
                    {/* Article Cover Image with Category Tag */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImg}
                        alt={art.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#181311]/85 backdrop-blur-md text-[#F59E0B] font-mono text-[10px] font-bold uppercase tracking-wider border border-white/10">
                          {art.issueCategory || art.category || 'Kebijakan Publik'}
                        </span>
                      </div>
                    </div>

                    {/* Article Info & Excerpt */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>{art.publishedAt ? formatDateIndonesian(art.publishedAt) : 'Terbaru'}</span>
                          <span>•</span>
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{art.readingTimeMinutes || 4} mnt baca</span>
                        </div>

                        <h3 className="font-sans font-bold text-base sm:text-lg text-stone-900 group-hover:text-[#F59E0B] transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                          {art.excerpt || art.summary || 'Kajian kebijakan publik dan catatan advokasi parlemen.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#D97706] font-bold group-hover:text-[#B45309] transition-colors">
                        <span>Baca Risalah Lengkap</span>
                        <div className="w-7 h-7 rounded-full bg-[#F59E0B]/15 group-hover:bg-[#F59E0B] text-stone-900 flex items-center justify-center transition-colors">
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ─── 4. SECTION 3: INFOGRAFIS (TRANSPARANSI DATA & KINERJA DEWAN) ─── */}
      <section id="infographics" className="py-16 sm:py-24 bg-[#181311] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-800 pb-6">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>Transparansi Kinerja &amp; Anggaran</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black text-white tracking-tight">
                Infografis &amp; Data <span className="text-[#F59E0B]">Kinerja Parlemen</span>
                <span className="inline-block text-stone-400 text-2xl sm:text-3xl ml-1 align-top select-none">
                  ✦
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
                Visualisasi berbasis data terbuka mengenai kinerja legislasi, pengawasan belanja publik, dan capaian aspirasi konstituen Daerah Pemilihan {dapil}.
              </p>
            </div>

            {infographics.length > 0 && (
              <Link
                href={getNavLinkHref('/infografis')}
                className="px-5 py-2.5 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 shrink-0 shadow-sm"
              >
                <span>Lihat Seluruh Infografis ({infographics.length})</span>
                <div className="w-5 h-5 rounded-full bg-stone-950 text-white flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-[#F59E0B]" />
                </div>
              </Link>
            )}
          </div>

          {/* Real Infographics Posters Grid or Authentic Empty State (No Dummy Data) */}
          {infographics.length === 0 ? (
            <div className="py-20 px-6 text-center rounded-3xl bg-stone-900 border border-dashed border-stone-800 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#F59E0B]">
                <Eye className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Belum Ada Infografis yang Diterbitkan</h3>
              <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
                Poster infografis transparansi data dan visualisasi akuntabilitas dewan akan segera ditampilkan di sini setelah dipublikasikan melalui dasbor akun dewan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {infographics.slice(0, 6).map((info: any, idx: number) => {
                const posterImg = getInfographicImage(info);
                return (
                  <div
                    key={info.id || idx}
                    className="rounded-2xl bg-stone-900 border border-stone-800 hover:border-[#F59E0B] overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between group text-left"
                  >
                    {/* Poster Image with Lightbox Trigger */}
                    <div
                      onClick={() => setActiveModalInfo(info)}
                      className="relative aspect-[4/5] overflow-hidden bg-stone-950 cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={posterImg}
                        alt={info.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#181311]/90 backdrop-blur-md text-[#F59E0B] font-mono text-[9.5px] font-bold uppercase tracking-wider border border-white/10">
                          {info.category || 'Transparansi Data'}
                        </span>
                      </div>

                      {/* Hover overlay hint */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <span className="px-4 py-2 rounded-full bg-[#F59E0B] text-stone-950 text-xs font-bold shadow-lg flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Perbesar Poster</span>
                        </span>
                      </div>
                    </div>

                    {/* Info Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>{info.publishedAt ? formatDateIndonesian(info.publishedAt) : 'Terbaru'}</span>
                        </div>
                        <h4 className="font-sans font-bold text-sm sm:text-base text-white group-hover:text-[#F59E0B] transition-colors line-clamp-2 leading-snug">
                          {info.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveModalInfo(info)}
                        className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-[#F59E0B] font-bold group-hover:text-amber-300 transition-colors w-full cursor-pointer text-left"
                      >
                        <span>Perbesar Infografis</span>
                        <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#F59E0B] group-hover:text-stone-950 flex items-center justify-center transition-colors">
                          <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ─── 5. FOOTER & KONTAK (WARM STUDIO PORTFOLIO STYLE) ─── */}
      <footer id="contact" className="py-16 bg-[#120E0D] text-stone-400 text-xs border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Top Banner Callout */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#181311] border border-stone-800 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <span className="text-xs font-mono font-bold uppercase text-[#F59E0B] tracking-wider block">
                [ SALURAN KOMUNIKASI RESMI ]
              </span>
              <h3 className="text-2xl sm:text-3xl font-sans font-black text-white">
                Keterbukaan Informasi &amp; Pengawasan Kebijakan Dewan
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 max-w-xl leading-relaxed">
                Suara masyarakat adalah kompas utama kami dalam menjalankan fungsi legislasi, penganggaran, dan pengawasan untuk kemakmuran Daerah Pemilihan {dapil}.
              </p>
            </div>

            <Link
              href={getNavLinkHref('/kontak')}
              className="px-6 py-3 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-stone-950 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-md shrink-0"
            >
              <span>Hubungi Sekretariat Dewan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs text-left">
            {/* Brand */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#F59E0B] text-stone-950 font-black flex items-center justify-center text-xs">
                  {initial}
                </div>
                <span className="font-serif font-black text-base text-white">
                  {officialFullName}
                </span>
              </div>
              <p className="text-stone-400 leading-relaxed max-w-sm">
                Portal komunikasi resmi transparansi kinerja legislasi, pengawasan anggaran, dan advokasi warga Daerah Pemilihan {dapil}.
              </p>
            </div>

            {/* Nav */}
            <div className="md:col-span-3 space-y-2">
              <span className="font-bold text-white uppercase text-[11px] font-mono tracking-wider block">
                MENU UTAMA
              </span>
              <ul className="space-y-1.5 text-stone-400 font-medium">
                <li><Link href={getNavLinkHref('/')} className="hover:text-[#F59E0B] transition-colors">Beranda</Link></li>
                <li><Link href={getNavLinkHref('/profil')} className="hover:text-[#F59E0B] transition-colors">Profil Dewan</Link></li>
                <li><Link href={articlesHref} className="hover:text-[#F59E0B] transition-colors">Artikel &amp; Risalah</Link></li>
                <li><Link href={infographicsHref} className="hover:text-[#F59E0B] transition-colors">Infografis Capaian</Link></li>
                <li><Link href={getNavLinkHref('/kontak')} className="hover:text-[#F59E0B] transition-colors">Kontak Parlemen</Link></li>
              </ul>
            </div>

            {/* Assignment */}
            <div className="md:col-span-5 space-y-2">
              <span className="font-bold text-white uppercase text-[11px] font-mono tracking-wider block">
                PENUGASAN PARLEMEN
              </span>
              <p className="text-stone-300 font-medium">
                {commissionName} • Dapil {dapil}
              </p>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Gedung Dewan Perwakilan Rakyat Daerah, Ruang Fraksi {party}.
              </p>
              <p className="text-[#F59E0B] font-semibold">{officialPhone}</p>
              <p className="text-stone-400">{officialEmail}</p>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
            <div>
              &copy; {new Date().getFullYear()} {officialFullName}. Seluruh Hak Cipta Dilindungi.
            </div>
            <div className="flex items-center gap-1.5">
              <span>Didukung oleh</span>
              <span className="font-bold text-[#F59E0B]">POLARIS Engine</span>
            </div>
          </div>

        </div>
      </footer>

      {/* ─── LIGHTBOX MODAL UNTUK INFOGRAFIS ─── */}
      {activeModalInfo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveModalInfo(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#181311] border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between text-white bg-[#1C1614]">
              <div className="truncate pr-4">
                <span className="text-[10px] font-mono text-[#F59E0B] font-bold uppercase block">
                  {activeModalInfo.category || 'Transparansi Data'}
                </span>
                <h4 className="text-sm sm:text-base font-bold truncate">
                  {activeModalInfo.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalInfo(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Tutup pratinjau"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 overflow-auto bg-stone-950 p-4 flex items-center justify-center min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getInfographicImage(activeModalInfo)}
                alt={activeModalInfo.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-stone-800 bg-[#1C1614] flex items-center justify-between gap-3 text-xs">
              <span className="text-stone-400 font-mono">
                {activeModalInfo.publishedAt ? formatDateIndonesian(activeModalInfo.publishedAt) : 'Terbaru'}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={getInfographicImage(activeModalInfo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={activeModalInfo.title || 'infografis'}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-stone-950 text-xs font-bold shadow-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Poster</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveModalInfo(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
