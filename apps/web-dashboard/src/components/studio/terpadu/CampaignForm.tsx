'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sparkles,
  Send,
  Image as ImageIcon,
  Lock,
  CheckCircle2,
  Loader2,
  Paperclip,
  Globe,
  FileText,
  FileSpreadsheet,
  X,
  FileCheck,
  History,
  Bot,
  User,
  ChevronDown,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';

import {
  WritingStyleSelector,
  WritingStyle,
  LengthTarget,
} from '@/components/studio/artikel/WritingStyleSelector';
import { StudioChatMessage } from '@/components/studio/terpadu/TerpaduChatCopilot';

export interface AttachedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  base64: string;
}

const DEFAULT_QUICK_ACTIONS = [
  '⚖️ Sertakan rujukan regulasi UU/Perda terkait',
  '📊 Tambahkan data alokasi anggaran APBD & tabel deviasi',
  '✂️ Ringkas poin utama menjadi lebih padat & tajam',
  '🔍 Periksa kesesuaian EYD & tata bahasa baku',
  '✨ Pertegas solusi kebijakan dan rekomendasi dewan',
];

interface CampaignFormProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  selectedStyle: WritingStyle;
  onStyleChange: (style: WritingStyle) => void;
  selectedLength: LengthTarget;
  onLengthChange: (length: LengthTarget) => void;
  attachedFiles: AttachedFileItem[];
  onAddFiles: (files: AttachedFileItem[]) => void;
  onRemoveFile: (id: string) => void;
  isUnpaid: boolean;
  loading: boolean;
  generationStep: number;
  onSubmit: (e: React.FormEvent) => void;
  suggestedTopics: string[];

  // Mode Chat / Revisi Terpadu
  hasResult?: boolean;
  chatMessages?: StudioChatMessage[];
  onSendRevision?: (promptText: string) => void;
  refining?: boolean;
  currentVersion?: number;
  iterationsCount?: number;
  onOpenVersionDrawer?: () => void;
  onResetToNewChat?: () => void;
  authorName?: string;
}

