'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Archive,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Hash,
  X,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

export interface SourceSnapshot {
  versionId: string;
  title: string;
  contentHash: string;
  snippet: string;
  fetchedAt: string;
}

export interface ArticleSourceItem {
  sourceId: string;
  url: string;
  canonicalUrl?: string;
  publisherName: string;
  publisherType: 'GOVERNMENT' | 'MEDIA' | 'ACADEMIC' | 'USER' | 'INDUSTRY';
  publisherCredibilityScore: number;
  doi?: string;
  isPeerReviewed?: boolean;
  lifecycleStatus: string;
  retrievedAt: string;
  cachedSnapshot?: SourceSnapshot | null;
  verbatimQuote?: string;
}

export interface ResearchAuditData {
  hasResearchJob: boolean;
  job?: {
    id: string;
    topic: string;
    status: string;
    evidenceSufficient: boolean;
    qcPassed: boolean;
    summaryReport?: string;
    createdAt: string;
  };
  sources: ArticleSourceItem[];
  evidenceSpans?: Array<{
    id: string;
    sourceId: string;
    verbatimQuote: string;
    contextSnippet: string;
    sectionOrPage?: string;
  }>;
  qcReport?: {
    qcPassed: boolean;
    verifiedCitationsCount: number;
    rogueCitations: string[];
    citationIntegrityRate: number;
  };
}

interface ArticleReferencesCardProps {
  articleId: string;
  onIncludeToggle?: (included: boolean) => void;
}

