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
  Sparkles,
  Layers,
  Heart,
  Award,
  ArrowUpRight,
} from 'lucide-react';
import { TiaraBurgundyShell } from './tiara-burgundy/TiaraBurgundyShell';
import {
  getTiaraMemberInfo,
  useTiaraHref,
  TIARA_THEME,
} from './tiara-burgundy/utils';

interface TiaraBurgundyTemplateProps {
  member: any;
  theme: any;
  articles?: any[];
  infographics?: any[];
  recentArticles?: any[];
  recentInfographics?: any[];
  subdomain?: string;
}

export function TiaraBurgundyTemplate({
  member,
  theme,
  articles,
  infographics,
  recentArticles,
  recentInfographics,
  subdomain,
}: TiaraBurgundyTemplateProps) {
  const info = getTiaraMemberInfo(member, theme, subdomain);
  const href = useTiaraHref(subdomain);

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
          readingTime: a.readingTime || '5 menit baca',
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

  return (
    <TiaraBurgundyShell member={member} theme={theme} subdomain={subdomain} activePage="beranda">
      
      {/* =================================================================== */}
      {/* SECTION 1: FULLSCREEN HERO (100VH ON FIRST OPEN)                   */}
      {/* =================================================================== */}
      <section className="relative min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] lg:max-h-[100dvh] bg-[#EFEBE4] overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 border-b border-[#E5DED5]">
        
        {/* Giant Serif Magazine Headline: HI, I'm [CALLNAME] */}
        <div className="relative z-10 text-center pt-2 sm:pt-4">
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl xl:text-9xl tracking-tight text-[#6B1724] leading-none uppercase select-none font-normal">
            HI, <span className="font-serif italic font-light lowercase" style={{ color: info.textAccentColor }}>I&apos;m</span>{' '}
            {info.callName}
          </h1>
        </div>

        {/* Center Canvas with Cutout Portrait & Surrounding Annotations */}
        <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 items-end justify-center my-auto">
          
          {/* Left Annotations / Doodle Notes */}
          <div className="hidden lg:flex lg:col-span-3 flex-col justify-center space-y-12 pb-16 pl-4 text-left">
            
            {/* Note 1 */}
            <div className="space-y-2 relative">
              <span className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#6B1724] block">
                ANGGOTA DEWAN PERWAKILAN RAKYAT RI
              </span>
              <p className="text-[11px] text-[#7A6F6A] font-medium leading-relaxed">
                Fraksi {info.party} • Dapil {info.dapil}
              </p>
              {/* Squiggly SVG Arrow */}
              <svg className="w-12 h-8 ml-8 mt-1" style={{ color: info.textAccentColor }} viewBox="0 0 50 30" fill="none">
                <path d="M5 5C15 25 35 15 45 25M45 25L38 23M45 25L42 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Note 2 */}
            <div className="space-y-1 relative pt-4">
              <span className="font-serif text-2xl font-bold block" style={{ color: info.textAccentColor }}>
                150K+
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7A6F6A] block">
                KONSTITUEN TERLAYANI
              </span>
              <svg className="w-10 h-6 ml-4 mt-1" style={{ color: info.textAccentColor }} viewBox="0 0 40 20" fill="none">
                <path d="M5 15C15 5 25 18 35 10M35 10L30 8M35 10L33 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

          </div>

          {/* Center Column: Cutout Portrait Dewan */}
          <div className="lg:col-span-6 flex items-end justify-center h-full max-h-[520px]">
            <div className="relative w-full max-w-[420px] h-full flex items-end justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={info.avatar}
                alt={info.fullName}
                className="w-auto max-h-[460px] sm:max-h-[500px] object-contain object-bottom filter drop-shadow-[0_20px_35px_rgba(107,23,36,0.2)]"
              />
            </div>
          </div>

          {/* Right Annotations / Action Button */}
          <div className="hidden lg:flex lg:col-span-3 flex-col justify-center space-y-12 pb-16 pr-4 text-right">
            
            {/* Note 1 */}
            <div className="space-y-2 relative">
              <span className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#6B1724] block">
                PENGAWASAN KEBIJAKAN & TRANSPARANSI ANGGARAN
              </span>
              <p className="text-[11px] text-[#7A6F6A] font-medium leading-relaxed">
                Mengawal amanah rakyat secara konsisten, terbuka, dan berkeadilan.
              </p>
              <div className="flex justify-end mt-1 mr-8">
                <svg className="w-10 h-8" style={{ color: info.textAccentColor }} viewBox="0 0 40 30" fill="none">
                  <path d="M35 5C25 25 15 15 5 25M5 25L12 23M5 25L8 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Note 2: CTA Button (Hubungi Saya) */}
            <div className="pt-4 flex justify-end">
              <Link
                href={href('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#6B1724] hover:bg-[#520F1A] text-white font-bold text-xs tracking-wider uppercase transition shadow-md group"
              >
                <span>HUBUNGI SAYA</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>

        </div>

        {/* Mobile View CTA Button (Visible on smaller screens) */}
        <div className="lg:hidden relative z-20 text-center pt-4">
          <Link
            href={href('/kontak')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#6B1724] hover:bg-[#520F1A] text-white font-bold text-xs tracking-wider uppercase transition shadow-md"
          >
            <span>HUBUNGI SAYA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </section>

      {/* =================================================================== */}
      {/* SECTION 2: ARTIKEL (Editorial Magazine Story & Article Showcase)   */}
      {/* =================================================================== */}
      <section className="py-20 sm:py-28 px-6 sm:px-10 lg:px-12 max-w-7xl mx-auto space-y-16">
        
        {/* Editorial Lead Block (Matching the reference layout) */}
        <div className="space-y-8">
          
          <div className="text-center space-y-2">
            <span className="font-serif italic text-base sm:text-lg block" style={{ color: info.textAccentColor }}>
              Kajian Kebijakan Parlemen
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#6B1724] uppercase max-w-4xl mx-auto leading-tight">
              REFORMASI REGULASI, PENGAWASAN ANGGARAN, DAN ADVOKASI KONSTITUEN
            </h2>
          </div>

          {/* Two-Column Editorial Text & Polaroid Photo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-4">
            
            {/* Editorial Paragraphs (Left 8 Cols) */}
            <div className="lg:col-span-8 space-y-6 text-[#2A2220] leading-relaxed text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-medium">
                <div className="space-y-3">
                  <p className="font-serif text-sm font-bold uppercase tracking-wider text-[#6B1724]">
                    KOMITMEN PARLEMEN TRANSFORMATIF
                  </p>
                  <p className="text-justify text-[#7A6F6A]">
                    Pengabdian di lembaga perwakilan menuntut kejernihan nurani dan konsistensi sikap. Kebijakan publik yang kita kawal bukan sekadar deretan angka statistik di kertas kerja, melainkan jaminan akses modal bagi petani, kepastian permodalan bagi UMKM, dan perbaikan sarana jalan desa yang selama ini luput dari perhatian pusat.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-justify text-[#7A6F6A]">
                    Melalui keterbukaan naskah perda dan audit berkala pos anggaran daerah, kami memastikan setiap rupiah uang rakyat di Daerah Pemilihan {info.dapil} benar-benar berdaya guna secara langsung. Kami percaya bahwa parlemen yang kuat lahir dari kedekatan mendengar dan keberanian bertindak.
                  </p>
                  <div className="pt-2">
                    <Link
                      href={href('/artikel')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6B1724] hover:bg-[#520F1A] text-white text-[11px] font-bold tracking-wider uppercase transition"
                    >
                      <span>BACA SELURUH ARTIKEL</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pinned Polaroid Photo (Right 4 Cols - Matching Reference) */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative p-3 bg-white shadow-xl rounded-md border border-[#E5DED5] rotate-3 max-w-[240px] group hover:rotate-0 transition-transform duration-300">
                {/* Tape Effect */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-amber-100/80 border border-amber-200/60 shadow-xs rotate-[-2deg]" />
                <div className="aspect-[4/5] overflow-hidden rounded bg-slate-100 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={info.avatar}
                    alt={info.fullName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="text-center font-serif text-[11px] font-bold text-[#6B1724] tracking-wider uppercase">
                  {info.callName} • 2026
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Real API Articles Grid */}
        <div className="space-y-8 pt-8 border-t border-[#E5DED5]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-serif italic text-sm block" style={{ color: info.textAccentColor }}>
                Publikasi Kebijakan Terkini
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#6B1724] tracking-tight">
                ARTIKEL & TELAAH REGULASI
              </h3>
            </div>
            <Link
              href={href('/artikel')}
              className="text-xs font-bold uppercase tracking-[0.15em] text-[#6B1724] hover:text-[#520F1A] inline-flex items-center gap-1.5"
            >
              <span>Lihat Katalog Artikel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {displayArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayArticles.slice(0, 3).map((art: any, idx: number) => (
                <Link
                  key={art.slug || idx}
                  href={href(`/artikel/${art.slug}`)}
                  className="group bg-white rounded-2xl p-4 border border-[#E5DED5] hover:border-[#6B1724] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Real Cover Image */}
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#6B1724] shadow-sm">
                        {art.category}
                      </div>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-[#2A2220] group-hover:text-[#6B1724] transition line-clamp-2 leading-snug mb-2">
                      {art.title}
                    </h4>

                    <p className="text-xs text-[#7A6F6A] line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F0EBE5] flex items-center justify-between text-[11px] text-[#7A6F6A] font-semibold">
                    <span>{art.date}</span>
                    <span className="font-bold flex items-center gap-1" style={{ color: info.textAccentColor }}>
                      Baca ↗
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E5DED5] p-8">
              <BookOpen className="w-12 h-12 text-[#E5DED5] mx-auto mb-3" />
              <h4 className="font-serif text-base font-bold text-[#6B1724]">Belum Ada Artikel</h4>
              <p className="text-xs text-[#7A6F6A] max-w-sm mx-auto mt-1">
                Publikasi artikel dan telaah regulasi resmi akan segera ditayangkan.
              </p>
            </div>
          )}
        </div>

      </section>

      {/* =================================================================== */}
      {/* SEPARATOR: EDITORIAL MARQUEE TYPOGRAPHY (Matching MY VALUES)        */}
      {/* =================================================================== */}
      <section className="py-10 bg-[#EFEBE4] border-y border-[#E5DED5] overflow-hidden select-none">
        <div className="whitespace-nowrap flex gap-12 font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#6B1724]/20 uppercase">
          <span>NILAI PENGABDIAN</span>
          <span className="text-[#6B1724]">•</span>
          <span>INTEGRITAS</span>
          <span className="text-[#6B1724]">•</span>
          <span>AKUNTABILITAS</span>
          <span className="text-[#6B1724]">•</span>
          <span>KEADILAN SOSIAL</span>
          <span className="text-[#6B1724]">•</span>
          <span>TRANSPARANSI PUBLIK</span>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 3: INFOGRAFIS & CORE VALUES (4 Burgundy Cards + Gallery)    */}
      {/* =================================================================== */}
      <section className="py-20 sm:py-28 px-6 sm:px-10 lg:px-12 max-w-7xl mx-auto space-y-16">
        
        {/* 4 Burgundy Cards (Exact Matching the Bottom of Reference Image) */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="font-serif italic text-sm block" style={{ color: info.textAccentColor }}>
              Prinsip Moral & Nilai Kerja
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#6B1724] tracking-tight uppercase">
              EMPAT PILAR INTEGRITAS DEWAN
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Authenticity / Integritas Moral */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#6B1724] text-white space-y-3 shadow-lg flex flex-col justify-between">
              <div className="space-y-2">
                <span className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-amber-200/90 block">
                  INTEGRITAS MORAL
                </span>
                <p className="text-xs text-white/80 leading-relaxed font-light">
                  Menjaga independensi parlemen, bebas dari konflik kepentingan, serta mengedepankan keterbukaan informasi publik dalam setiap rapat komisi.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-bold tracking-widest uppercase text-white/50">
                Pilar I • Kepatuhan
              </div>
            </div>

            {/* Card 2: Freedom / Keadilan Sosial */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#6B1724] text-white space-y-3 shadow-lg flex flex-col justify-between">
              <div className="space-y-2">
                <span className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-amber-200/90 block">
                  KEADILAN SOSIAL
                </span>
                <p className="text-xs text-white/80 leading-relaxed font-light">
                  Memperjuangkan perimbangan anggaran daerah agar alokasi belanja infrastruktur dan perlindungan sosial menyentuh warga akar rumput.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-bold tracking-widest uppercase text-white/50">
                Pilar II • Pemerataan
              </div>
            </div>

            {/* Card 3: Impact / Dampak Nyata */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#6B1724] text-white space-y-3 shadow-lg flex flex-col justify-between">
              <div className="space-y-2">
                <span className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-amber-200/90 block">
                  DAMPAK NYATA
                </span>
                <p className="text-xs text-white/80 leading-relaxed font-light">
                  Bukan sekadar menghadiri sidang, melainkan memastikan aspirasi konstituen terverifikasi dan tuntas dalam program nyata kementerian terkait.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-bold tracking-widest uppercase text-white/50">
                Pilar III • Solusi
              </div>
            </div>

            {/* Card 4: Growth Mindset / Kemandirian */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#6B1724] text-white space-y-3 shadow-lg flex flex-col justify-between">
              <div className="space-y-2">
                <span className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-amber-200/90 block">
                  KEMANDIRIAN EKONOMI
                </span>
                <p className="text-xs text-white/80 leading-relaxed font-light">
                  Mendorong penguatan sektor riil pedesaan, kemandirian pangan petani lokal, dan perlindungan hukum bagi wirausaha mikro daerah.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-bold tracking-widest uppercase text-white/50">
                Pilar IV • Ketahanan
              </div>
            </div>

          </div>
        </div>

        {/* Real API Infographics Gallery */}
        <div className="space-y-8 pt-8 border-t border-[#E5DED5]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-serif italic text-sm block" style={{ color: info.textAccentColor }}>
                Visualisasi Data Kebijakan
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#6B1724] tracking-tight uppercase">
                GALERI INFOGRAFIS KINERJA
              </h3>
            </div>
            <Link
              href={href('/infografis')}
              className="text-xs font-bold uppercase tracking-[0.15em] text-[#6B1724] hover:text-[#520F1A] inline-flex items-center gap-1.5"
            >
              <span>Buka Semua Infografis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {displayInfographics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayInfographics.map((inf: any, idx: number) => (
                <div
                  key={inf.id || `inf-${idx}`}
                  className="group bg-white rounded-2xl p-4 border border-[#E5DED5] hover:border-[#6B1724] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Poster Preview */}
                    <div
                      onClick={() => setSelectedInfographic(inf)}
                      className="cursor-pointer relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 mb-4 group/img shadow-md"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={inf.imageUrl}
                        alt={inf.title}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-[#6B1724]/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                        <div className="p-3 rounded-full bg-white/20 backdrop-blur-md">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-bold tracking-wide">Lihat Ukuran Penuh</span>
                      </div>

                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#6B1724] shadow-sm">
                        {inf.badge}
                      </div>
                    </div>

                    <h4 className="font-serif text-base font-bold text-[#2A2220] leading-snug mb-1.5 line-clamp-2">
                      {inf.title}
                    </h4>
                    <p className="text-xs text-[#7A6F6A] line-clamp-2">
                      {inf.summary}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 mt-3 border-t border-[#F0EBE5] flex items-center justify-between">
                    <span className="text-[11px] font-bold" style={{ color: info.textAccentColor }}>
                      {inf.category}
                    </span>
                    <button
                      onClick={() => setSelectedInfographic(inf)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition"
                      style={{ color: info.textAccentColor }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Perbesar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E5DED5] p-8">
              <Layers className="w-12 h-12 text-[#E5DED5] mx-auto mb-3" />
              <h4 className="font-serif text-base font-bold text-[#6B1724]">Belum Ada Infografis</h4>
              <p className="text-xs text-[#7A6F6A] max-w-sm mx-auto mt-1">
                Data infografis dan visualisasi capaian parlemen belum tersedia saat ini.
              </p>
            </div>
          )}

        </div>

      </section>

      {/* Modal Lightbox for Infographic */}
      {selectedInfographic && (
        <div className="fixed inset-0 z-50 bg-[#2A2220]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E5DED5] flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#6B1724]">
                  {selectedInfographic.title}
                </h3>
                <span className="text-xs font-semibold text-[#7A6F6A]">
                  {selectedInfographic.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedInfographic(null)}
                className="w-9 h-9 rounded-full bg-white border border-[#E5DED5] text-[#2A2220] hover:text-[#6B1724] flex items-center justify-center shadow-sm"
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

            <div className="p-4 sm:p-6 bg-white border-t border-[#E5DED5] flex items-center justify-between gap-4">
              <p className="text-xs text-[#7A6F6A] line-clamp-2">
                {selectedInfographic.summary}
              </p>
              <a
                href={selectedInfographic.imageUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6B1724] hover:bg-[#520F1A] text-white text-xs font-bold transition shrink-0 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </TiaraBurgundyShell>
  );
}
