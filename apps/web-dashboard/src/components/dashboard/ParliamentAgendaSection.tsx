'use client';

import { Card } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

interface AgendaItem {
  time: string;
  agenda: string;
  location: string;
}

interface ParliamentAgendaSectionProps {
  agendas?: AgendaItem[];
  recommendation?: string;
}

export function ParliamentAgendaSection({
  agendas = [],
  recommendation = 'Rekomendasi belum tersedia karena ringkasan belum dimuat.',
}: ParliamentAgendaSectionProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Calendar className="h-5 w-5 text-slate-700" />
        <h3 className="text-sm font-bold text-slate-900">Agenda Hari Ini</h3>
      </div>

      <div className="space-y-3">
        {agendas.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">Belum ada agenda terjadwal.</p>
        ) : (
          agendas.map((ag, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-blue-600">
                <Clock className="h-3.5 w-3.5" />
                <span>{ag.time}</span>
              </div>
              <p className="font-bold text-slate-900">{ag.agenda}</p>
              <p className="text-[11px] text-slate-400">{ag.location}</p>
            </div>
          ))
        )}
      </div>

      <div className="pt-2 border-t border-slate-100">
        <span className="text-[10px] font-black uppercase text-blue-600 block">Rekomendasi Tindakan</span>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          {recommendation}
        </p>
      </div>
    </Card>
  );
}
