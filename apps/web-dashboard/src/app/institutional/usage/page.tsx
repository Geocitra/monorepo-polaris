'use client';

import { InstitutionalPageShell } from '@/components/institutional/InstitutionalPageShell';
import { InstitutionalUsageAnalyticsPanel } from '@/components/institutional/InstitutionalUsageAnalyticsPanel';

export default function InstitutionalUsagePage() {
  return (
    <InstitutionalPageShell
      title="Pantauan Pemakaian AI & Kuota Instansi"
      subtitle="Ringkasan agregasi pemakaian AI dari tingkat Anggota ke Bidang/Unit, termasuk kuota mingguan dan estimasi biaya."
      hideUnitSelector
      requireAdminRole
    >
      {({ activeOrgId }) => <InstitutionalUsageAnalyticsPanel organizationId={activeOrgId} />}
    </InstitutionalPageShell>
  );
}
