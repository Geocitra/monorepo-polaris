'use client';

import { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Landmark,
  Mail,
  Camera,
  UploadCloud,
  Trash2,
  Calendar,
  CheckCircle2,
  Info,
  Layers,
} from 'lucide-react';
import { PUBLIC_OFFICE_ROLE_OPTIONS, GENDER_OPTIONS } from './profile-constants';

interface OfficialIdentityFormProps {
  fullName: string;
  setFullName: (val: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  partyAffiliation?: string;
  setPartyAffiliation?: (val: string) => void;
  legislativeLevel: string;
  setLegislativeLevel?: (val: string) => void;
  commissionName?: string;
  setCommissionName?: (val: string) => void;
  email?: string;
  photoUrl: string;
  setPhotoUrl: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  birthDate: string;
  setBirthDate: (val: string) => void;
}

export function OfficialIdentityForm({
  fullName,
  setFullName,
  phoneNumber,
  setPhoneNumber,
  legislativeLevel,
  setLegislativeLevel,
  commissionName,
  setCommissionName,
  email,
  photoUrl,
  setPhotoUrl,
  gender,
  setGender,
  birthDate,
  setBirthDate,
}: OfficialIdentityFormProps) {
  const selectedRoleObj = PUBLIC_OFFICE_ROLE_OPTIONS.find((r) => r.value === legislativeLevel);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  function getAge(dateStr: string): number | null {
    if (!dateStr) return null;
    const birth = new Date(dateStr);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  }

  const computedAge = getAge(birthDate);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('png') && !file.type.includes('image/')) {
      alert('Format foto wajib gambar PNG (tanpa background) untuk hasil optimal.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPhotoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleApplyUrl() {
    if (urlInput.trim()) {
      setPhotoUrl(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  }

  function handleRemovePhoto() {
    setPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <Card className="p-3.5 sm:p-4 space-y-3 shadow-2xs border-slate-200 bg-white rounded-xl">
      {/* HEADER */}
      <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <User className="h-4 w-4 text-blue-600" />
            <span>Identitas Anggota Dewan & Lembaga</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Identitas resmi untuk atribusi siaran pers, naskah opini, dan portal resmi.
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
          Profil Utama
        </span>
      </div>

      {/* FOTO SI DEWAN COMPACT */}
      <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Camera className="h-3.5 w-3.5 text-blue-600" />
              <span>Foto Dewan (Web Portal & Materi AI)</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              <span className="font-bold text-amber-700">Wajib format PNG transparan (tanpa background).</span>
            </p>
          </div>

          <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md flex items-center gap-1 self-start sm:self-auto">
            <Info className="h-3 w-3 shrink-0" />
            <span>Gunakan <strong>remove.bg</strong> untuk hapus background jas dinas.</span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-3 pt-0.5">
          {/* PREVIEW BOX */}
          <div className="relative shrink-0">
            <div
              className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg border border-slate-300 flex items-center justify-center overflow-hidden bg-white relative shadow-2xs"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              }}
            >
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Foto Dewan"
                  className="w-full h-full object-contain object-bottom drop-shadow-xs"
                />
              ) : (
                <div className="text-center p-1">
                  <User className="h-5 w-5 text-slate-400 mx-auto" />
                  <span className="text-[8px] text-slate-400 font-bold block mt-0.5">No-Bg PNG</span>
                </div>
              )}
            </div>

            {photoUrl && (
              <div className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-2xs">
                <CheckCircle2 className="h-2.5 w-2.5" />
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/webp,image/jpeg"
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-2.5 py-1 h-7 rounded-lg gap-1 shadow-2xs cursor-pointer"
              >
                <UploadCloud className="h-3 w-3" />
                <span>{photoUrl ? 'Ganti Foto' : 'Pilih File PNG'}</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="border-slate-300 text-slate-700 text-xs px-2 py-1 h-7 rounded-lg cursor-pointer"
              >
                <span>Input URL</span>
              </Button>

              {photoUrl && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleRemovePhoto}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-2 py-1 h-7 rounded-lg gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Hapus</span>
                </Button>
              )}
            </div>

            {showUrlInput && (
              <div className="flex gap-1 max-w-sm pt-0.5">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://.../foto-dewan.png"
                  className="block flex-1 rounded-lg border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyUrl}
                  className="bg-slate-800 text-white font-bold text-xs px-2 py-0.5 h-6 rounded-md cursor-pointer"
                >
                  OK
                </Button>
              </div>
            )}

            <div className="text-[10px] text-slate-400">
              Format: PNG transparan (maks 5MB).
              {photoUrl && <span className="ml-1 text-emerald-600 font-bold">✓ Tersinkron</span>}
            </div>
          </div>
        </div>
      </div>

      {/* NAMA & NO HP */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
            Nama Lengkap & Gelar Resmi
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Contoh: Ir. H. Achmad Fauzi, M.Si"
            className="block w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
            No. WhatsApp / HP
          </label>
          <input
            type="tel"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="08123456xxxx"
            className="block w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* GENDER & TANGGAL LAHIR */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {/* JENIS KELAMIN */}
        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
            Jenis Kelamin
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {GENDER_OPTIONS.map((opt) => {
              const isSelected = gender === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGender(opt.value)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <User className="h-3 w-3" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TANGGAL LAHIR */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label className="block text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
              <Calendar className="h-3 w-3 text-blue-600" />
              <span>Tanggal Lahir</span>
            </label>
            {computedAge !== null && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                {computedAge} Thn
              </span>
            )}
          </div>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
          />
        </div>
      </div>

      {/* PERAN JABATAN & EMAIL */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label className="block text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
              <Landmark className="h-3 w-3 text-blue-600" />
              <span>Peran Jabatan Publik</span>
            </label>
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              Terkunci Mandat KPU
            </span>
          </div>
          <div className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 cursor-not-allowed">
            {selectedRoleObj ? selectedRoleObj.label : legislativeLevel.replace(/_/g, ' ')}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-snug">
            Tingkat jabatan resmi dikunci oleh sistem sesuai verifikasi mandat KPU. Hubungi Administrator untuk permohonan mutasi.
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5 flex items-center gap-1">
            <Mail className="h-3 w-3 text-slate-400" />
            <span>Email Akun Terdaftar</span>
          </label>
          <input
            type="email"
            disabled
            value={email || 'dewan@dpr.go.id'}
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-400 cursor-not-allowed"
          />
        </div>
      </div>

      {/* PENUGASAN KOMISI & AKD */}
      <div>
        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5 flex items-center gap-1">
          <Layers className="h-3 w-3 text-blue-600" />
          <span>Penugasan Komisi & Alat Kelengkapan Dewan (AKD)</span>
        </label>
        <input
          type="text"
          value={commissionName || ''}
          onChange={(e) => setCommissionName && setCommissionName(e.target.value)}
          placeholder="Contoh: Komisi I (Pertahanan & Kominfo), Komisi A (Pemerintahan), atau Badan Anggaran"
          className="block w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
        />
        <span className="text-[10px] text-slate-500 font-medium block mt-1">
          Penugasan komisi digunakan POLARIS AI untuk memfilter kurasi berita parlemen, riset regulasi kementerian, dan pembuatan materi rilis pers harian.
        </span>
      </div>
    </Card>
  );
}
