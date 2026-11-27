import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import {
  db,
  organizationContracts,
  organizationMemberQuotaWallets,
  eq,
  and,
  desc,
  sql,
} from '@polaris/database';
import {
  InstitutionalQuotaFeatureScope,
  type OrganizationMemberQuotaDto,
  type InstitutionalUsageAnalyticsDto,
  type OrganizationMemberRole,
  type OrganizationUnitType,
} from '@polaris/shared-types';
import { getCurrentWibWeeklyPeriod } from '../whatsapp/contact-sanitizer.util.js';

const FEATURE_LABELS: Record<InstitutionalQuotaFeatureScope, string> = {
  [InstitutionalQuotaFeatureScope.COORDINATOR_CHAT]: 'Chat POLARIS',
  [InstitutionalQuotaFeatureScope.LKPJ_EVALUATION]: 'Evaluasi LKPJ',
  [InstitutionalQuotaFeatureScope.LEGISLATION]: 'Legislasi & Kepatuhan',
  [InstitutionalQuotaFeatureScope.GLOBAL]: 'Umum Instansi',
};

@Injectable()
export class InstitutionalQuotaService {
  private readonly logger = new Logger(InstitutionalQuotaService.name);
  /**
   * Mengambil konfigurasi kuota per anggota dari kontrak B2G aktif (default 3x/minggu & 3x revisi/item).
   */
  async getContractQuotaConfig(organizationId: string): Promise<{
    weeklyLimit: number;
    revisionLimitPerItem: number;
  }> {
    const [contract] = await db
      .select({
        weeklyGenerateLimitPerMember: organizationContracts.weeklyGenerateLimitPerMember,
        revisionLimitPerItem: organizationContracts.revisionLimitPerItem,
      })
      .from(organizationContracts)
      .where(eq(organizationContracts.organizationId, organizationId))
      .orderBy(desc(organizationContracts.endDate))
      .limit(1);

    return {
      weeklyLimit: Math.max(1, Number(contract?.weeklyGenerateLimitPerMember ?? 3)),
      revisionLimitPerItem: Math.max(0, Number(contract?.revisionLimitPerItem ?? 3)),
    };
  }

  private resolveFeatureWeeklyLimit(
    featureScope: InstitutionalQuotaFeatureScope,
    contractWeeklyLimit: number
  ): number {
    if (featureScope === InstitutionalQuotaFeatureScope.COORDINATOR_CHAT) {
      return Math.max(10, contractWeeklyLimit);
    }
    return contractWeeklyLimit;
  }

  /**
   * Mengambil status kuota mingguan anggota instansi saat ini (per fitur + ringkasan byFeature).
   */
  async getMemberQuota(
    organizationId: string,
    tenantId: string,
    featureScope: InstitutionalQuotaFeatureScope = InstitutionalQuotaFeatureScope.COORDINATOR_CHAT
  ): Promise<OrganizationMemberQuotaDto> {
    const weeklyPeriodKey = getCurrentWibWeeklyPeriod();
    const { weeklyLimit: contractLimit, revisionLimitPerItem } =
      await this.getContractQuotaConfig(organizationId);

    const wallets = await db
      .select()
      .from(organizationMemberQuotaWallets)
      .where(
        and(
          eq(organizationMemberQuotaWallets.organizationId, organizationId),
          eq(organizationMemberQuotaWallets.tenantId, tenantId),
          eq(organizationMemberQuotaWallets.weeklyPeriodKey, weeklyPeriodKey)
        )
      );

    const byScope = new Map(wallets.map((w) => [w.featureScope, w]));

    const buildSummary = (scope: InstitutionalQuotaFeatureScope) => {
      const w = byScope.get(scope);
      const limit = w?.weeklyLimit ?? this.resolveFeatureWeeklyLimit(scope, contractLimit);
      const used = w?.weeklyUsed ?? 0;
      return {
        weeklyLimit: limit,
        weeklyUsed: used,
        remainingWeekly: Math.max(0, limit - used),
      };
    };

    const byFeature = {
      COORDINATOR_CHAT: buildSummary(InstitutionalQuotaFeatureScope.COORDINATOR_CHAT),
      LKPJ_EVALUATION: buildSummary(InstitutionalQuotaFeatureScope.LKPJ_EVALUATION),
      LEGISLATION: buildSummary(InstitutionalQuotaFeatureScope.LEGISLATION),
    };

    const activeSummary = buildSummary(featureScope);
    const totalGenerated = wallets.reduce((acc, w) => acc + Number(w.totalGenerated || 0), 0);
    const totalRevisions = wallets.reduce((acc, w) => acc + Number(w.totalRevisions || 0), 0);

    return {
      organizationId,
      tenantId,
      weeklyPeriodKey,
      featureScope,
      weeklyLimit: activeSummary.weeklyLimit,
      weeklyUsed: activeSummary.weeklyUsed,
      remainingWeekly: activeSummary.remainingWeekly,
      totalGenerated,
      totalRevisions,
      revisionLimitPerItem,
      byFeature,
    };
  }

