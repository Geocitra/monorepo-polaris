'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ArrowRight,
  Maximize2,
  X,
  Download,
  Facebook,
  Instagram,
  Twitter,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { OrixVioletShell } from './orix-violet/OrixVioletShell';
import {
  getOrixMemberInfo,
  useOrixHref,
  getArticleImage,
  getArticleCategory,
  getArticleExcerpt,
  ORIX_DEFAULT_ARTICLES,
  ORIX_DEFAULT_INFOGRAPHICS,
} from './orix-violet/utils';

export interface OrixVioletTemplateProps {
  member: any;
  theme: any;
  recentArticles?: any[];
  recentInfographics?: any[];
  documents?: any[];
  subdomain?: string;
}

export function OrixVioletTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: OrixVioletTemplateProps) {
  const info = getOrixMemberInfo(member, theme, subdomain);
  const href = useOrixHref(subdomain);

  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);

  const articles =
    recentArticles && recentArticles.length > 0
      ? recentArticles.slice(0, 3)
      : ORIX_DEFAULT_ARTICLES.slice(0, 3);

  const infographics =
    recentInfographics && recentInfographics.length > 0
      ? recentInfographics.slice(0, 3)
      : ORIX_DEFAULT_INFOGRAPHICS.slice(0, 3);

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

  const facts = [
    { label: 'Lembaga', value: info.legislativeLevel },
    { label: 'Daerah Pemilihan', value: info.dapil },
    { label: 'Fraksi Partai', value: info.party },
    { label: 'Email Resmi', value: info.officialEmail },
    { label: 'Hotline Reses', value: info.officialPhone },
    { label: 'Status Dewan', value: 'Aktif Menjabat' },
  ];

  return (
    <OrixVioletShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="beranda"
      showMasthead={false}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: HERO ORGANIC VIOLET CURVE & ABOUT ME (PERSIS GAMBAR ORIX)
      ═══════════════════════════════════════════════════════════════════════ */}
      
      {/* 1A. HERO SECTION: FULL FIRST FOLD, LATAR VIOLET LENGKUNG ORGANIK, CIRCLE PORTRAIT, FLOATING 10K CARD & GEOMETRIC ACCENTS */}
      <section
        className="relative overflow-hidden text-white min-h-screen lg:h-screen flex items-center pt-20 lg:pt-0"
        style={{
          background: `radial-gradient(circle at 75% 30%, #4F12D6 0%, ${info.primaryColor} 60%, #1C025E 100%)`,
        }}
      >
        {/* Organic Convex Curve di Bagian Bawah Mengalir ke Background Putih */}
        <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
          <svg
            viewBox="0 0 1440 180"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-24 sm:h-32 lg:h-44"
          >
            <path
              d="M0,0 C380,180 1060,180 1440,0 L1440,180 L0,180 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        {/* Concentric Wireframe Arcs di Kiri Bawah Persis Gambar */}
        <div className="absolute left-6 lg:left-14 bottom-12 w-96 h-96 rounded-full border border-white/15 pointer-events-none" />
        <div className="absolute left-16 lg:left-24 bottom-20 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute left-28 lg:left-36 bottom-28 w-60 h-60 rounded-full border border-white/10 pointer-events-none" />

        <div className="relative z-20 w-full max-w-[1320px] mx-auto px-6 lg:px-12 xl:px-16 py-12 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Sisi Kiri Hero: HELLO I AM Outline Font, Giant Name, Subtitle, CTA & Green Dot */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Hollow/Outline Geometric Text "HELLO I AM" Persis Gambar */}
              <div
                className="font-black text-xl sm:text-2xl tracking-[0.25em] uppercase text-white/90 select-none"
                style={{
                  WebkitTextStroke: '1px rgba(255, 255, 255, 0.75)',
                  letterSpacing: '0.2em',
                }}
              >
                HELLO I AM
              </div>

              {/* Giant Name */}
              <h1 className="font-extrabold text-5xl sm:text-6xl lg:text-7xl xl:text-[76px] tracking-tight text-white leading-[1.05]">
                {info.officialFullName}
              </h1>

              {/* Subtitle Deskripsi Jabatan & Parlemen */}
              <p className="text-sm sm:text-base text-white/85 max-w-lg leading-relaxed font-medium">
                {info.headlineTagline ||
                  `Wakil Rakyat ${info.legislativeLevel} • Mengawal Aspirasi Warga ${info.dapil} dari ${info.party}.`}
              </p>

              {/* Button Action */}
              <div className="pt-2 flex items-center">
                <Link
                  href={href('/kontak')}
                  className="px-7 py-3.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                  style={{
                    background:
                      'linear-gradient(135deg, #7C3AED 0%, #4F12D6 100%)',
                  }}
                >
                  HUBUNGI SAYA
                </Link>
              </div>

            </div>

            {/* Sisi Kanan Hero: Circle Portrait + Yellow Ring + Floating 10K Card + Geometric Accents */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-[300px] sm:w-[380px] lg:w-[420px] aspect-square">
                
                {/* Yellow Thick Ring di Sudut Kiri Atas Circle Persis Gambar */}
                <div className="absolute -top-3 left-4 w-16 h-16 rounded-full border-[7px] border-[#F59E0B] z-10 pointer-events-none" />

                {/* White Wireframe Circle di Kanan Atas */}
                <div className="absolute top-2 -right-2 w-10 h-10 rounded-full border-2 border-white/60 pointer-events-none" />

                {/* White Wireframe Triangle di Kanan */}
                <div className="absolute top-1/4 -right-6 pointer-events-none opacity-70">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <polygon
                      points="12,2 22,22 2,22"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* Small Dots */}
                <div className="absolute top-1/2 -right-8 w-2.5 h-2.5 rounded-full bg-white/50 pointer-events-none" />

                {/* Big Circular Frame Portrait (Clipped Cleanly in Circle) */}
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-white/10 relative">
                  <img
                    src={info.photoUrl}
                    alt={info.officialFullName}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/avatar-dewan-budi.jpg';
                    }}
                  />
                </div>

                {/* Floating Metric Card di Kiri Bawah Circle Persis Gambar ("10K Happy Satisfied Customers") */}
                <div className="absolute -bottom-2 -left-6 sm:-left-10 bg-white text-[#111827] rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 z-20 max-w-[200px] animate-in zoom-in-95 duration-500">
                  <div className="text-3xl sm:text-4xl font-black text-[#3B0CB8] tracking-tight">
                    490+
                  </div>
                  <div className="text-xs font-bold text-[#6B7280] leading-snug mt-1">
                    Aspirasi Warga Ditindaklanjuti
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 1B. ABOUT ME SECTION (PERSIS GAMBAR: ABOUT ME + DOWNLOAD CV + MEDSOS + FACT LIST + SIGNATURE + 4 METRIC CARDS) */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Sisi Kiri: About Me Heading + Button Download + Socials + Fact Rows */}
            <div className="lg:col-span-5 space-y-6">
              
              <div>
                <h2 className="font-extrabold text-3xl sm:text-4xl text-[#111827] tracking-tight">
                  About Me
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 leading-relaxed font-medium">
                  Mendedikasikan integritas, advokasi regulasi, dan kerja nyata bagi seluruh masyarakat {info.dapil}.
                </p>
              </div>

              {/* Action Buttons: Download CV + Social Icons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href={href('/profil')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all"
                  style={{
                    background:
                      'linear-gradient(135deg, #4F12D6 0%, #7C3AED 100%)',
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Profil</span>
                </Link>

                {/* Social Media Circles: FB, IG, Twitter */}
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                >
                  <Facebook className="w-4 h-4 fill-current" />
                </a>
                <a
                  href={`https://instagram.com/${info.instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                  style={{
                    background:
                      'linear-gradient(45deg, #F58529, #D62976, #962FBF, #4F5BD5)',
                  }}
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  aria-label="Twitter / X"
                  className="w-8 h-8 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                >
                  <Twitter className="w-4 h-4 fill-current" />
                </a>
              </div>

              {/* Data Identitas / Fact Rows (Rounded Pill Cards Persis Gambar) */}
              <div className="space-y-2.5 pt-4">
                {facts.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#F9FAFB] border border-slate-100 text-xs"
                  >
                    <span className="font-bold text-[#6B7280]">{f.label}:</span>
                    <span className="font-bold text-[#111827] text-right truncate max-w-[200px]">
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* Sisi Kanan: Bio Narasi + Signature + 4 Metric Cards Grid */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  {info.bio}
                </p>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  Sebagai wakil rakyat, komitmen transparansi dan pembelaan hak warga menjadi fokus utama kami dalam perumusan anggaran, penetapan peraturan daerah, dan pengawasan birokrasi pemerintahan daerah.
                </p>

                {/* Handwritten Signature SVG Persis Gambar */}
                <div className="pt-2">
                  <svg width="180" height="50" viewBox="0 0 180 50" fill="none">
                    <path
                      d="M10,35 C30,10 45,45 60,20 C70,5 85,40 100,25 C115,10 130,45 150,20 C160,10 170,30 175,25"
                      stroke="#111827"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M50,25 L120,25"
                      stroke="#111827"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* 4 Metric Cards Grid dalam Border Indigo Persis Gambar (50%, 75%, 38%, 63%) */}
              <div className="p-6 rounded-3xl border-2 border-indigo-200 bg-white shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Card 1: 50% */}
                  <div className="p-6 rounded-2xl border-2 border-indigo-400 bg-indigo-50/40 text-center space-y-1">
                    <div className="text-3xl sm:text-4xl font-black text-[#3B0CB8]">
                      90%
                    </div>
                    <div className="text-xs font-bold text-[#4B5563]">
                      Pengawasan Anggaran (APBD)
                    </div>
                  </div>

                  {/* Card 2: 75% */}
                  <div className="p-6 rounded-2xl border-2 border-indigo-400 bg-indigo-50/40 text-center space-y-1">
                    <div className="text-3xl sm:text-4xl font-black text-[#3B0CB8]">
                      75%
                    </div>
                    <div className="text-xs font-bold text-[#4B5563]">
                      Legislasi &amp; Pembentukan Perda
                    </div>
                  </div>

                  {/* Card 3: 38% */}
                  <div className="p-6 rounded-2xl border-2 border-indigo-400 bg-indigo-50/40 text-center space-y-1">
                    <div className="text-3xl sm:text-4xl font-black text-[#3B0CB8]">
                      88%
                    </div>
                    <div className="text-xs font-bold text-[#4B5563]">
                      Advokasi Hak Konstituen
                    </div>
                  </div>

                  {/* Card 4: 63% */}
                  <div className="p-6 rounded-2xl border-2 border-indigo-400 bg-indigo-50/40 text-center space-y-1">
                    <div className="text-3xl sm:text-4xl font-black text-[#3B0CB8]">
                      95%
                    </div>
                    <div className="text-xs font-bold text-[#4B5563]">
                      Kehadiran Sidang Parlemen
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: ARTIKEL & TELAAH (DENGAN GAMBAR ARTIKEL JELAS)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-[#F9FAFB] border-t border-indigo-50">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 xl:px-16">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#7C3AED] block mb-1">
                PUBLIKASI &amp; RISET
              </span>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-[#111827] tracking-tight">
                Artikel &amp; Risalah Kebijakan
              </h2>
            </div>
            <Link
              href={href('/artikel')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F12D6] hover:text-[#7C3AED] transition-all hover:translate-x-1"
            >
              <span>Lihat Semua Artikel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid 3 Kolom Menampilkan Gambar Sampul Artikel */}
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
                  className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    <img
                      src={imgUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                      }}
                    />
                    <div className="absolute top-3 left-3 px-3.5 py-1 rounded-full bg-[#3B0CB8] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                      {cat}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-[#111827] group-hover:text-[#4F12D6] transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs text-[#6B7280] line-clamp-3 leading-relaxed">
                        {excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#9CA3AF]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#7C3AED]" />
                        {dateStr}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-[#4F12D6] group-hover:translate-x-1 transition-transform">
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
          SECTION 3: INFOGRAFIS CAPAIAN (DENGAN GAMBAR INFOGRAFIS & LIGHTBOX)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-white border-t border-indigo-50">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 xl:px-16">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#7C3AED] block mb-1">
                DATA &amp; TRANSPARANSI
              </span>
              <h2 className="font-extrabold text-3xl sm:text-4xl text-[#111827] tracking-tight">
                Infografis Kinerja Dewan
              </h2>
            </div>
            <Link
              href={href('/infografis')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F12D6] hover:text-[#7C3AED] transition-all hover:translate-x-1"
            >
              <span>Lihat Semua Infografis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid 3 Kolom Infografis Menampilkan Poster Jelas */}
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
                  className="group relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer"
                >
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

                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-[#111827] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow">
                      <Maximize2 className="w-4 h-4 font-bold" />
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      {item.metric && (
                        <div className="font-black text-3xl text-white tracking-tight">
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
                    <span className="font-semibold text-[#7C3AED]">{cat}</span>
                    <span className="font-bold text-[#111827] group-hover:text-[#4F12D6]">
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
            <div className="bg-[#111827] p-4 flex items-center justify-center min-h-[360px]">
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
                <span className="px-3.5 py-1 rounded-full bg-[#3B0CB8] text-white text-[10px] font-extrabold uppercase tracking-wider inline-block">
                  {activeModalInfo.category || 'Transparansi Data'}
                </span>

                <h3 className="font-black text-2xl text-[#111827] leading-snug">
                  {activeModalInfo.title}
                </h3>

                {activeModalInfo.metric && (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <div className="text-4xl font-black text-[#3B0CB8]">
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

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF]">
                  Dipublikasikan oleh {info.officialFullName}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveModalInfo(null)}
                  className="px-6 py-2.5 rounded-full bg-[#3B0CB8] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow"
                >
                  Tutup Tampilan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </OrixVioletShell>
  );
}
