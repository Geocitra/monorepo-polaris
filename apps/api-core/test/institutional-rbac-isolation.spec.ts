import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import {
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
  LkpjFindingReviewStatus,
} from '@polaris/shared-types';

const { mockSelectLimit, mockDbSelect, mockDbUpdate, mockUpdateReturning, mockDbExecute } =
  vi.hoisted(() => {
    const mockSelectLimit = vi.fn();
    const mockDbSelect = vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: mockSelectLimit,
        })),
      })),
    }));

    const mockUpdateReturning = vi.fn();
    const mockDbUpdate = vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: mockUpdateReturning,
        })),
      })),
    }));

    const mockDbExecute = vi.fn();

    return { mockSelectLimit, mockDbSelect, mockDbUpdate, mockUpdateReturning, mockDbExecute };
  });

vi.mock('@polaris/database', () => ({
  db: {
    select: mockDbSelect,
    update: mockDbUpdate,
    execute: mockDbExecute,
  },
  organizations: { id: 'id' },
  organizationUnits: { id: 'id', organizationId: 'organization_id', name: 'name' },
  organizationUnitMemberships: {
    organizationId: 'organization_id',
    unitId: 'unit_id',
    tenantId: 'tenant_id',
    unitRole: 'unit_role',
    status: 'status',
  },
  organizationMemberships: {
    organizationId: 'organization_id',
    tenantId: 'tenant_id',
    orgRole: 'org_role',
    status: 'status',
  },
  lkpjFindings: {
    id: 'id',
    workspaceId: 'workspace_id',
    organizationId: 'organization_id',
  },
  performanceEvidenceRegisters: {
    id: 'id',
    organizationId: 'organization_id',
  },
  tenantMembers: { id: 'id', fullName: 'full_name', email: 'email' },
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
  and: vi.fn((...args) => ({ and: args })),
  asc: vi.fn((a) => ({ asc: a })),
  desc: vi.fn((a) => ({ desc: a })),
  sql: vi.fn((strings: TemplateStringsArray, ...vals: any[]) => ({ sql: strings.join('?'), vals })),
}));

import { InstitutionalGovernanceService } from '../src/modules/institutional/institutional-governance.service.js';
import { LkpjEvaluationService } from '../src/modules/institutional/lkpj-evaluation.service.js';
import { ParliamentaryLegislationService } from '../src/modules/institutional/parliamentary-legislation.service.js';

