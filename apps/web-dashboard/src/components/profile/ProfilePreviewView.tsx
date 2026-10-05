'use client';

import { 
  User, 
  MapPin, 
  GraduationCap, 
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PUBLIC_OFFICE_ROLE_OPTIONS } from './profile-constants';

interface ProfilePreviewViewProps {
  fullName: string;
  phoneNumber: string;
  email?: string;
  partyAffiliation?: string | null;
  legislativeLevel: string;
  photoUrl?: string;
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
  onEditClick: () => void;
}

export function ProfilePreviewView({
  fullName,
  phoneNumber,
  email,
  partyAffiliation,
  legislativeLevel,
  commissionName,
  photoUrl,
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
  onEditClick,
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

  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* 1. HERO PROFILE CARD (COMPACT, NO EXCESSIVE GAPS) */}
      <Card className="p-3.5 sm:p-4 border-slate-200 bg-white shadow-xs rounded-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
          {/* FOTO PROFIL CUTOUT COMPACT */}
          <div className="shrink-0 relative group">
            <div
              className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg border border-slate-200 bg-slate-50 shadow-2xs overflow-hidden flex items-end justify-center relative"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                backgroundSize: '10px 10px',
                backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
              }}
            >
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={fullName || 'Foto Dewan'}
                  className="w-full h-full object-contain object-bottom drop-shadow-sm"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-1 text-center">
                  <User className="h-6 w-6 text-slate-400 stroke-1" />
                  <span className="text-[9px] text-slate-400 font-bold mt-0.5">No-Bg PNG</span>
                </div>
              )}
            </div>

            {photoUrl && (
              <div className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                <CheckCircle2 className="h-3 w-3" />
              </div>
            )}
          </div>

          {/* DETAIL IDENTITAS & ACTION BUTTONS */}
          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
            {/* BADGES & ACTIONS HEADER */}
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold flex items-center gap-1">
                  <Landmark className="h-2.5 w-2.5" />
                  <span>{selectedRole?.label || 'Anggota Legislatif'}</span>
                </span>

                {partyAffiliation && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                    {partyAffiliation}
                  </span>
                )}

                {commissionName && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-semibold flex items-center gap-1">
                    <span>{commissionName}</span>
                  </span>
                )}

                <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  <span>Terverifikasi</span>
                </span>
              </div>

              {/* ACTION BUTTONS (INLINE DI ATAS KANAN AGAR TIDAK MAKAN TEMPAT) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  onClick={onEditClick}
                  className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs h-7 px-3 rounded-lg gap-1 shadow-2xs cursor-pointer"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit Profil</span>
                </Button>

                {subdomain && (
                  <a
                    href={portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                  >
                    <Globe className="h-3 w-3 text-primary" />
                    <span>Portal</span>
                    <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                  </a>
                )}
              </div>
            </div>

            {/* NAMA & DAPIL */}
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {fullName || 'Nama Anggota Dewan'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                <span>
                  Daerah Pemilihan <strong className="text-slate-700 dark:text-slate-200">{dapilName || 'Belum diatur'}</strong> • {provinceName}
                </span>
              </p>
            </div>

            {/* QUICK METAS ROW (COMPACT) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-left pt-0.5">
              <div className="p-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] text-slate-400 font-bold uppercase block leading-none">Umur / Lahir</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                  {age !== null ? `${age} Thn` : '-'}
                  {birthDate ? ` (${formatIndoDate(birthDate)})` : ''}
                </span>
              </div>

              <div className="p-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] text-slate-400 font-bold uppercase block leading-none">Jenis Kelamin</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                  {gender === 'LAKI_LAKI' ? 'Laki-laki' : gender === 'PEREMPUAN' ? 'Perempuan' : '-'}
                </span>
              </div>

              <div className="p-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] text-slate-400 font-bold uppercase block leading-none">No. WhatsApp</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                  {phoneNumber || '-'}
                </span>
              </div>

              <div className="p-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] text-slate-400 font-bold uppercase block leading-none">Email Akun</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                  {email || 'dewan@dpr.go.id'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. GRID DETAILS (2 KOLOM RAPAT, GAP-3) */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* WILAYAH KERJA & BASIS DAPIL */}
        <Card className="p-3.5 space-y-2.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>Wilayah Kerja & Dapil</span>
            </h3>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold">
              {dapilCode || 'DAPIL'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 p-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[9px] text-slate-400 block font-semibold">Provinsi</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{provinceName}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-semibold">Nama Dapil</span>
                <span className="font-bold text-primary">{dapilName}</span>
              </div>
            </div>

            <div>
              <span className="text-[9px] text-slate-400 block mb-1 font-bold uppercase">
                Cakupan Kabupaten / Kota ({regencyCoverage.length}):
              </span>
              <div className="flex flex-wrap gap-1">
                {regencyCoverage.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                  >
                    <MapPin className="h-2.5 w-2.5 text-primary" />
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
        <Card className="p-3.5 space-y-2.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <BrainCircuit className="h-3.5 w-3.5 text-primary" />
              <span>Minat Isu & Fokus Riset AI</span>
            </h3>
            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-bold">
              {issueInterests.length} Isu
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Topik ini memandu agen AI POLARIS mencari data perda, berita, dan statistik konstituen:
            </p>

            <div className="flex flex-wrap gap-1">
              {issueInterests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold"
                >
                  <Sparkles className="h-2.5 w-2.5 text-primary" />
                  <span>{interest}</span>
                </span>
              ))}

              {issueInterests.length === 0 && (
                <span className="text-xs text-slate-400 italic">Belum memilih topik minat isu.</span>
              )}
            </div>
          </div>
        </Card>

        {/* KREDENSIAL PENDIDIKAN RESMI */}
        <Card className="p-3.5 space-y-2.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <School className="h-3.5 w-3.5 text-primary" />
              <span>Riwayat Pendidikan Resmi</span>
            </h3>
            <button
              onClick={onEditClick}
              className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
            >
              Ubah
            </button>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
            {education ? (
              <span className="font-semibold text-slate-900 dark:text-white whitespace-pre-line">{education}</span>
            ) : (
              <span className="text-slate-400 italic">Riwayat pendidikan belum diisi.</span>
            )}
          </div>
        </Card>

        {/* KURSUS & PELATIHAN KEPEMIMPINAN */}
        <Card className="p-3.5 space-y-2.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs rounded-xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-primary" />
              <span>Kursus & Diklat Parlemen ({courses.length})</span>
            </h3>
            <button
              onClick={onEditClick}
              className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
            >
              Ubah
            </button>
          </div>

          <div className="flex flex-wrap gap-1">
            {courses.map((course) => (
              <span
                key={course}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold"
              >
                <BookOpen className="h-2.5 w-2.5 text-primary" />
                <span>{course}</span>
              </span>
            ))}

            {courses.length === 0 && (
              <span className="text-xs text-slate-400 italic">
                Belum mencantumkan pelatihan kepemimpinan.
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
