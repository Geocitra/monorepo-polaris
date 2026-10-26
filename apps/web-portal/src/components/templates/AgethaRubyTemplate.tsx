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
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { AgethaRubyShell } from './agetha-ruby/AgethaRubyShell';
import {
  getAgethaMemberInfo,
  useAgethaHref,
  AGETHA_DEFAULT_ARTICLES,
  AGETHA_DEFAULT_INFOGRAPHICS,
  AGETHA_RUBY,
} from './agetha-ruby/utils';

export interface AgethaRubyTemplateProps {
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

export function AgethaRubyTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  documents = [],
  subdomain,
}: AgethaRubyTemplateProps) {
  const info = getAgethaMemberInfo(member, theme, subdomain);
  const href = useAgethaHref(subdomain);

  // Articles & Infographics fallback
  const articles =
    recentArticles && recentArticles.length > 0
      ? recentArticles.slice(0, 4)
      : AGETHA_DEFAULT_ARTICLES;

  const infographics =
    recentInfographics && recentInfographics.length > 0
      ? recentInfographics.slice(0, 3)
      : AGETHA_DEFAULT_INFOGRAPHICS;

  // Lightbox Modal state for Infographics
  const [activeModal, setActiveModal] = useState<any | null>(null);

  return (
    <AgethaRubyShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="beranda"
    >
      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1: HERO & FOCUS CARDS & STAT METRICS
          (PERSIS REFERENSI GAMBAR: BLACK BACKGROUND, RED ACCENTS)
      ══════════════════════════════════════════════════════════════════ */}

      {/* ─── 1A. HERO SECTION (PERSIS CLOSEUP GAMBAR 2) ─── */}
      <section className="relative min-h-screen flex items-center pt-28 pb-16 lg:py-32 bg-[#0F0F0F] overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Portrait Dewan (Solid dark background, natural standing pose) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[400px] lg:max-w-[440px] aspect-[4/5] rounded-2xl overflow-hidden bg-[#161616] border border-[#262626] shadow-2xl">
                <img
                  src={info.photoUrl}
                  alt={info.officialFullName}
                  className="w-full h-full object-cover object-top filter brightness-[0.95] contrast-[1.05]"
                />
                {/* Subtle dark gradient overlay at the base for seamless integration */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/40 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Right Column: Text & Hero Elements */}
            <div className="lg:col-span-7 space-y-6 lg:pl-4">
              
              {/* Red Subtitle: Hello Im [FirstName] */}
              <div className="inline-block">
                <span className="text-sm lg:text-base font-bold tracking-wide" style={{ color: info.primaryColor }}>
                  Hello Im {info.firstName}
                </span>
              </div>

              {/* Huge Bold Title: Visual Designer style -> Legislator / Official Name */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                {info.officialFullName}
              </h1>

              {/* Subtitle / Role */}
              <p className="text-base lg:text-lg font-semibold" style={{ color: info.primaryColor }}>
                {info.headlineTagline}
              </p>

              {/* Short Bio Paragraph */}
              <p className="text-sm lg:text-base text-[#9CA3AF] max-w-xl leading-relaxed font-normal">
                {info.bio}
              </p>

              {/* Solid Red Button: ABOUT ME (matching reference) */}
              <div className="pt-2">
                <Link
                  href={href('/profil')}
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-md text-white text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: info.primaryColor, boxShadow: `0 10px 25px ${info.primaryColor}40` }}
                >
                  ABOUT ME
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── 1B. 3 FEATURED FOCUS CARDS (PERSIS GAMBAR: 1 MERAH DI TENGAH, 2 GELAP) ─── */}
      <section className="py-12 lg:py-16 bg-[#0F0F0F] border-t border-[#1F1F1F]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: UI Design style -> Pengawasan Anggaran (Dark Card) */}
            <div className="group bg-[#161616] border border-[#262626] rounded-xl p-8 transition-all duration-300 hover:border-[#E50914]/60 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center" style={{ color: info.primaryColor }}>
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#E50914] transition-colors">
                  Pengawasan Anggaran
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Memastikan alokasi belanja daerah dalam APBD tepat sasaran untuk program pembangunan, fasilitas jalan, dan layanan kesehatan masyarakat.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href={href('/artikel')}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-all" style={{ color: info.primaryColor }}
                >
                  <span>KNOW MORE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Product Design style -> HIGHLIGHTED RED CARD DI TENGAH PERSIS GAMBAR */}
            <div className="rounded-xl p-8 shadow-xl flex flex-col justify-between transform md:-translate-y-2" style={{ backgroundColor: info.primaryColor, boxShadow: `0 15px 35px ${info.primaryColor}40` }}>
              <div className="space-y-4 text-white">
                <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Advokasi Kebijakan & Perda
                </h3>
                <p className="text-xs text-white/90 leading-relaxed">
                  Mengawal pembentukan peraturan daerah yang berpihak pada kemakmuran rakyat kecil, perlindungan UMKM, dan kepastian hukum warga.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href={href('/artikel')}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white hover:underline transition-all"
                >
                  <span>KNOW MORE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Branding style -> Pelayanan Konstituen (Dark Card) */}
            <div className="group bg-[#161616] border border-[#262626] rounded-xl p-8 transition-all duration-300 hover:border-[#E50914]/60 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center text-[#E50914]">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#E50914] transition-colors">
                  Pelayanan Konstituen
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Membuka pintu aspirasi secara terbuka melalui posko perwakilan, serap aspirasi reses berkala, dan tindak lanjut laporan warga.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href={href('/kontak')}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E50914] group-hover:translate-x-1 transition-all"
                >
                  <span>KNOW MORE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 1C. STAT METRICS ROW (PERSIS GAMBAR: 12 YEARS EXPERIENCE & 2x2 STATS) ─── */}
      <section className="py-16 bg-[#0F0F0F] border-b border-[#1F1F1F]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Col: Giant Number 15 / 12 + Years Experience */}
            <div className="lg:col-span-4 flex items-center gap-6">
              <span className="text-6xl sm:text-7xl font-black text-[#E50914] tracking-tight leading-none">
                15+
              </span>
              <div>
                <p className="text-base sm:text-lg font-bold text-white leading-tight">
                  Tahun Pengabdian
                </p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Di Parlemen & Kepentingan Rakyat
                </p>
              </div>
            </div>

            {/* Right Col: 2x2 Grid of Key Stats */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8">
              <div className="bg-[#141414] border border-[#222] p-5 rounded-xl">
                <span className="text-3xl font-black text-[#E50914] block">60+</span>
                <span className="text-xs text-[#9CA3AF] mt-1 block">Aspirasi Tuntas</span>
              </div>
              <div className="bg-[#141414] border border-[#222] p-5 rounded-xl">
                <span className="text-3xl font-black text-[#E50914] block">08</span>
                <span className="text-xs text-[#9CA3AF] mt-1 block">Program Prioritas</span>
              </div>
              <div className="bg-[#141414] border border-[#222] p-5 rounded-xl">
                <span className="text-3xl font-black text-[#E50914] block">122+</span>
                <span className="text-xs text-[#9CA3AF] mt-1 block">Sidang Komisi</span>
              </div>
              <div className="bg-[#141414] border border-[#222] p-5 rounded-xl">
                <span className="text-3xl font-black text-[#E50914] block">10</span>
                <span className="text-xs text-[#9CA3AF] mt-1 block">Perda Disahkan</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2: ARTIKEL & FEATURED PROJECTS
          (PERSIS REFERENSI GAMBAR: 2X2 GRID DENGAN GAMBAR VISUAL)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-[#0F0F0F]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          
          {/* Header Row: FEATURED PROJECTS & VIEW ALL button */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                FEATURED ARTICLES
              </h2>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1.5 max-w-lg">
                Publikasi analisis kebijakan, pandangan hukum, dan risalah perjuangan aspirasi rakyat di {info.dapil}.
              </p>
            </div>

            <Link
              href={href('/artikel')}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-[#E50914] hover:bg-[#D32F2F] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
            >
              VIEW ALL
            </Link>
          </div>

          {/* 2x2 Grid of Articles (Persis layout di referensi gambar) */}
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
                  className="group bg-[#161616] border border-[#242424] rounded-2xl overflow-hidden hover:border-[#E50914] transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Article Image Container */}
                  <Link
                    href={href(`/artikel/${slug}`)}
                    className="relative aspect-[16/10] overflow-hidden bg-[#202020] block"
                  >
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#E50914] border border-[#E50914]/30">
                        {cat}
                      </span>
                    </div>
                  </Link>

                  {/* Body Text */}
                  <div className="p-6 lg:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-[#71717A] mb-2 font-medium">
                        <span>{date}</span>
                        <span>•</span>
                        <span>{art.readTime || '4 min baca'}</span>
                      </div>
                      <h3 className="text-lg lg:text-xl font-bold text-white group-hover:text-[#E50914] transition-colors line-clamp-2 leading-snug">
                        <Link href={href(`/artikel/${slug}`)}>{title}</Link>
                      </h3>
                      {art.excerpt && (
                        <p className="text-xs text-[#9CA3AF] mt-2 line-clamp-2 leading-relaxed">
                          {art.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-6 mt-4 border-t border-[#222]">
                      <Link
                        href={href(`/artikel/${slug}`)}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E50914] group-hover:translate-x-1.5 transition-transform"
                      >
                        <span>KNOW MORE</span>
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
          SECTION 3: INFOGRAFIS & PRE-FOOTER CTA BANNER
          (PERSIS REFERENSI GAMBAR: LET'S WORK TOGETHER ON YOUR NEXT PROJECT)
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#0A0A0A] border-t border-[#1C1C1C]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          
          {/* Header Row Infografis */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#E50914] block mb-1">
                Transparansi & Data
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                INFOGRAFIS AKUNTABILITAS
              </h2>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1 max-w-lg">
                Rekapitulasi visual data pengawasan anggaran, realisasi program pokir, dan jadwal sidang parlemen.
              </p>
            </div>

            <Link
              href={href('/infografis')}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-md border border-[#333] hover:border-[#E50914] text-[#E5E7EB] hover:text-[#E50914] text-xs font-bold uppercase tracking-wider transition-colors self-start sm:self-auto"
            >
              SEMUA INFOGRAFIS
            </Link>
          </div>

          {/* Grid of Infographics with Lightbox modal trigger */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {infographics.map((item: any, idx: number) => {
              const img = getInfoImg(item);
              const title = item.title;
              const cat = getInfoCat(item);

              return (
                <div
                  key={item.id || idx}
                  className="group bg-[#141414] border border-[#242424] rounded-2xl overflow-hidden hover:border-[#E50914] transition-all flex flex-col justify-between"
                >
                  <div
                    onClick={() => setActiveModal(item)}
                    className="relative aspect-[4/5] overflow-hidden bg-[#1E1E1E] cursor-pointer"
                  >
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded bg-black/80 text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">
                        {cat}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4
                        onClick={() => setActiveModal(item)}
                        className="text-sm font-bold text-white group-hover:text-[#E50914] transition-colors cursor-pointer line-clamp-2"
                      >
                        {title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-[#9CA3AF] mt-1.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#222] flex items-center justify-between">
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

          {/* ─── PRE-FOOTER CTA CARD (PERSIS REFERENSI GAMBAR: "Let's work together on your next project") ─── */}
          <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-2xl">
            <div className="max-w-2xl space-y-3">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Mari Bersama Mengawal Aspirasi & Pembangunan Daerah
              </h3>
              <p className="text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                Pintu komunikasi dan ruang audiensi terbuka lebar bagi seluruh elemen masyarakat, pemuda, dan kelompok tani di {info.dapil}.
              </p>
            </div>

            <Link
              href={href('/kontak')}
              className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-[#E50914] hover:bg-[#D32F2F] text-white text-xs font-bold uppercase tracking-widest shadow-xl shadow-[#E50914]/25 hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              CONTACT
            </Link>
          </div>

        </div>
      </section>

      {/* ─── LIGHTBOX MODAL UNTUK INFOGRAFIS ─── */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#161616] border border-[#333] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-4 px-6 border-b border-[#2A2A2A] flex items-center justify-between bg-[#121212]">
              <div>
                <span className="text-[10px] font-bold text-[#E50914] uppercase tracking-wider">
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
                  className="p-2 rounded-lg bg-[#222] text-[#E50914] hover:bg-[#2A2A2A] transition-colors"
                  title="Unduh / Buka Gambar Penuh"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-lg bg-[#222] text-[#9CA3AF] hover:text-white hover:bg-[#2A2A2A] transition-colors"
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
    </AgethaRubyShell>
  );
}
