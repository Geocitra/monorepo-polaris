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
import { eq, and } from 'drizzle-orm';
import { db, portalConfigs, withTenantContext } from '@polaris/database';
import { SubdomainSlug } from '@polaris/core-domain';
import { UpdateDomainConfigDto } from '../dto/cms.dto.js';

@Injectable()
export class CmsDomainDnsService {
  private readonly logger = new Logger(CmsDomainDnsService.name);

  // Domain terlarang yang tidak boleh diklaim secara sepihak
  public static readonly BLACKLISTED_DOMAINS = [
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
    'localhost',
  ];

  public normalizeCustomDomain(input: string): string {
    const domain = input.trim().replace(/\.$/, '').toLowerCase();
    if (!domain || domain.length > 253 || domain.includes('..') || ipaddr.isValid(domain)) {
      throw new BadRequestException('Domain tidak valid atau mengarah ke alamat terlarang.');
    }

    const labels = domain.split('.');
    if (
      labels.length < 2 ||
      labels.some(
        (label) => label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
      )
    ) {
      throw new BadRequestException('Domain tidak valid atau mengarah ke alamat terlarang.');
    }

    if (
      CmsDomainDnsService.BLACKLISTED_DOMAINS.some(
        (blocked) => domain === blocked || domain.endsWith(`.${blocked}`)
      )
    ) {
      throw new BadRequestException('Domain tidak valid atau mengarah ke alamat terlarang.');
    }
    return domain;
  }

  public isPublicUnicastAddress(address: string): boolean {
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

  public async assertDomainResolvesOnlyToPublicIps(domain: string): Promise<void> {
    const [ipv4, ipv6] = await Promise.all([
      dns.resolve4(domain).catch(() => [] as string[]),
      dns.resolve6(domain).catch(() => [] as string[]),
    ]);
    const addresses = [...ipv4, ...ipv6];
    if (
      addresses.length === 0 ||
      addresses.some((address) => !this.isPublicUnicastAddress(address))
    ) {
      throw new BadRequestException('Domain tidak valid atau mengarah ke alamat terlarang.');
    }
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
        throw new ConflictException(
          `Subdomain '${cleanSlug}' sudah digunakan oleh anggota dewan lain.`
        );
      }

      updates.subdomainSlug = cleanSlug;
    }

    // Pembaruan Custom Domain dengan Tantangan DNS
    if (dto.customDomain !== undefined) {
      const cleanCustomDomain = dto.customDomain
        ? this.normalizeCustomDomain(dto.customDomain)
        : null;

      if (cleanCustomDomain) {
        const [exists] = await db
          .select({ id: portalConfigs.id })
          .from(portalConfigs)
          .where(eq(portalConfigs.customDomain, cleanCustomDomain))
          .limit(1);

        if (exists && exists.id !== portal.id) {
          throw new ConflictException(
            `Custom domain '${cleanCustomDomain}' sudah didaftarkan oleh anggota lain.`
          );
        }

        const challengeExpired =
          !portal.dnsVerificationExpiresAt || portal.dnsVerificationExpiresAt <= new Date();
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
    const resultingDomain =
      dto.customDomain !== undefined ? updates.customDomain ?? null : portal.customDomain;

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
      if (
        portal.customDomainStatus === 'PENDING_VERIFICATION' &&
        portal.dnsVerificationExpiresAt &&
        portal.dnsVerificationExpiresAt <= now
      ) {
        await withTenantContext(tenantId, (tx) =>
          tx
            .update(portalConfigs)
            .set({
              customDomainStatus: 'FAILED',
              dnsVerificationToken: null,
              dnsVerificationExpiresAt: null,
              updatedAt: now,
            })
            .where(eq(portalConfigs.id, portal.id))
        );
      }
      throw new BadRequestException(
        'Tantangan verifikasi domain tidak valid atau telah kedaluwarsa. Daftarkan ulang domain untuk membuat token baru.'
      );
    }

    this.logger.log(`[DNS Verify] Checking custom domain challenge; portalId=${portal.id}`);

    try {
      await this.assertDomainResolvesOnlyToPublicIps(domain);
    } catch {
      await withTenantContext(tenantId, (tx) =>
        tx
          .update(portalConfigs)
          .set({
            customDomainStatus: 'FAILED',
            domainVerifiedAt: null,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(portalConfigs.id, portal.id),
              eq(portalConfigs.dnsVerificationToken, token)
            )
          )
      );
      throw new BadRequestException('Domain tidak valid atau mengarah ke alamat terlarang.');
    }

    let cnameMatched = false;
    try {
      const records = await dns.resolveCname(domain);
      cnameMatched = records.some(
        (record) => record.replace(/\.$/, '').toLowerCase() === expectedCname
      );
    } catch (error: unknown) {
      const code = (error as NodeJS.ErrnoException)?.code;
      this.logger.debug(`CNAME lookup did not verify domain; code=${code ?? 'unknown'}`);
    }

    if (cnameMatched) {
      try {
        await this.assertDomainResolvesOnlyToPublicIps(expectedCname);
      } catch {
        await withTenantContext(tenantId, (tx) =>
          tx
            .update(portalConfigs)
            .set({
              customDomainStatus: 'FAILED',
              domainVerifiedAt: null,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(portalConfigs.id, portal.id),
                eq(portalConfigs.dnsVerificationToken, token)
              )
            )
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

    try {
      await this.assertDomainResolvesOnlyToPublicIps(domain);
    } catch {
      await withTenantContext(tenantId, (tx) =>
        tx
          .update(portalConfigs)
          .set({
            customDomainStatus: 'FAILED',
            domainVerifiedAt: null,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(portalConfigs.id, portal.id),
              eq(portalConfigs.dnsVerificationToken, token)
            )
          )
      );
      throw new BadRequestException('Domain tidak valid atau mengarah ke alamat terlarang.');
    }

    const verifiedAt = new Date();
    const updated = await withTenantContext(tenantId, async (tx) => {
      const [record] = await tx
        .update(portalConfigs)
        .set({
          customDomainStatus: 'VERIFIED',
          domainVerifiedAt: verifiedAt,
          updatedAt: verifiedAt,
        })
        .where(
          and(
            eq(portalConfigs.id, portal.id),
            eq(portalConfigs.customDomain, domain),
            eq(portalConfigs.customDomainStatus, 'PENDING_VERIFICATION'),
            eq(portalConfigs.dnsVerificationToken, token)
          )
        )
        .returning({ id: portalConfigs.id });
      return record;
    });

    if (!updated) {
      throw new ConflictException('Tantangan DNS berubah selama verifikasi. Silakan ulangi proses.');
    }

    return {
      verified: true,
      status: 'VERIFIED',
      message: `Domain '${domain}' berhasil diverifikasi resmi dan kini aktif.`,
    };
  }

  async checkCustomDomainAllowed(domain?: string): Promise<boolean> {
    if (!domain) return false;
    const cleanDomain = domain.toLowerCase().trim();

    if (
      CmsDomainDnsService.BLACKLISTED_DOMAINS.some(
        (b) => cleanDomain === b || cleanDomain.endsWith(`.${b}`)
      )
    ) {
      return false;
    }

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
