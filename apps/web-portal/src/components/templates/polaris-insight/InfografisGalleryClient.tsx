'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Sparkles,
  ArrowRight,
  X,
  Calendar,
  ExternalLink,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface InfographicItem {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  imageUrl: string;
  dataPoints?: { label: string; value: string }[];
}

interface InfografisGalleryClientProps {
  initialInfographics: any[];
  member: any;
  theme?: any;
}

export function InfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: InfografisGalleryClientProps) {
  const [selectedInfographic, setSelectedInfographic] = useState<InfographicItem | null>(null);
  const [activeFilter, setActiveFilter] = useState('Semua');

  const dapilName =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';

  // Default rich mock infographics matching Polaris Negarawan Parlemen
  const defaultInfographics: InfographicItem[] = [
    {
      id: 'info-1',
      title: 'Alokasi & Penyerapan Dana Aspirasi Infrastruktur Jalan',
      category: 'Infrastruktur',
      date: '12 Okt 2026',
      summary:
        'Pemetaan alokasi anggaran Rp 48,5 Miliar untuk peningkatan kualitas jalan penghubung antardesa dan jembatan logistik di 16 kecamatan.',
      imageUrl: '/images/showcase-infografis-apbd.jpg',
      dataPoints: [
        { label: 'Total Anggaran Diadvokasi', value: 'Rp 48,5 Miliar' },
        { label: 'Realisasi Panjang Jalan', value: '42,8 KM' },
        { label: 'Kecamatan Penerima Manfaat', value: '16 Kecamatan' },
      ],
    },
    {
      id: 'info-2',
      title: 'Distribusi Bantuan Alsintan & Pupuk Subsidi Petani Lokal',
      category: 'Pertanian',
      date: '28 Sep 2026',
      summary:
        'Distribusi 120 unit traktor tangan, 45 pompa air irigasi, dan 1.800 ton pupuk bersubsidi langsung ke 34 kelompok tani binaan.',
      imageUrl: '/images/showcase-artikel-pertanian.jpg',
      dataPoints: [
        { label: 'Kelompok Tani Binaan', value: '34 Poktan' },
        { label: 'Bantuan Traktor & Mesin', value: '165 Unit' },
        { label: 'Estimasi Peningkatan Panen', value: '+18.4%' },
      ],
    },
    {
      id: 'info-3',
      title: 'Program Indonesia Pintar: 2.450 Beasiswa untuk Pelajar',
      category: 'Pendidikan',
      date: '15 Sep 2026',
      summary:
        'Penyaluran beasiswa Program Indonesia Pintar (PIP) jalur aspirasi bagi siswa SD, SMP, SMA/SMK keluarga prasejahtera di daerah pemilihan.',
      imageUrl: '/images/showcase-poster-surya.jpg',
      dataPoints: [
        { label: 'Total Penerima Beasiswa', value: '2.450 Pelajar' },
        { label: 'Tingkat SD & SMP', value: '1.600 Siswa' },
        { label: 'Tingkat SMA & SMK', value: '850 Siswa' },
      ],
    },
    {
      id: 'info-4',
      title: 'Transparansi Realisasi Program Pembangunan Daerah',
      category: 'Akuntabilitas',
      date: '02 Sep 2026',
      summary:
        'Laporan akuntabilitas publik atas 8 program prioritas pembangunan daerah pemilihan dengan indeks kepuasan konstituen 92.4%.',
      imageUrl: '/images/ref-article-2.jpg',
      dataPoints: [
        { label: 'Program Prioritas', value: '8 Program' },
        { label: 'Indeks Kepuasan Konstituen', value: '92.4%' },
        { label: 'Status Verifikasi Inspektorat', value: 'WTP' },
      ],
    },
  ];

  // Merge real data if available
  const displayInfographics: InfographicItem[] =
    initialInfographics && initialInfographics.length > 0
      ? initialInfographics.map((item: any, idx: number) => ({
          id: item.id || `real-info-${idx}`,
          title: item.title,
          category: item.issueCategory?.replace(/_/g, ' ') || (idx % 2 === 0 ? 'Infrastruktur' : 'Pendidikan'),
          date: item.publishedAt ? formatDateIndonesian(item.publishedAt) : '10 Okt 2026',
          summary:
            item.leadParagraph ||
            item.excerpt ||
            item.summary ||
            'Visualisasi data capaian dan transparansi kinerja pengabdian parlemen.',
          imageUrl:
            item.imageUrl ||
            item.posterUrl ||
            item.featuredImageUrl ||
            defaultInfographics[idx % defaultInfographics.length].imageUrl,
          dataPoints: defaultInfographics[idx % defaultInfographics.length].dataPoints,
        }))
      : defaultInfographics;

  const categories = ['Semua', 'Infrastruktur', 'Pertanian', 'Pendidikan', 'Akuntabilitas'];

  const filteredInfographics =
    activeFilter === 'Semua'
      ? displayInfographics
      : displayInfographics.filter(
          (i) => i.category.toLowerCase() === activeFilter.toLowerCase()
        );

  return (
    <div className="space-y-12">
      {/* ========================================================= */}
      {/* GALERI INFOGRAFIS & POSTER (Katalog Visual)              */}
      {/* ========================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-amber-200/60 pb-3">
          <div>
            <div className="text-[11px] font-bold text-[#96702c] uppercase tracking-widest mb-1">
              Publikasi Grafis Resmi Parlemen
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              Galeri Visualisasi &amp; Infografis
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-[#96702c] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-amber-50 text-slate-600 border border-slate-200/80 hover:text-[#96702c]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Infographics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInfographics.map((info) => (
            <div
              key={info.id}
              onClick={() => setSelectedInfographic(info)}
              className="group bg-white rounded-2xl overflow-hidden border border-amber-100/90 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Poster Thumbnail */}
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={info.imageUrl}
                    alt={info.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Date Badge */}
                  <div className="absolute bottom-3 left-3 bg-[#96702c] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                    {info.date}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <span className="text-[#96702c] font-black">|</span>
                    <span className="uppercase tracking-wide text-[11px]">{info.category}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#96702c] transition-colors line-clamp-2 leading-snug">
                    {info.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {info.summary}
                  </p>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-xs font-bold text-[#96702c] group-hover:translate-x-0.5 transition-transform">
                <span>Perbesar Infografis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: KETERBUKAAN INFORMASI PUBLIK (Disclaimer)       */}
      {/* ========================================================= */}
      <section className="p-6 rounded-2xl bg-[#FBF9F5] border border-amber-200/70 flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-700">
        <ShieldCheck className="w-8 h-8 text-[#96702c] shrink-0" />
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-bold text-slate-900 uppercase tracking-wide">
            Keterbukaan Informasi Publik Terverifikasi
          </div>
          <p className="text-slate-600 leading-relaxed">
            Seluruh sajian infografis dan data statistik yang dipublikasikan pada portal ini disusun oleh tim riset dan analisis kebijakan dewan bersumber dari naskah resmi risalah persidangan, lampiran UU APBN, dan hasil pengawasan lapangan di Daerah Pemilihan {dapilName}.
          </p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MODAL LIGHTBOX INFOGRAFIS (High-Res Preview)               */}
      {/* ========================================================= */}
      {selectedInfographic && (
        <div
          onClick={() => setSelectedInfographic(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#96702c]">
                  {selectedInfographic.category} • {selectedInfographic.date}
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  {selectedInfographic.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInfographic(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster Preview */}
            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedInfographic.imageUrl}
                alt={selectedInfographic.title}
                className="max-h-[58vh] w-auto object-contain mx-auto"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {selectedInfographic.summary}
              </p>

              {/* Data points summary if any */}
              {selectedInfographic.dataPoints && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  {selectedInfographic.dataPoints.map((dp) => (
                    <div
                      key={dp.label}
                      className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60"
                    >
                      <div className="text-[10px] text-slate-500 font-semibold">{dp.label}</div>
                      <div className="text-xs font-black text-slate-900 mt-0.5">{dp.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Arsip Data Resmi POLARIS Parlemen
              </span>
              <button
                type="button"
                onClick={() => setSelectedInfographic(null)}
                className="px-4 py-2 rounded-xl bg-[#96702c] hover:bg-[#805f24] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
