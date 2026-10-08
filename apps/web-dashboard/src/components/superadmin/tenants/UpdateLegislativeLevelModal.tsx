'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { TenantRow } from '@/components/superadmin/types';

interface UpdateLegislativeLevelModalProps {
  tenant: TenantRow;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdateLegislativeLevelModal({ tenant, onClose, onSuccess }: UpdateLegislativeLevelModalProps) {
  const [level, setLevel] = useState(tenant.legislativeLevel);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await AdminApiClient.request(`/admin/tenants/${tenant.id}/legislative-level`, {
        method: 'PATCH',
        body: JSON.stringify({
          legislativeLevel: level,
          verificationNotes: notes.trim() || undefined,
        }),
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui tingkat wewenang legislatif.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden theme-transition">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Koreksi Tingkat Jabatan Resmi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Otoritas Superadmin untuk memodifikasi yurisdiksi anggota dewan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 block">Nama Anggota:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm block">{tenant.fullName}</span>
            <span className="text-slate-500 font-mono text-[11px] block">{tenant.email}</span>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Tingkat Wewenang Legislatif Baru:
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="DPR_RI">DPR RI (Parlemen Nasional)</option>
              <option value="DPD_RI">DPD RI (Senator)</option>
              <option value="MPR_RI">MPR RI</option>
              <option value="DPRD_PROVINSI">DPRD Provinsi</option>
              <option value="DPRD_KABUPATEN_KOTA">DPRD Kabupaten / Kota</option>
              <option value="KEPALA_DAERAH_GUBERNUR">Gubernur / Wakil Gubernur</option>
              <option value="KEPALA_DAERAH_WALIKOTA_BUPATI">Walikota / Bupati</option>
              <option value="PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD">Birokrat / OPD / Sekjen</option>
              <option value="PIMPINAN_LEMBAGA_REKTOR_SWASTA">Pimpinan Lembaga / Rektor</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Catatan Dasar Verifikasi / SK KPU:
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Berdasarkan SK KPU No. 120/PL.01.4-Kpt/05/2024 dan penetapan pelantikan resmi."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-md disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Menyimpan...' : 'Perbarui Tingkat Jabatan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
