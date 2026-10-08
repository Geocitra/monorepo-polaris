'use client';

import React from 'react';
import Link from 'next/link';
import { Radio, ArrowRight, Clock, ShieldCheck, MapPin, Share2, FileText, ChevronRight } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface ThemeLayoutProps {
  member: any;
  theme: any;
  recentArticles: any[];
}

export function NewsroomBriefLayout({ member, theme, recentArticles }: ThemeLayoutProps) {
  const latestArticle = recentArticles[0];
  const otherArticles = recentArticles.slice(1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* NEWSROOM LIVE TICKER */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-red-600 text-white text-xs font-bold overflow-hidden shadow-sm">
        <span className="flex items-center gap-1.5 uppercase font-black px-2 py-0.5 rounded bg-white text-red-600 tracking-wider text-[10px] shrink-0">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          Live Newsroom
        </span>
        <div className="truncate text-red-100 font-medium">
          {latestArticle ? latestArticle.title : `Portal Siaran Pers Resmi ${member.fullName}`}
        </div>
      </div>

      {/* BIRO PERS HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-900 dark:border-slate-100 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-red-600 block mb-1">
            Biro Pemberitaan & Dokumentasi Dewan
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            {member.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">
            {member.partyAffiliation} • Komisi: {member.commissionName || 'Alat Kelengkapan'} • Dapil {member.dapilName}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/lapor"
            className="px-4 py-2.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:opacity-90 transition"
          >
            Aspirasi Warga
          </Link>
          {theme.officialPhotoUrl && (
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={theme.officialPhotoUrl}
                alt={member.fullName}
                className="w-full h-full object-cover object-top"
              />
            </div>
          )}
        </div>
      </header>

      {/* LEAD STORY BREAKING / HEADLINE GRID */}
      {latestArticle && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                Siaran Pers Utama
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {formatDateIndonesian(latestArticle.publishedAt)}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white hover:text-red-600 transition leading-tight">
              <Link href={`/artikel/${latestArticle.slug}`}>{latestArticle.title}</Link>
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
              {latestArticle.excerpt}
            </p>

            <div className="pt-2">
              <Link
                href={`/artikel/${latestArticle.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm"
              >
                <span>Baca Pernyataan Resmi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Fokus Pokok Pikiran</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
              "{theme.headlineTagline || 'Transparansi kebijakan untuk pengawasan publik yang kredibel.'}"
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              {theme.bioBiography}
            </div>
          </div>
        </section>
      )}

      {/* ARTIKEL BERITA CEPAT (NEWSROOM FEED GRID) */}
      <section className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
          Arsip Siaran Pers & Liputan Kebijakan
        </h3>

        {otherArticles.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">
            Belum ada rilis berita tambahan dalam arsip biro pers.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {otherArticles.map((article: any) => (
              <div
                key={article.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDateIndonesian(article.publishedAt)}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition leading-snug">
                    <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{article.excerpt}</p>
                </div>

                <Link
                  href={`/artikel/${article.slug}`}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition shrink-0 flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Rilis Lengkap</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
