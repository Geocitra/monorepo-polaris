import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, desc, sql, gte, or, isNotNull, inArray } from 'drizzle-orm';
import {
  db,
  portalConfigs,
  electoralDistricts,
  tenantMembers,
  mediaDiscourses,
  constituentFeedbacks,
} from '@polaris/database';
import { PolicySector } from '@polaris/shared-types';
import { PromptRefinerService } from '@polaris/ai-engine';

function normalizeRegionAlias(region: string): string {
  return region
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^(kabupaten|kab|kota)\s*/i, '')
    .replace(/[^a-z0-9]/g, '');
}

function resolvePolicySectors(interests: string[], commissionName: string | null): PolicySector[] {
  const memberFocus = normalizeRegionAlias(`${interests.join(' ')} ${commissionName || ''}`);
  const sectorTerms: Record<PolicySector, string[]> = {
    [PolicySector.FISKAL_ANGGARAN]: ['anggaran', 'fiskal', 'keuangan', 'apbd', 'apbn', 'pendapatan daerah'],
    [PolicySector.INFRASTRUKTUR_RUANG]: ['infrastruktur', 'pekerjaan umum', 'tata ruang', 'pupr', 'perhubungan'],
    [PolicySector.PANGAN_PERTANIAN]: ['pertanian', 'pangan', 'pupuk', 'nelayan', 'perikanan', 'perkebunan'],
    [PolicySector.SOSIAL_KEMISKINAN]: ['sosial', 'kemiskinan', 'bansos', 'stunting', 'perlindungan sosial'],
    [PolicySector.LAYANAN_DASAR]: ['pendidikan', 'kesehatan', 'bpjs', 'sekolah', 'puskesmas', 'rumah sakit'],
    [PolicySector.TATA_KELOLA_HUKUM]: ['hukum', 'pemerintahan', 'tata kelola', 'pengawasan', 'legislasi'],
    [PolicySector.EKONOMI_KETENAGAKERJAAN]: ['ekonomi', 'umkm', 'ketenagakerjaan', 'tenaga kerja', 'perdagangan'],
    [PolicySector.LINGKUNGAN_BENCANA]: ['lingkungan', 'bencana', 'sampah', 'banjir', 'iklim'],
  };

  return Object.entries(sectorTerms)
    .filter(([, terms]) => terms.some((term) => memberFocus.includes(normalizeRegionAlias(term))))
    .map(([sector]) => sector as PolicySector);
}

