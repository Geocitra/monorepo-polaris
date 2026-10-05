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
  ChevronRight,
  ImageIcon,
} from 'lucide-react';
import { InfographicSession } from './InfographicTypes';
import { formatDateIndonesian } from '@/lib/utils';

interface InfographicSessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: InfographicSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onCreateNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
}

export function InfographicSessionDrawer({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateNewSession,
  onDeleteSession,
  onRenameSession,
}: InfographicSessionDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function startEditing(session: InfographicSession, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  }

  function saveEditing(session: InfographicSession, e: React.MouseEvent) {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(session.id, editTitle.trim());
    }
    setEditingId(null);
  }

  function handleCancelEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(null);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-start animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-r border-slate-200 dark:border-slate-800 z-10">
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Riwayat Sesi Infografis
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {sessions.length} sesi topik visual tersimpan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* TOMBOL CHAT BARU */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              onCreateNewSession();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Sesi Infografis Baru</span>
          </button>
        </div>

        {/* PENCARIAN SESI */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik atau judul sesi..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
            />
          </div>
        </div>

        {/* DAFTAR SESI */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredSessions.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <ImageIcon className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Tidak ada sesi yang ditemukan
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingId === session.id;
              const activeIter =
                session.iterations.find((it) => it.id === session.activeIterationId) ||
                session.iterations[session.iterations.length - 1];

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`group p-3 rounded-2xl border transition-all cursor-pointer relative ${
                    isActive
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing(session, e as any);
                              if (e.key === 'Escape') handleCancelEdit(e as any);
                            }}
                            autoFocus
                            className="w-full px-2 py-1 text-xs font-bold rounded-lg border border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={(e) => saveEditing(session, e)}
                            className="p-1 rounded text-green-600 hover:bg-green-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1 rounded text-slate-400 hover:bg-slate-100"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <h4
                          className={`text-xs font-black truncate ${
                            isActive
                              ? 'text-blue-700 dark:text-blue-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {session.title}
                        </h4>
                      )}

                      <div className="flex items-center gap-2 mt-1.5 text-[10.5px] text-slate-400 dark:text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDateIndonesian(session.updatedAt)}</span>
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-600 dark:text-slate-400">
                          {session.iterations.length} Versi
                        </span>
                      </div>
                    </div>

                    {/* ACTION BUTTONS (EDIT / DELETE) */}
                    <div
                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => startEditing(session, e)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Ubah Nama Sesi"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      {sessions.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Hapus sesi "${session.title}"?`)) {
                              onDeleteSession(session.id);
                            }
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Hapus Sesi"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
