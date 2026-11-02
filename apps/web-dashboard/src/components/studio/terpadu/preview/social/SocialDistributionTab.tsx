'use client';

import React from 'react';
import { Instagram, MessageCircle, Sparkles, Video } from 'lucide-react';
import { SocialChannelType, SocialFeatureFlags } from '../types';
import { InstagramChannelPanel } from './InstagramChannelPanel';
import { WhatsAppChannelPanel } from './WhatsAppChannelPanel';
import { ThreadsChannelPanel } from './ThreadsChannelPanel';
import { XTwitterChannelPanel } from './XTwitterChannelPanel';
import { TikTokChannelPanel } from './TikTokChannelPanel';

interface SocialDistributionTabProps {
  selectedSocialChannel: SocialChannelType;
  setSelectedSocialChannel: (ch: SocialChannelType) => void;
  socialFeatureFlags: SocialFeatureFlags;
  connectedAccount: any;
  connectedThreadsAccount: any;
  connectedXAccount: any;
  connectedTikTokAccount: any;
  selectedPosterUrl: string;
  generatedResult: any;
  carouselSlides: string[];
  setCarouselSlides: React.Dispatch<React.SetStateAction<string[]>>;
  activeSlideIndex: number;
  setActiveSlideIndex: (idx: number | ((prev: number) => number)) => void;
  slideFocalY: Record<number, number>;
  setSlideFocalY: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  igFramingMode: 'crop' | 'blur';
  setIgFramingMode: React.Dispatch<React.SetStateAction<'crop' | 'blur'>>;
  customIgCaption: string;
  setCustomIgCaption: (val: string) => void;
  publishingIg: boolean;
  onPublishInstagram: () => void;
  customWaText: string;
  setCustomWaText: (val: string) => void;
  threadsCustomText: string;
  setThreadsCustomText: (val: string) => void;
  threadsAttachmentMode: 'link_card' | 'poster';
  setThreadsAttachmentMode: (mode: 'link_card' | 'poster') => void;
  publishingThreads: boolean;
  onPublishThreads: () => void;
  xCustomText: string;
  setXCustomText: (val: string) => void;
  xAttachPoster: boolean;
  setXAttachPoster: (val: boolean) => void;
  publishingX: boolean;
  onPublishX: () => void;
  tiktokCustomCaption: string;
  setTiktokCustomCaption: (val: string) => void;
  publishingTikTok: boolean;
  onPublishTikTok: () => void;
  onDownloadPoster: (customName?: string) => void;
  onCopyCaption: (text: string, platform: string) => void;
  onOpenLightbox: () => void;
  downloadingPoster: boolean;
  isUnpaid: boolean;
  authorName?: string;
  partyAffiliation?: string;
  articleDisplayUrl: string;
}

