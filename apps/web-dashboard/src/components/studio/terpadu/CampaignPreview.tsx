'use client';

import { getPortalUrl } from '@/lib/urls';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  Sparkles,
  ImageIcon,
  Globe,
  Copy,
  FileText,
  Share2,
  ExternalLink,
  Lock,
  Check,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';
import { downloadImageFile } from '@/lib/utils';
import { InstagramPublishProgressModal } from '@/components/studio/InstagramPublishProgressModal';
import { ThreadsPublishProgressModal } from '@/components/studio/ThreadsPublishProgressModal';
import { XPublishProgressModal } from '@/components/studio/XPublishProgressModal';
import { TikTokPublishProgressModal } from '@/components/studio/TikTokPublishProgressModal';
import { PosterLightbox } from './preview/PosterLightbox';
import { ArticlePreviewTab } from './preview/tabs/ArticlePreviewTab';
import { PosterPreviewTab } from './preview/tabs/PosterPreviewTab';
import { SocialDistributionTab } from './preview/social/SocialDistributionTab';
import { SocialChannelType, SocialFeatureFlags } from './preview/types';

interface CampaignPreviewProps {
  generatedResult: any;
  publishedUrl: string | null;
  activeTab: 'article' | 'poster' | 'social';
  onTabChange: (tab: 'article' | 'poster' | 'social') => void;
  isUnpaid: boolean;
  publishing: boolean;
  onPublish: () => void;
  onUpdateArticleContent?: (newTitle: string, newBody: string) => void;
  authorName?: string;
  partyAffiliation?: string;
  isBackgroundRenderingPoster?: boolean;
  userSubdomain?: string;
  userCustomDomain?: string;
}

