import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef, Optional } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { db, licenseInquiries, systemAdmins, tenantMembers } from '@polaris/database';
import { InquiryStatus, LegislativeLevel, PlanTier } from '@polaris/shared-types';
import {
  SubmitInquiryRequestDto,
  ScheduleMeetRequestDto,
  UpdateInquiryStatusRequestDto,
  ConvertInquiryLeadDto,
} from './dto/inquiry.dto.js';
import { EmailService } from '../../common/services/email.service.js';
import { RedisService } from '../redis/redis.service.js';
import { SuperadminService } from '../superadmin/superadmin.service.js';

@Injectable()
export class InquiryService {
  private readonly logger = new Logger(InquiryService.name);

  constructor(
    private readonly emailService: EmailService,
    @Optional() private readonly redisService?: RedisService,
    @Optional()
    @Inject(forwardRef(() => SuperadminService))
    private readonly superadminService?: SuperadminService,
  ) {}

  async submitInquiry(dto: SubmitInquiryRequestDto) {
    const [created] = await db
      .insert(licenseInquiries)
      .values({
        fullName: dto.fullName.trim(),
        phoneNumber: dto.phoneNumber.trim(),
        officialEmail: dto.officialEmail.trim().toLowerCase(),
        partyAffiliation: dto.partyAffiliation?.trim() || null,
        legislativeLevel: dto.legislativeLevel,
        targetRegion: dto.targetRegion.trim(),
        preferredCycle: dto.preferredCycle || 'SEMESTER',
        preferredTier: dto.preferredTier || PlanTier.PRO,
        status: InquiryStatus.NEW_LEAD,
      })
      .returning();

    this.logger.log(
      `[InquiryService] Lead baru diterima: ${created.fullName} (${created.legislativeLevel}) - ID: ${created.id}`
    );

    // Kirim notifikasi realtime jika Redis aktif
    if (this.redisService) {
      try {
        await this.redisService.publish(
          'superadmin:notifications',
          JSON.stringify({
            type: 'NEW_INQUIRY',
            id: created.id,
            fullName: created.fullName,
            level: created.legislativeLevel,
            timestamp: new Date().toISOString(),
          })
        );
      } catch (err: any) {
        this.logger.warn(`[InquiryService] Gagal memancarkan event redis: ${err.message}`);
      }
    }

    return {
      success: true,
      inquiryId: created.id,
      message: 'Permohonan konsultasi lisensi dan jadwal presentasi berhasil diajukan. Tim representasi POLARIS akan segera menghubungi Anda.',
    };
  }

  async getAllInquiries(status?: InquiryStatus, level?: LegislativeLevel) {
    const conditions = [];
    if (status) conditions.push(eq(licenseInquiries.status, status));
    if (level) conditions.push(eq(licenseInquiries.legislativeLevel, level));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select({
        id: licenseInquiries.id,
        fullName: licenseInquiries.fullName,
        phoneNumber: licenseInquiries.phoneNumber,
        officialEmail: licenseInquiries.officialEmail,
        partyAffiliation: licenseInquiries.partyAffiliation,
        legislativeLevel: licenseInquiries.legislativeLevel,
        targetRegion: licenseInquiries.targetRegion,
        preferredCycle: licenseInquiries.preferredCycle,
        preferredTier: licenseInquiries.preferredTier,
        meetingDatetime: licenseInquiries.meetingDatetime,
        meetingUrl: licenseInquiries.meetingUrl,
        adminNotes: licenseInquiries.adminNotes,
        status: licenseInquiries.status,
        handledByAdminId: licenseInquiries.handledByAdminId,
        convertedTenantId: licenseInquiries.convertedTenantId,
        createdAt: licenseInquiries.createdAt,
        updatedAt: licenseInquiries.updatedAt,
      })
      .from(licenseInquiries)
      .where(whereClause)
      .orderBy(desc(licenseInquiries.createdAt));
  }

