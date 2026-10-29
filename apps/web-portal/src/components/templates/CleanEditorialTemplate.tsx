'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Instagram,
  Menu,
  X,
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

export function CleanEditorialTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: TemplateProps) {
  const primaryColor = theme?.primaryHexColor || '#6366F1';
  const photoUrl = theme?.officialPhotoUrl || member?.photoUrl || '/images/default-avatar.png';
  const headline = theme?.headlineTagline || 'Mendedikasikan kerja parlemen yang berdampak nyata bagi kemakmuran dan martabat rakyat.';

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

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const officialFullName = member?.fullName || 'Wakil Rakyat';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    '';

  function formatLegislativeLevel(level?: string): string {
    if (!level) return 'DPR RI';
    const clean = level.replace(/_/g, ' ').toUpperCase();
    if (clean === 'DPR RI' || clean === 'DPD RI') return clean;
    if (clean.includes('PROVINSI')) return 'DPRD Provinsi';
    if (clean.includes('KAB') || clean.includes('KOTA')) return 'DPRD Kab/Kota';
    return clean;
  }

  // Articles list (take up to 4 to match the 4-card project row in the reference image)
  const articles = recentArticles.slice(0, 4);
  const infographics = (recentInfographics || []).slice(0, 4);

  // Robust parser to strip all academic and honorary titles (Dr., H., Hj., Prof., etc.)
  function parseCleanIdentity(fullName?: string) {
    if (!fullName) {
      return { cleanName: 'Ahmad Fauzi', initial: 'A', signature: 'Fauzi.' };
    }
    let clean = fullName.split(',')[0].trim();
    while (/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i.test(clean)) {
      clean = clean.replace(/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i, '').trim();
    }
    
    const words = clean.split(/\s+/).filter(Boolean);
    const firstName = words[0] || 'Ahmad';
    const lastName = words.length > 1 ? words[words.length - 1] : firstName;
    const initial = firstName.charAt(0).toUpperCase();

    return {
      cleanName: clean || 'Ahmad Fauzi',
      initial: initial || 'A',
      signature: `${lastName}.`,
    };
  }

  const { cleanName, initial, signature } = parseCleanIdentity(member?.fullName);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      
      {/* ─── 1. TOP NAVBAR (EXACT REPLICA OF REFERENCE DESIGN) ─── */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative">
          
          {/* Left: Brand Monogram & Name (Exact to Reference Logo) */}
          <div className="flex items-center gap-3.5 select-none shrink-0">
            <div className="font-editorial-serif font-bold text-3xl sm:text-[2.35rem] text-slate-950 tracking-tighter leading-none">
              {initial}\
            </div>
            <div className="leading-tight">
              <span className="font-sans font-bold text-xs sm:text-sm tracking-[0.18em] text-slate-950 uppercase block">
                {cleanName.toUpperCase()}
              </span>
              <span className="font-sans text-[9.5px] sm:text-[10.5px] tracking-[0.22em] text-slate-400 uppercase block font-medium mt-0.5">
                {member?.legislativeLevel ? `ANGGOTA ${formatLegislativeLevel(member.legislativeLevel)}` : 'WAKIL RAKYAT'}
              </span>
            </div>
          </div>

          {/* Centered Navigation (5 Links: Beranda, Profil, Artikel, Infografis, Kontak) */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-10 text-xs lg:text-[13px] font-semibold tracking-[0.16em] uppercase text-slate-500 md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link href={getNavLinkHref('/')} className="text-slate-950 font-bold flex flex-col items-center group">
              <span>BERANDA</span>
              <span className="w-6 h-[2.5px] bg-[#6366F1] rounded-full mt-1.5" />
            </Link>
            <Link href={getNavLinkHref('/profil')} className="hover:text-slate-950 transition-colors pb-1.5">
              PROFIL
            </Link>
            <Link href={getNavLinkHref('/artikel')} className="hover:text-slate-950 transition-colors pb-1.5">
              ARTIKEL
            </Link>
            <Link href={getNavLinkHref('/infografis')} className="hover:text-slate-950 transition-colors pb-1.5">
              INFOGRAFIS
            </Link>
            <Link href={getNavLinkHref('/kontak')} className="hover:text-slate-950 transition-colors pb-1.5">
              KONTAK
            </Link>
          </nav>

          {/* Right: Instagram Pill Button (Consistent with other templates) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-bold text-xs sm:text-[13px] shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none shrink-0"
              style={{
                background: 'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span className="truncate max-w-[90px] sm:max-w-none">@{instagramUsername}</span>
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-md text-slate-800 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 text-sm font-semibold">
              <Link
                href={getNavLinkHref('/')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-slate-950 hover:bg-slate-50 transition-colors"
              >
                Beranda
              </Link>
              <Link
                href={getNavLinkHref('/profil')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors"
              >
                Profil
              </Link>
              <Link
                href={getNavLinkHref('/artikel')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors"
              >
                Artikel
              </Link>
              <Link
                href={getNavLinkHref('/infografis')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors"
              >
                Infografis
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors"
              >
                Kontak
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ─── 2. SECTION 1: HERO (PROPORTIONAL EDITORIAL SPACING & GROUNDED BASELINE) ─── */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100 pt-6 sm:pt-8 lg:pt-10 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-end">
            
            {/* LEFT COLUMN: GREETING, BIG SERIF HEADLINE, DIVIDER, BIO, BUTTONS, SCROLL DOWN */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left self-center py-2 lg:py-4 order-1">
              
              {/* Eyebrow in uppercase with user's dynamic color */}
              <span
                className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase block select-none mb-3 sm:mb-4"
                style={{ color: primaryColor }}
              >
                HI, I&apos;M {cleanName.toUpperCase()}
              </span>

              {/* Exact Typographic Match */}
              <h1 className="font-editorial-serif text-3xl sm:text-4xl md:text-[2.75rem] lg:text-[3rem] xl:text-[3.45rem] font-medium sm:font-semibold text-slate-900 tracking-tight leading-[1.18] sm:leading-[1.2] select-none">
                <span className="block whitespace-normal lg:whitespace-nowrap">Mendedikasikan Kebijakan</span>
                <span className="block text-slate-900 mt-1.5 sm:mt-2 whitespace-normal lg:whitespace-nowrap">Yang Berdampak Nyata</span>
                <span
                  className="block italic font-normal mt-1.5 sm:mt-2 whitespace-normal lg:whitespace-nowrap"
                  style={{ color: primaryColor }}
                >
                  A Lasting Impression.
                </span>
              </h1>

              {/* Subtle small gray horizontal divider bar */}
              <div className="w-12 sm:w-14 h-[2px] bg-slate-700 mt-4 sm:mt-5 mb-4 sm:mb-5" />

              {/* Bio summary paragraph */}
              <p className="text-[13.5px] sm:text-[14.5px] text-slate-600 leading-[1.7] font-normal max-w-lg mb-6 sm:mb-8 line-clamp-3 lg:line-clamp-none">
                {headline}
              </p>

              {/* Two Action Buttons: Dynamic primary & White border secondary */}
              <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 mb-6 sm:mb-8">
                <Link
                  href={getNavLinkHref('/artikel')}
                  className="px-6 sm:px-7 py-3 rounded-[2px] text-white font-bold text-[11px] uppercase tracking-widest shadow-xs transition-all inline-flex items-center gap-3 group shrink-0 hover:brightness-110"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>VIEW MY WORK</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href={getNavLinkHref('/profil')}
                  className="px-6 sm:px-7 py-3 rounded-[2px] border border-slate-300 hover:border-black text-slate-900 font-bold text-[11px] uppercase tracking-widest transition-all inline-flex items-center gap-2 bg-white shrink-0"
                >
                  <span>ABOUT ME</span>
                </Link>
              </div>

              {/* Scroll Down Indicator */}
              <div className="flex flex-col items-start gap-1 text-[10px] font-mono tracking-[0.25em] uppercase text-slate-400 select-none pb-2">
                <span>SCROLL DOWN</span>
                <span className="animate-bounce text-xs">↓</span>
              </div>
            </div>

            {/* RIGHT COLUMN: COMPACT CIRCULAR STAMP BADGE, DOTTED GRID, SOFT LAVENDER DISC & CUTOUT PORTRAIT */}
            <div className="lg:col-span-5 flex justify-center items-end relative order-2">
              
              {/* Dotted Grid Background Texture on upper right */}
              <div
                aria-hidden="true"
                className="absolute top-12 sm:top-14 right-0 sm:right-2 w-36 sm:w-44 h-48 sm:h-56 opacity-35 pointer-events-none select-none z-0"
                style={{
                  backgroundImage: 'radial-gradient(#94A3B8 2px, transparent 2px)',
                  backgroundSize: '18px 18px',
                }}
              />

              {/* Compact Circular Stamp Badge (Ukuran Pas & Proporsional Tanpa Menutupi Wajah) */}
              <div className="absolute top-0 right-1 sm:right-2 lg:right-3 z-20 pointer-events-none select-none">
                <div
                  className="relative flex items-center justify-center"
                  style={{ width: '92px', height: '92px' }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_40s_linear_infinite]">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                    <path
                      id="stampArc"
                      d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                      fill="none"
                    />
                    <text className="text-[7.5px] font-mono uppercase tracking-[0.2em] fill-slate-500 font-bold">
                      <textPath href="#stampArc" startOffset="0%">
                        • {cleanName.toUpperCase()} • WAKIL RAKYAT
                      </textPath>
                    </text>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-script-signature text-base sm:text-lg text-[#6366F1] font-bold rotate-[-10deg] select-none">
                      {signature}
                    </span>
                  </div>
                </div>
              </div>

              {/* Soft Lavender / Lilac Circle Disc Container */}
              <div className="relative w-[280px] sm:w-[340px] lg:w-[380px] h-[360px] sm:h-[430px] lg:h-[490px] flex items-end justify-center">
                
                {/* Signature Exact Soft Lavender Disc */}
                <div
                  aria-hidden="true"
                  className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[250px] sm:w-[300px] lg:w-[340px] aspect-square rounded-full pointer-events-none z-0"
                  style={{
                    backgroundColor: '#EFEBFA', // Exact soft lavender from image!
                  }}
                />

                {/* Grounded Cutout Portrait Photo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={cleanName}
                  className="w-full h-auto max-h-[380px] sm:max-h-[440px] lg:max-h-[500px] object-contain object-bottom filter contrast-[1.03] select-none block origin-bottom pointer-events-none relative z-10"
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 92%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 92%, transparent 100%)',
                  }}
                />
              </div>

            </div>

          </div>
        </div>
      </section>






      {/* ─── 3. SECTION 2: ARTIKEL & KAJIAN KEBIJAKAN (DEDICATED ARTICLES) ─── */}
      <section id="articles" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#6366F1] uppercase block">
                ARTIKEL &amp; RISET KEBIJAKAN
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 mt-1">
                Kajian &amp; Risalah Pemikiran
              </h2>
            </div>
            <Link
              href={getNavLinkHref('/artikel')}
              className="text-xs font-bold text-slate-700 hover:text-[#6366F1] inline-flex items-center gap-1.5 transition-colors group"
            >
              <span>LIHAT SEMUA KAJIAN</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 4 Cards Grid - Articles Only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.length > 0 ? (
              articles.map((art) => (
                <Link
                  key={art.id}
                  href={getNavLinkHref(`/artikel/${art.slug}`)}
                  className="group block space-y-3"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.featuredImageUrl || art.posterUrl || '/images/default-article.jpg'}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold uppercase">
                        {art.issueCategory || 'KEBIJAKAN'}
                      </span>
                      <span>•</span>
                      <span>{art.publishedAt ? formatDateIndonesian(art.publishedAt) : 'Terbaru'}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#6366F1] transition-colors line-clamp-2 uppercase tracking-tight">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal mt-1 line-clamp-2">
                      {art.excerpt || 'Baca telaah pemikiran kebijakan dan risalah lengkap pada halaman portal resmi.'}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                Belum ada kajian dan naskah risalah yang diterbitkan.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ─── 4. SECTION 3: INFOGRAFIS & CAPAIAN KINERJA (DEDICATED INFOGRAPHICS) ─── */}
      <section id="infografis" className="py-16 sm:py-20 bg-[#F8F9FD] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#6366F1] uppercase block">
                DATA &amp; VISUALISASI KEBIJAKAN
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 mt-1">
                Infografis Capaian &amp; Akuntabilitas
              </h2>
            </div>
            <Link
              href={getNavLinkHref('/infografis')}
              className="text-xs font-bold text-slate-700 hover:text-[#6366F1] inline-flex items-center gap-1.5 transition-colors group"
            >
              <span>LIHAT SEMUA INFOGRAFIS</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Grid Infografis Visual Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {infographics.map((info) => (
              <Link
                key={info.id}
                href={info.slug ? getNavLinkHref(`/artikel/${info.slug}`) : getNavLinkHref('/infografis')}
                className="group block rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={info.imageUrl || info.posterUrl || info.featuredImageUrl || '/images/showcase-infografis-apbd.jpg'}
                    alt={info.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.02]"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-xs text-white font-mono text-[9.5px] font-bold uppercase tracking-wider border border-white/20">
                      {info.category || 'INFOGRAFIS RESMI'}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#6366F1] transition-colors line-clamp-2 leading-snug">
                    {info.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {info.excerpt || info.prompt || 'Visualisasi data capaian kebijakan publik dan transparansi anggaran parlemen.'}
                  </p>
                  <div className="pt-3 flex items-center justify-between text-xs border-t border-slate-100 font-bold text-[#6366F1]">
                    <span>Buka Visual Penuh &rarr;</span>
                    {info.publishedAt && (
                      <span className="text-[11px] text-slate-400 font-normal">
                        {formatDateIndonesian(info.publishedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>



      {/* ─── 4. SECTION 4: CALLOUT BANNER ASPIRASI ─── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#EDE9FE] border border-purple-200/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#6366F1] font-bold block">
                KANAL ASPIRASI &amp; ADVOKASI WARGA
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-950">
                Punya Masukan atau Isu Kebijakan di Dapil?
              </h3>
            </div>

            <Link
              href={getNavLinkHref('/kontak')}
              className="px-7 py-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md shrink-0 inline-flex items-center gap-2"
            >
              <span>SAMPAIKAN ASPIRASI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 7. SECTION 6: CLEAN EDITORIAL FOOTER ─── */}
      <footer id="contact" className="py-14 border-t border-slate-200 bg-[#FAFAFC] text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Brand Logo & Name */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="font-serif font-black text-2xl text-slate-950 tracking-tighter leading-none">
                  {member?.fullName ? member.fullName.charAt(0) : 'A'}\
                </div>
                <div>
                  <span className="font-serif font-black text-sm text-slate-950 block">
                    {officialFullName}
                  </span>
                  <span className="text-[10px] font-mono text-[#6366F1] uppercase tracking-wider block font-bold">
                    {member?.partyAffiliation || 'FRAKSI PARLEMEN'}
                  </span>
                </div>
              </div>
              <p className="text-slate-500 leading-relaxed max-w-sm">
                Portal komunikasi resmi transparansi kinerja legislasi, pengawasan anggaran, dan advokasi warga Daerah Pemilihan {member?.dapilName || 'Indonesia'}.
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2 space-y-2">
              <span className="font-bold text-slate-900 block uppercase text-[11px] tracking-wider">
                QUICK LINKS
              </span>
              <ul className="space-y-1.5 text-slate-500">
                <li><Link href={getNavLinkHref('/')} className="hover:text-[#6366F1] transition-colors">Home</Link></li>
                <li><Link href={getNavLinkHref('/profil')} className="hover:text-[#6366F1] transition-colors">Profil</Link></li>
                <li><Link href={getNavLinkHref('/artikel')} className="hover:text-[#6366F1] transition-colors">Artikel</Link></li>
                <li><Link href={getNavLinkHref('/infografis')} className="hover:text-[#6366F1] transition-colors">Infografis</Link></li>
                <li><Link href={getNavLinkHref('/kontak')} className="hover:text-[#6366F1] transition-colors">Kontak</Link></li>
              </ul>
            </div>

            {/* Penugasan */}
            <div className="md:col-span-3 space-y-2">
              <span className="font-bold text-slate-900 block uppercase text-[11px] tracking-wider">
                PENUGASAN KOMISI
              </span>
              <p className="text-slate-500 leading-relaxed">
                {member?.commissionName || 'Komisi DPR RI'} • Dapil {member?.dapilName || 'Jawa Barat I'}
              </p>
              <p className="text-slate-500">
                Gedung Nusantara I DPR RI, Jl. Jenderal Gatot Subroto, Jakarta Pusat.
              </p>
            </div>

            {/* Contact & Socials */}
            <div className="md:col-span-3 space-y-2">
              <span className="font-bold text-slate-900 block uppercase text-[11px] tracking-wider">
                CONTACT &amp; FOLLOW
              </span>
              <p className="text-slate-500">
                Email: aspirasi@{subdomain || 'dewan'}.polaris.id
              </p>
              <p className="text-slate-500">
                WhatsApp: 0812-9876-5432
              </p>
              <div className="pt-2 flex items-center gap-3 text-slate-700 font-bold text-[11px]">
                <a href={`https://instagram.com/${instagramUsername}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#6366F1]">INSTAGRAM</a>
                <span>•</span>
                <a href="#" className="hover:text-[#6366F1]">TWITTER</a>
                <span>•</span>
                <a href="#" className="hover:text-[#6366F1]">LINKEDIN</a>
              </div>
            </div>

          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              &copy; {new Date().getFullYear()} {officialFullName}. All Rights Reserved.
            </div>
            <div>
              Didukung oleh POLARIS Legislative Intelligence OS.
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
