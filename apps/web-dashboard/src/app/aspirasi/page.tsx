'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  Users,
  ShieldCheck,
  Loader2,
  Inbox,
  MessageSquare,
  Lock,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';

import { AspirasiTabSwitcher } from '@/components/aspirasi/AspirasiTabSwitcher';
import { AspirasiFilters } from '@/components/aspirasi/AspirasiFilters';
import { AspirasiCard } from '@/components/aspirasi/AspirasiCard';
import { AspirasiDetailModal } from '@/components/aspirasi/AspirasiDetailModal';
import { CommentStatsGrid } from '@/components/studio/comments/CommentStatsGrid';
import { AspirasiCommentFilters } from '@/components/aspirasi/AspirasiCommentFilters';
import { CommentModerationCard } from '@/components/aspirasi/CommentModerationCard';

function AspirasiContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'comments' ? 'COMMENTS' : 'INBOX';

  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [inbox, setInbox] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Master Tab Navigator: 'INBOX' | 'COMMENTS'
  const [activeTab, setActiveTab] = useState<'INBOX' | 'COMMENTS'>(initialTab);

  // Filter & Search untuk Inbox Aspirasi
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter & Search untuk Moderasi Komentar
  const [commentStatusFilter, setCommentStatusFilter] = useState('ALL');
  const [commentSearch, setCommentSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modal Konfirmasi Hapus Komentar
  const [commentToDelete, setCommentToDelete] = useState<any | null>(null);

  // Modal Detail Kasus Aspirasi
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, b, list, comms] = await Promise.all([
          ApiClient.request<any>('/auth/me'),
          ApiClient.request<any>('/billing/status'),
          ApiClient.request<any[]>('/constituent/inbox'),
          ApiClient.request<any[]>('/comments/moderation').catch(() => []),
        ]);

        setProfile(p);
        setBilling(b);
        setInbox(Array.isArray(list) ? list : (list as any)?.data || []);
        setComments(Array.isArray(comms) ? comms : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function reloadComments() {
    try {
      const comms = await ApiClient.request<any[]>('/comments/moderation');
      setComments(Array.isArray(comms) ? comms : []);
    } catch (err) {
      console.error(err);
    }
  }

  const isUnpaid = billing?.subscriptionStatus !== 'ACTIVE';

  async function handleStatusChange(id: string, newStatus: string) {
    if (isUnpaid) {
      toast({
        type: 'error',
        title: 'Aksi Terkunci (Mode Pratinjau)',
        description: 'Pembaruan status disposisi memerlukan lisensi aktif.',
      });
      return;
    }

    setUpdatingId(id);
    try {
      await ApiClient.request<any>(`/constituent/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      setInbox((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );

      if (selectedItem && selectedItem.id === id) {
        setSelectedItem({ ...selectedItem, status: newStatus });
      }

      toast({
        type: 'success',
        title: 'Status Diperbarui',
        description: `Status tindak lanjut aduan diubah menjadi ${newStatus}.`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memperbarui Status',
        description: err.message || 'Terjadi gangguan.',
      });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleModerateComment(commentId: string, newStatus: string) {
    if (isUnpaid) {
      toast({
        type: 'error',
        title: 'Moderasi Terkunci (Mode Pratinjau)',
        description: 'Persetujuan atau penolakan komentar publik memerlukan lisensi aktif.',
      });
      return;
    }

    setActionLoadingId(commentId);
    try {
      await ApiClient.request<any>(`/comments/${commentId}/moderate`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, status: newStatus } : c))
      );

      const statusLabels: Record<string, string> = {
        PUBLISHED: 'ditayangkan di portal publik',
        HIDDEN: 'disembunyikan dari portal publik',
        FLAGGED_SPAM: 'ditandai sebagai spam',
      };

      toast({
        type: 'success',
        title: 'Moderasi Berhasil',
        description: `Komentar berhasil ${statusLabels[newStatus] || newStatus}. Penulis komentar tidak akan menerima notifikasi status ini.`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memoderasi Komentar',
        description: err.message || 'Terjadi kendala sistem saat memproses moderasi komentar.',
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  function handleDeleteComment(comment: any) {
    if (isUnpaid) {
      toast({
        type: 'error',
        title: 'Aksi Terkunci (Mode Pratinjau)',
        description: 'Penghapusan komentar publik memerlukan lisensi aktif.',
      });
      return;
    }

    setCommentToDelete(comment);
  }

  async function handleConfirmDelete() {
    if (!commentToDelete) return;
    const commentId = commentToDelete.id;

    setActionLoadingId(commentId);
    try {
      await ApiClient.request<any>(`/comments/${commentId}`, {
        method: 'DELETE',
      });

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentToDelete(null);

      toast({
        type: 'success',
        title: 'Komentar Dihapus',
        description: 'Komentar berhasil dihapus permanen. Warga yang bersangkutan tidak diberi tahu.',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menghapus Komentar',
        description: err.message || 'Terjadi kendala saat menghapus komentar.',
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  // Filtered lists
  const filteredInbox = inbox.filter((item) => {
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchSearch =
      searchQuery === '' ||
      item.trackingTicketCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.districtKecamatan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.aspirationMessage?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchCategory && matchSearch;
  });

  const filteredComments = comments.filter((c) => {
    const matchStatus = commentStatusFilter === 'ALL' || c.status === commentStatusFilter;
    const matchSearch =
      commentSearch === '' ||
      c.commentText?.toLowerCase().includes(commentSearch.toLowerCase()) ||
      c.citizen?.fullName?.toLowerCase().includes(commentSearch.toLowerCase()) ||
      c.articleTitle?.toLowerCase().includes(commentSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPublished = comments.filter((c) => c.status === 'PUBLISHED').length;
  const totalHidden = comments.filter((c) => c.status === 'HIDDEN').length;
  const totalSpam = comments.filter((c) => c.status === 'FLAGGED_SPAM').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0D14]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

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

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 transition-all duration-300">
          {/* HEADER NAVIGASI MINIMAL (HEADERLESS) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* BREADCRUMB MINIMAL */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-700 dark:text-slate-200 font-extrabold">Suara & Aspirasi Warga</span>
            </Link>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-green-50 dark:bg-emerald-950/40 border border-green-200 dark:border-emerald-800 text-green-800 dark:text-emerald-300 text-xs font-bold shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600 dark:text-emerald-400 shrink-0" />
                <span>Privasi Data Aman (UU PDP)</span>
              </div>
            </div>
          </div>

          {/* Banner Mode Pratinjau */}
          {isUnpaid && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm">Mode Pratinjau (Aksi & Disposisi Terkunci)</h4>
                  <p className="text-[11px] text-amber-700">
                    Anda dapat membaca aspirasi warga dan melihat sistem pemetaan tiket. Untuk merespons aspirasi atau memoderasi komentar publik, silakan aktifkan lisensi.
                  </p>
                </div>
              </div>
              <Link href="/billing">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs shrink-0 font-bold">
                  Aktifkan Lisensi
                </Button>
              </Link>
            </div>
          )}

          {/* Segmented Card Switcher (Tab Interaktif) */}
          <AspirasiTabSwitcher
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (tab === 'COMMENTS') reloadComments();
            }}
            inboxCount={inbox.length}
            commentsCount={comments.length}
          />

          {/* TAB 1: INBOX ASPIRASI & ADUAN */}
          {activeTab === 'INBOX' && (
            <div className="space-y-4">
              <AspirasiFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
              />

              {filteredInbox.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800">
                  <Inbox className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-white">Tidak Ada Aduan Ditemukan</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                    Belum ada pesan konstituen yang cocok dengan filter pencarian Anda.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredInbox.map((item) => (
                    <AspirasiCard
                      key={item.id}
                      item={item}
                      onOpenDetail={setSelectedItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MODERASI KOMENTAR PUBLIK */}
          {activeTab === 'COMMENTS' && (
            <div className="space-y-4">
              <CommentStatsGrid
                totalPublished={totalPublished}
                totalHidden={totalHidden}
                totalSpam={totalSpam}
              />

              <AspirasiCommentFilters
                commentSearch={commentSearch}
                setCommentSearch={setCommentSearch}
                commentStatusFilter={commentStatusFilter}
                setCommentStatusFilter={setCommentStatusFilter}
                totalComments={filteredComments.length}
              />

              {filteredComments.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800">
                  <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-white">Belum Ada Komentar Sesuai Filter</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                    Seluruh komentar warga pada artikel dewan akan tercantum di sini untuk peninjauan.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredComments.map((c) => (
                    <CommentModerationCard
                      key={c.id}
                      comment={c}
                      actionLoadingId={actionLoadingId}
                      onModerate={handleModerateComment}
                      onDelete={handleDeleteComment}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Detail Aduan */}
          <AspirasiDetailModal
            selectedItem={selectedItem}
            onClose={() => setSelectedItem(null)}
            onStatusChange={handleStatusChange}
            updatingId={updatingId}
            representativeName={profile?.fullName}
          />

          {/* Modal Konfirmasi Hapus Komentar (Pengganti window.confirm) */}
          <Modal
            isOpen={Boolean(commentToDelete)}
            onClose={() => {
              if (!actionLoadingId) setCommentToDelete(null);
            }}
            title="Konfirmasi Hapus Komentar"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 bg-red-50/80 dark:bg-red-950/30 rounded-2xl border border-red-100 dark:border-red-900/40">
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-red-950 dark:text-red-200">
                    Hapus komentar ini secara permanen?
                  </p>
                  <p className="text-red-700/90 dark:text-red-300/90 leading-relaxed">
                    Tindakan ini tidak dapat dibatalkan. Komentar akan dihapus dari basis data dan tidak akan lagi muncul di artikel publik.
                  </p>
                </div>
              </div>

              {commentToDelete && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {commentToDelete.citizen?.fullName || 'Warga'}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 truncate max-w-[200px]">
                      &ldquo;{commentToDelete.articleTitle}&rdquo;
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-white italic line-clamp-3 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                    &ldquo;{commentToDelete.commentText}&rdquo;
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100/80 flex items-center gap-2 text-xs text-blue-800">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Privasi Terjaga:</strong> Warga yang berkomentar tidak akan diberi tahu bahwa komentarnya dihapus.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  disabled={Boolean(actionLoadingId)}
                  onClick={() => setCommentToDelete(null)}
                  className="font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  disabled={Boolean(actionLoadingId)}
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl gap-1.5 shadow-xs cursor-pointer"
                >
                  {actionLoadingId ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ya, Hapus Komentar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Modal>
        </main>
      </div>
    </div>
  );
}

export default function AspirasiPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070A12]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      }
    >
      <AspirasiContent />
    </Suspense>
  );
}
