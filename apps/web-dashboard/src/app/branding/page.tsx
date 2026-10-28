'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useToast } from '@/components/ui/toast';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette, Globe, ExternalLink, Loader2, Monitor, Paintbrush, Instagram, Sparkles, Columns, Sliders, Eye, Save, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { ThemeForm } from '@/components/branding/ThemeForm';
import { DeviceSimulator } from '@/components/branding/DeviceSimulator';
import { DashboardThemeCustomizer } from '@/components/branding/DashboardThemeCustomizer';
import { Card } from '@/components/ui/card';
import { getPortalUrl } from '@/lib/urls';

const PARTY_COLOR_PRESETS = [
  { name: 'Golkar', primary: '#F5B800', secondary: '#001529' },
  { name: 'PDI Perjuangan', primary: '#D60000', secondary: '#1A1A1A' },
  { name: 'Gerindra', primary: '#C92A2A', secondary: '#1E293B' },
  { name: 'NasDem', primary: '#0A2558', secondary: '#F26522' },
  { name: 'PKB', primary: '#008242', secondary: '#C29B38' },
  { name: 'PKS', primary: '#FF6600', secondary: '#1A1A1A' },
  { name: 'Demokrat', primary: '#0047AB', secondary: '#D21034' },
  { name: 'PAN', primary: '#003399', secondary: '#FFFFFF' },
];

type ActiveTab = 'dashboard' | 'website' | 'documents' | 'instagram' | 'threads';
type StudioViewMode = 'split' | 'editor' | 'preview';

