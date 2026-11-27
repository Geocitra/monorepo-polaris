'use client';

import { InstitutionalPageShell } from '@/components/institutional/InstitutionalPageShell';
import { SekretariatAdminPanel } from '@/components/institutional/SekretariatAdminPanel';

export default function InstitutionalAdminPage() {
  return (
    <InstitutionalPageShell
      title="Organisasi, Bidang & Anggota"
      subtitle="Alur 3 langkah: buat struktur Komisi/Bidang, daftarkan dan tugaskan anggota ke Bidang, lalu unggah dokumen resmi bersama."
      hideUnitSelector
      requireAdminRole
    >
      {({ activeOrgId, reloadWorkspaces }) => (
        <SekretariatAdminPanel
          organizationId={activeOrgId}
          onHierarchyChanged={reloadWorkspaces}
        />
      )}
    </InstitutionalPageShell>
  );
}
