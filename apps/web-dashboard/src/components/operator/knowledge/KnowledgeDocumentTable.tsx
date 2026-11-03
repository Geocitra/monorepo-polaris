'use client';

import React from 'react';
import {
  FileText,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OperatorDocumentItem, CATEGORY_LABELS, SCOPE_CONFIG } from './types';

interface KnowledgeDocumentTableProps {
  documents: OperatorDocumentItem[];
  loading: boolean;
  onOpenUpload: () => void;
  onOpenEdit: (doc: OperatorDocumentItem) => void;
  onOpenDetach: (doc: OperatorDocumentItem) => void;
}

export function KnowledgeDocumentTable({
  documents,
  loading,
  onOpenUpload,
  onOpenEdit,
  onOpenDetach,
}: KnowledgeDocumentTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
        <p className="text-xs">Memuat dokumen binaan...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs py-20 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
        <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-300">Belum Ada Dokumen</p>
          <p className="text-xs text-slate-500 mt-1">
            Dewan binaan ini belum melampirkan berkas, atau Anda belum mengunggah dokumen kebijakan.
          </p>
        </div>
        <Button
          onClick={onOpenUpload}
          className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white px-4 py-1.5 rounded-xl shadow-xs cursor-pointer"
        >
          + Unggah Berkas Pertama
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4">Dokumen & Judul</th>
              <th className="py-3.5 px-4">Tokoh Dewan Binaan</th>
              <th className="py-3.5 px-4">Kategori Dokumen</th>
              <th className="py-3.5 px-4">Cakupan Hak Akses AI</th>
              <th className="py-3.5 px-4 text-center">Status Vektor</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {documents.map((doc) => {
              const catConfig = CATEGORY_LABELS[doc.categoryTag] || {
                label: doc.categoryTag,
                color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30',
              };
              const scopeInfo = SCOPE_CONFIG[doc.privacyScope] || {
                label: doc.privacyScope,
                icon: Lock,
                desc: '',
                badgeColor: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
              };
              const ScopeIcon = scopeInfo.icon;

              const isSpreadsheet =
                doc.mimeType?.includes('csv') ||
                doc.mimeType?.includes('spreadsheet') ||
                doc.originalFileName?.match(/\.(xlsx|xls|csv)$/i);

              return (
                <tr key={doc.refId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Dokumen & Judul */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSpreadsheet
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20'
                            : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1 text-[13px]">
                          {doc.customTitle || doc.originalFileName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-mono text-slate-600 dark:text-slate-400 line-clamp-1 max-w-[180px]">
                            {doc.originalFileName}
                          </span>
                          <span>•</span>
                          <span>{(doc.fileSizeBytes / 1024).toFixed(0)} KB</span>
                          {doc.totalPages > 1 && (
                            <>
                              <span>•</span>
                              <span>{doc.totalPages} Hal</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Dewan Pemilik */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      {doc.tenantPhoto ? (
                        <img
                          src={doc.tenantPhoto}
                          alt={doc.tenantName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-[10px] border border-slate-200 dark:border-slate-700">
                          {doc.tenantName?.charAt(0) || 'D'}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{doc.tenantName}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          {doc.partyAffiliation && <span>{doc.partyAffiliation}</span>}
                          {doc.tenantDapil && <span>• {doc.tenantDapil}</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Kategori Dokumen */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${catConfig.color}`}
                    >
                      {catConfig.label}
                    </span>
                  </td>

                  {/* Cakupan Hak Akses AI */}
                  <td className="py-3.5 px-4">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${scopeInfo.badgeColor}`}
                      title={scopeInfo.desc}
                    >
                      <ScopeIcon className="w-3 h-3" />
                      <span>{scopeInfo.label}</span>
                    </div>
                  </td>

                  {/* Status Vektor */}
                  <td className="py-3.5 px-4 text-center">
                    {doc.extractionStatus === 'COMPLETED' ? (
                      <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{doc.chunkCount} Chunk</span>
                      </div>
                    ) : doc.extractionStatus === 'PROCESSING' ? (
                      <div className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Memproses</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Gagal</span>
                      </div>
                    )}
                  </td>

                  {/* Aksi */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenEdit(doc)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                        title="Edit Judul, Kategori & Hak Akses"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenDetach(doc)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                        title="Cabut Kaitan Dokumen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

