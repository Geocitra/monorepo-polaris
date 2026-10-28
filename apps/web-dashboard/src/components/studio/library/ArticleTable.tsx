'use client';

import Link from 'next/link';
import { formatDateIndonesian } from '@/lib/utils';
import { 
  Edit3, 
  Globe, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  FileText,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface ArticleItem {
  id: string;
  title: string;
  excerpt?: string;
  status: string;
  wordCount?: number;
  slug?: string;
  contentType?: 'ARTICLE' | 'INFOGRAPHIC' | 'TERPADU';
  thumbnailUrl?: string | null;
  hasSocialPack?: boolean;
  publishedAt?: string;
  createdAt?: string;
}

interface ArticleTableProps {
  articles: ArticleItem[];
  portalDomain: string;
  actionLoadingId: string | null;
  onTogglePublish: (id: string, currentStatus: string) => void;
  onDeleteArticle: (article: ArticleItem) => void;
  onViewVisual: (article: ArticleItem) => void;
  totalArticlesCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalFilteredCount: number;
  onPageChange: (page: number) => void;
}

export function ArticleTable({
  articles,
  portalDomain,
  actionLoadingId,
  onTogglePublish,
  onDeleteArticle,
  onViewVisual,
  totalArticlesCount,
  currentPage,
  totalPages,
  pageSize,
  totalFilteredCount,
  onPageChange,
}: ArticleTableProps) {
  if (articles.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center space-y-3">
        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
            {totalArticlesCount === 0 ? 'Belum Ada Konten yang Dibuat' : 'Tidak Ditemukan Konten'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {totalArticlesCount === 0
              ? 'Gunakan Studio Konten AI untuk membuat artikel kebijakan, poster visual, atau kampanye terpadu.'
              : 'Tidak ada karya yang cocok dengan kata kunci atau filter yang Anda pilih.'}
          </p>
        </div>

        {totalArticlesCount === 0 && (
          <div className="pt-2">
            <Link href="/studio">
              <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity shadow-xs cursor-pointer">
                Mulai Buat Konten Sekarang
              </button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalFilteredCount);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Konten & Format</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Panjang / Format</th>
              <th className="px-5 py-3.5">Tanggal</th>
              <th className="px-5 py-3.5 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {articles.map((item) => {
              const isPublished = item.status === 'PUBLISHED';
              const isActionLoading = actionLoadingId === item.id;
              const isInfographic = item.contentType === 'INFOGRAPHIC';
              const isTerpadu = item.contentType === 'TERPADU';

              return (
                <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Kolom Judul & Format */}
                  <td className="px-5 py-3.5 max-w-md">
                    <div className="flex items-start gap-3">
                      {/* Thumbnail atau Ikon Representatif */}
                      {item.thumbnailUrl ? (
                        <div
                          onClick={() => onViewVisual(item)}
                          className="h-11 w-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700 cursor-pointer group/thumb relative"
                          title="Klik untuk pratinjau visual"
                        >
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="h-full w-full object-cover group-hover/thumb:scale-110 transition-transform duration-200"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <div className={`h-11 w-11 rounded-xl shrink-0 flex items-center justify-center border ${
                          isInfographic
                            ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                            : isTerpadu
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                        }`}>
                          {isInfographic ? (
                            <ImageIcon className="w-5 h-5" />
                          ) : isTerpadu ? (
                            <Sparkles className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                      )}

                      {/* Detail Judul & Badge Format */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Badge Tipe Konten */}
                          {isInfographic ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              <ImageIcon className="w-2.5 h-2.5" />
                              <span>Infografis</span>
                            </span>
                          ) : isTerpadu ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Kampanye Terpadu</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <FileText className="w-2.5 h-2.5" />
                              <span>Artikel Opini</span>
                            </span>
                          )}

                          {isInfographic ? (
                            <button
                              type="button"
                              onClick={() => onViewVisual(item)}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 truncate text-xs text-left"
                            >
                              {item.title}
                            </button>
                          ) : (
                            <Link
                              href={`/studio/${item.id}`}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 truncate text-xs block"
                            >
                              {item.title}
                            </Link>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                          {item.excerpt || 'Tidak ada intisari ringkasan.'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Kolom Status Tayang */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isPublished
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {isPublished ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Tayang di Web</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          <span>Draf</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Kolom Panjang Kata / Dimensi Format */}
                  <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-600 dark:text-slate-200">
                    {isInfographic ? (
                      <span className="text-[11px] font-sans font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-800">
                        Visual HD (16:9)
                      </span>
                    ) : item.wordCount ? (
                      `${item.wordCount.toLocaleString('id-ID')} kata`
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* Kolom Tanggal */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-300">
                    {formatDateIndonesian(item.publishedAt || item.createdAt)}
                  </td>

                  {/* Kolom Tindakan */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-1.5">
                    {/* Tombol Lihat Web Publik */}
                    {isPublished && item.slug && (
                      <a
                        href={`${portalDomain}/artikel/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title="Lihat di Website Publik Anda"
                      >
                        <Globe className="h-3 w-3 text-blue-500" />
                        <span className="hidden sm:inline">Web</span>
                      </a>
                    )}

                    {/* Tombol Edit / Lihat Visual Berbasis Tipe */}
                    {isInfographic ? (
                      <button
                        type="button"
                        onClick={() => onViewVisual(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                        title="Pratinjau visual & unduh infografis"
                      >
                        <Eye className="h-3 w-3 text-purple-600" />
                        <span>Visual</span>
                      </button>
                    ) : (
                      <Link
                        href={`/studio/${item.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Buka Editor Naskah"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit</span>
                      </Link>
                    )}

                    {/* Tombol Toggle Terbitkan / Tarik */}
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => onTogglePublish(item.id, item.status)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                        isPublished
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                      title={isPublished ? 'Tarik dari tayangan website publik' : 'Tayangkan ke website publik'}
                    >
                      {isActionLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isPublished ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Tarik</span>
                        </>
                      ) : (
                        <>
                          <Globe className="h-3 w-3" />
                          <span>Tayang</span>
                        </>
                      )}
                    </button>

                    {/* Tombol Hapus Konten (Trash) */}
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => onDeleteArticle(item)}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-800/80 transition-colors cursor-pointer"
                      title="Hapus konten ini secara permanen"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER BAR: PAGINATION KONTEN */}
      {totalFilteredCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Menampilkan <span className="font-bold text-slate-800 dark:text-slate-200">{startRecord}</span> -{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{endRecord}</span> dari{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{totalFilteredCount}</span> konten
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tombol Sebelumnya */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            {/* Indikator Halaman Aktif */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Tampilkan hanya halaman sekitar aktif jika halaman banyak
                if (
                  totalPages > 7 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages &&
                  Math.abs(pageNum - currentPage) > 1
                ) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return (
                      <span key={pageNum} className="text-slate-400 px-1 text-xs">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Tombol Selanjutnya */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
