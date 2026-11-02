'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  ArrowUpRight,
  CheckCheck,
  Copy,
  Download,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface WhatsAppChannelPanelProps {
  customWaText: string;
  setCustomWaText: (val: string) => void;
  selectedPosterUrl: string;
  generatedResult: any;
  downloadingPoster: boolean;
  onDownloadPoster: (customName?: string) => void;
}

export function WhatsAppChannelPanel({
  customWaText,
  setCustomWaText,
  selectedPosterUrl,
  generatedResult,
  downloadingPoster,
  onDownloadPoster,
}: WhatsAppChannelPanelProps) {
  const { toast } = useToast();
  const [copiedWa, setCopiedWa] = useState(false);
  const posterUrl = selectedPosterUrl || generatedResult?.posterUrl;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 dark:border-emerald-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
            <MessageCircle className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
              Pesan Memo WhatsApp
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Disusun khusus dengan format Markdown WhatsApp untuk disebarkan ke grup warga & relawan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(customWaText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <span>Buka WhatsApp</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(customWaText);
              setCopiedWa(true);
              setTimeout(() => setCopiedWa(false), 2000);
              toast({
                type: 'success',
                title: 'Pesan WhatsApp Disalin!',
                description: 'Tinggal tempel di obrolan WhatsApp.',
              });
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            {copiedWa ? <CheckCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedWa ? 'Tersalin' : 'Salin Teks'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <span>Isi Memo Siaran</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">(Dapat diedit bebas)</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Format Markdown WhatsApp</span>
        </div>
        <textarea
          value={customWaText}
          onChange={(e) => setCustomWaText(e.target.value)}
          rows={8}
          placeholder="Tulis atau sesuaikan isi memo WhatsApp di sini..."
          className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-sans shadow-inner border-l-4 border-l-emerald-500 resize-y transition-colors outline-hidden"
        />
      </div>

      {/* Unduh Poster Cetak A4 */}
      {posterUrl && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/40 text-xs shadow-2xs">
          <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Lampirkan poster dokumen resolusi penuh ke grup chat:</span>
          </span>
          <button
            type="button"
            onClick={() => onDownloadPoster('poster-resolusi-penuh.png')}
            disabled={downloadingPoster}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {downloadingPoster ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            <span>{downloadingPoster ? 'Mengunduh...' : 'Unduh Poster A4'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

