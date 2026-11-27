'use client';

import { InstitutionalPageShell } from '@/components/institutional/InstitutionalPageShell';
import { CoordinatorChatWorkspace } from '@/components/institutional/CoordinatorChatWorkspace';

export default function InstitutionalWorkspacePage() {
  return (
    <InstitutionalPageShell
      title="Ruang Kerja POLARIS — Koordinator Tenaga Ahli"
      subtitle="Unggah dokumen Bidang, ajukan pertanyaan atau perintah analisis, buat tabel keuangan LKPJ, telaah Raperda, hingga visualisasi gambar dalam satu chat."
      compactChatMode
    >
      {({ activeOrgId, activeUnitId, activeUnitRole, canManageOrg, updateMyQuota }) =>
        !activeUnitId ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-8 text-center text-xs text-slate-500">
            Akun Anda belum ditugaskan ke Unit/Bidang tertentu. Hubungi Admin Instansi untuk penugasan Bidang.
          </div>
        ) : (
          <CoordinatorChatWorkspace
            organizationId={activeOrgId}
            unitId={activeUnitId}
            canManageOrg={canManageOrg}
            canManageUnit={canManageOrg || activeUnitRole === 'UNIT_LEAD'}
            onQuotaUpdated={updateMyQuota}
          />
        )
      }
    </InstitutionalPageShell>
  );
}
