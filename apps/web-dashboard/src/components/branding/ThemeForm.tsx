'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Save,
  Lock,
  RotateCcw,
  Palette,
  Paintbrush,
  Check,
  CheckCircle2,
  Sparkles,
  User,
  Globe,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Upload,
  RefreshCw,
  Layout,
  Layers,
  ChevronRight,
  Info,
  Camera,
  Compass,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';
import { cn } from '@/lib/utils';
import { TemplateLayoutSelector, TEMPLATE_LAYOUTS } from './TemplateLayoutSelector';
import { DomainManagementPanel } from './DomainManagementPanel';
import { getRootDomain } from '@/lib/urls';

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
}

export const CURATED_PALETTES: ColorPalette[] = [
  { name: 'Biru Polaris', primary: '#3B82F6', secondary: '#0F172A' },
  { name: 'Cyan Samudra', primary: '#06B6D4', secondary: '#0B132B' },
  { name: 'Biru Safir', primary: '#4F46E5', secondary: '#1E1B4B' },
  { name: 'Zamrud Hijau', primary: '#10B981', secondary: '#062C22' },
  { name: 'Hijau Pinus', primary: '#059669', secondary: '#0A1628' },
  { name: 'Delima Merah', primary: '#EF4444', secondary: '#1F1117' },
  { name: 'Oranye Senja', primary: '#F97316', secondary: '#1A1423' },
  { name: 'Ungu Royal', primary: '#8B5CF6', secondary: '#170F2E' },
  { name: 'Magenta Modern', primary: '#D946EF', secondary: '#1F0B24' },
  { name: 'Rose Pink', primary: '#EC4899', secondary: '#1C0F1A' },
  { name: 'Emas Elegan', primary: '#EAB308', secondary: '#1C1907' },
  { name: 'Teal Modern', primary: '#14B8A6', secondary: '#0F1E1E' },
];

export const PARTY_PRESETS: ColorPalette[] = [
  { name: 'Golkar', primary: '#F5B800', secondary: '#001529' },
  { name: 'PDI Perjuangan', primary: '#D60000', secondary: '#1A1A1A' },
  { name: 'Gerindra', primary: '#C92A2A', secondary: '#1E293B' },
  { name: 'NasDem', primary: '#0A2558', secondary: '#F26522' },
  { name: 'PKB', primary: '#008242', secondary: '#0D1117' },
  { name: 'PKS', primary: '#FF6600', secondary: '#1A1A1A' },
  { name: 'Demokrat', primary: '#0047AB', secondary: '#0F172A' },
  { name: 'PAN', primary: '#003399', secondary: '#111827' },
];

export const DEFAULT_WEBSITE_COLORS = {
  primary: '#1890FF',
  secondary: '#001529',
};

export type FormSectionTab = 'colors' | 'templates' | 'profile' | 'domain' | 'all';

export interface VisionMissionItem {
  title: string;
  subtitle?: string;
  description: string;
}

export interface CareerItem {
  role: string;
  period?: string;
  description: string;
}

interface ThemeFormProps {
  primaryColor: string;
  onPrimaryColorChange: (val: string) => void;
  secondaryColor: string;
  onSecondaryColorChange: (val: string) => void;
  layoutTemplateId?: string;
  onLayoutTemplateIdChange?: (val: string) => void;
  planTier?: string | null;
  officialPhotoUrl: string;
  onOfficialPhotoUrlChange: (val: string) => void;
  profilePhotoUrl?: string;
  headlineTagline: string;
  onHeadlineTaglineChange: (val: string) => void;
  bioBiography: string;
  onBioBiographyChange: (val: string) => void;
  subdomainSlug: string;
  onSubdomainSlugChange: (val: string) => void;
  customDomain: string;
  onCustomDomainChange: (val: string) => void;
  isUnpaid: boolean;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  partyPresets?: ColorPalette[];
  visionMission?: VisionMissionItem[];
  onVisionMissionChange?: (items: VisionMissionItem[]) => void;
  careers?: CareerItem[];
  onCareersChange?: (items: CareerItem[]) => void;
  profileEducation?: string;
  profileCourses?: string[];
  onDomainUpdated?: () => void;
}

