'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ArrowRight,
  Camera,
  MapPin,
  GraduationCap,
  Sparkles,
  Check
} from 'lucide-react';
import { 
  LicenseStatusBanner,
  OfficialIdentityForm,
  PolicyInterestsForm,
  CredentialsEducationForm,
  ElectoralDistrictForm,
  PublicWebsiteCard,
  ProfilePreviewView,
  PersonalPhotoCatalog,
  AccountSecurityModal,
} from '@/components/profile';


function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);

  // Tangkap redirect status dari Meta OAuth (Instagram / Threads)
  useEffect(() => {
    const socialStatus = searchParams.get('social_status');
    const platform = searchParams.get('social_platform');
    const handle = searchParams.get('handle');
    const reason = searchParams.get('reason');

    if (socialStatus === 'connected' && handle) {
      toast({
        type: 'success',
        title: `${platform === 'threads' ? 'Meta Threads' : 'Instagram'} Resmi Berhasil Ditautkan!`,
        description: `Akun resmi @${handle} siap digunakan untuk penerbitan dan sindikasi otomatis.`,
      });
    } else if (socialStatus === 'error') {
      toast({
        type: 'error',
        title: 'Gagal Menautkan Akun',
        description: reason || 'Terjadi kesalahan saat otorisasi Meta.',
      });
    } else if (socialStatus === 'cancelled') {
      toast({
        type: 'info',
        title: 'Otorisasi Dibatalkan',
        description: 'Proses otorisasi akun media sosial dibatalkan.',
      });
    }
  }, [searchParams, toast]);

  // Mode Tampilan: 'PREVIEW' (Default tampilan eksekutif) vs 'EDIT' (Formulir pengisian)
  const [activeTabMode, setActiveTabMode] = useState<'PREVIEW' | 'EDIT'>('PREVIEW');

  // Mode Navigasi Edit (HireGround Section Tabs): 'identitas' | 'katalog' | 'dapil' | 'pendidikan' | 'isu'
  type EditSection = 'identitas' | 'katalog' | 'dapil' | 'pendidikan' | 'isu';
  const [activeEditSection, setActiveEditSection] = useState<EditSection>('identitas');

  // Modal Keamanan Akun (Ganti Password & Ganti Email)
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [securityInitialTab, setSecurityInitialTab] = useState<'PASSWORD' | 'EMAIL'>('PASSWORD');

  function handleOpenSecurity(tab: 'PASSWORD' | 'EMAIL' = 'PASSWORD') {
    setSecurityInitialTab(tab);
    setSecurityModalOpen(true);
  }

  function handleEmailUpdated(newEmail: string) {
    setProfile((prev: any) => (prev ? { ...prev, email: newEmail } : prev));
  }


  // Form states - Identitas Resmi Dewan
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [partyAffiliation, setPartyAffiliation] = useState<string | null>(null);
  const [legislativeLevel, setLegislativeLevel] = useState('DPRD_PROVINSI');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoGallery, setPhotoGallery] = useState<string[]>([]);
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
        setPhotoGallery(Array.isArray(userProfile.photoGallery) ? userProfile.photoGallery : []);
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
          photoGallery,
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

  const EDIT_SECTIONS: {
    id: EditSection;
    label: string;
    shortLabel: string;
    icon: any;
    isComplete: boolean;
    description: string;
  }[] = [
    {
      id: 'identitas',
      label: 'Identitas Resmi',
      shortLabel: 'Identitas',
      icon: User,
      isComplete: Boolean(fullName.trim() && phoneNumber.trim()),
      description: 'Biodata dewan, kontak & penugasan komisi',
    },
    {
      id: 'katalog',
      label: 'Katalog Foto Dewan',
      shortLabel: 'Katalog Foto',
      icon: Camera,
      isComplete: Boolean(photoUrl || photoGallery.length > 0),
      description: 'Koleksi foto resmi dewan & portofolio publik',
    },
    {
      id: 'dapil',
      label: 'Wilayah Kerja Dapil',
      shortLabel: 'Dapil',
      icon: MapPin,
      isComplete: Boolean(provinceName.trim() && dapilName.trim() && regencyCoverage.length > 0),
      description: 'Basis konstituen & cakupan kabupaten/kota',
    },
    {
      id: 'pendidikan',
      label: 'Pendidikan & Diklat',
      shortLabel: 'Pendidikan',
      icon: GraduationCap,
      isComplete: Boolean(education.trim() || courses.length > 0),
      description: 'Riwayat akademik & kursus parlemen',
    },
    {
      id: 'isu',
      label: 'Minat Isu & Portal Web',
      shortLabel: 'Isu & Portal',
      icon: Sparkles,
      isComplete: Boolean(issueInterests.length > 0),
      description: 'AI Grounding minat isu & subdomain web',
    },
  ];

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
              photoGallery={photoGallery}
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
              isUnpaid={isUnpaid}
              onEditClick={() => setActiveTabMode('EDIT')}
              onOpenSecurity={handleOpenSecurity}
            />
          )}

          {/* MODE 2: FORM EDIT DENGAN TABS FLEKSIBEL (HIREGROUND ASYMMETRIC STYLE) */}
          {activeTabMode === 'EDIT' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-in fade-in duration-150">
              {/* HORIZONTAL SECTION TABS (HIREGROUND STYLE - FLEKSIBEL & SEKETIKA) */}
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  {EDIT_SECTIONS.map((sec, idx) => {
                    const Icon = sec.icon;
                    const isActive = activeEditSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setActiveEditSection(sec.id)}
                        className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : sec.isComplete
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {sec.isComplete && !isActive ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Icon className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="block leading-tight">{sec.label}</span>
                        {sec.isComplete && !isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SEKSI 1: IDENTITAS RESMI DEWAN */}
              {activeEditSection === 'identitas' && (
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
                    onOpenSecurity={handleOpenSecurity}
                  />

                  {/* Navigasi Seksi 1 */}
                  <div className="p-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">
                      Seksi 1 dari 5: Biodata Diri &amp; Penugasan Lembaga
                    </span>
                    <Button
                      type="button"
                      onClick={() => setActiveEditSection('katalog')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl cursor-pointer shadow-xs gap-1.5"
                    >
                      <span>Lanjut ke Katalog Foto Dewan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* SEKSI 2: KATALOG FOTO PORTOFOLIO DEWAN */}
              {activeEditSection === 'katalog' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-150">
                  <PersonalPhotoCatalog
                    photoGallery={photoGallery}
                    setPhotoGallery={setPhotoGallery}
                    photoUrl={photoUrl}
                    setPhotoUrl={setPhotoUrl}
                  />

                  {/* Navigasi Seksi 2 */}
                  <div className="p-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveEditSection('identitas')}
                      className="font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      <span>Kembali ke Identitas</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveEditSection('dapil')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl cursor-pointer shadow-xs gap-1.5"
                    >
                      <span>Lanjut ke Wilayah Kerja Dapil</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* SEKSI 3: WILAYAH KERJA & BASIS DAPIL */}
              {activeEditSection === 'dapil' && (
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

                  {/* Navigasi Seksi 3 */}
                  <div className="p-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveEditSection('katalog')}
                      className="font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      <span>Kembali ke Katalog Foto</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveEditSection('pendidikan')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl cursor-pointer shadow-xs gap-1.5"
                    >
                      <span>Lanjut ke Pendidikan &amp; Diklat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* SEKSI 4: PENDIDIKAN & KURSUS PARLEMEN */}
              {activeEditSection === 'pendidikan' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-150">
                  <CredentialsEducationForm
                    education={education}
                    setEducation={setEducation}
                    courses={courses}
                    onAddCourse={handleAddCourse}
                    onRemoveCourse={handleRemoveCourse}
                  />

                  {/* Navigasi Seksi 4 */}
                  <div className="p-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveEditSection('dapil')}
                      className="font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      <span>Kembali ke Wilayah Dapil</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveEditSection('isu')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl cursor-pointer shadow-xs gap-1.5"
                    >
                      <span>Lanjut ke Fokus Isu &amp; Web</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* SEKSI 5: FOKUS ISU KEBIJAKAN & WEBSITE PUBLIK */}
              {activeEditSection === 'isu' && (
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

                  {/* Navigasi Seksi 5 */}
                  <div className="p-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveEditSection('pendidikan')}
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
                          <span>Selesai &amp; Simpan Profil</span>
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
                  <span className="hidden sm:inline">Perubahan dapat disimpan kapan saja tanpa harus mengisi seluruh seksi.</span>
                  <span className="sm:hidden font-bold">
                    Seksi: {EDIT_SECTIONS.find((s) => s.id === activeEditSection)?.shortLabel} ({EDIT_SECTIONS.findIndex((s) => s.id === activeEditSection) + 1}/5)
                  </span>
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

        {/* MODAL KEAMANAN AKUN (GANTI PASSWORD & GANTI EMAIL) */}
        <AccountSecurityModal
          isOpen={securityModalOpen}
          onClose={() => setSecurityModalOpen(false)}
          currentEmail={profile?.email || ''}
          initialTab={securityInitialTab}
          onEmailUpdated={handleEmailUpdated}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0D14]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