function BrandingContent() {
  const { toast } = useToast();
  const { setColors } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [studioViewMode, setStudioViewMode] = useState<StudioViewMode>('split');

  // Form State (Website Branding)
  const [primaryColor, setPrimaryColor] = useState('#1890FF');
  const [secondaryColor, setSecondaryColor] = useState('#001529');
  const [officialPhotoUrl, setOfficialPhotoUrl] = useState('');
  const [headlineTagline, setHeadlineTagline] = useState('');
  const [bioBiography, setBioBiography] = useState('');
  const [subdomainSlug, setSubdomainSlug] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [layoutTemplateId, setLayoutTemplateId] = useState('standard-default');
  const [visionMission, setVisionMission] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [layoutSchema, setLayoutSchema] = useState<any>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const p = await ApiClient.request<any>('/auth/me');
        const b = await ApiClient.request<any>('/billing/status');
        const portalData = await ApiClient.request<any>('/cms/my-portal').catch(() => null);

        setProfile(p);
        setBilling(b);

        if (portalData?.theme) {
          setPrimaryColor(portalData.theme.primaryHexColor || '#1890FF');
          setSecondaryColor(portalData.theme.secondaryHexColor || '#001529');
          // Prioritaskan foto profil resmi dewan jika ada, atau fallback ke tema portal
          const initialPhoto = p?.photoUrl || portalData.theme.officialPhotoUrl || '';
          setOfficialPhotoUrl(initialPhoto);
          setHeadlineTagline(portalData.theme.headlineTagline || '');
          setBioBiography(portalData.theme.bioBiography || '');
          setLayoutTemplateId(portalData.theme.layoutTemplateId || 'standard-default');

          const schema = portalData.theme.layoutSchema || {};
          setLayoutSchema(schema);
          if (Array.isArray(schema.visionMission) && schema.visionMission.length > 0) {
            setVisionMission(schema.visionMission);
          }
          if (Array.isArray(schema.careers) && schema.careers.length > 0) {
            setCareers(schema.careers);
          }
        } else if (p?.photoUrl) {
          setOfficialPhotoUrl(p.photoUrl);
        }

        if (portalData?.portal) {
          setSubdomainSlug(portalData.portal.subdomainSlug || '');
          setCustomDomain(portalData.portal.customDomain || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (isUnpaid) {
      toast({
        type: 'error',
        title: 'Penyimpanan Terkunci (Mode Pratinjau)',
        description: 'Aktivasi lisensi diperlukan untuk menyimpan tema ke situs publik.',
      });
      return;
    }

    setSaving(true);

    try {
      const photoToSave = (officialPhotoUrl || profile?.photoUrl || '').trim();
      const updatedSchema = {
        ...(layoutSchema || {}),
        templatePreset: layoutTemplateId,
        visionMission,
        careers,
      };

      await ApiClient.request<any>('/cms/theme', {
        method: 'PUT',
        body: JSON.stringify({
          primaryHexColor: primaryColor,
          secondaryHexColor: secondaryColor,
          fontFamily: 'Inter, sans-serif',
          layoutTemplateId,
          officialPhotoUrl: photoToSave,
          headlineTagline,
          bioBiography,
          layoutSchema: updatedSchema,
        }),
      });

      await ApiClient.request<any>('/cms/domain', {
        method: 'PUT',
        body: JSON.stringify({
          subdomainSlug: subdomainSlug.trim() || undefined,
          customDomain: customDomain.trim() || undefined,
        }),
      }).catch(() => {});

      toast({
        type: 'success',
        title: 'Konfigurasi Website Disimpan!',
        description: 'Perubahan tema visual website publik berhasil disinkronkan.',
      });

      setIframeKey((prev) => prev + 1);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menyimpan',
        description: err.message || 'Terjadi kesalahan sistem.',
      });
    } finally {
      setSaving(false);
    }
  }

  const isUnpaid = billing?.subscriptionStatus !== 'ACTIVE';
  const previewBaseUrl = getPortalUrl(subdomainSlug || 'default-portal');
  const previewUrl = `${previewBaseUrl}?preview_template=${encodeURIComponent(layoutTemplateId)}&preview_color=${encodeURIComponent(primaryColor)}`;

  const handleLayoutTemplateChange = (newTemplateId: string) => {
    setLayoutTemplateId(newTemplateId);
    // Instantaneous live preview switch via postMessage to iframe
    try {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: 'POLARIS_PREVIEW_TEMPLATE_CHANGE',
          templateId: newTemplateId,
        },
        '*'
      );
    } catch (err) {
      console.error('Error posting message to simulator:', err);
    }
  };

  useEffect(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: 'POLARIS_PREVIEW_COLOR_CHANGE',
          primaryHexColor: primaryColor,
        },
        '*'
      );
    } catch (err) {
      console.error('Error posting color message to simulator:', err);
    }
  }, [primaryColor]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0D14]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100/70 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans theme-transition">
      <Sidebar subdomain={profile?.subdomain} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          fullName={profile?.fullName}
          party={profile?.partyAffiliation}
          subdomain={profile?.subdomain}
          subscriptionStatus={billing?.subscriptionStatus}
          currentPeriodEnd={billing?.currentPeriodEnd}
        />

        <main
          className={cn(
            'flex-1 p-4 sm:p-6 transition-all duration-300 w-full mx-auto',
            activeTab === 'website'
              ? studioViewMode === 'split'
                ? 'max-w-[1800px] space-y-4'
                : studioViewMode === 'editor'
                ? 'max-w-6xl space-y-4'
                : 'max-w-[1800px] space-y-4'
              : 'max-w-7xl space-y-6'
          )}
        >
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
                <Palette className="h-3.5 w-3.5" />
                Identitas & Tampilan
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                Tema & Desain
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Atur palet warna fraksi, tema dashboard, serta tampilan portal website aspirasi konstituen.
              </p>
            </div>

            <a
              href={previewBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all shadow-sm shrink-0"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Buka Website</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit max-w-full overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Paintbrush className="h-3.5 w-3.5" />
              <span>Tema Dashboard</span>
            </button>
            <Link
              href="/branding/website"
              className="shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 shadow-2xs group cursor-pointer"
              title="Buka Halaman Penuh Studio Website Publik"
            >
              <Monitor className="h-3.5 w-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
              <span>Branding Website</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Full Page ↗
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setActiveTab('instagram')}
              className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'instagram'
                  ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Instagram className="h-3.5 w-3.5" />
              <span>Instagram Resmi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('threads')}
              className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'threads'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Meta Threads</span>
            </button>
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'dashboard' && (
            <Card className="space-y-0">
              <DashboardThemeCustomizer />
            </Card>
          )}

          {activeTab === 'website' && (
            <div className="space-y-4">
              {/* STUDIO LAUNCHPAD BANNER */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                      Rekomendasi Terbaik
                    </span>
                    <h3 className="text-sm sm:text-base font-black">
                      Mode Studio Website Layar Penuh (100% Leluasa)
                    </h3>
                  </div>
                  <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
                    Buka konfigurasi tema, 13 arsitektur tata letak, palet partai, dan simulator website dalam 1 layar penuh tanpa terhalang bilah samping dashboard.
                  </p>
                </div>
                <Link
                  href="/branding/website"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs transition-all shadow-md shrink-0 cursor-pointer"
                >
                  <span>Buka Studio Layar Penuh</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* STUDIO WORKSPACE TOOLBAR (MODE 3-IN-1: SPLIT, FOKUS EDITOR, FOKUS PRATINJAU) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 sm:p-2.5 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                {/* Left: Quick Mode Switcher */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-2xs w-full sm:w-fit">
                  <button
                    type="button"
                    onClick={() => setStudioViewMode('split')}
                    className={cn(
                      'flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                      studioViewMode === 'split'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    )}
                    title="Tampilan Studio Berdampingan (Editor + Simulator)"
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Split Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudioViewMode('editor')}
                    className={cn(
                      'flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                      studioViewMode === 'editor'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    )}
                    title="Fokus Pengaturan Penuh (100% Layar Leluasa)"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Fokus Editor (Leluasa)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudioViewMode('preview')}
                    className={cn(
                      'flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                      studioViewMode === 'preview'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    )}
                    title="Fokus Pratinjau Website Layar Penuh"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Fokus Pratinjau</span>
                  </button>
                </div>

                {/* Right: Quick status & Tab baru link */}
                <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                  <span className="hidden md:inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Sinkronisasi Live</span>
                  </span>

                  <a
                    href={previewBaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs transition-all shadow-2xs"
                  >
                    <Globe className="h-3 w-3 text-blue-500" />
                    <span>Buka Tab Baru</span>
                    <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                  </a>

                  {isUnpaid ? (
                    <Link href="/billing">
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-sm">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Aktifkan Lisensi</span>
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      type="submit"
                      disabled={saving}
                      loading={saving}
                      size="sm"
                      className="text-white font-extrabold text-xs gap-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* RESPONSIVE GRID CANVAS */}
              <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-12 items-start">
                {/* Form Column */}
                <div
                  className={cn(
                    'transition-all duration-300',
                    studioViewMode === 'split' && 'lg:col-span-5 xl:col-span-5 2xl:col-span-4 block w-full',
                    studioViewMode === 'editor' && 'col-span-12 block w-full',
                    studioViewMode === 'preview' && 'hidden'
                  )}
                >
                  <ThemeForm
                    primaryColor={primaryColor}
                    onPrimaryColorChange={setPrimaryColor}
                    secondaryColor={secondaryColor}
                    onSecondaryColorChange={setSecondaryColor}
                    layoutTemplateId={layoutTemplateId}
                    onLayoutTemplateIdChange={handleLayoutTemplateChange}
                    planTier={billing?.planTier}
                    officialPhotoUrl={officialPhotoUrl}
                    onOfficialPhotoUrlChange={setOfficialPhotoUrl}
                    profilePhotoUrl={profile?.photoUrl}
                    headlineTagline={headlineTagline}
                    onHeadlineTaglineChange={setHeadlineTagline}
                    bioBiography={bioBiography}
                    onBioBiographyChange={setBioBiography}
                    subdomainSlug={subdomainSlug}
                    onSubdomainSlugChange={setSubdomainSlug}
                    customDomain={customDomain}
                    onCustomDomainChange={setCustomDomain}
                    isUnpaid={isUnpaid}
                    saving={saving}
                    onSubmit={handleSave}
                    partyPresets={PARTY_COLOR_PRESETS}
                    visionMission={visionMission}
                    onVisionMissionChange={setVisionMission}
                    careers={careers}
                    onCareersChange={setCareers}
                    profileEducation={profile?.education}
                    profileCourses={profile?.courses}
                  />
                </div>

                {/* Simulator Column */}
                <div
                  className={cn(
                    'transition-all duration-300',
                    studioViewMode === 'split' && 'lg:col-span-7 xl:col-span-7 2xl:col-span-8 block w-full',
                    studioViewMode === 'preview' && 'col-span-12 block w-full',
                    studioViewMode === 'editor' && 'hidden'
                  )}
                >
                  <DeviceSimulator
                    previewUrl={previewUrl}
                    previewDevice={previewDevice}
                    onDeviceChange={setPreviewDevice}
                    onRefresh={() => setIframeKey((prev) => prev + 1)}
                    iframeKey={iframeKey}
                    iframeRef={iframeRef}
                  />
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BrandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0D14]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <BrandingContent />
    </Suspense>
  );
}
