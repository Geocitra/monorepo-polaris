'use client';

import React, { useState } from 'react';
import { X, Layers, Plus, Loader2 } from 'lucide-react';
import { CommissionItem } from '../types';

interface CreateCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCommission: CommissionItem) => void;
}

export function CreateCommissionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCommissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [legislativeLevel, setLegislativeLevel] = useState('DPR_RI');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [focusAreasInput, setFocusAreasInput] = useState('');
  const [partnerMinistriesInput, setPartnerMinistriesInput] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('polaris_admin_token');
      const focusAreas = focusAreasInput
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);
      const partnerMinistries = partnerMinistriesInput
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);

      const res = await fetch('http://localhost:4000/api/v1/admin/commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          legislativeLevel,
          code: code.trim().toUpperCase(),
          name: name.trim(),
          focusAreas,
          partnerMinistries,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || errJson?.message || 'Gagal menyimpan komisi baru.');
      }

      const created = await res.json();
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Tambah Komisi & AKD Parlemen
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Daftarkan komisi atau alat kelengkapan dewan nasional/daerah
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tingkat Lembaga */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Tingkat Lembaga Parlemen
            </label>
            <select
              value={legislativeLevel}
              onChange={(e) => setLegislativeLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="DPR_RI">DPR RI (Nasional)</option>
              <option value="DPRD_PROVINSI">DPRD Provinsi</option>
              <option value="DPRD_KABUPATEN_KOTA">DPRD Kabupaten / Kota</option>
              <option value="DPD_RI">DPD RI</option>
              <option value="MPR_RI">MPR RI</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Kode Komisi */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Kode Komisi / AKD
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: KOMISI_I atau BANGGAR"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Nama Komisi */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Nama Resmi Komisi
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Komisi I (Pertahanan)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Bidang Fokus */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Bidang Fokus Kerja (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pertahanan Nasional, Keamanan Siber, Intelijen"
              value={focusAreasInput}
              onChange={(e) => setFocusAreasInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Mitra Kerja */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Mitra Kerja Kementerian / Dinas (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              placeholder="Contoh: Kemenhan, Kemenlu, BIN, TNI"
              value={partnerMinistriesInput}
              onChange={(e) => setPartnerMinistriesInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Simpan Komisi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
