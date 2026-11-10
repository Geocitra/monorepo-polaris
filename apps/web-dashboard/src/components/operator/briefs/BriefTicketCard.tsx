'use client';

import React from 'react';
import { Paperclip, RotateCcw } from 'lucide-react';
import { ContentBriefItem } from '../types';
import {
  cleanSummaryDisplay,
  formatBriefDate,
  getPackageTypeInfo,
  getStatusBadgeConfig,
  isBriefFinishedOrTerminal,
} from './briefUtils';

interface BriefTicketCardProps {
  item: ContentBriefItem;
  isSelected: boolean;
  onSelect: (briefId: string) => void;
}

export const BriefTicketCard: React.FC<BriefTicketCardProps> = ({
  item,
  isSelected,
  onSelect,
}) => {
  const isFinished = isBriefFinishedOrTerminal(item.status);
  const isUrgentActive =
    (item.clientUrgency === 'URGENT' || item.isUrgentOverquota) && !isFinished;
  const isRevisionActive =
    item.status === 'REVISION_REQUESTED' && !isFinished;

  const pkgInfo = getPackageTypeInfo(item.packageType);
  const statusVisual = getStatusBadgeConfig(item.status);

  // Hitung jumlah lampiran masuk yang dikirim klien
  const mediaCount = (item.messages || []).filter(
    (m) =>
      m.direction === 'INBOUND' &&
      (m.messageType === 'IMAGE' || m.messageType === 'DOCUMENT')
  ).length;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={`w-full text-left p-3.5 transition cursor-pointer block border-b border-slate-100 dark:border-slate-800/80 ${
        isSelected
          ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-l-[3px] border-l-indigo-600 dark:border-l-indigo-500'
          : isUrgentActive
          ? 'border-l-[3px] border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10 hover:bg-slate-50 dark:hover:bg-slate-900/40'
          : isFinished
          ? 'opacity-80 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-900/30'
          : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
      }`}
    >
      {/* BARIS ATAS: STATUS UTAMA & INDIKATOR MENDESAK */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
            #{item.briefCode}
          </span>
          <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            {pkgInfo.short}
          </span>
          {isUrgentActive && (
            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 shrink-0">
              ⚡ Darurat
            </span>
          )}
        </div>

        {/* SATU STATUS UTAMA TAMPIL TENANG */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${statusVisual.badgeCls}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusVisual.dotColor}`} />
          <span>{statusVisual.label}</span>
        </span>
      </div>

      {/* JUDUL TOPIK (BINTANG UTAMA KARTU) */}
      <p
        className={`text-xs font-bold leading-snug line-clamp-2 ${
          isFinished
            ? 'text-slate-700 dark:text-slate-300'
            : 'text-slate-900 dark:text-white'
        }`}
      >
        {cleanSummaryDisplay(item.topicSummary)}
      </p>

      {/* BARIS FOOTER METADATA TENANG */}
      <div className="flex items-center justify-between text-[10.5px] text-slate-400 dark:text-slate-500 mt-2">
        <div className="flex items-center gap-2">
          {mediaCount > 0 && (
            <span className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400">
              <Paperclip className="w-3 h-3" />
              <span>{mediaCount}</span>
            </span>
          )}

          {isRevisionActive && item.revisionUsed > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Rev {item.revisionUsed}/{item.revisionLimit}</span>
            </span>
          )}
        </div>

        <span>{formatBriefDate(item.updatedAt || item.createdAt)}</span>
      </div>
    </button>
  );
};

