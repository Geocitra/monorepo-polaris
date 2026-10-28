'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import { useTheme } from '@/contexts/ThemeContext';
import {
  ArrowLeft,
  Globe,
  ExternalLink,
  Loader2,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Lock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { ThemeForm } from '@/components/branding/ThemeForm';
import { getPortalUrl, getRootDomain } from '@/lib/urls';
import { DeviceSimulator } from '@/components/branding/DeviceSimulator';
import { TEMPLATE_LAYOUTS } from '@/components/branding/TemplateLayoutSelector';

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

function WebsiteStudioContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { setColors } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  // Form State
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

  const loadConfig = async () => {
    try {
      const p = await ApiClient.request<any>('/auth/me');
      const b = await ApiClient.request<any>('/billing/status');
      const portalData = await ApiClient.request<any>('/cms/my-portal').catch(() => null);

      setProfile(p);
      setBilling(b);

      if (portalData?.theme) {
        setPrimaryColor(portalData.theme.primaryHexColor || '#1890FF');
        setSecondaryColor(portalData.theme.secondaryHexColor || '#001529');
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
      console.error('Error loading branding config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();

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
  const previewBaseUrl = getPortalUrl(subdomainSlug, customDomain);
  const previewUrl = `${previewBaseUrl}?preview_template=${encodeURIComponent(layoutTemplateId)}&preview_color=${encodeURIComponent(primaryColor)}`;

  const handleLayoutTemplateChange = (newTemplateId: string) => {
    setLayoutTemplateId(newTemplateId);
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

  const activeTemplate =
    TEMPLATE_LAYOUTS.find((tpl) => tpl.id === layoutTemplateId) || TEMPLATE_LAYOUTS[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-600">Memuat Studio Website Polaris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 overflow-hidden select-none font-sans">
      {/* ─── IMMERSIVE STUDIO TOPBAR ─── */}
      <header className="h-16 px-4 sm:px-6 bg-white dark:bg-[#0E131F] border-b border-slate-200/90 dark:border-slate-800 backdrop-blur flex items-center justify-between shrink-0 z-20 shadow-2xs">
        {/* Left: Back Link & Portal Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/branding"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all shadow-2xs shrink-0"
            title="Kembali ke Dashboard Utama"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali</span>
          </Link>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                  Studio Branding Website Publik
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 hidden md:inline-block">
                  {activeTemplate.name}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate font-mono">
                {customDomain
                  ? `https://${customDomain}`
                  : subdomainSlug
                  ? `https://${subdomainSlug}.${getRootDomain()}`
                  : 'Portal Publik Resmi'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Device Simulator Controls */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <button
            type="button"
            onClick={() => setPreviewDevice('desktop')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              previewDevice === 'desktop'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            )}
            title="Resolusi Desktop (1280px)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewDevice('tablet')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              previewDevice === 'tablet'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            )}
            title="Resolusi Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewDevice('mobile')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              previewDevice === 'mobile'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            )}
            title="Resolusi Smartphone (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>

          <button
            type="button"
            onClick={() => setIframeKey((prev) => prev + 1)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg border-l border-slate-200 dark:border-slate-700 ml-1 cursor-pointer"
            title="Muat Ulang Simulator"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={previewBaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all shadow-2xs"
            title="Buka Website di Tab Baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Tab Baru</span>
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
              type="button"
              onClick={() => handleSave()}
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
      </header>

      {/* ─── IMMERSIVE STUDIO WORKSPACE ─── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Inspector / Form Panel */}
        <aside className="w-full lg:w-[47%] xl:w-[47%] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] overflow-y-auto p-5 sm:p-7 xl:p-8 text-slate-900 dark:text-slate-100 shadow-sm z-10">
          <div className="max-w-2xl mx-auto w-full">
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
              onDomainUpdated={loadConfig}
            />
          </div>
        </aside>

        {/* Right: Live Simulator Canvas */}
        <main className="hidden lg:flex flex-1 bg-slate-100/80 dark:bg-[#070A12] p-5 xl:p-8 flex-col items-center justify-start overflow-y-auto">
          <div className="w-full max-w-3xl xl:max-w-4xl flex justify-center sticky top-2">
            <DeviceSimulator
              previewUrl={previewUrl}
              previewDevice={previewDevice}
              onDeviceChange={setPreviewDevice}
              onRefresh={() => setIframeKey((prev) => prev + 1)}
              iframeKey={iframeKey}
              iframeRef={iframeRef}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function WebsiteStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
          <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
        </div>
      }
    >
      <WebsiteStudioContent />
    </Suspense>
  );
}
