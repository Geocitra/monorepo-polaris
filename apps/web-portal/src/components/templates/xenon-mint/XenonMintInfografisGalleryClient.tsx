'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye,
  X,
  Download,
  BarChart3,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { XenonMintShell } from './XenonMintShell';
import { getXenonMemberInfo, useXenonHref, XENON_THEME } from './utils';

interface XenonMintInfografisGalleryClientProps {
  member: any;
  theme: any;
  infographics?: any[];
  initialInfographics?: any[];
  subdomain?: string;
}

export function XenonMintInfografisGalleryClient({
  member,
  theme,
  infographics,
  initialInfographics,
  subdomain,
}: XenonMintInfografisGalleryClientProps) {
  const info = getXenonMemberInfo(member, theme, subdomain);
  const href = useXenonHref(subdomain);

  const effectiveInfographics = infographics || initialInfographics || [];

  const [selectedInfographic, setSelectedInfographic] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const allInfographics = useMemo(() => {
    if (effectiveInfographics && effectiveInfographics.length > 0) {
      return effectiveInfographics.map((inf: any, i: number) => ({
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
      }));
    }
    return [];
  }, [effectiveInfographics]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allInfographics.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [allInfographics]);

  const filteredInfographics = useMemo(() => {
    return allInfographics.filter((inf: any) => {
      if (selectedCategory === 'ALL') return true;
      return inf.category === selectedCategory;
    });
  }, [allInfographics, selectedCategory]);

  return (
    <XenonMintShell member={member} theme={theme} subdomain={subdomain} activePage="infografis">
      <div className="px-6 sm:px-10 lg:px-12 py-12 sm:py-16 max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-[#00A86B] text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Transparansi Kinerja & Data Publik</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Galeri Infografis & Data Visual
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Visualisasi data alokasi APBD/APBN, capaian pengawasan komisi, dan statistik penanganan aspirasi konstituen Daerah Pemilihan {info.dapil}.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-4 rounded-3xl border border-slate-200">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Kategori:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Semua Infografis' : cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid or Empty State */}
        {filteredInfographics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredInfographics.map((inf: any, idx: number) => (
              <div
                key={inf.id || `inf-${idx}`}
                className="group bg-white rounded-3xl p-4 border border-slate-200 hover:border-[#00D084] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
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

                {/* Action Buttons */}
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
          <div className="py-20 text-center rounded-3xl bg-slate-50 border border-slate-200 p-8 space-y-3">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">
              Belum Ada Infografis
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Saat ini belum ada publikasi infografis atau visual data untuk kategori yang dipilih.
            </p>
          </div>
        )}

      </div>

      {/* Modal Lightbox */}
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
