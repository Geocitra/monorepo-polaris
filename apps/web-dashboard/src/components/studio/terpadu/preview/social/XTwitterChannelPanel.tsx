'use client';

import React from 'react';
import Link from 'next/link';
import {
  Download,
  Copy,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Image as ImageIcon,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SocialFeatureFlags } from '../types';

interface XTwitterChannelPanelProps {
  connectedXAccount: any;
  socialFeatureFlags: SocialFeatureFlags;
  xCustomText: string;
  setXCustomText: (val: string) => void;
  xAttachPoster: boolean;
  setXAttachPoster: (val: boolean) => void;
  publishingX: boolean;
  isUnpaid: boolean;
  selectedPosterUrl: string;
  generatedResult: any;
  downloadingPoster: boolean;
  onPublishX: () => void;
  onDownloadPoster: (customName?: string) => void;
  onCopyCaption: (text: string, platform: string) => void;
  onOpenLightbox: () => void;
}

export function XTwitterChannelPanel({
  connectedXAccount,
  socialFeatureFlags,
  xCustomText,
  setXCustomText,
  xAttachPoster,
  setXAttachPoster,
  publishingX,
  isUnpaid,
  selectedPosterUrl,
  generatedResult,
  downloadingPoster,
  onPublishX,
  onDownloadPoster,
  onCopyCaption,
  onOpenLightbox,
}: XTwitterChannelPanelProps) {
  const posterUrl = selectedPosterUrl || generatedResult?.posterUrl;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
      {/* Header X */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-black text-white shadow-xs border border-slate-800">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4.5 h-4.5 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-slate-900 dark:text-white text-sm">
                X (Twitter)
              </h4>
              {socialFeatureFlags.AUTO_PUBLISH_X_TWITTER ? (
                <Badge variant="slate" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-slate-200 dark:border-slate-700">
                  v2 API Official
                </Badge>
              ) : (
                <span className="text-[10px] text-slate-400 font-medium">
                  (Linimasa Publik)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Cuitan publikasi berita, rilis dewan, &amp; lampiran poster visual.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {posterUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDownloadPoster()}
              disabled={downloadingPoster}
              className="h-8 text-xs font-bold gap-1 rounded-xl cursor-pointer"
            >
              {downloadingPoster ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>Unduh Poster</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onCopyCaption(xCustomText, 'X')}
            className="h-8 text-xs font-bold gap-1 rounded-xl cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Salin Cuitan & Tautan</span>
          </Button>

          {socialFeatureFlags.AUTO_PUBLISH_X_TWITTER ? (
            <Button
              type="button"
              size="sm"
              onClick={onPublishX}
              disabled={publishingX || isUnpaid || !connectedXAccount || !xCustomText.trim()}
              className="h-8 bg-black hover:bg-slate-800 text-white font-extrabold text-xs gap-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {publishingX ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              )}
              <span>Publikasikan ke X</span>
            </Button>
          ) : (
            <a
              href="https://x.com/compose/post"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Buka X</span>
            </a>
          )}
        </div>
      </div>

      {/* Status Akun X (Khusus mode API) */}
      {socialFeatureFlags.AUTO_PUBLISH_X_TWITTER && (
        !connectedXAccount ? (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Akun X belum terhubung. Tautkan akun di halaman Profil Parlemen untuk mengaktifkan direct publish.</span>
            </div>
            <Link
              href="/profile"
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shrink-0 transition-colors"
            >
              Tautkan Akun
            </Link>
          </div>
        ) : (
          <div className="px-3 py-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                Terhubung sebagai <strong className="font-bold">@{connectedXAccount.accountHandle?.replace(/^@/, '')}</strong> ({connectedXAccount.accountName || 'Resmi'})
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
              Token aktif {connectedXAccount.daysRemaining} hari
            </span>
          </div>
        )
      )}

      {/* Grid Pratinjau & Kontrol Sejajar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Kolom Kiri: Live Tweet Card Mockup */}
        <div className="lg:col-span-6 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            <span>Pratinjau Linimasa</span>
            <span className="text-[10px] text-slate-400 font-normal">Live Mockup</span>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-slate-800 shadow-md space-y-3 font-sans flex-1 flex flex-col justify-between">
            <div className="flex items-start gap-3">
              {connectedXAccount?.profilePictureUrl ? (
                <img
                  src={connectedXAccount.profilePictureUrl}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 border border-slate-800">
                  X
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap leading-none">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                    {connectedXAccount?.accountName || 'Wakil Rakyat Resmi'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    @{connectedXAccount?.accountHandle?.replace(/^@/, '') || 'dewan_resmi'}
                  </span>
                  <span className="text-xs text-slate-400">• baru saja</span>
                </div>

                {/* Cuitan text */}
                <div className="mt-2 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto pr-1">
                  {xCustomText || 'Belum ada konten cuitan X.'}
                </div>

                {/* Lampiran Gambar Poster jika aktif / tersedia */}
                {(xAttachPoster || !socialFeatureFlags.AUTO_PUBLISH_X_TWITTER) && posterUrl && (
                  <div
                    onClick={onOpenLightbox}
                    className="mt-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-56 bg-slate-100 dark:bg-slate-900 cursor-pointer group relative"
                    title="Klik untuk memperbesar gambar"
                  >
                    <img
                      src={posterUrl}
                      alt="Poster Attachment"
                      className="w-full h-48 object-cover group-hover:scale-102 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                      <Maximize2 className="h-4 w-4" />
                      <span>Perbesar</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar Mockup ala X */}
            <div className="flex items-center justify-between text-slate-400 text-xs pt-3 mt-4 border-t border-slate-100 dark:border-slate-900 max-w-xs">
              <span className="hover:text-blue-500 flex items-center gap-1">💬 0</span>
              <span className="hover:text-emerald-500 flex items-center gap-1">🔁 0</span>
              <span className="hover:text-pink-500 flex items-center gap-1">❤️ 0</span>
              <span className="hover:text-blue-500 flex items-center gap-1">📊 0</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Editor Cuitan */}
        <div className="lg:col-span-6 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            <span>Draft Cuitan</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                xCustomText.length <= 280
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              }`}
            >
              {xCustomText.length} Karakter {xCustomText.length <= 280 ? '(1 Cuitan)' : '(Multi-Cuitan)'}
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md flex-1 flex flex-col justify-between">
            <div className="space-y-3 flex-1 flex flex-col">
              {/* Opsi Lampirkan Poster hanya muncul di Mode Otomatis (Direct API) */}
              {socialFeatureFlags.AUTO_PUBLISH_X_TWITTER && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Lampiran Media:
                  </span>
                  <button
                    type="button"
                    onClick={() => setXAttachPoster(!xAttachPoster)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      xAttachPoster
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      <div>
                        <p className="font-extrabold text-xs">Lampirkan Poster Visual</p>
                        <p className={`text-[10px] mt-0.5 leading-tight ${xAttachPoster ? 'opacity-80' : 'text-slate-400'}`}>
                          Sertakan poster grafis AI ke cuitan utama.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono">
                      {xAttachPoster ? '✓ AKTIF' : 'NONAKTIF'}
                    </span>
                  </button>
                </div>
              )}

              {/* Textarea Editor Cuitan */}
              <textarea
                value={xCustomText}
                onChange={(e) => setXCustomText(e.target.value)}
                rows={socialFeatureFlags.AUTO_PUBLISH_X_TWITTER ? 6 : 9}
                placeholder="Tuliskan isi cuitan untuk linimasa X..."
                className="w-full flex-1 min-h-[160px] p-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-400 font-sans leading-relaxed resize-y"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              <span>💡 Cuitan &gt; 280 karakter otomatis dirangkai berantai.</span>
              <a
                href="https://x.com/compose/post"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white hover:underline"
              >
                <span>Buka Web X</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

