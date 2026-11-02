'use client';

import React, { useRef } from 'react';
import {
  AlertCircle,
  Sparkles,
  RefreshCw,
  Globe,
  Flame,
  Paperclip,
  FileText,
  ShieldCheck,
  X,
  Plus,
  Image as ImageIcon,
  Share2,
  Eye,
  Edit3,
  Minimize2,
  Maximize2,
  CheckCheck,
  Copy,
  Save,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Send,
  ArrowRight,
} from 'lucide-react';
import {
  WritingStyleSelector,
  type WritingStyle,
  type LengthTarget,
} from '@/components/studio/artikel/WritingStyleSelector';
import { VisualDocumentCanvas } from '@/components/studio/artikel/VisualDocumentCanvas';
import { TiptapExecutiveEditor } from '@/components/studio/artikel/TiptapExecutiveEditor';
import {
  AssignedTenant,
  TenantContextData,
  AttachedFileItem,
  GeneratedFullResult,
} from './types';

interface OperatorContentTabProps {
  selectedDewan: AssignedTenant;
  tenantContext: TenantContextData | null;
  generatedResult: GeneratedFullResult | null;
  setGeneratedResult: React.Dispatch<React.SetStateAction<GeneratedFullResult | null>>;
  topicInput: string;
  setTopicInput: (val: string) => void;
  trendingTopics: string[];
  loadingTopics: boolean;
  onRefreshTrendingTopics: () => void;
  selectedStyle: WritingStyle;
  setSelectedStyle: (style: WritingStyle) => void;
  selectedLength: LengthTarget;
  setSelectedLength: (length: LengthTarget) => void;
  attachedFiles: AttachedFileItem[];
  onFileSelection: (files: FileList | null) => void;
  onRemoveFile: (id: string) => void;
  generatingContent: boolean;
  generationStep: number;
  isRefiningPrompt: boolean;
  onRefinePrompt: () => void;
  originalRawPrompt: string | null;
  onUndoRefine: () => void;
  promptRefinedSuccess: boolean;
  onGenerateContent: (e: React.FormEvent) => void;
  resultTab: 'article' | 'poster' | 'social';
  setResultTab: (tab: 'article' | 'poster' | 'social') => void;
  isEditingArticle: boolean;
  setIsEditingArticle: (val: boolean) => void;
  isWide: boolean;
  setIsWide: (val: boolean | ((prev: boolean) => boolean)) => void;
  zoom: number;
  editedTitle: string;
  setEditedTitle: (val: string) => void;
  editedBody: string;
  setEditedBody: (val: string) => void;
  savingDraft: boolean;
  onSaveEditedArticle: () => void;
  onCopyArticle: () => void;
  copiedArticle: boolean;
  downloadingPoster: boolean;
  onDownloadPoster: () => void;
  regeneratingPoster: boolean;
  onRegeneratePoster: () => void;
  copiedWa: boolean;
  onCopyWa: () => void;
  copiedIg: boolean;
  onCopyIg: () => void;
  publishedUrl: string | null;
  publishingArticle: boolean;
  onPublishArticle: () => void;
  assignments: AssignedTenant[];
  totalAssigned: number;
  selectedTenantId: string | null;
  onSelectTenant: (tenantId: string) => void;
}

