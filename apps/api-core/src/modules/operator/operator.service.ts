import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  db,
  systemAdmins,
  tenantMembers,
  operatorTenantAssignments,
  operatorAuditLogs,
  contentPublications,
  tenantQuotaLedgers,
  subscriptions,
  eq,
  and,
  desc,
  asc,
  sql,
} from '@polaris/database';
import {
  AssignOperatorDto,
  UnassignOperatorDto,
  UpdateAssignmentStatusDto,
  CreateOperatorAccountDto,
  UpdateOperatorAccountDto,
} from './dto/operator.dto.js';

@Injectable()
export class OperatorService {
  private readonly logger = new Logger(OperatorService.name);

  /**
   * Mengambil daftar seluruh Anggota Dewan yang ditugaskan ke operator ini.
   * Disertai ringkasan progres harian (jumlah artikel hari ini).
   */
  async getMyAssignments(operatorId: string) {
    const assignments = await db
      .select({
        assignmentId: operatorTenantAssignments.id,
        canDirectPublish: operatorTenantAssignments.canDirectPublish,
        assignmentStatus: operatorTenantAssignments.status,
        assignedAt: operatorTenantAssignments.createdAt,
        tenantId: tenantMembers.id,
        fullName: tenantMembers.fullName,
        photoUrl: tenantMembers.photoUrl,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
        customDapilName: tenantMembers.customDapilName,
        commissionName: tenantMembers.commissionName,
        accountStatus: tenantMembers.accountStatus,
        subscriptionStatus: subscriptions.status,
      })
      .from(operatorTenantAssignments)
      .innerJoin(tenantMembers, eq(operatorTenantAssignments.tenantId, tenantMembers.id))
      .leftJoin(subscriptions, eq(operatorTenantAssignments.tenantId, subscriptions.tenantId))
      .where(
        and(
          eq(operatorTenantAssignments.operatorId, operatorId),
          eq(operatorTenantAssignments.status, 'ACTIVE')
        )
      )
      .orderBy(desc(operatorTenantAssignments.createdAt));

    // Ambil statistik konten hari ini untuk setiap dewan
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const results = await Promise.all(
      assignments.map(async (item) => {
        const [todayPubs] = await db
          .select({
            totalToday: sql<number>`count(*)::int`,
            publishedToday: sql<number>`count(*) filter (where ${contentPublications.status} = 'PUBLISHED')::int`,
            draftToday: sql<number>`count(*) filter (where ${contentPublications.status} = 'DRAFT')::int`,
          })
          .from(contentPublications)
          .where(
            and(
              eq(contentPublications.tenantId, item.tenantId),
              sql`${contentPublications.createdAt} >= ${startOfToday.toISOString()}::timestamptz`
            )
          );

        return {
          ...item,
          todayStats: {
            totalToday: todayPubs?.totalToday ?? 0,
            publishedToday: todayPubs?.publishedToday ?? 0,
            draftToday: todayPubs?.draftToday ?? 0,
            hasPublishedToday: (todayPubs?.publishedToday ?? 0) > 0,
          },
        };
      })
    );

    return results;
  }

