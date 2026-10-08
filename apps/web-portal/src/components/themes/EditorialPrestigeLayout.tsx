'use client';

import React from 'react';
import Link from 'next/link';
import { Newspaper, BookOpen, ArrowRight, Quote, ShieldCheck, MapPin, Feather } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface ThemeLayoutProps {
  member: any;
  theme: any;
  recentArticles: any[];
}

export function EditorialPrestigeLayout({ member, theme, recentArticles }: ThemeLayoutProps) {
  const primaryColor = theme.primaryHexColor || '#1E293B';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-12">
      {/* EDITORIAL MASTHEAD */}
      <header className="border-b-2 border-slate-900 dark:border-slate-100 pb-6 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-serif italic text-slate-500 uppercase tracking-widest">
          <span>Risalah Pemikiran & Advokasi Legislatif</span>
          <span>•</span>
          <span>Dapil {member.dapilName}</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-slate-950 dark:text-white">
          {member.fullName}
        </h1>
        <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
          {member.partyAffiliation} • {member.commissionName || 'Komisi Parlemen'} • {member.provinceName}
        </p>
      </header>

      {/* EDITORIAL HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-slate-200 dark:border-slate-800 pb-12">
        {/* Kolom Kiri: Foto Monokrom / Profil Tajam */}
        <div className="lg:col-span-4 space-y-4">
          {theme.officialPhotoUrl ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-900 shadow-xl bg-slate-100 aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={theme.officialPhotoUrl}
                alt={member.fullName}
                className="h-full w-full object-cover object-top filter grayscale contrast-115 hover:grayscale-0 transition-all duration-500"
              />
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-slate-900 p-8 text-center bg-slate-50">
              <Feather className="w-12 h-12 text-slate-400 mx-auto" />
            </div>
          )}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Verifikasi Mandat Parlemen</span>
            </div>
            <p className="leading-relaxed">
              Mewakili aspirasi konstituen wilayah {member.dapilName} secara independen dan akuntabel.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Opini Utama & Gagasan Tajam */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative p-6 sm:p-8 rounded-2xl bg-amber-50/60 dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800">
            <Quote className="w-10 h-10 text-amber-500/20 absolute -top-3 -left-2" />
            <p className="font-serif italic text-xl sm:text-2xl text-slate-900 dark:text-slate-100 leading-snug">
              "{theme.headlineTagline || 'Kebijakan publik terbaik lahir dari dialektika yang jujur dengan denyut nadi rakyat.'}"
            </p>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
            <p>{theme.bioBiography}</p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="#artikel"
              className="px-6 py-3 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-bold font-sans uppercase tracking-wider hover:opacity-90 transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Kumpulan Opini & Risalah</span>
            </Link>
            <Link
              href="/lapor"
              className="px-6 py-3 rounded-xl border border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold font-sans uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2"
            >
              <span>Ruang Aspirasi Warga</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ARTIKEL EDITORIAL DUA KOLOM */}
      <section id="artikel" className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-100 pb-3">
          <h2 className="text-2xl font-serif font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            <span>Katalog Kajian & Opini Kebijakan</span>
          </h2>
          <span className="text-xs font-mono uppercase text-slate-500">Vol. 2026</span>
        </div>

        {recentArticles.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center text-sm font-serif italic text-slate-500">
            Belum ada risalah opini yang diarsipkan dalam volume ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article: any) => (
              <article
                key={article.id}
                className="group flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-900 transition-all shadow-xs"
              >
                <div className="space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    {formatDateIndonesian(article.publishedAt)}
                  </div>
                  <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white group-hover:underline leading-snug line-clamp-2">
                    <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-serif line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-sans font-bold">
                  <span className="text-slate-400 text-[11px]">Telaah DIM</span>
                  <Link
                    href={`/artikel/${article.slug}`}
                    className="inline-flex items-center gap-1 text-slate-900 dark:text-white hover:translate-x-1 transition-transform"
                  >
                    <span>Baca Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
