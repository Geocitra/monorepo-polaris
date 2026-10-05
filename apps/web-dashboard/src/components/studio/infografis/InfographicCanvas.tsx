'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Download,
  Globe,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { InfographicIteration } from './InfographicTypes';
import { Button } from '@/components/ui/button';

interface InfographicCanvasProps {
  iteration: InfographicIteration;
  authorName?: string;
  partyAffiliation?: string;
  onDownload: () => void;
  downloading: boolean;
  onPublish: () => void;
  publishing: boolean;
  publishedUrl: string | null;
  isUnpaid: boolean;
}

export function InfographicCanvas({
  iteration,
  authorName = 'Anggota Dewan',
  partyAffiliation = 'Fraksi Parlemen',
  onDownload,
  downloading,
  onPublish,
  publishing,
  publishedUrl,
  isUnpaid,
}: InfographicCanvasProps) {
  const [copied, setCopied] = useState(false);

  function handleCopyImageLink() {
    navigator.clipboard.writeText(iteration.imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Menentukan aspek rasio container
  const aspectClass =
    iteration.aspectRatio === '1:1'
      ? 'aspect-square max-w-[580px]'
      : iteration.aspectRatio === '9:16'
      ? 'aspect-[9/16] max-w-[400px]'
      : iteration.aspectRatio === '4:3'
      ? 'aspect-[4/3] max-w-[680px]'
      : iteration.aspectRatio === '3:4'
      ? 'aspect-[3/4] max-w-[480px]'
      : 'aspect-[16/9] max-w-[780px]';

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-4">
      {/* HEADER KANVAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Versi {iteration.versionNumber}
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {iteration.aspectRatio || '16:9'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {iteration.style === 'infographic'
                ? 'Infografis Data'
                : iteration.style === 'photo'
                ? 'Foto Realis'
                : 'Ilustrasi'}
            </span>
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mt-1 line-clamp-1">
            {iteration.title}
          </h3>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* UNDUH BUTTON */}
          <Button
            size="sm"
            onClick={onDownload}
            disabled={downloading}
            variant="outline"
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs gap-1.5 font-bold bg-white dark:bg-slate-900 shadow-2xs cursor-pointer"
          >
            {downloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            )}
            <span>Unduh HD</span>
          </Button>

          {/* TERBITKAN BUTTON */}
          {publishedUrl ? (
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white font-extrabold text-xs hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Lihat di Website</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <Button
              size="sm"
              onClick={onPublish}
              disabled={publishing || isUnpaid}
              className={`${
                isUnpaid
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
              } font-extrabold text-xs gap-1.5`}
            >
              {publishing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Globe className="h-3.5 w-3.5" />
              )}
              <span>{isUnpaid ? 'Publish (Terkunci)' : 'Publish ke Web'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* KANVAS VISUAL UTAMA */}
      <div className="flex justify-center bg-slate-100/60 dark:bg-slate-950/40 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80">
        <div
          className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950 transition-all duration-300 group`}
        >
          <Image
            src={iteration.imageUrl}
            alt={iteration.title}
            fill
            unoptimized
            priority
            className="object-cover"
          />

          {/* OVERLAY WATERMARK HALUS */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/30 pointer-events-none" />

          {/* WATERMARK ATAS */}
          <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between text-white text-[11px] pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/80 font-black text-[10px] uppercase tracking-wider text-blue-300">
              <ShieldCheck className="h-3 w-3 text-blue-400" />
              <span>POLARIS GOV • PUBLIKASI RESMI</span>
            </span>
          </div>

          {/* WATERMARK BAWAH & ATRIBUSI DEWAN */}
          <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h4 className="font-black text-sm sm:text-base leading-snug drop-shadow-md">
                {iteration.title}
              </h4>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5 drop-shadow-sm">
                {authorName} • {partyAffiliation}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end">
              <button
                type="button"
                onClick={handleCopyImageLink}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md border border-slate-700 text-[10.5px] font-bold text-white shadow-xs transition-colors cursor-pointer"
                title="Salin Tautan Gambar"
              >
                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Tersalin' : 'Salin URL'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
