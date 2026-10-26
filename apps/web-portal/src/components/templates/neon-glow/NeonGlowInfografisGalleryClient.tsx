'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Eye,
  X,
  Share2,
  Calendar,
  Filter,
  Check,
  Maximize2,
  Terminal,
  Cpu,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface NeonGlowInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
}

export function NeonGlowInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: NeonGlowInfografisGalleryClientProps) {
  const fallbackList = [
    {
      id: 'demo-info-1',
      title: 'Transparansi APBD: Alokasi Belanja TIK Sekolah Desa 2026',
      slug: 'transparansi-apbd-alokasi-belanja-tik-sekolah-desa',
      imageUrl: '/images/showcase-infografis-apbd.jpg',
      posterUrl: '/images/showcase-infografis-apbd.jpg',
      category: 'ANGGARAN & APBD',
      excerpt:
        'Rincian alokasi anggaran pengadaan laboratorium komputer dan sarana digital di 45 sekolah pelosok daerah pemilihan.',
      publishedAt: '2026-09-01T00:00:00.000Z',
    },
    {
      id: 'demo-info-2',
      title: 'Penguatan Ketahanan Pangan & Distribusi Pupuk Subsidi Petani',
      slug: 'penguatan-ketahanan-pangan-distribusi-pupuk-subsidi',
      imageUrl: '/images/showcase-artikel-pertanian.jpg',
      posterUrl: '/images/showcase-artikel-pertanian.jpg',
      category: 'PERTANIAN & PANGAN',
      excerpt:
        'Sistem digitalisasi penebusan pupuk bersubsidi dan pengawasan kuota kelompok tani untuk mencegah kelangkaan panen raya.',
      publishedAt: '2026-08-25T00:00:00.000Z',
    },
  ];

  const infographics =
    initialInfographics && initialInfographics.length > 0
      ? initialInfographics
      : fallbackList;

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeModalItem, setActiveModalItem] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Derive categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    infographics.forEach((item) => {
      const cat = item.category || item.issueCategory;
      if (cat) set.add(cat.toUpperCase());
    });
    return ['Semua', ...Array.from(set)];
  }, [infographics]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Semua') return infographics;
    return infographics.filter(
      (item) =>
        (item.category || item.issueCategory || '').toUpperCase() ===
        selectedCategory.toUpperCase()
    );
  }, [infographics, selectedCategory]);

  const handleShare = (item: any) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (imageUrl: string, title: string) => {
    if (typeof window !== 'undefined') {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-10">
      {/* ─── 1. CYBER CATEGORY FILTER PILLS ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono">
          <Filter className="w-3.5 h-3.5 text-purple-500 shrink-0 mr-1" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border border-purple-900/40 hover:border-purple-500/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-mono text-slate-400 self-end sm:self-center">
          STATUS: <span className="text-cyan-400 font-bold">{filteredItems.length}</span> INFOGRAFIS PUBLIK
        </span>
      </div>

      {/* ─── 2. INFOGRAPHICS CYBER GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {filteredItems.map((info) => {
          const imgSrc =
            info.imageUrl ||
            info.posterUrl ||
            info.featuredImageUrl ||
            '/images/showcase-infografis-apbd.jpg';
          return (
            <div
              key={info.id || info.slug}
              className="group rounded-3xl bg-[#0C1022]/90 border border-purple-900/40 hover:border-purple-500/50 p-6 flex flex-col justify-between space-y-6 transition-all duration-300 shadow-xl hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-950/50"
            >
              <div className="space-y-4">
                {/* Visual Image Preview */}
                <div
                  onClick={() => setActiveModalItem(info)}
                  className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-purple-900/30 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={info.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.05]"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-lg shadow-purple-600/40 hover:opacity-95 transition-all"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
                      <span>PERBESAR RESOLUSI</span>
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-2 text-[11px] font-mono text-purple-300">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20 uppercase">
                    {info.category || info.issueCategory || 'INFOGRAFIS RESMI'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    {info.publishedAt ? formatDateIndonesian(info.publishedAt) : 'Terbaru'}
                  </span>
                </div>

                <h3
                  onClick={() => setActiveModalItem(info)}
                  className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors cursor-pointer leading-snug"
                >
                  {info.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 font-normal">
                  {info.excerpt ||
                    info.prompt ||
                    'Visualisasi ringkas mengenai realisasi anggaran dan serapan advokasi kebijakan publik untuk warga daerah pemilihan.'}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-purple-900/40 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(info)}
                  className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspeksi Detail</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(imgSrc, info.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-200 text-xs font-mono font-bold border border-purple-900/40 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>Unduh PNG</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── 3. LIGHTBOX CYBER MODAL ─── */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0C1022] border border-purple-900/50 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-purple-950/80">
            {/* Header */}
            <div className="px-6 py-4 border-b border-purple-900/40 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-cyan-300 font-bold text-xs uppercase border border-purple-500/20">
                  {activeModalItem.category || 'INFOGRAFIS RESMI'}
                </span>
                <span className="text-xs text-slate-400">
                  {activeModalItem.publishedAt
                    ? formatDateIndonesian(activeModalItem.publishedAt)
                    : 'Publikasi Resmi'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Full Image */}
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-purple-900/30 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    activeModalItem.imageUrl ||
                    activeModalItem.posterUrl ||
                    activeModalItem.featuredImageUrl ||
                    '/images/showcase-infografis-apbd.jpg'
                  }
                  alt={activeModalItem.title}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {activeModalItem.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {activeModalItem.excerpt ||
                    activeModalItem.prompt ||
                    'Visualisasi data capaian dan transparansi kebijakan yang dipublikasikan secara resmi oleh sekretariat fraksi parlemen.'}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-purple-900/40 bg-[#070913] flex flex-wrap items-center justify-between gap-4 font-mono">
              <button
                type="button"
                onClick={() => handleShare(activeModalItem)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950/80 text-slate-300 hover:text-white text-xs font-bold border border-purple-900/40 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-purple-400" />}
                <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      activeModalItem.imageUrl ||
                        activeModalItem.posterUrl ||
                        activeModalItem.featuredImageUrl ||
                        '/images/showcase-infografis-apbd.jpg',
                      activeModalItem.title
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all cursor-pointer font-sans"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Resolusi Penuh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
