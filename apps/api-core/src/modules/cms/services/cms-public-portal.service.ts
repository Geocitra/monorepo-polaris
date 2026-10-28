import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, desc, inArray } from 'drizzle-orm';
import {
  db,
  portalConfigs,
  portalThemeSettings,
  portalDocuments,
  socialLinks,
  tenantMembers,
  electoralDistricts,
  contentPublications,
  mediaAssets,
  socialSyndicationPacks,
  subscriptions,
  subdomainAliases,
} from '@polaris/database';
import { ContentStatus, SubscriptionStatus, PlanTier, AssetType } from '@polaris/shared-types';

@Injectable()
export class CmsPublicPortalService {
  async getPublicPortalBySlug(slugOrDomain: string) {
    const cleanIdentifier = slugOrDomain.toLowerCase().trim();
    const isSubdomain = !cleanIdentifier.includes('.');

    // Query Portal dengan evaluasi status verifikasi
    let [portal] = await db
      .select({
        id: portalConfigs.id,
        tenantId: portalConfigs.tenantId,
        subdomainSlug: portalConfigs.subdomainSlug,
        customDomain: portalConfigs.customDomain,
        customDomainStatus: portalConfigs.customDomainStatus,
        isActive: portalConfigs.isActive,
        metaTitle: portalConfigs.metaTitle,
        metaDescription: portalConfigs.metaDescription,
      })
      .from(portalConfigs)
      .where(
        isSubdomain
          ? eq(portalConfigs.subdomainSlug, cleanIdentifier)
          : eq(portalConfigs.customDomain, cleanIdentifier)
      )
      .limit(1);

    // BILA TIDAK DITEMUKAN: Periksa apakah ini adalah subdomain lama yang telah dialihkan (301 Permanent Redirect)
    if (!portal && isSubdomain) {
      const [alias] = await db
        .select()
        .from(subdomainAliases)
        .where(eq(subdomainAliases.oldSubdomainSlug, cleanIdentifier))
        .limit(1);

      if (alias) {
        // Query target subdomain baru
        [portal] = await db
          .select({
            id: portalConfigs.id,
            tenantId: portalConfigs.tenantId,
            subdomainSlug: portalConfigs.subdomainSlug,
            customDomain: portalConfigs.customDomain,
            customDomainStatus: portalConfigs.customDomainStatus,
            isActive: portalConfigs.isActive,
            metaTitle: portalConfigs.metaTitle,
            metaDescription: portalConfigs.metaDescription,
          })
          .from(portalConfigs)
          .where(eq(portalConfigs.subdomainSlug, alias.newSubdomainSlug))
          .limit(1);
      }
    }

    if (!portal || !portal.isActive) {
      throw new NotFoundException(
        'Website publik anggota dewan tidak ditemukan atau sedang dinonaktifkan.'
      );
    }

    // GUARD: Jika diakses via custom domain tapi belum terverifikasi sah, tolak akses!
    if (!isSubdomain && portal.customDomainStatus !== 'VERIFIED') {
      throw new NotFoundException(
        `Domain '${cleanIdentifier}' sedang menunggu verifikasi DNS dan belum aktif di sistem POLARIS.`
      );
    }

    const [member] = await db
      .select({
        fullName: tenantMembers.fullName,
        photoUrl: tenantMembers.photoUrl,
        photoGallery: tenantMembers.photoGallery,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
        dapilId: tenantMembers.electoralDistrictId,
        customDapil: tenantMembers.customDapilName,
        personalCoverage: tenantMembers.personalCoverage,
        education: tenantMembers.education,
        courses: tenantMembers.courses,
        issueInterests: tenantMembers.issueInterests,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, portal.tenantId))
      .limit(1);

    let dapilName = member?.customDapil || 'Daerah Pemilihan';
    let provinceName = 'Provinsi Wilayah';

    if (member?.dapilId) {
      const [foundDapil] = await db
        .select({
          dapilName: electoralDistricts.dapilName,
          provinceName: electoralDistricts.provinceName,
        })
        .from(electoralDistricts)
        .where(eq(electoralDistricts.id, member.dapilId))
        .limit(1);

      if (foundDapil) {
        if (!member.customDapil) dapilName = foundDapil.dapilName;
        provinceName = foundDapil.provinceName;
      }
    }

    const [theme] = await db
      .select()
      .from(portalThemeSettings)
      .where(eq(portalThemeSettings.portalId, portal.id))
      .limit(1);

    const [sub] = await db
      .select({
        status: subscriptions.status,
        planTier: subscriptions.planTier,
      })
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, portal.tenantId))
      .limit(1);

    const isSubscriptionActive = sub?.status === SubscriptionStatus.ACTIVE;
    const isPremiumTier =
      isSubscriptionActive &&
      (sub?.planTier === PlanTier.PRO || (sub?.planTier as any) === 'VIP');

    const resolvedLayout = isPremiumTier
      ? theme?.layoutTemplateId || 'standard-default'
      : 'standard-default';

    const socials = await db
      .select({
        platform: socialLinks.platform,
        profileUrl: socialLinks.profileUrl,
      })
      .from(socialLinks)
      .where(eq(socialLinks.portalId, portal.id));

    const publishedArticles = await db
      .select({
        id: contentPublications.id,
        title: contentPublications.title,
        slug: contentPublications.slug,
        excerpt: contentPublications.excerpt,
        commentCount: contentPublications.commentCount,
        publishedAt: contentPublications.publishedAt,
        canonicalUrl: contentPublications.canonicalUrl,
      })
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.tenantId, portal.tenantId),
          eq(contentPublications.status, ContentStatus.PUBLISHED)
        )
      )
      .orderBy(desc(contentPublications.publishedAt))
      .limit(50);

    // Ambil media asset terkait untuk tiap publikasi (poster / featured image)
    const articleIds = publishedArticles.map((a) => a.id);
    const mediaMap = new Map<string, { cdnPublicUrl: string; assetType: string }>();
    if (articleIds.length > 0) {
      const medias = await db
        .select({
          publicationId: mediaAssets.publicationId,
          cdnPublicUrl: mediaAssets.cdnPublicUrl,
          assetType: mediaAssets.assetType,
        })
        .from(mediaAssets)
        .where(
          and(
            inArray(mediaAssets.publicationId, articleIds),
            inArray(mediaAssets.assetType, [AssetType.DALLE_POSTER, AssetType.INFOGRAPHIC_PNG, AssetType.HEADER_IMAGE])
          )
        );
      for (const m of medias) {
        if (!mediaMap.has(m.publicationId)) {
          mediaMap.set(m.publicationId, { cdnPublicUrl: m.cdnPublicUrl, assetType: m.assetType });
        }
      }
    }

    const allPublications = publishedArticles.map((a) => {
      const media = mediaMap.get(a.id);
      return {
        ...a,
        posterUrl: media?.cdnPublicUrl || null,
        featuredImageUrl: media?.cdnPublicUrl || null,
        assetType: media?.assetType || null,
      };
    });

    // Pisahkan secara tegas antara Artikel dan Infografis agar tidak bercampur di template
    const isInfographic = (item: any) =>
      item.assetType === 'INFOGRAPHIC_PNG' ||
      (typeof item.slug === 'string' && item.slug.toLowerCase().startsWith('infografis-')) ||
      (typeof item.title === 'string' && item.title.toLowerCase().startsWith('infografis:'));

    const recentInfographics = allPublications.filter(isInfographic);
    const recentArticles = allPublications.filter((item) => !isInfographic(item));

    const documents = await db
      .select({
        id: portalDocuments.id,
        title: portalDocuments.title,
        docType: portalDocuments.docType,
        description: portalDocuments.description,
        fileUrl: portalDocuments.fileUrl,
        fileSizeBytes: portalDocuments.fileSizeBytes,
        downloadCount: portalDocuments.downloadCount,
        publishedAt: portalDocuments.publishedAt,
      })
      .from(portalDocuments)
      .where(eq(portalDocuments.portalId, portal.id))
      .orderBy(desc(portalDocuments.publishedAt))
      .limit(8);

    return {
      portal: {
        subdomain: portal.subdomainSlug,
        customDomain: portal.customDomain,
        customDomainStatus: portal.customDomainStatus,
        metaTitle: portal.metaTitle,
        metaDescription: portal.metaDescription,
      },
      member: {
        fullName: member?.fullName,
        photoUrl: member?.photoUrl || theme?.officialPhotoUrl || null,
        photoGallery: Array.isArray(member?.photoGallery) ? member.photoGallery : [],
        partyAffiliation: member?.partyAffiliation,
        legislativeLevel: member?.legislativeLevel,
        dapilName,
        provinceName,
      },
      subscription: {
        isActive: isSubscriptionActive,
        status: sub?.status || SubscriptionStatus.INACTIVE,
        planTier: sub?.planTier || PlanTier.STARTER,
      },
      theme: {
        primaryHexColor: theme?.primaryHexColor || '#1890ff',
        secondaryHexColor: theme?.secondaryHexColor || '#001529',
        fontFamily: theme?.fontFamily || 'Inter, sans-serif',
        heroBannerUrl: theme?.heroBannerUrl,
        officialPhotoUrl: theme?.officialPhotoUrl,
        headlineTagline: theme?.headlineTagline,
        bioBiography: theme?.bioBiography,
        layoutTemplateId: resolvedLayout,
        layoutSchema: theme?.layoutSchema || null,
      },
      socialLinks: socials,
      recentArticles,
      recentInfographics,
      documents,
    };
  }

  async getPublicArticleBySlug(slugOrDomain: string, articleSlug: string) {
    const cleanIdentifier = slugOrDomain.toLowerCase().trim();
    const isSubdomain = !cleanIdentifier.includes('.');

    let [portal] = await db
      .select({
        id: portalConfigs.id,
        tenantId: portalConfigs.tenantId,
        isActive: portalConfigs.isActive,
        customDomainStatus: portalConfigs.customDomainStatus,
      })
      .from(portalConfigs)
      .where(
        isSubdomain
          ? eq(portalConfigs.subdomainSlug, cleanIdentifier)
          : eq(portalConfigs.customDomain, cleanIdentifier)
      )
      .limit(1);

    if (!portal && isSubdomain) {
      const [alias] = await db
        .select()
        .from(subdomainAliases)
        .where(eq(subdomainAliases.oldSubdomainSlug, cleanIdentifier))
        .limit(1);

      if (alias) {
        [portal] = await db
          .select({
            id: portalConfigs.id,
            tenantId: portalConfigs.tenantId,
            isActive: portalConfigs.isActive,
            customDomainStatus: portalConfigs.customDomainStatus,
          })
          .from(portalConfigs)
          .where(eq(portalConfigs.subdomainSlug, alias.newSubdomainSlug))
          .limit(1);
      }
    }

    if (!portal || !portal.isActive) {
      throw new NotFoundException('Portal dewan tidak ditemukan.');
    }

    if (!isSubdomain && portal.customDomainStatus !== 'VERIFIED') {
      throw new NotFoundException('Domain sedang dalam tahap verifikasi.');
    }

    const [article] = await db
      .select()
      .from(contentPublications)
      .where(
        and(
          eq(contentPublications.tenantId, portal.tenantId),
          eq(contentPublications.slug, articleSlug),
          eq(contentPublications.status, ContentStatus.PUBLISHED)
        )
      )
      .limit(1);

    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan atau belum dipublikasikan.');
    }

    const [media] = await db
      .select({ cdnPublicUrl: mediaAssets.cdnPublicUrl })
      .from(mediaAssets)
      .where(eq(mediaAssets.publicationId, article.id))
      .limit(1);

    const [social] = await db
      .select()
      .from(socialSyndicationPacks)
      .where(eq(socialSyndicationPacks.publicationId, article.id))
      .limit(1);

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      bodyContentMarkdown: article.bodyContentMarkdown,
      wordCount: article.wordCount,
      canonicalUrl: article.canonicalUrl,
      publishedAt: article.publishedAt,
      posterUrl: media?.cdnPublicUrl || null,
      socialPack: social,
    };
  }
}
