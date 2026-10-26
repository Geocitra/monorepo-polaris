'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  Check,
  MessageCircle,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import {
  getGoldenMemberInfo,
  useGoldenHref,
  getArticleImage,
  getArticleCategory,
  getArticleExcerpt,
} from './utils';

interface GoldenSplitArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function GoldenSplitArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: GoldenSplitArtikelDetailClientProps) {
  const info = getGoldenMemberInfo(member, theme, subdomain);
  const href = useGoldenHref(subdomain);
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
  const dateStr = formatDateIndonesian(
    article?.publishedAt || article?.createdAt || new Date()
  );

  return (
    <article className="max-w-[1140px] mx-auto px-6 lg:px-10 py-16 space-y-12">
      
      {/* ─── HEADER & METADATA ─── */}
      <header className="space-y-6">
        <Link
          href={href('/artikel')}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-[#FFA800] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Artikel &amp; Risalah</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-[#FFA800] text-[#1E1E1E] text-xs font-black uppercase tracking-wider">
          {category}
        </div>

        <h1 className="font-outfit font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
          {article?.title}
        </h1>

        {article?.excerpt && (
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-3xl">
            {article.excerpt}
          </p>
        )}

        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={info.photoUrl}
              alt={info.officialFullName}
              className="w-10 h-10 rounded-full object-cover object-top border-2 border-[#FFA800]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
              }}
            />
            <div>
              <div className="text-xs font-bold text-white">{info.officialFullName}</div>
              <div className="text-[10px] text-neutral-400">
                {info.party} · {info.dapil}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FFA800]" />
              {dateStr}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FFA800]" />
              {article?.readingTime || '5 menit baca'}
            </span>
          </div>
        </div>
      </header>

      {/* ─── GAMBAR COVER BESAR ARTIKEL ─── */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl max-h-[520px]">
        <img
          src={coverUrl}
          alt={article?.title || 'Cover Artikel'}
          className="w-full h-full max-h-[520px] object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
          }}
        />
      </div>

      {/* ─── PROSE BODY & SIDEBAR ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Main Prose Content */}
        <div className="lg:col-span-8 text-neutral-300 text-sm sm:text-base leading-relaxed space-y-6">
          {article?.content ? (
            <div
              className="prose prose-invert max-w-none prose-headings:font-outfit prose-headings:text-white prose-a:text-[#FFA800] prose-blockquote:border-[#FFA800]"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <>
              <p className="first-letter:font-outfit first-letter:text-5xl first-letter:font-extrabold first-letter:text-[#FFA800] first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                Kebijakan daerah yang akuntabel senantiasa berpijak pada data riil lapangan dan kehendak murni
                dari rakyat. Dalam fungsi pengawasan keparlemenan, setiap dokumen rancangan anggaran maupun peraturan
                daerah harus dipastikan menjawab persoalan yang dihadapi oleh warga di akar rumput.
              </p>
              
              <p>
                Alokasi belanja APBD merupakan amanah konstitusi yang wajib diawasi secara ketat. Efisiensi,
                keberpihakan pada kelompok rentan, serta percepatan infrastruktur dasar di tingkat pedesaan menjadi
                tiga pilar utama yang terus kami suarakan dalam setiap rapat kerja komisi.
              </p>

              <blockquote className="my-8 p-6 rounded-xl bg-[#262626] border-l-4 border-[#FFA800] text-white font-medium text-base sm:text-lg italic leading-relaxed">
                “Tugas pokok wakil rakyat bukan sekadar menyetujui anggaran, melainkan memastikan anggaran tersebut benar-benar melahirkan kesejahteraan bagi masyarakat.”
              </blockquote>

              <h3 className="font-outfit font-extrabold text-xl sm:text-2xl text-white pt-2">
                Langkah Nyata Pengawalan Hak Konstituen
              </h3>

              <p>
                Melalui posko aspirasi dan platform digital POLARIS, kami membuka saluran langsung agar setiap
                keluhan mengenai fasilitas umum, sarana pertanian, dan kendala layanan kesehatan dapat diverifikasi
                secara cepat oleh tim staf ahli dan diteruskan ke dinas terkait.
              </p>
            </>
          )}

          {/* Share Buttons */}
          <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Bagikan Telaah Ini:
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded bg-[#262626] hover:bg-[#333333] border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(article?.title || 'Risalah')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded bg-[#262626] hover:bg-[#333333] border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-2 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar: Author Box */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="p-7 rounded-2xl bg-[#262626] border border-white/5 space-y-4">
            <img
              src={info.photoUrl}
              alt={info.officialFullName}
              className="w-20 h-20 rounded-full object-cover object-top border-2 border-[#FFA800]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
              }}
            />
            <div>
              <h4 className="font-outfit font-extrabold text-lg text-white">
                {info.officialFullName}
              </h4>
              <p className="text-xs text-[#FFA800] font-semibold mt-0.5">
                {info.legislativeLevel} · {info.party}
              </p>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Mewakili konstituen {info.dapil}. Berkomitmen penuh pada transparansi tata kelola anggaran dan advokasi perda berkeadilan.
            </p>
            <Link
              href={href('/kontak')}
              className="w-full py-2.5 rounded bg-[#FFA800] hover:bg-[#E09400] text-[#1E1E1E] text-xs font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors shadow"
            >
              <span>Kirim Aspirasi / Tanggapan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

      </div>

      {/* ─── ARTIKEL TERKAIT ─── */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="pt-12 border-t border-white/10">
          <h3 className="font-outfit font-extrabold text-2xl text-white mb-6">
            Artikel Terkait Lainnya
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.slice(0, 3).map((rel: any, idx: number) => (
              <Link
                key={rel.id || idx}
                href={href(`/artikel/${rel.slug || rel.id}`)}
                className="group p-5 rounded-xl bg-[#262626] border border-white/5 hover:border-[#FFA800]/50 transition-all"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFA800]">
                  {getArticleCategory(rel)}
                </span>
                <h4 className="mt-1 font-outfit font-bold text-sm text-white group-hover:text-[#FFA800] transition-colors line-clamp-2">
                  {rel.title}
                </h4>
                <p className="mt-2 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {getArticleExcerpt(rel)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

    </article>
  );
}
