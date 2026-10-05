'use client';

import React, { useState } from 'react';
import { CreditCard, X, Loader2 } from 'lucide-react';
import { TenantRow } from '../types';
import { AdminApiClient } from '@/lib/api-client';

interface ManualLicenseModalProps {
  tenant: TenantRow;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManualLicenseModal({ tenant, onClose, onSuccess }: ManualLicenseModalProps) {
  const [additionalDays, setAdditionalDays] = useState<number>(180);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await AdminApiClient.request<any>(`/admin/tenants/${tenant.id}/license`, {
        method: 'POST',
        body: JSON.stringify({
          additionalDays,
          referenceNumber: referenceNumber.trim() || undefined,
        }),
      });

      alert(res.message || 'Lisensi berhasil diperpanjang.');
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Gagal menerbitkan lisensi manual.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                Penerbitan Lisensi Manual B2B
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Aktivasi langsung via SPK / Anggaran Fraksi / APBD
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Target Anggota Dewan</div>
          <div className="font-bold text-slate-900 dark:text-white text-sm">{tenant.fullName}</div>
          <div className="text-slate-500 dark:text-slate-400 text-[11px]">
            {tenant.email} • Fraksi {tenant.partyAffiliation || 'Non-Fraksi'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Durasi Perpanjangan Akses
            </label>
            <select
              value={additionalDays}
              onChange={(e) => setAdditionalDays(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 font-bold"
            >
              <option value={30}>1 Bulan (30 Hari) — Evaluasi / Uji Coba</option>
              <option value={90}>3 Bulan (90 Hari) — Masa Sidang Singkat</option>
              <option value={180}>6 Bulan (180 Hari) — Paket 1 Semester</option>
              <option value={365}>1 Tahun Penuh (365 Hari) — Kontrak Tahunan</option>
              <option value={1825}>5 Tahun (1.825 Hari) — Periode Jabatan DPR Penuh</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Surat Perintah Kerja (SPK) / Catatan B2B
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Contoh: SPK/SETWAN-JABAR/2026/088"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Nomor rujukan surat dinas disimpan sebagai bukti audit transaksi B2B non-gateway.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menerbitkan...</span>
                </>
              ) : (
                <span>Terbitkan Lisensi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
