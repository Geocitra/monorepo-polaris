'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MessageSquare } from 'lucide-react';
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
                className="group rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail dengan Badge Tanggal di pojok kiri bawah foto */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Date Badge Pill (kiri bawah seperti Gambar 1) */}
                    <div className="absolute bottom-3 left-3 bg-[#96702c]/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs shadow-sm">
                      {dateLabel}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-2.5">
                    {/* Sektor Kategori dengan Vertical Bar */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <span className="text-[#96702c] font-black">|</span>
                      <span>{sector}</span>
                    </div>

                    {/* Judul Artikel */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#96702c] transition-colors line-clamp-2 leading-snug">
                      <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer: Tanggapan Warga & Baca Selengkapnya */}
                <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{article.commentCount || 0} Tanggapan Warga</span>
                  </div>

                  <Link
                    href={`/artikel/${article.slug}`}
                    className="font-bold text-[#96702c] group-hover:text-[#836125] flex items-center gap-1 transition"
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
