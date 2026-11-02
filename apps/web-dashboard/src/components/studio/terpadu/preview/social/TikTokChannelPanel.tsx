'use client';

import React from 'react';
import Link from 'next/link';
import {
  Download,
  Copy,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SocialFeatureFlags } from '../types';

interface TikTokChannelPanelProps {
  connectedTikTokAccount: any;
  socialFeatureFlags: SocialFeatureFlags;
  tiktokCustomCaption: string;
  setTiktokCustomCaption: (val: string) => void;
  publishingTikTok: boolean;
  isUnpaid: boolean;
  selectedPosterUrl: string;
  generatedResult: any;
  downloadingPoster: boolean;
  onPublishTikTok: () => void;
  onDownloadPoster: (customName?: string) => void;
  onCopyCaption: (text: string, platform: string) => void;
}

export function TikTokChannelPanel({
  connectedTikTokAccount,
  socialFeatureFlags,
  tiktokCustomCaption,
  setTiktokCustomCaption,
  publishingTikTok,
  isUnpaid,
  selectedPosterUrl,
  generatedResult,
  downloadingPoster,
  onPublishTikTok,
  onDownloadPoster,
  onCopyCaption,
}: TikTokChannelPanelProps) {
  const posterUrl = selectedPosterUrl || generatedResult?.posterUrl;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
      {/* Header TikTok */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-black text-white shadow-xs border border-slate-800 relative overflow-hidden">
            <Video className="w-4.5 h-4.5 text-[#fe2c55]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-slate-900 dark:text-white text-sm">
                TikTok Content Posting
              </h4>
              <Badge variant="slate" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-slate-200 dark:border-slate-700">
                Direct Post API
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Publikasi materi visual dokumentasi &amp; poster kampanye ke profil TikTok.
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
            onClick={() => onCopyCaption(tiktokCustomCaption, 'TikTok')}
            className="h-8 text-xs font-bold gap-1 rounded-xl cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Salin Caption & Tautan</span>
          </Button>

          {socialFeatureFlags.AUTO_PUBLISH_TIKTOK ? (
            <Button
              type="button"
              size="sm"
              onClick={onPublishTikTok}
              disabled={publishingTikTok || isUnpaid || !connectedTikTokAccount || !tiktokCustomCaption.trim()}
              className="h-8 bg-gradient-to-r from-black via-slate-900 to-black hover:from-slate-900 hover:to-slate-800 text-white font-extrabold text-xs gap-1.5 rounded-xl shadow-xs transition-all border border-slate-800 cursor-pointer"
            >
              {publishingTikTok ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Video className="h-3.5 w-3.5 text-[#fe2c55]" />
              )}
              <span>Terbitkan ke TikTok</span>
            </Button>
          ) : (
            <a
              href="https://www.tiktok.com/upload"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-xl bg-gradient-to-r from-black via-slate-900 to-black hover:from-slate-900 hover:to-slate-800 text-white font-extrabold text-xs shadow-xs transition-all border border-slate-800 cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#fe2c55]" />
              <span>Buka TikTok</span>
            </a>
          )}
        </div>
      </div>

      {/* Status Akun TikTok (Khusus mode API) */}
      {socialFeatureFlags.AUTO_PUBLISH_TIKTOK && (
        !connectedTikTokAccount ? (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Akun TikTok belum terhubung. Tautkan akun di halaman Profil Parlemen untuk mengaktifkan direct posting.</span>
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
                Terhubung sebagai <strong className="font-bold">@{connectedTikTokAccount.accountHandle?.replace(/^@/, '')}</strong> ({connectedTikTokAccount.accountName || 'Kreator'})
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
              Token aktif {connectedTikTokAccount.daysRemaining} hari
            </span>
          </div>
        )
      )}

      {/* Grid Pratinjau & Kontrol TikTok Sejajar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Kolom Kiri: Mobile TikTok Feed Mockup */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
          <div className="w-64">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              <span>Pratinjau Feed</span>
              <span className="text-[10px] text-slate-400 font-normal">9:16 Vertical</span>
            </div>

            <div className="relative w-64 h-[440px] rounded-3xl overflow-hidden bg-black shadow-xl border-4 border-slate-800 flex flex-col justify-between p-3.5 mx-auto">
              {/* Background Media */}
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt="TikTok Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-85"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black flex items-center justify-center text-slate-600">
                  <Video className="w-12 h-12" />
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

              {/* Top Bar */}
              <div className="relative z-10 flex items-center justify-between text-white text-xs font-bold pt-1">
                <span className="opacity-80">Following</span>
                <span className="border-b-2 border-white pb-0.5">For You</span>
                <span className="opacity-80">🔍</span>
              </div>

              {/* Bottom Info Overlay */}
              <div className="relative z-10 space-y-1.5 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-[10px] border border-white">
                    TT
                  </div>
                  <span className="font-extrabold text-xs">
                    @{connectedTikTokAccount?.accountHandle?.replace(/^@/, '') || 'dewan_resmi'}
                  </span>
                </div>
                <p className="text-[11px] line-clamp-3 leading-snug opacity-95">
                  {tiktokCustomCaption || 'Belum ada caption TikTok.'}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] opacity-75 font-mono">
                  <span>🎵 Suara Asli - Suara Parlemen Resmi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pengaturan Caption TikTok */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            <span>Draft Caption</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${tiktokCustomCaption.length <= 2200
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                }`}
            >
              {tiktokCustomCaption.length} / 2200 Karakter
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md flex-1 flex flex-col justify-between">
            <div className="space-y-3 flex-1 flex flex-col">
              {socialFeatureFlags.AUTO_PUBLISH_TIKTOK && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-[#fe2c55]" />
                    <span>Direct Post Mode (Push by File)</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Media dikirim langsung melalui binary streaming aman ke TikTok API.
                  </p>
                </div>
              )}

              {/* Caption Editor */}
              <textarea
                value={tiktokCustomCaption}
                onChange={(e) => setTiktokCustomCaption(e.target.value)}
                rows={socialFeatureFlags.AUTO_PUBLISH_TIKTOK ? 6 : 10}
                placeholder="Tuliskan keterangan postingan atau caption video/foto TikTok..."
                className="w-full flex-1 min-h-[220px] p-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-400 font-sans leading-relaxed resize-y"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              <span>💡 Sertakan tagar dapil dan ajakan bagi warganet.</span>
              <a
                href="https://www.tiktok.com/upload"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white hover:underline"
              >
                <span>Buka Web TikTok</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

