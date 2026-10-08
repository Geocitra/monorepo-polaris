import { PlanTier } from '@polaris/shared-types';

export interface TierEntitlement {
  tier: PlanTier;
  displayName: string;
  badge: string;
  tagline: string;
  thematicLayoutsEnabled: boolean;
  customDomainEnabled: boolean;
  spkProcurementEnabled: boolean;
  priorityQueueEnabled: boolean;
  allowedTemplateIds: readonly string[];
}

export class EntitlementPolicy {
  private static readonly POLICY_REGISTRY: Record<PlanTier, TierEntitlement> = {
    [PlanTier.STARTER]: {
      tier: PlanTier.STARTER,
      displayName: 'Standar Parlemen',
      badge: 'Standar',
      tagline: 'Esensial untuk penyusunan naskah kebijakan dan portal resmi default.',
      thematicLayoutsEnabled: false,
      customDomainEnabled: false,
      spkProcurementEnabled: false,
      priorityQueueEnabled: false,
      allowedTemplateIds: ['standard-default'],
    },
    [PlanTier.PRO]: {
      tier: PlanTier.PRO,
      displayName: 'Eksekutif Suite',
      badge: 'Rekomendasi Fraksi',
      tagline: 'Solusi paripurna dengan layout tematik eksklusif, custom domain, dan dokumen resmi SPK Setwan.',
      thematicLayoutsEnabled: true,
      customDomainEnabled: true,
      spkProcurementEnabled: true,
      priorityQueueEnabled: true,
      allowedTemplateIds: ['standard-default', 'editorial-prestige', 'baliho-hero', 'newsroom-brief'],
    },
  };

  public static getEntitlement(tier: PlanTier | string): TierEntitlement {
    const key = (tier || PlanTier.STARTER).toUpperCase();
    if (key === 'PRO' || key === 'VIP' || key === 'ENTERPRISE') {
      return this.POLICY_REGISTRY[PlanTier.PRO];
    }
    return this.POLICY_REGISTRY[PlanTier.STARTER];
  }

  public static isTemplateAllowed(tier: PlanTier | string, templateId: string): boolean {
    const entitlement = this.getEntitlement(tier);
    const cleanId = templateId.trim().toLowerCase();
    return entitlement.allowedTemplateIds.includes(cleanId);
  }
}
