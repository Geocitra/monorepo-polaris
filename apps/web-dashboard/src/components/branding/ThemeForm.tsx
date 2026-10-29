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
  Images,
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
  Loader2,
  MapPin,
  Calendar,
  Landmark,
  Building2,
  Users,
} from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';
import { cn } from '@/lib/utils';
import { TemplateLayoutSelector, TEMPLATE_LAYOUTS } from './TemplateLayoutSelector';
import { PortalTemplateId, TEMPLATE_DEFAULT_COLORS } from '@polaris/shared-types';
import { removeImageBackground } from '@/lib/background-removal';

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

export const DEFAULT_VISION_MISSION: VisionMissionItem[] = [
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
];

export interface CareerItem {
  role: string;
  period?: string;
  description: string;
}

export interface PerformanceActivityItem {
  id?: string;
  title: string;
  date?: string;
  location?: string;
  description: string;
  photoUrl?: string;
}

export interface CommissionAssignment {
  name?: string;
  role?: string;
  scope?: string;
  partners?: string;
}

export interface AkdBodyItem {
  id?: string;
  name: string;
  role: string;
  notes?: string;
}

export interface ParliamentaryAssignment {
  commission?: CommissionAssignment;
  factionRole?: string;
  akdBodies?: AkdBodyItem[];
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
  photoGallery?: string[];
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
  activities?: PerformanceActivityItem[];
  onActivitiesChange?: (items: PerformanceActivityItem[]) => void;
  akdAssignment?: ParliamentaryAssignment;
  onAkdAssignmentChange?: (val: ParliamentaryAssignment) => void;
  memberCommissionName?: string;
  partyAffiliation?: string;
  profileEducation?: string;
  profileCourses?: string[];
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
  photoGallery = [],
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
  activities,
  onActivitiesChange,
  akdAssignment,
  onAkdAssignmentChange,
  memberCommissionName,
  partyAffiliation,
  profileEducation,
  profileCourses,
}: ThemeFormProps) {
  const [activeTab, setActiveTab] = useState<FormSectionTab>('colors');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [showCatalogSelector, setShowCatalogSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const effectivePhoto = officialPhotoUrl || profilePhotoUrl || '';

  // Gabungkan seluruh foto yang tersedia dari Profil Utama, Katalog Foto, dan Foto Resmi yang sudah diunggah
  const allAvailablePhotos = useMemo(() => {
    const list: { url: string; label: string; isPrimaryProfile?: boolean }[] = [];
    const seen = new Set<string>();

    // 1. Tambahkan foto profil utama dewan jika ada
    if (profilePhotoUrl && profilePhotoUrl.trim()) {
      seen.add(profilePhotoUrl.trim());
      list.push({
        url: profilePhotoUrl.trim(),
        label: 'Foto Profil Utama',
        isPrimaryProfile: true,
      });
    }

    // 2. Tambahkan seluruh foto dari katalog dewan (photoGallery)
    if (Array.isArray(photoGallery)) {
      photoGallery.forEach((url, idx) => {
        if (url && typeof url === 'string' && url.trim() && !seen.has(url.trim())) {
          seen.add(url.trim());
          list.push({
            url: url.trim(),
            label: `Katalog #${idx + 1}`,
            isPrimaryProfile: false,
          });
        }
      });
    }

    // 3. Tambahkan officialPhotoUrl jika ada foto kustom yang diunggah langsung dan belum ada di list
    if (officialPhotoUrl && officialPhotoUrl.trim() && !seen.has(officialPhotoUrl.trim())) {
      seen.add(officialPhotoUrl.trim());
      list.push({
        url: officialPhotoUrl.trim(),
        label: 'Foto Unggahan Mandiri',
        isPrimaryProfile: false,
      });
    }

    return list;
  }, [profilePhotoUrl, photoGallery, officialPhotoUrl]);

  const currentVisionMission = visionMission && visionMission.length > 0 ? visionMission : DEFAULT_VISION_MISSION;

  useEffect(() => {
    if ((!visionMission || visionMission.length === 0) && onVisionMissionChange) {
      onVisionMissionChange(DEFAULT_VISION_MISSION);
    }
  }, [visionMission, onVisionMissionChange]);

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

  const currentActivities = activities || [];

  const handleAddActivity = () => {
    const newAct: PerformanceActivityItem = {
      title: '',
      date: '',
      location: '',
      description: '',
      photoUrl: '',
    };
    onActivitiesChange?.([...currentActivities, newAct]);
  };

  const handleUpdateActivity = (index: number, field: keyof PerformanceActivityItem, val: string) => {
    const updated = currentActivities.map((item, i) => (i === index ? { ...item, [field]: val } : item));
    onActivitiesChange?.(updated);
  };

  const handleRemoveActivity = (index: number) => {
    const updated = currentActivities.filter((_, i) => i !== index);
    onActivitiesChange?.(updated);
  };

  const handleActivityFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
        handleUpdateActivity(index, 'photoUrl', dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const currentAkdAssignment: ParliamentaryAssignment = useMemo(() => {
    return akdAssignment || {
      commission: {
        name: memberCommissionName || '',
        role: 'Anggota Komisi',
        scope: '',
        partners: '',
      },
      factionRole: '',
      akdBodies: [],
    };
  }, [akdAssignment, memberCommissionName]);

  const handleUpdateCommission = (field: keyof CommissionAssignment, val: string) => {
    const currentComm = currentAkdAssignment.commission || {
      name: memberCommissionName || '',
      role: 'Anggota Komisi',
      scope: '',
      partners: '',
    };
    const updated: ParliamentaryAssignment = {
      ...currentAkdAssignment,
      commission: {
        ...currentComm,
        [field]: val,
      },
    };
    onAkdAssignmentChange?.(updated);
  };

  const handleUpdateFactionRole = (val: string) => {
    onAkdAssignmentChange?.({
      ...currentAkdAssignment,
      factionRole: val,
    });
  };

  const handleAddAkdBody = (presetName?: string) => {
    const currentBodies = currentAkdAssignment.akdBodies || [];
    const newBody: AkdBodyItem = {
      id: `akd-${Date.now()}`,
      name: presetName || 'Badan Anggaran (Banggar)',
      role: 'Anggota',
      notes: '',
    };
    onAkdAssignmentChange?.({
      ...currentAkdAssignment,
      akdBodies: [...currentBodies, newBody],
    });
  };

  const handleUpdateAkdBody = (index: number, field: keyof AkdBodyItem, val: string) => {
    const currentBodies = currentAkdAssignment.akdBodies || [];
    const updated = currentBodies.map((b, i) => (i === index ? { ...b, [field]: val } : b));
    onAkdAssignmentChange?.({
      ...currentAkdAssignment,
      akdBodies: updated,
    });
  };

  const handleRemoveAkdBody = (index: number) => {
    const currentBodies = currentAkdAssignment.akdBodies || [];
    const updated = currentBodies.filter((_, i) => i !== index);
    onAkdAssignmentChange?.({
      ...currentAkdAssignment,
      akdBodies: updated,
    });
  };

  useEffect(() => {
    if (!officialPhotoUrl && profilePhotoUrl) {
      onOfficialPhotoUrlChange(profilePhotoUrl);
    }
  }, [officialPhotoUrl, profilePhotoUrl, onOfficialPhotoUrlChange]);

  const activeTemplate = useMemo(() => {
    return TEMPLATE_LAYOUTS.find((tpl) => tpl.id === layoutTemplateId) || TEMPLATE_LAYOUTS[0];
  }, [layoutTemplateId]);

  const [isProcessingDirectPhoto, setIsProcessingDirectPhoto] = useState(false);
  const [directPhotoStatus, setDirectPhotoStatus] = useState('');

  const handleDirectFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Format berkas wajib berupa gambar (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const originalData = event.target?.result as string;
      if (!originalData) return;

      setIsProcessingDirectPhoto(true);
      setDirectPhotoStatus('AI mendeteksi & menghapus background...');
      try {
        const resultUrl = await removeImageBackground(
          originalData,
          (progress: any) => {
            setDirectPhotoStatus(progress.message);
          },
          { autoUpscale: true, targetMinHeight: 1600 }
        );
        onOfficialPhotoUrlChange(resultUrl);
      } catch (err) {
        console.warn('AI background removal fallback to original:', err);
        onOfficialPhotoUrlChange(originalData);
      } finally {
        setIsProcessingDirectPhoto(false);
        setDirectPhotoStatus('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  function applyPreset(p: ColorPalette) {
    onPrimaryColorChange(p.primary);
    onSecondaryColorChange(p.secondary);
  }

  function handleResetWebsiteDefaults() {
    const tplDefault = (TEMPLATE_DEFAULT_COLORS as any)[layoutTemplateId] || DEFAULT_WEBSITE_COLORS;
    onPrimaryColorChange(tplDefault.primary);
    onSecondaryColorChange(tplDefault.secondary);
  }

  const currentTemplateDefault = (TEMPLATE_DEFAULT_COLORS as any)[layoutTemplateId] || DEFAULT_WEBSITE_COLORS;
  const isTemplateDefaultColor =
    primaryColor.toLowerCase() === currentTemplateDefault.primary.toLowerCase();

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
          title="Kembalikan warna ke skema bawaan template asli"
        >
          <RotateCcw className="h-3 w-3 text-slate-500" />
          <span>Reset Warna Default Template</span>
        </button>
      </div>

      {/* STATUS WARNA TERPILIH */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-4">
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

        {/* BADGE STATUS WARNA (DEFAULT TEMPLATE VS KUSTOM) */}
        <div>
          {isTemplateDefaultColor ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Warna Asli Template
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5" />
              Warna Kustom Aktif
            </span>
          )}
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

      {/* ─── KARTU FOTO RESMI DEWAN & KATALOG PILIHAN ─── */}
      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-4">
        {/* Header Kartu */}
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
              <span>Belum Ada Foto Terpilih</span>
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

        {/* 1. PRATINJAU FOTO TERPILIH SAAT INI (FORMAT 4:5 RESMI IDENTIK PROFIL) */}
        {effectivePhoto ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-2xs">
            {/* Image Preview with Hover Action (Rasio 4:5, contain grounded persis profil) */}
            <div
              onClick={() => setShowCatalogSelector((prev) => !prev)}
              className="relative w-24 h-30 sm:w-28 sm:h-35 shrink-0 rounded-xl overflow-hidden border-2 border-blue-600/60 dark:border-blue-500/60 bg-white dark:bg-slate-900 shadow-sm group cursor-pointer"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                backgroundSize: '10px 10px',
                backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
              }}
              title="Klik untuk membuka pilihan katalog foto atau ganti foto resmi"
            >
              <img
                src={effectivePhoto}
                alt="Foto Resmi Dewan Terpilih"
                className="w-full h-full object-contain object-bottom drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-1 z-10">
                <Images className="w-4 h-4" />
                <span className="text-[9px] font-bold text-center">Ganti Foto</span>
              </div>
              {isProcessingDirectPhoto && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px] flex flex-col items-center justify-center p-1 text-center z-20 text-white">
                  <Loader2 className="h-5 w-5 text-blue-400 animate-spin mb-1" />
                  <span className="text-[9px] font-black leading-tight">Proses AI...</span>
                </div>
              )}
              <div className="absolute bottom-1 inset-x-1 py-0.5 rounded bg-blue-600 text-[8px] font-black text-white text-center tracking-tight z-10 shadow-xs">
                FOTO AKTIF (4:5)
              </div>
            </div>

            {/* Content & Actions */}
            <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Foto Baliho & Hero Beranda Terpilih
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Dipakai di Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Foto ini ditampilkan secara otomatis pada banner hero beranda, kartu risalah kebijakan, dan halaman profil publik website dewan.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => setShowCatalogSelector((prev) => !prev)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs',
                    showCatalogSelector
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800'
                  )}
                >
                  <Images className="h-3.5 w-3.5" />
                  <span>{showCatalogSelector ? 'Tutup Pilihan Foto' : 'Ganti dari Katalog'}</span>
                  {allAvailablePhotos.length > 0 && !showCatalogSelector && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-blue-600 text-white font-extrabold ml-0.5">
                      {allAvailablePhotos.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isProcessingDirectPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {isProcessingDirectPhoto ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                      <span>{directPhotoStatus || 'Memproses AI...'}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3 text-slate-500" />
                      <span>Unggah dari Perangkat</span>
                    </>
                  )}
                </button>

                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Katalog Profil Lengkap</span>
                </Link>

                {profilePhotoUrl && officialPhotoUrl && officialPhotoUrl !== profilePhotoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      onOfficialPhotoUrlChange(profilePhotoUrl);
                      setShowCatalogSelector(false);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Gunakan foto profil utama dewan"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Pakai Foto Profil Utama</span>
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
                Belum Ada Foto Resmi Terpilih
              </h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Pilih salah satu foto dari katalog atau unggah foto jas/peci resmi baru.
              </p>
            </div>
            <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-all cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Pilih Foto dari Perangkat</span>
              </button>
              {allAvailablePhotos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCatalogSelector((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                >
                  <Images className="h-3.5 w-3.5" />
                  <span>Pilih dari Katalog ({allAvailablePhotos.length})</span>
                </button>
              )}
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

        {/* 2. SUB-SEKSI: PILIH DARI KATALOG FOTO DEWAN (HANYA MUNCUL KETIKA INGIN MENGUBAH FOTO) */}
        {showCatalogSelector && (
          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                  <Images className="h-3.5 w-3.5 text-blue-500" />
                  <span>Pilih dari Katalog Foto Dewan</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Klik salah satu foto katalog resmi di bawah ini untuk menerapkannya langsung ke website portal Anda.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {allAvailablePhotos.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80">
                    {allAvailablePhotos.length} Foto Siap Dipilih
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowCatalogSelector(false)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Tutup ✕
                </button>
              </div>
            </div>

            {allAvailablePhotos.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
                  {allAvailablePhotos.map((item, idx) => {
                    const isSelected = effectivePhoto === item.url;
                    return (
                      <div
                        key={`photo-choice-${idx}`}
                        onClick={() => onOfficialPhotoUrlChange(item.url)}
                        className={cn(
                          'group relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-200 bg-white dark:bg-slate-900 shadow-2xs',
                          isSelected
                            ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/40 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs hover:scale-[1.02]'
                        )}
                        title={isSelected ? 'Foto ini sedang aktif di website portal' : `Pilih ${item.label} sebagai foto resmi website`}
                      >
                        <div
                          className="aspect-[4/5] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 relative"
                          style={{
                            backgroundImage:
                              'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                            backgroundSize: '10px 10px',
                            backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                          }}
                        >
                          <img
                            src={item.url}
                            alt={item.label}
                            className="w-full h-full object-contain object-bottom drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Gradien halus khusus di bagian bawah agar foto tetap jernih dan teks terbaca */}
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none" />

                          {/* Label Badge di Kiri Atas */}
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold z-10">
                            {item.label}
                          </div>

                          {/* Checkmark Badge di Kanan Atas jika Terpilih */}
                          {isSelected ? (
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-black shadow-xs flex items-center gap-1 z-10">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Dipilih</span>
                            </div>
                          ) : (
                            <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/50 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <Check className="h-3 w-3" />
                            </div>
                          )}

                          {/* Bottom Status / Selection Bar */}
                          <div className="absolute bottom-1.5 inset-x-1.5 z-10">
                            {isSelected ? (
                              <div className="w-full py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black text-center shadow-xs">
                                Aktif di Website
                              </div>
                            ) : (
                              <div className="w-full py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-800 dark:text-slate-200 text-[10px] font-extrabold text-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                                Klik untuk Pilih
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Informative footer with link to Profile Catalog */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 px-0.5">
                  <span>Pilihan di atas mencakup seluruh foto dari katalog dewan dan foto profil Anda.</span>
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-bold shrink-0"
                  >
                    <span>Kelola Foto di Menu Profil</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center space-y-2">
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                  <Images className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Katalog Foto Dewan Masih Kosong
                  </h5>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Tambahkan koleksi foto resolusi tinggi di Katalog Profil Dewan agar Anda dapat dengan leluasa memilih foto terbaik untuk website Anda.
                  </p>
                </div>
                <div className="pt-1 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-all cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Unggah Foto Sekarang</span>
                  </button>
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Buka Menu Profil</span>
                  </Link>
                </div>
              </div>
            )}
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

        {/* BIOGRAFI & NARASI PENGABDIAN DEWAN (KHUSUS PROFIL) */}
        <div className="space-y-2 pt-3 border-t border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
              <FileText className="h-3.5 w-3.5 text-blue-500" />
              <span>Biografi &amp; Narasi Pengabdian Dewan</span>
              <span className="text-[10px] font-normal text-blue-600 dark:text-blue-400 normal-case">(Khusus Halaman Profil Dewan)</span>
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

      {/* ─── PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
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
                  key={aIdx}
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

      {/* ─── DOKUMENTASI KINERJA TURUN KE DAPIL ─── */}
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
                key={idx}
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

  // 4. DOMAIN & WEB ADDRESS SECTION
  const renderDomainSection = () => (
    <div className="space-y-6">
      {/* SECTION TITLE */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          Pengaturan Domain & Alamat Website
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola nama subdomain polaris.id resmi atau tautkan domain pribadi kustom Anda.
        </p>
      </div>

      {/* SUBDOMAIN */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-blue-500" />
          Subdomain Polaris.id
        </label>
        <div className="flex items-center">
          <input
            type="text"
            required
            value={subdomainSlug}
            onChange={(e) => onSubdomainSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="block w-full rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
          />
          <span className="inline-flex items-center px-4 py-2.5 rounded-r-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 select-none">
            .polaris.id
          </span>
        </div>
        <p className="text-[10.5px] text-slate-400">
          Alamat portal publik instan: <span className="font-mono text-blue-600 dark:text-blue-400">https://{subdomainSlug || 'nama'}.polaris.id</span>
        </p>
      </div>

      {/* CUSTOM DOMAIN */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block">
          Custom Domain Pribadi (Opsional)
        </label>
        <input
          type="text"
          placeholder="achmadfauzi.id"
          value={customDomain}
          onChange={(e) => onCustomDomainChange(e.target.value.toLowerCase().trim())}
          className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600"
        />
        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 flex items-start gap-2.5 mt-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Untuk menghubungkan domain pribadi, buat rekod DNS tipe <strong className="text-slate-900 dark:text-white font-mono">CNAME</strong> yang mengarah ke: <code className="font-bold text-blue-600 dark:text-blue-400">cname.polaris.id</code>
          </p>
        </div>
      </div>
    </div>
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
            Eksplorasi kombinasi warna partai dan profil dapat disimulasikan secara real-time pada simulator di samping. Selesaikan aktivasi lisensi untuk menyinkronkan tema ke website publik resmi.
          </p>
          <Link href="/billing" className="block pt-1">
            <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-sm">
              <Lock className="h-3.5 w-3.5" />
              <span>Aktifkan Lisensi Parlemen</span>
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

