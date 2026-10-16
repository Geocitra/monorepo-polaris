'use client';

import { useState } from 'react';
import {
  X,
  Plus,
  MessageSquare,
  Clock,
  Trash2,
  Search,
  Sparkles,
  ChevronRight,
  FileText,
  Globe,
  Loader2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

export interface StudioSessionItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED' | string;
  wordCount?: number;
  publishedAt?: string | null;
  createdAt: string;
}

interface TerpaduSessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: StudioSessionItem[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateNewSession: () => void;
  onDeleteSession: (sessionId: string) => Promise<void>;
  loadingDetailId?: string | null;
}

export function TerpaduSessionDrawer({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateNewSession,
  onDeleteSession,
  loadingDetailId,
}: TerpaduSessionDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionToDelete, setSessionToDelete] = useState<StudioSessionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.excerpt && s.excerpt.toLowerCase().includes(q))
    );
  });

  // Pengelompokan sesi berbasis waktu
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDays = 7 * oneDay;

  const todaySessions: StudioSessionItem[] = [];
  const yesterdaySessions: StudioSessionItem[] = [];
  const last7DaysSessions: StudioSessionItem[] = [];
  const olderSessions: StudioSessionItem[] = [];

  for (const session of filteredSessions) {
    const sessionTime = new Date(session.createdAt).getTime();
    const diff = now - sessionTime;
    if (diff < oneDay) {
      todaySessions.push(session);
    } else if (diff < 2 * oneDay) {
      yesterdaySessions.push(session);
    } else if (diff < sevenDays) {
      last7DaysSessions.push(session);
    } else {
      olderSessions.push(session);
    }
  }

  function formatRelativeDate(dateStr: string) {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  }

  async function handleConfirmDelete() {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteSession(sessionToDelete.id);
      setSessionToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  function renderGroup(title: string, items: StudioSessionItem[]) {
    if (items.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="px-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center justify-between">
          <span>{title}</span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400">{items.length} sesi</span>
        </div>
        <div className="space-y-1.5">
          {items.map((session) => {
            const isActive = activeSessionId === session.id;
            const isLoadingThis = loadingDetailId === session.id;

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isActive
                    ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-xs'
                    : 'bg-white dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                }`}
              >
                {/* Baris Atas: Ikon, Judul, & Tombol Hapus */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'
                      }`}
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <h5
                      className={`text-xs font-bold truncate ${
                        isActive
                          ? 'text-blue-900 dark:text-blue-200'
                          : 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}
                    >
                      {session.title || 'Sesi Tanpa Judul'}
                    </h5>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSessionToDelete(session);
                    }}
                    title="Hapus sesi ini"
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Ringkasan Isi */}
                {session.excerpt && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {session.excerpt}
                  </p>
                )}

                {/* Footer Kartu: Badge Status & Tanggal */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    {session.status === 'PUBLISHED' ? (
                      <span className="inline-flex items-center gap-1 font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
                        <Globe className="w-2.5 h-2.5" />
                        <span>Tayang</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md">
                        <FileText className="w-2.5 h-2.5" />
                        <span>Draft</span>
                      </span>
                    )}
                    {session.wordCount ? (
                      <span>• {session.wordCount.toLocaleString('id-ID')} kata</span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatRelativeDate(session.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-50 dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200/90 dark:border-slate-800 animate-in slide-in-from-right duration-250">
          {/* Header Drawer */}
          <div className="p-4 sm:p-5 border-b border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Riwayat Chat & Konten AI</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                    {sessions.length} Sesi
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Daftar obrolan & draf konten yang telah Anda buat
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Bar: Tombol Buat Chat Baru */}
          <div className="p-3.5 px-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex flex-col gap-2.5">
            <Button
              type="button"
              onClick={() => {
                onCreateNewSession();
                onClose();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-9 rounded-xl gap-1.5 shadow-xs cursor-pointer justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Chat Baru</span>
            </Button>

            {/* Kolom Pencarian Cepat */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari topik atau judul konten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* List Riwayat Berkelompok */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {searchQuery ? 'Tidak Ada Chat yang Cocok' : 'Belum Ada Riwayat Chat'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  {searchQuery
                    ? 'Coba gunakan kata kunci pencarian yang lain.'
                    : 'Setiap kali Anda berdiskusi atau membuat konten dengan AI, riwayatnya akan tersimpan di sini.'}
                </p>
              </div>
            ) : (
              <>
                {renderGroup('Hari Ini', todaySessions)}
                {renderGroup('Kemarin', yesterdaySessions)}
                {renderGroup('7 Hari Terakhir', last7DaysSessions)}
                {renderGroup('Sebelumnya', olderSessions)}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Dialog Konfirmasi Hapus Sesi */}
      <Modal
        isOpen={Boolean(sessionToDelete)}
        onClose={() => {
          if (!isDeleting) setSessionToDelete(null);
        }}
        title="Hapus Sesi Riwayat"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-100 dark:border-red-900/60">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-red-950 dark:text-red-200">
                Hapus riwayat konten ini?
              </p>
              <p className="text-red-700 dark:text-red-300/80 leading-relaxed">
                Naskah artikel, poster DALL-E, dan paket media sosial untuk topik ini akan dihapus dari riwayat studio Anda.
              </p>
            </div>
          </div>

          {sessionToDelete && (
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {sessionToDelete.title}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setSessionToDelete(null)}
              className="font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl gap-1.5 shadow-xs cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Sesi</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
