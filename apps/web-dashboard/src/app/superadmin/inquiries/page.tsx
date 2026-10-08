'use client';

import React, { useEffect, useState } from 'react';
import { Video, Search, Filter, RefreshCw, CalendarCheck, CheckCircle2, UserPlus } from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { InquiryRow } from '@/components/superadmin/types';
import { InquiryTable } from '@/components/superadmin/inquiries/InquiryTable';
import { ScheduleMeetModal } from '@/components/superadmin/inquiries/ScheduleMeetModal';
import { CreateTenantModal } from '@/components/superadmin/tenants/CreateTenantModal';

export default function SuperadminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedInquiryForMeet, setSelectedInquiryForMeet] = useState<InquiryRow | null>(null);
  const [selectedInquiryForOnboard, setSelectedInquiryForOnboard] = useState<InquiryRow | null>(null);
  const [isCreateTenantOpen, setIsCreateTenantOpen] = useState(false);

  useEffect(() => {
    loadInquiries();
  }, [statusFilter]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await AdminApiClient.request<InquiryRow[]>(`/inquiries${query}`);
      setInquiries(res || []);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (inquiry: InquiryRow, newStatus: string) => {
    try {
      await AdminApiClient.request(`/inquiries/${inquiry.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      loadInquiries();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status permohonan.');
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      inq.fullName?.toLowerCase().includes(s) ||
      inq.officialEmail?.toLowerCase().includes(s) ||
      inq.phoneNumber?.toLowerCase().includes(s) ||
      inq.targetRegion?.toLowerCase().includes(s) ||
      inq.partyAffiliation?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Permohonan Lisensi & Sesi Demo Google Meet</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Corong akuisisi B2B/B2G: Triage minat dewan, kurasi proposal teknis, dan jadwalkan sesi pengenalan platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadInquiries}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Prospek Masuk</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{inquiries.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">Lead Baru</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {inquiries.filter((i) => i.status === 'NEW_LEAD').length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">Meet Terjadwal</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {inquiries.filter((i) => i.status === 'MEETING_SCHEDULED').length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Deal Berhasil</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {inquiries.filter((i) => i.status === 'DEAL_CONVERTED').length}
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0B0F17] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, wilayah, atau partai..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'NEW_LEAD', label: 'Lead Baru' },
            { id: 'MEETING_SCHEDULED', label: 'Meet' },
            { id: 'PROPOSAL_SENT', label: 'Proposal' },
            { id: 'DEAL_CONVERTED', label: 'Deal' },
            { id: 'REJECTED_DROPPED', label: 'Batal' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === pill.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. INQUIRY TABLE */}
      <InquiryTable
        inquiries={filteredInquiries}
        loading={loading}
        onScheduleMeet={(inq) => setSelectedInquiryForMeet(inq)}
        onUpdateStatus={handleUpdateStatus}
        onConvertLead={(inq) => {
          setSelectedInquiryForOnboard(inq);
          setIsCreateTenantOpen(true);
        }}
      />

      {/* 5. SCHEDULE MEET MODAL */}
      {selectedInquiryForMeet && (
        <ScheduleMeetModal
          inquiry={selectedInquiryForMeet}
          onClose={() => setSelectedInquiryForMeet(null)}
          onSuccess={() => {
            setSelectedInquiryForMeet(null);
            loadInquiries();
          }}
        />
      )}

      {/* 6. CREATE TENANT MODAL ONBOARDING */}
      {isCreateTenantOpen && (
        <CreateTenantModal
          initialLeadData={
            selectedInquiryForOnboard
              ? {
                  inquiryId: selectedInquiryForOnboard.id,
                  fullName: selectedInquiryForOnboard.fullName,
                  email: selectedInquiryForOnboard.officialEmail,
                  phoneNumber: selectedInquiryForOnboard.phoneNumber,
                  partyAffiliation: selectedInquiryForOnboard.partyAffiliation || undefined,
                  legislativeLevel: selectedInquiryForOnboard.legislativeLevel,
                  customDapilName: selectedInquiryForOnboard.targetRegion,
                  planTier: selectedInquiryForOnboard.preferredTier || 'PRO',
                  billingCycle: selectedInquiryForOnboard.preferredCycle || 'SEMESTER',
                }
              : null
          }
          onClose={() => {
            setIsCreateTenantOpen(false);
            setSelectedInquiryForOnboard(null);
          }}
          onSuccess={() => {
            setIsCreateTenantOpen(false);
            setSelectedInquiryForOnboard(null);
            loadInquiries();
          }}
        />
      )}
    </div>
  );
}
