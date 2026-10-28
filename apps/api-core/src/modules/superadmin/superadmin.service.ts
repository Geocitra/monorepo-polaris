import { Injectable, Logger } from '@nestjs/common';
import { LegislativeLevel } from '@polaris/shared-types';
import {
  SuperadminLoginDto,
  SuperadminSendOtpDto,
  SuperadminVerifyOtpDto,
  UpdateTenantStatusDto,
  VerifyTenantDto,
  ManualLicenseGrantDto,
  CreatePartyDto,
  UpdatePartyDto,
  CreateDapilDto,
  TopupTokenPoolDto,
  AdminCreateTenantDto,
  AdminUpdateLegislativeLevelDto,
  AdminResetTenantPasswordDto,
  AdminUpdatePricingMatrixDto,
} from './dto/superadmin.dto.js';
import {
  SuperadminAuthService,
  SuperadminDashboardService,
  SuperadminTenantService,
  SuperadminMasterDataService,
  SuperadminObservabilityService,
  SuperadminAuditService,
  SuperadminDomainService,
} from './services/index.js';

/**
 * SuperadminService (Facade Coordinator)
 *
 * Menerapkan pola Facade untuk mendelegasikan domain spesifik ke sub-services:
 * - SuperadminAuthService (Autentikasi, OTP, Profile)
 * - SuperadminDashboardService (Statistik Eksekutif)
 * - SuperadminTenantService (Siklus Akun Dewan, Lisensi B2B, Sandi)
 * - SuperadminMasterDataService (Partai, Dapil, Komisi, Pricing)
 * - SuperadminObservabilityService (Langfuse AI Telemetri, Token Pool)
 * - SuperadminAuditService (Audit Log & Agregat Token Member)
 * - SuperadminDomainService (Manajemen Pengajuan Domain, Cek DNS, Approval)
 */
@Injectable()
export class SuperadminService {
  private readonly logger = new Logger(SuperadminService.name);

  constructor(
    private readonly authService: SuperadminAuthService,
    private readonly dashboardService: SuperadminDashboardService,
    private readonly tenantService: SuperadminTenantService,
    private readonly masterDataService: SuperadminMasterDataService,
    private readonly observabilityService: SuperadminObservabilityService,
    private readonly auditService: SuperadminAuditService,
    private readonly domainService: SuperadminDomainService,
  ) {}

  // --- Domain: Autentikasi Superadmin ---
  async login(dto: SuperadminLoginDto) {
    return await this.authService.login(dto);
  }

  async sendOtp(dto: SuperadminSendOtpDto) {
    return await this.authService.sendOtp(dto);
  }

  async verifyOtp(dto: SuperadminVerifyOtpDto) {
    return await this.authService.verifyOtp(dto);
  }

  async getProfile(adminId: string) {
    return await this.authService.getProfile(adminId);
  }

  // --- Domain: Dashboard Eksekutif ---
  async getDashboardStats() {
    return await this.dashboardService.getDashboardStats();
  }

  // --- Domain: Tenant & Siklus Akun Dewan ---
  async getTenants(search?: string, party?: string) {
    return await this.tenantService.getTenants(search, party);
  }

  async verifyTenant(tenantId: string, dto: VerifyTenantDto) {
    return await this.tenantService.verifyTenant(tenantId, dto);
  }

  async updateTenantStatus(tenantId: string, dto: UpdateTenantStatusDto) {
    return await this.tenantService.updateTenantStatus(tenantId, dto);
  }

  async grantManualLicense(tenantId: string, dto: ManualLicenseGrantDto) {
    return await this.tenantService.grantManualLicense(tenantId, dto);
  }

  async createTenantWithCredentials(dto: AdminCreateTenantDto) {
    return await this.tenantService.createTenantWithCredentials(dto);
  }

  async updateTenantLegislativeLevel(tenantId: string, dto: AdminUpdateLegislativeLevelDto) {
    return await this.tenantService.updateTenantLegislativeLevel(tenantId, dto);
  }

  async resetTenantPassword(tenantId: string, dto: AdminResetTenantPasswordDto) {
    return await this.tenantService.resetTenantPassword(tenantId, dto);
  }

  // --- Domain: Master Data (Partai, Dapil, Komisi, Tarif) ---
  async getParties() {
    return await this.masterDataService.getParties();
  }

  async createParty(dto: CreatePartyDto) {
    return await this.masterDataService.createParty(dto);
  }

  async updateParty(partyId: string, dto: UpdatePartyDto) {
    return await this.masterDataService.updateParty(partyId, dto);
  }

  async getDapils() {
    return await this.masterDataService.getDapils();
  }

  async createDapil(dto: CreateDapilDto) {
    return await this.masterDataService.createDapil(dto);
  }

  async getCommissions(level?: string) {
    return await this.masterDataService.getCommissions(level);
  }

  async createCommission(dto: {
    legislativeLevel: any;
    code: string;
    name: string;
    focusAreas?: string[];
    partnerMinistries?: string[];
  }) {
    return await this.masterDataService.createCommission(dto);
  }

  async updateCommission(
    id: string,
    dto: {
      legislativeLevel?: any;
      code?: string;
      name?: string;
      focusAreas?: string[];
      partnerMinistries?: string[];
    },
  ) {
    return await this.masterDataService.updateCommission(id, dto);
  }

  async getPricingMatrices(level?: LegislativeLevel) {
    return await this.masterDataService.getPricingMatrices(level);
  }

  async updatePricingMatrix(id: string, dto: AdminUpdatePricingMatrixDto) {
    return await this.masterDataService.updatePricingMatrix(id, dto);
  }

  // --- Domain: AI Observability & Saldo Token Pool ---
  async getAiObservability() {
    return await this.observabilityService.getAiObservability();
  }

  async topupMasterTokenPool(dto: TopupTokenPoolDto) {
    return await this.observabilityService.topupMasterTokenPool(dto);
  }

  async getAiTraces(limit: number = 20) {
    return await this.observabilityService.getAiTraces(limit);
  }

  // --- Domain: Audit Log & Aktivitas Anggota Dewan ---
  async getMemberActivitySummary(query: {
    search?: string;
    dapilId?: string;
    party?: string;
    commissionId?: string;
    page?: number;
    limit?: number;
  }) {
    return await this.auditService.getMemberActivitySummary(query);
  }

  async getMemberActivityLogs(
    tenantId: string,
    query: { category?: string; page?: number; limit?: number },
  ) {
    return await this.auditService.getMemberActivityLogs(tenantId, query);
  }

  // --- Domain: Pengelolaan Tiket Pengajuan Domain ---
  async getDomainRequests(status?: string) {
    return await this.domainService.getDomainRequests(status);
  }

  async checkDnsForDomainRequest(requestId: string) {
    return await this.domainService.checkDns(requestId);
  }

  async approveDomainRequest(requestId: string, adminUserId: string) {
    return await this.domainService.approveDomainRequest(requestId, adminUserId);
  }

  async rejectDomainRequest(requestId: string, adminNotes: string, adminUserId: string) {
    return await this.domainService.rejectDomainRequest(requestId, adminNotes, adminUserId);
  }
}

