'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  MessageCircle,
  Send,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Search,
  Check,
  Calendar,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import {
  AssignedTenant,
  LiveChatSessionItem,
  LiveChatMessageItem,
} from './types';

interface OperatorLiveChatPanelProps {
  selectedDewan?: AssignedTenant;
  onConvertToBrief?: (initialTopic: string) => void;
}

const CONTACT_LEAK_REGEX_LIST: Array<{ regex: RegExp; warning: string }> = [
  {
    regex: /(?:\+62|62|0)\s*8[1-9][0-9\s.\-]{6,13}/i,
    warning: 'Pesan mengandung nomor telepon / WhatsApp pribadi.',
  },
  {
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i,
    warning: 'Pesan mengandung alamat email pribadi.',
  },
  {
    regex: /\b(?:https?:\/\/|www\.|wa\.me\/|t\.me\/|bit\.ly\/)/i,
    warning: 'Pesan mengandung tautan eksternal.',
  },
  {
    regex: /(?:^|\s)@[a-zA-Z0-9_.]{3,30}\b/i,
    warning: 'Pesan mengandung username sosial media (@username).',
  },
];

function checkClientSideContactLeak(text: string): string | null {
  for (const item of CONTACT_LEAK_REGEX_LIST) {
    if (item.regex.test(text)) {
      return item.warning;
    }
  }
  return null;
}