  /**
   * Mengambil konteks aktif suatu Dewan untuk Operator Studio.
   * Data kredensial privat (password, nomor HP, email asli) DILARANG diekspos ke operator.
   */
  async getTenantContext(operatorId: string, tenantId: string, isSuperadmin = false) {
    if (!isSuperadmin) {
      const [assignment] = await db
        .select()
        .from(operatorTenantAssignments)
        .where(
          and(
            eq(operatorTenantAssignments.operatorId, operatorId),
            eq(operatorTenantAssignments.tenantId, tenantId),
            eq(operatorTenantAssignments.status, 'ACTIVE')
          )
        )
        .limit(1);

      if (!assignment) {
        throw new ForbiddenException('Anda tidak memiliki penugasan aktif untuk anggota dewan ini.');
      }
    }

    const [tenant] = await db
      .select({
        id: tenantMembers.id,
        fullName: tenantMembers.fullName,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
        customDapilName: tenantMembers.customDapilName,
        commissionName: tenantMembers.commissionName,
        photoUrl: tenantMembers.photoUrl,
        issueInterests: tenantMembers.issueInterests,
        education: tenantMembers.education,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new NotFoundException('Data dewan tidak ditemukan.');
    }

    // Ambil metrik pencatatan pemakaian AI bulan berjalan (otomatis reset tiap bulan baru)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [quota] = await db
      .select()
      .from(tenantQuotaLedgers)
      .where(
        and(
          eq(tenantQuotaLedgers.tenantId, tenantId),
          eq(tenantQuotaLedgers.billingCycleMonth, currentMonth)
        )
      )
      .limit(1);

    // Ambil status langganan aktif
    const [sub] = await db
      .select({ status: subscriptions.status })
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    return {
      tenant,
      subscriptionStatus: sub?.status || 'INACTIVE',
      quota: quota
        ? {
            articleLimit: quota.articleLimit,
            articleUsed: quota.articleUsed,
            dalleLimit: quota.dalleLimit,
            dalleUsed: quota.dalleUsed,
            totalTokensConsumed: quota.totalTokensConsumed,
            billingCycleMonth: quota.billingCycleMonth,
          }
        : null,
    };
  }

  /**
   * Menulis rekaman jejak audit forensik untuk semua aksi yang dijalankan operator.
   */
  async logOperatorAction(params: {
    operatorId: string;
    tenantId?: string;
    action: string;
    targetEntity: string;
    targetEntityId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await db.insert(operatorAuditLogs).values({
        operatorId: params.operatorId,
        tenantId: params.tenantId,
        action: params.action,
        targetEntity: params.targetEntity,
        targetEntityId: params.targetEntityId,
        details: params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
    } catch (err) {
      this.logger.error(`Gagal mencatat audit log operator: ${(err as Error).message}`, (err as Error).stack);
    }
  }

  /**
   * Mengambil riwayat log audit untuk operator tertentu
   */
  async getAuditLogs(operatorId: string, limit = 50) {
    return await db
      .select({
        id: operatorAuditLogs.id,
        action: operatorAuditLogs.action,
        targetEntity: operatorAuditLogs.targetEntity,
        targetEntityId: operatorAuditLogs.targetEntityId,
        details: operatorAuditLogs.details,
        ipAddress: operatorAuditLogs.ipAddress,
        userAgent: operatorAuditLogs.userAgent,
        createdAt: operatorAuditLogs.createdAt,
        tenantName: tenantMembers.fullName,
      })
      .from(operatorAuditLogs)
      .leftJoin(tenantMembers, eq(operatorAuditLogs.tenantId, tenantMembers.id))
      .where(eq(operatorAuditLogs.operatorId, operatorId))
      .orderBy(desc(operatorAuditLogs.createdAt))
      .limit(limit);
  }

  // =========================================================================
  // SUPERADMIN CONTROL TOWER METHODS
  // =========================================================================

  /**
   * Menugaskan seorang Anggota Dewan ke Operator tertentu.
   */
  async assignTenant(adminId: string, dto: AssignOperatorDto) {
    // Validasi keberadaan operator
    const [operator] = await db
      .select()
      .from(systemAdmins)
      .where(eq(systemAdmins.id, dto.operatorId))
      .limit(1);

    if (!operator) {
      throw new NotFoundException('Operator tidak ditemukan.');
    }

    // Validasi keberadaan tenant
    const [tenant] = await db
      .select()
      .from(tenantMembers)
      .where(eq(tenantMembers.id, dto.tenantId))
      .limit(1);

    if (!tenant) {
      throw new NotFoundException('Anggota dewan tidak ditemukan.');
    }

    // Upsert penugasan
    const [existing] = await db
      .select()
      .from(operatorTenantAssignments)
      .where(
        and(
          eq(operatorTenantAssignments.operatorId, dto.operatorId),
          eq(operatorTenantAssignments.tenantId, dto.tenantId)
        )
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(operatorTenantAssignments)
        .set({
          status: 'ACTIVE',
          canDirectPublish: dto.canDirectPublish ?? existing.canDirectPublish,
          notes: dto.notes ?? existing.notes,
          assignedByAdminId: adminId,
          updatedAt: new Date(),
        })
        .where(eq(operatorTenantAssignments.id, existing.id))
        .returning();

      return { message: 'Penugasan berhasil diperbarui menjadi aktif.', assignment: updated };
    }

    const [created] = await db
      .insert(operatorTenantAssignments)
      .values({
        operatorId: dto.operatorId,
        tenantId: dto.tenantId,
        canDirectPublish: dto.canDirectPublish ?? false,
        status: 'ACTIVE',
        notes: dto.notes,
        assignedByAdminId: adminId,
      })
      .returning();

    return { message: 'Dewan berhasil ditugaskan ke operator.', assignment: created };
  }

  /**
   * Mencabut penugasan dewan dari operator (Revoke Access)
   */
  async unassignTenant(dto: UnassignOperatorDto) {
    const [updated] = await db
      .update(operatorTenantAssignments)
      .set({
        status: 'REVOKED',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(operatorTenantAssignments.operatorId, dto.operatorId),
          eq(operatorTenantAssignments.tenantId, dto.tenantId)
        )
      )
      .returning();

    if (!updated) {
      throw new NotFoundException('Data penugasan tidak ditemukan.');
    }

    return { message: 'Akses operator terhadap dewan ini telah berhasil dicabut.' };
  }

  /**
   * Mengambil daftar seluruh operator internal Polaris beserta jumlah dewan binaan.
   */
  async listOperators() {
    const operators = await db
      .select({
        id: systemAdmins.id,
        email: systemAdmins.email,
        fullName: systemAdmins.fullName,
        role: systemAdmins.role,
        isActive: systemAdmins.isActive,
        lastLoginAt: systemAdmins.lastLoginAt,
        createdAt: systemAdmins.createdAt,
      })
      .from(systemAdmins)
      .where(sql`${systemAdmins.role} IN ('CONTENT_OPERATOR', 'SUPPORT_OPERATOR')`)
      .orderBy(desc(systemAdmins.createdAt));

    const enriched = await Promise.all(
      operators.map(async (op) => {
        const [counts] = await db
          .select({
            activeAssignments: sql<number>`count(*)::int`,
          })
          .from(operatorTenantAssignments)
          .where(
            and(
              eq(operatorTenantAssignments.operatorId, op.id),
              eq(operatorTenantAssignments.status, 'ACTIVE')
            )
          );

        return {
          ...op,
          activeAssignmentsCount: counts?.activeAssignments ?? 0,
        };
      })
    );

    return enriched;
  }

  /**
   * Membuat akun staf operator baru
   */
  async createOperatorAccount(dto: CreateOperatorAccountDto) {
    const cleanEmail = dto.email.toLowerCase().trim();

    const [existing] = await db
      .select()
      .from(systemAdmins)
      .where(eq(systemAdmins.email, cleanEmail))
      .limit(1);

    if (existing) {
      throw new ConflictException('Email ini sudah terdaftar sebagai pengguna sistem.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const [newAdmin] = await db
      .insert(systemAdmins)
      .values({
        email: cleanEmail,
        passwordHash,
        fullName: dto.fullName.trim(),
        role: 'CONTENT_OPERATOR',
        avatarUrl: dto.avatarUrl,
        isActive: true,
      })
      .returning({
        id: systemAdmins.id,
        email: systemAdmins.email,
        fullName: systemAdmins.fullName,
        role: systemAdmins.role,
        createdAt: systemAdmins.createdAt,
      });

    return {
      message: 'Akun operator Polaris berhasil dibuat.',
      operator: newAdmin,
    };
  }

  /**
   * Mengambil daftar seluruh tokoh / anggota dewan untuk memudahkan penugasan operator di UI.
   */
  async listAvailableTenants() {
    return await db
      .select({
        id: tenantMembers.id,
        fullName: tenantMembers.fullName,
        partyAffiliation: tenantMembers.partyAffiliation,
        customDapilName: tenantMembers.customDapilName,
        legislativeLevel: tenantMembers.legislativeLevel,
        photoUrl: tenantMembers.photoUrl,
        username: tenantMembers.username,
      })
      .from(tenantMembers)
      .orderBy(asc(tenantMembers.fullName));
  }

  /**
   * Mengambil detail lengkap seorang staf operator beserta daftar penugasan dewan aktifnya.
   */
  async getOperatorDetail(operatorId: string) {
    const [operator] = await db
      .select({
        id: systemAdmins.id,
        email: systemAdmins.email,
        fullName: systemAdmins.fullName,
        role: systemAdmins.role,
        isActive: systemAdmins.isActive,
        avatarUrl: systemAdmins.avatarUrl,
        lastLoginAt: systemAdmins.lastLoginAt,
        createdAt: systemAdmins.createdAt,
      })
      .from(systemAdmins)
      .where(eq(systemAdmins.id, operatorId))
      .limit(1);

    if (!operator) {
      throw new NotFoundException('Operator tidak ditemukan.');
    }

    const assignments = await db
      .select({
        id: operatorTenantAssignments.id,
        tenantId: operatorTenantAssignments.tenantId,
        status: operatorTenantAssignments.status,
        canDirectPublish: operatorTenantAssignments.canDirectPublish,
        notes: operatorTenantAssignments.notes,
        createdAt: operatorTenantAssignments.createdAt,
        updatedAt: operatorTenantAssignments.updatedAt,
        tenantFullName: tenantMembers.fullName,
        partyAffiliation: tenantMembers.partyAffiliation,
        customDapilName: tenantMembers.customDapilName,
        legislativeLevel: tenantMembers.legislativeLevel,
        photoUrl: tenantMembers.photoUrl,
      })
      .from(operatorTenantAssignments)
      .innerJoin(tenantMembers, eq(operatorTenantAssignments.tenantId, tenantMembers.id))
      .where(eq(operatorTenantAssignments.operatorId, operatorId))
      .orderBy(desc(operatorTenantAssignments.createdAt));

    return {
      operator,
      assignments,
    };
  }

  /**
   * Memperbarui informasi profil, email, password baru, atau status aktif/nonaktif operator
   */
  async updateOperatorAccount(operatorId: string, dto: UpdateOperatorAccountDto) {
    const [existing] = await db
      .select()
      .from(systemAdmins)
      .where(eq(systemAdmins.id, operatorId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Operator tidak ditemukan.');
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (dto.fullName) {
      updateData.fullName = dto.fullName.trim();
    }

    if (dto.email && dto.email.toLowerCase().trim() !== existing.email) {
      const cleanEmail = dto.email.toLowerCase().trim();
      const [emailConflict] = await db
        .select()
        .from(systemAdmins)
        .where(eq(systemAdmins.email, cleanEmail))
        .limit(1);

      if (emailConflict) {
        throw new ConflictException('Email ini sudah digunakan oleh akun lain.');
      }
      updateData.email = cleanEmail;
    }

    if (dto.password && dto.password.trim().length >= 6) {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(dto.password.trim(), saltRounds);
    }

    if (typeof dto.isActive === 'boolean') {
      updateData.isActive = dto.isActive;
    }

    if (dto.avatarUrl !== undefined) {
      updateData.avatarUrl = dto.avatarUrl;
    }

    const [updated] = await db
      .update(systemAdmins)
      .set(updateData)
      .where(eq(systemAdmins.id, operatorId))
      .returning({
        id: systemAdmins.id,
        email: systemAdmins.email,
        fullName: systemAdmins.fullName,
        role: systemAdmins.role,
        isActive: systemAdmins.isActive,
        updatedAt: systemAdmins.updatedAt,
      });

    return {
      message: 'Data staf operator berhasil diperbarui.',
      operator: updated,
    };
  }

  /**
   * Menghapus akun operator dan mencabut seluruh penugasan dewan
   */
  async deleteOperatorAccount(operatorId: string) {
    const [existing] = await db
      .select()
      .from(systemAdmins)
      .where(eq(systemAdmins.id, operatorId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Operator tidak ditemukan.');
    }

    // Hapus seluruh penugasan terkait
    await db
      .delete(operatorTenantAssignments)
      .where(eq(operatorTenantAssignments.operatorId, operatorId));

    // Hapus akun operator
    await db
      .delete(systemAdmins)
      .where(eq(systemAdmins.id, operatorId));

    return { message: 'Akun operator berhasil dihapus.' };
  }

  /**
   * Operator: Memperbarui profil publik dewan binaan (nama, partai, bio, komisi, dapil, foto)
   * Kredensial, sandi, email, dan billing terisolasi dan tidak dapat diubah di sini.
   */
  async updateTenantProfile(
    operatorId: string,
    tenantId: string,
    dto: {
      fullName?: string;
      partyAffiliation?: string;
      customDapilName?: string;
      commissionName?: string;
      photoUrl?: string;
      education?: string;
      issueInterests?: string[];
    },
    isSuperadmin = false
  ) {
    if (!isSuperadmin) {
      const [assignment] = await db
        .select()
        .from(operatorTenantAssignments)
        .where(
          and(
            eq(operatorTenantAssignments.operatorId, operatorId),
            eq(operatorTenantAssignments.tenantId, tenantId),
            eq(operatorTenantAssignments.status, 'ACTIVE')
          )
        )
        .limit(1);

      if (!assignment) {
        throw new ForbiddenException('Akses Ditolak: Anda tidak memiliki penugasan aktif untuk anggota dewan ini.');
      }
    }

    const updateData: any = {};
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName.trim();
    if (dto.partyAffiliation !== undefined) updateData.partyAffiliation = dto.partyAffiliation.trim();
    if (dto.customDapilName !== undefined) updateData.customDapilName = dto.customDapilName?.trim() || null;
    if (dto.commissionName !== undefined) updateData.commissionName = dto.commissionName?.trim() || null;
    if (dto.photoUrl !== undefined) updateData.photoUrl = dto.photoUrl?.trim() || null;
    if (dto.education !== undefined) updateData.education = dto.education?.trim() || null;
    if (dto.issueInterests !== undefined) updateData.issueInterests = dto.issueInterests;
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(tenantMembers)
      .set(updateData)
      .where(eq(tenantMembers.id, tenantId))
      .returning({
        id: tenantMembers.id,
        fullName: tenantMembers.fullName,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
        customDapilName: tenantMembers.customDapilName,
        commissionName: tenantMembers.commissionName,
        photoUrl: tenantMembers.photoUrl,
        issueInterests: tenantMembers.issueInterests,
        education: tenantMembers.education,
      });

    return {
      message: 'Profil publik dewan binaan berhasil diperbarui.',
      tenant: updated,
    };
  }
}
