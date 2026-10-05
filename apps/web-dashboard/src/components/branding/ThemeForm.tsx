'use client';

import { useState } from 'react';
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
  Sparkles,
  User,
  Globe,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';
import { cn } from '@/lib/utils';

interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
}

const CURATED_PALETTES: ColorPalette[] = [
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

const PARTY_PRESETS: ColorPalette[] = [
  { name: 'Golkar', primary: '#F5B800', secondary: '#001529' },
  { name: 'PDI Perjuangan', primary: '#D60000', secondary: '#1A1A1A' },
  { name: 'Gerindra', primary: '#C92A2A', secondary: '#1E293B' },
  { name: 'NasDem', primary: '#0A2558', secondary: '#F26522' },
  { name: 'PKB', primary: '#008242', secondary: '#0D1117' },
  { name: 'PKS', primary: '#FF6600', secondary: '#1A1A1A' },
  { name: 'Demokrat', primary: '#0047AB', secondary: '#0F172A' },
  { name: 'PAN', primary: '#003399', secondary: '#111827' },
];

const DEFAULT_WEBSITE_COLORS = {
  primary: '#1890FF',
  secondary: '#001529',
};

interface ThemeFormProps {
  primaryColor: string;
  onPrimaryColorChange: (val: string) => void;
  secondaryColor: string;
  onSecondaryColorChange: (val: string) => void;
  officialPhotoUrl: string;
  onOfficialPhotoUrlChange: (val: string) => void;
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
}

export function ThemeForm({
  primaryColor,
  onPrimaryColorChange,
  secondaryColor,
  onSecondaryColorChange,
  officialPhotoUrl,
  onOfficialPhotoUrlChange,
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
}: ThemeFormProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  function applyPreset(p: ColorPalette) {
    onPrimaryColorChange(p.primary);
    onSecondaryColorChange(p.secondary);
  }

  function handleResetWebsiteDefaults() {
    onPrimaryColorChange(DEFAULT_WEBSITE_COLORS.primary);
    onSecondaryColorChange(DEFAULT_WEBSITE_COLORS.secondary);
  }

  return (
    <Card className="lg:col-span-6 space-y-7 p-6 sm:p-7">
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

      {/* ─── HEADER: TITLE & RESET BUTTON ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="h-4 w-4" style={{ color: primaryColor }} />
            Skema Warna Website Publik
          </h2>
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

      {/* ─── STATUS WARNA TERPILIH ─── */}
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

      {/* ─── SECTION 1: PALET WARNA TERKURASI (1-KLIK) ─── */}
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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

      {/* ─── SECTION 1: PRECISION COLOR PICKER (PLACED DIRECTLY BELOW PREVIEW) ─── */}
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

      {/* ─── SECTION 2: PRESET PARTAI POLITIK ─── */}
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

      {/* ─── SECTION 4: FOTO BALIHO & TAGLINE PROFIL ─── */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
            URL Foto Resmi Dewan (Format Portrait)
          </label>
          <input
            type="url"
            placeholder="https://assets.polaris.id/official-photo.webp"
            value={officialPhotoUrl}
            onChange={(e) => onOfficialPhotoUrlChange(e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Gunakan foto formal resolusi tinggi dengan latar belakang bersih.
          </p>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            Tagline Visi Kebijakan
          </label>
          <input
            type="text"
            required
            placeholder="Mengawal aspirasi rakyat demi kemakmuran dan keadilan daerah."
            value={headlineTagline}
            onChange={(e) => onHeadlineTaglineChange(e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-blue-500" />
            Biografi Singkat Dewan
          </label>
          <textarea
            rows={4}
            required
            placeholder="Riwayat pengabdian, komisi, fokus perjuangan legislasi, dan latar belakang profesional..."
            value={bioBiography}
            onChange={(e) => onBioBiographyChange(e.target.value)}
            className="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* ─── SECTION 5: DOMAIN SETTINGS ─── */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-blue-500" />
            Subdomain Polaris.id
          </label>
          <div className="mt-1.5 flex items-center">
            <input
              type="text"
              required
              value={subdomainSlug}
              onChange={(e) => onSubdomainSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="block w-full rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white"
            />
            <span className="inline-flex items-center px-4 py-2.5 rounded-r-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
              .polaris.id
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block">
            Custom Domain Pribadi (Opsional)
          </label>
          <input
            type="text"
            placeholder="achmadfauzi.id"
            value={customDomain}
            onChange={(e) => onCustomDomainChange(e.target.value.toLowerCase().trim())}
            className="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Arahkan CNAME domain ke: <code className="font-bold text-blue-600 dark:text-blue-400">cname.polaris.id</code>
          </p>
        </div>
      </div>

      {/* ─── ACTION SUBMIT BUTTON ─── */}
      <div className="pt-2">
        {isUnpaid ? (
          <Link href="/billing" className="block w-full">
            <Button
              type="button"
              size="lg"
              className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white shadow-md gap-2"
            >
              <Lock className="h-4 w-4 text-amber-400" />
              <span>Aktivasi Lisensi untuk Menyimpan Tema</span>
            </Button>
          </Link>
        ) : (
          <Button
            type="submit"
            disabled={saving}
            loading={saving}
            size="lg"
            className="w-full shadow-lg text-white font-extrabold cursor-pointer hover:opacity-90 transition-all"
            style={{
              backgroundColor: primaryColor,
              boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
            }}
          >
            <Save className="h-4 w-4" />
            <span>Simpan Konfigurasi Branding Website</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
