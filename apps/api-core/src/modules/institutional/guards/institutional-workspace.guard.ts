import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  db,
  organizations,
  organizationContracts,
  organizationUnits,
  organizationMemberships,
  organizationUnitMemberships,
  eq,
  and,
  desc,
} from '@polaris/database';
import {
  OrganizationStatus,
  OrganizationContractStatus,
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
  OrganizationUnitType,
  InstitutionalMembershipStatus,
} from '@polaris/shared-types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const REQUIRE_ORG_ROLES_KEY = 'require_org_roles';
export const REQUIRE_UNIT_ROLES_KEY = 'require_unit_roles';
export const ALLOW_ORG_ADMIN_UNIT_BYPASS_KEY = 'allow_org_admin_unit_bypass';

export const RequireOrgRoles = (...roles: OrganizationMemberRole[]) =>
  SetMetadata(REQUIRE_ORG_ROLES_KEY, roles);

export const RequireUnitRoles = (...roles: OrganizationUnitMemberRole[]) =>
  SetMetadata(REQUIRE_UNIT_ROLES_KEY, roles);

export const AllowOrgAdminUnitManagement = () =>
  SetMetadata(ALLOW_ORG_ADMIN_UNIT_BYPASS_KEY, true);

export interface VerifiedInstitutionalContext {
  organizationId: string;
  organizationName: string;
  legislativeLevel: string;
  regionName: string;
  orgRole: OrganizationMemberRole;
  unitId: string | null;
  unitCode: string | null;
  unitName: string | null;
  unitType: OrganizationUnitType | null;
  unitRole: OrganizationUnitMemberRole | null;
  activeContractId: string | null;
}

export const CurrentInstitutionalContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): VerifiedInstitutionalContext | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.institutionalContext as VerifiedInstitutionalContext | undefined;
  }
);

