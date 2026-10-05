'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';

interface PriorityIssue {
  id: string | number;
  title: string;
  location: string;
  status: string;
  impact?: string;
  frequency?: number;
  description: string;
}

interface PriorityIssuesSectionProps {
  issues?: PriorityIssue[];
}

export function PriorityIssuesSection({ issues = [] }: PriorityIssuesSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <span>Isu Wilayah Prioritas Utama</span>
        </h3>
        <span className="text-xs font-bold text-slate-400">Berdasarkan aspirasi 7 hari terakhir</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {issues.length === 0 ? (
          <Card className="col-span-full py-8 text-center text-xs text-slate-500">
            Belum ada aspirasi dalam 7 hari terakhir untuk menentukan isu prioritas.
          </Card>
        ) : issues.map((issue) => (
          <Card key={issue.id} className="space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <Badge variant={issue.impact === 'TINGGI' ? 'red' : 'amber'}>
                  {issue.status}
                </Badge>
                <span className="text-xs font-bold text-slate-400">{issue.frequency} Laporan</span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                {issue.title}
              </h4>

              <p className="text-xs text-slate-500 font-medium">
                Lokasi: <span className="font-bold text-slate-700">{issue.location}</span>
              </p>

              <p className="text-xs text-slate-600 leading-relaxed">
                {issue.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/studio/terpadu?topic=${encodeURIComponent(`Penanganan Isu: ${issue.title} di ${issue.location}`)}`}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Tanggapi Isu Terpadu</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
