'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  Sparkles,
  Image as ImageIcon,
  Globe,
  Copy,
  MessageCircle,
  FileText,
  Share2,
  ExternalLink,
  Lock,
  Download,
  Edit3,
  Eye,
  CheckCheck,
  Check,
  ShieldCheck,
  BarChart3,
  Cpu,
  Send,
  Loader2,
  Instagram,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Heart,
  Bookmark,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  MoveVertical,
  RotateCw,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';
import { InstagramPublishProgressModal } from '@/components/studio/InstagramPublishProgressModal';
import { ThreadsPublishProgressModal } from '@/components/studio/ThreadsPublishProgressModal';

const TiptapExecutiveEditor = dynamic(
  () => import('@/components/studio/artikel/TiptapExecutiveEditor').then((m) => m.TiptapExecutiveEditor),
  {
    ssr: false,
    loading: () => (
      <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span>Memuat Kanvas Naskah Artikel...</span>
      </div>
    ),
  }
);

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
  authorName = 'Anggota Dewan',
  partyAffiliation = 'Fraksi Parlemen',
}: CampaignPreviewProps) {
  const { toast } = useToast();
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedIg, setCopiedIg] = useState(false);
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(generatedResult?.publication?.title || '');
  const [editedBody, setEditedBody] = useState(generatedResult?.publication?.bodyContentMarkdown || '');
  const [selectedPosterUrl, setSelectedPosterUrl] = useState(generatedResult?.posterUrl || '');
  const [visualMode, setVisualMode] = useState<'infographic' | 'raw_poster'>('infographic');
  const [connectedAccount, setConnectedAccount] = useState<any>(null);
  const [connectedThreadsAccount, setConnectedThreadsAccount] = useState<any>(null);
  const [publishingIg, setPublishingIg] = useState(false);
  const [publishingThreads, setPublishingThreads] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeThreadsJobId, setActiveThreadsJobId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isThreadsPublishModalOpen, setIsThreadsPublishModalOpen] = useState(false);
  const [threadsAttachmentMode, setThreadsAttachmentMode] = useState<'link_card' | 'poster'>('link_card');
  const [threadsCustomText, setThreadsCustomText] = useState('');
  const [igFramingMode, setIgFramingMode] = useState<'crop' | 'blur'>('crop');
  const [selectedSocialChannel, setSelectedSocialChannel] = useState<'instagram' | 'whatsapp' | 'threads'>('instagram');
  const [carouselSlides, setCarouselSlides] = useState<string[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [slideFocalY, setSlideFocalY] = useState<Record<number, number>>({});
  const [isDraggingFocal, setIsDraggingFocal] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartFocal, setDragStartFocal] = useState(50);

  useEffect(() => {
    ApiClient.request<any>('/social/instagram/account')
      .then((acc) => setConnectedAccount(acc))
      .catch(() => setConnectedAccount(null));

    ApiClient.request<any>('/social/threads/account')
      .then((acc) => setConnectedThreadsAccount(acc))
      .catch(() => setConnectedThreadsAccount(null));
  }, []);

  useEffect(() => {
    if (generatedResult?.socialPack) {
      const initial =
        generatedResult.socialPack.twitterThreads?.[0] ||
        generatedResult.socialPack.instagramCaption?.slice(0, 420) ||
        '';
      setThreadsCustomText(initial);
    }
  }, [generatedResult?.socialPack]);

  // Auto-sync posterUrl saat background polling selesai (tanpa butuh refresh)
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

  async function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 10 - carouselSlides.length;
    if (remainingSlots <= 0) {
      toast({
        type: 'warning',
        title: 'Batas Maksimal Tercapai',
        description: 'Karusel Instagram mendukung maksimal 10 foto dalam 1 postingan.',
      });
      return;
    }

    const filesToRead = Array.from(files).slice(0, remainingSlots);

    const readAndOptimize = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const rawUrl = event.target?.result as string;
          if (!rawUrl) return resolve('');

          const img = new window.Image();
          img.onload = () => {
            const maxDim = 1600;
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.88));
            } else {
              resolve(rawUrl);
            }
          };
          img.onerror = () => resolve(rawUrl);
          img.src = rawUrl;
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
    };

    const optimizedDataUrls = await Promise.all(filesToRead.map(readAndOptimize));
    const validUrls = optimizedDataUrls.filter(Boolean);

    if (validUrls.length > 0) {
      setCarouselSlides((prev) => [...prev, ...validUrls]);
      toast({
        type: 'success',
        title: 'Foto Dokumentasi Ditambahkan',
        description: `${validUrls.length} foto siap dipublikasikan ke dalam album Karusel.`,
      });
    }
    e.target.value = '';
  }

  function handleRemoveSlide(indexToRemove: number) {
    if (carouselSlides.length <= 1) {
      toast({
        type: 'warning',
        title: 'Tidak Bisa Dihapus',
        description: 'Minimal harus ada 1 poster utama untuk diterbitkan.',
      });
      return;
    }
    setCarouselSlides((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (activeSlideIndex >= carouselSlides.length - 1) {
      setActiveSlideIndex(Math.max(0, carouselSlides.length - 2));
    }
  }

  function handleMoveSlide(index: number, direction: 'left' | 'right') {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= carouselSlides.length) return;

    setCarouselSlides((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setActiveSlideIndex(targetIndex);
  }

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

    // Jika ada slide dengan posisi fokus khusus di mode crop, render crop presisi sebelum kirim
    if (igFramingMode === 'crop') {
      targetSlides = await Promise.all(
        targetSlides.map((url, idx) => {
          const focalY = slideFocalY[idx] ?? 50;
          if (focalY === 50) return Promise.resolve(url);
          return renderFocalCrop(url, focalY);
        })
      );
    }

    const igCaption = generatedResult.socialPack?.instagramCaption || '';

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
      const res = await ApiClient.request<{ success: boolean; jobId: string }>('/social/threads/publish', {
        method: 'POST',
        body: JSON.stringify({
          accountId: connectedThreadsAccount.id,
          publicationId: generatedResult?.publication?.id,
          text: threadsCustomText,
          mediaUrl: mediaUrlToAttach,
          linkAttachment: publishedUrl || (generatedResult?.publication?.id ? `https://polaris.id/p/${generatedResult.publication.id}` : undefined),
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
      <Card className="min-h-[500px] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4 rounded-3xl shadow-sm">
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

  const infoData = generatedResult?.infographicData;
  const infoHeadline = infoData?.headline || currentTitle || 'Infografik Isu & Kebijakan';
  const infoTakeaway = infoData?.policyTakeaway || generatedResult?.publication?.excerpt || 'Kajian ringkas pokok pikiran kebijakan daerah.';
  const keyStats: Array<{ label: string; value: string; context?: string }> =
    Array.isArray(infoData?.keyStatistics) && infoData.keyStatistics.length > 0
      ? infoData.keyStatistics
      : [
          { label: 'Indikator Utama', value: 'Prioritas', context: 'Fokus isu utama' },
          { label: 'Cakupan Riset', value: `${wordCount} Kata`, context: 'Sintesis teknokratis' },
          { label: 'Estimasi Baca', value: `${readTimeMinutes} Menit`, context: 'Ringkasan eksekutif' },
          { label: 'Kanal Rilis', value: 'Multi-Format', context: 'Portal web & media sosial' },
        ];

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
    <Card className="space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 rounded-3xl">
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
          className={`pb-2.5 px-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'article'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="h-3.5 w-3.5 inline mr-1.5" />
          Naskah Artikel
        </button>
        <button
          onClick={() => onTabChange('poster')}
          className={`pb-2.5 px-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
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
          className={`pb-2.5 px-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'social'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Share2 className="h-3.5 w-3.5 inline mr-1.5" />
          Distribusi Media Sosial
        </button>
      </div>

      {/* TAB 1: NASKAH ARTIKEL */}
      {activeTab === 'article' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Naskah lengkap dengan rujukan peraturan
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingArticle(!isEditingArticle)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
              >
                {isEditingArticle ? <Eye className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
                <span>{isEditingArticle ? 'Tutup Suntingan' : 'Sunting'}</span>
              </button>
              {generatedResult.publication?.id && (
                <Link
                  href={`/studio/${generatedResult.publication.id}`}
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ml-2"
                >
                  Buka di Editor Lengkap &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* RINGKASAN */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed border-l-4 border-l-blue-600 dark:border-l-blue-500 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-1">
              Ringkasan
            </span>
            {generatedResult.publication?.excerpt}
          </div>

          {/* JUDUL ARTIKEL (BISA DISUNTING LANGSUNG) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Judul Artikel Kebijakan:
            </label>
            {isEditingArticle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Judul artikel kebijakan..."
                className="w-full rounded-xl border border-blue-500 dark:border-blue-500 bg-white dark:bg-slate-800 p-3 text-base sm:text-lg font-black text-slate-900 dark:text-white shadow-xs focus:outline-none"
              />
            ) : (
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentTitle}
              </h2>
            )}
          </div>

          {/* ISI NASKAH DENGAN TIPTAP TRUE WYSIWYG EDITOR */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner bg-slate-50/50 dark:bg-slate-950/40 p-2 sm:p-4">
            <TiptapExecutiveEditor
              content={currentBody}
              onContentChange={(newHtml) => {
                setEditedBody(newHtml);
              }}
              authorName={authorName}
              partyName={partyAffiliation}
              editable={isEditingArticle}
              compactMode={true}
              aiPosterUrl={selectedPosterUrl || generatedResult?.posterUrl}
            />
          </div>

          {isEditingArticle && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
              <span className="text-xs text-slate-500">
                Gunakan bilah di atas naskah untuk menyisipkan foto lapangan, tabel data, atau grafik kebijakan.
              </span>
              <Button
                size="sm"
                onClick={handleSaveArticleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs self-end sm:self-auto"
              >
                Simpan Perubahan Naskah
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: POSTER & INFOGRAFIS (100% HASIL AI) */}
      {activeTab === 'poster' && (
        <div className="space-y-4">
          {/* HEADER & SWITCHER VARIAN */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span>Infografik & Poster Kebijakan AI</span>
                </span>
                <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  AI SYNTHESIZED
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Visualisasi terpadu data statistik dan grafis yang dirumuskan dari kajian naskah Anda
              </p>
            </div>

            {/* SWITCHER TAMPILAN AI: KARTU INFOGRAFIK VS POSTER RESOLUSI TINGGI */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setVisualMode('infographic')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  visualMode === 'infographic'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Kartu Infografis Data</span>
              </button>
              <button
                type="button"
                onClick={() => setVisualMode('raw_poster')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  visualMode === 'raw_poster'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Poster Visual Utuh</span>
              </button>
            </div>
          </div>

          {/* MODE 1: KARTU INFOGRAFIS DATA LENGKAP */}
          {visualMode === 'infographic' && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-5 sm:p-7 shadow-xl space-y-4">
              {/* WATERMARK RESMI */}
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-blue-400 border-b border-slate-700/60 pb-3">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  <span>POLARIS • INFOGRAFIK KEBIJAKAN &amp; ISU STRATEGIS</span>
                </span>
                <span className="text-slate-400 font-mono">EDISI 2026</span>
              </div>

              {/* HEADLINE BUATAN AI */}
              <div className="space-y-1">
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
                  {infoHeadline}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  {infoTakeaway}
                </p>
              </div>

              {/* GRID DATA METRIK & VISUAL UTAMA */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch pt-2">
                {/* 4 BADGES STATISTIK BUATAN AI */}
                <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-1 gap-2.5">
                  {keyStats.slice(0, 4).map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/70 backdrop-blur-sm space-y-1 hover:border-blue-500/50 transition-colors"
                    >
                      <div className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                        {st.label}
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
                        {st.value}
                      </div>
                      {st.context && (
                        <div className="text-[11px] text-slate-300 leading-tight">
                          {st.context}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* VISUAL CENTERPIECE BUATAN AI */}
                <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 min-h-[280px] sm:min-h-[320px] flex items-center justify-center shadow-lg">
                  {(selectedPosterUrl || generatedResult?.posterUrl) ? (
                    <>
                      <Image
                        src={selectedPosterUrl || generatedResult?.posterUrl}
                        alt="Poster Infografis AI"
                        fill
                        unoptimized
                        priority
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="font-extrabold text-[11px] bg-slate-900/90 px-3 py-1.5 rounded-xl backdrop-blur-md border border-slate-700">
                          Visual Sintesis AI
                        </span>
                        <a
                          href={selectedPosterUrl || generatedResult?.posterUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Unduh HD</span>
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center space-y-3">
                      <Loader2 className="h-9 w-9 text-blue-400 animate-spin mx-auto opacity-90" />
                      <p className="text-xs text-white font-bold">
                        🎨 AI Sedang Melukis Poster Visual di Latar Belakang...
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Naskah artikel Anda sudah siap ditinjau. Gambar akan otomatis muncul di sini seketika tanpa perlu refresh halaman.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER WATERMARK IDENTITAS DEWAN */}
              <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold">
                  Diadvokasikan oleh: <strong className="text-white">{authorName}</strong> ({partyAffiliation})
                </span>
                <span className="font-mono text-blue-400 font-extrabold">polaris.id</span>
              </div>
            </div>
          )}

          {/* MODE 2: POSTER VISUAL UTUH (RESOLUSI TINGGI) */}
          {visualMode === 'raw_poster' && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video max-h-[520px] flex items-center justify-center shadow-lg">
                {(selectedPosterUrl || generatedResult?.posterUrl) ? (
                  <>
                    <Image
                      src={selectedPosterUrl || generatedResult?.posterUrl}
                      alt="Poster Visual Resolusi Tinggi"
                      fill
                      unoptimized
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                      <span className="font-bold text-xs bg-slate-900/90 px-3 py-1.5 rounded-xl backdrop-blur-md border border-slate-700">
                        Resolusi Penuh (Format Berita &amp; Media)
                      </span>
                      <a
                        href={selectedPosterUrl || generatedResult?.posterUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Unduh Berkas Asli</span>
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <Loader2 className="h-9 w-9 text-blue-400 animate-spin mx-auto opacity-90" />
                    <p className="text-xs text-white font-bold">
                      🎨 AI Sedang Merender Poster Resolusi Penuh...
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Gambar akan otomatis muncul begitu proses selesai di latar belakang.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SEBARAN SOSIAL MULTI-KANAL (INSTAGRAM, WHATSAPP, THREADS) */}
      {activeTab === 'social' && generatedResult.socialPack && (
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
          </div>

          {/* ======================================================== */}
          {/* KANAL 1: INSTAGRAM FEED & CAROUSEL MULTI-FOTO */}
          {/* ======================================================== */}
          {selectedSocialChannel === 'instagram' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-4 shadow-2xs">
              {/* Header Instagram */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 dark:border-purple-900/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-rose-600 text-white shadow-xs">
                    <Instagram className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Feed & Karusel Instagram</span>
                      {connectedAccount ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300">
                          @{connectedAccount.accountHandle}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-300">
                          Belum Terhubung
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Rasio murni 4:5 dengan Canva-style multi-slide filmstrip.
                    </p>
                  </div>
                </div>

                {connectedAccount && (
                  <button
                    type="button"
                    disabled={publishingIg}
                    onClick={handlePublishInstagramFromCampaign}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:opacity-95 text-white font-black text-xs shadow-md shadow-pink-500/20 cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01]"
                  >
                    {publishingIg ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {carouselSlides.length > 1
                        ? `Terbitkan Karusel (${carouselSlides.length} Slide)`
                        : 'Terbitkan ke Instagram'}
                    </span>
                  </button>
                )}
              </div>

              {/* GRID WORKSPACE: Kiri Mockup Instagram HP 4:5, Kanan Format di Atas, Canva Tray & Caption */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* KOLOM KIRI (LG: 5): Mockup Postingan Instagram Feed Nyata dengan Interactive Pan */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="w-[260px] sm:w-[270px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
                    {/* Mockup Header */}
                    <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[1.5px]">
                          <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                            <Instagram className="h-3 w-3 text-purple-600" />
                          </div>
                        </div>
                        <span className="font-bold text-[11px] text-slate-900 dark:text-slate-100 truncate max-w-[140px]">
                          {connectedAccount?.accountHandle || 'dewan.resmi'}
                        </span>
                      </div>
                      <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
                    </div>

                    {/* Mockup Media Frame (Aspect Ratio Murni 4:5 Portrait + Drag to Reposition) */}
                    <div
                      className={`relative w-full aspect-[4/5] bg-slate-950 overflow-hidden flex items-center justify-center select-none ${
                        igFramingMode === 'crop' ? 'cursor-ns-resize' : ''
                      }`}
                      onMouseDown={(e) => {
                        if (igFramingMode !== 'crop') return;
                        setIsDraggingFocal(true);
                        setDragStartY(e.clientY);
                        setDragStartFocal(slideFocalY[activeSlideIndex] ?? 50);
                      }}
                      onMouseMove={(e) => {
                        if (!isDraggingFocal || igFramingMode !== 'crop') return;
                        const deltaY = e.clientY - dragStartY;
                        const newFocal = Math.max(0, Math.min(100, dragStartFocal - Math.round(deltaY / 2)));
                        setSlideFocalY((prev) => ({ ...prev, [activeSlideIndex]: newFocal }));
                      }}
                      onMouseUp={() => setIsDraggingFocal(false)}
                      onMouseLeave={() => setIsDraggingFocal(false)}
                    >
                      {carouselSlides[activeSlideIndex] && (
                        <>
                          {igFramingMode === 'blur' && (
                            <div
                              className="absolute inset-0 bg-cover bg-center filter blur-xl scale-125 opacity-60"
                              style={{ backgroundImage: `url(${carouselSlides[activeSlideIndex]})` }}
                            />
                          )}
                          <img
                            src={carouselSlides[activeSlideIndex]}
                            alt={`Slide aktif ${activeSlideIndex + 1}`}
                            draggable={false}
                            style={{
                              objectPosition:
                                igFramingMode === 'crop'
                                  ? `center ${slideFocalY[activeSlideIndex] ?? 50}%`
                                  : 'center center',
                            }}
                            className={`relative z-10 w-full h-full pointer-events-none transition-[object-position] duration-75 ${
                              igFramingMode === 'crop' ? 'object-cover' : 'object-contain'
                            }`}
                          />
                        </>
                      )}

                      {/* Tombol Alih Aspek Rasio (Persis Tombol Expand/Fit di Instagram Asli) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIgFramingMode((prev) => (prev === 'crop' ? 'blur' : 'crop'));
                        }}
                        className="absolute bottom-2.5 left-2.5 z-20 p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-950/95 text-white transition-all shadow-md cursor-pointer backdrop-blur-md"
                        title={igFramingMode === 'crop' ? 'Ganti ke Latar Blur (Utuh)' : 'Ganti ke Penuhi Layar (Crop 4:5)'}
                      >
                        {igFramingMode === 'crop' ? (
                          <Minimize2 className="h-3.5 w-3.5" />
                        ) : (
                          <Maximize2 className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Counter Badge Instagram (Contoh: 1/3) */}
                      {carouselSlides.length > 1 && (
                        <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-bold shadow-xs">
                          {activeSlideIndex + 1}/{carouselSlides.length}
                        </div>
                      )}

                      {/* Panah Navigasi Mockup */}
                      {carouselSlides.length > 1 && (
                        <>
                          {activeSlideIndex > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSlideIndex((prev) => Math.max(0, prev - 1));
                              }}
                              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white transition-all shadow-xs cursor-pointer"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {activeSlideIndex < carouselSlides.length - 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSlideIndex((prev) => Math.min(carouselSlides.length - 1, prev + 1));
                              }}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white transition-all shadow-xs cursor-pointer"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Mockup Action Bar & Dots */}
                    <div className="px-3 py-2 flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-3">
                        <Heart className="h-4 w-4 text-slate-700 dark:text-slate-300 hover:text-rose-600 cursor-pointer" />
                        <MessageCircle className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                        <Share2 className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                      </div>

                      {/* Slide Indicator Dots */}
                      {carouselSlides.length > 1 && (
                        <div className="flex items-center gap-1">
                          {carouselSlides.map((_, i) => (
                            <span
                              key={i}
                              className={`rounded-full transition-all ${
                                i === activeSlideIndex
                                  ? 'w-1.5 h-1.5 bg-blue-600'
                                  : 'w-1 h-1 bg-slate-300 dark:bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      <Bookmark className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>

                  {/* Preset & Hint Penyelarasan Fokus / Posisi Foto (Pinch/Pan) */}
                  {igFramingMode === 'crop' && (
                    <div className="mt-2 flex items-center justify-between gap-1 w-[260px] sm:w-[270px] px-2 py-1.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-900/40 text-[10px]">
                      <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                        <MoveVertical className="h-3 w-3 text-purple-600" />
                        <span>Fokus Posisi:</span>
                      </span>
                      <div className="flex items-center gap-1 font-bold">
                        <button
                          type="button"
                          onClick={() => setSlideFocalY((prev) => ({ ...prev, [activeSlideIndex]: 10 }))}
                          className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                            (slideFocalY[activeSlideIndex] ?? 50) <= 25
                              ? 'bg-purple-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          Atas
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlideFocalY((prev) => ({ ...prev, [activeSlideIndex]: 50 }))}
                          className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                            (slideFocalY[activeSlideIndex] ?? 50) > 25 && (slideFocalY[activeSlideIndex] ?? 50) < 75
                              ? 'bg-purple-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          Tengah
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlideFocalY((prev) => ({ ...prev, [activeSlideIndex]: 90 }))}
                          className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                            (slideFocalY[activeSlideIndex] ?? 50) >= 75
                              ? 'bg-purple-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          Bawah
                        </button>
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium text-center">
                    {igFramingMode === 'crop'
                      ? '💡 Geser foto di layar atau klik preset untuk ubah framing'
                      : 'Pratinjau Asli Smartphone (Rasio 4:5 Feed)'}
                  </span>
                </div>

                {/* KOLOM KANAN (LG: 7): FORMAT DI ATAS -> CANVA TRAY -> CAPTION BOX */}
                <div className="lg:col-span-7 space-y-3">
                  {/* 1. Format Kanvas Selector (DI ATAS) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-900/60 shadow-2xs text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">
                        Format Kanvas:
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                        Rasio 4:5 Feed
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIgFramingMode('crop')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          igFramingMode === 'crop'
                            ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
                        }`}
                        title="Penuhi layar 4:5 tanpa garis tepi"
                      >
                        Penuhi Layar (Crop 4:5)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIgFramingMode('blur')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          igFramingMode === 'blur'
                            ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
                        }`}
                        title="Gambar utuh di tengah dengan latar belakang blur artistik"
                      >
                        Latar Blur (Utuh)
                      </button>
                    </div>
                  </div>

                  {/* 2. CANVA-STYLE SLIDE TRAY */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-900/60 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          Halaman Karusel
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-extrabold">
                          {carouselSlides.length} / 10 Slide
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Klik untuk melihat • Geser untuk urutan
                      </span>
                    </div>

                    {/* Horizontal Canva Tray Filmstrip */}
                    <div className="flex items-center gap-2.5 overflow-x-auto py-2 px-1 scrollbar-thin">
                      {carouselSlides.map((slideUrl, idx) => {
                        const isActive = activeSlideIndex === idx;
                        const isCover = idx === 0;

                        return (
                          <div
                            key={idx}
                            className="flex flex-col items-center gap-1 shrink-0"
                            onClick={() => setActiveSlideIndex(idx)}
                          >
                            {/* Canva Thumbnail Card */}
                            <div
                              className={`relative group w-[60px] h-[75px] rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-100 dark:bg-slate-800 ${
                                isActive
                                  ? 'border-purple-600 ring-2 ring-purple-600/30 shadow-md scale-102'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                              }`}
                            >
                              <img
                                src={slideUrl}
                                alt={`Slide ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />

                              {/* Controls (Move & Remove) on hover */}
                              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-0.5">
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveSlide(idx, 'left');
                                    }}
                                    className="p-1 rounded bg-white/20 hover:bg-white/40 text-white"
                                    title="Geser ke kiri"
                                  >
                                    <ChevronLeft className="h-3 w-3" />
                                  </button>
                                )}
                                {idx < carouselSlides.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveSlide(idx, 'right');
                                    }}
                                    className="p-1 rounded bg-white/20 hover:bg-white/40 text-white"
                                    title="Geser ke kanan"
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </button>
                                )}
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveSlide(idx);
                                    }}
                                    className="p-1 rounded bg-rose-600/90 hover:bg-rose-600 text-white"
                                    title="Hapus foto ini"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Label Nomor Halaman persis Canva */}
                            <span
                              className={`text-[10px] font-bold ${
                                isActive
                                  ? 'text-purple-700 dark:text-purple-300'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {isCover ? 'Cover' : `${idx + 1}`}
                            </span>
                          </div>
                        );
                      })}

                      {/* Tombol Tambah Slide (Gaya Canva) */}
                      {carouselSlides.length < 10 && (
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <label className="w-[60px] h-[75px] rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-800 hover:border-purple-600 dark:hover:border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 hover:bg-purple-100/50 transition-all flex flex-col items-center justify-center gap-1 text-purple-700 dark:text-purple-400 cursor-pointer shadow-2xs">
                            <Plus className="h-5 w-5" />
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleAddPhotos}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[10px] font-semibold text-slate-400">
                            + Tambah
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. CAPTION BOX (HANYA SATU, BERSIH) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Naskah Caption Instagram</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedResult.socialPack.instagramCaption);
                          setCopiedIg(true);
                          setTimeout(() => setCopiedIg(false), 2000);
                          toast({
                            type: 'success',
                            title: 'Caption Disalin!',
                            description: 'Teks siap diposting.',
                          });
                        }}
                        className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-300 hover:underline cursor-pointer text-[11px]"
                      >
                        {copiedIg ? <CheckCheck className="h-3 w-3 text-purple-600" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedIg ? 'Tersalin' : 'Salin Caption'}</span>
                      </button>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 text-slate-700 dark:text-slate-300 whitespace-pre-line text-xs max-h-36 overflow-y-auto leading-relaxed font-sans shadow-inner">
                      {generatedResult.socialPack.instagramCaption}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* KANAL 2: WHATSAPP MEMO WARGA & RELAWAN */}
          {/* ======================================================== */}
          {selectedSocialChannel === 'whatsapp' && (
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
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      generatedResult.socialPack.whatsappBroadcastText ||
                        generatedResult.socialPack.whatsappBroadcast
                    )}`}
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
                      const text =
                        generatedResult.socialPack.whatsappBroadcastText ||
                        generatedResult.socialPack.whatsappBroadcast;
                      navigator.clipboard.writeText(text);
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

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/50 text-slate-800 dark:text-slate-200 whitespace-pre-line text-xs max-h-56 overflow-y-auto leading-relaxed font-sans shadow-inner border-l-4 border-l-emerald-500">
                {generatedResult.socialPack.whatsappBroadcastText ||
                  generatedResult.socialPack.whatsappBroadcast}
              </div>

              {/* Unduh Poster Cetak A4 */}
              {(selectedPosterUrl || generatedResult?.posterUrl) && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    Lampirkan poster dokumen resolusi penuh ke grup chat:
                  </span>
                  <a
                    href={selectedPosterUrl || generatedResult?.posterUrl}
                    download="poster-kebijakan-dewan.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-extrabold hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh Poster A4</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* KANAL 3: META THREADS (CUITAN OPINI & ADVOKASI DEWAN) */}
          {/* ======================================================== */}
          {selectedSocialChannel === 'threads' && (
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
                        Meta Threads • Cuitan Opini
                      </h4>
                      {connectedThreadsAccount ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>@{connectedThreadsAccount.accountHandle}</span>
                        </span>
                      ) : (
                        <Link
                          href="/branding?activeTab=threads"
                          className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline"
                        >
                          <span>⚠️ Belum Terhubung (Klik untuk Sambungkan)</span>
                        </Link>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Format ringkas padat intisari kebijakan & perang gagasan publik (maksimal 500 karakter).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(threadsCustomText);
                      toast({
                        type: 'success',
                        title: 'Teks Threads Disalin!',
                        description: 'Siap diposting ke aplikasi Threads.',
                      });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin Naskah</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishToThreads}
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
                </div>
              </div>

              {/* 2-Column Responsive Layout: Mockup vs Editor */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Kolom Kiri: Mockup Threads WYSIWYG */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>Pratinjau Live Postingan Threads</span>
                    <span className="text-[10px] text-slate-400 font-normal">Tampilan Feed Publik</span>
                  </div>

                  <div className="p-4 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
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
                            {(connectedThreadsAccount?.accountHandle || authorName || 'D').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {connectedThreadsAccount?.accountHandle || 'dewan.resmi'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">• Baru saja</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block -mt-0.5">
                            {authorName} ({partyAffiliation})
                          </span>
                        </div>
                      </div>

                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </div>

                    {/* Konten Teks Cuitan */}
                    <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line pl-1 font-sans">
                      {threadsCustomText || 'Belum ada naskah cuitan.'}
                    </div>

                    {/* Lampiran Visual / Link Card */}
                    {threadsAttachmentMode === 'link_card' ? (
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3 transition-colors hover:border-slate-300">
                        <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          {selectedPosterUrl || generatedResult?.posterUrl ? (
                            <img
                              src={selectedPosterUrl || generatedResult?.posterUrl}
                              alt="Thumbnail Portal"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Sparkles className="h-5 w-5 text-slate-400 m-auto mt-4.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {generatedResult?.publication?.title || 'Kebijakan Parlemen Resmi'}
                          </h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {generatedResult?.publication?.excerpt || 'Kajian dan advokasi sikap dewan untuk konstituen.'}
                          </p>
                          <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400 font-bold block truncate">
                            polaris.id/p/{generatedResult?.publication?.id || 'kebijakan'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      (selectedPosterUrl || generatedResult?.posterUrl) && (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-80 bg-slate-100 dark:bg-slate-900">
                          <img
                            src={selectedPosterUrl || generatedResult?.posterUrl}
                            alt="Poster Dokumen"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )
                    )}

                    {/* Engagement Bar Mockup Threads */}
                    <div className="flex items-center gap-4 pt-2 text-slate-500 dark:text-slate-400 text-xs border-t border-slate-100 dark:border-slate-850">
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

                {/* Kolom Kanan: Pengaturan & Editor Cuitan */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Selector Mode Lampiran */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Pilihan Lampiran Konten Threads:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setThreadsAttachmentMode('link_card')}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          threadsAttachmentMode === 'link_card'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-extrabold text-xs flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5" />
                          <span>Rich Link Card</span>
                        </div>
                        <p className={`text-[10px] mt-0.5 leading-tight ${threadsAttachmentMode === 'link_card' ? 'opacity-80' : 'text-slate-400'}`}>
                          Tautan hidup portal dewan (warga membaca kajian penuh).
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setThreadsAttachmentMode('poster')}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          threadsAttachmentMode === 'poster'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-extrabold text-xs flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5" />
                          <span>Gambar Poster</span>
                        </div>
                        <p className={`text-[10px] mt-0.5 leading-tight ${threadsAttachmentMode === 'poster' ? 'opacity-80' : 'text-slate-400'}`}>
                          Lampirkan gambar poster infografis tanpa terpotong.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Textarea Editor & Live Character Counter */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Edit Naskah Cuitan Opini:
                      </span>
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

                    <textarea
                      value={threadsCustomText}
                      onChange={(e) => setThreadsCustomText(e.target.value)}
                      rows={6}
                      placeholder="Tuliskan argumen kebijakan atau kutipan sikap politik dewan..."
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-400 font-sans leading-relaxed resize-none"
                    />

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span>💡 Tips: Sertakan angka kunci APBD & ajakan berdialog bagi warga.</span>
                      {threadsAttachmentMode === 'link_card' && (
                        <span className="text-blue-500 font-bold">Link terlampir otomatis</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pop-up Live Progress Modal Penerbitan Instagram */}
      {connectedAccount && (
        <InstagramPublishProgressModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          jobId={activeJobId}
          accountHandle={connectedAccount.accountHandle}
          posterUrl={carouselSlides[0] || selectedPosterUrl || generatedResult?.posterUrl}
          captionPreview={generatedResult?.socialPack?.instagramCaption}
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
    </Card>
  );
}
