'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Tag,
  Filter,
} from 'lucide-react';
import { NexoraVioletShell } from './NexoraVioletShell';
import {
  getNexoraMemberInfo,
  useNexoraHref,
} from './utils';

interface NexoraVioletArtikelCatalogClientProps {
  articles?: any[];
  member: any;
  theme: any;
  subdomain?: string;
}

export function NexoraVioletArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: NexoraVioletArtikelCatalogClientProps) {
  const info = getNexoraMemberInfo(member, theme, subdomain);
  const href = useNexoraHref(subdomain);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const allArticles =
    articles && articles.length > 0
      ? articles.map((a: any, i: number) => ({
          id: a.id || `art-${i}`,
          slug: a.slug || a.id || `artikel-${i}`,
          title: a.title,
          category: a.category || a.categoryName || a.issueCategory || 'Kebijakan Publik',
          date: a.publishedAt
            ? new Date(a.publishedAt).toLocaleDateString('id-ID', {
                dateStyle: 'medium',
              })
            : a.date || 'Terbaru',
          imageUrl:
            a.featuredImageUrl ||
            a.posterUrl ||
            a.coverImageUrl ||
            a.imageUrl ||
            a.thumbnailUrl ||
            '/images/default-article.jpg',
          excerpt:
            a.excerpt ||
            a.summary ||
            (a.bodyContentMarkdown ? a.bodyContentMarkdown.substring(0, 140) + '...' : ''),
        }))
      : [];

  // Extract unique categories
  const categories = [
    'ALL',
    ...Array.from(
      new Set(
        allArticles
          .map((a: any) => a.category)
          .filter(Boolean)
      )
    ),
  ];

  const filteredArticles = allArticles.filter((article: any) => {
    const matchSearch =
      searchTerm === '' ||
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCat = selectedCategory === 'ALL' || article.category === selectedCategory;

    return matchSearch && matchCat;
  });

  return (
    <NexoraVioletShell member={member} theme={theme} subdomain={subdomain} activePage="artikel">
      <div className="px-6 sm:px-10 lg:px-16 py-12 sm:py-16 max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-[#7048E8] text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Katalog Risalah & Kajian Kebijakan Publik</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-serif italic text-slate-800 tracking-tight">
                Gagasan Strategis
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#7B61FF] tracking-tight leading-none uppercase">
                ARTIKEL PUBLIKASI
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 max-w-md">
              Arsip pemikiran kenegaraan, analisis regulasi daerah, dan catatan kinerja legislasi resmi dari {info.fullName}.
            </p>
          </div>
        </div>

        {/* Filter Bar: Search + Category Pills */}
        <div className="space-y-4 bg-purple-50/70 p-5 rounded-3xl border border-purple-100">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul artikel, topik regulasi, atau isu kebijakan..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-purple-100 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7048E8]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Kategori:</span>
            </span>
            {categories.map((cat: any) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-[#7048E8] text-white shadow-sm'
                    : 'bg-white hover:bg-purple-100 text-slate-700 border border-purple-100'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Article Grid with Real Cover Images */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-purple-50/40 rounded-3xl border border-dashed border-purple-200">
            <BookOpen className="w-10 h-10 text-purple-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {allArticles.length === 0
                ? 'Belum ada artikel resmi yang dipublikasikan saat ini'
                : 'Tidak ada artikel yang cocok'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {allArticles.length === 0
                ? 'Arsip risalah kebijakan akan ditampilkan setelah dipublikasikan.'
                : 'Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredArticles.map((article: any, idx: number) => (
              <article
                key={article.id || `art-${idx}`}
                className="group bg-white rounded-3xl p-4 border border-purple-100/90 shadow-[0_10px_30px_-10px_rgba(112,72,232,0.08)] hover:shadow-[0_20px_40px_-10px_rgba(112,72,232,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Real Article Cover Image */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-purple-50 mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-[#7048E8] shadow-sm">
                      {article.category}
                    </div>
                  </div>

                  {/* Meta Tags */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>{article.date}</span>
                    </span>
                  </div>

                  {/* Title & Excerpt */}
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#7048E8] transition-colors leading-snug line-clamp-2 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {article.excerpt || article.summary || 'Kajian strategis advokasi kebijakan publik dan penguatan program kesejahteraan masyarakat daerah pemilihan.'}
                  </p>
                </div>

                {/* Read Button */}
                <div className="pt-4 mt-4 border-t border-purple-50">
                  <Link
                    href={href(`/artikel/${article.slug}`)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#7048E8] group-hover:text-[#5F3DC4] transition"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </NexoraVioletShell>
  );
}
