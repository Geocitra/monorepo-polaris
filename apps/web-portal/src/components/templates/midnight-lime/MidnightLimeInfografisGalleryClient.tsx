'use client';

import React, { useState } from 'react';
import { Download, Maximize2, X, Sparkles } from 'lucide-react';

interface MidnightLimeInfografisGalleryClientProps {
  infographics: any[];
  member: any;
  theme: any;
  subdomain?: string;
}

export function MidnightLimeInfografisGalleryClient({
  infographics = [],
  member,
  theme,
  subdomain,
}: MidnightLimeInfografisGalleryClientProps) {
  const primaryColor = theme?.primaryHexColor || '#D4F63D';
  const [activeModalInfo, setActiveModalInfo] = useState<any | null>(null);

  const defaultItems = [
    {
      id: 'lime-info-1',
      title: 'Transparansi APBD Sektor Kesehatan & BPJS PBI',
      category: 'Kesehatan Publik',
      excerpt: 'Visualisasi alokasi pos belanja jaminan kesehatan daerah bagi masyarakat prasejahtera.',
    },
    {
      id: 'lime-info-2',
      title: 'Peta Penyerapan Aspirasi & Realisasi Fisik Jalan Poros',
      category: 'Infrastruktur',
      excerpt: 'Sebaran 32 titik perbaikan jalan penghubung antar-desa yang berhasil dituntaskan.',
    },
    {
      id: 'lime-info-3',
      title: 'Alokasi Beasiswa Siswa Kurang Mampu & Berprestasi',
      category: 'Pendidikan',
      excerpt: 'Penyaluran beasiswa daerah bagi 2.400 pelajar dan mahasiswa di seluruh kecamatan dapil.',
    },
  ];

  const displayList = infographics.length > 0 ? infographics : defaultItems;

  return (
    <div className="py-12 sm:py-16 bg-[#0C111F] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {displayList.map((item: any, idx: number) => (
            <div
              key={item.id || idx}
              className="group flex flex-col justify-between rounded-3xl bg-[#131B2D] border border-white/5 hover:border-[#D4F63D]/40 overflow-hidden shadow-xl transition-all"
            >
              <div className="aspect-[4/3] bg-[#172238] p-6 relative flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#D4F63D]/15 text-[#D4F63D] border border-[#D4F63D]/30">
                    {item.category || 'Transparansi Data'}
                  </span>
                  <button
                    onClick={() => setActiveModalInfo(item)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="my-auto space-y-2 text-left">
                  <div className="h-2 w-1/3 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                  <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                </div>

                <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 border-t border-white/10">
                  <span>Data Resmi Komisi</span>
                  <span className="text-[#D4F63D] font-bold">Terverifikasi</span>
                </div>
              </div>

              <div className="p-6 space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#D4F63D] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.excerpt || 'Visualisasi data capaian dan transparansi alokasi belanja daerah.'}
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => setActiveModalInfo(item)}
                    className="text-xs font-bold text-[#D4F63D] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Detail Infografis</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {activeModalInfo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="relative bg-[#131B2D] border border-white/15 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 bg-[#172238] border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-md">
                {activeModalInfo.title}
              </h3>
              <button
                onClick={() => setActiveModalInfo(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-[#0E1526] overflow-y-auto space-y-4 text-left">
              <div className="p-8 rounded-2xl bg-[#131B2D] border border-white/10 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D4F63D]/20 text-[#D4F63D] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">{activeModalInfo.title}</h4>
                <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {activeModalInfo.excerpt || 'Infografis transparansi data resmi parlemen.'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#172238] border-t border-white/10 flex justify-end">
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
