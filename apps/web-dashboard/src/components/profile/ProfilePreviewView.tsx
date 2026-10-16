'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Award, 
  BookOpen, 
  Sparkles, 
  BrainCircuit, 
  Globe, 
  ExternalLink, 
  Edit3, 
  Phone, 
  Mail, 
  Calendar, 
  Landmark, 
  CheckCircle2, 
  Compass, 
  School,
  ShieldCheck,
  Images,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PUBLIC_OFFICE_ROLE_OPTIONS } from './profile-constants';
import { InstagramConnectionCard } from '@/components/social/InstagramConnectionCard';
import { ThreadsConnectionCard } from '@/components/social/ThreadsConnectionCard';

interface ProfilePreviewViewProps {
  fullName: string;
  phoneNumber: string;
  email?: string;
  partyAffiliation?: string | null;
  legislativeLevel: string;
  photoUrl?: string;
  photoGallery?: string[];
  gender: string;
  birthDate: string;
  education: string;
  courses: string[];
  issueInterests: string[];
  provinceName: string;
  dapilName: string;
  dapilCode: string;
  regencyCoverage: string[];
  commissionName?: string;
  subdomain?: string;
  isUnpaid?: boolean;
  onEditClick: () => void;
  onOpenSecurity?: (tab: 'PASSWORD' | 'EMAIL') => void;
}

