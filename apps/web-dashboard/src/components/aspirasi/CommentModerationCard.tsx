'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Eye, EyeOff, AlertTriangle, Trash2 } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

export interface CommentItem {
  id: string;
  citizen: {
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  status: string;
  createdAt: string;
  articleTitle: string;
  commentText: string;
}

interface CommentModerationCardProps {
  comment: CommentItem;
  actionLoadingId: string | null;
  onModerate: (commentId: string, status: string) => void;
  onDelete: (comment: CommentItem) => void;
}

export function CommentModerationCard({
  comment,
  actionLoadingId,
  onModerate,
  onDelete,
}: CommentModerationCardProps) {
  const isLoading = actionLoadingId === comment.id;

  return (
    <Card
      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all shadow-sm ${
        comment.status === 'HIDDEN'
          ? 'bg-slate-100/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
          : comment.status === 'FLAGGED_SPAM'
          ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
          : 'bg-white dark:bg-[#0E131F] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="space-y-2.5 flex-1 min-w-0">
        {/* HEADER IDENTITAS WARGA */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {comment.citizen.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.citizen.avatarUrl}
              alt={comment.citizen.fullName}
              className="h-7 w-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">
              {comment.citizen.fullName[0]}
            </div>
          )}

          <span className="font-extrabold text-xs text-slate-900 dark:text-white">
            {comment.citizen.fullName}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-400">({comment.citizen.email})</span>

          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            <span>Google Verified</span>
          </span>

          <Badge
            variant={
              comment.status === 'PUBLISHED'
                ? 'green'
                : comment.status === 'HIDDEN'
                ? 'slate'
                : 'amber'
            }
          >
            {comment.status}
          </Badge>

          <span className="text-[11px] text-slate-400 dark:text-slate-400 ml-auto">
            {formatDateIndonesian(comment.createdAt)}
          </span>
        </div>

        {/* TAUTAN ARTIKEL KAJIAN */}
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <span className="text-slate-400 dark:text-slate-400 text-[11px]">Artikel Terkait:</span>
          <span className="font-bold text-slate-900 dark:text-white truncate max-w-md">
            &ldquo;{comment.articleTitle}&rdquo;
          </span>
        </div>

        {/* ISI TEKS KOMENTAR */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-white leading-relaxed font-sans whitespace-pre-line">
          {comment.commentText}
        </div>
      </div>

      {/* DOCK AKSI MODERASI */}
      <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-center">
        {comment.status === 'PUBLISHED' ? (
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => onModerate(comment.id, 'HIDDEN')}
            className="gap-1.5 text-xs text-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-600"
          >
            <EyeOff className="h-3.5 w-3.5" />
            <span>Sembunyikan</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => onModerate(comment.id, 'PUBLISHED')}
            className="gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 dark:bg-slate-800 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Tayangkan</span>
          </Button>
        )}

        {comment.status !== 'FLAGGED_SPAM' && (
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => onModerate(comment.id, 'FLAGGED_SPAM')}
            className="gap-1.5 text-xs text-amber-700 dark:text-amber-400 dark:bg-slate-800 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Tandai Spam</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => onDelete(comment)}
          className="gap-1.5 text-xs text-red-600 dark:text-red-400 dark:bg-slate-800 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Hapus</span>
        </Button>
      </div>
    </Card>
  );
}
