'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { CATEGORY_LABELS } from './types';

interface KnowledgeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editCategory: string;
  setEditCategory: (val: string) => void;
  editScope: string;
  setEditScope: (val: string) => void;
  isUpdating: boolean;
}

export function KnowledgeEditModal({
  isOpen,
  onClose,
  onSubmit,
  editTitle,
  setEditTitle,
  editCategory,
  setEditCategory,
  editScope,
  setEditScope,
  isUpdating,
}: KnowledgeEditModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Koreksi Klasifikasi Dokumen & Hak Akses"
    >
      <form onSubmit={onSubmit} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Dokumen</label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Dokumen</label>
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cakupan Hak Akses AI</label>
          <select
            value={editScope}
            onChange={(e) => setEditScope(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="PRIVATE_TENANT">🔒 Rahasia Pribadi (Hanya AI Dewan Pemilik)</option>
            <option value="PARTY_CONFIDENTIAL">🛡️ Internal Fraksi (Rekan Satu Partai)</option>
            <option value="DAPIL_SHARED">🏛️ Berbagi Dapil (Sesama Dewan Satu Daerah)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isUpdating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
          >
            {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

