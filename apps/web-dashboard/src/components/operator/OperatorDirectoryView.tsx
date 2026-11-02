'use client';

import React from 'react';
import { Filter, Search, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { AssignedTenant } from './types';

interface OperatorDirectoryViewProps {
  assignments: AssignedTenant[];
  filteredAssignments: AssignedTenant[];
  selectedTenantId: string | null;
  totalAssigned: number;
  publishedCount: number;
  directoryFilter: 'ALL' | 'PENDING' | 'PUBLISHED';
  setDirectoryFilter: (val: 'ALL' | 'PENDING' | 'PUBLISHED') => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onSelectTenant: (tenantId: string) => void;
}

export function OperatorDirectoryView({
  filteredAssignments,
  selectedTenantId,
  totalAssigned,
  publishedCount,
  directoryFilter,
  setDirectoryFilter,
  searchQuery,
  setSearchQuery,
  onSelectTenant,
}: OperatorDirectoryViewProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Filter & Pencarian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0B0F19] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2 text-xs overflow-x-auto scrollbar-none pb-1 sm:pb-0 max-w-full">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {(['ALL', 'PENDING', 'PUBLISHED'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setDirectoryFilter(f)}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl font-bold transition text-xs cursor-pointer ${
                directoryFilter === f
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' && `Semua (${totalAssigned})`}
              {f === 'PENDING' && `Belum Rilis (${totalAssigned - publishedCount})`}
              {f === 'PUBLISHED' && `Sudah Terbit (${publishedCount})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari tokoh, partai, dapil..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Grid Tokoh Binaan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssignments.map((dewan) => {
          const isSelected = dewan.tenantId === selectedTenantId;
          const isPublishedToday = dewan.todayStats.hasPublishedToday;

          return (
            <div
              key={dewan.tenantId}
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 bg-white dark:bg-[#0B0F19] hover:shadow-md ${
                isSelected
                  ? 'ring-2 ring-indigo-500 border-indigo-400'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-base text-slate-600 dark:text-slate-300 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                  {dewan.photoUrl ? (
                    <img src={dewan.photoUrl} alt={dewan.fullName} className="w-full h-full object-cover" />
                  ) : (
                    dewan.fullName.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {dewan.fullName}
                    </h4>
                    {isPublishedToday ? (
                      <span className="shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Terbit</span>
                      </span>
                    ) : (
                      <span className="shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3 h-3" />
                        <span>Perlu Rilis</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {dewan.partyAffiliation || 'Independen'} • {dewan.customDapilName || dewan.legislativeLevel}
                  </p>
                  {dewan.commissionName && (
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {dewan.commissionName}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Card */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Izin: <strong>{dewan.canDirectPublish ? 'Terbit Langsung' : 'Approval'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => onSelectTenant(dewan.tenantId)}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition cursor-pointer"
                >
                  <span>Buka Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

