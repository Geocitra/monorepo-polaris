'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useToast } from '@/components/ui/toast';
import { Building2, Lock } from 'lucide-react';
import {
  OrganizationMemberRole,
  type MyWorkspacesResponseDto,
  type OrganizationMemberQuotaDto,
  type WorkspaceSwitcherItemDto,
} from '@polaris/shared-types';
import { getOrgRoleLabel, getUnitRoleLabel } from './institutional-labels';

export interface InstitutionalShellContext {
  workspaces: MyWorkspacesResponseDto;
  currentOrg: WorkspaceSwitcherItemDto;
  activeOrgId: string;
  activeUnitId: string;
  activeUnitName?: string;
  activeUnitRole?: string;
  canManageOrg: boolean;
  myQuota: OrganizationMemberQuotaDto | null;
  updateMyQuota: (remaining: number, limit: number) => void;
  reloadWorkspaces: () => Promise<void>;
}

interface InstitutionalPageShellProps {
  title: string;
  subtitle: string;
  hideUnitSelector?: boolean;
  requireAdminRole?: boolean;
  requireUsageMonitorRole?: boolean;
  compactChatMode?: boolean;
  children: (ctx: InstitutionalShellContext) => ReactNode;
}

export function InstitutionalPageShell({
  title,
  subtitle,
  hideUnitSelector = false,
  requireAdminRole = false,
  requireUsageMonitorRole = false,
  compactChatMode = false,
  children,
}: InstitutionalPageShellProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<MyWorkspacesResponseDto | null>(null);
  const [activeOrgId, setActiveOrgId] = useState<string>('');
  const [activeUnitId, setActiveUnitId] = useState<string>('');
  const [myQuota, setMyQuota] = useState<OrganizationMemberQuotaDto | null>(null);

  async function loadMyWorkspaces() {
    setLoading(true);
    try {
      const res = await ApiClient.request<MyWorkspacesResponseDto>('/institutional/my-workspaces');
      setWorkspaces(res);

      if (!res?.institutionalWorkspaces || res.institutionalWorkspaces.length === 0) {
        if (typeof window !== 'undefined') {
          try {
            const rawUser = localStorage.getItem('polaris_user');
            const parsedUser = rawUser ? JSON.parse(rawUser) : null;
            if (parsedUser?.accountMode === 'B2C_ONLY') {
              router.replace('/');
              return;
            }
          } catch {}
        }
      }

      if (res?.institutionalWorkspaces && res.institutionalWorkspaces.length > 0) {
        const savedOrg =
          typeof window !== 'undefined' ? sessionStorage.getItem('polaris_active_org_id') : null;
        const matchedOrg =
          res.institutionalWorkspaces.find((o) => o.organizationId === savedOrg) ||
          res.institutionalWorkspaces[0];

        const nextOrgId = matchedOrg.organizationId || '';
        setActiveOrgId(nextOrgId);

        const savedUnit =
          typeof window !== 'undefined' ? sessionStorage.getItem('polaris_active_unit_id') : null;
        const matchedUnit =
          matchedOrg.units?.find((u) => u.unitId === savedUnit) || matchedOrg.units?.[0];
        setActiveUnitId(matchedUnit?.unitId || '');
      }
    } catch (err: any) {
      toast({
        title: 'Gagal memuat ruang kerja instansi',
        description: err?.message || 'Terjadi kendala saat mengambil profil workspace.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyWorkspaces();
    return () => {
      ApiClient.setInstitutionalContext(null, null);
    };
  }, []);

  useEffect(() => {
    ApiClient.setInstitutionalContext(activeOrgId || null, activeUnitId || null);
    if (typeof window !== 'undefined') {
      if (activeOrgId) sessionStorage.setItem('polaris_active_org_id', activeOrgId);
      if (activeUnitId) sessionStorage.setItem('polaris_active_unit_id', activeUnitId);
    }
    if (activeOrgId) {
      ApiClient.request<OrganizationMemberQuotaDto>(`/institutional/orgs/${activeOrgId}/my-quota`)
        .then((q) => {
          setMyQuota(q);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('polaris:b2b-workspace-changed', {
                detail: { orgId: activeOrgId, unitId: activeUnitId, myQuota: q },
              })
            );
          }
        })
        .catch(() => setMyQuota(null));
    } else {
      setMyQuota(null);
    }
  }, [activeOrgId, activeUnitId]);

  const currentOrg = workspaces?.institutionalWorkspaces.find(
    (o) => o.organizationId === activeOrgId
  );
  const canManageOrg = currentOrg?.orgRole === OrganizationMemberRole.ORG_ADMIN;
  const canMonitorUsage =
    canManageOrg || currentOrg?.orgRole === OrganizationMemberRole.LEADERSHIP;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          fullName={workspaces?.personalWorkspace.fullName}
          workspaceMode={currentOrg ? 'INSTITUTIONAL' : 'PERSONAL'}
        />

        <main
          className={
            compactChatMode
              ? 'flex-1 flex flex-col min-h-0 px-3 sm:px-6 py-3 max-w-6xl w-full mx-auto space-y-3'
              : 'flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5'
          }
        >
          {/* COMPACT CONTEXT HEADER */}
          {compactChatMode ? (
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  <Building2 className="h-3 w-3" />
                  {currentOrg?.organizationName || 'POLARIS B2B'}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hidden sm:inline">
                  Asisten Koordinator Tenaga Ahli
                </span>
              </div>

              {workspaces && workspaces.institutionalWorkspaces.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {workspaces.institutionalWorkspaces.length > 1 && (
                    <select
                      value={activeOrgId}
                      onChange={(e) => {
                        const nextOrgId = e.target.value;
                        setActiveOrgId(nextOrgId);
                        const nextOrg = workspaces.institutionalWorkspaces.find(
                          (o) => o.organizationId === nextOrgId
                        );
                        setActiveUnitId(nextOrg?.units?.[0]?.unitId || '');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      {workspaces.institutionalWorkspaces.map((org) => (
                        <option key={org.organizationId} value={org.organizationId}>
                          {org.organizationName} ({getOrgRoleLabel(org.orgRole)})
                        </option>
                      ))}
                    </select>
                  )}

                  {!hideUnitSelector && currentOrg && currentOrg.units.length > 0 && (
                    <select
                      value={activeUnitId}
                      onChange={(e) => setActiveUnitId(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200"
                    >
                      {currentOrg.units.map((u) => (
                        <option key={u.unitId} value={u.unitId}>
                          {u.parentUnitName ? `${u.parentUnitName} → ` : ''}
                          {u.unitName} ({getUnitRoleLabel(u.unitRole)})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  <Building2 className="h-3 w-3" />
                  {currentOrg?.organizationName || 'POLARIS B2B'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <Lock className="h-3 w-3" />
                  Strict Bidang Isolation
                </span>
                {myQuota && !(currentOrg?.orgRole === 'ORG_ADMIN' && currentOrg.units.length === 0) && (
                  <span className="inline-flex flex-wrap items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60">
                    {myQuota.byFeature ? (
                      <>
                        <span>
                          Chat: {myQuota.byFeature.COORDINATOR_CHAT.remainingWeekly}/
                          {myQuota.byFeature.COORDINATOR_CHAT.weeklyLimit}
                        </span>
                        <span>&bull;</span>
                        <span>
                          LKPJ: {myQuota.byFeature.LKPJ_EVALUATION.remainingWeekly}/
                          {myQuota.byFeature.LKPJ_EVALUATION.weeklyLimit}
                        </span>
                        <span>&bull;</span>
                        <span>
                          Legislasi: {myQuota.byFeature.LEGISLATION.remainingWeekly}/
                          {myQuota.byFeature.LEGISLATION.weeklyLimit}
                        </span>
                        <span>&bull;</span>
                        <span>Revisi: {myQuota.revisionLimitPerItem}x/item</span>
                      </>
                    ) : (
                      <>
                        Kuota Minggu Ini: {myQuota.remainingWeekly}/{myQuota.weeklyLimit} &bull; Revisi:{' '}
                        {myQuota.revisionLimitPerItem}x/materi
                      </>
                    )}
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight">{title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>

            {workspaces && workspaces.institutionalWorkspaces.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {workspaces.institutionalWorkspaces.length > 1 && (
                  <select
                    value={activeOrgId}
                    onChange={(e) => {
                      const nextOrgId = e.target.value;
                      setActiveOrgId(nextOrgId);
                      const nextOrg = workspaces.institutionalWorkspaces.find(
                        (o) => o.organizationId === nextOrgId
                      );
                      setActiveUnitId(nextOrg?.units?.[0]?.unitId || '');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    {workspaces.institutionalWorkspaces.map((org) => (
                      <option key={org.organizationId} value={org.organizationId}>
                        {org.organizationName} ({getOrgRoleLabel(org.orgRole)})
                      </option>
                    ))}
                  </select>
                )}

                {!hideUnitSelector && currentOrg && currentOrg.units.length > 0 && (
                  <select
                    value={activeUnitId}
                    onChange={(e) => setActiveUnitId(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs font-bold border border-indigo-300 dark:border-indigo-700 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200"
                  >
                    {currentOrg.units.map((u) => (
                      <option key={u.unitId} value={u.unitId}>
                        {u.parentUnitName ? `${u.parentUnitName} → ` : ''}
                        {u.unitName} ({getUnitRoleLabel(u.unitRole)})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
          )}

          {/* PAGE CONTENT */}
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Memuat ruang kerja kelembagaan...
            </div>
          ) : !workspaces || !currentOrg ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-10 text-center space-y-3">
              <Building2 className="h-10 w-10 text-indigo-500 mx-auto" />
              <h2 className="text-lg font-extrabold">
                Akun Anda Belum Terdaftar di Ruang Kerja Instansi
              </h2>
              <p className="text-xs text-slate-500 max-w-lg mx-auto">
                Hubungi Admin Instansi (Sekretariat DPRD) atau Superadmin POLARIS untuk menautkan akun Anda ke instansi dan bidang terkait.
              </p>
            </div>
          ) : requireAdminRole && !canManageOrg ? (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-[#0D1322] p-10 text-center space-y-2">
              <h2 className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                Akses Terbatas (Khusus Admin Instansi)
              </h2>
              <p className="text-xs text-slate-500">
                Halaman manajemen struktur bidang dan anggota hanya dapat diakses oleh Admin Sekretariat/Instansi (ORG_ADMIN).
              </p>
            </div>
          ) : requireUsageMonitorRole && !canMonitorUsage ? (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-[#0D1322] p-10 text-center space-y-2">
              <h2 className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                Akses Terbatas (Khusus Admin Instansi / Pimpinan)
              </h2>
              <p className="text-xs text-slate-500">
                Halaman pantauan pemakaian AI dan kuota instansi hanya dapat diakses oleh Admin Instansi atau Pimpinan.
              </p>
            </div>
          ) : (
            children({
              workspaces,
              currentOrg,
              activeOrgId,
              activeUnitId,
              activeUnitName: currentOrg.units.find((u) => u.unitId === activeUnitId)?.unitName,
              activeUnitRole: currentOrg.units.find((u) => u.unitId === activeUnitId)?.unitRole,
              canManageOrg,
              myQuota,
              updateMyQuota: (remaining, limit) =>
                setMyQuota((prev) => {
                  if (!prev) return prev;
                  const used = Math.max(0, limit - remaining);
                  return {
                    ...prev,
                    remainingWeekly: remaining,
                    weeklyLimit: limit,
                    weeklyUsed: used,
                    byFeature: prev.byFeature
                      ? {
                          ...prev.byFeature,
                          COORDINATOR_CHAT: {
                            weeklyLimit: limit,
                            weeklyUsed: used,
                            remainingWeekly: remaining,
                          },
                        }
                      : undefined,
                  };
                }),
              reloadWorkspaces: loadMyWorkspaces,
            })
          )}
        </main>
      </div>
    </div>
  );
}
