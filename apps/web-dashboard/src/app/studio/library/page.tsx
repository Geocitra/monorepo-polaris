'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useToast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';
import { 
  Plus, 
  Loader2, 
  ArrowLeft, 
  AlertTriangle, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Download 
} from 'lucide-react';
import { 
  ArticleFilters, 
  StatusFilter, 
  FormatFilter 
} from '@/components/studio/library/ArticleFilters';
import { 
  ArticleTable, 
  ArticleItem 
} from '@/components/studio/library/ArticleTable';
import { getPortalUrl } from '@/lib/urls';

export default function ArticleLibraryPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>('ALL');
  const [activeFormatFilter, setActiveFormatFilter] = useState<FormatFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states: Hapus & Preview Visual
  const [itemToDelete, setItemToDelete] = useState<ArticleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [visualPreviewItem, setVisualPreviewItem] = useState<ArticleItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, b, list] = await Promise.all([
          ApiClient.request<any>('/auth/me'),
          ApiClient.request<any>('/billing/status').catch(() => null),
          ApiClient.request<ArticleItem[]>('/studio/articles').catch(() => []),
        ]);

        setProfile(p);
        setBilling(b);
        setArticles(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load library:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Reset pagination ke halaman 1 saat filter atau pencarian berubah
  function handleStatusFilterChange(filter: StatusFilter) {
    setActiveStatusFilter(filter);
    setCurrentPage(1);
  }

  function handleFormatFilterChange(filter: FormatFilter) {
    setActiveFormatFilter(filter);
    setCurrentPage(1);
  }

  function handleSearchChange(query: string) {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  async function handleTogglePublish(articleId: string, currentStatus: string) {
    const isPublished = currentStatus === 'PUBLISHED';
    const endpoint = isPublished
      ? `/studio/articles/${articleId}/unpublish`
      : `/studio/articles/${articleId}/publish`;

    setActionLoadingId(articleId);

    try {
      await ApiClient.request<any>(endpoint, { method: 'POST' });
      setArticles(
        articles.map((a) =>
          a.id === articleId ? { ...a, status: isPublished ? 'UNPUBLISHED' : 'PUBLISHED' } : a
        )
      );
      toast({
        type: isPublished ? 'warning' : 'success',
        title: isPublished ? 'Ditarik dari Website' : 'Berhasil Ditayangkan!',
        description: isPublished 
          ? 'Artikel/konten tidak lagi muncul di website publik.' 
          : 'Artikel/konten resmi tayang di website publik Anda.',
      });
    } catch (err: any) {
      toast({ type: 'error', title: 'Gagal Mengubah Status', description: err.message || 'Terjadi kendala.' });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      await ApiClient.request<any>(`/studio/articles/${itemToDelete.id}`, {
        method: 'DELETE',
      });

      setArticles((prev) => prev.filter((a) => a.id !== itemToDelete.id));

      try {
        localStorage.removeItem(`polaris_terpadu_iterations_${itemToDelete.id}`);
        localStorage.removeItem(`polaris_terpadu_chat_${itemToDelete.id}`);
      } catch {}

      toast({
        type: 'success',
        title: 'Konten Dihapus',
        description: `"${itemToDelete.title}" telah dihapus secara permanen.`,
      });
      setItemToDelete(null);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menghapus Konten',
        description: err.message || 'Terjadi gangguan saat menghapus dari server.',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCopyImageUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast({
      type: 'info',
      title: 'Tautan Disalin',
      description: 'Tautan gambar publik telah disalin ke clipboard.',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0D14]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Kalkulasi agregat filter
  const publishedCount = articles.filter((a) => a.status === 'PUBLISHED').length;
  const draftCount = articles.filter((a) => a.status !== 'PUBLISHED').length;
  const articleCount = articles.filter((a) => a.contentType === 'ARTICLE' || (!a.contentType && (a.wordCount || 0) > 0)).length;
  const infographicCount = articles.filter((a) => a.contentType === 'INFOGRAPHIC').length;
  const terpaduCount = articles.filter((a) => a.contentType === 'TERPADU').length;

  // Penyaringan Konten
  const filteredArticles = articles.filter((item) => {
    // 1. Filter Status
    const matchesStatus =
      activeStatusFilter === 'ALL' ||
      (activeStatusFilter === 'PUBLISHED' && item.status === 'PUBLISHED') ||
      (activeStatusFilter === 'DRAFT' && item.status !== 'PUBLISHED');

    // 2. Filter Format
    let matchesFormat = true;
    if (activeFormatFilter === 'ARTICLE') {
      matchesFormat = item.contentType === 'ARTICLE' || (!item.contentType && (item.wordCount || 0) > 0);
    } else if (activeFormatFilter === 'INFOGRAPHIC') {
      matchesFormat = item.contentType === 'INFOGRAPHIC';
    } else if (activeFormatFilter === 'TERPADU') {
      matchesFormat = item.contentType === 'TERPADU';
    }

    // 3. Filter Pencarian
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      item.title?.toLowerCase().includes(q) ||
      item.excerpt?.toLowerCase().includes(q);

    return matchesStatus && matchesFormat && matchesSearch;
  });

  // Kalkulasi Pagination
  const totalFilteredCount = filteredArticles.length;
  const totalPages = Math.ceil(totalFilteredCount / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedArticles = filteredArticles.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const portalDomain = getPortalUrl(profile?.subdomain);

  return (
    <div className="flex min-h-screen bg-slate-100/70 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans theme-transition">
      <Sidebar subdomain={profile?.subdomain} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          fullName={profile?.fullName}
          party={profile?.partyAffiliation}
          subdomain={profile?.subdomain}
          subscriptionStatus={billing?.subscriptionStatus}
          currentPeriodEnd={billing?.currentPeriodEnd}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* HEADER NAVIGASI MINIMAL (HEADERLESS) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* BREADCRUMB MINIMAL */}
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Studio</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-700 dark:text-slate-200 font-extrabold">Pustaka Konten</span>
            </Link>

            <Link
              href="/studio"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs shadow-xs hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span> Buat Konten Baru</span>
            </Link>
          </div>

          {/* FILTER & PENCARIAN BAR */}
          <ArticleFilters
            activeStatusFilter={activeStatusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            activeFormatFilter={activeFormatFilter}
            onFormatFilterChange={handleFormatFilterChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            totalCount={articles.length}
            publishedCount={publishedCount}
            draftCount={draftCount}
            articleCount={articleCount}
            infographicCount={infographicCount}
            terpaduCount={terpaduCount}
          />

          {/* TABEL KONTEN & PAGINATION */}
          <ArticleTable
            articles={paginatedArticles}
            portalDomain={portalDomain}
            actionLoadingId={actionLoadingId}
            onTogglePublish={handleTogglePublish}
            onDeleteArticle={(article) => setItemToDelete(article)}
            onViewVisual={(article) => setVisualPreviewItem(article)}
            totalArticlesCount={articles.length}
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalFilteredCount={totalFilteredCount}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </main>
      </div>

      {/* MODAL KONFIRMASI HAPUS DENGAN MITIGASI RISIKO */}
      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => !isDeleting && setItemToDelete(null)}
        title="Konfirmasi Hapus Konten"
        description="Tindakan ini permanen dan akan membersihkan aset terkait dari database."
      >
        {itemToDelete && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Judul Konten:</span>
              <p className="font-extrabold text-slate-900 dark:text-slate-100">{itemToDelete.title}</p>
              {itemToDelete.excerpt && (
                <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-[11px] pt-1">
                  {itemToDelete.excerpt}
                </p>
              )}
            </div>

            {/* MITIGASI RISIKO KHUSUS KONTEN TAYANG PUBLIK */}
            {itemToDelete.status === 'PUBLISHED' && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-red-800 dark:text-red-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold">Peringatan Kritis: Konten Sedang Tayang di Website!</p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    Konten ini telah terbit secara publik. Menghapusnya akan membuat URL publik 
                    (<span className="font-mono">/artikel/{itemToDelete.slug}</span>) rusak atau menghasilkan error 404 bagi masyarakat yang membacanya.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Permanen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL PRATINJAU VISUAL (LIGHTBOX) INFOGRAFIS & POSTER */}
      <Modal
        isOpen={Boolean(visualPreviewItem)}
        onClose={() => setVisualPreviewItem(null)}
        title="Pratinjau Visual Infografis"
        description="Format poster definisi tinggi siap unduh & publikasi media sosial."
      >
        {visualPreviewItem && (
          <div className="space-y-4">
            {/* Gambar HD */}
            {visualPreviewItem.thumbnailUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center max-h-[380px]">
                <img
                  src={visualPreviewItem.thumbnailUrl}
                  alt={visualPreviewItem.title}
                  className="w-full h-auto max-h-[380px] object-contain"
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-400">
                Gambar visual tidak tersedia.
              </div>
            )}

            {/* Info Judul & Status */}
            <div>
              <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {visualPreviewItem.title}
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {visualPreviewItem.excerpt || 'Infografis visualisasi data kebijakan publik.'}
              </p>
            </div>

            {/* Tombol Aksi Visual */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {visualPreviewItem.thumbnailUrl && (
                <button
                  type="button"
                  onClick={() => handleCopyImageUrl(visualPreviewItem.thumbnailUrl!)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Tersalin!' : 'Salin URL Gambar'}</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                {visualPreviewItem.thumbnailUrl && (
                  <a
                    href={visualPreviewItem.thumbnailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-extrabold shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Buka File Asli</span>
                  </a>
                )}
                {visualPreviewItem.status === 'PUBLISHED' && visualPreviewItem.slug && (
                  <a
                    href={`${portalDomain}/artikel/${visualPreviewItem.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                    <span>Halaman Web</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
