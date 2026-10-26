'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Building2,
  MapPin,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { MarkdownContent } from '@/components/article/markdown-content';
import { ArticleReaderToolbar } from '@/components/article/ArticleReaderToolbar';
import { LimeSparkle, LimeStarburst } from './CreatixLimeShell';

interface CreatixLimeArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function CreatixLimeArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: CreatixLimeArtikelDetailClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');

  const getNavLinkHref = (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    if (previewTemplate) {
      base += `${base.includes('?') ? '&' : '?'}preview_template=${previewTemplate}`;
    }
    return base;
  };

  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Dr. Ir. Sangsoro Mowo Berkah, M.Sc.';

  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-standing-full.png';

  const rawDapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
  const dapil = rawDapil.replace(/_/g, ' ');

  const rawLevel = member?.legislativeLevel || 'DPR RI';
  const legislativeLevel = rawLevel.replace(/_/g, ' ');

  const coverImg =
    article?.featuredImageUrl ||
    article?.coverUrl ||
    article?.imageUrl ||
    article?.posterUrl ||
    article?.thumbnailUrl ||
    '/images/showcase-artikel-pertanian.jpg';

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          1. HEADER & NAVIGATION BACK
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <Link
          href={getNavLinkHref('/artikel')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#84CC16] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Katalog Risalah</span>
        </Link>

        {/* Category & Date */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center bg-[#84CC16] text-slate-950 font-black text-xs uppercase px-3 py-1.5 rounded-md shadow-md">
            <span>{article?.category || article?.issueCategory || 'Kajian Kebijakan'}</span>
            <div className="ml-2 pl-2 border-l border-black/20 flex items-center gap-0.5">
              <div className="w-0.5 h-3 bg-black/60 rounded-full" />
              <div className="w-0.5 h-3 bg-black/60 rounded-full" />
            </div>
          </div>

          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#84CC16]" />
            <span>{formatDateIndonesian(article?.publishedAt || article?.createdAt)}</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#84CC16]" />
            <span>{article?.readingTime || '4 mnt baca'}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight">
          {article?.title}
        </h1>

        {/* Excerpt */}
        {article?.excerpt && (
          <div className="p-5 rounded-2xl bg-[#0D120D] border-l-4 border-[#84CC16] border-y border-r border-white/10 text-slate-300 italic text-sm sm:text-base leading-relaxed">
            &ldquo;{article.excerpt}&rdquo;
          </div>
        )}

        {/* Author Metadata Bar */}
        <div className="flex items-center justify-between py-4 border-y border-white/10 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <img
              src={photoUrl}
              alt={officialFullName}
              className="w-12 h-12 rounded-full object-cover object-top border-2 border-[#84CC16]/60 bg-slate-900"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/default-avatar.png';
              }}
            />
            <div>
              <span className="text-xs font-bold text-white block">
                {officialFullName}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {legislativeLevel} • Dapil {dapil}
              </span>
            </div>
          </div>

          <ArticleReaderToolbar
            title={article?.title || ''}
            canonicalUrl={typeof window !== 'undefined' ? window.location.href : ''}
          />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. FEATURED COVER IMAGE
          ────────────────────────────────────────────────────────────────────────── */}
      {coverImg && (
        <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 relative">
          <img
            src={coverImg}
            alt={article?.title}
            className="w-full max-h-[500px] object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          3. ARTICLE BODY (MARKDOWN CONTENT)
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#0B0F0B] rounded-3xl p-6 sm:p-10 lg:p-12 border border-white/10 shadow-xl prose prose-invert prose-slate max-w-none prose-headings:font-black prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-[#84CC16] prose-blockquote:border-[#84CC16] prose-blockquote:text-slate-200">
        <MarkdownContent content={article?.body || article?.content || article?.summary || ''} />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. AUTHOR STATEMENT & PROFILE CARD
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0D140D] border border-white/10 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden sm:block">
          <LimeStarburst className="w-32 h-32 text-[#84CC16]" />
        </div>

        <img
          src={photoUrl}
          alt={officialFullName}
          className="w-20 h-20 rounded-full object-cover object-top border-2 border-[#84CC16] bg-slate-900 shrink-0 shadow-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/default-avatar.png';
          }}
        />
        <div className="space-y-2 text-center sm:text-left relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#84CC16] block">
            DITULIS OLEH WAKIL RAKYAT
          </span>
          <h3 className="text-lg font-black text-white">
            {officialFullName}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Menjalankan mandat konstituen di {legislativeLevel} Dapil {dapil}. Membuka ruang telaah kajian hukum dan kebijakan publik secara transparan.
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. RELATED ARTICLES
          ────────────────────────────────────────────────────────────────────────── */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Risalah Terkait Lainnya
            </h3>
            <Link
              href={getNavLinkHref('/artikel')}
              className="text-xs font-bold uppercase tracking-wider text-[#84CC16] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedArticles.slice(0, 2).map((rel, idx) => (
              <Link
                key={rel.id || idx}
                href={getNavLinkHref(`/artikel/${rel.slug}`)}
                className="group p-5 rounded-2xl bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/60 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#84CC16] block mb-1">
                    {rel.category || 'Risalah'}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#84CC16] transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-white group-hover:text-[#84CC16]">
                  <span>Baca Risalah</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#84CC16]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </article>
  );
}
