'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Calendar, ArrowRight, Tag, BookOpen, Clock, Sparkles } from 'lucide-react';
import { LailaSakuraShell } from './LailaSakuraShell';
import { getLailaMemberInfo, useLailaHref } from './utils';

interface LailaSakuraArtikelCatalogClientProps {
  member: any;
  theme: any;
  articles?: any[];
  subdomain?: string;
}

export function LailaSakuraArtikelCatalogClient({
  member,
  theme,
  articles = [],
  subdomain,
}: LailaSakuraArtikelCatalogClientProps) {
  const info = getLailaMemberInfo(member, theme, subdomain);
  const href = useLailaHref(subdomain);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const allArticles = useMemo(() => {
    if (articles && articles.length > 0) {
      return articles.map((a: any, i: number) => ({
        id: a.id || `art-${i}`,
        slug: a.slug || a.id || `artikel-${i}`,
        title: a.title,
        category: a.category || a.categoryName || a.issueCategory || 'Kebijakan Publik',
        date: a.publishedAt
          ? new Date(a.publishedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
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
      }));
    }
    return [];
  }, [articles]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allArticles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [allArticles]);

  const filteredArticles = useMemo(() => {
    return allArticles.filter((a) => {
      const matchCat = selectedCategory === 'ALL' || a.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allArticles, selectedCategory, searchQuery]);

  return (
    <LailaSakuraShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="artikel"
    >
      {/* ─── CATALOG HERO ─── */}
      <section className="relative px-4 sm:px-6 pt-6 pb-12 bg-[#080D1A]">
        <div className="relative max-w-[1320px] mx-auto rounded-3xl sm:rounded-[44px] bg-[#0D1527] border border-[#1E2B42] p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[160px] pointer-events-none opacity-25"
            style={{ backgroundColor: info.primaryColor }}
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span
              className="text-xs font-mono font-bold uppercase tracking-[0.25em] block"
              style={{ color: info.primaryColor }}
            >
              Publikasi & Risalah Parlemen
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              🌸 Arsip Artikel & Kebijakan 🌸
            </h1>
            <p className="text-xs sm:text-sm text-[#A0ABC0] leading-relaxed">
              Jelajahi pandangan kritis, telaah yuridis pembentukan Perda, serta catatan pengawasan anggaran daerah oleh {info.officialFullName}.
            </p>

            {/* Search Bar */}
            <div className="pt-4 max-w-md mx-auto">
              <div className="relative">
                <Search className="w-4 h-4 text-[#64748B] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari risalah artikel atau isu kebijakan..."
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-[#080D1A] border border-[#1E2B42] text-white text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#FF4D8D] transition-colors shadow-inner"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── CATEGORY FILTER PILLS ─── */}
      <section className="bg-[#080D1A] pb-6">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#1E2B42]">
            <span className="text-xs font-mono text-[#64748B] mr-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#FF4D8D]" />
              Kategori:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#FF4D8D] text-white font-bold shadow-[0_0_12px_rgba(255,77,141,0.4)]'
                    : 'bg-[#0D1527] text-[#A0ABC0] border border-[#1E2B42] hover:border-[#FF4D8D]/40 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'Semua Topik' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GRID ARTIKEL DENGAN GAMBAR SAMPUL JELAS ─── */}
      <section className="py-10 pb-24 bg-[#080D1A]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20 bg-[#0D1527] border border-[#1E2B42] rounded-3xl p-8">
              <BookOpen className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">
                {allArticles.length === 0
                  ? 'Belum ada artikel resmi yang dipublikasikan saat ini.'
                  : 'Tidak ada artikel yang sesuai kriteria pencarian.'}
              </p>
              {allArticles.length > 0 && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                  }}
                  className="mt-3 text-xs text-[#FF4D8D] underline hover:text-white"
                >
                  Reset Filter & Pencarian
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((art) => (
                <article
                  key={art.id}
                  className="group flex flex-col bg-[#0D1527] border border-[#1E2B42] rounded-3xl overflow-hidden hover:border-[#FF4D8D]/70 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,77,141,0.25)]"
                >
                  {/* Gambar Cover Artikel Jelas */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#070B14]">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#080D1A]/90 backdrop-blur-md border border-[#1E2B42]"
                        style={{ color: info.primaryColor }}
                      >
                        {art.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Artikel */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#64748B] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#FF4D8D]" />
                          <span>{art.date}</span>
                        </span>
                        <span
                          className="font-bold text-xs"
                          style={{ color: info.primaryColor }}
                        >
                          {art.date}
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-white group-hover:text-[#FF4D8D] transition-colors leading-snug">
                        {art.title}
                      </h4>

                      <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-3">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#1E2B42]">
                      <Link
                        href={href(`/artikel/${art.slug}`)}
                        className="inline-flex items-center gap-2 text-xs font-mono font-bold transition-colors group-hover:translate-x-1 duration-300"
                        style={{ color: info.primaryColor }}
                      >
                        <span>Baca Risalah Lengkap 🌸</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>
      </section>
    </LailaSakuraShell>
  );
}
