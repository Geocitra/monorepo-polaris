'use client';

import { InstitutionalPageShell } from '@/components/institutional/InstitutionalPageShell';
import { LkpjEvaluationWorkspacePanel } from '@/components/institutional/LkpjEvaluationWorkspacePanel';

export default function InstitutionalLkpjPage() {
  return (
    <InstitutionalPageShell
      title="Evaluasi LKPJ & Pengawasan OPD"
      subtitle="Ekstraksi matriks temuan LKPJ, klarifikasi OPD, dan penyusunan draf rekomendasi resmi DPRD."
    >
      {({ activeOrgId, activeUnitId, activeUnitName, currentOrg, canManageOrg }) => (
        <LkpjEvaluationWorkspacePanel
          organizationId={activeOrgId}
          organizationName={currentOrg.organizationName || 'DPRD'}
          activeUnitId={activeUnitId || undefined}
          activeUnitName={activeUnitName}
          canManageOrg={canManageOrg}
          availableUnits={currentOrg.units.map((u) => ({
            unitId: u.unitId,
            unitCode: u.unitCode,
            unitName: u.unitName,
            unitType: u.unitType,
          }))}
        />
      )}
    </InstitutionalPageShell>
  );
}
