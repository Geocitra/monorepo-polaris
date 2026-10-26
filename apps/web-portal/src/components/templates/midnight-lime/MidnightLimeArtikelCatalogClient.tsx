'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Clock, ChevronRight, Search } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface MidnightLimeArtikelCatalogClientProps {
  articles: any[];
  member: any;
  theme: any;
  subdomain?: string;
}

export function MidnightLimeArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: MidnightLimeArtikelCatalogClientProps) {
  const primaryColor = theme?.primaryHexColor || '#D4F63D';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');

  const categories = ['SEMUA', ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))];

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'SEMUA' || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getArticleUrl = (slug: string) => {
    return subdomain ? `/${subdomain}/artikel/${slug}` : `/artikel/${slug}`;
  };

  return (
    <div className="py-12 sm:py-16 bg-[#0C111F] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#131B2D] border border-white/5">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari risalah atau topik kebijakan..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4F63D] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#D4F63D] text-black shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">Belum ada risalah yang sesuai kriteria pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredArticles.map((art) => (
              <Link
                key={art.id || art.slug}
                href={getArticleUrl(art.slug)}
                className="group flex flex-col justify-between rounded-3xl bg-[#131B2D] border border-white/5 hover:border-[#D4F63D]/40 p-6 transition-all duration-300 shadow-xl"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#D4F63D]/15 text-[#D4F63D] border border-[#D4F63D]/20">
                    {art.category || 'Kebijakan Publik'}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-[#D4F63D] transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {art.excerpt || 'Uraian telaah regulasi dan catatan pembahasan komisi.'}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{formatDateIndonesian(art.publishedAt || art.createdAt)}</span>
                  <span className="text-[#D4F63D] font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Baca Lengkap</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
