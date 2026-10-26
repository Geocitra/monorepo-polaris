'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import {
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Calendar,
  Sparkles,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Users
} from 'lucide-react';
import { PortalDocumentType, PortalDocumentItemDto } from '@polaris/shared-types';

export function DocumentManager() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<PortalDocumentItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);

  // Form State
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<string>(PortalDocumentType.REPORT_TRIWULAN);
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const [resDocs, resSubs] = await Promise.all([
        ApiClient.request<PortalDocumentItemDto[]>('/cms/portal/documents').catch(() => []),
        ApiClient.request<{ total: number; subscribers: any[] }>('/cms/portal/newsletter/subscribers').catch(() => ({ total: 0, subscribers: [] })),
      ]);
      setDocuments(resDocs || []);
      setSubscriberCount(resSubs?.total || 0);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memuat Dokumen',
        description: err.message || 'Terjadi kesalahan sistem saat mengambil berkas.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) {
      toast({
        type: 'error',
        title: 'Kolom Belum Lengkap',
        description: 'Judul dan URL berkas dokumen PDF wajib diisi.',
      });
      return;
    }

    try {
      setSubmitting(true);
      await ApiClient.request('/cms/portal/documents', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          docType,
          description: description.trim() || undefined,
          fileUrl: fileUrl.trim(),
          fileSizeBytes: 2450000, // ~2.4MB sample default
        }),
      });

      toast({
        type: 'success',
        title: 'Dokumen Berhasil Diterbitkan!',
        description: 'Berkas resmi kini dapat diunduh konstituen di portal publik Anda.',
      });

      setTitle('');
      setFileUrl('');
      setDescription('');
      setShowAddForm(false);
      fetchDocuments();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menerbitkan Dokumen',
        description: err.message || 'Gagal menyimpan dokumen.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async (id: string, docTitle: string) => {
    if (!confirm(`Hapus dokumen "${docTitle}" dari etalase portal publik?`)) return;

    try {
      setDeletingId(id);
      await ApiClient.request(`/cms/portal/documents/${id}`, {
        method: 'DELETE',
      });

      toast({
        type: 'success',
        title: 'Dokumen Dihapus',
        description: 'Berkas telah ditarik dari etalase publik.',
      });

      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menghapus',
        description: err.message || 'Gagal menghapus dokumen.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case PortalDocumentType.REPORT_TRIWULAN:
      case 'REPORT_TRIWULAN':
        return { label: 'Laporan Kinerja / Triwulan', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' };
      case PortalDocumentType.DRAFT_RUU:
      case 'DRAFT_RUU':
        return { label: 'Draf Regulasi / RUU', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300' };
      case PortalDocumentType.BULETIN:
      case 'BULETIN':
        return { label: 'Buletin Warta Aspirasi', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300' };
      case PortalDocumentType.KAJIAN_AKADEMIS:
      case 'KAJIAN_AKADEMIS':
        return { label: 'Kajian Akademis / Whitepaper', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300' };
      default:
        return { label: 'Dokumen Publik', color: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/70 dark:from-slate-900 dark:to-indigo-950 text-slate-900 dark:text-white border border-blue-100 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 dark:bg-white/10 text-blue-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pojok Literasi & Akuntabilitas Parlemen</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Katalog Dokumen Resmi Dewan (PDF)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            Unggah dan kelola naskah akademik, draf rancangan regulasi, laporan kinerja masa sidang, serta buletin aspirasi yang dapat diakses publik.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-gradient-to-r dark:from-amber-400 dark:to-amber-500 dark:hover:from-amber-300 dark:hover:to-amber-400 dark:text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Tutup Formulir' : 'Terbitkan Dokumen Baru'}</span>
        </button>
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold">Dokumen Resmi Diterbitkan</span>
            <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {documents.length} Berkas
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold">Total Diunduh Konstituen</span>
            <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {documents.reduce((acc, d) => acc + (d.downloadCount || 0), 0)} Kali
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold">Pelanggan Buletin Catatan Dewan</span>
            <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {subscriberCount} Konstituen
            </span>
          </div>
        </div>
      </div>

      {/* Add Document Form Modal / Card */}
      {showAddForm && (
        <form
          onSubmit={handleCreateDocument}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-all"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-black text-sm">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Formulir Penerbitan Dokumen Resmi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Judul Dokumen Resmi *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Laporan Kinerja Reses Triwulan II 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Dokumen *
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={PortalDocumentType.REPORT_TRIWULAN}>Laporan Kinerja Resmi (Triwulan)</option>
                <option value={PortalDocumentType.DRAFT_RUU}>Draf Usulan Regulasi / RUU</option>
                <option value={PortalDocumentType.BULETIN}>Buletin Warta Aspirasi</option>
                <option value={PortalDocumentType.KAJIAN_AKADEMIS}>Naskah Kajian Akademik / Whitepaper</option>
                <option value={PortalDocumentType.OTHER}>Dokumen Publik Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              URL Berkas PDF (Tersimpan di Cloud / R2) *
            </label>
            <input
              type="url"
              required
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://storage.polaris.id/documents/laporan-kinerja-2026.pdf"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Masukkan URL berkas PDF yang dapat diunduh langsung oleh publik dan media.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Ringkasan Dokumen (Opsional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ringkasan isi dokumen atau pengantar..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Terbitkan Dokumen</span>
            </button>
          </div>
        </form>
      )}

      {/* Document List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
          <span>Daftar Dokumen Aktif ({documents.length})</span>
          <span>Status: Terpublikasi di Portal</span>
        </div>

        {loading ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-xs text-slate-500">Memuat berkas dokumen...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Belum Ada Dokumen Resmi Diterbitkan
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Publikasikan laporan kinerja atau buletin kerja legislatif Anda agar konstituen dapat memantau kerja nyata Anda.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Terbitkan Berkas Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {documents.map((doc) => {
              const badge = getDocTypeBadge(doc.docType);
              const isDeleting = deletingId === doc.id;

              return (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center shrink-0 text-red-600 dark:text-red-400">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {doc.downloadCount || 0} kali diunduh
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {doc.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 font-mono truncate max-w-md">
                        {doc.fileUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Lihat PDF</span>
                    </a>

                    <button
                      onClick={() => handleDeleteDocument(doc.id, doc.title)}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
