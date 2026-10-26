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
  Send,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface NayaEditorialArtikelDetailClientProps {
  article: any;
  member: any;
  theme?: any;
  subdomain?: string;
  relatedArticles?: any[];
}

export function NayaEditorialArtikelDetailClient({
  article,
  member,
  theme,
  subdomain,
  relatedArticles = [],
}: NayaEditorialArtikelDetailClientProps) {
  const [copied, setCopied] = useState(false);

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B, M.Si.';
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
      
      {/* ─── 1. TOP HEADER & METADATA ─── */}
      <div className="space-y-6">
        
        {/* Back Link */}
        <Link
          href={getNavLinkHref('/artikel')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#555A47] hover:text-[#24271D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Katalog Risalah &amp; Artikel</span>
        </Link>

        {/* Category Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#D8D3C4] bg-[#EFECE1]/80 text-[#606453] text-xs font-semibold">
          <span>{category}</span>
        </div>

        {/* Giant Cormorant Serif Headline */}
        <h1 className="font-cormorant text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-normal tracking-[-0.03em] text-[#24271D] leading-[1.08]">
          {article?.title}
        </h1>

        {/* Subtitle / Excerpt */}
        {article?.excerpt && (
          <p className="text-base sm:text-lg text-[#6E7162] font-normal leading-relaxed max-w-3xl">
            {article.excerpt}
          </p>
        )}

        {/* Author Byline & Meta */}
        <div className="pt-4 border-t border-[#DFDACB] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EAE6D9] overflow-hidden border border-[#DCD7CA]">
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
              <div className="text-xs sm:text-sm font-bold text-[#24271D]">
                {officialFullName}
              </div>
              <div className="text-[11px] text-[#7A7E6E]">
                {party} • Dapil {dapil}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#7A7E6E] font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateStr}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{article?.readingTime || '5 menit baca'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── 2. PROMINENT ARTICLE COVER IMAGE ─── */}
      <div className="w-full rounded-[28px] sm:rounded-[36px] overflow-hidden border border-[#DCD7CA] bg-[#EAE6DB] shadow-lg max-h-[540px]">
        <img
          src={articleImage}
          alt={article?.title || 'Cover Artikel'}
          className="w-full h-full object-cover max-h-[540px]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/showcase-artikel-pertanian.jpg';
          }}
        />
      </div>

      {/* ─── 3. EDITORIAL PROSE BODY CONTENT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Prose */}
        <div className="lg:col-span-8 space-y-6 text-[#35382B] text-base leading-[1.8] font-normal">
          {article?.content ? (
            <div
              className="prose prose-stone max-w-none prose-headings:font-cormorant prose-headings:text-[#24271D] prose-a:text-[#4E5340]"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <>
              <p className="first-letter:font-cormorant first-letter:text-6xl first-letter:font-bold first-letter:text-[#24271D] first-letter:float-left first-letter:mr-3 first-letter:leading-none">
                Kebijakan publik yang akuntabel senantiasa berakar dari kehendak rakyat dan data riil lapangan.
                Dalam dinamika pembangunan daerah, perumusan regulasi anggaran maupun peraturan daerah (Perda)
                tidak boleh sekadar menjadi rutinitas administratif, melainkan instrumen nyata untuk menjawab
                kebutuhan mendesak masyarakat di tingkat akar rumput.
              </p>

              <p>
                Sebagai wakil rakyat di parlemen daerah, pengawasan terhadap alokasi belanja modal menjadi
                sangat krusial. Anggaran Pendapatan dan Belanja Daerah (APBD) merupakan amanah rakyat yang harus
                dipertanggungjawabkan setiap rupiahnya. Efisiensi, transparansi lelang, dan ketepatan sasaran
                program merupakan tiga pilar utama yang terus kami kawal dalam setiap rapat dengar pendapat komisi.
              </p>

              <blockquote className="my-8 p-6 rounded-2xl bg-[#ECE7DC] border-l-4 border-[#4E5340] italic font-cormorant text-xl text-[#24271D] leading-relaxed">
                &ldquo;Regulasi terbaik bukan yang paling tebal dokumennya, melainkan yang paling nyata terasa manfaatnya bagi perbaikan taraf hidup masyarakat dan keadilan sosial.&rdquo;
              </blockquote>

              <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#24271D] pt-4">
                Langkah Strategis Penguatan Hak Konstituen
              </h3>

              <p>
                Ada tiga agenda utama yang kami dorong dalam masa sidang ini. Pertama, penguatan sistem digital
                pengaduan warga agar setiap laporan infrastruktur rusak mendapatkan disposisi dan tindak lanjut
                dalam waktu kurang dari 72 jam. Kedua, evaluasi proporsi anggaran pendidikan dan kesehatan agar
                benar-benar dirasakan oleh keluarga prasejahtera. Ketiga, proteksi lahan pertanian pangan berkelanjutan
                guna menjaga kedaulatan pangan wilayah kita dari alih fungsi lahan yang tak terkendali.
              </p>
            </>
          )}

          {/* Social Share Bar */}
          <div className="pt-8 border-t border-[#DFDACB] flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs font-bold text-[#555A47] uppercase tracking-wider">
              Bagikan Kajian Kebijakan:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-full bg-[#EFECE2] hover:bg-[#E5E1D5] text-xs font-semibold text-[#24271D] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan'}</span>
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(article?.title || 'Kajian Risalah')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-[#EFECE2] hover:bg-[#E5E1D5] text-xs font-semibold text-[#24271D] transition-colors inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar: Author Box & Posko Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-[28px] bg-white border border-[#E5E0D5] shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#EAE6D9] overflow-hidden border-2 border-[#DCD7CA] mb-4">
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                }}
              />
            </div>
            <h4 className="font-cormorant text-xl font-bold text-[#24271D]">
              {officialFullName}
            </h4>
            <p className="text-xs text-[#6F7363] mt-1 font-medium">
              Anggota Parlemen • {party}
            </p>
            <p className="text-xs text-[#666A59] mt-3 leading-relaxed">
              Mewakili konstituen di {dapil}. Berkomitmen pada transparansi tata kelola anggaran dan advokasi perda berkeadilan.
            </p>
            <Link
              href={getNavLinkHref('/kontak')}
              className="mt-5 w-full py-2.5 rounded-full bg-[#272A20] text-white text-xs font-semibold hover:bg-[#3D4231] transition-all inline-flex items-center justify-center gap-2"
            >
              <span>Kirim Tanggapan / Aspirasi</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>

      {/* ─── 4. RELATED ARTICLES (IF AVAILABLE) ─── */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="pt-12 border-t border-[#DFDACB]">
          <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#24271D] mb-6">
            Kajian &amp; Risalah Terkait Lainnya
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.slice(0, 3).map((rel, idx) => (
              <Link
                key={rel.id || idx}
                href={getNavLinkHref(`/artikel/${rel.slug || idx + 1}`)}
                className="group bg-white rounded-2xl border border-[#E5E0D5] p-5 hover:border-[#CCD1BF] hover:shadow-md transition-all"
              >
                <h4 className="font-cormorant text-lg font-bold text-[#24271D] group-hover:text-[#4E5340] transition-colors line-clamp-2">
                  {rel.title}
                </h4>
                <p className="text-xs text-[#707464] mt-2 line-clamp-2">
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
