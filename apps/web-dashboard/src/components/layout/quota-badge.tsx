'use client';

import Link from 'next/link';
import { Sparkles, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuotaBadgeProps {
  articleRemaining?: number;
  articleLimit?: number;
  dalleRemaining?: number;
  dalleLimit?: number;
  subscriptionStatus?: string;
}

export function QuotaBadge({
  subscriptionStatus = 'ACTIVE',
}: QuotaBadgeProps) {
  const isActive = subscriptionStatus === 'ACTIVE';

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link href="/billing" className="group">
        <Badge
          variant={isActive ? 'green' : 'amber'}
          className="transition-all group-hover:scale-105 cursor-pointer py-1 px-2.5 sm:px-3 flex items-center gap-1.5"
        >
          {isActive ? (
            <>
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="font-extrabold text-[11px] tracking-wide">Unlimited AI Enterprise</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="font-extrabold text-[11px] tracking-wide">Aktivasi Lisensi</span>
            </>
          )}
        </Badge>
      </Link>

      <Link
        href="/billing"
        className="hidden lg:inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <span>Kelola Paket</span>
        <ArrowUpRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
