'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
  Camera,
  Table as TableIcon,
  BarChart3,
  TrendingUp,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TiptapToolbarProps {
  editor: Editor | null;
  isInsideTable: boolean;
  onOpenImageModal: () => void;
  onOpenChartModal: () => void;
  onOpenMetricModal: () => void;
  onInsertTable: () => void;
  currentZoom: number;
  setCurrentZoom: React.Dispatch<React.SetStateAction<number>>;
  currentIsWide: boolean;
  setCurrentIsWide: React.Dispatch<React.SetStateAction<boolean>>;
}

export function TiptapToolbar({
  editor,
  isInsideTable,
  onOpenImageModal,
  onOpenChartModal,
  onOpenMetricModal,
  onInsertTable,
  currentZoom,
  setCurrentZoom,
  currentIsWide,
  setCurrentIsWide,
}: TiptapToolbarProps) {
  return (
    <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-2 flex items-center justify-between gap-1.5 flex-wrap select-none transition-all pointer-events-auto">
      {/* GRUP FORMAT TEKS */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* UNDO / REDO */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            title="Batalkan Perubahan (Ctrl+Z)"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            title="Ulangi Perubahan (Ctrl+Y)"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* HEADING / TIPE TEKS */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => editor?.chain().focus().setParagraph().run()}
            title="Teks Normal (Paragraf)"
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
              editor?.isActive('paragraph') && !editor?.isActive('heading')
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Judul Utama (H1)"
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer',
              editor?.isActive('heading', { level: 1 })
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Sub-Judul (H2)"
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer',
              editor?.isActive('heading', { level: 2 })
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Bagian (H3)"
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer',
              editor?.isActive('heading', { level: 3 })
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            H3
          </button>
        </div>

        {/* BOLD, ITALIC, UNDERLINE, STRIKE */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            title="Tebal (Ctrl+B)"
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              editor?.isActive('bold')
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            title="Miring (Ctrl+I)"
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              editor?.isActive('italic')
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            title="Garis Bawah (Ctrl+U)"
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              editor?.isActive('underline')
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            title="Coret Teks (Strikethrough)"
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              editor?.isActive('strike')
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Strikethrough className="h-4 w-4" />
          </button>
        </div>

        {/* LISTS & QUOTE */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            title="Daftar Poin (Bullet List)"
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              editor?.isActive('bulletList')
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            title="Daftar Nomor (Numbered List)"
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              editor?.isActive('orderedList')
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            title="Kutipan (Quote)"
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              editor?.isActive('blockquote')
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            title="Garis Pemisah (Divider)"
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* GRUP SISIPKAN ELEMEN (FOTO, TABEL, GRAFIK, METRIK) */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[10px] uppercase font-bold text-slate-400 pl-1 hidden sm:inline">
          Sisipkan:
        </span>
        <button
          type="button"
          onClick={onOpenImageModal}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 transition-all cursor-pointer"
          title="Sisipkan Foto Lapangan dengan Caption dan Pengaturan Ukuran/Posisi"
        >
          <Camera className="h-3.5 w-3.5 text-emerald-600" />
          <span>Foto</span>
        </button>
        <button
          type="button"
          onClick={onInsertTable}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer',
            isInsideTable
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700'
          )}
          title={isInsideTable ? 'Tabel Sedang Aktif' : 'Sisipkan Tabel Baru 3x3'}
        >
          <TableIcon className="h-3.5 w-3.5 text-blue-600" />
          <span>{isInsideTable ? 'Tabel Aktif' : 'Tabel'}</span>
        </button>
        <button
          type="button"
          onClick={onOpenChartModal}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 transition-all cursor-pointer"
          title="Buat & Sisipkan Grafik Batang/Garis/Lingkaran"
        >
          <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
          <span>Grafik</span>
        </button>
        <button
          type="button"
          onClick={onOpenMetricModal}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 transition-all cursor-pointer"
          title="Sisipkan Kartu Angka / KPI Utama"
        >
          <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
          <span>Metrik</span>
        </button>

        {/* PEMISAH */}
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-0.5" />

        {/* GRUP ZOOM & SKALA KANVAS DOKUMEN */}
        <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setCurrentZoom((prev) => Math.max(50, prev - 10))}
            disabled={currentZoom <= 50}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
            title="Perkecil Tampilan Kertas (Zoom Out 10%)"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          <select
            value={currentZoom}
            onChange={(e) => setCurrentZoom(Number(e.target.value))}
            title="Tingkat Pembesaran Lembar Dokumen (Zoom)"
            className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer px-1 py-0.5 rounded"
          >
            <option value={50}>50%</option>
            <option value={75}>75%</option>
            <option value={90}>90%</option>
            <option value={100}>100%</option>
            <option value={110}>110%</option>
            <option value={125}>125%</option>
            <option value={150}>150%</option>
            <option value={175}>175%</option>
            <option value={200}>200%</option>
          </select>

          <button
            type="button"
            onClick={() => setCurrentZoom((prev) => Math.min(200, prev + 10))}
            disabled={currentZoom >= 200}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
            title="Perbesar Tampilan Kertas (Zoom In 10%)"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentIsWide((prev) => !prev)}
            className={cn(
              'p-1 ml-0.5 rounded-lg transition-colors cursor-pointer border border-transparent',
              currentIsWide
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
            )}
            title={currentIsWide ? 'Ganti ke Lebar Lembar Standar A4' : 'Ganti ke Lebar Lembar Penuh (Wide Sheet)'}
          >
            {currentIsWide ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

