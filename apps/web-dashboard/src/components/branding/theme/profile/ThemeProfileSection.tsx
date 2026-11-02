'use client';

import React from 'react';
import { User } from 'lucide-react';
import { ThemeOfficialPhotoCard } from './ThemeOfficialPhotoCard';
import { ThemeHeadlineBioCard } from './ThemeHeadlineBioCard';
import { ThemeAkdCard } from './ThemeAkdCard';
import { ThemeVisionMissionCard } from './ThemeVisionMissionCard';
import { ThemeActivitiesCard } from './ThemeActivitiesCard';
import { ThemeCareerCard } from './ThemeCareerCard';
import { ThemeEducationCard } from './ThemeEducationCard';
import {
  ParliamentaryAssignment,
  CommissionAssignment,
  AkdBodyItem,
  VisionMissionItem,
  PerformanceActivityItem,
  CareerItem,
} from '../types';

interface AvailablePhotoItem {
  url: string;
  label: string;
  isPrimaryProfile?: boolean;
}

interface ThemeProfileSectionProps {
  effectivePhoto: string;
  officialPhotoUrl: string;
  profilePhotoUrl?: string;
  allAvailablePhotos: AvailablePhotoItem[];
  showCatalogSelector: boolean;
  setShowCatalogSelector: (show: boolean | ((prev: boolean) => boolean)) => void;
  isProcessingDirectPhoto: boolean;
  directPhotoStatus: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onOfficialPhotoUrlChange: (url: string) => void;
  handleDirectFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  headlineTagline: string;
  onHeadlineTaglineChange: (val: string) => void;
  bioBiography: string;
  onBioBiographyChange: (val: string) => void;
  currentAkdAssignment: ParliamentaryAssignment;
  partyAffiliation?: string;
  handleUpdateCommission: (field: keyof CommissionAssignment, val: string) => void;
  handleUpdateFactionRole: (val: string) => void;
  handleAddAkdBody: (presetName?: string) => void;
  handleUpdateAkdBody: (index: number, field: keyof AkdBodyItem, val: string) => void;
  handleRemoveAkdBody: (index: number) => void;
  currentVisionMission: VisionMissionItem[];
  handleUpdatePillar: (index: number, field: keyof VisionMissionItem, val: string) => void;
  currentActivities: PerformanceActivityItem[];
  handleAddActivity: () => void;
  handleRemoveActivity: (index: number) => void;
  handleUpdateActivity: (index: number, field: keyof PerformanceActivityItem, val: string) => void;
  handleActivityFileUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  currentCareers: CareerItem[];
  handleAddCareer: () => void;
  handleRemoveCareer: (index: number) => void;
  handleUpdateCareer: (index: number, field: keyof CareerItem, val: string) => void;
  profileEducation?: string;
  profileCourses?: string[];
}

export function ThemeProfileSection({
  effectivePhoto,
  officialPhotoUrl,
  profilePhotoUrl,
  allAvailablePhotos,
  showCatalogSelector,
  setShowCatalogSelector,
  isProcessingDirectPhoto,
  directPhotoStatus,
  fileInputRef,
  onOfficialPhotoUrlChange,
  handleDirectFileSelect,
  headlineTagline,
  onHeadlineTaglineChange,
  bioBiography,
  onBioBiographyChange,
  currentAkdAssignment,
  partyAffiliation,
  handleUpdateCommission,
  handleUpdateFactionRole,
  handleAddAkdBody,
  handleUpdateAkdBody,
  handleRemoveAkdBody,
  currentVisionMission,
  handleUpdatePillar,
  currentActivities,
  handleAddActivity,
  handleRemoveActivity,
  handleUpdateActivity,
  handleActivityFileUpload,
  currentCareers,
  handleAddCareer,
  handleRemoveCareer,
  handleUpdateCareer,
  profileEducation,
  profileCourses,
}: ThemeProfileSectionProps) {
  return (
    <div className="space-y-4">
      {/* SECTION TITLE */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Identitas &amp; Konten Website Dewan</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola foto profil resmi, tagline visi perjuangan, dan biografi narasi publikasi portal.
          </p>
        </div>
      </div>

      {/* ─── KARTU FOTO RESMI DEWAN & KATALOG PILIHAN ─── */}
      <ThemeOfficialPhotoCard
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
      />

      {/* ─── KONTEN NARASI & VISI PUBLIK ─── */}
      <ThemeHeadlineBioCard
        headlineTagline={headlineTagline}
        onHeadlineTaglineChange={onHeadlineTaglineChange}
        bioBiography={bioBiography}
        onBioBiographyChange={onBioBiographyChange}
      />

      {/* ─── PENUGASAN KOMISI & ALAT KELENGKAPAN DEWAN (AKD) ─── */}
      <ThemeAkdCard
        currentAkdAssignment={currentAkdAssignment}
        partyAffiliation={partyAffiliation}
        handleUpdateCommission={handleUpdateCommission}
        handleUpdateFactionRole={handleUpdateFactionRole}
        handleAddAkdBody={handleAddAkdBody}
        handleUpdateAkdBody={handleUpdateAkdBody}
        handleRemoveAkdBody={handleRemoveAkdBody}
      />

      {/* ─── PILAR FOKUS & KOMITMEN PENGABDIAN (3 PILAR PARLEMEN) ─── */}
      <ThemeVisionMissionCard
        currentVisionMission={currentVisionMission}
        handleUpdatePillar={handleUpdatePillar}
      />

      {/* ─── DOKUMENTASI KINERJA TURUN KE DAPIL ─── */}
      <ThemeActivitiesCard
        currentActivities={currentActivities}
        handleAddActivity={handleAddActivity}
        handleRemoveActivity={handleRemoveActivity}
        handleUpdateActivity={handleUpdateActivity}
        handleActivityFileUpload={handleActivityFileUpload}
      />

      {/* ─── RIWAYAT PENUGASAN & REKAM JEJAK KARIR (DINAMIS) ─── */}
      <ThemeCareerCard
        currentCareers={currentCareers}
        handleAddCareer={handleAddCareer}
        handleRemoveCareer={handleRemoveCareer}
        handleUpdateCareer={handleUpdateCareer}
      />

      {/* ─── KREDENSIAL PENDIDIKAN & KURSUS RESMI (TERINTEGRASI) ─── */}
      <ThemeEducationCard
        profileEducation={profileEducation}
        profileCourses={profileCourses}
      />
    </div>
  );
}

