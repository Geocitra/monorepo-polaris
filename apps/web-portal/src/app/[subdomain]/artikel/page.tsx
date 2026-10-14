import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchPortalData } from '@/lib/api';
import { BookOpen, ArrowRight, MessageSquare, ArrowLeft } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) return { title: 'Katalog Artikel - POLARIS' };

  return {
    title: `Katalog Artikel & Telaah Kebijakan - ${data.member.fullName}`,
    description: `Arsip lengkap publikasi pemikiran, risalah kebijakan, dan telaah regulasi ${data.member.fullName}.`,
  };
}

export default async function ArtikelIndexPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const data = await fetchPortalData(subdomain);
  if (!data) notFound();

  const { member, recentArticles = [] } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* HEADER & BREADCRUMB */}
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Publikasi Pemikiran & Kajian Kebijakan</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Katalog Artikel
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Koleksi tulisan analisis, telaah peraturan perundang-undangan, dan gagasan strategis resmi dari {member.fullName}.
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
            Total {recentArticles.length} Publikasi Aktif
          </span>
        </div>
      </div>

      {/* ARTIKEL GRID */}
      {recentArticles.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center text-sm text-slate-400 italic">
          Belum ada artikel publikasi yang diterbitkan saat ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentArticles.map((article: any, index: number) => {
            const thumbnail =
              article.thumbnailUrl ||
              article.featuredImageUrl ||
              (index === 0
                ? '/images/showcase-artikel-pertanian.jpg'
                : index === 1
                ? '/images/showcase-infografis-apbd.jpg'
                : '/images/showcase-poster-surya.jpg');

            const dateLabel = article.publishedAt
              ? formatDateIndonesian(article.publishedAt)
              : '13 Oktober 2026';

            const sector = article.sector || (index === 0 ? 'Ekonomi' : index === 1 ? 'Infrastruktur' : 'Pendidikan');

            return (
              <article
                key={article.id || index}
                className="group rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Foto Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 left-3 bg-[#96702c]/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs shadow-sm">
                      {dateLabel}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <span className="text-[#96702c] font-black">|</span>
                      <span>{sector}</span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 group-hover:text-[#96702c] transition-colors line-clamp-2 leading-snug">
                      <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
                    </h2>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{article.commentCount || 0} Tanggapan Warga</span>
                  </div>

                  <Link
                    href={`/artikel/${article.slug}`}
                    className="font-bold text-[#96702c] group-hover:text-[#836125] flex items-center gap-1 transition"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
