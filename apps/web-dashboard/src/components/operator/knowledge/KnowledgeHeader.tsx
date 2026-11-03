'use client';

import React from 'react';
import { Database, RefreshCw, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KnowledgeHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onOpenUpload: () => void;
}

export function KnowledgeHeader({
  loading,
  onRefresh,
  onOpenUpload,
}: KnowledgeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20">
            <Database className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Bank Dokumen & Pengetahuan AI Binaan
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
          Kelola dokumen kebijakan, APBD, notula risalah, dan instruksi fraksi untuk melatih otak AI
          seluruh dewan binaan Anda. Anda memiliki wewenang mengoreksi kategori dan mengatur cakupan berbagi fraksi.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan</span>
        </Button>

        <Button
          onClick={onOpenUpload}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>+ Unggah Dokumen Binaan</span>
        </Button>
      </div>
    </div>
  );
}