export function ThemeForm({
  primaryColor,
  onPrimaryColorChange,
  secondaryColor,
  onSecondaryColorChange,
  layoutTemplateId = 'standard-default',
  onLayoutTemplateIdChange,
  planTier,
  officialPhotoUrl,
  onOfficialPhotoUrlChange,
  profilePhotoUrl,
  headlineTagline,
  onHeadlineTaglineChange,
  bioBiography,
  onBioBiographyChange,
  subdomainSlug,
  onSubdomainSlugChange,
  customDomain,
  onCustomDomainChange,
  isUnpaid,
  saving,
  onSubmit,
  visionMission,
  onVisionMissionChange,
  careers,
  onCareersChange,
  profileEducation,
  profileCourses,
  onDomainUpdated,
}: ThemeFormProps) {
  const [activeTab, setActiveTab] = useState<FormSectionTab>('colors');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const effectivePhoto = officialPhotoUrl || profilePhotoUrl || '';

  const defaultVisionMission: VisionMissionItem[] = useMemo(() => [
    {
      title: 'Fungsi Legislasi',
      subtitle: 'Legislasikan Solusi Nyata',
      description: 'Mengawal penyusunan regulasi yang berpihak pada kesejahteraan rakyat, UMKM, dan kepastian hukum.',
    },
    {
      title: 'Fungsi Anggaran',
      subtitle: 'Pengawasan Anggaran Transparan',
      description: 'Memastikan alokasi belanja anggaran terealisasi tepat sasaran dan bebas dari inefisiensi.',
    },
    {
      title: 'Fungsi Representasi',
      subtitle: 'Pendampingan Konstituen Berkelanjutan',
      description: 'Menjaga interaksi langsung bersama warga melalui reses reguler dan advokasi aspirasi.',
    },
  ], []);

  const currentVisionMission = visionMission && visionMission.length > 0 ? visionMission : defaultVisionMission;
  const currentCareers = careers || [];

  const handleUpdatePillar = (index: number, field: keyof VisionMissionItem, val: string) => {
    const updated = currentVisionMission.map((item, i) => (i === index ? { ...item, [field]: val } : item));
    onVisionMissionChange?.(updated);
  };

  const handleAddCareer = () => {
    const newCareer: CareerItem = {
      role: 'Penugasan / Jabatan Baru',
      period: '2024 – Sekarang',
      description: 'Deskripsi tugas, alat kelengkapan dewan, atau rekam jejak...',
    };
    onCareersChange?.([...currentCareers, newCareer]);
  };

  const handleUpdateCareer = (index: number, field: keyof CareerItem, val: string) => {
    const updated = currentCareers.map((item, i) => (i === index ? { ...item, [field]: val } : item));
    onCareersChange?.(updated);
  };

  const handleRemoveCareer = (index: number) => {
    const updated = currentCareers.filter((_, i) => i !== index);
    onCareersChange?.(updated);
  };

  useEffect(() => {
    if (!officialPhotoUrl && profilePhotoUrl) {
      onOfficialPhotoUrlChange(profilePhotoUrl);
    }
  }, [officialPhotoUrl, profilePhotoUrl, onOfficialPhotoUrlChange]);

  const activeTemplate = useMemo(() => {
    return TEMPLATE_LAYOUTS.find((tpl) => tpl.id === layoutTemplateId) || TEMPLATE_LAYOUTS[0];
  }, [layoutTemplateId]);

  const handleDirectFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Format berkas wajib berupa gambar (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onOfficialPhotoUrlChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  function applyPreset(p: ColorPalette) {
    onPrimaryColorChange(p.primary);
    onSecondaryColorChange(p.secondary);
  }

  function handleResetWebsiteDefaults() {
    onPrimaryColorChange(DEFAULT_WEBSITE_COLORS.primary);
    onSecondaryColorChange(DEFAULT_WEBSITE_COLORS.secondary);
  }

  /* ─────────────────────────────────────────────────────────────
     SUB-COMPONENTS FOR CLEAN SECTION MODULARITY
     ───────────────────────────────────────────────────────────── */

  // 1. COLORS SECTION
  const renderColorsSection = () => (
    <div className="space-y-6">
      {/* HEADER: TITLE & RESET BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="h-4 w-4" style={{ color: primaryColor }} />
            Skema Warna Website Publik
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pilih warna resmi partai atau palet terkurasi untuk publikasi portal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetWebsiteDefaults}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs transition-all shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="h-3 w-3 text-slate-500" />
          <span>Reset Warna Default</span>
        </button>
      </div>

      {/* STATUS WARNA TERPILIH */}
      <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-xl shadow-inner border border-black/10 shrink-0"
            style={{ backgroundColor: primaryColor }}
          />
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">
              Aksen Utama Web
            </span>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
              {primaryColor.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="h-7 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-xl shadow-inner border border-black/10 shrink-0"
            style={{ backgroundColor: secondaryColor }}
          />
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">
              Warna Header/Nav
            </span>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
              {secondaryColor.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION: PALET WARNA TERKURASI (1-KLIK) */}
      <div className="space-y-2.5">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <Paintbrush className="h-3.5 w-3.5" style={{ color: primaryColor }} />
            Palet Warna Terkurasi Website
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Kombinasi warna website resmi — klik langsung terlihat di simulator sebelah kanan.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {CURATED_PALETTES.map((p) => {
            const active =
              primaryColor.toLowerCase() === p.primary.toLowerCase() &&
              secondaryColor.toLowerCase() === p.secondary.toLowerCase();

            return (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className={cn(
                  'group relative flex flex-col items-center gap-1 px-2.5 py-2.5 rounded-xl border text-center transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer',
                  active
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div className="flex items-center gap-0.5">
                  <div
                    className="h-5 w-5 rounded-l-md shadow-xs border border-black/10"
                    style={{ backgroundColor: p.primary }}
                  />
                  <div
                    className="h-5 w-5 rounded-r-md shadow-xs border border-black/10"
                    style={{ backgroundColor: p.secondary }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full mt-0.5">
                  {p.name}
                </span>
                {active && (
                  <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-blue-600 flex items-center justify-center shadow-xs">
                    <Check className="h-2 w-2 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION: PRECISION COLOR PICKER */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowCustomPicker(!showCustomPicker)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed transition-all cursor-pointer',
            showCustomPicker
              ? 'border-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-400 via-violet-500 to-cyan-400 flex items-center justify-center shadow-xs shrink-0">
              <Palette className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-extrabold text-slate-900 dark:text-white">
                Pilih Warna Kustom Presisi (Color Picker)
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                Sesuaikan rona dan saturasi warna secara presisi menggunakan spektrum interaktif.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50">
            {showCustomPicker ? 'Tutup Picker ▲' : 'Buka Color Picker ▼'}
          </span>
        </button>

        {showCustomPicker && (
          <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
            <ColorPicker
              label="🎨 Warna Utama Website"
              value={primaryColor}
              onChange={(hex) => onPrimaryColorChange(hex.toUpperCase())}
            />
            <ColorPicker
              label="🌙 Warna Header / Panel"
              value={secondaryColor}
              onChange={(hex) => onSecondaryColorChange(hex.toUpperCase())}
            />
          </div>
        )}
      </div>

      {/* SECTION: PRESET PARTAI POLITIK */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
          🏛️ Preset Resmi Partai Politik
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PARTY_PRESETS.map((p) => {
            const active =
              primaryColor.toLowerCase() === p.primary.toLowerCase() &&
              secondaryColor.toLowerCase() === p.secondary.toLowerCase();

            return (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className={cn(
                  'group relative flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer',
                  active
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div className="flex items-center gap-0.5 shrink-0">
                  <div
                    className="h-5 w-5 rounded-l-md shadow-xs border border-black/10"
                    style={{ backgroundColor: p.primary }}
                  />
                  <div
                    className="h-5 w-3 rounded-r-sm shadow-xs border border-black/10"
                    style={{ backgroundColor: p.secondary }}
                  />
                </div>
                <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 truncate">
                  {p.name}
                </span>
                {active && (
                  <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-blue-600 flex items-center justify-center shadow-xs">
                    <Check className="h-2 w-2 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // 2. TEMPLATES SECTION
  const renderTemplatesSection = () => (
    <div className="space-y-4">
      <TemplateLayoutSelector
        selectedTemplateId={layoutTemplateId}
        onSelectTemplate={(id) => onLayoutTemplateIdChange?.(id)}
        planTier={planTier}
      />
    </div>
  );

  // 3. PROFILE & IDENTITY SECTION
  const renderProfileSection = () => (
    <div className="space-y-4">
      {/* SECTION TITLE */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Identitas & Konten Website Dewan</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola foto profil resmi, tagline visi perjuangan, dan biografi narasi publikasi portal.
          </p>
        </div>
      </div>

      {/* ─── KARTU FOTO RESMI DEWAN ─── */}
      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
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
              <span>Belum Ada Foto</span>
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

        {effectivePhoto ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-2xs">
            {/* Image Preview with Hover Action */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-32 sm:w-24 sm:h-32 shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 shadow-sm group cursor-pointer"
              title="Klik untuk ganti foto langsung"
            >
              <img
                src={effectivePhoto}
                alt="Foto Resmi Dewan"
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-1">
                <Camera className="w-4 h-4" />
                <span className="text-[9px] font-bold text-center">Ganti Foto</span>
              </div>
            </div>

            {/* Content & Actions */}
            <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Tampilan Visual Hero & Baliho Beranda
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Foto ini ditampilkan secara otomatis pada banner hero beranda, kartu risalah kebijakan, dan halaman profil publik.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
                >
                  <Upload className="h-3 w-3 text-slate-500" />
                  <span>Unggah Foto Baru</span>
                </button>

                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Menu Profil</span>
                </Link>

                {profilePhotoUrl && officialPhotoUrl && officialPhotoUrl !== profilePhotoUrl && (
                  <button
                    type="button"
                    onClick={() => onOfficialPhotoUrlChange(profilePhotoUrl)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Kembalikan ke foto profil utama"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Pulihkan Foto Asli</span>
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
                Foto Belum Diatur
              </h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Unggah foto jas/peci resmi untuk ditampilkan di baliho beranda.
              </p>
            </div>
            <div className="pt-1 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-all cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Pilih Foto dari Perangkat</span>
              </button>
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
      </div>

      {/* ─── KONTEN NARASI & VISI PUBLIK ─── */}
      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-4">
        {/* TAGLINE VISI KEBIJAKAN */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span>Tagline Visi Kebijakan</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {headlineTagline.length} karakter
            </span>
          </div>
          <input
            type="text"
            required
            placeholder="Contoh: Mengawal aspirasi rakyat demi kemakmuran dan keadilan daerah."
            value={headlineTagline}
            onChange={(e) => onHeadlineTaglineChange(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all shadow-2xs"
          />
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
            Tampil sebagai kutipan komitmen pembuka berwibawa di banner hero beranda.
          </p>
        </div>

        {/* BIOGRAFI & NARASI PENGABDIAN DEWAN */}
        <div className="space-y-2 pt-3 border-t border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
              <FileText className="h-3.5 w-3.5 text-blue-500" />
              <span>Biografi & Narasi Pengabdian Dewan</span>
            </label>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span>{bioBiography.split('\n\n').filter((p) => p.trim()).length || 1} Paragraf</span>
              <span>•</span>
              <span>{bioBiography.length} karakter</span>
            </div>
          </div>
          <textarea
            rows={5}
            required
            placeholder="Tuliskan latar belakang pendidikan, nilai perjuangan, kisah pengabdian, dan komitmen legislasi Anda... (Tekan Enter 2x untuk membuat paragraf baru yang rapi di website)."
            value={bioBiography}
            onChange={(e) => onBioBiographyChange(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 p-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all shadow-2xs resize-y leading-relaxed font-sans"
          />
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px]">
            <Lightbulb className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>
              <strong>Tips Penulisan Parlemen:</strong> Pisahkan antar-paragraf dengan menekan <em>Enter 2 kali</em> agar di website publik otomatis tampil berjarak rapi dan mudah dibaca oleh warga.
            </span>
          </div>
        </div>
      </div>

      {/* ─── PILAR FOKUS & KOMITMEN PENGABDIAN (3 PILAR PARLEMEN) ─── */}
      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
              <Compass className="h-3.5 w-3.5 text-amber-500" />
              <span>3 Pilar Fokus Pengabdian Parlemen</span>
            </h4>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
              Ditampilkan secara elegan dalam kartu 3 pilar komitmen pada halaman Profil publik dewan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentVisionMission.map((pillar, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center text-[9px] font-bold">
                    {idx + 1}
                  </span>
                  <span>Pilar Ke-{idx + 1}</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                    Label Fungsi
                  </label>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) => handleUpdatePillar(idx, 'title', e.target.value)}
                    placeholder="Contoh: Fungsi Legislasi"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                    Judul Komitmen
                  </label>
                  <input
                    type="text"
                    value={pillar.subtitle || ''}
                    onChange={(e) => handleUpdatePillar(idx, 'subtitle', e.target.value)}
                    placeholder="Contoh: Legislasikan Solusi Nyata"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">
                  Uraian Perjuangan
                </label>
                <textarea
                  rows={2}
                  value={pillar.description}
                  onChange={(e) => handleUpdatePillar(idx, 'description', e.target.value)}
                  placeholder="Uraian komitmen nyata Anda untuk fungsi ini..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-normal focus:border-blue-600 focus:outline-none resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── RIWAYAT PENUGASAN & REKAM JEJAK KARIR (DINAMIS) ─── */}
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
            size="sm"
            onClick={handleAddCareer}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold h-7 px-2.5 rounded-lg gap-1 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3 h-3" />
            <span>Tambah Jabatan</span>
          </Button>
        </div>

        {currentCareers.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Belum ada riwayat penugasan kustom ditambahkan.
            </p>
            <p className="text-[11px] text-slate-400">
              Website publik saat ini akan menampilkan penugasan komisi & fraksi resmi secara otomatis.
            </p>
            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCareer}
                className="text-xs font-bold gap-1 cursor-pointer h-7 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Penugasan Pertama</span>
              </Button>
            </div>
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

      {/* ─── KREDENSIAL PENDIDIKAN & KURSUS RESMI (TERINTEGRASI) ─── */}
      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-emerald-500" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Kredensial Pendidikan Formal & Kursus
            </h4>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <span>Ubah di Menu Profil</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Pendidikan Terdaftar
            </span>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {profileEducation || (
                <span className="text-slate-400 italic">Belum mengisi riwayat pendidikan resmi.</span>
              )}
            </p>
          </div>

          {profileCourses && profileCourses.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Diklat & Kursus Parlemen
              </span>
              <div className="flex flex-wrap gap-1">
                {profileCourses.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 4. DOMAIN & WEB ADDRESS SECTION (ALUR PENGAJUAN TERKELOLA)
  const renderDomainSection = () => (
    <DomainManagementPanel
      currentSubdomain={subdomainSlug}
      currentCustomDomain={customDomain}
      onDomainUpdated={onDomainUpdated}
    />
  );

  return (
    <Card className="w-full space-y-6 p-5 sm:p-7 shadow-xs">
      {/* ─── BANNER UNPAID ─── */}
      {isUnpaid && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-extrabold text-xs">Mode Pratinjau (Simpan Tema Terkunci)</span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
            Eksplorasi kombinasi warna dan tata letak dapat disimulasikan secara real-time pada simulator di samping. Selesaikan aktivasi lisensi untuk menyinkronkan tema ke website publik resmi.
          </p>
          <Link href="/billing" className="block pt-1">
            <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-sm">
              <Lock className="h-3.5 w-3.5" />
              <span>Aktifkan Lisensi Akun</span>
            </Button>
          </Link>
        </div>
      )}

      {/* ─── TOP STUDIO QUICK STATUS & ACTION BAR ─── */}
      <div className="flex items-center gap-2.5 p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center -space-x-1 shrink-0">
          <span
            className="w-4 h-4 rounded-full border border-white dark:border-slate-800 shadow-2xs"
            style={{ backgroundColor: primaryColor }}
            title={`Aksen: ${primaryColor}`}
          />
          <span
            className="w-4 h-4 rounded-full border border-white dark:border-slate-800 shadow-2xs"
            style={{ backgroundColor: secondaryColor }}
            title={`Header: ${secondaryColor}`}
          />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">
            Template Terpilih
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block mt-0.5">
            {activeTemplate.name}
          </span>
        </div>
      </div>

      {/* ─── STUDIO SECTION SUB-TABS (CLEAN SEGMENTED GRID - NO HORIZONTAL SCROLLBAR) ─── */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          className={cn(
            'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center',
            activeTab === 'colors'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <Palette className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Warna</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={cn(
            'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center',
            activeTab === 'templates'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <Layout className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Layout</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={cn(
            'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center',
            activeTab === 'profile'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Profil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('domain')}
          className={cn(
            'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center',
            activeTab === 'domain'
              ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Domain</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={cn(
            'hidden sm:flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center',
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          )}
          title="Tampilkan semua pengaturan sekaligus"
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Semua</span>
        </button>
      </div>

      {/* ─── TAB CONTENT PANELS ─── */}
      <div className="pt-1">
        {activeTab === 'colors' && renderColorsSection()}
        {activeTab === 'templates' && renderTemplatesSection()}
        {activeTab === 'profile' && renderProfileSection()}
        {activeTab === 'domain' && renderDomainSection()}
        {activeTab === 'all' && (
          <div className="space-y-8 divide-y divide-slate-100 dark:divide-slate-800">
            {renderColorsSection()}
            <div className="pt-6">{renderTemplatesSection()}</div>
            <div className="pt-6">{renderProfileSection()}</div>
            <div className="pt-6">{renderDomainSection()}</div>
          </div>
        )}
      </div>

    </Card>
  );
}

