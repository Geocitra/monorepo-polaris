'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Sparkles, Building2, UserCheck } from 'lucide-react';
import { ParliamentShell } from '@/components/templates/polaris-insight/ParliamentShell';
import { MarkdownContent } from '@/components/article/markdown-content';
import { CitizenComments } from '@/components/article/citizen-comments';
import { ArticleReaderToolbar } from '@/components/article/ArticleReaderToolbar';
import { NewsletterSubscriptionBox } from '@/components/sections/NewsletterSubscriptionBox';
import { formatDateIndonesian, calculateReadingTime } from '@/lib/utils';

interface DefaultParliamentArticleViewProps {
  member: any;
  effectiveTheme: any;
  subdomain: string;
  article: any;
  slug: string;
}

export function DefaultParliamentArticleView({
  member,
  effectiveTheme,
  subdomain,
  article,
  slug,
}: DefaultParliamentArticleViewProps) {
  const theme = effectiveTheme;
  const wordCount = article.wordCount || 3000;
  const readingTime = calculateReadingTime(wordCount);

  return (
    <ParliamentShell
      member={member}
      theme={effectiveTheme}
      subdomain={subdomain}
      activePage="artikel"
      showMasthead={false}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-14">
        {/* Top Navigation & Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#96702c] hover:text-[#805f24] transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Katalog Artikel</span>
          </Link>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            POLARIS Negarawan • Risalah Kebijakan
          </div>
        </div>

        <article className="relative">
          {/* Editorial Header */}
          <header className="space-y-5 border-b border-slate-200 pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-[#96702c] border border-amber-200/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-[#96702c]" />
                <span>Kajian Kebijakan Parlemen Resmi</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-semibold">
                <Clock className="h-3 w-3 text-slate-500" />
                <span>{readingTime}</span>
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl leading-[1.15]">
              {article.title}
            </h1>

            {/* Author Byline */}
            <div className="flex items-center gap-4 pt-3">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm shrink-0">
                {theme?.officialPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={theme.officialPhotoUrl}
                    alt={member.fullName}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-800 text-white font-bold text-sm">
                    {member.fullName.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {member.fullName}
                  </span>
                  <UserCheck className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                  <span>Fraksi {member.partyAffiliation}</span>
                  <span>•</span>
                  <span>Dapil {member.dapilName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateIndonesian(article.publishedAt)}
                  </span>
                </p>
              </div>
            </div>
          </header>

          {/* Reader Toolbar: Scroll Progress, Font Size, Copy Link, Print, Share */}
          <ArticleReaderToolbar
            title={article.title}
            canonicalUrl={article.canonicalUrl}
          />

          {/* Poster Visual (Cloudflare R2 / DALL-E) */}
          {article.posterUrl && (
            <div className="my-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.posterUrl}
                alt={article.title}
                className="w-full object-cover max-h-[560px]"
              />
              <div className="p-3 text-center text-xs text-slate-500 italic bg-white border-t border-slate-100">
                Dokumentasi Risalah & Visual Kebijakan • Arsip Digital Dewan
              </div>
            </div>
          )}

          {/* Excerpt Lead */}
          <div className="my-8 p-6 rounded-2xl bg-[#FBF9F5] border-l-4 border-[#96702c] border-y border-r border-amber-100/70 text-slate-800">
            <p className="text-base sm:text-lg font-medium italic leading-relaxed">
              "{article.excerpt}"
            </p>
          </div>

          {/* Article Body */}
          <div id="article-body-container" className="pt-2">
            <MarkdownContent content={article.bodyContentMarkdown} />
          </div>

          {/* Author Bio Card */}
          <div className="my-14 rounded-3xl bg-slate-50 border border-slate-200 p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md shrink-0">
                {theme?.officialPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={theme.officialPhotoUrl}
                    alt={member.fullName}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-900 text-white font-bold text-xl">
                    {member.fullName.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">
                    {member.fullName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                    Penulis & Anggota Parlemen
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {theme?.bioBiography ||
                    `Mewakili aspirasi konstituen Daerah Pemilihan ${member.dapilName}. Mengawal transparansi penganggaran, advokasi regulasi daerah, dan pemberdayaan masyarakat.`}
                </p>
                <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Fraksi {member.partyAffiliation} • {member.legislativeLevel?.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Subscription Box */}
          <div className="my-10">
            <NewsletterSubscriptionBox
              member={member}
              theme={theme}
              subdomain={subdomain}
              variant="ARTICLE_FOOTER"
            />
          </div>

          {/* Public Citizen Discussion Comments */}
          <CitizenComments
            slug={slug}
            initialCommentCount={article.commentCount || 0}
          />
        </article>
      </div>
    </ParliamentShell>
  );
}

