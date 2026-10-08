'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, BookOpen, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface ThemeLayoutProps {
  member: any;
  theme: any;
  recentArticles: any[];
}

export function StandardDefaultLayout({ member, theme, recentArticles }: ThemeLayoutProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* HERO SECTION DEWAN */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 rounded-full bg-portal-primary/10 px-3 py-1 text-xs font-semibold text-portal-primary">
              <ShieldCheck className="h-4 w-4" />
              <span>Pejabat Publik Terverifikasi Parlemen</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl leading-tight">
              {member.fullName}
            </h1>

            <p className="text-lg font-medium text-gray-600 flex items-center gap-1.5">
              <MapPin className="h-5 w-5 text-portal-primary shrink-0" />
              Dapil {member.dapilName} ({member.provinceName})
            </p>

            <blockquote className="border-l-4 border-portal-primary pl-4 text-base italic text-gray-700">
              "{theme.headlineTagline || 'Mengawal aspirasi rakyat demi kemakmuran dan keadilan daerah.'}"
            </blockquote>

            <p className="text-sm text-gray-600 leading-relaxed pt-2">
              {theme.bioBiography}
            </p>

            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                href="#artikel"
                className="inline-flex items-center space-x-2 rounded-lg bg-portal-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                <BookOpen className="h-4 w-4" />
                <span>Baca Gagasan Kebijakan</span>
              </Link>
              <Link
                href="/lapor"
                className="inline-flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <span>Sampaikan Aduan Warga</span>
              </Link>
            </div>
          </div>

          {/* FOTO BALIHO RESMI DEWAN */}
          {theme.officialPhotoUrl && (
            <div className="shrink-0 flex justify-center">
              <div className="relative h-56 w-56 sm:h-72 sm:w-72 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={theme.officialPhotoUrl}
                  alt={member.fullName}
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FEED ARTIKEL KEBIJAKAN 3000 KATA */}
      <section id="artikel" className="mt-14 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Gagasan & Kajian Kebijakan Publik
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Dokumen pemikiran resmi dan analisis sektoral berbasis data daerah.
            </p>
          </div>
          <Sparkles className="h-5 w-5 text-portal-primary hidden sm:block" />
        </div>

        {recentArticles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-sm text-gray-500">
            Belum ada artikel kebijakan yang dipublikasikan.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentArticles.map((article: any) => (
              <article
                key={article.id}
                className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-portal-primary">
                    Kajian Dewan
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-portal-primary transition-colors line-clamp-2">
                    <Link href={`/artikel/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
                  <time>{formatDateIndonesian(article.publishedAt)}</time>
                  <Link
                    href={`/artikel/${article.slug}`}
                    className="inline-flex items-center space-x-1 font-semibold text-portal-primary group-hover:underline"
                  >
                    <span>Baca Ulasan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
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
