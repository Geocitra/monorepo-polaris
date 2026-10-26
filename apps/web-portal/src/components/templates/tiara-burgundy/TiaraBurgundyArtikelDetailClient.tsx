'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Clock,
  Tag,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { TiaraBurgundyShell } from './TiaraBurgundyShell';
import { getTiaraMemberInfo, useTiaraHref } from './utils';

interface TiaraBurgundyArtikelDetailClientProps {
  member: any;
  theme: any;
  article: any;
  relatedArticles?: any[];
  subdomain?: string;
}

export function TiaraBurgundyArtikelDetailClient({
  member,
  theme,
  article,
  relatedArticles = [],
  subdomain,
}: TiaraBurgundyArtikelDetailClientProps) {
  const info = getTiaraMemberInfo(member, theme, subdomain);
  const href = useTiaraHref(subdomain);

  const currentArticle = article || {};
  const formattedDate = currentArticle.publishedAt
    ? new Date(currentArticle.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : currentArticle.date || 'Terbaru';

  const coverImage =
    currentArticle.featuredImageUrl ||
    currentArticle.posterUrl ||
    currentArticle.coverImageUrl ||
    currentArticle.imageUrl ||
    currentArticle.thumbnailUrl ||
    '/images/default-article.jpg';

  const articleContent =
    currentArticle.bodyContentMarkdown ||
    currentArticle.body ||
    currentArticle.content ||
    currentArticle.excerpt ||
    '';

  const paragraphs = articleContent
    .split('\n\n')
    .map((p: string) => p.trim())
    .filter(Boolean);

  const category =
    currentArticle.category ||
    currentArticle.categoryName ||
    currentArticle.issueCategory ||
    'Kebijakan Publik';

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: currentArticle.title || 'Artikel Polaris',
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan artikel berhasil disalin ke clipboard!');
    }
  };

  return (
    <TiaraBurgundyShell member={member} theme={theme} subdomain={subdomain} activePage="artikel">
      {/* Editorial Header Section */}
      <section className="bg-[#EFEBE4] border-b border-[#E5DED5] py-12 sm:py-16 px-6 sm:px-10 lg:px-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-xs font-serif uppercase tracking-[0.2em] text-[#7A6F6A]">
            <Link href={href('/')} className="hover:text-[#6B1724] transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#B8AEA8]" />
            <Link href={href('/artikel')} className="hover:text-[#6B1724] transition-colors">
              Artikel
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#B8AEA8]" />
            <span className="font-bold line-clamp-1" style={{ color: info.textAccentColor }}>{category}</span>
          </div>

          {/* Category & Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center space-x-3">
              <span className="px-3.5 py-1 bg-[#6B1724] text-white rounded-full font-serif text-[11px] font-bold uppercase tracking-[0.15em] shadow-xs">
                {category}
              </span>
              <div className="flex items-center space-x-3 text-xs text-[#7A6F6A] font-serif uppercase tracking-wider">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" style={{ color: info.textAccentColor }} />
                  <span>{formattedDate}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" style={{ color: info.textAccentColor }} />
                  <span>5 menit baca</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-white border border-[#DDD5CA] rounded-full text-xs font-serif uppercase tracking-wider text-[#5A524D] hover:border-[#6B1724] hover:text-[#6B1724] transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan</span>
            </button>
          </div>

          {/* Main Article Title */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#6B1724] tracking-tight leading-tight uppercase font-normal pt-2">
            {currentArticle.title || 'Catatan Advokasi Parlemen'}
          </h1>

          {/* Author Byline */}
          <div className="flex items-center space-x-3 pt-2 border-t border-[#E5DED5]">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#DDD5CA] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={info.avatarUrl}
                alt={info.fullName}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <span className="text-xs font-serif font-bold tracking-wider text-[#1E1B18] uppercase block">
                Ditulis oleh {info.fullName}
              </span>
              <span className="text-[11px] text-[#7A6F6A]">
                {info.legislativeLevel} • Fraksi {info.party}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content & Imagery */}
      <section className="bg-[#FBF9F5] py-12 sm:py-16 px-6 sm:px-10 lg:px-12 border-b border-[#E5DED5]">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Featured Image */}
          {coverImage && (
            <div className="relative overflow-hidden rounded-xs border border-[#E5DED5] shadow-md bg-[#EFEBE4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt={currentArticle.title || 'Foto Artikel'}
                className="w-full max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Lead Quote Box */}
          {currentArticle.excerpt && (
            <div className="p-6 sm:p-8 bg-[#EFEBE4] border-l-4 border-[#6B1724] rounded-r-xs">
              <p className="font-serif italic text-base sm:text-lg text-[#6B1724] leading-relaxed">
                &ldquo;{currentArticle.excerpt}&rdquo;
              </p>
            </div>
          )}

          {/* Article Text Content */}
          <div className="prose prose-stone max-w-none space-y-6 text-[#3E3835] text-base leading-relaxed font-sans">
            {paragraphs.length > 0 ? (
              paragraphs.map((p: string, idx: number) => {
                if (p.startsWith('# ')) {
                  return (
                    <h2
                      key={idx}
                      className="font-serif text-2xl sm:text-3xl font-normal text-[#6B1724] uppercase pt-4 tracking-wide"
                    >
                      {p.replace('# ', '')}
                    </h2>
                  );
                }
                if (p.startsWith('## ')) {
                  return (
                    <h3
                      key={idx}
                      className="font-serif text-xl sm:text-2xl font-bold text-[#1E1B18] pt-3 tracking-wide"
                    >
                      {p.replace('## ', '')}
                    </h3>
                  );
                }
                if (p.startsWith('- ')) {
                  return (
                    <li key={idx} className="ml-4 list-disc text-[#5A524D]">
                      {p.replace('- ', '')}
                    </li>
                  );
                }
                return (
                  <p key={idx} className="text-[#3E3835] text-justify leading-relaxed">
                    {p}
                  </p>
                );
              })
            ) : (
              <p className="text-[#7A6F6A] italic">
                Naskah rilis kebijakan ini sedang dalam proses sinkronisasi tim sekretariat dewan.
              </p>
            )}
          </div>

          {/* Author Card Footer */}
          <div className="p-8 bg-[#EFEBE4] border border-[#DDD5CA] rounded-xs flex flex-col sm:flex-row items-center gap-6 mt-12">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-white shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={info.avatarUrl}
                alt={info.fullName}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <span className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#6B1724] block">
                Tentang Penulis
              </span>
              <h4 className="font-serif text-xl font-bold text-[#1E1B18]">
                {info.fullName}
              </h4>
              <p className="text-xs text-[#5A524D] leading-relaxed">
                {info.legislativeLevel} perwakilan {info.dapil}. Mengabdi untuk memperjuangkan aspirasi rakyat dan mendorong tata kelola pemerintahan yang berkeadilan, transparan, dan partisipatif.
              </p>
            </div>
            <Link
              href={href('/profil')}
              className="px-5 py-2.5 bg-[#6B1724] text-white rounded-full font-serif text-[11px] font-semibold uppercase tracking-wider hover:bg-[#52101B] transition-colors shrink-0"
            >
              Lihat Profil Lengkap
            </Link>
          </div>

          {/* Back Button */}
          <div className="pt-4">
            <Link
              href={href('/artikel')}
              className="inline-flex items-center space-x-2 font-serif text-xs font-bold uppercase tracking-[0.18em] text-[#6B1724] hover:text-[#52101B]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Katalog Artikel</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Related Articles Section */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="bg-white py-14 sm:py-20 px-6 sm:px-10 lg:px-12">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between border-b border-[#E5DED5] pb-4">
              <div>
                <span className="font-serif italic text-xl block" style={{ color: info.textAccentColor }}>
                  Warta Terkait
                </span>
                <h3 className="font-serif text-2xl text-[#1E1B18] uppercase tracking-wide">
                  ARTIKEL LAINNYA
                </h3>
              </div>
              <Link
                href={href('/artikel')}
                className="font-serif text-xs font-bold uppercase tracking-[0.15em] text-[#6B1724] hover:underline"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map((rel: any, idx: number) => {
                const relImage =
                  rel.featuredImageUrl ||
                  rel.posterUrl ||
                  rel.coverImageUrl ||
                  rel.imageUrl ||
                  '/images/default-article.jpg';
                return (
                  <article
                    key={rel.id || idx}
                    className="group bg-[#FBF9F5] border border-[#E5DED5] rounded-xs overflow-hidden flex flex-col hover:shadow-md transition-all"
                  >
                    <Link
                      href={href(`/artikel/${rel.slug || rel.id}`)}
                      className="block relative aspect-16/10 overflow-hidden bg-[#EFEBE4]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={relImage}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                      <h4 className="font-serif text-base font-bold text-[#1E1B18] group-hover:text-[#6B1724] transition-colors line-clamp-2">
                        <Link href={href(`/artikel/${rel.slug || rel.id}`)}>{rel.title}</Link>
                      </h4>
                      <Link
                        href={href(`/artikel/${rel.slug || rel.id}`)}
                        className="inline-flex items-center space-x-1.5 font-serif text-[11px] font-bold uppercase tracking-wider hover:opacity-80 transition"
                        style={{ color: info.textAccentColor }}
                      >
                        <span>Baca</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </TiaraBurgundyShell>
  );
}