@Injectable()
export class InstitutionalWorkspaceGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tenantId) {
      throw new ForbiddenException('Identitas sesi pengguna tidak ditemukan.');
    }

    const orgId = (request.params?.orgId || request.headers?.['x-active-org-id']) as
      | string
      | undefined;
    const unitId = (request.params?.unitId || request.headers?.['x-active-unit-id']) as
      | string
      | undefined;

    if (!orgId) {
      return true;
    }

    if (!UUID_PATTERN.test(orgId)) {
      throw new BadRequestException('Format UUID Instansi (orgId) tidak valid.');
    }

    if (unitId && !UUID_PATTERN.test(unitId)) {
      throw new BadRequestException('Format UUID Unit/Bidang (unitId) tidak valid.');
    }

    // 1. Verifikasi Instansi ada dan aktif
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org) {
      throw new ForbiddenException('Instansi tidak ditemukan dalam sistem.');
    }

    const isSuperadmin = user.isSuperadmin === true || user.role === 'SUPERADMIN';

    if (org.status !== OrganizationStatus.ACTIVE && !isSuperadmin) {
      throw new ForbiddenException(
        `Ruang kerja Instansi "${org.name}" saat ini berstatus ${org.status}. Hubungi Superadmin.`
      );
    }

    // 2. Verifikasi Kontrak Tahunan B2G Instansi aktif & kuota tersedia
    const [contract] = await db
      .select()
      .from(organizationContracts)
      .where(eq(organizationContracts.organizationId, orgId))
      .orderBy(desc(organizationContracts.endDate))
      .limit(1);

    if (!isSuperadmin) {
      const now = new Date();
      const isContractValid =
        contract &&
        (contract.status === OrganizationContractStatus.ACTIVE ||
          contract.status === OrganizationContractStatus.GRACE_PERIOD) &&
        new Date(contract.endDate) >= now;

      if (!isContractValid) {
        throw new ForbiddenException(
          `Akses ruang kerja Instansi "${org.name}" terkunci: Kontrak tahunan B2G belum aktif atau telah berakhir.`
        );
      }

      if (
        contract.annualTokenPoolLimit > 0 &&
        contract.tokensConsumed >= contract.annualTokenPoolLimit
      ) {
        throw new ForbiddenException(
          `Pagu kuota token AI tahunan untuk Instansi "${org.name}" telah mencapai batas kontrak.`
        );
      }
    }

    // 3. Verifikasi Keanggotaan User di Instansi (organization_memberships)
    let orgRole: OrganizationMemberRole = OrganizationMemberRole.ORG_ADMIN;
    if (!isSuperadmin) {
      const [orgMembership] = await db
        .select()
        .from(organizationMemberships)
        .where(
          and(
            eq(organizationMemberships.organizationId, orgId),
            eq(organizationMemberships.tenantId, user.tenantId),
            eq(organizationMemberships.status, InstitutionalMembershipStatus.ACTIVE)
          )
        )
        .limit(1);

      if (!orgMembership) {
        throw new ForbiddenException(
          'Akses Ditolak: Akun Anda tidak terdaftar sebagai anggota aktif pada Instansi ini.'
        );
      }
      orgRole = orgMembership.orgRole as OrganizationMemberRole;
    }

    const requiredOrgRoles = this.reflector.getAllAndOverride<OrganizationMemberRole[]>(
      REQUIRE_ORG_ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (
      requiredOrgRoles &&
      requiredOrgRoles.length > 0 &&
      !isSuperadmin &&
      !requiredOrgRoles.includes(orgRole)
    ) {
      throw new ForbiddenException(
        `Akses Ditolak: Tindakan ini memerlukan hak akses tingkat Instansi (${requiredOrgRoles.join(' / ')}).`
      );
    }

    // 4. Jika route/request menyertakan unitId (Bidang / Fraksi / Komisi / Banggar), verifikasi ketat!
    let verifiedUnitId: string | null = null;
    let verifiedUnitCode: string | null = null;
    let verifiedUnitName: string | null = null;
    let verifiedUnitType: OrganizationUnitType | null = null;
    let verifiedUnitRole: OrganizationUnitMemberRole | null = null;

    if (unitId) {
      const [unit] = await db
        .select()
        .from(organizationUnits)
        .where(
          and(
            eq(organizationUnits.id, unitId),
            eq(organizationUnits.organizationId, orgId)
          )
        )
        .limit(1);

      if (!unit) {
        throw new ForbiddenException(
          'Unit atau Bidang tidak ditemukan di dalam Instansi yang sedang diakses.'
        );
      }

      if (!unit.isActive && !isSuperadmin && orgRole !== OrganizationMemberRole.ORG_ADMIN) {
        throw new ForbiddenException(
          `Unit/Bidang "${unit.name}" telah diarsipkan atau sedang tidak aktif.`
        );
      }

      const allowOrgAdminBypass = this.reflector.getAllAndOverride<boolean>(
        ALLOW_ORG_ADMIN_UNIT_BYPASS_KEY,
        [context.getHandler(), context.getClass()]
      );

      if (isSuperadmin || (allowOrgAdminBypass && orgRole === OrganizationMemberRole.ORG_ADMIN)) {
        verifiedUnitRole = OrganizationUnitMemberRole.UNIT_LEAD;
      } else {
        const [unitMembership] = await db
          .select()
          .from(organizationUnitMemberships)
          .where(
            and(
              eq(organizationUnitMemberships.organizationId, orgId),
              eq(organizationUnitMemberships.unitId, unitId),
              eq(organizationUnitMemberships.tenantId, user.tenantId),
              eq(organizationUnitMemberships.status, InstitutionalMembershipStatus.ACTIVE)
            )
          )
          .limit(1);

        if (!unitMembership) {
          throw new ForbiddenException(
            `Isolasi Bidang Aktif: Anda tidak memiliki hak akses ke ruang kerja "${unit.name}". Setiap Bidang dan Fraksi terisolasi secara ketat.`
          );
        }

        verifiedUnitRole = unitMembership.unitRole as OrganizationUnitMemberRole;
      }

      const requiredUnitRoles = this.reflector.getAllAndOverride<OrganizationUnitMemberRole[]>(
        REQUIRE_UNIT_ROLES_KEY,
        [context.getHandler(), context.getClass()]
      );

      if (
        requiredUnitRoles &&
        requiredUnitRoles.length > 0 &&
        !isSuperadmin &&
        (!verifiedUnitRole || !requiredUnitRoles.includes(verifiedUnitRole))
      ) {
        throw new ForbiddenException(
          `Akses Ditolak: Tindakan ini memerlukan peran Bidang (${requiredUnitRoles.join(' / ')}).`
        );
      }

      verifiedUnitId = unit.id;
      verifiedUnitCode = unit.code;
      verifiedUnitName = unit.name;
      verifiedUnitType = unit.unitType as OrganizationUnitType;
    }

    // 5. Sematkan konteks terverifikasi ke request SEBELUM RlsContextInterceptor membuka transaksi DB
    const verifiedCtx: VerifiedInstitutionalContext = {
      organizationId: org.id,
      organizationName: org.name,
      legislativeLevel: org.legislativeLevel,
      regionName: org.regionName,
      orgRole,
      unitId: verifiedUnitId,
      unitCode: verifiedUnitCode,
      unitName: verifiedUnitName,
      unitType: verifiedUnitType,
      unitRole: verifiedUnitRole,
      activeContractId: contract?.id || null,
    };

    request.institutionalContext = verifiedCtx;
    return true;
  }
}
