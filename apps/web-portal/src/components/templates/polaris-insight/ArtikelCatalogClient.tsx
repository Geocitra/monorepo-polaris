'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Calendar,
  ArrowRight,
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
  initialArticles?: any[];
  defaultArticles?: ArticleItem[];
  officialFullName: string;
  subdomain?: string;
}

export function ArtikelCatalogClient({
  initialArticles = [],
  officialFullName,
  subdomain,
}: ArtikelCatalogClientProps) {
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');
  const previewColor = searchParams?.get('preview_color');

  const getArticleHref = (slug: string) => {
    let base = subdomain ? `/${subdomain}/artikel/${slug}` : `/artikel/${slug}`;
    const params = new URLSearchParams();
    if (previewTemplate) params.set('preview_template', previewTemplate);
    if (previewColor) params.set('preview_color', previewColor);
    const queryString = params.toString();
    return queryString ? `${base}${base.includes('?') ? '&' : '?'}${queryString}` : base;
  };

  // Normalize articles list (Hanya data riil dari API, tanpa dummy fallback)
  const allArticles: ArticleItem[] = useMemo(() => {
    if (initialArticles && initialArticles.length > 0) {
      return initialArticles.map((a: any, idx: number) => ({
        id: a.id || `art-${idx}`,
        title: a.title,
        slug: a.slug || `artikel-${idx}`,
        category: a.sector || a.issueCategory || 'Kebijakan Publik',
        date: a.publishedAt
          ? formatDateIndonesian(a.publishedAt)
          : a.createdAt
          ? formatDateIndonesian(a.createdAt)
          : 'Terbaru',
        summary: a.excerpt || a.summary || '',
        thumbnail: a.thumbnailUrl || a.featuredImageUrl || a.posterUrl || '',
        readingTime: '3 mnt baca',
        featured: idx === 0,
      }));
    }
    return [];
  }, [initialArticles]);

  const featuredArticle = allArticles.length > 0 ? allArticles[0] : null;
  const gridArticles = allArticles.length > 1 ? allArticles.slice(1) : [];

  // Jika belum ada artikel sama sekali dari API: tampilkan state kosong yang elegan
  if (allArticles.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-amber-200 bg-[#FBF9F5] p-12 sm:p-16 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-100/60 text-[#96702c] mx-auto flex items-center justify-center font-bold">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Belum Ada Artikel yang Dipublikasikan
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Seluruh publikasi risalah kebijakan, tanggapan fraksi, dan rilis resmi dewan akan ditampilkan di sini saat diterbitkan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ========================================================= */}
      {/* FEATURED SPOTLIGHT ARTICLE (Compact Editorial Style)       */}
      {/* ========================================================= */}
      {featuredArticle && (
        <section className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden group hover:border-[#96702c]/50 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* Visual Thumbnail: Compact proportions */}
            <div className="md:col-span-5 lg:col-span-4 relative overflow-hidden bg-slate-900 aspect-[16/10] md:aspect-auto h-52 sm:h-60 md:h-full min-h-[180px] md:min-h-[210px] max-h-[250px] flex items-center justify-center">
              {featuredArticle.thumbnail ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={featuredArticle.thumbnail}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-amber-300/80 p-6 bg-gradient-to-br from-slate-900 to-slate-800">
                  <BookOpen className="w-8 h-8 opacity-60 mb-1" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-300">Risalah Parlemen</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Badges Over Image */}
              <div className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full bg-[#96702c] text-white text-[10px] font-bold shadow-xs">
                <span>Kajian Utama Terpilih</span>
              </div>

              <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium">
                <Calendar className="w-3 h-3 text-amber-300" />
                <span>{featuredArticle.date}</span>
              </div>
            </div>

            {/* Content Details: Balanced compact padding and typography */}
            <div className="md:col-span-7 lg:col-span-8 p-5 sm:p-6 lg:p-7 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-[#96702c] border border-amber-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#96702c]" />
                  <span>{featuredArticle.category}</span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#96702c] transition-colors leading-snug line-clamp-2">
                  <Link href={getArticleHref(featuredArticle.slug)}>
                    {featuredArticle.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {featuredArticle.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-medium">
                  Penulis: <strong className="text-slate-800">{officialFullName}</strong>
                </div>

                <Link
                  href={getArticleHref(featuredArticle.slug)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#96702c] hover:bg-[#805f24] text-white text-xs font-bold transition shadow-xs cursor-pointer"
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
      {gridArticles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
              Arsip Publikasi &amp; Risalah
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {gridArticles.length} Kajian Lainnya
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridArticles.map((art) => (
              <article
                key={art.id}
                className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_32px_-8px_rgba(150,112,44,0.18)] hover:border-[#96702c]/50 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
              >
                <div>
                  {/* Thumbnail Image dengan Date Badge */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900 flex items-center justify-center">
                    {art.thumbnail ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={art.thumbnail}
                        alt={art.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-amber-300/80 p-6 bg-gradient-to-br from-slate-900 to-slate-800">
                        <BookOpen className="w-8 h-8 opacity-60 mb-1" />
                        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Publikasi Risalah</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                    {/* Badge Tanggal */}
                    <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white/95 text-[10.5px] font-medium shadow-sm">
                      <Calendar className="w-3 h-3 text-amber-300 shrink-0" />
                      <span>{art.date}</span>
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
                        href={getArticleHref(art.slug)}
                        className="hover:underline decoration-[#96702c]/40 underline-offset-2"
                      >
                        {art.title}
                      </Link>
                    </h4>

                    {/* Ringkasan */}
                    {art.summary && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2rem]">
                        {art.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2.5 pb-3 px-4 sm:px-5 border-t border-slate-100 flex items-center justify-between mt-auto bg-slate-50/50">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-400">
                    <BookOpen className="w-3 h-3 text-[#96702c]/70" />
                    <span>Kajian Parlemen</span>
                  </div>

                  <Link
                    href={getArticleHref(art.slug)}
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
