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

interface CleanEditorialArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function CleanEditorialArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: CleanEditorialArtikelDetailClientProps) {
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<
    Array<{ id: string; name: string; date: string; content: string }>
  >([
    {
      id: 'c1',
      name: 'Rahmat Hidayat (Pelaku UMKM)',
      date: '2 hari yang lalu',
      content:
        'Sangat setuju dengan penekanan bahwa regulasi turunan UU Cipta Kerja harus memprioritaskan sertifikasi halal dan kemudahan akses kredit mikro di tingkat kecamatan.',
    },
    {
      id: 'c2',
      name: 'Dewi Lestari (Kader Pemberdayaan Desa)',
      date: '4 hari yang lalu',
      content:
        'Terima kasih atas kajian komprehensifnya, Pak Dewan. Kami menunggu realisasi pendampingan izin berusaha terpadu di dapil.',
    },
  ]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

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
    if (!newCommentName.trim() || !newCommentText.trim()) return;
    const newEntry = {
      id: `c-${Date.now()}`,
      name: newCommentName.trim(),
      date: 'Baru saja',
      content: newCommentText.trim(),
    };
    setComments([newEntry, ...comments]);
    setNewCommentName('');
    setNewCommentText('');
  };

  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Dr. H. Ahmad Fauzi, M.Si.';
  const dapil =
    member?.dapilName ||
    member?.customDapilName ||
    member?.customDapil ||
    'Jawa Barat I';

