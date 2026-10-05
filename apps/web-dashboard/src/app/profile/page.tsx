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
  ArrowLeft 
} from 'lucide-react';
import { 
  LicenseStatusBanner,
  OfficialIdentityForm,
  PolicyInterestsForm,
  CredentialsEducationForm,
  ElectoralDistrictForm,
  PublicWebsiteCard,
  ProfilePreviewView,
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
          legislativeLevel,
          officeRole: legislativeLevel,
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

          {/* MODE 2: FORM EDIT COMPACT 2 KOLOM */}
          {activeTabMode === 'EDIT' && (
            <form onSubmit={handleSaveProfile} className="space-y-3 animate-in fade-in duration-150">
              {/* BACK TO PREVIEW BAR */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-100">
                <button
                  type="button"
                  onClick={() => setActiveTabMode('PREVIEW')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali ke Tampilan Preview</span>
                </button>
                <span className="text-[11px] text-blue-600 hidden sm:inline font-medium">
                  Klik Simpan Profil di bawah setelah selesai mengubah data.
                </span>
              </div>

              {/* 2 KOLOM BALANCED: KIRI (Identitas & Pendidikan) | KANAN (Minat Isu & Dapil & Web) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
                {/* KOLOM KIRI */}
                <div className="space-y-3">
                  {/* 1. Identitas Resmi & Foto Dewan */}
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

                  {/* 2. Kredensial Pendidikan & Kursus */}
                  <CredentialsEducationForm
                    education={education}
                    setEducation={setEducation}
                    courses={courses}
                    onAddCourse={handleAddCourse}
                    onRemoveCourse={handleRemoveCourse}
                  />
                </div>

                {/* KOLOM KANAN */}
                <div className="space-y-3">
                  {/* 3. Minat Isu AI Grounding */}
                  <PolicyInterestsForm
                    issueInterests={issueInterests}
                    onToggleInterest={handleToggleInterest}
                    onAddCustomInterest={handleAddCustomInterest}
                    onRemoveInterest={handleRemoveInterest}
                  />

                  {/* 4. Daerah Pemilihan (Dropdown & Wilayah) */}
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

                  {/* 5. Website Publik Resmi */}
                  <PublicWebsiteCard subdomain={profile?.subdomain} />
                </div>
              </div>

              {/* STICKY SAVE BAR */}
              <div className="pt-1 flex items-center justify-end gap-2 sticky bottom-3 p-2.5 px-3.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md">
                <div className="mr-auto hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Tersinkronisasi otomatis ke portal publik dan mesin AI.</span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTabMode('PREVIEW')}
                  className="text-slate-600 font-bold text-xs cursor-pointer h-8 px-3"
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 px-4 rounded-lg gap-1.5 shadow-2xs transition-all cursor-pointer"
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
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
