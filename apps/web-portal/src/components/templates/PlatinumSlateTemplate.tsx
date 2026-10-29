'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Instagram,
  Menu,
  X,
  BookOpen,
  Maximize2,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { resolvePortalMemberData } from '@/lib/template-resolver';

interface TemplateProps {
  member: any;
  theme: any;
  recentArticles?: any[];
  recentInfographics?: any[];
  documents?: any[];
  subdomain?: string;
}

export function PlatinumSlateTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: TemplateProps) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#A0AFB7',
  });

  const photoUrl = resolved.photoUrl;
  const officialFullName = resolved.officialFullName;
  const dapil = resolved.dapil || 'Dapil Terkait';
  const party = resolved.party;
  const legislativeLevel = resolved.legislativeLevel;
  const cleanLegislativeLevel = (legislativeLevel || 'DPR RI').replace(/_/g, ' ');
  const commissionName = resolved.commissionName;
  const officialEmail = resolved.officialEmail;
  const officialPhone = resolved.formattedPhoneNumber || resolved.phone || '';
  const instagramUsername = resolved.instagramUsername;
  const instagramUrl = resolved.instagramUrl;
  const apexHeroDescription = resolved.apexHeroDescription;
  const headlineTagline = resolved.headlineTagline;
  const tagline = resolved.tagline;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedInfographic, setSelectedInfographic] = useState<any | null>(null);

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

  // Monogram initials matching "AV" in the reference image
  const monogramInitials = officialFullName
    ? officialFullName
        .replace(/^(Dr\.|Ir\.|H\.|Hj\.|Prof\.)\s+/gi, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n: string) => n[0]?.toUpperCase())
        .join('')
    : 'AV';

  const articlesToDisplay = (recentArticles || []).slice(0, 3);
  const infographicsToDisplay = (recentInfographics || []).slice(0, 3);

  const getArticleImg = (art: any, idx: number) => {
    const fallbacks = [
      '/images/showcase-artikel-pertanian.jpg',
      '/images/ref-article-1.jpg',
      '/images/ref-article-2.jpg',
    ];
    return (
      art?.featuredImageUrl ||
      art?.posterUrl ||
      art?.imageUrl ||
      art?.coverImageUrl ||
      fallbacks[idx % fallbacks.length]
    );
  };

  const getInfographicImg = (info: any, idx: number) => {
    const fallbacks = [
      '/images/showcase-infografis-apbd.jpg',
      '/images/showcase-poster-surya.jpg',
      '/images/qurifolio/header-infografis-bg.jpg',
    ];
    return (
      info?.imageUrl ||
      info?.posterUrl ||
      info?.featuredImageUrl ||
      fallbacks[idx % fallbacks.length]
    );
  };

  return (
    <div className="min-h-screen bg-[#131518] text-slate-100 font-sans selection:bg-white selection:text-black antialiased overflow-x-hidden">
      
      {/* ─── SECTION 1: FULL SCREEN VIEWPORT HERO & 4-COLUMN STAT DOCK ─── */}
      <section className="relative min-h-screen flex flex-col justify-between bg-[#131518] overflow-hidden">
        
        {/* Soft Studio Ambient Spotlight behind Person on Right (matching reference image) */}
        <div
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[520px] sm:w-[680px] lg:w-[840px] h-[520px] sm:h-[680px] lg:h-[840px] rounded-full pointer-events-none blur-[120px] opacity-30 select-none z-0"
          style={{
            background: 'radial-gradient(circle, rgba(160, 175, 200, 0.3) 0%, rgba(45, 55, 75, 0.18) 45%, rgba(19, 21, 24, 0) 75%)',
          }}
        />

        {/* ── TOP NAVBAR INTEGRATED SEAMLESSLY (MATCHING REFERENCE AV HEADER) ── */}
        <header className="w-full relative z-50 pt-3 sm:pt-4 pb-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            
            {/* Left: Serif Brand Monogram "AV" Style + Official Name */}
            <Link href={getNavLinkHref('/')} className="flex items-center gap-3.5 group">
              <span className="font-serif italic font-bold text-2xl sm:text-3xl tracking-tight text-white group-hover:text-slate-300 transition-colors">
                {monogramInitials}
              </span>
              <div className="hidden sm:flex flex-col text-left border-l border-white/10 pl-3">
                <span className="font-bold text-xs text-white tracking-tight truncate max-w-[190px]">
                  {officialFullName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {party} • {dapil}
                </span>
              </div>
            </Link>

            {/* Centered/Right Navigation Links: WORK, CAPABILITIES, ABOUT, CONTACT */}
            <nav className="hidden md:flex items-center gap-7 lg:gap-10 text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-slate-400">
              <Link
                href={getNavLinkHref('/')}
                className="text-white font-bold transition-colors"
              >
                BERANDA
              </Link>
              <Link
                href={getNavLinkHref('/profil')}
                className="hover:text-white transition-colors"
              >
                PROFIL
              </Link>
              <Link
                href={getNavLinkHref('/artikel')}
                className="hover:text-white transition-colors"
              >
                ARTIKEL
              </Link>
              <Link
                href={getNavLinkHref('/infografis')}
                className="hover:text-white transition-colors"
              >
                INFOGRAFIS
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                className="hover:text-white transition-colors"
              >
                KONTAK
              </Link>
            </nav>

            {/* Right Action: Pill Button INSTAGRAM ↗ */}
            <div className="hidden sm:flex items-center">
              <a
                href={instagramUrl || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-gradient-to-r from-[#FFFFFF] via-[#E2E6EA] to-[#BAC2CC] text-slate-950 text-xs font-bold tracking-wider uppercase shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Instagram className="w-3.5 h-3.5 text-slate-950" />
                <span>INSTAGRAM</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 bg-[#131518]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 mt-3">
              <div className="flex flex-col space-y-1 font-semibold text-xs tracking-wider uppercase">
                <Link
                  href={getNavLinkHref('/')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg bg-white/10 text-white"
                >
                  BERANDA
                </Link>
                <Link
                  href={getNavLinkHref('/profil')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg text-slate-400 hover:text-white"
                >
                  PROFIL
                </Link>
                <Link
                  href={getNavLinkHref('/artikel')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg text-slate-400 hover:text-white"
                >
                  ARTIKEL
                </Link>
                <Link
                  href={getNavLinkHref('/infografis')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg text-slate-400 hover:text-white"
                >
                  INFOGRAFIS
                </Link>
                <Link
                  href={getNavLinkHref('/kontak')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg text-slate-400 hover:text-white"
                >
                  KONTAK
                </Link>
              </div>

              <div className="pt-2 border-t border-white/10">
                <a
                  href={instagramUrl || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-gradient-to-r from-white via-slate-200 to-slate-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  <Instagram className="w-4 h-4 text-slate-950" />
                  <span>INSTAGRAM</span>
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </a>
              </div>
            </div>
          )}
        </header>

        {/* ── HERO VIEWPORT CONTENT (CENTERED VERTICALLY IN 100VH) ── */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-auto py-2 sm:py-3 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: TITLE "WAKIL RAKYAT" PERSIS "DIGITAL DESIGNER" PADA GAMBAR */}
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-4.5 lg:space-y-5 text-left">
              
              {/* Top Tagline: Clean Minimalist Sans-Serif */}
              <div className="text-[#6D7785] text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.24em] uppercase select-none">
                {headlineTagline || 'PENGABDIAN & AMANAH RAKYAT'}
              </div>

              {/* Giant Stacked Condensed Display with Dual-Tone Metallic Gradients */}
              <h1 className="font-bebas text-7xl sm:text-8xl md:text-9xl lg:text-[7.6rem] xl:text-[8.8rem] 2xl:text-[9.8rem] font-black uppercase tracking-[-0.025em] leading-[0.80] text-white select-none">
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#D5DAE2] via-[#9AA4B2] to-[#606A79]">
                  WAKIL
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#EDEFF3] to-[#B4BECB]">
                  RAKYAT
                </span>
              </h1>

              {/* Description Paragraph (Two-line editorial style specifically for Apex) */}
              <p className="text-xs sm:text-[13px] md:text-[14px] text-[#7E8896] max-w-md leading-relaxed font-sans">
                {apexHeroDescription}
              </p>

              {/* Primary CTA Button: Sharp-Cornered Metallic Liquid Chrome */}
              <div className="pt-1 sm:pt-2">
                <Link
                  href={getNavLinkHref('/artikel')}
                  className="inline-flex items-center gap-3 px-6 py-3.5 sm:px-7 sm:py-3.5 rounded-[2px] bg-gradient-to-r from-[#ECEEF1] via-[#D3D8E0] to-[#9BA5B4] hover:from-[#FFFFFF] hover:to-[#B6BFCB] text-slate-950 font-bold text-xs sm:text-[12.5px] tracking-wider uppercase shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>TELAAH KINERJA RESMI</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-950 stroke-[2.2]" />
                </Link>
              </div>

            </div>

            {/* RIGHT COLUMN: PORTRAIT + ORBITAL CIRCLE + SPARKLE + MANDAT TAG */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-end min-h-[360px] sm:min-h-[420px] lg:min-h-[480px] xl:min-h-[520px]">
              
              {/* Delicate Orbital Circular Arc Line */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[420px] lg:w-[480px] xl:w-[520px] aspect-square rounded-full pointer-events-none select-none z-0"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                }}
              />

              {/* Luminous 4-Point Star Flare (Positioned at 4 o'clock on orbit, matching reference image) */}
              <div className="absolute top-[58%] sm:top-[60%] right-1 sm:right-3 lg:right-4 pointer-events-none select-none z-10 flex items-center justify-center">
                {/* Soft ambient glow halo */}
                <div className="absolute w-6 h-6 bg-white/40 rounded-full blur-[6px]" />
                
                {/* Solid 4-pointed Starburst */}
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.95)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 12 0 Q 12 12 24 12 Q 12 12 12 24 Q 12 12 0 12 Q 12 12 12 0 Z"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>

              {/* Cutout Portrait with Smooth Bottom Masking */}
              <div className="relative w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[440px] xl:max-w-[480px] flex items-end justify-center z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={officialFullName}
                  className="w-full h-auto max-h-[380px] sm:max-h-[450px] lg:max-h-[500px] xl:max-h-[540px] object-contain object-bottom filter contrast-105 drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] select-none"
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 86%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 86%, transparent 100%)',
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('/images/default-avatar.png')) {
                      target.src = '/images/default-avatar.png';
                    }
                  }}
                />
              </div>

              {/* Available Tag on Right (Matching "AVAILABLE FOR FREELANCE PROJECTS ↗") */}
              <div className="absolute bottom-8 sm:bottom-10 right-2 sm:right-4 lg:right-6 z-20 text-right space-y-0.5 select-none">
                <span className="text-[10px] text-[#727B89] font-sans font-medium tracking-[0.24em] uppercase block">
                  MANDAT PARLEMEN
                </span>
                <span className="font-bebas text-3xl sm:text-4xl text-white font-bold tracking-wider block leading-none my-0.5">
                  {cleanLegislativeLevel}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#727B89] font-sans font-medium tracking-[0.16em] uppercase flex items-center justify-end gap-1 hover:text-white transition-colors">
                  <span>{dapil}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </div>

            </div>

          </div>
        </div>

      </section>



      {/* ─── SECTION 2: ARTIKEL (PERSIS 3-COLUMN CARD GRID DI GAMBAR REFERENSI) ─── */}
      <section className="py-16 sm:py-24 bg-[#131518] border-t border-white/5 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 block font-mono">
                KAJIAN &amp; RISALAH PARLEMEN
              </span>
              <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider mt-1">
                ARTIKEL &amp; POKOK PIKIRAN DEWAN
              </h2>
            </div>
            <Link
              href={getNavLinkHref('/artikel')}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors group font-mono"
            >
              <span>EXPLORE ALL ARTICLES</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 3 Columns Grid matching reference image cards */}
          {articlesToDisplay.length === 0 ? (
            <div className="rounded-3xl bg-[#181B22] border border-white/10 p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">Belum ada risalah atau artikel yang dipublikasikan saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {articlesToDisplay.map((art, idx) => (
                <Link
                  key={art.id || art.slug}
                  href={getNavLinkHref(`/artikel/${art.slug}`)}
                  className="group rounded-3xl bg-[#181B22] border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden shadow-2xl flex flex-col justify-between"
                >
                  {/* Visual Header Container with Article Image */}
                  <div className="aspect-[4/3] bg-[#0E1013] relative overflow-hidden border-b border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getArticleImg(art, idx)}
                      alt={art.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallbacks = [
                          '/images/showcase-artikel-pertanian.jpg',
                          '/images/ref-article-1.jpg',
                          '/images/ref-article-2.jpg',
                        ];
                        target.src = fallbacks[idx % fallbacks.length];
                      }}
                    />
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181B22] via-[#181B22]/30 to-black/50 pointer-events-none" />

                    {/* Floating Tags on Top */}
                    <div className="relative z-10 p-5 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {art.category || 'Kebijakan Publik'}
                      </span>
                    </div>

                    {/* Circular Arrow Button at bottom right matching reference image */}
                    <div className="absolute bottom-4 right-4 z-10">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md group-hover:bg-white text-white group-hover:text-black flex items-center justify-center transition-all shadow-lg border border-white/30">
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>

                  {/* Card Title & Meta Content */}
                  <div className="p-6 space-y-2.5 text-left bg-[#181B22]">
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-slate-200 transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {art.excerpt || 'Uraian telaah regulasi dan catatan pembahasan komisi dewan.'}
                    </p>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDateIndonesian(art.publishedAt || art.createdAt)}</span>
                      </div>
                      <span className="text-slate-300 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Baca</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ─── SECTION 3: INFOGRAFIS (PERSIS 3-COLUMN CARD GRID DI GAMBAR REFERENSI) ─── */}
      <section className="py-16 sm:py-24 bg-[#131518] border-t border-white/5 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 block font-mono">
                DATA CAPAIAN &amp; KINERJA
              </span>
              <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider mt-1">
                INFOGRAFIS &amp; TRANSPARANSI PUBLIK
              </h2>
            </div>
            <Link
              href={getNavLinkHref('/infografis')}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors group font-mono"
            >
              <span>EXPLORE ALL INFOGRAPHICS</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 3 Columns Grid matching reference image cards */}
          {infographicsToDisplay.length === 0 ? (
            <div className="rounded-3xl bg-[#181B22] border border-white/10 p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">Belum ada dokumen infografis atau visualisasi capaian yang dipublikasikan saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {infographicsToDisplay.map((info, idx) => (
                <div
                  key={info.id}
                  className="group rounded-3xl bg-[#181B22] border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden shadow-2xl flex flex-col justify-between"
                >
                  {/* Visual Header Container with Infographic Image */}
                  <div className="aspect-[4/3] bg-[#0E1013] relative overflow-hidden border-b border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getInfographicImg(info, idx)}
                      alt={info.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallbacks = [
                          '/images/showcase-infografis-apbd.jpg',
                          '/images/showcase-poster-surya.jpg',
                          '/images/qurifolio/header-infografis-bg.jpg',
                        ];
                        target.src = fallbacks[idx % fallbacks.length];
                      }}
                    />
                    {/* Top Right Maximize Button */}
                    <div className="absolute top-3.5 right-3.5 z-10">
                      <button
                        onClick={() => setSelectedInfographic(info)}
                        className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-slate-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer shadow-lg"
                        title="Perbesar Tampilan"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Circular Arrow Button at bottom right */}
                    <div className="absolute bottom-3.5 right-3.5 z-10">
                      <button
                        onClick={() => setSelectedInfographic(info)}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer shadow-lg border border-white/30"
                      >
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Card Title & Meta Content */}
                  <div className="p-6 space-y-2.5 text-left bg-[#181B22]">
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-slate-200 transition-colors line-clamp-2 leading-snug">
                      {info.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {info.excerpt || 'Visualisasi data capaian dan transparansi alokasi belanja daerah.'}
                    </p>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1 text-slate-400">
                        <ShieldCheck className="w-3 h-3 text-slate-300" />
                        <span>Data Terverifikasi</span>
                      </span>
                      <button
                        onClick={() => setSelectedInfographic(info)}
                        className="text-slate-300 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1 cursor-pointer"
                      >
                        <span>Detail</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ─── FOOTER TERAKHIR: LIQUID CHROME CALLOUT BANNER & FOOTER (PERSIS DI GAMBAR) ─── */}
      <footer className="border-t border-white/10 bg-[#131518] pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Metallic Liquid Chrome Callout Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#1C2028] via-[#181B22] to-[#121418] p-8 sm:p-12 shadow-2xl">
            {/* Liquid chrome ambient gradient highlight */}
            <div className="absolute -top-24 left-1/4 w-96 h-48 bg-gradient-to-r from-white/15 via-slate-300/20 to-transparent rounded-full blur-[60px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-5 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wider leading-none">
                    {tagline || 'SUARAKAN KEBUTUHAN WARGA ✦'}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  {dapil ? `Pengawalan perda, anggaran publik, dan transparansi kebijakan daerah demi kemajuan bersama di ${dapil}.` : 'Pengawalan perda, anggaran publik, dan transparansi kebijakan daerah demi kemajuan bersama.'}
                </p>
              </div>

              <div className="lg:col-span-4 text-left space-y-3">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  Pintu komunikasi resmi selalu terbuka untuk konsultasi kebijakan, kolaborasi daerah, dan audiensi kedewanan.
                </p>
                <a
                  href={instagramUrl || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-white via-slate-200 to-slate-400 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-lg hover:shadow-white/20 transition-all cursor-pointer"
                >
                  <Instagram className="w-4 h-4 text-slate-950" />
                  <span>KUNJUNGI INSTAGRAM</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              <div className="lg:col-span-3 text-left space-y-3 text-xs text-slate-300 font-mono border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-8">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{officialEmail}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{officialPhone || 'Hubungi Sekretariat'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Gedung Parlemen {legislativeLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Legal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-4 border-t border-white/5 font-mono">
            <div>
              &copy; {new Date().getFullYear()} {officialFullName}. Portal Resmi Parlemen POLARIS.
            </div>

            <div className="flex items-center gap-6">
              <span className="text-slate-500 uppercase tracking-widest">LET&apos;S CONNECT</span>
              <a
                href={instagramUrl || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </a>
              <span className="text-slate-600">|</span>
              <Link href={getNavLinkHref('/kontak')} className="hover:text-white transition-colors">
                Kontak &amp; Sekretariat
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── MODAL DIALOG: PREVIEW INFOGRAFIS ─── */}
      {selectedInfographic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#181B22] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 font-mono">
                  {selectedInfographic.category || 'Transparansi Data'}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {selectedInfographic.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInfographic(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Real infographic image preview */}
            <div className="relative rounded-2xl overflow-hidden bg-[#0E1013] border border-white/10 aspect-[16/10] max-h-[55vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getInfographicImg(selectedInfographic, 0)}
                alt={selectedInfographic.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono">Format: Dokumen Infografis Terverifikasi Parlemen</span>
              <button
                onClick={() => setSelectedInfographic(null)}
                className="px-5 py-2.5 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