export function OperatorLiveChatPanel({
  selectedDewan,
  onConvertToBrief,
}: OperatorLiveChatPanelProps) {
  const [sessions, setSessions] = useState<LiveChatSessionItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LiveChatMessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [leakWarning, setLeakWarning] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'WAITING' | 'ACTIVE' | 'CLOSED'>('ALL');
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApiClient.request<LiveChatSessionItem[]>('/whatsapp/live-chat/sessions');
      const list = Array.isArray(res) ? res : [];
      setSessions(list);

      if (list.length > 0) {
        setSelectedSessionId((prev: string | null) => {
          if (prev && list.some((s: LiveChatSessionItem) => s.id === prev)) return prev;
          // Prioritize WAITING or ACTIVE session
          const activeOrWaiting = list.find(
            (s: LiveChatSessionItem) => s.status === 'WAITING_OPERATOR' || s.status === 'ACTIVE'
          );
          return activeOrWaiting ? activeOrWaiting.id : list[0].id;
        });
      }
    } catch (err: any) {
      console.error('Failed to load live chat sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      setMessagesLoading(true);
      const res = await AdminApiClient.request<LiveChatMessageItem[]>(
        `/whatsapp/live-chat/sessions/${sessionId}/messages`
      );
      setMessages(Array.isArray(res) ? res : []);
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      console.error('Failed to load session messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 7000);
    return () => clearInterval(interval);
  }, [loadSessions]);

  useEffect(() => {
    if (selectedSessionId) {
      loadMessages(selectedSessionId);
      const msgInterval = setInterval(() => {
        loadMessages(selectedSessionId);
      }, 5000);
      return () => clearInterval(msgInterval);
    }
  }, [selectedSessionId, loadMessages]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const handleAcceptSession = async (sessionId: string) => {
    try {
      setActionLoading(true);
      await AdminApiClient.request(`/whatsapp/live-chat/sessions/${sessionId}/accept`, {
        method: 'POST',
      });
      setActionFeedback({
        type: 'success',
        text: 'Sesi berhasil diterima! Anda kini terhubung langsung dengan klien.',
      });
      await loadSessions();
      await loadMessages(sessionId);
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.message || 'Gagal menerima sesi obrolan.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSessionId || !inputText.trim() || sending) return;

    const leak = checkClientSideContactLeak(inputText);
    if (leak) {
      setLeakWarning(leak);
      return;
    }
    setLeakWarning(null);

    try {
      setSending(true);
      await AdminApiClient.request(
        `/whatsapp/live-chat/sessions/${selectedSessionId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ textBody: inputText.trim() }),
        }
      );
      setInputText('');
      await loadMessages(selectedSessionId);
      await loadSessions();
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.message || 'Gagal mengirim pesan balasan.',
      });
    } finally {
      setSending(false);
    }
  };

  const handleAskCompletion = async () => {
    if (!selectedSessionId) return;
    try {
      setActionLoading(true);
      await AdminApiClient.request(
        `/whatsapp/live-chat/sessions/${selectedSessionId}/ask-completion`,
        { method: 'POST' }
      );
      setActionFeedback({
        type: 'success',
        text: 'Pertanyaan konfirmasi selesai telah dikirim ke WhatsApp klien.',
      });
      await loadMessages(selectedSessionId);
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.message || 'Gagal mengirim konfirmasi selesai.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!selectedSessionId) return;
    try {
      setActionLoading(true);
      await AdminApiClient.request(
        `/whatsapp/live-chat/sessions/${selectedSessionId}/close`,
        { method: 'POST' }
      );
      setActionFeedback({
        type: 'success',
        text: 'Sesi obrolan ditutup dan survei kepuasan (CSAT) telah dikirim ke WhatsApp klien.',
      });
      await loadSessions();
      await loadMessages(selectedSessionId);
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.message || 'Gagal mengakhiri sesi obrolan.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSessions = sessions.filter((s: LiveChatSessionItem) => {
    if (filterStatus === 'WAITING' && s.status !== 'WAITING_OPERATOR') return false;
    if (filterStatus === 'ACTIVE' && s.status !== 'ACTIVE') return false;
    if (filterStatus === 'CLOSED' && s.status !== 'CLOSED' && s.status !== 'AWAITING_FEEDBACK') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.sessionCode.toLowerCase().includes(q) ||
        s.tenantFullName.toLowerCase().includes(q) ||
        (s.clientInitialTopic && s.clientInitialTopic.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const waitingCount = sessions.filter((s) => s.status === 'WAITING_OPERATOR').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Alert Banner jika ada klien dalam antrean */}
      {waitingCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 animate-pulse">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900 dark:text-amber-200">
                🚨 Ada {waitingCount} Sesi Diskusi Klien Sedang Menunggu Editor!
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Klien sedang berada dalam antrean bot WhatsApp. Segera klik &quot;Terima Diskusi&quot; untuk memulai percakapan dua arah.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFilterStatus('WAITING')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
          >
            Lihat Antrean ({waitingCount})
          </button>
        </div>
      )}

      {/* Feedback Toast Banner */}
      {actionFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{actionFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-xs underline hover:opacity-80"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Grid: Kolom Kiri (Daftar Sesi) & Kolom Kanan (Layar Chat Dua Arah) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        {/* KOLOM KIRI: DAFTAR SESI DISKUSI */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>Antrean Diskusi Langsung</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                {sessions.length} sesi terdata
              </span>
            </div>
            <button
              type="button"
              onClick={loadSessions}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
              title="Segarkan antrean"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
          </div>

          {/* Filter Status Pill */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto scrollbar-none pb-1">
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                filterStatus === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('WAITING')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 flex items-center gap-1 ${
                filterStatus === 'WAITING'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
            >
              <span>Antrean</span>
              {waitingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-amber-700 text-[10px] flex items-center justify-center font-black">
                  {waitingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('ACTIVE')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                filterStatus === 'ACTIVE'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              Aktif
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('CLOSED')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                filterStatus === 'CLOSED'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Selesai
            </button>
          </div>

          {/* Search Box */}
          <div className="relative mt-2.5">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode sesi atau nama dewan..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Session Cards List */}
          <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1 max-h-[520px]">
            {filteredSessions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Tidak ada sesi obrolan yang sesuai filter.
              </div>
            ) : (
              filteredSessions.map((s) => {
                const isSelected = s.id === selectedSessionId;
                const isWaiting = s.status === 'WAITING_OPERATOR';
                const isActive = s.status === 'ACTIVE';

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition relative ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        #{s.sessionCode}
                      </span>
                      {isWaiting ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
                          Antrean Masuk
                        </span>
                      ) : isActive ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                          Sedang Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Ditutup
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      {s.tenantFullName}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                      <span>WA: {s.tenantPhoneNumber}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(s.lastMessageAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* CSAT Chip if available */}
                    {s.csatRating && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center gap-1.5 text-[10px] font-bold">
                        {s.csatRating === 'SATISFIED' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-emerald-500" />
                            Klien Puas ⭐
                          </span>
                        ) : (
                          <span className="text-rose-500 flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3" />
                            Kurang Puas
                          </span>
                        )}
                        {s.firstResponseSeconds !== null && (
                          <span className="text-slate-400 ml-auto">
                            FRT: {s.firstResponseSeconds}s
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* KOLOM KANAN: CHAT VIEW & OPERATOR CONSOLE */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-xs overflow-hidden">
          {!selectedSession ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Pilih Sesi Obrolan di Panel Kiri
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Lihat riwayat obrolan langsung antara klien WhatsApp dan Tim Redaksi, atau terima antrean obrolan baru.
              </p>
            </div>
          ) : (
            <>
              {/* Header Sesi Aktif */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {selectedSession.tenantFullName}
                      </h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        #{selectedSession.sessionCode}
                      </span>
                      {selectedSession.isOffHours && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          🌙 Luar Jam Kerja
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>WA: {selectedSession.tenantPhoneNumber}</span>
                      <span>•</span>
                      <span>
                        Editor:{' '}
                        {selectedSession.assignedOperatorName ||
                          (selectedSession.status === 'WAITING_OPERATOR'
                            ? 'Belum diklaim'
                            : 'Editor Redaksi')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi Header */}
                <div className="flex items-center gap-2">
                  {selectedSession.status === 'WAITING_OPERATOR' ? (
                    <button
                      type="button"
                      onClick={() => handleAcceptSession(selectedSession.id)}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>⚡ Terima Diskusi &amp; Balas Chat</span>
                    </button>
                  ) : selectedSession.status === 'ACTIVE' ? (
                    <>
                      <button
                        type="button"
                        onClick={handleAskCompletion}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                        title="Tanyakan ke WhatsApp klien apakah sesi sudah selesai"
                      >
                        <span>❓ Konfirmasi Selesai</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCloseSession}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        title="Tutup sesi dan kirim survei CSAT bintang kepuasan"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Akhiri &amp; Picu CSAT</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Sesi Selesai</span>
                      {selectedSession.csatRating && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 text-[11px]">
                          CSAT: {selectedSession.csatRating === 'SATISFIED' ? '⭐ Puas' : 'Kurang Puas'}
                        </span>
                      )}
                    </div>
                  )}

                  {onConvertToBrief && selectedSession.clientInitialTopic && (
                    <button
                      type="button"
                      onClick={() => onConvertToBrief(selectedSession.clientInitialTopic || '')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      title="Salin arahan diskusi ini menjadi tiket konten baru"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Jadikan Bahan Artikel</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Timeline (Pesan Klien vs Operator) */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[460px] bg-slate-100/40 dark:bg-[#070A11]">
                {/* Notice Blind Broker */}
                <div className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Percakapan ini dijembatani Bot Resmi Polaris. Nomor telepon klien dan kontak pribadi operator terlindungi secara otomatis.
                  </span>
                </div>

                {messagesLoading && messages.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Memuat riwayat percakapan...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Belum ada pesan pada sesi ini. Klien sedang menunggu balasan.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isClient = m.senderType === 'CLIENT';
                    const isSystem = m.senderType === 'SYSTEM';

                    if (isSystem) {
                      return (
                        <div
                          key={m.id}
                          className="text-center text-[11px] text-slate-400 py-1"
                        >
                          {m.textBody}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          isClient ? 'items-start' : 'items-end'
                        }`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl p-3 shadow-xs ${
                            isClient
                              ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                              : 'bg-emerald-600 text-white rounded-tr-none'
                          }`}
                        >
                          <div
                            className={`text-[10px] font-black uppercase mb-1 flex items-center gap-1.5 ${
                              isClient
                                ? 'text-slate-400 dark:text-slate-500'
                                : 'text-emerald-100'
                            }`}
                          >
                            <span>
                              {isClient
                                ? `${selectedSession.tenantFullName} (via WA)`
                                : `${m.senderName || 'Editor Redaksi'}`}
                            </span>
                          </div>

                          {m.textBody && (
                            <p className="text-xs whitespace-pre-wrap leading-relaxed">
                              {m.textBody}
                            </p>
                          )}

                          {m.mediaCdnUrl && (
                            <div className="mt-2">
                              {m.mediaMimeType?.startsWith('image/') ? (
                                <a
                                  href={m.mediaCdnUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <img
                                    src={m.mediaCdnUrl}
                                    alt="Lampiran Media"
                                    className="max-h-48 rounded-lg object-cover border border-slate-200/40"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={m.mediaCdnUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`text-xs underline flex items-center gap-1.5 ${
                                    isClient ? 'text-indigo-600' : 'text-white'
                                  }`}
                                >
                                  📎 Unduh Dokumen ({m.mediaFileName || 'Berkas'})
                                </a>
                              )}
                            </div>
                          )}

                          <div
                            className={`text-[9px] mt-1.5 text-right ${
                              isClient ? 'text-slate-400' : 'text-emerald-100'
                            }`}
                          >
                            {new Date(m.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form Balas Pesan Operator */}
              {selectedSession.status === 'ACTIVE' ? (
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0B0F19]"
                >
                  {leakWarning && (
                    <div className="mb-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{leakWarning} Harap hapus kontak pribadi sebelum mengirim.</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        if (leakWarning) setLeakWarning(null);
                      }}
                      placeholder={`Balas sebagai Editor Redaksi ke WhatsApp ${selectedSession.tenantFullName}...`}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={sending || !inputText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sending ? 'Mengirim...' : 'Kirim'}</span>
                    </button>
                  </div>
                </form>
              ) : selectedSession.status === 'WAITING_OPERATOR' ? (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20 text-center">
                  <p className="text-xs text-amber-800 dark:text-amber-300 mb-2">
                    Sesi ini belum diklaim oleh Operator manapun. Klien masih menunggu sambungan pertama.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAcceptSession(selectedSession.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>⚡ Terima &amp; Hubungkan Diskusi Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center text-xs text-slate-400 font-medium">
                  Sesi obrolan ini telah ditutup. Riwayat diarsipkan untuk evaluasi kepuasan dan KPI.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
