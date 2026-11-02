'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import {
  Table as TableIcon,
  Plus,
  Trash2,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowLeft,
  Combine,
  Split,
  ChevronRight,
  Columns,
} from 'lucide-react';
import { TableContextMenuState } from './types';

interface TiptapTableContextMenuProps {
  editor: Editor | null;
  editable?: boolean;
  contextMenu: TableContextMenuState;
  setContextMenu: React.Dispatch<React.SetStateAction<TableContextMenuState>>;
  activeSubmenu: 'insert' | 'delete' | null;
  setActiveSubmenu: React.Dispatch<React.SetStateAction<'insert' | 'delete' | null>>;
}

export function TiptapTableContextMenu({
  editor,
  editable,
  contextMenu,
  setContextMenu,
  activeSubmenu,
  setActiveSubmenu,
}: TiptapTableContextMenuProps) {
  if (!contextMenu.visible || !editable || !editor) return null;

  return (
    <div
      id="table-context-menu-popup"
      style={{
        top: contextMenu.y,
        left: contextMenu.x,
      }}
      className="fixed z-50 min-w-[215px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 text-xs text-slate-800 dark:text-slate-100 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {/* MINI QUICK BAR ALA WORD 365 */}
      <div className="flex items-center justify-around gap-1 px-1 py-1 mb-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().addRowBefore().run();
            setContextMenu((prev) => ({ ...prev, visible: false }));
          }}
          title="Sisipkan Baris ke Atas"
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
        </button>
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().addRowAfter().run();
            setContextMenu((prev) => ({ ...prev, visible: false }));
          }}
          title="Sisipkan Baris ke Bawah"
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowDown className="h-3.5 w-3.5 text-emerald-600" />
        </button>
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().addColumnBefore().run();
            setContextMenu((prev) => ({ ...prev, visible: false }));
          }}
          title="Sisipkan Kolom ke Kiri"
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-blue-600" />
        </button>
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().addColumnAfter().run();
            setContextMenu((prev) => ({ ...prev, visible: false }));
          }}
          title="Sisipkan Kolom ke Kanan"
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
        </button>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().deleteRow().run();
            setContextMenu((prev) => ({ ...prev, visible: false }));
          }}
          title="Hapus Baris Ini"
          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-0.5">
        {/* 1. SISIPKAN (INSERT >) */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('insert')}
        >
          <button
            type="button"
            onClick={() => setActiveSubmenu((curr) => (curr === 'insert' ? null : 'insert'))}
            className={cn(
              'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium text-[11px] transition-colors cursor-pointer',
              activeSubmenu === 'insert'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            )}
          >
            <div className="flex items-center gap-2">
              <Plus className="h-3.5 w-3.5 text-blue-600" />
              <span>Sisipkan (Insert)</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* SUBMENU SISIPKAN (WORD STYLE FLYOUT) */}
          {activeSubmenu === 'insert' && (
            <div
              className={cn(
                'absolute top-0 w-[205px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 z-50',
                contextMenu.x + 215 + 205 > (typeof window !== 'undefined' ? window.innerWidth : 1200)
                  ? 'right-full mr-1'
                  : 'left-full ml-1'
              )}
            >
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().addColumnBefore().run();
                  setContextMenu((p) => ({ ...p, visible: false }));
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3 text-blue-600" />
                <span>Kolom ke Kiri</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().addColumnAfter().run();
                  setContextMenu((p) => ({ ...p, visible: false }));
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowRight className="h-3 w-3 text-blue-600" />
                <span>Kolom ke Kanan</span>
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().addRowBefore().run();
                  setContextMenu((p) => ({ ...p, visible: false }));
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowUp className="h-3 w-3 text-emerald-600" />
                <span>Baris ke Atas</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().addRowAfter().run();
                  setContextMenu((p) => ({ ...p, visible: false }));
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowDown className="h-3 w-3 text-emerald-600" />
                <span>Baris ke Bawah</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. HAPUS (DELETE >) */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('delete')}
        >
          <button
            type="button"
            onClick={() => setActiveSubmenu((curr) => (curr === 'delete' ? null : 'delete'))}
            className={cn(
              'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium text-[11px] transition-colors cursor-pointer',
              activeSubmenu === 'delete'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                : 'hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600'
            )}
          >
            <div className="flex items-center gap-2">
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus (Delete)</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-rose-400" />
          </button>

          {/* SUBMENU HAPUS */}
          {activeSubmenu === 'delete' && (
            <div
              className={cn(
                'absolute top-0 w-[190px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 z-50',
                contextMenu.x + 215 + 190 > (typeof window !== 'undefined' ? window.innerWidth : 1200)
                  ? 'right-full mr-1'
                  : 'left-full ml-1'
              )}
            >
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().deleteRow().run();
                  setContextMenu((p) => ({ ...p, visible: false }));
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <span>Hapus Baris Ini</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().deleteColumn().run();
                  setContextMenu((p) => ({ ...p, visible: false }));
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <span>Hapus Kolom Ini</span>
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().deleteTable().run();
                  setContextMenu((p) => ({ ...p, visible: false }));
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Hapus Seluruh Tabel</span>
              </button>
            </div>
          )}
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

        {/* 3. GABUNGKAN SEL (MERGE) */}
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().mergeCells().run();
            setContextMenu((p) => ({ ...p, visible: false }));
          }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Combine className="h-3.5 w-3.5 text-amber-500" />
          <span>Gabungkan Sel (Merge)</span>
        </button>

        {/* 4. PISAHKAN SEL (SPLIT) */}
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().splitCell().run();
            setContextMenu((p) => ({ ...p, visible: false }));
          }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Split className="h-3.5 w-3.5 text-amber-500" />
          <span>Pisahkan Sel (Split)</span>
        </button>

        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

        {/* 5. TOGGLE BARIS & KOLOM HEADER */}
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().toggleHeaderRow().run();
            setContextMenu((p) => ({ ...p, visible: false }));
          }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <TableIcon className="h-3.5 w-3.5 text-blue-500" />
          <span>Toggle Baris Judul</span>
        </button>
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().toggleHeaderColumn().run();
            setContextMenu((p) => ({ ...p, visible: false }));
          }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Columns className="h-3.5 w-3.5 text-indigo-500" />
          <span>Toggle Kolom Judul</span>
        </button>
      </div>
    </div>
  );
}

