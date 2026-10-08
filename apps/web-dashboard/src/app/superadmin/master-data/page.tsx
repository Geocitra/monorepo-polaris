'use client';

import React, { useEffect, useState } from 'react';
import { Palette, MapPin, Building2, Tag } from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { PoliticalParty, DapilItem, CommissionItem, PricingMatrixRow } from '@/components/superadmin/types';
import { MasterPartiesTab } from '@/components/superadmin/master-data/MasterPartiesTab';
import { MasterDapilTab } from '@/components/superadmin/master-data/MasterDapilTab';
import { MasterCommissionsTab } from '@/components/superadmin/master-data/MasterCommissionsTab';
import { MasterPricingTab } from '@/components/superadmin/master-data/MasterPricingTab';
import { EditPartyModal } from '@/components/superadmin/master-data/EditPartyModal';

export default function SuperadminMasterDataPage() {
  const [activeTab, setActiveTab] = useState<'PARTIES' | 'DAPIL' | 'COMMISSIONS' | 'PRICING'>('PARTIES');
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [dapils, setDapils] = useState<DapilItem[]>([]);
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [pricingMatrices, setPricingMatrices] = useState<PricingMatrixRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingParty, setEditingParty] = useState<PoliticalParty | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'PARTIES') {
        const res = await AdminApiClient.request<PoliticalParty[]>('/admin/parties');
        setParties(res || []);
      } else if (activeTab === 'DAPIL') {
        const res = await AdminApiClient.request<DapilItem[]>('/admin/dapil');
        setDapils(res || []);
      } else if (activeTab === 'COMMISSIONS') {
        const res = await AdminApiClient.request<CommissionItem[]>('/admin/commissions');
        setCommissions(res || []);
      } else if (activeTab === 'PRICING') {
        const res = await AdminApiClient.request<PricingMatrixRow[]>('/admin/pricing-matrices');
        setPricingMatrices(res || []);
      }
    } catch (err) {
      console.error('Failed to load master data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Pusat Master Data Keparlemenan, Wilayah & Tarif
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Fondasi sistem yang digunakan bersama oleh seluruh anggota legislatif: Partai, Dapil, Komisi, dan Matriks Tarif Resmi B2B.
        </p>
      </div>

      {/* 2. SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit overflow-x-auto">
        {[
          { key: 'PARTIES', label: 'Partai Politik', icon: Palette, count: parties.length },
          { key: 'DAPIL', label: 'Daerah Pemilihan (KPU)', icon: MapPin, count: dapils.length },
          { key: 'COMMISSIONS', label: 'Komisi Dewan', icon: Building2, count: commissions.length },
          { key: 'PRICING', label: 'Matriks Tarif Lisensi (3D)', icon: Tag, count: pricingMatrices.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. MODULAR TAB CONTENT */}
      {activeTab === 'PARTIES' && (
        <MasterPartiesTab
          parties={parties}
          onEditParty={(p) => setEditingParty(p)}
          onPartyCreated={() => loadData()}
        />
      )}

      {activeTab === 'DAPIL' && (
        <MasterDapilTab
          dapils={dapils}
          loading={loading}
          onDapilCreated={() => loadData()}
        />
      )}

      {activeTab === 'COMMISSIONS' && (
        <MasterCommissionsTab
          commissions={commissions}
          onCommissionCreated={() => loadData()}
        />
      )}

      {activeTab === 'PRICING' && (
        <MasterPricingTab
          matrices={pricingMatrices}
          loading={loading}
          onRefresh={() => loadData()}
        />
      )}

      {/* 4. MODULAR EDIT PARTY MODAL */}
      {editingParty && (
        <EditPartyModal
          party={editingParty}
          onClose={() => setEditingParty(null)}
          onSuccess={() => {
            setEditingParty(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
