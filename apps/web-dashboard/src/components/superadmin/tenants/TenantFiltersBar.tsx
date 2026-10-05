'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface TenantFiltersBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  partyFilter: string;
  onPartyFilterChange: (val: string) => void;
}

export function TenantFiltersBar({
  search,
  onSearchChange,
  partyFilter,
  onPartyFilterChange,
}: TenantFiltersBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama anggota dewan, email, atau subdomain..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400 shrink-0" />
        <select
          value={partyFilter}
          onChange={(e) => onPartyFilterChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
        >
          <option value="ALL">Semua Fraksi Partai</option>
          <option value="Golkar">Fraksi Golkar</option>
          <option value="PDIP">Fraksi PDI-P</option>
          <option value="Gerindra">Fraksi Gerindra</option>
          <option value="PKB">Fraksi PKB</option>
          <option value="NasDem">Fraksi NasDem</option>
          <option value="PKS">Fraksi PKS</option>
          <option value="Demokrat">Fraksi Demokrat</option>
          <option value="PAN">Fraksi PAN</option>
          <option value="PPP">Fraksi PPP</option>
        </select>
      </div>
    </div>
  );
}
