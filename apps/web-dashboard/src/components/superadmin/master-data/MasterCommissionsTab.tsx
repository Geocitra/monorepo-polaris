'use client';

import React, { useState, useMemo } from 'react';
import { Layers, Plus, Search } from 'lucide-react';
import { CommissionItem } from '../types';
import { PaginationControls } from '../common/PaginationControls';
import { CreateCommissionModal } from './CreateCommissionModal';

interface MasterCommissionsTabProps {
  commissions: CommissionItem[];
  onCommissionCreated?: (newCommission: CommissionItem) => void;
}

export function MasterCommissionsTab({
  commissions,
  onCommissionCreated,
}: MasterCommissionsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 6;

  // Filter commissions
  const filteredCommissions = useMemo(() => {
    return commissions.filter((c) => {
      // Level filter
      if (levelFilter !== 'ALL' && c.legislativeLevel !== levelFilter) {
        return false;
      }
      // Search filter
      if (!searchTerm.trim()) return true;
      const s = searchTerm.toLowerCase().trim();
      return (
        c.code?.toLowerCase().includes(s) ||
        c.name?.toLowerCase().includes(s) ||
        c.focusAreas?.some((f) => f.toLowerCase().includes(s)) ||
        c.partnerMinistries?.some((m) => m.toLowerCase().includes(s))
      );
    });
  }, [commissions, levelFilter, searchTerm]);

  const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));

  const displayedCommissions = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredCommissions.slice(start, start + itemsPerPage);
  }, [filteredCommissions, safePage, itemsPerPage]);

  return (
    <div className="space-y-4">
      {/* Header Bar with Search, Filter & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode komisi, bidang fokus, atau mitra..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F17] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
            />
          </div>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F17] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          >
            <option value="ALL">Semua Tingkat Parlemen</option>
            <option value="DPR_RI">DPR RI</option>
            <option value="DPRD_PROVINSI">DPRD Provinsi</option>
            <option value="DPRD_KABUPATEN_KOTA">DPRD Kab/Kota</option>
          </select>
        </div>

        {/* Add Commission Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Komisi Baru</span>
        </button>
      </div>

      {/* Grid of Commission Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {displayedCommissions.map((c) => (
          <div
            key={c.id}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-[10px] font-mono font-bold">
                  {c.code}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-mono font-semibold">
                  {c.legislativeLevel}
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug">
                {c.name}
              </h3>

              {c.focusAreas && c.focusAreas.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Bidang Fokus:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {c.focusAreas.map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {c.partnerMinistries && c.partnerMinistries.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Mitra Kerja:
                </span>
                <div className="flex flex-wrap gap-1">
                  {c.partnerMinistries.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-[10px]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {displayedCommissions.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            {searchTerm
              ? `Tidak ada komisi yang cocok dengan kata kunci "${searchTerm}".`
              : 'Belum ada data komisi pada kategori ini.'}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={filteredCommissions.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Create Modal */}
      <CreateCommissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newC) => {
          if (onCommissionCreated) {
            onCommissionCreated(newC);
          }
        }}
      />
    </div>
  );
}
