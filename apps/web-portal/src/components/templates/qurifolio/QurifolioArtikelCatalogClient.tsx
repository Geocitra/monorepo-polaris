'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Clock,
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface QurifolioArtikelCatalogClientProps {
  articles: any[];
  member: any;
  theme?: any;
  subdomain?: string;
}

export function QurifolioArtikelCatalogClient({
  articles = [],
  member,
  theme,
  subdomain,
}: QurifolioArtikelCatalogClientProps) {
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

  const getArticleImg = (art: any, idx: number) => {
    if (art?.posterUrl && typeof art.posterUrl === 'string' && art.posterUrl.trim().length > 0) {
      return art.posterUrl;
    }
    if (art?.featuredImageUrl && typeof art.featuredImageUrl === 'string' && art.featuredImageUrl.trim().length > 0) {
      return art.featuredImageUrl;
    }
    if (art?.imageUrl && typeof art.imageUrl === 'string' && art.imageUrl.trim().length > 0) {
      return art.imageUrl;
    }
    const fallbacks = [
      '/images/article-crop-1.png',
      '/images/article-crop-2.png',
      '/images/article-crop-3.png',
    ];
    return fallbacks[idx % fallbacks.length];
  };

  function getArticleParagraphs(article: any) {
    // 1. Ekstrak paragraf asli dari body konten markdown artikel tanpa data dummy
    const rawContent = article.bodyContentMarkdown || article.content || '';
    if (rawContent && typeof rawContent === 'string') {
      // Bersihkan heading markdown (#, ##, dll) dan format simbol (*, _, `, dll)
      const cleanText = rawContent
        .replace(/^#+\s+.*$/gm, '')
        .replace(/[*_~`]/g, '')
        .trim();

      const paras = cleanText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 25);

      if (paras.length >= 2) {
        return paras.slice(0, 2);
      }
      if (paras.length === 1) {
        const exc = (article.excerpt || '').trim();
        if (exc && !paras[0].includes(exc)) {
          return [exc, paras[0]];
        }
        return [paras[0]];
      }
    }

    // 2. Gunakan excerpt asli artikel jika body tidak tersedia
    if (article.excerpt && typeof article.excerpt === 'string' && article.excerpt.trim().length > 0) {
      return [article.excerpt.trim()];
    }

    // 3. Gunakan summary asli artikel
    if (article.summary && typeof article.summary === 'string' && article.summary.trim().length > 0) {
      return [article.summary.trim()];
    }

    return ['Kajian kebijakan resmi dan risalah regulasi parlemen.'];
  }

  return (
    <div className="space-y-8 sm:space-y-10 w-full">
      {articles.length === 0 ? (
        <div className="bg-white p-12 sm:p-16 rounded-3xl border border-stone-200 text-center max-w-xl mx-auto shadow-xs">
          <BookOpen className="w-12 h-12 text-[#FF6B00] mx-auto mb-4" />
          <h3 className="text-xl font-black text-[#161616] mb-2">Belum Ada Artikel Publik</h3>
          <p className="text-sm text-stone-500">
            Kajian kebijakan dan publikasi pemikiran dewan akan segera dirilis di sini.
          </p>
        </div>
      ) : (
        articles.map((article, index) => {
          const articleSlug = article.slug || article.id;
          const category = article.issueCategory || article.category || 'Kajian Parlemen';
          const readTime = article.readingTimeMinutes || 4;
          const isReversed = index % 2 === 1; // Alternating layout
          const paragraphs = getArticleParagraphs(article);

          return (
            <article
              key={article.id || index}
              className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-[#FF6B00] transition-all duration-300 group"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
                
                {/* ─── IMAGE COLUMN (PROPORSIONAL DENGAN OVERLAY NOMOR) ─── */}
                <div
                  className={`relative w-full min-h-[220px] sm:min-h-[260px] md:min-h-full overflow-hidden bg-stone-100 ${
                    isReversed ? 'md:col-span-5 lg:col-span-4 md:order-2' : 'md:col-span-5 lg:col-span-4 md:order-1'
                  }`}
                >
                  <Link href={getNavLinkHref(`/artikel/${articleSlug}`)} className="block w-full h-full">
                    <img
                      src={getArticleImg(article, index)}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Dark gradient scrim at the bottom with Orange line and Big White Number */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-4 sm:p-6 select-none pointer-events-none">
                      <div className="w-7 h-1 bg-[#FF6B00] rounded-full mb-1" />
                      <span className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none drop-shadow-md">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </Link>
                </div>

                {/* ─── CONTENT COLUMN (PADAT, LENGKAP, DAN PENUH PROPORSIONAL) ─── */}
                <div
                  className={`p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 ${
                    isReversed ? 'md:col-span-7 lg:col-span-8 md:order-1' : 'md:col-span-7 lg:col-span-8 md:order-2'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Orange Category Badge */}
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#FF6B00] block">
                      {category}
                    </span>

                    {/* Bold Headline */}
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#161616] group-hover:text-[#FF6B00] transition-colors tracking-tight leading-snug line-clamp-2">
                      <Link href={getNavLinkHref(`/artikel/${articleSlug}`)}>
                        {article.title}
                      </Link>
                    </h2>

                    {/* Multi-Paragraph Extended Explanation (Mengisi Card Secara Penuh) */}
                    <div className="space-y-3 pt-1">
                      {paragraphs.map((p, pIdx) => (
                        <p key={pIdx} className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Footer Action & Meta */}
                  <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100">
                    <div className="flex items-center gap-2 text-stone-400 font-medium text-xs">
                      <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>{readTime} min baca</span>
                      {article.publishedAt && (
                        <>
                          <span>•</span>
                          <span>{formatDateIndonesian(article.publishedAt)}</span>
                        </>
                      )}
                    </div>

                    <Link
                      href={getNavLinkHref(`/artikel/${articleSlug}`)}
                      className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#161616] hover:bg-[#FF6B00] text-white font-extrabold uppercase tracking-wider text-xs transition-colors shadow-xs"
                    >
                      <span>Baca Kajian Lengkap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>

              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
