'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  Layers,
  Scale,
  Users,
  ShieldCheck,
  FileText,
  Calendar,
  Sparkles,
  ExternalLink,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  getArikMemberInfo,
  useArikHref,
  ARIK_DEFAULT_ARTICLES,
  ARIK_DEFAULT_INFOGRAPHICS,
  ARIK_NOIR,
} from './arik-noir/utils';
import { ArikNoirShell } from './arik-noir/ArikNoirShell';

export interface ArikNoirTemplateProps {
  member: any;
  theme?: any;
  recentArticles?: any[];
  recentInfographics?: any[];
  documents?: any[];
  subdomain?: string;
}

const getArtImg = (a: any) =>
  a?.imageUrl ||
  a?.featuredImageUrl ||
  a?.posterUrl ||
  a?.thumbnailUrl ||
  '/images/showcase-artikel-rapat.jpg';

const getArtCat = (a: any) =>
  a?.category || a?.categoryName || a?.issueCategory || 'Kebijakan Publik';

const getArtDate = (a: any) =>
  a?.date ||
  (a?.publishedAt
    ? new Date(a.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Maret 2026');

export function ArikNoirTemplate({
  member,
  theme,
  recentArticles,
  recentInfographics,
  documents,
  subdomain,
}: ArikNoirTemplateProps) {
  const info = getArikMemberInfo(member, theme, subdomain);
  const href = useArikHref(subdomain);

  // Selected Infographic for Modal View
  const [activeInfographic, setActiveInfographic] = useState<any | null>(null);

  const articles =
    recentArticles && recentArticles.length > 0
      ? recentArticles.slice(0, 4)
      : ARIK_DEFAULT_ARTICLES;

  const infographics =
    recentInfographics && recentInfographics.length > 0
      ? recentInfographics.slice(0, 4)
      : ARIK_DEFAULT_INFOGRAPHICS;

  return (
    <ArikNoirShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="beranda"
    >
      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1: HERO + PARTNER MONOCHROME LOGOS + 3 FOCUS CARDS
          (PERSIS REFERENSI GAMBAR: ARIK NOIR EDITORIAL)
      ══════════════════════════════════════════════════════════════════ */}
      {/* ─── SECTION 1: HERO VIEWPORT (100% FULL SCREEN TAMPIL PENUH SAAT PERTAMA KALI DIBUKA) ─── */}
      <section className="relative h-screen min-h-[640px] max-h-[100dvh] pt-20 sm:pt-24 pb-0 bg-[#0A0A0A] overflow-hidden flex flex-col items-center justify-between">
        
        {/* Subtle Background Warm Vignette Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#C5A880]/5 rounded-full blur-[180px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 w-full relative z-10 flex-1 flex flex-col items-center justify-center text-center">
          
          {/* ─── 1. MOODY PORTRAIT CENTERPIECE (MENEMPEL MULUS & MENYATU DENGAN TEKS - TIDAK TERBANG) ─── */}
          <div className="relative w-[340px] sm:w-[420px] md:w-[460px] lg:w-[500px] h-[240px] sm:h-[280px] md:h-[320px] flex items-end justify-center -mb-8 sm:-mb-12 md:-mb-16 z-0 pointer-events-none">
            <img
              src={info.photoUrl}
              alt={info.officialFullName}
              className="w-full h-full object-contain object-bottom filter brightness-105 contrast-105"
              style={{
                maskImage:
                  'radial-gradient(ellipse 95% 82% at 50% 34%, #000 62%, rgba(0,0,0,0.85) 78%, rgba(0,0,0,0.2) 90%, transparent 100%), linear-gradient(to bottom, #000 60%, rgba(0,0,0,0.8) 78%, transparent 98%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 95% 82% at 50% 34%, #000 62%, rgba(0,0,0,0.85) 78%, rgba(0,0,0,0.2) 90%, transparent 100%), linear-gradient(to bottom, #000 60%, rgba(0,0,0,0.8) 78%, transparent 98%)',
              }}
            />
          </div>

          {/* ─── 2. DUAL-FONT GIANT HEADLINE (MENYATU DI BAWAH FOTO DEWAN) ─── */}
          <div className="relative z-10 space-y-1 sm:space-y-1.5 max-w-3xl">
            {/* Line 1: Clean Sans-Serif / Modern Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-light tracking-tight text-[#F5F2EB] leading-[1.08] drop-shadow-md">
              {info.officialFullName}
            </h1>
            
            {/* Line 2: Elegant Warm Champagne Italic Serif */}
            <p className="text-2xl sm:text-4xl lg:text-5xl font-serif italic font-normal tracking-tight leading-[1.1]" style={{ color: info.primaryColor }}>
              & Wakil Rakyat {info.legislativeLevel}
            </p>
          </div>

          {/* Subtitle Bio Tagline */}
          <p className="relative z-10 text-xs sm:text-[13px] text-[#8E8A83] max-w-xl mx-auto mt-2.5 sm:mt-3 leading-relaxed font-normal line-clamp-2 sm:line-clamp-3">
            {info.bio}
          </p>

          {/* Pill Scroll / Focus Badge (Persis pill button "↓ MY SERVICES" di Gambar) */}
          <div className="relative z-10 mt-4 sm:mt-5">
            <a
              href="#focus-cards"
              className="inline-flex items-center gap-2 px-4 py-1.5 sm:py-2 rounded-full bg-[#141414] border text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] hover:text-[#F5F2EB] transition-all group shadow-sm"
              style={{ color: info.primaryColor, borderColor: info.primaryColor }}
            >
              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              <span>FOKUS KERJA ADVOKASI</span>
            </a>
          </div>

        </div>

        {/* ─── 3. MONOCHROMATIC LOGO / PARTNER STRIP DI DASAR SCREEN 1 (PAS DI BAGIAN BAWAH VIEWPORT) ─── */}
        <div className="w-full py-4 sm:py-5 border-t border-[#161616] bg-[#0A0A0A]">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
            <div className="flex flex-wrap items-center justify-around gap-6 sm:gap-10 opacity-40 hover:opacity-75 transition-opacity duration-300">
              <div className="flex items-center gap-2 font-black tracking-widest text-[11px] sm:text-xs uppercase text-[#F5F2EB]">
                <Scale className="w-3.5 h-3.5" style={{ color: info.primaryColor }} />
                <span>PARLEMEN DAERAH</span>
              </div>
              <div className="flex items-center gap-2 font-black tracking-widest text-[11px] sm:text-xs uppercase text-[#F5F2EB]">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: info.primaryColor }} />
                <span>KOMISI LEGISLASI</span>
              </div>
              <div className="flex items-center gap-2 font-black tracking-widest text-[11px] sm:text-xs uppercase text-[#F5F2EB]">
                <Layers className="w-3.5 h-3.5" style={{ color: info.primaryColor }} />
                <span>BAPEMPERDA</span>
              </div>
              <div className="flex items-center gap-2 font-black tracking-widest text-[11px] sm:text-xs uppercase text-[#F5F2EB]">
                <Users className="w-3.5 h-3.5" style={{ color: info.primaryColor }} />
                <span>RUMAH ASPIRASI</span>
              </div>
              <div className="flex items-center gap-2 font-black tracking-widest text-[11px] sm:text-xs uppercase text-[#F5F2EB]">
                <Sparkles className="w-3.5 h-3.5" style={{ color: info.primaryColor }} />
                <span>POLARIS CIVIC</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ─── 1B. THREE CARDS GRID (PERSIS 3 KARTU "WEB DESIGN, DEVELOPMENT, CONTENT & SEO" DI GAMBAR) ─── */}
      <section id="focus-cards" className="py-20 lg:py-24 bg-[#0A0A0A] border-t border-[#161616]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] block mb-2" style={{ color: info.primaryColor }}>
              PILAR TATA KELOLA
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif italic text-[#F5F2EB]">
              Tiga Pilar Kerja Parlemen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: 01 / ADVOKASI LEGISLASI */}
            <div className="group bg-[#111111] border border-[#1E1E1E] rounded-2xl p-7 hover:border-[#C5A880]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] block" style={{ color: info.primaryColor }}>
                  01 // LEGISLASI
                </span>
                <h3 className="text-lg font-bold text-[#F5F2EB] group-hover:text-[#E8DCC4] transition-colors">
                  Pembentukan Peraturan Daerah
                </h3>
                <p className="text-xs text-[#8E8A83] leading-relaxed">
                  Menyusun dan mengawal payung hukum daerah yang pro-rakyat, berpihak pada pelestarian lingkungan, hak buruh tani, dan perlindungan pedagang kecil.
                </p>
              </div>
              <div className="pt-8">
                <Link
                  href={href('/profil')}
                  className="inline-flex items-center gap-2 text-xs font-bold hover:text-[#F5F2EB] transition-colors group-hover:translate-x-1 duration-300" style={{ color: info.primaryColor }}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>PELAJARI TRACK RECORD</span>
                </Link>
              </div>
            </div>

            {/* Card 2: 02 / PENGAWASAN ANGGARAN */}
            <div className="group bg-[#111111] border border-[#1E1E1E] rounded-2xl p-7 hover:border-[#C5A880]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] block" style={{ color: info.primaryColor }}>
                  02 // BUDGETING & FISKAL
                </span>
                <h3 className="text-lg font-bold text-[#F5F2EB] group-hover:text-[#E8DCC4] transition-colors">
                  Pengawasan APBD & Efisiensi
                </h3>
                <p className="text-xs text-[#8E8A83] leading-relaxed">
                  Menjaga transparansi belanja daerah agar anggaran publik dialokasikan tepat sasaran untuk infrastruktur desa, pendidikan gratis, dan layanan kesehatan prima.
                </p>
              </div>
              <div className="pt-8">
                <Link
                  href={href('/artikel')}
                  className="inline-flex items-center gap-2 text-xs font-bold hover:text-[#F5F2EB] transition-colors group-hover:translate-x-1 duration-300" style={{ color: info.primaryColor }}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>BACA RISALAH ANGGARAN</span>
                </Link>
              </div>
            </div>

            {/* Card 3: 03 / PELAYANAN KONSTITUEN */}
            <div className="group bg-[#111111] border border-[#1E1E1E] rounded-2xl p-7 hover:border-[#C5A880]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] block" style={{ color: info.primaryColor }}>
                  03 // ADVOKASI WARGA
                </span>
                <h3 className="text-lg font-bold text-[#F5F2EB] group-hover:text-[#E8DCC4] transition-colors">
                  Pelayanan Aspirasi Rakyat
                </h3>
                <p className="text-xs text-[#8E8A83] leading-relaxed">
                  Menampung pengaduan dan pokok-pokok pikiran warga dapil melalui saluran digital dan tatap muka secara rutin di Rumah Aspirasi konstituen.
                </p>
              </div>
              <div className="pt-8">
                <Link
                  href={href('/kontak')}
                  className="inline-flex items-center gap-2 text-xs font-bold hover:text-[#F5F2EB] transition-colors group-hover:translate-x-1 duration-300" style={{ color: info.primaryColor }}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>KIRIM ASPIRASI SEKARANG</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2: ARTIKEL (SELECTED WORK - 2X2 IMAGE GRID)
          (PERSIS SECTION "Selected Work" DI GAMBAR REFERENSI ARIK)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-28 bg-[#070707] border-t border-[#1A1A1A]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          
          {/* Header Row: "Selected Work" Title in Serif + "SEE ALL" Arrow Link */}
          <div className="flex items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] block mb-2" style={{ color: info.primaryColor }}>
                PUBLIKASI & PEMIKIRAN
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic text-[#F5F2EB] tracking-tight">
                Selected Work <span className="font-sans not-italic text-sm sm:text-base font-normal text-[#8E8A83] ml-3">& Warta Kebijakan</span>
              </h2>
            </div>

            <Link
              href={href('/artikel')}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] hover:text-[#F5F2EB] transition-colors group pb-1" style={{ color: info.primaryColor }}
            >
              <span>LIHAT SEMUA</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* 2x2 Showcase Grid of Articles with Rich Images (Persis 4 Card Portfolio di Gambar) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {articles.map((art: any, idx: number) => {
              const img = getArtImg(art);
              const title = art.title;
              const slug = art.slug || `artikel-${idx + 1}`;
              const cat = getArtCat(art);
              const date = getArtDate(art);

              return (
                <div
                  key={art.id || idx}
                  className="group bg-[#111111] border border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#C5A880]/60 transition-all duration-500 flex flex-col justify-between shadow-xl"
                >
                  {/* Article Featured Image Container */}
                  <Link
                    href={href(`/artikel/${slug}`)}
                    className="relative aspect-[16/10] overflow-hidden bg-[#161616] block"
                  >
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
                      loading="lazy"
                    />
                    
                    {/* Category Pill Tag Overlay */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-[#0A0A0A]/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#E8DCC4] border border-[#2A2A2A]">
                        {cat}
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="w-8 h-8 rounded-full bg-[#E8DCC4] text-[#0A0A0A] flex items-center justify-center shadow-lg">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>

                  {/* Card Content & Metadata */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-[#7A7670] mb-3 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{date}</span>
                        <span>•</span>
                        <span>{info.party}</span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-[#F5F2EB] group-hover:text-[#E8DCC4] transition-colors line-clamp-2 leading-snug">
                        <Link href={href(`/artikel/${slug}`)}>
                          {title}
                        </Link>
                      </h3>

                      {art.excerpt && (
                        <p className="text-xs sm:text-[13px] text-[#8E8A83] mt-2.5 line-clamp-2 leading-relaxed">
                          {art.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-[#181818] flex items-center justify-between">
                      <Link
                        href={href(`/artikel/${slug}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold  group-hover:text-[#F5F2EB] transition-colors" style={{ color: info.primaryColor }}
                      >
                        <span>Baca Selengkapnya</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3: INFOGRAFIS (VISUAL POSTER GALLERY WITH IMAGES)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-28 bg-[#0A0A0A] border-t border-[#1A1A1A]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          
          {/* Header Row */}
          <div className="flex items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] block mb-2" style={{ color: info.primaryColor }}>
                VISUAL DATA & REKAPITULASI
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic text-[#F5F2EB] tracking-tight">
                Infografis Kebijakan <span className="font-sans not-italic text-sm sm:text-base font-normal text-[#8E8A83] ml-3">& Transparansi Data</span>
              </h2>
            </div>

            <Link
              href={href('/infografis')}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] hover:text-[#F5F2EB] transition-colors group pb-1" style={{ color: info.primaryColor }}
            >
              <span>SEMUA INFOGRAFIS</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* 4 Columns Infographic Posters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {infographics.map((infoItem: any, idx: number) => {
              const poster =
                infoItem.posterUrl ||
                infoItem.imageUrl ||
                '/images/showcase-infografis-anggaran.jpg';

              return (
                <div
                  key={infoItem.id || idx}
                  onClick={() => setActiveInfographic(infoItem)}
                  className="group bg-[#111111] border border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#C5A880]/60 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-2xl hover:shadow-black/60"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#161616]">
                    <img
                      src={poster}
                      alt={infoItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-100"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-[#0A0A0A]/90 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider  border border-[#262626]" style={{ color: info.primaryColor }}>
                        {infoItem.category || 'Data Publik'}
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                      <span className="px-4 py-2 rounded-full bg-[#E8DCC4] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Perbesar Data</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#7A7670] uppercase tracking-wider block mb-1">
                        {infoItem.date || 'Maret 2026'}
                      </span>
                      <h3 className="text-sm font-bold text-[#F5F2EB] group-hover:text-[#E8DCC4] transition-colors line-clamp-2 leading-snug">
                        {infoItem.title}
                      </h3>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#181818] flex items-center justify-between text-[11px] font-bold  " style={{ color: info.primaryColor }}>
                      <span>Lihat Rincian</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── INFOGRAPHIC MODAL VIEWER ─── */}
      {activeInfographic && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveInfographic(null)}
        >
          <div
            className="bg-[#121212] border border-[#2A2A2A] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-[#1E1E1E] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider  block" style={{ color: info.primaryColor }}>
                  {activeInfographic.category || 'Infografis Resmi'}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#F5F2EB] mt-0.5">
                  {activeInfographic.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveInfographic(null)}
                className="p-2 rounded-full hover:bg-[#222] text-[#8E8A83] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
              <img
                src={
                  activeInfographic.posterUrl ||
                  activeInfographic.imageUrl ||
                  '/images/showcase-infografis-anggaran.jpg'
                }
                alt={activeInfographic.title}
                className="w-full h-auto rounded-xl object-contain shadow-xl"
              />
              {activeInfographic.summary && (
                <p className="text-xs sm:text-sm text-[#8E8A83] mt-4 text-center leading-relaxed max-w-lg">
                  {activeInfographic.summary}
                </p>
              )}
            </div>

            <div className="p-4 border-t border-[#1E1E1E] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveInfographic(null)}
                className="px-5 py-2 rounded-full bg-[#E8DCC4] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </ArikNoirShell>
  );
}
