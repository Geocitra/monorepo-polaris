'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { XenonMintShell } from './XenonMintShell';
import { getXenonMemberInfo, useXenonHref, XENON_THEME } from './utils';

interface XenonMintArtikelCatalogClientProps {
  member: any;
  theme: any;
  articles?: any[];
  initialArticles?: any[];
  subdomain?: string;
}

export function XenonMintArtikelCatalogClient({
  member,
  theme,
  articles,
  initialArticles,
  subdomain,
}: XenonMintArtikelCatalogClientProps) {
  const info = getXenonMemberInfo(member, theme, subdomain);
  const href = useXenonHref(subdomain);

  const rawArticles = articles || initialArticles || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Map real API articles
  const allArticles = useMemo(() => {
    if (rawArticles && rawArticles.length > 0) {
      return rawArticles.map((a: any, i: number) => ({
        id: a.id || `art-${i}`,
        slug: a.slug || a.id || `artikel-${i}`,
        title: a.title,
        category: a.category || a.categoryName || a.issueCategory || 'Kebijakan Publik',
        date: a.publishedAt
          ? new Date(a.publishedAt).toLocaleDateString('id-ID', {
              dateStyle: 'medium',
            })
          : a.date || 'Terbaru',
        readingTime: a.readingTime || '5 menit baca',
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
      }));
    }
    return [];
  }, [rawArticles]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allArticles.forEach((art) => {
      if (art.category) set.add(art.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [allArticles]);

  const filteredArticles = useMemo(() => {
    return allArticles.filter((art) => {
      const matchCat =
        selectedCategory === 'ALL' || art.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allArticles, selectedCategory, searchQuery]);

  return (
    <XenonMintShell member={member} theme={theme} subdomain={subdomain} activePage="artikel">
      <div className="px-6 sm:px-10 lg:px-12 py-12 sm:py-16 max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-[#00A86B] text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Katalog Resmi Kebijakan & Berita Parlemen</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Publikasi Artikel & Telaah Kebijakan
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Dokumentasi telaah regulasi komisi, pengawasan perimbangan anggaran daerah, serta catatan kunjungan lapangan resmi Anggota DPR RI {info.fullName}.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-200">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
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
                {cat === 'ALL' ? 'Semua' : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik regulasi atau perda..."
              className="w-full pl-9 pr-4 py-2 rounded-full text-xs bg-white border border-slate-200 focus:outline-none focus:border-[#00D084] focus:ring-2 focus:ring-[#00E599]/20"
            />
          </div>

        </div>

        {/* Articles Grid or Empty State */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredArticles.map((art: any, idx: number) => (
              <Link
                key={art.slug || idx}
                href={href(`/artikel/${art.slug}`)}
                className="group bg-white rounded-3xl p-4 border border-slate-200 hover:border-[#00D084] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Cover Image */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-[#00A86B] shadow-sm">
                      {art.category}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-950 group-hover:text-[#00A86B] transition line-clamp-2 leading-snug mb-2">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{art.date}</span>
                  </div>
                  <span className="text-[#00A86B] font-bold flex items-center gap-1">
                    Baca ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-3xl bg-slate-50 border border-slate-200 p-8 space-y-3">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">
              {allArticles.length === 0
                ? 'Belum Ada Artikel Dipublikasikan'
                : 'Tidak Ada Artikel yang Cocok'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {allArticles.length === 0
                ? 'Artikel publikasi dewan akan segera diperbarui secara berkala.'
                : 'Coba ubah kata kunci pencarian atau pilih kategori lain.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-950 text-white text-xs font-bold"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}

      </div>
    </XenonMintShell>
  );
}
