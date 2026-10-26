'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  FileText,
  Users,
  Scale,
  Sparkles,
  Maximize2,
  X,
  Share2,
  Download,
  Calendar,
  Clock,
  Layers,
  Facebook,
  Twitter,
  Instagram,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { WashoskiCyanShell } from './washoski-cyan/WashoskiCyanShell';
import {
  getWashoskiMemberInfo,
  useWashoskiHref,
  WASHOSKI_DEFAULT_ARTICLES,
  WASHOSKI_DEFAULT_INFOGRAPHICS,
  WASHOSKI_CYAN,
} from './washoski-cyan/utils';

export interface WashoskiCyanTemplateProps {
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
    : 'Terbaru');

const getInfoImg = (i: any) =>
  i?.imageUrl || i?.posterUrl || i?.thumbnailUrl || '/images/showcase-infografis-apbd.jpg';

const getInfoCat = (i: any) => i?.category || i?.categoryName || 'Transparansi Data';

export function WashoskiCyanTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: WashoskiCyanTemplateProps) {
  const info = getWashoskiMemberInfo(member, theme, subdomain);
  const href = useWashoskiHref(subdomain);

  const articles =
    recentArticles && recentArticles.length > 0
      ? recentArticles.slice(0, 4)
      : WASHOSKI_DEFAULT_ARTICLES;

  const infographics =
    recentInfographics && recentInfographics.length > 0
      ? recentInfographics.slice(0, 3)
      : WASHOSKI_DEFAULT_INFOGRAPHICS;

  const [activeModal, setActiveModal] = useState<any | null>(null);

  // Split name for Hello, Im [FirstName] \n [LastName] (with LastName in Cyan)
  const cleanFullName = info.officialFullName.replace(
    /^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i,
    ''
  );
  const nameTokens = cleanFullName.split(' ').filter(Boolean);
  const heroFirstName = nameTokens[0] || info.firstName;
  const heroLastName = nameTokens.slice(1).join(' ') || info.officialFullName;

  return (
    <WashoskiCyanShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="beranda"
    >
      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1: HERO (ARTISTIC CYAN STREAK) + TRUST BAR + WHAT WE DO
          (PERSIS REFERENSI GAMBAR: WASHOSKI NOIR & CYAN ACCENT)
      ══════════════════════════════════════════════════════════════════ */}

      {/* ─── SECTION 1: HERO VIEWPORT (100% FULL SCREEN TAMPIL PENUH SAAT PERTAMA KALI DIBUKA) ─── */}
      <section className="relative h-screen min-h-[620px] max-h-[100dvh] flex flex-col justify-between pt-16 lg:pt-20 pb-0 bg-[#000000] overflow-hidden">
        
        {/* Subtle Background Radial Glow */}
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none opacity-20" style={{ backgroundColor: info.primaryColor }} />

        {/* 1A. HERO MAIN CONTENT: Photo (Left) + Text (Right) */}
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 w-full relative z-10 flex-1 flex items-end">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end w-full">
            
            {/* Sisi Kiri: Foto Warna Asli Dewan Menempel Kokoh di Atas Bar Bawah (Tidak Melayang & Mulus) */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end items-end self-end">
              <div className="relative w-[280px] sm:w-[340px] md:w-[380px] lg:w-[440px] flex items-end justify-center">
                <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] max-h-[46vh] sm:max-h-[52vh] lg:max-h-[58vh] rounded-t-2xl sm:rounded-t-3xl overflow-hidden shadow-2xl flex items-end">
                  <img
                    src={info.photoUrl}
                    alt={info.officialFullName}
                    className="w-full h-full object-cover object-top"
                    style={{
                      maskImage:
                        'linear-gradient(to bottom, #000 84%, rgba(0,0,0,0.6) 94%, transparent 100%)',
                      WebkitMaskImage:
                        'linear-gradient(to bottom, #000 84%, rgba(0,0,0,0.6) 94%, transparent 100%)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sisi Kanan: ABOUT PERSONAL, Hello, Im [First] \n [Last], Accent Bar, Bio, Cyan Signature, Cyan Socials */}
            <div className="lg:col-span-6 space-y-2.5 sm:space-y-3 lg:space-y-4 lg:pl-2 pb-6 lg:pb-10 pt-4 lg:pt-0">
              
              {/* Cyan Tag: ABOUT PERSONAL */}
              <div>
                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.25em] block" style={{ color: info.primaryColor }}>
                  ABOUT PERSONAL
                </span>
              </div>

              {/* Title: Hello, Im [First] (White) \n [Last] (Cyan) Persis Gambar */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.08]">
                Hello, Im {heroFirstName} <br />
                <span style={{ color: info.primaryColor }}>{heroLastName}</span>
              </h1>

              {/* Thin Accent Bar */}
              <div className="w-12 sm:w-14 h-[2px] my-2" style={{ backgroundColor: info.primaryColor, boxShadow: `0 0 8px ${info.primaryColor}` }} />

              {/* Bio Paragraph */}
              <p className="text-xs sm:text-[13px] text-[#9CA3AF] max-w-md leading-relaxed font-normal pt-0.5 line-clamp-3 sm:line-clamp-4">
                {info.bio}
              </p>

              {/* Digital Cursive Signature in Cyan (Persis Tanda Tangan Cyan di Gambar) */}
              <div className="pt-1 select-none">
                <span
                  className="text-2xl sm:text-3xl lg:text-4xl font-serif italic tracking-wide block"
                  style={{
                    color: info.primaryColor,
                    filter: `drop-shadow(0 0 12px ${info.primaryColor}80)`,
                    fontFamily:
                      "'Dancing Script', 'Brush Script MT', 'Great Vibes', cursive, Georgia, serif",
                  }}
                >
                  {heroFirstName} {nameTokens[nameTokens.length - 1] || heroLastName}
                </span>
              </div>

              {/* Social Icons Row (Persis FB, Twitter, IG dalam Cyan Glyphs Tanpa Box) */}
              <div className="flex items-center gap-5 pt-2">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="hover:text-white hover:scale-110 transition-all"
                  style={{ color: info.primaryColor }}
                >
                  <Facebook className="w-4 h-4 fill-current" />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="hover:text-white hover:scale-110 transition-all"
                  style={{ color: info.primaryColor }}
                >
                  <Twitter className="w-4 h-4 fill-current" />
                </a>
                <a
                  href={info.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:text-white hover:scale-110 transition-all"
                  style={{ color: info.primaryColor }}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>

            </div>

          </div>
        </div>

        {/* ─── 1B. PARTNER & TRUST DOCK DI DASAR SECTION 1 (PAS DI BAGIAN BAWAH LAYAR PERTAMA) ─── */}
        <div className="relative z-10 w-full py-4 lg:py-5 bg-[#0A0A0A] border-y overflow-hidden" style={{ borderColor: `${info.primaryColor}33` }}>
          <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
            <div className="flex flex-wrap items-center justify-around gap-6 sm:gap-8 text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#9CA3AF]/80">
              <span className="hover:text-[#05DFD7] transition-colors cursor-default">
                KOMISI PARLEMEN
              </span>
              <span style={{ color: `${info.primaryColor}66` }}>•</span>
              <span className="hover:text-[#05DFD7] transition-colors cursor-default">
                BADAN ANGGARAN
              </span>
              <span style={{ color: `${info.primaryColor}66` }}>•</span>
              <span className="hover:text-[#05DFD7] transition-colors cursor-default">
                ASPIRASI RAKYAT
              </span>
              <span style={{ color: `${info.primaryColor}66` }}>•</span>
              <span className="hover:text-[#05DFD7] transition-colors cursor-default">
                TRANSPARANSI PUBLIK
              </span>
              <span style={{ color: `${info.primaryColor}66` }}>•</span>
              <span className="hover:text-[#05DFD7] transition-colors cursor-default">
                POLARIS CIVIC
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* ─── 1C. WHAT WE DO SECTION (PERSIS GAMBAR REFERENSI: 4 KARTU CYAN GLOW) ─── */}
      <section className="py-20 lg:py-24 bg-[#070707] border-b border-[#1A1A1A]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 text-center">
          
          {/* Header Center: OUR SERVICES & What We Do. */}
          <div className="max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] block" style={{ color: info.primaryColor }}>
              OUR SERVICES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              What We Do <span style={{ color: info.primaryColor }}>.</span>
            </h2>
            <div className="w-12 h-0.5 mx-auto rounded-full" style={{ backgroundColor: info.primaryColor, boxShadow: `0 0 8px ${info.primaryColor}` }} />
            <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed pt-2">
              Empat pilar pokok dalam mengemban mandat keterwakilan rakyat demi kemaslahatan masyarakat {info.dapil}.
            </p>
          </div>

          {/* 4 Cards (Persis 4 Kotak Gelap dengan Ikon Cyan Wireframe) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            {/* Card 1: Brand Identity style -> Pengawasan Anggaran */}
            <div className="group bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-8 hover:border-[#05DFD7] transition-all duration-300 hover:shadow-[0_0_25px_rgba(5,223,215,0.15)] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center group-hover:scale-110 transition-transform" style={{ color: info.primaryColor }}>
                  <Scale className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#05DFD7] transition-colors">
                  Pengawasan Anggaran
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Memastikan efisiensi dan transparansi alokasi belanja APBD hingga tuntas ke proyek infrastruktur desa.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href={href('/artikel')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                  style={{ color: info.primaryColor }}
                >
                  <span>Pelajari Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Website Design style -> Legislasi & Perda */}
            <div className="group bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-8 hover:border-[#05DFD7] transition-all duration-300 hover:shadow-[0_0_25px_rgba(5,223,215,0.15)] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center group-hover:scale-110 transition-transform" style={{ color: info.primaryColor }}>
                  <FileText className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#05DFD7] transition-colors">
                  Legislasi & Perda
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Menyusun payung hukum daerah yang melindungi pedagang kecil, buruh tani, dan pelestarian lingkungan hidup.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href={href('/artikel')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                  style={{ color: info.primaryColor }}
                >
                  <span>Pelajari Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: UI & UX Design style -> Pelayanan Konstituen */}
            <div className="group bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-8 hover:border-[#05DFD7] transition-all duration-300 hover:shadow-[0_0_25px_rgba(5,223,215,0.15)] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center group-hover:scale-110 transition-transform" style={{ color: info.primaryColor }}>
                  <Users className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#05DFD7] transition-colors">
                  Pelayanan Aspirasi
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Menerima keluhan masyarakat melalui posko perwakilan serta memperjuangkannya dalam rapat paripurna.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href={href('/kontak')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                  style={{ color: info.primaryColor }}
                >
                  <span>Kirim Aspirasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 4: Video Marketing style -> Pemberdayaan UMKM */}
            <div className="group bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-8 hover:border-[#05DFD7] transition-all duration-300 hover:shadow-[0_0_25px_rgba(5,223,215,0.15)] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center group-hover:scale-110 transition-transform" style={{ color: info.primaryColor }}>
                  <Layers className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#05DFD7] transition-colors">
                  Pemberdayaan UMKM
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Advokasi bantuan permodalan dan pelatihan digital bagi pelaku usaha mikro serta kelompok wirausaha desa.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href={href('/profil')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                  style={{ color: info.primaryColor }}
                >
                  <span>Lihat Program</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2: ARTIKEL (FEATURED ARTICLES WITH IMAGES)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-[#0A0A0A] border-b border-[#1A1A1A]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.25em] block mb-1" style={{ color: info.primaryColor }}>
                WARTA & RISALAH
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Artikel & Kajian Kebijakan <span style={{ color: info.primaryColor }}>.</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1 max-w-lg">
                Telaah regulasi, rangkuman sidang komisi, serta pemikiran strategis dari {info.officialFullName}.
              </p>
            </div>

            <Link
              href={href('/artikel')}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all self-start sm:self-auto hover:opacity-90"
              style={{ color: info.primaryColor, borderColor: `${info.primaryColor}80`, backgroundColor: `${info.primaryColor}15` }}
            >
              LIHAT SEMUA ARTIKEL
            </Link>
          </div>

          {/* Grid of Articles */}
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
                  className="group bg-[#111111] border border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#05DFD7] transition-all duration-300 flex flex-col justify-between"
                >
                  <Link
                    href={href(`/artikel/${slug}`)}
                    className="relative aspect-[16/10] overflow-hidden bg-[#1A1A1A] block"
                  >
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider border" style={{ color: info.primaryColor, borderColor: `${info.primaryColor}66` }}>
                        {cat}
                      </span>
                    </div>
                  </Link>

                  <div className="p-6 lg:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-[#71717A] mb-2 font-medium">
                        <span>{date}</span>
                        <span>•</span>
                        <span>{art.readTime || '4 min baca'}</span>
                      </div>
                      <h3 className="text-lg lg:text-xl font-bold text-white group-hover:text-[#05DFD7] transition-colors line-clamp-2 leading-snug">
                        <Link href={href(`/artikel/${slug}`)}>{title}</Link>
                      </h3>
                      {art.excerpt && (
                        <p className="text-xs text-[#9CA3AF] mt-2 line-clamp-2 leading-relaxed">
                          {art.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-6 mt-4 border-t border-[#1C1C1C]">
                      <Link
                        href={href(`/artikel/${slug}`)}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1.5 transition-transform" style={{ color: info.primaryColor }}
                      >
                        <span>BACA SELENGKAPNYA</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
          SECTION 3: INFOGRAFIS (POSTERS WITH LIGHTBOX) & CTA
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#060606] border-t border-[#141414]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#05DFD7] block mb-1">
                TRANSPARANSI DATA
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Infografis Akuntabilitas & Kinerja <span style={{ color: info.primaryColor }}>.</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1 max-w-lg">
                Rekapitulasi grafis capaian legislasi, serapan anggaran APBD, dan jadwal penyerapan aspirasi.
              </p>
            </div>

            <Link
              href={href('/infografis')}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-[#222] hover:border-[#05DFD7] text-[#9CA3AF] hover:text-[#05DFD7] text-xs font-bold uppercase tracking-wider transition-colors self-start sm:self-auto"
            >
              SEMUA INFOGRAFIS
            </Link>
          </div>

          {/* Grid of Infographics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {infographics.map((item: any, idx: number) => {
              const img = getInfoImg(item);
              const title = item.title;
              const cat = getInfoCat(item);

              return (
                <div
                  key={item.id || idx}
                  className="group bg-[#0D0D0D] border border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#05DFD7] transition-all flex flex-col justify-between"
                >
                  <div
                    onClick={() => setActiveModal(item)}
                    className="relative aspect-[4/5] overflow-hidden bg-[#181818] cursor-pointer"
                  >
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full text-black flex items-center justify-center shadow-lg font-bold" style={{ backgroundColor: info.primaryColor }}>
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/80 text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">
                        {cat}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4
                        onClick={() => setActiveModal(item)}
                        className="text-sm font-bold text-white group-hover:text-[#05DFD7] transition-colors cursor-pointer line-clamp-2"
                      >
                        {title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-[#9CA3AF] mt-1.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#1A1A1A] flex items-center justify-between">
                      <button
                        onClick={() => setActiveModal(item)}
                        className="text-xs font-bold hover:underline" style={{ color: info.primaryColor }}
                      >
                        Pratinjau Poster &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── PRE-FOOTER CTA CARD ─── */}
          <div className="bg-[#0C0C0C] border border-[#1E1E1E] rounded-2xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-20" style={{ backgroundColor: info.primaryColor }} />
            
            <div className="max-w-2xl space-y-3 relative z-10">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Pintu Komunikasi Terbuka Bagi Seluruh Konstituen
              </h3>
              <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                Sampaikan aspirasi lingkungan, aduan fasilitas umum, atau ajukan audiensi langsung ke kantor sekretariat dewan.
              </p>
            </div>

            <Link
              href={href('/kontak')}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-black text-xs font-extrabold uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0 relative z-10"
              style={{ backgroundColor: info.primaryColor, boxShadow: `0 0 25px ${info.primaryColor}40` }}
            >
              HUBUNGI SAYA
            </Link>
          </div>

        </div>
      </section>

      {/* ─── LIGHTBOX MODAL ─── */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#111] border border-[#2A2A2A] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-4 px-6 border-b border-[#222] flex items-center justify-between bg-[#0C0C0C]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: info.primaryColor }}>
                  {getInfoCat(activeModal)}
                </span>
                <h4 className="text-sm lg:text-base font-bold text-white line-clamp-1">
                  {activeModal.title || 'Infografis'}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getInfoImg(activeModal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#222] transition-colors" style={{ color: info.primaryColor }}
                  title="Unduh / Buka Gambar Penuh"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-lg bg-[#1A1A1A] text-[#9CA3AF] hover:text-white hover:bg-[#222] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-4">
              <img
                src={getInfoImg(activeModal)}
                alt={activeModal.title || 'Infografis'}
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </WashoskiCyanShell>
  );
}
