'use client';

import React, { useRef, useState } from 'react';
import { ShieldCheck, Check, RefreshCw, Save, Upload, Trash2, Camera, Link2, User, Image as ImageIcon } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(
    Boolean(profileForm.photoUrl && (profileForm.photoUrl.startsWith('http://') || profileForm.photoUrl.startsWith('https://')))
  );
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, atau WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file foto maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setProfileForm((prev) => ({ ...prev, photoUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };
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

          {/* Foto Resmi Tokoh (File Uploader & Preview) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Foto Resmi Tokoh (Portofolio Publik)
            </label>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
              }}
            />

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`p-4 rounded-2xl border-2 transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Avatar Preview */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 flex items-center justify-center">
                    {profileForm.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileForm.photoUrl}
                        alt="Foto Tokoh"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <User className="w-10 h-10 mb-1 opacity-60" />
                        <span className="text-[10px] font-bold">Belum Ada</span>
                      </div>
                    )}
                  </div>
                  {profileForm.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setProfileForm((prev) => ({ ...prev, photoUrl: '' }))}
                      title="Hapus foto"
                      className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Upload Action & Guidance */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-500" />
                      <span>{profileForm.photoUrl ? 'Foto Siap Disimpan' : 'Pilih Berkas Foto Resmi'}</span>
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Tarik & lepas berkas ke sini, atau klik tombol untuk memilih foto dari perangkat Anda. Format JPG, PNG, atau WEBP (Maks. 5 MB).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{profileForm.photoUrl ? 'Ganti Foto' : 'Unggah Berkas Foto'}</span>
                    </button>

                    {profileForm.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setProfileForm((prev) => ({ ...prev, photoUrl: '' }))}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 cursor-pointer transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition flex items-center gap-1"
                    >
                      <Link2 className="w-3 h-3" />
                      <span>{showUrlInput ? 'Sembunyikan URL' : 'Tautan URL Eksternal'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional External URL Fallback (Collapsible) */}
              {showUrlInput && (
                <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800/80 animate-in fade-in">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Atau Masukkan Tautan / URL Gambar Eksternal:
                  </label>
                  <input
                    type="text"
                    value={profileForm.photoUrl.startsWith('data:') ? '' : profileForm.photoUrl}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, photoUrl: e.target.value }))
                    }
                    placeholder="https://domain.com/foto-resmi-dewan.jpg"
                    className="w-full p-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {profileForm.photoUrl.startsWith('data:') && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                      ✓ Foto tersimpan dari unggahan berkas lokal (Base64 Data URL aktif).
                    </p>
                  )}
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
