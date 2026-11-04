'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Edit3,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';
import { VisualDocumentCanvas } from '@/components/studio/artikel/VisualDocumentCanvas';

interface PublicReviewData {
  briefCode: string;
  tenantFullName: string;
  status: string;
  targetWindow?: 'TODAY_PRIORITY' | 'TODAY_REGULAR' | 'NEXT_DAY_MORNING';
  clientUrgency?: 'NORMAL' | 'URGENT';
  revisionUsed: number;
  revisionLimit: number;
  revisionRemaining: number;
  articleStatus: string;
  imageStatus: string;
  captionStatus: string;
  publication: {
    id: string;
    title: string;
    excerpt: string;
    bodyContentMarkdown: string;
    wordCount: number;
    status: string;
    canonicalUrl: string;
    posterUrl: string | null;
    instagramCaption: string | null;
    whatsappBroadcastText: string | null;
  } | null;
}

export default function PublicMagicReviewBriefPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token || '';

  const [data, setData] = useState<PublicReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ARTICLE' | 'POSTER' | 'CAPTION'>('ARTICLE');

  // Revision form state
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<
    Array<'ARTICLE' | 'IMAGE' | 'CAPTION'>
  >(['ARTICLE']);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingApprove, setSubmittingApprove] = useState(false);
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [actionDoneMessage, setActionDoneMessage] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchReview = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.request<PublicReviewData>(
          `/whatsapp/public-review/${encodeURIComponent(token)}`
        );
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Tautan pratinjau tidak ditemukan atau telah kedaluwarsa.');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [token]);

  const toggleComponent = (comp: 'ARTICLE' | 'IMAGE' | 'CAPTION') => {
    setSelectedComponents((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp]
    );
  };

  const handleApproveAndPublish = async () => {
    if (!token || submittingApprove) return;
    try {
      setSubmittingApprove(true);
      await ApiClient.request(`/whatsapp/public-review/${encodeURIComponent(token)}/approve`, {
        method: 'POST',
      });
      setData((prev) => (prev ? { ...prev, status: 'PUBLISHED' } : null));
      setActionDoneMessage(
        'Terima kasih! Paket konten Anda telah disetujui dan resmi ditayangkan. Konfirmasi beserta tautan artikel juga telah dikirimkan ke WhatsApp Anda.'
      );
    } catch (err: any) {
      alert(err.message || 'Gagal menyetujui konten.');
    } finally {
      setSubmittingApprove(false);
    }
  };

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || selectedComponents.length === 0 || !feedbackText.trim() || submittingRevision) {
      return;
    }
    try {
      setSubmittingRevision(true);
      const res = await ApiClient.request<{
        revisionUsed: number;
        revisionLimit: number;
      }>(`/whatsapp/public-review/${encodeURIComponent(token)}/revision`, {
        method: 'POST',
        body: JSON.stringify({
          targetComponents: selectedComponents,
          feedbackText: feedbackText.trim(),
        }),
      });

      setData((prev) =>
        prev
          ? {
              ...prev,
              status: 'REVISION_REQUESTED',
              revisionUsed: res.revisionUsed,
              revisionRemaining: Math.max(0, res.revisionLimit - res.revisionUsed),
            }
          : null
      );
      setShowRevisionModal(false);
      setFeedbackText('');
      setActionDoneMessage(
        `Catatan revisi Anda (Putaran ${res.revisionUsed}/${res.revisionLimit}) telah diterima oleh Tim Redaksi Polaris. Kami akan mengirimkan pratinjau terbaru ke WhatsApp Anda segera setelah selesai diperbaiki.`
      );
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim permintaan revisi.');
    } finally {
      setSubmittingRevision(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Memuat Pratinjau Paket Konten Resmi...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data || !data.publication) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-[#0B0F19] rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="text-base font-black text-slate-900 dark:text-white">
            Tautan Pratinjau Tidak Berlaku
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {error || 'Data paket konten belum tersedia untuk tiket ini.'}
          </p>
        </div>
      </div>
    );
  }

  const pub = data.publication;
  const shareText = pub.whatsappBroadcastText || pub.instagramCaption || pub.excerpt;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER EKSEKUTIF TANPA LOGIN */}
        <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                Pratinjau Redaksi #{data.briefCode}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Akses Cepat Tanpa Login
              </span>
              {data.targetWindow === 'TODAY_PRIORITY' || data.clientUrgency === 'URGENT' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                  ⚡ Prioritas Tayang Hari Ini
                </span>
              ) : data.targetWindow === 'NEXT_DAY_MORNING' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                  🗓️ Target Produksi Besok Pagi
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                  🟢 Target Tayang Hari Ini
                </span>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Sisa Jatah Revisi: <strong>{data.revisionRemaining} dari {data.revisionLimit} putaran</strong>
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white pt-1">
              {pub.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Disiapkan oleh Tim Redaksi Polaris khusus untuk Bapak/Ibu <strong>{data.tenantFullName}</strong>
            </p>
          </div>

          {/* TOMBOL SETUJUI ATAU MINTA REVISI */}
          {data.status !== 'PUBLISHED' && (
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                disabled={submittingApprove}
                onClick={handleApproveAndPublish}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {submittingApprove ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Setujui &amp; Tayangkan Sekarang</span>
              </button>

              {data.revisionRemaining > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRevisionModal((prev) => !prev)}
                  className="px-4 py-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-300 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Minta Revisi ({data.revisionRemaining}x)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* NOTIFIKASI STATUS SETELAH KLIK SETUJUI / REVISI */}
        {actionDoneMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionDoneMessage}</span>
            </div>
            {pub.canonicalUrl && data.status === 'PUBLISHED' && (
              <a
                href={pub.canonicalUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shrink-0"
              >
                <span>Buka Link Tayang</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* MODAL / PANEL INPUT REVISI */}
        {showRevisionModal && (
          <form
            onSubmit={handleSubmitRevision}
            className="bg-white dark:bg-[#0B0F19] rounded-2xl p-5 border-2 border-amber-400/60 dark:border-amber-600/60 shadow-md space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-500" />
                <span>Formulir Permintaan Revisi (Putaran ke-{data.revisionUsed + 1} dari {data.revisionLimit})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Batal
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                1. Pilih bagian yang ingin direvisi (dapat memilih lebih dari satu dalam 1 putaran):
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'ARTICLE', label: '📰 Isi Naskah Artikel' },
                    { id: 'IMAGE', label: '🖼️ Visual Poster' },
                    { id: 'CAPTION', label: '💬 Caption Siap Sebar' },
                  ] as const
                ).map((item) => {
                  const active = selectedComponents.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleComponent(item.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {active ? '✓ ' : ''}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                2. Tuliskan catatan perbaikan untuk Tim Redaksi:
              </label>
              <textarea
                required
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Contoh: Tolong tambahkan poin bantuan alat pertanian untuk kelompok tani Desa Sukamaju pada paragraf kedua..."
                className="w-full p-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={submittingRevision || selectedComponents.length === 0 || !feedbackText.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer disabled:opacity-50"
              >
                {submittingRevision ? 'Mengirim ke Redaksi...' : 'Kirim Catatan Revisi'}
              </button>
            </div>
          </form>
        )}

        {/* TAB NAVIGASI 3 KOMPONEN PAKET */}
        <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('ARTICLE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'ARTICLE'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Naskah Artikel Lengkap</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('POSTER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'POSTER'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Poster Visual</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CAPTION')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'CAPTION'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Teks Broadcast WA &amp; Caption IG</span>
            </button>
          </div>

          {activeTab === 'ARTICLE' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 p-2 sm:p-4">
              <VisualDocumentCanvas
                content={
                  pub.bodyContentMarkdown.startsWith('# ')
                    ? pub.bodyContentMarkdown
                    : `# ${pub.title}\n\n${pub.bodyContentMarkdown}`
                }
                onContentChange={() => {}}
                selectedStyle="SOLUTIF"
                wordCount={pub.wordCount || 500}
                authorName={data.tenantFullName}
                partyName="Publikasi Resmi"
                isSaving={false}
                isWide={true}
                zoom={100}
              />
            </div>
          )}

          {activeTab === 'POSTER' && (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              {pub.posterUrl ? (
                <img
                  src={pub.posterUrl}
                  alt={pub.title}
                  className="max-h-[540px] w-auto rounded-xl shadow-lg object-contain"
                />
              ) : (
                <p className="text-xs text-slate-500">Poster visual belum tersedia.</p>
              )}
            </div>
          )}

          {activeTab === 'CAPTION' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Teks Siap Sebar (WhatsApp &amp; Media Sosial):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(shareText);
                    setCopiedCaption(true);
                    setTimeout(() => setCopiedCaption(false), 2500);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCaption ? (
                    <CheckCheck className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCaption ? 'Tersalin!' : 'Salin Teks'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                {shareText}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

