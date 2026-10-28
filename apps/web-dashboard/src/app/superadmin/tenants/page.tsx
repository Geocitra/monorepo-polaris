'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, Users, Globe } from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { TenantRow } from '@/components/superadmin/types';
import { TenantFiltersBar } from '@/components/superadmin/tenants/TenantFiltersBar';
import { TenantTable } from '@/components/superadmin/tenants/TenantTable';
import { DomainRequestsTab } from '@/components/superadmin/tenants/DomainRequestsTab';
import { ManualLicenseModal } from '@/components/superadmin/tenants/ManualLicenseModal';
import { CreateTenantModal } from '@/components/superadmin/tenants/CreateTenantModal';
import { UpdateLegislativeLevelModal } from '@/components/superadmin/tenants/UpdateLegislativeLevelModal';
import { ResetPasswordModal } from '@/components/superadmin/tenants/ResetPasswordModal';
import { useRealtime } from '@/contexts/RealtimeContext';

export default function SuperadminTenantsPage() {
  const { subscribe } = useRealtime();
  const [activeTab, setActiveTab] = useState<'TENANTS' | 'DOMAINS'>('TENANTS');
  const [pendingDomainCount, setPendingDomainCount] = useState<number>(0);
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [partyFilter, setPartyFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTenantForLicense, setSelectedTenantForLicense] = useState<TenantRow | null>(null);
  const [selectedTenantForLevel, setSelectedTenantForLevel] = useState<TenantRow | null>(null);
  const [selectedTenantForResetPassword, setSelectedTenantForResetPassword] = useState<TenantRow | null>(null);

  useEffect(() => {
    loadTenants();
  }, [partyFilter]);

  const loadPendingDomainCount = async () => {
    try {
      const res = await AdminApiClient.request<{ success: boolean; data: any[] }>(
        '/admin/domain-requests?status=PENDING_REVIEW'
      );
      if (res?.data) {
        setPendingDomainCount(res.data.length);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    loadPendingDomainCount();
    const unsub = subscribe('DOMAIN_REQUEST_CREATED', () => {
      loadPendingDomainCount();
    });
    const unsub2 = subscribe('DOMAIN_REQUEST_UPDATED', () => {
      loadPendingDomainCount();
    });
    return () => {
      unsub();
      unsub2();
    };
  }, [subscribe]);

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
      (t.username && t.username.toLowerCase().includes(s)) ||
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
            Direktori &amp; Tata Kelola Klien Eksekutif
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Daftar seluruh pimpinan eksekutif, verifikasi data kelembagaan, serta penerbitan akun dan lisensi resmi.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Buat Akun Dewan Baru</span>
          </button>
        </div>
      </div>

      {/* 2. TAB SWITCHER */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('TENANTS')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'TENANTS'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Direktori Tokoh Dewan</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300">
            {tenants.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DOMAINS')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition relative ${
            activeTab === 'DOMAINS'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Pengajuan Domain</span>
          {pendingDomainCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse shadow-xs">
              {pendingDomainCount} baru
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          )}
        </button>
      </div>

      {activeTab === 'TENANTS' ? (
        <>
          {/* 3. MODULAR FILTER BAR */}
          <TenantFiltersBar
            search={search}
            onSearchChange={setSearch}
            partyFilter={partyFilter}
            onPartyFilterChange={setPartyFilter}
          />

          {/* 4. MODULAR TENANTS TABLE */}
          <TenantTable
            tenants={filteredTenants}
            loading={loading}
            onVerifyToggle={handleVerifyToggle}
            onStatusToggle={handleStatusToggle}
            onOpenLicenseModal={(t) => setSelectedTenantForLicense(t)}
            onOpenLegislativeLevelModal={(t) => setSelectedTenantForLevel(t)}
            onOpenResetPasswordModal={(t) => setSelectedTenantForResetPassword(t)}
          />
        </>
      ) : (
        <DomainRequestsTab onRequestCountChange={setPendingDomainCount} />
      )}

      {/* 4. CREATE TENANT MODAL */}
      {isCreateModalOpen && (
        <CreateTenantModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            loadTenants();
          }}
        />
      )}

      {/* 5. MANUAL LICENSE MODAL */}
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

      {/* 6. UPDATE LEGISLATIVE LEVEL MODAL */}
      {selectedTenantForLevel && (
        <UpdateLegislativeLevelModal
          tenant={selectedTenantForLevel}
          onClose={() => setSelectedTenantForLevel(null)}
          onSuccess={() => {
            setSelectedTenantForLevel(null);
            loadTenants();
          }}
        />
      )}

      {/* 7. RESET PASSWORD MODAL */}
      {selectedTenantForResetPassword && (
        <ResetPasswordModal
          tenant={selectedTenantForResetPassword}
          onClose={() => setSelectedTenantForResetPassword(null)}
          onSuccess={() => {
            setSelectedTenantForResetPassword(null);
            loadTenants();
          }}
        />
      )}
    </div>
  );
}
