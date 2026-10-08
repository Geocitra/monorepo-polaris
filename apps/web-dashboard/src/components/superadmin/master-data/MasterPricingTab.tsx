'use client';

import React, { useState, useMemo } from 'react';
import { Tag, Edit3, CheckCircle2, AlertCircle, X, RefreshCw, Filter, Layers } from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { PricingMatrixRow } from '../types';

interface MasterPricingTabProps {
  matrices: PricingMatrixRow[];
  loading: boolean;
  onRefresh: () => void;
}

export function MasterPricingTab({ matrices, loading, onRefresh }: MasterPricingTabProps) {
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [editingItem, setEditingItem] = useState<PricingMatrixRow | null>(null);
  const [newAmount, setNewAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredMatrices = useMemo(() => {
    return matrices.filter((m) => {
      if (levelFilter !== 'ALL' && m.legislativeLevel !== levelFilter) return false;
      if (tierFilter !== 'ALL' && m.planTier !== tierFilter) return false;
      return true;
    });
  }, [matrices, levelFilter, tierFilter]);

  const handleOpenEdit = (item: PricingMatrixRow) => {
    setEditingItem(item);
    setNewAmount(item.amountIdr.toString());
    setError(null);
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSubmitting(true);
    setError(null);

    try {
      const amount = parseInt(newAmount.replace(/\D/g, ''), 10);
      if (isNaN(amount) || amount < 0) {
        throw new Error('Nominal tarif tidak valid.');
      }

      await AdminApiClient.request(`/admin/pricing-matrices/${editingItem.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          amountIdr: amount,
        }),
      });

      setEditingItem(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan perubahan harga.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item: PricingMatrixRow) => {
    try {
      await AdminApiClient.request(`/admin/pricing-matrices/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          isActive: !item.isActive,
        }),
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status aktif tarif.');
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatLegislativeLabel = (level: string) => {
    switch (level) {
      case 'DPR_RI':
        return 'DPR RI';
      case 'DPD_RI':
        return 'DPD RI';
      case 'DPRD_PROV':
        return 'DPRD Provinsi';
      case 'DPRD_KAB_KOTA':
        return 'DPRD Kab/Kota';
      default:
        return level.replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-[#0B0F17] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Tingkat:</span>
          {['ALL', 'DPR_RI', 'DPD_RI', 'DPRD_PROV', 'DPRD_KAB_KOTA'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                levelFilter === lvl
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {lvl === 'ALL' ? 'Semua Tingkat' : formatLegislativeLabel(lvl)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Paket:</span>
          {['ALL', 'STARTER', 'PRO'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                tierFilter === tier
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tier === 'ALL' ? 'Semua' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* 2. PRICING TABLE */}
      <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Tingkat Yurisdiksi</th>
                <th className="py-3 px-4">Paket Tier</th>
                <th className="py-3 px-4">Siklus Penagihan</th>
                <th className="py-3 px-4">Durasi Hari</th>
                <th className="py-3 px-4 text-right">Tarif Resmi Lisensi</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredMatrices.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Tingkat */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatLegislativeLabel(m.legislativeLevel)}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      {m.legislativeLevel}
                    </span>
                  </td>

                  {/* Tier */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider ${
                        m.planTier === 'PRO'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {m.planTier}
                    </span>
                  </td>

                  {/* Siklus */}
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {m.billingCycle === 'MONTHLY'
                        ? '1 Bulan (Bulanan)'
                        : m.billingCycle === 'SEMIANNUAL'
                        ? '6 Bulan (Semester)'
                        : '1 Tahun (Tahunan)'}
                    </span>
                  </td>

                  {/* Durasi */}
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                    {m.durationDays} hari
                  </td>

                  {/* Tarif Resmi */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {formatRupiah(m.amountIdr)}
                  </td>

                  {/* Status Aktif */}
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(m)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                        m.isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100'
                      }`}
                    >
                      {m.isActive ? 'AKTIF' : 'NON-AKTIF'}
                    </button>
                  </td>

                  {/* Aksi */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Edit Nilai Tarif"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredMatrices.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs italic">
                    Tidak ada matriks harga yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. EDIT PRICE MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden theme-transition">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Ubah Tarif Matriks Lisensi
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrice} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tingkat:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatLegislativeLabel(editingItem.legislativeLevel)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tier:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{editingItem.planTier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Siklus:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {editingItem.billingCycle} ({editingItem.durationDays} Hari)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nominal Tarif Baru (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    required
                    min={0}
                    step={100000}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                {newAmount && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                    = {formatRupiah(parseInt(newAmount, 10) || 0)}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Simpan Perubahan Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
