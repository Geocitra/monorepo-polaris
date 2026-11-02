'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { CareerItem } from '../types';

interface ThemeCareerCardProps {
  currentCareers: CareerItem[];
  handleAddCareer: () => void;
  handleRemoveCareer: (index: number) => void;
  handleUpdateCareer: (index: number, field: keyof CareerItem, val: string) => void;
}

export function ThemeCareerCard({
  currentCareers,
  handleAddCareer,
  handleRemoveCareer,
  handleUpdateCareer,
}: ThemeCareerCardProps) {
  return (
    <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
            <Briefcase className="h-3.5 w-3.5 text-blue-500" />
            <span>Penugasan Parlemen & Rekam Jejak Amanah</span>
          </h4>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar amanah komisi, badan kelengkapan, organisasi, atau inisiatif sosial dewan.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleAddCareer}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 h-auto rounded-lg gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Jabatan</span>
        </Button>
      </div>

      {currentCareers.length === 0 ? (
        <div className="p-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center space-y-1">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Belum ada riwayat penugasan kustom ditambahkan.
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Website publik saat ini menampilkan penugasan komisi & fraksi resmi secara otomatis. Gunakan tombol <span className="font-bold text-blue-600 dark:text-blue-400">+ Tambah Jabatan</span> di atas untuk menambahkan amanah kustom lainnya.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {currentCareers.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Penugasan #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCareer(idx)}
                  className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                  title="Hapus Penugasan Ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">
                    Nama Jabatan / Amanah
                  </label>
                  <input
                    type="text"
                    value={item.role}
                    onChange={(e) => handleUpdateCareer(idx, 'role', e.target.value)}
                    placeholder="Contoh: Anggota Komisi V (Infrastruktur)"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">
                    Periode
                  </label>
                  <input
                    type="text"
                    value={item.period || ''}
                    onChange={(e) => handleUpdateCareer(idx, 'period', e.target.value)}
                    placeholder="2024 – 2029"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-0.5">
                  Keterangan Tanggung Jawab / Rekam Jejak
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleUpdateCareer(idx, 'description', e.target.value)}
                  placeholder="Contoh: Mengawal program konektivitas jalur logistik & bedah rumah rakyat"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

