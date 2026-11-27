'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Send,
  UploadCloud,
  FolderOpen,
  Table2,
  Scale,
  CalendarClock,
  Image as ImageIcon,
  X,
  FileText,
  Loader2,
  Newspaper,
  Sparkles,
  Check,
} from 'lucide-react';
import type {
  CoordinatorChatMode,
  CreativePosterArchetype,
  InstitutionalScopedDocumentDto,
} from '@polaris/shared-types';
import { usePromptAutocomplete } from '@/hooks/usePromptAutocomplete';

const B2B_VISUAL_TEMPLATES: Array<{
  archetype: CreativePosterArchetype;
  label: string;
  tag: string;
  previewUrl: string;
}> = [
  {
    archetype: 'INFOGRAPHIC_ADVOCACY_PILLARS',
    label: 'Pilar Data & Anggaran',
    tag: 'Infografis',
    previewUrl: '/templates/infografis/template-04-advocacy-data-pillars.jpg',
  },
  {
    archetype: 'INFOGRAPHIC_CHRONICLE_GRID',
    label: 'Grid & Kronologi',
    tag: 'Infografis',
    previewUrl: '/templates/infografis/template-02-biography-timeline-grid.jpg',
  },
  {
    archetype: 'INFOGRAPHIC_NARRATIVE_WAVE',
    label: 'Gelombang Narasi',
    tag: 'Poster',
    previewUrl: '/templates/infografis/template-01-red-wave-narrative.jpg',
  },
  {
    archetype: 'INFOGRAPHIC_VISIONARY_TIMELINE',
    label: 'Linimasa Strategis',
    tag: 'Infografis',
    previewUrl: '/templates/infografis/template-05-visionary-milestone-timeline.jpg',
  },
  {
    archetype: 'INFOGRAPHIC_RADIAL_CLOCK',
    label: 'Infografis Radial',
    tag: 'Infografis',
    previewUrl: '/templates/infografis/template-03-radial-clock-chronicle.jpg',
  },
  {
    archetype: 'INFOGRAPHIC_EDITORIAL_COLLAGE',
    label: 'Kolase Editorial',
    tag: 'Poster',
    previewUrl: '/templates/infografis/template-06-Light bears shadow.jpg',
  },
];

const MODE_CHIP_META: Record<
  Exclude<CoordinatorChatMode, 'AUTO'>,
  { label: string; colorClass: string; icon: typeof Table2; placeholder: string }
> = {
  LKPJ_FINANCE: {
    label: 'Evaluasi LKPJ & Anggaran',
    colorClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    icon: Table2,
    placeholder: 'Tanyakan atau sebutkan OPD / tahun anggaran LKPJ yang ingin diaudit...',
  },
  LEGISLATION: {
    label: 'Telaah Legislasi & Raperda',
    colorClass:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    icon: Scale,
    placeholder: 'Sebutkan Raperda, pasal, atau topik regulasi yang ingin diuji kepatuhannya...',
  },
  BRIEFING: {
    label: 'Briefing Rapat 5 Poin',
    colorClass:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    icon: CalendarClock,
    placeholder: 'Topik rapat / agenda bersama OPD mitra yang ingin disusun briefing-nya...',
  },
  ARTICLE: {
    label: 'Buat Artikel / Rilis Pers',
    colorClass:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    icon: Newspaper,
    placeholder: 'Topik artikel opini, berita kegiatan, atau rilis pers yang ingin ditulis AI...',
  },
  IMAGE: {
    label: 'Buat Gambar / Infografis',
    colorClass:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    icon: ImageIcon,
    placeholder: 'Deskripsikan infografis atau visual publik yang ingin dibuat AI...',
  },
};

interface ChatComposerBarProps {
  input: string;
  onChangeInput: (val: string) => void;
  mode: CoordinatorChatMode;
  onChangeMode: (mode: CoordinatorChatMode) => void;
  imageAspectRatio: '1:1' | '4:5' | '16:9' | '9:16';
  onChangeAspectRatio: (ratio: '1:1' | '4:5' | '16:9' | '9:16') => void;
  imageArchetype?: CreativePosterArchetype | null;
  onChangeImageArchetype?: (archetype: CreativePosterArchetype | null) => void;
  selectedDocs: InstitutionalScopedDocumentDto[];
  onRemoveDoc: (docId: string) => void;
  onOpenLibrary: () => void;
  onUploadFile: (file: File) => void;
  uploadingFile: boolean;
  sending: boolean;
  autocompleteEndpoint?: string | null;
  onSend: (overrideText?: string, overrideMode?: CoordinatorChatMode, skipClarification?: boolean) => void;
  centered?: boolean;
}