export function ProfilePreviewView({
  fullName,
  phoneNumber,
  email,
  partyAffiliation,
  legislativeLevel,
  commissionName,
  photoUrl,
  photoGallery = [],
  gender,
  birthDate,
  education,
  courses,
  issueInterests,
  provinceName,
  dapilName,
  dapilCode,
  regencyCoverage,
  subdomain,
  isUnpaid = false,
  onEditClick,
  onOpenSecurity,
}: ProfilePreviewViewProps) {
  const selectedRole = PUBLIC_OFFICE_ROLE_OPTIONS.find((r) => r.value === legislativeLevel);

  function calculateAge(dateStr: string): number | null {
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

  function formatIndoDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(d);
    } catch {
      return dateStr;
    }
  }

  const age = calculateAge(birthDate);
  const portalUrl = subdomain ? `http://${subdomain}.localhost:3001` : '#';

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photoGallery.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < photoGallery.length - 1 ? prev + 1 : 0));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, photoGallery.length]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* MAIN ASYMMETRIC GRID: 4 COLS IDENTITAS (KIRI) vs 8 COLS KANVAS KINERJA (KANAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* KOLOM KIRI (ANCHOR IDENTITAS RESMI & KONTAK DEWAN) - 4 COLS */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
          <Card className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
            {/* Foto Profil Portrait Eksekutif */}
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl border-4 border-white dark:border-slate-800 bg-gradient-to-b from-blue-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-sm overflow-hidden flex items-center justify-center relative ring-1 ring-slate-200/80 dark:ring-slate-700">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl}
                      alt={fullName || 'Foto Dewan'}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center p-2 text-center bg-slate-100 dark:bg-slate-800">
                      <User className="h-12 w-12 text-slate-400 stroke-1" />
                    </div>
                  )}
                </div>

                {photoUrl && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-md border-2 border-white dark:border-slate-900">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Nama & Gelar Resmi */}
              <div className="mt-4 space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  {fullName || 'Nama Anggota Dewan'}
                </h2>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {selectedRole?.label || 'Anggota Legislatif'}
                </p>
              </div>

              {/* Badges Partai & Komisi */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                {partyAffiliation && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                    {partyAffiliation}
                  </span>
                )}
                {commissionName && (
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
                    {commissionName}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Terverifikasi</span>
                </span>
              </div>
            </div>

            {/* List Kontak & Metadata Resmi */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="font-medium">WhatsApp</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                  {phoneNumber || '-'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="font-medium">Email Akun</span>
                </div>
                <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {email || 'dewan@dpr.go.id'}
                  </span>
                  {onOpenSecurity && (
                    <button
                      type="button"
                      onClick={() => onOpenSecurity('EMAIL')}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1 shrink-0"
                    >
                      Ubah
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="font-medium">Usia &amp; Lahir</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {age !== null ? `${age} Tahun` : '-'}
                  {birthDate ? ` (${formatIndoDate(birthDate)})` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="font-medium">Jenis Kelamin</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {gender === 'LAKI_LAKI' ? 'Laki-laki' : gender === 'PEREMPUAN' ? 'Perempuan' : '-'}
                </span>
              </div>
            </div>

            {/* Action Buttons Utama */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <Button
                type="button"
                onClick={onEditClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-10 rounded-xl gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Ubah Data Profil</span>
              </Button>

              {onOpenSecurity && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenSecurity('PASSWORD')}
                  className="w-full font-bold text-xs h-9 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 gap-2 cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Keamanan Akun (Sandi &amp; Email)</span>
                </Button>
              )}

              {subdomain && (
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                >
                  <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Buka Portal Publik</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              )}
            </div>
          </Card>
        </div>

        {/* ============================================================ */}
        {/* KOLOM KANAN (KANVAS KINERJA, PORTOFOLIO & MEDSOS) - 8 COLS */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-6">
          {/* SEKSI 1: WILAYAH KERJA & FOKUS ISU KEBIJAKAN (RINGKASAN EKSEKUTIF) */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* WILAYAH KERJA & BASIS DAPIL */}
            <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-3xl">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Wilayah Kerja &amp; Basis Dapil</span>
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
                  {dapilCode || 'DAPIL'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Provinsi</span>
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-0.5 block">{provinceName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Nama Dapil</span>
                    <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400 mt-0.5 block">{dapilName}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-2 font-bold uppercase tracking-wider">
                    Cakupan Wilayah Kabupaten / Kota ({regencyCoverage.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {regencyCoverage.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-slate-700"
                      >
                        <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <span>{area}</span>
                      </span>
                    ))}
                    {regencyCoverage.length === 0 && (
                      <span className="text-xs text-slate-400 italic">Belum ada wilayah terdaftar.</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* MINAT ISU KEBIJAKAN (AI GROUNDING) */}
            <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-3xl">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Minat Isu &amp; Fokus Riset AI</span>
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                  {issueInterests.length} Isu
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Topik utama ini memandu mesin riset otonom AI POLARIS mencari data perda, anggaran daerah, dan statistik konstituen:
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {issueInterests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold shadow-2xs"
                    >
                      <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span>{interest}</span>
                    </span>
                  ))}

                  {issueInterests.length === 0 && (
                    <span className="text-xs text-slate-400 italic">Belum memilih topik minat isu.</span>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* SEKSI 2: KREDENSIAL PENDIDIKAN & KURSUS PARLEMEN */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* RIWAYAT PENDIDIKAN RESMI */}
            <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-3xl">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <School className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Riwayat Pendidikan Resmi</span>
                </h3>
                <button
                  onClick={onEditClick}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                >
                  Ubah
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                {education ? (
                  <span className="font-semibold text-slate-900 dark:text-white whitespace-pre-line text-sm">{education}</span>
                ) : (
                  <span className="text-slate-400 italic">Riwayat pendidikan belum diisi.</span>
                )}
              </div>
            </Card>

            {/* KURSUS & PELATIHAN KEPEMIMPINAN */}
            <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-3xl">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Kursus &amp; Diklat Parlemen ({courses.length})</span>
                </h3>
                <button
                  onClick={onEditClick}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                >
                  Ubah
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {courses.map((course) => (
                  <span
                    key={course}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    <BookOpen className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span>{course}</span>
                  </span>
                ))}

                {courses.length === 0 && (
                  <span className="text-xs text-slate-400 italic">Belum ada riwayat kursus atau pelatihan.</span>
                )}
              </div>
            </Card>
          </div>

          {/* SEKSI 3: KATALOG FOTO & ASSET DOKUMENTASI DEWAN */}
          <Card className="p-6 space-y-4 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Images className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Katalog Foto Portofolio &amp; Dokumentasi Dewan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Aset dokumentasi resmi yang disematkan AI POLARIS ke cover artikel, rilis pers, dan baliho digital
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <span className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                  {photoGallery.length} / 10 Foto
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onEditClick}
                  className="text-xs h-8 px-3 rounded-xl border-slate-200 dark:border-slate-700 gap-1.5 cursor-pointer font-bold"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Kelola Foto</span>
                </Button>
              </div>
            </div>

            {photoGallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-1">
                {photoGallery.map((photo, index) => {
                  const isPrimary = photo === photoUrl;
                  return (
                    <div
                      key={`preview-gallery-${index}`}
                      onClick={() => setLightboxIndex(index)}
                      className={`group relative rounded-2xl overflow-hidden border bg-slate-100 dark:bg-slate-800 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer aspect-[4/5] ${
                        isPrimary
                          ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={`Foto Dokumentasi ${index + 1}`}
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* OVERLAY */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-xs text-white shadow-lg">
                          <Eye className="h-5 w-5" />
                        </div>
                      </div>

                      {/* NOMOR URUT */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                        #{index + 1}
                      </div>

                      {/* PRIMARY BADGE */}
                      {isPrimary && (
                        <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Foto Utama</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 px-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-3">
                <Images className="h-8 w-8 text-slate-400 mx-auto stroke-1" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum Ada Foto Portofolio</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Unggah hingga 10 foto resmi, dokumentasi kunjungan dapil, atau foto persidangan untuk meningkatkan daya tarik publikasi parlemen.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={onEditClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 h-8 rounded-xl cursor-pointer gap-1.5 shadow-xs"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Tambah Foto Sekarang</span>
                </Button>
              </div>
            )}
          </Card>

          {/* SEKSI 4: SALURAN KOMUNIKASI PUBLIK RESMI (PALING BAWAH - SUSUN ATAS BAWAH LEGA) */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Saluran Komunikasi Publik Resmi Parlemen
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Kanal terverifikasi untuk sindikasi rilis pers &amp; opini dari Studio
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <InstagramConnectionCard isUnpaid={!!isUnpaid} />
              <ThreadsConnectionCard isUnpaid={!!isUnpaid} />
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL UNTUK PREVIEW FOTO FULSCREEN */}
      {lightboxIndex !== null && photoGallery[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xs transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* MAIN IMAGE */}
            <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 max-h-[75vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoGallery[lightboxIndex]}
                alt={`Foto Dokumentasi ${lightboxIndex + 1}`}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />

              {/* PREV BUTTON */}
              {photoGallery.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photoGallery.length - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition backdrop-blur-xs cursor-pointer shadow-lg"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* NEXT BUTTON */}
              {photoGallery.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) => (prev !== null && prev < photoGallery.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition backdrop-blur-xs cursor-pointer shadow-lg"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* LIGHTBOX FOOTER */}
            <div className="mt-4 flex items-center justify-between w-full max-w-2xl px-2 text-white">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white/90">
                  Foto {lightboxIndex + 1} dari {photoGallery.length}
                </span>
                {photoGallery[lightboxIndex] === photoUrl && (
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
                    ★ Foto Profil Utama
                  </span>
                )}
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setLightboxIndex(null);
                  onEditClick();
                }}
                className="text-xs h-8 px-4 bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer font-bold rounded-xl"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                <span>Kelola di Mode Edit</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
