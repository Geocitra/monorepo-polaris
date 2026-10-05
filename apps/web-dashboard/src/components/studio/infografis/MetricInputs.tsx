'use client';

import { FileText, TrendingUp } from 'lucide-react';

interface MetricInputsProps {
  infographicTitle: string;
  onTitleChange: (val: string) => void;
  infographicLead: string;
  onLeadChange: (val: string) => void;
  stats: {
    stat1: string;
    stat1Label: string;
    stat2: string;
    stat2Label: string;
    stat3: string;
    stat3Label: string;
    stat4: string;
    stat4Label: string;
  };
  onStatChange: (key: string, val: string) => void;
}

export function MetricInputs({
  infographicTitle,
  onTitleChange,
  infographicLead,
  onLeadChange,
  stats,
  onStatChange,
}: MetricInputsProps) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span>Konfigurasi Narasi & Poin Data</span>
        </span>
        <span className="text-[11px] text-slate-500 font-mono">Status: Sinkron</span>
      </div>

      {/* PROPOSAL TITLE */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Judul Gagasan Kebijakan
        </label>
        <input
          type="text"
          value={infographicTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full rounded-xl bg-slate-50 border border-slate-300 p-3 text-sm font-black text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
        />
        <p className="text-[11px] text-slate-500 mt-1">
          Tema advokasi: "Konektivitas Digital untuk Sekolah Pedesaan"
        </p>
      </div>

      {/* JANGKAUAN MARKDOWN */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Jangkauan & Narasi Pengantar
        </label>
        <textarea
          rows={3}
          value={infographicLead}
          onChange={(e) => onLeadChange(e.target.value)}
          className="w-full rounded-xl bg-slate-50 border border-slate-300 p-3 text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:border-blue-600 focus:outline-none resize-none"
        />
      </div>

      {/* KEY FACTS 4 STATISTIK BOX */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Poin Data Utama (Key Facts)</span>
          </span>
          <span className="text-[11px] text-slate-400 font-normal">Dapat disunting langsung</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Metrik 1</span>
              <input
                type="text"
                value={stats.stat1}
                onChange={(e) => onStatChange('stat1', e.target.value)}
                className="w-16 bg-white border border-slate-300 px-1.5 py-0.5 rounded text-xs font-black text-blue-600 text-right"
              />
            </div>
            <input
              type="text"
              value={stats.stat1Label}
              onChange={(e) => onStatChange('stat1Label', e.target.value)}
              className="w-full mt-1.5 bg-transparent border-none text-[11px] font-semibold text-slate-700 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Metrik 2</span>
              <input
                type="text"
                value={stats.stat2}
                onChange={(e) => onStatChange('stat2', e.target.value)}
                className="w-16 bg-white border border-slate-300 px-1.5 py-0.5 rounded text-xs font-black text-emerald-600 text-right"
              />
            </div>
            <input
              type="text"
              value={stats.stat2Label}
              onChange={(e) => onStatChange('stat2Label', e.target.value)}
              className="w-full mt-1.5 bg-transparent border-none text-[11px] font-semibold text-slate-700 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Metrik 3</span>
              <input
                type="text"
                value={stats.stat3}
                onChange={(e) => onStatChange('stat3', e.target.value)}
                className="w-16 bg-white border border-slate-300 px-1.5 py-0.5 rounded text-xs font-black text-amber-600 text-right"
              />
            </div>
            <input
              type="text"
              value={stats.stat3Label}
              onChange={(e) => onStatChange('stat3Label', e.target.value)}
              className="w-full mt-1.5 bg-transparent border-none text-[11px] font-semibold text-slate-700 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Metrik 4</span>
              <input
                type="text"
                value={stats.stat4}
                onChange={(e) => onStatChange('stat4', e.target.value)}
                className="w-16 bg-white border border-slate-300 px-1.5 py-0.5 rounded text-xs font-black text-teal-600 text-right"
              />
            </div>
            <input
              type="text"
              value={stats.stat4Label}
              onChange={(e) => onStatChange('stat4Label', e.target.value)}
              className="w-full mt-1.5 bg-transparent border-none text-[11px] font-semibold text-slate-700 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <span>Poin data otomatis direfleksikan pada kanvas visual di sebelah kanan.</span>
        <span className="font-mono text-slate-400">Sinkronisasi Realtime</span>
      </div>
    </div>
  );
}
