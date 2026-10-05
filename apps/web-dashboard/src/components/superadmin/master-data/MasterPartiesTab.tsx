'use client';

import React, { useState, useMemo } from 'react';
import { Edit2, CheckCircle2, Search, Plus } from 'lucide-react';
import { PoliticalParty } from '../types';
import { PaginationControls } from '../common/PaginationControls';
import { CreatePartyModal } from './CreatePartyModal';

interface MasterPartiesTabProps {
  parties: PoliticalParty[];
  onEditParty: (party: PoliticalParty) => void;
  onPartyCreated?: (party: PoliticalParty) => void;
}

export function MasterPartiesTab({
  parties,
  onEditParty,
  onPartyCreated,
}: MasterPartiesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const itemsPerPage = 6;

  // Filter parties by search
  const filteredParties = useMemo(() => {
    if (!searchTerm.trim()) return parties;
    const s = searchTerm.toLowerCase().trim();
    return parties.filter(
      (p) =>
        p.code?.toLowerCase().includes(s) ||
        p.name?.toLowerCase().includes(s) ||
        p.ballotNumber?.toString().includes(s)
    );
  }, [parties, searchTerm]);

  // Reset to page 1 on search change
  const totalPages = Math.ceil(filteredParties.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));

  // Sliced items for current page
  const displayedParties = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredParties.slice(start, start + itemsPerPage);
  }, [filteredParties, safePage, itemsPerPage]);

  return (
    <div className="space-y-4">
      {/* Search Bar & Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode partai, nama resmi, atau nomor urut..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F17] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total: <strong className="text-slate-800 dark:text-slate-200">{filteredParties.length}</strong> partai terdaftar
          </span>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Partai Baru</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedParties.map((p) => (
          <div
            key={p.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 shadow-xs transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center font-black text-xs text-blue-700 dark:text-blue-300">
                    {p.ballotNumber || '-'}
                  </span>
                  <div>
                    <span className="font-black text-sm text-slate-900 dark:text-white tracking-wide block leading-none">
                      {p.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Nomor Urut #{p.ballotNumber}
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-snug pt-1">
                {p.name}
              </h3>
              {p.description && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {p.description}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                {p.isActive ? 'Status: Aktif' : 'Status: Non-Aktif'}
              </span>

              <button
                type="button"
                onClick={() => onEditParty(p)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <Edit2 className="h-3 w-3" />
                <span>Ubah Data</span>
              </button>
            </div>
          </div>
        ))}

        {displayedParties.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            Tidak ada partai politik yang cocok dengan kata kunci &quot;{searchTerm}&quot;.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={filteredParties.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Create Party Modal */}
      <CreatePartyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newP) => {
          if (onPartyCreated) {
            onPartyCreated(newP);
          }
        }}
      />
    </div>
  );
}
