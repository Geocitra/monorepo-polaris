'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { TEMPLATE_LAYOUTS } from './TemplateLayoutSelector';
import { removeImageBackground } from '@/lib/background-removal';
import {
  FormSectionTab,
  VisionMissionItem,
  DEFAULT_VISION_MISSION,
  CareerItem,
  PerformanceActivityItem,
  CommissionAssignment,
  AkdBodyItem,
  ParliamentaryAssignment,
  ThemeFormProps,
  ThemeFormHeader,
  ThemeColorsSection,
  ThemeTemplatesSection,
  ThemeDomainSection,
  ThemeProfileSection,
} from './theme';

// Re-export all constants and types for complete backward compatibility
export * from './theme';

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
  onDomainUpdated,
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

  return (
    <Card className="w-full space-y-6 p-5 sm:p-7 shadow-xs">
      <ThemeFormHeader
        isUnpaid={isUnpaid}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        activeTemplateName={activeTemplate.name}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* ─── TAB CONTENT PANELS ─── */}
      <div className="pt-1">
        {activeTab === 'colors' && (
          <ThemeColorsSection
            primaryColor={primaryColor}
            onPrimaryColorChange={onPrimaryColorChange}
            secondaryColor={secondaryColor}
            onSecondaryColorChange={onSecondaryColorChange}
            layoutTemplateId={layoutTemplateId}
            showCustomPicker={showCustomPicker}
            setShowCustomPicker={setShowCustomPicker}
          />
        )}
        {activeTab === 'templates' && (
          <ThemeTemplatesSection
            layoutTemplateId={layoutTemplateId}
            onLayoutTemplateIdChange={onLayoutTemplateIdChange}
            planTier={planTier}
          />
        )}
        {activeTab === 'profile' && (
          <ThemeProfileSection
            effectivePhoto={effectivePhoto}
            officialPhotoUrl={officialPhotoUrl}
            profilePhotoUrl={profilePhotoUrl}
            allAvailablePhotos={allAvailablePhotos}
            showCatalogSelector={showCatalogSelector}
            setShowCatalogSelector={setShowCatalogSelector}
            isProcessingDirectPhoto={isProcessingDirectPhoto}
            directPhotoStatus={directPhotoStatus}
            fileInputRef={fileInputRef}
            onOfficialPhotoUrlChange={onOfficialPhotoUrlChange}
            handleDirectFileSelect={handleDirectFileSelect}
            headlineTagline={headlineTagline}
            onHeadlineTaglineChange={onHeadlineTaglineChange}
            bioBiography={bioBiography}
            onBioBiographyChange={onBioBiographyChange}
            currentAkdAssignment={currentAkdAssignment}
            partyAffiliation={partyAffiliation}
            handleUpdateCommission={handleUpdateCommission}
            handleUpdateFactionRole={handleUpdateFactionRole}
            handleAddAkdBody={handleAddAkdBody}
            handleUpdateAkdBody={handleUpdateAkdBody}
            handleRemoveAkdBody={handleRemoveAkdBody}
            currentVisionMission={currentVisionMission}
            handleUpdatePillar={handleUpdatePillar}
            currentActivities={currentActivities}
            handleAddActivity={handleAddActivity}
            handleRemoveActivity={handleRemoveActivity}
            handleUpdateActivity={handleUpdateActivity}
            handleActivityFileUpload={handleActivityFileUpload}
            currentCareers={currentCareers}
            handleAddCareer={handleAddCareer}
            handleRemoveCareer={handleRemoveCareer}
            handleUpdateCareer={handleUpdateCareer}
            profileEducation={profileEducation}
            profileCourses={profileCourses}
          />
        )}
        {activeTab === 'domain' && (
          <ThemeDomainSection
            subdomainSlug={subdomainSlug}
            customDomain={customDomain}
            onDomainUpdated={onDomainUpdated}
          />
        )}
        {activeTab === 'all' && (
          <div className="space-y-8 divide-y divide-slate-100 dark:divide-slate-800">
            <ThemeColorsSection
              primaryColor={primaryColor}
              onPrimaryColorChange={onPrimaryColorChange}
              secondaryColor={secondaryColor}
              onSecondaryColorChange={onSecondaryColorChange}
              layoutTemplateId={layoutTemplateId}
              showCustomPicker={showCustomPicker}
              setShowCustomPicker={setShowCustomPicker}
            />
            <div className="pt-6">
              <ThemeTemplatesSection
                layoutTemplateId={layoutTemplateId}
                onLayoutTemplateIdChange={onLayoutTemplateIdChange}
                planTier={planTier}
              />
            </div>
            <div className="pt-6">
              <ThemeProfileSection
                effectivePhoto={effectivePhoto}
                officialPhotoUrl={officialPhotoUrl}
                profilePhotoUrl={profilePhotoUrl}
                allAvailablePhotos={allAvailablePhotos}
                showCatalogSelector={showCatalogSelector}
                setShowCatalogSelector={setShowCatalogSelector}
                isProcessingDirectPhoto={isProcessingDirectPhoto}
                directPhotoStatus={directPhotoStatus}
                fileInputRef={fileInputRef}
                onOfficialPhotoUrlChange={onOfficialPhotoUrlChange}
                handleDirectFileSelect={handleDirectFileSelect}
                headlineTagline={headlineTagline}
                onHeadlineTaglineChange={onHeadlineTaglineChange}
                bioBiography={bioBiography}
                onBioBiographyChange={onBioBiographyChange}
                currentAkdAssignment={currentAkdAssignment}
                partyAffiliation={partyAffiliation}
                handleUpdateCommission={handleUpdateCommission}
                handleUpdateFactionRole={handleUpdateFactionRole}
                handleAddAkdBody={handleAddAkdBody}
                handleUpdateAkdBody={handleUpdateAkdBody}
                handleRemoveAkdBody={handleRemoveAkdBody}
                currentVisionMission={currentVisionMission}
                handleUpdatePillar={handleUpdatePillar}
                currentActivities={currentActivities}
                handleAddActivity={handleAddActivity}
                handleRemoveActivity={handleRemoveActivity}
                handleUpdateActivity={handleUpdateActivity}
                handleActivityFileUpload={handleActivityFileUpload}
                currentCareers={currentCareers}
                handleAddCareer={handleAddCareer}
                handleRemoveCareer={handleRemoveCareer}
                handleUpdateCareer={handleUpdateCareer}
                profileEducation={profileEducation}
                profileCourses={profileCourses}
              />
            </div>
            <div className="pt-6">
              <ThemeDomainSection
                subdomainSlug={subdomainSlug}
                customDomain={customDomain}
                onDomainUpdated={onDomainUpdated}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
