'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  Share2,
  ChevronLeft,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface AmberPortfolioArtikelDetailClientProps {
  article: any;
  member: any;
  theme: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function AmberPortfolioArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: AmberPortfolioArtikelDetailClientProps) {
  const primaryColor = theme?.primaryHexColor || '#EA580C';
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B';
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/default-avatar.png';

  const party = member?.partyAffiliation || 'Fraksi Parlemen';

  return (
    <div className="py-12 sm:py-16 bg-[#0A0908] text-stone-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        
        {/* Back Link */}
        <div>
          <Link
            href={subdomain ? `/${subdomain}/artikel` : '/artikel'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-white transition-colors py-1 group"
          >
            <ChevronLeft className="w-4 h-4 text-orange-400 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Katalog Artikel</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
              {article?.category || 'Kebijakan Publik'}
            </span>
            <span className="text-xs text-stone-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>{formatDateIndonesian(article?.publishedAt || article?.createdAt)}</span>
            </span>
            {article?.readingTimeMinutes && (
              <span className="text-xs text-stone-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>{article.readingTimeMinutes} Menit Baca</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight font-sans">
            {article?.title}
          </h1>

          {article?.excerpt && (
            <p className="text-base sm:text-lg text-stone-300 italic font-serif leading-relaxed">
              &ldquo;{article.excerpt}&rdquo;
            </p>
          )}

          {/* Author Byline Card */}
          <div className="flex items-center gap-3 pt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={officialFullName}
              className="w-10 h-10 rounded-full object-cover border border-orange-500/50"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('/images/default-avatar.png')) {
                  target.src = '/images/default-avatar.png';
                }
              }}
            />
            <div>
              <span className="font-bold text-xs sm:text-sm text-white block">{officialFullName}</span>
              <span className="text-[10px] text-stone-400 font-mono">{party}</span>
            </div>
          </div>
        </header>

        {/* Article Body Content */}
        <article className="prose prose-invert prose-stone max-w-none text-stone-200 text-sm sm:text-base leading-relaxed space-y-6">
          <div
            dangerouslySetInnerHTML={{
              __html:
                article?.content ||
                `<p>${article?.excerpt || 'Tidak ada uraian lengkap artikel.'}</p>`,
            }}
          />
        </article>

        {/* Article Author Footer Card */}
        <div className="p-6 rounded-3xl bg-[#141210] border border-white/10 flex flex-col sm:flex-row items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={officialFullName}
            className="w-16 h-16 rounded-2xl object-cover border border-orange-500/40 shrink-0"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('/images/default-avatar.png')) {
                target.src = '/images/default-avatar.png';
              }
            }}
          />
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-sm text-white">{officialFullName}</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Penulis adalah anggota legislatif aktif yang konsisten menerbitkan kajian, naskah risalah, dan opini kebijakan publik demi terwujudnya transparansi parlemen bagi warga.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
