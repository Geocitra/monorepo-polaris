import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as dns from 'dns/promises';
import ipaddr from 'ipaddr.js';
import { eq, or, and, desc } from 'drizzle-orm';
import {
  db,
  portalConfigs,
  portalThemeSettings,
  socialLinks,
  tenantMembers,
  electoralDistricts,
  contentPublications,
  mediaAssets,
  socialSyndicationPacks,
  withTenantContext,
} from '@polaris/database';
import { SubdomainSlug, HexColor } from '@polaris/core-domain';
import { ContentStatus } from '@polaris/shared-types';
import { UpdateThemeSettingsDto, UpdateDomainConfigDto } from './dto/cms.dto.js';

@Injectable()
export class CmsService {
  private readonly logger = new Logger(CmsService.name);

  // Domain terlarang yang tidak boleh diklaim secara sepihak
  private static readonly BLACKLISTED_DOMAINS = [
    'polaris.id',
    'gov.id',
    'go.id',
    'mil.id',
    'ac.id',
    'dpr.go.id',
    'kemendagri.go.id',
    'bappenas.go.id',
    'bpk.go.id',
    'kpu.go.id',
    'polaris.id',
    'localhost',
  ];

  private normalizeCustomDomain(input: string): string {
    const domain = input.trim().replace(/\.$/, '').toLowerCase();
    if (!domain || domain.length > 253 || domain.includes('..') || ipaddr.isValid(domain)) {
      throw new BadRequestException('Domain tidak valid atau mengarah ke alamat terlarang.');
    }

    const labels = domain.split('.');
    if (labels.length < 2 || labels.some((label) =>
      label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
    )) {
      throw new BadRequestException('Domain tidak valid atau mengarah ke alamat terlarang.');
    }

    if (CmsService.BLACKLISTED_DOMAINS.some((blocked) => domain === blocked || domain.endsWith(`.${blocked}`))) {
      throw new BadRequestException('Domain tidak valid atau mengarah ke alamat terlarang.');
    }
    return domain;
  }

  private isPublicUnicastAddress(address: string): boolean {
    try {
      let parsed = ipaddr.parse(address);
      if (parsed.kind() === 'ipv6') {
        const ipv6 = parsed as ipaddr.IPv6;
        if (ipv6.isIPv4MappedAddress()) parsed = ipv6.toIPv4Address();
      }
      return parsed.range() === 'unicast';
    } catch {
      return false;
    }
  }

  private async assertDomainResolvesOnlyToPublicIps(domain: string): Promise<void> {
    const [ipv4, ipv6] = await Promise.all([
      dns.resolve4(domain).catch(() => [] as string[]),
      dns.resolve6(domain).catch(() => [] as string[]),
    ]);
    const addresses = [...ipv4, ...ipv6];
    if (addresses.length === 0 || addresses.some((address) => !this.isPublicUnicastAddress(address))) {
      throw new BadRequestException('Domain tidak valid atau mengarah ke alamat terlarang.');
    }
  }