  async getInquiryById(id: string) {
    const [inquiry] = await db
      .select()
      .from(licenseInquiries)
      .where(eq(licenseInquiries.id, id))
      .limit(1);

    if (!inquiry) {
      throw new NotFoundException('Data permohonan lisensi tidak ditemukan.');
    }

    return inquiry;
  }

  async scheduleMeeting(id: string, dto: ScheduleMeetRequestDto, adminId?: string) {
    const inquiry = await this.getInquiryById(id);

    const meetDate = new Date(dto.meetingDatetime);
    if (isNaN(meetDate.getTime())) {
      throw new BadRequestException('Format tanggal dan waktu meeting tidak valid.');
    }

    const [updated] = await db
      .update(licenseInquiries)
      .set({
        meetingDatetime: meetDate,
        meetingUrl: dto.meetingUrl.trim(),
        adminNotes: dto.adminNotes?.trim() || inquiry.adminNotes,
        status: InquiryStatus.MEETING_SCHEDULED,
        handledByAdminId: adminId || inquiry.handledByAdminId,
        updatedAt: new Date(),
      })
      .where(eq(licenseInquiries.id, id))
      .returning();

    this.logger.log(
      `[InquiryService] Jadwal demo Google Meet disetel untuk ${updated.fullName}: ${dto.meetingUrl} pada ${meetDate.toISOString()}`
    );

    return {
      success: true,
      message: 'Jadwal Google Meet dan status lead berhasil diperbarui.',
      data: updated,
    };
  }

  async updateStatus(id: string, dto: UpdateInquiryStatusRequestDto, adminId?: string) {
    await this.getInquiryById(id);

    const [updated] = await db
      .update(licenseInquiries)
      .set({
        status: dto.status,
        adminNotes: dto.adminNotes?.trim() || undefined,
        handledByAdminId: adminId || undefined,
        updatedAt: new Date(),
      })
      .where(eq(licenseInquiries.id, id))
      .returning();

    return {
      success: true,
      message: 'Status inquiry berhasil diperbarui.',
      data: updated,
    };
  }

  /**
   * Superadmin Authority: Mengonversi inquiry lead menjadi akun dewan aktif secara atomik
   */
  async convertInquiryToTenant(id: string, dto: ConvertInquiryLeadDto, adminId?: string) {
    const inquiry = await this.getInquiryById(id);

    if (inquiry.status === InquiryStatus.DEAL_CONVERTED) {
      throw new BadRequestException('Lead permohonan lisensi ini sudah pernah dikonversi menjadi akun resmi.');
    }

    if (!this.superadminService) {
      throw new BadRequestException('Layanan superadmin belum tersedia untuk provisioning akun.');
    }

    const createdTenant = await this.superadminService.createTenantWithCredentials({
      email: inquiry.officialEmail,
      username: dto.username,
      fullName: inquiry.fullName,
      phoneNumber: inquiry.phoneNumber,
      partyAffiliation: inquiry.partyAffiliation || undefined,
      legislativeLevel: inquiry.legislativeLevel as unknown as LegislativeLevel,
      customDapilName: dto.customDapilName || inquiry.targetRegion,
      subdomainSlug: dto.subdomainSlug,
      planTier: dto.planTier || (inquiry.preferredTier as unknown as PlanTier) || PlanTier.PRO,
      billingCycle: dto.billingCycle || inquiry.preferredCycle || 'SEMESTER',
      inquiryId: inquiry.id,
    });

    this.logger.log(
      `[InquiryService] Lead ${inquiry.id} (${inquiry.fullName}) berhasil dikonversi ke tenant ${createdTenant.data.id} oleh admin ${adminId || 'SUPERADMIN'}`
    );

    return {
      success: true,
      message: 'Lead permohonan lisensi berhasil dikonversi menjadi akun resmi dewan.',
      data: createdTenant.data,
    };
  }
}

