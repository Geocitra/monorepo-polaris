import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { eq, and, ne } from 'drizzle-orm';
import {
  db,
  tenantMembers,
  portalConfigs,
  portalThemeSettings,
  subscriptions,
  electoralDistricts,
  masterCommissions,
} from '@polaris/database';
import { UpdateProfileDto } from '../dto/auth.dto.js';

@Injectable()
export class IdentityProfileService {
  private readonly logger = new Logger(IdentityProfileService.name);

  async getProfile(tenantId: string) {
    const [member] = await db
      .select({
        id: tenantMembers.id,
        email: tenantMembers.email,
        fullName: tenantMembers.fullName,
        phoneNumber: tenantMembers.phoneNumber,
        partyAffiliation: tenantMembers.partyAffiliation,
        legislativeLevel: tenantMembers.legislativeLevel,
        username: tenantMembers.username,
        mustChangePassword: tenantMembers.mustChangePassword,
        passwordChangedAt: tenantMembers.passwordChangedAt,
        electoralDistrictId: tenantMembers.electoralDistrictId,
        customDapilName: tenantMembers.customDapilName,
        personalCoverage: tenantMembers.personalCoverage,
        commissionId: tenantMembers.commissionId,
        commissionName: tenantMembers.commissionName,
        photoUrl: tenantMembers.photoUrl,
        photoGallery: tenantMembers.photoGallery,
        gender: tenantMembers.gender,
        birthDate: tenantMembers.birthDate,
        education: tenantMembers.education,
        courses: tenantMembers.courses,
        issueInterests: tenantMembers.issueInterests,
        createdAt: tenantMembers.createdAt,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new UnauthorizedException('Pengguna tidak ditemukan.');
    }

    // Resolusi Dapil Master (KPU Reference)
    let masterDapil = null;
    if (member.electoralDistrictId) {
      const [dapil] = await db
        .select({
          id: electoralDistricts.id,
          dapilCode: electoralDistricts.dapilCode,
          dapilName: electoralDistricts.dapilName,
          provinceName: electoralDistricts.provinceName,
          regencyCoverage: electoralDistricts.regencyCoverage,
          totalVoters: electoralDistricts.totalVoters,
        })
        .from(electoralDistricts)
        .where(eq(electoralDistricts.id, member.electoralDistrictId))
        .limit(1);
      masterDapil = dapil || null;
    }

    const effectiveDapilName =
      member.customDapilName || masterDapil?.dapilName || 'Dapil Belum Ditentukan';
    const effectiveProvinceName = masterDapil?.provinceName || 'Provinsi Wilayah';
    const effectiveCoverage =
      member.personalCoverage && member.personalCoverage.length > 0
        ? member.personalCoverage
        : masterDapil?.regencyCoverage || [];

    const effectiveElectoralDistrict = {
      id: masterDapil?.id || null,
      dapilCode: masterDapil?.dapilCode || 'DAPIL-PERSONAL',
      dapilName: effectiveDapilName,
      provinceName: effectiveProvinceName,
      regencyCoverage: effectiveCoverage,
      totalVoters: masterDapil?.totalVoters || null,
      isCustomized: Boolean(
        member.customDapilName ||
          (member.personalCoverage && member.personalCoverage.length > 0)
      ),
    };

    const [portal] = await db
      .select({
        id: portalConfigs.id,
        subdomainSlug: portalConfigs.subdomainSlug,
        customDomain: portalConfigs.customDomain,
      })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    let portalTheme = null;
    if (portal) {
      const [theme] = await db
        .select({
          officialPhotoUrl: portalThemeSettings.officialPhotoUrl,
        })
        .from(portalThemeSettings)
        .where(eq(portalThemeSettings.portalId, portal.id))
        .limit(1);
      portalTheme = theme || null;
    }

    const [sub] = await db
      .select({
        status: subscriptions.status,
        planTier: subscriptions.planTier,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
      })
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    const resolvedPhotoUrl = member.photoUrl || portalTheme?.officialPhotoUrl || null;

    return {
      ...member,
      photoUrl: resolvedPhotoUrl,
      officialPhotoUrl: resolvedPhotoUrl,
      avatarUrl: resolvedPhotoUrl,
      photoGallery: Array.isArray(member.photoGallery) ? member.photoGallery : [],
      institutionPartyName: member.partyAffiliation,
      officeRole: member.legislativeLevel,
      electoralDistrict: effectiveElectoralDistrict,
      masterElectoralDistrict: masterDapil,
      subdomain: portal?.subdomainSlug,
      customDomain: portal?.customDomain,
      subscription: sub,
    };
  }

  async updateProfile(tenantId: string, dto: UpdateProfileDto) {
    const [member] = await db
      .select({
        id: tenantMembers.id,
        electoralDistrictId: tenantMembers.electoralDistrictId,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, tenantId))
      .limit(1);

    if (!member) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    const updates: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (dto.fullName && dto.fullName.trim()) {
      updates.fullName = dto.fullName.trim();
    }
    if (dto.phoneNumber && dto.phoneNumber.trim()) {
      updates.phoneNumber = dto.phoneNumber.trim();
    }
    if (dto.partyAffiliation !== undefined || dto.institutionPartyName !== undefined) {
      const party = dto.partyAffiliation?.trim() || dto.institutionPartyName?.trim() || null;
      updates.partyAffiliation = party;
    }

    if (dto.username !== undefined) {
      const cleanUsername = dto.username?.trim().toLowerCase() || null;
      if (cleanUsername) {
        if (!/^[a-z0-9_-]{3,30}$/.test(cleanUsername)) {
          throw new BadRequestException(
            'Username hanya boleh 3-30 karakter alphanumeric, minus, atau underscore.'
          );
        }
        const [existing] = await db
          .select({ id: tenantMembers.id })
          .from(tenantMembers)
          .where(and(eq(tenantMembers.username, cleanUsername), ne(tenantMembers.id, tenantId)))
          .limit(1);

        if (existing) {
          throw new ConflictException('Username sudah digunakan oleh akun lain.');
        }
        updates.username = cleanUsername;
      } else {
        updates.username = null;
      }
    }

    if (dto.photoUrl !== undefined) {
      const cleanPhoto = dto.photoUrl?.trim() || null;
      updates.photoUrl = cleanPhoto;

      const [portal] = await db
        .select({ id: portalConfigs.id })
        .from(portalConfigs)
        .where(eq(portalConfigs.tenantId, tenantId))
        .limit(1);

      if (portal) {
        await db
          .update(portalThemeSettings)
          .set({ officialPhotoUrl: cleanPhoto })
          .where(eq(portalThemeSettings.portalId, portal.id));
      }
    }

    if (dto.photoGallery !== undefined) {
      let parsedGallery: string[] = [];
      if (Array.isArray(dto.photoGallery)) {
        parsedGallery = dto.photoGallery
          .map((item: any) => (typeof item === 'string' ? item.trim() : ''))
          .filter(Boolean);
      } else if (typeof dto.photoGallery === 'string') {
        try {
          const parsed = JSON.parse(dto.photoGallery);
          parsedGallery = Array.isArray(parsed)
            ? parsed
                .map((item: any) => (typeof item === 'string' ? item.trim() : ''))
                .filter(Boolean)
            : [dto.photoGallery.trim()].filter(Boolean);
        } catch {
          parsedGallery = dto.photoGallery.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
      if (parsedGallery.length > 10) {
        throw new BadRequestException('Katalog foto pribadi maksimal 10 foto.');
      }
      updates.photoGallery = parsedGallery;
    }

    if (dto.gender !== undefined) {
      updates.gender = dto.gender?.trim() || null;
    }

    if (dto.birthDate !== undefined) {
      updates.birthDate = dto.birthDate?.trim() || null;
    }

    if (dto.education !== undefined) {
      updates.education =
        typeof dto.education === 'string' ? dto.education.trim() : JSON.stringify(dto.education);
    }

    if (dto.courses !== undefined) {
      if (Array.isArray(dto.courses)) {
        updates.courses = dto.courses
          .map((c: string) => (typeof c === 'string' ? c.trim() : ''))
          .filter(Boolean);
      } else if (typeof dto.courses === 'string') {
        try {
          const parsed = JSON.parse(dto.courses);
          updates.courses = Array.isArray(parsed) ? parsed : [dto.courses.trim()];
        } catch {
          updates.courses = dto.courses
            .split(',')
            .map((c: string) => c.trim())
            .filter(Boolean);
        }
      }
    }

    if (dto.issueInterests !== undefined) {
      if (Array.isArray(dto.issueInterests)) {
        updates.issueInterests = dto.issueInterests
          .map((i: string) => (typeof i === 'string' ? i.trim() : ''))
          .filter(Boolean);
      } else if (typeof dto.issueInterests === 'string') {
        try {
          const parsed = JSON.parse(dto.issueInterests);
          updates.issueInterests = Array.isArray(parsed) ? parsed : [dto.issueInterests.trim()];
        } catch {
          updates.issueInterests = dto.issueInterests
            .split(',')
            .map((i: string) => i.trim())
            .filter(Boolean);
        }
      }
    }

    if (dto.dapilId !== undefined) {
      const cleanDapilId = dto.dapilId?.trim();
      if (
        cleanDapilId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanDapilId)
      ) {
        const [foundMaster] = await db
          .select({ id: electoralDistricts.id })
          .from(electoralDistricts)
          .where(eq(electoralDistricts.id, cleanDapilId))
          .limit(1);

        if (foundMaster) {
          updates.electoralDistrictId = foundMaster.id;
        }
      } else if (cleanDapilId === '' || cleanDapilId === null) {
        updates.electoralDistrictId = null;
      }
    }

    if (dto.dapilName !== undefined) {
      updates.customDapilName = dto.dapilName?.trim() || null;
    }

    if (dto.regencyCoverage !== undefined) {
      let parsedCoverage: string[] = [];
      if (Array.isArray(dto.regencyCoverage)) {
        parsedCoverage = dto.regencyCoverage.map((r: string) => r.trim()).filter(Boolean);
      } else if (typeof dto.regencyCoverage === 'string' && dto.regencyCoverage.trim()) {
        parsedCoverage = dto.regencyCoverage
          .split(',')
          .map((r: string) => r.trim())
          .filter(Boolean);
      }
      updates.personalCoverage = parsedCoverage;
    }

    if (dto.commissionId !== undefined) {
      updates.commissionId = dto.commissionId?.trim() || null;
    }
    if (dto.commissionName !== undefined) {
      updates.commissionName = dto.commissionName?.trim() || null;
    }

    if (Object.keys(updates).length > 0) {
      await db
        .update(tenantMembers)
        .set(updates)
        .where(eq(tenantMembers.id, tenantId));
    }

    return await this.getProfile(tenantId);
  }

  async getCommissions(level?: string) {
    const rows = await db
      .select()
      .from(masterCommissions)
      .orderBy(masterCommissions.code);

    if (level && level !== 'ALL') {
      return rows.filter((r) => r.legislativeLevel === level);
    }
    return rows;
  }
}
