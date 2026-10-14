import { PortalTemplateId, PortalSectionType } from '@polaris/shared-types';

export interface SectionDescriptor {
  id: string;
  type: PortalSectionType | string;
  variant?: string;
  enabled: boolean;
  order: number;
  config?: Record<string, any>;
}

export interface PresetLayoutDefinition {
  templatePreset: PortalTemplateId | string;
  name: string;
  description: string;
  sections: SectionDescriptor[];
}

export const DEFAULT_PRESET_LAYOUTS: Record<string, PresetLayoutDefinition> = {
  [PortalTemplateId.POLARIS_INSIGHT]: {
    templatePreset: PortalTemplateId.POLARIS_INSIGHT,
    name: 'POLARIS Negarawan (Politikus Resmi Flagship)',
    description: 'Tata letak berwibawa khas negarawan parlemen: Foto standing resmi, siluet Parlemen DPR RI, 3 kartu artikel terkini, dan 4 infografis capaian akuntabilitas.',
    sections: [
      { id: 'sec-hero-stand', type: PortalSectionType.HERO_PARLIAMENT_STAND, variant: 'DIGNITY_CLASSIC', enabled: true, order: 1 },
      { id: 'sec-category-grid', type: PortalSectionType.ARTICLES_CATEGORY_GRID, variant: 'CARDS_3_COL', enabled: true, order: 2 },
      { id: 'sec-infographics', type: PortalSectionType.METRICS_INFOGRAPHIC_DOCK, variant: 'CARDS_4_COL', enabled: true, order: 3 },
    ],
  },
  [PortalTemplateId.STANDARD_DEFAULT]: {
    templatePreset: PortalTemplateId.STANDARD_DEFAULT,
    name: 'Standar Parlemen (Klasik & Resmi)',
    description: 'Format kenegaraan klasik yang seimbang antara profil dewan, warta kinerja, dan infografis capaian.',
    sections: [
      { id: 'sec-hero-stand', type: PortalSectionType.HERO_PARLIAMENT_STAND, variant: 'DIGNITY_CLASSIC', enabled: true, order: 1 },
      { id: 'sec-category-grid', type: PortalSectionType.ARTICLES_CATEGORY_GRID, variant: 'CARDS_3_COL', enabled: true, order: 2 },
      { id: 'sec-infographics', type: PortalSectionType.METRICS_INFOGRAPHIC_DOCK, variant: 'CARDS_4_COL', enabled: true, order: 3 },
    ],
  },
  [PortalTemplateId.EDITORIAL_PRESTIGE]: {
    templatePreset: PortalTemplateId.EDITORIAL_PRESTIGE,
    name: 'Editorial Prestige (Risalah Kebijakan)',
    description: 'Estetika jurnal kebijakan intelektual dengan tipografi serif elegan, headline telaah legislatif, dan list opini terhangat samping.',
    sections: [
      { id: 'sec-hero-featured', type: PortalSectionType.HERO_FEATURED_STORY, variant: 'EDITORIAL_SERIF', enabled: true, order: 1 },
      { id: 'sec-trending-sidebar', type: PortalSectionType.ARTICLES_TRENDING_SIDEBAR, variant: 'EDITORIAL_LIST', enabled: true, order: 2 },
      { id: 'sec-category-grid', type: PortalSectionType.ARTICLES_CATEGORY_GRID, variant: 'EDITORIAL_CARDS', enabled: true, order: 3 },
      { id: 'sec-infographics', type: PortalSectionType.METRICS_INFOGRAPHIC_DOCK, variant: 'CARDS_4_COL', enabled: true, order: 4 },
    ],
  },
  [PortalTemplateId.BALIHO_HERO]: {
    templatePreset: PortalTemplateId.BALIHO_HERO,
    name: 'Advokasi Kerakyatan (Aksi Lapangan & Video)',
    description: 'Visual masif untuk resonansi konstituen dengan video ambient menyapa warga, galeri foto reses, dan infografis capaian.',
    sections: [
      { id: 'sec-hero-video', type: PortalSectionType.HERO_VIDEO_LOOP, variant: 'COMMUNITY_LOOP', enabled: true, order: 1 },
      { id: 'sec-gallery', type: PortalSectionType.PHOTOJOURNALISM_GALLERY, variant: 'MASONRY_GRID', enabled: true, order: 2 },
      { id: 'sec-category-grid', type: PortalSectionType.ARTICLES_CATEGORY_GRID, variant: 'CARDS_3_COL', enabled: true, order: 3 },
      { id: 'sec-infographics', type: PortalSectionType.METRICS_INFOGRAPHIC_DOCK, variant: 'CARDS_4_COL', enabled: true, order: 4 },
    ],
  },
  [PortalTemplateId.NEWSROOM_BRIEF]: {
    templatePreset: PortalTemplateId.NEWSROOM_BRIEF,
    name: 'Ruang Berita Pers (Newsroom Press Wire)',
    description: 'Format agregasi siaran pers biro pemberitaan kepresidenan dengan breaking lead story dan rilis cepat.',
    sections: [
      { id: 'sec-hero-featured', type: PortalSectionType.HERO_FEATURED_STORY, variant: 'PRESS_WIRE_LEAD', enabled: true, order: 1 },
      { id: 'sec-trending-sidebar', type: PortalSectionType.ARTICLES_TRENDING_SIDEBAR, variant: 'PRESS_CHRONO', enabled: true, order: 2 },
      { id: 'sec-category-grid', type: PortalSectionType.ARTICLES_CATEGORY_GRID, variant: 'CARDS_3_COL', enabled: true, order: 3 },
      { id: 'sec-infographics', type: PortalSectionType.METRICS_INFOGRAPHIC_DOCK, variant: 'CARDS_4_COL', enabled: true, order: 4 },
    ],
  },
};
