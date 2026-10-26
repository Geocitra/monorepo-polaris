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
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { LailaSakuraShell } from './LailaSakuraShell';
import { getLailaMemberInfo, useLailaHref } from './utils';

interface LailaSakuraArtikelDetailClientProps {
  member: any;
  theme: any;
  article: any;
  relatedArticles?: any[];
  subdomain?: string;
}

export function LailaSakuraArtikelDetailClient({
  member,
  theme,
  article,
  relatedArticles = [],
  subdomain,
}: LailaSakuraArtikelDetailClientProps) {
  const info = getLailaMemberInfo(member, theme, subdomain);
  const href = useLailaHref(subdomain);

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

  const related =
    relatedArticles && relatedArticles.length > 0
      ? relatedArticles.filter((a: any) => a.slug !== currentArticle.slug).slice(0, 3)
      : [];

  return (
    <LailaSakuraShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="artikel"
    >
      <article className="bg-[#080D1A] py-8 sm:py-12">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-8">
          
          {/* Back Navigation Button */}
          <div className="mb-8">
            <Link
              href={href('/artikel')}
              className="inline-flex items-center gap-2 text-xs font-mono hover:text-white transition-colors"
              style={{ color: info.primaryColor }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Katalog Risalah 🌸</span>
            </Link>
          </div>

          {/* Article Header */}
          <div className="space-y-4 mb-8 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="px-3.5 py-1 rounded-full border text-xs font-mono font-bold"
                style={{
                  color: info.primaryColor,
                  backgroundColor: `${info.primaryColor}1F`,
                  borderColor: `${info.primaryColor}4D`,
                }}
              >
                {currentArticle.category || 'Kebijakan Publik'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono text-[#64748B]">
                <Calendar className="w-3.5 h-3.5 text-[#FF4D8D]" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono text-[#64748B]">
                <Clock className="w-3.5 h-3.5 text-[#FF4D8D]" />
                5 Menit Baca
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {currentArticle.title}
            </h1>

            <p className="text-sm sm:text-base text-[#A0ABC0] leading-relaxed font-medium">
              {currentArticle.excerpt}
            </p>

            {/* Author Byline */}
            <div className="flex items-center gap-3 pt-4 border-t border-[#1E2B42]">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0D1527] border border-[#FF4D8D]/50">
                <img
                  src={info.photoUrl || '/images/laila-sakura-hero.jpg'}
                  alt={info.officialFullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {info.officialFullName}
                </span>
                <span
                  className="text-[11px] font-mono"
                  style={{ color: info.primaryColor }}
                >
                  {info.legislativeLevel} • {info.party}
                </span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden mb-10 border border-[#1E2B42] shadow-2xl bg-[#070B14]">
            <img
              src={coverImage}
              alt={currentArticle.title || 'Artikel Kebijakan'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Body Content */}
          <div className="prose prose-invert max-w-none text-[#A0ABC0] text-sm sm:text-base leading-relaxed space-y-6 text-left">
            {articleContent ? (
              articleContent.split('\n\n').map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
              ))
            ) : (
              <p>
                Penyusunan naskah kebijakan publik daerah menuntut komitmen transparansi dan keberpihakan nyata pada kepentingan masyarakat akar rumput. Setiap program anggaran yang dialokasikan dalam APBD harus dapat dipertanggungjawabkan efektivitasnya secara terbuka.
              </p>
            )}
          </div>

          {/* Highlight Callout Box */}
          <div className="my-10 p-6 sm:p-8 rounded-3xl bg-[#0D1527] border border-[#FF4D8D]/40 space-y-2 text-left">
            <span
              className="text-xs font-mono font-bold uppercase tracking-widest block"
              style={{ color: info.primaryColor }}
            >
              🌸 CATATAN ADVOKASI PARLEMEN
            </span>
            <p className="text-xs sm:text-sm text-[#D4E0D9] leading-relaxed italic">
              &quot;Kebijakan yang berkelanjutan lahir ketika kita mendengar suara mereka yang paling terdampak, dan menjadikannya pijakan utama dalam perumusan anggaran.&quot;
            </p>
          </div>

          {/* Author Card Box */}
          <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#0D1527] border border-[#1E2B42] flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#070B14] border border-[#FF4D8D] shrink-0">
              <img
                src={info.photoUrl || '/images/laila-sakura-hero.jpg'}
                alt={info.officialFullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1 text-center sm:text-left flex-1">
              <span
                className="text-[10px] font-mono uppercase tracking-widest block font-bold"
                style={{ color: info.primaryColor }}
              >
                PENULIS NASKAH & REKAM JEJAK
              </span>
              <h4 className="font-bold text-base text-white">
                {info.officialFullName}
              </h4>
              <p className="text-xs text-[#A0ABC0] leading-relaxed">
                {info.bio}
              </p>
            </div>
            <Link
              href={href('/profil')}
              className="px-4 py-2 rounded-full border text-xs font-mono font-bold hover:bg-[#FF4D8D] hover:text-white transition-colors shrink-0"
              style={{
                color: info.primaryColor,
                backgroundColor: `${info.primaryColor}1F`,
                borderColor: `${info.primaryColor}4D`,
              }}
            >
              Lihat Profil
            </Link>
          </div>

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="mt-16 pt-12 border-t border-[#1E2B42]">
              <h3 className="text-xl font-bold text-white mb-8 tracking-tight text-left">
                🌸 Risalah & Publikasi Terkait Lainnya
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((art: any) => (
                  <Link
                    key={art.id || art.slug}
                    href={href(`/artikel/${art.slug}`)}
                    className="group bg-[#0D1527] border border-[#1E2B42] rounded-3xl overflow-hidden hover:border-[#FF4D8D]/60 transition-all flex flex-col text-left"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-[#070B14]">
                      <img
                        src={
                          art.featuredImageUrl ||
                          art.posterUrl ||
                          art.coverImageUrl ||
                          art.imageUrl ||
                          art.thumbnailUrl ||
                          '/images/default-article.jpg'
                        }
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 space-y-1.5 flex-1">
                      <span
                        className="text-[10px] font-mono font-bold"
                        style={{ color: info.primaryColor }}
                      >
                        {art.category || art.categoryName || art.issueCategory || 'Kebijakan'}
                      </span>
                      <h4 className="font-bold text-xs text-white group-hover:text-[#FF4D8D] transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </article>
    </LailaSakuraShell>
  );
}
