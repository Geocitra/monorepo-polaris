'use client';

import React, { useState, useMemo } from 'react';
import {
  Globe,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CreditCard,
  Ban,
  Check,
} from 'lucide-react';
import { TenantRow } from '../types';
import { PaginationControls } from '../common/PaginationControls';

interface TenantTableProps {
  tenants: TenantRow[];
  loading: boolean;
  onVerifyToggle: (tenant: TenantRow) => void;
  onStatusToggle: (tenant: TenantRow) => void;
  onOpenLicenseModal: (tenant: TenantRow) => void;
}

export function TenantTable({
  tenants,
  loading,
  onVerifyToggle,
  onStatusToggle,
  onOpenLicenseModal,
}: TenantTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(tenants.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));

  const displayedTenants = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return tenants.slice(start, start + itemsPerPage);
  }, [tenants, safePage, itemsPerPage]);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs p-4 space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Nama Dewan & Kontak</th>
              <th className="py-3 px-4">Fraksi, Komisi & Dapil</th>
              <th className="py-3 px-4">Portal Publik</th>
              <th className="py-3 px-4">Verifikasi KPU</th>
              <th className="py-3 px-4">Lisensi & Masa Aktif</th>
              <th className="py-3 px-4 text-right">Tindakan Superadmin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {displayedTenants.map((t) => {
              const isSubActive = t.subscriptionStatus === 'ACTIVE';
              const periodEndDate = t.periodEnd ? new Date(t.periodEnd) : null;
              const isExpired = periodEndDate && periodEndDate < new Date();

              return (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* 1. NAMA & EMAIL */}
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {t.fullName}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {t.email}
                    </div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] font-mono mt-0.5">
                      {t.phoneNumber}
                    </div>
                  </td>

                  {/* 2. FRAKSI, KOMISI & DAPIL */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-[10px]">
                        {t.partyAffiliation || 'Non-Fraksi'}
                      </span>
                      {t.commissionName ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-semibold text-[10px]">
                          {t.commissionName}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-[10px] italic">
                          Belum pilih komisi
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      {t.dapilName || 'Dapil belum diatur'}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      {t.provinceName}
                    </div>
                  </td>

                  {/* 3. PORTAL PUBLIK */}
                  <td className="py-3 px-4">
                    {t.subdomainSlug ? (
                      <a
                        href={`https://${t.subdomainSlug}.polaris.id`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-mono text-[11px]"
                      >
                        <Globe className="h-3 w-3 text-blue-500" />
                        <span>{t.subdomainSlug}.polaris.id</span>
                        <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                      </a>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                        Belum aktif
                      </span>
                    )}
                  </td>

                  {/* 4. VERIFIKASI */}
                  <td className="py-3 px-4">
                    {t.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Terverifikasi KPU</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                        <span>Belum Verifikasi</span>
                      </span>
                    )}
                  </td>

                  {/* 5. LISENSI */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider ${
                          t.planTier === 'ENTERPRISE'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : t.planTier === 'PRO'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {t.planTier || 'FREE TRIAL'} {isSubActive ? 'AKTIF' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {periodEndDate
                          ? `s.d. ${periodEndDate.toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}`
                          : 'Tidak ada batas'}
                      </span>
                    </div>
                  </td>

                  {/* 6. TINDAKAN SUPERADMIN */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {/* Beri Lisensi Manual */}
                      <button
                        type="button"
                        onClick={() => onOpenLicenseModal(t)}
                        title="Beri / Perpanjang Lisensi Manual B2B"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Beri Lisensi</span>
                      </button>

                      {/* Toggle Verifikasi KPU */}
                      <button
                        type="button"
                        onClick={() => onVerifyToggle(t)}
                        title={
                          t.isVerified
                            ? 'Cabut Verifikasi Sah KPU'
                            : 'Verifikasi Sah Anggota Dewan'
                        }
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          t.isVerified
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                            : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>

                      {/* Toggle Suspend Akun */}
                      <button
                        type="button"
                        onClick={() => onStatusToggle(t)}
                        title={
                          t.accountStatus === 'ACTIVE'
                            ? 'Tangguhkan Akun Dewan'
                            : 'Aktifkan Kembali Akun Dewan'
                        }
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          t.accountStatus === 'ACTIVE'
                            ? 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600'
                            : 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {displayedTenants.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-slate-400 text-xs italic"
                >
                  Tidak ada data anggota dewan yang sesuai dengan filter pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={tenants.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