  async getMyPortalConfig(tenantId: string) {
    const [portal] = await db
      .select()
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    if (!portal) {
      throw new NotFoundException('Konfigurasi portal belum diinisialisasi.');
    }

    const [theme] = await db
      .select()
      .from(portalThemeSettings)
      .where(eq(portalThemeSettings.portalId, portal.id))
      .limit(1);

    const socials = await db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.portalId, portal.id));

    return {
      portal,
      theme,
      socialLinks: socials,
      dnsInstructions: portal.customDomain
        ? {
          cnameTarget: 'cname.polaris.id',
          txtRecordHost: `_polaris-challenge.${portal.customDomain}`,
          txtRecordValue: portal.dnsVerificationToken,
          expiresAt: portal.dnsVerificationExpiresAt,
        }
        : null,
    };
  }

  async updateThemeSettings(tenantId: string, dto: UpdateThemeSettingsDto) {
    let primary: HexColor;
    let secondary: HexColor;
    try {
      primary = new HexColor(dto.primaryHexColor);
      secondary = new HexColor(dto.secondaryHexColor);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    const [portal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    if (!portal) {
      throw new NotFoundException('Portal konfigurasi tidak ditemukan.');
    }

    await db.transaction(async (tx) => {
      const updateData: Record<string, any> = {
        primaryHexColor: primary.getValue(),
        secondaryHexColor: secondary.getValue(),
        updatedAt: new Date(),
      };
      if (dto.fontFamily !== undefined) updateData.fontFamily = dto.fontFamily;
      if (dto.heroBannerUrl !== undefined) updateData.heroBannerUrl = dto.heroBannerUrl;
      if (dto.officialPhotoUrl !== undefined) updateData.officialPhotoUrl = dto.officialPhotoUrl;
      if (dto.headlineTagline !== undefined) updateData.headlineTagline = dto.headlineTagline;
      if (dto.bioBiography !== undefined) updateData.bioBiography = dto.bioBiography;

      await tx
        .update(portalThemeSettings)
        .set(updateData)
        .where(eq(portalThemeSettings.portalId, portal.id));

      if (dto.socialLinks) {
        await tx.delete(socialLinks).where(eq(socialLinks.portalId, portal.id));
        if (dto.socialLinks.length > 0) {
          await tx.insert(socialLinks).values(
            dto.socialLinks.map((item) => ({
              portalId: portal.id,
              platform: item.platform,
              profileUrl: item.profileUrl,
            }))
          );
        }
      }
    });

    return { message: 'Pengaturan tema dan identitas visual berhasil diperbarui.' };
  }

  async updateDomainConfig(tenantId: string, dto: UpdateDomainConfigDto) {
    const [portal] = await db
      .select()
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    if (!portal) {
      throw new NotFoundException('Portal konfigurasi tidak ditemukan.');
    }

    const updates: Partial<typeof portalConfigs.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (dto.metaTitle) updates.metaTitle = dto.metaTitle;
    if (dto.metaDescription) updates.metaDescription = dto.metaDescription;

    // Pembaruan Subdomain Slug
    if (dto.subdomainSlug && dto.subdomainSlug !== portal.subdomainSlug) {
      let validatedSlug: SubdomainSlug;
      try {
        validatedSlug = new SubdomainSlug(dto.subdomainSlug);
      } catch (error: any) {
        throw new BadRequestException(error.message);
      }
      const cleanSlug = validatedSlug.getValue();

      const [exists] = await db
        .select({ id: portalConfigs.id })
        .from(portalConfigs)
        .where(eq(portalConfigs.subdomainSlug, cleanSlug))
        .limit(1);

      if (exists) {
        throw new ConflictException(`Subdomain '${cleanSlug}' sudah digunakan oleh anggota dewan lain.`);
      }

      updates.subdomainSlug = cleanSlug;
    }

    // Pembaruan Custom Domain dengan Tantangan DNS
    if (dto.customDomain !== undefined) {
      const cleanCustomDomain = dto.customDomain ? this.normalizeCustomDomain(dto.customDomain) : null;

      if (cleanCustomDomain) {
        const [exists] = await db
          .select({ id: portalConfigs.id })
          .from(portalConfigs)
          .where(eq(portalConfigs.customDomain, cleanCustomDomain))
          .limit(1);

        if (exists && exists.id !== portal.id) {
          throw new ConflictException(`Custom domain '${cleanCustomDomain}' sudah didaftarkan oleh anggota lain.`);
        }

        // Jika domain baru atau diubah, set status menjadi PENDING_VERIFICATION dan buat token DNS
        const challengeExpired = !portal.dnsVerificationExpiresAt || portal.dnsVerificationExpiresAt <= new Date();
        if (
          cleanCustomDomain !== portal.customDomain ||
          portal.customDomainStatus === 'FAILED' ||
          (portal.customDomainStatus !== 'VERIFIED' && challengeExpired)
        ) {
          const verificationToken = crypto.randomBytes(32).toString('hex');
          updates.customDomain = cleanCustomDomain;
          updates.customDomainStatus = 'PENDING_VERIFICATION';
          updates.dnsVerificationToken = verificationToken;
          updates.dnsVerificationExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
          updates.domainVerifiedAt = null;
        }
      } else {
        // Hapus custom domain
        updates.customDomain = null;
        updates.customDomainStatus = 'UNVERIFIED';
        updates.dnsVerificationToken = null;
        updates.dnsVerificationExpiresAt = null;
        updates.domainVerifiedAt = null;
      }
    }

    await db.update(portalConfigs).set(updates).where(eq(portalConfigs.id, portal.id));
    const resultingDomain = dto.customDomain !== undefined
      ? updates.customDomain ?? null
      : portal.customDomain;

    return {
      message: 'Konfigurasi domain berhasil diperbarui.',
      status: updates.customDomainStatus || portal.customDomainStatus,
      dnsInstructions: resultingDomain
        ? {
          cnameTarget: 'cname.polaris.id',
          txtRecordHost: `_polaris-challenge.${resultingDomain}`,
          txtRecordValue: updates.dnsVerificationToken ?? portal.dnsVerificationToken,
          expiresAt: updates.dnsVerificationExpiresAt ?? portal.dnsVerificationExpiresAt,
        }
        : null,
    };
  }

  /**
   * Memverifikasi kepemilikan DNS domain kustom via CNAME atau TXT Record.
   */
  async verifyCustomDomainDns(tenantId: string) {
    const portal = await withTenantContext(tenantId, async (tx) => {
      const [record] = await tx
        .select()
        .from(portalConfigs)
        .where(eq(portalConfigs.tenantId, tenantId))
        .limit(1);
      return record;
    });

    if (!portal || !portal.customDomain) {
      throw new BadRequestException('Custom domain belum didaftarkan pada portal ini.');
    }

    const domain = portal.customDomain;
    const expectedCname = 'cname.polaris.id';
    const challengeHost = `_polaris-challenge.${domain}`;
    const token = portal.dnsVerificationToken;
    const now = new Date();

    if (
      portal.customDomainStatus !== 'PENDING_VERIFICATION' ||
      !token ||
      !portal.dnsVerificationExpiresAt ||
      portal.dnsVerificationExpiresAt <= now
    ) {
      if (portal.customDomainStatus === 'PENDING_VERIFICATION' && portal.dnsVerificationExpiresAt && portal.dnsVerificationExpiresAt <= now) {
        await withTenantContext(tenantId, (tx) =>
          tx.update(portalConfigs).set({
            customDomainStatus: 'FAILED',
            dnsVerificationToken: null,
            dnsVerificationExpiresAt: null,
            updatedAt: now,
          }).where(eq(portalConfigs.id, portal.id))
        );
      }
      throw new BadRequestException('Tantangan verifikasi domain tidak valid atau telah kedaluwarsa. Daftarkan ulang domain untuk membuat token baru.');
    }

    this.logger.log(`[DNS Verify] Checking custom domain challenge; portalId=${portal.id}`);

    try {
      await this.assertDomainResolvesOnlyToPublicIps(domain);
    } catch {
      await withTenantContext(tenantId, (tx) =>
        tx.update(portalConfigs).set({
          customDomainStatus: 'FAILED',
          domainVerifiedAt: null,
          updatedAt: new Date(),
        }).where(and(
          eq(portalConfigs.id, portal.id),
          eq(portalConfigs.dnsVerificationToken, token)
        ))
      );
      throw new BadRequestException('Domain tidak valid atau mengarah ke alamat terlarang.');
    }

    let cnameMatched = false;
    try {
      const records = await dns.resolveCname(domain);
      cnameMatched = records.some((record) => record.replace(/\.$/, '').toLowerCase() === expectedCname);
    } catch (error: unknown) {
      const code = (error as NodeJS.ErrnoException)?.code;
      this.logger.debug(`CNAME lookup did not verify domain; code=${code ?? 'unknown'}`);
    }

    if (cnameMatched) {
      try {
        await this.assertDomainResolvesOnlyToPublicIps(expectedCname);
      } catch {
        await withTenantContext(tenantId, (tx) =>
          tx.update(portalConfigs).set({
            customDomainStatus: 'FAILED',
            domainVerifiedAt: null,
            updatedAt: new Date(),
          }).where(and(
            eq(portalConfigs.id, portal.id),
            eq(portalConfigs.dnsVerificationToken, token)
          ))
        );
        throw new BadRequestException('Target CNAME tidak valid atau mengarah ke alamat terlarang.');
      }
    }

    let txtMatched = false;
    if (!cnameMatched) {
      try {
        const records = await dns.resolveTxt(challengeHost);
        txtMatched = records.flat().some((record) => record === token);
      } catch (error: unknown) {
        const code = (error as NodeJS.ErrnoException)?.code;
        this.logger.debug(`TXT challenge lookup did not verify domain; code=${code ?? 'unknown'}`);
      }
    }

    if (!cnameMatched && !txtMatched) {
      return {
        verified: false,
        status: 'PENDING_VERIFICATION',
        message: `DNS belum terpropagasi. Pastikan CNAME tepat ke '${expectedCname}' atau TXT '${challengeHost}' berisi token yang diberikan sebelum kedaluwarsa.`,
      };
    }

    // Re-resolve just before approval to reduce DNS rebinding race windows.
    try {
      await this.assertDomainResolvesOnlyToPublicIps(domain);
    } catch {
      await withTenantContext(tenantId, (tx) =>
        tx.update(portalConfigs).set({
          customDomainStatus: 'FAILED',
          domainVerifiedAt: null,
          updatedAt: new Date(),
        }).where(and(
          eq(portalConfigs.id, portal.id),
          eq(portalConfigs.dnsVerificationToken, token)
        ))
      );
      throw new BadRequestException('Domain tidak valid atau mengarah ke alamat terlarang.');
    }

    const verifiedAt = new Date();
    const updated = await withTenantContext(tenantId, async (tx) => {
      const [record] = await tx.update(portalConfigs).set({
        customDomainStatus: 'VERIFIED',
        domainVerifiedAt: verifiedAt,
        updatedAt: verifiedAt,
      }).where(and(
        eq(portalConfigs.id, portal.id),
        eq(portalConfigs.customDomain, domain),
        eq(portalConfigs.customDomainStatus, 'PENDING_VERIFICATION'),
        eq(portalConfigs.dnsVerificationToken, token)
      )).returning({ id: portalConfigs.id });
      return record;
    });

    if (!updated) throw new ConflictException('Tantangan DNS berubah selama verifikasi. Silakan ulangi proses.');

    return {
      verified: true,
      status: 'VERIFIED',
      message: `Domain '${domain}' berhasil diverifikasi resmi dan kini aktif.`,
    };
  }

  /**
   * Mengambil data website publik dewan. 
   * Proteksi: Custom domain yang belum VERIFIED dilarang merespons.
   */
  async getPublicPortalBySlug(slugOrDomain: string) {
    const cleanIdentifier = slugOrDomain.toLowerCase().trim();
    const isSubdomain = !cleanIdentifier.includes('.');

    // Query Portal dengan evaluasi status verifikasi
    const [portal] = await db
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

    if (!portal || !portal.isActive) {
      throw new NotFoundException('Website publik anggota dewan tidak ditemukan atau sedang dinonaktifkan.');
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
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
        dapilId: tenantMembers.electoralDistrictId,
        customDapil: tenantMembers.customDapilName,
        personalCoverage: tenantMembers.personalCoverage,
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

    const socials = await db
      .select({
        platform: socialLinks.platform,
        profileUrl: socialLinks.profileUrl,
      })
      .from(socialLinks)
      .where(eq(socialLinks.portalId, portal.id));

    const recentArticles = await db
      .select({
        id: contentPublications.id,
        title: contentPublications.title,
        slug: contentPublications.slug,
        excerpt: contentPublications.excerpt,
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
      .limit(6);

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
        partyAffiliation: member?.partyAffiliation,
        legislativeLevel: member?.legislativeLevel,
        dapilName,
        provinceName,
      },
      theme: {
        primaryHexColor: theme?.primaryHexColor || '#1890ff',
        secondaryHexColor: theme?.secondaryHexColor || '#001529',
        fontFamily: theme?.fontFamily || 'Inter, sans-serif',
        heroBannerUrl: theme?.heroBannerUrl,
        officialPhotoUrl: theme?.officialPhotoUrl,
        headlineTagline: theme?.headlineTagline,
        bioBiography: theme?.bioBiography,
      },
      socialLinks: socials,
      recentArticles,
    };
  }

  async getPublicArticleBySlug(slugOrDomain: string, articleSlug: string) {
    const cleanIdentifier = slugOrDomain.toLowerCase().trim();
    const isSubdomain = !cleanIdentifier.includes('.');

    const [portal] = await db
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

    if (!portal || !portal.isActive) {
      throw new NotFoundException('Portal dewan tidak ditemukan.');
    }

    // Blokir akses jika custom domain belum berstatus VERIFIED
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

  /**
   * PURE FABRICATION / INFORMATION EXPERT:
   * Dipanggil oleh Caddy Server via On-Demand TLS "Ask" directive.
   * Mengembalikan true jika domain terdaftar, berstatus VERIFIED, dan aktif.
   */
  async checkCustomDomainAllowed(domain?: string): Promise<boolean> {
    if (!domain) return false;
    const cleanDomain = domain.toLowerCase().trim();

    // 1. Tolak domain yang ada di blacklist internal
    if (CmsService.BLACKLISTED_DOMAINS.some((b) => cleanDomain === b || cleanDomain.endsWith(`.${b}`))) {
      return false;
    }

    // 2. Query cepat ke basis data
    const [portal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(
        and(
          eq(portalConfigs.customDomain, cleanDomain),
          eq(portalConfigs.customDomainStatus, 'VERIFIED'),
          eq(portalConfigs.isActive, true)
        )
      )
      .limit(1);

    return Boolean(portal);
  }
}
