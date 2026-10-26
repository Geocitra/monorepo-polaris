'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Copy,
  Check,
} from 'lucide-react';
import { OrixVioletShell } from './OrixVioletShell';
import {
  getOrixMemberInfo,
  useOrixHref,
  getArticleImage,
  getArticleCategory,
} from './utils';

export interface OrixVioletArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function OrixVioletArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: OrixVioletArtikelDetailClientProps) {
  const info = getOrixMemberInfo(member, theme, subdomain);
  const href = useOrixHref(subdomain);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const coverUrl = getArticleImage(article);
  const category = getArticleCategory(article);

  const formatDate = (dateVal: any) => {
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '01 Sep 2026';
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '01 Sep 2026';
    }
  };

  const dateStr = formatDate(article?.publishedAt || article?.createdAt);

  return (
    <OrixVioletShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="artikel"
      showMasthead={false}
    >
      <article className="max-w-[960px] mx-auto px-6 lg:px-8 py-16 space-y-10">
        
        {/* Back Link */}
        <div>
          <Link
            href={href('/artikel')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog Artikel</span>
          </Link>
        </div>

        {/* Title & Metadata */}
        <header className="space-y-4">
          <span className="px-3.5 py-1 rounded-full bg-[#3B0CB8] text-white text-[10px] font-extrabold uppercase tracking-wider inline-block">
            {category}
          </span>

          <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#111827] tracking-tight leading-[1.15]">
            {article?.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] pt-2 border-b border-slate-100 pb-6">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-[#7C3AED]" />
              {dateStr}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-4 h-4 text-[#7C3AED]" />
              Oleh {info.officialFullName}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-[#7C3AED]" />
              {article?.readingTime || '4 menit baca'}
            </span>
          </div>
        </header>

        {/* Cover Image */}
        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xl">
          <img
            src={coverUrl}
            alt={article?.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
            }}
          />
        </div>

        {/* Body Content */}
        <div className="prose prose-lg max-w-none text-[#374151] leading-relaxed text-sm sm:text-base space-y-5">
          {article?.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <>
              <p className="font-medium text-base sm:text-lg text-[#111827] leading-relaxed">
                {article?.excerpt ||
                  'Kajian komprehensif ini menguraikan langkah-langkah strategis dalam pengawasan dan perancangan kebijakan daerah yang berpihak kepada kepentingan masyarakat luas.'}
              </p>
              <p>
                Sebagai bagian dari komitmen perwujudan tata kelola pemerintahan yang baik (*good governance*), setiap pos anggaran dan pasal peraturan daerah wajib melalui uji kelayakan publik dan penyerapan aspirasi secara mendalam.
              </p>
              <p>
                Melalui kolaborasi antara parlemen, pakar akademisi, organisasi kemasyarakatan, serta dinas teknis terkait, diharapkan setiap regulasi yang disahkan mampu memberikan kepastian hukum dan dampak ekonomi nyata yang terukur bagi warga di seluruh daerah pemilihan.
              </p>
              <div className="p-6 rounded-2xl bg-indigo-50 border-l-4 border-[#3B0CB8] my-8">
                <p className="font-bold text-sm text-[#111827] italic">
                  &ldquo;Amanah publik bukan sekadar angka dalam tabel statistik, melainkan tanggung jawab moral untuk memastikan setiap rupiah anggaran dirasakan manfaatnya hingga ke pelosok desa.&rdquo;
                </p>
                <span className="block mt-2 text-xs font-bold text-[#6B7280]">
                  — {info.officialFullName}
                </span>
              </div>
              <p>
                Transparansi dua arah terus didorong dengan memanfaatkan teknologi digital dan posko reses fisik, sehingga konstituen dapat terus memantau progres pelaksanaan program kerja dan memberikan umpan balik secara langsung.
              </p>
            </>
          )}
        </div>

        {/* Share Buttons */}
        <div className="pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Bagikan Artikel:
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-[#4B5563] hover:border-indigo-400 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Tautan'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article?.title || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-bold hover:opacity-90 transition-opacity"
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article?.title || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold hover:opacity-90 transition-opacity"
            >
              X / Twitter
            </a>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="pt-12 border-t border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xl text-[#111827]">
                Artikel Terkait Lainnya
              </h3>
              <Link
                href={href('/artikel')}
                className="text-xs font-bold text-[#3B0CB8] hover:underline"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedArticles.slice(0, 2).map((rel: any, idx: number) => (
                <Link
                  key={rel.id || idx}
                  href={href(`/artikel/${rel.slug || rel.id}`)}
                  className="group p-4 rounded-2xl bg-[#FAFAFA] border border-slate-200 hover:border-indigo-400 transition-colors flex gap-4"
                >
                  <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    <img
                      src={getArticleImage(rel)}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      {getArticleCategory(rel)}
                    </span>
                    <h4 className="font-bold text-xs text-[#111827] group-hover:text-[#3B0CB8] transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </article>
    </OrixVioletShell>
  );
}