  return (
    <div className="bg-white py-8 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* ─── 1. TOP TOOLBAR ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <Link
            href={getNavLinkHref('/artikel')}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 hover:text-slate-950 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 text-[#6366F1]" />
            <span>KEMBALI KE KATALOG</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>PORTAL</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#6366F1] font-bold">TELAAH KEBIJAKAN</span>
          </div>
        </div>

        {/* ─── 2. ARTICLE HEADER ─── */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <span className="px-3 py-1 rounded-full font-bold bg-purple-50 text-[#6366F1] border border-purple-100 uppercase tracking-wider">
              {article.issueCategory || article.category || 'KEBIJAKAN & REGULASI'}
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {article.publishedAt
                ? formatDateIndonesian(article.publishedAt)
                : article.date || '01 September 2026'}
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {article.readingTime || '4 min read'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-editorial-serif font-black text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Author Badge & Reading Toolbar */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="font-editorial-serif font-bold text-2xl text-slate-950 tracking-tighter leading-none shrink-0">
                {officialFullName.charAt(0)}\
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block font-editorial-serif">
                  {officialFullName}
                </span>
                <span className="text-[11px] font-mono text-slate-500 block">
                  Anggota DPR RI • {member?.commissionName || 'Komisi IX'} • Dapil {dapil}
                </span>
              </div>
            </div>

            {/* Reading Toolbar */}
            <div className="flex items-center gap-2 font-mono">
              <button
                type="button"
                onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-[#F8F9FD] hover:bg-slate-100 text-xs text-slate-700 font-bold transition-colors cursor-pointer"
                title="Sesuaikan ukuran huruf"
              >
                Font: {fontSize === 'normal' ? 'A' : 'A+'}
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="p-2 rounded-lg border border-slate-200 bg-[#F8F9FD] hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
                title="Salin tautan naskah"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="p-2 rounded-lg border border-slate-200 bg-[#F8F9FD] hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                title="Cetak naskah"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ─── 3. FEATURED IMAGE ─── */}
        <div className="rounded-3xl overflow-hidden aspect-video bg-slate-900 border border-slate-200 shadow-sm relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              article.featuredImageUrl ||
              article.posterUrl ||
              article.thumbnail ||
              '/images/ref-article-1.jpg'
            }
            alt={article.title}
            className="w-full h-full object-cover filter contrast-[1.02]"
          />
        </div>

        {/* ─── 4. EXECUTIVE SUMMARY BOX ─── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#F8F9FD] border-l-4 border-[#6366F1] space-y-2 border border-slate-200/80">
          <span className="text-[11px] font-mono font-bold text-[#6366F1] uppercase tracking-widest block flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#6366F1]" />
            RINGKASAN EKSEKUTIF KEBIJAKAN
          </span>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {article.leadParagraph ||
              article.summary ||
              article.excerpt ||
              'Naskah ini memberikan tinjauan kritis atas formulasi perundang-undangan dan alokasi anggaran belanja pemerintah yang berdampak langsung pada kesejahteraan ekonomi kerakyatan serta pelaku usaha kecil di daerah.'}
          </p>
        </div>

        {/* ─── 5. ARTICLE BODY ─── */}
        <article
          className={`space-y-6 text-slate-700 leading-relaxed font-sans ${
            fontSize === 'large' ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'
          }`}
        >
          {article.content ? (
            <div
              className="prose prose-slate max-w-none prose-headings:font-editorial-serif prose-headings:text-slate-900 prose-a:text-[#6366F1] prose-blockquote:border-l-4 prose-blockquote:border-[#6366F1] prose-blockquote:bg-[#F8F9FD] prose-blockquote:p-4 prose-blockquote:rounded-r-xl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <div className="space-y-4">
              <p>
                Di tengah dinamika perekonomian global yang penuh ketidakpastian, sektor Usaha Mikro, Kecil, dan Menengah (UMKM) tetap menjadi tulang punggung perekonomian Indonesia. Kebijakan publik yang dirumuskan di tingkat pusat harus mampu menjawab tantangan nyata yang dihadapi pelaku usaha di tingkat akar rumput, mulai dari perizinan hingga akses permodalan.
              </p>
              <h2 className="text-lg sm:text-xl font-editorial-serif font-bold text-slate-900 pt-3">
                1. Sinergi Regulasi dan Kemudahan Berusaha
              </h2>
              <p>
                Implementasi regulasi turunan undang-undang harus memastikan bahwa digitalisasi perizinan tidak menjadi beban baru bagi pelaku usaha mikro. Kantor posko aspirasi di daerah pemilihan secara aktif mengawal agar setiap regulasi dipahami dan dapat diakses dengan mudah oleh warga tanpa diskriminasi.
              </p>
              <blockquote className="border-l-4 border-[#6366F1] bg-[#F8F9FD] p-4 rounded-r-xl text-slate-800 italic font-editorial-serif">
                &quot;Kebijakan yang baik bukan hanya yang tertulis rapi di atas kertas undang-undang, melainkan yang terasa nyata manfaatnya di pasar-pasar tradisional dan dapur keluarga pekerja.&quot;
              </blockquote>
              <h2 className="text-lg sm:text-xl font-editorial-serif font-bold text-slate-900 pt-3">
                2. Pengawasan Anggaran Pro-Rakyat
              </h2>
              <p>
                DPR RI melalui fungsi pengawasan anggaran berkomitmen mengawal setiap rupiah dari APBN agar tepat sasaran dalam bentuk subsidi bunga kredit usaha, pelatihan vokasi terarah, serta jaminan perlindungan sosial bagi pekerja mandiri.
              </p>
            </div>
          )}
        </article>

        {/* ─── 6. CITIZEN COMMENTS & ASPIRASI DISCUSSION ─── */}
        <section className="pt-10 border-t border-slate-200 space-y-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#6366F1]" />
            <h3 className="text-lg font-editorial-serif font-bold text-slate-900">
              Tanggapan &amp; Suara Konstituen ({comments.length})
            </h3>
          </div>

          {/* Form Tanggapan */}
          <form onSubmit={handleAddComment} className="p-6 rounded-2xl bg-[#F8F9FD] border border-slate-200 space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
              Sampaikan Masukan Atas Naskah Ini
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nama Lengkap / Instansi Warga"
                value={newCommentName}
                onChange={(e) => setNewCommentName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6366F1]"
                required
              />
              <textarea
                placeholder="Tuliskan gagasan, tanggapan kritis, atau masukan Anda..."
                rows={3}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#6366F1]"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>Kirim Masukan</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* List Komentar */}
          <div className="space-y-4">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 font-editorial-serif">{c.name}</span>
                  <span className="text-[11px] font-mono text-slate-400">{c.date}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{c.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 7. RELATED ARTICLES ─── */}
        {relatedArticles.length > 0 && (
          <section className="pt-10 border-t border-slate-200 space-y-6">
            <h3 className="text-lg font-editorial-serif font-bold text-slate-900">
              Kajian Kebijakan Terkait Lainnya
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedArticles.slice(0, 2).map((rel) => (
                <Link
                  key={rel.id || rel.slug}
                  href={getNavLinkHref(`/artikel/${rel.slug}`)}
                  className="p-5 rounded-2xl bg-[#F8F9FD] border border-slate-200 hover:border-purple-300 transition-all space-y-2 group block"
                >
                  <span className="text-[10px] font-mono font-bold text-[#6366F1] uppercase">
                    {rel.issueCategory || rel.category || 'KEBIJAKAN'}
                  </span>
                  <h4 className="text-sm font-editorial-serif font-bold text-slate-900 group-hover:text-[#6366F1] transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {rel.excerpt || 'Baca telaah pemikiran kebijakan resmi dari wakil rakyat.'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
