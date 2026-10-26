'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { XenonMintShell } from './XenonMintShell';
import { getXenonMemberInfo, useXenonHref, XENON_THEME } from './utils';

interface XenonMintArtikelDetailClientProps {
  article: any;
  member: any;
  theme: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function XenonMintArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: XenonMintArtikelDetailClientProps) {
  const currentArticle = article || {};
  const info = getXenonMemberInfo(member, theme, subdomain);
  const href = useXenonHref(subdomain);

  const displayRelated =
    relatedArticles && relatedArticles.length > 0
      ? relatedArticles.filter((a: any) => a.slug !== currentArticle?.slug).slice(0, 3)
      : [];

  const formattedDate = currentArticle?.publishedAt
    ? new Date(currentArticle.publishedAt).toLocaleDateString('id-ID', {
        dateStyle: 'long',
      })
    : 'Oktober 2026';

  const coverImage =
    currentArticle?.featuredImageUrl ||
    currentArticle?.posterUrl ||
    currentArticle?.coverImageUrl ||
    currentArticle?.imageUrl ||
    currentArticle?.thumbnailUrl ||
    '/images/default-article.jpg';

  const articleContent =
    currentArticle?.bodyContentMarkdown ||
    currentArticle?.body ||
    currentArticle?.content ||
    currentArticle?.excerpt ||
    '';

  return (
    <XenonMintShell member={member} theme={theme} subdomain={subdomain} activePage="artikel">
      <div className="px-6 sm:px-10 lg:px-12 py-10 sm:py-14 max-w-4xl mx-auto space-y-10">
        
        {/* Back Link */}
        <div>
          <Link
            href={href('/artikel')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Katalog Artikel</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#00A86B] text-xs font-bold uppercase tracking-wider">
            {currentArticle?.category || currentArticle?.issueCategory || 'Kebijakan Publik'}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            {currentArticle?.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-200 pb-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-[#00A86B]" />
              <span>{formattedDate}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-[#00A86B]" />
              <span>{currentArticle?.readingTime || '5 menit baca'}</span>
            </span>
            <span>•</span>
            <span className="text-[#00A86B] font-bold">Oleh {info.fullName}</span>
          </div>
        </header>

        {/* Big Cover Image */}
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-slate-100 shadow-xl border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt={currentArticle?.title || 'Artikel Kebijakan'}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Lead Excerpt */}
        {currentArticle?.excerpt && (
          <div className="p-6 rounded-2xl bg-emerald-50/60 border-l-4 border-[#00D084] text-slate-800 text-sm sm:text-base font-medium leading-relaxed italic">
            &ldquo;{currentArticle.excerpt}&rdquo;
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-sm sm:text-base space-y-6">
          {articleContent ? (
            articleContent.split('\n\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="whitespace-pre-line">{paragraph}</p>
            ))
          ) : (
            <p className="text-slate-500 italic">Konten artikel belum tersedia.</p>
          )}
        </div>

        {/* Author Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#00D084] shrink-0 bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={info.avatar}
              alt={info.fullName}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="text-xs font-bold text-[#00A86B] uppercase tracking-wider">
              Tentang Penulis
            </div>
            <div className="text-base font-black text-slate-950">{info.fullName}</div>
            <div className="text-xs text-slate-600">{info.title} • {info.party}</div>
          </div>
          <Link
            href={href('/profil')}
            className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold transition shadow-sm shrink-0"
          >
            Lihat Profil Dewan
          </Link>
        </div>

        {/* Related Articles */}
        {displayRelated.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <h3 className="text-xl sm:text-2xl font-black text-slate-950">
              Artikel Terkait Lainnya
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayRelated.map((rel: any, idx: number) => (
                <Link
                  key={rel.id || `rel-${idx}`}
                  href={href(`/artikel/${rel.slug || ''}`)}
                  className="group bg-white rounded-2xl p-3 border border-slate-200 hover:border-[#00D084] shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          rel.featuredImageUrl ||
                          rel.posterUrl ||
                          rel.coverImageUrl ||
                          rel.imageUrl ||
                          `/images/ref-article-${(idx % 3) + 1}.jpg`
                        }
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="text-xs font-bold text-slate-950 group-hover:text-[#00A86B] transition line-clamp-2 mb-1">
                      {rel.title}
                    </div>
                  </div>
                  <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{rel.readingTime || '4 mnt baca'}</span>
                    <span className="font-bold text-[#00A86B] flex items-center gap-1">
                      Baca ↗
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </XenonMintShell>
  );
}
