import {
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
} from '@polaris/shared-types';

export const ORG_ROLE_LABELS: Record<string, string> = {
  [OrganizationMemberRole.ORG_ADMIN]: 'Admin Sekretariat',
  [OrganizationMemberRole.LEADERSHIP]: 'Pimpinan DPRD',
  [OrganizationMemberRole.EXPERT_STAFF]: 'Tenaga Ahli',
  [OrganizationMemberRole.SECRETARIAT_STAFF]: 'Staf Sekretariat',
  [OrganizationMemberRole.MEMBER]: 'Anggota Instansi',
  ORG_OWNER: 'Pemilik Instansi',
};

export const UNIT_ROLE_LABELS: Record<string, string> = {
  [OrganizationUnitMemberRole.UNIT_LEAD]: 'Ketua / Pimpinan Unit',
  [OrganizationUnitMemberRole.REVIEWER]: 'Penelaah / Reviewer',
  [OrganizationUnitMemberRole.EXPERT_STAFF]: 'Tenaga Ahli',
  [OrganizationUnitMemberRole.MEMBER]: 'Anggota Unit',
};

export function getOrgRoleLabel(role?: string | null): string {
  if (!role) return 'Anggota Instansi';
  return ORG_ROLE_LABELS[role] || role;
}

export function getUnitRoleLabel(role?: string | null): string {
  if (!role) return 'Anggota Unit';
  return UNIT_ROLE_LABELS[role] || role;
}
