'use client';

import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, ShieldCheck, FolderArchive } from 'lucide-react';
import { trackDocumentDownload } from '@/lib/api';

interface DocumentsLibraryDockProps {
  documents: any[];
  member: any;
  subdomain?: string;
  config?: Record<string, any>;
  variant?: string;
}

export function DocumentsLibraryDock({
  documents,
  member,
  subdomain,
}: DocumentsLibraryDockProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (doc: any) => {
    setDownloadingId(doc.id);
    if (subdomain) {
      trackDocumentDownload(subdomain, doc.id).catch(() => {});
    }
    // Buka file PDF di tab baru
    window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => {
      setDownloadingId(null);
    }, 1200);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'PDF';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <section id="dokumen" className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest block mb-1">
            Akuntabilitas Publik
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-red-600" />
            <span>Pojok Literasi & Unduh Dokumen</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Arsip risalah kinerja, draf naskah perundang-undangan, dan buletin resmi {member.fullName}.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Format Terbuka (PDF)
        </span>
      </div>

      {!documents || documents.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 italic rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
          Dokumen laporan kinerja periode ini sedang dalam proses digitalisasi.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc: any) => {
            const isDownloading = downloadingId === doc.id;

            return (
              <div
                key={doc.id}
                className="group relative p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-red-300 dark:hover:border-red-900 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                      {doc.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{doc.docType.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.fileSizeBytes)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {doc.downloadCount || 0} kali diunduh
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    {isDownloading ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        <span>Membuka...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        <span>Unduh PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
