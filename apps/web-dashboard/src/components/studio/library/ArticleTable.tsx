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
  FileText 
} from 'lucide-react';

interface ArticleItem {
  id: string;
  title: string;
  excerpt?: string;
  status: string;
  wordCount?: number;
  slug?: string;
  publishedAt?: string;
  createdAt?: string;
}

interface ArticleTableProps {
  articles: ArticleItem[];
  portalDomain: string;
  actionLoadingId: string | null;
  onTogglePublish: (id: string, currentStatus: string) => void;
  totalArticlesCount: number;
}

export function ArticleTable({
  articles,
  portalDomain,
  actionLoadingId,
  onTogglePublish,
  totalArticlesCount,
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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Judul & Ringkasan</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Panjang Kata</th>
              <th className="px-6 py-3.5">Tanggal</th>
              <th className="px-6 py-3.5 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {articles.map((item) => {
              const isPublished = item.status === 'PUBLISHED';
              const isActionLoading = actionLoadingId === item.id;

              return (
                <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 max-w-md">
                    <Link
                      href={`/studio/${item.id}`}
                      className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 text-sm block"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                      {item.excerpt || 'Tidak ada intisari ringkasan.'}
                    </p>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
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

                  <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                    {item.wordCount ? `${item.wordCount} kata` : '-'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                    {formatDateIndonesian(item.publishedAt || item.createdAt)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    {isPublished && item.slug && (
                      <a
                        href={`${portalDomain}/artikel/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title="Lihat di Website Publik"
                      >
                        <Globe className="h-3 w-3 text-blue-500" />
                        <span className="hidden sm:inline">Lihat</span>
                      </a>
                    )}

                    <Link
                      href={`/studio/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit</span>
                    </Link>

                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => onTogglePublish(item.id, item.status)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                        isPublished
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
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
                          <span>Terbitkan</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
