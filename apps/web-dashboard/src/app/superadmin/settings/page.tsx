'use client';

import React, { useEffect, useState } from 'react';
import {
  Sliders,
  ShieldAlert,
  Instagram,
  RefreshCw,
  Info,
  ExternalLink,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FeatureFlagItem {
  flagKey: string;
  enabled: boolean;
  updatedBy?: string | null;
  updatedAt: string;
}

interface PlatformConfig {
  key: string;
  name: string;
  subtitle: string;
  description: string;
  icon: any;
  iconBg: string;
  docUrl: string;
  pricingWarning: string;
}

const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    key: 'AUTO_PUBLISH_INSTAGRAM',
    name: 'Instagram Graph API',
    subtitle: 'Feed Image, Carousel Poster & Story',
    description:
      'Jika dinonaktifkan, Dewan menggunakan Asisten Manual (Unduh Poster HD + Salin Teks Portal + Buka instagram.com). Jika diaktifkan, 1-klik auto-publish aktif via Meta Graph API.',
    icon: Instagram,
    iconBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white',
    docUrl: 'https://developers.facebook.com/docs/instagram-platform',
    pricingWarning:
      'Meta Graph API saat ini gratis untuk tier standar, namun membutuhkan Business Account dan Facebook Page terverifikasi.',
  },
  {
    key: 'AUTO_PUBLISH_THREADS',
    name: 'Threads API',
    subtitle: 'Naskah Opini & Carousel Utas Threads',
    description:
      'Jika dinonaktifkan, Dewan memposting opini secara manual ke Threads. Jika diaktifkan, opini dipublikasikan otomatis melalui Threads Webhooks & Graph API.',
    icon: () => (
      <span className="font-black text-sm tracking-tighter">@</span>
    ),
    iconBg: 'bg-black text-white dark:bg-white dark:text-black',
    docUrl: 'https://developers.facebook.com/docs/threads',
    pricingWarning:
      'Threads API tunduk pada rate limit harian per akun pengguna (250 post per 24 jam).',
  },
  {
    key: 'AUTO_PUBLISH_TIKTOK',
    name: 'TikTok Content Posting API',
    subtitle: 'Photo Carousel (Direct Post) & Video',
    description:
      'Jika dinonaktifkan, Dewan mengunduh poster dan mengunggah langsung di tiktok.com/upload. Jika diaktifkan, posting otomatis menggunakan HMAC-signed media proxy.',
    icon: () => (
      <span className="font-black text-xs tracking-wider">TT</span>
    ),
    iconBg: 'bg-slate-900 text-white dark:bg-black',
    docUrl: 'https://developers.tiktok.com/doc/content-posting-api-overview',
    pricingWarning:
      'Aplikasi dalam mode developer/unaudited hanya dapat memposting ke akun Private (SELF_ONLY). Verifikasi audit dibutuhkan untuk publikasi publik.',
  },
  {
    key: 'AUTO_PUBLISH_X_TWITTER',
    name: 'X (Twitter) API v2',
    subtitle: 'Cuitan Opini, Utas & Media Terlampir',
    description:
      'Jika dinonaktifkan, Dewan menyalin cuitan dengan URL portal dan membuka x.com/compose/post. Jika diaktifkan, sistem menerbitkan tweet via X API v2.',
    icon: () => (
      <span className="font-black text-xs">𝕏</span>
    ),
    iconBg: 'bg-black text-white dark:bg-white dark:text-black',
    docUrl: 'https://developer.x.com',
    pricingWarning:
      'PERHATIAN BIAYA: X Developer API menerapkan sistem saldo prabayar (prepaid credit) berbayar untuk setiap pemanggilan API (write tweet). Direkomendasikan tetap NONAKTIF.',
  },
];

