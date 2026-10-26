'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  BookOpen,
  BarChart3,
  Users,
  Eye,
  X,
  Download,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  Tag,
  Layers,
  Heart,
  Award,
  Compass,
} from 'lucide-react';
import { NexoraVioletShell } from './nexora-violet/NexoraVioletShell';
import {
  getNexoraMemberInfo,
  useNexoraHref,
  NEXORA_THEME,
} from './nexora-violet/utils';

interface NexoraVioletTemplateProps {
  member: any;
  theme: any;
  articles?: any[];
  infographics?: any[];
  recentArticles?: any[];
  recentInfographics?: any[];
  subdomain?: string;
}

export function NexoraVioletTemplate({
  member,
  theme,
  articles,
  infographics,
  recentArticles,
  recentInfographics,
  subdomain,
}: NexoraVioletTemplateProps) {
  const info = getNexoraMemberInfo(member, theme, subdomain);
  const href = useNexoraHref(subdomain);

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
                dateStyle: 'medium',
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
          category: inf.category || inf.categoryName || 'Visual Data',
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
              : 'Visualisasi data anggaran dan kebijakan publik.'),
        }))
      : [];

  const [selectedInfographic, setSelectedInfographic] = useState<any | null>(null);

  return (
    <NexoraVioletShell member={member} theme={theme} subdomain={subdomain} activePage="beranda">
      
      {/* =================================================================== */}
      {/* SECTION 1: FULL SCREEN HERO (100VH ON FIRST OPEN)                   */}
      {/* =================================================================== */}
      <section className="min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] lg:max-h-[100dvh] p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-hidden">
        
        {/* Massive Split Headlines (Matching Exact Layout in Reference Image) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pb-4 pt-1 sm:pt-2">
          
          {/* Top Left Headline: "Define Your" (Italic Serif) + "STYLE" (Massive Purple) */}
          <div className="space-y-0">
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-serif italic text-slate-900 tracking-tight">
              Define Your
            </span>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-[#7B61FF] tracking-tight leading-none uppercase select-none">
              STYLE
            </h1>
          </div>

          {/* Top Right Headline: "Own Your" (Italic Serif) ✦ + "WORLD" (Massive Purple) */}
          <div className="space-y-0 md:text-right">
            <div className="inline-flex items-center gap-2 md:justify-end">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-serif italic text-slate-900 tracking-tight">
                Own Your
              </span>
              <span className="text-2xl sm:text-3xl text-[#7B61FF]">✦</span>
            </div>
            <div className="text-5xl sm:text-7xl lg:text-8xl font-black text-[#7B61FF] tracking-tight leading-none uppercase select-none">
              WORLD
            </div>
          </div>
        </div>

        {/* Central Rounded Purple Hero Card (Exact Nexora Purple Canvas Layout) */}
        <div className="relative flex-1 rounded-[28px] sm:rounded-[36px] bg-[#8262FE] overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between p-6 sm:p-8 lg:p-12 min-h-[460px]">
          
          {/* Concentric Organic Wave Background Overlay (SVG) */}
          <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1000 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="500" cy="300" rx="420" ry="240" stroke="white" strokeWidth="60" strokeDasharray="30 20" />
              <ellipse cx="500" cy="300" rx="320" ry="180" stroke="white" strokeWidth="40" />
              <ellipse cx="500" cy="300" rx="200" ry="120" stroke="white" strokeWidth="30" />
            </svg>
          </div>

          {/* Left Column inside Purple Card: Headline, Description, Button, Social Proof */}
          <div className="relative z-10 w-full lg:w-5/12 space-y-5 text-white flex flex-col justify-between h-full py-2">
            <div className="space-y-4">
              {/* Badge (✦ New Collection -> ✦ Mandat & Visi Baru) */}
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 tracking-wider">
                <span>✦</span>
                <span>Mandat & Visi Pengabdian</span>
              </div>

              {/* Main Headline (Where Comfort Meets Confidence -> Integritas Mengabdi, Membawa Perubahan) */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                Where Integrity Meets Dedication
              </h2>

              {/* Description (Elevate your everyday look with pieces that speak you) */}
              <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed max-w-sm">
                Mendorong akselerasi ekonomi kerakyatan, memastikan transparansi anggaran perimbangan, dan mengawal aspirasi masyarakat Daerah Pemilihan {info.dapil}.
              </p>

              {/* Action Button (Explore Now ->) */}
              <div className="pt-1">
                <Link
                  href={href('/artikel')}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold transition-transform hover:scale-105 shadow-xl group"
                >
                  <span>Explore Now</span>
                  <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Social Proof Pill (Loved by 20K+ Trendsetters ♥) */}
            <div className="pt-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-md">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-purple-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/ref-article-1.jpg"
                      alt="Avatar 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-purple-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/ref-article-2.jpg"
                      alt="Avatar 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-purple-400">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/ref-article-3.jpg"
                      alt="Avatar 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-white tracking-wide">
                  Loved by 20K+ Konstituen ♥
                </span>
              </div>
            </div>
          </div>

          {/* Center Column: Charismatic Character / Hero Portrait */}
          <div className="relative z-10 w-full lg:w-4/12 flex items-center justify-center py-4 lg:py-0">
            <div className="relative w-64 sm:w-72 lg:w-80 aspect-[3/4] max-h-[380px] lg:max-h-[440px] flex items-end justify-center">
              
              {/* Back Graphic Stamp matching the "NEXORA" shirt print in image */}
              <div className="absolute top-8 w-44 h-44 rounded-full bg-white/15 backdrop-blur-sm flex flex-col items-center justify-center text-center p-3 border border-white/25 pointer-events-none">
                <div className="text-xl font-black text-white tracking-widest uppercase">
                  NEXORA
                </div>
                <div className="text-[9px] font-mono tracking-widest text-purple-200 uppercase mt-0.5">
                  BE YOU. DO YOU. FOR YOU.
                </div>
                <div className="text-xs text-white mt-1">✦ ✦ ✦</div>
              </div>

              {/* Main Portrait */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={info.avatar}
                alt={info.fullName}
                className="relative z-10 w-full h-full object-cover object-top drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] rounded-2xl"
              />
            </div>
          </div>

          {/* Right Column: 3 Feature Badges & Featured Look / Focus Card */}
          <div className="relative z-10 w-full lg:w-3/12 space-y-6 flex flex-col justify-between items-end h-full py-2">
            
            {/* Top 3 Horizontal Badges (Premium Quality, Sustainable Fashion, Limited Edition) */}
            <div className="flex items-center justify-end gap-4 text-center">
              <div className="flex flex-col items-center gap-1 text-white">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div className="text-[10px] font-bold leading-tight">
                  Integritas
                  <br />
                  <span className="text-purple-200 font-normal">Parlemen</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 text-white">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-white" />
                </div>
                <div className="text-[10px] font-bold leading-tight">
                  Kebijakan
                  <br />
                  <span className="text-purple-200 font-normal">Transparan</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 text-white">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div className="text-[10px] font-bold leading-tight">
                  Dedikasi
                  <br />
                  <span className="text-purple-200 font-normal">Penuh</span>
                </div>
              </div>
            </div>

            {/* Featured Look / Focus Card (White Floating Card matching the image) */}
            {displayArticles.length > 0 && (
              <div className="w-full sm:w-56 space-y-2">
                <div className="text-xs font-semibold text-purple-200 text-right pr-1">
                  Featured Focus
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-2xl text-slate-900 border border-purple-100">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-purple-50 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayArticles[0].imageUrl}
                      alt={displayArticles[0].title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="text-xs font-black text-slate-900 line-clamp-1">
                    {displayArticles[0].title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mb-3">
                    {displayArticles[0].category}
                  </div>
                  <Link
                    href={href(`/artikel/${displayArticles[0].slug}`)}
                    className="w-full py-2 rounded-xl bg-[#7048E8] hover:bg-[#5F3DC4] text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Baca Telaah ↗</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 2: ARTIKEL & REKAM JEJAK KEBIJAKAN                          */}
      {/* =================================================================== */}
      <section className="px-6 sm:px-10 lg:px-12 py-16 sm:py-20 border-t border-purple-100/80 bg-gradient-to-b from-white to-purple-50/40">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Section Header in Nexora Style */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-serif italic text-slate-800 tracking-tight">
                Gagasan Kebijakan
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#7B61FF] tracking-tight leading-none uppercase">
                ARTIKEL PUBLIKASI
              </h2>
            </div>
            <Link
              href={href('/artikel')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#7048E8] hover:text-[#5F3DC4] group"
            >
              <span>Lihat Semua Artikel</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 3-Column Articles Grid with REAL COVER IMAGES */}
          {displayArticles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-purple-100 p-8 shadow-sm">
              <BookOpen className="w-10 h-10 text-purple-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Belum ada artikel resmi yang dipublikasikan saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {displayArticles.slice(0, 3).map((article: any, idx: number) => (
                <article
                  key={article.id || `art-${idx}`}
                  className="group bg-white rounded-3xl p-4 border border-purple-100/90 shadow-[0_10px_30px_-10px_rgba(112,72,232,0.08)] hover:shadow-[0_20px_40px_-10px_rgba(112,72,232,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Real Article Cover Image */}
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-purple-50 mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-[#7048E8] shadow-sm">
                        {article.category}
                      </div>
                    </div>

                    {/* Meta Tags */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>{article.date}</span>
                      </span>
                    </div>

                    {/* Title & Excerpt */}
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#7048E8] transition-colors leading-snug line-clamp-2 mb-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Read Button */}
                  <div className="pt-4 mt-4 border-t border-purple-50">
                    <Link
                      href={href(`/artikel/${article.slug}`)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#7048E8] group-hover:text-[#5F3DC4] transition"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 3: INFOGRAFIS KINERJA & AKUNTABILITAS (MODAL LIGHTBOX)       */}
      {/* =================================================================== */}
      <section className="px-6 sm:px-10 lg:px-12 py-16 sm:py-20 border-t border-purple-100/80 bg-white">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-serif italic text-slate-800 tracking-tight">
                Visual Data & Akuntabilitas
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#7B61FF] tracking-tight leading-none uppercase">
                INFOGRAFIS KINERJA
              </h2>
            </div>
            <Link
              href={href('/infografis')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#7048E8] hover:text-[#5F3DC4] group"
            >
              <span>Lihat Semua Galeri Infografis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 3-Column Infographics Grid with REAL POSTER IMAGES */}
          {displayInfographics.length === 0 ? (
            <div className="text-center py-16 bg-purple-50/50 rounded-3xl border border-purple-100 p-8 shadow-sm">
              <Layers className="w-10 h-10 text-purple-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Belum ada infografis publik yang diterbitkan saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {displayInfographics.slice(0, 3).map((infoItem, idx) => (
                <div
                  key={infoItem.id || `info-${idx}`}
                  className="group bg-purple-50/50 rounded-3xl p-4 border border-purple-100 hover:border-[#7048E8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Real Infographic Image Preview */}
                    <div
                      onClick={() => setSelectedInfographic(infoItem)}
                      className="cursor-pointer relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 mb-4 group/img shadow-md"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={infoItem.imageUrl}
                        alt={infoItem.title}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                        <div className="p-3 rounded-full bg-white/20 backdrop-blur-md">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-bold tracking-wide">Lihat Ukuran Penuh</span>
                      </div>

                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-[#7048E8] shadow-sm">
                        {infoItem.category}
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">
                      {infoItem.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {infoItem.summary}
                    </p>
                  </div>

                  {/* Preview CTA */}
                  <div className="pt-3 mt-3 border-t border-purple-100/80 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#7048E8]">
                      {infoItem.badge}
                    </span>
                    <button
                      onClick={() => setSelectedInfographic(infoItem)}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#7048E8] hover:text-[#5F3DC4]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Perbesar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =================================================================== */}
      {/* INTERACTIVE LIGHTBOX MODAL FOR INFOGRAPHIC                          */}
      {/* =================================================================== */}
      {selectedInfographic && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-purple-50/60">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {selectedInfographic.title}
                </h3>
                <span className="text-xs font-bold text-[#7048E8]">
                  {selectedInfographic.category || 'Visual Data Kebijakan'}
                </span>
              </div>
              <button
                onClick={() => setSelectedInfographic(null)}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  selectedInfographic.imageUrl ||
                  selectedInfographic.fileUrl ||
                  '/images/showcase-infografis-apbd.jpg'
                }
                alt={selectedInfographic.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="p-4 sm:p-6 bg-white border-t border-purple-100 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-600 line-clamp-2">
                {selectedInfographic.summary || selectedInfographic.description}
              </p>
              <a
                href={
                  selectedInfographic.imageUrl ||
                  selectedInfographic.fileUrl ||
                  '/images/showcase-infografis-apbd.jpg'
                }
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7048E8] hover:bg-[#5F3DC4] text-white text-xs font-bold transition shrink-0 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </NexoraVioletShell>
  );
}