export const ArticleReferencesCard: React.FC<ArticleReferencesCardProps> = ({
  articleId,
  onIncludeToggle,
}) => {
  const [data, setData] = useState<ResearchAuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [includeInExport, setIncludeInExport] = useState(true);
  const [activeSnapshot, setActiveSnapshot] = useState<SourceSnapshot | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPublisher, setNewPublisher] = useState('');

  const loadResearch = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.request<ResearchAuditData>(`/studio/articles/${articleId}/research`);
      setData(res);
    } catch {
      setData({ hasResearchJob: false, sources: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articleId) {
      loadResearch();
    }
  }, [articleId]);

  const handleToggle = () => {
    const nextVal = !includeInExport;
    setIncludeInExport(nextVal);
    if (onIncludeToggle) {
      onIncludeToggle(nextVal);
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    try {
      await ApiClient.request(`/studio/articles/${articleId}/research/sources`, {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          url: newUrl.trim(),
          publisherName: newPublisher.trim() || 'Rujukan Internal Dewan',
        }),
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewUrl('');
      setNewPublisher('');
      await loadResearch();
    } catch (err: any) {
      alert(`Gagal menambah rujukan: ${err.message}`);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Hapus sumber rujukan ini dari naskah artikel?')) return;
    try {
      await ApiClient.request(`/studio/articles/${articleId}/research/sources/${sourceId}`, {
        method: 'DELETE',
      });
      await loadResearch();
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };


  if (loading) {
    return (
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 animate-pulse text-xs text-slate-500">
        Memeriksa jejak rujukan &amp; bukti terverifikasi...
      </div>
    );
  }

  const sourcesList = data?.sources || [];
  const qcPassed = data?.job?.qcPassed ?? false;
  const spans = data?.evidenceSpans || [];

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      {/* 1. HEADER RUJUKAN */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daftar Rujukan &amp; Bukti Terverifikasi
              </h3>
              {qcPassed ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" /> 100% Lolos QC Sitasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                  <ShieldCheck className="w-3 h-3" /> Grounded RAG
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Basis data konkret pendukung fakta dan angka dalam naskah artikel eksekutif.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Toggle Sertakan di Ekspor */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeInExport}
              onChange={handleToggle}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span>Sertakan di Ekspor/Cetak</span>
          </label>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Rujukan Manual</span>
          </button>
        </div>
      </div>

      {/* 2. BODY DAFTAR SUMBER */}
      <div className="p-4 sm:p-5 space-y-3">
        {sourcesList.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
            Belum ada rujukan eksternal terdaftar. Anda dapat menambahkan tautan rujukan secara manual di atas.
          </div>
        ) : (
          sourcesList.map((src, index) => {
            const footnoteNumber = index + 1;
            const matchedSpan = spans.find((sp) => sp.sourceId === src.sourceId);

            // Badge Tipe Penerbit
            let typeLabel = 'Media Terverifikasi';
            let typeBadgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
            if (src.publisherType === 'GOVERNMENT' || src.url.includes('internal://regulation')) {
              typeLabel = 'Regulasi Pemerintah (JDIH)';
              typeBadgeClass = 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
            } else if (src.publisherType === 'ACADEMIC' || src.doi) {
              typeLabel = src.isPeerReviewed ? 'Jurnal Ilmiah (Peer-Reviewed)' : 'Publikasi Ilmiah';
              typeBadgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
            } else if (src.publisherType === 'USER') {
              typeLabel = 'Dokumen Kerja Dewan';
              typeBadgeClass = 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
            }

            return (
              <div
                key={src.sourceId}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Footnote Number */}
                  <span className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[11px]">
                    [{footnoteNumber}]
                  </span>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeBadgeClass}`}>
                        {typeLabel}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {src.publisherName}
                      </span>
                      {src.doi && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          DOI: {src.doi}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                      {src.cachedSnapshot?.title || src.url}
                    </p>

                    {/* Verbatim Quote Snippet jika ada */}
                    {matchedSpan?.verbatimQuote && (
                      <blockquote className="border-l-2 border-blue-400 pl-2 text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-2">
                        &ldquo;{matchedSpan.verbatimQuote}&rdquo;
                      </blockquote>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {/* Tombol Snapshot Arsip (Mitigasi Risiko 1: Link Rot) */}
                  {src.cachedSnapshot && (
                    <button
                      onClick={() => setActiveSnapshot(src.cachedSnapshot!)}
                      title="Lihat teks asli yang tersimpan saat sistem mengunduh sumber ini"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <Archive className="w-3 h-3 text-blue-500" />
                      <span>Arsip Snapshot</span>
                    </button>
                  )}

                  {/* External URL Link */}
                  {!src.url.startsWith('internal://') && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Buka tautan web rujukan asli"
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {/* Delete Button (Mitigasi Risiko 4: Human-in-the-Loop) */}
                  <button
                    onClick={() => handleDeleteSource(src.sourceId)}
                    title="Keluarkan dari daftar rujukan"
                    className="p-1.5 rounded-md text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. MODAL LIHAT SNAPSHOT ARSIP (MITIGASI LINK ROT) */}
      {activeSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Snapshot Arsip Rujukan Otentik
                </h4>
              </div>
              <button
                onClick={() => setActiveSnapshot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Diambil: {new Date(activeSnapshot.fetchedAt).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Hash className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="truncate">SHA-256: {activeSnapshot.contentHash.slice(0, 16)}...</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Judul Dokumen:</h5>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{activeSnapshot.title}</p>
              </div>

              <div>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Kutipan Transkrip Otentik yang Tersimpan di Basis Data:
                </h5>
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {activeSnapshot.snippet}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveSnapshot(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL TAMBAH RUJUKAN MANUAL (MITIGASI HUMAN-IN-THE-LOOP) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Tambah Rujukan Manual
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddManual} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Rujukan / Nama Dokumen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Nota Keuangan APBD Perubahan 2024"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tautan URL / Lokasi Berkas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://... atau internal://nota-keuangan-2024.pdf"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Penerbit / Instansi
                </label>
                <input
                  type="text"
                  placeholder="Misal: Badan Pengelola Keuangan Daerah (BPKAD)"
                  value={newPublisher}
                  onChange={(e) => setNewPublisher(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Simpan Rujukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
