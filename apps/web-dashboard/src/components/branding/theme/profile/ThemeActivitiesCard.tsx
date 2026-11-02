'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Camera,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { PerformanceActivityItem } from '../types';

interface ThemeActivitiesCardProps {
  currentActivities: PerformanceActivityItem[];
  handleAddActivity: () => void;
  handleRemoveActivity: (index: number) => void;
  handleUpdateActivity: (index: number, field: keyof PerformanceActivityItem, val: string) => void;
  handleActivityFileUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ThemeActivitiesCard({
  currentActivities,
  handleAddActivity,
  handleRemoveActivity,
  handleUpdateActivity,
  handleActivityFileUpload,
}: ThemeActivitiesCardProps) {
  return (
    <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3.5">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
            <Camera className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span>Dokumentasi Kinerja Turun ke Dapil</span>
          </h4>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            Unggah foto dokumentasi aksi nyata, serap aspirasi, dan kegiatan pengabdian langsung di wilayah Dapil untuk website profil dewan.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleAddActivity}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 h-auto rounded-lg gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Kegiatan</span>
        </Button>
      </div>

      {currentActivities.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center space-y-2">
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <Camera className="w-4.5 h-4.5" />
          </div>
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Belum Ada Dokumentasi Kinerja Ditambahkan
          </h5>
        </div>
      ) : (
        <div className="space-y-3">
          {currentActivities.map((act, idx) => (
            <div
              key={act.id || idx}
              className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs"
            >
              {/* Header Item */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[9px] font-bold">
                    {idx + 1}
                  </span>
                  <span>Kegiatan Kinerja #{idx + 1}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveActivity(idx)}
                  className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                  title="Hapus Dokumentasi Ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Upload / Pratinjau Foto Dokumentasi */}
              <div className="flex flex-col sm:flex-row gap-3 items-start bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                <div className="w-full sm:w-28 h-20 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden relative shrink-0 border border-slate-300/60 dark:border-slate-700 flex items-center justify-center">
                  {act.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={act.photoUrl}
                      alt={act.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 gap-1 text-[9px]">
                      <ImageIcon className="w-4 h-4" />
                      <span>Belum ada foto</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor={`activity-upload-${idx}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{act.photoUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
                    </label>
                    <input
                      id={`activity-upload-${idx}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleActivityFileUpload(idx, e)}
                      className="hidden"
                    />
                    {act.photoUrl && (
                      <button
                        type="button"
                        onClick={() => handleUpdateActivity(idx, 'photoUrl', '')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Format JPG, PNG, atau WebP (disarankan orientasi lanskap/horizontal).
                  </p>
                </div>
              </div>

              {/* Input Data Kegiatan */}
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                    Judul Kegiatan / Aksi Kinerja
                  </label>
                  <input
                    type="text"
                    value={act.title}
                    onChange={(e) => handleUpdateActivity(idx, 'title', e.target.value)}
                    placeholder="Contoh: Peninjauan Irigasi Pertanian & Dialog Petani"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                      Tanggal / Masa Sidang
                    </label>
                    <input
                      type="text"
                      value={act.date || ''}
                      onChange={(e) => handleUpdateActivity(idx, 'date', e.target.value)}
                      placeholder="Contoh: 18 Oktober 2024 atau Reses Sidang I"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                      Lokasi Wilayah Dapil
                    </label>
                    <input
                      type="text"
                      value={act.location || ''}
                      onChange={(e) => handleUpdateActivity(idx, 'location', e.target.value)}
                      placeholder="Contoh: Kec. Ciawi, Kab. Bogor"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                    Uraian Hasil Kinerja & Aspirasi Warga
                  </label>
                  <textarea
                    rows={2}
                    value={act.description}
                    onChange={(e) => handleUpdateActivity(idx, 'description', e.target.value)}
                    placeholder="Contoh: Berdialog bersama 150 warga terkait ketersediaan pupuk subsidi dan meninjau rencana perbaikan tanggul penahan banjir..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-normal focus:border-blue-600 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

