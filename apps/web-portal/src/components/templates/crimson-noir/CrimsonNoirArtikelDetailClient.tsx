'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Copy, Check, MessageCircle, ArrowRight } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';
import { CrimsonButton } from './CrimsonNoirShell';
import { getCrimsonMemberInfo, useCrimsonHref, articleImage, articleCategory, articleExcerpt } from './utils';

interface CrimsonNoirArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function CrimsonNoirArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: CrimsonNoirArtikelDetailClientProps) {
  const info = getCrimsonMemberInfo(member, theme, subdomain);
  const href = useCrimsonHref(subdomain);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="max-w-[1000px] mx-auto px-6 lg:px-10 py-12 sm:py-16 space-y-10">
      <header className="space-y-5">
        <Link href={href('/artikel')} className="inline-flex items-center gap-2 text-[11px] font-semibold text-white/60 hover:text-white">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Artikel
        </Link>
        <p className="text-[#E04848] font-bold text-sm">{articleCategory(article)}</p>
        <h1 className="font-outfit font-extrabold text-3xl sm:text-5xl text-white leading-[1.1] tracking-tight">{article?.title}</h1>
        {articleExcerpt(article) && <p className="text-sm text-white/60 max-w-3xl leading-relaxed">{articleExcerpt(article)}</p>}
        <div className="pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={info.photoUrl} alt={info.officialFullName} className="w-10 h-10 rounded-full object-cover object-top grayscale bg-[#D62828]" />
            <div>
              <div className="text-xs font-bold text-white">{info.officialFullName}</div>
              <div className="text-[10px] text-white/50">{info.party} • {info.dapil}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-white/50">
            <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDateIndonesian(article?.publishedAt || article?.createdAt || new Date())}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{article?.readingTime || '5 menit baca'}</span>
          </div>
        </div>
      </header>

      <div className="rounded-[4px] overflow-hidden border border-white/5 bg-black max-h-[520px]">
        <img src={articleImage(article)} alt={article?.title || 'Cover'} className="w-full h-full max-h-[520px] object-cover" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 text-sm text-white/75 leading-[1.9] space-y-5">
          {article?.content ? (
            <div
              className="prose prose-invert max-w-none prose-headings:font-outfit prose-headings:text-white prose-a:text-[#E04848] prose-blockquote:border-[#D62828]"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <>
              <p>
                Kebijakan publik yang akuntabel senantiasa berakar dari kehendak rakyat dan data riil lapangan. Perumusan
                regulasi anggaran maupun peraturan daerah tidak boleh sekadar rutinitas administratif, melainkan instrumen
                nyata untuk menjawab kebutuhan masyarakat di akar rumput.
              </p>
              <blockquote className="my-6 pl-5 border-l-4 border-[#D62828] font-outfit text-lg font-bold text-white">
                “Regulasi terbaik adalah yang paling nyata terasa manfaatnya bagi rakyat.”
              </blockquote>
              <h2 className="font-outfit text-xl font-extrabold text-white pt-2">Langkah Strategis ke Depan</h2>
              <p>
                Kami mendorong penguatan sistem pengaduan digital agar setiap laporan warga ditindaklanjuti kurang dari 72
                jam, evaluasi proporsi anggaran pendidikan dan kesehatan, serta perlindungan lahan pertanian pangan
                berkelanjutan.
              </p>
            </>
          )}

          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Bagikan:</span>
            <div className="flex gap-2">
              <button type="button" onClick={handleCopy} className="px-4 py-2 rounded-[3px] bg-[#1A1A1A] border border-white/10 text-[11px] font-semibold text-white hover:border-[#D62828] inline-flex items-center gap-1.5 cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-[#E04848]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tersalin!' : 'Salin Tautan'}
              </button>
              <a href={`https://wa.me/?text=${encodeURIComponent(article?.title || '')}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-[3px] bg-[#1A1A1A] border border-white/10 text-[11px] font-semibold text-white hover:border-[#D62828] inline-flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 p-6 rounded-[4px] bg-[#1A1A1A] border border-white/5 text-center">
            <img src={info.photoUrl} alt={info.officialFullName} className="w-20 h-20 mx-auto rounded-full object-cover object-top grayscale bg-gradient-to-br from-[#D62828] to-[#5E0B0B]" />
            <h3 className="mt-3 text-sm font-bold text-white">{info.officialFullName}</h3>
            <p className="text-[10px] text-white/50 mt-0.5">{info.legislativeLevel} • {info.party}</p>
            <p className="mt-3 text-[11px] text-white/60 leading-relaxed">Punya tanggapan atas tulisan ini? Sampaikan langsung kepada saya.</p>
            <CrimsonButton href={href('/kontak')} className="mt-4 w-full">Kirim Tanggapan</CrimsonButton>
          </div>
        </aside>
      </div>

      {relatedArticles.length > 0 && (
        <section className="pt-10 border-t border-white/10">
          <h2 className="font-outfit font-extrabold text-2xl text-white mb-6">Artikel Terkait</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.slice(0, 3).map((rel: any, idx: number) => (
              <Link key={rel.id || idx} href={href(`/artikel/${rel.slug || rel.id}`)} className="group p-5 rounded-[4px] bg-[#1A1A1A] border border-white/5 hover:border-[#D62828]/50 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E04848]">{articleCategory(rel)}</span>
                <h3 className="mt-1.5 text-sm font-bold text-white line-clamp-2 group-hover:text-[#E04848]">{rel.title}</h3>
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] text-white/50">Baca <ArrowRight className="w-3 h-3" /></span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
