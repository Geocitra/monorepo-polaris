'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Check,
  Bookmark,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { AgethaRubyShell } from './AgethaRubyShell';
import { getAgethaMemberInfo, useAgethaHref, AGETHA_RUBY } from './utils';
import { MarkdownContent } from '@/components/article/markdown-content';

export interface AgethaRubyArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function AgethaRubyArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: AgethaRubyArtikelDetailClientProps) {
  const info = getAgethaMemberInfo(member, theme, subdomain);
  const href = useAgethaHref(subdomain);
  const [copied, setCopied] = useState(false);

  const title = article?.title || 'Risalah & Kajian Kebijakan Publik';
  const category =
    article?.category || article?.categoryName || article?.issueCategory || 'Kebijakan Publik';
  const dateStr = article?.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : article?.date || 'Terbaru';
  const readTime = article?.readTime || article?.readingTime || '4 min baca';
  const imageUrl =
    article?.imageUrl ||
    article?.featuredImageUrl ||
    article?.posterUrl ||
    article?.thumbnailUrl ||
    '/images/showcase-artikel-rapat.jpg';

  const bodyContent =
    article?.body ||
    article?.content ||
    `Penyusunan dan pengawasan anggaran belanja daerah merupakan salah satu amanat konstitusional paling fundamental yang diemban oleh anggota dewan perwakilan rakyat. Setiap alokasi rupiah yang tertuang dalam Anggaran Pendapatan dan Belanja Daerah (APBD) harus senantiasa diorientasikan sebesar-besarnya demi kemakmuran dan peningkatan kualitas hidup warga di seluruh tingkatan masyarakat.

### 1. Transparansi & Akuntabilitas Pos Belanja Publik
Dalam berbagai sidang evaluasi dan rapat komisi, kami secara konsisten mendorong pemerintah daerah untuk mengedepankan asas efisiensi, akurasi, dan transparansi anggaran. Proyek-proyek infrastruktur jalan desa, perbaikan saluran irigasi pertanian, serta pengadaan alat medis pada puskesmas pembantu harus menjadi prioritas absolut di atas belanja seremonial.

> "Mandat yang dititipkan oleh rakyat bukan sekadar formalitas tanda tangan APBD, melainkan ikhtiar memastikan tidak ada satu pun warga daerah pemilihan yang tertinggal dalam pemerataan pembangunan."

### 2. Sinergi Komisi & Partisipasi Aktif Konstituen
Kebijakan yang kokoh hanya dapat lahir manakala wakil rakyat senantiasa membuka telinga terhadap denyut keluhan di akar rumput. Melalui forum jaring aspirasi masa reses, masukan dari gabungan kelompok tani, asosiasi pedagang pasar tradisional, serta organisasi kepemudaan kami rangkum menjadi pokok-pokok pikiran (pokir) yang kami perjuangkan dalam penetapan perda.`;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({ title, url }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <AgethaRubyShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="artikel"
    >
      {/* ─── 1. BREADCRUMB & METADATA ─── */}
      <article className="pt-32 pb-20 bg-[#0F0F0F]">
        <div className="max-w-[900px] mx-auto px-6">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#71717A] mb-8 font-medium">
            <Link href={href('/')} className="hover:text-white transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={href('/artikel')} className="hover:text-white transition-colors">
              Artikel
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#9CA3AF] line-clamp-1">{category}</span>
          </div>

          {/* Category Pill & Read Time */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded bg-[#E50914]/15 border border-[#E50914]/30 text-xs font-bold uppercase tracking-wider text-[#E50914]">
              {category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
              <Clock className="w-3.5 h-3.5" />
              <span>{readTime}</span>
            </div>
          </div>

          {/* Article Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            {title}
          </h1>

          {/* Author & Share Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-y border-[#1F1F1F] mb-10">
            <div className="flex items-center gap-3.5">
              <img
                src={info.photoUrl}
                alt={info.officialFullName}
                className="w-10 h-10 rounded-full object-cover border border-[#333]"
              />
              <div>
                <span className="text-xs font-bold text-white block">
                  {info.officialFullName}
                </span>
                <span className="text-[11px] text-[#71717A] block">{dateStr}</span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1A] border border-[#2B2B2B] text-xs font-bold text-white hover:border-[#E50914] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Tautan Disalin</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#E50914]" />
                  <span>Bagikan Artikel</span>
                </>
              )}
            </button>
          </div>

          {/* Featured Hero Image */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#181818] border border-[#262626] mb-12 shadow-2xl">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Body Content */}
          <div className="prose prose-invert max-w-none text-[#D4D4D8] leading-relaxed text-base space-y-6">
            <MarkdownContent content={bodyContent} />
          </div>

          {/* Back to Catalog Button */}
          <div className="pt-12 mt-12 border-t border-[#1F1F1F] flex items-center justify-between">
            <Link
              href={href('/artikel')}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9CA3AF] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Semua Artikel</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#E50914] hover:underline"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Gagasan Ini</span>
            </button>
          </div>

        </div>
      </article>

      {/* ─── RELATED ARTICLES ─── */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="py-16 bg-[#0A0A0A] border-t border-[#1C1C1C]">
          <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
            <h3 className="text-xl font-bold uppercase text-white mb-8">
              Artikel & Risalah Terkait
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map((art: any, idx: number) => {
                const img =
                  art.imageUrl || art.featuredImageUrl || '/images/showcase-artikel-rapat.jpg';
                const rSlug = art.slug || `artikel-${idx + 1}`;

                return (
                  <Link
                    key={art.id || idx}
                    href={href(`/artikel/${rSlug}`)}
                    className="group bg-[#141414] border border-[#242424] rounded-xl overflow-hidden hover:border-[#E50914] transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#202020]">
                      <img
                        src={img}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#E50914] transition-colors line-clamp-2">
                        {art.title}
                      </h4>
                      <span className="text-xs text-[#E50914] font-bold mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Baca Risalah &rarr;
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </AgethaRubyShell>
  );
}
