export const PIPELINE_STEPS = [
  { key: 'SUBMITTED', label: 'Bahan Masuk', icon: '📥' },
  { key: 'IN_PROGRESS', label: 'Dikerjakan', icon: '⚙️' },
  { key: 'READY_FOR_REVIEW', label: 'Review Klien', icon: '👀' },
  { key: 'REVISION_REQUESTED', label: 'Revisi', icon: '✏️' },
  { key: 'PUBLISHED', label: 'Tayang', icon: '✅' },
] as const;

export function getPipelineActiveIndex(status: string): number {
  if (status === 'PUBLISHED' || status === 'APPROVED') return 4;
  if (status === 'REVISION_REQUESTED') return 3;
  if (status === 'READY_FOR_REVIEW') return 2;
  if (status === 'IN_PROGRESS' || status === 'ACCEPTED' || status === 'NEED_CLARIFICATION') return 1;
  return 0; // SUBMITTED
}

export function isBriefFinishedOrTerminal(status: string): boolean {
  return ['PUBLISHED', 'APPROVED', 'REJECTED', 'CANCELLED'].indexOf(status) !== -1;
}

export interface StatusBadgeVisual {
  label: string;
  dotColor: string;
  badgeCls: string;
}

export function getStatusBadgeConfig(status: string): StatusBadgeVisual {
  switch (status) {
    case 'DRAFT_COLLECTING':
      return {
        label: 'Menunggu Bahan',
        dotColor: 'bg-amber-400',
        badgeCls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
      };
    case 'SUBMITTED':
      return {
        label: 'Bahan Baru Masuk',
        dotColor: 'bg-indigo-500',
        badgeCls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60',
      };
    case 'ACCEPTED':
    case 'IN_PROGRESS':
      return {
        label: 'Sedang Dikerjakan',
        dotColor: 'bg-blue-500 animate-pulse',
        badgeCls: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60',
      };
    case 'NEED_CLARIFICATION':
      return {
        label: 'Diskusi / Klarifikasi',
        dotColor: 'bg-sky-500',
        badgeCls: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60',
      };
    case 'READY_FOR_REVIEW':
      return {
        label: 'Menunggu Review Klien',
        dotColor: 'bg-violet-500',
        badgeCls: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200/60 dark:border-violet-800/60',
      };
    case 'REVISION_REQUESTED':
      return {
        label: 'Minta Revisi',
        dotColor: 'bg-rose-500 animate-pulse',
        badgeCls: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60',
      };
    case 'QUEUED_NEXT_WEEK':
      return {
        label: 'Antrean Minggu Depan',
        dotColor: 'bg-slate-400',
        badgeCls: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60',
      };
    case 'APPROVED':
    case 'PUBLISHED':
      return {
        label: 'Selesai & Tayang',
        dotColor: 'bg-emerald-500',
        badgeCls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
      };
    case 'CANCELLED':
      return {
        label: 'Dibatalkan',
        dotColor: 'bg-slate-400',
        badgeCls: 'bg-slate-100 text-slate-500 dark:bg-slate-850 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60',
      };
    case 'REJECTED':
      return {
        label: 'Ditolak (Refund Kuota)',
        dotColor: 'bg-slate-400',
        badgeCls: 'bg-slate-100 text-slate-500 dark:bg-slate-850 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60',
      };
    default:
      return {
        label: status,
        dotColor: 'bg-slate-400',
        badgeCls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
      };
  }
}

export function getPackageTypeInfo(packageType?: string): { label: string; icon: string; short: string } {
  switch (packageType) {
    case 'POSTER_ONLY':
      return { label: 'Poster Visual', icon: '🎨', short: 'Poster' };
    case 'INFOGRAPHIC_ONLY':
      return { label: 'Infografis Data', icon: '📊', short: 'Infografis' };
    case 'ARTICLE_ONLY':
      return { label: 'Naskah Artikel', icon: '📝', short: 'Artikel' };
    default:
      return { label: 'Paket Kampanye', icon: '📦', short: 'Bundling' };
  }
}

export function getTargetHorizonBadge(urgency: 'URGENT' | 'NORMAL', createdAtIso: string) {
  try {
    const d = new Date(createdAtIso);
    const wibHours = (d.getUTCHours() + 7) % 24;
    if (wibHours >= 17 || wibHours < 7) {
      return {
        label: '🗓️ Target Besok Pagi',
        cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        hint: 'Masuk malam hari (≥ 17:00 WIB), dijadwalkan mulai pukul 08:00 besok pagi.',
        isTomorrow: true,
      };
    }
    if (urgency === 'URGENT') {
      return {
        label: '⚡ Prioritas Hari Ini',
        cls: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-bold',
        hint: 'Breaking News / Topik hangat, diprioritaskan selesai hari ini.',
        isTomorrow: false,
      };
    }
    return {
      label: '🟢 Tayang Hari Ini',
      cls: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-semibold',
      hint: 'Masuk jam kerja reguler, ditargetkan siap tayang hari ini.',
      isTomorrow: false,
    };
  } catch {
    return {
      label: urgency === 'URGENT' ? '⚡ Mendesak' : '🟢 Reguler',
      cls: 'bg-slate-100 text-slate-700 border-slate-300',
      hint: '',
      isTomorrow: false,
    };
  }
}

export function cleanSummaryDisplay(summary?: string | null): string {
  if (!summary) return 'Tanpa ringkasan topik';
  const cleaned = summary
    .replace(/^(?:hal|halp|hlp|halo|hallo|hai|hi|p|tes|test|permisi)\s+/gi, '')
    .trim();
  return cleaned || summary;
}

export function formatBriefDate(dateIso: string): string {
  try {
    const d = new Date(dateIso);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}
