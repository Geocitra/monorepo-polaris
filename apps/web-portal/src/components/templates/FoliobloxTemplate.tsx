'use client';

import React, { useState, useEffect } from 'react';
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
  Maximize2,
  CheckCircle2,
  Download,
  Share2,
  FileText,
  Building2,
  MapPin,
  ShieldCheck,
  Send,
  Sparkles,
  ArrowDown,
  ChevronRight,
  Landmark,
  Scale,
  Users,
  Compass,
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

export function FoliobloxTemplate({
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
    '/images/default-avatar.png';

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] || 'Alex';

  const rawDapil = member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I';
  const dapil = rawDapil.replace(/_/g, ' ');

  const rawParty = member?.partyAffiliation || 'Fraksi Parlemen';
  const party = rawParty.replace(/_/g, ' ');

  const rawLevel = member?.legislativeLevel || 'DPRD PROVINSI';
  const legislativeLevel = rawLevel.replace(/_/g, ' ');

  const rawCommission = member?.commissionName || 'KOMISI I (PEMERINTAHAN & HUKUM)';
  const commissionName = rawCommission.replace(/_/g, ' ');

  const officialEmail = `aspirasi@${subdomain || 'jonandabrahman'}.polaris.id`;
  const officialPhone = '+62 812-3456-7890';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'jonandabrahman';

  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Solidly lock viewport to Section 1 in full screen when user opens the website
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

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

  const articlesHref = getNavLinkHref('/artikel');
  const infographicsHref = getNavLinkHref('/infografis');

  const articles = recentArticles || [];
  const infographics = recentInfographics || [];

  const getArticleImage = (art: any): string => {
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

  const getInfographicImage = (info: any): string => {
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
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#FF4500] selection:text-white antialiased overflow-x-hidden">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: HERO VIEWPORT (FULL 100VH / 100DVH ON INITIAL LOAD)
          Guaranteed Full 100vh on Every Device: h-screen h-[100dvh] max-h-[100dvh]
          Dramatic Sunset Orange Glow Radial Gradient + Grounded Centered Portrait
          Right-Clustered Navbar + Clean Dual Typography (Edge-to-Edge)
          ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="w-full h-screen h-[100dvh] min-h-[100dvh] max-h-[100dvh] bg-[#0C0301] flex flex-col justify-between select-none overflow-hidden relative shrink-0"
      >
        {/* 1. EXACT STUDIO LIGHTING BACKGROUND (MATCHING FOLIOBLOX SUNSET ORANGE & CRIMSON RED) */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden bg-[#0A0201]">
          {/* Layer A: Base Full Atmosphere Diagonal Gradient (Fiery Orange to Glowing Crimson to Deep Burgundy to Obsidian) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, #FF500A 0%, #EA3604 26%, #BF1E04 50%, #5E0C02 76%, #120201 100%)',
            }}
          />

          {/* Layer B: Key Sunset Hotspot (Left & Center Radiant Glow behind headline and portrait) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 90% 80% at 36% 34%, rgba(255, 96, 20, 0.95) 0%, rgba(245, 60, 5, 0.75) 32%, rgba(195, 25, 2, 0.45) 58%, transparent 82%)',
            }}
          />

          {/* Layer C: Radiant High-Intensity Hotspot Flare (Left Center) */}
          <div className="absolute left-[36%] top-[34%] -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full bg-[#FF4E05]/50 blur-[130px] pointer-events-none mix-blend-screen" />

          {/* Layer D: Dedicated Studio Rim Glow Behind Head & Profile */}
          <div className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full bg-[#FF5B14]/45 blur-[85px] pointer-events-none mix-blend-screen" />

          {/* Layer E: Top-Right Glowing Crimson / Ruby Red Atmosphere (Behind navbar & CTA button) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 75% 65% at 84% 18%, rgba(216, 36, 8, 0.9) 0%, rgba(168, 20, 3, 0.65) 40%, rgba(85, 8, 2, 0.35) 70%, transparent 100%)',
            }}
          />
          <div className="absolute right-[4%] top-[10%] w-[680px] h-[680px] rounded-full bg-[#D82408]/40 blur-[130px] pointer-events-none mix-blend-screen" />

          {/* Layer F: Soft Deep Mahogany / Dark Wine Shading for White Text Readability */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 65% 55% at 88% 66%, rgba(18, 2, 1, 0.72) 0%, rgba(40, 6, 2, 0.42) 50%, transparent 100%)',
            }}
          />

          {/* Layer G: Top Subtle Edge Tone for Header Crispness */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#0A0201]/30 via-transparent to-transparent pointer-events-none" />

          {/* Layer H: Bottom Grounding Fade (Grounds portrait chest and partner strip naturally into black) */}
          <div className="absolute bottom-0 inset-x-0 h-44 sm:h-52 bg-gradient-to-t from-[#050101] via-[#080201]/85 to-transparent pointer-events-none" />
        </div>

        {/* 2. TOP NAVBAR (EXACT MATCH REFERENCE: Folioblox | Home About Projects | [Get in touch ➔]) */}
        <header className="relative z-30 w-full max-w-[1600px] mx-auto pt-7 sm:pt-9 px-6 sm:px-10 lg:px-16 shrink-0">
          <div className="w-full flex items-center justify-between">
            
            {/* Brand Logo / Official Full Name */}
            <a href="#hero" className="flex items-center gap-1 group shrink-0">
              <span className="font-jakarta font-extrabold text-xl sm:text-2xl text-white tracking-tight group-hover:opacity-90 transition-opacity">
                {officialFullName}
              </span>
            </a>

            {/* Right Cluster: Navigation Links + Pill CTA Button (Exact match layout in reference image) */}
            <div className="flex items-center gap-6 lg:gap-8 shrink-0">
              
              {/* Desktop Navigation Links (Beranda, Profil, Tentang, Artikel, Infografis) */}
              <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-jakarta text-[14px] font-medium text-white/80">
                <a
                  href="#hero"
                  className="text-white font-semibold hover:text-white transition-colors"
                >
                  Beranda
                </a>
                <Link
                  href={getNavLinkHref('/profil')}
                  className="hover:text-white transition-colors"
                >
                  Profil
                </Link>
                <Link
                  href={getNavLinkHref('/profil')}
                  className="hover:text-white transition-colors"
                >
                  Tentang
                </Link>
                <a
                  href="#articles"
                  className="hover:text-white transition-colors"
                >
                  Artikel
                </a>
                <a
                  href="#infographics"
                  className="hover:text-white transition-colors"
                >
                  Infografis
                </a>
              </nav>

              {/* Right Action Button: White Capsule Pill with Orange Circle Arrow (Exact match '[Get in touch ➔]') */}
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full bg-white text-[#0A0A0A] font-jakarta text-[13px] font-bold hover:bg-stone-100 transition-all shadow-xl group"
              >
                <span>Instagram</span>
                <div className="w-7 h-7 rounded-full bg-[#FF4500] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </a>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 p-4 rounded-2xl bg-black/95 backdrop-blur-xl shadow-2xl border border-white/10 space-y-2 text-xs font-bold uppercase tracking-wider text-white/90 z-50">
              <a
                href="#hero"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-lg hover:bg-white/10 text-white"
              >
                Beranda
              </a>
              <Link
                href={getNavLinkHref('/profil')}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-lg hover:bg-white/10"
              >
                Profil
              </Link>
              <Link
                href={getNavLinkHref('/profil')}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-lg hover:bg-white/10"
              >
                Tentang
              </Link>
              <a
                href="#articles"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-lg hover:bg-white/10"
              >
                Artikel
              </a>
              <a
                href="#infographics"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-lg hover:bg-white/10"
              >
                Infografis
              </a>
            </div>
          )}
        </header>

        {/* 3. CENTER HERO CONTENT: GROUNDED PORTRAIT + DUAL TYPOGRAPHY SHOWCASE (EDGE-TO-EDGE) */}
        <div className="relative z-20 flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto w-full my-auto py-4">
          
          {/* Centered Dewans Portrait Cutout - Grounded at absolute bottom with Sunset Glow */}
          <div className="absolute inset-x-0 bottom-0 top-10 flex items-end justify-center pointer-events-none z-10 overflow-hidden">
            <img
              src={photoUrl}
              alt={officialFullName}
              className="h-[86%] sm:h-[91%] lg:h-[96%] max-h-[780px] w-auto object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] filter contrast-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/default-avatar.png';
              }}
            />
          </div>

          {/* Typography Overlay Grid (Left Giant Headline / Right Statement) */}
          <div className="relative z-20 w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-4 lg:pb-8">
            
            {/* LEFT: Micro-label + Giant Bold Typography (Exact match 'Hey, I'm a Creative Director') */}
            <div className="max-w-2xl select-text">
              <span className="font-outfit font-semibold text-base sm:text-lg lg:text-[22px] text-white/95 tracking-normal mb-1.5 sm:mb-2 block">
                Amanah Konstituen,
              </span>
              <h1 className="font-outfit font-black text-5xl sm:text-6xl md:text-7xl lg:text-[92px] xl:text-[108px] 2xl:text-[116px] text-white leading-[0.91] tracking-[-0.04em] drop-shadow-2xl">
                Suara<br />Rakyat
              </h1>
            </div>

            {/* RIGHT: Statement headline & subtext (Exact match 'Great design should feel invisible.') */}
            <div className="max-w-[360px] sm:max-w-[380px] lg:text-left self-start lg:self-center select-text pt-1 lg:pt-0 lg:mr-4 xl:mr-10">
              <h2 className="font-outfit font-semibold text-[19px] sm:text-[21px] lg:text-[23px] text-white leading-[1.25] tracking-[-0.015em] mb-3 sm:mb-4">
                Kebijakan terbaik lahir dari nurani rakyat.
              </h2>
              <p className="font-outfit font-normal text-xs sm:text-[13px] md:text-[13.5px] text-white/65 leading-[1.65]">
                Dari serap aspirasi hingga pengawasan alokasi APBD, mengawal kebijakan pro-rakyat yang berkeadilan di {dapil}.
              </p>
            </div>

          </div>

        </div>

        {/* 4. INSTITUTIONAL PARTNERS STRIP (BOTTOM OF SECTION 1, FULLY VISIBLE ON INITIAL LOAD) */}
        <div className="relative z-30 w-full bg-[#070201]/80 backdrop-blur-md py-3 sm:py-3.5 px-6 sm:px-10 lg:px-16 border-t border-white/10 shrink-0">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3 text-white/60 text-xs font-semibold">
            <span className="font-jakarta text-white/40 uppercase tracking-widest text-[10px] font-bold">
              Kemitraan Komisi &amp; Alat Kelengkapan Dewan:
            </span>
            <div className="flex items-center gap-6 sm:gap-10 flex-wrap">
              <span className="flex items-center gap-2 hover:text-white transition-colors">
                <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF5500]" />
                <span className="font-jakarta text-[11px] sm:text-xs">Komisi I Pemerintahan</span>
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors">
                <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF5500]" />
                <span className="font-jakarta text-[11px] sm:text-xs">Badan Pembentukan Perda</span>
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF5500]" />
                <span className="font-jakarta text-[11px] sm:text-xs">Badan Anggaran APBD</span>
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF5500]" />
                <span className="font-jakarta text-[11px] sm:text-xs">Posko Reses Konstituen</span>
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 2: ARTIKEL (EXACT MATCH ROW 2 OF REFERENCE)
          Left: 'Behind the Designs' in Orange + Giant 'Shaping Experiences That Make Life Simpler'
          Right: Subtitle + 'Let\'s Build Something Meaningful Together' + Orange Capsule Button
          Bottom: 3 High-Impact Vertical Posters (Exact Match 3 Monochrome Cards)
          ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="articles"
        className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 max-w-[1560px] mx-auto border-t border-white/10"
      >
        {/* Top Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-14 sm:mb-16">
          
          {/* Left Column: Orange Micro-label & Giant Headline */}
          <div className="lg:col-span-7">
            <span className="text-xs sm:text-sm font-bold text-orange-500 uppercase tracking-wider block mb-3">
              Kajian &amp; Risalah Dewan
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black text-white leading-[1.08] tracking-tight">
              Mendorong Regulasi Nyata Yang Berpihak Pada Rakyat
            </h2>
          </div>

          {/* Right Column: Paragraph, Prompt & Orange Action Button */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full pt-2">
            <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-6 font-normal">
              Sebagai perwakilan rakyat di <strong>{legislativeLevel}</strong> ({party}), setiap risalah dan artikel kami dedikasikan untuk mengkaji alokasi anggaran serta memperjuangkan hak konstituen di Dapil {dapil}.
            </p>
            <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
              <span className="text-xs text-white/40 font-medium">
                Sampaikan Masukan Ide &amp; Regulasi Daerah
              </span>
              <Link
                href={articlesHref}
                className="inline-flex items-center gap-2 pl-5 pr-2 py-2.5 rounded-full bg-[#FF4500] text-white text-xs font-bold hover:bg-[#E03E00] transition-all shadow-lg group"
              >
                <span>Lihat Risalah</span>
                <div className="w-5 h-5 rounded-full bg-white text-stone-950 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </div>
          </div>

        </div>

        {/* 3 High-Impact Vertical Cards Grid (Exact match the 3 card posters in screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {articles.slice(0, 3).map((art, idx) => {
            const img = getArticleImage(art);
            const title = art?.title || `Kajian Risalah Terpilih Ke-${idx + 1}`;
            const excerpt =
              art?.excerpt ||
              art?.summary ||
              'Analisis komprehensif terkait kebijakan anggaran dan pemenuhan hak-hak pelayanan masyarakat daerah.';
            const dateStr = formatDateIndonesian(art?.createdAt || new Date());
            const detailHref = getNavLinkHref(`/artikel/${art?.slug || idx + 1}`);

            return (
              <Link
                key={art?.id || idx}
                href={detailHref}
                className="group relative rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#141414] border border-white/10 hover:border-orange-500/50 transition-all duration-300 flex flex-col aspect-[4/5] justify-between p-6 sm:p-8"
              >
                {/* Background Image with Cinematic Monochrome / Dark Contrast Tone */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover grayscale contrast-125 brightness-75 group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-90 transition-all duration-700"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                {/* Top Badge: Index Tag & Category */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold text-orange-400">
                    #0{idx + 1}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white/80">
                    {dateStr}
                  </span>
                </div>

                {/* Bottom Content: Title & Arrow Button */}
                <div className="relative z-10 pt-10">
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                    {title}
                  </h3>
                  <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-4 font-normal">
                    {excerpt}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: INFOGRAFIS (DATA & TRANSPARANSI PUBLIK)
          High-Impact Visual Transparansi Posters with Interactive Lightbox Modal
          ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="infographics"
        className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 max-w-[1560px] mx-auto border-t border-white/10 bg-[#0D0D0D]"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <span className="text-xs sm:text-sm font-bold text-orange-500 uppercase tracking-wider block mb-3">
              Data &amp; Transparansi Kinerja
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Publikasi Infografis Kinerja &amp; Anggaran
            </h2>
          </div>
          <Link
            href={infographicsHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white text-xs font-bold hover:bg-white/10 transition-all shrink-0"
          >
            <span>Semua Infografis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Column Infographic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {infographics.slice(0, 3).map((info, idx) => {
            const img = getInfographicImage(info);
            const title = info?.title || `Infografis Transparansi APBD Ke-${idx + 1}`;
            const dateStr = formatDateIndonesian(info?.createdAt || new Date());

            return (
              <div
                key={info?.id || idx}
                onClick={() => setActiveModalInfo(info)}
                className="group relative rounded-[28px] overflow-hidden bg-[#141414] border border-white/10 hover:border-orange-500/50 transition-all duration-300 flex flex-col cursor-pointer shadow-lg"
              >
                {/* Poster Image */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-900">
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                  {/* Top Zoom Icon */}
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#FF4500] group-hover:border-[#FF4500] transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </div>

                  {/* Bottom Title on Poster */}
                  <div className="absolute bottom-4 inset-x-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block mb-1">
                      {dateStr}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-snug">
                      {title}
                    </h4>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-[#141414] flex items-center justify-between text-xs font-bold text-white/80 group-hover:text-orange-400 transition-colors">
                  <span>Lihat Detail Infografis</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          FOOTER (DARK NOIR EDITORIAL WITH LEGISLATIVE CREDENTIALS)
          ────────────────────────────────────────────────────────────────────────── */}
      <footer id="kontak" className="w-full bg-[#050505] border-t border-white/10 text-white py-16 px-6 sm:px-10 lg:px-16">
        <div className="max-w-[1560px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 mb-14">
          
          {/* Col 1: Brand & Official Mandate */}
          <div className="md:col-span-5">
            <span className="font-extrabold text-2xl text-white tracking-tight block mb-3">
              {firstName.toLowerCase()}
              <span className="text-orange-500 font-black">blox</span>
            </span>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-sm mb-6">
              Saluran portal resmi transparansi aspirasi publik, rekam jejak legislasi, dan laporan kinerja parlemen {officialFullName} ({party}) untuk Daerah Pemilihan {dapil}.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-orange-500 hover:text-orange-400 flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${officialEmail}`}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-orange-500 hover:text-orange-400 flex items-center justify-center transition-all"
                aria-label="Email Aspirasi"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">
              Navigasi Halaman
            </h5>
            <ul className="space-y-2.5 text-xs font-medium text-white/70">
              <li>
                <a href="#hero" className="hover:text-white transition-colors">
                  Beranda Utama
                </a>
              </li>
              <li>
                <Link href={getNavLinkHref('/profil')} className="hover:text-white transition-colors">
                  Profil &amp; Rekam Jejak
                </Link>
              </li>
              <li>
                <Link href={articlesHref} className="hover:text-white transition-colors">
                  Kajian &amp; Risalah Parlemen
                </Link>
              </li>
              <li>
                <Link href={infographicsHref} className="hover:text-white transition-colors">
                  Infografis Kinerja
                </Link>
              </li>
              <li>
                <Link href={getNavLinkHref('/kontak')} className="hover:text-white transition-colors">
                  Saluran Kontak &amp; Aspirasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Credentials */}
          <div className="md:col-span-4">
            <h5 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">
              Kredensial Parlemen
            </h5>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-white/80">
              <p>
                <strong>Jabatan:</strong> {legislativeLevel}
              </p>
              <p>
                <strong>Fraksi:</strong> {party}
              </p>
              <p>
                <strong>Penugasan:</strong> {commissionName}
              </p>
              <p>
                <strong>Daerah Pemilihan:</strong> {dapil}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="max-w-[1560px] mx-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>© {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Powered by POLARIS Engine</span>
          </p>
        </div>
      </footer>

      {/* ──────────────────────────────────────────────────────────────────────────
          LIGHTBOX MODAL FOR INFOGRAPHICS
          ────────────────────────────────────────────────────────────────────────── */}
      {activeModalInfo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveModalInfo(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-[#141414] rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                  Infografis Publikasi Kinerja
                </span>
                <h3 className="text-base sm:text-xl font-bold text-white line-clamp-1">
                  {activeModalInfo?.title || 'Detail Infografis'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalInfo(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Image */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-black/60">
              <img
                src={getInfographicImage(activeModalInfo)}
                alt={activeModalInfo?.title || 'Infografis'}
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap bg-[#141414]">
              <span className="text-xs text-white/60">
                {formatDateIndonesian(activeModalInfo?.createdAt || new Date())}
              </span>
              <a
                href={getInfographicImage(activeModalInfo)}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF4500] text-white text-xs font-bold hover:bg-[#E03E00] transition-colors shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Infografis</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