@Injectable()
export class StudioRadarService {
  async getMorningBriefing(tenantId: string) {
    const [member] = await db
      .select({
        fullName: tenantMembers.fullName,
        party: tenantMembers.partyAffiliation,
        level: tenantMembers.legislativeLevel,
        dapilId: tenantMembers.electoralDistrictId,
        personalCoverage: tenantMembers.personalCoverage,
        issueInterests: tenantMembers.issueInterests,
        commissionName: tenantMembers.commissionName,
        photoUrl: tenantMembers.photoUrl,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Data anggota dewan tidak ditemukan.');
    }

    const [dapil] = member.dapilId
      ? await db
          .select()
          .from(electoralDistricts)
          .where(eq(electoralDistricts.id, member.dapilId))
          .limit(1)
      : [null];

    const regionCoverage = member.personalCoverage?.length
      ? member.personalCoverage
      : dapil?.regencyCoverage || [];
    const regionScope = regionCoverage[0] || 'NASIONAL';

    const [portal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentFeedbacks = portal
      ? await db
          .select({
            category: constituentFeedbacks.category,
            district: constituentFeedbacks.districtKecamatan,
            regency: constituentFeedbacks.regencyName,
            status: constituentFeedbacks.status,
          })
          .from(constituentFeedbacks)
          .where(
            and(
              eq(constituentFeedbacks.portalId, portal.id),
              gte(constituentFeedbacks.submittedAt, sevenDaysAgo)
            )
          )
      : [];

    const totalAspirasi = recentFeedbacks.length;
    const pendingFollowUp = recentFeedbacks.filter(
      (f) => f.status === 'RECEIVED' || f.status === 'VERIFIED'
    ).length;
    const resolvedAspirasi = recentFeedbacks.filter((f) => f.status === 'RESPONDED').length;

    const categoryLabels: Record<string, string> = {
      INFRASTRUKTUR: 'Infrastruktur',
      PERTANIAN: 'Pertanian',
      PENDIDIKAN: 'Pendidikan',
      KESEHATAN: 'Kesehatan',
      BANSOS_UMKM: 'Bansos & UMKM',
      LAINNYA: 'Lainnya',
    };
    const issueGroups = new Map<
      string,
      {
        category: string;
        district: string;
        regency: string;
        frequency: number;
        pendingCount: number;
      }
    >();

    for (const feedback of recentFeedbacks) {
      const key = `${feedback.category}:${feedback.district}:${feedback.regency}`;
      const group = issueGroups.get(key) || {
        category: feedback.category,
        district: feedback.district,
        regency: feedback.regency,
        frequency: 0,
        pendingCount: 0,
      };

      group.frequency += 1;
      if (feedback.status === 'RECEIVED' || feedback.status === 'VERIFIED') {
        group.pendingCount += 1;
      }
      issueGroups.set(key, group);
    }

    const priorityIssues = [...issueGroups.values()]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3)
      .map((group) => {
        const location = [group.district, group.regency].filter(Boolean).join(', ');
        return {
          id: `${group.category}-${group.district}-${group.regency}`,
          title: categoryLabels[group.category] || group.category,
          location: location || regionScope,
          frequency: group.frequency,
          status:
            group.pendingCount > 0
              ? `${group.pendingCount} perlu tindak lanjut`
              : 'Tidak ada laporan tertunda',
          description: `${group.frequency} aspirasi tercatat dalam 7 hari terakhir.`,
        };
      });

    const regionAliases = [
      ...new Set(
        [
          ...regionCoverage.map(normalizeRegionAlias),
          normalizeRegionAlias(dapil?.provinceName || ''),
        ].filter(Boolean)
      ),
    ];
    const preferredSectors = resolvePolicySectors(
      member.issueInterests || [],
      member.commissionName
    );
    const normalizedNewsRegion = sql`regexp_replace(
      regexp_replace(lower(${mediaDiscourses.regionScope}), '^(kabupaten|kab|kota)', ''),
      '[^a-z0-9]', '', 'g'
    )`;
    const newsScopeConditions = [
      eq(mediaDiscourses.regionScope, 'NASIONAL'),
      ...regionAliases.map((alias) => sql`${normalizedNewsRegion} = ${alias}`),
    ];
    const recentNews = await db
      .select({
        id: mediaDiscourses.id,
        title: mediaDiscourses.articleTitle,
        portal: mediaDiscourses.newsPortalName,
        url: mediaDiscourses.originalUrl,
        summary: mediaDiscourses.cleanSummary,
        sentiment: mediaDiscourses.sentimentScore,
        publishedAt: mediaDiscourses.publishedAt,
        regionScope: mediaDiscourses.regionScope,
        sector: mediaDiscourses.sector,
        relevanceScore: mediaDiscourses.relevanceScore,
      })
      .from(mediaDiscourses)
      .where(
        and(
          gte(mediaDiscourses.publishedAt, sevenDaysAgo),
          or(...newsScopeConditions),
          isNotNull(mediaDiscourses.sector),
          gte(mediaDiscourses.relevanceScore, 0.65),
          ...(preferredSectors.length > 0
            ? [inArray(mediaDiscourses.sector, preferredSectors)]
            : [])
        )
      )
      .orderBy(
        sql`CASE WHEN ${mediaDiscourses.regionScope} = 'NASIONAL' THEN 1 ELSE 0 END`,
        desc(mediaDiscourses.relevanceScore),
        desc(mediaDiscourses.publishedAt)
      )
      .limit(5);

    const averageSentiment = recentNews.length
      ? recentNews.reduce((total, news) => total + news.sentiment, 0) / recentNews.length
      : null;
    const sentimentLabel =
      averageSentiment === null
        ? 'Belum ada data'
        : averageSentiment > 0.15
          ? 'Cenderung positif'
          : averageSentiment < -0.15
            ? 'Cenderung negatif'
            : 'Cenderung netral';
    const topIssue = priorityIssues[0];

    return {
      dateGreeting: new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date()),
      member: {
        fullName: member.fullName,
        party: member.party,
        dapilName: dapil?.dapilName || 'Dapil',
        commissionName: member.commissionName || 'Komisi Terkait',
        regionScope,
        issueInterests: member.issueInterests || [],
        photoUrl: member.photoUrl || null,
      },
      metrics: {
        totalAspirasi,
        pendingFollowUp,
        resolvedAspirasi,
        sentimentIndex:
          averageSentiment === null ? null : `${Math.round(((averageSentiment + 1) / 2) * 100)}%`,
        sentimentLabel,
      },
      priorityIssues,
      briefingNews: recentNews,
      todayAgenda: [],
      recommendation: topIssue
        ? `Tinjau isu ${topIssue.title.toLowerCase()} di ${topIssue.location}; ${topIssue.frequency} aspirasi masuk dalam 7 hari terakhir.`
        : 'Belum ada aspirasi terbaru yang perlu diprioritaskan. Periksa kembali setelah data aspirasi masuk.',
    };
  }

