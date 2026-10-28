import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as dns from 'dns/promises';
import { eq, desc, and } from 'drizzle-orm';
import {
  db,
  domainRequests,
  subdomainAliases,
  portalConfigs,
  tenantMembers,
} from '@polaris/database';
import { RedisService } from '../../redis/redis.service.js';

@Injectable()
export class SuperadminDomainService {
  private readonly logger = new Logger(SuperadminDomainService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Mengambil daftar seluruh pengajuan domain yang masuk dari anggota dewan
   */
  async getDomainRequests(status?: string) {
    const query = db
      .select({
        id: domainRequests.id,
        tenantId: domainRequests.tenantId,
        requestType: domainRequests.requestType,
        requestedDomain: domainRequests.requestedDomain,
        currentDomain: domainRequests.currentDomain,
        status: domainRequests.status,
        adminNotes: domainRequests.adminNotes,
        reviewedByUserId: domainRequests.reviewedByUserId,
        reviewedAt: domainRequests.reviewedAt,
        createdAt: domainRequests.createdAt,
        updatedAt: domainRequests.updatedAt,
        // Info profil pemohon
        tenantName: tenantMembers.fullName,
        tenantEmail: tenantMembers.email,
        partyAffiliation: tenantMembers.partyAffiliation,
        customDapilName: tenantMembers.customDapilName,
        legislativeLevel: tenantMembers.legislativeLevel,
        photoUrl: tenantMembers.photoUrl,
      })
      .from(domainRequests)
      .innerJoin(tenantMembers, eq(domainRequests.tenantId, tenantMembers.id))
      .orderBy(desc(domainRequests.createdAt));

    const results = status
      ? await query.where(eq(domainRequests.status, status))
      : await query;

    return {
      success: true,
      data: results,
      total: results.length,
    };
  }

  /**
   * Pre-flight Check: Melakukan query DNS langsung untuk memeriksa apakah
   * domain yang diajukan sudah mengarah ke IP Server / CNAME Polaris.
   */
  async checkDns(requestId: string) {
    const [request] = await db
      .select()
      .from(domainRequests)
      .where(eq(domainRequests.id, requestId))
      .limit(1);

    if (!request) {
      throw new NotFoundException('Tiket pengajuan domain tidak ditemukan.');
    }

    if (request.requestType === 'SUBDOMAIN') {
      return {
        success: true,
        isSubdomain: true,
        domain: request.requestedDomain,
        isConfiguredCorrectly: true,
        message: 'Pengajuan tipe subdomain internal polaris.id tidak memerlukan perutean DNS eksternal.',
      };
    }

    const domain = request.requestedDomain.toLowerCase().trim();
    const targetIp = process.env.APP_SERVER_IP || '202.155.13.40';
    const targetCname = (process.env.APP_ROOT_DOMAIN || 'app.polaris.id').toLowerCase();

    let resolvedIps: string[] = [];
    let resolvedCnames: string[] = [];
    let isConfiguredCorrectly = false;

    try {
      resolvedIps = await dns.resolve4(domain).catch(() => [] as string[]);
    } catch {
      resolvedIps = [];
    }

    try {
      resolvedCnames = await dns.resolveCname(domain).catch(() => [] as string[]);
    } catch {
      resolvedCnames = [];
    }

    // Periksa apakah ada IP yang cocok dengan server VPS atau CNAME cocok
    const hasMatchingIp = resolvedIps.includes(targetIp);
    const hasMatchingCname = resolvedCnames.some(
      (c) => c.toLowerCase() === targetCname || c.toLowerCase().includes('polaris.id')
    );

    isConfiguredCorrectly = hasMatchingIp || hasMatchingCname;

    return {
      success: true,
      isSubdomain: false,
      domain,
      resolvedIps,
      resolvedCnames,
      targetIp,
      targetCname,
      isConfiguredCorrectly,
      message: isConfiguredCorrectly
        ? `DNS terkonfigurasi valid mengarah ke server Polaris (${hasMatchingIp ? `A: ${targetIp}` : `CNAME: ${targetCname}`}).`
        : `DNS belum mengarah ke Polaris. Rekod A saat ini: [${resolvedIps.join(', ') || 'Kosong'}], CNAME: [${resolvedCnames.join(', ') || 'Kosong'}]. Target harus A: ${targetIp} atau CNAME: ${targetCname}.`,
    };
  }

  /**
   * Menyetujui dan secara resmi mengikat (bind) domain baru ke portal klien
   */
  async approveDomainRequest(requestId: string, adminUserId: string) {
    const [request] = await db
      .select()
      .from(domainRequests)
      .where(eq(domainRequests.id, requestId))
      .limit(1);

    if (!request) {
      throw new NotFoundException('Tiket pengajuan domain tidak ditemukan.');
    }

    if (request.status === 'APPROVED') {
      throw new ConflictException('Pengajuan ini telah disetujui sebelumnya.');
    }

    // 1. Ambil portal klien terkait
    const [portal] = await db
      .select()
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, request.tenantId))
      .limit(1);

