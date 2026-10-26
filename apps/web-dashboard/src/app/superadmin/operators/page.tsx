'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AdminApiClient } from '@/lib/api-client';
import {
  UserCheck,
  UserPlus,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Link as LinkIcon,
  RefreshCw,
  Edit,
  Trash2,
  Users,
  Activity,
  Layers,
  KeyRound,
  ExternalLink,
  ChevronRight,
  UserMinus,
  Sparkles,
} from 'lucide-react';

interface OperatorRow {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  activeAssignmentsCount: number;
  lastLoginAt: string | null;
  createdAt: string;
}

interface TenantItem {
  id: string;
  fullName: string;
  partyAffiliation: string | null;
  customDapilName: string | null;
  legislativeLevel: string | null;
  photoUrl: string | null;
  username: string | null;
}

interface AssignmentDetail {
  id: string;
  tenantId: string;
  status: 'ACTIVE' | 'REVOKED';
  canDirectPublish: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  tenantFullName: string;
  partyAffiliation: string | null;
  customDapilName: string | null;
  legislativeLevel: string | null;
  photoUrl: string | null;
}

export default function SuperadminOperatorsPage() {
  const [operators, setOperators] = useState<OperatorRow[]>([]);
  const [tenantsList, setTenantsList] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected Operator
  const [selectedOperator, setSelectedOperator] = useState<OperatorRow | null>(null);
  const [selectedAssignments, setSelectedAssignments] = useState<AssignmentDetail[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Create form
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Edit form
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Assign form
  const [assignTenantId, setAssignTenantId] = useState('');
  const [canDirectPublish, setCanDirectPublish] = useState(false);
  const [assignNotes, setAssignNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [opsRes, tenantsRes] = await Promise.all([
        AdminApiClient.request<OperatorRow[]>('/operator/admin/list'),
        AdminApiClient.request<TenantItem[]>('/operator/admin/tenants-list').catch(() => []),
      ]);
      setOperators(opsRes || []);
      setTenantsList(tenantsRes || []);
    } catch (err) {
      console.error('Gagal memuat data operator:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOperatorAssignments = async (operatorId: string) => {
    try {
      setLoadingAssignments(true);
      const res = await AdminApiClient.request<{
        operator: OperatorRow;
        assignments: AssignmentDetail[];
      }>(`/operator/admin/${operatorId}`);
      setSelectedAssignments(res?.assignments || []);
    } catch (err) {
      console.error('Gagal mengambil detail penugasan operator:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // 1. CREATE OPERATOR
  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newFullName || !newPassword) return;

    setSubmitting(true);
    try {
      await AdminApiClient.request('/operator/admin/create-account', {
        method: 'POST',
        body: JSON.stringify({
          email: newEmail.trim(),
          fullName: newFullName.trim(),
          password: newPassword,
        }),
      });

      alert('Akun operator berhasil dibuat.');
      setIsCreateModalOpen(false);
      setNewEmail('');
      setNewFullName('');
      setNewPassword('');
      loadData();
    } catch (err: any) {
      alert(`Gagal membuat operator: ${err.message || 'Kesalahan sistem'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. OPEN EDIT MODAL
  const openEditModal = (op: OperatorRow) => {
    setSelectedOperator(op);
    setEditFullName(op.fullName);
    setEditEmail(op.email);
    setEditPassword('');
    setEditIsActive(op.isActive);
    setIsEditModalOpen(true);
  };

  // 3. SUBMIT EDIT OPERATOR
  const handleEditOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOperator) return;

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        fullName: editFullName.trim(),
        email: editEmail.trim(),
        isActive: editIsActive,
      };
      if (editPassword && editPassword.trim().length >= 6) {
        payload.password = editPassword.trim();
      }

      await AdminApiClient.request(`/operator/admin/${selectedOperator.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      alert('Data operator berhasil diperbarui.');
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(`Gagal memperbarui operator: ${err.message || 'Kesalahan sistem'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. OPEN ASSIGN MODAL
  const openAssignModal = (op: OperatorRow) => {
    setSelectedOperator(op);
    setAssignTenantId(tenantsList[0]?.id || '');
    setCanDirectPublish(false);
    setAssignNotes('');
    setIsAssignModalOpen(true);
  };

  // 5. SUBMIT ASSIGN TENANT
  const handleAssignTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOperator || !assignTenantId) return;

    setSubmitting(true);
    try {
      await AdminApiClient.request('/operator/admin/assign', {
        method: 'POST',
        body: JSON.stringify({
          operatorId: selectedOperator.id,
          tenantId: assignTenantId,
          canDirectPublish,
          notes: assignNotes.trim() || undefined,
        }),
      });

      alert('Tokoh dewan berhasil ditugaskan ke operator.');
      setIsAssignModalOpen(false);
      loadData();
      if (isDetailModalOpen && selectedOperator) {
        loadOperatorAssignments(selectedOperator.id);
      }
    } catch (err: any) {
      alert(`Gagal menugaskan dewan: ${err.message || 'Kesalahan sistem'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 6. OPEN DETAIL / MANAGE ASSIGNMENTS MODAL
  const openDetailModal = (op: OperatorRow) => {
    setSelectedOperator(op);
    setIsDetailModalOpen(true);
    loadOperatorAssignments(op.id);
  };

  // 7. UNASSIGN / REVOKE DEWAN
  const handleRevokeAssignment = async (tenantId: string) => {
    if (!selectedOperator) return;
    if (!confirm('Apakah Anda yakin ingin mencabut penugasan dewan ini dari operator?')) return;

    try {
      await AdminApiClient.request('/operator/admin/unassign', {
        method: 'POST',
        body: JSON.stringify({
          operatorId: selectedOperator.id,
          tenantId,
        }),
      });
      alert('Akses penugasan dewan berhasil dicabut.');
      loadOperatorAssignments(selectedOperator.id);
      loadData();
    } catch (err: any) {
      alert(`Gagal mencabut penugasan: ${err.message || 'Kesalahan sistem'}`);
    }
  };

  // 8. OPEN DELETE MODAL
  const openDeleteModal = (op: OperatorRow) => {
    setSelectedOperator(op);
    setIsDeleteModalOpen(true);
  };

  // 9. SUBMIT DELETE OPERATOR
  const handleDeleteOperator = async () => {
    if (!selectedOperator) return;

    setSubmitting(true);
    try {
      await AdminApiClient.request(`/operator/admin/${selectedOperator.id}`, {
        method: 'DELETE',
      });
      alert('Akun operator berhasil dihapus.');
      setIsDeleteModalOpen(false);
      setSelectedOperator(null);
      loadData();
    } catch (err: any) {
      alert(`Gagal menghapus operator: ${err.message || 'Kesalahan sistem'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics KPI
  const stats = useMemo(() => {
    const total = operators.length;
    const active = operators.filter((o) => o.isActive).length;
    const totalAssignments = operators.reduce((acc, curr) => acc + curr.activeAssignmentsCount, 0);
    const avgCapacity = total > 0 ? (totalAssignments / total).toFixed(1) : '0';
    return { total, active, totalAssignments, avgCapacity };
  }, [operators]);

  // Filtered operators
  const filteredOperators = useMemo(() => {
    return operators.filter((op) => {
      const matchSearch =
        op.fullName.toLowerCase().includes(search.toLowerCase()) ||
        op.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ACTIVE'
          ? op.isActive
          : !op.isActive;
      return matchSearch && matchStatus;
    });
  }, [operators, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Manajemen Tim Operator Konten Polaris
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pusat kendali CRUD akun staf operasional dan distribusi anggota dewan binaan (Managed Service 1:25).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Operator Baru</span>
          </button>
        </div>
      </div>

      {/* 2. STATS KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Staf Operator</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
          <span className="text-[11px] text-slate-400">Tim Internal Polaris</span>
        </div>

        <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Operator Aktif</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.active}
            <span className="text-xs font-normal text-slate-400 ml-1">/ {stats.total}</span>
          </div>
          <span className="text-[11px] text-slate-400">Siap melayani dewan</span>
        </div>

        <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Dewan Binaan</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalAssignments}
            <span className="text-xs font-normal text-slate-400 ml-1">Tokoh</span>
          </div>
          <span className="text-[11px] text-slate-400">Terdistribusi ke operator</span>
        </div>

        <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium">Beban Rata-rata</span>
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.avgCapacity}
            <span className="text-xs font-normal text-slate-400 ml-1">/ 25</span>
          </div>
          <span className="text-[11px] text-slate-400">Rasio Tokoh per Operator</span>
        </div>
      </div>

      {/* 3. FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama operator atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Semua ({operators.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Aktif ({operators.filter((o) => o.isActive).length})
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                statusFilter === 'INACTIVE'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Nonaktif ({operators.filter((o) => !o.isActive).length})
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. OPERATORS TABLE (FULL CRUD ACTIONS) */}
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Role Sistem</th>
                <th className="py-3.5 px-4 text-center">Binaan Dewan</th>
                <th className="py-3.5 px-4">Status Akun</th>
                <th className="py-3.5 px-4">Terakhir Login</th>
                <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Memuat data operator...
                  </td>
                </tr>
              ) : filteredOperators.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Tidak ada operator yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredOperators.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {op.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{op.fullName}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {op.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        {op.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openDetailModal(op)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 text-xs transition"
                        title="Klik untuk melihat & kelola daftar dewan binaan"
                      >
                        <span>{op.activeAssignmentsCount} Tokoh</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      {op.isActive ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-rose-500 font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Ditangguhkan</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {op.lastLoginAt ? new Date(op.lastLoginAt).toLocaleString('id-ID') : 'Belum pernah'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Assign Dewan Button */}
                        <button
                          onClick={() => openAssignModal(op)}
                          className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                          title="Tugaskan Tokoh Dewan Baru"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Operator */}
                        <button
                          onClick={() => openEditModal(op)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                          title="Edit Profil & Password"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Operator */}
                        <button
                          onClick={() => openDeleteModal(op)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
                          title="Hapus Akun Operator"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* =========================================================================
          MODAL 1: TAMBAH OPERATOR (CREATE)
      ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B0F19] rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Staf Operator Baru
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Buat akun operator internal untuk mengelola konten dan aspirasi para tokoh anggota dewan.
            </p>

            <form onSubmit={handleCreateOperator} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Misal: Budi Pratama"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Login
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="operator.budi@polaris.id"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password Sementara
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Operator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EDIT OPERATOR (UPDATE)
      ========================================================================= */}
      {isEditModalOpen && selectedOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B0F19] rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Data Operator: {selectedOperator.fullName}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perbarui profil, reset password, atau ubah status keaktifan akun.
            </p>

            <form onSubmit={handleEditOperator} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Akun
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reset Password Baru (Opsional)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="editIsActive" className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  Akun Aktif (Dapat Login & Mengelola Tokoh Dewan)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Perbarui Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: TUGASKAN DEWAN (ASSIGN WITH DROPDOWN)
      ========================================================================= */}
      {isAssignModalOpen && selectedOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B0F19] rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tugaskan Dewan ke {selectedOperator.fullName}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih tokoh anggota dewan yang akan dikelola konten dan aspirasinya oleh operator ini.
            </p>

            <form onSubmit={handleAssignTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Anggota Dewan
                </label>
                {tenantsList.length === 0 ? (
                  <p className="text-xs text-amber-500">
                    Tidak ada data dewan aktif. Pastikan data tenant anggota dewan sudah terdaftar.
                  </p>
                ) : (
                  <select
                    value={assignTenantId}
                    onChange={(e) => setAssignTenantId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {tenantsList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.partyAffiliation || 'Non-Partai'}) - {t.customDapilName || t.legislativeLevel || 'Dapil Umum'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Penugasan Khusus (Opsional)
                </label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Misal: Penugasan khusus rilis kampanye pilkada"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canDirectPublish}
                    onChange={(e) => setCanDirectPublish(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                  />
                  <div>
                    <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                      Izinkan Publikasi Langsung (Direct Publish)
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Bila dicentang, operator dapat langsung menerbitkan artikel tanpa menunggu approval manual dari dewan.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !assignTenantId}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? 'Menugaskan...' : 'Tugaskan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: DETAIL & MANAJEMEN PENUGASAN (READ / REVOKE)
      ========================================================================= */}
      {isDetailModalOpen && selectedOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B0F19] rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Daftar Dewan Binaan: {selectedOperator.fullName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedAssignments.length} tokoh dewan yang pernah atau sedang ditugaskan.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openAssignModal(selectedOperator);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <LinkIcon className="w-3 h-3" />
                <span>+ Tambah Dewan</span>
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {loadingAssignments ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Mengambil daftar penugasan...
                </div>
              ) : selectedAssignments.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Belum ada dewan yang ditugaskan ke operator ini.
                </div>
              ) : (
                selectedAssignments.map((a) => (
                  <div key={a.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs">
                        {a.tenantFullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-slate-900 dark:text-white text-xs">
                            {a.tenantFullName}
                          </p>
                          <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-indigo-500/10 text-indigo-500">
                            {a.partyAffiliation || 'Independen'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {a.customDapilName || a.legislativeLevel || 'Dapil Umum'} • Ditugaskan{' '}
                          {new Date(a.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {a.status === 'ACTIVE' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-500">
                          Dicabut
                        </span>
                      )}

                      {a.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRevokeAssignment(a.tenantId)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                          title="Cabut Akses Penugasan"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Cabut</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: KONFIRMASI HAPUS (DELETE)
      ========================================================================= */}
      {isDeleteModalOpen && selectedOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B0F19] rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hapus Akun Operator?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Akun <strong>{selectedOperator.fullName}</strong> ({selectedOperator.email}) dan seluruh hak penugasan dewan binaannya akan dihapus secara permanen.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteOperator}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {submitting ? 'Menghapus...' : 'Ya, Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
