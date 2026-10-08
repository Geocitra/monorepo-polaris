import { SubdomainSlug } from '../value-objects/SubdomainSlug.js';
import { HexColor } from '../value-objects/HexColor.js';

export class PortalProfile {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly subdomain: SubdomainSlug,
    public primaryColor: HexColor,
    public secondaryColor: HexColor,
    public customDomain?: string | null,
    public isActive: boolean = true,
    public layoutTemplateId: string = 'standard-default',
  ) {}

  public updateBrandingColors(primary: HexColor, secondary: HexColor): void {
    this.primaryColor = primary;
    this.secondaryColor = secondary;
  }

  public updateLayoutTemplate(templateId: string, isPremiumTier: boolean): void {
    const cleanTemplateId = templateId.trim().toLowerCase();
    if (cleanTemplateId !== 'standard-default' && !isPremiumTier) {
      throw new Error(`[EntitlementViolation] Kustomisasi template layout tematik '${templateId}' memerlukan lisensi Premium.`);
    }
    this.layoutTemplateId = cleanTemplateId;
  }

  public attachCustomDomain(domain: string): void {
    const cleanDomain = domain.trim().toLowerCase();
    if (!/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/.test(cleanDomain)) {
      throw new Error(`[InvalidDomainError] Format custom domain '${domain}' tidak valid.`);
    }
    this.customDomain = cleanDomain;
  }

  public getHostDomain(rootDomain: string = 'polaris.id'): string {
    return this.customDomain ? this.customDomain : `${this.subdomain.getValue()}.${rootDomain}`;
  }
}
