'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useToast } from '@/components/ui/toast';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette, Globe, ExternalLink, Loader2, Monitor, Paintbrush } from 'lucide-react';

import { ThemeForm } from '@/components/branding/ThemeForm';
import { DeviceSimulator } from '@/components/branding/DeviceSimulator';
import { DashboardThemeCustomizer } from '@/components/branding/DashboardThemeCustomizer';
import { Card } from '@/components/ui/card';

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

type ActiveTab = 'dashboard' | 'website';

export default function BrandingPage() {
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

  // Form State (Website Branding)
  const [primaryColor, setPrimaryColor] = useState('#1890FF');
  const [secondaryColor, setSecondaryColor] = useState('#001529');
  const [officialPhotoUrl, setOfficialPhotoUrl] = useState('');
  const [headlineTagline, setHeadlineTagline] = useState('');
  const [bioBiography, setBioBiography] = useState('');
  const [subdomainSlug, setSubdomainSlug] = useState('');
  const [customDomain, setCustomDomain] = useState('');

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
          setOfficialPhotoUrl(portalData.theme.officialPhotoUrl || '');
          setHeadlineTagline(portalData.theme.headlineTagline || '');
          setBioBiography(portalData.theme.bioBiography || '');
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
      await ApiClient.request<any>('/cms/theme', {
        method: 'PUT',
        body: JSON.stringify({
          primaryHexColor: primaryColor,
          secondaryHexColor: secondaryColor,
          fontFamily: 'Inter, sans-serif',
          officialPhotoUrl: officialPhotoUrl.trim() || undefined,
          headlineTagline,
          bioBiography,
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
  const previewUrl = subdomainSlug
    ? `http://${subdomainSlug}.localhost:3001`
    : 'http://default-portal.localhost:3001';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar subdomain={profile?.subdomain} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          fullName={profile?.fullName}
          party={profile?.partyAffiliation}
          subdomain={profile?.subdomain}
          subscriptionStatus={billing?.subscriptionStatus}
          currentPeriodEnd={billing?.currentPeriodEnd}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 transition-all duration-300">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
                <Palette className="h-3.5 w-3.5" />
                Identitas & Tampilan
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Tema & Desain
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Atur tampilan dashboard dan website publik Anda agar tampil profesional.
              </p>
            </div>

            <a
              href={previewUrl}
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
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Paintbrush className="h-3.5 w-3.5" />
              Tema Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('website')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'website'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              Branding Website
            </button>
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'dashboard' ? (
            <Card className="space-y-0">
              <DashboardThemeCustomizer />
            </Card>
          ) : (
            <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-12 items-start">
              <ThemeForm
                primaryColor={primaryColor}
                onPrimaryColorChange={setPrimaryColor}
                secondaryColor={secondaryColor}
                onSecondaryColorChange={setSecondaryColor}
                officialPhotoUrl={officialPhotoUrl}
                onOfficialPhotoUrlChange={setOfficialPhotoUrl}
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
              />

              <DeviceSimulator
                previewUrl={previewUrl}
                previewDevice={previewDevice}
                onDeviceChange={setPreviewDevice}
                onRefresh={() => setIframeKey((prev) => prev + 1)}
                iframeKey={iframeKey}
                iframeRef={iframeRef}
              />
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
