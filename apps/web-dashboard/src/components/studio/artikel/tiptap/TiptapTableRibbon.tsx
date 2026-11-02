'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Table as TableIcon,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowLeft,
  Combine,
  Split,
  Trash2,
} from 'lucide-react';

interface TiptapTableRibbonProps {
  editor: Editor | null;
  isInsideTable: boolean;
}

export function TiptapTableRibbon({ editor, isInsideTable }: TiptapTableRibbonProps) {
  if (!isInsideTable) return null;

  return (
    <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-lg px-3.5 py-2 flex items-center justify-between gap-2.5 text-xs flex-wrap animate-in fade-in slide-in-from-top-1 duration-150 select-none transition-all pointer-events-auto">
      <div className="flex items-center gap-2 flex-wrap">
        {/* BADGE TAB TABLE TOOLS ALA WORD */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 rounded-xl text-blue-700 dark:text-blue-300 font-extrabold text-[11px] shrink-0">
          <TableIcon className="h-3.5 w-3.5 text-blue-600" />
          <span>Tabel: Tata Letak</span>
        </div>

        {/* PANEL 1: BARIS & KOLOM (ROWS & COLUMNS) */}
        <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="px-1.5 text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">
            Baris & Kolom:
          </div>
          <button
            type="button"
            onClick={() => editor?.chain().focus().addRowBefore().run()}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Sisipkan Baris di Atas (Word: Insert Rows Above)"
          >
            <ArrowUp className="h-3 w-3 text-emerald-600" />
            <span>+ Atas</span>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().addRowAfter().run()}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Sisipkan Baris di Bawah (Word: Insert Rows Below)"
          >
            <ArrowDown className="h-3 w-3 text-emerald-600" />
            <span>+ Bawah</span>
          </button>
          <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />
          <button
            type="button"
            onClick={() => editor?.chain().focus().addColumnBefore().run()}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Sisipkan Kolom di Kiri (Word: Insert Columns to the Left)"
          >
            <ArrowLeft className="h-3 w-3 text-blue-600" />
            <span>+ Kiri</span>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().addColumnAfter().run()}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Sisipkan Kolom di Kanan (Word: Insert Columns to the Right)"
          >
            <ArrowRight className="h-3 w-3 text-blue-600" />
            <span>+ Kanan</span>
          </button>
        </div>

        {/* PANEL 2: GABUNG & PISAH SEL (MERGE & SPLIT) */}
        <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="px-1.5 text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">
            Sel:
          </div>
          <button
            type="button"
            onClick={() => editor?.chain().focus().mergeCells().run()}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Gabungkan Sel yang Diblok (Word: Merge Cells)"
          >
            <Combine className="h-3 w-3 text-amber-500" />
            <span>Gabung</span>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().splitCell().run()}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Pisahkan Sel (Word: Split Cells)"
          >
            <Split className="h-3 w-3 text-amber-500" />
            <span>Pisah</span>
          </button>
        </div>

        {/* PANEL 3: HEADER BARIS / KOLOM */}
        <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeaderRow().run()}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Jadikan baris paling atas sebagai baris judul (Header Row)"
          >
            <span>Baris Judul</span>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeaderColumn().run()}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Jadikan kolom pertama sebagai kolom judul (Header Column)"
          >
            <span>Kolom Judul</span>
          </button>
        </div>

        {/* PANEL 4: HAPUS (DELETE GROUP) */}
        <div className="flex items-center gap-0.5 bg-rose-50/70 dark:bg-rose-950/30 p-0.5 rounded-xl border border-rose-200/70 dark:border-rose-900/50">
          <button
            type="button"
            onClick={() => editor?.chain().focus().deleteRow().run()}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-700 dark:text-rose-300 hover:bg-white dark:hover:bg-slate-900 transition-colors cursor-pointer"
            title="Hapus baris saat ini (Word: Delete Rows)"
          >
            Hapus Baris
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().deleteColumn().run()}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-700 dark:text-rose-300 hover:bg-white dark:hover:bg-slate-900 transition-colors cursor-pointer"
            title="Hapus kolom saat ini (Word: Delete Columns)"
          >
            Hapus Kolom
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().deleteTable().run()}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
            title="Hapus seluruh tabel (Word: Delete Table)"
          >
            <Trash2 className="h-3 w-3" />
            <span>Hapus Tabel</span>
          </button>
        </div>
      </div>

      {/* RIGHT: SHORTCUT / BEST-PRACTICE TIPS */}
      <div className="flex items-center gap-2">
        <span className="hidden xl:inline text-[10.5px] text-slate-400 italic">
          💡 Klik kanan di sel mana saja untuk Menu Cepat ala Word
        </span>
      </div>
    </div>
  );
}

