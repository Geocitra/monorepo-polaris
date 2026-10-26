'use client';

import React, { useMemo, useState } from 'react';
import { X, Maximize2, Download, Share2, Check, Calendar } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { CrimsonButton } from './CrimsonNoirShell';
import { CRIMSON_DEFAULT_INFOGRAPHICS } from './utils';

interface CrimsonNoirInfografisGalleryClientProps {
  initialInfographics?: any[];
  member: any;
  theme?: any;
}

const imgOf = (i: any) => i?.imageUrl || i?.posterUrl || i?.thumbnailUrl || '/images/showcase-infografis-apbd.jpg';
const catOf = (i: any) => i?.category || i?.categoryName || 'Umum';

export function CrimsonNoirInfografisGalleryClient({ initialInfographics = [] }: CrimsonNoirInfografisGalleryClientProps) {
  const items = initialInfographics.length > 0 ? initialInfographics : CRIMSON_DEFAULT_INFOGRAPHICS;
  const [category, setCategory] = useState('Semua');
  const [active, setActive] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = useMemo(() => ['Semua', ...Array.from(new Set(items.map(catOf)))], [items]);
  const filtered = category === 'Semua' ? items : items.filter((i: any) => catOf(i) === category);

  const share = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 lg:px-10 py-14 sm:py-16 space-y-10">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`px-3.5 py-1.5 rounded-[3px] text-[11px] font-semibold border transition-all cursor-pointer ${
              category === c ? 'bg-[#D62828] border-[#D62828] text-white' : 'bg-[#1A1A1A] border-white/5 text-white/70 hover:text-white hover:border-[#D62828]/50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item: any, idx: number) => (
          <button
            key={item.id || idx}
            type="button"
            onClick={() => setActive(item)}
            className="group text-left bg-[#1A1A1A] rounded-[4px] border border-white/5 overflow-hidden hover:border-[#D62828]/50 hover:-translate-y-1 transition-all cursor-pointer"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-black">
              <img src={imgOf(item)} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#D62828] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5 text-white" />
              </span>
              {item.metric && (
                <div className="absolute bottom-4 left-4">
                  <div className="font-outfit font-extrabold text-3xl text-[#E04848]">{item.metric}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/70">{item.metricLabel}</div>
                </div>
              )}
            </div>
            <div className="p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E04848]">{catOf(item)}</span>
              <h3 className="mt-1.5 text-sm font-bold text-white line-clamp-2">{item.title}</h3>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/40">
                <Calendar className="w-3 h-3" />
                {formatDateIndonesian(item.publishedAt || item.createdAt || new Date())}
              </div>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto grid grid-cols-1 md:grid-cols-2 bg-[#121212] border border-white/10 rounded-[4px]" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setActive(null)} aria-label="Tutup" className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-[#D62828] text-white flex items-center justify-center cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <div className="bg-black">
              <img src={imgOf(active)} alt={active.title} className="w-full h-full object-contain max-h-[80vh]" />
            </div>
            <div className="p-7 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E04848]">{catOf(active)}</span>
              <h2 className="mt-2 font-outfit font-extrabold text-2xl text-white leading-snug">{active.title}</h2>
              {active.metric && (
                <div className="mt-5 p-4 rounded-[4px] bg-gradient-to-br from-[#D62828] to-[#5E0B0B]">
                  <div className="font-outfit font-extrabold text-3xl text-white">{active.metric}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/80">{active.metricLabel}</div>
                </div>
              )}
              <p className="mt-5 text-xs text-white/65 leading-relaxed">{active.description || active.summary || active.caption}</p>
              <div className="mt-auto pt-6 flex gap-2">
                <a href={imgOf(active)} download className="inline-flex items-center gap-2 px-5 py-2 rounded-[3px] bg-[#D62828] hover:bg-[#B71C1C] text-white text-xs font-semibold">
                  <Download className="w-3.5 h-3.5" /> Unduh
                </a>
                <CrimsonButton onClick={share} className="!bg-[#1A1A1A] border border-white/10 !shadow-none hover:!border-[#D62828]">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copied ? 'Tersalin' : 'Bagikan'}
                </CrimsonButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
