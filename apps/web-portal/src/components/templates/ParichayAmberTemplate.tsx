'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ArrowRight,
  Maximize2,
  X,
  User,
  Facebook,
  Twitter,
  Globe,
  Instagram,
  Linkedin,
  Download,
  CheckCircle2,
  FileText,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { ParichayAmberShell } from './parichay-amber/ParichayAmberShell';
import {
  getParichayMemberInfo,
  useParichayHref,
  getArticleImage,
  getArticleCategory,
  getArticleExcerpt,
  PARICHAY_DEFAULT_ARTICLES,
  PARICHAY_DEFAULT_INFOGRAPHICS,
  PARICHAY,
} from './parichay-amber/utils';

export interface ParichayAmberTemplateProps {
  member: any;
  theme: any;
  recentArticles?: any[];
  recentInfographics?: any[];
  documents?: any[];
  subdomain?: string;
}

export function ParichayAmberTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: ParichayAmberTemplateProps) {
  const info = getParichayMemberInfo(member, theme, subdomain);
  const href = useParichayHref(subdomain);

  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);

  const articles =
    recentArticles && recentArticles.length > 0
      ? recentArticles.slice(0, 3)
      : PARICHAY_DEFAULT_ARTICLES.slice(0, 3);

  const infographics =
    recentInfographics && recentInfographics.length > 0
      ? recentInfographics.slice(0, 3)
      : PARICHAY_DEFAULT_INFOGRAPHICS.slice(0, 3);

  const formatDateIndonesian = (dateVal: any) => {
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '01 Sep 2026';
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '01 Sep 2026';
    }
  };

  return (
    <ParichayAmberShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="beranda"
      showMasthead={false}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: HERO DUAL-SPLIT CURVE & ABOUT ME (PERSIS GAMBAR REFERENSI)
      ═══════════════════════════════════════════════════════════════════════ */}
      
      {/* 1A. HERO SECTION PERSIS GAMBAR: FULL FIRST FOLD, KIRI PUTIH DENGAN KURVA, KANAN AMBER SOLID, FOTO ANCHORED KE BAWAH */}
      <section className="relative overflow-hidden bg-white border-b border-[#F3E8D6] min-h-screen lg:h-screen flex items-center pt-20 lg:pt-0">
        
        {/* Background Concentric Curves / Arcs (Kurva Melengkung Krim Persis Gambar) */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Light Champagne Sweep */}
            <path
              d="M -150 900 C 180 900 360 680 480 320 C 560 80 620 -80 720 -150 L 860 -150 C 760 100 680 360 580 620 C 480 880 260 900 -150 900 Z"
              fill="#FFF6E5"
              opacity="0.9"
            />
            {/* Inner Champagne Accent Sweep */}
            <path
              d="M -80 900 C 180 900 320 720 420 420 C 480 240 540 60 620 -100 L 720 -100 C 640 80 580 260 510 460 C 420 720 240 900 -80 900 Z"
              fill="#FEEFD4"
              opacity="0.75"
            />
          </svg>
        </div>

        {/* Right Solid Amber Block (Mengisi ~35% Sisi Kanan Persis Seperti Gambar) */}
        <div
          className="absolute top-0 right-0 bottom-0 w-full lg:w-[35%] xl:w-[34%] hidden lg:block z-0"
          style={{ backgroundColor: info.primaryColor }}
        />

        {/* Left & Center Content Container */}
        <div className="relative z-10 w-full max-w-[1320px] mx-auto px-6 lg:px-12 xl:px-16 h-full flex items-center py-12 lg:py-0">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Sisi Kiri Hero: Teks Headline, Sapaan, & CTA */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-7 z-10">
              
              {/* Sapaan "Hello, I'm Janny" */}
              <p className="text-xl sm:text-2xl font-semibold text-[#374151] tracking-tight">
                Hello, I&apos;m {info.firstName}
              </p>

              {/* Headline Besar Dua Baris Persis Font & Warna Gambar */}
              <div className="space-y-1">
                <h1 className="text-6xl sm:text-7xl lg:text-[80px] xl:text-[92px] font-black tracking-tight text-[#111827] leading-[0.92]">
                  WAKIL RAKYAT
                </h1>
                <h2
                  className="text-6xl sm:text-7xl lg:text-[80px] xl:text-[92px] font-black tracking-tight leading-[0.92]"
                  style={{ color: info.primaryColor }}
                >
                  {info.legislativeLevel.includes('DPRD') ? 'DPRD PROVINSI' : 'PARLEMEN'}
                </h2>
              </div>

              {/* Tagline / Subtitle */}
              <div className="space-y-2 pt-1">
                <p className="text-xl sm:text-2xl font-bold text-[#1F2937] leading-snug">
                  {info.commissionName} &bull; {info.party}
                </p>
                <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed max-w-lg">
                  Pengawal Aspirasi Warga &amp; Pembangunan Daerah {info.dapil} menuju kebijakan yang berpihak kepada rakyat.
                </p>
              </div>

              {/* CTA Button Solid Amber Persegi Ber-Radius Sedikit "HIRE ME" Style */}
              <div className="pt-2">
                <Link
                  href={href('/kontak')}
                  className="inline-flex items-center justify-center px-9 py-3.5 rounded-sm text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-sm hover:shadow-md transition-all hover:scale-105"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  <span>HUBUNGI SAYA</span>
                </Link>
              </div>

            </div>

            {/* Sisi Kanan: Ruang penyeimbang layout di desktop */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-4" />

          </div>
        </div>

        {/* ─── STANDING PORTRAIT ANCHORED TO BOTTOM (PASTIKAN TIDAK MELAYANG) ─── */}
        <div
          className="lg:absolute lg:bottom-0 lg:right-[10%] xl:right-[14%] 2xl:right-[18%] lg:z-20 pointer-events-none flex items-end justify-center w-full lg:w-auto h-[450px] sm:h-[550px] lg:h-[88%] xl:h-[94%] max-h-[780px]"
        >
          <img
            src={info.photoUrl}
            alt={info.officialFullName}
            className="h-full w-auto max-w-none object-contain object-bottom drop-shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
            }}
          />
        </div>

      </section>

      {/* 1B. ABOUT ME SECTION (PERSIS GAMBAR REFERENSI: ICON USER, KARTU FOTO DENGAN STRIP MEDSOS, METRICS & PROGRESS BARS) */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-[1140px] mx-auto px-6 lg:px-10">
          
          {/* Section Header Tengah: Avatar Icon + "ABOUT ME" */}
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <div className="flex justify-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: info.primaryColor }}
              >
                <User className="w-4 h-4 fill-white text-transparent" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#1E1E1E]">
              ABOUT ME
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
              Mendedikasikan integritas, transparansi anggaran, dan komitmen penuh dalam memperjuangkan aspirasi warga {info.dapil}.
            </p>
          </div>

          {/* Grid Dua Kolom: Kiri Foto + Strip Medsos, Kanan Info + Progress Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* Kolom Kiri: Foto Persegi dengan Strip Medsos Amber Menempel di Kanan */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative flex items-stretch">
                
                {/* Frame Foto Utama (Putih & Shadow Lembut) */}
                <div className="w-[240px] sm:w-[280px] aspect-[3/4] bg-[#F9FAFB] rounded-2xl overflow-hidden border border-[#F3E8D6] shadow-xl relative">
                  <img
                    src={info.photoUrl}
                    alt={info.officialFullName}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/dewan-standing-crop.png';
                    }}
                  />
                </div>

                {/* Strip Medsos Amber Menempel di Kanan Foto (Persis Gambar) */}
                <div
                  className="w-12 sm:w-14 rounded-r-2xl flex flex-col items-center justify-center gap-4 text-white shadow-md z-10"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#1E1E1E] flex items-center justify-center transition-colors text-xs"
                  >
                    <Facebook className="w-3.5 h-3.5 fill-current" />
                  </a>
                  <a
                    href="#"
                    aria-label="Twitter / X"
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#1E1E1E] flex items-center justify-center transition-colors text-xs"
                  >
                    <Twitter className="w-3.5 h-3.5 fill-current" />
                  </a>
                  <a
                    href="#"
                    aria-label="Website Resmi"
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#1E1E1E] flex items-center justify-center transition-colors text-xs"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://instagram.com/${info.instagramUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#1E1E1E] flex items-center justify-center transition-colors text-xs"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="#"
                    aria-label="LinkedIn"
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#1E1E1E] flex items-center justify-center transition-colors text-xs"
                  >
                    <Linkedin className="w-3.5 h-3.5 fill-current" />
                  </a>
                </div>

              </div>
            </div>

            {/* Kolom Kanan: 3 Stat Counters, Bio, dan 3 Progress Bars dengan Badge Hitam */}
            <div className="lg:col-span-7 space-y-6">
              
              <div>
                <h4 className="text-xl font-bold text-[#1E1E1E]">
                  Hello I am {info.firstName}
                </h4>
              </div>

              {/* 3 Counter Stats: 490k Followers / 530+ Clients / 490k+ Requests versi Parlemen */}
              <div className="grid grid-cols-3 gap-4 py-2 border-y border-[#F3E8D6]">
                <div className="text-center sm:text-left">
                  <div
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                    style={{ color: info.primaryColor }}
                  >
                    490+
                  </div>
                  <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">
                    Aspirasi Warga
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <div
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                    style={{ color: info.primaryColor }}
                  >
                    120+
                  </div>
                  <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">
                    Rapat Komisi
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <div
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                    style={{ color: info.primaryColor }}
                  >
                    100%
                  </div>
                  <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">
                    Kawalan Perda
                  </div>
                </div>
              </div>

              {/* Bio Singkat */}
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                {info.bio}
              </p>

              {/* 3 Progress Bars Persis Gambar dengan Black Pill Tooltip Percentage */}
              <div className="space-y-5 pt-2">
                
                {/* Skill / Pilar 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1E1E1E]">
                    <span>Pengawasan Anggaran (APBD)</span>
                    <span className="px-1.5 py-0.5 bg-black text-white text-[10px] font-bold rounded-xs">
                      90%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: '90%', backgroundColor: info.primaryColor }}
                    />
                  </div>
                </div>

                {/* Skill / Pilar 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1E1E1E]">
                    <span>Legislasi &amp; Pembentukan Perda</span>
                    <span className="px-1.5 py-0.5 bg-black text-white text-[10px] font-bold rounded-xs">
                      75%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: '75%', backgroundColor: info.primaryColor }}
                    />
                  </div>
                </div>

                {/* Skill / Pilar 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1E1E1E]">
                    <span>Advokasi &amp; Serap Aspirasi Konstituen</span>
                    <span className="px-1.5 py-0.5 bg-black text-white text-[10px] font-bold rounded-xs">
                      88%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: '88%', backgroundColor: info.primaryColor }}
                    />
                  </div>
                </div>

              </div>

              {/* Action Button: DOWNLOAD CV / LAPORAN KINERJA */}
              <div className="pt-3">
                <Link
                  href={href('/profil')}
                  className="px-7 py-3 rounded-md text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all hover:scale-105"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  <Download className="w-4 h-4" />
                  <span>LIHAT PROFIL &amp; LAPORAN</span>
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: ARTIKEL & TELAAH KEBIJAKAN (DENGAN GAMBAR ARTIKEL JELAS)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-[#FAFAFA] border-t border-[#F3E8D6]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span
                className="text-xs font-extrabold uppercase tracking-[0.2em] block mb-1"
                style={{ color: info.primaryColor }}
              >
                PUBLIKASI &amp; TELAAH
              </span>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-[#1E1E1E] tracking-tight">
                Artikel &amp; Risalah Pemikiran
              </h2>
            </div>
            <Link
              href={href('/artikel')}
              className="inline-flex items-center gap-1.5 text-xs font-bold transition-all hover:translate-x-1"
              style={{ color: info.primaryColor }}
            >
              <span>Lihat Semua Artikel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid 3 Kolom Menampilkan Gambar Artikel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((item: any, idx: number) => {
              const imgUrl = getArticleImage(item);
              const cat = getArticleCategory(item);
              const excerpt = getArticleExcerpt(item);
              const dateStr = formatDateIndonesian(
                item.publishedAt || item.createdAt || new Date()
              );

              return (
                <Link
                  key={item.id || idx}
                  href={href(`/artikel/${item.slug || item.id}`)}
                  className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Container Gambar Artikel */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    <img
                      src={imgUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                      }}
                    />
                    <div
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm"
                      style={{ backgroundColor: info.primaryColor }}
                    >
                      {cat}
                    </div>
                  </div>

                  {/* Konten Artikel */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-[#1E1E1E] group-hover:text-[#FFA800] transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs text-[#6B7280] line-clamp-3 leading-relaxed">
                        {excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#9CA3AF]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5" style={{ color: info.primaryColor }} />
                        {dateStr}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform"
                        style={{ color: info.primaryColor }}
                      >
                        Baca Risalah ➔
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3: INFOGRAFIS & DATA TRANSPARANSI (DENGAN GAMBAR INFOGRAFIS)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-white border-t border-[#F3E8D6]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span
                className="text-xs font-extrabold uppercase tracking-[0.2em] block mb-1"
                style={{ color: info.primaryColor }}
              >
                DATA &amp; TRANSPARANSI
              </span>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-[#1E1E1E] tracking-tight">
                Infografis Capaian Dewan
              </h2>
            </div>
            <Link
              href={href('/infografis')}
              className="inline-flex items-center gap-1.5 text-xs font-bold transition-all hover:translate-x-1"
              style={{ color: info.primaryColor }}
            >
              <span>Lihat Semua Infografis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid 3 Kolom Infografis Menampilkan Gambar Poster */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {infographics.map((item: any, idx: number) => {
              const imgUrl =
                item.imageUrl ||
                item.posterUrl ||
                item.thumbnailUrl ||
                '/images/showcase-infografis-apbd.jpg';
              const cat = item.category || item.categoryName || 'Transparansi Data';

              return (
                <div
                  key={item.id || idx}
                  onClick={() => setActiveModalInfo(item)}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Container Gambar Infografis */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
                    <img
                      src={imgUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-[#1E1E1E] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow">
                      <Maximize2 className="w-4 h-4 font-bold" />
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      {item.metric && (
                        <div
                          className="font-extrabold text-3xl tracking-tight"
                          style={{ color: info.primaryColor }}
                        >
                          {item.metric}
                        </div>
                      )}
                      <div className="text-[10px] uppercase font-bold text-white/80 tracking-wider">
                        {item.metricLabel || cat}
                      </div>
                      <h3 className="mt-1 text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 bg-white flex items-center justify-between text-xs text-[#6B7280]">
                    <span className="font-semibold" style={{ color: info.primaryColor }}>
                      {cat}
                    </span>
                    <span className="font-bold text-[#1E1E1E] group-hover:underline">
                      Perbesar Grafik ➔
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── MODAL LIGHTBOX INFOGRAFIS ─── */}
      {activeModalInfo && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveModalInfo(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveModalInfo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Gambar Besar Infografis */}
            <div className="bg-[#1E1E1E] p-4 flex items-center justify-center min-h-[360px]">
              <img
                src={
                  activeModalInfo.imageUrl ||
                  activeModalInfo.posterUrl ||
                  '/images/showcase-infografis-apbd.jpg'
                }
                alt={activeModalInfo.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>

            {/* Info Detail Infografis */}
            <div className="p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span
                  className="px-3 py-1 rounded-full text-white text-[10px] font-extrabold uppercase tracking-wider inline-block"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  {activeModalInfo.category || 'Transparansi Data'}
                </span>

                <h3 className="font-extrabold text-2xl text-[#1E1E1E] leading-snug">
                  {activeModalInfo.title}
                </h3>

                {activeModalInfo.metric && (
                  <div className="p-4 rounded-2xl bg-[#FFF9ED] border border-[#F3E8D6]">
                    <div
                      className="text-4xl font-extrabold"
                      style={{ color: info.primaryColor }}
                    >
                      {activeModalInfo.metric}
                    </div>
                    <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mt-1">
                      {activeModalInfo.metricLabel || 'Indikator Utama'}
                    </div>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  {activeModalInfo.description ||
                    'Publikasi grafik transparansi dan capaian fungsi legislasi, anggaran, serta pengawasan dewan resmi untuk publik.'}
                </p>
              </div>

              <div className="pt-4 border-t border-[#F3E8D6] flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF]">
                  Dipublikasikan oleh {info.officialFullName}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveModalInfo(null)}
                  className="px-6 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  Tutup Tampilan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ParichayAmberShell>
  );
}
