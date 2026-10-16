'use client';

import { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Camera,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ApiClient } from '@/lib/api-client';

interface InsertImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
  aiPosterUrl?: string | null;
}

// Client-side instant image compression to WebP (Max 1600px, 82% quality)
async function compressImageToWebp(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Convert to WebP format
        const dataUrl = canvas.toDataURL('image/webp', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Gagal memproses file gambar.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

export function InsertImageModal({
  isOpen,
  onClose,
  editor,
  aiPosterUrl,
}: InsertImageModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'ai_gallery' | 'url'>('upload');
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [imageSize, setImageSize] = useState<'small' | 'medium' | 'full'>('medium');
  const [imageAlign, setImageAlign] = useState<'left' | 'center' | 'right'>('center');
  const [externalUrl, setExternalUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [compressedSizeKb, setCompressedSizeKb] = useState<number | null>(null);

  if (!isOpen) return null;

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        type: 'error',
        title: 'Format Tidak Sesuai',
        description: 'Pilih file gambar berformat JPG, PNG, atau WebP.',
      });
      return;
    }

    try {
      const compressed = await compressImageToWebp(file);
      setSelectedImageDataUrl(compressed);

      // Hitung perkiraan ukuran WebP
      const head = 'data:image/webp;base64,';
      const sizeBytes = Math.round(((compressed.length - head.length) * 3) / 4);
      setCompressedSizeKb(Math.round(sizeBytes / 1024));

      if (!imageCaption) {
        setImageCaption(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memproses Foto',
        description: err.message,
      });
    }
  }

  async function handleInsert() {
    if (!editor) {
      toast({ type: 'error', title: 'Editor Belum Siap' });
      return;
    }

    let finalImageUrl = '';

    if (activeTab === 'upload') {
      if (!selectedImageDataUrl) {
        toast({ type: 'warning', title: 'Pilih Foto Terlebih Dahulu' });
        return;
      }

      setUploading(true);
      try {
        const res = await ApiClient.request<{ success: boolean; url: string }>('/studio/upload-image', {
          method: 'POST',
          body: JSON.stringify({
            base64: selectedImageDataUrl,
            caption: imageCaption,
          }),
        });

        if (res?.url) {
          const apiHost = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/v1\/?$/, '');
          finalImageUrl = res.url.startsWith('http') ? res.url : `${apiHost}${res.url}`;
        } else {
          // Fallback aman ke base64 webp agar tidak pernah broken
          finalImageUrl = selectedImageDataUrl;
        }
      } catch (uploadErr) {
        // Fallback aman
        finalImageUrl = selectedImageDataUrl;
      } finally {
        setUploading(false);
      }
    } else if (activeTab === 'ai_gallery') {
      if (!aiPosterUrl) {
        toast({ type: 'warning', title: 'Tidak Ada Gambar AI', description: 'Buat poster atau infografis terlebih dahulu.' });
        return;
      }
      finalImageUrl = aiPosterUrl;
    } else if (activeTab === 'url') {
      if (!externalUrl.trim()) {
        toast({ type: 'warning', title: 'Masukkan Tautan URL Foto' });
        return;
      }
      finalImageUrl = externalUrl.trim();
    }

    if (!finalImageUrl) return;

    const captionText = imageCaption.trim() ? `📷 ${imageCaption.trim()}` : '';
    const widthStyle =
      imageSize === 'small'
        ? 'max-width: 38%;'
        : imageSize === 'medium'
        ? 'max-width: 68%;'
        : 'max-width: 100%; width: 100%;';

    const alignStyle =
      imageAlign === 'left'
        ? 'margin: 1.5em auto 1.5em 0; text-align: left;'
        : imageAlign === 'right'
        ? 'margin: 1.5em 0 1.5em auto; text-align: right;'
        : 'margin: 1.75em auto; text-align: center;';

    // Sisipkan dokumen HTML terstruktur dengan kontrol ukuran & posisi
    editor
      .chain()
      .focus()
      .insertContent(`
        <figure class="article-image-block" data-size="${imageSize}" data-align="${imageAlign}" style="${alignStyle} ${widthStyle}">
          <img src="${finalImageUrl}" alt="${imageCaption.trim() || 'Dokumentasi Parlemen'}" style="width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: block;" />
          ${captionText ? `<figcaption style="font-size: 0.85em; color: #64748B; font-style: italic; margin-top: 6px; text-align: center;">${captionText}</figcaption>` : ''}
        </figure>
        <p></p>
      `)
      .run();

    toast({
      type: 'success',
      title: 'Foto Berhasil Disisipkan',
      description: `Gambar ${imageSize.toUpperCase()} (${imageAlign}) telah disematkan.`,
    });

    handleClose();
  }

  function handleClose() {
    setSelectedImageDataUrl(null);
    setImageCaption('');
    setExternalUrl('');
    setCompressedSizeKb(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Sisipkan Foto & Media Kontekstual
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Atur ukuran, posisi, dan keterangan foto lapangan Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 p-1.5 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Unggah Foto Lapangan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai_gallery')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ai_gallery'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Dari Media AI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>Tautan URL</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* TAB 1: UPLOAD DARI KOMPUTER/HP */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />

              {selectedImageDataUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-48 flex items-center justify-center group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImageDataUrl}
                    alt="Pratinjau Foto"
                    className="max-h-48 w-full object-contain"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    {compressedSizeKb && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/90 text-emerald-400 border border-slate-700">
                        {compressedSizeKb} KB (WebP Optimal)
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImageDataUrl(null);
                        setCompressedSizeKb(null);
                      }}
                      className="p-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-xs"
                      title="Ganti Foto"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center justify-center space-y-2 group"
                >
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Klik untuk Pilih Foto Dokumentasi Lapangan
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Otomatis dikonversi ke WebP untuk performa kilat dan anti-pecah.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DARI MEDIA AI */}
          {activeTab === 'ai_gallery' && (
            <div className="space-y-3">
              {aiPosterUrl ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 max-h-48 relative flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={aiPosterUrl}
                    alt="Poster AI"
                    className="max-h-48 w-full object-contain"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl">
                    <span>Visual Infografis AI Kampanye Ini</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
                  <AlertCircle className="h-7 w-7 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Belum Ada Aset Poster AI untuk Artikel Ini
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Poster visual dapat dibuat di tab Poster & Infografis Polaris Studio.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TAUTAN URL */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                Tautan URL Gambar:
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://domain.com/foto-kegiatan.jpg"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* KETERANGAN FOTO / CAPTION */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Keterangan Foto & Konteks Lapangan:</span>
            </label>
            <input
              type="text"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder="Contoh: Kunjungan Kerja Komisi IV di Desa Sukamukti, Selasa (14/10)"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* PENGATURAN UKURAN & POSISI FOTO */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* UKURAN */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ukuran Gambar:
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-[10px]">
                <button
                  type="button"
                  onClick={() => setImageSize('small')}
                  className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    imageSize === 'small' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Kecil (35%)
                </button>
                <button
                  type="button"
                  onClick={() => setImageSize('medium')}
                  className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    imageSize === 'medium' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Sedang (65%)
                </button>
                <button
                  type="button"
                  onClick={() => setImageSize('full')}
                  className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    imageSize === 'full' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Penuh (100%)
                </button>
              </div>
            </div>

            {/* POSISI */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Posisi / Penjajaran:
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-[10px]">
                <button
                  type="button"
                  onClick={() => setImageAlign('left')}
                  className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    imageAlign === 'left' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Rata Kiri"
                >
                  <AlignLeft className="h-3 w-3" />
                  <span>Kiri</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageAlign('center')}
                  className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    imageAlign === 'center' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Rata Tengah"
                >
                  <AlignCenter className="h-3 w-3" />
                  <span>Tengah</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageAlign('right')}
                  className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    imageAlign === 'right' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Rata Kanan"
                >
                  <AlignRight className="h-3 w-3" />
                  <span>Kanan</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400"
          >
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleInsert}
            disabled={
              uploading ||
              (activeTab === 'upload' && !selectedImageDataUrl) ||
              (activeTab === 'ai_gallery' && !aiPosterUrl) ||
              (activeTab === 'url' && !externalUrl.trim())
            }
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
          >
            {uploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Mengunggah...</span>
              </>
            ) : (
              <>
                <Camera className="h-3.5 w-3.5" />
                <span>Sisipkan ke Naskah</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
