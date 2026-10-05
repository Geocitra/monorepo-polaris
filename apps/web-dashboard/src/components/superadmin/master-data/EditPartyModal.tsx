'use client';

import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { PoliticalParty } from '../types';
import { AdminApiClient } from '@/lib/api-client';

interface EditPartyModalProps {
  party: PoliticalParty;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPartyModal({ party, onClose, onSuccess }: EditPartyModalProps) {
  const [partyName, setPartyName] = useState(party.name);
  const [ballotNumber, setBallotNumber] = useState<number | undefined>(party.ballotNumber || undefined);
  const [description, setDescription] = useState(party.description || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await AdminApiClient.request(`/admin/parties/${party.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: partyName.trim(),
          ballotNumber: ballotNumber ? Number(ballotNumber) : undefined,
          description: description.trim() || undefined,
        }),
      });

      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan perubahan partai.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center font-black text-xs text-blue-700 dark:text-blue-300">
              #{party.ballotNumber || '-'}
            </span>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
              Ubah Data Partai: {party.code}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Nama Resmi Partai:</label>
            <input
              type="text"
              required
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Nomor Urut Pemilu (KPU):</label>
            <input
              type="number"
              value={ballotNumber || ''}
              onChange={(e) => setBallotNumber(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Contoh: 4"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Deskripsi / Keterangan Partai:</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan singkat mengenai partai..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
