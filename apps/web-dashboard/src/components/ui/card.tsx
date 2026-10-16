import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0E131F] text-slate-900 dark:text-slate-100 p-6 shadow-sm transition-colors duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4', className)} {...props}>
      {children}
    </div>
  );
}
