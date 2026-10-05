'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { DapilItem } from '../types';
import { PaginationControls } from '../common/PaginationControls';
import { CreateDapilModal } from './CreateDapilModal';

interface MasterDapilTabProps {
  dapils: DapilItem[];
  loading: boolean;
  onDapilCreated?: (dapil: DapilItem) => void;
}

export function MasterDapilTab({
  dapils,
  loading,
  onDapilCreated,
}: MasterDapilTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const itemsPerPage = 6;

  // Filter dapil
  const filteredDapils = useMemo(() => {
    if (!searchTerm.trim()) return dapils;
    const s = searchTerm.toLowerCase().trim();
    return dapils.filter(
      (d) =>
        d.dapilCode?.toLowerCase().includes(s) ||
        d.dapilName?.toLowerCase().includes(s) ||
        d.provinceName?.toLowerCase().includes(s) ||
        d.regencyCoverage?.some((r) => r.toLowerCase().includes(s))
    );
  }, [dapils, searchTerm]);

  const totalPages = Math.ceil(filteredDapils.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));

  const displayedDapils = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredDapils.slice(start, start + itemsPerPage);
  }, [filteredDapils, safePage, itemsPerPage]);

  return (
    <div className="space-y-4">
      {/* Search Bar & Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode dapil, provinsi, atau kabupaten..."
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
            Total: <strong className="text-slate-800 dark:text-slate-200">{filteredDapils.length}</strong> daerah pemilihan terdaftar
          </span>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Dapil Baru</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3 px-3">Kode Dapil</th>
                <th className="pb-3 px-3">Nama Daerah Pemilihan</th>
                <th className="pb-3 px-3">Provinsi</th>
                <th className="pb-3 px-3">Cakupan Kabupaten / Kota</th>
                <th className="pb-3 px-3 text-right">Estimasi DPT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {displayedDapils.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{d.dapilCode}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{d.dapilName}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{d.provinceName}</td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                    <div className="flex flex-wrap gap-1">
                      {d.regencyCoverage?.map((r) => (
                        <span
                          key={r}
                          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px]"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                    {d.totalVoters ? d.totalVoters.toLocaleString('id-ID') : '-'}
                  </td>
                </tr>
              ))}

              {displayedDapils.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs italic">
                    {searchTerm ? `Tidak ada daerah pemilihan cocok dengan "${searchTerm}".` : 'Belum ada data daerah pemilihan yang terdaftar.'}
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
          totalItems={filteredDapils.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Create Dapil Modal */}
      <CreateDapilModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newD) => {
          if (onDapilCreated) {
            onDapilCreated(newD);
          }
        }}
      />
    </div>
  );
}
