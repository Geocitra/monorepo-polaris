'use client';

import React, { useState } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';
import { DapilItem } from '../types';

interface CreateDapilModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (dapil: DapilItem) => void;
}

export function CreateDapilModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDapilModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dapilCode, setDapilCode] = useState('');
  const [dapilName, setDapilName] = useState('');
  const [provinceName, setProvinceName] = useState('');
  const [regenciesInput, setRegenciesInput] = useState('');
  const [totalVoters, setTotalVoters] = useState<number | ''>('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('polaris_admin_token');
      const regencyCoverage = regenciesInput
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      const res = await fetch('http://localhost:4000/api/v1/admin/dapil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dapilCode: dapilCode.trim().toUpperCase(),
          dapilName: dapilName.trim(),
          provinceName: provinceName.trim(),
          regencyCoverage,
          totalVoters: totalVoters ? Number(totalVoters) : undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || errJson?.message || 'Gagal menyimpan daerah pemilihan.');
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
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Tambah Daerah Pemilihan (Dapil)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Daftarkan daerah pemilihan resmi KPU
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Kode Dapil
              </label>
              <input
                type="text"
                required
                placeholder="DAPIL-JABAR-1"
                value={dapilCode}
                onChange={(e) => setDapilCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Estimasi DPT
              </label>
              <input
                type="number"
                placeholder="2500000"
                value={totalVoters}
                onChange={(e) => setTotalVoters(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Nama Daerah Pemilihan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Jawa Barat I"
              value={dapilName}
              onChange={(e) => setDapilName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Provinsi
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Jawa Barat"
              value={provinceName}
              onChange={(e) => setProvinceName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Cakupan Wilayah Kabupaten / Kota (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kota Bandung, Kota Cimahi"
              value={regenciesInput}
              onChange={(e) => setRegenciesInput(e.target.value)}
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
              <span>Simpan Dapil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
