'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Save,
  Calendar,
  UploadCloud,
  FileDown,
  Loader2,
  Lock,
  ExternalLink,
  BarChart3,
} from 'lucide-react';

interface ArticleHeaderActionsProps {
  onSaveDraft: () => void;
  saving: boolean;
  onOpenSchedule: () => void;
  publishedUrl: string | null;
  onPublish: () => void;
  publishing: boolean;
  isUnpaid: boolean;
  onExportPDF: () => void;
}

export function ArticleHeaderActions({
  onSaveDraft,
  saving,
  onOpenSchedule,
  publishedUrl,
  onPublish,
  publishing,
  isUnpaid,
  onExportPDF,
}: ArticleHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button
        variant="outline"
        size="sm"
        onClick={onSaveDraft}
        disabled={saving}
        className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs gap-1.5 font-bold bg-white shadow-2xs"
      >
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Save className="h-3.5 w-3.5 text-slate-500" />
        )}
        <span>Simpan Konsep</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onOpenSchedule}
        className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs gap-1.5 font-bold bg-white shadow-2xs"
      >
        <Calendar className="h-3.5 w-3.5 text-slate-500" />
        <span>Jadwal Tinjauan</span>
      </Button>

      {publishedUrl ? (
        <a
          href={publishedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors shadow-2xs"
        >
          <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
          <span>Lihat Artikel Live</span>
        </a>
      ) : (
        <Button
          size="sm"
          onClick={onPublish}
          disabled={publishing}
          className={`${
            isUnpaid
              ? 'bg-slate-100 border border-slate-300 text-slate-400 hover:bg-slate-100 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
          } font-extrabold text-xs gap-1.5 transition-all`}
        >
          {isUnpaid ? (
            <>
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Publikasi (Terkunci)</span>
            </>
          ) : publishing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Publikasikan ke Website</span>
            </>
          )}
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onExportPDF}
        className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs gap-1.5 font-bold bg-white shadow-2xs"
      >
        <FileDown className="h-3.5 w-3.5 text-slate-500" />
        <span>Export as PDF</span>
      </Button>

      <Link href="/studio/infografis">
        <Button
          variant="outline"
          size="sm"
          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-xs gap-1.5 font-bold shadow-2xs"
        >
          <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
          <span>Studio Infografis &rarr;</span>
        </Button>
      </Link>
    </div>
  );
}
