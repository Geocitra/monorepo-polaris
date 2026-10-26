'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Filter,
  X,
  ChevronRight,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  summary: string;
  thumbnail: string;
  readingTime?: string;
  featured?: boolean;
}

interface ArtikelCatalogClientProps {
  initialArticles: any[];
  defaultArticles: ArticleItem[];
  officialFullName: string;
  subdomain?: string;
}

const CATEGORIES = [
  'Semua Topik',
  'Ekonomi',
  'Infrastruktur',
  'Pendidikan',
  'Kesehatan',
  'Pertanian',
  'Hukum & Regulasi',
];

export function ArtikelCatalogClient({
  initialArticles = [],
  defaultArticles = [],
  officialFullName,
}: ArtikelCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Topik');

  // Normalize articles list
  const allArticles: ArticleItem[] = useMemo(() => {
    if (initialArticles && initialArticles.length > 0) {
      return initialArticles.map((a: any, idx: number) => ({
        id: a.id || `art-${idx}`,
        title: a.title,
        slug: a.slug || `artikel-${idx}`,
        category:
          a.sector ||
          a.issueCategory ||
          (idx % 3 === 0 ? 'Ekonomi' : idx % 3 === 1 ? 'Infrastruktur' : 'Pendidikan'),
        date: a.publishedAt ? formatDateIndonesian(a.publishedAt) : '10 Oktober 2026',
        summary:
          a.excerpt ||
          a.summary ||
          'Analisis dan pandangan strategis parlemen mengenai perkembangan kebijakan publik terkini.',
        thumbnail:
          a.thumbnailUrl ||
          a.featuredImageUrl ||
          a.posterUrl ||
          (idx % 3 === 0
            ? '/images/ref-article-1.jpg'
            : idx % 3 === 1
            ? '/images/ref-article-2.jpg'
            : '/images/ref-article-3.jpg'),
        readingTime: '3 mnt baca',
        featured: idx === 0,
      }));
    }
    return defaultArticles;
  }, [initialArticles, defaultArticles]);

  // Filter articles based on search & category
  const filteredArticles = useMemo(() => {
    return allArticles.filter((art) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'Semua Topik' ||
        art.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchSearch && matchCategory;
    });
  }, [allArticles, searchQuery, selectedCategory]);

  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const gridArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  return (
    <div className="space-y-10">
      {/* ========================================================= */}
      {/* FILTER & SEARCH BAR (Gold Accent Parlemen)                */}
      {/* ========================================================= */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#FBF9F5] border border-amber-200/70 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#96702c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul artikel, topik, atau kata kunci..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-amber-200/80 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#96702c] text-xs sm:text-sm text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Result Counter */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-[#96702c]" />
            <span>
              Menampilkan <strong className="text-slate-900">{filteredArticles.length}</strong> dari{' '}
              {allArticles.length} publikasi kajian
            </span>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#96702c] text-white shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-slate-600 border border-slate-200/90 hover:border-amber-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* FEATURED SPOTLIGHT ARTICLE (Editorial Hero Style)          */}
      {/* ========================================================= */}
      {featuredArticle && !searchQuery && selectedCategory === 'Semua Topik' && (
        <section className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] overflow-hidden group hover:border-[#96702c]/50 transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Visual Thumbnail */}
            <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-slate-900 min-h-[260px] lg:min-h-[380px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredArticle.thumbnail}
                alt={featuredArticle.title}
                className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Badges Over Image */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#96702c] text-white text-[11px] font-bold shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kajian Utama Terpilih</span>
              </div>

              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>{featuredArticle.date}</span>
                <span className="text-white/40">•</span>
                <Clock className="w-3.5 h-3.5 text-amber-200" />
                <span>{featuredArticle.readingTime || '3 mnt baca'}</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-[#96702c] border border-amber-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#96702c]" />
                  <span>{featuredArticle.category}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#96702c] transition-colors leading-snug">
                  <Link href={`/artikel/${featuredArticle.slug}`}>
                    {featuredArticle.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-4">
                  {featuredArticle.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-medium">
                  Penulis: <strong className="text-slate-800">{officialFullName}</strong>
                </div>

                <Link
                  href={`/artikel/${featuredArticle.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#96702c] hover:bg-[#805f24] text-white text-xs font-bold transition shadow-xs"
                >
                  <span>Baca Risalah Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* ARTICLES GRID (Standard 3-Column Parliament Style)        */}
      {/* ========================================================= */}
      {filteredArticles.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-amber-200 bg-[#FBF9F5] p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100/60 text-[#96702c] mx-auto flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Tidak Ada Artikel yang Ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba gunakan kata kunci pencarian yang berbeda atau reset filter kategori untuk melihat seluruh publikasi.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua Topik');
            }}
            className="px-4 py-2 rounded-xl bg-[#96702c] text-white text-xs font-bold hover:bg-[#805f24] transition"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
              {searchQuery || selectedCategory !== 'Semua Topik'
                ? 'Hasil Penelusuran Publikasi'
                : 'Arsip Publikasi &amp; Risalah Lainnya'}
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {filteredArticles.length} Kajian
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(searchQuery || selectedCategory !== 'Semua Topik'
              ? filteredArticles
              : gridArticles
            ).map((art) => (
              <article
                key={art.id}
                className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_32px_-8px_rgba(150,112,44,0.18)] hover:border-[#96702c]/50 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
              >
                <div>
                  {/* Thumbnail Image dengan Date Badge */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.thumbnail}
                      alt={art.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                    {/* Badge Tanggal */}
                    <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white/95 text-[10.5px] font-medium shadow-sm">
                      <Calendar className="w-3 h-3 text-amber-300 shrink-0" />
                      <span>{art.date}</span>
                    </div>

                    {/* Estimasi Baca */}
                    <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/15 text-white/85 text-[10px] font-medium">
                      <Clock className="w-2.5 h-2.5 text-amber-200" />
                      <span>{art.readingTime || '3 mnt baca'}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    {/* Sektor Kategori */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-[#96702c] border border-amber-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#96702c]" />
                        {art.category}
                      </span>
                    </div>

                    {/* Judul Artikel */}
                    <h4 className="text-[14px] sm:text-[15px] font-bold text-slate-900 group-hover:text-[#96702c] transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
                      <Link
                        href={`/artikel/${art.slug}`}
                        className="hover:underline decoration-[#96702c]/40 underline-offset-2"
                      >
                        {art.title}
                      </Link>
                    </h4>

                    {/* Ringkasan */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2rem]">
                      {art.summary}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2.5 pb-3 px-4 sm:px-5 border-t border-slate-100 flex items-center justify-between mt-auto bg-slate-50/50">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-400">
                    <BookOpen className="w-3 h-3 text-[#96702c]/70" />
                    <span>Kajian Parlemen</span>
                  </div>

                  <Link
                    href={`/artikel/${art.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#96702c] group-hover:text-[#7d5c21] transition-colors"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
