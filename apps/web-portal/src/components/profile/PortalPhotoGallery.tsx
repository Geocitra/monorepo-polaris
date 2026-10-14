'use client';

import { useState, useEffect } from 'react';
import { Camera, Eye, X, ChevronLeft, ChevronRight, Sparkles, Images } from 'lucide-react';

interface PortalPhotoGalleryProps {
  photos: string[];
  memberName: string;
}

export function PortalPhotoGallery({ photos, memberName }: PortalPhotoGalleryProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    if (activeIdx === null) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActiveIdx(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveIdx((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIdx, photos.length]);

  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 pt-4">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200/60">
            <Images className="w-3.5 h-3.5 text-blue-600" />
            <span>Dokumentasi Resmi & Potret Personal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            Katalog Foto & Dokumentasi Kegiatan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Arsip visual dan rekaman pengabdian kenegaraan {memberName} dalam mendengarkan aspirasi warga, rapat komisi, dan kunjungan kerja lapangan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            {photos.length} Koleksi Foto
          </span>
        </div>
      </div>

      {/* GALLERY GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {photos.map((photo, index) => (
          <div
            key={`portal-photo-${index}`}
            onClick={() => setActiveIdx(index)}
            className="group relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer aspect-[4/5]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={`Dokumentasi ${memberName} - Foto #${index + 1}`}
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />

            {/* HOVER OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
              <span className="self-end px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold">
                #{index + 1}
              </span>

              <div className="flex items-center justify-center">
                <div className="p-2.5 rounded-full bg-white/30 backdrop-blur-md text-white shadow-lg">
                  <Eye className="w-5 h-5" />
                </div>
              </div>

              <span className="text-[11px] font-semibold text-white/90 text-center truncate">
                Lihat Foto Penuh
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX MODAL */}
      {activeIdx !== null && photos[activeIdx] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveIdx(null)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setActiveIdx(null)}
              className="absolute -top-11 right-0 text-white/80 hover:text-white p-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>

            {/* IMAGE FRAME */}
            <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 max-h-[78vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[activeIdx]}
                alt={`Dokumentasi ${memberName} - ${activeIdx + 1}`}
                className="max-h-[78vh] w-auto max-w-full object-contain"
              />

              {/* NAVIGATION BUTTONS */}
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition backdrop-blur-md cursor-pointer shadow-xl"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveIdx((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition backdrop-blur-md cursor-pointer shadow-xl"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* CAPTION & COUNTER */}
            <div className="mt-3.5 flex items-center justify-between w-full max-w-3xl px-2 text-white">
              <span className="text-xs sm:text-sm font-bold text-white/90">
                Dokumentasi {memberName} • Foto {activeIdx + 1} dari {photos.length}
              </span>
              <span className="text-[11px] text-white/60">
                Gunakan tombol panah keyboard ← / → untuk navigasi
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
