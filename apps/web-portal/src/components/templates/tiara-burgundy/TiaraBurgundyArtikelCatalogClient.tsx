'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Calendar, ArrowRight, Tag, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { TiaraBurgundyShell } from './TiaraBurgundyShell';
import { getTiaraMemberInfo, useTiaraHref } from './utils';

interface TiaraBurgundyArtikelCatalogClientProps {
  member: any;
  theme: any;
  articles?: any[];
  subdomain?: string;
}

export function TiaraBurgundyArtikelCatalogClient({
  member,
  theme,
  articles = [],
  subdomain,
}: TiaraBurgundyArtikelCatalogClientProps) {
  const info = getTiaraMemberInfo(member, theme, subdomain);
  const href = useTiaraHref(subdomain);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Real backend articles only (no dummy fallback)
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
    <TiaraBurgundyShell member={member} theme={theme} subdomain={subdomain} activePage="artikel">
      {/* Editorial Header */}
      <section className="bg-[#EFEBE4] border-b border-[#E5DED5] py-14 sm:py-20 px-6 sm:px-10 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs font-serif uppercase tracking-[0.2em] text-[#7A6F6A]">
            <Link href={href('/')} className="hover:text-[#6B1724] transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#B8AEA8]" />
            <span className="font-bold" style={{ color: info.textAccentColor }}>Katalog Artikel & Warta</span>
          </div>

          <div className="max-w-3xl space-y-3">
            <span className="font-serif italic text-2xl sm:text-3xl block" style={{ color: info.textAccentColor }}>
              Warta, Opini & Catatan Parlemen
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl text-[#6B1724] tracking-tight leading-none uppercase font-normal">
              ARTIKEL & RILIS KEBIJAKAN
            </h1>
            <p className="text-sm sm:text-base text-[#5A524D] leading-relaxed pt-1">
              Catatan pemikiran, telaah perancangan undang-undang, serta laporan kegiatan advokasi aspirasi rakyat yang dirangkum langsung dari ruang sidang hingga kunjungan dapil.
            </p>
          </div>

          {/* Search Bar & Filter Controls */}
          <div className="pt-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#7A6F6A] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari judul artikel, topik perda, atau kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#DDD5CA] rounded-full text-xs text-[#1E1B18] placeholder:text-[#9E938B] focus:outline-none focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724] transition-all"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full font-serif text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#6B1724] text-white shadow-xs'
                        : 'bg-white border border-[#DDD5CA] text-[#5A524D] hover:border-[#6B1724] hover:text-[#6B1724]'
                    }`}
                  >
                    {cat === 'ALL' ? 'Semua Topik' : cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid Section */}
      <section className="bg-[#FBF9F5] py-14 sm:py-20 px-6 sm:px-10 lg:px-12 min-h-[500px]">
        <div className="max-w-6xl mx-auto">
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((art) => (
                <article
                  key={art.id}
                  className="group bg-white border border-[#E5DED5] rounded-xs overflow-hidden flex flex-col hover:shadow-lg hover:border-[#6B1724]/40 transition-all duration-300"
                >
                  {/* Article Thumbnail */}
                  <Link href={href(`/artikel/${art.slug}`)} className="block relative aspect-16/10 overflow-hidden bg-[#EFEBE4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#6B1724] text-white text-[10px] font-serif font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full shadow-xs">
                      {art.category}
                    </div>
                  </Link>

                  {/* Article Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-[11px] text-[#7A6F6A] font-serif uppercase tracking-wider">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" style={{ color: info.textAccentColor }} />
                          <span>{art.date}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" style={{ color: info.textAccentColor }} />
                          <span>{art.readingTime}</span>
                        </span>
                      </div>

                      <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1E1B18] group-hover:text-[#6B1724] transition-colors leading-snug line-clamp-2">
                        <Link href={href(`/artikel/${art.slug}`)}>{art.title}</Link>
                      </h2>

                      {art.excerpt && (
                        <p className="text-xs text-[#5A524D] leading-relaxed line-clamp-3">
                          {art.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[#E5DED5]">
                      <Link
                        href={href(`/artikel/${art.slug}`)}
                        className="inline-flex items-center space-x-2 font-serif text-[11px] font-bold uppercase tracking-[0.15em] hover:opacity-80 transition group/link"
                        style={{ color: info.textAccentColor }}
                      >
                        <span>Baca Selengkapnya</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EFEBE4] border border-[#DDD5CA] flex items-center justify-center mx-auto text-[#6B1724]">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl text-[#6B1724] uppercase tracking-wide">
                Tidak Ada Artikel Ditemukan
              </h3>
              <p className="text-xs text-[#7A6F6A] leading-relaxed">
                Belum ada artikel yang cocok dengan kata kunci &quot;{searchQuery}&quot; atau kategori yang dipilih.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2.5 bg-[#6B1724] text-white rounded-full font-serif text-xs font-semibold uppercase tracking-wider hover:bg-[#52101B] transition-colors"
                >
                  Reset Pencarian
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </TiaraBurgundyShell>
  );
}
