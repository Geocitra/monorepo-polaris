'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Share2,
  Printer,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  Bookmark,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { formatDateIndonesian, calculateReadingTime } from '@/lib/utils';
import { CitizenComments } from '@/components/article/citizen-comments';

interface BoldArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function BoldArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: BoldArtikelDetailClientProps) {
  const primaryColor = theme?.primaryHexColor || '#DC2626';
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Ir. Sangsoro Mowo Berkah, M.Sc.';
  const authorPhoto =
    theme?.officialPhotoUrl || member?.photoUrl || '/images/dewan-standing-full.png';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
  const commission = member?.commissionName || 'Komisi X DPR RI';

  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');

  const getBackHref = () => {
    let base = subdomain ? `/${subdomain}/artikel` : '/artikel';
    if (previewTemplate) {
      base += `?preview_template=${previewTemplate}`;
    }
    return base;
  };

  const getRelatedHref = (slug: string) => {
    let base = subdomain ? `/${subdomain}/artikel/${slug}` : `/artikel/${slug}`;
    if (previewTemplate) {
      base += `?preview_template=${previewTemplate}`;
    }
    return base;
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Render article body safely with dark styling
  const renderBody = () => {
    if (!article.body) return null;
    const lines = article.body.split('\n');

    return (
      <div
        className={`space-y-5 leading-relaxed ${
          fontSize === 'large' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
        } text-slate-300 font-normal`}
      >
        {lines.map((line: string, idx: number) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-3" />;
          }

          if (trimmed.startsWith('## ')) {
            return (
              <h2
                key={idx}
                className="font-bebas text-2xl sm:text-4xl text-white uppercase tracking-tight pt-6 pb-2 border-b border-white/10"
              >
                {trimmed.replace('## ', '')}
              </h2>
            );
          }

          if (trimmed.startsWith('### ')) {
            return (
              <h3
                key={idx}
                className="text-lg sm:text-xl font-bold text-red-400 font-mono uppercase pt-4 pb-1"
              >
                {trimmed.replace('### ', '')}
              </h3>
            );
          }

          if (trimmed.startsWith('> ')) {
            return (
              <blockquote
                key={idx}
                className="border-l-4 border-red-600 pl-4 py-2 my-4 bg-red-950/20 rounded-r-xl italic text-slate-200 font-serif text-base sm:text-lg"
              >
                {trimmed.replace('> ', '')}
              </blockquote>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li key={idx} className="ml-5 list-disc text-slate-300">
                {trimmed.substring(2)}
              </li>
            );
          }

          return <p key={idx}>{trimmed}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 sm:space-y-12">
      {/* ─── BACK BUTTON ─── */}
      <div>
        <Link
          href={getBackHref()}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-red-400 hover:text-white uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>KEMBALI KE KATALOG RISALAH</span>
        </Link>
      </div>

      {/* ─── HEADER: TITLE & METADATA ─── */}
      <header className="space-y-6 border-b border-white/10 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-mono font-bold uppercase tracking-wider">
            {article.category || article.issueCategory || 'KEBIJAKAN PUBLIK'}
          </span>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-red-500" />
            <span>{article.publishedAt ? formatDateIndonesian(article.publishedAt) : '10 Oktober 2026'}</span>
          </span>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-red-500" />
            <span>{article.readingTime || calculateReadingTime(article.body || '')}</span>
          </span>
        </div>

        <h1 className="font-bebas text-4xl sm:text-6xl md:text-7xl font-black text-white uppercase tracking-tight leading-[0.92]">
          {article.title}
        </h1>

        {/* Author Bio Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-800 border-2 border-red-600 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={authorPhoto} alt={officialFullName} className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{officialFullName}</span>
                <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {commission} • Dapil {dapil}
              </div>
            </div>
          </div>

          {/* Reading Toolbar */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {/* Font Size Toggle */}
            <button
              type="button"
              onClick={() => setFontSize((f) => (f === 'normal' ? 'large' : 'normal'))}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Perbesar teks"
            >
              {fontSize === 'normal' ? 'A+' : 'A-'}
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Cetak artikel"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Tautan'}</span>
            </button>

            {/* WhatsApp Share */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${article.title} - ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 transition-colors"
              title="Bagikan ke WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* ─── FEATURED POSTER IMAGE ─── */}
      {(article.featuredImageUrl || article.posterUrl || article.thumbnailUrl) && (
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
          {/* Ambient Glow */}
          <div
            className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-[90px] pointer-events-none opacity-30"
            style={{ backgroundColor: primaryColor }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.featuredImageUrl || article.posterUrl || article.thumbnailUrl}
            alt={article.title}
            className="w-full h-auto max-h-[500px] object-cover relative z-10"
          />
        </div>
      )}

      {/* ─── EXECUTIVE SUMMARY (KEY TAKEAWAY) ─── */}
      {article.excerpt && (
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border-l-4 border-red-600 border-y border-r border-white/10 space-y-2">
          <div className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>POKOK TELAAH &amp; RINGKASAN EKSEKUTIF</span>
          </div>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium italic">
            &ldquo;{article.excerpt}&rdquo;
          </p>
        </div>
      )}

      {/* ─── ARTICLE CONTENT BODY ─── */}
      <article className="prose-dark pt-4">{renderBody()}</article>

      {/* ─── AUTHOR SIGNATURE BOX ─── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-800 border-2 border-red-600 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={authorPhoto} alt={officialFullName} className="w-full h-full object-cover object-top" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-red-500 font-bold uppercase tracking-wider">
              PENULIS NASKAH KEBIJAKAN
            </div>
            <h3 className="text-lg font-bold text-white">{officialFullName}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anggota {commission} mengawal amanah konstituen Daerah Pemilihan {dapil}. Memperjuangkan
              transparansi legislasi dan anggaran pro-rakyat di gedung parlemen.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">Diterbitkan melalui Portal Resmi POLARIS</span>
          <Link
            href={subdomain ? `/${subdomain}/profil` : '/profil'}
            className="text-xs font-mono font-bold text-red-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            LIHAT REKAM JEJAK DEWAN →
          </Link>
        </div>
      </div>

      {/* ─── CITIZEN COMMENTS COMPONENT ─── */}
      <section className="pt-8 border-t border-white/10">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0C0C0C] border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="text-xs font-mono uppercase tracking-widest font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>FORUM TANGGAPAN &amp; ASPIRASI WARGA</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">PARTISIPASI PUBLIK TERBUKA</span>
          </div>

          <div className="text-slate-200">
            <CitizenComments slug={article.slug} />
          </div>
        </div>
      </section>

      {/* ─── RELATED ARTICLES ─── */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="pt-8 border-t border-white/10 space-y-6">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
            <span className="text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>TELAAH TERKAIT LAINNYA</span>
            </span>
            <Link href={getBackHref()} className="text-red-400 hover:underline">
              SEMUA ARTIKEL →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.slice(0, 2).map((rel: any, idx: number) => (
              <Link
                key={rel.id || idx}
                href={getRelatedHref(rel.slug)}
                className="p-4 rounded-xl bg-[#111111] border border-white/5 hover:border-red-600/40 transition-colors space-y-2 block group"
              >
                <div className="text-[10px] font-mono text-red-500 font-bold uppercase">
                  {rel.category || 'KEBIJAKAN'}
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                  {rel.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">{rel.summary || rel.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
