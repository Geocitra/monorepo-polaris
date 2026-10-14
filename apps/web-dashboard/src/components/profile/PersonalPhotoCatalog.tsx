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
} from 'lucide-react';

interface PersonalPhotoCatalogProps {
  photoGallery: string[];
  setPhotoGallery: (photos: string[]) => void;
  photoUrl: string;
  setPhotoUrl: (url: string) => void;
  isReadOnly?: boolean;
}

const MAX_PHOTOS = 10;

/**
 * Kompres dan standarisasi gambar menjadi Base64 yang efisien
 */
async function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX_DIM = 1600;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Pertahankan format PNG jika file adalah PNG transparan
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(format, 0.88);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
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
  const [isProcessing, setIsProcessing] = useState(false);

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

    setIsProcessing(true);
    try {
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        alert(`Hanya ${remainingSlots} foto yang dapat ditambahkan karena batas maksimal katalog adalah ${MAX_PHOTOS} foto.`);
      }

      const processedUrls: string[] = [];
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;
        const dataUrl = await processImageFile(file);
        processedUrls.push(dataUrl);
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
      alert('Terjadi kesalahan saat memproses foto. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleAddUrl() {
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

    const nextGallery = [...photoGallery, clean];
    setPhotoGallery(nextGallery);

    if (!photoUrl) {
      setPhotoUrl(clean);
    }

    setUrlInput('');
    setShowUrlInput(false);
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

      {/* ACTION UPLOAD CONTROLS */}
      {!isReadOnly && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesSelected}
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            disabled={isMaxReached || isProcessing}
          />

          <Button
            type="button"
            size="sm"
            disabled={isMaxReached || isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 h-8 rounded-lg gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>{isProcessing ? 'Memproses Foto...' : 'Unggah Foto Baru'}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isMaxReached || isProcessing}
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1.5 h-8 rounded-lg gap-1 cursor-pointer disabled:opacity-50"
          >
            <LinkIcon className="h-3 w-3" />
            <span>Tambah via URL</span>
          </Button>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 ml-auto">
            <Info className="h-3 w-3 text-slate-400" />
            <span>Mendukung format PNG, JPG, dan WEBP</span>
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
              onClick={handleAddUrl}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 h-7 rounded-lg cursor-pointer"
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

            return (
              <div
                key={`gallery-${index}`}
                className={`group relative rounded-xl border overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xs transition-all duration-200 hover:shadow-md ${
                  isPrimary
                    ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                {/* PHOTO THUMBNAIL */}
                <div
                  onClick={() => setLightboxIndex(index)}
                  className="aspect-[4/5] w-full overflow-hidden bg-slate-900/10 dark:bg-black/30 cursor-pointer relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={`Foto Katalog ${index + 1}`}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* OVERLAY HOVER SHADOW */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-2 rounded-full bg-white/20 backdrop-blur-xs text-white">
                      <Eye className="h-4 w-4" />
                    </div>
                  </div>
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
                        title="Jadikan Foto Profil Utama"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <Star className="h-3 w-3 text-slate-400 group-hover:text-amber-500" />
                        <span>Jadikan Utama</span>
                      </button>
                    )}

                    {/* ACTION CONTROLS */}
                    <div className="flex items-center gap-0.5">
                      {/* MOVE LEFT */}
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovePhoto(index, index - 1);
                          }}
                          title="Pindahkan ke kiri"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
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
                          title="Pindahkan ke kanan"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
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
                        title="Hapus dari katalog"
                        className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors"
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
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/5] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all flex flex-col items-center justify-center p-3 text-center cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-300 shadow-2xs group-hover:scale-110 transition-transform">
                <UploadCloud className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                + Tambah Foto
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                Slot #{currentCount + 1}
              </span>
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
      )}
    </Card>
  );
}
