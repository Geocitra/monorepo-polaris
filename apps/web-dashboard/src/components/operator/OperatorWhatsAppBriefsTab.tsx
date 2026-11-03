'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  MessageCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Send,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Flame,
  Calendar,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import {
  AssignedTenant,
  AttachedFileItem,
  ContentBriefItem,
  TenantWeeklyBriefQuota,
  BriefMessageItem,
} from './types';

interface OperatorWhatsAppBriefsTabProps {
  selectedDewan: AssignedTenant;
  onHydrateBriefToStudio: (payload: {
    brief: ContentBriefItem;
    topicPrompt: string;
    attachments: AttachedFileItem[];
  }) => void;
  onOpenLinkedArticle?: (publicationId: string, brief: ContentBriefItem) => void;
  onBriefStatsChanged?: () => void;
}

const CONTACT_LEAK_REGEX_LIST: Array<{ regex: RegExp; warning: string }> = [
  {
    regex: /(?:\+62|62|0)\s*8[1-9][0-9\s.\-]{6,13}/i,
    warning: 'Pesan mengandung format nomor telepon/WhatsApp pribadi.',
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
    warning: 'Pesan mengandung username/handle media sosial (@username).',
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

function getStatusBadgeConfig(status: ContentBriefItem['status']) {
  switch (status) {
    case 'SUBMITTED':
      return {
        label: '📥 Baru Masuk',
        cls: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700',
      };
    case 'IN_PROGRESS':
    case 'ACCEPTED':
      return {
        label: '⚙️ Sedang Dikerjakan',
        cls: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
      };
    case 'NEED_CLARIFICATION':
      return {
        label: '💬 Diskusi / Klarifikasi',
        cls: 'bg-sky-100 text-sky-900 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-700',
      };
    case 'READY_FOR_REVIEW':
      return {
        label: '👀 Menunggu Review Klien',
        cls: 'bg-violet-100 text-violet-900 dark:bg-violet-950/60 dark:text-violet-300 border-violet-300 dark:border-violet-700',
      };
    case 'REVISION_REQUESTED':
      return {
        label: '✏️ Minta Revisi',
        cls: 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700',
      };
    case 'QUEUED_NEXT_WEEK':
      return {
        label: '🗓️ Antrean Minggu Depan',
        cls: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
      };
    case 'APPROVED':
    case 'PUBLISHED':
      return {
        label: '✅ Selesai & Tayang',
        cls: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
      };
    case 'REJECTED':
      return {
        label: '❌ Ditolak (Bebas Kuota)',
        cls: 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-500 border-slate-300 dark:border-slate-800',
      };
    default:
      return {
        label: status,
        cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
      };
  }
}

export function OperatorWhatsAppBriefsTab({
  selectedDewan,
  onHydrateBriefToStudio,
  onOpenLinkedArticle,
  onBriefStatsChanged,
}: OperatorWhatsAppBriefsTabProps) {
  const [briefs, setBriefs] = useState<ContentBriefItem[]>([]);
  const [weeklyQuota, setWeeklyQuota] = useState<TenantWeeklyBriefQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DONE'>('ALL');

  // Action states
  const [hydratingStudio, setHydratingStudio] = useState(false);
  const [acceptingBrief, setAcceptingBrief] = useState(false);
  const [rejectingBrief, setRejectingBrief] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [togglingFaultMsgId, setTogglingFaultMsgId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadBriefsForTenant = useCallback(async () => {
    if (!selectedDewan?.tenantId) return;
    try {
      setLoading(true);
      const res = await AdminApiClient.request<{
        briefs: ContentBriefItem[];
        weeklyQuota?: TenantWeeklyBriefQuota;
      }>(`/whatsapp/briefs?tenantId=${encodeURIComponent(selectedDewan.tenantId)}`);

      const list = Array.isArray(res?.briefs) ? res.briefs : [];
      setBriefs(list);
      if (res?.weeklyQuota) {
        setWeeklyQuota(res.weeklyQuota);
      }

      if (list.length > 0) {
        setSelectedBriefId((prev) =>
          prev && list.some((b) => b.id === prev) ? prev : list[0].id
        );
      } else {
        setSelectedBriefId(null);
      }
    } catch (err: any) {
      console.error('Gagal memuat daftar tiket WhatsApp Brief:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDewan?.tenantId]);

  useEffect(() => {
    loadBriefsForTenant();
  }, [loadBriefsForTenant]);

  const selectedBrief = briefs.find((b) => b.id === selectedBriefId) || briefs[0] || null;
  const leakWarning = replyText.trim() ? checkClientSideContactLeak(replyText) : null;

  const filteredBriefs = briefs.filter((b) => {
    if (statusFilter === 'ACTIVE') {
      return !['PUBLISHED', 'APPROVED', 'REJECTED'].includes(b.status);
    }
    if (statusFilter === 'DONE') {
      return ['PUBLISHED', 'APPROVED', 'REJECTED'].includes(b.status);
    }
    return true;
  });

  const handleAcceptBrief = async (priority: 'URGENT' | 'NORMAL') => {
    if (!selectedBrief || acceptingBrief) return;
    try {
      setAcceptingBrief(true);
      setActionFeedback(null);
      const res = await AdminApiClient.request<{
        brief: ContentBriefItem;
        weeklyQuota: TenantWeeklyBriefQuota;
      }>(`/whatsapp/briefs/${selectedBrief.id}/accept`, {
        method: 'POST',
        body: JSON.stringify({ operatorPriority: priority }),
      });

      if (res?.brief) {
        setBriefs((prev) => prev.map((b) => (b.id === res.brief.id ? res.brief : b)));
      }
      if (res?.weeklyQuota) {
        setWeeklyQuota(res.weeklyQuota);
      }
      setActionFeedback({
        type: 'success',
        text: `Tiket #${selectedBrief.briefCode} diterima (${
          priority === 'URGENT' ? 'Prioritas Mendesak' : 'Prioritas Normal'
        }) & notifikasi WA telah dikirim ke klien.`,
      });
      onBriefStatsChanged?.();
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.message || 'Gagal menerima tiket request.',
      });
    } finally {
      setAcceptingBrief(false);
    }
  };

  const handleRejectBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrief || !rejectReason.trim() || rejectingBrief) return;
    try {
      setRejectingBrief(true);
      setActionFeedback(null);
      const updated = await AdminApiClient.request<ContentBriefItem>(
        `/whatsapp/briefs/${selectedBrief.id}/reject`,
        {
          method: 'POST',
          body: JSON.stringify({ reason: rejectReason.trim() }),
        }
      );

      setBriefs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setRejectReason('');
      setShowRejectBox(false);
      setActionFeedback({
        type: 'success',
        text: `Tiket #${selectedBrief.briefCode} ditolak tanpa memotong jatah mingguan klien.`,
      });
      onBriefStatsChanged?.();
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.message || 'Gagal menolak tiket.',
      });
    } finally {
      setRejectingBrief(false);
    }
  };

  const handleSendClarificationOrReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrief || !replyText.trim() || sendingReply || leakWarning) return;
    try {
      setSendingReply(true);
      setActionFeedback(null);
      const updated = await AdminApiClient.request<ContentBriefItem>(
        `/whatsapp/briefs/${selectedBrief.id}/clarify`,
        {
          method: 'POST',
          body: JSON.stringify({ questionText: replyText.trim() }),
        }
      );

      setBriefs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setReplyText('');
      setActionFeedback({
        type: 'success',
        text: 'Pesan balasan berhasil diteruskan ke WhatsApp klien melalui Broker Polaris.',
      });
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.message || 'Gagal mengirim pesan ke WhatsApp klien.',
      });
    } finally {
      setSendingReply(false);
    }
  };

  const handleToggleInternalFault = async (msg: BriefMessageItem) => {
    if (!selectedBrief || togglingFaultMsgId) return;
    try {
      setTogglingFaultMsgId(msg.id);
      setActionFeedback(null);
      const updated = await AdminApiClient.request<ContentBriefItem>(
        `/whatsapp/briefs/${selectedBrief.id}/revision-fault`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            messageId: msg.id,
            isInternalFault: !msg.isInternalFault,
          }),
        }
      );
      setBriefs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setActionFeedback({
        type: 'success',
        text: !msg.isInternalFault
          ? 'Ditandai sebagai koreksi internal (jatah revisi klien dikembalikan 1 putaran).'
          : 'Dikembalikan sebagai putaran revisi normal klien.',
      });
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.message || 'Gagal mengubah status kesalahan revisi.',
      });
    } finally {
      setTogglingFaultMsgId(null);
    }
  };

  const handleHydrateToStudio = async () => {
    if (!selectedBrief || hydratingStudio) return;
    try {
      setHydratingStudio(true);
      setActionFeedback(null);
      const res = await AdminApiClient.request<{
        brief: ContentBriefItem;
        weeklyQuota: TenantWeeklyBriefQuota;
        topicPrompt: string;
        attachments: AttachedFileItem[];
      }>(`/whatsapp/briefs/${selectedBrief.id}/hydrate-studio`, {
        method: 'POST',
      });

      if (res?.brief) {
        setBriefs((prev) => prev.map((b) => (b.id === res.brief.id ? res.brief : b)));
      }
      if (res?.weeklyQuota) {
        setWeeklyQuota(res.weeklyQuota);
      }
      onBriefStatsChanged?.();

      onHydrateBriefToStudio({
        brief: res.brief,
        topicPrompt: res.topicPrompt,
        attachments: Array.isArray(res.attachments) ? res.attachments : [],
      });
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.message || 'Gagal memuat bahan brief ke Pabrik Konten.',
      });
    } finally {
      setHydratingStudio(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. RINGKASAN KUOTA MINGGUAN KLIEN & STATUS BROKER WA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-[#0B0F19] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Kotak Masuk &amp; Broker WhatsApp — {selectedDewan.fullName}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Blind Broker Protection Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Klien mengirim topik, foto kegiatan, dokumen PDF/Word, serta berdiskusi langsung via Bot Resmi Polaris tanpa mengekspos kontak pribadi kedua pihak.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadBriefsForTenant}
            disabled={loading}
            className="self-end sm:self-center shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>

        {/* Kartu Jatah Request Mingguan (Reset Senin 00:00 WIB) */}
        <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Jatah Request Minggu Ini ({weeklyQuota?.weeklyQuotaPeriod || 'WIB'})</span>
            </span>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
              {weeklyQuota ? `${weeklyQuota.weeklyUsed} / ${weeklyQuota.weeklyLimit}` : '0 / 3'} Terpakai
            </span>
          </div>

          <div className="my-2.5 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${
                  weeklyQuota && weeklyQuota.weeklyLimit > 0
                    ? Math.min(100, Math.round((weeklyQuota.weeklyUsed / weeklyQuota.weeklyLimit) * 100))
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Sisa Jatah: <strong className="text-slate-800 dark:text-slate-200">{weeklyQuota?.weeklyRemaining ?? 3} request</strong>
            </span>
            <span>
              Antrean Minggu Depan: <strong className="text-amber-600 dark:text-amber-400">{weeklyQuota?.queuedNextWeekCount ?? 0}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* BANNER FEEDBACK AKSI */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-[11px] underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 2. MASTER-DETAIL LAYOUT: DAFTAR TIKET KIRI & THREAD PERCAKAPAN KANAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* KOLOM KIRI: DAFTAR TIKET BRIEF */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Daftar Tiket ({filteredBriefs.length})
            </span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg">
              {(['ALL', 'ACTIVE', 'DONE'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                    statusFilter === f
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  {f === 'ALL' ? 'Semua' : f === 'ACTIVE' ? 'Aktif' : 'Selesai'}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[640px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Memuat tiket WhatsApp...</span>
              </div>
            ) : filteredBriefs.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageCircle className="w-7 h-7 text-slate-300 dark:text-slate-700 mx-auto" />
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Belum Ada Tiket Request WhatsApp
                </div>
                <p className="text-[11px] text-slate-400">
                  Saat {selectedDewan.fullName} mengirim topik, foto kegiatan, atau pesan diskusi ke nomor WA Polaris, tiket akan otomatis muncul di sini.
                </p>
              </div>
            ) : (
              filteredBriefs.map((item) => {
                const isSelected = selectedBrief?.id === item.id;
                const badge = getStatusBadgeConfig(item.status);
                const mediaCount = item.messages.filter(
                  (m) => m.direction === 'INBOUND' && (m.messageType === 'IMAGE' || m.messageType === 'DOCUMENT')
                ).length;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedBriefId(item.id);
                      setShowRejectBox(false);
                      setActionFeedback(null);
                    }}
                    className={`w-full text-left p-3.5 transition cursor-pointer block ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-l-4 border-l-indigo-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                          #{item.briefCode}
                        </span>
                        {item.clientUrgency === 'URGENT' && (
                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black bg-rose-500 text-white flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" /> MENDESAK
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mt-1.5 leading-snug">
                      {item.topicSummary}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>
                        📎 {mediaCount} lampiran • 🔄 Revisi {item.revisionUsed}/{item.revisionLimit}
                      </span>
                      <span>
                        {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* KOLOM KANAN: DETAIL TIKET, LAMPIRAN MEDIA, TOMBOL AKSI STUDIO, & LIVE CHAT BROKER */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col">
          {!selectedBrief ? (
            <div className="p-12 text-center my-auto space-y-2">
              <MessageCircle className="w-9 h-9 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Pilih Tiket Request di Sebelah Kiri
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Anda dapat meninjau lampiran foto/dokumen klien, memuat seluruh bahan ke Pabrik Konten 1-klik, atau membalas pesan diskusi klien melalui Broker WhatsApp.
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full divide-y divide-slate-100 dark:divide-slate-800">
              {/* HEADER DETAIL TIKET & TOMBOL UTAMA */}
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">
                        #{selectedBrief.briefCode}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          getStatusBadgeConfig(selectedBrief.status).cls
                        }`}
                      >
                        {getStatusBadgeConfig(selectedBrief.status).label}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          selectedBrief.clientUrgency === 'URGENT'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        Sinyal Klien: {selectedBrief.clientUrgency === 'URGENT' ? '🔴 Mendesak' : '🟢 Normal'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        WA Masked: {selectedBrief.tenantMaskedPhone}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug pt-1">
                      {selectedBrief.topicSummary}
                    </h4>
                  </div>

                  {/* TOMBOL 1-KLIK MUAT KE PABRIK KONTEN */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      disabled={hydratingStudio}
                      onClick={handleHydrateToStudio}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-black shadow-md shadow-indigo-500/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      {hydratingStudio ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Memuat Bahan &amp; Lampiran...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Muat Bahan ke Pabrik Konten</span>
                        </>
                      )}
                    </button>

                    {selectedBrief.linkedPublicationId && onOpenLinkedArticle && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenLinkedArticle(selectedBrief.linkedPublicationId!, selectedBrief)
                        }
                        className="px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Draf Hasil</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* BARIS KONTROL PENERIMAAN / PENOLAKAN TIKET & STATUS KOMPONEN REVISI */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="font-bold text-slate-500">Status Komponen:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      📰 Artikel: <strong>{selectedBrief.articleStatus}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      🖼️ Poster: <strong>{selectedBrief.imageStatus}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      💬 Caption: <strong>{selectedBrief.captionStatus}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                      🔄 Putaran Revisi: {selectedBrief.revisionUsed} / {selectedBrief.revisionLimit}
                    </span>
                  </div>

                  {selectedBrief.status === 'SUBMITTED' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled={acceptingBrief}
                        onClick={() => handleAcceptBrief('URGENT')}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Terima (Prioritas Mendesak)</span>
                      </button>
                      <button
                        type="button"
                        disabled={acceptingBrief}
                        onClick={() => handleAcceptBrief('NORMAL')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Terima (Jadwal Normal)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectBox((prev) => !prev)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tolak (Tanpa Potong Kuota)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* KOTAK INPUT PENOLAKAN TIKET */}
                {showRejectBox && (
                  <form
                    onSubmit={handleRejectBrief}
                    className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2.5"
                  >
                    <label className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                      Alasan Penolakan Tiket (Akan dikirimkan ke WhatsApp Klien &amp; Tidak Memotong Kuota Mingguan):
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        required
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Contoh: Lampiran dokumen tidak terbaca / bukan topik layanan publik..."
                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-slate-900 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={rejectingBrief || !rejectReason.trim()}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        {rejectingBrief ? 'Memproses...' : 'Konfirmasi Tolak'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* RIWAYAT PERCAKAPAN & LAMPIRAN MEDIA */}
              <div className="p-4 sm:p-5 space-y-3 max-h-[420px] overflow-y-auto bg-slate-50/60 dark:bg-slate-950/40">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Riwayat Bahan, Lampiran &amp; Diskusi Dua Arah ({selectedBrief.messages.length} item)</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Dijembatani Bot Resmi Polaris
                  </span>
                </div>

                {selectedBrief.messages.map((msg) => {
                  const isInbound = msg.direction === 'INBOUND';
                  const isRevisionMsg = isInbound && msg.revisionRound > 0;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-xl rounded-2xl p-3.5 border space-y-2 ${
                          isInbound
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                            : 'bg-indigo-600 text-white border-indigo-600'
                        }`}
                      >
                        {/* Header Bubble */}
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-80">
                          <span className="font-black uppercase">
                            {isInbound
                              ? `👤 ${selectedBrief.tenantFullName} (via WA)`
                              : '👨‍💼 Tim Redaksi Polaris'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(msg.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Badge Revisi & Komponen */}
                        {isRevisionMsg && (
                          <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                                Putaran Revisi #{msg.revisionRound}
                              </span>
                              {msg.targetComponents?.map((comp) => (
                                <span
                                  key={comp}
                                  className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                                >
                                  {comp}
                                </span>
                              ))}
                              {msg.isInternalFault && (
                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800">
                                  ✓ Koreksi Internal (Bebas Kuota Revisi)
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              disabled={togglingFaultMsgId === msg.id}
                              onClick={() => handleToggleInternalFault(msg)}
                              className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                              title="Tandai sebagai kesalahan internal jika revisi disebabkan oleh kekeliruan redaksi agar tidak memotong jatah revisi klien"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>
                                {msg.isInternalFault
                                  ? 'Kembalikan ke Revisi Klien'
                                  : 'Tandai Kesalahan Internal (Bebas Kuota)'}
                              </span>
                            </button>
                          </div>
                        )}

                        {/* Lampiran Gambar */}
                        {msg.messageType === 'IMAGE' && msg.mediaCdnUrl && (
                          <div className="pt-1">
                            <a
                              href={msg.mediaCdnUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 max-w-xs"
                            >
                              <img
                                src={msg.mediaCdnUrl}
                                alt={msg.mediaFileName || 'Lampiran Foto WA'}
                                className="max-h-56 w-auto object-contain mx-auto"
                              />
                            </a>
                            <span className="text-[10px] opacity-75 flex items-center gap-1 mt-1">
                              <ImageIcon className="w-3 h-3" />
                              {msg.mediaFileName || 'Foto Kegiatan Lapangan'}
                            </span>
                          </div>
                        )}

                        {/* Lampiran Dokumen PDF / Word */}
                        {msg.messageType === 'DOCUMENT' && (
                          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold truncate">
                                  {msg.mediaFileName || 'Dokumen Lampiran Klien'}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {msg.mediaMimeType || 'Dokumen'} •{' '}
                                  {msg.mediaFileSizeBytes
                                    ? `${(msg.mediaFileSizeBytes / 1024).toFixed(1)} KB`
                                    : 'Tersimpan di R2'}
                                </div>
                              </div>
                            </div>
                            {msg.mediaCdnUrl && (
                              <a
                                href={msg.mediaCdnUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold shrink-0 hover:bg-indigo-700"
                              >
                                Buka Berkas
                              </a>
                            )}
                          </div>
                        )}

                        {/* Teks Pesan */}
                        {msg.textBody && (
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.textBody}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FORM BALAS DISKUSI / KLARIFIKASI KE WHATSAPP KLIEN (DENGAN GUARD ANTI-KONTAK) */}
              <form onSubmit={handleSendClarificationOrReply} className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Balas Diskusi / Kirim Pertanyaan Klarifikasi ke WhatsApp {selectedBrief.tenantFullName}</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Terkirim sebagai: <strong>Editor Redaksi Polaris</strong>
                  </span>
                </div>

                {leakWarning && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      <strong>Filter Keamanan Broker:</strong> {leakWarning} Demi menjaga privasi &amp; SOP platform, dilarang mencantumkan nomor telepon, email, tautan luar, atau akun medsos pribadi.
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Ketik pesan diskusi atau pertanyaan klarifikasi untuk ${selectedBrief.tenantFullName} di sini... (Pesan langsung masuk ke WhatsApp beliau)`}
                    className="flex-1 p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim() || Boolean(leakWarning)}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shrink-0"
                  >
                    {sendingReply ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Kirim ke WA Klien</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

