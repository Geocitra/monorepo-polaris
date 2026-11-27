'use client';

import { InstitutionalPageShell } from '@/components/institutional/InstitutionalPageShell';
import { ParliamentaryLegislationPanel } from '@/components/institutional/ParliamentaryLegislationPanel';

export default function InstitutionalLegislationPage() {
  return (
    <InstitutionalPageShell
      title="Legislasi, Kepatuhan Hukum & Publikasi Bukti"
      subtitle="Penyusunan Raperda, uji kepatuhan pasal, DIM, briefing harian rapat, dan publikasi berbasis bukti kinerja."
    >
      {({ activeOrgId, activeUnitId, activeUnitName, currentOrg }) => (
        <ParliamentaryLegislationPanel
          organizationId={activeOrgId}
          organizationName={currentOrg.organizationName || 'DPRD'}
          activeUnitId={activeUnitId || undefined}
          activeUnitName={activeUnitName}
        />
      )}
    </InstitutionalPageShell>
  );
}
