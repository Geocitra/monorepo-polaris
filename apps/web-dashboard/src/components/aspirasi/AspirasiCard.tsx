'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, UserCheck } from 'lucide-react';

interface AspirasiItem {
  id: string;
  trackingTicketCode: string;
  status: string;
  category: string;
  districtKecamatan: string;
  regencyName: string;
  aspirationMessage: string;
  citizenName?: string;
  phoneNumber?: string;
}

interface AspirasiCardProps {
  item: AspirasiItem;
  onOpenDetail: (item: AspirasiItem) => void;
}

function maskPhoneNumber(phone?: string) {
  if (!phone) return '08**********';
  if (phone.length <= 6) return phone;
  return phone.slice(0, 4) + '****' + phone.slice(-3);
}

export function AspirasiCard({ item, onOpenDetail }: AspirasiCardProps) {
  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
            {item.trackingTicketCode}
          </span>
          <Badge
            variant={
              item.status === 'RESPONDED'
                ? 'green'
                : item.status === 'VERIFIED'
                ? 'blue'
                : 'amber'
            }
          >
            {item.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 uppercase text-[10px] text-slate-700 dark:text-slate-200">
            {item.category}
          </span>
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 truncate">
            <MapPin className="h-3 w-3 text-slate-400 dark:text-slate-500 shrink-0" />
            Kec. {item.districtKecamatan}, {item.regencyName}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-800 dark:text-white leading-relaxed font-medium line-clamp-3">
          &ldquo;{item.aspirationMessage}&rdquo;
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="text-[11px] text-slate-500 dark:text-slate-300 font-medium">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{item.citizenName || 'Warga'}</span>
          <span className="mx-1">•</span>
          <span className="font-mono text-slate-500 dark:text-slate-400">{maskPhoneNumber(item.phoneNumber)}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenDetail(item)}
          className="gap-1 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
        >
          <UserCheck className="h-3.5 w-3.5 text-primary" />
          <span>Buka & Advokasi</span>
        </Button>
      </div>
    </Card>
  );
}
