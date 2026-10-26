'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Calendar,
  Sparkles,
  Scale,
  ShieldCheck,
  Layers,
  Users,
  Eye,
  X,
  Menu,
  ExternalLink,
  Instagram,
} from 'lucide-react';
import { AnivioxEmeraldShell } from './aniviox-emerald/AnivioxEmeraldShell';
import {
  getAnivioxMemberInfo,
  useAnivioxHref,
  ANIVIOX_DEFAULT_ARTICLES,
  ANIVIOX_DEFAULT_INFOGRAPHICS,
  ANIVIOX_EMERALD,
} from './aniviox-emerald/utils';

interface AnivioxEmeraldTemplateProps {
  member: any;
  theme: any;
  recentArticles?: any[];
  recentInfographics?: any[];
  documents?: any[];
  subdomain?: string;
}

export function AnivioxEmeraldTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: AnivioxEmeraldTemplateProps) {
  const info = getAnivioxMemberInfo(member, theme, subdomain);
  const href = useAnivioxHref(subdomain);
  const [selectedInfographic, setSelectedInfographic] = useState<any | null>(null);
  const [heroMobileMenuOpen, setHeroMobileMenuOpen] = useState(false);

  // Normalize articles from REAL API (no dummy fallback)
  const displayArticles =
    recentArticles && recentArticles.length > 0
      ? recentArticles.map((a: any, i: number) => ({
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
    recentInfographics && recentInfographics.length > 0
      ? recentInfographics.map((inf: any, i: number) => ({
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

  const navLinks = [
    { label: 'Beranda', path: '/' },
    { label: 'Profil', path: '/profil' },
    { label: 'Artikel', path: '/artikel' },
    { label: 'Infografis', path: '/infografis' },
    { label: 'Kontak', path: '/kontak' },
  ];

  return (
    <AnivioxEmeraldShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="beranda"
      customHeader={true}
    >
      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1: HERO CONTAINER (PERSIS REFERENSI GAMBAR: ANIVIOX EMERALD)
          - TAMPIL PENUH 100% SATU HALAMAN VIEWPORT (h-screen / 100dvh)
          - Header Navigasi Menyatu di Bagian Atas Kartu Hero (Aniviox + Nav + Pill CTA)
          - Sisi Kiri: Hey, We're + Tipografi Raksasa Bertumpuk 3 Baris Putih Tegas
          - Tengah: Foto Potret Dewan dengan Glowing Emerald Aura
          - Sisi Kanan: Statement "Mengawal aspirasi nyata..." + Paragraf Strategi
          - Bawah Kartu Hijau: 4 Pilar Bernomor (#01 - #04)
          - Bar Terpercaya di Dasar Kartu: Logo Kemitraan Parlemen
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen lg:h-screen lg:max-h-[100dvh] p-2 sm:p-4 lg:p-5 pb-0 bg-[#060A08] flex flex-col justify-between overflow-hidden">
        
        {/* Giant Architectural Rounded Hero Card Shell */}
        <div className="relative w-full max-w-[1400px] mx-auto h-full flex flex-col justify-between rounded-3xl sm:rounded-[40px] lg:rounded-[48px] bg-gradient-to-b from-[#0A291A] via-[#071B11] to-[#05110B] border border-[#143B25] shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden">
          
          {/* Ambient Emerald Radial Glow Spotlights */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-[750px] h-[450px] rounded-full blur-[140px] pointer-events-none opacity-30"
            style={{ backgroundColor: info.primaryColor }}
          />
          <div
            className="absolute top-0 right-1/4 w-[400px] h-[350px] rounded-full blur-[120px] pointer-events-none opacity-20"
            style={{ backgroundColor: info.primaryColor }}
          />

          {/* ─── 1A. INTEGRATED HERO HEADER (PERSIS "Aniviox" + NAV LINKS + PILL BUTTON DI GAMBAR) ─── */}
          <header className="shrink-0 px-6 sm:px-10 lg:px-14 py-4 lg:py-5 flex items-center justify-between relative z-30">
            {/* Logo / Brand Name */}
            <Link
              href={href('/')}
              className="flex items-center gap-3 group transition-transform hover:scale-[1.02]"
            >
              <span className="font-extrabold text-xl sm:text-2xl text-white tracking-tight group-hover:text-[#00F076] transition-colors">
                {info.firstName || 'Aniviox'}
              </span>
              <span
                className="text-[10px] font-mono tracking-[0.22em] uppercase font-bold px-2.5 py-0.5 rounded-full border"
                style={{
                  color: info.primaryColor,
                  backgroundColor: `${info.primaryColor}1F`,
                  borderColor: `${info.primaryColor}4D`,
                }}
              >
                POLARIS
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  href={href(item.path)}
                  className={`text-sm font-medium transition-colors duration-200 relative py-1 ${
                    item.path === '/'
                      ? 'text-[#00F076] font-semibold'
                      : 'text-[#C5D5CC] hover:text-white'
                  }`}
                >
                  {item.label}
                  {item.path === '/' && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full shadow-[0_0_8px_#00F076]"
                      style={{ backgroundColor: info.primaryColor }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Action: Instagram Pill Button */}
            <div className="hidden sm:flex items-center gap-4">
              <a
                href={info.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 pl-5 pr-2.5 py-2 rounded-full bg-white hover:bg-[#00F076] text-[#05120B] font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-lg hover:shadow-[0_0_24px_rgba(0,240,118,0.4)] group"
              >
                <span>Instagram</span>
                <div className="w-7 h-7 rounded-full bg-[#00F076] group-hover:bg-black text-black group-hover:text-[#00F076] flex items-center justify-center transition-colors">
                  <Instagram className="w-3.5 h-3.5" />
                </div>
              </a>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setHeroMobileMenuOpen(!heroMobileMenuOpen)}
              className="md:hidden p-2 text-white/90 hover:text-white rounded-lg bg-[#0C1A12] border border-[#173825]"
              aria-label="Toggle Menu"
            >
              {heroMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {/* Mobile Navigation Dropdown */}
          {heroMobileMenuOpen && (
            <div className="md:hidden absolute top-20 inset-x-4 z-40 bg-[#081710]/95 backdrop-blur-xl border border-[#173825] rounded-2xl p-5 shadow-2xl space-y-3">
              <nav className="flex flex-col space-y-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.path}
                    href={href(item.path)}
                    onClick={() => setHeroMobileMenuOpen(false)}
                    className="text-sm font-semibold py-2 px-3 rounded-lg text-[#C5D5CC] hover:bg-[#0F291C] hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="pt-3 border-t border-[#173825]">
                <a
                  href={info.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setHeroMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#00F076] text-black font-bold text-xs shadow-md"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram Resmi Dewan</span>
                </a>
              </div>
            </div>
          )}

          {/* ─── 1B. MAIN HERO CONTENT AREA (3-COLUMN BALANCED COMPOSITION) ─── */}
          <div className="flex-1 min-h-0 px-6 sm:px-10 lg:px-14 flex items-center relative z-20 py-2 sm:py-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-end w-full h-full">
              
              {/* SISI KIRI: Hey, We're + Giant Bold Stacked Title (Persis "Digital Marketing Experts" di Gambar) */}
              <div className="lg:col-span-4 flex flex-col justify-center space-y-2.5 lg:space-y-3 pb-2 text-left">
                <p className="text-xs sm:text-sm font-medium text-[#A7F3D0] tracking-wide">
                  Hey, Kami Siap Mengabdi
                </p>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] xl:text-[76px] font-black tracking-tight text-white leading-[0.93]">
                  Wakil <br />
                  <span style={{ color: info.primaryColor }}>Rakyat</span> <br />
                  Berdampak.
                </h1>

                <p className="text-xs text-[#8BA496] max-w-xs leading-relaxed pt-0.5">
                  {info.headlineTagline}
                </p>
              </div>

              {/* TENGAH: Foto Dewan Berdiri Menyatu dengan Ambient Emerald (Kokoh di Atas Dasar) */}
              <div className="lg:col-span-4 flex items-end justify-center h-full relative">
                <div className="relative w-[260px] sm:w-[320px] md:w-[360px] lg:w-[400px] xl:w-[430px] h-[260px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[430px] flex items-end justify-center">
                  
                  {/* Glowing Emerald Aura Behind Silhouette */}
                  <div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[280px] sm:w-[340px] h-[280px] sm:h-[340px] rounded-full blur-[70px] pointer-events-none opacity-40"
                    style={{ backgroundColor: info.primaryColor }}
                  />

                  <img
                    src={info.photoUrl || '/images/aniviox-hero-portrait.jpg'}
                    alt={info.officialFullName}
                    className="w-full h-full object-contain object-bottom relative z-10 filter brightness-105 contrast-105"
                    style={{
                      maskImage:
                        'linear-gradient(to bottom, #000 78%, rgba(0,0,0,0.8) 90%, transparent 100%)',
                      WebkitMaskImage:
                        'linear-gradient(to bottom, #000 78%, rgba(0,0,0,0.8) 90%, transparent 100%)',
                    }}
                  />
                </div>
              </div>

              {/* SISI KANAN: Statement (Persis "We turn attention into action." di Gambar) */}
              <div className="lg:col-span-4 flex flex-col justify-center space-y-3 lg:pl-6 pb-2 text-left">
                <h2 className="text-xl sm:text-2xl lg:text-[30px] font-bold text-white tracking-tight leading-snug">
                  Mengawal aspirasi nyata menjadi aksi kebijakan.
                </h2>
                <p className="text-xs sm:text-sm text-[#9BB2A5] leading-relaxed max-w-sm">
                  Strategi terukur dan advokasi berbasis data untuk mengawal kebijakan daerah, memperkuat transparansi APBD, dan memberi manfaat berkelanjutan bagi seluruh warga.
                </p>
                <div className="pt-1">
                  <Link
                    href={href('/profil')}
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider hover:text-white transition-colors group"
                    style={{ color: info.primaryColor }}
                  >
                    <span>Kenali Rekam Jejak Dewan</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* ─── 1C. EMPAT PILAR (PERSIS #01, #02, #03, #04 DI GAMBAR) ─── */}
          <div className="shrink-0 px-6 sm:px-10 lg:px-14 py-3 sm:py-3.5 border-t border-[#143B25]/80 bg-[#06180F]/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="space-y-0.5">
                <span
                  className="text-xs font-mono font-extrabold block"
                  style={{ color: info.primaryColor }}
                >
                  #01
                </span>
                <p className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate">
                  Advokasi Kebijakan
                </p>
              </div>

              <div className="space-y-0.5">
                <span
                  className="text-xs font-mono font-extrabold block"
                  style={{ color: info.primaryColor }}
                >
                  #02
                </span>
                <p className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate">
                  Aspirasi Warga Dapil
                </p>
              </div>

              <div className="space-y-0.5">
                <span
                  className="text-xs font-mono font-extrabold block"
                  style={{ color: info.primaryColor }}
                >
                  #03
                </span>
                <p className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate">
                  Pengawasan APBD
                </p>
              </div>

              <div className="space-y-0.5">
                <span
                  className="text-xs font-mono font-extrabold block"
                  style={{ color: info.primaryColor }}
                >
                  #04
                </span>
                <p className="text-xs sm:text-sm font-semibold text-white tracking-wide truncate">
                  Legislasi Berkelanjutan
                </p>
              </div>

            </div>
          </div>

          {/* ─── 1D. BRAND PARTNER STRIP DI DASAR HERO CARD (PERSIS DI GAMBAR) ─── */}
          <div className="shrink-0 w-full bg-[#050C08] border-t border-[#122419] py-3 sm:py-3.5 px-6 sm:px-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#688073] shrink-0 font-semibold">
                Kemitraan & Ruang Kerja Parlemen Resmi
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-9 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 font-black tracking-widest text-[11px] uppercase text-white">
                  <Scale className="w-3.5 h-3.5 text-[#00F076]" />
                  <span>PARLEMEN DAERAH</span>
                </div>
                <div className="flex items-center gap-2 font-black tracking-widest text-[11px] uppercase text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00F076]" />
                  <span>KOMISI LEGISLASI</span>
                </div>
                <div className="flex items-center gap-2 font-black tracking-widest text-[11px] uppercase text-white">
                  <Layers className="w-3.5 h-3.5 text-[#00F076]" />
                  <span>BAPEMPERDA</span>
                </div>
                <div className="flex items-center gap-2 font-black tracking-widest text-[11px] uppercase text-white">
                  <Users className="w-3.5 h-3.5 text-[#00F076]" />
                  <span>RUMAH ASPIRASI</span>
                </div>
                <div className="flex items-center gap-2 font-black tracking-widest text-[11px] uppercase text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#00F076]" />
                  <span>POLARIS CIVIC</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2: ARTIKEL (PERSIS SECTION "Our Approach" DI GAMBAR ANIVIOX)
          - Left: "Our Approach" Green Tag + Giant Bold Stacked Title
          - Right: Explanatory text + Pill Button "Get in touch ->" / "Lihat Semua Artikel"
          - Article Grid showing images clearly, category, date, title, excerpt
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-[#060A08]">
        <div className="max-w-[1340px] mx-auto px-6 lg:px-12">
          
          {/* Header Section (Persis Layout Gambar Aniviox Bawah) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end pb-14 border-b border-[#14241B]">
            
            {/* Left: Tag + Headline */}
            <div className="lg:col-span-7 space-y-3">
              <span
                className="text-xs font-mono font-bold uppercase tracking-[0.25em] block"
                style={{ color: info.primaryColor }}
              >
                Publikasi & Risalah
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.06]">
                Gagasan Kritis <br />
                Solusi Nyata <br />
                Perubahan Bermakna
              </h2>
            </div>

            {/* Right: Explanatory text + Pill Action Button */}
            <div className="lg:col-span-5 space-y-5 lg:pl-6">
              <p className="text-xs sm:text-sm text-[#A3B8AD] leading-relaxed">
                Kami menghadirkan tulisan kebijakan, analisis anggaran daerah, dan risalah advokasi publik yang dapat diakses terbuka oleh seluruh konstituen dan publik secara transparan.
              </p>

              <div>
                <Link
                  href={href('/artikel')}
                  className="inline-flex items-center gap-3 pl-6 pr-2.5 py-2.5 rounded-full bg-[#00F076] hover:bg-white text-black font-bold text-xs tracking-wide transition-all duration-300 shadow-lg hover:shadow-[0_0_24px_rgba(0,240,118,0.4)] group"
                >
                  <span>Lihat Semua Artikel</span>
                  <div className="w-7 h-7 rounded-full bg-black text-[#00F076] group-hover:text-black group-hover:bg-white flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>

          </div>

          {/* Grid Artikel Menampilkan Gambar Artikel Lengkap & Jelas */}
          {displayArticles.length === 0 ? (
            <div className="pt-12 text-center py-16 bg-[#0B1410] rounded-3xl border border-[#14241B]">
              <p className="text-sm text-[#A3B8AD]">Belum ada artikel resmi yang dipublikasikan saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
              {displayArticles.slice(0, 4).map((art: any) => (
                <article
                  key={art.id}
                  className="group flex flex-col bg-[#0B1410] border border-[#14241B] rounded-2xl sm:rounded-3xl overflow-hidden hover:border-[#00F076]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00F076]/10"
                >
                  {/* Gambar Artikel Nyata & Jelas */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#070D09]">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className="px-3 py-1 rounded-full bg-[#060A08]/85 backdrop-blur-md border border-[#14241B] text-[10px] font-mono font-bold"
                        style={{ color: info.primaryColor }}
                      >
                        {art.category}
                      </span>
                    </div>
                  </div>

                  {/* Konten Artikel */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#688073]">
                        <Calendar className="w-3 h-3 text-[#00F076]" />
                        <span>{art.date}</span>
                      </div>

                      <h3 className="font-bold text-sm text-white group-hover:text-[#00F076] transition-colors leading-snug line-clamp-2">
                        {art.title}
                      </h3>

                      <p className="text-xs text-[#A3B8AD] line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#14241B]">
                      <Link
                        href={href(`/artikel/${art.slug}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold hover:text-white transition-colors"
                        style={{ color: info.primaryColor }}
                      >
                        <span>Baca Naskah</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3: INFOGRAFIS (POSTER VISUAL MENAMPILKAN GAMBAR INFOGRAFIS)
          - Galeri poster infografis data publik
          - Modal perbesar poster interaktif
          - Diikuti oleh Footer resmi yang terintegrasi
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-[#080E0B] border-t border-[#14241B]">
        <div className="max-w-[1340px] mx-auto px-6 lg:px-12">
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
            <div>
              <span
                className="text-xs font-mono font-bold uppercase tracking-[0.25em] block mb-2"
                style={{ color: info.primaryColor }}
              >
                Visual Kebijakan & Transparansi Data
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Galeri Infografis Parlemen
              </h2>
            </div>

            <Link
              href={href('/infografis')}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider hover:text-white transition-colors group"
              style={{ color: info.primaryColor }}
            >
              <span>Jelajahi Semua Infografis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Grid Infografis Menampilkan Gambar Poster Lengkap */}
          {displayInfographics.length === 0 ? (
            <div className="text-center py-16 bg-[#0C1510] rounded-3xl border border-[#15241C]">
              <p className="text-sm text-[#A3B8AD]">Belum ada infografis publik yang diterbitkan saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayInfographics.slice(0, 4).map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedInfographic(item)}
                  className="group cursor-pointer bg-[#0C1510] border border-[#15241C] rounded-2xl overflow-hidden hover:border-[#00F076]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00F076]/10 flex flex-col"
                >
                  {/* Poster Gambar Infografis */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#070D09]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-105"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-black font-bold text-xs shadow-xl"
                        style={{ backgroundColor: info.primaryColor }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Perbesar Poster
                      </span>
                    </div>

                    <div className="absolute top-3 left-3">
                      <span
                        className="px-2.5 py-1 rounded-full bg-[#060A08]/90 backdrop-blur-md border border-[#14241B] text-[10px] font-mono font-bold"
                        style={{ color: info.primaryColor }}
                      >
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  {/* Deskripsi Singkat */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#00F076] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#688073] mt-2 line-clamp-2">
                      {item.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ─── MODAL VIEWER INFOGRAFIS ─── */}
      {selectedInfographic && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedInfographic(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#0C1510] border border-[#15241C] rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#15241C]">
              <div>
                <span className="text-[10px] font-mono text-[#00F076] uppercase tracking-wider font-bold">
                  {selectedInfographic.badge}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {selectedInfographic.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInfographic(null)}
                className="p-2 text-[#A3B8AD] hover:text-white rounded-lg hover:bg-[#14241B] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-xl bg-black flex items-center justify-center">
              <img
                src={selectedInfographic.imageUrl}
                alt={selectedInfographic.title}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>

            <p className="text-xs text-[#A3B8AD] leading-relaxed">
              {selectedInfographic.summary}
            </p>
          </div>
        </div>
      )}

    </AnivioxEmeraldShell>
  );
}
