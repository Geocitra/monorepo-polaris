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
  Maximize2,
  CheckCircle2,
  Download,
  Share2,
  FileText,
  Building2,
  MapPin,
  ShieldCheck,
  Award,
  ChevronDown,
  Sparkles,
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

// 12-petal lime starburst matching reference image
function LimeStarburst({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill="#84CC16">
        {[...Array(12)].map((_, i) => (
          <rect
            key={i}
            x="46"
            y="4"
            width="8"
            height="32"
            rx="4"
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="14" fill="#84CC16" />
      </g>
    </svg>
  );
}

// 4-point star sparkle matching reference image
function LimeSparkle({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

// Hand-drawn sketch doodle swirl
function SketchSwirl({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M130 290 C80 210, 90 110, 190 90 C290 70, 340 180, 270 280 C200 370, 110 320, 140 230 C170 150, 260 160, 280 230"
        stroke="#CBD5E1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 6"
      />
    </svg>
  );
}

export function CreatixLimeTemplate({
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
  const firstName = officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] || 'Jonanda';

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);

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

  // Real data only (No dummy fallback data)
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

  // Headline role badge
  const roleBadge = `${legislativeLevel} • ${party}`;

  return (
    <div className="min-h-screen bg-[#070A07] text-white font-sans selection:bg-[#84CC16] selection:text-black overflow-x-hidden antialiased">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: HERO VIEWPORT (EXACT MATCH REFERENCE IMAGE: CREATIX)
          Initial viewport: full 100vh on desktop/laptop
          ────────────────────────────────────────────────────────────────────────── */}
      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: HERO VIEWPORT (EXACT MATCH REFERENCE IMAGE: CREATIX)
          White hero card is edge-to-edge at top, left, and right.
          Black background is visible ONLY at the bottom curve!
          Dewan photo is enlarged and lowered flush with the bottom.
          ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between relative bg-[#070A07] select-none overflow-hidden pb-6 sm:pb-8 lg:pb-12"
      >
        {/* Ambient Lime Glow in Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#84CC16]/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-10 w-[450px] h-[450px] bg-[#84CC16]/8 rounded-full blur-[120px]" />
        </div>

        {/* ─── GIANT WHITE HERO STAGE (EDGE-TO-EDGE ON TOP/SIDES, ROUNDED ONLY AT BOTTOM) ─── */}
        <div className="relative w-full bg-white text-slate-900 rounded-b-[48px] sm:rounded-b-[72px] lg:rounded-b-[96px] shadow-2xl flex-1 flex flex-col justify-between overflow-hidden">
          
          {/* Top-Left Lime Starburst (Positioned beside headline like reference image) */}
          <div className="absolute top-16 sm:top-20 md:top-24 left-6 sm:left-10 lg:left-14 pointer-events-none z-10 hidden sm:block">
            <LimeStarburst className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" />
          </div>

          {/* ─── FLOATING DARK PILL NAVBAR ─── */}
          <header className="pt-4 sm:pt-6 md:pt-7 px-4 sm:px-8 relative z-30">
            <nav className="max-w-2xl mx-auto bg-[#0B0E0B] text-white rounded-full px-6 sm:px-8 py-2.5 sm:py-3 border border-white/10 shadow-2xl flex items-center justify-between">
              
              {/* Left Nav Links */}
              <div className="flex items-center gap-5 sm:gap-7 text-xs sm:text-[13px] font-medium">
                <a
                  href="#hero"
                  className="text-white hover:text-[#84CC16] transition-colors"
                >
                  Beranda
                </a>
                <Link
                  href={getNavLinkHref('/profil')}
                  className="text-white/70 hover:text-[#84CC16] transition-colors"
                >
                  Profil
                </Link>
              </div>

              {/* Center Brand with Glowing Lime Starburst */}
              <a
                href="#hero"
                className="flex items-center gap-2 group cursor-pointer"
              >
                <LimeStarburst className="w-5 h-5 sm:w-6 sm:h-6 text-[#84CC16] group-hover:scale-110 transition-transform" />
                <span className="font-black text-sm sm:text-base tracking-tight text-white group-hover:text-[#84CC16] transition-colors">
                  {firstName.toUpperCase()}
                  <span className="text-[#84CC16]">.</span>
                </span>
              </a>

              {/* Right Nav Links */}
              <div className="flex items-center gap-5 sm:gap-7 text-xs sm:text-[13px] font-medium">
                <a
                  href="#articles"
                  className="text-white/70 hover:text-[#84CC16] transition-colors"
                >
                  Artikel
                </a>
                <a
                  href="#infographics"
                  className="text-white/70 hover:text-[#84CC16] transition-colors"
                >
                  Infografis
                </a>
              </div>
            </nav>
          </header>

          {/* ─── CENTER HEADLINE (EXACT REFERENCE: EMPOWERING BRANDS THROUGH CREATIVE SOLUTIONS //) ─── */}
          <div className="px-4 sm:px-8 pt-2 sm:pt-4 text-center relative z-20">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-black text-slate-950 tracking-tight leading-[1.08] max-w-4xl mx-auto">
              <span>Mengawal Suara Rakyat</span>
              <br />
              <span className="inline-flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                <span>Melalui Kebijakan Berkeadilan</span>
                {/* Lime accent slashes next to headline */}
                <span className="inline-flex items-center gap-1 text-[#84CC16] translate-y-0.5">
                  <span className="w-1.5 h-5 sm:h-6 bg-[#84CC16] rounded-full rotate-[24deg]" />
                  <span className="w-1.5 h-5 sm:h-6 bg-[#84CC16] rounded-full rotate-[24deg]" />
                </span>
              </span>
            </h1>
          </div>

          {/* ─── 3-COLUMN HERO CONTENT (LEFT TEXT, CENTER LOWERED PHOTO OVER GRAY DISC, RIGHT STAT) ─── */}
          <div className="relative z-20 px-6 sm:px-10 md:px-14 lg:px-20 flex-1 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-0 max-w-7xl mx-auto w-full">
            
            {/* LEFT COLUMN: Two tiny lime marks + Paragraph + Outline pill button */}
            <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1 pt-2 md:pt-0 pb-6 sm:pb-12 lg:pb-20">
              {/* Two tiny lime accent marks above paragraph */}
              <div className="flex items-center gap-1 mb-2 text-[#84CC16]">
                <span className="w-1 h-3.5 bg-[#84CC16] rounded-full rotate-[20deg]" />
                <span className="w-1 h-3.5 bg-[#84CC16] rounded-full rotate-[20deg]" />
              </div>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-[250px]">
                Dari advokasi kebijakan publik hingga pengawasan anggaran daerah, kami mendedikasikan transparansi penuh untuk memperjuangkan aspirasi warga di <strong className="text-slate-900 font-semibold">{dapil}</strong>.
              </p>
              <div className="mt-3 sm:mt-4">
                <Link
                  href={getNavLinkHref('/profil')}
                  className="inline-flex items-center px-4 sm:px-5 py-2 rounded-full border border-slate-900 text-slate-950 text-xs font-semibold hover:bg-slate-950 hover:text-white transition-all shadow-2xs"
                >
                  <span>Visi Advokasi</span>
                </Link>
              </div>
            </div>

            {/* CENTER COLUMN: Large gray disc + Lowered & enlarged photo + Sketchy arrow + Dual pill button */}
            <div className="w-full md:w-1/3 flex flex-col items-center justify-end relative order-1 md:order-2 h-full min-h-[320px] sm:min-h-[400px] lg:min-h-[470px]">
              
              {/* FAINT LIGHT-GRAY CIRCULAR DISC (TOUCHES BOTTOM BEHIND PERSON) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-72 sm:w-96 sm:h-96 lg:w-[440px] lg:h-[440px] rounded-full bg-[#F3F4F6] border border-slate-200/80 pointer-events-none z-0" />

              {/* HAND-DRAWN SKETCHY ARROW DOODLE (Pointing from left to elbow) */}
              <div className="absolute bottom-20 sm:bottom-28 left-0 sm:left-4 lg:left-6 z-10 pointer-events-none">
                <svg className="w-14 h-14 sm:w-16 sm:h-16 text-slate-800" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 64 C12 46, 18 28, 34 24 C50 20, 60 34, 50 50 C42 62, 28 68, 46 76 C58 80, 70 74, 78 66" />
                  <polyline points="68 64 78 66 78 76" />
                </svg>
              </div>

              {/* Official Cutout Photo (LOWERED TO BOTTOM & ENLARGED) */}
              <div className="relative z-10 flex items-end justify-center h-full max-h-[360px] sm:max-h-[440px] lg:max-h-[500px]">
                <img
                  src={photoUrl}
                  alt={officialFullName}
                  className="max-h-[300px] sm:max-h-[400px] lg:max-h-[460px] w-auto object-contain object-bottom drop-shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                  }}
                />
              </div>

              {/* FLOATING DUAL PILL BUTTON (RESTS OVER LOWER TORSO AT BOTTOM EDGE) */}
              <div className="relative z-20 -mt-6 sm:-mt-8 mb-2 sm:mb-4">
                <div className="inline-flex items-center p-1 sm:p-1.5 rounded-full bg-black/90 backdrop-blur-md border border-white/20 shadow-2xl">
                  {/* Left Pill: Neon Lime Accent */}
                  <a
                    href="#articles"
                    className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#84CC16] text-slate-950 font-black text-xs sm:text-[13px] hover:bg-[#74BC12] transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Baca Risalah</span>
                  </a>

                  {/* Right Pill: Frosted dark text */}
                  <Link
                    href={getNavLinkHref('/profil')}
                    className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-white/90 hover:text-[#84CC16] font-semibold text-xs sm:text-[13px] transition-colors"
                  >
                    <span>Profil Dewan</span>
                  </Link>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: 5 Lime Stars + 10+ Years Stat */}
            <div className="w-full md:w-1/3 flex flex-col items-center md:items-end text-center md:text-right order-3 pt-2 md:pt-0 pb-6 sm:pb-12 lg:pb-20">
              {/* 5 Lime Stars */}
              <div className="flex items-center gap-1 text-[#84CC16]">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-[#84CC16]" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* 10+ Years Stat */}
              <div className="mt-1.5">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-none">
                  10+ Tahun
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Pengabdian Parlemen
                </p>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 2: ARTIKEL (RISALAH & KAJIAN KEBIJAKAN TERKINI)
          Exact match layout from reference image:
          - Left: 4-point Lime Star + "Turning Ideas Into Masterpieces"
          - Right: Explanatory paragraph
          - Content: Real articles with generated images, lime banner tag
          ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="articles"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 relative"
      >
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <LimeSparkle className="w-5 h-5 text-[#84CC16]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#84CC16]">
                Risalah & Kebijakan Parlemen
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Mewujudkan Gagasan Menjadi Kebijakan Nyata
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
            Kajian mendalam mengenai legislasi daerah, pengawasan anggaran publik, dan advokasi kebijakan strategis yang dirumuskan secara terukur untuk memperjuangkan hak konstituen.
          </p>
        </div>

        {/* Real Articles List */}
        {articles.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0D120D] border border-white/10 max-w-2xl mx-auto">
            <FileText className="w-12 h-12 text-[#84CC16]/60 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">
              Belum Ada Artikel Risalah
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Dokumen kajian kebijakan dan risalah sidang dewan sedang dalam proses penyusunan resmi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Featured Article Card (Matches left card in reference image with lime tag & real image) */}
            {articles[0] && (
              <div className="lg:col-span-7 flex flex-col group">
                <Link
                  href={getNavLinkHref(`/artikel/${articles[0].slug}`)}
                  className="relative rounded-3xl overflow-hidden bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/50 transition-all flex-1 flex flex-col justify-between"
                >
                  {/* Real Article Cover Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                    <img
                      src={getArticleImage(articles[0])}
                      alt={articles[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D120D] via-transparent to-black/20" />

                    {/* Lime Accent Badge in Bottom Left (Matches reference image: [A CREATIVE DESIGN AGENCY ||||]) */}
                    <div className="absolute bottom-4 left-4 z-10 flex items-center bg-[#84CC16] text-slate-950 font-black text-[11px] sm:text-xs uppercase px-3 py-1.5 rounded-md shadow-lg">
                      <span className="tracking-wider">
                        {articles[0].category || 'RISALAH KEBIJAKAN'}
                      </span>
                      <div className="ml-2 pl-2 border-l border-black/20 flex items-center gap-0.5">
                        <div className="w-0.5 h-3 bg-black/60 rounded-full" />
                        <div className="w-0.5 h-3 bg-black/60 rounded-full" />
                        <div className="w-0.5 h-3 bg-black/60 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Article Info */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#84CC16]" />
                          {formatDateIndonesian(articles[0].publishedAt || articles[0].createdAt)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {articles[0].readingTimeMinutes || 4} menit baca
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#84CC16] transition-colors leading-snug">
                        {articles[0].title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                        {articles[0].excerpt || articles[0].content?.slice(0, 160)}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-[#84CC16] flex items-center gap-1.5 transition-colors">
                        Baca Selengkapnya
                        <ArrowUpRight className="w-4 h-4 text-[#84CC16]" />
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Oleh: {officialFullName}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Remaining Articles (Matches right cards in reference image with tall aesthetics) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {articles.slice(1, 4).map((art, idx) => (
                <Link
                  key={art.id || idx}
                  href={getNavLinkHref(`/artikel/${art.slug}`)}
                  className="p-4 sm:p-5 rounded-2xl bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/50 transition-all flex gap-4 group"
                >
                  {/* Real Article Thumbnail */}
                  <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-900 relative">
                    <img
                      src={getArticleImage(art)}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                      }}
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[#84CC16] mb-1.5">
                        {art.category || 'Advokasi'}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#84CC16] transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>{formatDateIndonesian(art.publishedAt || art.createdAt)}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#84CC16] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))}

              {/* View All Articles Button */}
              <Link
                href={getNavLinkHref('/artikel')}
                className="mt-2 w-full py-3.5 rounded-2xl bg-[#0E150E] border border-white/10 hover:border-[#84CC16]/60 text-white font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 transition-all hover:bg-[#121C12]"
              >
                <span>Lihat Semua Risalah & Kajian</span>
                <ArrowRight className="w-4 h-4 text-[#84CC16]" />
              </Link>
            </div>

          </div>
        )}
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: INFOGRAFIS (TRANSPARANSI KINERJA & PUBLIKASI DATA TERBUKA)
          - Lime accent header
          - 3/4-column poster grid with real infographic images
          - Interactive zoom / Lightbox Modal with download feature
          ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="infographics"
        className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 relative"
      >
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-[#84CC16] mb-3">
            <LimeSparkle className="w-4 h-4 text-[#84CC16]" />
            Transparansi Kinerja Parlemen
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Infografis & Publikasi Data Terbuka
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-3 leading-relaxed">
            Visualisasi data pokok-pokok pikiran, realisasi anggaran aspirasi konstituen, dan kinerja pengawasan legislatif dalam format ringkas.
          </p>
        </div>

        {/* Real Infographics Grid */}
        {infographics.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0D120D] border border-white/10 max-w-2xl mx-auto">
            <FileText className="w-12 h-12 text-[#84CC16]/60 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">
              Belum Ada Poster Infografis
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Poster infografis transparansi data sedang disiapkan dan akan segera dipublikasikan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {infographics.slice(0, 6).map((info, idx) => {
              const posterImg = getInfographicImage(info);
              return (
                <div
                  key={info.id || idx}
                  onClick={() => setActiveModalInfo(info)}
                  className="group relative rounded-2xl overflow-hidden bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/60 transition-all cursor-pointer shadow-lg flex flex-col"
                >
                  {/* Poster Image (4:5 Aspect Ratio) */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
                    <img
                      src={posterImg}
                      alt={info.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Hover Zoom Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-[#84CC16] text-black flex items-center justify-center shadow-xl">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Category Tag */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-[#84CC16] uppercase tracking-wider">
                        {info.category || 'Data Publik'}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-[#0E140E]">
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#84CC16] transition-colors line-clamp-2 leading-snug">
                      {info.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-white/5">
                      <span>{formatDateIndonesian(info.publishedAt || info.createdAt)}</span>
                      <span className="text-[#84CC16] font-bold text-[11px] flex items-center gap-1">
                        Buka Poster
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Infographics Button */}
        {infographics.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href={getNavLinkHref('/infografis')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0E150E] border border-white/15 hover:border-[#84CC16] text-white font-bold text-xs sm:text-sm transition-all hover:bg-[#121D12]"
            >
              <span>Jelajahi Arsip Infografis Lengkap</span>
              <ArrowRight className="w-4 h-4 text-[#84CC16]" />
            </Link>
          </div>
        )}
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          LIGHTBOX MODAL FOR INFOGRAFIS
          ────────────────────────────────────────────────────────────────────────── */}
      {activeModalInfo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveModalInfo(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#0D120D] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#84CC16]">
                  {activeModalInfo.category || 'Publikasi Data'}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  {activeModalInfo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalInfo(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-black/40">
              <img
                src={getInfographicImage(activeModalInfo)}
                alt={activeModalInfo.title}
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            {/* Modal Footer with Actions */}
            <div className="px-5 py-3.5 border-t border-white/10 flex items-center justify-between bg-[#0A0E0A]">
              <span className="text-xs text-slate-400">
                {formatDateIndonesian(activeModalInfo.publishedAt || activeModalInfo.createdAt)}
              </span>
              <a
                href={getInfographicImage(activeModalInfo)}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#84CC16] text-black font-bold text-xs hover:bg-[#72B813] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Poster</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          FOOTER (OBSIDIAN DARK + LIME ACCENTS)
          ────────────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#050705] py-14 sm:py-20 px-4 sm:px-6 lg:px-8 text-white relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LimeStarburst className="w-7 h-7 text-[#84CC16]" />
                <span className="text-xl font-black tracking-tight text-white">
                  {officialFullName}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                Portal informasi dan transparansi publik resmi {officialFullName}, mewakili aspirasi masyarakat di {dapil}.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#84CC16] hover:text-[#84CC16] flex items-center justify-center transition-all"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${officialEmail}`}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-[#84CC16] hover:text-[#84CC16] flex items-center justify-center transition-all"
                title="Email Aspirasi"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#84CC16] mb-4">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#hero" className="hover:text-white transition-colors">
                  Beranda Utama
                </a>
              </li>
              <li>
                <Link href={getNavLinkHref('/profil')} className="hover:text-white transition-colors">
                  Profil & Rekam Jejak
                </Link>
              </li>
              <li>
                <a href="#articles" className="hover:text-white transition-colors">
                  Risalah & Kebijakan
                </a>
              </li>
              <li>
                <a href="#infographics" className="hover:text-white transition-colors">
                  Infografis Transparansi
                </a>
              </li>
              <li>
                <Link href={getNavLinkHref('/kontak')} className="hover:text-white transition-colors">
                  Kontak & Lokasi Aspirasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Parliamentary Mandate */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#84CC16] mb-4">
              Mandat Parlemen
            </h4>
            <div className="p-4 rounded-2xl bg-[#0D120D] border border-white/10 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Building2 className="w-4 h-4 text-[#84CC16]" />
                <span>{legislativeLevel}</span>
              </div>
              <p className="text-slate-400">
                {commissionName} • {party}
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-[#84CC16]" />
                <span>Daerah Pemilihan: {dapil}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16]" />
            <span>Didukung oleh POLARIS Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

function ArrowDownSmall({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}
