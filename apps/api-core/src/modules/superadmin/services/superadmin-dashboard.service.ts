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
  withTenantContext,
} from '@polaris/database';
import { SubscriptionStatus } from '@polaris/shared-types';

@Injectable()
export class SuperadminDashboardService {
  async getTenantRlsCounts(tenantId: string) {
    return withTenantContext(tenantId, async (tx) => {
      const [publications] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(contentPublications);
      const [feedback] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(constituentFeedbacks);
      const [media] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(mediaAssets);

      return {
        publications: publications?.count || 0,
        feedback: feedback?.count || 0,
        media: media?.count || 0,
      };
    });
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

    const tenantIds = await db.select({ id: tenantMembers.id }).from(tenantMembers);
    let totalArticles = 0;
    let totalFeedbacks = 0;
    for (const tenant of tenantIds) {
      const counts = await this.getTenantRlsCounts(tenant.id);
      totalArticles += counts.publications;
      totalFeedbacks += counts.feedback;
    }

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
        totalParties: partyCount?.count || 0,
      },
      recentTenants,
    };
  }
}
