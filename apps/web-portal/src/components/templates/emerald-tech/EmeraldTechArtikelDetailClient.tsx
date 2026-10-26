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
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface EmeraldTechArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function EmeraldTechArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: EmeraldTechArtikelDetailClientProps) {
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
    <article className="space-y-12">
      
      {/* ─── 1. TOP READER TOOLBAR ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <Link
          href={getNavLinkHref('/artikel')}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-[#00DF82] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#00DF82]" />
          <span>Kembali ke Katalog Artikel</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
            className="px-3.5 py-1.5 rounded-xs bg-[#161616] border border-white/[0.1] text-white hover:border-[#00DF82] text-xs font-bold transition-colors"
          >
            Ukuran Teks: {fontSize === 'normal' ? 'A' : 'A+'}
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xs bg-[#161616] border border-white/[0.1] text-white hover:border-[#00DF82] text-xs font-bold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00DF82]" />}
            <span>{copied ? 'Tersalin' : 'Salin Tautan'}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. ARTICLE HEADER ─── */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-xs bg-[#00DF82] text-black text-[10px] font-black uppercase tracking-wider">
            {categoryName}
          </span>
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article?.readingTimeMinutes || 4} menit baca
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
          {article?.title}
        </h1>

        {article?.excerpt && (
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed border-l-2 border-[#00DF82] pl-4 italic">
            &ldquo;{article.excerpt}&rdquo;
          </p>
        )}
      </header>

      {/* ─── 3. FEATURED IMAGE (IF AVAILABLE) ─── */}
      {(article?.posterUrl || article?.featuredImageUrl || article?.coverImageUrl || article?.imageUrl) && (
        <div className="rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl">
          <img
            src={article?.posterUrl || article?.featuredImageUrl || article?.coverImageUrl || article?.imageUrl}
            alt={article.title}
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      )}

      {/* ─── 4. ARTICLE BODY CONTENT ─── */}
      <section
        className={`bg-[#161616] rounded-xl border border-white/[0.08] p-6 sm:p-10 shadow-xl leading-relaxed text-stone-200 space-y-6 ${
          fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
        }`}
      >
        {article?.content ? (
          <div
            className="prose prose-invert max-w-none prose-headings:font-black prose-headings:text-white prose-a:text-[#00DF82] prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <div className="space-y-5 text-stone-300 leading-relaxed font-normal">
            <p>
              Sebagai representasi suara rakyat di lembaga legislatif, keterbukaan informasi dan pertanggungjawaban publik adalah fondasi utama pengabdian kenegaraan. Kebijakan publik yang dirumuskan tidak boleh berhenti sebagai naskah akademis di atas meja persidangan, melainkan wajib diuji efektivitasnya secara nyata di lapangan.
            </p>
            <p>
              Dalam kurun waktu pengawasan anggaran terakhir, kami memfokuskan pemantauan pada efisiensi belanja daerah dan penyerapan dana program pemberdayaan masyarakat. Dukungan terhadap sektor riil, seperti modal usaha mikro dan modernisasi alat tangkap/tani, terbukti paling tangguh menopang stabilitas daya beli masyarakat lapis bawah.
            </p>
            <div className="p-6 rounded-lg bg-black border-l-4 border-[#00DF82] my-6">
              <p className="font-bold text-white text-base sm:text-lg italic">
                &ldquo;Kemajuan bangsa tidak diukur dari megahnya seremonial, melainkan dari seberapa adil hasil pembangunan dinikmati oleh warga di pelosok terpencil.&rdquo;
              </p>
              <p className="text-xs text-[#00DF82] font-bold mt-2">
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
      <div className="bg-[#161616] text-white rounded-xl p-6 sm:p-8 border border-white/[0.08] shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-black border-2 border-[#00DF82] shrink-0">
          <img
            src={photoUrl}
            alt={officialFullName}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00DF82]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Penulis Resmi / Anggota Parlemen</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
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
          <MessageSquare className="w-5 h-5 text-[#00DF82]" />
          <h3 className="text-xl font-black text-white">
            Tanggapan & Opini Konstituen ({comments.length})
          </h3>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleAddComment}
          className="bg-[#161616] rounded-xl border border-white/[0.08] p-6 space-y-4"
        >
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Nama lengkap atau instansi/komunitas (opsional)"
            className="w-full px-4 py-3 rounded-xs bg-black border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00DF82]"
          />
          <textarea
            rows={3}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Tuliskan tanggapan, gagasan tambahan, atau kritik konstruktif..."
            required
            className="w-full p-4 rounded-xs bg-black border border-white/[0.1] text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00DF82]"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xs bg-[#00DF82] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00c974] transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Tanggapan</span>
          </button>
        </form>

        {/* List of comments */}
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-lg bg-[#161616] border border-white/[0.08] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{c.name}</span>
                <span className="text-[11px] text-stone-500">{c.date}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7. RELATED ARTICLES ─── */}
      {relatedArticles.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white">
              Kajian Terkait Lainnya
            </h3>
            <Link
              href={getNavLinkHref('/artikel')}
              className="text-xs font-bold text-[#00DF82] hover:underline"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.slice(0, 2).map((rel, idx) => (
              <Link
                key={rel.id || rel.slug || idx}
                href={getNavLinkHref(`/artikel/${rel.slug}`)}
                className="group p-5 rounded-xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00DF82]">
                    {rel.issueCategory || rel.category || 'Kebijakan'}
                  </span>
                  <h4 className="font-bold text-sm text-white group-hover:text-[#00DF82] transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
                  <span>{rel.readingTimeMinutes || 3} mnt baca</span>
                  <ArrowUpRight className="w-4 h-4 text-[#00DF82]" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </article>
  );
}
