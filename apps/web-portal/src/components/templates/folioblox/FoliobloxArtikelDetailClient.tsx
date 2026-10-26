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
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface FoliobloxArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function FoliobloxArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: FoliobloxArtikelDetailClientProps) {
  const [copied, setCopied] = useState(false);

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] || 'Jonanda';

  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-ahmad-fauzi-cutout.png';

  const rawDapil = member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I';
  const dapil = rawDapil.replace(/_/g, ' ');

  const rawParty = member?.partyAffiliation || 'Fraksi Parlemen';
  const party = rawParty.replace(/_/g, ' ');

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
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const articleImage =
    article?.featuredImageUrl ||
    article?.coverUrl ||
    article?.imageUrl ||
    article?.posterUrl ||
    '/images/showcase-artikel-pertanian.jpg';

  const dateStr = formatDateIndonesian(article?.createdAt || new Date());
  const category = article?.issueCategory || article?.category || article?.categoryName || 'Kajian Kebijakan';

  return (
    <div className="py-10 sm:py-16 px-6 sm:px-10 lg:px-16 max-w-[1240px] mx-auto select-text space-y-12">
      
      {/* ─── 1. TOP METADATA & TITLE ─── */}
      <div className="space-y-6">
        
        {/* Back Link */}
        <Link
          href={getNavLinkHref('/artikel')}
          className="inline-flex items-center gap-2 text-xs font-bold text-white/60 hover:text-orange-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Katalog Risalah</span>
        </Link>

        {/* Category Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-xs font-bold text-orange-400">
          <span>{category}</span>
        </div>

        {/* Giant Outfit Black Headline */}
        <h1 className="font-outfit font-black text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-white leading-[1.08] tracking-tight">
          {article?.title}
        </h1>

        {/* Subtitle / Excerpt */}
        {article?.excerpt && (
          <p className="text-base sm:text-lg text-white/70 font-normal leading-relaxed max-w-3xl">
            {article.excerpt}
          </p>
        )}

        {/* Author Byline & Meta */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#181818] overflow-hidden border border-orange-500/40">
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                }}
              />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">
                {officialFullName}
              </div>
              <div className="text-[11px] text-white/50">
                {party} • Dapil {dapil}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-white/60 font-semibold">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              <span>{dateStr}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span>{article?.readingTime || '5 menit baca'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── 2. COVER IMAGE ─── */}
      <div className="w-full rounded-[28px] sm:rounded-[36px] overflow-hidden border border-white/10 bg-[#141414] shadow-2xl max-h-[540px]">
        <img
          src={articleImage}
          alt={article?.title || 'Cover Artikel'}
          className="w-full h-full object-cover max-h-[540px]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
          }}
        />
      </div>

      {/* ─── 3. ARTICLE PROSE BODY ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Text Content */}
        <div className="lg:col-span-8 space-y-6 text-white/80 text-base leading-[1.8] font-normal">
          {article?.content ? (
            <div
              className="prose prose-invert max-w-none prose-headings:font-outfit prose-headings:font-black prose-headings:text-white prose-a:text-orange-400"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <>
              <p className="text-lg text-white font-medium leading-relaxed">
                Kebijakan daerah yang berkeadilan hanya dapat lahir apabila perumusan aturan hukum berakar dari denyut nadi kebutuhan masyarakat konstituen di lapangan.
              </p>

              <p>
                Sebagai anggota dewan di parlemen daerah, pengawasan alokasi anggaran pendapatan dan belanja daerah (APBD)
                merupakan tanggung jawab moral tertinggi. Setiap pos pengeluaran modal daerah harus dijamin bebas dari
                inefisiensi, tepat sasaran bagi masyarakat prasejahtera, dan mendorong pertumbuhan sektor riil di tingkat akar rumput.
              </p>

              <blockquote className="my-8 p-6 rounded-2xl bg-[#141414] border-l-4 border-[#FF4500] font-outfit text-lg sm:text-xl font-bold text-white leading-relaxed">
                &ldquo;Kebijakan terbaik lahir dari keberanian mendengar nurani rakyat dan ketegasan mengawal transparansi anggaran tanpa kompromi.&rdquo;
              </blockquote>

              <h3 className="font-outfit font-black text-2xl text-white pt-4">
                Prioritas Advokasi Kebijakan Parlemen
              </h3>

              <p>
                Melalui posko reses dan forum dengar pendapat umum, kami senantiasa menghimpun masukan kritis konstituen.
                Tiga fokus utama yang kami kawal pada periode ini adalah jaminan kelayakan infrastruktur jalan sentra tani,
                kemudahan akses permodalan bagi usaha mikro, serta transparansi alokasi beasiswa pendidikan bagi putra-putri berprestasi.
              </p>
            </>
          )}

          {/* Social Share Bar */}
          <div className="pt-8 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
              Bagikan Risalah:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan'}</span>
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(article?.title || 'Risalah Parlemen')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar: Author Box & Posko Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-[28px] bg-[#141414] border border-white/10 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#181818] overflow-hidden border-2 border-orange-500/50 mb-4">
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                }}
              />
            </div>
            <h4 className="font-outfit font-black text-xl text-white">
              {officialFullName}
            </h4>
            <p className="text-xs text-orange-400 font-bold mt-1">
              {party} • Dapil {dapil}
            </p>
            <p className="text-xs text-white/60 mt-3 leading-relaxed">
              Mewakili aspirasi rakyat di Daerah Pemilihan {dapil}. Mengawal tata kelola pemerintahan yang bersih dan anggaran pro-rakyat.
            </p>
            <Link
              href={getNavLinkHref('/kontak')}
              className="mt-5 w-full py-2.5 rounded-full bg-[#FF4500] hover:bg-[#E03E00] text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-2 shadow-md"
            >
              <span>Kirim Tanggapan Aspirasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* ─── 4. RELATED ARTICLES ─── */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="pt-12 border-t border-white/10">
          <h3 className="font-outfit font-black text-2xl text-white mb-6">
            Kajian Terkait Lainnya
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.slice(0, 3).map((rel, idx) => (
              <Link
                key={rel.id || idx}
                href={getNavLinkHref(`/artikel/${rel.slug || idx + 1}`)}
                className="group bg-[#141414] rounded-2xl border border-white/10 p-5 hover:border-orange-500/50 transition-all"
              >
                <h4 className="font-outfit font-black text-base text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                  {rel.title}
                </h4>
                <p className="text-xs text-white/60 mt-2 line-clamp-2">
                  {rel.excerpt || rel.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
