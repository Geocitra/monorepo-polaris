'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MessageSquare, Calendar, Clock, BookOpen } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface ArticlesCategoryGridProps {
  articles: any[];
  member: any;
  theme?: any;
  config?: Record<string, any>;
  variant?: string;
}

export function ArticlesCategoryGrid({
  articles = [],
}: ArticlesCategoryGridProps) {
  // Ambil hingga 3 artikel utama sesuai komposisi 3 kolom Gambar 1
  const displayArticles = (articles || []).slice(0, 3);

  return (
    <section id="artikel" className="space-y-6 pt-4">
      {/* SECTION HEADER: ARTIKEL TERKINI — & Lihat Semua Artikel -> */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            Artikel Terkini
          </h2>
          <span className="w-8 h-0.5 bg-slate-400 rounded-full" />
        </div>

        <Link
          href="/artikel"
          className="text-xs sm:text-sm font-bold text-[#96702c] hover:text-[#836125] flex items-center gap-1.5 transition-colors group"
        >
          <span>Lihat Semua Artikel</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {displayArticles.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-sm text-slate-400 italic">
          Belum ada artikel publikasi yang ditambahkan dalam katalog.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayArticles.map((article: any, index: number) => {
            const thumbnail =
              article.thumbnailUrl ||
              article.featuredImageUrl ||
              article.posterUrl ||
              (index === 0
                ? '/images/showcase-artikel-pertanian.jpg'
                : index === 1
                ? '/images/showcase-infografis-apbd.jpg'
                : '/images/showcase-poster-surya.jpg');

            const dateLabel = article.publishedAt
              ? formatDateIndonesian(article.publishedAt)
              : '01 Sep 2026';

            const sector = article.sector || (index === 0 ? 'Ekonomi' : index === 1 ? 'Infrastruktur' : 'Pendidikan');

            return (
              <article
                key={article.id || index}
                className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_32px_-8px_rgba(150,112,44,0.18)] hover:border-[#96702c]/50 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
              >
                <div>
                  {/* Thumbnail dengan Badge Tanggal di pojok kiri bawah foto */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                    {/* Date Badge Pill (Frosted Glass dengan Icon Calendar) */}
                    <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white/95 text-[10.5px] font-medium shadow-sm">
                      <Calendar className="w-3 h-3 text-amber-300 shrink-0" />
                      <span>{dateLabel}</span>
                    </div>

                    {/* Estimasi Waktu Baca di Kanan Atas */}
                    <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/15 text-white/85 text-[10px] font-medium">
                      <Clock className="w-2.5 h-2.5 text-amber-200" />
                      <span>3 mnt baca</span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-2.5">
                    {/* Sektor Kategori dengan Gold Accent Dot Pill */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-[#96702c] border border-amber-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#96702c]" />
                        {sector}
                      </span>
                    </div>

                    {/* Judul Artikel */}
                    <h3 className="text-[13.5px] sm:text-sm font-bold text-slate-900 group-hover:text-[#96702c] transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
                      <Link href={`/artikel/${article.slug}`} className="hover:underline decoration-[#96702c]/40 underline-offset-2">
                        {article.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2rem]">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer: Kajian Resmi & Baca Selengkapnya */}
                <div className="pt-2.5 pb-3 px-4 border-t border-slate-100 flex items-center justify-between mt-auto bg-slate-50/50">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-400">
                    <BookOpen className="w-3 h-3 text-[#96702c]/70" />
                    <span>Kajian Resmi</span>
                  </div>

                  <Link
                    href={`/artikel/${article.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#96702c] group-hover:text-[#7d5c21] transition-colors"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
