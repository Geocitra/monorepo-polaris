'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface ArticlesTrendingSidebarProps {
  articles: any[];
  member: any;
  theme?: any;
  config?: Record<string, any>;
  variant?: string;
}

export function ArticlesTrendingSidebar({
  articles,
}: ArticlesTrendingSidebarProps) {
  // Ambil hingga 4 artikel untuk ditampilkan di sidebar
  const displayArticles = (articles || []).slice(0, 4);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>Terhangat & Opini Dewan</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Rilis Terbaru
          </span>
        </div>

        {displayArticles.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            Belum ada naskah opini tambahan yang diarsipkan.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {displayArticles.map((article: any, index: number) => {
              const thumbnail =
                article.thumbnailUrl ||
                article.posterUrl ||
                'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=400&auto=format&fit=crop';

              return (
                <article key={article.id || index} className="py-3.5 first:pt-0 last:pb-0 group">
                  <div className="flex gap-3.5 items-start">
                    {/* Thumbnail Foto */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnail}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Judul & Tanggal */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                        <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{formatDateIndonesian(article.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {displayArticles.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="#kategori"
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition"
          >
            <span>Telusuri Arsip Opini Lainnya</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
