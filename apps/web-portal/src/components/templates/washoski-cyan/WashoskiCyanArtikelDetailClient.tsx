'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Check,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { WashoskiCyanShell } from './WashoskiCyanShell';
import { getWashoskiMemberInfo, useWashoskiHref, WASHOSKI_CYAN } from './utils';
import { MarkdownContent } from '@/components/article/markdown-content';

export interface WashoskiCyanArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function WashoskiCyanArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: WashoskiCyanArtikelDetailClientProps) {
  const info = getWashoskiMemberInfo(member, theme, subdomain);
  const href = useWashoskiHref(subdomain);
  const [copied, setCopied] = useState(false);

  const title = article?.title || 'Risalah & Telaah Kebijakan Publik';
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
    `Penyusunan anggaran belanja daerah serta pengawasan kebijakan publik merupakan instrumen tertinggi dalam memastikan mandat rakyat terwujud nyata. Setiap rupiah dalam Anggaran Pendapatan dan Belanja Daerah (APBD) harus diarahkan demi membuka lapangan kerja, menstabilkan harga komoditas pokok, serta menjamin hak dasar kesehatan dan pendidikan warga.

### 1. Transparansi & Akuntabilitas Pos Belanja Publik
Dalam berbagai sidang komisi dan pengawasan di lapangan, kami menuntut pemerintah daerah untuk memangkas pos-pos seremonial yang tidak efisien. Prioritas belanja wajib dikembalikan ke sektor riil: perbaikan jalan penghubung antardesa, pemeliharaan irigasi sawah rakyat, dan penambahan tenaga medis di puskesmas pembantu.

> "Amanat rakyat bukan sekadar kompromi politik meja sidang, melainkan kepastian bahwa setiap kebijakan menghasilkan dampak nyata dan melindungi warga yang paling rentan."

### 2. Sinergi Komisi & Partisipasi Aktif Konstituen
Kebijakan yang berkelanjutan hanya tercipta jika wakil rakyat senantiasa mendengarkan suara konstituen di akar rumput. Melalui masa reses dan posko pengaduan warga, setiap masukan kami rangkum menjadi pokok-pokok pikiran (pokir) yang kami kawal tanpa henti hingga palu paripurna diketok.`;

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
    <WashoskiCyanShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="artikel"
    >
      <article className="pt-32 pb-20 bg-[#070707]">
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
            <span className="text-[#05DFD7] line-clamp-1">{category}</span>
          </div>

          {/* Category Pill & Read Time */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3.5 py-1 rounded-full bg-[#05DFD7]/15 border border-[#05DFD7]/30 text-xs font-bold uppercase tracking-wider text-[#05DFD7]">
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
          <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-y border-[#1C1C1C] mb-10">
            <div className="flex items-center gap-3.5">
              <img
                src={info.photoUrl}
                alt={info.officialFullName}
                className="w-10 h-10 rounded-full object-cover border border-[#2A2A2A]"
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111111] border border-[#222] text-xs font-bold text-white hover:border-[#05DFD7] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Tautan Disalin</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#05DFD7]" />
                  <span>Bagikan Artikel</span>
                </>
              )}
            </button>
          </div>

          {/* Featured Hero Image */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#161616] border border-[#222] mb-12 shadow-2xl">
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
          <div className="pt-12 mt-12 border-t border-[#1C1C1C] flex items-center justify-between">
            <Link
              href={href('/artikel')}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9CA3AF] hover:text-[#05DFD7] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Semua Artikel</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#05DFD7] hover:underline"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Risalah Ini</span>
            </button>
          </div>

        </div>
      </article>

      {/* ─── RELATED ARTICLES ─── */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="py-16 bg-[#040404] border-t border-[#161616]">
          <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
            <h3 className="text-xl font-bold uppercase text-white mb-8">
              Artikel & Risalah Terkait <span className="text-[#05DFD7]">.</span>
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
                    className="group bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl overflow-hidden hover:border-[#05DFD7] transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#181818]">
                      <img
                        src={img}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#05DFD7] transition-colors line-clamp-2">
                        {art.title}
                      </h4>
                      <span className="text-xs text-[#05DFD7] font-bold mt-4 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
    </WashoskiCyanShell>
  );
}
