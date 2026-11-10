import { Injectable } from '@nestjs/common';
import { sql, desc, eq } from 'drizzle-orm';
import {
  db,
  tenantMembers,
  subscriptions,
  masterPoliticalParties,
  contentPublications,
  constituentFeedbacks,
  mediaAssets,
  aiTraceLogs,
} from '@polaris/database';
import { SubscriptionStatus } from '@polaris/shared-types';

@Injectable()
export class SuperadminDashboardService {
  async getTenantRlsCounts(tenantId: string) {
    const [publications] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contentPublications)
      .where(eq(contentPublications.tenantId, tenantId));

    const [feedback] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(constituentFeedbacks)
      .where(eq(constituentFeedbacks.tenantId, tenantId));

    const [media] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(mediaAssets)
      .innerJoin(contentPublications, eq(mediaAssets.publicationId, contentPublications.id))
      .where(eq(contentPublications.tenantId, tenantId));

    return {
      publications: Number(publications?.count || 0),
      feedback: Number(feedback?.count || 0),
      media: Number(media?.count || 0),
    };
  }

  /**
   * Executive Dashboard Statistics for Superadmin
   */
  async getDashboardStats() {
    // 1. Total Tenants
    const [tenantCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tenantMembers);

    // 2. Active Subscriptions
    const [activeSubCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(subscriptions)
      .where(eq(subscriptions.status, SubscriptionStatus.ACTIVE));

    // 3. Real Article & Feedback Counts
    const tenantIds = await db.select({ id: tenantMembers.id }).from(tenantMembers);
    let totalArticles = 0;
    let totalFeedbacks = 0;
    for (const tenant of tenantIds) {
      const counts = await this.getTenantRlsCounts(tenant.id);
      totalArticles += counts.publications;
      totalFeedbacks += counts.feedback;
    }

    // 4. Dynamic AI Token & Cost Aggregates
    const [tokenAgg] = await db
      .select({
        totalTokens: sql<number>`COALESCE(SUM(${aiTraceLogs.totalTokens}), 0)::bigint`,
        totalCostIdr: sql<number>`COALESCE(SUM(${aiTraceLogs.costIdr}), 0)::bigint`,
      })
      .from(aiTraceLogs);

    // 5. Total Political Parties
    const [partyCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(masterPoliticalParties);

    // 6. Recent Registrations
    const recentTenants = await db
      .select({
        id: tenantMembers.id,
        fullName: tenantMembers.fullName,
        email: tenantMembers.email,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
        isVerified: tenantMembers.isVerified,
        accountStatus: tenantMembers.accountStatus,
        createdAt: tenantMembers.createdAt,
      })
      .from(tenantMembers)
      .orderBy(desc(tenantMembers.createdAt))
      .limit(5);

    return {
      stats: {
        totalTenants: tenantCount?.count || 0,
        activeSubscriptions: activeSubCount?.count || 0,
        totalArticles,
        totalFeedbacks,
        totalTokens: Number(tokenAgg?.totalTokens || 0),
        totalAiCostIdr: Number(tokenAgg?.totalCostIdr || 0),
        totalParties: partyCount?.count || 0,
      },
      recentTenants,
    };
  }
}
