'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { OperatorDocumentItem } from './types';

interface KnowledgeDetachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  detachingRef: OperatorDocumentItem | null;
  isDetaching: boolean;
}

export function KnowledgeDetachModal({
  isOpen,
  onClose,
  onConfirm,
  detachingRef,
  isDetaching,
}: KnowledgeDetachModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Cabut Kaitan Dokumen"
    >
      <div className="space-y-3 pt-2">
        <p className="text-xs text-slate-700 dark:text-slate-300">
          Apakah Anda yakin ingin mencabut kaitan dokumen{' '}
          <strong className="text-slate-900 dark:text-white">
            "{detachingRef?.customTitle || detachingRef?.originalFileName}"
          </strong>{' '}
          dari tokoh dewan binaan{' '}
          <strong className="text-indigo-600 dark:text-indigo-400">
            {detachingRef?.tenantName}
          </strong>?
        </p>
        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <span>
            Tindakan ini aman: Berkas hanya dilepas dari AI tokoh binaan Anda. Jika dokumen ini digunakan secara bersama oleh fraksi lain atau master regulasi, file fisik tidak akan hilang.
          </span>
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
            type="button"
            onClick={onConfirm}
            disabled={isDetaching}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            {isDetaching ? 'Mencabut...' : 'Ya, Cabut Kaitan'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

