'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Calendar,
  Sparkles,
  Scale,
  ShieldCheck,
  Layers,
  Users,
  Eye,
  X,
  ArrowRight,
  ChevronRight,
  Instagram,
  BookOpen,
  Mail,
} from 'lucide-react';
import { LailaSakuraShell } from './laila-sakura/LailaSakuraShell';
import {
  getLailaMemberInfo,
  useLailaHref,
} from './laila-sakura/utils';

interface LailaSakuraTemplateProps {
  member: any;
  theme: any;
  articles?: any[];
  infographics?: any[];
  recentArticles?: any[];
  recentInfographics?: any[];
  documents?: any[];
  subdomain?: string;
}

export function LailaSakuraTemplate({
  member,
  theme,
  articles,
  infographics,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: LailaSakuraTemplateProps) {
  const info = getLailaMemberInfo(member, theme, subdomain);
  const href = useLailaHref(subdomain);
  const [selectedInfographic, setSelectedInfographic] = useState<any | null>(null);

  const rawArticles = articles || recentArticles || [];
  const rawInfographics = infographics || recentInfographics || [];

  // Normalize articles from REAL API (no dummy fallback)
  const displayArticles =
    rawArticles && rawArticles.length > 0
      ? rawArticles.map((a: any, i: number) => ({
          id: a.id || `art-${i}`,
          slug: a.slug || a.id || `artikel-${i}`,
          title: a.title,
          category: a.category || a.categoryName || a.issueCategory || 'Kebijakan Publik',
          date: a.publishedAt
            ? new Date(a.publishedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : a.date || 'Terbaru',
          imageUrl:
            a.featuredImageUrl ||
            a.posterUrl ||
            a.coverImageUrl ||
            a.imageUrl ||
            a.thumbnailUrl ||
            '/images/default-article.jpg',
          excerpt:
            a.excerpt ||
            a.summary ||
            (a.bodyContentMarkdown ? a.bodyContentMarkdown.substring(0, 140) + '...' : ''),
        }))
      : [];

  // Normalize infographics from REAL API (no dummy fallback)
  const displayInfographics =
    rawInfographics && rawInfographics.length > 0
      ? rawInfographics.map((inf: any, i: number) => ({
          id: inf.id || `info-${i}`,
          title: inf.title,
          category: inf.category || inf.categoryName || 'Visual Kebijakan',
          badge:
            inf.badge ||
            (inf.assetType === 'DALLE_POSTER' ? 'Poster Kebijakan' : 'Infografis Resmi'),
          imageUrl:
            inf.posterUrl ||
            inf.featuredImageUrl ||
            inf.fileUrl ||
            inf.imageUrl ||
            inf.thumbnailUrl ||
            '/images/showcase-infografis-apbd.jpg',
          summary:
            inf.summary ||
            inf.description ||
            inf.excerpt ||
            (inf.bodyContentMarkdown
              ? inf.bodyContentMarkdown.substring(0, 140) + '...'
              : 'Visualisasi data transparansi dan kebijakan publik.'),
        }))
      : [];

  return (
    <LailaSakuraShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="beranda"
      customHeader={false}
    >
      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1: HERO VIEWPORT (100% SATU HALAMAN PENUH / FULL SCREEN)
          - Kiri: Tagline + Nama + Slogan Pink dengan Kursor Berkedip + Tombol Aksi & Sosmed
          - Kanan: Potret Dewan Berlatar Glowing Neon Pink Aura (Grounded di Bawah)
          - Dasar Hero: Kemitraan Komisi & Ruang Kerja Parlemen
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] lg:max-h-[100dvh] flex flex-col justify-between pt-4 sm:pt-6 pb-0 bg-[#080D1A] overflow-hidden">
        
        {/* Ambient Hot Pink & Sakura Glow Aura */}
        <div
          className="absolute top-1/4 right-1/4 w-[550px] h-[550px] rounded-full blur-[160px] pointer-events-none opacity-25"
          style={{ backgroundColor: info.primaryColor }}
        />
        <div className="absolute top-1/3 left-1/6 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none opacity-15 bg-[#FF2E74]" />

        {/* 1A. MAIN HERO GRID: Teks Kiri + Potret Kanan */}
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 w-full flex-1 flex items-center relative z-10 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
            
            {/* Sisi Kiri: Tagline, Nama + Sakura Emojis, Subtitle Pink dengan Kursor */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
              <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#8E9BB0] uppercase block">
                {info.legislativeLevel} • {info.dapil}
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                🌸 Salam Takzim, Saya <br className="hidden sm:inline" />
                <span className="text-white">{info.officialFullName}</span> 🌸
              </h1>

              <div className="flex items-center gap-2">
                <span
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
                  style={{ color: info.primaryColor }}
                >
                  Suara Rakyat, Aksi Nyata
                </span>
                <span className="text-2xl sm:text-3xl font-light text-[#FF4D8D] animate-pulse">|</span>
              </div>


              {/* Action Buttons: Hot Pink Pill + Circular Socials */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href={href('/profil')}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-white font-extrabold text-xs tracking-wider transition-all duration-300 shadow-[0_4px_24px_rgba(255,77,141,0.4)] hover:shadow-[0_6px_30px_rgba(255,77,141,0.6)] hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${info.primaryColor}, #FF1493)`,
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Lihat Rekam Jejak</span>
                </Link>

                <div className="flex items-center gap-2.5">
                  <a
                    href={info.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#0D1527] border border-[#1E2B42] text-[#A0ABC0] hover:text-[#FF4D8D] hover:border-[#FF4D8D] flex items-center justify-center transition-all duration-300 shadow-md"
                    title="Instagram Resmi"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href={`mailto:${info.email}`}
                    className="w-10 h-10 rounded-full bg-[#0D1527] border border-[#1E2B42] text-[#A0ABC0] hover:text-[#FF4D8D] hover:border-[#FF4D8D] flex items-center justify-center transition-all duration-300 shadow-md"
                    title="Email Aspirasi"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  <Link
                    href={href('/kontak')}
                    className="w-10 h-10 rounded-full bg-[#0D1527] border border-[#1E2B42] text-[#A0ABC0] hover:text-[#FF4D8D] hover:border-[#FF4D8D] flex items-center justify-center transition-all duration-300 shadow-md"
                    title="Ruang Aspirasi"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Foto Dewan dengan Glowing Neon Pink Aura */}
            <div className="lg:col-span-5 flex justify-center items-end relative">
              <div className="relative w-[300px] sm:w-[360px] md:w-[400px] h-[360px] sm:h-[440px] flex items-end justify-center">
                {/* Glowing Pink Backdrop Silhouette Glow */}
                <div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full blur-[80px] pointer-events-none opacity-45"
                  style={{ backgroundColor: info.primaryColor }}
                />

                <img
                  src={info.photoUrl || '/images/laila-sakura-hero.jpg'}
                  alt={info.officialFullName}
                  className="w-full h-full object-contain object-bottom relative z-10 filter brightness-105 contrast-105 drop-shadow-[0_10px_35px_rgba(255,77,141,0.35)]"
                  style={{
                    maskImage:
                      'linear-gradient(to bottom, #000 80%, rgba(0,0,0,0.8) 90%, transparent 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to bottom, #000 80%, rgba(0,0,0,0.8) 90%, transparent 100%)',
                  }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* 1B. PARTNER STRIP DI DASAR HERO VIEWPORT */}
        <div className="w-full bg-[#050811] border-t border-[#1E2B42] py-3.5 px-6 sm:px-12 shrink-0">
          <div className="max-w-[1320px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#64748B] font-semibold">
              Kemitraan Komisi & Ruang Kerja Parlemen
            </span>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 font-black tracking-widest text-xs uppercase text-white">
                <Scale className="w-4 h-4 text-[#FF4D8D]" />
                <span>PARLEMEN DAERAH</span>
              </div>
              <div className="flex items-center gap-2 font-black tracking-widest text-xs uppercase text-white">
                <ShieldCheck className="w-4 h-4 text-[#FF4D8D]" />
                <span>KOMISI LEGISLASI</span>
              </div>
              <div className="flex items-center gap-2 font-black tracking-widest text-xs uppercase text-white">
                <Layers className="w-4 h-4 text-[#FF4D8D]" />
                <span>BAPEMPERDA</span>
              </div>
              <div className="flex items-center gap-2 font-black tracking-widest text-xs uppercase text-white">
                <Users className="w-4 h-4 text-[#FF4D8D]" />
                <span>RUMAH ASPIRASI</span>
              </div>
              <div className="flex items-center gap-2 font-black tracking-widest text-xs uppercase text-white">
                <Sparkles className="w-4 h-4 text-[#FF4D8D]" />
                <span>POLARIS CIVIC</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2: ARTIKEL (PUBLIKASI & TELAAH KEBIJAKAN)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-[#080D1A] border-t border-[#1E2B42] relative overflow-hidden">
        {/* Ambient Subtle Pink Aura */}
        <div
          className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none opacity-10"
          style={{ backgroundColor: info.primaryColor }}
        />

        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 space-y-12 relative z-10">
          
          {/* Header Section 2 */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span
              className="text-xs font-mono font-bold uppercase tracking-[0.25em] block"
              style={{ color: info.primaryColor }}
            >
              🌸 PUBLIKASI & ARTIKEL KEBIJAKAN 🌸
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Risalah & Gagasan Parlemen
            </h2>
            <p className="text-xs sm:text-sm text-[#8E9BB0] leading-relaxed">
              Arsip telaah regulasi daerah, transparansi anggaran, serta catatan advokasi kebijakan publik untuk kemaslahatan masyarakat.
            </p>
          </div>

          {/* Grid Kartu Artikel */}
          {displayArticles.length === 0 ? (
            <div className="text-center py-16 bg-[#0D1527] rounded-3xl border border-[#1E2B42]">
              <BookOpen className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
              <p className="text-sm text-[#8E9BB0]">Belum ada artikel resmi yang dipublikasikan saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {displayArticles.slice(0, 3).map((art: any) => (
                <article
                  key={art.id}
                  className="group flex flex-col bg-[#0D1527] border border-[#1E2B42] rounded-3xl overflow-hidden hover:border-[#FF4D8D]/70 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,77,141,0.25)]"
                >
                  {/* Gambar Cover Artikel */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#070B14]">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#080D1A]/90 backdrop-blur-md border border-[#1E2B42]"
                        style={{ color: info.primaryColor }}
                      >
                        {art.category}
                      </span>
                    </div>
                  </div>

                  {/* Konten Artikel */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#64748B] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#FF4D8D]" />
                          <span>{art.date}</span>
                        </span>
                        <span
                          className="font-bold text-xs"
                          style={{ color: info.primaryColor }}
                        >
                          Publikasi Resmi
                        </span>
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-[#FF4D8D] transition-colors leading-snug">
                        {art.title}
                      </h3>

                      <p className="text-xs text-[#94A3B8] line-clamp-3 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#1E2B42]">
                      <Link
                        href={href(`/artikel/${art.slug}`)}
                        className="inline-flex items-center gap-2 text-xs font-mono font-bold transition-colors group-hover:translate-x-1 duration-300"
                        style={{ color: info.primaryColor }}
                      >
                        <span>Baca Risalah Lengkap 🌸</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              href={href('/artikel')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0D1527] border border-[#1E2B42] text-xs font-mono font-bold uppercase tracking-wider text-[#FF4D8D] hover:bg-[#FF4D8D] hover:text-white transition-all shadow-md"
            >
              <span>Lihat Seluruh Arsip Artikel & Kebijakan</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3: INFOGRAFIS (VISUALISASI DATA & KEBIJAKAN)
          - Kiri: Tangkai Bunga Sakura Bercahaya Pink
          - Kanan: Galeri Poster Infografis dengan Modal Interaktif
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-[#060A14] border-t border-[#1E2B42] relative overflow-hidden">
        {/* Ambient Subtle Pink Glow */}
        <div
          className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[180px] pointer-events-none opacity-10"
          style={{ backgroundColor: info.primaryColor }}
        />

        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 space-y-16 relative z-10">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span
              className="text-xs font-mono font-bold uppercase tracking-[0.25em] block"
              style={{ color: info.primaryColor }}
            >
              🌸 VISUALISASI DATA & KEBIJAKAN 🌸
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Galeri Infografis Parlemen
            </h2>
            <p className="text-xs sm:text-sm text-[#8E9BB0] leading-relaxed">
              Visualisasi data APBD, serapan aspirasi warga, dan ringkasan regulasi daerah yang disajikan secara transparan dan mudah dipahami.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Kiri: Ilustrasi Tangkai Bunga Sakura Bercahaya Pink */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-[280px] sm:w-[320px] h-[380px] sm:h-[420px] flex items-center justify-center">
                {/* Glowing Pink Backdrop */}
                <div
                  className="absolute inset-0 rounded-full blur-[80px] opacity-45 pointer-events-none"
                  style={{ backgroundColor: info.primaryColor }}
                />

                {/* Sakura Branch Artistic SVG */}
                <svg
                  viewBox="0 0 300 450"
                  className="w-full h-full relative z-10 drop-shadow-[0_10px_35px_rgba(255,77,141,0.5)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Curved Dark Branch */}
                  <path
                    d="M 120 440 C 130 360, 160 300, 180 240 C 200 180, 170 120, 180 30"
                    stroke="#3E1A29"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 165 270 C 140 240, 100 220, 80 190"
                    stroke="#3E1A29"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 175 160 C 210 140, 230 110, 240 80"
                    stroke="#3E1A29"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Sakura Flower Clusters */}
                  {[
                    { cx: 180, cy: 30, r: 24 },
                    { cx: 195, cy: 80, r: 28 },
                    { cx: 155, cy: 110, r: 30 },
                    { cx: 235, cy: 95, r: 25 },
                    { cx: 175, cy: 160, r: 32 },
                    { cx: 90, cy: 185, r: 26 },
                    { cx: 120, cy: 220, r: 28 },
                    { cx: 170, cy: 235, r: 34 },
                    { cx: 200, cy: 275, r: 26 },
                    { cx: 140, cy: 300, r: 30 },
                    { cx: 155, cy: 350, r: 28 },
                  ].map((flw, idx) => (
                    <g key={idx}>
                      <circle cx={flw.cx} cy={flw.cy} r={flw.r} fill="#FFAEC9" opacity="0.9" />
                      <circle cx={flw.cx} cy={flw.cy} r={flw.r * 0.7} fill="#FFFFFF" opacity="0.95" />
                      <circle cx={flw.cx} cy={flw.cy} r={flw.r * 0.28} fill="#FF1493" />
                      <circle cx={flw.cx - flw.r * 0.4} cy={flw.cy - flw.r * 0.3} r={flw.r * 0.45} fill="#FF80AB" opacity="0.8" />
                      <circle cx={flw.cx + flw.r * 0.4} cy={flw.cy - flw.r * 0.3} r={flw.r * 0.45} fill="#FF80AB" opacity="0.8" />
                      <circle cx={flw.cx} cy={flw.cy + flw.r * 0.45} r={flw.r * 0.45} fill="#FF80AB" opacity="0.8" />
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Kanan: Daftar Kartu Infografis Berposter Nyata */}
            <div className="lg:col-span-8 space-y-5">
              {displayInfographics.length === 0 ? (
                <div className="text-center py-16 bg-[#0D1527] rounded-3xl border border-[#1E2B42]">
                  <Layers className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
                  <p className="text-sm text-[#8E9BB0]">Belum ada infografis publik yang diterbitkan saat ini.</p>
                </div>
              ) : (
                displayInfographics.slice(0, 3).map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedInfographic(item)}
                    className="group cursor-pointer bg-[#0D1527] border border-[#1E2B42] rounded-3xl p-5 hover:border-[#FF4D8D]/60 transition-all duration-300 hover:shadow-[0_6px_25px_rgba(255,77,141,0.2)] flex flex-col sm:flex-row items-center gap-5"
                  >
                    {/* Poster Thumbnail */}
                    <div className="relative w-full sm:w-[150px] aspect-[4/5] rounded-2xl overflow-hidden bg-[#070B14] shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="p-2 rounded-full bg-[#FF4D8D] text-white">
                          <Eye className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Keterangan Poster */}
                    <div className="space-y-2 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF4D8D]/15 border border-[#FF4D8D]/30"
                          style={{ color: info.primaryColor }}
                        >
                          {item.badge}
                        </span>
                        <span className="text-[11px] font-mono text-[#64748B]">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-white group-hover:text-[#FF4D8D] transition-colors leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="pt-2">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold"
                          style={{ color: info.primaryColor }}
                        >
                          <span>Perbesar Poster Visual</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          <div className="text-center pt-2">
            <Link
              href={href('/infografis')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-white font-extrabold text-xs tracking-wider transition-all duration-300 shadow-[0_4px_24px_rgba(255,77,141,0.3)] hover:shadow-[0_6px_30px_rgba(255,77,141,0.5)] hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${info.primaryColor}, #FF1493)`,
              }}
            >
              <span>Jelajahi Semua Infografis Parlemen</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ─── MODAL VIEWER INFOGRAFIS ─── */}
      {selectedInfographic && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedInfographic(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#0D1527] border border-[#1E2B42] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2B42]">
              <div>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider font-bold"
                  style={{ color: info.primaryColor }}
                >
                  {selectedInfographic.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                  {selectedInfographic.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInfographic(null)}
                className="p-2 text-[#A0ABC0] hover:text-white rounded-xl hover:bg-[#1E2B42] transition-colors"
                aria-label="Tutup pratinjau"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-2xl bg-black flex items-center justify-center p-2">
              <img
                src={selectedInfographic.imageUrl}
                alt={selectedInfographic.title}
                className="w-full h-auto max-h-[65vh] object-contain rounded-xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              <p className="text-xs text-[#A0ABC0] leading-relaxed max-w-xl">
                {selectedInfographic.summary}
              </p>
              <a
                href={selectedInfographic.imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-xs hover:bg-[#FF2E74] transition-colors shrink-0 shadow-lg"
                style={{ backgroundColor: info.primaryColor }}
              >
                <Download className="w-4 h-4" />
                <span>Unduh Poster</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </LailaSakuraShell>
  );
}
