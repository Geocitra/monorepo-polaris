'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Calendar, ArrowRight, Tag, BookOpen, Clock, Sparkles } from 'lucide-react';
import { AnivioxEmeraldShell } from './AnivioxEmeraldShell';
import { getAnivioxMemberInfo, useAnivioxHref, ANIVIOX_DEFAULT_ARTICLES } from './utils';

interface AnivioxEmeraldArtikelCatalogClientProps {
  member: any;
  theme: any;
  articles?: any[];
  subdomain?: string;
}

export function AnivioxEmeraldArtikelCatalogClient({
  member,
  theme,
  articles = [],
  subdomain,
}: AnivioxEmeraldArtikelCatalogClientProps) {
  const info = getAnivioxMemberInfo(member, theme, subdomain);
  const href = useAnivioxHref(subdomain);

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
    <AnivioxEmeraldShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="artikel"
    >
      {/* ─── CATALOG HERO ─── */}
      <section className="relative px-3 sm:px-6 pt-3 sm:pt-4 pb-12 bg-[#060A08]">
        <div className="relative max-w-[1340px] mx-auto rounded-3xl sm:rounded-[44px] bg-gradient-to-b from-[#0A291A] via-[#071B11] to-[#05110B] border border-[#143B25] p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-25"
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
              Arsip Artikel & Kebijakan
            </h1>
            <p className="text-xs sm:text-sm text-[#A3B8AD] leading-relaxed">
              Jelajahi pandangan kritis, telaah yuridis pembentukan Perda, serta catatan pengawasan anggaran daerah oleh {info.officialFullName}.
            </p>

            {/* Search Bar */}
            <div className="pt-4 max-w-md mx-auto">
              <div className="relative">
                <Search className="w-4 h-4 text-[#688073] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari topik artikel atau isu kebijakan..."
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-[#070D09]/90 border border-[#14241B] text-white text-xs placeholder:text-[#688073] focus:outline-none focus:border-[#00F076] transition-colors shadow-inner"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── CATEGORY FILTER PILLS ─── */}
      <section className="bg-[#060A08] pb-6">
        <div className="max-w-[1340px] mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#14241B]">
            <span className="text-xs font-mono text-[#688073] mr-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#00F076]" />
              Kategori:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#00F076] text-black font-bold shadow-[0_0_12px_rgba(0,240,118,0.3)]'
                    : 'bg-[#0C1510] text-[#A3B8AD] border border-[#15241C] hover:border-[#00F076]/40 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'Semua Topik' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GRID ARTIKEL (MENAMPILKAN GAMBAR ARTIKEL LENGKAP) ─── */}
      <section className="py-10 pb-24 bg-[#060A08]">
        <div className="max-w-[1340px] mx-auto px-6 lg:px-12">
          
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20 bg-[#0B1410] border border-[#14241B] rounded-3xl p-8">
              <BookOpen className="w-10 h-10 text-[#688073] mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">Tidak ada artikel yang sesuai kriteria pencarian.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="mt-3 text-xs text-[#00F076] underline hover:text-white"
              >
                Reset Filter & Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((art) => (
                <article
                  key={art.id}
                  className="group flex flex-col bg-[#0B1410] border border-[#14241B] rounded-2xl sm:rounded-3xl overflow-hidden hover:border-[#00F076]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00F076]/10"
                >
                  {/* Gambar Cover Artikel */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#070D09]">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className="px-3 py-1 rounded-full bg-[#060A08]/85 backdrop-blur-md border border-[#14241B] text-[10px] font-mono font-bold"
                        style={{ color: info.primaryColor }}
                      >
                        {art.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Artikel */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-mono text-[#688073]">
                        <Calendar className="w-3.5 h-3.5 text-[#00F076]" />
                        <span>{art.date}</span>
                      </div>

                      <h3 className="font-bold text-base text-white group-hover:text-[#00F076] transition-colors leading-snug">
                        {art.title}
                      </h3>

                      <p className="text-xs text-[#A3B8AD] leading-relaxed line-clamp-3">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#14241B]">
                      <Link
                        href={href(`/artikel/${art.slug}`)}
                        className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F076] hover:text-white transition-colors group-hover:translate-x-1 duration-300"
                        style={{ color: info.primaryColor }}
                      >
                        <span>Baca Risalah Lengkap</span>
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
    </AnivioxEmeraldShell>
  );
}
