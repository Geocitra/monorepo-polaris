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

export function AmberPortfolioTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: TemplateProps) {
  const primaryColor = theme?.primaryHexColor || '#EA580C'; // Fiery burnt orange / glowing amber
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/default-avatar.png';

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B';
  const dapil =
    (member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I').replace(/_/g, ' ');
  const party = (member?.partyAffiliation || 'Fraksi Parlemen').replace(/_/g, ' ');
  const legislativeLevel = (member?.legislativeLevel || 'DPRD PROVINSI').replace(/_/g, ' ');
  const commissionName = (member?.commissionName || 'KOMISI I (PEMERINTAHAN & HUKUM)').replace(/_/g, ' ');
  const officialEmail = `kontak@${subdomain || 'jonandabrahman'}.polaris.id`;
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

  function toTitleCase(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Pisahkan nama depan dan belakang agar tertumpuk raksasa persis di poster referensi Robin Ahmed
  function getHeroNames(fullName?: string): { first: string; last: string } {
    if (!fullName) return { first: 'Robin', last: 'Ahmed' };
    const clean = fullName
      .replace(/^(dr\.|ir\.|drs\.|dra\.|h\.|hj\.|prof\.)\s+/gi, '')
      .replace(/,\s*(m\.sc|s\.t|s\.e|m\.m|s\.h|m\.h|s\.ip|m\.ip|ph\.d|m\.a).*$/gi, '')
      .trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return { first: toTitleCase(clean), last: '' };
    if (parts.length === 2) return { first: toTitleCase(parts[0]), last: toTitleCase(parts[1]) };
    return { first: toTitleCase(parts[0]), last: toTitleCase(parts.slice(1).join(' ')) };
  }

  const { first: heroFirstName, last: heroLastName } = getHeroNames(officialFullName);
  const logoText = heroFirstName ? `${heroFirstName.toUpperCase()}WEB` : 'ROBINSWEB';

  const headline =
    theme?.headlineTagline ||
    'Menghubungkan Aspirasi Menjadi Kebijakan Nyata';

  const bioStatement =
    theme?.bioBiography ||
    `Saya ${officialFullName} — Anggota ${legislativeLevel} ${party} yang berdedikasi menjembatani aspirasi akar rumput dengan kebijakan parlemen. Saya hadir bukan sekadar menempati kursi dewan, melainkan memastikan setiap suara warga terkonversi menjadi aksi nyata dan regulasi yang berkeadilan.`;

  const isHomePage =
    !pathname ||
    pathname === '/' ||
    pathname === `/${subdomain}` ||
    (subdomain ? pathname.endsWith(`/${subdomain}`) : false);

  const articlesHref = isHomePage ? '#articles' : getNavLinkHref('/artikel');
  const infographicsHref = isHomePage ? '#infographics' : getNavLinkHref('/infografis');

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
    <div className="min-h-screen bg-[#070605] text-stone-100 font-sans selection:bg-[#EA580C] selection:text-white antialiased overflow-x-hidden">
      
      {/* ─── FULL-SCREEN HERO VIEWPORT (STICKY NAVBAR + SECTION 1 FULL HEIGHT 100VH) ─── */}
      <div className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between relative bg-[#070605] text-white overflow-hidden select-none">
        
        {/* ─── AMBIENT ATMOSPHERE GLOWS & COSMIC STARDUST (EXACT MATCH TO REFERENCE IMAGE) ─── */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
          {/* Left Fiery Amber Glow Pillar */}
          <div
            className="absolute -left-28 top-[45%] -translate-y-1/2 w-[420px] sm:w-[580px] lg:w-[720px] h-[550px] sm:h-[720px] lg:h-[880px] rounded-full blur-[110px] opacity-50"
            style={{
              background: 'radial-gradient(circle, #EA580C 0%, #C2410C 40%, rgba(7,6,5,0) 75%)',
            }}
          />

          {/* Right Fiery Amber Glow Pillar */}
          <div
            className="absolute -right-28 top-[45%] -translate-y-1/2 w-[420px] sm:w-[580px] lg:w-[720px] h-[550px] sm:h-[720px] lg:h-[880px] rounded-full blur-[110px] opacity-50"
            style={{
              background: 'radial-gradient(circle, #EA580C 0%, #C2410C 40%, rgba(7,6,5,0) 75%)',
            }}
          />

          {/* Center Intense Radiant Halo behind head & shoulders */}
          <div
            className="absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] lg:w-[650px] h-[340px] sm:h-[500px] lg:h-[650px] rounded-full blur-[85px] opacity-60"
            style={{
              background: 'radial-gradient(circle, #F97316 0%, #EA580C 38%, #9A3412 65%, rgba(7,6,5,0) 80%)',
            }}
          />

          {/* Subtle Cosmic Star Dust Texture Overlay */}
          <div
            className="absolute inset-0 opacity-[0.14] mix-blend-screen"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.95) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        {/* ─── TOP NAVBAR: ROBINSWEB FLOATING ISLAND PILL STYLE (PERSIS GAMBAR) ─── */}
        <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 flex items-center justify-between relative z-30 shrink-0">
          
          {/* Left: Brand Monogram / Text Logo (e.g. ROBINSWEB style) */}
          <Link href={getNavLinkHref('/')} className="flex items-center gap-2 group">
            <span className="font-condensed font-bold text-2xl sm:text-3xl tracking-wider text-white uppercase group-hover:text-orange-400 transition-colors">
              {logoText}
            </span>
          </Link>

          {/* Center: Floating Dark Glass Island Pill Navigation */}
          <nav className="hidden md:flex items-center bg-[#171310]/85 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl">
            <Link
              href={getNavLinkHref('/')}
              className="bg-white text-black font-semibold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-sm transition-all"
            >
              Beranda
            </Link>
            <Link
              href={getNavLinkHref('/profil')}
              className="text-stone-300 hover:text-white font-medium text-xs sm:text-sm px-4 py-1.5 rounded-full hover:bg-white/5 transition-all"
            >
              Profil
            </Link>
            <Link
              href={articlesHref}
              className="text-stone-300 hover:text-white font-medium text-xs sm:text-sm px-4 py-1.5 rounded-full hover:bg-white/5 transition-all"
            >
              Artikel
            </Link>
            <Link
              href={infographicsHref}
              className="text-stone-300 hover:text-white font-medium text-xs sm:text-sm px-4 py-1.5 rounded-full hover:bg-white/5 transition-all"
            >
              Infografis
            </Link>
            <Link
              href={getNavLinkHref('/kontak')}
              className="text-stone-300 hover:text-white font-medium text-xs sm:text-sm px-4 py-1.5 rounded-full hover:bg-white/5 transition-all"
            >
              Kontak
            </Link>
          </nav>

          {/* Right Action: Instagram Pill Badge */}
          <div className="flex items-center gap-3">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white font-medium text-xs bg-white/5 hover:bg-white/10 border border-white/10 transition-all select-none"
            >
              <Instagram className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate max-w-[110px]">@{instagramUsername}</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu Dropdown Drawer */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-4 right-4 mt-2 md:hidden border border-white/10 bg-[#120E0C]/95 backdrop-blur-xl rounded-2xl p-4 space-y-2 text-sm font-medium shadow-2xl z-50">
              <Link
                href={getNavLinkHref('/')}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-white font-semibold bg-white/10"
              >
                Beranda
              </Link>
              <Link
                href={getNavLinkHref('/profil')}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Profil Dewan
              </Link>
              <Link
                href={articlesHref}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Artikel & Berita
              </Link>
              <Link
                href={infographicsHref}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Infografis Kinerja
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Kontak
              </Link>

              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                <a
                  href={`https://instagram.com/${instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-orange-400" />
                  <span>Instagram @{instagramUsername}</span>
                </a>
              </div>
            </div>
          )}
        </header>

        {/* ─── SECTION 1 BODY: HERO SHOWCASE PERSIS SEPERTI GAMBAR ROBIN AHMED ─── */}
        <section className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex flex-col justify-between pt-6 sm:pt-10 lg:pt-14 pb-4 sm:pb-6 min-h-0 z-10 overflow-hidden">
          
          {/* 1. TOP-MIDDLE LAYER: "Hi, I am" POSITIONED EXACTLY OVER "Robin" + CENTERED "Robin Ahmed" */}
          <div className="w-full flex justify-center items-center relative z-0 shrink-0 pt-6 sm:pt-10 lg:pt-14">
            <div className="relative inline-block mx-auto text-center pointer-events-none select-none">
              
              {/* "Hi, I am" Label (Floating right above the start of the first name, matching screenshot) */}
              <div className="absolute -top-5 sm:-top-7 lg:-top-8 left-1 sm:left-2 lg:left-3">
                <span className="text-stone-300 font-sans text-xs sm:text-sm lg:text-base font-normal tracking-wide select-none">
                  Hi, I am
                </span>
              </div>

              {/* Giant Name: Robin Ahmed (Centered horizontally, face overlaps the middle) */}
              <h1 className="font-condensed text-[17vw] sm:text-[15vw] lg:text-[13.5vw] font-bold tracking-tight text-white/95 leading-none whitespace-nowrap">
                <span>{heroFirstName}</span>
                {heroLastName && (
                  <span className="ml-3 sm:ml-5 lg:ml-7">{heroLastName}</span>
                )}
              </h1>
            </div>
          </div>

          {/* 2. CENTER LAYER: CUTOUT PORTRAIT WITH FIERY AMBER AURA BEHIND */}
          <div className="absolute inset-x-0 bottom-0 top-16 sm:top-20 flex justify-center items-end pointer-events-none z-10 overflow-hidden">
            <div className="relative w-full max-w-[320px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[560px] h-full flex items-end justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-full max-h-[82%] sm:max-h-[86%] lg:max-h-[90%] object-contain object-bottom filter contrast-105 drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] select-none"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                }}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/images/default-avatar.png')) {
                    target.src = '/images/default-avatar.png';
                  }
                }}
              />
            </div>
          </div>

          {/* 3. BOTTOM LAYER: SUB-HERO SPLIT ROW (LEFT: HEADLINE & CTA, RIGHT: FLOATING SATISFACTION CARD) */}
          <div className="relative z-20 shrink-0 w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-end pb-1 sm:pb-2">
            
            {/* LEFT COLUMN: TRUST TAG, PUNCHY TITLE & ACTION BUTTONS */}
            <div className="md:col-span-7 lg:col-span-6 space-y-2.5 sm:space-y-3.5 text-left">
              {/* Trust Tag with Orange Bullet */}
              <div className="inline-flex items-center gap-2 text-stone-300 text-xs sm:text-sm font-medium">
                <span className="text-[#EA580C] text-sm font-bold">✦</span>
                <span>Dipercaya 100K+ Warga {dapil}</span>
              </div>

              {/* Punchy Headline in Oswald Condensed Style */}
              <h2 className="font-condensed text-3xl sm:text-4xl lg:text-[46px] text-white uppercase tracking-tight leading-[0.96] max-w-md sm:max-w-lg drop-shadow-lg">
                {headline}
              </h2>

              {/* Action Buttons: Orange Pill Profile + View Articles Link */}
              <div className="flex flex-wrap items-center gap-4 pt-1 sm:pt-2">
                {/* Orange Pill CTA: Lihat Rekam Jejak (Matching Robin Ahmed "Start a Project" Orange Pill) */}
                <Link
                  href={getNavLinkHref('/profil')}
                  className="inline-flex items-center gap-3 pl-5 pr-2 py-2 sm:pl-6 sm:pr-2.5 sm:py-2.5 rounded-full bg-[#EA580C] hover:bg-[#F97316] text-white font-semibold text-xs sm:text-sm shadow-xl shadow-orange-950/70 hover:scale-102 active:scale-98 transition-all group"
                >
                  <span>Lihat Rekam Jejak</span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-[#EA580C] flex items-center justify-center shrink-0 shadow-sm">
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Link>

                {/* Secondary Link: Baca Risalah Dewan ↗ */}
                <a
                  href="#articles"
                  className="inline-flex items-center gap-1.5 text-stone-300 hover:text-white font-medium text-xs sm:text-sm transition-colors py-2 group"
                >
                  <span>Baca Risalah Dewan</span>
                  <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#EA580C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* RIGHT COLUMN: FLOATING GLASSMORPHIC SATISFACTION CARD PERSIS GAMBAR */}
            <div className="md:col-span-5 lg:col-span-6 flex md:justify-end">
              <div className="w-full max-w-sm rounded-2xl p-4 sm:p-5 bg-[#14100D]/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden group hover:border-orange-500/40 transition-all">
                {/* Subtle Amber Glow Ambient Line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{
                    background: 'linear-gradient(90deg, #EA580C 0%, #F97316 50%, #C2410C 100%)',
                  }}
                />

                {/* Top Row: Overlapping Avatars + White Circular Arrow Button */}
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex -space-x-2 overflow-hidden">
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#14100D] bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      JK
                    </div>
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#14100D] bg-stone-700 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      AD
                    </div>
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#14100D] bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      SR
                    </div>
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#14100D] bg-stone-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      WN
                    </div>
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#14100D] bg-stone-800 text-orange-400 text-[10px] font-bold flex items-center justify-center shadow-sm">
                      +10k
                    </div>
                  </div>

                  {/* Circular White Button with Orange Arrow (Persis Gambar Referensi) */}
                  <div className="w-7 h-7 rounded-full bg-white text-[#EA580C] flex items-center justify-center shrink-0 shadow-md">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Middle Text: 99.8% Program Kerja Terverifikasi */}
                <p className="text-xs sm:text-sm font-medium text-stone-200 leading-snug">
                  99.8% Program Advokasi Terverifikasi &mdash; Terkawal Nyata di Parlemen.
                </p>

                {/* Bottom Row: Two Pill Badges */}
                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/10">
                  <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[#2A170F]/90 text-orange-200 border border-orange-500/25">
                    Kinerja Legislasi
                  </span>
                  <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[#2A170F]/90 text-orange-200 border border-orange-500/25">
                    Respon &lt; 24 Jam
                  </span>
                </div>
              </div>
            </div>

          </div>

        </section>
      </div>

      {/* ─── SECTION 2: ARTIKEL (KAJIAN KEBIJAKAN & CATATAN PARLEMEN) ─── */}
      <section id="articles" className="py-20 sm:py-28 border-t border-white/10 bg-[#0A0908]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6 text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C] flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Risalah &amp; Gagasan Kebijakan
              </span>
              <h2 className="font-bebas text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight mt-1">
                Kajian Kebijakan &amp; Catatan Parlemen
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed">
                Naskah telaah regulasi, analisis kebijakan publik, dan laporan pertanggungjawaban dewan untuk Daerah Pemilihan {dapil}.
              </p>
            </div>

            {articles.length > 0 && (
              <Link
                href={getNavLinkHref('/artikel')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-stone-300 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition-all text-xs font-semibold self-start sm:self-auto shrink-0 group"
              >
                <span>Lihat Seluruh Artikel ({articles.length})</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#EA580C] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          {/* Real Articles Grid or Authentic Empty State (No Dummy Data) */}
          {articles.length === 0 ? (
            <div className="py-20 px-6 text-center rounded-3xl bg-[#12100E] border border-dashed border-white/15 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#EA580C]">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Belum Ada Artikel yang Diterbitkan</h3>
              <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
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
                    className="group rounded-3xl bg-[#12100E] border border-white/10 hover:border-orange-500/50 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-950/30 text-left"
                  >
                    {/* Article Cover Image with Category Tag */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#1A1815]">
                      <img
                        src={coverImg}
                        alt={art.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#12100E] via-transparent to-transparent opacity-80" />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-orange-300 border border-orange-500/30">
                          {art.issueCategory || art.category || 'Kebijakan Publik'}
                        </span>
                      </div>
                    </div>

                    {/* Article Info & Excerpt */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-stone-400">
                          <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
                          <span>{art.publishedAt ? formatDateIndonesian(art.publishedAt) : 'Terbaru'}</span>
                          <span>•</span>
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          <span>{art.readingTimeMinutes || 4} mnt baca</span>
                        </div>

                        <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-stone-400 line-clamp-2 leading-relaxed">
                          {art.excerpt || art.summary || 'Kajian kebijakan publik dan catatan advokasi parlemen.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#EA580C] font-semibold group-hover:text-orange-300 transition-colors">
                        <span>Baca Selengkapnya</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ─── SECTION 3: INFOGRAFIS (TRANSPARANSI DATA & KINERJA PARLEMEN) ─── */}
      <section id="infographics" className="py-20 sm:py-28 border-t border-white/10 bg-[#080706]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6 text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C] flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Transparansi Kinerja &amp; Anggaran
              </span>
              <h2 className="font-bebas text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight mt-1">
                Infografis &amp; Data Kinerja Parlemen
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed">
                Visualisasi berbasis data terbuka mengenai kinerja legislasi, pengawasan belanja publik, dan capaian aspirasi konstituen Daerah Pemilihan {dapil}.
              </p>
            </div>

            {infographics.length > 0 && (
              <Link
                href={getNavLinkHref('/infografis')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-stone-300 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition-all text-xs font-semibold self-start sm:self-auto shrink-0 group"
              >
                <span>Lihat Seluruh Infografis ({infographics.length})</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#EA580C] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          {/* Real Infographics Posters Grid or Authentic Empty State (No Dummy Data) */}
          {infographics.length === 0 ? (
            <div className="py-20 px-6 text-center rounded-3xl bg-[#12100E] border border-dashed border-white/15 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#EA580C]">
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
                    className="group rounded-3xl bg-[#12100E] border border-white/10 hover:border-orange-500/50 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-950/30 text-left"
                  >
                    {/* Poster Image with Lightbox Trigger */}
                    <div
                      onClick={() => setActiveModalInfo(info)}
                      className="relative aspect-[4/5] overflow-hidden bg-[#1A1815] cursor-pointer"
                    >
                      <img
                        src={posterImg}
                        alt={info.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-orange-300 border border-orange-500/30">
                          {info.category || 'Transparansi Data'}
                        </span>
                      </div>

                      {/* Hover overlay hint */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <span className="px-4 py-2 rounded-full bg-[#EA580C] text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Perbesar Poster</span>
                        </span>
                      </div>
                    </div>

                    {/* Info Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-stone-400">
                          <Calendar className="w-3.5 h-3.5 text-[#EA580C]" />
                          <span>{info.publishedAt ? formatDateIndonesian(info.publishedAt) : 'Terbaru'}</span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                          {info.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => setActiveModalInfo(info)}
                        className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#EA580C] font-semibold group-hover:text-orange-300 transition-colors w-full cursor-pointer text-left"
                      >
                        <span>Perbesar Infografis</span>
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ─── SLEEK DARK AMBER FOOTER ─── */}
      <footer className="bg-[#080706] text-stone-400 py-14 sm:py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
            
            {/* Col 1: Brand & Bio */}
            <div className="md:col-span-6 space-y-3 text-left">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full text-white font-black flex items-center justify-center text-xs shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  {officialFullName ? officialFullName.charAt(0) : 'P'}
                </div>
                <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {officialFullName}
                </span>
              </div>
              <p className="text-xs text-stone-400 max-w-md leading-relaxed">
                Portal resmi akuntabilitas keparlemenan {officialFullName}. Menjunjung tinggi transparansi, dedikasi penuh, dan keterbukaan akses bagi seluruh warga {dapil}.
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="md:col-span-3 space-y-2 text-xs text-left">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Tautan Portal</h4>
              <p><Link href={getNavLinkHref('/')} className="hover:text-orange-400 transition-colors">Beranda</Link></p>
              <p><Link href={getNavLinkHref('/profil')} className="hover:text-orange-400 transition-colors">Profil Dewan</Link></p>
              <p><Link href={getNavLinkHref('/artikel')} className="hover:text-orange-400 transition-colors">Artikel &amp; Risalah</Link></p>
              <p><Link href={getNavLinkHref('/infografis')} className="hover:text-orange-400 transition-colors">Infografis Publik</Link></p>
              <p><Link href={getNavLinkHref('/kontak')} className="hover:text-orange-400 transition-colors">Kontak Parlemen</Link></p>
            </div>

            {/* Col 3: Parliament Office Contact */}
            <div className="md:col-span-3 space-y-2 text-xs text-left">
              <h4 className="font-bold text-white uppercase tracking-wider mb-2">Kantor Parlemen</h4>
              <p>Gedung Dewan Perwakilan Rakyat Daerah</p>
              <p className="text-orange-400 font-semibold">{officialPhone}</p>
              <p className="text-stone-400">{officialEmail}</p>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <p>© {new Date().getFullYear()} {officialFullName}. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="flex items-center gap-1.5">
              <span>Powered by</span>
              <span className="font-bold text-orange-400">POLARIS Engine</span>
            </p>
          </div>
        </div>
      </footer>

      {/* ─── MODAL DIALOG: INFOGRAPHIC LIGHTBOX ─── */}
      {activeModalInfo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveModalInfo(null)}
        >
          <div
            className="relative bg-[#12100E] border border-white/20 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-4 shrink-0 bg-[#161311]">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-[#EA580C]/20 text-orange-400 border border-orange-500/30 shrink-0">
                  {activeModalInfo.category || 'Infografis Parlemen'}
                </span>
                <span className="text-xs text-stone-400 truncate">
                  {activeModalInfo.publishedAt ? formatDateIndonesian(activeModalInfo.publishedAt) : 'Terbaru'}
                </span>
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
            <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-black/60 min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getInfographicImage(activeModalInfo)}
                alt={activeModalInfo.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Modal Footer with Title & Download / Close button */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#161311] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
                {activeModalInfo.title}
              </h3>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <a
                  href={getInfographicImage(activeModalInfo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={activeModalInfo.title || 'infografis'}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#F97316] text-white text-xs font-semibold shadow-md transition-colors"
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
