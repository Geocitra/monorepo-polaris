import { Injectable, Logger } from '@nestjs/common';
import {
  UpdateThemeSettingsDto,
  UpdateDomainConfigDto,
  CreatePortalDocumentRequestDto,
  CreateDomainRequestDto,
} from './dto/cms.dto.js';
import {
  CmsDomainDnsService,
  CmsPortalConfigService,
  CmsPublicPortalService,
  CmsDocumentVaultService,
} from './services/index.js';

/**
 * CmsService (Facade Coordinator)
 *
 * Menerapkan pola Facade untuk mendelegasikan domain CMS ke sub-services:
 * - CmsDomainDnsService (Verifikasi DNS CNAME/TXT, Validasi Custom Domain, Proteksi SSRF)
 * - CmsPortalConfigService (Pengaturan Konfigurasi Portal, Tema, dan Layout)
 * - CmsPublicPortalService (Layanan Publik Website Dewan & Detail Naskah Terbit)
 * - CmsDocumentVaultService (Dokumen Publik, Unduhan, dan Buletin Newsletter)
 */
@Injectable()
export class CmsService {
  private readonly logger = new Logger(CmsService.name);

  constructor(
    private readonly domainDnsService: CmsDomainDnsService,
    private readonly portalConfigService: CmsPortalConfigService,
    private readonly publicPortalService: CmsPublicPortalService,
    private readonly documentVaultService: CmsDocumentVaultService,
  ) {}

  // --- Domain: Pengaturan Portal & Tema ---
  async getMyPortalConfig(tenantId: string) {
    return await this.portalConfigService.getMyPortalConfig(tenantId);
  }

  async updateThemeSettings(tenantId: string, dto: UpdateThemeSettingsDto) {
    return await this.portalConfigService.updateThemeSettings(tenantId, dto);
  }

  // --- Domain: Domain Kustom & Verifikasi DNS ---
  async updateDomainConfig(tenantId: string, dto: UpdateDomainConfigDto) {
    return await this.domainDnsService.updateDomainConfig(tenantId, dto);
  }

  async verifyCustomDomainDns(tenantId: string) {
    return await this.domainDnsService.verifyCustomDomainDns(tenantId);
  }

  async checkCustomDomainAllowed(domain?: string): Promise<boolean> {
    return await this.domainDnsService.checkCustomDomainAllowed(domain);
  }

  // --- Domain: Pengajuan Domain Tenant ---
  async submitDomainRequest(tenantId: string, dto: CreateDomainRequestDto) {
    return await this.domainDnsService.submitDomainRequest(tenantId, dto);
  }

  async getMyDomainRequests(tenantId: string) {
    return await this.domainDnsService.getMyDomainRequests(tenantId);
  }

  // --- Domain: Website Publik Dewan ---
  async getPublicPortalBySlug(slugOrDomain: string) {
    return await this.publicPortalService.getPublicPortalBySlug(slugOrDomain);
  }

  async getPublicArticleBySlug(slugOrDomain: string, articleSlug: string) {
    return await this.publicPortalService.getPublicArticleBySlug(slugOrDomain, articleSlug);
  }

  // --- Domain: Vault Dokumen & Newsletter ---
  async getPortalDocuments(tenantId: string) {
    return await this.documentVaultService.getPortalDocuments(tenantId);
  }

  async createPortalDocument(tenantId: string, dto: CreatePortalDocumentRequestDto) {
    return await this.documentVaultService.createPortalDocument(tenantId, dto);
  }

  async deletePortalDocument(tenantId: string, id: string) {
    return await this.documentVaultService.deletePortalDocument(tenantId, id);
  }

  async trackDocumentDownload(slugOrDomain: string, docId: string) {
    return await this.documentVaultService.trackDocumentDownload(slugOrDomain, docId);
  }

  async subscribeNewsletter(slug: string, email: string) {
    return await this.documentVaultService.subscribeNewsletter(slug, email);
  }

  async getNewsletterSubscribers(tenantId: string) {
    return await this.documentVaultService.getNewsletterSubscribers(tenantId);
  }
}
