'use client';

import React, { useState } from 'react';
import { Download, Maximize2, X, Sparkles } from 'lucide-react';

interface AmberPortfolioInfografisGalleryClientProps {
  infographics: any[];
  member: any;
  theme: any;
  subdomain?: string;
}

export function AmberPortfolioInfografisGalleryClient({
  infographics = [],
  member,
  theme,
  subdomain,
}: AmberPortfolioInfografisGalleryClientProps) {
  const primaryColor = theme?.primaryHexColor || '#EA580C';
  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);

  // Default mock infographics if empty
  const defaultItems = [
    {
      id: 'info-1',
      title: 'Alokasi APBD Sektor Pendidikan & Beasiswa Daerah',
      category: 'Anggaran & APBD',
      imageUrl: '/images/default-infographic.png',
      excerpt: 'Visualisasi penyaluran 20% mandatory spending pendidikan untuk renovasi ruang kelas dan beasiswa siswa berprestasi.',
    },
    {
      id: 'info-2',
      title: 'Pengawalan Fasilitas Kesehatan & Kuota BPJS PBI',
      category: 'Kesehatan Publik',
      imageUrl: '/images/default-infographic.png',
      excerpt: 'Peningkatan alokasi jaminan kesehatan bagi 45.000 warga prasejahtera di seluruh wilayah dapil.',
    },
    {
      id: 'info-3',
      title: 'Peta Realisasi Infrastruktur Jalan & Jembatan',
      category: 'Infrastruktur',
      imageUrl: '/images/default-infographic.png',
      excerpt: 'Sebaran 128 titik perbaikan jalan poros desa dan pembangunan jembatan penghubung antarkecamatan.',
    },
  ];

  const displayList = infographics.length > 0 ? infographics : defaultItems;

  return (
    <div className="py-12 sm:py-16 bg-[#0A0908] text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {displayList.map((item: any, idx: number) => (
            <div
              key={item.id || idx}
              className="group flex flex-col justify-between rounded-3xl bg-[#12100E] border border-white/10 hover:border-orange-500/50 overflow-hidden shadow-xl transition-all"
            >
              {/* Graphic Mock Preview */}
              <div className="aspect-[4/3] bg-[#1C1A17] p-6 relative flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                    {item.category || 'Transparansi Kinerja'}
                  </span>
                  <button
                    onClick={() => setActiveModalInfo(item)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
                    title="Perbesar Infografis"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="my-auto space-y-2 text-left">
                  <div className="h-2 w-1/3 bg-orange-500/50 rounded-full" />
                  <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                  <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                </div>

                <div className="pt-2 flex justify-between items-center text-[10px] text-stone-400 border-t border-white/10">
                  <span>Data Resmi Parlemen</span>
                  <span className="text-emerald-400 font-bold">Terverifikasi</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="p-6 space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                  {item.excerpt || 'Visualisasi data transparansi dan capaian kinerja pengawalan kebijakan.'}
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => setActiveModalInfo(item)}
                    className="text-xs text-[#EA580C] hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Lihat Detail Infografis</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* MODAL DIALOG INFOGRAFIS */}
      {activeModalInfo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="relative bg-[#141210] border border-white/15 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 bg-[#1A1815] border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-md">
                {activeModalInfo.title}
              </h3>
              <button
                onClick={() => setActiveModalInfo(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-[#0E0C0A] overflow-y-auto space-y-4 text-left">
              <div className="p-8 rounded-2xl bg-[#181613] border border-white/10 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">{activeModalInfo.title}</h4>
                <p className="text-xs text-stone-300 max-w-lg mx-auto leading-relaxed">
                  {activeModalInfo.excerpt || 'Infografis transparansi kebijakan dan alokasi anggaran daerah resmi.'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#1A1815] border-t border-white/10 flex justify-end">
              <button
                onClick={() => setActiveModalInfo(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
