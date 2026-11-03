'use client';

import React from 'react';
import { Search, Users, Filter, Lock } from 'lucide-react';
import { AssignedTenantItem, CATEGORY_LABELS } from './types';

interface KnowledgeFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  tenantFilter: string;
  setTenantFilter: (val: string) => void;
  assignedTenants: AssignedTenantItem[];
  onSelectTenant: (tenant: AssignedTenantItem | null) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  scopeFilter: string;
  setScopeFilter: (val: string) => void;
}

export function KnowledgeFilterBar({
  search,
  setSearch,
  onSearchSubmit,
  tenantFilter,
  setTenantFilter,
  assignedTenants,
  onSelectTenant,
  categoryFilter,
  setCategoryFilter,
  scopeFilter,
  setScopeFilter,
}: KnowledgeFilterBarProps) {
  return (
    <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
      <form onSubmit={onSearchSubmit} className="relative w-full md:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari judul, nama file, atau nama dewan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        {/* Filter Tokoh Dewan Binaan */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <select
            value={tenantFilter}
            onChange={(e) => {
              setTenantFilter(e.target.value);
              const found = assignedTenants.find((t) => t.tenantId === e.target.value) || null;
              onSelectTenant(found);
            }}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[150px] truncate [&>option]:bg-white dark:[&>option]:bg-slate-900 [&>option]:text-slate-800 dark:[&>option]:text-slate-200"
          >
            <option value="ALL">Semua Dewan Binaan</option>
            {assignedTenants.map((t) => (
              <option key={t.tenantId} value={t.tenantId}>
                {t.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Kategori */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer [&>option]:bg-white dark:[&>option]:bg-slate-900 [&>option]:text-slate-800 dark:[&>option]:text-slate-200"
          >
            <option value="ALL">Semua Kategori</option>
            {Object.entries(CATEGORY_LABELS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Hak Akses */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer [&>option]:bg-white dark:[&>option]:bg-slate-900 [&>option]:text-slate-800 dark:[&>option]:text-slate-200"
          >
            <option value="ALL">Semua Cakupan</option>
            <option value="PRIVATE_TENANT">🔒 Privat Dewan</option>
            <option value="PARTY_CONFIDENTIAL">🛡️ Internal Fraksi</option>
            <option value="DAPIL_SHARED">🏛️ Berbagi Dapil</option>
          </select>
        </div>
      </div>
    </div>
  );
}

