import { and, eq } from 'drizzle-orm';
import {
  db,
  organizations,
  organizationMemberships,
  organizationUnitMemberships,
  portalConfigs,
} from '@polaris/database';

export type AccountMode = 'B2B_ONLY' | 'B2C_ONLY' | 'HYBRID';

export interface ResolvedPrimaryOrganization {
  organizationId: string;
  organizationName: string;
  organizationCode: string;
  orgRole: string;
  hasAssignedUnits: boolean;
}

export interface ResolvedTenantAccountClaims {
  subdomainSlug: string;
  accountMode: AccountMode;
  primaryOrganization: ResolvedPrimaryOrganization | null;
}

export async function resolveTenantAccountClaims(
  tenantId: string
): Promise<ResolvedTenantAccountClaims> {
  const [portal] = await db
    .select({ subdomainSlug: portalConfigs.subdomainSlug })
    .from(portalConfigs)
    .where(eq(portalConfigs.tenantId, tenantId))
    .limit(1);

  const subdomainSlug = portal?.subdomainSlug || '';

  const [primaryOrg] = await db
    .select({
      organizationId: organizations.id,
      organizationName: organizations.name,
      organizationCode: organizations.code,
      orgRole: organizationMemberships.orgRole,
    })
    .from(organizationMemberships)
    .innerJoin(organizations, eq(organizationMemberships.organizationId, organizations.id))
    .where(
      and(
        eq(organizationMemberships.tenantId, tenantId),
        eq(organizationMemberships.status, 'ACTIVE'),
        eq(organizations.status, 'ACTIVE')
      )
    )
    .limit(1);

  let hasAssignedUnits = false;
  if (primaryOrg) {
    const [unitRow] = await db
      .select({ id: organizationUnitMemberships.id })
      .from(organizationUnitMemberships)
      .where(
        and(
          eq(organizationUnitMemberships.organizationId, primaryOrg.organizationId),
          eq(organizationUnitMemberships.tenantId, tenantId),
          eq(organizationUnitMemberships.status, 'ACTIVE')
        )
      )
      .limit(1);
    hasAssignedUnits = Boolean(unitRow);
  }

  const accountMode: AccountMode = primaryOrg
    ? portal
      ? 'HYBRID'
      : 'B2B_ONLY'
    : 'B2C_ONLY';

  return {
    subdomainSlug,
    accountMode,
    primaryOrganization: primaryOrg ? { ...primaryOrg, hasAssignedUnits } : null,
  };
}
