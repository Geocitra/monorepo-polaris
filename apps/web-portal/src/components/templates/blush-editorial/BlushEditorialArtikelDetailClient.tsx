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
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import {
  getBlushMemberInfo,
  useBlushHref,
  getArticleImage,
  getArticleCategory,
  getArticleExcerpt,
} from './utils';

interface BlushEditorialArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function BlushEditorialArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: BlushEditorialArtikelDetailClientProps) {
  const info = getBlushMemberInfo(member, theme, subdomain);
  const href = useBlushHref(subdomain);
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
    <article className="max-w-[1240px] mx-auto px-6 lg:px-10 py-16 space-y-12">
      
      {/* ─── HEADER & METADATA ─── */}
      <header className="space-y-6">
        <Link
          href={href('/artikel')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8C7D73] hover:text-[#D47A6A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Risalah</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF0EC] text-[#D47A6A] text-xs font-extrabold uppercase tracking-wider">
          {category}
        </div>

        <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[#332A26] leading-tight max-w-4xl">
          {article?.title}
        </h1>

        {article?.excerpt && (
          <p className="text-sm sm:text-base text-[#6E635C] leading-relaxed max-w-3xl">
            {article.excerpt}
          </p>
        )}

        <div className="pt-4 border-t border-[#EDE5DA] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={info.photoUrl}
              alt={info.officialFullName}
              className="w-10 h-10 rounded-full object-cover object-top border border-[#D5C9BD]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
              }}
            />
            <div>
              <div className="text-xs font-bold text-[#332A26]">{info.officialFullName}</div>
              <div className="text-[10px] text-[#8C7D73]">
                {info.party} · {info.dapil}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#8C7D73] font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D47A6A]" />
              {dateStr}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D47A6A]" />
              {article?.readingTime || '5 menit baca'}
            </span>
          </div>
        </div>
      </header>

      {/* ─── GAMBAR BESAR ARTIKEL ─── */}
      <div className="rounded-3xl overflow-hidden border border-[#EDE5DA] bg-[#FAF7F2] shadow-xl max-h-[540px]">
        <img
          src={coverUrl}
          alt={article?.title || 'Cover Artikel'}
          className="w-full h-full max-h-[540px] object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
          }}
        />
      </div>

      {/* ─── PROSE & SIDEBAR ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Main Prose Content */}
        <div className="lg:col-span-8 text-[#574C45] text-sm sm:text-base leading-relaxed space-y-6">
          {article?.content ? (
            <div
              className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-[#332A26] prose-a:text-[#D47A6A] prose-blockquote:border-[#D47A6A]"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <>
              <p className="first-letter:font-serif first-letter:text-6xl first-letter:font-bold first-letter:text-[#D47A6A] first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                Kebijakan daerah yang akuntabel senantiasa berpijak pada data riil lapangan dan kehendak murni
                dari rakyat. Dalam fungsi pengawasan keparlemenan, setiap dokumen rancangan anggaran maupun peraturan
                daerah harus dipastikan menjawab persoalan yang dihadapi oleh warga di akar rumput.
              </p>
              
              <p>
                Alokasi belanja APBD merupakan amanah konstitusi yang wajib diawasi secara ketat. Efisiensi,
                keberpihakan pada kelompok rentan, serta percepatan infrastruktur dasar di tingkat pedesaan menjadi
                tiga pilar utama yang terus kami suarakan dalam setiap rapat kerja komisi.
              </p>

              <blockquote className="my-8 p-6 sm:p-8 rounded-3xl bg-[#F5EFE6] border-l-4 border-[#D47A6A] text-[#332A26] font-serif text-lg sm:text-xl italic leading-relaxed">
                “Tugas pokok wakil rakyat bukan sekadar menyetujui anggaran, melainkan memastikan anggaran tersebut benar-benar melahirkan kesejahteraan bagi masyarakat.”
              </blockquote>

              <h3 className="font-serif font-bold text-2xl text-[#332A26] pt-2">
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
          <div className="pt-8 border-t border-[#EDE5DA] flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C7D73]">
              Bagikan Telaah Ini:
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#EDE5DA] text-xs font-semibold text-[#332A26] inline-flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(article?.title || 'Risalah')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#EDE5DA] text-xs font-semibold text-[#332A26] inline-flex items-center gap-2 transition-colors shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar: Author Box */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="p-8 rounded-3xl bg-white border border-[#EDE5DA] shadow-sm space-y-4">
            <img
              src={info.photoUrl}
              alt={info.officialFullName}
              className="w-20 h-20 rounded-full object-cover object-top border-2 border-[#D47A6A]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
              }}
            />
            <div>
              <h4 className="font-serif font-bold text-lg text-[#332A26]">
                {info.officialFullName}
              </h4>
              <p className="text-xs text-[#D47A6A] font-bold mt-0.5">
                {info.legislativeLevel} · {info.party}
              </p>
            </div>
            <p className="text-xs text-[#7A6B63] leading-relaxed">
              Mewakili konstituen {info.dapil}. Berkomitmen penuh pada transparansi tata kelola anggaran dan advokasi perda berkeadilan.
            </p>
            <Link
              href={href('/kontak')}
              className="w-full py-3 rounded-full bg-[#D47A6A] hover:bg-[#B85E4E] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors shadow"
            >
              <span>Kirim Tanggapan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

      </div>

      {/* ─── ARTIKEL TERKAIT ─── */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="pt-12 border-t border-[#EDE5DA]">
          <h3 className="font-serif font-bold text-2xl text-[#332A26] mb-6">
            Artikel Terkait Lainnya
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.slice(0, 3).map((rel: any, idx: number) => (
              <Link
                key={rel.id || idx}
                href={href(`/artikel/${rel.slug || rel.id}`)}
                className="group p-6 rounded-3xl bg-white border border-[#EDE5DA] hover:shadow-md transition-all"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D47A6A]">
                  {getArticleCategory(rel)}
                </span>
                <h4 className="mt-1 font-serif font-bold text-base text-[#332A26] group-hover:text-[#D47A6A] transition-colors line-clamp-2">
                  {rel.title}
                </h4>
                <p className="mt-2 text-xs text-[#7A6B63] line-clamp-2 leading-relaxed">
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