  /**
   * Memotong 1 kuota Generate mingguan secara atomik per fitur (aman terhadap concurrent double-click).
   */
  async consumeGenerateQuota(
    organizationId: string,
    tenantId: string,
    featureScope: InstitutionalQuotaFeatureScope = InstitutionalQuotaFeatureScope.GLOBAL
  ): Promise<OrganizationMemberQuotaDto> {
    const weeklyPeriodKey = getCurrentWibWeeklyPeriod();
    const { weeklyLimit: contractLimit, revisionLimitPerItem } =
      await this.getContractQuotaConfig(organizationId);
    const weeklyLimit = this.resolveFeatureWeeklyLimit(featureScope, contractLimit);

    const updated = await db.transaction(async (tx) => {
      // Pastikan baris wallet minggu ini untuk fitur terkait ada (atomic upsert)
      await tx
        .insert(organizationMemberQuotaWallets)
        .values({
          organizationId,
          tenantId,
          weeklyPeriodKey,
          featureScope,
          weeklyLimit,
          weeklyUsed: 0,
          totalGenerated: 0,
          totalRevisions: 0,
        })
        .onConflictDoNothing({
          target: [
            organizationMemberQuotaWallets.organizationId,
            organizationMemberQuotaWallets.tenantId,
            organizationMemberQuotaWallets.weeklyPeriodKey,
            organizationMemberQuotaWallets.featureScope,
          ],
        });

      const [consumed] = await tx
        .update(organizationMemberQuotaWallets)
        .set({
          weeklyLimit,
          weeklyUsed: sql`${organizationMemberQuotaWallets.weeklyUsed} + 1`,
          totalGenerated: sql`${organizationMemberQuotaWallets.totalGenerated} + 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(organizationMemberQuotaWallets.organizationId, organizationId),
            eq(organizationMemberQuotaWallets.tenantId, tenantId),
            eq(organizationMemberQuotaWallets.weeklyPeriodKey, weeklyPeriodKey),
            eq(organizationMemberQuotaWallets.featureScope, featureScope),
            sql`${organizationMemberQuotaWallets.weeklyUsed} < ${weeklyLimit}`
          )
        )
        .returning();

      return consumed;
    });

    if (!updated) {
      const featureLabel = FEATURE_LABELS[featureScope] || featureScope;
      throw new ForbiddenException({
        errorCode: 'WEEKLY_GENERATE_LIMIT_EXCEEDED',
        message: `Kuota AI mingguan Anda untuk fitur ${featureLabel} (${weeklyLimit}/${weeklyLimit}) telah habis untuk periode ${weeklyPeriodKey}. Gunakan fitur Revisi gratis, coba fitur lain, atau minta Admin Instansi mereset kuota.`,
        weeklyLimit,
        weeklyPeriodKey,
        featureScope,
      });
    }

    return await this.getMemberQuota(organizationId, tenantId, featureScope);
  }

  /**
   * Mengembalikan 1 kuota Generate jika eksekusi AI gagal/timeout.
   */
  async refundGenerateQuota(
    organizationId: string,
    tenantId: string,
    featureScope: InstitutionalQuotaFeatureScope = InstitutionalQuotaFeatureScope.GLOBAL
  ): Promise<void> {
    const weeklyPeriodKey = getCurrentWibWeeklyPeriod();
    await db
      .update(organizationMemberQuotaWallets)
      .set({
        weeklyUsed: sql`GREATEST(0, ${organizationMemberQuotaWallets.weeklyUsed} - 1)`,
        totalGenerated: sql`GREATEST(0, ${organizationMemberQuotaWallets.totalGenerated} - 1)`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(organizationMemberQuotaWallets.organizationId, organizationId),
          eq(organizationMemberQuotaWallets.tenantId, tenantId),
          eq(organizationMemberQuotaWallets.weeklyPeriodKey, weeklyPeriodKey),
          eq(organizationMemberQuotaWallets.featureScope, featureScope)
        )
      );
  }

  /**
   * Reset kuota mingguan anggota oleh Admin Instansi (ORG_ADMIN / LEADERSHIP).
   */
  async resetMemberWeeklyQuota(
    organizationId: string,
    targetTenantId: string,
    featureScope?: InstitutionalQuotaFeatureScope
  ): Promise<OrganizationMemberQuotaDto> {
    const weeklyPeriodKey = getCurrentWibWeeklyPeriod();

    await db
      .update(organizationMemberQuotaWallets)
      .set({
        weeklyUsed: 0,
        updatedAt: new Date(),
      })
      .where(
        featureScope
          ? and(
              eq(organizationMemberQuotaWallets.organizationId, organizationId),
              eq(organizationMemberQuotaWallets.tenantId, targetTenantId),
              eq(organizationMemberQuotaWallets.weeklyPeriodKey, weeklyPeriodKey),
              eq(organizationMemberQuotaWallets.featureScope, featureScope)
            )
          : and(
              eq(organizationMemberQuotaWallets.organizationId, organizationId),
              eq(organizationMemberQuotaWallets.tenantId, targetTenantId),
              eq(organizationMemberQuotaWallets.weeklyPeriodKey, weeklyPeriodKey)
            )
      );

    return await this.getMemberQuota(
      organizationId,
      targetTenantId,
      featureScope || InstitutionalQuotaFeatureScope.COORDINATOR_CHAT
    );
  }

  /**
   * Mencatat statistik revisi anggota (tanpa memotong kuota Generate mingguan).
   */
  async recordMemberRevisionStat(
    organizationId: string,
    tenantId: string,
    featureScope: InstitutionalQuotaFeatureScope = InstitutionalQuotaFeatureScope.GLOBAL
  ): Promise<void> {
    const weeklyPeriodKey = getCurrentWibWeeklyPeriod();
    const { weeklyLimit: contractLimit } = await this.getContractQuotaConfig(organizationId);
    const weeklyLimit = this.resolveFeatureWeeklyLimit(featureScope, contractLimit);

    await db
      .insert(organizationMemberQuotaWallets)
      .values({
        organizationId,
        tenantId,
        weeklyPeriodKey,
        featureScope,
        weeklyLimit,
        weeklyUsed: 0,
        totalGenerated: 0,
        totalRevisions: 1,
      })
      .onConflictDoUpdate({
        target: [
          organizationMemberQuotaWallets.organizationId,
          organizationMemberQuotaWallets.tenantId,
          organizationMemberQuotaWallets.weeklyPeriodKey,
          organizationMemberQuotaWallets.featureScope,
        ],
        set: {
          totalRevisions: sql`${organizationMemberQuotaWallets.totalRevisions} + 1`,
          updatedAt: new Date(),
        },
      });
  }

  /**
   * Agregasi pemakaian AI Bottom-Up (Anggota -> Bidang -> Instansi) untuk Admin Instansi (ORG_ADMIN).
   */
  async getOrganizationUsageAnalytics(
    organizationId: string,
    billingCycleMonth?: string
  ): Promise<InstitutionalUsageAnalyticsDto> {
    const targetMonth = billingCycleMonth || new Date().toISOString().slice(0, 7);
    const weeklyPeriodKey = getCurrentWibWeeklyPeriod();
    const { weeklyLimit } = await this.getContractQuotaConfig(organizationId);

    const unitRows = await db.execute(sql`
      SELECT
        l.unit_id AS "unitId",
        COALESCE(u.code, 'ORG-GENERAL') AS "unitCode",
        COALESCE(u.name, 'Tingkat Instansi / Sekretariat') AS "unitName",
        COALESCE(u.unit_type::text, 'ORG_GENERAL') AS "unitType",
        COALESCE(SUM(l.generate_requests), 0)::integer AS "generateRequests",
        COALESCE(SUM(l.revision_requests), 0)::integer AS "revisionRequests",
        COALESCE(SUM(l.total_requests), 0)::integer AS "totalRequests",
        COALESCE(SUM(l.total_tokens_consumed), 0)::bigint AS "totalTokensConsumed",
        COALESCE(SUM(l.total_cost_idr), 0)::bigint AS "totalCostIdr"
      FROM organization_quota_ledgers l
      LEFT JOIN organization_units u ON l.unit_id = u.id
      WHERE l.organization_id = ${organizationId}::uuid
        AND l.billing_cycle_month = ${targetMonth}
      GROUP BY l.unit_id, u.code, u.name, u.unit_type
      ORDER BY "totalTokensConsumed" DESC;
    `);

    const memberRows = await db.execute(sql`
      SELECT
        m.tenant_id AS "tenantId",
        tm.full_name AS "fullName",
        tm.email AS "email",
        m.org_role AS "orgRole",
        EXISTS (
          SELECT 1 FROM organization_unit_memberships um
          WHERE um.organization_id = m.organization_id
            AND um.tenant_id = m.tenant_id
            AND um.status = 'ACTIVE'
        ) AS "hasAssignedUnits",
        COALESCE(SUM(l.generate_requests), 0)::integer AS "generateRequests",
        COALESCE(SUM(l.revision_requests), 0)::integer AS "revisionRequests",
        COALESCE(SUM(l.total_requests), 0)::integer AS "totalRequests",
        COALESCE(SUM(l.total_tokens_consumed), 0)::bigint AS "totalTokensConsumed",
        COALESCE(SUM(l.total_cost_idr), 0)::bigint AS "totalCostIdr",
        COALESCE(SUM(w.weekly_used), 0)::integer AS "weeklyUsed",
        ${Math.max(10, weeklyLimit) + weeklyLimit * 2}::integer AS "weeklyLimit"
      FROM organization_memberships m
      INNER JOIN tenant_members tm ON m.tenant_id = tm.id
      LEFT JOIN organization_quota_ledgers l
        ON l.organization_id = m.organization_id
        AND l.tenant_id = m.tenant_id
        AND l.billing_cycle_month = ${targetMonth}
      LEFT JOIN organization_member_quota_wallets w
        ON w.organization_id = m.organization_id
        AND w.tenant_id = m.tenant_id
        AND w.weekly_period_key = ${weeklyPeriodKey}
      WHERE m.organization_id = ${organizationId}::uuid
        AND m.status = 'ACTIVE'
      GROUP BY m.tenant_id, tm.full_name, tm.email, m.org_role
      ORDER BY "totalTokensConsumed" DESC, tm.full_name ASC;
    `);

    const uList = (((unitRows as any)?.rows || unitRows || []) as any[]).map((r) => ({
      unitId: r.unitId || null,
      unitCode: r.unitCode,
      unitName: r.unitName,
      unitType: r.unitType as OrganizationUnitType | 'ORG_GENERAL',
      generateRequests: Number(r.generateRequests || 0),
      revisionRequests: Number(r.revisionRequests || 0),
      totalRequests: Number(r.totalRequests || 0),
      totalTokensConsumed: Number(r.totalTokensConsumed || 0),
      totalCostIdr: Number(r.totalCostIdr || 0),
    }));

    const mList = (((memberRows as any)?.rows || memberRows || []) as any[]).map((r) => ({
      tenantId: r.tenantId,
      fullName: r.fullName,
      email: r.email,
      orgRole: r.orgRole as OrganizationMemberRole,
      hasAssignedUnits: Boolean(r.hasAssignedUnits),
      billingCycleMonth: targetMonth,
      generateRequests: Number(r.generateRequests || 0),
      revisionRequests: Number(r.revisionRequests || 0),
      totalRequests: Number(r.totalRequests || 0),
      totalTokensConsumed: Number(r.totalTokensConsumed || 0),
      totalCostIdr: Number(r.totalCostIdr || 0),
      weeklyUsed: Number(r.weeklyUsed || 0),
      weeklyLimit: Number(r.weeklyLimit || weeklyLimit),
    }));

    // Tarik rincian kuota mingguan per fitur untuk tiap anggota
    const walletRows = await db
      .select()
      .from(organizationMemberQuotaWallets)
      .where(
        and(
          eq(organizationMemberQuotaWallets.organizationId, organizationId),
          eq(organizationMemberQuotaWallets.weeklyPeriodKey, weeklyPeriodKey)
        )
      );

    const chatDefaultLimit = this.resolveFeatureWeeklyLimit(
      InstitutionalQuotaFeatureScope.COORDINATOR_CHAT,
      weeklyLimit
    );
    const lkpjDefaultLimit = this.resolveFeatureWeeklyLimit(
      InstitutionalQuotaFeatureScope.LKPJ_EVALUATION,
      weeklyLimit
    );
    const legDefaultLimit = this.resolveFeatureWeeklyLimit(
      InstitutionalQuotaFeatureScope.LEGISLATION,
      weeklyLimit
    );

    const enrichedMembers = mList.map((m) => {
      const memberWallets = walletRows.filter((w) => w.tenantId === m.tenantId);
      const getFeature = (scope: InstitutionalQuotaFeatureScope, defLimit: number) => {
        const w = memberWallets.find((item) => item.featureScope === scope);
        const limit = w?.weeklyLimit ?? defLimit;
        const used = w?.weeklyUsed ?? 0;
        return {
          weeklyLimit: limit,
          weeklyUsed: used,
          remainingWeekly: Math.max(0, limit - used),
        };
      };
      const byFeature = {
        COORDINATOR_CHAT: getFeature(InstitutionalQuotaFeatureScope.COORDINATOR_CHAT, chatDefaultLimit),
        LKPJ_EVALUATION: getFeature(InstitutionalQuotaFeatureScope.LKPJ_EVALUATION, lkpjDefaultLimit),
        LEGISLATION: getFeature(InstitutionalQuotaFeatureScope.LEGISLATION, legDefaultLimit),
      };
      const totalFeatureUsed =
        byFeature.COORDINATOR_CHAT.weeklyUsed +
        byFeature.LKPJ_EVALUATION.weeklyUsed +
        byFeature.LEGISLATION.weeklyUsed;
      const totalFeatureLimit =
        byFeature.COORDINATOR_CHAT.weeklyLimit +
        byFeature.LKPJ_EVALUATION.weeklyLimit +
        byFeature.LEGISLATION.weeklyLimit;

      return {
        ...m,
        weeklyUsed: totalFeatureUsed,
        weeklyLimit: totalFeatureLimit,
        byFeature,
      };
    });

    const totals = uList.reduce(
      (acc, u) => ({
        generateRequests: acc.generateRequests + u.generateRequests,
        revisionRequests: acc.revisionRequests + u.revisionRequests,
        totalRequests: acc.totalRequests + u.totalRequests,
        totalTokensConsumed: acc.totalTokensConsumed + u.totalTokensConsumed,
        totalCostIdr: acc.totalCostIdr + u.totalCostIdr,
      }),
      {
        generateRequests: 0,
        revisionRequests: 0,
        totalRequests: 0,
        totalTokensConsumed: 0,
        totalCostIdr: 0,
      }
    );

    // Hitung status ambang batas pool token tahunan kontrak B2G (threshold alert 80% & 95%)
    const [contractRow] = await db
      .select({
        contractNumber: organizationContracts.contractNumber,
        fiscalYear: organizationContracts.fiscalYear,
        annualTokenPoolLimit: organizationContracts.annualTokenPoolLimit,
        tokensConsumed: organizationContracts.tokensConsumed,
      })
      .from(organizationContracts)
      .where(eq(organizationContracts.organizationId, organizationId))
      .orderBy(desc(organizationContracts.endDate))
      .limit(1);

    let tokenPoolAlert: InstitutionalUsageAnalyticsDto['tokenPoolAlert'];
    if (contractRow && Number(contractRow.annualTokenPoolLimit) > 0) {
      const limit = Number(contractRow.annualTokenPoolLimit);
      const consumed = Math.max(Number(contractRow.tokensConsumed || 0), totals.totalTokensConsumed);
      const usagePercentage = Number(((consumed / limit) * 100).toFixed(2));
      let alertLevel: 'NORMAL' | 'WARNING_80' | 'CRITICAL_95' | 'EXCEEDED' = 'NORMAL';
      let message: string | null = null;

      if (usagePercentage >= 100) {
        alertLevel = 'EXCEEDED';
        message = `Pool token tahunan kontrak (${usagePercentage}%) telah mencapai batas maksimal. Hubungi pengelola POLARIS untuk penambahan kapasitas.`;
        this.logger.warn(`[TokenPoolAlert][${organizationId}] ${message}`);
      } else if (usagePercentage >= 95) {
        alertLevel = 'CRITICAL_95';
        message = `Peringatan Kritis: Pemakaian pool token tahunan mencapai ${usagePercentage}% (>= 95%).`;
        this.logger.warn(`[TokenPoolAlert][${organizationId}] ${message}`);
      } else if (usagePercentage >= 80) {
        alertLevel = 'WARNING_80';
        message = `Peringatan Awal: Pemakaian pool token tahunan telah mencapai ${usagePercentage}% (>= 80%).`;
        this.logger.warn(`[TokenPoolAlert][${organizationId}] ${message}`);
      }

      tokenPoolAlert = {
        contractNumber: contractRow.contractNumber,
        fiscalYear: contractRow.fiscalYear,
        annualTokenPoolLimit: limit,
        tokensConsumed: consumed,
        usagePercentage,
        alertLevel,
        message,
      };
    }

    return {
      organizationId,
      billingCycleMonth: targetMonth,
      weeklyPeriodKey,
      totals,
      byUnit: uList,
      byMember: enrichedMembers,
      tokenPoolAlert,
    };
  }
}
