'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface PlatinumSlateArtikelDetailClientProps {
  article: any;
  member: any;
  theme: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function PlatinumSlateArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: PlatinumSlateArtikelDetailClientProps) {
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Anggota Dewan';
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/default-avatar.png';

  const party = member?.partyAffiliation || 'Fraksi Parlemen';

  return (
    <div className="py-12 sm:py-16 bg-[#0D1117] text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        
        <div>
          <Link
            href={subdomain ? `/${subdomain}/artikel` : '/artikel'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1 group"
          >
            <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Daftar Risalah</span>
          </Link>
        </div>

        <header className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-white border border-white/15">
              {article?.category || 'Kebijakan Publik'}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDateIndonesian(article?.publishedAt || article?.createdAt)}</span>
            </span>
            {article?.readingTimeMinutes && (
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{article.readingTimeMinutes} Menit Baca</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight font-sans tracking-tight">
            {article?.title}
          </h1>

          {article?.excerpt && (
            <p className="text-base sm:text-lg text-slate-300 italic font-serif leading-relaxed">
              &ldquo;{article.excerpt}&rdquo;
            </p>
          )}

          <div className="flex items-center gap-3 pt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={officialFullName}
              className="w-10 h-10 rounded-full object-cover border border-white/20"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('/images/default-avatar.png')) {
                  target.src = '/images/default-avatar.png';
                }
              }}
            />
            <div>
              <span className="font-bold text-xs sm:text-sm text-white block">{officialFullName}</span>
              <span className="text-[10px] text-slate-400 font-mono">{party}</span>
            </div>
          </div>
        </header>

        {/* Article Featured Cover Image */}
        <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#0E1013]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              article?.featuredImageUrl ||
              article?.posterUrl ||
              article?.imageUrl ||
              article?.coverImageUrl ||
              '/images/showcase-artikel-pertanian.jpg'
            }
            alt={article?.title || 'Risalah'}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = '/images/showcase-artikel-pertanian.jpg';
            }}
          />
        </div>

        {/* Article Body Content */}
        <article className="prose prose-invert prose-slate max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-6">
          <div
            dangerouslySetInnerHTML={{
              __html:
                article?.content ||
                `<p>Dalam rangka menjalankan fungsi legislasi dan pengawasan, setiap kebijakan publik yang diputuskan harus senantiasa mengutamakan transparansi dan kepentingan masyarakat daerah.</p><p>Pengawalan terhadap APBD difokuskan pada pemenuhan kebutuhan dasar, pemerataan sarana jalan antardesa, penguatan kapasitas puskesmas, serta jaminan akses permodalan bagi pelaku UMKM di seluruh kecamatan konstituen.</p>`,
            }}
          />
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="pt-12 border-t border-white/10 space-y-6">
            <h3 className="font-bebas text-2xl text-white tracking-wider">
              RISALAH KEBIJAKAN TERKAIT
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.slice(0, 2).map((rel) => (
                <Link
                  key={rel.id || rel.slug}
                  href={subdomain ? `/${subdomain}/artikel/${rel.slug}` : `/artikel/${rel.slug}`}
                  className="p-5 rounded-2xl bg-[#151B23] border border-white/10 hover:border-white/30 transition-all space-y-2 group block"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {rel.category || 'Kebijakan'}
                  </span>
                  <h4 className="text-sm font-bold text-white group-hover:text-slate-200 line-clamp-2">
                    {rel.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-slate-400 pt-2 font-medium">
                    <span>Baca Analisis</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
