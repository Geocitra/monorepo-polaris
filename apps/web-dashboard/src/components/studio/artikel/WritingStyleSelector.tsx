'use client';

import { useState } from 'react';
import { 
  Building2, 
  Search, 
  GraduationCap, 
  Users, 
  Clock, 
  FileText, 
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type LengthTarget = 'SHORT' | 'MEDIUM' | 'LONG';
export type WritingStyle = 'SOLUTIF' | 'KRITIS' | 'AKADEMIS' | 'POPULER';

export interface WritingStyleConfig {
  id: WritingStyle;
  name: string;
  badge: string;
  icon: typeof Building2;
  audience: string;
  focus: string;
  tone: string;
  keywords: string[];
}

export const WRITING_STYLES: Record<WritingStyle, WritingStyleConfig> = {
  SOLUTIF: {
    id: 'SOLUTIF',
    name: 'Solutif (Eksekutif)',
    badge: 'Default',
    icon: Building2,
    audience: 'Bupati / Pimpinan Daerah & Pengambil Keputusan Daerah (Executive/Leadership).',
    focus: 'Rekomendasi aksi taktis, dampak makro-fiskal daerah, perumusan regulasi percepatan, serta penetapan langkah cepat (Quick Wins).',
    tone: 'Eksekutif, berorientasi solusi, berwibawa, lugas, padat, dan menyajikan matriks strategi/solusi.',
    keywords: ['langkah konkret', 'percepatan pembangunan', 'aksi cepat (quick wins)', 'implementasi kebijakan', 'efisiensi fiskal', 'dampak langsung'],
  },
  KRITIS: {
    id: 'KRITIS',
    name: 'Kritis & Pengawasan',
    badge: 'Audit & Kepatuhan',
    icon: Search,
    audience: 'Kepala OPD, Inspektorat & Tim Evaluasi Pengawasan Kinerja Daerah.',
    focus: 'Audit kepatuhan tata kelola, evaluasi deviasi operasional sektoral dinas, transparansi anggaran, identifikasi sumbatan teknis (bottlenecks), dan mitigasi risiko.',
    tone: 'Tajam, analitis, ketat, menuntut akuntabilitas teknis sektoral, serta membedah data menggunakan tabel deviasi/masalah.',
    keywords: ['deviasi anggaran', 'sumbatan teknis (bottlenecks)', 'kelemahan tata kelola', 'ketimpangan alokasi', 'audit kepatuhan', 'pemborosan sumber daya'],
  },
  AKADEMIS: {
    id: 'AKADEMIS',
    name: 'Akademis & Riset',
    badge: 'Evidence-Based',
    icon: GraduationCap,
    audience: 'Rekan Peneliti Badan Riset (BRIDA), Akademisi Perguruan Tinggi, dan Mitra Pembangunan.',
    focus: 'Metodologi evaluasi kebijakan, analisis kausalitas berbasis bukti faktual (evidence-based), komparasi indikator standar nasional, dan dekomposisi statistik.',
    tone: 'Rasional, metodologis, objektif, berimbang (cover-both-sides), serta menyajikan tabel data statistik lengkap.',
    keywords: ['analisis kausalitas', 'bukti faktual (evidence-based)', 'metodologi evaluasi', 'korelasi indikator standar', 'signifikansi statistik', 'postulat'],
  },
  POPULER: {
    id: 'POPULER',
    name: 'Populer & Warga',
    badge: 'Human Interest',
    icon: Users,
    audience: 'Masyarakat Umum, Tokoh Adat, dan Publik Daerah (Kanal Media Massa/Rilis Publik).',
    focus: 'Dampak nyata langsung kebijakan terhadap kehidupan warga sehari-hari, penyederhanaan istilah teknis/birokrasi, keterbukaan anggaran, dan manfaat fasilitas pembangunan.',
    tone: 'Komunikatif, mengalir, ramah pembaca (human interest), tanpa mengurangi bobot angka/fakta kunci.',
    keywords: ['manfaat nyata', 'kehidupan sehari-hari', 'transparansi publik', 'kemudahan layanan', 'uang rakyat', 'kesejahteraan keluarga'],
  },
};

interface WritingStyleSelectorProps {
  selectedLength: LengthTarget;
  onLengthChange: (len: LengthTarget) => void;
  selectedStyle: WritingStyle;
  onStyleChange: (style: WritingStyle) => void;
}

export function WritingStyleSelector({
  selectedLength,
  onLengthChange,
  selectedStyle,
  onStyleChange,
}: WritingStyleSelectorProps) {
  const currentConfig = WRITING_STYLES[selectedStyle];
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
      {/* ─── BARIS 1: TARGET PANJANG & GAYA PENULISAN ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* PILIHAN PANJANG TEKS */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            Target Kedalaman & Panjang Naskah:
          </span>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onLengthChange('SHORT')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                selectedLength === 'SHORT'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <span>Ringkas</span>
              <span className="text-[10px] font-normal text-slate-400 font-mono">~750 kata</span>
            </button>
            <button
              type="button"
              onClick={() => onLengthChange('MEDIUM')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                selectedLength === 'MEDIUM'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <span>Standar</span>
              <span className="text-[10px] font-normal text-slate-400 font-mono">~1.500 kata</span>
            </button>
            <button
              type="button"
              onClick={() => onLengthChange('LONG')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                selectedLength === 'LONG'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <span>Policy Paper</span>
              <span className="text-[10px] font-normal text-slate-400 font-mono">3.000–4.000</span>
            </button>
          </div>
        </div>

        {/* 4 GAYA TULISAN PILLS */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Gaya Penulisan Kebijakan:
            </span>
            <button
              type="button"
              onClick={() => setShowDetail(!showDetail)}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>{showDetail ? 'Tutup Rincian ▲' : 'Lihat Profil Audiens ▼'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(WRITING_STYLES) as WritingStyle[]).map((key) => {
              const cfg = WRITING_STYLES[key];
              const Icon = cfg.icon;
              const isSelected = selectedStyle === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onStyleChange(key)}
                  className={cn(
                    'px-3 py-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer',
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400')} />
                  <div className="min-w-0">
                    <span className="block text-xs font-extrabold truncate">{cfg.name}</span>
                    <span className="block text-[9.5px] text-slate-400 truncate">{cfg.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── KARTU DETAIL PROFIL GAYA PENULISAN AKTIF (COLLAPSIBLE / PERSISTENT) ─── */}
      {showDetail && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-slate-600 dark:text-slate-300">
              <p>
                <strong className="text-slate-900 dark:text-white">Target Sasaran:</strong> {currentConfig.audience}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Fokus & Bobot Materi:</strong> {currentConfig.focus}
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Karakter Kosakata Kunci:</strong>{' '}
                {currentConfig.keywords.map((kw, i) => (
                  <span
                    key={kw}
                    className="inline-block px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10.5px] font-mono text-slate-700 dark:text-slate-300 mr-1 mt-0.5"
                  >
                    "{kw}"
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