export function CampaignForm({
  topic,
  onTopicChange,
  selectedStyle,
  onStyleChange,
  selectedLength,
  onLengthChange,
  attachedFiles,
  onAddFiles,
  onRemoveFile,
  isUnpaid,
  loading,
  generationStep,
  onSubmit,
  suggestedTopics,
  hasResult = false,
  chatMessages = [],
  onSendRevision,
  refining = false,
  currentVersion = 1,
  iterationsCount = 1,
  onOpenVersionDrawer,
  onResetToNewChat,
  authorName = 'Anggota Dewan',
}: CampaignFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [revisionInput, setRevisionInput] = useState('');
  const [chatExpanded, setChatExpanded] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Auto-scroll saat pesan obrolan baru bertambah
  useEffect(() => {
    if (chatMessages && chatMessages.length > 0 && chatExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatExpanded]);

  // Deteksi tautan URL dari teks prompt secara otomatis
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const detectedUrls = Array.from(new Set(topic.match(urlRegex) || [])).map((u) =>
    u.replace(/[.,;!?)\]}>]+$/, '')
  );

  // Helper konversi file ke base64
  async function handleFileSelection(files: FileList | null) {
    if (!files || files.length === 0) return;

    const newItems: AttachedFileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 15 * 1024 * 1024) {
        alert(`Berkas "${file.name}" melebihi batas 15MB.`);
        continue;
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      newItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        base64,
      });
    }

    if (newItems.length > 0) {
      onAddFiles(newItems);
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getFileIcon(type: string, name: string) {
    const lowerName = name.toLowerCase();
    if (type.includes('image') || lowerName.match(/\.(png|jpg|jpeg|webp)$/)) {
      return <ImageIcon className="h-4 w-4 text-emerald-600" />;
    }
    if (type.includes('pdf') || lowerName.endsWith('.pdf')) {
      return <FileText className="h-4 w-4 text-red-600" />;
    }
    if (
      type.includes('spreadsheet') ||
      type.includes('excel') ||
      type.includes('csv') ||
      lowerName.match(/\.(xlsx|xls|csv)$/)
    ) {
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    }
    return <FileText className="h-4 w-4 text-blue-600" />;
  }

  function handleRevisionSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!revisionInput.trim() || refining || isUnpaid || !onSendRevision) return;
    const text = revisionInput.trim();
    setRevisionInput('');
    onSendRevision(text);
  }

  function handleQuickActionClick(action: string) {
    if (refining || isUnpaid || !onSendRevision) return;
    onSendRevision(action);
  }

  // ==========================================
  // JIKA SUDAH ADA HASIL KONTEN (MODE CHAT & REVISI)
  // ==========================================
  if (hasResult) {
    return (
      <Card className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 rounded-3xl transition-all">
        {/* HEADER DOKUMEN & KONTROL SESI */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Asisten Penulis AI
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-black">
                  Versi v{currentVersion}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gunakan bilah obrolan ini untuk memberikan instruksi revisi langsung ke AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {onOpenVersionDrawer && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenVersionDrawer}
                className="gap-1.5 text-xs font-bold rounded-xl h-8 px-3 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer shadow-2xs"
              >
                <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Riwayat Versi ({iterationsCount})</span>
                <span className="sm:hidden">v{currentVersion}</span>
              </Button>
            )}

            {onResetToNewChat && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onResetToNewChat}
                className="gap-1 text-xs font-bold rounded-xl h-8 px-2.5 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-300"
                title="Mulai Sesi Chat Baru"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Chat Baru</span>
              </Button>
            )}

            <button
              type="button"
              onClick={() => setChatExpanded(!chatExpanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={chatExpanded ? 'Sembunyikan Obrolan' : 'Tampilkan Obrolan'}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  chatExpanded ? '' : '-rotate-90'
                }`}
              />
            </button>
          </div>
        </div>

        {/* THREAD RIWAYAT OBROLAN PROMPTING & RESPON AI */}
        {chatExpanded && chatMessages && chatMessages.length > 0 && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 py-1">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 text-xs ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 space-y-1.5 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white shadow-2xs rounded-tr-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/60 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 border-b pb-1 border-white/20 dark:border-slate-700">
                    <span className="font-bold">
                      {msg.role === 'user' ? authorName : 'Polaris AI Co-Pilot'}
                    </span>
                    {msg.versionGenerated && (
                      <span className="font-extrabold px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10">
                        Snapshot v{msg.versionGenerated}
                      </span>
                    )}
                  </div>

                  <p className="whitespace-pre-line leading-relaxed text-xs">{msg.text}</p>

                  <div className="flex items-center justify-between gap-2 text-[9px] opacity-70 pt-0.5">
                    {msg.deltaWords !== undefined && msg.deltaWords !== 0 && (
                      <span className="font-semibold">
                        {msg.deltaWords > 0 ? `+${msg.deltaWords}` : msg.deltaWords} kata
                      </span>
                    )}
                    <span className="ml-auto">
                      {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="h-7 w-7 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* PILIHAN INSTRUKSI CEPAT */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Pilihan Instruksi Cepat Revisi:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                disabled={refining || isUnpaid}
                onClick={() => handleQuickActionClick(action)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-700 hover:border-blue-300 transition-all cursor-pointer disabled:opacity-50"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* INPUT PROMPT INSTRUKSI REVISI (SATU-SATUNYA TEMPAT PROMPTING) */}
        <form onSubmit={handleRevisionSubmit} className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={revisionInput}
              onChange={(e) => setRevisionInput(e.target.value)}
              placeholder="Ketik instruksi revisi: misal 'Tambahkan tabel alokasi anggaran APBD 2026 dan usulan dewan'..."
              disabled={refining || isUnpaid}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-60 shadow-2xs"
            />

            <Button
              type="submit"
              disabled={!revisionInput.trim() || refining || isUnpaid}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-10 px-4 rounded-xl gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {refining ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Revisi AI</span>
                </>
              )}
            </Button>
          </div>
        </form>

        {/* ACCORDION PENGATURAN TAMBAHAN (LAMPIRAN BERKAS & GAYA TULISAN) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Sesuaikan Gaya Penulisan & Lampiran Berkas</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showAdvancedSettings ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showAdvancedSettings && (
            <div className="mt-3 space-y-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 animate-in fade-in">
              {/* Lampiran Dokumen Tambahan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Lampirkan Berkas Tambahan untuk Revisi</span>
                  </label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    PDF, Foto, Excel, Word
                  </span>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFileSelection(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-3 text-center transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-800/40'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelection(e.target.files)}
                    multiple
                    accept="image/*,.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Paperclip className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Klik atau tarik berkas tambahan ke sini
                    </div>
                  </div>
                </div>

                {attachedFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {attachedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {getFileIcon(file.type, file.name)}
                          <span
                            className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveFile(file.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selector Gaya Penulisan */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <WritingStyleSelector
                  selectedLength={selectedLength}
                  onLengthChange={onLengthChange}
                  selectedStyle={selectedStyle}
                  onStyleChange={onStyleChange}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // ==========================================
  // JIKA BELUM ADA HASIL KONTEN (MODE PEMBUATAN DRAF AWAL)
  // ==========================================
  return (
    <Card className="space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 rounded-3xl">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Asisten Penulis</span>
        </h3>
        <span className="text-[10px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
          AI Aktif
        </span>
      </div>

      {isUnpaid && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-extrabold text-xs">Akun Belum Aktif</span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
            Selesaikan aktivasi lisensi terlebih dahulu untuk mulai membuat konten.
          </p>
          <Link href="/billing" className="block pt-0.5">
            <Button
              size="sm"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs"
            >
              Aktivasi Lisensi
            </Button>
          </Link>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* TEXTAREA PROMPTING */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              Apa yang ingin Anda tulis?
            </label>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Bisa tempel link berita
            </span>
          </div>

          <textarea
            required
            rows={5}
            placeholder="Contoh: Buatkan artikel tentang kondisi jalan rusak di Kecamatan Cibadak dan upaya perbaikan dari Dinas PUPR. Atau tempel link berita: https://detik.com/... "
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="block w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-3.5 text-xs sm:text-sm leading-relaxed text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
          />

          {/* CHIP DETEKSI TAUTAN WEB */}
          {detectedUrls.length > 0 && (
            <div className="mt-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-xs flex flex-col gap-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-700 dark:text-blue-300">
                <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{detectedUrls.length} link terdeteksi — isi web akan otomatis dibaca AI</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {detectedUrls.map((u, i) => (
                  <span
                    key={i}
                    title={u}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/60 text-[10px] font-mono text-blue-800 dark:text-blue-300 max-w-[280px] truncate shadow-2xs"
                  >
                    🔗 {u}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ISU TERKINI */}
          <div className="pt-2.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mb-1.5">
              Isu Terkini di Daerah Anda:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTopics.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => onTopicChange(sug)}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-semibold transition-colors text-left"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LAMPIRAN BERKAS */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Lampirkan Berkas Pendukung</span>
            </label>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">PDF, Foto, Excel, Word</span>
          </div>

          {/* DROPZONE */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileSelection(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-3 sm:p-4 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileSelection(e.target.files)}
              multiple
              accept="image/*,.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="h-8 w-8 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <Paperclip className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Klik atau tarik berkas ke sini
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Laporan, foto lapangan, data Excel, atau dokumen lainnya — AI otomatis membaca isi dokumen
              </p>
            </div>
          </div>

          {/* DAFTAR FILE TERLAMPIR */}
          {attachedFiles.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {getFileIcon(file.type, file.name)}
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                      <FileCheck className="h-3 w-3" />
                      Siap
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveFile(file.id)}
                      className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Hapus berkas"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GAYA PENULISAN & TARGET PANJANG */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <WritingStyleSelector
            selectedLength={selectedLength}
            onLengthChange={onLengthChange}
            selectedStyle={selectedStyle}
            onStyleChange={onStyleChange}
          />
        </div>

        {/* TOMBOL SUBMIT */}
        {isUnpaid ? (
          <Link href="/billing" className="block w-full">
            <Button
              type="button"
              size="lg"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-md gap-2 cursor-pointer"
            >
              <Lock className="h-4 w-4 text-amber-100" />
              <span>Aktivasi Lisensi untuk Mulai</span>
            </Button>
          </Link>
        ) : (
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md gap-2"
          >
            <Send className="h-4 w-4" />
            <span>Buat Sekarang</span>
          </Button>
        )}
      </form>

      {/* PROGRES SAAT AI BEKERJA */}
      {loading && (
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Sedang menyiapkan konten Anda...
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <div
              className={`flex items-center gap-2 ${
                generationStep >= 1
                  ? 'text-blue-700 dark:text-blue-400 font-bold'
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              {generationStep > 1 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              ) : (
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              )}
              <span>Membaca tautan & dokumen yang dilampirkan</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                generationStep >= 2
                  ? 'text-blue-700 dark:text-blue-400 font-bold'
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              {generationStep > 2 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              ) : (
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              )}
              <span>Mencari rujukan peraturan terkait</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                generationStep >= 3
                  ? 'text-blue-700 dark:text-blue-400 font-bold'
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              {generationStep > 3 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              ) : (
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              )}
              <span>Menulis naskah lengkap</span>
            </div>
            <div
              className={`flex items-center gap-2 ${
                generationStep >= 4
                  ? 'text-blue-700 dark:text-blue-400 font-bold'
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            >
              {generationStep > 4 ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              ) : (
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              )}
              <span>Membuat poster & pesan siaran</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
