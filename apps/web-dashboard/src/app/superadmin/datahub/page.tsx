'use client';

import React, { useEffect, useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Trash2,
  Edit3,
  ShieldCheck,
  Layers,
  FileText,
  Lock,
  HardDrive,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { DatahubCategory, DatahubPrivacyScope, LegislativeLevel } from '@polaris/shared-types';

interface DocumentReference {
  refId: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  customTitle: string;
  dapilCode: string | null;
  partyAffiliation: string | null;
  branchType: string | null;
  legislativeLevel: string | null;
  privacyScope: string;
  categoryTag: string;
  createdAt: string;
}

interface MasterDocumentRow {
  fileId: string;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  contentSha256: string;
  extractionStatus: string;
  totalPages: number;
  createdAt: string;
  chunkCount: number;
  referenceCount: number;
  references: DocumentReference[];
}

export default function SuperadminDatahubPage() {
  const [stats, setStats] = useState<{
    totalFiles: number;
    totalReferences: number;
    totalBytes: number;
    totalPages: number;
    totalChunks: number;
    totalTokens: number;
    deduplicationSavings: number;
  }>({
    totalFiles: 0,
    totalReferences: 0,
    totalBytes: 0,
    totalPages: 0,
    totalChunks: 0,
    totalTokens: 0,
    deduplicationSavings: 0,
  });

  const [documents, setDocuments] = useState<MasterDocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [partyFilter, setPartyFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState('ALL');

  // Edit Modal State
  const [selectedRef, setSelectedRef] = useState<DocumentReference | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    customTitle: string;
    categoryTag: string;
    privacyScope: string;
    partyAffiliation: string;
    dapilCode: string;
    branchType: string;
    legislativeLevel: string;
  }>({
    customTitle: '',
    categoryTag: 'DOKUMEN_INTERNAL',
    privacyScope: 'PRIVATE_TENANT',
    partyAffiliation: '',
    dapilCode: '',
    branchType: 'LEGISLATIF',
    legislativeLevel: 'DPR_RI',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadStats();
    loadDocuments();
  }, [partyFilter, categoryFilter, scopeFilter]);

  async function loadStats() {
    try {
      const res = await AdminApiClient.request<any>('/admin/datahub/stats');
      if (res) {
        setStats(res);
      }
    } catch (err) {
      console.error('Gagal memuat statistik datahub:', err);
    }
  }

  async function loadDocuments() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (partyFilter !== 'ALL') params.append('partyAffiliation', partyFilter);
      if (categoryFilter !== 'ALL') params.append('categoryTag', categoryFilter);
      if (scopeFilter !== 'ALL') params.append('privacyScope', scopeFilter);

      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await AdminApiClient.request<MasterDocumentRow[]>(`/admin/datahub/documents${query}`);
      setDocuments(res || []);
    } catch (err) {
      console.error('Gagal memuat dokumen datahub:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenEdit(ref: DocumentReference) {
    setSelectedRef(ref);
    setEditForm({
      customTitle: ref.customTitle || '',
      categoryTag: ref.categoryTag || 'DOKUMEN_INTERNAL',
      privacyScope: ref.privacyScope || 'PRIVATE_TENANT',
      partyAffiliation: ref.partyAffiliation || '',
      dapilCode: ref.dapilCode || '',
      branchType: ref.branchType || 'LEGISLATIF',
      legislativeLevel: ref.legislativeLevel || 'DPR_RI',
    });
    setIsEditModalOpen(true);
  }

  async function handleSaveClassification() {
    if (!selectedRef) return;
    setUpdating(true);
    try {
      await AdminApiClient.request(`/admin/datahub/references/${selectedRef.refId}`, {
        method: 'PATCH',
        body: JSON.stringify(editForm),
      });
      setIsEditModalOpen(false);
      await loadDocuments();
      await loadStats();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui klasifikasi dokumen.');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteFile(fileId: string, fileName: string) {
    if (
      !confirm(
        `PERINGATAN: Anda yakin ingin menghapus berkas "${fileName}"?\n\nSeluruh potongan teks dan vektor pgvector dari seluruh anggota dewan terkait akan dihapus secara permanen.`
      )
    ) {
      return;
    }

    try {
      await AdminApiClient.request(`/admin/datahub/files/${fileId}`, {
        method: 'DELETE',
      });
      await loadDocuments();
      await loadStats();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus berkas.');
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-400 text-xs font-semibold mb-2">
            <Database className="w-3.5 h-3.5" />
            Control Tower • Master Knowledge Repositories
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Kelola DataHub & Klasifikasi 5 Lapis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
            Pusat kurasi dan tata kelola dokumen seluruh anggota dewan dan pemda se-Indonesia. Atur partisi partai, dapil, tingkat legislatif, dan cakupan privasi RAG.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Berkas Master Fisik</span>
            <HardDrive className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {stats.totalFiles}
            <span className="text-xs font-normal text-slate-400 ml-1.5">file</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Ukuran: {(stats.totalBytes / (1024 * 1024)).toFixed(1)} MB di disk lokal
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Ingestion Dewan</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {stats.totalReferences}
            <span className="text-xs font-normal text-slate-400 ml-1.5">upload</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Diserap dari berbagai fraksi & dapil
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Efisiensi Deduplikasi</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.deduplicationSavings}%
            <span className="text-xs font-normal text-slate-400 ml-1.5">hemat</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Zero-redundancy storage & embedding AI
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Vektor Chunks pgvector</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {stats.totalChunks}
            <span className="text-xs font-normal text-slate-400 ml-1.5">chunks</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {stats.totalTokens.toLocaleString('id-ID')} token aktif di otak AI
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama berkas, hash, dewan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadDocuments()}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Party Filter */}
          <select
            value={partyFilter}
            onChange={(e) => setPartyFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">Semua Partai</option>
            <option value="PDI Perjuangan">PDI Perjuangan</option>
            <option value="Golkar">Golkar</option>
            <option value="Gerindra">Gerindra</option>
            <option value="PKS">PKS</option>
            <option value="NasDem">NasDem</option>
            <option value="PKB">PKB</option>
            <option value="Demokrat">Demokrat</option>
            <option value="PAN">PAN</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">Semua Kategori</option>
            <option value={DatahubCategory.REGULASI_DAERAH}>Regulasi Daerah</option>
            <option value={DatahubCategory.ANGGARAN_APBD}>Anggaran APBD</option>
            <option value={DatahubCategory.NOTULA_SIDANG}>Notula Sidang</option>
            <option value={DatahubCategory.KAJIAN_AKADEMIS}>Kajian Akademis</option>
            <option value={DatahubCategory.ASPIRASI_KONSTITUEN}>Aspirasi Konstituen</option>
            <option value={DatahubCategory.DOKUMEN_INTERNAL}>Dokumen Internal</option>
          </select>

          {/* Scope Filter */}
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">Semua Hak Akses</option>
            <option value={DatahubPrivacyScope.PRIVATE_TENANT}>Privat Akun</option>
            <option value={DatahubPrivacyScope.PARTY_CONFIDENTIAL}>Fraksi Partai</option>
            <option value={DatahubPrivacyScope.DAPIL_SHARED}>Berbagi Dapil</option>
            <option value={DatahubPrivacyScope.PUBLIC_SYSTEM}>Publik Nasional</option>
          </select>

          <Button
            onClick={() => {
              loadDocuments();
              loadStats();
            }}
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Master Documents Table */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">Berkas Master</th>
                <th className="py-3 px-4">Pengunggah & Afiliasi</th>
                <th className="py-3 px-4">Klasifikasi Lapis 5</th>
                <th className="py-3 px-4">pgvector Status</th>
                <th className="py-3 px-4 text-right">Aksi Superadmin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-500" />
                    Memuat data dokumen...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ditemukan berkas dokumen yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.fileId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <FileText className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white leading-snug">
                            {doc.originalFileName}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {(doc.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB • {doc.totalPages} hlm • Hash: {doc.contentSha256.slice(0, 10)}...
                          </p>
                          {doc.referenceCount > 1 && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-600/30 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                              <Sparkles className="w-3 h-3" />
                              Deduplikasi: {doc.referenceCount} Dewan
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        {doc.references?.map((ref, idx) => (
                          <div key={`author-${doc.fileId}-${ref.refId || idx}`} className="text-[11px] leading-tight pb-1 border-b border-slate-100 dark:border-slate-800/50 last:border-none">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {ref.tenantName || 'Dewan Tanpa Nama'}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                              <span className="font-medium text-blue-600 dark:text-blue-400">
                                {ref.partyAffiliation || 'Non-Partai'}
                              </span>
                              <span>•</span>
                              <span>{ref.dapilCode || 'Nasional'}</span>
                              <span>•</span>
                              <span className="text-slate-400 font-mono">{ref.legislativeLevel || 'DPRD'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {doc.references?.map((ref, idx) => (
                        <div key={`class-${doc.fileId}-${ref.refId || idx}`} className="space-y-1 mb-1 last:mb-0">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                            {ref.categoryTag}
                          </span>
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                ref.privacyScope === 'PARTY_CONFIDENTIAL'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/40'
                                  : ref.privacyScope === 'DAPIL_SHARED'
                                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700/40'
                                  : ref.privacyScope === 'PUBLIC_SYSTEM'
                                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-700/40'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <Lock className="w-2.5 h-2.5" />
                              {ref.privacyScope}
                            </span>
                          </div>
                        </div>
                      ))}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            doc.extractionStatus === 'COMPLETED'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {doc.extractionStatus}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {doc.chunkCount} Vektor Chunks
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {doc.references?.[0] && (
                          <button
                            onClick={() => handleOpenEdit(doc.references[0])}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 transition-colors"
                            title="Edit Klasifikasi 5 Lapis"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteFile(doc.fileId, doc.originalFileName)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Hapus Berkas & Vektor Permanen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Classification Modal (5 Layers Governance) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Kurasi & Pengaturan Klasifikasi 5 Lapis"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500 dark:text-slate-400">
            Sebagai Superadmin, Anda dapat mengoreksi partisi wilayah, afiliasi politik, dan cakupan privasi RAG dokumen ini.
          </p>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Judul Referensi Dokumen
            </label>
            <input
              type="text"
              value={editForm.customTitle}
              onChange={(e) => setEditForm({ ...editForm, customTitle: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Lapis 1: Cabang Lembaga */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                1. Cabang Kekuasaan
              </label>
              <select
                value={editForm.branchType}
                onChange={(e) => setEditForm({ ...editForm, branchType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl"
              >
                <option value="LEGISLATIF">LEGISLATIF (Dewan)</option>
                <option value="EKSEKUTIF">EKSEKUTIF (Kepala Daerah / Dinas)</option>
              </select>
            </div>

            {/* Lapis 2: Tingkat Lembaga */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                2. Tingkat Lembaga
              </label>
              <select
                value={editForm.legislativeLevel}
                onChange={(e) => setEditForm({ ...editForm, legislativeLevel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl"
              >
                <option value="DPR_RI">DPR RI (Pusat)</option>
                <option value="DPD_RI">DPD RI</option>
                <option value="DPRD_PROVINSI">DPRD Provinsi</option>
                <option value="DPRD_KABUPATEN_KOTA">DPRD Kabupaten / Kota</option>
                <option value="KEPALA_DAERAH_GUBERNUR">Gubernur (Eksekutif Prov)</option>
                <option value="KEPALA_DAERAH_WALIKOTA_BUPATI">Bupati / Walikota (Eksekutif Daerah)</option>
              </select>
            </div>

            {/* Lapis 3: Dapil */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                3. Kode / Nama Dapil
              </label>
              <input
                type="text"
                placeholder="cth: JABAR-I atau Kab. Bandung"
                value={editForm.dapilCode}
                onChange={(e) => setEditForm({ ...editForm, dapilCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl"
              />
            </div>

            {/* Lapis 4: Partai Politik */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                4. Afiliasi Partai Politik
              </label>
              <input
                type="text"
                placeholder="cth: Golkar, PDIP, Gerindra"
                value={editForm.partyAffiliation}
                onChange={(e) => setEditForm({ ...editForm, partyAffiliation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Lapis 5: Kategori */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                5. Kategori Kebijakan
              </label>
              <select
                value={editForm.categoryTag}
                onChange={(e) => setEditForm({ ...editForm, categoryTag: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl"
              >
                <option value={DatahubCategory.REGULASI_DAERAH}>Regulasi Daerah (Perda/Perbup)</option>
                <option value={DatahubCategory.ANGGARAN_APBD}>Anggaran (APBD/DPA)</option>
                <option value={DatahubCategory.NOTULA_SIDANG}>Notula Rapat Komisi</option>
                <option value={DatahubCategory.KAJIAN_AKADEMIS}>Kajian Akademis / RUU</option>
                <option value={DatahubCategory.ASPIRASI_KONSTITUEN}>Aspirasi Konstituen</option>
                <option value={DatahubCategory.DOKUMEN_INTERNAL}>Dokumen Internal</option>
              </select>
            </div>

            {/* Lapis 5b: Hak Akses AI */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Hak Akses RAG (Privacy Scope)
              </label>
              <select
                value={editForm.privacyScope}
                onChange={(e) => setEditForm({ ...editForm, privacyScope: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl"
              >
                <option value={DatahubPrivacyScope.PRIVATE_TENANT}>🔒 PRIVATE_TENANT (Hanya Pemilik)</option>
                <option value={DatahubPrivacyScope.PARTY_CONFIDENTIAL}>🛡️ PARTY_CONFIDENTIAL (Satu Fraksi)</option>
                <option value={DatahubPrivacyScope.DAPIL_SHARED}>🏛️ DAPIL_SHARED (Satu Dapil)</option>
                <option value={DatahubPrivacyScope.PUBLIC_SYSTEM}>🌐 PUBLIC_SYSTEM (Master Nasional)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
              disabled={updating}
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveClassification}
              disabled={updating}
              className="bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {updating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Klasifikasi'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
