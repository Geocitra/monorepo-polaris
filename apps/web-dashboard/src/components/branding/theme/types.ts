import { PortalTemplateId } from '@polaris/shared-types';

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
}

export const CURATED_PALETTES: ColorPalette[] = [
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

export const PARTY_PRESETS: ColorPalette[] = [
  { name: 'Golkar', primary: '#F5B800', secondary: '#001529' },
  { name: 'PDI Perjuangan', primary: '#D60000', secondary: '#1A1A1A' },
  { name: 'Gerindra', primary: '#C92A2A', secondary: '#1E293B' },
  { name: 'NasDem', primary: '#0A2558', secondary: '#F26522' },
  { name: 'PKB', primary: '#008242', secondary: '#0D1117' },
  { name: 'PKS', primary: '#FF6600', secondary: '#1A1A1A' },
  { name: 'Demokrat', primary: '#0047AB', secondary: '#0F172A' },
  { name: 'PAN', primary: '#003399', secondary: '#111827' },
];

export const DEFAULT_WEBSITE_COLORS = {
  primary: '#1890FF',
  secondary: '#001529',
};

export type FormSectionTab = 'colors' | 'templates' | 'profile' | 'domain' | 'all';

export interface VisionMissionItem {
  title: string;
  subtitle?: string;
  description: string;
}

export const DEFAULT_VISION_MISSION: VisionMissionItem[] = [
  {
    title: 'Fungsi Legislasi',
    subtitle: 'Legislasikan Solusi Nyata',
    description: 'Mengawal penyusunan regulasi yang berpihak pada kesejahteraan rakyat, UMKM, dan kepastian hukum.',
  },
  {
    title: 'Fungsi Anggaran',
    subtitle: 'Pengawasan Anggaran Transparan',
    description: 'Memastikan alokasi belanja anggaran terealisasi tepat sasaran dan bebas dari inefisiensi.',
  },
  {
    title: 'Fungsi Representasi',
    subtitle: 'Pendampingan Konstituen Berkelanjutan',
    description: 'Menjaga interaksi langsung bersama warga melalui reses reguler dan advokasi aspirasi.',
  },
];

export interface CareerItem {
  role: string;
  period?: string;
  description: string;
}

export interface PerformanceActivityItem {
  id?: string;
  title: string;
  date?: string;
  location?: string;
  description: string;
  photoUrl?: string;
}

export interface CommissionAssignment {
  name?: string;
  role?: string;
  scope?: string;
  partners?: string;
}

export interface AkdBodyItem {
  id?: string;
  name: string;
  role: string;
  notes?: string;
}

export interface ParliamentaryAssignment {
  commission?: CommissionAssignment;
  factionRole?: string;
  akdBodies?: AkdBodyItem[];
}

export interface ThemeFormProps {
  primaryColor: string;
  onPrimaryColorChange: (val: string) => void;
  secondaryColor: string;
  onSecondaryColorChange: (val: string) => void;
  layoutTemplateId?: string;
  onLayoutTemplateIdChange?: (val: string) => void;
  planTier?: string | null;
  officialPhotoUrl: string;
  onOfficialPhotoUrlChange: (val: string) => void;
  profilePhotoUrl?: string;
  photoGallery?: string[];
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
  visionMission?: VisionMissionItem[];
  onVisionMissionChange?: (items: VisionMissionItem[]) => void;
  careers?: CareerItem[];
  onCareersChange?: (items: CareerItem[]) => void;
  activities?: PerformanceActivityItem[];
  onActivitiesChange?: (items: PerformanceActivityItem[]) => void;
  akdAssignment?: ParliamentaryAssignment;
  onAkdAssignmentChange?: (val: ParliamentaryAssignment) => void;
  memberCommissionName?: string;
  partyAffiliation?: string;
  profileEducation?: string;
  profileCourses?: string[];
  onDomainUpdated?: () => void;
}

