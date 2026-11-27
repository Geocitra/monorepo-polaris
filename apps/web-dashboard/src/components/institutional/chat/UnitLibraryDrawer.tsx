'use client';

import { useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckSquare,
  Square,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InstitutionalScopedDocumentDto } from '@polaris/shared-types';

interface UnitLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: InstitutionalScopedDocumentDto[];
  selectedFileIds: string[];
  onToggleFile: (docId: string) => void;
  onUploadFile: (file: File) => void;
  uploading: boolean;
}

export function UnitLibraryDrawer({
  isOpen,
  onClose,
  documents,
  selectedFileIds,
  onToggleFile,
  onUploadFile,
  uploading,
}: UnitLibraryDrawerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] shadow-2xl flex flex-col max-h-[82vh] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Pustaka Dokumen Bidang
            </h3>
            <p className="text-[11px] text-slate-500">
              Pilih dokumen untuk dijadikan referensi chat atau unggah dokumen baru (PDF/Excel/Word).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                onUploadFile(f);
                e.target.value = '';
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="w-full border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold text-xs"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UploadCloud className="h-4 w-4 mr-2" />
            )}
            {uploading ? 'Mengunggah & Memproses Dokumen...' : 'Unggah Dokumen Baru ke Bidang Ini'}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {documents.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              Belum ada dokumen di Bidang ini. Unggah PDF LKPJ, APBD, atau Draf Raperda di atas.
            </div>
          ) : (
            documents.map((doc) => {
              const checked = selectedFileIds.includes(doc.fileId);
              return (
                <button
                  key={doc.fileId}
                  type="button"
                  onClick={() => onToggleFile(doc.fileId)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${checked
                    ? 'border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                >
                  {checked ? (
                    <CheckSquare className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                      <FileText className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{doc.title}</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">
                      {doc.categoryTag} &bull; {doc.privacyScope}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {selectedFileIds.length} dokumen terlampir ke chat
          </span>
          <Button type="button" size="sm" onClick={onClose} className="font-bold text-xs">
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
}