export function CampaignPreview({
  generatedResult,
  publishedUrl,
  activeTab,
  onTabChange,
  isUnpaid,
  publishing,
  onPublish,
  onUpdateArticleContent,
  authorName = 'Tokoh Publik',
  partyAffiliation = '',
  isBackgroundRenderingPoster = false,
  userSubdomain,
  userCustomDomain,
}: CampaignPreviewProps) {
  const { toast } = useToast();
  const [copiedAll, setCopiedAll] = useState(false);
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(generatedResult?.publication?.title || '');
  const [editedBody, setEditedBody] = useState(generatedResult?.publication?.bodyContentMarkdown || '');
  const [selectedPosterUrl, setSelectedPosterUrl] = useState(generatedResult?.posterUrl || '');
  const [regeneratingPoster, setRegeneratingPoster] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<any>(null);
  const [connectedThreadsAccount, setConnectedThreadsAccount] = useState<any>(null);
  const [connectedXAccount, setConnectedXAccount] = useState<any>(null);
  const [connectedTikTokAccount, setConnectedTikTokAccount] = useState<any>(null);

  const [publishingIg, setPublishingIg] = useState(false);
  const [publishingThreads, setPublishingThreads] = useState(false);
  const [publishingX, setPublishingX] = useState(false);
  const [publishingTikTok, setPublishingTikTok] = useState(false);

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeThreadsJobId, setActiveThreadsJobId] = useState<string | null>(null);
  const [activeXJobId, setActiveXJobId] = useState<string | null>(null);
  const [activeTikTokJobId, setActiveTikTokJobId] = useState<string | null>(null);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isThreadsPublishModalOpen, setIsThreadsPublishModalOpen] = useState(false);
  const [isXPublishModalOpen, setIsXPublishModalOpen] = useState(false);
  const [isTikTokPublishModalOpen, setIsTikTokPublishModalOpen] = useState(false);

  const [threadsAttachmentMode, setThreadsAttachmentMode] = useState<'link_card' | 'poster'>('link_card');
  const [threadsCustomText, setThreadsCustomText] = useState('');
  const [igFramingMode, setIgFramingMode] = useState<'crop' | 'blur'>('crop');
  const [selectedSocialChannel, setSelectedSocialChannel] = useState<SocialChannelType>('instagram');
  const [xCustomText, setXCustomText] = useState('');
  const [xAttachPoster, setXAttachPoster] = useState(true);
  const [tiktokCustomCaption, setTiktokCustomCaption] = useState('');

  const [carouselSlides, setCarouselSlides] = useState<string[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [slideFocalY, setSlideFocalY] = useState<Record<number, number>>({});
  const [downloadingPoster, setDownloadingPoster] = useState(false);
  const [customIgCaption, setCustomIgCaption] = useState('');
  const [customWaText, setCustomWaText] = useState('');
  const [isPosterLightboxOpen, setIsPosterLightboxOpen] = useState(false);
  const [socialFeatureFlags, setSocialFeatureFlags] = useState<SocialFeatureFlags>({
    AUTO_PUBLISH_INSTAGRAM: false,
    AUTO_PUBLISH_THREADS: false,
    AUTO_PUBLISH_TIKTOK: false,
    AUTO_PUBLISH_X_TWITTER: false,
  });

  // Listener tombol Escape untuk menutup Fullscreen Poster Lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsPosterLightboxOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function handleDownloadPosterImage(customName?: string) {
    const poster = selectedPosterUrl || generatedResult?.posterUrl;
    if (!poster) return;
    setDownloadingPoster(true);
    const filename = customName || `${(generatedResult?.title || 'Poster_Kebijakan').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 35)}_HD.jpg`;
    try {
      await downloadImageFile(poster, filename);
      toast({
        type: 'success',
        title: 'Poster Berhasil Diunduh',
        description: 'Berkas gambar resolusi tinggi telah tersimpan di perangkat Anda.',
      });
    } catch {
      window.open(poster, '_blank');
    } finally {
      setDownloadingPoster(false);
    }
  }

  async function handleRegeneratePoster() {
    const publicationId = generatedResult?.publication?.id;
    if (!publicationId || regeneratingPoster) return;
    setRegeneratingPoster(true);
    toast({
      type: 'info',
      title: 'Merender Visual Poster...',
      description: 'Sistem sedang memproses poster visual baru di antrean background.',
    });
    try {
      const res = await ApiClient.request<any>(`/studio/articles/${publicationId}/poster/regenerate`, {
        method: 'POST',
      });
      const jobId = res?.jobId;
      if (jobId) {
        for (let i = 0; i < 45; i++) {
          await new Promise((r) => setTimeout(r, 1500));
          const st = await ApiClient.request<any>(`/studio/jobs/${jobId}`);
          if (st?.status === 'COMPLETED') {
            const detail = await ApiClient.request<any>(`/studio/articles/${publicationId}`);
            const newUrl = detail?.asset?.cdnPublicUrl || detail?.asset?.r2StorageUrl;
            if (newUrl) {
              setSelectedPosterUrl(newUrl);
              if (generatedResult) {
                generatedResult.posterUrl = newUrl;
              }
              toast({
                type: 'success',
                title: 'Poster Berhasil Dibuat!',
                description: 'Visual baru telah dimuat ke kanvas.',
              });
              break;
            }
          } else if (st?.status === 'FAILED') {
            throw new Error(st?.failedReason || st?.errorDetails || 'Pemrosesan poster gagal.');
          }
        }
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Render Poster',
        description: err.message || 'Terjadi gangguan saat membuat visual poster.',
      });
    } finally {
      setRegeneratingPoster(false);
    }
  }

  useEffect(() => {
    ApiClient.request<any>('/social/instagram/account')
      .then((acc) => setConnectedAccount(acc))
      .catch(() => setConnectedAccount(null));

    ApiClient.request<any>('/social/threads/account')
      .then((acc) => setConnectedThreadsAccount(acc))
      .catch(() => setConnectedThreadsAccount(null));

    ApiClient.request<any>('/social/x/account')
      .then((acc) => setConnectedXAccount(acc))
      .catch(() => setConnectedXAccount(null));

    ApiClient.request<any>('/social/tiktok/account')
      .then((acc) => setConnectedTikTokAccount(acc))
      .catch(() => setConnectedTikTokAccount(null));

    ApiClient.request<any>('/social/feature-flags')
      .then((flags) => {
        if (flags) setSocialFeatureFlags(flags);
      })
      .catch(() => {});
  }, []);

  // Sinkronisasi teks sosial (Instagram, WhatsApp, Threads) saat konten baru dibuat
  useEffect(() => {
    if (generatedResult?.socialPack) {
      const initialThreads =
        generatedResult.socialPack.twitterThreads?.[0] ||
        generatedResult.socialPack.instagramCaption?.slice(0, 420) ||
        '';
      setThreadsCustomText(initialThreads);
      const initialX =
        generatedResult.socialPack.twitterThreads?.join('\n\n') ||
        generatedResult.socialPack.twitterThreads?.[0] ||
        generatedResult.socialPack.instagramCaption?.slice(0, 400) ||
        '';
      setXCustomText(initialX);
      const initialTikTok =
        (generatedResult.socialPack as any)?.shortVideoScript?.hook ||
        generatedResult.socialPack.instagramCaption?.slice(0, 250) ||
        '';
      setTiktokCustomCaption(initialTikTok);
      setCustomIgCaption(generatedResult.socialPack.instagramCaption || '');
      setCustomWaText(
        generatedResult.socialPack.whatsappBroadcastText ||
        generatedResult.socialPack.whatsappBroadcast ||
        ''
      );
    }
  }, [generatedResult?.socialPack]);

  // Auto-sync posterUrl saat background polling selesai
  useEffect(() => {
    if (generatedResult?.posterUrl && generatedResult.posterUrl !== selectedPosterUrl) {
      setSelectedPosterUrl(generatedResult.posterUrl);
    }
  }, [generatedResult?.posterUrl, selectedPosterUrl]);

  // Auto-sync naskah artikel saat draf selesai
  useEffect(() => {
    if (generatedResult?.publication?.title && !isEditingArticle) {
      setEditedTitle(generatedResult.publication.title);
    }
    if (generatedResult?.publication?.bodyContentMarkdown && !isEditingArticle) {
      setEditedBody(generatedResult.publication.bodyContentMarkdown);
    }
  }, [generatedResult?.publication?.title, generatedResult?.publication?.bodyContentMarkdown, isEditingArticle]);

  useEffect(() => {
    const poster = selectedPosterUrl || generatedResult?.posterUrl;
    if (poster) {
      setCarouselSlides((prev) => {
        if (prev.length === 0) return [poster];
        return [poster, ...prev.slice(1)];
      });
    }
  }, [selectedPosterUrl, generatedResult?.posterUrl]);

  function renderFocalCrop(imageUrl: string, focalPercentY: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const targetW = 1080;
        const targetH = 1350;
        const targetRatio = 4 / 5;
        const imgRatio = img.width / img.height;

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageUrl);

        let sW: number, sH: number, sX: number, sY: number;

        if (imgRatio > targetRatio) {
          sH = img.height;
          sW = img.height * targetRatio;
          sX = (img.width - sW) / 2;
          sY = 0;
        } else {
          sW = img.width;
          sH = img.width / targetRatio;
          sX = 0;
          const maxOffset = Math.max(0, img.height - sH);
          sY = maxOffset * (Math.max(0, Math.min(100, focalPercentY)) / 100);
        }

        ctx.drawImage(img, sX, sY, sW, sH, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => resolve(imageUrl);
      img.src = imageUrl;
    });
  }

  async function handlePublishInstagramFromCampaign() {
    if (!connectedAccount) {
      toast({
        type: 'warning',
        title: 'Instagram Belum Terhubung',
        description: 'Tautkan akun Instagram resmi Anda di menu Tema & Website terlebih dahulu.',
      });
      return;
    }

    const posterTarget = selectedPosterUrl || generatedResult?.posterUrl;
    let targetSlides = carouselSlides.length > 0 ? [...carouselSlides] : (posterTarget ? [posterTarget] : []);

    if (targetSlides.length === 0) {
      toast({
        type: 'error',
        title: 'Poster Belum Tersedia',
        description: 'Tunggu gambar visual selesai diproses sebelum menerbitkan.',
      });
      return;
    }

    if (igFramingMode === 'crop') {
      targetSlides = await Promise.all(
        targetSlides.map((url, idx) => {
          const focalY = slideFocalY[idx] ?? 50;
          if (focalY === 50) return Promise.resolve(url);
          return renderFocalCrop(url, focalY);
        })
      );
    }

    const igCaption = customIgCaption || generatedResult.socialPack?.instagramCaption || '';

    setPublishingIg(true);
    try {
      const res = await ApiClient.request<{ success: boolean; jobId: string; publishingJobId: string }>(
        '/social/instagram/publish',
        {
          method: 'POST',
          body: JSON.stringify({
            accountId: connectedAccount.id,
            publicationId: generatedResult.publication?.id,
            caption: igCaption,
            mediaUrl: targetSlides[0],
            mediaUrls: targetSlides.length > 1 ? targetSlides : undefined,
            framingMode: igFramingMode,
          }),
        }
      );

      const targetJobId = res?.publishingJobId || res?.jobId;
      if (targetJobId) {
        setActiveJobId(targetJobId);
        setIsPublishModalOpen(true);
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menerbitkan ke Instagram',
        description: err.message,
      });
    } finally {
      setPublishingIg(false);
    }
  }

  const articleSlug = generatedResult?.publication?.slug || '';
  const basePortalUrl = getPortalUrl(userSubdomain, userCustomDomain);
  const articleUrl = publishedUrl || (articleSlug ? `${basePortalUrl}/artikel/${articleSlug}` : '');
  const articleDisplayUrl = articleUrl
    ? articleUrl.replace(/^https?:\/\//, '')
    : `${basePortalUrl.replace(/^https?:\/\//, '')}${articleSlug ? `/artikel/${articleSlug}` : '/artikel/...'}`;

  function handleCopyCaptionWithPortalLink(rawText: string, platformLabel: string) {
    let textToCopy = (rawText || '').trim();
    if (articleUrl && !textToCopy.includes(articleUrl)) {
      textToCopy += `\n\nBaca artikel selengkapnya di portal resmi:\n${articleUrl}`;
    }
    navigator.clipboard.writeText(textToCopy);
    toast({
      type: 'success',
      title: `Naskah ${platformLabel} Disalin!`,
      description: articleUrl
        ? 'Naskah beserta tautan portal resmi siap ditempel di sosmed.'
        : 'Naskah berhasil disalin ke papan klip.',
    });
  }

  async function handlePublishToThreads() {
    if (!connectedThreadsAccount) {
      toast({
        type: 'warning',
        title: 'Akun Threads Belum Terhubung',
        description: 'Hubungkan akun Meta Threads di menu Tema & Branding terlebih dahulu.',
      });
      return;
    }

    if (!threadsCustomText.trim()) {
      toast({
        type: 'warning',
        title: 'Teks Cuitan Kosong',
        description: 'Tuliskan naskah cuitan terlebih dahulu sebelum menerbitkan.',
      });
      return;
    }

    const finalPosterUrl = selectedPosterUrl || generatedResult?.posterUrl;
    const mediaUrlToAttach = threadsAttachmentMode === 'poster' ? finalPosterUrl : undefined;

    setPublishingThreads(true);
    try {
      let targetLinkAttachment: string | undefined = undefined;
      if (threadsAttachmentMode === 'link_card') {
        let finalLink = articleUrl;
        if (!publishedUrl && generatedResult?.publication?.id) {
          try {
            const pubRes = await ApiClient.request<any>(`/studio/articles/${generatedResult.publication.id}/publish`, {
              method: 'POST',
            });
            if (pubRes?.canonicalUrl) {
              finalLink = pubRes.canonicalUrl;
            }
          } catch (pubErr) {
            console.warn('Auto-publish portal saat publish threads:', pubErr);
          }
        }
        targetLinkAttachment = finalLink || undefined;
      }

      const res = await ApiClient.request<{ success: boolean; jobId: string }>('/social/threads/publish', {
        method: 'POST',
        body: JSON.stringify({
          accountId: connectedThreadsAccount.id,
          publicationId: generatedResult?.publication?.id,
          text: threadsCustomText,
          mediaUrl: mediaUrlToAttach,
          linkAttachment: targetLinkAttachment,
        }),
      });

      if (res?.jobId) {
        setActiveThreadsJobId(res.jobId);
        setIsThreadsPublishModalOpen(true);
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menerbitkan ke Threads',
        description: err.message || 'Terjadi kesalahan saat mempublikasikan ke Threads.',
      });
    } finally {
      setPublishingThreads(false);
    }
  }

  async function handlePublishX() {
    if (!connectedXAccount) {
      toast({
        type: 'warning',
        title: 'Akun X Belum Terhubung',
        description: 'Hubungkan akun resmi X (Twitter) di menu Profil & Saluran Publik terlebih dahulu.',
      });
      return;
    }

    if (!xCustomText.trim()) {
      toast({
        type: 'warning',
        title: 'Teks Cuitan Kosong',
        description: 'Tuliskan naskah cuitan terlebih dahulu sebelum menerbitkan.',
      });
      return;
    }

    const finalPosterUrl = selectedPosterUrl || generatedResult?.posterUrl;
    const mediaUrlsToAttach = xAttachPoster && finalPosterUrl ? [finalPosterUrl] : undefined;

    setPublishingX(true);
    try {
      const res = await ApiClient.request<{ success?: boolean; jobId: string }>('/social/x/publish', {
        method: 'POST',
        body: JSON.stringify({
          accountId: connectedXAccount.id,
          publicationId: generatedResult?.publication?.id,
          text: xCustomText,
          mediaUrls: mediaUrlsToAttach,
        }),
      });

      if (res?.jobId) {
        setActiveXJobId(res.jobId);
        setIsXPublishModalOpen(true);
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menerbitkan ke X',
        description: err.message || 'Terjadi kesalahan saat mempublikasikan ke X.',
      });
    } finally {
      setPublishingX(false);
    }
  }

  async function handlePublishTikTok() {
    if (!connectedTikTokAccount) {
      toast({
        type: 'warning',
        title: 'Akun TikTok Belum Terhubung',
        description: 'Hubungkan akun resmi TikTok di menu Profil & Saluran Publik terlebih dahulu.',
      });
      return;
    }

    if (!tiktokCustomCaption.trim()) {
      toast({
        type: 'warning',
        title: 'Caption TikTok Kosong',
        description: 'Tuliskan caption video/foto terlebih dahulu sebelum menerbitkan.',
      });
      return;
    }

    const finalMediaUrl = selectedPosterUrl || generatedResult?.posterUrl;
    if (!finalMediaUrl) {
      toast({
        type: 'warning',
        title: 'Media Tidak Ditemukan',
        description: 'Pilih atau generate poster/media visual terlebih dahulu.',
      });
      return;
    }

    setPublishingTikTok(true);
    try {
      const res = await ApiClient.request<{ success?: boolean; jobId: string }>('/social/tiktok/publish', {
        method: 'POST',
        body: JSON.stringify({
          accountId: connectedTikTokAccount.id,
          publicationId: generatedResult?.publication?.id,
          title: tiktokCustomCaption,
          mediaUrl: finalMediaUrl,
          mediaType: 'PHOTO',
        }),
      });

      if (res?.jobId) {
        setActiveTikTokJobId(res.jobId);
        setIsTikTokPublishModalOpen(true);
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menerbitkan ke TikTok',
        description: err.message || 'Terjadi kesalahan saat mempublikasikan ke TikTok.',
      });
    } finally {
      setPublishingTikTok(false);
    }
  }

  useEffect(() => {
    if (generatedResult?.posterUrl) {
      setSelectedPosterUrl(generatedResult.posterUrl);
    }
    if (generatedResult?.publication?.title) {
      setEditedTitle(generatedResult.publication.title);
    }
    if (generatedResult?.publication?.bodyContentMarkdown) {
      setEditedBody(generatedResult.publication.bodyContentMarkdown);
    }
  }, [generatedResult]);

  if (!generatedResult) {
    return (
      <Card className="min-h-[500px] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4 rounded-3xl shadow-xs">
        <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h4 className="font-black text-slate-900 dark:text-white text-lg">
            Hasil Konten Akan Muncul di Sini
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Tulis topik atau tempel link berita pada formulir di atas, lalu klik &quot;Buat Sekarang&quot;. AI akan otomatis membuat naskah artikel, poster, dan pesan siaran sekaligus.
          </p>
        </div>
      </Card>
    );
  }

  const currentTitle = editedTitle || generatedResult.publication?.title;
  const currentBody = editedBody || generatedResult.publication?.bodyContentMarkdown;
  const wordCount = (currentBody || '').split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  function handleCopyAllCampaign() {
    const waText =
      generatedResult.socialPack?.whatsappBroadcastText ||
      generatedResult.socialPack?.whatsappBroadcast ||
      '';
    const igText = generatedResult.socialPack?.instagramCaption || '';

    const fullPackageText = `=== PAKET KONTEN LENGKAP ===\n\n` +
      `JUDUL: ${currentTitle}\n` +
      `ESTIMASI BACA: ${readTimeMinutes} Menit (${wordCount} Kata)\n\n` +
      `--- RINGKASAN ---\n${generatedResult.publication?.excerpt || ''}\n\n` +
      `--- PESAN WHATSAPP ---\n${waText}\n\n` +
      `--- CAPTION INSTAGRAM ---\n${igText}\n\n` +
      `==========================`;

    navigator.clipboard.writeText(fullPackageText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
    toast({
      type: 'success',
      title: 'Semua Konten Tersalin!',
      description: 'Naskah, pesan WhatsApp, dan caption Instagram telah disalin ke clipboard.',
    });
  }

  function handleSaveArticleEdit() {
    setIsEditingArticle(false);
    if (onUpdateArticleContent) {
      onUpdateArticleContent(currentTitle, currentBody);
    }
    toast({
      type: 'success',
      title: 'Perubahan Disimpan',
      description: 'Naskah artikel berhasil diperbarui.',
    });
  }

  return (
    <Card className="space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-6 rounded-3xl">
      {/* HEADER HASIL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="green" className="font-extrabold text-[10px] uppercase">
              Siap Digunakan
            </Badge>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              {wordCount} Kata • {readTimeMinutes} Menit Baca
            </span>
          </div>
          <h4 className="font-black text-slate-900 dark:text-white text-base sm:text-lg mt-1 line-clamp-1">
            {currentTitle}
          </h4>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyAllCampaign}
            className="text-xs font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 gap-1.5 shadow-2xs"
          >
            {copiedAll ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
            <span>{copiedAll ? 'Tersalin!' : 'Salin Semua'}</span>
          </Button>

          {publishedUrl ? (
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white font-extrabold text-xs hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Buka di Website</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : isUnpaid ? (
            <Link href="/billing">
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50 gap-1.5 font-extrabold text-xs">
                <Lock className="h-3.5 w-3.5 text-amber-600" />
                <span>Aktivasi Lisensi</span>
              </Button>
            </Link>
          ) : (
            <Button
              onClick={onPublish}
              disabled={publishing}
              loading={publishing}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs gap-1.5 shadow-xs"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Terbitkan ke Website</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3 TAB OUTPUT */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => onTabChange('article')}
          className={`pb-2.5 px-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'article'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="h-3.5 w-3.5 inline mr-1.5" />
          Kajian Artikel
        </button>
        <button
          onClick={() => onTabChange('poster')}
          className={`pb-2.5 px-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'poster'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5 inline mr-1.5" />
          Poster & Infografis
        </button>
        <button
          onClick={() => onTabChange('social')}
          className={`pb-2.5 px-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'social'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Share2 className="h-3.5 w-3.5 inline mr-1.5" />
          Distribusi Media Sosial
        </button>
      </div>

      {/* TAB 1: KAJIAN ARTIKEL */}
      {activeTab === 'article' && (
        <ArticlePreviewTab
          generatedResult={generatedResult}
          currentTitle={currentTitle}
          editedTitle={editedTitle}
          setEditedTitle={setEditedTitle}
          currentBody={currentBody}
          setEditedBody={setEditedBody}
          isEditingArticle={isEditingArticle}
          setIsEditingArticle={setIsEditingArticle}
          onSaveArticleEdit={handleSaveArticleEdit}
          authorName={authorName}
          partyAffiliation={partyAffiliation}
          selectedPosterUrl={selectedPosterUrl}
        />
      )}

      {/* TAB 2: POSTER & INFOGRAFIS */}
      {activeTab === 'poster' && (
        <PosterPreviewTab
          selectedPosterUrl={selectedPosterUrl}
          generatedResult={generatedResult}
          regeneratingPoster={regeneratingPoster}
          isBackgroundRenderingPoster={isBackgroundRenderingPoster}
          downloadingPoster={downloadingPoster}
          onRegeneratePoster={handleRegeneratePoster}
          onDownloadPoster={handleDownloadPosterImage}
          onOpenLightbox={() => setIsPosterLightboxOpen(true)}
        />
      )}

      {/* TAB 3: SEBARAN SOSIAL MULTI-KANAL */}
      {activeTab === 'social' && generatedResult.socialPack && (
        <SocialDistributionTab
          selectedSocialChannel={selectedSocialChannel}
          setSelectedSocialChannel={setSelectedSocialChannel}
          socialFeatureFlags={socialFeatureFlags}
          connectedAccount={connectedAccount}
          connectedThreadsAccount={connectedThreadsAccount}
          connectedXAccount={connectedXAccount}
          connectedTikTokAccount={connectedTikTokAccount}
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
          onPublishInstagram={handlePublishInstagramFromCampaign}
          customWaText={customWaText}
          setCustomWaText={setCustomWaText}
          threadsCustomText={threadsCustomText}
          setThreadsCustomText={setThreadsCustomText}
          threadsAttachmentMode={threadsAttachmentMode}
          setThreadsAttachmentMode={setThreadsAttachmentMode}
          publishingThreads={publishingThreads}
          onPublishThreads={handlePublishToThreads}
          xCustomText={xCustomText}
          setXCustomText={setXCustomText}
          xAttachPoster={xAttachPoster}
          setXAttachPoster={setXAttachPoster}
          publishingX={publishingX}
          onPublishX={handlePublishX}
          tiktokCustomCaption={tiktokCustomCaption}
          setTiktokCustomCaption={setTiktokCustomCaption}
          publishingTikTok={publishingTikTok}
          onPublishTikTok={handlePublishTikTok}
          onDownloadPoster={handleDownloadPosterImage}
          onCopyCaption={handleCopyCaptionWithPortalLink}
          onOpenLightbox={() => setIsPosterLightboxOpen(true)}
          downloadingPoster={downloadingPoster}
          isUnpaid={isUnpaid}
          authorName={authorName}
          partyAffiliation={partyAffiliation}
          articleDisplayUrl={articleDisplayUrl}
        />
      )}

      {/* Pop-up Live Progress Modal Penerbitan Instagram */}
      {connectedAccount && (
        <InstagramPublishProgressModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          jobId={activeJobId}
          accountHandle={connectedAccount.accountHandle}
          posterUrl={carouselSlides[0] || selectedPosterUrl || generatedResult?.posterUrl}
          captionPreview={customIgCaption || generatedResult?.socialPack?.instagramCaption}
          slideCount={carouselSlides.length > 0 ? carouselSlides.length : 1}
        />
      )}

      {/* Pop-up Live Progress Modal Penerbitan Meta Threads */}
      {connectedThreadsAccount && (
        <ThreadsPublishProgressModal
          isOpen={isThreadsPublishModalOpen}
          onClose={() => setIsThreadsPublishModalOpen(false)}
          jobId={activeThreadsJobId}
          accountHandle={connectedThreadsAccount.accountHandle}
          textPreview={threadsCustomText}
          mediaUrl={threadsAttachmentMode === 'poster' ? (selectedPosterUrl || generatedResult?.posterUrl) : undefined}
        />
      )}

      {/* Pop-up Live Progress Modal Penerbitan X (Twitter) */}
      {connectedXAccount && (
        <XPublishProgressModal
          isOpen={isXPublishModalOpen}
          onClose={() => setIsXPublishModalOpen(false)}
          jobId={activeXJobId}
          accountHandle={connectedXAccount.accountHandle}
          textPreview={xCustomText}
          mediaUrl={xAttachPoster ? (selectedPosterUrl || generatedResult?.posterUrl) : undefined}
        />
      )}

      {/* Pop-up Live Progress Modal Penerbitan TikTok */}
      {connectedTikTokAccount && (
        <TikTokPublishProgressModal
          isOpen={isTikTokPublishModalOpen}
          onClose={() => setIsTikTokPublishModalOpen(false)}
          jobId={activeTikTokJobId}
          accountHandle={connectedTikTokAccount.accountHandle}
          titlePreview={tiktokCustomCaption}
          mediaUrl={selectedPosterUrl || generatedResult?.posterUrl}
        />
      )}

      {/* LIGHTBOX FULLSCREEN MODAL: LIHAT POSTER RESOLUSI TINGGI PENUH */}
      <PosterLightbox
        isOpen={isPosterLightboxOpen && Boolean(selectedPosterUrl || generatedResult?.posterUrl)}
        onClose={() => setIsPosterLightboxOpen(false)}
        imageUrl={selectedPosterUrl || generatedResult?.posterUrl}
        title={currentTitle}
        downloading={downloadingPoster}
        onDownload={handleDownloadPosterImage}
      />
    </Card>
  );
}
