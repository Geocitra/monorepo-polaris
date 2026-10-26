'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Share2,
  Bookmark,
  Tag,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ArikNoirShell } from './ArikNoirShell';
import {
  getArikMemberInfo,
  useArikHref,
  ARIK_DEFAULT_ARTICLES,
} from './utils';

export interface ArikNoirArtikelDetailClientProps {
  member: any;
  theme?: any;
  article: any;
  recentArticles?: any[];
  subdomain?: string;
}

const getArtImg = (a: any) =>
  a?.imageUrl ||
  a?.featuredImageUrl ||
  a?.posterUrl ||
  a?.thumbnailUrl ||
  '/images/showcase-artikel-rapat.jpg';

const getArtCat = (a: any) =>
  a?.category || a?.categoryName || a?.issueCategory || 'Kebijakan Publik';

const getArtDate = (a: any) =>
  a?.date ||
  (a?.publishedAt
    ? new Date(a.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '24 Maret 2026');

export function ArikNoirArtikelDetailClient({
  member,
  theme,
  article,
  recentArticles,
  subdomain,
}: ArikNoirArtikelDetailClientProps) {
  const info = getArikMemberInfo(member, theme, subdomain);
  const href = useArikHref(subdomain);

  const img = getArtImg(article);
  const cat = getArtCat(article);
  const date = getArtDate(article);
  const title = article?.title || 'Risalah Sidang Parlemen & Kebijakan Daerah';
  const content =
    article?.content ||
    article?.body ||
    `Pendidikan dan pemerataan fasilitas publik merupakan fondasi utama peradaban daerah. Dalam penyusunan APBD tahun anggaran 2026, kami di komisi legislatif memastikan bahwa mandat alokasi anggaran benar-benar terdistribusi secara substantif untuk masyarakat daerah pemilihan.

Kebijakan ini mengawal pemenuhan sarana belajar, subsidi pertanian berkelanjutan, serta penguatan posko aspirasi masyarakat desa. Sinergi antara wakil rakyat dan warga adalah kunci utama terwujudnya keadilan sosial yang merata.`;

  const related =
    recentArticles && recentArticles.length > 0
      ? recentArticles.filter((a: any) => a?.slug !== article?.slug).slice(0, 2)
      : ARIK_DEFAULT_ARTICLES.filter((a) => a.slug !== article?.slug).slice(0, 2);

  return (
    <ArikNoirShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="artikel"
    >
      <article className="pt-36 pb-24 bg-[#0A0A0A]">
        <div className="max-w-[860px] mx-auto px-6">
          
          {/* Back to Catalog */}
          <div className="mb-8">
            <Link
              href={href('/artikel')}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8E8A83] hover:text-[#C5A880] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Katalog Artikel</span>
            </Link>
          </div>

          {/* Article Header */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#161616] border border-[#2A2A2A] text-[10px] font-mono uppercase tracking-wider text-[#C5A880]">
                {cat}
              </span>
              <span className="text-xs font-mono text-[#7A7670] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{date}</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic text-[#F5F2EB] tracking-tight leading-tight">
              {title}
            </h1>

            {/* Author Credit */}
            <div className="flex items-center gap-3 pt-4 border-t border-[#1C1C1C]">
              <img
                src={info.photoUrl}
                alt={info.officialFullName}
                className="w-10 h-10 rounded-full object-cover border border-[#2A2A2A]"
              />
              <div>
                <p className="text-xs font-bold text-[#F5F2EB]">{info.officialFullName}</p>
                <p className="text-[10px] text-[#7A7670]">{info.headlineTagline}</p>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#161616] border border-[#1E1E1E] mb-10 shadow-2xl">
            <img
              src={img}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Typography Body */}
          <div className="prose prose-invert max-w-none text-[#C5C0B8] leading-relaxed space-y-5 text-sm sm:text-base font-normal">
            {content.split('\n\n').map((paragraph: string, i: number) => (
              <p key={i} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Share & Tag Row */}
          <div className="mt-12 pt-6 border-t border-[#1C1C1C] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#7A7670]">
              <Tag className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Kategori: {cat}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7A7670]">Bagikan risalah:</span>
              <a
                href={info.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-full bg-[#161616] text-[#E8DCC4] text-xs font-bold uppercase tracking-wider hover:bg-[#222] transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="mt-20 pt-12 border-t border-[#1C1C1C]">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A880] block mb-3">
                ARTIKEL TERKAIT
              </span>
              <h3 className="text-2xl font-serif italic text-[#F5F2EB] mb-8">
                Baca Kajian Kebijakan Lainnya
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {related.map((r: any, idx: number) => (
                  <Link
                    key={r.id || idx}
                    href={href(`/artikel/${r.slug}`)}
                    className="group bg-[#111111] border border-[#1E1E1E] rounded-xl p-5 hover:border-[#C5A880]/60 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-[#7A7670] uppercase tracking-wider block mb-1">
                        {getArtCat(r)}
                      </span>
                      <h4 className="text-sm font-bold text-[#F5F2EB] group-hover:text-[#E8DCC4] transition-colors line-clamp-2">
                        {r.title}
                      </h4>
                    </div>
                    <div className="pt-4 mt-4 border-t border-[#181818] flex items-center justify-between text-xs font-bold text-[#C5A880]">
                      <span>Baca Rangkuman</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </article>
    </ArikNoirShell>
  );
}
