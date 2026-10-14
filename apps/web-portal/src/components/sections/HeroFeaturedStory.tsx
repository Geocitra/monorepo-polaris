'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { formatDateIndonesian, calculateReadingTime } from '@/lib/utils';

interface HeroFeaturedStoryProps {
  article?: any;
  member: any;
  theme: any;
  config?: Record<string, any>;
  variant?: string;
}

export function HeroFeaturedStory({
  article,
  member,
  theme,
  variant = 'POLARIS_INSIGHT_HERO',
}: HeroFeaturedStoryProps) {
  if (!article) {
    return (
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border border-slate-700/50 flex flex-col justify-between min-h-[360px]">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kajian Kebijakan Utama</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black leading-tight">
            Transparansi Gagasan & Risalah Pengabdian Konstituen
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {theme.headlineTagline || `Saluran publikasi pemikiran, kajian legislasi, dan catatan perjuangan aspirasi masyarakat oleh ${member.fullName}.`}
          </p>
        </div>
        <div className="pt-6">
          <Link
            href="#kategori"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-md"
          >
            <span>Jelajahi Arsip Pemikiran</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(article.wordCount || 3000);
  const isEditorial = variant === 'EDITORIAL_SERIF';

  // Fallback image: posterUrl -> theme.heroBannerUrl -> default placeholder
  const heroImage =
    article.posterUrl ||
    theme.heroBannerUrl ||
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop';

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-white group flex flex-col justify-end min-h-[460px] sm:min-h-[520px]">
      {/* Background Image with Cinematic Dark Gradient Overlay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroImage}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-10 space-y-4 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 uppercase tracking-wider text-[11px] font-black">
            Artikel Utama
          </span>
          <span className="text-amber-300 font-mono tracking-wide text-xs">
            KAJIAN UTAMA • {formatDateIndonesian(article.publishedAt)}
          </span>
        </div>

        <h1
          className={`text-2xl sm:text-4xl font-black leading-tight tracking-tight text-white group-hover:text-amber-300 transition-colors ${
            isEditorial ? 'font-serif' : 'font-sans'
          }`}
        >
          <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-2xl font-normal">
          {article.excerpt}
        </p>

        {/* Author Badge & CTA Action Bar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            {theme.officialPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={theme.officialPhotoUrl}
                alt={member.fullName}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                {member.fullName.charAt(0)}
              </div>
            )}
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Oleh Penulis</span>
              <span className="text-xs font-bold text-white">{member.fullName}</span>
            </div>
          </div>

          <Link
            href={`/artikel/${article.slug}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg active:scale-95 shrink-0"
          >
            <span>BACA SELENGKAPNYA</span>
            <span>•</span>
            <span className="font-mono text-[11px] font-bold">{readingTime.toUpperCase()}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
