'use client';

import React from 'react';
import { Editor, EditorContent } from '@tiptap/react';
import { Clock, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TiptapDocumentPaperProps {
  editor: Editor | null;
  currentZoom: number;
  currentIsWide: boolean;
  compactMode?: boolean;
  isSaving?: boolean;
  wordCount: number;
  readTimeMin: number;
  authorName?: string;
  partyName?: string;
  writingStyleName: string;
  editable?: boolean;
  handleContextMenu: (e: React.MouseEvent) => void;
}

export function TiptapDocumentPaper({
  editor,
  currentZoom,
  currentIsWide,
  compactMode = false,
  isSaving = false,
  wordCount,
  readTimeMin,
  authorName = 'Anggota Dewan',
  partyName = 'Fraksi Parlemen',
  writingStyleName,
  editable = true,
  handleContextMenu,
}: TiptapDocumentPaperProps) {
  return (
    <div
      style={{
        zoom: `${currentZoom}%`,
        transformOrigin: 'top center',
        transition: 'all 0.2s ease-in-out',
      }}
      className={cn(
        'w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl transition-all duration-300 relative theme-transition a4-document-paper',
        compactMode ? 'min-h-[420px] p-5 sm:p-8' : 'min-h-[1100px] p-6 sm:p-12 md:p-16',
        currentIsWide ? 'max-w-5xl xl:max-w-6xl' : 'max-w-4xl xl:max-w-5xl'
      )}
    >
      {/* HEADER DOKUMEN RESMI PARLEMEN */}
      <div className="pb-5 mb-6 border-b border-slate-100 dark:border-slate-800 space-y-3 select-none">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isSaving ? 'Menyimpan naskah...' : 'Naskah Tersimpan Otomatis'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {readTimeMin} menit baca
            </span>
            <span>•</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {wordCount} kata
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
            <User className="h-3.5 w-3.5 text-blue-600" /> {authorName} ({partyName})
          </span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-extrabold uppercase text-[10px]">
            Gaya: {writingStyleName}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
          </span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold text-[10px]">
            {editable ? 'Mode Sunting Langsung' : 'Pratinjau Resmi'}
          </span>
        </div>
      </div>

      {/* TIPTAP TRUE WYSIWYG EDITOR CONTENT */}
      <div className="tiptap-editor-wrapper" onContextMenu={handleContextMenu}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

