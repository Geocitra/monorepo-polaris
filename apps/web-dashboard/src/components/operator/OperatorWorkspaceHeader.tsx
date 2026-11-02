'use client';

import React from 'react';
import { Sparkles, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { AssignedTenant, TenantContextData, getPartyBranding } from './types';

interface OperatorWorkspaceHeaderProps {
  assignments: AssignedTenant[];
  selectedDewan: AssignedTenant;
  selectedTenantId: string | null;
  tenantContext: TenantContextData | null;
  totalAssigned: number;
  publishedCount: number;
  onSelectTenant: (tenantId: string) => void;
}

export function OperatorWorkspaceHeader({
  assignments,
  selectedDewan,
  selectedTenantId,
  tenantContext,
  totalAssigned,
  publishedCount,
  onSelectTenant,
}: OperatorWorkspaceHeaderProps) {
  const branding = getPartyBranding(selectedDewan.partyAffiliation);

  return (
    <div className="space-y-4">
      {/* STEP 1: HORIZONTAL TOKOH PICKER */}
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 text-[11px]">
              Pilih Tokoh Binaan ({assignments.length})
            </span>
            <span className="text-[11px] text-slate-400">
              — Klik nama/foto tokoh untuk langsung berpindah
            </span>
          </div>
          <div className="text-[11px] font-bold text-slate-500">
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{publishedCount}</span> dari {totalAssigned} tokoh sudah rilis hari ini
          </div>
        </div>

        {/* Pita Kontak Tokoh (Horizontal Scroll) */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-1.5 pt-1 max-w-full">
          {assignments.map((item) => {
            const isSelected = item.tenantId === selectedTenantId;
            const isDone = item.todayStats.hasPublishedToday;

            return (
              <button
                key={item.tenantId}
                type="button"
                onClick={() => onSelectTenant(item.tenantId)}
                className={`shrink-0 flex items-center gap-2.5 p-2 pr-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/40'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Foto / Inisial Tokoh */}
                <div className="relative shrink-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs overflow-hidden ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {item.photoUrl ? (
                      <img src={item.photoUrl} alt={item.fullName} className="w-full h-full object-cover" />
                    ) : (
                      item.fullName.charAt(0)
                    )}
                  </div>
                  {/* Dot Indikator Status */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
                      isSelected ? 'border-indigo-600' : 'border-slate-50 dark:border-slate-900'
                    } ${isDone ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    title={isDone ? 'Sudah rilis hari ini' : 'Belum rilis hari ini'}
                  />
                </div>

                <div className="min-w-0 max-w-[140px]">
                  <div className="font-bold text-xs truncate">
                    {item.fullName}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-1 py-0.2 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.partyAffiliation || 'INDEP'}
                    </span>
                    <span
                      className={`text-[9.5px] font-bold truncate ${
                        isSelected
                          ? 'text-indigo-100'
                          : isDone
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isDone ? '✓ Rilis' : '• Butuh'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PERSONA HEADER TOKOH AKTIF */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border bg-gradient-to-r ${branding.gradient} bg-white dark:bg-[#0B0F19] ${branding.border} shadow-sm space-y-4 overflow-hidden max-w-full`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Profil Tokoh Aktif */}
          <div className="flex items-center space-x-4">
            <div
              className={`w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xl text-slate-700 dark:text-slate-200 overflow-hidden ring-2 ${branding.avatarRing} shadow-md shrink-0`}
            >
              {selectedDewan.photoUrl ? (
                <img src={selectedDewan.photoUrl} alt={selectedDewan.fullName} className="w-full h-full object-cover" />
              ) : (
                selectedDewan.fullName.charAt(0)
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedDewan.fullName}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${branding.badge}`}>
                  {selectedDewan.partyAffiliation || 'INDEPENDEN'}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                <span>{selectedDewan.legislativeLevel}</span>
                <span>•</span>
                <span>{selectedDewan.customDapilName || 'Dapil Terdaftar'}</span>
                {selectedDewan.commissionName && (
                  <>
                    <span>•</span>
                    <span>{selectedDewan.commissionName}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Status Produksi & Izin */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Total Generate Counter */}
            <div className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">
                Total Generate Bulan Ini: <strong className="text-slate-900 dark:text-white">{tenantContext?.quota?.articleUsed || 0} kali</strong>
              </span>
            </div>

            {/* Direct Publish Permission */}
            {selectedDewan.canDirectPublish ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Izin Terbit Langsung</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Approval Draf</span>
              </span>
            )}

            {/* Subscription Status Badge */}
            <span
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                (tenantContext?.subscriptionStatus || selectedDewan.subscriptionStatus) === 'ACTIVE'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                Paket:{' '}
                {(tenantContext?.subscriptionStatus || selectedDewan.subscriptionStatus) === 'ACTIVE'
                  ? 'Aktif'
                  : tenantContext?.subscriptionStatus || selectedDewan.subscriptionStatus || 'Non-Aktif'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

