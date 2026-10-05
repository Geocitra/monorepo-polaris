'use client';

import { useState } from 'react';
import {
  X,
  Plus,
  MessageSquare,
  Clock,
  Trash2,
  Edit2,
  Check,
  Search,
  FileText,
  Sparkles,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { WritingStyle, LengthTarget } from './WritingStyleSelector';
import { ArticleIteration } from './ArticleVersionHistoryDrawer';
import { cn } from '@/lib/utils';

export interface ArticleSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  iterations: ArticleIteration[];
  style: WritingStyle;
  length: LengthTarget;
}

interface ArticleSessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ArticleSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onCreateNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
}

export function ArticleSessionDrawer({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateNewSession,
  onDeleteSession,
  onRenameSession,
}: ArticleSessionDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function startRename(s: ArticleSession, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  }

  function saveRename(s: ArticleSession, e: React.MouseEvent | React.FormEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(s.id, editTitle.trim());
    }
    setEditingId(null);
  }

  // Pengelompokan sesi berdasarkan waktu
  const now = new Date().getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  const todaySessions = filteredSessions.filter((s) => now - new Date(s.updatedAt).getTime() < oneDay);
  const olderSessions = filteredSessions.filter((s) => now - new Date(s.updatedAt).getTime() >= oneDay);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-250">
          {/* Header Drawer */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Riwayat Sesi Chat &amp; Naskah</span>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded-full font-mono font-bold">
                    {sessions.length}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pilih percakapan lampau atau buat ruang naskah baru
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tombol Buat Sesi Baru */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/70 space-y-3">
            <button
              type="button"
              onClick={() => {
                onCreateNewSession();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-md shadow-blue-500/20 transition-all cursor-pointer group"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              <span>Mulai Chat &amp; Naskah Baru</span>
            </button>

            {/* Kolom Pencarian */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari topik atau sesi tersimpan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Daftar Sesi */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredSessions.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Tidak ada sesi ditemukan</p>
                <p className="text-[11px] mt-0.5 text-slate-400">Klik tombol di atas untuk membuat sesi baru.</p>
              </div>
            ) : (
              <>
                {todaySessions.length > 0 && (
                  <div className="space-y-2 pt-2 first:pt-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                      Hari Ini
                    </span>
                    <div className="space-y-1.5">
                      {todaySessions.map((session) => renderSessionCard(session))}
                    </div>
                  </div>
                )}

                {olderSessions.length > 0 && (
                  <div className="space-y-2 pt-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                      Sebelumnya
                    </span>
                    <div className="space-y-1.5">
                      {olderSessions.map((session) => renderSessionCard(session))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Multi-Sesi Otomatis Tersimpan</span>
            </span>
            <span className="font-mono text-[10px]">Polaris AI Studio</span>
          </div>
        </div>
      </div>
    </div>
  );

  function renderSessionCard(session: ArticleSession) {
    const isActive = session.id === activeSessionId;
    const isEditing = editingId === session.id;

    const timeStr = new Date(session.updatedAt).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateStr = new Date(session.updatedAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });

    const words = session.content.trim().split(/\s+/).filter(Boolean).length;
    const iterCount = session.iterations?.length || 1;

    return (
      <div
        key={session.id}
        onClick={() => {
          if (!isEditing) {
            onSelectSession(session.id);
            onClose();
          }
        }}
        className={cn(
          "group relative p-3 rounded-xl border transition-all cursor-pointer text-left",
          isActive
            ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-xs ring-1 ring-blue-500/20"
            : "bg-white dark:bg-slate-850/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <form onSubmit={(e) => saveRename(session, e)} className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                  className="w-full text-xs font-bold px-2 py-1 bg-white dark:bg-slate-800 border border-blue-500 rounded-md focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              <h4 className={cn(
                "text-xs font-bold truncate leading-snug",
                isActive ? "text-blue-900 dark:text-blue-200 font-black" : "text-slate-800 dark:text-slate-200"
              )}>
                {session.title}
              </h4>
            )}

            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                <span>{dateStr}, {timeStr}</span>
              </span>
              <span>•</span>
              <span className="font-mono">{words} kata</span>
              <span>•</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-semibold text-slate-600 dark:text-slate-300">
                v{iterCount} iterasi
              </span>
            </div>
          </div>

          {/* Aksi Sesi (Rename / Delete) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => startRename(session, e)}
              title="Ganti Judul Sesi"
              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            {sessions.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Hapus sesi "${session.title}"?`)) {
                    onDeleteSession(session.id);
                  }
                }}
                title="Hapus Sesi Ini"
                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {isActive && (
          <div className="mt-2 pt-2 border-t border-blue-200/60 dark:border-blue-800/40 flex items-center justify-between text-[10px] text-blue-700 dark:text-blue-300 font-bold">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
              <span>Sesi Aktif di Editor</span>
            </span>
            <ChevronRight className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  }
}
