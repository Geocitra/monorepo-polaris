'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Clock,
  Download,
  Maximize2,
  X,
  Star,
  Briefcase,
  Heart,
  Trophy,
  MapPin,
  Sparkles,
  FileText,
  Search,
  CheckCircle,
  Building2,
  Users,
  Layers,
  Scale,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { BlushEditorialShell } from './blush-editorial/BlushEditorialShell';
import {
  getBlushMemberInfo,
  useBlushHref,
  getArticleImage,
  getArticleCategory,
  getArticleExcerpt,
  BLUSH_DEFAULT_ARTICLES,
  BLUSH_DEFAULT_INFOGRAPHICS,
} from './blush-editorial/utils';

interface TemplateProps {
  member: any;
  theme: any;
  recentArticles?: any[];
  recentInfographics?: any[];
  documents?: any[];
  subdomain?: string;
}

export function BlushEditorialTemplate({
  member,
  theme,
  recentArticles = [],
  recentInfographics = [],
  subdomain,
}: TemplateProps) {
  const info = getBlushMemberInfo(member, theme, subdomain);
  const href = useBlushHref(subdomain);

  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);

  const articles =
    recentArticles && recentArticles.length > 0
      ? recentArticles.slice(0, 3)
      : BLUSH_DEFAULT_ARTICLES.slice(0, 3);

  const infographics =
    recentInfographics && recentInfographics.length > 0
      ? recentInfographics.slice(0, 3)
      : BLUSH_DEFAULT_INFOGRAPHICS.slice(0, 3);

  // Komisi & Mitra Kerja Badges
  const partnerBadges = [
    { label: 'Komisi I', desc: 'Hukum & Pemerintahan' },
    { label: 'Banggar', desc: 'Badan Anggaran' },
    { label: 'Bapemperda', desc: 'Legislasi Daerah' },
    { label: 'BK Parlemen', desc: 'Badan Kehormatan' },
    { label: 'Dinas PU', desc: 'Infrastruktur Dasar' },
    { label: 'Disdikbud', desc: 'Pendidikan & Beasiswa' },
    { label: 'Dinkes', desc: 'Layanan Kesehatan' },
    { label: 'Diskop UMKM', desc: 'Pemberdayaan Warga' },
  ];

  return (
    <BlushEditorialShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="beranda"
      showMasthead={false}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: HERO DUAL-TONE EDITORIAL + STATS BAR + 4 FOCUS CARDS +
          TOOLS/PROCESS + COLLAB BANNER (PERSIS GAMBAR REFERENSI)
      ═══════════════════════════════════════════════════════════════════════ */}

      {/* 1A. HERO SECTION PERSIS GAMBAR (FULL SCREEN FIRST FOLD) */}
      <section className="relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center justify-center py-10 lg:py-0">
        <div className="w-full max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Sisi Kiri Hero */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex items-center text-xs font-bold tracking-[0.2em] text-[#8C7D73] uppercase">
                <span>HI, SAYA WAKIL RAKYAT ANDA</span>
              </div>

              {/* Headline Dual-Tone Editorial Serif Persis Gambar */}
              <div className="space-y-1">
                <h1
                  className="font-serif font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[0.95]"
                  style={{ color: info.primaryColor }}
                >
                  SUARA RAKYAT
                </h1>
                <h2 className="font-serif font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight text-[#332A26] leading-[0.95]">
                  BERDEDIKASI.
                </h2>
              </div>

              <div className="pt-1">
                <p className="text-base sm:text-lg font-bold text-[#332A26]">
                  {info.officialFullName}
                </p>
                <p className="text-xs sm:text-sm text-[#7D726A] font-medium">
                  {info.legislativeLevel} · {info.party} · Daerah Pemilihan {info.dapil}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#6E635C] max-w-lg leading-relaxed">
                Mendedikasikan diri untuk memperjuangkan kepentingan warga, mengawal transparansi anggaran APBD,
                dan menghadirkan produk hukum daerah yang adil serta berpihak pada kesejahteraan rakyat.
              </p>

              {/* Dua Tombol Aksi Persis Gambar */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href={href('/kontak')}
                  className="px-7 py-3.5 rounded-full text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:brightness-105 transition-all"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  <span>Hubungi Saya</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <Link
                  href={href('/profil')}
                  className="px-7 py-3.5 rounded-full border border-[#D5C9BD] hover:border-[#332A26] text-[#332A26] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-all"
                >
                  <span>Lihat Profil Dewan</span>
                  <Download className="w-4 h-4" />
                </Link>
              </div>

            </div>

            {/* Sisi Kanan Hero: Potret Dewan dengan Arch Oval Sage & Pin Dapil */}
            <div className="lg:col-span-5 flex justify-center relative">
              
              {/* Latar Belakang Arch Oval Sage Persis Gambar */}
              <div className="relative w-[320px] sm:w-[380px] lg:w-[420px] aspect-[4/5] flex items-end justify-center">
                
                {/* Bentuk Oval / Arch Soft Sage */}
                <div className="absolute inset-0 bg-[#E0E6D8] rounded-t-[190px] rounded-b-[40px] overflow-hidden" />
                
                {/* Dedaunan Botanical Dekorasi Halus */}
                <div className="absolute -top-4 -right-4 w-28 h-28 opacity-30 pointer-events-none select-none">
                  <svg viewBox="0 0 100 100" fill="#6B7861">
                    <path d="M50 0 C60 30 90 40 100 50 C70 60 60 90 50 100 C40 70 10 60 0 50 C30 40 40 10 50 0 Z" />
                  </svg>
                </div>

                {/* Potret Dewan */}
                <img
                  src={info.photoUrl}
                  alt={info.officialFullName}
                  className="relative z-10 w-full h-full object-contain object-bottom drop-shadow-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
                  }}
                />

                {/* Badge Lokasi Dapil Pojok Kanan Bawah Persis Gambar */}
                <div className="absolute -bottom-4 right-0 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-[#EDE5DA] text-right">
                  <div className="text-[9px] uppercase tracking-widest text-[#9C8F85] font-extrabold flex items-center justify-end gap-1">
                    <span>DAERAH PEMILIHAN</span>
                    <MapPin className="w-3 h-3 text-[#D47A6A]" />
                  </div>
                  <div className="font-serif font-black text-sm text-[#332A26] uppercase tracking-wider">
                    {info.dapil}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 1B. FLOATING TRUST METRICS CARD PERSIS GAMBAR */}
      <section className="relative -mt-6 z-30 max-w-[1140px] mx-auto px-6 lg:px-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#EDE5DA] grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#F0E8DC]">
          
          {/* Metrik 1 */}
          <div className="flex flex-col items-center text-center p-3">
            <span className="w-10 h-10 rounded-full bg-[#FAF3EC] text-[#D47A6A] flex items-center justify-center mb-3">
              <Star className="w-5 h-5 fill-[#D47A6A]/20" />
            </span>
            <span className="font-serif font-bold text-3xl sm:text-4xl text-[#332A26]">5+</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#8A7D75] font-extrabold mt-1">
              Tahun Pengabdian
            </span>
          </div>

          {/* Metrik 2 */}
          <div className="flex flex-col items-center text-center p-3">
            <span className="w-10 h-10 rounded-full bg-[#F3F6EF] text-[#63725A] flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5" />
            </span>
            <span className="font-serif font-bold text-3xl sm:text-4xl text-[#332A26]">35+</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#8A7D75] font-extrabold mt-1">
              Raperda &amp; Kebijakan
            </span>
          </div>

          {/* Metrik 3 */}
          <div className="flex flex-col items-center text-center p-3">
            <span className="w-10 h-10 rounded-full bg-[#FAF3EC] text-[#D47A6A] flex items-center justify-center mb-3">
              <Heart className="w-5 h-5 fill-[#D47A6A]/20" />
            </span>
            <span className="font-serif font-bold text-3xl sm:text-4xl text-[#332A26]">1.200+</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#8A7D75] font-extrabold mt-1">
              Warga Terdampingi
            </span>
          </div>

          {/* Metrik 4 */}
          <div className="flex flex-col items-center text-center p-3">
            <span className="w-10 h-10 rounded-full bg-[#F3F6EF] text-[#63725A] flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5" />
            </span>
            <span className="font-serif font-bold text-3xl sm:text-4xl text-[#332A26]">98%</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#8A7D75] font-extrabold mt-1">
              Tingkat Kehadiran Sidang
            </span>
          </div>

        </div>
      </section>

      {/* 1C. WHAT I DO / FOKUS PENGABDIAN (4 KARTU VERTIKAL PERSIS GAMBAR) */}
      <section className="py-20 lg:py-28 max-w-[1240px] mx-auto px-6 lg:px-10">
        
        <div className="mb-12">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-2">
            WHAT I DO
          </span>
          <h2 className="font-serif font-normal text-3xl sm:text-4xl text-[#332A26]">
            Pilar Fokus Pengabdian Parlemen
          </h2>
        </div>

        {/* 4 Kartu Vertikal dengan Container Warna Pastel Mewah */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Soft Blush Container */}
          <div className="rounded-3xl p-6 bg-[#FBEFEA] border border-[#F4DDD3] flex flex-col justify-between min-h-[380px] shadow-sm hover:-translate-y-1.5 transition-all">
            <div>
              <span className="w-10 h-10 rounded-xl bg-white/80 text-[#D47A6A] flex items-center justify-center mb-4 shadow-xs">
                <Users className="w-5 h-5" />
              </span>
              <h3 className="font-serif font-bold text-lg uppercase tracking-wide text-[#332A26]">
                Advokasi Warga
              </h3>
              <p className="text-xs text-[#7A6B63] mt-2 leading-relaxed">
                Mendengar, merangkum, dan mengawal suara warga dalam persidangan komisi.
              </p>
            </div>
            
            <div className="pt-6">
              {/* Mock visual preview */}
              <div className="rounded-2xl bg-white p-3 shadow-md border border-[#F0DCD3]">
                <div className="text-[10px] font-bold text-[#D47A6A] uppercase tracking-wider">
                  Kanal Aduan Warga
                </div>
                <div className="text-xs font-semibold text-[#332A26] mt-1">
                  Respon Cepat 24/7
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="w-8 h-8 rounded-full bg-white text-[#332A26] flex items-center justify-center shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Warm Sage Container */}
          <div className="rounded-3xl p-6 bg-[#E8EDE2] border border-[#D5DFC9] flex flex-col justify-between min-h-[380px] shadow-sm hover:-translate-y-1.5 transition-all">
            <div>
              <span className="w-10 h-10 rounded-xl bg-white/80 text-[#606E57] flex items-center justify-center mb-4 shadow-xs">
                <Scale className="w-5 h-5" />
              </span>
              <h3 className="font-serif font-bold text-lg uppercase tracking-wide text-[#332A26]">
                Pengawasan APBD
              </h3>
              <p className="text-xs text-[#636F5B] mt-2 leading-relaxed">
                Menjamin belanja daerah transparan, efisien, dan pro-kesejahteraan masyarakat.
              </p>
            </div>
            
            <div className="pt-6">
              <div className="rounded-2xl bg-white p-3 shadow-md border border-[#D5DFC9]">
                <div className="text-[10px] font-bold text-[#606E57] uppercase tracking-wider">
                  Alokasi Anggaran
                </div>
                <div className="text-xs font-semibold text-[#332A26] mt-1">
                  Audit Kebijakan Terukur
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="w-8 h-8 rounded-full bg-white text-[#332A26] flex items-center justify-center shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Terracotta Container */}
          <div className="rounded-3xl p-6 bg-[#F8E7E3] border border-[#EED0C8] flex flex-col justify-between min-h-[380px] shadow-sm hover:-translate-y-1.5 transition-all">
            <div>
              <span className="w-10 h-10 rounded-xl bg-white/80 text-[#C96B5B] flex items-center justify-center mb-4 shadow-xs">
                <Layers className="w-5 h-5" />
              </span>
              <h3 className="font-serif font-bold text-lg uppercase tracking-wide text-[#332A26]">
                Ekonomi UMKM
              </h3>
              <p className="text-xs text-[#7A605B] mt-2 leading-relaxed">
                Stimulus kelompok tani, pelatihan kewirausahaan, dan izin usaha mikro.
              </p>
            </div>
            
            <div className="pt-6">
              <div className="rounded-2xl bg-white p-3 shadow-md border border-[#EED0C8]">
                <div className="text-[10px] font-bold text-[#C96B5B] uppercase tracking-wider">
                  Bantuan Modal
                </div>
                <div className="text-xs font-semibold text-[#332A26] mt-1">
                  Pemberdayaan Daerah
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="w-8 h-8 rounded-full bg-white text-[#332A26] flex items-center justify-center shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Soft Olive Container */}
          <div className="rounded-3xl p-6 bg-[#E3E8DC] border border-[#CCD6C3] flex flex-col justify-between min-h-[380px] shadow-sm hover:-translate-y-1.5 transition-all">
            <div>
              <span className="w-10 h-10 rounded-xl bg-white/80 text-[#55634D] flex items-center justify-center mb-4 shadow-xs">
                <Building2 className="w-5 h-5" />
              </span>
              <h3 className="font-serif font-bold text-lg uppercase tracking-wide text-[#332A26]">
                Regulasi Daerah
              </h3>
              <p className="text-xs text-[#5D6B55] mt-2 leading-relaxed">
                Penyusunan Perda perlindungan pangan, tata ruang, dan keadilan sosial.
              </p>
            </div>
            
            <div className="pt-6">
              <div className="rounded-2xl bg-white p-3 shadow-md border border-[#CCD6C3]">
                <div className="text-[10px] font-bold text-[#55634D] uppercase tracking-wider">
                  Naskah Akademik
                </div>
                <div className="text-xs font-semibold text-[#332A26] mt-1">
                  Payung Hukum Pasti
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="w-8 h-8 rounded-full bg-white text-[#332A26] flex items-center justify-center shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* 1D. TOOLS / PARTNERS & PROCESS SECTION PERSIS GAMBAR */}
      <section className="pb-20 max-w-[1240px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Kiri: Komisi & Mitra Kerja (8 Card Grid) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-[#EDE5DA] shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
                INSTITUSI &amp; MITRA KERJA
              </span>
              <h3 className="font-serif font-bold text-xl text-[#332A26]">
                Alat Kelengkapan Dewan
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {partnerBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EDE5DA] text-center hover:border-[#D47A6A] transition-colors"
                >
                  <div className="font-serif font-bold text-xs text-[#332A26]">
                    {badge.label}
                  </div>
                  <div className="text-[9px] text-[#8C7D73] mt-1 leading-tight">
                    {badge.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kanan: Alur Kerja Advokasi (01 - 04) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-[#EDE5DA] shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
                TAHAPAN ADVOKASI
              </span>
              <h3 className="font-serif font-bold text-xl text-[#332A26]">
                Alur Tindak Lanjut Usulan Warga
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="font-serif font-bold text-base text-[#D47A6A]">01</span>
                <div>
                  <h4 className="font-bold text-xs text-[#332A26] uppercase tracking-wider">
                    Penerimaan &amp; Verifikasi
                  </h4>
                  <p className="text-xs text-[#7A6B63] mt-0.5">
                    Mencatat dan memverifikasi kelayakan isu dengan staf ahli komisi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="font-serif font-bold text-base text-[#D47A6A]">02</span>
                <div>
                  <h4 className="font-bold text-xs text-[#332A26] uppercase tracking-wider">
                    Telaah Lapangan &amp; Regulasi
                  </h4>
                  <p className="text-xs text-[#7A6B63] mt-0.5">
                    Meninjau aspek legal perda dan kondisi riil di daerah pemilihan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="font-serif font-bold text-base text-[#D47A6A]">03</span>
                <div>
                  <h4 className="font-bold text-xs text-[#332A26] uppercase tracking-wider">
                    Pembahasan di Parlemen
                  </h4>
                  <p className="text-xs text-[#7A6B63] mt-0.5">
                    Mengangkat usulan dalam rapat dengar pendapat umum (RDPU) dan Banggar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="font-serif font-bold text-base text-[#D47A6A]">04</span>
                <div>
                  <h4 className="font-bold text-xs text-[#332A26] uppercase tracking-wider">
                    Realisasi &amp; Laporan Balik
                  </h4>
                  <p className="text-xs text-[#7A6B63] mt-0.5">
                    Mengabarkan hasil tindak lanjut kebijakan kembali kepada konstituen.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 1E. BANNER KOLABORASI PERSIS GAMBAR */}
      <section className="pb-24 max-w-[1240px] mx-auto px-6 lg:px-10">
        <div className="rounded-3xl p-8 sm:p-12 bg-[#E2E8DC] border border-[#CCD8C4] flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="max-w-xl">
            <span className="font-serif italic text-2xl sm:text-3xl text-[#52604A] block">
              Mari Bersama Ciptakan
            </span>
            <h3 className="font-serif font-black text-3xl sm:text-4xl text-[#2F3929] leading-tight">
              Perubahan Konkret untuk Warga.
            </h3>
            <p className="text-xs sm:text-sm text-[#5B6753] mt-3 leading-relaxed">
              Kanal komunikasi dan posko informasi selalu terbuka untuk menerima masukan, ide pembangunan daerah, serta audiensi konstituen.
            </p>
          </div>

          <Link
            href={href('/kontak')}
            className="px-8 py-4 rounded-full bg-[#3F4D39] hover:bg-[#2C3727] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg transition-all shrink-0"
          >
            <span>Hubungi Posko Reses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: ARTIKEL & TELAAH (DENGAN GAMBAR ARTIKEL YANG JELAS)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-[#F5EFE6] border-y border-[#EAE0D3]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
                PUBLIKASI KEBIJAKAN
              </span>
              <h2 className="font-serif font-normal text-3xl sm:text-4xl text-[#332A26]">
                Artikel &amp; Risalah Pemikiran
              </h2>
            </div>
            <Link
              href={href('/artikel')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D47A6A] hover:text-[#B85E4E] transition-colors"
            >
              <span>Lihat Semua Artikel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Grid Artikel Menampilkan Gambar Artikel */}
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
                  className="group bg-white rounded-3xl border border-[#EDE5DA] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Gambar Artikel Jelas */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FAF7F2]">
                    <img
                      src={imgUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
                      }}
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#D47A6A] text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                      {cat}
                    </div>
                  </div>

                  {/* Konten Artikel */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#332A26] group-hover:text-[#D47A6A] transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs text-[#7A6B63] line-clamp-3 leading-relaxed">
                        {excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#F3ECE1] flex items-center justify-between text-[11px] text-[#8C7D73] font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#D47A6A]" />
                        {dateStr}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-[#D47A6A] group-hover:translate-x-1 transition-transform">
                        Baca ➔
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
          SECTION 3: INFOGRAFIS (DENGAN GAMBAR INFOGRAFIS YANG JELAS & LIGHTBOX)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-[#FAF7F2]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
                DATA &amp; TRANSPARANSI
              </span>
              <h2 className="font-serif font-normal text-3xl sm:text-4xl text-[#332A26]">
                Infografis Capaian Dewan
              </h2>
            </div>
            <Link
              href={href('/infografis')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D47A6A] hover:text-[#B85E4E] transition-colors"
            >
              <span>Lihat Semua Infografis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Grid Infografis Menampilkan Gambar Poster/Grafis */}
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
                  className="group relative rounded-3xl overflow-hidden bg-white border border-[#EDE5DA] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Gambar Infografis */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FAF7F2]">
                    <img
                      src={imgUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-[#332A26] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow">
                      <Maximize2 className="w-4 h-4 font-bold" />
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      {item.metric && (
                        <div className="font-serif font-bold text-3xl text-white tracking-tight">
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

                  <div className="p-4 bg-white flex items-center justify-between text-xs text-[#8C7D73]">
                    <span className="font-semibold text-[#D47A6A]">{cat}</span>
                    <span className="font-bold text-[#332A26] group-hover:text-[#D47A6A] transition-colors">
                      Lihat Grafik ➔
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
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white text-[#332A26] hover:bg-[#D47A6A] hover:text-white flex items-center justify-center shadow transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-[#FAF7F2] flex items-center justify-center p-6">
              <img
                src={
                  activeModalInfo.imageUrl ||
                  activeModalInfo.posterUrl ||
                  '/images/showcase-infografis-apbd.jpg'
                }
                alt={activeModalInfo.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div>
                <span className="px-3.5 py-1 rounded-full bg-[#FAF0EC] text-[#D47A6A] text-xs font-bold uppercase tracking-wider">
                  {activeModalInfo.category || 'Infografis Data'}
                </span>

                <h2 className="mt-4 font-serif font-bold text-2xl text-[#332A26] leading-snug">
                  {activeModalInfo.title}
                </h2>

                {activeModalInfo.metric && (
                  <div className="mt-4 p-4 rounded-2xl bg-[#F8F5EE] border border-[#EDE5DA]">
                    <div className="font-serif font-black text-3xl text-[#D47A6A]">
                      {activeModalInfo.metric}
                    </div>
                    <div className="text-xs text-[#8A7D75] font-semibold">
                      {activeModalInfo.metricLabel || 'Capaian Terdata'}
                    </div>
                  </div>
                )}

                <p className="mt-4 text-xs sm:text-sm text-[#6E635C] leading-relaxed">
                  {activeModalInfo.description ||
                    'Publikasi grafik kinerja akuntabel mengenai alokasi anggaran daerah, serapan aspirasi reses, dan realisasi program advokasi rakyat.'}
                </p>
              </div>

              <div className="pt-6 border-t border-[#F0E8DC] flex items-center gap-3">
                <a
                  href={
                    activeModalInfo.imageUrl ||
                    activeModalInfo.posterUrl ||
                    '/images/showcase-infografis-apbd.jpg'
                  }
                  download
                  className="px-6 py-2.5 rounded-full bg-[#D47A6A] hover:bg-[#B85E4E] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Dokumen
                </a>
                <button
                  type="button"
                  onClick={() => setActiveModalInfo(null)}
                  className="px-5 py-2.5 rounded-full border border-[#D5C9BD] text-[#6E635C] hover:text-[#332A26] text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </BlushEditorialShell>
  );
}
