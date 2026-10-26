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
};