export function ChatComposerBar({
  input,
  onChangeInput,
  mode,
  onChangeMode,
  imageAspectRatio,
  onChangeAspectRatio,
  imageArchetype = null,
  onChangeImageArchetype,
  selectedDocs,
  onRemoveDoc,
  onOpenLibrary,
  onUploadFile,
  uploadingFile,
  sending,
  autocompleteEndpoint = null,
  onSend,
  centered = false,
}: ChatComposerBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mirrorRef = useRef<HTMLDivElement | null>(null);

  const { ghostSuffix, loadingSuggestion, acceptGhost, clearGhost } = usePromptAutocomplete({
    endpoint: autocompleteEndpoint,
    value: input,
    mode,
    disabled: sending || uploadingFile,
  });

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const mirrorHeight = mirrorRef.current ? mirrorRef.current.scrollHeight : 0;
    const minHeight = centered ? 64 : 44;
    const nextHeight = Math.min(Math.max(el.scrollHeight, mirrorHeight, minHeight), 220);
    el.style.height = `${nextHeight}px`;
  }, [input, ghostSuffix, centered]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const activeChip = mode !== 'AUTO' ? MODE_CHIP_META[mode] : null;
  const ActiveChipIcon = activeChip?.icon;

  return (
    <div className={centered ? 'w-full max-w-3xl mx-auto' : 'w-full max-w-5xl mx-auto'}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            onUploadFile(f);
            e.target.value = '';
          }
        }}
      />

      {/* Selected documents pills */}
      {selectedDocs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2 px-1">
          {selectedDocs.map((doc) => (
            <span
              key={doc.fileId}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              <FileText className="h-3 w-3 text-indigo-500 shrink-0" />
              <span className="max-w-[180px] truncate">{doc.title}</span>
              <button
                type="button"
                onClick={() => onRemoveDoc(doc.fileId)}
                className="text-slate-400 hover:text-rose-500"
                title="Lepas dokumen"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Main ChatGPT/Gemini Style Input Pill */}
      <div
        ref={menuRef}
        className="relative rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#141B2D] shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400 transition-all px-3 py-2.5"
      >
        {/* `+` Tool Popover Menu */}
        {menuOpen && (
          <div className="absolute left-2 bottom-full mb-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] shadow-xl p-1.5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                fileInputRef.current?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <UploadCloud className="h-4 w-4 text-indigo-500 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Unggah Dokumen Baru</div>
                <div className="text-[10.5px] text-slate-500">PDF/Excel LKPJ, Draf Raperda, dll.</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onOpenLibrary();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FolderOpen className="h-4 w-4 text-sky-500 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Pilih dari Pustaka Bidang</div>
                <div className="text-[10.5px] text-slate-500">Gunakan dokumen yang sudah tersimpan</div>
              </div>
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onChangeMode('LKPJ_FINANCE');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <Table2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Evaluasi LKPJ &amp; Serapan</div>
                <div className="text-[10.5px] text-slate-500">Audit pagu, realisasi, anomali &amp; sikap fraksi</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onChangeMode('LEGISLATION');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            >
              <Scale className="h-4 w-4 text-indigo-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Telaah Legislasi &amp; Raperda</div>
                <div className="text-[10.5px] text-slate-500">Uji kepatuhan pasal, DIM &amp; UU 1/2026</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onChangeMode('BRIEFING');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
            >
              <CalendarClock className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Susun Briefing Rapat 5 Poin</div>
                <div className="text-[10.5px] text-slate-500">Ringkasan rapat &amp; pertanyaan kunci OPD</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onChangeMode('ARTICLE');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
            >
              <Newspaper className="h-4 w-4 text-sky-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Buat Artikel / Rilis Pers</div>
                <div className="text-[10.5px] text-slate-500">Naskah opini kebijakan atau siaran pers siap terbit</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onChangeMode('IMAGE');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
            >
              <ImageIcon className="h-4 w-4 text-purple-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Buat Gambar / Infografis</div>
                <div className="text-[10.5px] text-slate-500">Visualisasi publik &amp; infografis AI</div>
              </div>
            </button>
          </div>
        )}

        {/* Active Mode Chip + Textarea Row */}
        <div className="flex flex-col gap-2">
          {activeChip && ActiveChipIcon && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${activeChip.colorClass}`}
              >
                <ActiveChipIcon className="h-3.5 w-3.5" />
                <span>{activeChip.label}</span>
                <button
                  type="button"
                  onClick={() => onChangeMode('AUTO')}
                  className="ml-0.5 hover:opacity-75"
                  title="Kembali ke Mode Otomatis"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>

              {mode === 'IMAGE' && (
                <div className="flex items-center gap-1">
                  {(['1:1', '4:5', '16:9', '9:16'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => onChangeAspectRatio(r)}
                      className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border transition-colors ${
                        imageAspectRatio === r
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="relative w-full min-w-0">
              <div
                ref={mirrorRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 py-1.5 px-2 text-sm sm:text-[15px] whitespace-pre-wrap break-words leading-relaxed"
              >
                <span className="text-transparent select-none">{input}</span>
                {ghostSuffix && (
                  <span className="text-slate-400 dark:text-slate-500 opacity-75">
                    {ghostSuffix}
                  </span>
                )}
              </div>
              <textarea
                ref={textareaRef}
                rows={centered ? 2 : 1}
                value={input}
                onChange={(e) => onChangeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && ghostSuffix) {
                    e.preventDefault();
                    const next = acceptGhost();
                    if (next) onChangeInput(next);
                    return;
                  }
                  if (e.key === 'Escape' && ghostSuffix) {
                    clearGhost();
                    return;
                  }
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    clearGhost();
                    onSend();
                  }
                }}
                placeholder={
                  activeChip?.placeholder ||
                  'Tanyakan apa saja ke POLARIS, evaluasi LKPJ, telaah Raperda, atau buat infografis...'
                }
                className="relative z-10 w-full bg-transparent border-0 resize-none py-1.5 px-2 text-sm sm:text-[15px] leading-relaxed text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:outline-none focus:ring-0 overflow-y-auto"
                style={{ minHeight: centered ? '64px' : '44px', maxHeight: '220px', outline: 'none' }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  disabled={uploadingFile}
                  className="h-9 w-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shrink-0 transition-colors cursor-pointer"
                  title="Tambah Dokumen atau Pilih Alat AI"
                >
                  {uploadingFile ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  ) : (
                    <Plus className="h-4 w-4" strokeWidth={2.25} />
                  )}
                </button>

                {ghostSuffix ? (
                  <button
                    type="button"
                    onClick={() => {
                      const next = acceptGhost();
                      if (next) onChangeInput(next);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer truncate"
                    title="Klik atau tekan tombol Tab untuk menerapkan saran lanjutan AI"
                  >
                    <Sparkles className="h-3 w-3 shrink-0" />
                    <span>Saran AI &bull; Tekan Tab ↹ untuk melengkapi</span>
                  </button>
                ) : loadingSuggestion ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 px-1">
                    <Sparkles className="h-3 w-3 animate-pulse text-indigo-400" />
                    <span>Menyiapkan saran kalimat AI...</span>
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => onSend()}
                disabled={sending || (!input.trim() && mode === 'AUTO')}
                className="h-9 w-9 rounded-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 shrink-0 transition-colors cursor-pointer"
                title="Kirim Pesan (Enter)"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-pilihan cepat ala ChatGPT Write or edit saat mode khusus aktif */}
      {mode === 'LKPJ_FINANCE' && !sending && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 px-1">
          <button
            type="button"
            onClick={() =>
              onSend(
                'Buatkan tabel audit serapan anggaran & soroti anomali OPD dari data Bidang ini.',
                'LKPJ_FINANCE',
                true
              )
            }
            className="text-left p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/70 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                Audit Serapan &amp; Anomali OPD
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                Rekomendasi
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/85 dark:text-emerald-300/80 mt-1">
              Membuat tabel pagu, realisasi, persentase serapan, dan daftar temuan anggaran janggal.
            </p>
          </button>
          <button
            type="button"
            onClick={() =>
              onSend(
                'Susun draf sikap fraksi dan rekomendasi paripurna berdasarkan capaian LKPJ Bidang ini.',
                'LKPJ_FINANCE',
                true
              )
            }
            className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-300 transition-colors cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Susun Draf Sikap Fraksi &amp; Paripurna
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Menyusun catatan kritis dan rekomendasi resmi untuk disampaikan di rapat paripurna.
            </p>
          </button>
        </div>
      )}

      {mode === 'ARTICLE' && !sending && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 px-1">
          <button
            type="button"
            onClick={() =>
              onSend(
                'Buatkan artikel opini kebijakan yang terstruktur berdasarkan isu dan dokumen Bidang ini.',
                'ARTICLE',
                true
              )
            }
            className="text-left p-3 rounded-xl border border-sky-200 dark:border-sky-800/70 bg-sky-50/70 dark:bg-sky-950/30 hover:bg-sky-100/70 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-sky-900 dark:text-sky-200">
                Artikel Opini Kebijakan
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-600 text-white">
                Rekomendasi
              </span>
            </div>
            <p className="text-[11px] text-sky-800/85 dark:text-sky-300/80 mt-1">
              Menulis naskah opini 2–3 bagian dari data Bidang, lengkap dengan pesan WA &amp; caption sosmed.
            </p>
          </button>
          <button
            type="button"
            onClick={() =>
              onSend(
                'Buatkan siaran pers (press release) resmi sikap Bidang/Komisi untuk media lokal.',
                'ARTICLE',
                true
              )
            }
            className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-300 transition-colors cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Siaran Pers Resmi Media
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Menyusun rilis pers singkat siap kutip wartawan dengan poin pernyataan sikap pimpinan.
            </p>
          </button>
        </div>
      )}

      {mode === 'BRIEFING' && !sending && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 px-1">
          <button
            type="button"
            onClick={() =>
              onSend(
                'Susun briefing rapat 5 poin yang ringkas dan tegas mengenai agenda prioritas Bidang hari ini.',
                'BRIEFING',
                true
              )
            }
            className="text-left p-3 rounded-xl border border-amber-200 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/70 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Briefing Rapat 5 Poin + Pertanyaan Kritis
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-600 text-white">
                Rekomendasi
              </span>
            </div>
            <p className="text-[11px] text-amber-800/85 dark:text-amber-300/80 mt-1">
              Menyiapkan 5 poin kunci bahan bicara dan daftar pertanyaan tajam untuk mitra OPD.
            </p>
          </button>
          <button
            type="button"
            onClick={() =>
              onSend(
                'Buatkan poin pidato / sambutan resmi pimpinan DPRD untuk rapat kerja bersama OPD.',
                'BRIEFING',
                true
              )
            }
            className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-300 transition-colors cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Poin Pengantar / Sambutan Rapat
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Menyusun pointer pembukaan rapat yang berwibawa, singkat, dan langsung ke inti agenda.
            </p>
          </button>
        </div>
      )}

      {mode === 'IMAGE' && !sending && (
        <div className="mt-3 space-y-2 px-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pilih Gaya Template Visual (Opsional)
            </span>
            {imageArchetype && onChangeImageArchetype && (
              <button
                type="button"
                onClick={() => onChangeImageArchetype(null)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Reset ke Otomatis
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            <button
              type="button"
              onClick={() => onChangeImageArchetype?.(null)}
              className={`w-full rounded-xl border p-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                !imageArchetype
                  ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-purple-500/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-purple-300'
              }`}
            >
              <div className="h-24 w-full rounded-lg bg-gradient-to-br from-purple-500/15 via-indigo-500/15 to-sky-500/15 border border-dashed border-purple-300 dark:border-purple-700 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                  Pilihan AI
                </div>
                <div className="text-[10px] text-slate-500">Otomatis</div>
              </div>
            </button>

            {B2B_VISUAL_TEMPLATES.map((tpl) => {
              const isSelected = imageArchetype === tpl.archetype;
              return (
                <button
                  key={tpl.archetype}
                  type="button"
                  onClick={() => onChangeImageArchetype?.(isSelected ? null : tpl.archetype)}
                  className={`group relative w-full rounded-xl border p-1.5 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-purple-500/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-purple-300'
                  }`}
                >
                  <div className="relative h-24 w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={tpl.previewUrl}
                      alt={tpl.label}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="pt-1.5 px-0.5">
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                      {tpl.label}
                    </div>
                    <div className="text-[10px] text-slate-500">{tpl.tag}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'LEGISLATION' && !sending && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 px-1">
          <button
            type="button"
            onClick={() =>
              onSend(
                'Uji kepatuhan draf Raperda di Bidang ini terhadap regulasi nasional & UU 1/2026.',
                'LEGISLATION',
                true
              )
            }
            className="text-left p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/70 bg-indigo-50/70 dark:bg-indigo-950/30 hover:bg-indigo-100/70 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Uji Kepatuhan Pasal &amp; Regulasi
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                Rekomendasi
              </span>
            </div>
            <p className="text-[11px] text-indigo-800/85 dark:text-indigo-300/80 mt-1">
              Memeriksa kesesuaian pasal Raperda terhadap UU terkait &amp; mendeteksi tumpang tindih aturan.
            </p>
          </button>
          <button
            type="button"
            onClick={() =>
              onSend(
                'Buatkan matriks Daftar Inventarisasi Masalah (DIM) dari draf Raperda di Bidang ini.',
                'LEGISLATION',
                true
              )
            }
            className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 transition-colors cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Buat Matriks DIM Raperda
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Menyusun tabel Daftar Inventarisasi Masalah berisi pasal, catatan kritis, dan usulan revisi.
            </p>
          </button>
        </div>
      )}
    </div>
  );
}
