'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Printer,
  Copy,
  Check,
  MessageSquare,
  Send,
  ArrowRight,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface CreativeWarmArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function CreativeWarmArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: CreativeWarmArtikelDetailClientProps) {
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<
    Array<{ id: string; name: string; date: string; content: string }>
  >([
    {
      id: 'c1',
      name: 'Rahmat Hidayat (Ketua Koperasi Tani)',
      date: '2 hari lalu',
      content:
        'Sangat mendukung inisiasi Bapak Dewan mengenai penyederhanaan akses KUR mikro bagi kelompok tani di sentra desa.',
    },
    {
      id: 'c2',
      name: 'Siti Marlina, S.Pd.',
      date: '4 hari lalu',
      content:
        'Alokasi TIK dan laboratorium komputer sekolah terbukti nyata membantu putra-putri kami belajar di era digital. Terima kasih atas advokasi parlemen.',
    },
  ]);
  const [authorName, setAuthorName] = useState('');
  const [commentContent, setCommentContent] = useState('');

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');

  const getNavLinkHref = (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    if (previewTemplate) {
      base += `${base.includes('?') ? '&' : '?'}preview_template=${previewTemplate}`;
    }
    return base;
  };

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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      name: authorName.trim() || 'Warga Konstituen',
      date: 'Baru saja',
      content: commentContent.trim(),
    };

    setComments([newComment, ...comments]);
    setAuthorName('');
    setCommentContent('');
  };

  function parseCleanIdentity(fullName?: string) {
    if (!fullName) {
      return { cleanName: 'Ahmad Fauzi', initial: 'A' };
    }
    let clean = fullName.split(',')[0].trim();
    while (/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i.test(clean)) {
      clean = clean.replace(/^(dr|ir|drs|dra|h|hj|prof|kh|k\.h|haji|hajjah)\.?\s+/i, '').trim();
    }
    const words = clean.split(/\s+/).filter(Boolean);
    const firstName = words[0] || 'Ahmad';
    const initial = firstName.charAt(0).toUpperCase();

    return {
      cleanName: clean || 'Ahmad Fauzi',
      initial: initial || 'A',
    };
  }

  const { cleanName, initial } = parseCleanIdentity(member?.fullName);

  return (
    <article className="min-h-screen pb-20">
      
      {/* ─── 1. TOP READER TOOLBAR ─── */}
      <div className="border-b border-stone-200 bg-[#F3F3EF]/90 backdrop-blur-md sticky top-16 sm:top-20 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between text-xs">
          {/* Back link */}
          <Link
            href={getNavLinkHref('/artikel')}
            className="text-stone-700 hover:text-amber-700 font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>KEMBALI KE KATALOG</span>
          </Link>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3 text-stone-600">
            {/* Font Size Toggle */}
            <div className="flex items-center gap-1 border-r border-stone-300 pr-2 sm:pr-3">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                  fontSize === 'normal'
                    ? 'bg-amber-500 text-stone-950'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Ukuran teks standar"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded text-xs font-bold cursor-pointer ${
                  fontSize === 'large'
                    ? 'bg-amber-500 text-stone-950'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Ukuran teks besar"
              >
                A+
              </button>
            </div>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              title="Salin tautan artikel"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salin</span>
                </>
              )}
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              title="Cetak artikel"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. ARTICLE HEADER MASTHEAD ─── */}
      <header className="border-b border-stone-200 bg-[#FBFBFA] py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
            <Link
              href={getNavLinkHref('/')}
              className="hover:text-stone-900 transition-colors"
            >
              BERANDA
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <Link
              href={getNavLinkHref('/artikel')}
              className="hover:text-stone-900 transition-colors"
            >
              ARTIKEL
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-amber-700 font-bold uppercase truncate max-w-[200px]">
              {article.issueCategory || article.category || 'KEBIJAKAN'}
            </span>
          </div>

          {/* Category Chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-100 text-amber-900 font-mono text-xs font-bold uppercase border border-amber-200">
            <span>[ {article.issueCategory || article.category || 'KEBIJAKAN PUBLIK'} ]</span>
          </div>

          {/* Article Main Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-stone-900 leading-tight">
            {article.title}
          </h1>

          {/* Author & Publication Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                {initial}
              </div>
              <div>
                <span className="font-serif font-bold text-stone-900 block text-sm">
                  {cleanName}
                </span>
                <span className="text-stone-500 text-[11px] font-mono">
                  Anggota DPR RI • Dapil {member?.dapilName || 'Jawa Barat I'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-stone-500 font-mono text-[11.5px]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {article.publishedAt
                  ? formatDateIndonesian(article.publishedAt)
                  : 'Terbaru'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {article.readingTime || '4 mnt baca'}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* ─── 3. FEATURED IMAGE ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              article.featuredImageUrl ||
              article.thumbnail ||
              article.posterUrl ||
              '/images/default-article.jpg'
            }
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ─── 4. EXECUTIVE SUMMARY HIGHLIGHT BLOCK ─── */}
      {article.excerpt && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
          <div className="p-6 rounded-2xl bg-[#1A382B] text-white border-l-4 border-amber-400 shadow-md space-y-2">
            <span className="text-[10.5px] font-mono text-amber-300 font-bold uppercase tracking-widest block">
              — POKOK PEMIKIRAN EKSEKUTIF
            </span>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-serif italic">
              &ldquo;{article.excerpt}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* ─── 5. ARTICLE BODY (RICH TYPOGRAPHY) ─── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <div
          className={`leading-relaxed text-stone-800 space-y-6 ${
            fontSize === 'large'
              ? 'text-base sm:text-lg sm:leading-8'
              : 'text-sm sm:text-base sm:leading-7'
          }`}
        >
          {article.body ? (
            <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-900 prose-a:text-amber-700 prose-blockquote:border-l-amber-500 prose-blockquote:bg-stone-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
              {article.body.split('\n\n').map((paragraph: string, idx: number) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2
                      key={idx}
                      className="text-xl sm:text-2xl font-serif font-black text-stone-900 pt-4 border-b border-stone-200 pb-2"
                    >
                      {paragraph.replace(/^## /, '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3
                      key={idx}
                      className="text-lg sm:text-xl font-serif font-bold text-stone-900 pt-3"
                    >
                      {paragraph.replace(/^### /, '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote
                      key={idx}
                      className="p-4 rounded-xl bg-amber-50/80 border-l-4 border-amber-500 text-stone-800 font-serif italic my-4"
                    >
                      {paragraph.replace(/^> /, '')}
                    </blockquote>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  const items = paragraph.split('\n- ');
                  return (
                    <ul key={idx} className="space-y-2 list-disc pl-5 my-4">
                      {items.map((item, i) => (
                        <li key={i} className="text-stone-700">
                          {item.replace(/^- /, '')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={idx} className="text-stone-700 leading-relaxed font-normal">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          ) : (
            <p className="text-stone-600 leading-relaxed">
              {article.summary || article.excerpt || 'Isi artikel belum dimuat.'}
            </p>
          )}
        </div>
      </div>

      {/* ─── 6. CITIZEN COMMENTS & INTERACTIVE DISCUSSION ─── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 border-t border-stone-200 mt-14 space-y-8">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              Tanggapan &amp; Aspirasi Warga ({comments.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-400">
            Forum Terbuka
          </span>
        </div>

        {/* Comment Form */}
        <form
          onSubmit={handleAddComment}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4"
        >
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700">
              [ BERIKAN TANGGAPAN ANDA ]
            </span>
            <p className="text-xs text-stone-500">
              Kritik, saran, atau masukan regulasi akan ditinjau langsung oleh staf ahli dewan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Nama lengkap / Tokoh Masyarakat"
              className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="Kecamatan / Asal Wilayah Dapil"
              className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <textarea
            rows={3}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Tuliskan pokok pikiran atau masukan kebijakan Anda..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-amber-500"
            required
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Kirim Aspirasi</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Comments Feed */}
        <div className="space-y-4">
          {comments.map((comm) => (
            <div
              key={comm.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-bold text-stone-900">
                  {comm.name}
                </span>
                <span className="text-stone-400 font-mono text-[11px]">
                  {comm.date}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                {comm.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7. RELATED ARTICLES STRIP ─── */}
      {relatedArticles.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 mt-16 border-t border-stone-200 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="text-xl font-serif font-bold text-stone-900">
              Kajian &amp; Risalah Terkait Lainnya
            </h3>
            <Link
              href={getNavLinkHref('/artikel')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
            >
              <span>Semua Kajian</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedArticles.slice(0, 3).map((rel) => (
              <Link
                key={rel.id}
                href={getNavLinkHref(`/artikel/${rel.slug}`)}
                className="group block p-4 rounded-xl bg-white border border-stone-200/90 hover:border-amber-500/80 transition-all hover:-translate-y-1 hover:shadow-md space-y-2"
              >
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-stone-100 text-stone-600 block w-fit">
                  {rel.issueCategory || rel.category || 'KEBIJAKAN'}
                </span>
                <h4 className="font-serif font-bold text-sm text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                  {rel.title}
                </h4>
                <div className="text-[11px] font-mono text-stone-400">
                  {rel.publishedAt ? formatDateIndonesian(rel.publishedAt) : 'Terbaru'}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </article>
  );
}
