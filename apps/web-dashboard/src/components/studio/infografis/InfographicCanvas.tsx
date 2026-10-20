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
  Maximize2,
  Sparkles,
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

  // Menentukan aspek rasio container agar proporsional dan tidak terpotong
  const aspectClass =
    iteration.aspectRatio === '1:1'
      ? 'aspect-square max-w-[560px]'
      : iteration.aspectRatio === '9:16'
      ? 'aspect-[9/16] max-w-[380px]'
      : iteration.aspectRatio === '4:3'
      ? 'aspect-[4/3] max-w-[640px]'
      : iteration.aspectRatio === '3:4'
      ? 'aspect-[3/4] max-w-[460px]'
      : 'aspect-[16/9] max-w-[760px]';

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4 transition-all">
      {/* ─── HEADER INFORMASI KANVAS ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Versi {iteration.versionNumber}
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Rasio {iteration.aspectRatio || '16:9'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {iteration.style === 'infographic'
                ? 'Infografis Data'
                : iteration.style === 'photo'
                ? 'Foto Realis'
                : 'Ilustrasi Kreatif'}
            </span>
          </div>

          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
            {iteration.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Atribusi: {authorName} • {partyAffiliation}
          </p>
        </div>

        {/* QUICK STATUS BADGE */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {publishedUrl ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Tayang di Website
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Draf Visual Siap Unduh
            </span>
          )}
        </div>
      </div>

      {/* ─── KANVAS GAMBAR UTAMA (BERSIH TANPA OVERLAY GELAP YANG MENUTUPI KARYA) ─── */}
      <div className="flex justify-center items-center bg-slate-50/80 dark:bg-[#070A12]/90 p-3 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80">
        <div
          className={`relative w-full ${aspectClass} rounded-xl overflow-hidden shadow-md dark:shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 group transition-all duration-300`}
        >
          <Image
            src={iteration.imageUrl}
            alt={iteration.title}
            fill
            unoptimized
            priority
            className="object-contain sm:object-cover"
          />

          {/* SUBTLE BRANDING WATERMARK (MINIMALIS DI POJOK TANPA MENUTUPI TEKS) */}
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/75 backdrop-blur-md border border-white/10 font-black text-[9.5px] uppercase tracking-wider text-white shadow-xs">
              <ShieldCheck className="h-3 w-3 text-blue-400" />
              <span>POLARIS GOV</span>
            </span>
          </div>

          {/* QUICK FULLSCREEN PREVIEW BUTTON */}
          <a
            href={iteration.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/75 hover:bg-slate-900 backdrop-blur-md border border-white/10 text-white/80 hover:text-white shadow-xs transition-all cursor-pointer opacity-80 hover:opacity-100"
            title="Buka gambar ukuran asli di tab baru"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* ─── ACTION TOOLBAR BAWAH (ERGONOMIS, JELAS & MUDAH DIAKSES) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {/* TOMBOL SALIN TAUTAN */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyImageLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Salin Tautan Langsung Gambar"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            <span>{copied ? 'Tautan Tersalin' : 'Salin URL Gambar'}</span>
          </button>
        </div>

        {/* AKSI UTAMA: UNDUH HD & PUBLIKASI */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* TOMBOL UNDUH HD */}
          <Button
            size="md"
            onClick={onDownload}
            disabled={downloading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-2 shadow-sm cursor-pointer"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{downloading ? 'Mengunduh Berkas...' : 'Unduh Gambar (HD)'}</span>
          </Button>

          {/* TOMBOL PUBLIKASI KE WEB */}
          {publishedUrl ? (
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-xs"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Lihat di Website Resmi</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <Button
              size="md"
              variant="outline"
              onClick={onPublish}
              disabled={publishing || isUnpaid}
              className={`${
                isUnpaid
                  ? 'text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                  : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
              } font-bold text-xs gap-1.5`}
            >
              {publishing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              )}
              <span>{isUnpaid ? 'Publish ke Web (Perlu Lisensi)' : 'Publikasikan ke Website'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
