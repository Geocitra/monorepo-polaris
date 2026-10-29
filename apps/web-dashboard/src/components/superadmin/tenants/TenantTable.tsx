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
  ShieldAlert,
  KeyRound,
  Copy,
  Lock,
} from 'lucide-react';
import { TenantRow } from '../types';
import { PaginationControls } from '../common/PaginationControls';

interface TenantTableProps {
  tenants: TenantRow[];
  loading: boolean;
  onVerifyToggle: (tenant: TenantRow) => void;
  onStatusToggle: (tenant: TenantRow) => void;
  onOpenLicenseModal: (tenant: TenantRow) => void;
  onOpenLegislativeLevelModal?: (tenant: TenantRow) => void;
  onOpenResetPasswordModal?: (tenant: TenantRow) => void;
}

export function TenantTable({
  tenants,
  loading,
  onVerifyToggle,
  onStatusToggle,
  onOpenLicenseModal,
  onOpenLegislativeLevelModal,
  onOpenResetPasswordModal,
}: TenantTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(tenants.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));

  const displayedTenants = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return tenants.slice(start, start + itemsPerPage);
  }, [tenants, safePage, itemsPerPage]);

  const handleCopyPassword = (tenantId: string, pwd: string) => {
    navigator.clipboard.writeText(pwd);
    setCopiedId(tenantId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatLegislativeLabel = (level: string) => {
    if (!level) return '-';
    const normalized = level.toUpperCase().replace(/\s+/g, '_');
    switch (normalized) {
      case 'DPR_RI':
        return 'DPR RI';
      case 'DPD_RI':
        return 'DPD RI';
      case 'MPR_RI':
        return 'MPR RI';
      case 'DPRD_PROVINSI':
      case 'DPRD_PROV':
        return 'DPRD Provinsi';
      case 'DPRD_KABUPATEN_KOTA':
      case 'DPRD_KAB_KOTA':
        return 'DPRD Kab/Kota';
      case 'KEPALA_DAERAH_GUBERNUR':
        return 'Gubernur';
      case 'KEPALA_DAERAH_WALIKOTA_BUPATI':
        return 'Bupati / Walikota';
      case 'PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD':
        return 'Birokrat / OPD';
      case 'PIMPINAN_LEMBAGA_REKTOR_SWASTA':
        return 'Pimpinan Lembaga';
      default:
        return level ? level.replace(/_/g, ' ') : '-';
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs p-4 space-y-4">
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[1080px] text-left text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4 w-[24%] min-w-[220px]">Nama Dewan &amp; Kredensial</th>
              <th className="py-3 px-4 w-[20%] min-w-[200px]">Tingkat &amp; Dapil</th>
              <th className="py-3 px-4 w-[16%] min-w-[160px]">Portal Publik</th>
              <th className="py-3 px-4 w-[13%] min-w-[140px]">Verifikasi KPU</th>
              <th className="py-3 px-4 w-[13%] min-w-[140px]">Lisensi &amp; Masa Aktif</th>
              <th className="py-3 px-4 w-[14%] min-w-[220px] text-right">Tindakan Superadmin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {displayedTenants.map((t) => {
              const isSubActive = t.subscriptionStatus === 'ACTIVE';
              const periodEndDate = t.periodEnd ? new Date(t.periodEnd) : null;

              return (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* 1. NAMA & KREDENSIAL */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {t.fullName}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      <span className="truncate max-w-[160px]">{t.email}</span>
                      {t.username && (
                        <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/60 shrink-0">
                          @{t.username}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] font-mono mt-0.5">
                      {t.phoneNumber}
                    </div>

                    {/* Temporary Password Tag / Mandatory Change */}
                    {t.mustChangePassword && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shrink-0">
                          <Lock className="w-2.5 h-2.5" />
                          Wajib Ganti Password
                        </span>
                        {t.temporaryPasswordPlaintextPreview && (
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(t.id, t.temporaryPasswordPlaintextPreview!)}
                            title="Salin kata sandi sementara"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition shrink-0"
                          >
                            {copiedId === t.id ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>Pwd Temp</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* 2. TINGKAT & DAPIL */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-[10px] whitespace-nowrap">
                        {t.partyAffiliation || 'Non-Partai / Independen'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenLegislativeLevelModal?.(t)}
                        title="Klik untuk koreksi level wewenang legislatif"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-bold text-[10px] hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer whitespace-nowrap"
                      >
                        <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
                        <span>{formatLegislativeLabel(t.legislativeLevel)}</span>
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold leading-tight">
                      {t.dapilName || 'Dapil belum diatur'}
                    </div>
                    {t.provinceName && (
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {t.provinceName}
                      </div>
                    )}
                  </td>

                  {/* 3. PORTAL PUBLIK */}
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    {t.subdomainSlug || t.customDomain ? (
                      <div className="flex flex-col gap-1">
                        {t.subdomainSlug && (
                          <a
                            href={`https://${t.subdomainSlug}.polarismedia.id`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-mono text-[11px]"
                          >
                            <Globe className="h-3 w-3 text-blue-500 shrink-0" />
                            <span>{t.subdomainSlug}.polarismedia.id</span>
                            <ExternalLink className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                          </a>
                        )}
                        {t.customDomain && (
                          <a
                            href={`https://${t.customDomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline font-mono text-[10px]"
                          >
                            <span className="px-1 py-0.2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded text-[9px] font-sans font-bold">
                              Custom
                            </span>
                            <span>{t.customDomain}</span>
                            <ExternalLink className="h-2 w-2 text-indigo-400 shrink-0" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                        Belum aktif
                      </span>
                    )}
                  </td>

                  {/* 4. VERIFIKASI */}
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    {t.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Terverifikasi KPU</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>Belum Verifikasi</span>
                      </span>
                    )}
                  </td>

                  {/* 5. LISENSI */}
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider whitespace-nowrap ${
                          t.planTier === 'PRO'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {t.planTier || 'FREE TRIAL'} {isSubActive ? 'AKTIF' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                      <Calendar className="h-3 w-3 shrink-0" />
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
                  <td className="py-3.5 px-4 text-right align-top whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {/* Beri Lisensi Manual */}
                      <button
                        type="button"
                        onClick={() => onOpenLicenseModal(t)}
                        title="Beri / Perpanjang Lisensi Manual B2B"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        <CreditCard className="h-3.5 w-3.5 shrink-0" />
                        <span>Beri Lisensi</span>
                      </button>

                      {/* Koreksi Tingkat Jabatan */}
                      {onOpenLegislativeLevelModal && (
                        <button
                          type="button"
                          onClick={() => onOpenLegislativeLevelModal(t)}
                          title="Koreksi Tingkat Legislatif (Audit KPU)"
                          className="p-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 hover:bg-indigo-100 transition-all cursor-pointer shrink-0"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Reset Kata Sandi */}
                      {onOpenResetPasswordModal && (
                        <button
                          type="button"
                          onClick={() => onOpenResetPasswordModal(t)}
                          title="Reset Kata Sandi Dewan"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Toggle Verifikasi KPU */}
                      <button
                        type="button"
                        onClick={() => onVerifyToggle(t)}
                        title={
                          t.isVerified
                            ? 'Cabut Verifikasi Sah KPU'
                            : 'Verifikasi Sah Anggota Dewan'
                        }
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
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
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
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
