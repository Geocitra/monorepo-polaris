'use client';

import React, { useEffect } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Trash2,
  FileText,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';
import { Portal } from '@/components/ui/portal';

interface UploadCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  reconDateInput: string;
  onReconDateChange: (date: string) => void;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  csvContent: string;
  onCsvContentChange: (content: string) => void;
  showManualTextarea: boolean;
  onToggleManualTextarea: () => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  uploading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onDownloadSampleCsv: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function UploadCsvModal({
  isOpen,
  onClose,
  reconDateInput,
  onReconDateChange,
  selectedFile,
  onFileChange,
  csvContent,
  onCsvContentChange,
  showManualTextarea,
  onToggleManualTextarea,
  isDragging,
  setIsDragging,
  uploading,
  onSubmit,
  onDownloadSampleCsv,
  fileInputRef,
}: UploadCsvModalProps) {
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

  return (
    <Portal>
      <div className="fixed inset-0 !m-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white dark:bg-[#0E131F] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                <UploadCloud className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Unggah File CSV Mutasi Midtrans
                </h3>
                <p className="text-[11px] text-slate-400">
                  Pilih file .csv hasil ekspor dari portal Midtrans MAP
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tanggal Laporan Mutasi:
                </label>
                <input
                  type="date"
                  required
                  value={reconDateInput}
                  onChange={(e) => onReconDateChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-400 block mb-1 invisible hidden sm:block">
                  Sample
                </label>
                <button
                  type="button"
                  onClick={onDownloadSampleCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center"
                  title="Unduh contoh file CSV resmi"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Contoh CSV</span>
                </button>
              </div>
            </div>

            {/* Area Drag-and-Drop File Picker */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  onFileChange(file);
                }}
              />

              {!selectedFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0] || null;
                    onFileChange(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-100/80 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Klik untuk cari file .csv
                    </span>{' '}
                    <span className="text-slate-400">atau seret file ke sini</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Mendukung format settlement resmi Midtrans (Order ID, Gross, Status, Time)
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {selectedFile.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB •{' '}
                        {csvContent.split('\n').filter(Boolean).length - 1} baris transaksi terdeteksi
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFileChange(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Ganti file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Opsi Toggle Pratinjau Teks CSV */}
            <div>
              <button
                type="button"
                onClick={onToggleManualTextarea}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                <span>
                  {showManualTextarea ? 'Sembunyikan editor teks' : 'Lihat / Edit teks CSV secara manual'}
                </span>
              </button>

              {showManualTextarea && (
                <div className="mt-2 space-y-1">
                  <textarea
                    rows={5}
                    placeholder="Order ID,Gross Amount,Payment Type,Transaction Status,Settlement Time..."
                    value={csvContent}
                    onChange={(e) => onCsvContentChange(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={uploading || !csvContent.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-all shadow-xs cursor-pointer"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Proses Rekonsiliasi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
