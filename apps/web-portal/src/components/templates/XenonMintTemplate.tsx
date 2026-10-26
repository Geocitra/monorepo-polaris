'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
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
  CheckCircle2,
  Award,
  Sparkles,
  TrendingUp,
  Layers,
  ArrowUpRight,
  Play,
  Star,
} from 'lucide-react';
import { XenonMintShell } from './xenon-mint/XenonMintShell';
import {
  getXenonMemberInfo,
  useXenonHref,
  XENON_THEME,
} from './xenon-mint/utils';

interface XenonMintTemplateProps {
  member: any;
  theme: any;
  articles?: any[];
  infographics?: any[];
  recentArticles?: any[];
  recentInfographics?: any[];
  subdomain?: string;
}

export function XenonMintTemplate({
  member,
  theme,
  articles,
  infographics,
  recentArticles,
  recentInfographics,
  subdomain,
}: XenonMintTemplateProps) {
  const info = getXenonMemberInfo(member, theme, subdomain);
  const href = useXenonHref(subdomain);

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
              : 'Visualisasi data anggaran dan serapan program nyata masyarakat.'),
        }))
      : [];

  const [selectedInfographic, setSelectedInfographic] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const articleCategories = [
    'ALL',
    ...Array.from(
      new Set(
        displayArticles
          .map((a: any) => a.category)
          .filter(Boolean)
      )
    ),
  ];

  const filteredArticles = displayArticles.filter((art: any) => {
    if (selectedCategory === 'ALL') return true;
    return art.category === selectedCategory;
  });

  const featuredArticle = filteredArticles[0] || displayArticles[0];
  const secondaryArticles = filteredArticles.filter((a) => a.slug !== featuredArticle?.slug).slice(0, 3);

  return (
    <XenonMintShell member={member} theme={theme} subdomain={subdomain} activePage="beranda">
      
      {/* =================================================================== */}
      {/* SECTION 1: FULLSCREEN HERO (100VH ON FIRST OPEN)                   */}
      {/* =================================================================== */}
      <section className="relative min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] lg:max-h-[100dvh] bg-[#081018] rounded-b-[40px] sm:rounded-b-[56px] lg:rounded-b-[72px] overflow-hidden flex flex-col justify-between text-white p-6 sm:p-10 lg:p-14 border-b border-slate-800">
        
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="w-full h-full bg-[radial-gradient(#00E599_1px,transparent_1px)] [background-size:32px_32px]" />
        </div>

        {/* Ambient Top Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00E599]/15 blur-[120px] rounded-full pointer-events-none" />

        {/* Hero Grid Container: Left (Headlines), Center (Arched Photo), Right (Features) */}
        <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center py-4">
          
          {/* Left Column (5 Cols): Typography & CTA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-bold text-[#00E599]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Portal Resmi Aspirasi Parlemen</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black tracking-tight leading-[1.08] text-white">
                Unlock Public Trust{' '}
                <span className="text-[#00E599] inline-flex items-center">
                  ↗
                </span>{' '}
                <span className="block text-slate-100 font-extrabold">
                  With Strategic
                </span>
                <span className="block text-[#00E599] underline decoration-[#00E599]/40 underline-offset-8">
                  Governance
                </span>
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg font-medium">
              Akselerasi transparansi kebijakan publik, advokasi perda berkeadilan, dan kawal tuntas aspirasi konstituen Daerah Pemilihan {info.dapil}.
            </p>

            {/* CTA Pill Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href={href('/kontak')}
                className="inline-flex items-center gap-3 pl-6 pr-2.5 py-2.5 rounded-full bg-[#00E599] hover:bg-[#00D084] text-slate-950 font-black text-xs tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(0,229,153,0.35)] hover:shadow-[0_0_35px_rgba(0,229,153,0.6)] group"
              >
                <span>HUBUNGI SAYA</span>
                <div className="w-8 h-8 rounded-full bg-slate-950 text-[#00E599] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link
                href={href('/profil')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white text-xs font-bold transition"
              >
                <span>Lihat Profil Dewan</span>
              </Link>
            </div>

            {/* Trust Award Badge */}
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Mandat Rakyat Terpilih</span>
              </div>
              <span>•</span>
              <span className="text-slate-300 font-semibold">{info.party}</span>
            </div>
          </div>

          {/* Center Column (4 Cols): Arched Green Portal with Cutout Dewan */}
          <div className="lg:col-span-4 flex items-center justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5] flex items-end justify-center">
              
              {/* Arched Emerald Background Frame (Matches Reference Image) */}
              <div className="absolute inset-0 rounded-t-[140px] rounded-b-[48px] bg-gradient-to-b from-[#00E599] via-[#00C074] to-[#009E60] p-1.5 shadow-[0_20px_60px_-15px_rgba(0,229,153,0.4)]">
                <div className="w-full h-full rounded-t-[136px] rounded-b-[44px] bg-gradient-to-b from-[#00D084]/40 via-transparent to-black/20" />
              </div>

              {/* Portrait Image */}
              <div className="relative z-10 w-full h-[105%] flex items-end justify-center overflow-hidden rounded-b-[48px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={info.avatar}
                  alt={info.fullName}
                  className="w-full h-full object-contain object-bottom filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]"
                />
              </div>

              {/* Floating Name Badge */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-2xl bg-[#081018]/95 backdrop-blur-md border border-slate-700/80 text-center shadow-xl whitespace-nowrap">
                <div className="text-xs font-black text-white">{info.fullName}</div>
                <div className="text-[10px] font-bold text-[#00E599] uppercase tracking-wider">
                  {info.title}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (3 Cols): Dotted Track & Constituents Metric Stack */}
          <div className="lg:col-span-3 space-y-8 pl-0 lg:pl-4">
            
            {/* 3 Key Commitments with Dotted Neon Connectors */}
            <div className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-[1px] before:bg-gradient-to-b before:from-[#00E599] before:via-[#00E599]/40 before:to-transparent pl-7">
              <div className="relative space-y-1">
                <div className="absolute -left-7 top-1.5 w-3 h-3 rounded-full bg-[#00E599] border-2 border-[#081018] shadow-[0_0_10px_#00E599]" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Respon Aspirasi Cepat
                </h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Kanal pengaduan warga 24/7 dengan verifikasi terpadu.
                </p>
              </div>

              <div className="relative space-y-1">
                <div className="absolute -left-7 top-1.5 w-3 h-3 rounded-full bg-[#00E599] border-2 border-[#081018] shadow-[0_0_10px_#00E599]" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Transparansi APBD
                </h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Publikasi berkala alokasi belanja modal & bansos daerah.
                </p>
              </div>

              <div className="relative space-y-1">
                <div className="absolute -left-7 top-1.5 w-3 h-3 rounded-full bg-[#00E599] border-2 border-[#081018] shadow-[0_0_10px_#00E599]" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Regulasi Pro-Rakyat
                </h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Pengawalan perda perlindungan petani, UMKM & buruh.
                </p>
              </div>
            </div>

            {/* Metric Stack: 150K+ Active Constituents */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3 shadow-lg">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-[#081018] flex items-center justify-center text-[10px] font-black text-slate-950">
                  AF
                </div>
                <div className="w-8 h-8 rounded-full bg-[#00E599] border-2 border-[#081018] flex items-center justify-center text-[10px] font-black text-slate-950">
                  DPR
                </div>
                <div className="w-8 h-8 rounded-full bg-teal-400 border-2 border-[#081018] flex items-center justify-center text-[10px] font-black text-slate-950">
                  ✓
                </div>
              </div>
              <div>
                <div className="text-sm font-black text-white">150K+ Warga</div>
                <div className="text-[10px] text-slate-400 font-medium">Terlayani di Dapil</div>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* =================================================================== */}
      {/* SECTION 2: ARTICLES (Clean White Layout matching Reference)         */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 px-6 sm:px-10 lg:px-12 max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
            Advokasi Kebijakan{' '}
            <span className="text-[#00D084] inline-flex items-center">
              ↗
            </span>{' '}
            <span className="text-slate-900 font-bold">& Laporan Parlemen</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Ikhtisar regulasi komisi, pengawasan perimbangan anggaran daerah, dan komitmen aksi nyata bagi kemajuan warga {info.dapil}.
          </p>
        </div>

        {/* Category Pills (Matching reference pill selector) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {articleCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kebijakan' : cat}
            </button>
          ))}
        </div>

        {/* Featured Focus Article Card (Matching the Reference Business Line of Credit Card) */}
        {featuredArticle ? (
          <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-slate-200/90 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.06)] overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              
              {/* Left Column inside card: Details & Checklist */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#00A86B] text-xs font-extrabold uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{featuredArticle.category}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
                  {featuredArticle.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>

                {/* Benefits / Focus Checklist */}
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Poin Utama Advokasi:
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00D084] shrink-0" />
                      <span>Transparansi alokasi perimbangan belanja daerah</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00D084] shrink-0" />
                      <span>Kepastian bantuan stimulan bagi UMKM dan petani</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00D084] shrink-0" />
                      <span>Pengawalan notula rapat dengar pendapat komisi</span>
                    </div>
                  </div>
                </div>

                {/* Read Full Article Button */}
                <div className="pt-3">
                  <Link
                    href={href(`/artikel/${featuredArticle.slug}`)}
                    className="inline-flex items-center gap-2.5 pl-6 pr-2.5 py-2.5 rounded-full bg-[#00E599] hover:bg-[#00D084] text-slate-950 font-black text-xs tracking-wider transition-all duration-300 shadow-md group"
                  >
                    <span>BACA SELENGKAPNYA</span>
                    <div className="w-7 h-7 rounded-full bg-slate-950 text-[#00E599] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Right Column inside card: Big Featured Image */}
              <div className="lg:col-span-6">
                <Link
                  href={href(`/artikel/${featuredArticle.slug}`)}
                  className="block relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 shadow-lg group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-slate-900 shadow-sm flex items-center gap-1.5">
                    <span>Baca Artikel</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#00A86B]" />
                  </div>
                </Link>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200 p-8">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Belum Ada Artikel</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Data artikel resmi belum dipublikasikan untuk kategori ini.
            </p>
          </div>
        )}

        {/* Secondary Articles Grid (If there are more articles) */}
        {secondaryArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-4">
            {secondaryArticles.map((art: any, idx: number) => (
              <Link
                key={art.slug || idx}
                href={href(`/artikel/${art.slug}`)}
                className="group bg-white rounded-3xl p-4 border border-slate-200/80 hover:border-[#00D084] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-[#00A86B]">
                      {art.category}
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-950 group-hover:text-[#00A86B] transition line-clamp-2 leading-snug mb-2">
                    {art.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>{art.date}</span>
                  <span className="text-[#00A86B] font-bold flex items-center gap-1">
                    Selengkapnya ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Link to Full Catalog */}
        <div className="text-center pt-2">
          <Link
            href={href('/artikel')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold transition shadow-sm"
          >
            <span>Buka Semua Artikel Parlemen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </section>

      {/* =================================================================== */}
      {/* SECTION 3: INFOGRAPHICS & RECOGNITION (Features Grid & Awards)     */}
      {/* =================================================================== */}
      <section className="py-16 sm:py-24 px-6 sm:px-10 lg:px-12 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-14">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#00A86B] text-xs font-bold uppercase tracking-wider">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Visualisasi Kinerja</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
                Transparansi &{' '}
                <span className="text-[#00D084]">✦</span> Visual Data
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md">
              Data terverifikasi serapan anggaran, agenda regulasi komisi, dan capaian program pengabdian masyarakat.
            </p>
          </div>

          {/* Infographics Gallery Grid */}
          {displayInfographics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {displayInfographics.map((inf: any, idx: number) => (
                <div
                  key={inf.id || `inf-${idx}`}
                  className="group bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Poster Preview */}
                    <div
                      onClick={() => setSelectedInfographic(inf)}
                      className="cursor-pointer relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 mb-4 group/img shadow-md"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={inf.imageUrl}
                        alt={inf.title}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                        <div className="p-3 rounded-full bg-white/20 backdrop-blur-md">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-bold tracking-wide">Lihat Ukuran Penuh</span>
                      </div>

                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-[#00A86B] shadow-sm">
                        {inf.badge}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-950 leading-snug mb-1.5 line-clamp-2">
                      {inf.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {inf.summary}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#00A86B]">
                      {inf.category}
                    </span>
                    <button
                      onClick={() => setSelectedInfographic(inf)}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#00A86B] hover:text-emerald-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Perbesar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">Belum Ada Infografis</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Data infografis belum dipublikasikan saat ini.
              </p>
            </div>
          )}

          {/* Awards & Recognition Strip (Exact matching reference layout) */}
          <div className="bg-[#081018] rounded-3xl sm:rounded-[36px] p-6 sm:p-10 border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00E599]/15 border border-[#00E599]/30 flex items-center justify-center text-[#00E599] shrink-0">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Awards & Recognition
                </h3>
                <p className="text-xs text-slate-400">
                  Standar integritas dan akuntabilitas parlemen tingkat nasional.
                </p>
              </div>
            </div>

            {/* Badges Stack */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[110px]">
                <div className="text-xs font-black text-[#00E599]">OPINI WTP</div>
                <div className="text-[10px] text-slate-400 font-semibold">BPK RI 2026</div>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[110px]">
                <div className="text-xs font-black text-[#00E599]">98.4%</div>
                <div className="text-[10px] text-slate-400 font-semibold">Transparansi Publik</div>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[110px]">
                <div className="text-xs font-black text-[#00E599]">A+ PREDIKAT</div>
                <div className="text-[10px] text-slate-400 font-semibold">Akuntabilitas Dewan</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Modal Lightbox for Infographic */}
      {selectedInfographic && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-950">
                  {selectedInfographic.title}
                </h3>
                <span className="text-xs font-bold text-[#00A86B]">
                  {selectedInfographic.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedInfographic(null)}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-950 flex items-center justify-center shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedInfographic.imageUrl}
                alt={selectedInfographic.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-600 line-clamp-2">
                {selectedInfographic.summary}
              </p>
              <a
                href={selectedInfographic.imageUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00E599] hover:bg-[#00D084] text-slate-950 text-xs font-bold transition shrink-0 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </XenonMintShell>
  );
}
