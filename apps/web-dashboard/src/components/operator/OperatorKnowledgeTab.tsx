'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Search,
  Filter,
  Trash2,
  Edit3,
  ShieldCheck,
  Lock,
  Layers,
  FileText,
  UploadCloud,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Users,
  HardDrive,
  Hash,
  Eye,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { DatahubCategory, DatahubPrivacyScope } from '@polaris/shared-types';

export interface AssignedTenantItem {
  assignmentId: string;
  canDirectPublish?: boolean;
  assignmentStatus?: string;
  tenantId: string;
  fullName: string;
  photoUrl: string | null;
  partyAffiliation: string | null;
  customDapilName?: string | null;
  legislativeLevel?: string | null;
  commissionName?: string | null;
}

export interface OperatorDocumentItem {
  refId: string;
  fileId: string;
  customTitle: string;
  privacyScope: string;
  categoryTag: string;
  dapilCode: string | null;
  partyAffiliation: string | null;
  createdAt: string;
  uploadedByTenantId: string;
  tenantName: string;
  tenantPhoto: string | null;
  tenantDapil: string | null;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  extractionStatus: string;
  totalPages: number;
  contentSha256: string;
  chunkCount: number;
  totalTokens: number;
}

interface OperatorKnowledgeTabProps {
  assignedTenants: AssignedTenantItem[];
  selectedTenant: AssignedTenantItem | null;
  onSelectTenant: (tenant: AssignedTenantItem | null) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  REGULASI_DAERAH: { label: 'Regulasi Daerah', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
  ANGGARAN_APBD: { label: 'Anggaran & APBD', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  NOTULA_SIDANG: { label: 'Notula & Risalah', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  ASPIRASI_KONSTITUEN: { label: 'Aspirasi & Reses', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  KAJIAN_AKADEMIS: { label: 'Kajian Akademis', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30' },
  DOKUMEN_INTERNAL: { label: 'Dokumen Internal', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
};

const SCOPE_CONFIG: Record<string, { label: string; icon: typeof Lock; desc: string; badgeColor: string }> = {
  PRIVATE_TENANT: {
    label: 'Rahasia Pribadi',
    icon: Lock,
    desc: 'Hanya dapat diakses oleh AI dewan pemilik dokumen',
    badgeColor: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  },
  PARTY_CONFIDENTIAL: {
    label: 'Internal Fraksi',
    icon: ShieldCheck,
    desc: 'Dapat diakses oleh seluruh anggota dewan satu fraksi partai',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  },
  DAPIL_SHARED: {
    label: 'Berbagi Dapil',
    icon: Layers,
    desc: 'Dapat diakses oleh sesama dewan dari daerah pemilihan yang sama',
    badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  },
};

export function OperatorKnowledgeTab({
  assignedTenants,
  selectedTenant,
  onSelectTenant,
}: OperatorKnowledgeTabProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<OperatorDocumentItem[]>([]);
  const [stats, setStats] = useState<{
    totalDocuments: number;
    totalTokens: number;
    assignedTenantsCount: number;
    scopeCounts: Record<string, number>;
  }>({
    totalDocuments: 0,
    totalTokens: 0,
    assignedTenantsCount: 0,
    scopeCounts: { PRIVATE_TENANT: 0, PARTY_CONFIDENTIAL: 0, DAPIL_SHARED: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState<string>(selectedTenant ? selectedTenant.tenantId : 'ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState('ALL');

  // Modal Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTargetTenantId, setUploadTargetTenantId] = useState<string>(
    selectedTenant ? selectedTenant.tenantId : assignedTenants[0]?.tenantId || ''
  );
  const [uploadCustomTitle, setUploadCustomTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<string>('AUTO');
  const [uploadScope, setUploadScope] = useState<string>(DatahubPrivacyScope.PARTY_CONFIDENTIAL);
  const [isUploading, setIsUploading] = useState(false);

  // Modal Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<OperatorDocumentItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<string>('DOKUMEN_INTERNAL');
  const [editScope, setEditScope] = useState<string>(DatahubPrivacyScope.PRIVATE_TENANT);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal Detach State
  const [isDetachModalOpen, setIsDetachModalOpen] = useState(false);
  const [detachingRef, setDetachingRef] = useState<OperatorDocumentItem | null>(null);
  const [isDetaching, setIsDetaching] = useState(false);

  useEffect(() => {
    if (selectedTenant) {
      setTenantFilter(selectedTenant.tenantId);
      setUploadTargetTenantId(selectedTenant.tenantId);
    } else if (assignedTenants && assignedTenants.length > 0) {
      if (!uploadTargetTenantId || !assignedTenants.some((t) => t.tenantId === uploadTargetTenantId)) {
        setUploadTargetTenantId(assignedTenants[0].tenantId);
      }
    }
  }, [selectedTenant, assignedTenants]);

  function openUploadModal() {
    if (selectedTenant) {
      setUploadTargetTenantId(selectedTenant.tenantId);
    } else if (tenantFilter !== 'ALL') {
      setUploadTargetTenantId(tenantFilter);
    } else if (assignedTenants.length > 0) {
      if (!uploadTargetTenantId || !assignedTenants.some((t) => t.tenantId === uploadTargetTenantId)) {
        setUploadTargetTenantId(assignedTenants[0].tenantId);
      }
    }
    setUploadFile(null);
    setUploadCustomTitle('');
    setUploadCategory('AUTO');
    setUploadScope(DatahubPrivacyScope.PARTY_CONFIDENTIAL);
    setIsUploadModalOpen(true);
  }

  useEffect(() => {
    loadData();
  }, [tenantFilter, categoryFilter, scopeFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const statsRes = await AdminApiClient.request<any>('/operator/datahub/stats');
      if (statsRes) {
        setStats(statsRes);
      }

      const params = new URLSearchParams();
      if (tenantFilter !== 'ALL') params.append('tenantId', tenantFilter);
      if (categoryFilter !== 'ALL') params.append('categoryTag', categoryFilter);
      if (scopeFilter !== 'ALL') params.append('privacyScope', scopeFilter);
      if (search.trim()) params.append('search', search.trim());

      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const docsRes = await AdminApiClient.request<OperatorDocumentItem[]>(
        `/operator/datahub/documents${queryStr}`
      );
      setDocuments(docsRes || []);
    } catch (err: any) {
      console.error('Gagal memuat dokumen operator:', err);
      toast({
        type: 'error',
        title: 'Gagal Memuat Dokumen',
        description: err.message || 'Terjadi kendala saat memuat berkas pengetahuan.',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadData();
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) {
      toast({ type: 'error', title: 'Berkas Kosong', description: 'Pilih berkas yang akan diunggah.' });
      return;
    }
    if (!uploadTargetTenantId) {
      toast({ type: 'error', title: 'Pilih Tokoh Dewan', description: 'Wajib memilih tokoh dewan pemilik dokumen.' });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('tenantId', uploadTargetTenantId);
      if (uploadCustomTitle.trim()) {
        formData.append('customTitle', uploadCustomTitle.trim());
      }
      if (uploadCategory !== 'AUTO') {
        formData.append('categoryTag', uploadCategory);
      }
      formData.append('privacyScope', uploadScope);

      await AdminApiClient.uploadFormData('/operator/datahub/upload', formData);

      toast({
        type: 'success',
        title: 'Dokumen Berhasil Diserap',
        description: 'Berkas telah diproses, diklasifikasikan, dan disinkronkan ke Knowledge AI.',
      });

      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadCustomTitle('');
      setUploadCategory('AUTO');
      loadData();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Unggah Gagal',
        description: err.message || 'Gagal memproses unggah dokumen.',
      });
    } finally {
      setIsUploading(false);
    }
  }

  function openEditModal(doc: OperatorDocumentItem) {
    setEditingRef(doc);
    setEditTitle(doc.customTitle || doc.originalFileName);
    setEditCategory(doc.categoryTag);
    setEditScope(doc.privacyScope);
    setIsEditModalOpen(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRef) return;

    setIsUpdating(true);
    try {
      await AdminApiClient.request(`/operator/datahub/references/${editingRef.refId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          customTitle: editTitle.trim(),
          categoryTag: editCategory,
          privacyScope: editScope,
        }),
      });

      toast({
        type: 'success',
        title: 'Klasifikasi Diperbarui',
        description: 'Judul, kategori, dan cakupan privasi berhasil disesuaikan.',
      });

      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memperbarui',
        description: err.message || 'Terjadi kesalahan saat menyimpan perubahan.',
      });
    } finally {
      setIsUpdating(false);
    }
  }

  function openDetachModal(doc: OperatorDocumentItem) {
    setDetachingRef(doc);
    setIsDetachModalOpen(true);
  }

  async function handleDetachConfirm() {
    if (!detachingRef) return;

    setIsDetaching(true);
    try {
      await AdminApiClient.request(`/operator/datahub/references/${detachingRef.refId}`, {
        method: 'DELETE',
      });

      toast({
        type: 'success',
        title: 'Kaitan Dicabut',
        description: 'Dokumen berhasil dilepas dari Knowledge AI tokoh binaan Anda.',
      });

      setIsDetachModalOpen(false);
      loadData();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Mencabut Kaitan',
        description: err.message || 'Terjadi kendala saat melepas dokumen.',
      });
    } finally {
      setIsDetaching(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & ACTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black tracking-tight text-white">
              Bank Dokumen & Pengetahuan AI Binaan
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Kelola dokumen kebijakan, APBD, notula risalah, dan instruksi fraksi untuk melatih otak AI
            seluruh dewan binaan Anda. Anda memiliki wewenang mengoreksi kategori dan mengatur cakupan berbagi fraksi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={loading}
            className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </Button>

          <Button
            onClick={openUploadModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <UploadCloud className="w-4 h-4" />
            <span>+ Unggah Dokumen Binaan</span>
          </Button>
        </div>
      </div>

      {/* 2. STATS SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Total Dokumen Binaan</div>
            <div className="text-xl font-black text-white">{stats.totalDocuments}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Token AI Terserap</div>
            <div className="text-xl font-black text-purple-300">
              {stats.totalTokens.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Internal Fraksi Partai</div>
            <div className="text-xl font-black text-indigo-300">
              {stats.scopeCounts.PARTY_CONFIDENTIAL || 0}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Rahasia Privat Dewan</div>
            <div className="text-xl font-black text-emerald-300">
              {stats.scopeCounts.PRIVATE_TENANT || 0}
            </div>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH CONTROLS */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari judul, nama file, atau nama dewan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Filter Tokoh Dewan Binaan */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={tenantFilter}
              onChange={(e) => {
                setTenantFilter(e.target.value);
                const found = assignedTenants.find((t) => t.tenantId === e.target.value) || null;
                onSelectTenant(found);
              }}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer max-w-[150px] truncate"
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
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
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
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Cakupan</option>
              <option value="PRIVATE_TENANT">🔒 Privat Dewan</option>
              <option value="PARTY_CONFIDENTIAL">🛡️ Internal Fraksi</option>
              <option value="DAPIL_SHARED">🏛️ Berbagi Dapil</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. DOCUMENT LIST TABLE */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-xs">Memuat dokumen binaan...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <FileText className="w-10 h-10 text-slate-600" />
            <div className="text-center">
              <p className="text-sm font-bold text-slate-300">Belum Ada Dokumen</p>
              <p className="text-xs text-slate-500 mt-1">
                Dewan binaan ini belum melampirkan berkas, atau Anda belum mengunggah dokumen kebijakan.
              </p>
            </div>
            <Button
              onClick={openUploadModal}
              className="mt-2 bg-indigo-600 text-xs font-bold text-white px-4 py-1.5 rounded-xl"
            >
              + Unggah Berkas Pertama
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Dokumen & Judul</th>
                  <th className="py-3.5 px-4">Tokoh Dewan Binaan</th>
                  <th className="py-3.5 px-4">Kategori Dokumen</th>
                  <th className="py-3.5 px-4">Cakupan Hak Akses AI</th>
                  <th className="py-3.5 px-4 text-center">Status Vektor</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {documents.map((doc) => {
                  const catConfig = CATEGORY_LABELS[doc.categoryTag] || {
                    label: doc.categoryTag,
                    color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
                  };
                  const scopeInfo = SCOPE_CONFIG[doc.privacyScope] || {
                    label: doc.privacyScope,
                    icon: Lock,
                    desc: '',
                    badgeColor: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
                  };
                  const ScopeIcon = scopeInfo.icon;

                  const isSpreadsheet =
                    doc.mimeType?.includes('csv') ||
                    doc.mimeType?.includes('spreadsheet') ||
                    doc.originalFileName?.match(/\.(xlsx|xls|csv)$/i);

                  return (
                    <tr key={doc.refId} className="hover:bg-slate-800/40 transition">
                      {/* Dokumen & Judul */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isSpreadsheet
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 line-clamp-1 text-[13px]">
                              {doc.customTitle || doc.originalFileName}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                              <span className="font-mono text-slate-500 line-clamp-1 max-w-[180px]">
                                {doc.originalFileName}
                              </span>
                              <span>•</span>
                              <span>{(doc.fileSizeBytes / 1024).toFixed(0)} KB</span>
                              {doc.totalPages > 1 && (
                                <>
                                  <span>•</span>
                                  <span>{doc.totalPages} Hal</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Dewan Pemilik */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {doc.tenantPhoto ? (
                            <img
                              src={doc.tenantPhoto}
                              alt={doc.tenantName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-[10px]">
                              {doc.tenantName?.charAt(0) || 'D'}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-200 text-xs">{doc.tenantName}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              {doc.partyAffiliation && <span>{doc.partyAffiliation}</span>}
                              {doc.tenantDapil && <span>• {doc.tenantDapil}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori Dokumen */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${catConfig.color}`}
                        >
                          {catConfig.label}
                        </span>
                      </td>

                      {/* Cakupan Hak Akses AI */}
                      <td className="py-3.5 px-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${scopeInfo.badgeColor}`}
                          title={scopeInfo.desc}
                        >
                          <ScopeIcon className="w-3 h-3" />
                          <span>{scopeInfo.label}</span>
                        </div>
                      </td>

                      {/* Status Vektor */}
                      <td className="py-3.5 px-4 text-center">
                        {doc.extractionStatus === 'COMPLETED' ? (
                          <div className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{doc.chunkCount} Chunk</span>
                          </div>
                        ) : doc.extractionStatus === 'PROCESSING' ? (
                          <div className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Memproses</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Gagal</span>
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(doc)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition"
                            title="Edit Judul, Kategori & Hak Akses"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openDetachModal(doc)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
                            title="Cabut Kaitan Dokumen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL UNGGAH DOKUMEN BARU */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Unggah Dokumen Baru ke Knowledge Base Binaan"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
          {/* Target Dewan Binaan */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Target Anggota Dewan Binaan <span className="text-rose-400">*</span>
            </label>
            <select
              value={uploadTargetTenantId}
              onChange={(e) => setUploadTargetTenantId(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {assignedTenants.map((t) => (
                <option key={t.tenantId} value={t.tenantId}>
                  {t.fullName} ({t.partyAffiliation || 'Dewan'} - {t.customDapilName || 'Dapil'})
                </option>
              ))}
            </select>
          </div>

          {/* Pilih File */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Pilih Berkas Dokumen / Spreadsheet / Scan <span className="text-rose-400">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-4 text-center cursor-pointer transition bg-slate-900/40"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.tsv,.txt,.md,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setUploadFile(f);
                    if (!uploadCustomTitle) {
                      setUploadCustomTitle(f.name.replace(/\.[^/.]+$/, ''));
                    }
                  }
                }}
              />
              <UploadCloud className="w-8 h-8 mx-auto text-indigo-400 mb-1" />
              {uploadFile ? (
                <div>
                  <div className="font-bold text-xs text-white line-clamp-1">{uploadFile.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk mengganti
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-bold text-slate-300">Klik untuk memilih berkas</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Mendukung PDF, DOCX, Excel/CSV, TXT, dan Foto Scan (Maks. 25 MB)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Judul Kustom */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Judul Dokumen (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Perda No. 4 Tahun 2024 tentang Pajak Daerah Kota Bandung"
              value={uploadCustomTitle}
              onChange={(e) => setUploadCustomTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Kategori Dokumen */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Kategori Dokumen</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="AUTO">✨ Deteksi Otomatis oleh AI (Rekomendasi)</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cakupan Hak Akses AI */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Cakupan Hak Akses AI <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                  uploadScope === DatahubPrivacyScope.PARTY_CONFIDENTIAL
                    ? 'bg-indigo-500/10 border-indigo-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="uploadScope"
                  value={DatahubPrivacyScope.PARTY_CONFIDENTIAL}
                  checked={uploadScope === DatahubPrivacyScope.PARTY_CONFIDENTIAL}
                  onChange={(e) => setUploadScope(e.target.value)}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Internal Fraksi (Satu Partai Politik) — Rekomendasi</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Dapat diakses oleh AI seluruh dewan binaan Anda yang satu partai untuk sinkronisasi sikap fraksi.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                  uploadScope === DatahubPrivacyScope.PRIVATE_TENANT
                    ? 'bg-indigo-500/10 border-indigo-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="uploadScope"
                  value={DatahubPrivacyScope.PRIVATE_TENANT}
                  checked={uploadScope === DatahubPrivacyScope.PRIVATE_TENANT}
                  onChange={(e) => setUploadScope(e.target.value)}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Rahasia Pribadi (Hanya AI Dewan Ini Saja)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Terkunci mutlak untuk dewan yang bersangkutan. Anggota dewan lain tidak bisa mengakses data ini.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                  uploadScope === DatahubPrivacyScope.DAPIL_SHARED
                    ? 'bg-indigo-500/10 border-indigo-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="uploadScope"
                  value={DatahubPrivacyScope.DAPIL_SHARED}
                  checked={uploadScope === DatahubPrivacyScope.DAPIL_SHARED}
                  onChange={(e) => setUploadScope(e.target.value)}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>Berbagi Dapil (Regulasi Publik Satu Daerah)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Perda, APBD atau data daerah yang dapat dirujuk bersama oleh dewan dari dapil yang sama.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
              className="text-xs border-slate-700 text-slate-300"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !uploadFile}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengekstrak & Vektorisasi...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Unggah & Sinkronkan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. MODAL EDIT KLASIFIKASI */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Koreksi Klasifikasi Dokumen & Hak Akses"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Judul Dokumen</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Kategori Dokumen</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Cakupan Hak Akses AI</label>
            <select
              value={editScope}
              onChange={(e) => setEditScope(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="PRIVATE_TENANT">🔒 Rahasia Pribadi (Hanya AI Dewan Pemilik)</option>
              <option value="PARTY_CONFIDENTIAL">🛡️ Internal Fraksi (Rekan Satu Partai)</option>
              <option value="DAPIL_SHARED">🏛️ Berbagi Dapil (Sesama Dewan Satu Daerah)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="text-xs border-slate-700 text-slate-300"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. MODAL DETACH / CABUT KAITAN */}
      <Modal
        isOpen={isDetachModalOpen}
        onClose={() => setIsDetachModalOpen(false)}
        title="Konfirmasi Cabut Kaitan Dokumen"
      >
        <div className="space-y-3 pt-2">
          <p className="text-xs text-slate-300">
            Apakah Anda yakin ingin mencabut kaitan dokumen{' '}
            <strong className="text-white">"{detachingRef?.customTitle || detachingRef?.originalFileName}"</strong>{' '}
            dari tokoh dewan binaan <strong className="text-indigo-400">{detachingRef?.tenantName}</strong>?
          </p>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              Tindakan ini aman: Berkas hanya dilepas dari AI tokoh binaan Anda. Jika dokumen ini digunakan secara bersama oleh fraksi lain atau master regulasi, file fisik tidak akan hilang.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDetachModalOpen(false)}
              className="text-xs border-slate-700 text-slate-300"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleDetachConfirm}
              disabled={isDetaching}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
            >
              {isDetaching ? 'Mencabut...' : 'Ya, Cabut Kaitan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
