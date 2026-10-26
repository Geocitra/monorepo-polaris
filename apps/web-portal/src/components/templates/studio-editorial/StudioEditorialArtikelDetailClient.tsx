'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Bookmark,
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { MarkdownContent } from '@/components/article/markdown-content';
import { ArticleReaderToolbar } from '@/components/article/ArticleReaderToolbar';

interface StudioEditorialArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function StudioEditorialArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: StudioEditorialArtikelDetailClientProps) {
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
    <article className="max-w-4xl mx-auto px-6 sm:px-10 py-10 sm:py-16 space-y-10">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          1. HEADER & NAVIGATION BACK
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <Link
          href={getNavLinkHref('/artikel')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-stone-950 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Katalog Risalah</span>
        </Link>

        {/* Category & Date */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-stone-950 text-white text-[11px] font-bold uppercase tracking-wider">
            {article?.category || article?.issueCategory || 'Kajian Kebijakan'}
          </span>
          <span className="text-xs text-stone-500 font-semibold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>{formatDateIndonesian(article?.publishedAt || article?.createdAt)}</span>
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-xs text-stone-500 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{article?.readingTime || '4 mnt baca'}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-950 leading-[1.18] tracking-tight">
          {article?.title}
        </h1>

        {/* Excerpt */}
        {article?.excerpt && (
          <p className="font-serif text-base sm:text-lg italic text-stone-700 leading-relaxed border-l-2 border-stone-950 pl-4 py-1">
            &ldquo;{article.excerpt}&rdquo;
          </p>
        )}

        {/* Author Metadata Bar */}
        <div className="flex items-center justify-between py-4 border-y border-stone-300 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <img
              src={photoUrl}
              alt={officialFullName}
              className="w-12 h-12 rounded-full object-cover object-top border border-stone-300 bg-stone-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/default-avatar.png';
              }}
            />
            <div>
              <span className="text-xs font-bold text-stone-950 block">
                {officialFullName}
              </span>
              <span className="text-[11px] text-stone-500 block">
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
        <div className="rounded-2xl overflow-hidden border border-stone-300 shadow-md bg-stone-200">
          <img
            src={coverImg}
            alt={article?.title}
            className="w-full max-h-[500px] object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
            }}
          />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          3. ARTICLE BODY (MARKDOWN CONTENT)
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 lg:p-12 border border-stone-300 shadow-xs prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-950 prose-p:text-stone-800 prose-p:leading-relaxed prose-a:text-stone-950 prose-blockquote:border-stone-950 prose-blockquote:font-serif prose-blockquote:italic">
        <MarkdownContent content={article?.body || article?.content || article?.summary || ''} />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. AUTHOR STATEMENT & PROFILE CARD
          ────────────────────────────────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#E8E4DC] border border-stone-300 flex flex-col sm:flex-row items-center gap-6">
        <img
          src={photoUrl}
          alt={officialFullName}
          className="w-20 h-20 rounded-full object-cover object-top border-2 border-stone-400 bg-stone-300 shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/default-avatar.png';
          }}
        />
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
            DITULIS OLEH WAKIL RAKYAT
          </span>
          <h3 className="font-serif text-lg font-bold text-stone-950">
            {officialFullName}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            Menjalankan mandat keparlemenan di {legislativeLevel} Dapil {dapil}. Membuka ruang dialog dan telaah kebijakan publik untuk kemajuan daerah.
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. RELATED ARTICLES
          ────────────────────────────────────────────────────────────────────────── */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-stone-300">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-stone-950 tracking-tight">
              Risalah Kebijakan Lainnya
            </h3>
            <Link
              href={getNavLinkHref('/artikel')}
              className="text-xs font-bold uppercase tracking-wider text-stone-950 hover:text-stone-600 flex items-center gap-1"
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
                className="group p-5 rounded-2xl bg-white border border-stone-300 hover:border-stone-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    {rel.category || 'Risalah'}
                  </span>
                  <h4 className="font-serif text-base font-bold text-stone-950 group-hover:text-stone-700 transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
                <div className="mt-4 pt-2.5 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-950">
                  <span>Baca Risalah</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </article>
  );
}
