'use client';

import React, { useEffect, useState } from 'react';
import { AdminApiClient } from '@/lib/api-client';
import { TenantRow } from '@/components/superadmin/types';
import { TenantFiltersBar } from '@/components/superadmin/tenants/TenantFiltersBar';
import { TenantTable } from '@/components/superadmin/tenants/TenantTable';
import { ManualLicenseModal } from '@/components/superadmin/tenants/ManualLicenseModal';

export default function SuperadminTenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [partyFilter, setPartyFilter] = useState('ALL');
  const [selectedTenantForLicense, setSelectedTenantForLicense] = useState<TenantRow | null>(null);

  useEffect(() => {
    loadTenants();
  }, [partyFilter]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const query = partyFilter !== 'ALL' ? `?party=${partyFilter}` : '';
      const res = await AdminApiClient.request<TenantRow[]>(`/admin/tenants${query}`);
      setTenants(res);
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToggle = async (tenant: TenantRow) => {
    try {
      await AdminApiClient.request(`/admin/tenants/${tenant.id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ isVerified: !tenant.isVerified }),
      });
      loadTenants();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status verifikasi.');
    }
  };

  const handleStatusToggle = async (tenant: TenantRow) => {
    const newStatus = tenant.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const confirmMsg = newStatus === 'SUSPENDED'
      ? `Apakah Anda yakin ingin menangguhkan akses anggota ${tenant.fullName}?`
      : `Aktifkan kembali akses anggota ${tenant.fullName}?`;

    if (!confirm(confirmMsg)) return;

    try {
      await AdminApiClient.request(`/admin/tenants/${tenant.id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      });
      loadTenants();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status akun.');
    }
  };

  const filteredTenants = tenants.filter((t) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      t.fullName?.toLowerCase().includes(s) ||
      t.email?.toLowerCase().includes(s) ||
      t.subdomainSlug?.toLowerCase().includes(s) ||
      t.partyAffiliation?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Direktori & Tata Kelola Anggota Dewan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar seluruh klien eksekutif, verifikasi tanda sah KPU, dan penerbitan lisensi B2B parlemen.
          </p>
        </div>
      </div>

      {/* 2. MODULAR FILTER BAR */}
      <TenantFiltersBar
        search={search}
        onSearchChange={setSearch}
        partyFilter={partyFilter}
        onPartyFilterChange={setPartyFilter}
      />

      {/* 3. MODULAR TENANTS TABLE */}
      <TenantTable
        tenants={filteredTenants}
        loading={loading}
        onVerifyToggle={handleVerifyToggle}
        onStatusToggle={handleStatusToggle}
        onOpenLicenseModal={(t) => setSelectedTenantForLicense(t)}
      />

      {/* 4. MODULAR MANUAL LICENSE MODAL */}
      {selectedTenantForLicense && (
        <ManualLicenseModal
          tenant={selectedTenantForLicense}
          onClose={() => setSelectedTenantForLicense(null)}
          onSuccess={() => {
            setSelectedTenantForLicense(null);
            loadTenants();
          }}
        />
      )}
    </div>
  );
}
