'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Copy,
  Check,
  MessageSquare,
  Send,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface WarmPortfolioArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function WarmPortfolioArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: WarmPortfolioArtikelDetailClientProps) {
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

  const formattedDate = article?.publishedAt
    ? formatDateIndonesian(article.publishedAt)
    : 'Terbaru';
  const categoryName = article?.issueCategory || article?.category || 'Kajian Kebijakan';
  const officialFullName = member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-ahmad-fauzi-cutout.webp';

  return (
    <article className="space-y-10">
      
      {/* ─── 1. TOP READER TOOLBAR ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <Link
          href={getNavLinkHref('/artikel')}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#F59E0B]" />
          <span>Kembali ke Katalog Artikel</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Font Resizer */}
          <button
            onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
            className="px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-colors"
          >
            Ukuran Teks: {fontSize === 'normal' ? 'A' : 'A+'}
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            <span>{copied ? 'Tersalin' : 'Salin Tautan'}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. ARTICLE HEADER CARD ─── */}
      <header
        className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-sm space-y-4"
        style={{
          clipPath: 'polygon(24px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 24px)',
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3.5 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200/70">
            {categoryName}
          </span>
          <span className="text-xs text-stone-400 flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span className="text-xs text-stone-400 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {article?.readingTimeMinutes || 4} menit baca
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-stone-950 tracking-tight leading-snug">
          {article?.title} <span className="text-[#F59E0B] font-sans inline-block">✦</span>
        </h1>

        {article?.excerpt && (
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed border-l-4 border-[#F59E0B] pl-4 italic">
            &ldquo;{article.excerpt}&rdquo;
          </p>
        )}
      </header>

      {/* ─── 3. FEATURED IMAGE (IF AVAILABLE) ─── */}
      {article?.coverImageUrl && (
        <div className="rounded-3xl overflow-hidden border border-stone-200 shadow-md">
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      )}

      {/* ─── 4. ARTICLE BODY CONTENT ─── */}
      <section
        className={`bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-sm leading-relaxed text-stone-800 space-y-6 ${
          fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
        }`}
        style={{
          clipPath: 'polygon(20px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 20px)',
        }}
      >
        {article?.content ? (
          <div
            className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-[#F59E0B] prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <div className="space-y-5 text-stone-700 leading-relaxed font-normal">
            <p>
              Sebagai representasi suara rakyat di lembaga legislatif, keterbukaan informasi dan pertanggungjawaban publik adalah fondasi utama pengabdian kenegaraan. Kebijakan publik yang dirumuskan tidak boleh berhenti sebagai naskah akademis di atas meja persidangan, melainkan wajib diuji efektivitasnya secara nyata di lapangan.
            </p>
            <p>
              Dalam kurun waktu pengawasan anggaran terakhir, kami memfokuskan pemantauan pada efisiensi belanja daerah dan penyerapan dana program pemberdayaan masyarakat. Dukungan terhadap sektor riil, seperti modal usaha mikro dan modernisasi alat tangkap/tani, terbukti paling tangguh menopang stabilitas daya beli masyarakat lapis bawah.
            </p>
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border-l-4 border-[#F59E0B] my-6">
              <p className="font-serif font-bold text-stone-900 text-base italic">
                &ldquo;Kemajuan bangsa tidak diukur dari megahnya seremonial, melainkan dari seberapa adil hasil pembangunan dinikmati oleh warga di pelosok terjauh.&rdquo;
              </p>
              <p className="text-xs text-stone-500 font-semibold mt-2">
                — {officialFullName}
              </p>
            </div>
            <p>
              Kami mengundang segenap konstituen, pegiat komunitas, akademisi, dan generasi muda untuk terus memberikan masukan konstruktif atas kajian ini. Bersama-sama, kita pastikan setiap rupiah uang rakyat bekerja penuh untuk kemaslahatan publik.
            </p>
          </div>
        )}
      </section>

      {/* ─── 5. AUTHOR BIO CARD ─── */}
      <div
        className="bg-[#181311] text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl flex flex-col sm:flex-row items-center gap-6"
        style={{
          clipPath: 'polygon(16px 0%, 100% 0%, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0% 100%, 0% 16px)',
        }}
      >
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-stone-800 border-2 border-[#F59E0B] shrink-0">
          <img
            src={photoUrl}
            alt={officialFullName}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F59E0B]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Penulis Resmi / Anggota Parlemen</span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-black text-white">
            {officialFullName}
          </h3>
          <p className="text-xs text-stone-400 max-w-xl leading-relaxed">
            Mewakili Daerah Pemilihan {member?.dapilName || 'Jawa Barat I'}. Berkomitmen menghadirkan kajian objektif, transparansi anggaran, dan pembelaan hak-hak konstituen secara paripurna.
          </p>
        </div>
      </div>

      {/* ─── 6. CITIZEN COMMENTS ─── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="text-xl font-serif font-bold text-stone-900">
            Tanggapan & Opini Konstituen ({comments.length})
          </h3>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleAddComment}
          className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-sm space-y-4"
          style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Nama lengkap atau perwakilan komunitas (opsional)"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            />
          </div>
          <textarea
            rows={3}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Tuliskan tanggapan, gagasan tambahan, atau kritik konstruktif..."
            required
            className="w-full p-4 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#181311] text-white font-bold text-xs shadow-md hover:bg-stone-800 transition-all"
          >
            <Send className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Kirim Tanggapan</span>
          </button>
        </form>

        {/* List of comments */}
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900">{c.name}</span>
                <span className="text-[11px] text-stone-400">{c.date}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7. RELATED ARTICLES ─── */}
      {relatedArticles.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-black text-stone-950">
              Kajian Terkait Lainnya
            </h3>
            <Link
              href={getNavLinkHref('/artikel')}
              className="text-xs font-bold text-[#F59E0B] hover:text-amber-700 transition-colors"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.slice(0, 2).map((rel, idx) => (
              <Link
                key={rel.id || rel.slug || idx}
                href={getNavLinkHref(`/artikel/${rel.slug}`)}
                className="group p-5 rounded-3xl bg-white border border-stone-200 shadow-sm hover:border-[#F59E0B] transition-all flex flex-col justify-between"
                style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/60">
                    {rel.issueCategory || rel.category || 'Kebijakan'}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-stone-900 group-hover:text-[#F59E0B] transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs text-stone-400">
                  <span>{rel.readingTimeMinutes || 3} mnt baca</span>
                  <ArrowUpRight className="w-4 h-4 text-[#F59E0B]" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </article>
  );
}
