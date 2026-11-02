'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Landmark,
  Building2,
  Users,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  ParliamentaryAssignment,
  CommissionAssignment,
  AkdBodyItem,
} from '../types';

interface ThemeAkdCardProps {
  currentAkdAssignment: ParliamentaryAssignment;
  partyAffiliation?: string;
  handleUpdateCommission: (field: keyof CommissionAssignment, val: string) => void;
  handleUpdateFactionRole: (val: string) => void;
  handleAddAkdBody: (presetName?: string) => void;
  handleUpdateAkdBody: (index: number, field: keyof AkdBodyItem, val: string) => void;
  handleRemoveAkdBody: (index: number) => void;
}

export function ThemeAkdCard({
  currentAkdAssignment,
  partyAffiliation,
  handleUpdateCommission,
  handleUpdateFactionRole,
  handleAddAkdBody,
  handleUpdateAkdBody,
  handleRemoveAkdBody,
}: ThemeAkdCardProps) {
  return (
    <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-4">
      <div className="border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
          <Landmark className="h-3.5 w-3.5 text-blue-500" />
          <span>Penugasan Komisi & Alat Kelengkapan Dewan (AKD)</span>
        </h4>
        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          Kelola data komisi parlemen, posisi di fraksi, dan keanggotaan badan dewan (Banggar, Bamus, Baleg/Bapemperda, BK, Pansus) untuk ditampilkan di profil publik.
        </p>
      </div>

      {/* 1. Komisi Utama Parlemen */}
      <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Komisi Utama Parlemen</span>
          </span>
          <span className="text-[9px] font-semibold text-slate-400">Fungsi Pengawasan & Mitra Kerja</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
              Nama Komisi
            </label>
            <input
              type="text"
              value={currentAkdAssignment.commission?.name || ''}
              onChange={(e) => handleUpdateCommission('name', e.target.value)}
              placeholder="Contoh: Komisi IV DPR RI atau Komisi B DPRD"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
              Jabatan di Komisi
            </label>
            <input
              type="text"
              value={currentAkdAssignment.commission?.role || ''}
              onChange={(e) => handleUpdateCommission('role', e.target.value)}
              placeholder="Contoh: Anggota Komisi, Wakil Ketua, atau Kapoksi"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
            Ruang Lingkup Bidang / Sektor Pengawasan
          </label>
          <input
            type="text"
            value={currentAkdAssignment.commission?.scope || ''}
            onChange={(e) => handleUpdateCommission('scope', e.target.value)}
            placeholder="Contoh: Pertanian, Perkebunan, Kehutanan, Kelautan, Perikanan, dan Ketahanan Pangan"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
            Mitra Kerja Kementerian / Lembaga / Dinas Terkait
          </label>
          <input
            type="text"
            value={currentAkdAssignment.commission?.partners || ''}
            onChange={(e) => handleUpdateCommission('partners', e.target.value)}
            placeholder="Contoh: Kementerian Pertanian, KLHK, KKP, Badan Pangan Nasional, Perum BULOG"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* 2. Posisi di Fraksi Parlemen */}
      <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>Posisi di Fraksi Parlemen</span>
          </span>
          {partyAffiliation && (
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
              Fraksi {partyAffiliation}
            </span>
          )}
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
            Amanah / Jabatan di Fraksi
          </label>
          <input
            type="text"
            value={currentAkdAssignment.factionRole || ''}
            onChange={(e) => handleUpdateFactionRole(e.target.value)}
            placeholder="Contoh: Anggota Fraksi, Sekretaris Fraksi, Bendahara Fraksi, atau Ketua Kelompok Fraksi (Kapoksi)"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Keanggotaan Alat Kelengkapan Dewan (AKD) Lainnya */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Alat Kelengkapan Dewan (AKD) Lainnya</span>
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Tambahkan jika merangkap amanah di Banggar, Bamus, Baleg/Bapemperda, BK, atau Pansus.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => handleAddAkdBody()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1 h-auto rounded-md gap-1 cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-3 h-3" />
            <span>Tambah AKD</span>
          </Button>
        </div>

        {/* Quick preset buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[9.5px] font-bold text-slate-400 uppercase mr-1">Pilihan Cepat:</span>
          {['Badan Anggaran (Banggar)', 'Badan Musyawarah (Bamus)', 'Badan Pembentukan Perda / Baleg', 'Badan Kehormatan (BK)', 'Pansus RUU/Ranperda'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleAddAkdBody(preset)}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              + {preset}
            </button>
          ))}
        </div>

        {(currentAkdAssignment.akdBodies || []).length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center space-y-1">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
              Belum Ada AKD Tambahan Ditambahkan (Opsional)
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              Gunakan tombol + Tambah AKD jika Anda juga bertugas di Badan Anggaran, Bamus, Baleg, dll.
            </span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {(currentAkdAssignment.akdBodies || []).map((akd, aIdx) => (
              <div
                key={akd.id || `akd-${aIdx}`}
                className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[9px] font-bold">
                      {aIdx + 1}
                    </span>
                    <span>AKD #{aIdx + 1}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAkdBody(aIdx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                    title="Hapus AKD"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">
                      Nama Badan / Alat Kelengkapan
                    </label>
                    <input
                      type="text"
                      value={akd.name}
                      onChange={(e) => handleUpdateAkdBody(aIdx, 'name', e.target.value)}
                      placeholder="Contoh: Badan Anggaran (Banggar)"
                      className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">
                      Jabatan / Posisi
                    </label>
                    <input
                      type="text"
                      value={akd.role}
                      onChange={(e) => handleUpdateAkdBody(aIdx, 'role', e.target.value)}
                      placeholder="Contoh: Anggota, Wakil Ketua, Ketua"
                      className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-bold text-slate-500 uppercase block mb-1">
                    Catatan / Fokus Penugasan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={akd.notes || ''}
                    onChange={(e) => handleUpdateAkdBody(aIdx, 'notes', e.target.value)}
                    placeholder="Contoh: Pengawasan alokasi DAK Fisik & perimbangan keuangan daerah di Dapil"
                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-white font-normal focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

