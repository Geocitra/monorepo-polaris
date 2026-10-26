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
  Sparkles,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface WarmPortfolioInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
}

export function WarmPortfolioInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: WarmPortfolioInfografisGalleryClientProps) {
  const fallbackList = [
    {
      id: 'demo-info-1',
      title: 'Transparansi APBD: Alokasi Belanja TIK Sekolah Desa 2026',
      slug: 'transparansi-apbd-alokasi-belanja-tik-sekolah-desa',
      imageUrl: '/images/showcase-infografis-apbd.jpg',
      posterUrl: '/images/showcase-infografis-apbd.jpg',
      category: 'ANGGARAN & APBD',
      publishedAt: '2026-09-10T08:00:00.000Z',
      excerpt:
        'Rincian pembelanjaan perangkat komputer dan penguatan konektivitas jaringan internet di 32 sekolah terpencil.',
    },
    {
      id: 'demo-info-2',
      title: 'Penguatan Ketahanan Pangan & Distribusi Pupuk Subsidi Petani',
      slug: 'penguatan-ketahanan-pangan-distribusi-pupuk-subsidi',
      imageUrl: '/images/showcase-artikel-pertanian.jpg',
      posterUrl: '/images/showcase-artikel-pertanian.jpg',
      category: 'PERTANIAN & PANGAN',
      publishedAt: '2026-08-28T09:00:00.000Z',
      excerpt:
        'Sistem pemantauan digital alokasi pupuk bersubsidi untuk mencegah spekulan dan menjamin ketersediaan di tingkat petani.',
    },
    {
      id: 'demo-info-3',
      title: 'Laboratorium Digital & Pemerataan Akses Pendidikan 3T',
      slug: 'laboratorium-digital-pemerataan-internet-sekolah',
      imageUrl: '/images/showcase-poster-surya.jpg',
      posterUrl: '/images/showcase-poster-surya.jpg',
      category: 'PENDIDIKAN 3T',
      publishedAt: '2026-08-15T10:00:00.000Z',
      excerpt:
        'Peta sebaran bantuan sarana belajar digital untuk madrasah dan sekolah menengah pertama di wilayah pelosok dapil.',
    },
    {
      id: 'demo-info-4',
      title: 'Konektivitas Jembatan & Jalan Usaha Tani Antardesa 2026',
      slug: 'konektivitas-jembatan-jalan-usaha-tani',
      imageUrl: '/images/showcase-infografis-apbd.jpg',
      posterUrl: '/images/showcase-infografis-apbd.jpg',
      category: 'INFRASTRUKTUR',
      publishedAt: '2026-08-01T10:00:00.000Z',
      excerpt:
        'Pemetaan 18 jembatan gantung dan pelebaran jalan poros desa untuk memangkas ongkos logistik panen warga.',
    },
  ];

  const rawList = initialInfographics.length > 0 ? initialInfographics : fallbackList;
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    rawList.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['Semua', ...Array.from(set)];
  }, [rawList]);

  // Filtered items
  const filteredList = useMemo(() => {
    if (selectedCategory === 'Semua') return rawList;
    return rawList.filter((item) => item.category === selectedCategory);
  }, [rawList, selectedCategory]);

  const handleShare = (info: any) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/infografis#${info.slug || info.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* ─── CATEGORY FILTER PILLS ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <Filter className="w-4 h-4 text-stone-400 shrink-0 ml-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#181311] text-white shadow-sm'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── INFOGRAPHICS GRID (CHAMFERED CARDS) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((item, idx) => {
          const img = item.imageUrl || item.posterUrl || '/images/showcase-infografis-apbd.jpg';
          const formattedDate = item.publishedAt
            ? formatDateIndonesian(item.publishedAt)
            : 'Terbaru';

          return (
            <div
              key={item.id || item.slug || idx}
              className="group bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm hover:border-[#F59E0B] hover:shadow-lg transition-all flex flex-col justify-between"
              style={{
                clipPath: 'polygon(16px 0%, 100% 0%, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0% 100%, 0% 16px)',
              }}
            >
              {/* Image Preview with Hover Overlay */}
              <div
                onClick={() => setActiveModalInfo(item)}
                className="relative aspect-[4/3] bg-stone-100 cursor-pointer overflow-hidden"
              >
                <img
                  src={img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 text-stone-900 font-bold text-xs shadow-md">
                    <Maximize2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Lihat Ukuran Penuh</span>
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-[#181311]/85 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider">
                    {item.category || 'INFOGRAFIS'}
                  </span>
                </div>
              </div>

              {/* Text Information & Actions */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] text-stone-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3" />
                    {formattedDate}
                  </span>
                  <h3
                    onClick={() => setActiveModalInfo(item)}
                    className="font-serif font-bold text-base text-stone-950 group-hover:text-[#F59E0B] transition-colors cursor-pointer line-clamp-2 leading-snug"
                  >
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-light">
                      {item.excerpt}
                    </p>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => setActiveModalInfo(item)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-stone-800 hover:text-[#F59E0B] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Pratinjau</span>
                  </button>

                  <a
                    href={img}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── FULLSCREEN LIGHTBOX MODAL ─── */}
      {activeModalInfo && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200"
            style={{
              clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
            }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#181311] text-white flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-stone-100 truncate max-w-lg">
                  {activeModalInfo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalInfo(null)}
                className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Image Scroll */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 flex items-center justify-center">
              <img
                src={activeModalInfo.imageUrl || activeModalInfo.posterUrl || '/images/showcase-infografis-apbd.jpg'}
                alt={activeModalInfo.title}
                className="max-h-[60vh] w-auto object-contain rounded-xl shadow-lg border border-stone-300"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-6 bg-white border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/60">
                  {activeModalInfo.category || 'INFOGRAFIS'}
                </span>
                <p className="text-xs text-stone-600 max-w-md pt-1">
                  {activeModalInfo.excerpt || 'Data resmi visualisasi kebijakan parlemen untuk keterbukaan publik.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleShare(activeModalInfo)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF7F2] border border-stone-200 text-stone-800 text-xs font-bold hover:bg-stone-100 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tautan Tersalin' : 'Bagikan'}</span>
                </button>
                <a
                  href={activeModalInfo.imageUrl || activeModalInfo.posterUrl || '/images/showcase-infografis-apbd.jpg'}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#181311] text-white text-xs font-bold hover:bg-stone-800 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Unduh Dokumen Resolusi Penuh</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
