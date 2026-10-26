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
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface CleanEditorialInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
}

export function CleanEditorialInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: CleanEditorialInfografisGalleryClientProps) {
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
    {
      id: 'demo-info-3',
      title: 'Laboratorium Digital & Pemerataan Internet Sekolah 3T',
      slug: 'laboratorium-digital-pemerataan-internet-sekolah',
      imageUrl: '/images/showcase-poster-surya.jpg',
      posterUrl: '/images/showcase-poster-surya.jpg',
      category: 'PENDIDIKAN 3T',
      excerpt:
        'Penyediaan akses internet satelit dan panel surya mandiri di fasilitas pendidikan terpencil konstituen.',
      publishedAt: '2026-08-15T00:00:00.000Z',
    },
  ];

  const infographics =
    initialInfographics && initialInfographics.length > 0
      ? initialInfographics
      : fallbackList;

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeModalItem, setActiveModalItem] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Derive categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    infographics.forEach((item) => {
      const cat = item.category || item.issueCategory;
      if (cat) set.add(cat.toUpperCase());
    });
    return ['Semua', ...Array.from(set)];
  }, [infographics]);

  // Filtered items
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
    <div className="space-y-10 py-6 sm:py-10">
      {/* ─── 1. CATEGORY FILTER PILLS ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-mono text-slate-500 self-end sm:self-center font-bold">
          STATUS: <span className="text-[#6366F1] font-bold">{filteredItems.length}</span> INFOGRAFIS PUBLIK
        </span>
      </div>

      {/* ─── 2. INFOGRAPHICS EDITORIAL GRID ─── */}
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
              className="group rounded-3xl bg-white border border-slate-200/90 hover:border-purple-300 p-6 flex flex-col justify-between space-y-6 transition-all duration-300 shadow-2xs hover:shadow-xl hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Visual Image Preview */}
                <div
                  onClick={() => setActiveModalItem(info)}
                  className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-100 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={info.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.02]"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-bold font-mono flex items-center gap-2 shadow-md hover:bg-slate-100 transition-all"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[#6366F1]" />
                      <span>PERBESAR RESOLUSI</span>
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-[#6366F1] font-bold border border-purple-100 uppercase">
                    {info.category || info.issueCategory || 'INFOGRAFIS RESMI'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3 text-[#6366F1]" />
                    {info.publishedAt ? formatDateIndonesian(info.publishedAt) : 'Terbaru'}
                  </span>
                </div>

                {/* Title & Excerpt */}
                <h3 className="text-lg sm:text-xl font-editorial-serif font-bold text-slate-900 group-hover:text-[#6366F1] transition-colors leading-snug line-clamp-2">
                  {info.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed font-normal">
                  {info.excerpt ||
                    info.prompt ||
                    'Visualisasi data transparansi anggaran daerah dan capaian fungsi legislasi pengawasan parlemen.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(info)}
                  className="text-xs font-mono font-bold text-slate-900 hover:text-[#6366F1] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Inspeksi Visual</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(imgSrc, info.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F9FD] hover:bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Unduh PNG</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── 3. LIGHTBOX CLEAN EDITORIAL MODAL ─── */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-[#6366F1] font-bold text-xs uppercase border border-purple-100">
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
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Full Image */}
              <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
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
                <h2 className="text-xl sm:text-2xl font-editorial-serif font-bold text-slate-900">
                  {activeModalItem.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {activeModalItem.excerpt ||
                    activeModalItem.prompt ||
                    'Visualisasi data capaian dan transparansi kebijakan yang dipublikasikan secara resmi oleh sekretariat dewan perwakilan rakyat.'}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 bg-[#F8F9FD] flex flex-wrap items-center justify-between gap-4 font-mono">
              <button
                type="button"
                onClick={() => handleShare(activeModalItem)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:text-slate-950 text-xs font-bold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#6366F1]" />}
                <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#6366F1]" />
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
