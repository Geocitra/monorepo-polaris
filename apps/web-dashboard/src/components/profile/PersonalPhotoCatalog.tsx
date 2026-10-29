'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Images,
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  Star,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  ArrowLeftRight,
  Sparkles,
  Loader2,
  Wand2,
} from 'lucide-react';
import {
  removeImageBackground,
  upscaleImageToHD,
  formatImageSourceToStandardPortrait,
} from '@/lib/background-removal';

interface PersonalPhotoCatalogProps {
  photoGallery: string[];
  setPhotoGallery: (photos: string[]) => void;
  photoUrl: string;
  setPhotoUrl: (url: string) => void;
  isReadOnly?: boolean;
}

const MAX_PHOTOS = 10;

/**
 * Kompres dan standarisasi gambar menjadi format resmi Portrait 4:5 (1280x1600 px)
 */
async function processImageFile(file: File): Promise<string> {
  try {
    return await formatImageSourceToStandardPortrait(file, 1280, 1600);
  } catch (err) {
    console.warn('Fallback processing image file:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

export function PersonalPhotoCatalog({
  photoGallery,
  setPhotoGallery,
  photoUrl,
  setPhotoUrl,
  isReadOnly = false,
}: PersonalPhotoCatalogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');

  // AI Background Removal & Super-Resolution HD States (Sama seperti di Profile)
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [autoUpscaleHD, setAutoUpscaleHD] = useState(true);
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [bgStatusMessage, setBgStatusMessage] = useState('');
  const [bgProgress, setBgProgress] = useState(0);
  const [processingPhotoIndex, setProcessingPhotoIndex] = useState<number | null>(null);

  // Lightbox Preview State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const currentCount = photoGallery.length;
  const remainingSlots = MAX_PHOTOS - currentCount;
  const isMaxReached = currentCount >= MAX_PHOTOS;

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photoGallery.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < photoGallery.length - 1 ? prev + 1 : 0));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, photoGallery.length]);

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (isMaxReached) {
      alert(`Batas maksimal ${MAX_PHOTOS} foto telah tercapai. Hapus salah satu foto untuk menambah foto baru.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      alert(`Hanya ${remainingSlots} foto yang dapat ditambahkan karena batas maksimal katalog adalah ${MAX_PHOTOS} foto.`);
    }

    setIsProcessingBg(true);
    setBgStatusMessage('Menyiapkan pemrosesan foto & AI...');
    setBgProgress(10);

    try {
      const processedUrls: string[] = [];

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        if (!file.type.startsWith('image/')) continue;

        // Baca file ke format Data URL
        const originalData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const prefix = filesToProcess.length > 1 ? `Foto ${i + 1}/${filesToProcess.length}: ` : '';

        let resultUrl = originalData;

        if (autoRemoveBg) {
          resultUrl = await removeImageBackground(
            originalData,
            (progress) => {
              setBgStatusMessage(`${prefix}${progress.message}`);
              setBgProgress(progress.percentage);
            },
            { autoUpscale: autoUpscaleHD, targetMinHeight: 1600 }
          );
        } else if (autoUpscaleHD) {
          resultUrl = await upscaleImageToHD(
            originalData,
            (progress) => {
              setBgStatusMessage(`${prefix}${progress.message}`);
              setBgProgress(progress.percentage);
            },
            { targetMinHeight: 1600 }
          );
        } else {
          resultUrl = await processImageFile(file);
        }

        processedUrls.push(resultUrl);
      }

      if (processedUrls.length > 0) {
        const nextGallery = [...photoGallery, ...processedUrls];
        setPhotoGallery(nextGallery);

        // Jika foto utama belum diisi, jadikan foto pertama yang diunggah sebagai foto utama
        if (!photoUrl && processedUrls[0]) {
          setPhotoUrl(processedUrls[0]);
        }
      }
    } catch (err) {
      console.error('Gagal memproses file foto:', err);
      alert('Terjadi kesalahan saat memproses foto: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessingBg(false);
      setBgProgress(0);
      setBgStatusMessage('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleAddUrl() {
    setUrlError('');
    const clean = urlInput.trim();
    if (!clean) return;

    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('data:image/')) {
      setUrlError('URL foto wajib diawali dengan https:// atau http://');
      return;
    }

    if (isMaxReached) {
      setUrlError(`Batas maksimal ${MAX_PHOTOS} foto telah tercapai.`);
      return;
    }

    setIsProcessingBg(true);
    setBgStatusMessage('Membaca tautan URL & memproses AI...');
    setBgProgress(10);

    try {
      let resultUrl = clean;

      if (autoRemoveBg) {
        resultUrl = await removeImageBackground(
          clean,
          (progress) => {
            setBgStatusMessage(progress.message);
            setBgProgress(progress.percentage);
          },
          { autoUpscale: autoUpscaleHD, targetMinHeight: 1600 }
        );
      } else if (autoUpscaleHD) {
        resultUrl = await upscaleImageToHD(
          clean,
          (progress) => {
            setBgStatusMessage(progress.message);
            setBgProgress(progress.percentage);
          },
          { targetMinHeight: 1600 }
        );
      }

      const nextGallery = [...photoGallery, resultUrl];
      setPhotoGallery(nextGallery);

      if (!photoUrl) {
        setPhotoUrl(resultUrl);
      }

      setUrlInput('');
      setShowUrlInput(false);
    } catch (err) {
      console.error('Gagal memproses URL foto:', err);
      // Fallback: gunakan clean URL asli jika remove-bg URL terkendala CORS
      const nextGallery = [...photoGallery, clean];
      setPhotoGallery(nextGallery);
      if (!photoUrl) setPhotoUrl(clean);
      setUrlInput('');
      setShowUrlInput(false);
    } finally {
      setIsProcessingBg(false);
      setBgProgress(0);
      setBgStatusMessage('');
    }
  }

  async function handleProcessExistingPhoto(index: number, mode: 'removeBg' | 'upscale' | 'standardize') {
    const targetPhoto = photoGallery[index];
    if (!targetPhoto || isProcessingBg) return;

    setIsProcessingBg(true);
    setProcessingPhotoIndex(index);
    setBgStatusMessage(
      mode === 'removeBg'
        ? 'AI menghapus background & standarisasi foto ke 4:5 HD...'
        : mode === 'upscale'
        ? 'Meningkatkan foto ke Super-Resolution HD 4:5...'
        : 'Menstandarisasi ukuran & kanvas foto ke rasio 4:5 profil...'
    );
    setBgProgress(15);

    try {
      let resultUrl = targetPhoto;
      if (mode === 'removeBg') {
        resultUrl = await removeImageBackground(
          targetPhoto,
          (progress) => {
            setBgStatusMessage(progress.message);
            setBgProgress(progress.percentage);
          },
          { autoUpscale: autoUpscaleHD, targetMinHeight: 1600, standardizePortrait: true }
        );
      } else if (mode === 'upscale') {
        resultUrl = await upscaleImageToHD(
          targetPhoto,
          (progress) => {
            setBgStatusMessage(progress.message);
            setBgProgress(progress.percentage);
          },
          { targetMinHeight: 1600, standardizePortrait: true }
        );
      } else {
        resultUrl = await formatImageSourceToStandardPortrait(targetPhoto, 1280, 1600);
      }

      const nextGallery = [...photoGallery];
      nextGallery[index] = resultUrl;
      setPhotoGallery(nextGallery);

      if (photoUrl === targetPhoto) {
        setPhotoUrl(resultUrl);
      }
    } catch (err) {
      console.error('Gagal memproses foto katalog:', err);
      alert('Gagal memproses foto: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessingBg(false);
      setProcessingPhotoIndex(null);
      setBgProgress(0);
      setBgStatusMessage('');
    }
  }

  function handleRemovePhoto(indexToRemove: number) {
    const photoToRemove = photoGallery[indexToRemove];
    const nextGallery = photoGallery.filter((_, idx) => idx !== indexToRemove);
    setPhotoGallery(nextGallery);

    // Jika foto yang dihapus adalah foto utama, ganti ke foto berikutnya atau kosongkan
    if (photoUrl === photoToRemove) {
      setPhotoUrl(nextGallery.length > 0 ? nextGallery[0] : '');
    }

    if (lightboxIndex !== null) {
      if (nextGallery.length === 0) {
        setLightboxIndex(null);
      } else if (lightboxIndex >= nextGallery.length) {
        setLightboxIndex(nextGallery.length - 1);
      }
    }
  }

  function handleSetAsPrimary(photo: string) {
    setPhotoUrl(photo);
  }

  function handleMovePhoto(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= photoGallery.length) return;
    const newArr = [...photoGallery];
    const [moved] = newArr.splice(fromIndex, 1);
    newArr.splice(toIndex, 0, moved);
    setPhotoGallery(newArr);
  }

  return (
    <Card className="p-3.5 sm:p-4 space-y-3.5 shadow-2xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Images className="h-4 w-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Katalog Foto Pribadi & Dokumentasi Dewan</span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Simpan portofolio visual kenegaraan, interaksi dapil, dan potret resmi (maksimal {MAX_PHOTOS} foto per anggota).
          </p>
        </div>

        {/* COUNTER BADGE */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-tight border flex items-center gap-1.5 shadow-2xs ${
              isMaxReached
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>
              {currentCount} / {MAX_PHOTOS} Foto
            </span>
            {isMaxReached && <span className="text-[10px] font-bold uppercase">(Penuh)</span>}
          </div>
        </div>
      </div>

      {/* CAPACITY PROGRESS BAR */}
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isMaxReached ? 'bg-amber-500' : 'bg-blue-600'
            }`}
            style={{ width: `${(currentCount / MAX_PHOTOS) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
          <span>Kapasitas penyimpanan katalog personal</span>
          <span>{remainingSlots > 0 ? `Tersisa ${remainingSlots} slot foto` : 'Kapasitas maksimal tercapai'}</span>
        </div>
      </div>

      {/* ACTION UPLOAD CONTROLS & AI TOGGLE */}
      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFilesSelected}
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              disabled={isMaxReached || isProcessingBg}
            />

            <Button
              type="button"
              size="sm"
              disabled={isMaxReached || isProcessingBg}
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 h-8 rounded-lg gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingBg && processingPhotoIndex === null ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Memproses AI...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Unggah Foto Baru</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isMaxReached || isProcessingBg}
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1.5 h-8 rounded-lg gap-1 cursor-pointer disabled:opacity-50"
            >
              <LinkIcon className="h-3 w-3" />
              <span>Tambah via URL</span>
            </Button>
          </div>

          {/* AI REMOVE BACKGROUND & UPSCALE TOGGLES (Sama seperti di Profile) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 shadow-2xs">
              <Sparkles className="h-2.5 w-2.5 text-violet-600 dark:text-violet-400" />
              Auto-Transparan AI
            </span>

            <label className="text-[10px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 px-2 py-1 rounded-md flex items-center gap-1.5 cursor-pointer shadow-2xs select-none">
              <input
                type="checkbox"
                checked={autoRemoveBg}
                onChange={(e) => setAutoRemoveBg(e.target.checked)}
                disabled={isProcessingBg}
                className="rounded text-violet-600 focus:ring-violet-500 h-3 w-3 cursor-pointer"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Hapus Background AI</span>
            </label>

            <label className="text-[10px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 px-2 py-1 rounded-md flex items-center gap-1.5 cursor-pointer shadow-2xs select-none">
              <input
                type="checkbox"
                checked={autoUpscaleHD}
                onChange={(e) => setAutoUpscaleHD(e.target.checked)}
                disabled={isProcessingBg}
                className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3 cursor-pointer"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
                Scale Up HD
              </span>
            </label>
          </div>
        </div>
      )}

      {/* AI PROCESSING PROGRESS BAR NOTIFICATION */}
      {isProcessingBg && (
        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 flex items-center gap-3 animate-in fade-in duration-200 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-violet-900 dark:text-violet-200 truncate">
                {bgStatusMessage || 'AI sedang memproses foto katalog...'}
              </span>
              <span className="font-mono font-bold text-violet-700 dark:text-violet-300 shrink-0 ml-2">
                {bgProgress}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-violet-200 dark:bg-violet-900/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(8, bgProgress)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* URL INPUT COLLAPSIBLE */}
      {showUrlInput && !isReadOnly && (
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 animate-in fade-in duration-150">
          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
            Tempel Tautan URL Gambar Langsung
          </label>
          <div className="flex gap-1.5">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/foto-kunjungan-dewan.jpg"
              className="block flex-1 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:border-blue-600 focus:outline-none"
            />
            <Button
              type="button"
              size="sm"
              disabled={isProcessingBg}
              onClick={handleAddUrl}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 h-7 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Tambahkan
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowUrlInput(false);
                setUrlError('');
              }}
              className="text-slate-500 hover:text-slate-700 text-xs px-2 h-7"
            >
              Batal
            </Button>
          </div>
          {urlError && <p className="text-[10px] text-red-600 font-bold">{urlError}</p>}
        </div>
      )}

      {/* PHOTO GRID GALLERY */}
      {photoGallery.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
          {photoGallery.map((photo, index) => {
            const isPrimary = photo === photoUrl;
            const isBeingProcessed = isProcessingBg && processingPhotoIndex === index;

            return (
              <div
                key={`gallery-${index}`}
                className={`group relative rounded-xl border overflow-hidden bg-slate-100 dark:bg-slate-850 shadow-2xs transition-all duration-200 hover:shadow-md ${
                  isPrimary
                    ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                {/* PHOTO THUMBNAIL (DENGAN MOTIF TRANSPARAN CHECKERBOARD ELEGAN) */}
                <div
                  onClick={() => setLightboxIndex(index)}
                  className="aspect-[4/5] w-full overflow-hidden cursor-pointer relative bg-slate-100 dark:bg-slate-900"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                    backgroundSize: '12px 12px',
                    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={`Foto Katalog ${index + 1}`}
                    className="h-full w-full object-contain object-bottom drop-shadow-xs group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* OVERLAY HOVER SHADOW */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-2 rounded-full bg-white/20 backdrop-blur-xs text-white">
                      <Eye className="h-4 w-4" />
                    </div>
                  </div>

                  {/* OVERLAY KETIKA FOTO SEDANG DIPROSES AI SECARA INDIVIDUAL */}
                  {isBeingProcessed && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center z-20">
                      <Loader2 className="h-6 w-6 text-violet-400 animate-spin mb-1" />
                      <span className="text-[10px] font-bold text-white leading-tight">
                        {bgProgress}%
                      </span>
                      <span className="text-[9px] text-slate-300 leading-tight mt-0.5">
                        {bgStatusMessage}
                      </span>
                    </div>
                  )}
                </div>

                {/* NUMBER BADGE */}
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold">
                  #{index + 1}
                </div>

                {/* PRIMARY BADGE */}
                {isPrimary && (
                  <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-extrabold shadow-xs flex items-center gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    <span>Foto Utama</span>
                  </div>
                )}

                {/* ACTION BAR AT BOTTOM */}
                {!isReadOnly && (
                  <div className="p-1.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                    {/* SET PRIMARY BUTTON */}
                    {isPrimary ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pl-1">
                        <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                        <span>Utama</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetAsPrimary(photo);
                        }}
                        disabled={isProcessingBg}
                        title="Jadikan Foto Profil Utama"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <Star className="h-3 w-3 text-slate-400 group-hover:text-amber-500" />
                        <span>Jadikan Utama</span>
                      </button>
                    )}

                    {/* ACTION CONTROLS */}
                    <div className="flex items-center gap-0.5">
                      {/* HAPUS BACKGROUND AI (JIKA USER INGIN REMOVE BG FOTO YANG SUDAH ADA) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProcessExistingPhoto(index, 'removeBg');
                        }}
                        disabled={isProcessingBg}
                        title="Hapus Background AI, Scale Up HD & Standarisasi Ukuran 4:5 untuk foto ini"
                        className="p-1 rounded text-violet-600 dark:text-violet-400 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/40 cursor-pointer transition-colors disabled:opacity-40"
                      >
                        <Sparkles className="h-3 w-3" />
                      </button>

                      {/* MOVE LEFT */}
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovePhoto(index, index - 1);
                          }}
                          disabled={isProcessingBg}
                          title="Pindahkan ke kiri"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-40"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </button>
                      )}

                      {/* MOVE RIGHT */}
                      {index < photoGallery.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovePhoto(index, index + 1);
                          }}
                          disabled={isProcessingBg}
                          title="Pindahkan ke kanan"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-40"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(index);
                        }}
                        disabled={isProcessingBg}
                        title="Hapus dari katalog"
                        className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* ADD PHOTO PLACEHOLDER TILE */}
          {!isReadOnly && !isMaxReached && (
            <button
              type="button"
              disabled={isProcessingBg}
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/5] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all flex flex-col items-center justify-center p-3 text-center cursor-pointer group disabled:cursor-not-allowed"
            >
              {isProcessingBg && processingPhotoIndex === null ? (
                <div className="flex flex-col items-center justify-center gap-1.5 p-2">
                  <Loader2 className="h-6 w-6 text-violet-600 dark:text-violet-400 animate-spin" />
                  <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300">
                    Memproses AI ({bgProgress}%)...
                  </span>
                  <span className="text-[9px] text-slate-500 max-w-[120px] line-clamp-2">
                    {bgStatusMessage}
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-300 shadow-2xs group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    + Tambah Foto
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Slot #{currentCount + 1}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto shadow-2xs">
            <Images className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Katalog Foto Pribadi Masih Kosong
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Anda dapat mengunggah hingga {MAX_PHOTOS} foto dokumentasi kunjungan dapil, rapat parlemen, seminar kenegaraan, maupun potret resmi dewan.
            </p>
          </div>
          {!isReadOnly && (
            <Button
              type="button"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 h-8 rounded-lg gap-1.5 cursor-pointer shadow-2xs"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Unggah Foto Pertama Sekarang</span>
            </Button>
          )}
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && photoGallery[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-1 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-xs transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* MAIN IMAGE */}
            <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 max-h-[75vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoGallery[lightboxIndex]}
                alt={`Foto ${lightboxIndex + 1}`}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />

              {/* PREV BUTTON */}
              {photoGallery.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photoGallery.length - 1))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition backdrop-blur-xs cursor-pointer shadow-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* NEXT BUTTON */}
              {photoGallery.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) => (prev !== null && prev < photoGallery.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition backdrop-blur-xs cursor-pointer shadow-lg"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* LIGHTBOX FOOTER CONTROLS */}
            <div className="mt-3 flex items-center justify-between w-full max-w-2xl px-2 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/90">
                  Foto {lightboxIndex + 1} dari {photoGallery.length}
                </span>
                {photoGallery[lightboxIndex] === photoUrl && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                    ★ Foto Profil Utama
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isReadOnly && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isProcessingBg}
                    onClick={() => handleProcessExistingPhoto(lightboxIndex, 'removeBg')}
                    className="text-white border-white/20 hover:bg-white/10 text-xs font-semibold px-2.5 py-1 h-7 rounded-lg gap-1.5 cursor-pointer shadow-xs"
                    title="Standarisasi format dan hapus background foto ini agar sama dengan profil"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                    <span>Format 4:5 & Transparan AI</span>
                  </Button>
                )}

                {!isReadOnly && photoGallery[lightboxIndex] !== photoUrl && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSetAsPrimary(photoGallery[lightboxIndex])}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1 h-7 rounded-lg gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Star className="h-3.5 w-3.5" />
                    <span>Jadikan Foto Utama</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
