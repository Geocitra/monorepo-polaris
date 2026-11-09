'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  Download,
  Share2,
  Send,
  Layers,
  Sparkles,
  Twitter,
  Instagram,
  Video,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';
import { VisualDocumentCanvas } from '@/components/studio/artikel/VisualDocumentCanvas';
import { downloadImageFile } from '@/lib/utils';

interface PublicReviewData {
  briefCode: string;
  tenantFullName: string;
  status: string;
  packageType?: 'FULL_CAMPAIGN' | 'ARTICLE_ONLY' | 'POSTER_ONLY' | 'INFOGRAPHIC_ONLY';
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
    twitterThreads?: string[] | null;
    threadsText?: string | null;
    tiktokCaption?: string | null;
    facebookPostText?: string | null;
  } | null;
}

export default function PublicMagicReviewBriefPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token || '';

  const [data, setData] = useState<PublicReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ARTICLE' | 'POSTER' | 'CAPTION'>('ARTICLE');

  // Mode Tampilan Artikel: CANVAS (Tampilan Cetak Dokumen) vs PARAGRAPHS (Mode Interaktif Koreksi Paragraf)
  const [articleViewMode, setArticleViewMode] = useState<'PARAGRAPHS' | 'CANVAS'>('PARAGRAPHS');

  // Revision form state
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<
    Array<'ARTICLE' | 'IMAGE' | 'CAPTION'>
  >(['ARTICLE']);
  const [feedbackText, setFeedbackText] = useState('');
  const [targetParagraph, setTargetParagraph] = useState<{ id: string; excerpt: string } | null>(null);
  const [submittingApprove, setSubmittingApprove] = useState(false);
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [actionDoneMessage, setActionDoneMessage] = useState<string | null>(null);
  const [downloadingPoster, setDownloadingPoster] = useState(false);

  // Copy feedback state per channel
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  useEffect(() => {
    if (!token) return;
    const fetchReview = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.request<PublicReviewData>(
          `/whatsapp/public-review/${encodeURIComponent(token)}`
        );
        setData(res);
        if (res.packageType === 'POSTER_ONLY' || res.packageType === 'INFOGRAPHIC_ONLY') {
          setActiveTab('POSTER');
          setSelectedComponents(['IMAGE']);
        } else if (res.packageType === 'ARTICLE_ONLY') {
          setActiveTab('ARTICLE');
          setSelectedComponents(['ARTICLE']);
        } else {
          setActiveTab('ARTICLE');
          setSelectedComponents(['ARTICLE']);
        }
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
        'Terima kasih! Paket konten Anda telah disetujui dan resmi ditayangkan. Konfirmasi beserta tautan publikasi juga telah dikirimkan ke WhatsApp Anda.'
      );
    } catch (err: any) {
      alert(err.message || 'Gagal menyetujui konten.');
    } finally {
      setSubmittingApprove(false);
    }
  };

  const handleDownloadPoster = async () => {
    if (!data?.publication?.posterUrl || downloadingPoster) return;
    try {
      setDownloadingPoster(true);
      const filename = `${data.briefCode || 'polaris'}-poster.webp`;
      await downloadImageFile(data.publication.posterUrl, filename);
    } catch {
      alert('Gagal mengunduh gambar poster.');
    } finally {
      setDownloadingPoster(false);
    }
  };

  const openParagraphRevision = (paragraphId: string, paragraphText: string) => {
    setTargetParagraph({
      id: paragraphId,
      excerpt: paragraphText.slice(0, 120),
    });
    setSelectedComponents(['ARTICLE']);
    setFeedbackText(`[Koreksi ${paragraphId}]: `);
    setShowRevisionModal(true);
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
      setTargetParagraph(null);
      setActionDoneMessage(
        `Catatan revisi Anda (Putaran ${res.revisionUsed}/${res.revisionLimit}) telah diterima oleh Tim Redaksi Polaris. Draf terbaru akan dikirimkan kembali ke WhatsApp Anda segera setelah selesai diperbaiki.`
      );
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim permintaan revisi.');
    } finally {
      setSubmittingRevision(false);
    }
  };

  // Parsing Paragraf Interaktif untuk Artikel
  const articleParagraphs = useMemo(() => {
    if (!data?.publication?.bodyContentMarkdown) return [];
    return data.publication.bodyContentMarkdown
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((text, idx) => ({
        id: `P${idx + 1}`,
        index: idx + 1,
        text,
        isHeading: text.startsWith('#'),
      }));
  }, [data?.publication?.bodyContentMarkdown]);

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
  const isVisualOnly = data.packageType === 'POSTER_ONLY' || data.packageType === 'INFOGRAPHIC_ONLY';
  const isArticleOnly = data.packageType === 'ARTICLE_ONLY';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER EKSEKUTIF ZERO-LOGIN */}
        <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                Pratinjau Redaksi #{data.briefCode}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Akses Cepat Tanpa Login
              </span>
              {data.packageType === 'POSTER_ONLY' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                  🎨 Poster Visual
                </span>
              ) : data.packageType === 'INFOGRAPHIC_ONLY' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  📊 Infografis Publik
                </span>
              ) : data.packageType === 'ARTICLE_ONLY' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                  📝 Naskah Artikel
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                  📦 Paket Lengkap (Artikel, Poster &amp; Sosmed)
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

          {/* TOMBOL AKSI UTAMA (SETUJUI ATAU REVISI) */}
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
                  onClick={() => {
                    setTargetParagraph(null);
                    setShowRevisionModal((prev) => !prev);
                  }}
                  className="px-4 py-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-300 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Minta Revisi ({data.revisionRemaining}x)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* NOTIFIKASI SUKSES SETELAH AKSI */}
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
                <span>Buka Link Publikasi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* MODAL INPUT REVISI DENGAN DETEKSI TARGET PARAGRAF */}
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
                onClick={() => {
                  setShowRevisionModal(false);
                  setTargetParagraph(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Batal
              </button>
            </div>

            {targetParagraph && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-300">
                  Target Koreksi: {targetParagraph.id}
                </span>
                <p className="text-slate-600 dark:text-slate-400 italic text-[11px] line-clamp-2">
                  &ldquo;{targetParagraph.excerpt}...&rdquo;
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                1. Pilih bagian yang ingin direvisi:
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    {
                      id: 'ARTICLE',
                      label: '📰 Isi Naskah Artikel',
                      show: !isVisualOnly,
                    },
                    {
                      id: 'IMAGE',
                      label: data.packageType === 'INFOGRAPHIC_ONLY' ? '📊 Desain Infografis' : '🖼️ Visual Poster',
                      show: !isArticleOnly,
                    },
                    {
                      id: 'CAPTION',
                      label: '💬 Caption & Naskah Siaran',
                      show: !isVisualOnly,
                    },
                  ] as const
                )
                  .filter((item) => item.show)
                  .map((item) => {
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
                2. Tuliskan catatan perbaikan spesifik untuk Tim Redaksi:
              </label>
              <textarea
                required
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Contoh: Tolong sesuaikan data anggaran di paragraf kedua dengan angka 15 Miliar..."
                className="w-full p-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        {/* TAB NAVIGASI UTAMA */}
        <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto">
              {!isVisualOnly && (
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
              )}

              {!isArticleOnly && (
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
                  <span>{data.packageType === 'INFOGRAPHIC_ONLY' ? 'Infografis Publik' : 'Poster Visual HD'}</span>
                </button>
              )}

              {!isVisualOnly && (
                <button
                  type="button"
                  onClick={() => setActiveTab('CAPTION')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    activeTab === 'CAPTION'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Sentra Media Sosial &amp; Siaran</span>
                </button>
              )}
            </div>

            {/* Sub-Switch untuk Mode Baca Artikel */}
            {activeTab === 'ARTICLE' && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setArticleViewMode('PARAGRAPHS')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    articleViewMode === 'PARAGRAPHS'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Mode Koreksi Paragraf</span>
                </button>
                <button
                  type="button"
                  onClick={() => setArticleViewMode('CANVAS')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    articleViewMode === 'CANVAS'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Pratinjau Cetak</span>
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: ARTIKEL (CANVAS ATAU SMART PARAGRAPHS) */}
          {activeTab === 'ARTICLE' && (
            <div className="space-y-4">
              {articleViewMode === 'PARAGRAPHS' ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>
                        <strong>Tips Membaca:</strong> Arahkan atau tap pada paragraf tertentu untuk memberi catatan koreksi spesifik kepada Tim Redaksi.
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] overflow-hidden">
                    {articleParagraphs.map((p) => (
                      <div
                        key={p.id}
                        className={`group p-4 transition hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 ${
                          p.isHeading ? 'bg-slate-50/60 dark:bg-slate-900/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-slate-100 dark:bg-slate-800 text-slate-500 select-none shrink-0 mt-0.5">
                            {p.id}
                          </span>
                          <div
                            className={`flex-1 leading-relaxed text-slate-800 dark:text-slate-200 ${
                              p.isHeading
                                ? 'text-base font-black text-slate-900 dark:text-white pt-0.5'
                                : 'text-xs sm:text-sm font-normal'
                            }`}
                          >
                            {p.text}
                          </div>
                          {data.revisionRemaining > 0 && data.status !== 'PUBLISHED' && (
                            <button
                              type="button"
                              onClick={() => openParagraphRevision(p.id, p.text)}
                              className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-white dark:text-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Koreksi {p.id}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
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
            </div>
          )}

          {/* TAB 2: POSTER VISUAL HD */}
          {activeTab === 'POSTER' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Format gambar resolusi tinggi (WebP HD) siap unduh &amp; publikasi:
                </span>
                {pub.posterUrl && (
                  <button
                    type="button"
                    disabled={downloadingPoster}
                    onClick={handleDownloadPoster}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-2 cursor-pointer disabled:opacity-50 transition shadow-sm"
                  >
                    {downloadingPoster ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Unduh Poster Resolusi Penuh</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[400px]">
                {pub.posterUrl ? (
                  <img
                    src={pub.posterUrl}
                    alt={pub.title}
                    className="max-h-[580px] w-auto rounded-xl shadow-xl object-contain border border-slate-200 dark:border-slate-800"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500">Materi visual belum siap atau masih dalam proses render.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SENTRA MEDIA SOSIAL & SIARAN (CARD PER PLATFORM) */}
          {activeTab === 'CAPTION' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                Setiap platform memiliki karakteristik dan batas karakter tersendiri. Gunakan tombol <strong>Salin</strong> pada masing-masing kartu untuk menyalin teks bersih tanpa embel-embel teks lain:
              </div>

              <div className="grid grid-cols-1 gap-5">
                {/* 1. WHATSAPP BROADCAST */}
                {pub.whatsappBroadcastText && (
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10 p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Format Siaran WhatsApp (Warga &amp; Relawan)
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(pub.whatsappBroadcastText || '', 'wa')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          {copiedKey === 'wa' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'wa' ? 'Tersalin!' : 'Salin Siaran WA'}</span>
                        </button>
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(pub.whatsappBroadcastText || '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim ke WhatsApp</span>
                        </a>
                      </div>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-white dark:bg-[#070A12] border border-emerald-100 dark:border-emerald-900/40 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                      {pub.whatsappBroadcastText}
                    </pre>
                  </div>
                )}

                {/* 2. INSTAGRAM FEED & REELS */}
                {pub.instagramCaption && (
                  <div className="rounded-2xl border border-pink-200 dark:border-pink-800/60 bg-pink-50/20 dark:bg-pink-950/10 p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Draf Caption Instagram Feed &amp; Carousel
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {pub.instagramCaption.length} / 2.200 karakter
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(pub.instagramCaption || '', 'ig')}
                          className="px-3 py-1.5 rounded-xl bg-pink-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          {copiedKey === 'ig' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'ig' ? 'Tersalin!' : 'Salin Caption IG'}</span>
                        </button>
                      </div>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-white dark:bg-[#070A12] border border-pink-100 dark:border-pink-900/40 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                      {pub.instagramCaption}
                    </pre>
                  </div>
                )}

                {/* 3. X (TWITTER) THREAD */}
                {pub.twitterThreads && pub.twitterThreads.length > 0 && (
                  <div className="rounded-2xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/20 dark:bg-sky-950/10 p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Twitter className="w-4 h-4 text-sky-600" />
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Draf Utas X (Twitter) — {pub.twitterThreads.length} Cuitan
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(pub.twitterThreads?.join('\n\n---\n\n') || '', 'x_all')}
                          className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          {copiedKey === 'x_all' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'x_all' ? 'Tersalin!' : 'Salin Seluruh Utas'}</span>
                        </button>
                        {pub.twitterThreads[0] && (
                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(pub.twitterThreads[0])}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Cuitkan di X</span>
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {pub.twitterThreads.map((tweet, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white dark:bg-[#070A12] border border-sky-100 dark:border-sky-900/40 text-xs text-slate-800 dark:text-slate-200 flex items-start justify-between gap-3"
                        >
                          <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400 font-bold">
                            [{idx + 1}/{pub.twitterThreads?.length}]
                          </span>
                          <p className="flex-1 whitespace-pre-wrap">{tweet}</p>
                          <button
                            type="button"
                            onClick={() => handleCopy(tweet, `x_${idx}`)}
                            className="text-slate-400 hover:text-sky-600 cursor-pointer"
                            title="Salin cuitan ini"
                          >
                            {copiedKey === `x_${idx}` ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. META THREADS */}
                {pub.threadsText && (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Draf Utas Meta Threads
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(pub.threadsText || '', 'threads')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedKey === 'threads' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'threads' ? 'Tersalin!' : 'Salin Teks Threads'}</span>
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-white dark:bg-[#070A12] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                      {pub.threadsText}
                    </pre>
                  </div>
                )}

                {/* 5. TIKTOK VIDEO SCRIPT & HOOK */}
                {pub.tiktokCaption && (
                  <div className="rounded-2xl border border-violet-200 dark:border-violet-800/60 bg-violet-50/20 dark:bg-violet-950/10 p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-violet-600" />
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Draf Narasi &amp; Hook Video TikTok
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(pub.tiktokCaption || '', 'tiktok')}
                        className="px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedKey === 'tiktok' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'tiktok' ? 'Tersalin!' : 'Salin Naskah TikTok'}</span>
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-white dark:bg-[#070A12] border border-violet-100 dark:border-violet-900/40 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                      {pub.tiktokCaption}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