describe('Institutional RBAC, Isolasi Bidang, & Maker-Checker Guards', () => {
  let governance: InstitutionalGovernanceService;
  let lkpjService: LkpjEvaluationService;
  let legislationService: ParliamentaryLegislationService;

  beforeEach(() => {
    vi.clearAllMocks();
    governance = new InstitutionalGovernanceService();
    vi.spyOn(governance, 'recordAudit').mockResolvedValue(undefined as any);
    lkpjService = new LkpjEvaluationService(governance, {} as any, {} as any);
    legislationService = new ParliamentaryLegislationService(governance, {} as any);
  });

  describe('Isolasi Akses Unit/Bidang (assertUserUnitMembershipOrOrgAdmin)', () => {
    it('mengizinkan ORG_ADMIN dan LEADERSHIP tanpa keanggotaan unit eksplisit', async () => {
      mockSelectLimit
        .mockResolvedValueOnce([{ id: 'unit-b', organizationId: 'org-1', isActive: true }])
        .mockResolvedValueOnce([{ id: 'unit-b', organizationId: 'org-1', isActive: true }]);

      await expect(
        governance.assertUserUnitMembershipOrOrgAdmin(
          'org-1',
          'unit-b',
          'admin-tenant',
          OrganizationMemberRole.ORG_ADMIN
        )
      ).resolves.toBeUndefined();

      await expect(
        governance.assertUserUnitMembershipOrOrgAdmin(
          'org-1',
          'unit-b',
          'leader-tenant',
          OrganizationMemberRole.LEADERSHIP
        )
      ).resolves.toBeUndefined();

      // Hanya query validasi unit aktif (2x), tidak query keanggotaan unit
      expect(mockDbSelect).toHaveBeenCalledTimes(2);
    });

    it('menolak (403 Forbidden) anggota Bidang A yang mencoba mengakses Bidang B', async () => {
      mockSelectLimit
        .mockResolvedValueOnce([{ id: 'unit-b', organizationId: 'org-1', isActive: true }])
        .mockResolvedValueOnce([]);

      await expect(
        governance.assertUserUnitMembershipOrOrgAdmin(
          'org-1',
          'unit-b',
          'member-a',
          OrganizationMemberRole.MEMBER
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('mengizinkan anggota aktif yang terdaftar di unit tersebut', async () => {
      mockSelectLimit
        .mockResolvedValueOnce([{ id: 'unit-a', organizationId: 'org-1', isActive: true }])
        .mockResolvedValueOnce([{ id: 'mem-1', unitRole: OrganizationUnitMemberRole.MEMBER }]);

      await expect(
        governance.assertUserUnitMembershipOrOrgAdmin(
          'org-1',
          'unit-a',
          'member-a',
          OrganizationMemberRole.MEMBER
        )
      ).resolves.toBeUndefined();
    });
  });

  describe('Delegasi Manajemen Anggota Unit oleh UNIT_LEAD (assertUserIsUnitLeadOrOrgAdmin)', () => {
    it('mengizinkan UNIT_LEAD mengelola anggota unitnya sendiri', async () => {
      mockSelectLimit
        .mockResolvedValueOnce([{ id: 'unit-a', organizationId: 'org-1', isActive: true }])
        .mockResolvedValueOnce([{ id: 'mem-lead', unitRole: OrganizationUnitMemberRole.UNIT_LEAD }])
        .mockResolvedValueOnce([
          { id: 'mem-lead', unitRole: OrganizationUnitMemberRole.UNIT_LEAD },
        ]);

      await expect(
        governance.assertUserIsUnitLeadOrOrgAdmin(
          'org-1',
          'unit-a',
          'lead-a',
          OrganizationMemberRole.MEMBER
        )
      ).resolves.toBeUndefined();
    });

    it('menolak (403 Forbidden) anggota biasa atau tenaga ahli non-UNIT_LEAD', async () => {
      mockSelectLimit
        .mockResolvedValueOnce([{ id: 'unit-a', organizationId: 'org-1', isActive: true }])
        .mockResolvedValueOnce([
          { id: 'mem-staff', unitRole: OrganizationUnitMemberRole.EXPERT_STAFF },
        ])
        .mockResolvedValueOnce([]);

      await expect(
        governance.assertUserIsUnitLeadOrOrgAdmin(
          'org-1',
          'unit-a',
          'staff-a',
          OrganizationMemberRole.EXPERT_STAFF
        )
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('RBAC Pengesahan Rekomendasi Paripurna LKPJ (reviewFinding)', () => {
    it('menolak (403 Forbidden) anggota non-ORG_ADMIN/non-LEADERSHIP saat mempromosikan temuan ke OFFICIAL_RECOMMENDATION', async () => {
      mockSelectLimit.mockResolvedValueOnce([
        {
          id: 'finding-1',
          workspaceId: 'ws-1',
          organizationId: 'org-1',
          originUnitId: 'unit-a',
          reviewStatus: LkpjFindingReviewStatus.CONSOLIDATED_FOR_PLENARY,
          proposedRecommendation: 'Rekomendasi resmi perbaikan kinerja OPD terkait.',
        },
      ]);

      await expect(
        lkpjService.reviewFinding(
          'org-1',
          'ws-1',
          'finding-1',
          'lead-a',
          OrganizationMemberRole.MEMBER,
          OrganizationUnitMemberRole.UNIT_LEAD,
          {
            reviewStatus: LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION,
          }
        )
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Maker-Checker Verifikasi Bukti Kinerja (verifyPerformanceEvidence)', () => {
    it('menolak (403 Forbidden) pembuat klaim yang mencoba memverifikasi catatannya sendiri', async () => {
      mockSelectLimit.mockResolvedValueOnce([
        {
          id: 'ev-1',
          organizationId: 'org-1',
          unitId: 'unit-a',
          tenantId: 'creator-1',
          isVerified: false,
        },
      ]);

      await expect(
        legislationService.verifyPerformanceEvidence(
          'org-1',
          'ev-1',
          'creator-1',
          OrganizationMemberRole.EXPERT_STAFF,
          OrganizationUnitMemberRole.REVIEWER
        )
      ).rejects.toThrow(/Maker-Checker Violation/);
    });

    it('mengizinkan penelaah berbeda memverifikasi catatan bukti kinerja', async () => {
      mockSelectLimit.mockResolvedValueOnce([
        {
          id: 'ev-1',
          organizationId: 'org-1',
          unitId: 'unit-a',
          tenantId: 'creator-1',
          isVerified: false,
        },
      ]);
      mockUpdateReturning.mockResolvedValueOnce([
        {
          id: 'ev-1',
          organizationId: 'org-1',
          unitId: 'unit-a',
          tenantId: 'creator-1',
          title: 'Perda Pendidikan',
          isVerified: true,
          verifiedByTenantId: 'reviewer-2',
          verifiedAt: new Date(),
          createdAt: new Date(),
        },
      ]);
      mockDbExecute.mockResolvedValueOnce({
        rows: [
          {
            id: 'ev-1',
            organization_id: 'org-1',
            unit_id: 'unit-a',
            tenant_id: 'creator-1',
            claim_category: 'LEGISLASI',
            title: 'Perda Pendidikan',
            claim_statement: 'Sudah disahkan',
            metric_value: '100%',
            supporting_evidence_ids: [],
            is_verified: true,
            verified_by_tenant_id: 'reviewer-2',
            verified_at: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      const res = await legislationService.verifyPerformanceEvidence(
        'org-1',
        'ev-1',
        'reviewer-2',
        OrganizationMemberRole.MEMBER,
        OrganizationUnitMemberRole.REVIEWER
      );

      expect(res.isVerified).toBe(true);
      expect(res.verifiedByTenantId).toBe('reviewer-2');
    });
  });
});
