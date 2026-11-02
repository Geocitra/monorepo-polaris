'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Download,
  Copy,
  Send,
  Loader2,
  ExternalLink,
  MoreHorizontal,
  Image as ImageIcon,
  Globe,
  Heart,
  MessageCircle,
  RotateCw,
  Share2,
} from 'lucide-react';
import { SocialFeatureFlags } from '../types';

interface ThreadsChannelPanelProps {
  connectedThreadsAccount: any;
  socialFeatureFlags: SocialFeatureFlags;
  threadsCustomText: string;
  setThreadsCustomText: (val: string) => void;
  threadsAttachmentMode: 'link_card' | 'poster';
  setThreadsAttachmentMode: (mode: 'link_card' | 'poster') => void;
  publishingThreads: boolean;
  isUnpaid: boolean;
  selectedPosterUrl: string;
  generatedResult: any;
  authorName?: string;
  partyAffiliation?: string;
  articleDisplayUrl: string;
  downloadingPoster: boolean;
  onPublishThreads: () => void;
  onDownloadPoster: (customName?: string) => void;
  onCopyCaption: (text: string, platform: string) => void;
}

export function ThreadsChannelPanel({
  connectedThreadsAccount,
  socialFeatureFlags,
  threadsCustomText,
  setThreadsCustomText,
  threadsAttachmentMode,
  setThreadsAttachmentMode,
  publishingThreads,
  isUnpaid,
  selectedPosterUrl,
  generatedResult,
  authorName = 'Tokoh Publik',
  partyAffiliation = '',
  articleDisplayUrl,
  downloadingPoster,
  onPublishThreads,
  onDownloadPoster,
  onCopyCaption,
}: ThreadsChannelPanelProps) {
  const posterUrl = selectedPosterUrl || generatedResult?.posterUrl;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                Meta Threads
              </h4>
              {socialFeatureFlags.AUTO_PUBLISH_THREADS && (
                connectedThreadsAccount ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>@{connectedThreadsAccount.accountHandle}</span>
                  </span>
                ) : (
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline"
                  >
                    <span>⚠️ Belum Terhubung (Klik untuk Sambungkan Akun)</span>
                  </Link>
                )
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Format ringkas intisari kebijakan publik (maksimal 500 karakter).
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {posterUrl && (
            <button
              type="button"
              onClick={() => onDownloadPoster()}
              disabled={downloadingPoster}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh Poster</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onCopyCaption(threadsCustomText, 'Threads')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Salin Teks & Tautan</span>
          </button>

          {socialFeatureFlags.AUTO_PUBLISH_THREADS ? (
            <button
              type="button"
              onClick={onPublishThreads}
              disabled={publishingThreads || isUnpaid || !connectedThreadsAccount || threadsCustomText.length > 500}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs shadow-md shadow-slate-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {publishingThreads ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Publikasikan ke Threads Resmi</span>
            </button>
          ) : (
            <a
              href="https://www.threads.net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs shadow-md shadow-slate-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Buka Threads</span>
            </a>
          )}
        </div>
      </div>

      {/* 2-Column Responsive Layout: Mockup vs Editor Sejajar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Kolom Kiri: Mockup Threads WYSIWYG */}
        <div className="lg:col-span-6 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            <span>Pratinjau Postingan</span>
            <span className="text-[10px] text-slate-400 font-normal">Feed Publik</span>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Header Akun */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {connectedThreadsAccount?.profilePictureUrl ? (
                    <img
                      src={connectedThreadsAccount.profilePictureUrl}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-black text-xs">
                      {(connectedThreadsAccount?.accountHandle || authorName || 'U').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {connectedThreadsAccount?.accountHandle || authorName?.toLowerCase().replace(/\s+/g, '') || 'opinitaru'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">• Baru saja</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">
                      {connectedThreadsAccount?.accountName || authorName}
                      {partyAffiliation && partyAffiliation !== 'Fraksi Parlemen' ? ` (${partyAffiliation})` : ''}
                    </span>
                  </div>
                </div>

                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </div>

              {/* Konten Teks */}
              <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line pl-1 font-sans">
                {threadsCustomText || 'Belum ada konten tulisan.'}
              </div>

              {/* Lampiran Visual / Link Card */}
              {threadsAttachmentMode === 'link_card' ? (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3 transition-colors hover:border-slate-300">
                  <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt="Thumbnail Portal"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Sparkles className="h-5 w-5 text-slate-400 m-auto mt-4.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {generatedResult?.publication?.title || 'Kebijakan Publik Resmi'}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {generatedResult?.publication?.excerpt || 'Kajian dan advokasi sikap untuk konstituen.'}
                    </p>
                    <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400 font-bold block truncate">
                      {articleDisplayUrl}
                    </span>
                  </div>
                </div>
              ) : (
                posterUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-80 bg-slate-100 dark:bg-slate-900">
                    <img
                      src={posterUrl}
                      alt="Poster Dokumen"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )
              )}
            </div>

            {/* Engagement Bar Mockup Threads */}
            <div className="flex items-center gap-4 pt-3 text-slate-500 dark:text-slate-400 text-xs border-t border-slate-100 dark:border-slate-850 mt-4">
              <div className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer">
                <Heart className="h-4 w-4" />
                <span className="text-[10px] font-bold">128</span>
              </div>
              <div className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer">
                <MessageCircle className="h-4 w-4" />
                <span className="text-[10px] font-bold">42</span>
              </div>
              <div className="flex items-center gap-1 hover:text-emerald-500 transition-colors cursor-pointer">
                <RotateCw className="h-4 w-4" />
                <span className="text-[10px] font-bold">19</span>
              </div>
              <div className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ml-auto">
                <Share2 className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pengaturan & Editor */}
        <div className="lg:col-span-6 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            <span>Draft Caption</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                threadsCustomText.length <= 500
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {threadsCustomText.length} / 500 Karakter {threadsCustomText.length <= 500 ? '✓ Aman' : '⚠️ Melebihi Batas'}
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md flex-1 flex flex-col justify-between">
            <div className="space-y-3 flex-1 flex flex-col">
              {/* Selector Mode Lampiran hanya jika Direct API aktif */}
              {socialFeatureFlags.AUTO_PUBLISH_THREADS && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Pilihan Lampiran:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setThreadsAttachmentMode('link_card')}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        threadsAttachmentMode === 'link_card'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-extrabold text-xs flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        <span>Rich Link Card</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 leading-tight ${threadsAttachmentMode === 'link_card' ? 'opacity-80' : 'text-slate-400'}`}>
                        Tautan artikel publikasi resmi.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setThreadsAttachmentMode('poster')}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        threadsAttachmentMode === 'poster'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-extrabold text-xs flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Gambar Poster</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 leading-tight ${threadsAttachmentMode === 'poster' ? 'opacity-80' : 'text-slate-400'}`}>
                        Lampirkan poster visual.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Textarea Editor */}
              <textarea
                value={threadsCustomText}
                onChange={(e) => setThreadsCustomText(e.target.value)}
                rows={socialFeatureFlags.AUTO_PUBLISH_THREADS ? 6 : 9}
                placeholder="Tuliskan isi opini atau keterangan postingan Threads..."
                className="w-full flex-1 min-h-[160px] p-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-400 font-sans leading-relaxed resize-y"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              <span>💡 Tips: Sertakan data kunci & ajakan dialog bagi warga.</span>
              <a
                href="https://www.threads.net"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white hover:underline"
              >
                <span>Buka Web Threads</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