  /**
   * Menghasilkan rekomendasi topik isu hangat daerah secara dinamis berbasis AI (Gemini Flash Lite)
   * disesuaikan dengan dapil, komisi, partai, dan berita daerah terkini anggota dewan.
   */
  async getTrendingDapilTopics(tenantId: string) {
    const [member] = await db
      .select({
        fullName: tenantMembers.fullName,
        party: tenantMembers.partyAffiliation,
        level: tenantMembers.legislativeLevel,
        dapilId: tenantMembers.electoralDistrictId,
        customDapil: tenantMembers.customDapilName,
        personalCoverage: tenantMembers.personalCoverage,
        commissionName: tenantMembers.commissionName,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Data anggota dewan tidak ditemukan.');
    }

    const [dapil] = member.dapilId
      ? await db
          .select()
          .from(electoralDistricts)
          .where(eq(electoralDistricts.id, member.dapilId))
          .limit(1)
      : [null];

    const dapilName = member.customDapil || dapil?.dapilName || 'Dapil';
    const provinceName = dapil?.provinceName || undefined;
    const regencyCoverage = member.personalCoverage?.length
      ? member.personalCoverage
      : dapil?.regencyCoverage || [];

    // Ambil berita daerah terkini sebagai sinyal
    let recentHeadlines: string[] = [];
    try {
      const scopeConditions = [
        eq(mediaDiscourses.regionScope, dapilName),
        ...(provinceName ? [eq(mediaDiscourses.regionScope, provinceName)] : []),
      ];
      const newsRows = await db
        .select({ title: mediaDiscourses.articleTitle })
        .from(mediaDiscourses)
        .where(or(...scopeConditions))
        .orderBy(desc(mediaDiscourses.publishedAt))
        .limit(3);
      recentHeadlines = newsRows.map((n) => n.title);
    } catch {}

    const topics = await PromptRefinerService.generateTrendingTopics({
      memberName: member.fullName,
      dapilName,
      provinceName,
      regencyCoverage,
      partyAffiliation: member.party || undefined,
      legislativeLevel: member.level || undefined,
      commissionName: member.commissionName || undefined,
      recentNewsHeadlines: recentHeadlines,
    });

    return {
      dapilName,
      memberName: member.fullName,
      topics,
    };
  }
}
