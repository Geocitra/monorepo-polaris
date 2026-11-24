'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useToast } from '@/components/ui/toast';
import {
  Building2,
  Lock,
  Layers,
  Settings,
  ArrowUpRight,
  FileSpreadsheet,
  Scale,
} from 'lucide-react';
import { BidangKnowledgeWorkspacePanel } from '@/components/institutional/BidangKnowledgeWorkspacePanel';
import { SekretariatAdminPanel } from '@/components/institutional/SekretariatAdminPanel';
import { LkpjEvaluationWorkspacePanel } from '@/components/institutional/LkpjEvaluationWorkspacePanel';
import { ParliamentaryLegislationPanel } from '@/components/institutional/ParliamentaryLegislationPanel';
import {
  OrganizationMemberRole,
  type MyWorkspacesResponseDto,
  type InstitutionalUnitOverviewDto,
} from '@polaris/shared-types';

export default function InstitutionalWorkspacePage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<MyWorkspacesResponseDto | null>(null);
  const [activeOrgId, setActiveOrgId] = useState<string>('');
  const [activeUnitId, setActiveUnitId] = useState<string>('');
  const [activeUnitOverview, setActiveUnitOverview] =
    useState<InstitutionalUnitOverviewDto | null>(null);
  const [activeTab, setActiveTab] = useState<
    'BIDANG_WORKSPACE' | 'LKPJ_EVALUATION' | 'PARLIAMENTARY_LEGISLATION' | 'SEKRETARIAT_ADMIN'
  >('BIDANG_WORKSPACE');

  useEffect(() => {
    loadMyWorkspaces();
    return () => {
      ApiClient.setInstitutionalContext(null, null);
    };
  }, []);

  useEffect(() => {
    ApiClient.setInstitutionalContext(activeOrgId || null, activeUnitId || null);
  }, [activeOrgId, activeUnitId]);

  async function loadMyWorkspaces() {
    setLoading(true);
    try {
      const res = await ApiClient.request<MyWorkspacesResponseDto>('/institutional/my-workspaces');
      setWorkspaces(res);

      if (res?.institutionalWorkspaces && res.institutionalWorkspaces.length > 0) {
        const firstOrg = res.institutionalWorkspaces[0];
        setActiveOrgId((prev) => prev || firstOrg.organizationId || '');
        if (!activeUnitId) {
          if (firstOrg.units && firstOrg.units.length > 0) {
            setActiveUnitId(firstOrg.units[0].unitId);
          } else if (
            firstOrg.orgRole === OrganizationMemberRole.ORG_ADMIN ||
            firstOrg.orgRole === OrganizationMemberRole.LEADERSHIP
          ) {
            setActiveTab('SEKRETARIAT_ADMIN');
          }
        }
      }
    } catch (err: any) {
      toast({
        title: 'Gagal memuat daftar ruang kerja',
        description: err?.message || 'Terjadi kendala saat mengambil profil workspace.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  const currentOrg = workspaces?.institutionalWorkspaces.find(
    (o) => o.organizationId === activeOrgId
  );
  const canManageOrg =
    currentOrg?.orgRole === OrganizationMemberRole.ORG_ADMIN ||
    currentOrg?.orgRole === OrganizationMemberRole.LEADERSHIP;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          fullName={workspaces?.personalWorkspace.fullName}
          workspaceMode={currentOrg ? 'INSTITUTIONAL' : 'PERSONAL'}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* HEADER & WORKSPACE SWITCHER */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                    <Building2 className="h-3.5 w-3.5" />
                    POLARIS Parliamentary Intelligence
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <Lock className="h-3 w-3" />
                    Strict Bidang AI Isolation
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Workspace Switcher: Perseorangan &harr; Instansi / AKD / Bidang
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  AI di dalam Bidang yang aktif hanya mengakses pengetahuan Bidang tersebut, Dokumen Resmi Sekretariat Instansi, dan Regulasi Nasional/Daerah.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Mode Perseorangan (Studio Pribadi)
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>

                {workspaces?.institutionalWorkspaces &&
                  workspaces.institutionalWorkspaces.length > 0 && (
                    <>
                      <select
                        value={activeOrgId}
                        onChange={(e) => {
                          const nextOrgId = e.target.value;
                          setActiveOrgId(nextOrgId);
                          const nextOrg = workspaces.institutionalWorkspaces.find(
                            (o) => o.organizationId === nextOrgId
                          );
                          setActiveUnitId(nextOrg?.units?.[0]?.unitId || '');
                          setActiveUnitOverview(null);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      >
                        {workspaces.institutionalWorkspaces.map((org) => (
                          <option key={org.organizationId} value={org.organizationId}>
                            Instansi: {org.organizationName} ({org.orgRole})
                          </option>
                        ))}
                      </select>

                      {currentOrg && currentOrg.units.length > 0 && (
                        <select
                          value={activeUnitId}
                          onChange={(e) => {
                            setActiveUnitId(e.target.value);
                            setActiveTab('BIDANG_WORKSPACE');
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold border border-indigo-300 dark:border-indigo-700 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200"
                        >
                          {currentOrg.units.map((u) => (
                            <option key={u.unitId} value={u.unitId}>
                              {u.parentUnitName ? `${u.parentUnitName} → ` : ''}
                              {u.unitName} [{u.unitType}] ({u.unitRole})
                            </option>
                          ))}
                        </select>
                      )}
                    </>
                  )}
              </div>
            </div>

            {currentOrg && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('BIDANG_WORKSPACE')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'BIDANG_WORKSPACE'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Ruang Kerja Bidang & Tenaga Ahli AI
                  </button>

                  <button
                    onClick={() => setActiveTab('LKPJ_EVALUATION')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'LKPJ_EVALUATION'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Evaluasi LKPJ & Matriks Temuan DPRD
                  </button>

                  <button
                    onClick={() => setActiveTab('PARLIAMENTARY_LEGISLATION')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'PARLIAMENTARY_LEGISLATION'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Scale className="h-3.5 w-3.5" />
                    Legislasi, Kepatuhan Hukum & Publikasi Bukti
                  </button>

                  {canManageOrg && (
                    <button
                      onClick={() => setActiveTab('SEKRETARIAT_ADMIN')}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'SEKRETARIAT_ADMIN'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Panel Admin Instansi / Sekretariat DPRD
                    </button>
                  )}
                </div>

                {activeUnitOverview?.activeContract && (
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Kontrak B2G:{' '}
                    <strong className="text-slate-700 dark:text-slate-200">
                      {activeUnitOverview.activeContract.contractNumber}
                    </strong>{' '}
                    | Kuota Token Instansi:{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400">
                      {activeUnitOverview.activeContract.tokensConsumed.toLocaleString('id-ID')} /{' '}
                      {activeUnitOverview.activeContract.annualTokenPoolLimit.toLocaleString(
                        'id-ID'
                      )}
                    </strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Memuat ruang kerja kelembagaan...
            </div>
          ) : !currentOrg ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-10 text-center space-y-3">
              <Building2 className="h-10 w-10 text-indigo-500 mx-auto" />
              <h2 className="text-lg font-extrabold">
                Akun Anda Belum Terdaftar di Ruang Kerja Instansi DPRD
              </h2>
              <p className="text-xs text-slate-500 max-w-lg mx-auto">
                Anda saat ini menggunakan mode Perseorangan. Apabila Instansi DPRD/Fraksi/Komisi Anda telah memiliki kontrak tahunan POLARIS, hubungi Sekretariat DPRD (Admin Instansi) atau Superadmin untuk menautkan akun email Anda ke Bidang terkait.
              </p>
            </div>
          ) : activeTab === 'LKPJ_EVALUATION' ? (
            <LkpjEvaluationWorkspacePanel
              organizationId={activeOrgId}
              organizationName={currentOrg.organizationName || 'DPRD'}
              activeUnitId={activeUnitId || undefined}
              activeUnitName={
                currentOrg.units.find((u) => u.unitId === activeUnitId)?.unitName
              }
              canManageOrg={canManageOrg}
              availableUnits={currentOrg.units.map((u) => ({
                unitId: u.unitId,
                unitCode: u.unitCode,
                unitName: u.unitName,
                unitType: u.unitType,
              }))}
            />
          ) : activeTab === 'PARLIAMENTARY_LEGISLATION' ? (
            <ParliamentaryLegislationPanel
              organizationId={activeOrgId}
              organizationName={currentOrg.organizationName || 'DPRD'}
              activeUnitId={activeUnitId || undefined}
              activeUnitName={
                currentOrg.units.find((u) => u.unitId === activeUnitId)?.unitName
              }
            />
          ) : activeTab === 'SEKRETARIAT_ADMIN' && canManageOrg ? (
            <SekretariatAdminPanel
              organizationId={activeOrgId}
              onHierarchyChanged={loadMyWorkspaces}
            />
          ) : !activeUnitId ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-8 text-center text-xs text-slate-500">
              Pilih Bidang aktif pada pemilih ruang kerja di atas untuk mulai bekerja dengan AI Bidang.
            </div>
          ) : (
            <BidangKnowledgeWorkspacePanel
              organizationId={activeOrgId}
              unitId={activeUnitId}
              canManageOrg={canManageOrg}
              onOverviewLoaded={setActiveUnitOverview}
            />
          )}
        </main>
      </div>
    </div>
  );
}