    if (!portal) {
      throw new NotFoundException('Portal konfigurasi klien tidak ditemukan.');
    }

    // 2. Eksekusi pengikatan domain sesuai tipe
    if (request.requestType === 'SUBDOMAIN') {
      const oldSlug = portal.subdomainSlug;
      const newSlug = request.requestedDomain;

      // Catat riwayat alias untuk 301 Redirect agar link lama tidak mati
      if (oldSlug && oldSlug !== newSlug) {
        await db
          .insert(subdomainAliases)
          .values({
            tenantId: request.tenantId,
            oldSubdomainSlug: oldSlug,
            newSubdomainSlug: newSlug,
          })
          .onConflictDoNothing();
      }

      // Update subdomain di portal_configs
      await db
        .update(portalConfigs)
        .set({
          subdomainSlug: newSlug,
          updatedAt: new Date(),
        })
        .where(eq(portalConfigs.id, portal.id));
    } else if (request.requestType === 'CUSTOM_DOMAIN') {
      const cleanCustomDomain = request.requestedDomain.toLowerCase().trim();

      // Update custom_domain & set status VERIFIED agar Caddy diizinkan issue SSL
      await db
        .update(portalConfigs)
        .set({
          customDomain: cleanCustomDomain,
          customDomainStatus: 'VERIFIED',
          domainVerifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(portalConfigs.id, portal.id));
    }

    // 3. Update status tiket pengajuan menjadi APPROVED
    const [updatedRequest] = await db
      .update(domainRequests)
      .set({
        status: 'APPROVED',
        reviewedByUserId: adminUserId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(domainRequests.id, requestId))
      .returning();

    // 4. Kirim notifikasi realtime SSE instan ke Klien/Dewan
    try {
      await this.redisService.emitUserNotification(request.tenantId, {
        id: `domain-approved-${requestId}`,
        title: 'Domain Resmi Telah Aktif! 🎉',
        message: `Pengajuan Anda untuk ${request.requestType === 'CUSTOM_DOMAIN' ? 'domain' : 'subdomain'} '${request.requestedDomain}' telah disetujui oleh Administrator dan kini aktif beroperasi.`,
        category: 'SYSTEM',
        link: '/branding/website',
      });
    } catch (err: any) {
      this.logger.warn(`Gagal mengirimkan notifikasi SSE ke tenant: ${err.message}`);
    }

    // 5. Broadcast ke admin console agar tabel pengajuan ter-update secara reaktif
    try {
      await this.redisService.publish('realtime:broadcast', {
        type: 'DOMAIN_REQUEST_UPDATED',
        data: {
          requestId,
          status: 'APPROVED',
          tenantId: request.tenantId,
          domain: request.requestedDomain,
        },
      });
    } catch {}

    this.logger.log(`Domain request ${requestId} APPROVED by admin ${adminUserId}`);

    return {
      success: true,
      message: `Domain '${request.requestedDomain}' berhasil disetujui dan aktif di portal klien.`,
      data: updatedRequest,
    };
  }

  /**
   * Menolak pengajuan domain dengan menyertakan catatan resmi ke dewan
   */
  async rejectDomainRequest(requestId: string, adminNotes: string, adminUserId: string) {
    const [request] = await db
      .select()
      .from(domainRequests)
      .where(eq(domainRequests.id, requestId))
      .limit(1);

    if (!request) {
      throw new NotFoundException('Tiket pengajuan domain tidak ditemukan.');
    }

    if (request.status !== 'PENDING_REVIEW' && request.status !== 'DNS_CHECKING') {
      throw new ConflictException('Hanya pengajuan dengan status pending yang dapat ditolak.');
    }

    const [updatedRequest] = await db
      .update(domainRequests)
      .set({
        status: 'REJECTED',
        adminNotes: adminNotes.trim(),
        reviewedByUserId: adminUserId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(domainRequests.id, requestId))
      .returning();

    // Kirim notifikasi realtime SSE instan ke Klien/Dewan
    try {
      await this.redisService.emitUserNotification(request.tenantId, {
        id: `domain-rejected-${requestId}`,
        title: 'Pemberitahuan Pengajuan Domain',
        message: `Pengajuan domain '${request.requestedDomain}' belum dapat disetujui. Catatan admin: "${adminNotes}"`,
        category: 'SYSTEM',
        link: '/branding/website',
      });
    } catch (err: any) {
      this.logger.warn(`Gagal mengirimkan notifikasi SSE ke tenant: ${err.message}`);
    }

    // Broadcast ke admin console
    try {
      await this.redisService.publish('realtime:broadcast', {
        type: 'DOMAIN_REQUEST_UPDATED',
        data: {
          requestId,
          status: 'REJECTED',
          tenantId: request.tenantId,
          domain: request.requestedDomain,
        },
      });
    } catch {}

    this.logger.log(`Domain request ${requestId} REJECTED by admin ${adminUserId}: ${adminNotes}`);

    return {
      success: true,
      message: `Pengajuan domain '${request.requestedDomain}' telah ditolak dengan catatan.`,
      data: updatedRequest,
    };
  }
}
