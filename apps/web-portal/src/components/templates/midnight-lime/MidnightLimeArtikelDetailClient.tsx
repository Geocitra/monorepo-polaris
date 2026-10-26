'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  ChevronLeft,
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface MidnightLimeArtikelDetailClientProps {
  article: any;
  member: any;
  theme: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function MidnightLimeArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: MidnightLimeArtikelDetailClientProps) {
  const primaryColor = theme?.primaryHexColor || '#D4F63D';
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B';
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/default-avatar.png';

  const party = member?.partyAffiliation || 'Fraksi Parlemen';

  return (
    <div className="py-12 sm:py-16 bg-[#0C111F] text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        
        <div>
          <Link
            href={subdomain ? `/${subdomain}/artikel` : '/artikel'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1 group"
          >
            <ChevronLeft className="w-4 h-4 text-[#D4F63D] group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Daftar Risalah</span>
          </Link>
        </div>

        <header className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#D4F63D]/15 text-[#D4F63D] border border-[#D4F63D]/30">
              {article?.category || 'Kebijakan Publik'}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D4F63D]" />
              <span>{formatDateIndonesian(article?.publishedAt || article?.createdAt)}</span>
            </span>
            {article?.readingTimeMinutes && (
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D4F63D]" />
                <span>{article.readingTimeMinutes} Menit Baca</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight font-sans">
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
              className="w-10 h-10 rounded-full object-cover border border-[#D4F63D]/50"
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

        <article className="prose prose-invert prose-slate max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-6">
          <div
            dangerouslySetInnerHTML={{
              __html:
                article?.content ||
                `<p>${article?.excerpt || 'Tidak ada uraian lengkap naskah.'}</p>`,
            }}
          />
        </article>

        <div className="p-6 rounded-3xl bg-[#131B2D] border border-white/10 flex flex-col sm:flex-row items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={officialFullName}
            className="w-16 h-16 rounded-2xl object-cover border border-[#D4F63D]/40 shrink-0"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('/images/default-avatar.png')) {
                target.src = '/images/default-avatar.png';
              }
            }}
          />
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-sm text-white">{officialFullName}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Penulis adalah anggota dewan aktif yang secara konsisten menyusun naskah telaah kebijakan publik untuk menjamin akuntabilitas kinerja legislatif bagi seluruh konstituen.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