export function OperatorContentTab({
  selectedDewan,
  tenantContext,
  generatedResult,
  setGeneratedResult,
  topicInput,
  setTopicInput,
  trendingTopics,
  loadingTopics,
  onRefreshTrendingTopics,
  selectedStyle,
  setSelectedStyle,
  selectedLength,
  setSelectedLength,
  attachedFiles,
  onFileSelection,
  onRemoveFile,
  generatingContent,
  generationStep,
  isRefiningPrompt,
  onRefinePrompt,
  originalRawPrompt,
  onUndoRefine,
  promptRefinedSuccess,
  onGenerateContent,
  resultTab,
  setResultTab,
  isEditingArticle,
  setIsEditingArticle,
  isWide,
  setIsWide,
  zoom,
  editedTitle,
  setEditedTitle,
  editedBody,
  setEditedBody,
  savingDraft,
  onSaveEditedArticle,
  onCopyArticle,
  copiedArticle,
  downloadingPoster,
  onDownloadPoster,
  regeneratingPoster,
  onRegeneratePoster,
  copiedWa,
  onCopyWa,
  copiedIg,
  onCopyIg,
  publishedUrl,
  publishingArticle,
  onPublishArticle,
  assignments,
  totalAssigned,
  selectedTenantId,
  onSelectTenant,
}: OperatorContentTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* JIKA BELUM ADA HASIL: TAMPILKAN FORM PERACIK LENGKAP */}
      {!generatedResult ? (
        <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Alert Jika Langganan Tokoh Belum Aktif */}
          {(tenantContext?.subscriptionStatus || selectedDewan.subscriptionStatus) &&
            (tenantContext?.subscriptionStatus || selectedDewan.subscriptionStatus) !== 'ACTIVE' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">
                    Status Paket Tokoh: {tenantContext?.subscriptionStatus || selectedDewan.subscriptionStatus}
                  </p>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    Fitur pembuatan konten &amp; poster visual AI memerlukan status paket langganan yang aktif. Mohon pastikan aktivasi paket dewan ini telah diselesaikan oleh administrator atau bagian penagihan.
                  </p>
                </div>
              </div>
            )}

          <form onSubmit={onGenerateContent} className="space-y-6">
            {/* 1. INPUT AGENDA / ISU HARI INI */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    1. Agenda, Isu Lapangan, atau Pernyataan Pers {selectedDewan.fullName} Hari Ini
                  </label>
                  <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2">
                    (Disesuaikan otomatis dengan konstituen {selectedDewan.customDapilName || 'Dapil'})
                  </span>
                </div>

                {/* TOMBOL AI PROMPT ENHANCER */}
                <button
                  type="button"
                  disabled={isRefiningPrompt || !topicInput.trim()}
                  onClick={onRefinePrompt}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white text-[11px] font-black shadow-xs disabled:opacity-40 transition cursor-pointer"
                  title="Klik agar AI menyempurnakan catatan kasar Anda menjadi rumusan agenda kebijakan yang terstruktur & berwibawa"
                >
                  {isRefiningPrompt ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>AI Menyempurnakan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Sempurnakan Prompt dengan AI</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <textarea
                  required
                  rows={4}
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="Ketik catatan kasar kegiatan reses, keluhan warga, atau ide pokok di sini... Contoh: 'tadi pagi bagi bantuan pupuk di desa ciwidey bareng petani ngeluh soal air'. Lalu klik tombol [Sempurnakan Prompt dengan AI] di atas."
                  className="w-full p-4 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
                />
              </div>

              {/* BANNER NOTIFIKASI PROMPT BERHASIL DI-REFINE OLEH AI */}
              {promptRefinedSuccess && (
                <div className="p-3 rounded-xl bg-violet-50/90 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violet-900 dark:text-violet-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    <span className="text-[11px] font-bold">
                      ✨ Rumusan agenda lapangan berhasil disempurnakan oleh AI Polaris menjadi kalimat kebijakan resmi yang berwibawa.
                    </span>
                  </div>
                  {originalRawPrompt && (
                    <button
                      type="button"
                      onClick={onUndoRefine}
                      className="text-[11px] font-bold text-violet-700 dark:text-violet-300 hover:underline shrink-0 cursor-pointer self-end sm:self-auto"
                    >
                      Urungkan (Kembalikan Teks Asli)
                    </button>
                  )}
                </div>
              )}

              {/* DETEKSI LINK WEB OTOMATIS */}
              {topicInput.match(/(https?:\/\/[^\s]+)/gi) && (
                <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-[11px] font-bold">
                    Tautan rujukan terdeteksi — Polaris AI akan otomatis menyerap isi dokumen/artikel sebagai rujukan faktual.
                  </span>
                </div>
              )}

              {/* REKOMENDASI ISU HANGAT DAPIL (AI RADAR) */}
              <div className="pt-1.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Rekomendasi Isu Hangat di {selectedDewan.customDapilName || 'Dapil'} (AI Radar):</span>
                  </span>
                  <button
                    type="button"
                    disabled={loadingTopics}
                    onClick={onRefreshTrendingTopics}
                    className="text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                    title="Generate rekomendasi isu baru dengan AI"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingTopics ? 'animate-spin' : ''}`} />
                    <span>{loadingTopics ? 'Menganalisis Isu...' : 'Segarkan Isu AI'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trendingTopics.map((top) => (
                    <button
                      key={top}
                      type="button"
                      onClick={() => setTopicInput(top)}
                      className="text-[11px] px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer text-left border border-transparent hover:border-indigo-200 dark:border-indigo-800 shadow-2xs"
                    >
                      + {top}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. LAMPIRKAN BERKAS LAPANGAN */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                  <span>2. Lampirkan Berkas Lapangan / Dokumen Pendukung (Opsional)</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  Foto Reses, PDF Nota Dinas, Perda, atau Excel APBD
                </span>
              </div>

              {/* Dropzone Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-900/40 p-4 text-center transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => onFileSelection(e.target.files)}
                  multiple
                  accept="image/*,.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt"
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Klik atau seret foto kegiatan reses &amp; dokumen ke sini
                  </div>
                  <p className="text-[10px] text-slate-400">
                    AI otomatis menyerap foto lapangan dan membaca data statistik berkas untuk naskah &amp; visual poster.
                  </p>
                </div>
              </div>

              {/* Daftar Berkas Terlampir */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2 pt-1">
                  {attachedFiles.map((file) => {
                    const isImg = file.type.startsWith('image/') || file.name.match(/\.(png|jpg|jpeg|webp)$/i);
                    const isPdf = file.name.toLowerCase().endsWith('.pdf');
                    const isSpreadsheet = file.name.match(/\.(xlsx|xls|csv)$/i);
                    const isDocx = file.name.match(/\.(docx|doc)$/i);

                    let badgeLabel = '📄 Dokumen Pendukung';
                    let badgeStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                    if (isImg) {
                      badgeLabel = '📷 Foto Lapangan (Vision OCR)';
                      badgeStyle = 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                    } else if (isPdf) {
                      badgeLabel = '📑 Dokumen PDF (RAG Chunking Semantik)';
                      badgeStyle = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
                    } else if (isSpreadsheet) {
                      badgeLabel = '📊 Data Anggaran (Tabular)';
                      badgeStyle = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                    } else if (isDocx) {
                      badgeLabel = '📝 Nota Dinas / Word';
                      badgeStyle = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
                    }

                    return (
                      <div
                        key={file.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                                {file.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${badgeStyle}`}>
                                {badgeLabel}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Aset Milik: <strong className="text-slate-600 dark:text-slate-300">{selectedDewan.fullName}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span>SHA-256 Deduplikasi Aktif</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveFile(file.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Hapus berkas"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[10.5px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Tata Kelola Aset &amp; Isolasi Multi-Tenant:</strong> Setiap berkas otomatis tersinkronisasi sebagai basis pengetahuan milik <strong>{selectedDewan.fullName}</strong>. Jika Anda mengunggah berkas yang sama untuk tokoh lain, sistem otomatis mendeduplikasi (SHA-256) secara instan tanpa biaya pemrosesan ganda.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. TARGET PANJANG NASKAH & 4 GAYA BAHASA RESMI */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <WritingStyleSelector
                selectedLength={selectedLength}
                onLengthChange={setSelectedLength}
                selectedStyle={selectedStyle}
                onStyleChange={setSelectedStyle}
              />
            </div>

            {/* 4. TOMBOL GENERATE UTAMA */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {generatingContent ? (
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>
                    {generationStep === 1 && 'Tahap 1/3: Menganalisis konstituen & isu daerah...'}
                    {generationStep === 2 && 'Tahap 2/3: Menyintesis naskah & rujukan kebijakan...'}
                    {generationStep >= 3 && 'Tahap 3/3: Merender poster visual editorial...'}
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>AI Engine otomatis mematuhi batas wilayah dapil &amp; branding partai tokoh.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  generatingContent ||
                  !topicInput.trim() ||
                  ((tenantContext?.subscriptionStatus || selectedDewan?.subscriptionStatus) !== 'ACTIVE' &&
                    Boolean(tenantContext?.subscriptionStatus || selectedDewan?.subscriptionStatus))
                }
                className="flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition cursor-pointer"
              >
                {generatingContent ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sedang Memproses...</span>
                  </>
                ) : (tenantContext?.subscriptionStatus || selectedDewan?.subscriptionStatus) &&
                  (tenantContext?.subscriptionStatus || selectedDewan?.subscriptionStatus) !== 'ACTIVE' ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-300" />
                    <span>Paket Belum Aktif</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Sintesis Naskah &amp; Poster Visual</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* KANVAS HASIL LENGKAP */
        <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in slide-in-from-bottom-2">
          {/* HEADER KANVAS HASIL */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {generatedResult.publication.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ~{(generatedResult.publication.bodyContentMarkdown || '').split(/\s+/).filter(Boolean).length} kata
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                {editedTitle || generatedResult.publication.title}
              </h3>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setGeneratedResult(null);
                  setTopicInput('');
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Konten Baru untuk Tokoh Ini</span>
              </button>
            </div>
          </div>

          {/* 3 SUB-TAB KANVAS */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none max-w-full">
            <button
              type="button"
              onClick={() => setResultTab('article')}
              className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                resultTab === 'article'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Naskah Kebijakan Utuh</span>
            </button>

            <button
              type="button"
              onClick={() => setResultTab('poster')}
              className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                resultTab === 'poster'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Visual Poster Editorial</span>
              {generatedResult.posterUrl && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setResultTab('social')}
              className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                resultTab === 'social'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Siaran Pers WhatsApp &amp; Medsos</span>
            </button>
          </div>

          {/* SUB-TAB 1: NASKAH KEBIJAKAN UTUH */}
          {resultTab === 'article' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsEditingArticle(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !isEditingArticle
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pratinjau Dokumen (A4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingArticle(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isEditingArticle
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sunting Naskah Langsung</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsWide((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs transition-all cursor-pointer"
                    title={isWide ? 'Mode Dokumen Standar' : 'Kanvas Luas'}
                  >
                    {isWide ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{isWide ? 'Standar' : 'Luas'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onCopyArticle}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedArticle ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedArticle ? 'Tersalin!' : 'Salin Naskah'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={savingDraft}
                    onClick={onSaveEditedArticle}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {savingDraft ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Simpan</span>
                  </button>
                </div>
              </div>

              {/* KONTEN DOKUMEN: PRATINJAU DOKUMEN A4 vs TIPTAP WYSIWYG */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 p-2 sm:p-4 overflow-hidden">
                {!isEditingArticle ? (
                  <VisualDocumentCanvas
                    content={
                      editedBody.startsWith('# ')
                        ? editedBody
                        : (editedTitle ? `# ${editedTitle}\n\n${editedBody}` : (generatedResult.publication.bodyContentMarkdown || ''))
                    }
                    onContentChange={(newContent) => {
                      setEditedBody(newContent);
                      const firstLine = newContent.split('\n')[0].replace(/^#\s*/, '').trim();
                      if (firstLine) setEditedTitle(firstLine);
                    }}
                    selectedStyle={selectedStyle}
                    wordCount={
                      (editedBody || generatedResult.publication.bodyContentMarkdown || '')
                        .split(/\s+/)
                        .filter(Boolean).length
                    }
                    authorName={selectedDewan.fullName}
                    partyName={selectedDewan.partyAffiliation || 'Fraksi Parlemen'}
                    isSaving={savingDraft}
                    isWide={isWide}
                    zoom={zoom}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs flex items-center justify-between">
                      <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Mode Editor Eksekutif Tiptap (Toolbar tabel, grafik, &amp; format siap digunakan)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Klik tombol Simpan setelah menyunting
                      </span>
                    </div>
                    <TiptapExecutiveEditor
                      content={
                        editedBody.startsWith('# ')
                          ? editedBody
                          : (editedTitle ? `# ${editedTitle}\n\n${editedBody}` : (generatedResult.publication.bodyContentMarkdown || ''))
                      }
                      onContentChange={(newContent) => {
                        setEditedBody(newContent);
                        const firstLine = newContent.split('\n')[0].replace(/^#\s*/, '').trim();
                        if (firstLine) setEditedTitle(firstLine);
                      }}
                      selectedStyle={selectedStyle}
                      authorName={selectedDewan.fullName}
                      partyName={selectedDewan.partyAffiliation || 'Fraksi Parlemen'}
                      isSaving={savingDraft}
                      isWide={isWide}
                      zoom={zoom}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: POSTER VISUAL EDITORIAL */}
          {resultTab === 'poster' && (
            <div className="space-y-4">
              {generatedResult.posterUrl ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Poster Visual Editorial • Branding {selectedDewan.fullName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={downloadingPoster}
                        onClick={onDownloadPoster}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                      >
                        {downloadingPoster ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{downloadingPoster ? 'Mengunduh...' : 'Unduh Gambar HD'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={regeneratingPoster}
                        onClick={onRegeneratePoster}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        {regeneratingPoster ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        <span>{regeneratingPoster ? 'Merender...' : 'Buat Ulang Poster'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <img
                      src={generatedResult.posterUrl}
                      alt="Poster Kebijakan Visual"
                      className="max-h-[500px] w-auto rounded-xl shadow-lg object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                  <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Poster Visual Editorial Sedang Diproses
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Sistem sedang merender poster visual editorial di antrean latar belakang. Anda dapat mengklik tombol di bawah untuk menyegarkan tampilan.
                  </p>
                  <button
                    type="button"
                    onClick={onRegeneratePoster}
                    disabled={regeneratingPoster}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${regeneratingPoster ? 'animate-spin' : ''}`} />
                    <span>Cek &amp; Render Poster</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 3: FORMAT WHATSAPP & MEDSOS */}
          {resultTab === 'social' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kartu Format WhatsApp */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <span>💬 Siaran Pers WhatsApp (Grup Warga &amp; Wartawan)</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                      Format Siap Sebar
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed whitespace-pre-line border border-emerald-100 dark:border-emerald-900/40 max-h-72 overflow-y-auto">
                    {generatedResult.socialPack?.whatsappBroadcastText ||
                      generatedResult.socialPack?.whatsappBroadcast ||
                      `*SIARAN PERS RESMI*\n*${generatedResult.publication.title}*\n_${selectedDewan.fullName} — ${selectedDewan.partyAffiliation || ''}_\n\n${generatedResult.publication.excerpt || ''}\n\n📌 *Poin Pokok Kebijakan:*\n${(generatedResult.publication.bodyContentMarkdown || '').slice(0, 450)}...\n\nBaca rilis selengkapnya di portal resmi:\n${publishedUrl || `https://polaris.id/p/${generatedResult.publication.id}`}`}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCopyWa}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {copiedWa ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedWa ? 'Tersalin ke Clipboard!' : 'Salin Pesan Siaran WhatsApp (1-Klik)'}</span>
                </button>
              </div>

              {/* Kartu Format Instagram & Threads */}
              <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                      <span>📸 Keterangan Instagram &amp; Threads</span>
                    </span>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded">
                      Kanal Visual
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed whitespace-pre-line border border-purple-100 dark:border-purple-900/40 max-h-72 overflow-y-auto">
                    {generatedResult.socialPack?.instagramCaption ||
                      `${generatedResult.publication.title}\n\n${generatedResult.publication.excerpt || ''}\n\n#${(selectedDewan.customDapilName || 'Dapil').replace(/\s+/g, '')} #SuaraRakyat #KerjaNyata #Polaris`}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCopyIg}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {copiedIg ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedIg ? 'Tersalin!' : 'Salin Keterangan Instagram'}</span>
                </button>
              </div>
            </div>
          )}

          {/* AKSI PENERBITAN RESMI PORTAL & REKOMENDASI TOKOH BERIKUTNYA */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Status Penerbitan Resmi: {generatedResult.publication.status}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {selectedDewan.canDirectPublish
                    ? 'Akun Anda memiliki izin Terbit Langsung tanpa menunggu persetujuan dewan.'
                    : 'Akun Anda memerlukan persetujuan dewan sebelum artikel tayang live.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedDewan.canDirectPublish ? (
                  generatedResult.publication.status !== 'PUBLISHED' ? (
                    <button
                      type="button"
                      disabled={publishingArticle}
                      onClick={onPublishArticle}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      {publishingArticle ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Terbitkan Langsung ke Portal Publik</span>
                    </button>
                  ) : (
                    <span className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Telah Terbit Live di Portal</span>
                    </span>
                  )
                ) : (
                  <span className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-300">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Draf Siap Diajukan ke Tokoh</span>
                  </span>
                )}
              </div>
            </div>

            {/* REKOMENDASI TOKOH BINAAN SELANJUTNYA */}
            {assignments.filter((a) => !a.todayStats.hasPublishedToday && a.tenantId !== selectedTenantId).length > 0 ? (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
                <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 block">
                  Lanjut buatkan untuk tokoh binaan berikutnya yang belum rilis hari ini:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {assignments
                    .filter((a) => !a.todayStats.hasPublishedToday && a.tenantId !== selectedTenantId)
                    .map((nextA) => (
                      <button
                        key={nextA.tenantId}
                        type="button"
                        onClick={() => {
                          onSelectTenant(nextA.tenantId);
                          setTopicInput('');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                      >
                        <span>{nextA.fullName}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Luar biasa! Seluruh tokoh binaan Anda ({totalAssigned}) telah memiliki konten rilis hari ini.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

