'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { CrimsonLabel } from './CrimsonNoirShell';
import { useCrimsonHref, articleImage, articleCategory, articleExcerpt, CRIMSON_DEFAULT_ARTICLES } from './utils';

interface CrimsonNoirArtikelCatalogClientProps {
  articles?: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CrimsonNoirArtikelCatalogClient({ articles = [], subdomain }: CrimsonNoirArtikelCatalogClientProps) {
  const href = useCrimsonHref(subdomain);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');

  // Page passes generic fallback data when DB is empty; prefer our richer set in that case.
  const source = articles.length > 0 && !String(articles[0]?.id || '').startsWith('ref-art') ? articles : CRIMSON_DEFAULT_ARTICLES;

  const categories = useMemo(
    () => ['Semua', ...Array.from(new Set(source.map((a: any) => articleCategory(a))))],
    [source]
  );

  const filtered = source.filter((a: any) => {
    const matchCat = category === 'Semua' || articleCategory(a) === category;
    const q = query.trim().toLowerCase();
    const matchQ = !q || a.title?.toLowerCase().includes(q) || articleExcerpt(a).toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const [featured, ...rest] = filtered;

  return (
    <div className="max-w-[1000px] mx-auto px-6 lg:px-10 py-14 sm:py-16 space-y-10">
      {/* Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3.5 py-1.5 rounded-[3px] text-[11px] font-semibold border transition-all cursor-pointer ${
                category === c
                  ? 'bg-[#D62828] border-[#D62828] text-white'
                  : 'bg-[#1A1A1A] border-white/5 text-white/70 hover:text-white hover:border-[#D62828]/50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            id="crimson-artikel-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari artikel..."
            className="w-full pl-9 pr-3 py-2 rounded-[3px] bg-[#1A1A1A] border border-white/10 text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-[#D62828]"
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-white/50 py-16">Tidak ada artikel yang cocok dengan pencarian Anda.</p>
      )}

      {/* Featured */}
      {featured && (
        <Link
          href={href(`/artikel/${featured.slug || featured.id}`)}
          className="group grid grid-cols-1 md:grid-cols-2 bg-[#1A1A1A] rounded-[4px] border border-white/5 overflow-hidden hover:border-[#D62828]/50 transition-all"
        >
          <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-black">
            <img src={articleImage(featured)} alt={featured.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
          </div>
          <div className="p-7 sm:p-9 flex flex-col justify-center">
            <CrimsonLabel>Sorotan Utama</CrimsonLabel>
            <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-[#E04848]">{articleCategory(featured)}</span>
            <h2 className="mt-1 font-outfit font-extrabold text-2xl text-white leading-snug group-hover:text-[#E04848] transition-colors">
              {featured.title}
            </h2>
            <p className="mt-3 text-xs text-white/60 leading-relaxed line-clamp-3">{articleExcerpt(featured)}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-bold text-white">
              Baca Selengkapnya <ArrowRight className="w-3 h-3 text-[#D62828] group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rest.map((a: any, idx: number) => (
          <Link
            key={a.id || idx}
            href={href(`/artikel/${a.slug || a.id}`)}
            className="group bg-[#1A1A1A] rounded-[4px] border border-white/5 overflow-hidden hover:border-[#D62828]/50 hover:-translate-y-1 transition-all"
          >
            <div className="aspect-[16/10] overflow-hidden bg-black">
              <img src={articleImage(a)} alt={a.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
            </div>
            <div className="p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E04848]">{articleCategory(a)}</span>
              <h3 className="mt-1.5 text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-[#E04848] transition-colors">{a.title}</h3>
              <p className="mt-2 text-[11px] text-white/55 line-clamp-2">{articleExcerpt(a)}</p>
              <div className="mt-3 flex items-center gap-3 text-[10px] text-white/40">
                <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{a.date || formatDateIndonesian(a.publishedAt || a.createdAt || new Date())}</span>
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{a.readingTime || '4 menit baca'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
