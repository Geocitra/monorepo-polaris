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
  Send,
  Sparkles,
  ArrowDown,
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

export function StudioEditorialTemplate({
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
  const monogram = firstName.charAt(0).toUpperCase();

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

  // Real publications from member account (No dummy fallback data)
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
    <div className="min-h-screen bg-[#EDEAE4] text-stone-900 font-sans selection:bg-stone-900 selection:text-white antialiased">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: HERO VIEWPORT (EXACT MATCH REFERENCE IMAGE: ALEX EDITORIAL STUDIO)
          Outer Dark Charcoal Frame: bg-[#252422] with rounded card
          Card Background Split: Left Ivory (#F9F8F5) / Right Studio Plaster Beige (#DDD7CD) with Window Sunlight Shadows
          Initial Viewport: Full 100vh on Desktop/Laptop
          ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="min-h-screen lg:h-screen lg:max-h-screen w-full bg-[#252422] p-3 sm:p-5 lg:p-6 xl:p-8 flex items-center justify-center select-none overflow-hidden relative"
      >
        {/* ─── ROUNDED EDITORIAL CANVAS CARD (MATCHES REFERENCE IMAGE) ─── */}
        <div className="relative w-full h-full max-w-[1560px] mx-auto rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] overflow-hidden shadow-2xl flex flex-col justify-between">
          
          {/* 1. SEAMLESS VERTICAL BACKGROUND SPLIT (LEFT PORCELAIN IVORY / RIGHT STUDIO WALL BEIGE) */}
          <div className="absolute inset-0 flex flex-col lg:flex-row pointer-events-none select-none z-0">
            {/* Left 44% Background: Warm Crisp Porcelain Off-White */}
            <div className="w-full lg:w-[44%] h-full bg-[#F9F8F5]" />

            {/* Right 56% Background: Studio Daylight Plaster Wall with Architectural Shadows */}
            <div className="w-full lg:w-[56%] h-full relative overflow-hidden bg-[#DDD7CD]">
              {/* Daylight Soft Radial Highlight */}
              <div className="absolute inset-0 bg-gradient-to-bl from-white/45 via-transparent to-stone-900/10 pointer-events-none" />

              {/* Photorealistic Diagonal Window Shadow Bands */}
              <div
                className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none"
                style={{
                  background:
                    'repeating-linear-gradient(135deg, rgba(65,55,45,0.25) 0px, rgba(65,55,45,0.25) 100px, transparent 100px, transparent 230px)',
                  filter: 'blur(35px)',
                }}
              />

              {/* Bottom Grounding Ambient Shadow */}
              <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-stone-900/15 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* 2. UNIFIED TOP NAVBAR (EXACT MATCH REFERENCE IMAGE: ONE CONTINUOUS HORIZONTAL BAR) */}
          <header className="relative z-30 w-full pt-6 sm:pt-8 lg:pt-9 px-6 sm:px-10 lg:px-14 xl:px-16 shrink-0">
            <div className="w-full flex items-center justify-between relative">
              
              {/* Left: Brand Monogram A. */}
              <a href="#hero" className="flex items-center gap-1 group shrink-0">
                <span className="font-serif text-3xl sm:text-4xl font-black text-stone-950 tracking-tight group-hover:text-stone-600 transition-colors">
                  {monogram}.
                </span>
              </a>

              {/* Center-Aligned Single Continuous Navigation Bar */}
              {/* Positioned across the seam so HOME/ABOUT land on ivory, WORK/SERVICES/BLOG/CONTACT land on beige */}
              <nav className="hidden md:flex items-center gap-6 lg:gap-7 xl:gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600 lg:absolute lg:left-[44%] lg:-translate-x-[155px]">
                <a
                  href="#hero"
                  className="text-stone-950 font-black relative pb-1 border-b-2 border-stone-950"
                >
                  Beranda
                </a>
                <Link
                  href={getNavLinkHref('/profil')}
                  className="hover:text-stone-950 transition-colors"
                >
                  Tentang
                </Link>
                <a
                  href="#articles"
                  className="hover:text-stone-950 transition-colors"
                >
                  Risalah
                </a>
                <a
                  href="#infographics"
                  className="hover:text-stone-950 transition-colors"
                >
                  Infografis
                </a>
                <a
                  href="#articles"
                  className="hover:text-stone-950 transition-colors"
                >
                  Kajian
                </a>
                <Link
                  href={getNavLinkHref('/kontak')}
                  className="hover:text-stone-950 transition-colors"
                >
                  Kontak
                </Link>
              </nav>

              {/* Right: Instagram Pill Button & Mobile Toggle */}
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={`https://instagram.com/${instagramUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-950 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md group shrink-0"
                >
                  <Instagram className="w-3.5 h-3.5 text-stone-300 group-hover:text-white transition-colors" />
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3 h-3 text-stone-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                {/* Mobile Menu Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="md:hidden p-1.5 rounded-lg text-stone-900 hover:bg-stone-200 transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-3 p-4 rounded-xl bg-white/95 backdrop-blur-md shadow-xl border border-stone-200 space-y-2 text-xs font-bold uppercase tracking-wider text-stone-800 z-50">
                <a
                  href="#hero"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded hover:bg-stone-100 text-stone-950"
                >
                  Beranda
                </a>
                <Link
                  href={getNavLinkHref('/profil')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded hover:bg-stone-100"
                >
                  Tentang
                </Link>
                <a
                  href="#articles"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded hover:bg-stone-100"
                >
                  Risalah
                </a>
                <a
                  href="#infographics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded hover:bg-stone-100"
                >
                  Infografis
                </a>
                <a
                  href="#articles"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded hover:bg-stone-100"
                >
                  Kajian
                </a>
                <Link
                  href={getNavLinkHref('/kontak')}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded hover:bg-stone-100"
                >
                  Kontak
                </Link>
              </div>
            )}
          </header>

          {/* 3. HERO BODY (SPLIT 44% / 56% CONTENT) */}
          <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch w-full overflow-hidden">
            
            {/* ─── LEFT COLUMN (44% WIDTH): EDITORIAL HEADLINE, DUAL CTA, SCROLL ─── */}
            <div className="w-full lg:w-[44%] flex flex-col justify-between pt-4 sm:pt-6 lg:pt-8 pb-6 sm:pb-8 lg:pb-10 px-6 sm:px-10 lg:px-14 xl:px-16 z-20">
              
              {/* Center Left: Micro-label, Editorial Serif Headline, Description, Dual CTA */}
              <div className="my-auto py-4 sm:py-6 lg:py-0">
                {/* Micro-label (Exact match 'HELLO, I'M ALEX') */}
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-stone-500 block mb-3 sm:mb-4">
                  MANDAT &amp; PENGABDIAN RAKYAT
                </span>

                {/* Giant Editorial Serif Headline */}
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[42px] xl:text-[48px] font-bold text-stone-950 leading-[1.12] tracking-tight">
                  Mengawal Amanah Rakyat,<br />
                  Merumuskan Kebijakan<br />
                  Berkeadilan Sosial.
                </h1>

                {/* Subtitle Paragraph */}
                <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed max-w-md mt-4 sm:mt-5 mb-7 sm:mb-8 font-sans">
                  Mendedikasikan pengabdian penuh untuk memperjuangkan aspirasi warga, transparansi alokasi APBD, dan regulasi daerah yang berpihak pada kesejahteraan konstituen di <strong>{dapil}</strong>.
                </p>

                {/* Dual Action Buttons Row (Exact match [VIEW MY WORK ➔] [GET IN TOUCH ➔]) */}
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                  <a
                    href="#articles"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-stone-950 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md group"
                  >
                    <span>Lihat Risalah</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <Link
                    href={getNavLinkHref('/kontak')}
                    className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-stone-950 hover:text-stone-600 transition-colors group"
                  >
                    <span>Hubungi Dewan</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Bottom Left: Scroll Down Indicator (Exact match 'SCROLL DOWN ➔') */}
              <div className="pt-2">
                <a
                  href="#articles"
                  className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-stone-500 hover:text-stone-950 transition-colors group"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-stone-700 group-hover:translate-y-0.5 transition-transform" />
                  <span>Gulir Ke Bawah</span>
                  <span className="text-stone-400 group-hover:translate-x-0.5 transition-transform">➔</span>
                </a>
              </div>

            </div>

            {/* ─── RIGHT COLUMN (56% WIDTH): DEWAN PORTRAIT & FLOATING ASPIRATION CARD ─── */}
            <div className="w-full lg:w-[56%] relative min-h-[440px] lg:min-h-full flex items-end justify-center overflow-hidden">
              
              {/* Full Cutout Portrait Photo of Dewan (Flush at Bottom, Positioned Center-Left of Right Pane) */}
              <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center pointer-events-none z-10 overflow-hidden">
                <img
                  src={photoUrl}
                  alt={officialFullName}
                  className="h-[86%] sm:h-[91%] lg:h-[95%] max-h-[660px] w-auto object-contain object-bottom drop-shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                  }}
                />
              </div>

              {/* Floating White Card (Exact match 'AVAILABLE FOR FREELANCE') */}
              <div className="relative lg:absolute bottom-6 sm:bottom-8 right-6 sm:right-10 z-20 max-w-[270px] sm:max-w-[290px] bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-xl border border-white/80 self-end mt-auto mb-4 sm:mb-0 mr-4 sm:mr-0">
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-stone-500 tracking-[0.2em] uppercase mb-2">
                  <span>•</span>
                  <span>Saluran Aspirasi Aktif</span>
                  <span>•</span>
                </div>
                <p className="text-xs sm:text-[13px] font-medium text-stone-800 leading-snug mb-3 font-sans">
                  Siap menyerap &amp; mengawal aspirasi konstituen secara berkala.
                </p>
                <Link
                  href={getNavLinkHref('/kontak')}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-950 hover:text-stone-600 transition-colors group"
                >
                  <span>Sampaikan Aspirasi</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 2: ARTIKEL & PROFIL SHOWCASE (EXACT MATCH ROW 2 OF REFERENCE)
          Left: 'ABOUT ME' block with 'Building Digital Solutions With Purpose.'
          Right: 'FEATURED WORK / Selected Projects' with 2x2 Grid of 4 Cards
          ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="articles"
        className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto border-t border-stone-300"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT COLUMN (lg:col-span-5): About Me & Dedicated Parliamentary Focus */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-500 block mb-2.5">
                TENTANG PENGABDIAN
              </span>

              {/* Headline with Italic Serif Accent (Matches 'Building Digital Solutions With Purpose.') */}
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-stone-950 leading-[1.15] tracking-tight mb-4">
                Merumuskan Kebijakan<br />
                Dengan <span className="italic font-normal text-stone-700">Integritas.</span>
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                Sebagai perwakilan rakyat di <strong>{legislativeLevel}</strong> ({party}), kami berkomitmen memastikan setiap perumusan anggaran dan regulasi menjawab kebutuhan riil masyarakat di Daerah Pemilihan {dapil}.
              </p>

              {/* Base Location & Dapil Tag */}
              <div className="pt-2 pb-4 border-t border-stone-300/80">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                  MANDAT DAERAH PEMILIHAN
                </span>
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-700" />
                  {dapil} • {commissionName}
                </span>
              </div>

              {/* 4 Focus Bullets (Exact match UI/UX, Web Dev, Brand Identity, CMS in image) */}
              <ul className="space-y-2 py-3 border-t border-stone-300/80 text-xs font-semibold text-stone-700">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
                  <span>Pengawasan Anggaran APBD & Alokasi Publik</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
                  <span>Perumusan & Kajian Akademis Raperda Strategis</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
                  <span>Advokasi Aspirasi & Pokok-Pokok Pikiran Rakyat</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
                  <span>Kunjungan Lapangan & Dialog Terbuka Konstituen</span>
                </li>
              </ul>

              {/* Button (Exact match [MORE ABOUT ME ➔]) */}
              <div className="mt-6">
                <Link
                  href={getNavLinkHref('/profil')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-none bg-stone-950 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-sm"
                >
                  <span>Profil & Rekam Jejak</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (lg:col-span-7): Featured Work & 2x2 Article Cards Grid */}
          <div className="lg:col-span-7">
            {/* Header: Label, Title, and 'VIEW ALL PROJECTS ➔' link */}
            <div className="flex items-end justify-between pb-6 border-b border-stone-300/80 mb-8">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-500 block mb-1">
                  RISALAH & KEBIJAKAN
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight">
                  Kajian Terpilih
                </h3>
              </div>

              <Link
                href={getNavLinkHref('/artikel')}
                className="text-[11px] font-bold uppercase tracking-widest text-stone-950 hover:text-stone-600 flex items-center gap-1.5 transition-colors"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Real Articles List (2x2 Grid) */}
            {articles.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-[#E5E1D8] border border-stone-300 text-stone-600">
                <FileText className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-stone-900 mb-1">
                  Belum Ada Risalah Kebijakan
                </h4>
                <p className="text-xs text-stone-500">
                  Naskah kajian akademis dan risalah sidang dewan sedang dalam proses kurasi publikasi.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {articles.slice(0, 4).map((art, idx) => {
                  const coverImg = getArticleImage(art);
                  return (
                    <Link
                      key={art.id || idx}
                      href={getNavLinkHref(`/artikel/${art.slug}`)}
                      className="group flex flex-col justify-between rounded-xl overflow-hidden bg-white/70 hover:bg-white border border-stone-300/80 hover:border-stone-400 p-3 sm:p-4 transition-all shadow-2xs hover:shadow-md"
                    >
                      {/* Real Article Cover Image (Matches card thumbnails in reference image) */}
                      <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-stone-200 relative mb-3">
                        <img
                          src={coverImg}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                          }}
                        />
                      </div>

                      {/* Card Content */}
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500 mb-1.5">
                          <span className="uppercase tracking-wider font-bold text-stone-700">
                            {art.category || 'Kajian Kebijakan'}
                          </span>
                          <span>{formatDateIndonesian(art.publishedAt || art.createdAt)}</span>
                        </div>

                        <h4 className="font-serif text-base font-bold text-stone-950 group-hover:text-stone-700 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center justify-between text-[11px] font-bold text-stone-900 group-hover:text-stone-600">
                        <span>Baca Kajian</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: INFOGRAFIS (TRANSPARANSI KINERJA & PUBLIKASI DATA TERBUKA)
          - Editorial serif header
          - 3-column poster grid with real infographic images
          - Interactive Lightbox Modal with download feature
          ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="infographics"
        className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto border-t border-stone-300 bg-[#E8E4DC]/50"
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-500 block mb-2">
            DATA & TRANSPARANSI PUBLIK
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 tracking-tight">
            Publikasi Infografis Kinerja
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-3 leading-relaxed">
            Transparansi capaian pokok-pokok pikiran dewan, realisasi pengawasan anggaran daerah, dan akuntabilitas mandat publik.
          </p>
        </div>

        {/* Real Infographics Grid */}
        {infographics.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-white/60 border border-stone-300 text-stone-600 max-w-xl mx-auto">
            <FileText className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-stone-900 mb-1">
              Belum Ada Poster Infografis
            </h4>
            <p className="text-xs text-stone-500">
              Poster infografis transparansi data sedang disiapkan untuk rilis publik.
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
                  className="group rounded-2xl overflow-hidden bg-white border border-stone-300 hover:border-stone-400 transition-all cursor-pointer shadow-sm hover:shadow-lg flex flex-col"
                >
                  {/* Poster Image (4:5 Aspect Ratio) */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-200">
                    <img
                      src={posterImg}
                      alt={info.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Hover Zoom Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-11 h-11 rounded-full bg-stone-950 text-white flex items-center justify-center shadow-xl">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Category Tag */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-bold text-stone-900 uppercase tracking-wider shadow-xs">
                        {info.category || 'Data Publik'}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
                    <h4 className="font-serif text-sm sm:text-base font-bold text-stone-950 group-hover:text-stone-700 transition-colors line-clamp-2 leading-snug">
                      {info.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-stone-500 mt-3 pt-3 border-t border-stone-200">
                      <span>{formatDateIndonesian(info.publishedAt || info.createdAt)}</span>
                      <span className="text-stone-950 font-bold text-[11px] flex items-center gap-1 group-hover:underline">
                        Perbesar
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Infographics Link */}
        {infographics.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href={getNavLinkHref('/infografis')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-none bg-stone-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-sm"
            >
              <span>Jelajahi Arsip Infografis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          LIGHTBOX MODAL FOR INFOGRAFIS
          ────────────────────────────────────────────────────────────────────────── */}
      {activeModalInfo && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveModalInfo(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#EDEAE4] border border-stone-300 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-stone-300 flex items-center justify-between bg-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  {activeModalInfo.category || 'Publikasi Data'}
                </span>
                <h3 className="font-serif text-sm sm:text-base font-bold text-stone-950 line-clamp-1">
                  {activeModalInfo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalInfo(null)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-stone-900/10">
              <img
                src={getInfographicImage(activeModalInfo)}
                alt={activeModalInfo.title}
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-stone-300 flex items-center justify-between bg-white">
              <span className="text-xs text-stone-500">
                {formatDateIndonesian(activeModalInfo.publishedAt || activeModalInfo.createdAt)}
              </span>
              <a
                href={getInfographicImage(activeModalInfo)}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-stone-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Poster</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          FOOTER (WARM EDITORIAL STONE)
          ────────────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-stone-300 bg-[#E2DDD5] py-16 sm:py-20 px-6 sm:px-10 lg:px-16 text-stone-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-serif text-3xl font-black text-stone-950 tracking-tight">
                  {monogram}.
                </span>
                <span className="text-lg font-bold text-stone-950 tracking-tight">
                  {officialFullName}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm">
                Portal komunikasi, transparansi kebijakan, dan saluran advokasi aspirasi konstituen Daerah Pemilihan {dapil}.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={`https://instagram.com/${instagramUsername}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-stone-300 hover:border-stone-950 hover:text-stone-950 text-stone-700 flex items-center justify-center transition-all shadow-2xs"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${officialEmail}`}
                className="w-9 h-9 rounded-full bg-white border border-stone-300 hover:border-stone-950 hover:text-stone-950 text-stone-700 flex items-center justify-center transition-all shadow-2xs"
                title="Email Aspirasi"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-4">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700 font-medium">
              <li>
                <a href="#hero" className="hover:text-stone-950 transition-colors">
                  Beranda Utama
                </a>
              </li>
              <li>
                <Link href={getNavLinkHref('/profil')} className="hover:text-stone-950 transition-colors">
                  Tentang & Rekam Jejak
                </Link>
              </li>
              <li>
                <a href="#articles" className="hover:text-stone-950 transition-colors">
                  Risalah & Kajian
                </a>
              </li>
              <li>
                <a href="#infographics" className="hover:text-stone-950 transition-colors">
                  Infografis Transparansi
                </a>
              </li>
              <li>
                <Link href={getNavLinkHref('/kontak')} className="hover:text-stone-950 transition-colors">
                  Saluran Aspirasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Parliamentary Mandate */}
          <div className="md:col-span-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-4">
              Mandat Konstituen
            </h4>
            <div className="p-4 rounded-xl bg-white/80 border border-stone-300 text-xs text-stone-700 space-y-2">
              <div className="flex items-center gap-2 text-stone-950 font-bold">
                <Building2 className="w-4 h-4 text-stone-700" />
                <span>{legislativeLevel}</span>
              </div>
              <p className="text-stone-600">
                {commissionName} • {party}
              </p>
              <div className="pt-2 border-t border-stone-200 flex items-center gap-1.5 text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-stone-700" />
                <span>Daerah Pemilihan: {dapil}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            © {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-950" />
            <span>Didukung oleh POLARIS Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
