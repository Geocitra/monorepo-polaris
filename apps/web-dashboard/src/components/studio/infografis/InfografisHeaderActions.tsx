'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  RotateCw,
  Download,
  Globe,
  ExternalLink,
  FileText,
  Loader2,
  Lock,
} from 'lucide-react';

interface InfografisHeaderActionsProps {
  visualMode: 'infographic' | 'photo' | 'illustration';
  setVisualMode: (mode: 'infographic' | 'photo' | 'illustration') => void;
  onRegenerate: () => void;
  loading: boolean;
  onDownload: () => void;
  downloading: boolean;
  publishedUrl: string | null;
  onPublish: () => void;
  publishing: boolean;
  isUnpaid: boolean;
}

export function InfografisHeaderActions({
  visualMode,
  setVisualMode,
  onRegenerate,
  loading,
  onDownload,
  downloading,
  publishedUrl,
  onPublish,
  publishing,
  isUnpaid,
}: InfografisHeaderActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Mode Visual Tabs */}
      <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
        {(['infographic', 'photo', 'illustration'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setVisualMode(mode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
              visualMode === mode
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {mode === 'infographic' ? 'Infografis' : mode === 'photo' ? 'Foto Realis' : 'Ilustrasi'}
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onRegenerate}
        disabled={loading || isUnpaid}
        className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs gap-1.5 font-bold bg-white dark:bg-slate-900 shadow-2xs"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RotateCw className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
        )}
        <span>Regenerate</span>
      </Button>

      <Button
        size="sm"
        onClick={onDownload}
        disabled={downloading}
        variant="outline"
        className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs gap-1.5 font-bold bg-white dark:bg-slate-900 shadow-2xs"
      >
        {downloading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        )}
        <span>Unduh Gambar</span>
      </Button>

      {publishedUrl ? (
        <a
          href={publishedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Lihat di Web</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <Button
          size="sm"
          onClick={onPublish}
          disabled={publishing}
          className={`${
            isUnpaid
              ? 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-400 hover:bg-slate-100 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
          } font-extrabold text-xs gap-1.5 transition-all`}
        >
          {isUnpaid ? (
            <>
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Publish (Terkunci)</span>
            </>
          ) : publishing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Globe className="h-3.5 w-3.5" />
              <span>Publish ke Website</span>
            </>
          )}
        </Button>
      )}

      <Link href="/studio/artikel">
        <Button
          variant="outline"
          size="sm"
          className="bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-xs gap-1.5 font-bold shadow-2xs"
        >
          <FileText className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span>Editor Naskah &rarr;</span>
        </Button>
      </Link>
    </div>
  );
}