export function SocialDistributionTab({
  selectedSocialChannel,
  setSelectedSocialChannel,
  socialFeatureFlags,
  connectedAccount,
  connectedThreadsAccount,
  connectedXAccount,
  connectedTikTokAccount,
  selectedPosterUrl,
  generatedResult,
  carouselSlides,
  setCarouselSlides,
  activeSlideIndex,
  setActiveSlideIndex,
  slideFocalY,
  setSlideFocalY,
  igFramingMode,
  setIgFramingMode,
  customIgCaption,
  setCustomIgCaption,
  publishingIg,
  onPublishInstagram,
  customWaText,
  setCustomWaText,
  threadsCustomText,
  setThreadsCustomText,
  threadsAttachmentMode,
  setThreadsAttachmentMode,
  publishingThreads,
  onPublishThreads,
  xCustomText,
  setXCustomText,
  xAttachPoster,
  setXAttachPoster,
  publishingX,
  onPublishX,
  tiktokCustomCaption,
  setTiktokCustomCaption,
  publishingTikTok,
  onPublishTikTok,
  onDownloadPoster,
  onCopyCaption,
  onOpenLightbox,
  downloadingPoster,
  isUnpaid,
  authorName = 'Tokoh Publik',
  partyAffiliation = '',
  articleDisplayUrl,
}: SocialDistributionTabProps) {
  return (
    <div className="space-y-4">
      {/* CHANNEL SWITCHER SUB-TABS */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelectedSocialChannel('instagram')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            selectedSocialChannel === 'instagram'
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Instagram className="h-4 w-4" />
          <span>Instagram Feed & Karusel</span>
          {connectedAccount && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedSocialChannel('whatsapp')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            selectedSocialChannel === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Memo WhatsApp Warga</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSocialChannel('threads')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            selectedSocialChannel === 'threads'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Meta Threads (Cuitan Opini)</span>
          {connectedThreadsAccount && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedSocialChannel('x')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            selectedSocialChannel === 'x'
              ? 'bg-black text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
          </svg>
          <span>X (Twitter Cuitan)</span>
          {connectedXAccount && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedSocialChannel('tiktok')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            selectedSocialChannel === 'tiktok'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Video className="h-3.5 w-3.5 text-[#fe2c55]" />
          <span>TikTok Feed</span>
          {connectedTikTokAccount && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* RENDER ACTIVE CHANNEL PANEL */}
      {selectedSocialChannel === 'instagram' && (
        <InstagramChannelPanel
          connectedAccount={connectedAccount}
          socialFeatureFlags={socialFeatureFlags}
          selectedPosterUrl={selectedPosterUrl}
          generatedResult={generatedResult}
          carouselSlides={carouselSlides}
          setCarouselSlides={setCarouselSlides}
          activeSlideIndex={activeSlideIndex}
          setActiveSlideIndex={setActiveSlideIndex}
          slideFocalY={slideFocalY}
          setSlideFocalY={setSlideFocalY}
          igFramingMode={igFramingMode}
          setIgFramingMode={setIgFramingMode}
          customIgCaption={customIgCaption}
          setCustomIgCaption={setCustomIgCaption}
          publishingIg={publishingIg}
          onPublishInstagram={onPublishInstagram}
          onDownloadPoster={onDownloadPoster}
          onCopyCaption={onCopyCaption}
          onOpenLightbox={onOpenLightbox}
          downloadingPoster={downloadingPoster}
        />
      )}

      {selectedSocialChannel === 'whatsapp' && (
        <WhatsAppChannelPanel
          customWaText={customWaText}
          setCustomWaText={setCustomWaText}
          selectedPosterUrl={selectedPosterUrl}
          generatedResult={generatedResult}
          downloadingPoster={downloadingPoster}
          onDownloadPoster={onDownloadPoster}
        />
      )}

      {selectedSocialChannel === 'threads' && (
        <ThreadsChannelPanel
          connectedThreadsAccount={connectedThreadsAccount}
          socialFeatureFlags={socialFeatureFlags}
          threadsCustomText={threadsCustomText}
          setThreadsCustomText={setThreadsCustomText}
          threadsAttachmentMode={threadsAttachmentMode}
          setThreadsAttachmentMode={setThreadsAttachmentMode}
          publishingThreads={publishingThreads}
          isUnpaid={isUnpaid}
          selectedPosterUrl={selectedPosterUrl}
          generatedResult={generatedResult}
          authorName={authorName}
          partyAffiliation={partyAffiliation}
          articleDisplayUrl={articleDisplayUrl}
          downloadingPoster={downloadingPoster}
          onPublishThreads={onPublishThreads}
          onDownloadPoster={onDownloadPoster}
          onCopyCaption={onCopyCaption}
        />
      )}

      {selectedSocialChannel === 'x' && (
        <XTwitterChannelPanel
          connectedXAccount={connectedXAccount}
          socialFeatureFlags={socialFeatureFlags}
          xCustomText={xCustomText}
          setXCustomText={setXCustomText}
          xAttachPoster={xAttachPoster}
          setXAttachPoster={setXAttachPoster}
          publishingX={publishingX}
          isUnpaid={isUnpaid}
          selectedPosterUrl={selectedPosterUrl}
          generatedResult={generatedResult}
          downloadingPoster={downloadingPoster}
          onPublishX={onPublishX}
          onDownloadPoster={onDownloadPoster}
          onCopyCaption={onCopyCaption}
          onOpenLightbox={onOpenLightbox}
        />
      )}

      {selectedSocialChannel === 'tiktok' && (
        <TikTokChannelPanel
          connectedTikTokAccount={connectedTikTokAccount}
          socialFeatureFlags={socialFeatureFlags}
          tiktokCustomCaption={tiktokCustomCaption}
          setTiktokCustomCaption={setTiktokCustomCaption}
          publishingTikTok={publishingTikTok}
          isUnpaid={isUnpaid}
          selectedPosterUrl={selectedPosterUrl}
          generatedResult={generatedResult}
          downloadingPoster={downloadingPoster}
          onPublishTikTok={onPublishTikTok}
          onDownloadPoster={onDownloadPoster}
          onCopyCaption={onCopyCaption}
        />
      )}
    </div>
  );
}

