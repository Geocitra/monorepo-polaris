'use client';

import { useState, useMemo, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { Portal } from '@/components/ui/portal';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  LineChart as LineIcon,
  X,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { chartBlockToQuickChartUrl } from './TiptapExecutiveEditor';

interface InsertChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
}

export function InsertChartModal({
  isOpen,
  onClose,
  editor,
}: InsertChartModalProps) {
  const { toast } = useToast();

  const [title, setTitle] = useState('Evaluasi Realisasi Anggaran Sektoral (2024-2026)');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [unit, setUnit] = useState('Miliar Rupiah');
  const [labelsStr, setLabelsStr] = useState('Tahun 2024, Tahun 2025, Tahun 2026');

  const [dataset1Label, setDataset1Label] = useState('Target Pagu');
  const [dataset1Values, setDataset1Values] = useState<number[]>([45, 60, 85]);

  const [hasDataset2, setHasDataset2] = useState(true);
  const [dataset2Label, setDataset2Label] = useState('Realisasi Lapangan');
  const [dataset2Values, setDataset2Values] = useState<number[]>([42, 58, 91]);

  const labels = useMemo(() => {
    return labelsStr
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);
  }, [labelsStr]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function updateValue(ds: 1 | 2, index: number, val: number) {
    if (ds === 1) {
      const copy = [...dataset1Values];
      copy[index] = Number.isNaN(val) ? 0 : val;
      setDataset1Values(copy);
    } else {
      const copy = [...dataset2Values];
      copy[index] = Number.isNaN(val) ? 0 : val;
      setDataset2Values(copy);
    }
  }

  function handleInsert() {
    if (!editor) {
      toast({ type: 'error', title: 'Editor Belum Siap' });
      return;
    }

    if (!title.trim() || labels.length === 0) {
      toast({ type: 'warning', title: 'Lengkapi Judul dan Kategori Grafik' });
      return;
    }

    const datasets = [
      {
        label: dataset1Label || 'Seri 1',
        data: labels.map((_, i) => dataset1Values[i] || 0),
      },
    ];

    if (hasDataset2 && chartType !== 'pie') {
      datasets.push({
        label: dataset2Label || 'Seri 2',
        data: labels.map((_, i) => dataset2Values[i] || 0),
      });
    }

    const chartConfig = {
      type: chartType,
      title: title.trim(),
      unit: unit.trim(),
      labels,
      datasets,
    };

    const chartUrl = chartBlockToQuickChartUrl(chartConfig);

    editor
      .chain()
      .focus()
      .insertContent(`
        <figure class="article-image-block" data-size="full" data-align="center" style="margin: 2em auto; text-align: center; max-width: 90%;">
          <img src="${chartUrl}" alt="${title.trim()}" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; display: block;" />
          <figcaption style="font-size: 0.85em; color: #64748B; font-style: italic; margin-top: 8px; text-align: center;">
            📊 ${title.trim()} ${unit ? `(${unit.trim()})` : ''} • Data Kebijakan Parlemen
          </figcaption>
        </figure>
        <p></p>
      `)
      .run();

    toast({
      type: 'success',
      title: 'Grafik Kebijakan Berhasil Disisipkan',
      description: `Grafik visual "${title}" telah disematkan ke naskah artikel.`,
    });

    onClose();
  }

  // Sederhana SVG preview untuk modal
  const maxVal = Math.max(
    ...labels.map((_, idx) =>
      Math.max(dataset1Values[idx] || 0, hasDataset2 ? dataset2Values[idx] || 0 : 0)
    ),
    10
  );

  return (
    <Portal>
      <div className="fixed inset-0 !m-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Buat & Sisipkan Grafik Kebijakan
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Input kategori, seri data, dan angka capaian untuk divisualisasikan
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
          {/* LIVE MINI PREVIEW OF CHART */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {title || 'Judul Grafik'}
                </h4>
                {unit && (
                  <span className="text-[10px] text-slate-400 font-medium">Satuan: {unit}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                  {dataset1Label}
                </span>
                {hasDataset2 && chartType !== 'pie' && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                    {dataset2Label}
                  </span>
                )}
              </div>
            </div>

            {/* LIVE BAR VISUAL */}
            <div className="pt-2 space-y-2">
              {labels.map((lbl, idx) => {
                const val1 = dataset1Values[idx] || 0;
                const val2 = dataset2Values[idx] || 0;
                const pct1 = Math.min(100, Math.max(8, (val1 / maxVal) * 100));
                const pct2 = Math.min(100, Math.max(8, (val2 / maxVal) * 100));

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span>{lbl}</span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        {val1} {unit} {hasDataset2 && chartType !== 'pie' ? `| ${val2} ${unit}` : ''}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-md transition-all duration-300 flex items-center px-1.5 text-[8.5px] font-bold text-white"
                          style={{ width: `${pct1}%` }}
                        >
                          {val1}
                        </div>
                      </div>
                      {hasDataset2 && chartType !== 'pie' && (
                        <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-md transition-all duration-300 flex items-center px-1.5 text-[8.5px] font-bold text-white"
                            style={{ width: `${pct2}%` }}
                          >
                            {val2}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INPUT JUDUL, TIPE & SATUAN */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Judul Grafik Kebijakan:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="misal: Capaian Alokasi Alsintan"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tipe Grafik:
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="bar">📊 Batang (Bar)</option>
                <option value="line">📈 Garis (Line)</option>
                <option value="pie">🍩 Lingkaran (Pie)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Satuan:
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="misal: Miliar Rp"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* KATEGORI / LABELS */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Kategori / Sumbu Waktu (Pisahkan dengan tanda koma):
            </label>
            <input
              type="text"
              value={labelsStr}
              onChange={(e) => setLabelsStr(e.target.value)}
              placeholder="Contoh: Tahun 2024, Tahun 2025, Tahun 2026"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white font-medium"
            />
          </div>

          {/* INPUT TABEL ANGKA DATA */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              Masukkan Angka Per Kategori:
            </span>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[340px]">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5">Kategori</th>
                    <th className="p-2.5">
                      <input
                        type="text"
                        value={dataset1Label}
                        onChange={(e) => setDataset1Label(e.target.value)}
                        placeholder="Nama Seri 1"
                        className="bg-transparent font-bold text-blue-600 dark:text-blue-400 focus:outline-none w-full"
                      />
                    </th>
                    {hasDataset2 && chartType !== 'pie' && (
                      <th className="p-2.5">
                        <input
                          type="text"
                          value={dataset2Label}
                          onChange={(e) => setDataset2Label(e.target.value)}
                          placeholder="Nama Seri 2"
                          className="bg-transparent font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none w-full"
                        />
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {labels.map((lbl, idx) => (
                    <tr key={idx} className="bg-white dark:bg-slate-900">
                      <td className="p-2 font-bold text-slate-700 dark:text-slate-300">{lbl}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={dataset1Values[idx] ?? 0}
                          onChange={(e) => updateValue(1, idx, parseFloat(e.target.value))}
                          className="w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </td>
                      {hasDataset2 && chartType !== 'pie' && (
                        <td className="p-2">
                          <input
                            type="number"
                            value={dataset2Values[idx] ?? 0}
                            onChange={(e) => updateValue(2, idx, parseFloat(e.target.value))}
                            className="w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            {chartType !== 'pie' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setHasDataset2(!hasDataset2)}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {hasDataset2 ? '- Hapus Seri Pembanding 2' : '+ Tambah Seri Pembanding 2'}
                </button>
              </div>
            )}
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
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Sisipkan Grafik ke Naskah</span>
          </Button>
        </div>
      </div>
    </div>
    </Portal>
  );
}
