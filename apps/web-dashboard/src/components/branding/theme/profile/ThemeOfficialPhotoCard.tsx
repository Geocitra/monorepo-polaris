'use client';

import React from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Images,
  CheckCircle2,
  Check,
  User,
  Upload,
  RefreshCw,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvailablePhotoItem {
  url: string;
  label: string;
  isPrimaryProfile?: boolean;
}

interface ThemeOfficialPhotoCardProps {
  effectivePhoto: string;
  officialPhotoUrl: string;
  profilePhotoUrl?: string;
  allAvailablePhotos: AvailablePhotoItem[];
  showCatalogSelector: boolean;
  setShowCatalogSelector: (show: boolean | ((prev: boolean) => boolean)) => void;
  isProcessingDirectPhoto: boolean;
  directPhotoStatus: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onOfficialPhotoUrlChange: (url: string) => void;
  handleDirectFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ThemeOfficialPhotoCard({
  effectivePhoto,
  officialPhotoUrl,
  profilePhotoUrl,
  allAvailablePhotos,
  showCatalogSelector,
  setShowCatalogSelector,
  isProcessingDirectPhoto,
  directPhotoStatus,
  fileInputRef,
  onOfficialPhotoUrlChange,
  handleDirectFileSelect,
}: ThemeOfficialPhotoCardProps) {
  return (
    <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-4">
      {/* Header Kartu */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
          <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
          <span>Foto Resmi Dewan</span>
        </span>
        {effectivePhoto ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Tersinkronisasi</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <span>Belum Ada Foto Terpilih</span>
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDirectFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* 1. PRATINJAU FOTO TERPILIH SAAT INI (FORMAT 4:5 RESMI IDENTIK PROFIL) */}
      {effectivePhoto ? (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-2xs">
          {/* Image Preview with Hover Action (Rasio 4:5, contain grounded persis profil) */}
          <div
            onClick={() => setShowCatalogSelector((prev) => !prev)}
            className="relative w-24 h-30 sm:w-28 sm:h-35 shrink-0 rounded-xl overflow-hidden border-2 border-blue-600/60 dark:border-blue-500/60 bg-white dark:bg-slate-900 shadow-sm group cursor-pointer"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
              backgroundSize: '10px 10px',
              backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
            }}
            title="Klik untuk membuka pilihan katalog foto atau ganti foto resmi"
          >
            <img
              src={effectivePhoto}
              alt="Foto Resmi Dewan Terpilih"
              className="w-full h-full object-contain object-bottom drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-1 z-10">
              <Images className="w-4 h-4" />
              <span className="text-[9px] font-bold text-center">Ganti Foto</span>
            </div>
            {isProcessingDirectPhoto && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px] flex flex-col items-center justify-center p-1 text-center z-20 text-white">
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin mb-1" />
                <span className="text-[9px] font-black leading-tight">Proses AI...</span>
              </div>
            )}
            <div className="absolute bottom-1 inset-x-1 py-0.5 rounded bg-blue-600 text-[8px] font-black text-white text-center tracking-tight z-10 shadow-xs">
              FOTO AKTIF (4:5)
            </div>
          </div>

          {/* Content & Actions */}
          <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Foto Baliho & Hero Beranda Terpilih
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Dipakai di Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Foto ini ditampilkan secara otomatis pada banner hero beranda, kartu risalah kebijakan, dan halaman profil publik website dewan.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => setShowCatalogSelector((prev) => !prev)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs',
                  showCatalogSelector
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800'
                )}
              >
                <Images className="h-3.5 w-3.5" />
                <span>{showCatalogSelector ? 'Tutup Pilihan Foto' : 'Ganti dari Katalog'}</span>
                {allAvailablePhotos.length > 0 && !showCatalogSelector && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-blue-600 text-white font-extrabold ml-0.5">
                    {allAvailablePhotos.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                disabled={isProcessingDirectPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isProcessingDirectPhoto ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                    <span>{directPhotoStatus || 'Memproses AI...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 text-slate-500" />
                    <span>Unggah dari Perangkat</span>
                  </>
                )}
              </button>

              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Katalog Profil Lengkap</span>
              </Link>

              {profilePhotoUrl && officialPhotoUrl && officialPhotoUrl !== profilePhotoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onOfficialPhotoUrlChange(profilePhotoUrl);
                    setShowCatalogSelector(false);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Gunakan foto profil utama dewan"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Pakai Foto Profil Utama</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Belum Ada Foto Resmi Terpilih
            </h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Pilih salah satu foto dari katalog atau unggah foto jas/peci resmi baru.
            </p>
          </div>
          <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-all cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Pilih Foto dari Perangkat</span>
            </button>
            {allAvailablePhotos.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCatalogSelector((prev) => !prev)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
              >
                <Images className="h-3.5 w-3.5" />
                <span>Pilih dari Katalog ({allAvailablePhotos.length})</span>
              </button>
            )}
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Menu Profil</span>
            </Link>
          </div>
        </div>
      )}

      {/* 2. SUB-SEKSI: PILIH DARI KATALOG FOTO DEWAN */}
      {showCatalogSelector && (
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                <Images className="h-3.5 w-3.5 text-blue-500" />
                <span>Pilih dari Katalog Foto Dewan</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Klik salah satu foto katalog resmi di bawah ini untuk menerapkannya langsung ke website portal Anda.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {allAvailablePhotos.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80">
                  {allAvailablePhotos.length} Foto Siap Dipilih
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowCatalogSelector(false)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Tutup ✕
              </button>
            </div>
          </div>

          {allAvailablePhotos.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
                {allAvailablePhotos.map((item, idx) => {
                  const isSelected = effectivePhoto === item.url;
                  return (
                    <div
                      key={`photo-choice-${idx}`}
                      onClick={() => onOfficialPhotoUrlChange(item.url)}
                      className={cn(
                        'group relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-200 bg-white dark:bg-slate-900 shadow-2xs',
                        isSelected
                          ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs hover:scale-[1.02]'
                      )}
                      title={isSelected ? 'Foto ini sedang aktif di website portal' : `Pilih ${item.label} sebagai foto resmi website`}
                    >
                      <div
                        className="aspect-[4/5] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 relative"
                        style={{
                          backgroundImage:
                            'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                          backgroundSize: '10px 10px',
                          backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                        }}
                      >
                        <img
                          src={item.url}
                          alt={item.label}
                          className="w-full h-full object-contain object-bottom drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none" />

                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold z-10">
                          {item.label}
                        </div>

                        {isSelected ? (
                          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-black shadow-xs flex items-center gap-1 z-10">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Dipilih</span>
                          </div>
                        ) : (
                          <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/50 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Check className="h-3 w-3" />
                          </div>
                        )}

                        <div className="absolute bottom-1.5 inset-x-1.5 z-10">
                          {isSelected ? (
                            <div className="w-full py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black text-center shadow-xs">
                              Aktif di Website
                            </div>
                          ) : (
                            <div className="w-full py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-800 dark:text-slate-200 text-[10px] font-extrabold text-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                              Klik untuk Pilih
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 px-0.5">
                <span>Pilihan di atas mencakup seluruh foto dari katalog dewan dan foto profil Anda.</span>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-bold shrink-0"
                >
                  <span>Kelola Foto di Menu Profil</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                <Images className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Katalog Foto Dewan Masih Kosong
                </h5>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Tambahkan koleksi foto resolusi tinggi di Katalog Profil Dewan agar Anda dapat dengan leluasa memilih foto terbaik untuk website Anda.
                </p>
              </div>
              <div className="pt-1 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-all cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Unggah Foto Sekarang</span>
                </button>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Buka Menu Profil</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

