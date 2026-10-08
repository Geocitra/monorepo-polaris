'use client';

import React, { useState, useMemo } from 'react';
import {
  Video,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  FileCheck,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';
import { InquiryRow } from '../types';
import { PaginationControls } from '../common/PaginationControls';

interface InquiryTableProps {
  inquiries: InquiryRow[];
  loading: boolean;
  onScheduleMeet: (inquiry: InquiryRow) => void;
  onUpdateStatus: (inquiry: InquiryRow, newStatus: string) => void;
  onConvertLead?: (inquiry: InquiryRow) => void;
}

export function InquiryTable({
  inquiries,
  loading,
  onScheduleMeet,
  onUpdateStatus,
  onConvertLead,
}: InquiryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(inquiries.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));

  const displayedInquiries = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return inquiries.slice(start, start + itemsPerPage);
  }, [inquiries, safePage, itemsPerPage]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW_LEAD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <Clock className="w-3 h-3 text-blue-500" />
            Lead Baru Masuk
          </span>
        );
      case 'MEETING_SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <Video className="w-3 h-3 text-amber-500" />
            Meet Terjadwal
          </span>
        );
      case 'PROPOSAL_SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
            <Send className="w-3 h-3 text-purple-500" />
            Proposal Terkirim
          </span>
        );
      case 'DEAL_CONVERTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <FileCheck className="w-3 h-3 text-emerald-500" />
            Deal Berhasil
          </span>
        );
      case 'REJECTED_DROPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <XCircle className="w-3 h-3 text-slate-400" />
            Batal / Ditutup
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs p-4 space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Calon Anggota Dewan</th>
              <th className="py-3 px-4">Yurisdiksi & Wilayah</th>
              <th className="py-3 px-4">Minat Lisensi</th>
              <th className="py-3 px-4">Sesi Demo GMeet</th>
              <th className="py-3 px-4">Status Siklus Lead</th>
              <th className="py-3 px-4 text-right">Tindakan Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {displayedInquiries.map((inq) => {
              const meetDate = inq.meetingDatetime ? new Date(inq.meetingDatetime) : null;

              return (
                <tr
                  key={inq.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* 1. NAMA & KONTAK */}
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {inq.fullName}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span>{inq.officialEmail}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-mono mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{inq.phoneNumber}</span>
                    </div>
                    {inq.partyAffiliation && (
                      <span className="inline-block mt-1 px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {inq.partyAffiliation}
                      </span>
                    )}
                  </td>

                  {/* 2. YURISDIKSI & WILAYAH */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-bold text-[10px]">
                      {inq.legislativeLevel.replace(/_/g, ' ')}
                    </span>
                    <div className="text-slate-700 dark:text-slate-300 font-medium text-xs mt-1">
                      {inq.targetRegion}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Masuk: {new Date(inq.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </td>

                  {/* 3. MINAT LISENSI */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      Tier {inq.preferredTier}
                    </span>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Siklus: <span className="font-medium text-slate-700 dark:text-slate-300">{inq.preferredCycle}</span>
                    </div>
                  </td>

                  {/* 4. SESI DEMO GMEET */}
                  <td className="py-3 px-4">
                    {meetDate ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span>
                            {meetDate.toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            WIB
                          </span>
                        </div>
                        {inq.meetingUrl && (
                          <a
                            href={inq.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-mono"
                          >
                            <Video className="w-3 h-3" />
                            <span>Buka Google Meet</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                        Belum dijadwalkan
                      </span>
                    )}
                  </td>

                  {/* 5. STATUS SIKLUS LEAD */}
                  <td className="py-3 px-4">
                    <div className="space-y-1.5">
                      <div>{renderStatusBadge(inq.status)}</div>
                      <select
                        value={inq.status}
                        onChange={(e) => onUpdateStatus(inq, e.target.value)}
                        className="text-[10px] py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="NEW_LEAD">Lead Baru</option>
                        <option value="MEETING_SCHEDULED">Meet Terjadwal</option>
                        <option value="PROPOSAL_SENT">Proposal Terkirim</option>
                        <option value="DEAL_CONVERTED">Deal Berhasil</option>
                        <option value="REJECTED_DROPPED">Dibatalkan</option>
                      </select>
                    </div>
                  </td>

                  {/* 6. TINDAKAN ADMIN */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {/* Jadwalkan Meet */}
                      <button
                        type="button"
                        onClick={() => onScheduleMeet(inq)}
                        title="Atur Waktu Demo Google Meet"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{inq.meetingDatetime ? 'Ubah Sesi' : 'Jadwalkan'}</span>
                      </button>

                      {/* Onboard / Konversi Lead */}
                      {onConvertLead && !inq.convertedTenantId && (
                        <button
                          type="button"
                          onClick={() => onConvertLead(inq)}
                          title="Terbitkan Akun Resmi Dewan dari Lead Ini"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Onboard</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {displayedInquiries.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-slate-400 text-xs italic"
                >
                  Belum ada permohonan konsultasi lisensi atau data tidak ditemukan.
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
        totalItems={inquiries.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
