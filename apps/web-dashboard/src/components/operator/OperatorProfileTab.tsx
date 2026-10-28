'use client';

import React from 'react';
import { ShieldCheck, Check, RefreshCw, Save } from 'lucide-react';

interface OperatorProfileTabProps {
  profileForm: {
    fullName: string;
    partyAffiliation: string;
    customDapilName: string;
    commissionName: string;
    photoUrl: string;
    education: string;
  };
  setProfileForm: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      partyAffiliation: string;
      customDapilName: string;
      commissionName: string;
      photoUrl: string;
      education: string;
    }>
  >;
  profileSaveSuccess: string | null;
  savingProfile: boolean;
  onSaveProfile: (e: React.FormEvent) => void;
}

export function OperatorProfileTab({
  profileForm,
  setProfileForm,
  profileSaveSuccess,
  savingProfile,
  onSaveProfile,
}: OperatorProfileTabProps) {
  return (
    <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Manajemen Profil & Portofolio Publik Dewan
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Perbarui nama resmi, komisi, partai, bio, dan foto yang ditampilkan di Portal Publik
            Tokoh.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Kredensial & Sandi Dewan Aman Terisolasi</span>
        </div>
      </div>

      {profileSaveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{profileSaveSuccess}</span>
        </div>
      )}

      <form onSubmit={onSaveProfile} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama Lengkap & Gelar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Lengkap & Gelar Resmi
            </label>
            <input
              type="text"
              value={profileForm.fullName}
              onChange={(e) =>
                setProfileForm({ ...profileForm, fullName: e.target.value })
              }
              placeholder="Contoh: H. Ahmad Fauzi, S.E., M.M."
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Partai Politik */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Partai Politik / Fraksi
            </label>
            <input
              type="text"
              value={profileForm.partyAffiliation}
              onChange={(e) =>
                setProfileForm({ ...profileForm, partyAffiliation: e.target.value })
              }
              placeholder="Contoh: Golkar, PDI Perjuangan, Gerindra..."
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Nama Dapil Kustom */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Daerah Pemilihan (Dapil)
            </label>
            <input
              type="text"
              value={profileForm.customDapilName}
              onChange={(e) =>
                setProfileForm({ ...profileForm, customDapilName: e.target.value })
              }
              placeholder="Contoh: Jawa Barat I (Kota Bandung & Cimahi)"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Komisi & Tugas Parlemen */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Komisi / Alat Kelengkapan Dewan (AKD)
            </label>
            <input
              type="text"
              value={profileForm.commissionName}
              onChange={(e) =>
                setProfileForm({ ...profileForm, commissionName: e.target.value })
              }
              placeholder="Contoh: Komisi IV (Pertanian, Pangan, Maritim)"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Foto Profil URL */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              URL Foto Resmi Tokoh
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={profileForm.photoUrl}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, photoUrl: e.target.value })
                }
                placeholder="https://... URL foto resolusi tinggi berlatar formal"
                className="flex-1 p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {profileForm.photoUrl && (
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profileForm.photoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Riwayat Pendidikan & Bio Ringkas */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Profil & Pernyataan Visi Tokoh
            </label>
            <textarea
              rows={3}
              value={profileForm.education}
              onChange={(e) =>
                setProfileForm({ ...profileForm, education: e.target.value })
              }
              placeholder="Pernyataan komitmen pelayanan publik, rekam jejak, atau pendidikan tokoh."
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {savingProfile ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan Profil</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
