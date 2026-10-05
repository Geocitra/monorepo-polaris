'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateIndonesian } from '@/lib/utils';
import { Eye, EyeOff, ShieldAlert, FileText } from 'lucide-react';

interface CommentItemCardProps {
  item: any;
  actionLoadingId: string | null;
  onModerate: (commentId: string, newStatus: string) => void;
}

export function CommentItemCard({
  item,
  actionLoadingId,
  onModerate,
}: CommentItemCardProps) {
  const isActionLoading = actionLoadingId === item.id;

  return (
    <Card className="p-5 space-y-3 hover:border-slate-300 transition-all shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          {item.citizen?.avatarUrl ? (
            <img
              src={item.citizen.avatarUrl}
              alt={item.citizen.fullName}
              className="h-8 w-8 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {item.citizen?.fullName?.charAt(0) || 'W'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{item.citizen?.fullName}</span>
              <span className="text-[11px] text-slate-400 font-mono">({item.citizen?.email})</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {formatDateIndonesian(item.createdAt)} • Menyukai: {item.likesCount || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              item.status === 'PUBLISHED'
                ? 'green'
                : item.status === 'HIDDEN'
                ? 'amber'
                : 'red'
            }
          >
            {item.status}
          </Badge>

          {item.status === 'PUBLISHED' ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isActionLoading}
              onClick={() => onModerate(item.id, 'HIDDEN')}
              className="gap-1 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
            >
              <EyeOff className="h-3 w-3" />
              <span>Sembunyikan</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={isActionLoading}
              onClick={() => onModerate(item.id, 'PUBLISHED')}
              className="gap-1 text-xs text-green-700 border-green-200 hover:bg-green-50"
            >
              <Eye className="h-3 w-3" />
              <span>Tayangkan</span>
            </Button>
          )}

          {item.status !== 'FLAGGED_SPAM' && (
            <Button
              variant="outline"
              size="sm"
              disabled={isActionLoading}
              onClick={() => onModerate(item.id, 'FLAGGED_SPAM')}
              className="gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
            >
              <ShieldAlert className="h-3 w-3" />
              <span>Tandai Spam</span>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
          <FileText className="h-3 w-3 shrink-0" />
          <span>Pada Artikel:</span>
          <span className="font-bold underline truncate">{item.article?.title}</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-slate-50/60 p-3 rounded-xl border border-slate-100">
          &ldquo;{item.commentText}&rdquo;
        </p>
      </div>
    </Card>
  );
}
