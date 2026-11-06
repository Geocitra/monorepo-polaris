import { Injectable, Logger } from '@nestjs/common';
import {
  db,
  eq,
  sql,
  systemAdmins,
  liveChatSessions,
  contentBriefs,
  contentPublications,
} from '@polaris/database';
import { OperatorKpiSummaryDto } from '@polaris/shared-types';

@Injectable()
export class OperatorKpiService {
  private readonly logger = new Logger(OperatorKpiService.name);

  /**
   * Menghasilkan ringkasan KPI untuk seluruh Operator Redaksi.
   */
  public async getOperatorsKpiSummary(): Promise<OperatorKpiSummaryDto[]> {
    const operators = await db
      .select({
        id: systemAdmins.id,
        fullName: systemAdmins.fullName,
        email: systemAdmins.email,
        role: systemAdmins.role,
      })
      .from(systemAdmins)
      .orderBy(systemAdmins.fullName);

    const summaries: OperatorKpiSummaryDto[] = [];

    for (const op of operators) {
      // 1. Metrik Live Chat Sesi
      const [chatStats] = await db
        .select({
          totalChats: sql<number>`count(*)::int`,
          activeChats: sql<number>`count(case when ${liveChatSessions.status} = 'ACTIVE' then 1 end)::int`,
          avgFirstResponseSecs: sql<number>`coalesce(avg(${liveChatSessions.firstResponseSeconds}), 0)::int`,
          avgDurationSecs: sql<number>`coalesce(avg(${liveChatSessions.totalDurationSeconds}), 0)::int`,
          satisfiedCount: sql<number>`count(case when ${liveChatSessions.csatRating} = 'SATISFIED' then 1 end)::int`,
          totalRated: sql<number>`count(case when ${liveChatSessions.csatRating} is not null then 1 end)::int`,
        })
        .from(liveChatSessions)
        .where(eq(liveChatSessions.assignedOperatorId, op.id));

      const csatTotalRated = chatStats?.totalRated || 0;
      const csatPositive = chatStats?.satisfiedCount || 0;
      const csatPercentage = csatTotalRated > 0
        ? Math.round((csatPositive / csatTotalRated) * 100)
        : 100;

      // 2. Metrik Pembuatan Artikel & Kepatuhan SLA Publikasi
      const [briefStats] = await db
        .select({
          totalBriefs: sql<number>`count(*)::int`,
          totalPublished: sql<number>`count(case when ${contentBriefs.status} = 'PUBLISHED' then 1 end)::int`,
          avgHoursToPublish: sql<number>`coalesce(
            avg(
              extract(epoch from (${contentPublications.publishedAt} - ${contentBriefs.createdAt})) / 3600
            ), 0
          )::numeric(10,1)`,
          urgentCount: sql<number>`count(case when ${contentBriefs.clientUrgency} = 'URGENT' or ${contentBriefs.isUrgentOverquota} = true then 1 end)::int`,
          urgentOnTimeCount: sql<number>`count(case when (${contentBriefs.clientUrgency} = 'URGENT' or ${contentBriefs.isUrgentOverquota} = true) and ${contentBriefs.status} = 'PUBLISHED' and extract(epoch from (${contentPublications.publishedAt} - ${contentBriefs.createdAt})) <= 14400 then 1 end)::int`,
        })
        .from(contentBriefs)
        .leftJoin(contentPublications, eq(contentBriefs.linkedPublicationId, contentPublications.id))
        .where(eq(contentBriefs.assignedOperatorId, op.id));

      const urgentCount = briefStats?.urgentCount || 0;
      const urgentOnTime = briefStats?.urgentOnTimeCount || 0;
      const urgentSlaRate = urgentCount > 0
        ? Math.round((urgentOnTime / urgentCount) * 100)
        : 100;

      summaries.push({
        operatorId: op.id,
        operatorName: op.fullName,
        operatorEmail: op.email,
        totalChatsHandled: chatStats?.totalChats || 0,
        activeChatsCount: chatStats?.activeChats || 0,
        avgFirstResponseSeconds: chatStats?.avgFirstResponseSecs || 0,
        avgChatDurationSeconds: chatStats?.avgDurationSecs || 0,
        csatPositiveCount: csatPositive,
        csatTotalRated,
        csatPercentage,
        totalBriefsHandled: briefStats?.totalBriefs || 0,
        totalBriefsPublished: briefStats?.totalPublished || 0,
        avgHoursToPublish: Number(briefStats?.avgHoursToPublish || 0),
        urgentSlaComplianceRate: urgentSlaRate,
      });
    }

    return summaries;
  }
}
