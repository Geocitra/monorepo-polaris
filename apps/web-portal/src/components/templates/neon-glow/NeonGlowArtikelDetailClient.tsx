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
  Terminal,
  Cpu,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface NeonGlowArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function NeonGlowArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: NeonGlowArtikelDetailClientProps) {
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

  const getNavLink = (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    if (previewTemplate) {
      base += `${base.includes('?') ? '&' : '?'}preview_template=${previewTemplate}`;
    }
    return base;
  };

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsapp = () => {
    if (typeof window !== 'undefined') {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`*${article?.title}*\n\nBaca kajian resmi: `);
      window.open(`https://api.whatsapp.com/send?text=${text}${url}`, '_blank');
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;

    setComments((prev) => [
      {
        id: `c-${Date.now()}`,
        name: newCommentName.trim(),
        date: 'Baru saja',
        content: newCommentText.trim(),
      },
      ...prev,
    ]);
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
    <div className="py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ─── 1. TOP BREADCRUMB & BACK LINK ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
          <Link
            href={getNavLink('/artikel')}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-purple-400 hover:text-purple-300 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-cyan-400" />
            <span>// KEMBALI_KE_KATALOG_ARTIKEL</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>PORTAL</span>
            <ChevronRight className="w-3.5 h-3.5 text-purple-700" />
            <span className="text-cyan-300">TELAAH_KEBIJAKAN</span>
          </div>
        </div>

        {/* ─── 2. ARTICLE HEADER ─── */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <span className="px-3 py-1 rounded-full font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              {article.issueCategory || article.category || 'KEBIJAKAN & REGULASI'}
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              {article.publishedAt
                ? formatDateIndonesian(article.publishedAt)
                : article.date || '01 September 2026'}
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {article.readingTime || '4 min read'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Author Badge & Reading Toolbar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-purple-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-purple-900/50 shrink-0">
                {officialFullName.charAt(0)}
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">
                  {officialFullName}
                </span>
                <span className="text-[11px] font-mono text-slate-400 block">
                  Anggota DPR RI • Komisi IX • Dapil {dapil}
                </span>
              </div>
            </div>

            {/* Reading Toolbar */}
            <div className="flex items-center gap-2 font-mono">
              <button
                type="button"
                onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-purple-900/40 text-xs text-slate-300 hover:text-white transition-colors"
                title="Sesuaikan ukuran huruf"
              >
                A{fontSize === 'normal' ? '+' : '-'}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-950/80 border border-purple-900/40 text-slate-300 hover:text-white transition-colors"
                title="Salin tautan naskah"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleShareWhatsapp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600/30 transition-colors font-sans"
                title="Bagikan ke WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => typeof window !== 'undefined' && window.print()}
                className="p-1.5 rounded-lg bg-slate-950/80 border border-purple-900/40 text-slate-300 hover:text-white transition-colors"
                title="Cetak Naskah Dokumen"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ─── 3. FEATURED IMAGE ─── */}
        <div className="rounded-3xl overflow-hidden aspect-video bg-slate-900 border border-purple-900/40 shadow-2xl relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              article.featuredImageUrl ||
              article.posterUrl ||
              article.thumbnail ||
              '/images/ref-article-1.jpg'
            }
            alt={article.title}
            className="w-full h-full object-cover filter contrast-[1.05]"
          />
        </div>

        {/* ─── 4. EXECUTIVE SUMMARY BOX ─── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-purple-950/20 border-l-4 border-purple-500 space-y-2">
          <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest block flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            RINGKASAN EKSEKUTIF KEBIJAKAN
          </span>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {article.leadParagraph ||
              article.summary ||
              article.excerpt ||
              'Naskah ini memberikan tinjauan kritis atas formulasi perundang-undangan dan alokasi anggaran belanja pemerintah yang berdampak langsung pada kesejahteraan ekonomi kerakyatan serta pelaku usaha kecil di daerah.'}
          </p>
        </div>

        {/* ─── 5. ARTICLE BODY ─── */}
        <article
          className={`space-y-6 text-slate-300 leading-relaxed font-sans ${
            fontSize === 'large' ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'
          }`}
        >
          {article.content ? (
            <div
              className="prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-white prose-a:text-purple-400"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <>
              <p>
                Dalam dinamika pembangunan nasional, keberpihakan terhadap sektor riil dan usaha mikro, kecil, dan menengah (UMKM) tidak boleh sekadar menjadi retorika politik. Kehadiran kerangka regulasi yang adaptif serta penurunan hambatan perizinan berusaha menjadi kunci utama akselerasi ekonomi daerah.
              </p>

              <h2 className="text-lg sm:text-xl font-bold text-white pt-4 border-b border-purple-900/40 pb-2">
                1. Simplifikasi Regulasi dan Kepastian Berusaha
              </h2>
              <p>
                Salah satu pilar krusial yang terus kami kawal di parlemen adalah kepastian proses izin usaha terpadu. Pelaku UMKM di tingkat akar rumput kerap terkendala prosedur birokrasi yang berbelit dan tumpang tindih antara kementerian teknis dan dinas daerah. Kami mendorong integrasi penuh sertifikasi halal gratis, izin edar BPOM, dan pendaftaran merek usaha mikro melalui satu pintu tanpa biaya tersembunyi.
              </p>

              <blockquote className="p-4 rounded-xl bg-[#0C1022]/90 border-l-4 border-cyan-400 italic text-slate-200 text-xs sm:text-sm font-sans">
                &quot;Negara wajib hadir memangkas rantai birokrasi yang membebani pedagang pasar dan perajin desa. Ketika rakyat kecil berikhtiar memutar roda ekonomi keluarga, mandat kita adalah membukakan jalan selapang-lapangnya.&quot;
              </blockquote>

              <h2 className="text-lg sm:text-xl font-bold text-white pt-4 border-b border-purple-900/40 pb-2">
                2. Perlindungan dan Jaminan Sosial Tenaga Kerja Informal
              </h2>
              <p>
                Tidak kalah pentingnya adalah aspek jaminan sosial bagi para pekerja rentan di ekosistem UMKM. Melalui fungsi pengawasan parlemen, kami memastikan alokasi anggaran subsidi iuran BPJS Ketenagakerjaan (JKK dan JKM) dapat dinikmati oleh buruh tani, nelayan tradisional, pengemudi transportasi umum, dan pelaku ekonomi informal di Dapil {dapil}.
              </p>

              <h2 className="text-lg sm:text-xl font-bold text-white pt-4 border-b border-purple-900/40 pb-2">
                3. Catatan Strategis &amp; Rekomendasi Parlemen
              </h2>
              <ul className="space-y-2 list-disc list-inside text-slate-300">
                <li>
                  <strong className="text-white">Alokasi Kredit Usaha:</strong> Mendorong penurunan bunga KUR mikro dan perluasan plafon tanpa agunan fisik bagi pengusaha rintisan muda.
                </li>
                <li>
                  <strong className="text-white">Pelatihan Digitalisasi:</strong> Menggencarkan program literasi pemasaran digital dan fasilitasi masuk ke ekosistem e-katalog pengadaan barang pemerintah daerah.
                </li>
                <li>
                  <strong className="text-white">Pengawasan Partisipatif:</strong> Mengajak warga masyarakat untuk aktif melaporkan kendala pungutan liar atau hambatan layanan perizinan di posko aduan resmi dewan.
                </li>
              </ul>

              <p className="pt-4">
                Komitmen ini akan terus kami suarakan secara lugas dalam setiap rapat dengar pendapat (RDP) dan rapat kerja bersama menteri terkait. Aspirasi bapak dan ibu sekalian adalah panduan utama bagi fraksi kami dalam mengawal kedaulatan ekonomi rakyat.
              </p>
            </>
          )}
        </article>

        {/* ─── 6. AUTHOR BIO CARD ─── */}
        <div className="rounded-3xl bg-[#0C1022]/90 border border-purple-900/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-purple-500/30 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={theme?.officialPhotoUrl || member?.photoUrl || '/images/dewan-standing-full.png'}
              alt={officialFullName}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="space-y-2 text-center sm:text-left flex-1">
            <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest block">
              // PENULIS_DOKUMEN_KEBIJAKAN
            </span>
            <h4 className="text-base sm:text-lg font-black text-white">{officialFullName}</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Wakil rakyat Daerah Pemilihan {dapil} di DPR RI. Mengemban amanah di komisi kerja parlemen dengan fokus pada pembelaan hak-hak rakyat, jaminan sosial ketenagakerjaan, dan transparansi anggaran berbasis data.
            </p>
          </div>
        </div>

        {/* ─── 7. CITIZEN COMMENTS & ASPIRATION SECTION ─── */}
        <section className="space-y-6 pt-6 border-t border-purple-900/40">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                // TANGGAPAN_WARGA ({comments.length})
              </h3>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleCommentSubmit}
            className="p-5 sm:p-6 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 space-y-4"
          >
            <span className="text-xs font-mono font-bold text-slate-300 block">
              Sampaikan Tanggapan atau Usulan Kebijakan Terkait Artikel Ini:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nama Lengkap / Instansi Warga"
                value={newCommentName}
                onChange={(e) => setNewCommentName(e.target.value)}
                required
                className="bg-slate-950/80 border border-purple-900/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
              />
              <div className="text-[11px] font-mono text-slate-500 flex items-center">
                *Tanggapan Anda akan diverifikasi oleh staf ahli kedewanan.
              </div>
            </div>
            <textarea
              rows={3}
              placeholder="Tuliskan aspirasi, masukan kritis, atau telaah lapangan Anda..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              required
              className="w-full bg-slate-950/80 border border-purple-900/40 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer font-sans"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Tanggapan Resmi</span>
            </button>
          </form>

          {/* Comment List */}
          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-[#0C1022]/90 border border-purple-900/40 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    {c.name}
                  </span>
                  <span className="text-[10px] font-mono text-purple-400">{c.date}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">{c.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 8. RELATED ARTICLES ─── */}
        {relatedArticles.length > 0 && (
          <section className="space-y-6 pt-10 border-t border-purple-900/40">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-purple-400 tracking-widest block font-bold">
                // KAJIAN_TERKAIT
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Rekomendasi Naskah Lainnya
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.slice(0, 2).map((rel) => (
                <div
                  key={rel.id || rel.slug}
                  className="p-5 rounded-2xl bg-[#0C1022]/90 border border-purple-900/40 hover:border-purple-500/50 transition-all space-y-3 group"
                >
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                    {rel.issueCategory || rel.category || 'KEBIJAKAN'}
                  </span>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 font-normal">
                    {rel.leadParagraph || rel.summary || rel.excerpt || 'Telaah kebijakan publik.'}
                  </p>
                  <Link
                    href={getNavLink(`/artikel/${rel.slug}`)}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-1 transition-all"
                  >
                    <span>Baca Naskah</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
