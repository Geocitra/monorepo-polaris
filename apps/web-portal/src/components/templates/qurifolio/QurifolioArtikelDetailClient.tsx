'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Check,
  MessageSquare,
  Send,
  ArrowUpRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { MarkdownContent } from '@/components/article/markdown-content';

interface QurifolioArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function QurifolioArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: QurifolioArtikelDetailClientProps) {
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
        'Sangat mendukung inisiasi Bapak Dewan mengenai penyederhanaan akses permodalan mikro bagi kelompok tani di sentra desa.',
    },
    {
      id: 'c2',
      name: 'Siti Marlina, S.Pd.',
      date: '4 hari lalu',
      content:
        'Alokasi sarana digital dan internet madrasah terbukti nyata membantu putra-putri kami belajar di era modern. Terima kasih atas advokasi parlemen.',
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

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-ahmad-fauzi-cutout.webp';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
  const category = article?.issueCategory || article?.category || 'Gagasan Kebijakan';
  const readTime = article?.readingTimeMinutes || 4;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    const newComment = {
      id: `c-${Date.now()}`,
      name: authorName.trim() || 'Warga Konstituen',
      date: 'Baru saja',
      content: commentContent.trim(),
    };

    setComments([newComment, ...comments]);
    setAuthorName('');
    setCommentContent('');
  };

  return (
    <div className="space-y-16">
      
      {/* ─── ARTICLE HERO CONTAINER ─── */}
      <article className="bg-white rounded-3xl p-6 sm:p-10 lg:p-14 border border-stone-200 shadow-sm space-y-10">
        
        {/* Navigation & Controls Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <Link
            href={getNavLinkHref('/artikel')}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-stone-600 hover:text-[#FF6B00] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Indeks Artikel</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Font size toggle */}
            <div className="flex items-center rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-bold">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  fontSize === 'normal' ? 'bg-white text-black shadow-xs' : 'text-stone-500 hover:text-black'
                }`}
                title="Ukuran Font Normal"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  fontSize === 'large' ? 'bg-white text-black shadow-xs' : 'text-stone-500 hover:text-black'
                }`}
                title="Ukuran Font Besar"
              >
                A+
              </button>
            </div>

            {/* Copy share button */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#161616] font-bold text-xs border border-stone-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#FF6B00]" />}
              <span>{copied ? 'Tersalin' : 'Bagikan'}</span>
            </button>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-md bg-[#FF6B00] text-white text-[11px] font-black uppercase tracking-wider">
              {category}
            </span>
            <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>
                {article?.publishedAt
                  ? formatDateIndonesian(article.publishedAt)
                  : 'September 2026'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{readTime} menit baca</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#161616] tracking-tight uppercase leading-tight">
            {article?.title}
          </h1>

          {/* Author Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
            <img
              src={photoUrl}
              alt={officialFullName}
              className="w-12 h-12 rounded-xl object-cover object-top border border-stone-300"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-[#161616]">{officialFullName}</span>
                <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
              </div>
              <p className="text-xs text-stone-500">
                Anggota Komisi XI DPR RI • Dapil {dapil}
              </p>
            </div>
          </div>
        </div>

        {/* Featured Article Poster / Hero Image if available */}
        {(article?.posterUrl || article?.featuredImageUrl || article?.imageUrl) && (
          <div className="rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
            <img
              src={article.posterUrl || article.featuredImageUrl || article.imageUrl}
              alt={article.title}
              className="w-full max-h-[460px] object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <div
          className={`prose max-w-none text-stone-800 leading-relaxed space-y-6 pt-4 border-t border-stone-100 ${
            fontSize === 'large' ? 'text-lg sm:text-xl leading-loose' : 'text-sm sm:text-base'
          }`}
        >
          {article?.bodyContentMarkdown ? (
            <MarkdownContent content={article.bodyContentMarkdown} />
          ) : article?.content ? (
            <div
              className="whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: article.content.replace(/\n\n/g, '<br/><br/>'),
              }}
            />
          ) : article?.body ? (
            <MarkdownContent content={article.body} />
          ) : (
            <p className="text-stone-500 italic">Konten artikel sedang dipersiapkan.</p>
          )}
        </div>

      </article>

      {/* ─── CITIZEN DISCUSSION SECTION ─── */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-8">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-[#161616] tracking-tight uppercase flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#FF6B00]" />
            <span>Tanggapan & Diskusi Konstituen ({comments.length})</span>
          </h3>
          <p className="text-xs text-stone-500">
            Sampaikan pandangan, aspirasi, atau masukan Anda terkait pokok bahasan artikel ini.
          </p>
        </div>

        {/* Comment Input Form */}
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Nama Lengkap / Instansi (Opsional)"
            className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-hidden focus:border-[#FF6B00]"
          />
          <textarea
            rows={3}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Tuliskan masukan atau opini konstruktif Anda..."
            required
            className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-hidden focus:border-[#FF6B00]"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#161616] hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Kirim Tanggapan</span>
          </button>
        </form>

        {/* Comment List */}
        <div className="space-y-4 pt-6 border-t border-stone-100">
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-[#161616]">{c.name}</span>
                <span className="text-[11px] text-stone-400 font-medium">{c.date}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── RELATED ARTICLES ─── */}
      {relatedArticles.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-xl font-black text-[#161616] tracking-tight uppercase flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
            <span>Gagasan Kebijakan Terkait</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.slice(0, 3).map((rel, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-[#FF6B00] transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-sm">
                    {rel.category || 'Parlemen'}
                  </span>
                  <h4 className="font-bold text-sm text-[#161616] hover:text-[#FF6B00] line-clamp-2">
                    <Link href={getNavLinkHref(`/artikel/${rel.slug || rel.id}`)}>
                      {rel.title}
                    </Link>
                  </h4>
                </div>
                <Link
                  href={getNavLinkHref(`/artikel/${rel.slug || rel.id}`)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-[#FF6B00] uppercase pt-2"
                >
                  <span>Baca</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