export default function SuperadminPlatformSettingsPage() {
  const { toast } = useToast();
  const [flags, setFlags] = useState<Record<string, FeatureFlagItem>>({});
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  useEffect(() => {
    loadFlags();
  }, []);

  async function loadFlags() {
    try {
      setLoading(true);
      const data = await AdminApiClient.request<FeatureFlagItem[]>('/admin/platform-settings/flags');
      const map: Record<string, FeatureFlagItem> = {};
      (data || []).forEach((item) => {
        map[item.flagKey] = item;
      });
      setFlags(map);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memuat Pengaturan',
        description: err.message || 'Terjadi kesalahan koneksi saat memuat feature flags.',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(flagKey: string, currentEnabled: boolean) {
    const nextValue = !currentEnabled;
    const config = PLATFORM_CONFIGS.find((c) => c.key === flagKey);

    try {
      setUpdatingKey(flagKey);
      const updated = await AdminApiClient.request<FeatureFlagItem>(
        `/admin/platform-settings/flags/${flagKey}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ enabled: nextValue }),
        }
      );

      setFlags((prev) => ({
        ...prev,
        [flagKey]: updated,
      }));

      toast({
        type: 'success',
        title: nextValue ? 'Mode Otomatis Diaktifkan' : 'Mode Manual (Default) Diaktifkan',
        description: `Sakelar untuk ${config?.name || flagKey} berhasil diubah menjadi ${
          nextValue ? 'AKTIF (Otomatis)' : 'NONAKTIF (Manual Asisten)'
        }.`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Mengubah Sakelar',
        description: err.message || 'Terjadi kesalahan sistem saat memperbarui flag.',
      });
    } finally {
      setUpdatingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Sliders className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Master Switch &amp; Sakelar Fitur Platform
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Kontrol global tingkat platform untuk auto-publishing media sosial. Seluruh sakelar menerapkan prinsip
            keamanan <strong className="font-semibold text-slate-700 dark:text-slate-300">Fail-Closed (Default OFF)</strong>{' '}
            demi efisiensi biaya API komersial dan kepatuhan akun dewan.
          </p>
        </div>

        <Button
          onClick={loadFlags}
          variant="outline"
          size="sm"
          disabled={loading}
          className="shrink-0 gap-2 border-slate-200 dark:border-slate-800 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Segarkan
        </Button>
      </div>

      {/* 2. MITIGASI RISIKO & PENJELASAN ARSITEKTUR */}
      <Card className="p-5 border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
            <h3 className="font-bold text-sm tracking-tight text-amber-950 dark:text-amber-100">
              Panduan Kebijakan Biaya &amp; Integrasi Pihak Ketiga
            </h3>
            <p className="leading-relaxed">
              Sebagian penyedia media sosial (khususnya <strong>X / Twitter</strong>) memberlakukan tarif prabayar
              berbayar untuk setiap posting via API. Ketika sakelar di bawah berada dalam status{' '}
              <span className="font-semibold underline">NONAKTIF (Mode Manual)</span>, aplikasi Polaris sama sekali{' '}
              <strong>TIDAK AKAN memanggil API berbayar mereka</strong>.
            </p>
            <p className="leading-relaxed">
              Sebagai gantinya, antarmuka Studio Dewan secara cerdas menyediakan{' '}
              <strong>Asisten Penerbitan Manual</strong>: Dewan dapat langsung mengunduh poster resolusi penuh (HD),
              menyalin naskah yang otomatis menyertakan tautan resmi portal berita dewan (SEO traffic backlink), dan
              membuka tab browser resmi sosmed mereka untuk memposting secara personal.
            </p>
          </div>
        </div>
      </Card>

      {/* 3. DAFTAR SAKELAR PLATFORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PLATFORM_CONFIGS.map((platform) => {
          const item = flags[platform.key];
          const isEnabled = Boolean(item?.enabled);
          const isUpdating = updatingKey === platform.key;
          const IconComp = platform.icon;

          return (
            <Card
              key={platform.key}
              className={`p-6 rounded-2xl border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                isEnabled
                  ? 'border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-900/90'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'
              }`}
            >
              <div>
                {/* Header Kartu */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${platform.iconBg}`}
                    >
                      <IconComp className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                        {platform.name}
                      </h2>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        {platform.subtitle}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={isEnabled ? 'green' : 'slate'}
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                  >
                    {isEnabled ? 'Otomatis Aktif' : 'Manual (Aman)'}
                  </Badge>
                </div>

                {/* Deskripsi */}
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                  {platform.description}
                </p>

                {/* Warning Card Platform */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>Catatan Biaya &amp; Kuota</span>
                  </div>
                  <p className="leading-normal">{platform.pricingWarning}</p>
                </div>
              </div>

              {/* Kontrol Sakelar & Audit Trail */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {item?.updatedAt ? (
                    <span>
                      Diubah: {new Date(item.updatedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })} ({item.updatedBy || 'SUPERADMIN'})
                    </span>
                  ) : (
                    <span>Default: Nonaktif (Fail-Closed)</span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isEnabled ? 'Publikasi Otomatis' : 'Mode Asisten Manual'}
                  </span>

                  {/* Switch Button */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    disabled={isUpdating}
                    onClick={() => handleToggle(platform.key, isEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      isEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
