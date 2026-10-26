'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  X,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface InsertMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
}

export function InsertMetricModal({
  isOpen,
  onClose,
  editor,
}: InsertMetricModalProps) {
  const { toast } = useToast();

  const [value, setValue] = useState('87,4%');
  const [label, setLabel] = useState('Realisasi Anggaran Pupuk Bersubsidi');
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('up');
  const [trendText, setTrendText] = useState('+14,2% vs 2025');
  const [description, setDescription] = useState(
    'Berdasarkan audit serapan pada kios tani resmi di 12 kecamatan wilayah dapil.'
  );

  if (!isOpen) return null;

  function handleInsert() {
    if (!editor) {
      toast({ type: 'error', title: 'Editor Belum Siap' });
      return;
    }

    if (!value.trim() || !label.trim()) {
      toast({ type: 'warning', title: 'Lengkapi Angka dan Nama Indikator' });
      return;
    }

    const trendColor =
      trend === 'up'
        ? 'background: #DCFCE7; color: #15803D; border: 1px solid #86EFAC;'
        : trend === 'down'
        ? 'background: #FEE2E2; color: #B91C1C; border: 1px solid #FCA5A5;'
        : 'background: #E0E7FF; color: #4338CA; border: 1px solid #A5B4FC;';

    const trendSymbol = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '✓';
    const borderColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#2563EB';

    const metricHtml = `
      <blockquote style="border-left: 4px solid ${borderColor}; background: linear-gradient(to right, #F8FAFC, #FFFFFF); padding: 16px 20px; border-radius: 12px; margin: 1.75em 0; box-shadow: 0 4px 12px rgba(0,0,0,0.04); border-top: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.75em; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #3B82F6;">
            📊 ${label.trim()}
          </span>
          <span style="display: inline-flex; align-items: center; gap: 3px; font-size: 0.75em; font-weight: 800; padding: 2px 8px; border-radius: 9999px; ${trendColor}">
            ${trendSymbol} ${trendText.trim()}
          </span>
        </div>
        <div style="font-size: 2.25rem; font-weight: 900; color: #0F172A; font-family: monospace; line-height: 1.1; margin: 4px 0;">
          ${value.trim()}
        </div>
        ${description.trim() ? `<p style="font-size: 0.875em; color: #475569; margin-top: 6px; line-height: 1.5;">${description.trim()}</p>` : ''}
      </blockquote>
      <p></p>
    `;

    editor.chain().focus().insertContent(metricHtml).run();

    toast({
      type: 'success',
      title: 'Kartu Metrik Disisipkan',
      description: `Indikator ${value} telah disematkan ke naskah artikel.`,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Input Kartu Metrik & Indikator Angka
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sorot capaian, persentase deviasi, atau alokasi anggaran dengan garis tren
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* LIVE PREVIEW BOX */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Pratinjau Tampilan di Dokumen:
            </span>
            <div
              className={`p-4 rounded-2xl border-l-4 shadow-sm bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 ${
                trend === 'up'
                  ? 'border-l-emerald-500'
                  : trend === 'down'
                  ? 'border-l-rose-500'
                  : 'border-l-blue-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  📊 {label || 'Nama Indikator'}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    trend === 'up'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : trend === 'down'
                      ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                  }`}
                >
                  {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                  {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                  {trend === 'neutral' && <CheckCircle2 className="h-3 w-3" />}
                  <span>{trendText || 'Tren'}</span>
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white my-1">
                {value || '0'}
              </div>
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* INPUT VALUE & LABEL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nilai Angka Utama (Value):
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="misal: 87,4% atau Rp 4,5 M"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nama Indikator / Program (Label):
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="misal: Serapan Anggaran Pupuk"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* INPUT TREN / GARIS NAIK TURUN */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              Arah Tren & Garis Indikator:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTrend('up');
                  if (!trendText.startsWith('+')) setTrendText('+12,5% vs Target');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  trend === 'up'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>Naik (Positif)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrend('down');
                  if (!trendText.startsWith('-')) setTrendText('-8,4% Deviasi');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  trend === 'down'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <TrendingDown className="h-4 w-4 text-rose-600" />
                <span>Turun (Evaluasi)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrend('neutral');
                  setTrendText('100% Sesuai Pagu');
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  trend === 'neutral'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Stabil / Tuntas</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Teks Persentase / Nilai Tren:
            </label>
            <input
              type="text"
              value={trendText}
              onChange={(e) => setTrendText(e.target.value)}
              placeholder="misal: +14,2% vs Kuartal Lalu"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Penjelasan Dampak & Konteks Kebijakan (Deskripsi):
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="misal: Capaian serapan alokasi pada 12 kecamatan di wilayah dapil."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white leading-relaxed"
            />
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400"
          >
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleInsert}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Sisipkan Kartu Metrik</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
