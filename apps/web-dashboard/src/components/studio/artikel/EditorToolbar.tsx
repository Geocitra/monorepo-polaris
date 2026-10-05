'use client';

import {
  RotateCcw,
  RotateCw,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  ImageIcon,
  Share2,
  History,
  Type,
  ZoomIn,
  ZoomOut,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  editor?: Editor | null;
  onOpenDistribute: () => void;
  onOpenHistory?: () => void;
  historyCount?: number;
  onOpenSessions?: () => void;
  sessionCount?: number;
  onCreateNewSession?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onRedo?: () => void;
  canRedo?: boolean;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomChange?: (zoom: number) => void;
}

export function EditorToolbar({
  editor,
  onOpenDistribute,
  onOpenHistory,
  historyCount = 0,
  onOpenSessions,
  sessionCount = 0,
  onCreateNewSession,
  onUndo,
  canUndo = false,
  onRedo,
  canRedo = false,
  zoom = 100,
  onZoomIn,
  onZoomOut,
  onZoomChange,
}: EditorToolbarProps) {
  // Check active states directly from TipTap if editor is available
  const isBold = editor?.isActive('bold');
  const isItalic = editor?.isActive('italic');
  const isUnderline = editor?.isActive('underline');
  const isH1 = editor?.isActive('heading', { level: 1 });
  const isH2 = editor?.isActive('heading', { level: 2 });
  const isH3 = editor?.isActive('heading', { level: 3 });
  const isBulletList = editor?.isActive('bulletList');
  const isOrderedList = editor?.isActive('orderedList');
  const isBlockquote = editor?.isActive('blockquote');

  const effectiveCanUndo = editor ? editor.can().undo() : canUndo;
  const effectiveCanRedo = editor ? editor.can().redo() : canRedo;

  function handleUndo() {
    if (editor) editor.chain().focus().undo().run();
    else onUndo?.();
  }

  function handleRedo() {
    if (editor) editor.chain().focus().redo().run();
    else onRedo?.();
  }

  function handleInsertTable() {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }

  function handleInsertImage() {
    if (!editor) return;
    const url = window.prompt(
      'Masukkan URL Gambar Dokumentasi / Infografis:',
      'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80'
    );
    if (url) {
      editor.chain().focus().setImage({ src: url, alt: 'Dokumentasi Parlemen' }).run();
    }
  }

  function handleFontChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!editor) return;
    const font = e.target.value;
    if (font === 'default') {
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(font).run();
    }
  }

  function handleFontSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!editor) return;
    const size = e.target.value;
    if (size === 'default') {
      (editor.chain().focus() as any).unsetFontSize().run();
    } else {
      (editor.chain().focus() as any).setFontSize(size).run();
    }
  }

  return (
    <div className="sticky top-16 z-30 px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 select-none shadow-2xs">
      {/* ─── LEFT: MAIN EDITING TOOLS (SINGLE ROW, NEVER WRAPS) ─── */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 shrink-0">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!effectiveCanUndo}
            title="Urungkan (Undo - Ctrl+Z)"
            className={cn(
              "p-1.5 rounded-md transition-all",
              effectiveCanUndo
                ? "hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs"
                : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={!effectiveCanRedo}
            title="Ulangi (Redo - Ctrl+Y)"
            className={cn(
              "p-1.5 rounded-md transition-all",
              effectiveCanRedo
                ? "hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs"
                : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
            )}
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

        {/* Font Family & Size Pill */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 gap-1 shrink-0">
          <Type className="h-3.5 w-3.5 text-slate-400 ml-1 shrink-0" />
          <select
            onChange={handleFontChange}
            defaultValue="default"
            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            title="Pilih Jenis Huruf"
          >
            <option value="default" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">Inter</option>
            <option value="Merriweather, serif" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">Merriweather</option>
            <option value="Georgia, serif" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">Georgia</option>
            <option value="JetBrains Mono, monospace" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">Mono</option>
          </select>
          <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-700 shrink-0" />
          <select
            onChange={handleFontSizeChange}
            defaultValue="default"
            className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer px-1"
            title="Ukuran Huruf"
          >
            <option value="12px" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">12</option>
            <option value="default" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">14</option>
            <option value="16px" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">16</option>
            <option value="18px" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">18</option>
            <option value="22px" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">22</option>
            <option value="26px" className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">26</option>
          </select>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

        {/* Headings H1, H2, H3 */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Judul Utama (H1)"
            className={cn(
              "px-2 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer",
              isH1
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            )}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Sub-Judul (H2)"
            className={cn(
              "px-2 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer",
              isH2
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            )}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Bagian (H3)"
            className={cn(
              "px-2 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer",
              isH3
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            )}
          >
            H3
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

        {/* Text Styles: B, I, U */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            title="Tebal (Ctrl+B)"
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer",
              isBold
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            )}
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            title="Miring (Ctrl+I)"
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer",
              isItalic
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            )}
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            title="Garis Bawah (Ctrl+U)"
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer",
              isUnderline
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            )}
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

        {/* Lists & Quotes */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            title="Daftar Poin"
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer",
              isBulletList
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            title="Daftar Angka"
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer",
              isOrderedList
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            )}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            title="Kutipan Resmi"
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer",
              isBlockquote
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            )}
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

        {/* Inserts: Table & Image */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleInsertTable}
            title="Sisipkan Tabel (3x3)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all border border-blue-200/60 dark:border-blue-800/60 cursor-pointer shadow-2xs"
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Tabel</span>
          </button>
          <button
            type="button"
            onClick={handleInsertImage}
            title="Sisipkan Gambar Dokumentasi"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all border border-emerald-200/60 dark:border-emerald-800/60 cursor-pointer shadow-2xs"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Gambar</span>
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

        {/* Zoom Controller */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onZoomOut}
            disabled={zoom <= 50}
            title="Zoom Out"
            className="p-1 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-slate-500"
          >
            <ZoomOut className="h-3 w-3" />
          </button>
          <select
            value={zoom}
            onChange={(e) => onZoomChange?.(Number(e.target.value))}
            className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-300 px-1 focus:outline-none cursor-pointer"
            title="Tingkat Zoom Kertas"
          >
            <option value={50} className="dark:bg-slate-900">50%</option>
            <option value={75} className="dark:bg-slate-900">75%</option>
            <option value={90} className="dark:bg-slate-900">90%</option>
            <option value={100} className="dark:bg-slate-900">100%</option>
            <option value={110} className="dark:bg-slate-900">110%</option>
            <option value={125} className="dark:bg-slate-900">125%</option>
            <option value={150} className="dark:bg-slate-900">150%</option>
          </select>
          <button
            type="button"
            onClick={onZoomIn}
            disabled={zoom >= 150}
            title="Zoom In"
            className="p-1 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-slate-500"
          >
            <ZoomIn className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ─── RIGHT: ACTIONS (PINNED, ALWAYS VISIBLE) ─── */}
      <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-200 dark:border-slate-800">
        {onOpenSessions && (
          <button
            type="button"
            onClick={onOpenSessions}
            title="Buka Riwayat Sesi Chat & Dokumen"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
          >
            <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden lg:inline">Sesi Chat</span>
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded-full font-mono font-bold">
              {sessionCount}
            </span>
          </button>
        )}

        {onCreateNewSession && (
          <button
            type="button"
            onClick={onCreateNewSession}
            title="Mulai Chat & Naskah Baru"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Chat Baru</span>
          </button>
        )}

        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            title="Buka Riwayat Iterasi (Ctrl+H)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
          >
            <History className="h-3.5 w-3.5 text-blue-500" />
            <span className="hidden md:inline">Iterasi</span>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded-full font-mono font-bold">
              v{historyCount}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenDistribute}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer transition-all shrink-0"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Bagikan / Ekspor</span>
        </button>
      </div>
    </div>
  );
}
