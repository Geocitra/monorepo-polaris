'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { 
  User, 
  CreditCard, 
  Save, 
  Loader2, 
  CheckCircle, 
  Eye, 
  Edit3, 
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { 
  LicenseStatusBanner,
  OfficialIdentityForm,
  PolicyInterestsForm,
  CredentialsEducationForm,
  ElectoralDistrictForm,
  PublicWebsiteCard,
  ProfilePreviewView,
  ProfileStepIndicator,
  ProfileSessionStep,
} from '@/components/profile';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);

  // Mode Tampilan: 'PREVIEW' (Default tampilan eksekutif) vs 'EDIT' (Formulir pengisian)
  const [activeTabMode, setActiveTabMode] = useState<'PREVIEW' | 'EDIT'>('PREVIEW');

  // Sesi Aktif Multi-Step Wizard: Sesi 1 (Identitas), Sesi 2 (Dapil), Sesi 3 (Pendidikan), Sesi 4 (Isu & Web)
  const [activeStep, setActiveStep] = useState<ProfileSessionStep>(1);

  // Form states - Identitas Resmi Dewan
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [partyAffiliation, setPartyAffiliation] = useState<string | null>(null);
  const [legislativeLevel, setLegislativeLevel] = useState('DPRD_PROVINSI');
  const [photoUrl, setPhotoUrl] = useState('');
  const [commissionName, setCommissionName] = useState('');
  const [gender, setGender] = useState('LAKI_LAKI');
  const [birthDate, setBirthDate] = useState('');

  // Form states - Kredensial Pendidikan & Kursus
  const [education, setEducation] = useState('');
  const [courses, setCourses] = useState<string[]>([]);

  // Form states - Minat Isu Kebijakan (AI Grounding)
  const [issueInterests, setIssueInterests] = useState<string[]>([]);

  // Form states - Dapil & Wilayah
  const [provinceName, setProvinceName] = useState('Jawa Barat');
  const [dapilName, setDapilName] = useState('Jawa Barat I');
  const [dapilCode, setDapilCode] = useState('DAPIL-JABAR-1');
  const [regencyCoverage, setRegencyCoverage] = useState<string[]>(['Kota Bandung', 'Kota Cimahi']);
  const [newRegencyInput, setNewRegencyInput] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await ApiClient.request<any>('/auth/me');
        const billingStatus = await ApiClient.request<any>('/billing/status').catch(() => null);

        setProfile(userProfile);
        setBilling(billingStatus);

        setFullName(userProfile.fullName || '');
        setPhoneNumber(userProfile.phoneNumber || '');
        setPartyAffiliation(userProfile.partyAffiliation || userProfile.institutionPartyName || null);
        setLegislativeLevel(userProfile.legislativeLevel || userProfile.officeRole || 'DPRD_PROVINSI');
        setPhotoUrl(userProfile.photoUrl || '');
        setCommissionName(userProfile.commissionName || '');
        setGender(userProfile.gender || 'LAKI_LAKI');
        setBirthDate(userProfile.birthDate || '');
        setEducation(userProfile.education || '');
        setCourses(Array.isArray(userProfile.courses) ? userProfile.courses : []);
        setIssueInterests(
          Array.isArray(userProfile.issueInterests) && userProfile.issueInterests.length > 0
            ? userProfile.issueInterests
            : ['Pendidikan & Kebudayaan', 'Infrastruktur & Tata Ruang']
        );

        if (userProfile.electoralDistrict) {
          const dapil = userProfile.electoralDistrict;
          if (dapil.provinceName) setProvinceName(dapil.provinceName);
          if (dapil.dapilName) setDapilName(dapil.dapilName);
          if (dapil.dapilCode) setDapilCode(dapil.dapilCode);
          if (Array.isArray(dapil.regencyCoverage) && dapil.regencyCoverage.length > 0) {
            setRegencyCoverage(dapil.regencyCoverage);
          }
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Handlers - Minat Isu AI
  function handleToggleInterest(tag: string) {
    if (issueInterests.includes(tag)) {
      setIssueInterests(issueInterests.filter((i) => i !== tag));
    } else {
      setIssueInterests([...issueInterests, tag]);
    }
  }

  function handleAddCustomInterest(tag: string) {
    if (!issueInterests.includes(tag)) {
      setIssueInterests([...issueInterests, tag]);
    }
  }

  function handleRemoveInterest(tag: string) {
    setIssueInterests(issueInterests.filter((i) => i !== tag));
  }

  // Handlers - Kursus Dewan
  function handleAddCourse(course: string) {
    if (!courses.includes(course)) {
      setCourses([...courses, course]);
    }
  }

  function handleRemoveCourse(targetCourse: string) {
    setCourses(courses.filter((c) => c !== targetCourse));
  }

  // Handlers - Wilayah & Dapil
  function handleAddRegency(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const clean = newRegencyInput.trim();
    if (!clean) return;

    if (!regencyCoverage.includes(clean)) {
      setRegencyCoverage([...regencyCoverage, clean]);
    }
    setNewRegencyInput('');
  }

  function handleRemoveRegency(target: string) {
    setRegencyCoverage(regencyCoverage.filter((item) => item !== target));
  }

  function handleQuickAddRegency(item: string) {
    if (!regencyCoverage.includes(item)) {
      setRegencyCoverage([...regencyCoverage, item]);
    }
  }

  function handleDapilNameChange(name: string) {
    setDapilName(name);
    const cleanCode = name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (cleanCode) {
      setDapilCode(`DAPIL-${cleanCode}`);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const updated = await ApiClient.request<any>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName,
          phoneNumber,
          partyAffiliation,
          institutionPartyName: partyAffiliation,
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
        }),
      });

      setProfile(updated);
      setActiveTabMode('PREVIEW');
      toast({
        title: 'Profil Berhasil Disimpan',
        description: 'Informasi identitas resmi, foto portal publik, minat isu AI, dan dapil telah diperbarui.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal Menyimpan Profil',
        description: err.message || 'Terjadi kesalahan sistem saat memperbarui profil.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070A12]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  const isUnpaid = billing?.subscriptionStatus !== 'ACTIVE';

  const completionMap: Record<ProfileSessionStep, boolean> = {
    1: Boolean(fullName.trim() && phoneNumber.trim()),
    2: Boolean(provinceName.trim() && dapilName.trim() && regencyCoverage.length > 0),
    3: Boolean(education.trim() || courses.length > 0),
    4: Boolean(issueInterests.length > 0),
  };

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

        <main className="flex-1 px-3.5 sm:px-5 md:px-6 py-3.5 sm:py-4 space-y-3 max-w-7xl w-full mx-auto transition-all duration-200">
          {/* HEADER NAVIGASI MINIMAL (HEADERLESS) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* BREADCRUMB MINIMAL */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-700 dark:text-slate-200 font-extrabold">Profil Dewan</span>
            </Link>

            {/* TOGGLE SWITCHER: PREVIEW VS EDIT */}
            <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl shrink-0 self-start sm:self-auto border border-slate-200/80 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setActiveTabMode('PREVIEW')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTabMode === 'PREVIEW'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTabMode('EDIT')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTabMode === 'EDIT'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Data</span>
              </button>
            </div>
          </div>

          {/* BANNER STATUS LISENSI */}
          <LicenseStatusBanner isUnpaid={isUnpaid} dapilName={dapilName} />

          {/* MODE 1: TAMPILAN PREVIEW (COMPACT & ALIGNED THEME) */}
          {activeTabMode === 'PREVIEW' && (
            <ProfilePreviewView
              fullName={fullName}
              phoneNumber={phoneNumber}
              email={profile?.email}
              partyAffiliation={partyAffiliation}
              legislativeLevel={legislativeLevel}
              commissionName={commissionName}
              photoUrl={photoUrl}
              gender={gender}
              birthDate={birthDate}
              education={education}
              courses={courses}
              issueInterests={issueInterests}
              provinceName={provinceName}
              dapilName={dapilName}
              dapilCode={dapilCode}
              regencyCoverage={regencyCoverage}
              subdomain={profile?.subdomain}
              onEditClick={() => setActiveTabMode('EDIT')}
            />
          )}

          {/* MODE 2: FORM EDIT DENGAN STEP INDICATOR (PER SESI TERPANDU) */}
          {activeTabMode === 'EDIT' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-in fade-in duration-150">
              {/* 1. STEP INDICATOR & PROGRESS TRACKER */}
              <ProfileStepIndicator
                currentStep={activeStep}
                onStepChange={setActiveStep}
                completionMap={completionMap}
                onSave={handleSaveProfile}
                isSaving={saving}
                onCancel={() => setActiveTabMode('PREVIEW')}
              />

              {/* SESI 1: IDENTITAS RESMI & FOTO DEWAN */}
              {activeStep === 1 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-150">
                  <OfficialIdentityForm
                    fullName={fullName}
                    setFullName={setFullName}
                    phoneNumber={phoneNumber}
                    setPhoneNumber={setPhoneNumber}
                    partyAffiliation={partyAffiliation || undefined}
                    setPartyAffiliation={setPartyAffiliation}
                    legislativeLevel={legislativeLevel}
                    setLegislativeLevel={setLegislativeLevel}
                    commissionName={commissionName}
                    setCommissionName={setCommissionName}
                    email={profile?.email}
                    photoUrl={photoUrl}
                    setPhotoUrl={setPhotoUrl}
                    gender={gender}
                    setGender={setGender}
                    birthDate={birthDate}
                    setBirthDate={setBirthDate}
                  />

                  {/* Navigasi Sesi 1 */}
                  <div className="p-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">
                      Langkah 1 dari 4: Identitas Personal & Parlemen
                    </span>
                    <Button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl cursor-pointer shadow-xs gap-1.5"
                    >
                      <span>Lanjut ke Wilayah Dapil</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* SESI 2: WILAYAH DAPIL KONSTITUEN */}
              {activeStep === 2 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-150">
                  <ElectoralDistrictForm
                    provinceName={provinceName}
                    setProvinceName={setProvinceName}
                    dapilName={dapilName}
                    onDapilNameChange={handleDapilNameChange}
                    dapilCode={dapilCode}
                    setDapilCode={setDapilCode}
                    regencyCoverage={regencyCoverage}
                    newRegencyInput={newRegencyInput}
                    setNewRegencyInput={setNewRegencyInput}
                    onAddRegency={handleAddRegency}
                    onRemoveRegency={handleRemoveRegency}
                    onQuickAddRegency={handleQuickAddRegency}
                  />

                  {/* Navigasi Sesi 2 */}
                  <div className="p-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveStep(1)}
                      className="font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      <span>Kembali ke Identitas</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl cursor-pointer shadow-xs gap-1.5"
                    >
                      <span>Lanjut ke Pendidikan & Diklat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* SESI 3: PENDIDIKAN & KREDENSIAL */}
              {activeStep === 3 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-150">
                  <CredentialsEducationForm
                    education={education}
                    setEducation={setEducation}
                    courses={courses}
                    onAddCourse={handleAddCourse}
                    onRemoveCourse={handleRemoveCourse}
                  />

                  {/* Navigasi Sesi 3 */}
                  <div className="p-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveStep(2)}
                      className="font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      <span>Kembali ke Wilayah Dapil</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveStep(4)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl cursor-pointer shadow-xs gap-1.5"
                    >
                      <span>Lanjut ke Fokus Isu & Web</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* SESI 4: FOKUS ISU KEBIJAKAN & WEBSITE PUBLIK */}
              {activeStep === 4 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-150">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
                    <div className="lg:col-span-2">
                      <PolicyInterestsForm
                        issueInterests={issueInterests}
                        onToggleInterest={handleToggleInterest}
                        onAddCustomInterest={handleAddCustomInterest}
                        onRemoveInterest={handleRemoveInterest}
                      />
                    </div>
                    <div>
                      <PublicWebsiteCard subdomain={profile?.subdomain} />
                    </div>
                  </div>

                  {/* Navigasi Sesi 4 */}
                  <div className="p-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveStep(3)}
                      className="font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      <span>Kembali ke Pendidikan</span>
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2 rounded-xl cursor-pointer shadow-xs gap-1.5"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Menyimpan Seluruh Profil...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Selesai & Simpan Profil</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* STICKY BOTTOM SAVE BAR */}
              <div className="pt-1 flex items-center justify-between gap-3 sticky bottom-3 p-3 px-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="hidden sm:inline">Perubahan dapat disimpan kapan saja tanpa menunggu seluruh sesi selesai.</span>
                  <span className="sm:hidden font-bold">Sesi {activeStep} / 4 Aktif</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTabMode('PREVIEW')}
                    className="text-slate-600 dark:text-slate-400 font-bold text-xs cursor-pointer h-8 px-3"
                  >
                    Batal
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 px-4 rounded-xl gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        <span>Simpan Profil</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
