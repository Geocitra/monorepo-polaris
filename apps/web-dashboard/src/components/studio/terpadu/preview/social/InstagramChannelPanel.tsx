'use client';

import React, { useState } from 'react';
import {
  Instagram,
  Send,
  Loader2,
  Download,
  Copy,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  CheckCheck,
  MoreHorizontal,
  Minimize2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoveVertical,
  Trash2,
  Plus,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { SocialFeatureFlags } from '../types';

interface InstagramChannelPanelProps {
  connectedAccount: any;
  socialFeatureFlags: SocialFeatureFlags;
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
  onDownloadPoster: (customName?: string) => void;
  onCopyCaption: (text: string, platform: string) => void;
  onOpenLightbox: () => void;
  downloadingPoster: boolean;
}

export function InstagramChannelPanel({
  connectedAccount,
  socialFeatureFlags,
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
  onDownloadPoster,
  onCopyCaption,
  onOpenLightbox,
  downloadingPoster,
}: InstagramChannelPanelProps) {
  const { toast } = useToast();
  const [copiedIg, setCopiedIg] = useState(false);
  const [isDraggingFocal, setIsDraggingFocal] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartFocal, setDragStartFocal] = useState(50);

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

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-4 shadow-2xs">
      {/* Header Instagram */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200/60 dark:border-purple-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-rose-600 text-white shadow-xs">
            <Instagram className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <span>Feed & Karusel Instagram</span>
              {socialFeatureFlags.AUTO_PUBLISH_INSTAGRAM && (
                connectedAccount ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300">
                    @{connectedAccount.accountHandle}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-300">
                    Belum Terhubung
                  </span>
                )
              )}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {socialFeatureFlags.AUTO_PUBLISH_INSTAGRAM
                ? 'Rasio murni 4:5 dengan Canva-style multi-slide filmstrip untuk direct API publish.'
                : 'Unduh visual poster resolusi tinggi dan salin caption untuk diunggah ke Instagram.'}
            </p>
          </div>
        </div>

        {socialFeatureFlags.AUTO_PUBLISH_INSTAGRAM ? (
          connectedAccount && (
            <button
              type="button"
              disabled={publishingIg}
              onClick={onPublishInstagram}
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
          )
        ) : (
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onDownloadPoster()}
              disabled={downloadingPoster}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-50 transition-all shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh Poster</span>
            </button>
            <button
              type="button"
              onClick={() => onCopyCaption(customIgCaption || generatedResult?.socialPack?.instagramCaption || '', 'Instagram')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-50 transition-all shadow-xs cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Salin Caption & Tautan</span>
            </button>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:opacity-95 text-white font-black text-xs shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Buka Instagram</span>
            </a>
          </div>
        )}
      </div>

      {!socialFeatureFlags.AUTO_PUBLISH_INSTAGRAM ? (
        /* MODE UNGGAH MANUAL: BEBAS DISTRAKSI, LEGA, SEJAJAR */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Kolom Kiri: Pratinjau Poster Bersih 4:5 */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-[280px] sm:w-[300px]">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                <span>Pratinjau Feed</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Rasio 4:5</span>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-900/60 shadow-md overflow-hidden">
                <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[1.5px]">
                      <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                        <Instagram className="h-2.5 w-2.5 text-purple-600" />
                      </div>
                    </div>
                    <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate">
                      Instagram Feed
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">1080 × 1350</span>
                </div>

                <div
                  className="relative w-full aspect-[4/5] bg-slate-950 overflow-hidden flex items-center justify-center cursor-pointer group"
                  onClick={onOpenLightbox}
                  title="Klik untuk melihat resolusi penuh"
                >
                  {selectedPosterUrl || generatedResult?.posterUrl ? (
                    <>
                      <img
                        src={selectedPosterUrl || generatedResult?.posterUrl}
                        alt="Poster Visual Feed"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                        <Eye className="h-4 w-4" />
                        <span>Lihat Penuh</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs">Poster Belum Tersedia</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Area Teks Caption Luas & Lega */}
          <div className="lg:col-span-7 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
              <span>Draft Caption</span>
              <button
                type="button"
                onClick={() => {
                  onCopyCaption(customIgCaption || generatedResult?.socialPack?.instagramCaption || '', 'Instagram');
                  setCopiedIg(true);
                  setTimeout(() => setCopiedIg(false), 2000);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                {copiedIg ? <CheckCheck className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedIg ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-900/60 shadow-md flex-1 flex flex-col justify-between space-y-3">
              <textarea
                value={customIgCaption}
                onChange={(e) => setCustomIgCaption(e.target.value)}
                rows={11}
                placeholder="Tulis atau sesuaikan caption Instagram di sini..."
                className="w-full flex-1 min-h-[260px] p-4 rounded-xl bg-purple-50/30 dark:bg-slate-950 border border-purple-200/80 dark:border-purple-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-sans shadow-inner resize-y transition-colors outline-hidden"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <span>💡 Tautan resmi portal berita & tagar telah otomatis tersemat rapi saat disalin.</span>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300 hover:underline"
                >
                  <span>Buka Web Instagram</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MODE OTOMATIS: MULTI-SLIDE CANVA CAROUSEL UNTUK DIRECT API */
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

              {/* Mockup Media Frame */}
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

                {/* Tombol Alih Aspek Rasio */}
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

                {/* Counter Badge Instagram */}
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
                          setActiveSlideIndex((prev: number) => Math.max(0, prev - 1));
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
                          setActiveSlideIndex((prev: number) => Math.min(carouselSlides.length - 1, prev + 1));
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

            {/* Preset & Hint Penyelarasan Fokus */}
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
            {/* Format Kanvas Selector */}
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

            {/* CANVA-STYLE SLIDE TRAY */}
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

                      {/* Label Nomor Halaman */}
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

                {/* Tombol Tambah Slide */}
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

            {/* CAPTION BOX */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span>Caption Instagram</span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">(Dapat diedit bebas)</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(customIgCaption);
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
              <textarea
                value={customIgCaption}
                onChange={(e) => setCustomIgCaption(e.target.value)}
                rows={5}
                placeholder="Tulis atau sesuaikan caption Instagram di sini..."
                className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-sans shadow-inner resize-y transition-colors outline-hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

