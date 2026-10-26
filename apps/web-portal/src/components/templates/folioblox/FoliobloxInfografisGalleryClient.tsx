'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Share2,
  Calendar,
  X,
  Maximize2,
  Check,
  Sparkles,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface FoliobloxInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
}

export function FoliobloxInfografisGalleryClient({
  initialInfographics = [],
  member,
  theme,
}: FoliobloxInfografisGalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const fallbackInfographics = [
    {
      id: 'fb-info-1',
      title: 'Transparansi APBD: Alokasi Belanja Modal Sektor Pendidikan & Beasiswa 2026',
      category: 'APBD & Anggaran',
      metric: 'Rp 45,2 M',
      metricLabel: 'Alokasi Kawalan',
      imageUrl: '/images/showcase-infografis-apbd.jpg',
      createdAt: new Date().toISOString(),
      description: 'Perincian alokasi belanja modal fungsi pendidikan, perbaikan fasilitas ruang kelas, dan beasiswa perguruan tinggi putra-putri daerah.',
    },
    {
      id: 'fb-info-2',
      title: 'Peta Capaian Pembangunan Jalan Poros & Konektivitas Desa',
      category: 'Infrastruktur',
      metric: '98,4%',
      metricLabel: 'Target Tuntas',
      imageUrl: '/images/showcase-poster-surya.jpg',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      description: 'Pengawasan berkala pemeliharaan jalan poros antar-kecamatan dan perbaikan jembatan sentra produksi pertanian.',
    },
    {
      id: 'fb-info-3',
      title: 'Distribusi Alsintan & Kuota Pupuk Subsidi Kelompok Tani',
      category: 'Pertanian & Pangan',
      metric: '1.420+',
      metricLabel: 'Kelompok Tani',
      imageUrl: '/images/article-crop-2.png',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      description: 'Penyaluran bantuan traktor roda dua, pompa air irigasi, dan verifikasi alokasi pupuk bersubsidi tepat sasaran di seluruh dapil.',
    },
    {
      id: 'fb-info-4',
      title: 'Kanal Advokasi Publik & Rekapitulasi Aspirasi Warga 24/7',
      category: 'Pelayanan Publik',
      metric: '24/7',
      metricLabel: 'Respon Cepat',
      imageUrl: '/images/parliament-panoramic-banner.png',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      description: 'Rekapitulasi berkala tindak lanjut laporan warga melalui rapat dengar pendapat komisi dewan.',
    },
    {
      id: 'fb-info-5',
      title: 'Revitalisasi Fasilitas Layanan Puskesmas Rawat Inap',
      category: 'Kesehatan',
      metric: '32 Unit',
      metricLabel: 'Puskesmas',
      imageUrl: '/images/showcase-artikel-pertanian.jpg',
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      description: 'Pengadaan armada ambulans siaga desa dan jaminan ketersediaan obat-obatan esensial.',
    },
    {
      id: 'fb-info-6',
      title: 'Pemberdayaan Pelaku Usaha Mikro & Digitalisasi Pasar Tradisional',
      category: 'Ekonomi Kerakyatan',
      metric: '850+ Gerai',
      metricLabel: 'UMKM Binaan',
      imageUrl: '/images/article-crop-1.png',
      createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
      description: 'Pelatihan transaksi non-tunai, bantuan sertifikasi halal gratis, dan fasilitasi pendaftaran merek dagang UMKM.',
    },
  ];

  const infographics =
    initialInfographics && initialInfographics.length > 0
      ? initialInfographics
      : fallbackInfographics;

  const categories = useMemo(() => {
    const set = new Set<string>();
    infographics.forEach((item) => {
      const cat = item.category || item.categoryName;
      if (cat) set.add(cat);
    });
    return ['Semua', ...Array.from(set)];
  }, [infographics]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'Semua') return infographics;
    return infographics.filter(
      (item) => (item.category || item.categoryName) === selectedCategory
    );
  }, [infographics, selectedCategory]);

  const getInfographicImage = (info: any): string => {
    return (
      info?.imageUrl ||
      info?.posterUrl ||
      info?.featuredImageUrl ||
      info?.coverUrl ||
      '/images/showcase-infografis-apbd.jpg'
    );
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto space-y-12 select-text">
      
      {/* ─── CATEGORY FILTER PILLS ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#FF4500] text-white shadow-lg'
                : 'bg-[#141414] text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── INFOGRAPHICS GRID ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((info, idx) => {
          const img = getInfographicImage(info);
          const title = info.title || `Infografis Transparansi #${idx + 1}`;
          const metric = info.metric || (idx === 0 ? 'Rp 45,2 M' : idx === 1 ? '98,4%' : idx === 2 ? '1.420+' : '24/7');
          const metricLabel = info.metricLabel || (idx === 0 ? 'Alokasi Kawalan' : idx === 1 ? 'Target Tuntas' : idx === 2 ? 'Penerima Manfaat' : 'Respon Cepat');
          const category = info.category || info.categoryName || 'Transparansi Data';
          const dateStr = formatDateIndonesian(info.createdAt || new Date());

          return (
            <div
              key={info.id || idx}
              onClick={() => setActiveModalInfo(info)}
              className="group flex flex-col justify-between bg-[#141414] text-white rounded-[28px] border border-white/10 hover:border-orange-500/60 overflow-hidden transition-all duration-300 aspect-[3/4] sm:aspect-[4/5] p-6 relative cursor-pointer shadow-xl"
            >
              {/* Background Infographic Image with Cinematic Dark Contrast */}
              <div className="absolute inset-0 z-0">
                <img
                  src={img}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-60 group-hover:opacity-80 filter contrast-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/showcase-infografis-apbd.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </div>

              {/* Card Top: Category & Zoom */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-bold text-orange-400 border border-orange-500/40">
                  {category}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
                </div>
              </div>

              {/* Card Bottom: Big Metric & Info */}
              <div className="relative z-10 select-text">
                <div className="font-outfit font-black text-3xl sm:text-4xl text-white tracking-tight leading-none mb-1">
                  {metric}
                </div>
                <div className="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-2">
                  {metricLabel}
                </div>
                <h3 className="font-outfit font-black text-xl text-white/95 line-clamp-2 leading-snug">
                  {title}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-white/50 mt-2 font-semibold">
                  <Calendar className="w-3 h-3 text-orange-500" />
                  <span>{dateStr}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── INTERACTIVE LIGHTBOX MODAL ─── */}
      {activeModalInfo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveModalInfo(null)}
        >
          <div
            className="bg-[#141414] border border-orange-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                  {activeModalInfo.category || 'Infografis Kebijakan'}
                </span>
                <h3 className="font-outfit font-black text-xl sm:text-2xl text-white mt-1">
                  {activeModalInfo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalInfo(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A0A0A] flex items-center justify-center">
              <img
                src={getInfographicImage(activeModalInfo)}
                alt={activeModalInfo.title}
                className="max-h-[60vh] w-auto object-contain rounded-xl shadow-lg border border-white/10"
              />
            </div>

            {/* Footer */}
            <div className="p-5 sm:p-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 bg-[#121212]">
              <p className="text-xs sm:text-sm text-white/70 max-w-xl">
                {activeModalInfo.description ||
                  'Publikasi data transparansi resmi parlemen untuk keterbukaan informasi publik.'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-orange-400" />}
                  <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
                </button>
                <a
                  href={getInfographicImage(activeModalInfo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-5 py-2 rounded-full bg-[#FF4500] hover:bg-[#E03E00] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Gambar</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
