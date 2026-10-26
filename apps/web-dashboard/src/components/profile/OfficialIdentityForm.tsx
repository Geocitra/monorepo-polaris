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
  Lock,
  KeyRound,
  Sparkles,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { PUBLIC_OFFICE_ROLE_OPTIONS, GENDER_OPTIONS } from './profile-constants';
import { removeImageBackground, upscaleImageToHD } from '@/lib/background-removal';

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
  onOpenSecurity?: (tab: 'PASSWORD' | 'EMAIL') => void;
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
  onOpenSecurity,
}: OfficialIdentityFormProps) {
  const selectedRoleObj = PUBLIC_OFFICE_ROLE_OPTIONS.find((r) => r.value === legislativeLevel);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // AI Background Removal & Super-Resolution HD States
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [autoUpscaleHD, setAutoUpscaleHD] = useState(true);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgStatusMessage, setBgStatusMessage] = useState('');
  const [bgProgress, setBgProgress] = useState(0);
  const [originalPhotoBackup, setOriginalPhotoBackup] = useState<string | null>(null);
  const [isBgRemoved, setIsBgRemoved] = useState(false);
  const [isHD, setIsHD] = useState(false);

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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/')) {
      alert('Format foto wajib berupa gambar (PNG, JPG, JPEG, atau WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const originalData = event.target?.result as string;
      if (!originalData) return;

      if (!autoRemoveBg && !autoUpscaleHD) {
        setPhotoUrl(originalData);
        setOriginalPhotoBackup(null);
        setIsBgRemoved(false);
        setIsHD(false);
        return;
      }

      setIsRemovingBg(true);
      setBgStatusMessage('Menyiapkan AI Penghapus Background & HD Upscale...');
      setBgProgress(10);
      try {
        let resultUrl = originalData;

        if (autoRemoveBg) {
          resultUrl = await removeImageBackground(
            originalData,
            (progress) => {
              setBgStatusMessage(progress.message);
              setBgProgress(progress.percentage);
            },
            { autoUpscale: autoUpscaleHD, targetMinHeight: 1600 }
          );
          setIsBgRemoved(true);
          setIsHD(autoUpscaleHD);
        } else if (autoUpscaleHD) {
          resultUrl = await upscaleImageToHD(
            originalData,
            (progress) => {
              setBgStatusMessage(progress.message);
              setBgProgress(progress.percentage);
            },
            { targetMinHeight: 1600 }
          );
          setIsHD(true);
        }

        setOriginalPhotoBackup(originalData);
        setPhotoUrl(resultUrl);
      } catch (err) {
        console.error('Auto remove background or upscale failed:', err);
        setPhotoUrl(originalData);
        alert(
          'Gagal memproses foto otomatis: ' +
            (err instanceof Error ? err.message : String(err)) +
            '. Foto asli tetap ditampilkan.'
        );
      } finally {
        setIsRemovingBg(false);
        setBgProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleManualRemoveBg() {
    if (!photoUrl || isRemovingBg) return;

    setIsRemovingBg(true);
    setBgStatusMessage('Menyiapkan AI Penghapus Background...');
    setBgProgress(10);
    try {
      const transparentDataUrl = await removeImageBackground(
        photoUrl,
        (progress) => {
          setBgStatusMessage(progress.message);
          setBgProgress(progress.percentage);
        },
        { autoUpscale: autoUpscaleHD, targetMinHeight: 1600 }
      );
      setOriginalPhotoBackup(photoUrl);
      setPhotoUrl(transparentDataUrl);
      setIsBgRemoved(true);
      if (autoUpscaleHD) setIsHD(true);
    } catch (err) {
      console.error('Manual remove background failed:', err);
      alert('Gagal memproses gambar: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsRemovingBg(false);
      setBgProgress(0);
    }
  }

  async function handleManualUpscaleHD() {
    if (!photoUrl || isRemovingBg) return;

    setIsRemovingBg(true);
    setBgStatusMessage('Menyiapkan Super-Resolution HD Image Upscaler...');
    setBgProgress(20);
    try {
      const hdDataUrl = await upscaleImageToHD(
        photoUrl,
        (progress) => {
          setBgStatusMessage(progress.message);
          setBgProgress(progress.percentage);
        },
        { targetMinHeight: 1600, sharpen: true, defringe: true }
      );
      setOriginalPhotoBackup(photoUrl);
      setPhotoUrl(hdDataUrl);
      setIsHD(true);
    } catch (err) {
      console.error('Manual HD upscale failed:', err);
      alert('Gagal meningkatkan resolusi foto: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsRemovingBg(false);
      setBgProgress(0);
    }
  }

  function handleRestoreOriginal() {
    if (originalPhotoBackup) {
      setPhotoUrl(originalPhotoBackup);
      setOriginalPhotoBackup(null);
      setIsBgRemoved(false);
      setIsHD(false);
    }
  }

  async function handleApplyUrl() {
    const rawUrl = urlInput.trim();
    if (!rawUrl) return;

    if (!autoRemoveBg && !autoUpscaleHD) {
      setPhotoUrl(rawUrl);
      setUrlInput('');
      setShowUrlInput(false);
      return;
    }

    setIsRemovingBg(true);
    setBgStatusMessage('Membaca tautan gambar & memproses AI...');
    setBgProgress(15);
    try {
      let resultUrl = rawUrl;
      if (autoRemoveBg) {
        resultUrl = await removeImageBackground(
          rawUrl,
          (progress) => {
            setBgStatusMessage(progress.message);
            setBgProgress(progress.percentage);
          },
          { autoUpscale: autoUpscaleHD, targetMinHeight: 1600 }
        );
        setIsBgRemoved(true);
        if (autoUpscaleHD) setIsHD(true);
      } else if (autoUpscaleHD) {
        resultUrl = await upscaleImageToHD(
          rawUrl,
          (progress) => {
            setBgStatusMessage(progress.message);
            setBgProgress(progress.percentage);
          },
          { targetMinHeight: 1600 }
        );
        setIsHD(true);
      }

      setOriginalPhotoBackup(rawUrl);
      setPhotoUrl(resultUrl);
      setUrlInput('');
      setShowUrlInput(false);
    } catch (err) {
      console.warn('Auto process from URL failed, using raw url:', err);
      setPhotoUrl(rawUrl);
      setUrlInput('');
      setShowUrlInput(false);
    } finally {
      setIsRemovingBg(false);
      setBgProgress(0);
    }
  }

  function handleRemovePhoto() {
    setPhotoUrl('');
    setOriginalPhotoBackup(null);
    setIsBgRemoved(false);
    setIsHD(false);
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
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-violet-100 text-violet-700 border border-violet-200">
                <Sparkles className="h-2.5 w-2.5 text-violet-600" />
                Auto-Transparan AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              <span className="font-bold text-slate-700">Format PNG transparan otomatis (latar belakang dihapus AI).</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            <label className="text-[10px] text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1.5 cursor-pointer shadow-2xs select-none">
              <input
                type="checkbox"
                checked={autoRemoveBg}
                onChange={(e) => setAutoRemoveBg(e.target.checked)}
                className="rounded text-violet-600 focus:ring-violet-500 h-3 w-3 cursor-pointer"
              />
              <span className="font-semibold text-slate-800">Hapus Background AI</span>
            </label>

            <label className="text-[10px] text-slate-700 bg-white border border-slate-200/90 hover:bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1.5 cursor-pointer shadow-2xs select-none">
              <input
                type="checkbox"
                checked={autoUpscaleHD}
                onChange={(e) => setAutoUpscaleHD(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3 cursor-pointer"
              />
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-blue-600" />
                Scale Up HD
              </span>
            </label>
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
                  'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                backgroundSize: '10px 10px',
                backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
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

              {/* OVERLAY WHILE REMOVING BACKGROUND */}
              {isRemovingBg && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-1 text-center z-10">
                  <Loader2 className="h-5 w-5 text-violet-300 animate-spin mb-1" />
                  <span className="text-[8px] font-bold text-white leading-tight">
                    {bgProgress > 0 ? `${bgProgress}%` : 'AI Aktif'}
                  </span>
                  <span className="text-[7px] text-slate-300 leading-tight">
                    {bgProgress > 65 ? 'Scale Up HD' : 'Hapus BG'}
                  </span>
                </div>
              )}

              {/* BADGE HD JIKA RESOLUSI SUDAH HD */}
              {photoUrl && !isRemovingBg && (isHD || autoUpscaleHD) && (
                <div
                  className="absolute top-1 left-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded px-1 py-0.2 text-[8px] font-black tracking-wider shadow-xs select-none"
                  title="Foto Kualitas High Definition (HD)"
                >
                  HD
                </div>
              )}
            </div>

            {photoUrl && !isRemovingBg && (
              <div
                className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-2xs"
                title="Foto tersimpan"
              >
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
              accept="image/png,image/webp,image/jpeg,image/jpg"
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                disabled={isRemovingBg}
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-2.5 py-1 h-7 rounded-lg gap-1 shadow-2xs cursor-pointer"
              >
                <UploadCloud className="h-3 w-3" />
                <span>{photoUrl ? 'Ganti Foto' : 'Pilih Foto'}</span>
              </Button>

              {/* TOMBOL MANUAL HAPUS BACKGROUND (AI) */}
              {photoUrl && !isRemovingBg && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleManualRemoveBg}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs px-2.5 py-1 h-7 rounded-lg gap-1 shadow-2xs cursor-pointer"
                  title="Hapus background foto yang sedang tampil menjadi transparan secara otomatis"
                >
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  <span>Jadikan Transparan (AI)</span>
                </Button>
              )}

              {/* TOMBOL MANUAL SCALE UP KE HD */}
              {photoUrl && !isRemovingBg && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleManualUpscaleHD}
                  className="border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 font-bold text-xs px-2.5 py-1 h-7 rounded-lg gap-1 shadow-2xs cursor-pointer"
                  title="Tingkatkan resolusi gambar ke format HD (1600px+) dengan Super-Resolution AI"
                >
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  <span>Scale Up HD</span>
                </Button>
              )}

              {/* TOMBOL KEMBALIKAN FOTO ASLI (UNDO) */}
              {originalPhotoBackup && !isRemovingBg && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleRestoreOriginal}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs px-2 py-1 h-7 rounded-lg gap-1 cursor-pointer"
                  title="Kembalikan ke foto asli sebelum background dihapus"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Foto Asli</span>
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isRemovingBg}
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="border-slate-300 text-slate-700 text-xs px-2 py-1 h-7 rounded-lg cursor-pointer"
              >
                <span>Input URL</span>
              </Button>

              {photoUrl && !isRemovingBg && (
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

            {/* PROGRESS BAR JIKA SEDANG MEMPROSES BACKGROUND */}
            {isRemovingBg && (
              <div className="p-2 rounded-lg bg-violet-50 border border-violet-200/80 space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[11px] text-violet-900 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" />
                    <span>{bgStatusMessage || 'Memproses AI penghapus background & HD upscale...'}</span>
                  </span>
                  <span className="font-extrabold text-violet-700">{bgProgress}%</span>
                </div>
                <div className="w-full bg-violet-200/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet-600 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(8, bgProgress)}%` }}
                  />
                </div>
              </div>
            )}

            {showUrlInput && (
              <div className="flex gap-1 max-w-sm pt-0.5">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://.../foto-dewan.jpg"
                  className="block flex-1 rounded-lg border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={isRemovingBg}
                  onClick={handleApplyUrl}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-2 py-0.5 h-6 rounded-md cursor-pointer"
                >
                  OK
                </Button>
              </div>
            )}

            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>Mendukung JPG, JPEG, PNG, WEBP (otomatis dipotong transparan & di-upscale HD).</span>
              {photoUrl && !isRemovingBg && (
                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                  ✓ Tersinkron
                </span>
              )}
              {isBgRemoved && (
                <span className="text-violet-700 font-bold flex items-center gap-0.5">
                  ✨ Transparan AI
                </span>
              )}
              {isHD && (
                <span className="text-blue-600 font-bold flex items-center gap-0.5">
                  <Sparkles className="h-3 w-3" />
                  Kualitas HD (1600px+)
                </span>
              )}
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
          <div className="flex items-center justify-between mb-0.5">
            <label className="block text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
              <Mail className="h-3 w-3 text-slate-400" />
              <span>Email Akun Terdaftar</span>
            </label>
            {onOpenSecurity && (
              <button
                type="button"
                onClick={() => onOpenSecurity('EMAIL')}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Ubah Email
              </button>
            )}
          </div>
          <input
            type="email"
            disabled
            value={email || 'dewan@dpr.go.id'}
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 cursor-not-allowed"
          />
          <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-slate-400" />
              <span>Kredensial Login Akun</span>
            </span>
            {onOpenSecurity && (
              <button
                type="button"
                onClick={() => onOpenSecurity('PASSWORD')}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
              >
                <KeyRound className="w-2.5 h-2.5" />
                <span>Ganti Password</span>
              </button>
            )}
          </div>
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
