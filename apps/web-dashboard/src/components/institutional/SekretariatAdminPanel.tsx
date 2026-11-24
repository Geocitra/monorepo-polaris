'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  FolderTree,
  Plus,
  UploadCloud,
  Layers,
  UserPlus,
  Trash2,
  FileText,
  Archive,
  RotateCcw,
} from 'lucide-react';
import {
  OrganizationUnitType,
  OrganizationMemberRole,
  OrganizationUnitMemberRole,
  DatahubCategory,
  type OrganizationUnitNodeDto,
  type OrganizationMemberDto,
  type InstitutionalScopedDocumentDto,
} from '@polaris/shared-types';

interface SekretariatAdminPanelProps {
  organizationId: string;
  onHierarchyChanged?: () => Promise<void> | void;
}

export function SekretariatAdminPanel({
  organizationId,
  onHierarchyChanged,
}: SekretariatAdminPanelProps) {
  const { toast } = useToast();
  const officialFileInputRef = useRef<HTMLInputElement>(null);

  const [unitTree, setUnitTree] = useState<OrganizationUnitNodeDto[]>([]);
  const [orgMembers, setOrgMembers] = useState<OrganizationMemberDto[]>([]);
  const [officialDocs, setOfficialDocs] = useState<InstitutionalScopedDocumentDto[]>([]);

  const [newUnitType, setNewUnitType] = useState<OrganizationUnitType>(
    OrganizationUnitType.BIDANG
  );
  const [newUnitParentId, setNewUnitParentId] = useState<string>('');
  const [newUnitCode, setNewUnitCode] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitFocus, setNewUnitFocus] = useState('');
  const [newUnitOpds, setNewUnitOpds] = useState('');

  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberOrgRole, setNewMemberOrgRole] = useState<OrganizationMemberRole>(
    OrganizationMemberRole.MEMBER
  );
  const [newMemberPosition, setNewMemberPosition] = useState('');

  const [assignTenantId, setAssignTenantId] = useState('');
  const [assignTargetUnitId, setAssignTargetUnitId] = useState('');
  const [assignUnitRole, setAssignUnitRole] = useState<OrganizationUnitMemberRole>(
    OrganizationUnitMemberRole.MEMBER
  );

  const [officialDocTitle, setOfficialDocTitle] = useState('');
  const [officialDocCategory, setOfficialDocCategory] = useState<DatahubCategory>(
    DatahubCategory.REGULASI_DAERAH
  );
  const [officialUploading, setOfficialUploading] = useState(false);

  useEffect(() => {
    if (organizationId) {
      loadSekretariatAdminData();
    }
  }, [organizationId]);

  async function loadSekretariatAdminData() {
    try {
      const [tree, members, docs] = await Promise.all([
        ApiClient.request<OrganizationUnitNodeDto[]>(
          `/institutions/${organizationId}/admin/units`
        ),
        ApiClient.request<OrganizationMemberDto[]>(
          `/institutions/${organizationId}/admin/members`
        ),
        ApiClient.request<InstitutionalScopedDocumentDto[]>(
          `/institutions/${organizationId}/admin/documents`
        ),
      ]);
      setUnitTree(tree || []);
      setOrgMembers(members || []);
      setOfficialDocs(docs || []);
    } catch (err: any) {
      toast({
        title: 'Gagal memuat data Sekretariat',
        description: err?.message || 'Pastikan Anda memiliki peran ORG_ADMIN / Sekretariat.',
        type: 'error',
      });
    }
  }

  async function handleCreateUnit() {
    if (!newUnitCode.trim() || !newUnitName.trim()) return;
    try {
      await ApiClient.request(`/institutions/${organizationId}/admin/units`, {
        method: 'POST',
        body: JSON.stringify({
          parentUnitId: newUnitParentId || null,
          unitType: newUnitType,
          code: newUnitCode.trim(),
          name: newUnitName.trim(),
          focusSectors: newUnitFocus
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          partnerOpds: newUnitOpds
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      setNewUnitCode('');
      setNewUnitName('');
      setNewUnitFocus('');
      setNewUnitOpds('');
      await Promise.all([loadSekretariatAdminData(), onHierarchyChanged?.()]);
      toast({
        title: 'Unit / Bidang Berhasil Dibuat',
        description: 'Struktur organisasi instansi berhasil diperbarui.',
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal membuat Unit/Bidang', description: err?.message, type: 'error' });
    }
  }

  async function handleToggleUnitActive(unit: OrganizationUnitNodeDto) {
    try {
      await ApiClient.request(`/institutions/${organizationId}/admin/units/${unit.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !unit.isActive }),
      });
      await Promise.all([loadSekretariatAdminData(), onHierarchyChanged?.()]);
      toast({
        title: unit.isActive ? 'Unit/Bidang Diarsipkan' : 'Unit/Bidang Diaktifkan Kembali',
        description: `${unit.name} (${unit.code}) kini berstatus ${unit.isActive ? 'ARSIP' : 'AKTIF'}.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal memperbarui status Unit/Bidang', description: err?.message, type: 'error' });
    }
  }

  async function handleAddOrgMember() {
    if (!newMemberEmail.trim()) return;
    try {
      await ApiClient.request(`/institutions/${organizationId}/admin/members`, {
        method: 'POST',
        body: JSON.stringify({
          email: newMemberEmail.trim(),
          orgRole: newMemberOrgRole,
          titleOrPosition: newMemberPosition.trim() || undefined,
        }),
      });
      setNewMemberEmail('');
      setNewMemberPosition('');
      await loadSekretariatAdminData();
      toast({
        title: 'Anggota Terdaftar di Instansi',
        description: 'Akun berhasil ditambahkan ke keanggotaan instansi.',
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal mendaftarkan anggota', description: err?.message, type: 'error' });
    }
  }

  async function handleAssignMemberToUnit() {
    if (!assignTargetUnitId || !assignTenantId) return;
    try {
      await ApiClient.request(
        `/institutions/${organizationId}/admin/units/${assignTargetUnitId}/members`,
        {
          method: 'POST',
          body: JSON.stringify({
            tenantId: assignTenantId,
            unitRole: assignUnitRole,
          }),
        }
      );
      await Promise.all([loadSekretariatAdminData(), onHierarchyChanged?.()]);
      toast({
        title: 'Penugasan Bidang Berhasil',
        description: 'Anggota kini memiliki akses AI terisolasi pada Bidang tersebut.',
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal menugaskan anggota', description: err?.message, type: 'error' });
    }
  }

  async function handleRevokeUnitMember(unitId: string, tenantId: string) {
    try {
      await ApiClient.request(
        `/institutions/${organizationId}/admin/units/${unitId}/members/${tenantId}`,
        { method: 'DELETE' }
      );
      await Promise.all([loadSekretariatAdminData(), onHierarchyChanged?.()]);
      toast({
        title: 'Akses Bidang Dicabut',
        description: 'Keanggotaan pengguna pada Bidang tersebut telah dinonaktifkan.',
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal mencabut akses', description: err?.message, type: 'error' });
    }
  }

  async function handleUploadOfficialDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOfficialUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (officialDocTitle.trim()) formData.append('customTitle', officialDocTitle.trim());
      formData.append('categoryTag', officialDocCategory);

      await ApiClient.uploadFormData(`/institutions/${organizationId}/admin/documents`, formData);
      setOfficialDocTitle('');
      await Promise.all([loadSekretariatAdminData(), onHierarchyChanged?.()]);
      toast({
        title: 'Dokumen Resmi Sekretariat (ORG_SHARED) Terpublikasi',
        description: 'Seluruh AI Bidang di dalam Instansi ini kini dapat merujuk dokumen tersebut.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal mengunggah dokumen resmi',
        description: err?.message,
        type: 'error',
      });
    } finally {
      setOfficialUploading(false);
      if (officialFileInputRef.current) officialFileInputRef.current.value = '';
    }
  }

  function flattenUnits(nodes: OrganizationUnitNodeDto[]): OrganizationUnitNodeDto[] {
    const out: OrganizationUnitNodeDto[] = [];
    for (const n of nodes) {
      out.push(n);
      if (n.children && n.children.length > 0) {
        out.push(...flattenUnits(n.children));
      }
    }
    return out;
  }

  const flatUnitOptions = flattenUnits(unitTree);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* KOLOM 1: BUAT UNIT & UPLOAD DOKUMEN RESMI */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-extrabold">
              1. Buat Kelompok AKD / Fraksi / Komisi / Bidang
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold mb-1">Jenis Unit / Kelompok</label>
              <select
                value={newUnitType}
                onChange={(e) => setNewUnitType(e.target.value as OrganizationUnitType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                {Object.values(OrganizationUnitType).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">
                Induk Kelompok (Kosongkan jika AKD/Fraksi/Komisi Utama)
              </label>
              <select
                value={newUnitParentId}
                onChange={(e) => setNewUnitParentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                <option value="">-- Tingkat Utama (Tanpa Induk) --</option>
                {flatUnitOptions
                  .filter((u) => u.isActive)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.unitType}] {u.name} ({u.code})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1">Kode Unit</label>
                <input
                  type="text"
                  placeholder="KOM3-BID-INFRA"
                  value={newUnitCode}
                  onChange={(e) => setNewUnitCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Nama Unit / Bidang</label>
                <input
                  type="text"
                  placeholder="Bidang Infrastruktur"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">Fokus Urusan (pisahkan koma)</label>
              <input
                type="text"
                placeholder="Pekerjaan Umum, Air Minum, Perhubungan"
                value={newUnitFocus}
                onChange={(e) => setNewUnitFocus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Mitra OPD (pisahkan koma)</label>
              <input
                type="text"
                placeholder="Dinas PUPR, Bappeda, PDAM"
                value={newUnitOpds}
                onChange={(e) => setNewUnitOpds(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <Button onClick={handleCreateUnit} className="w-full">
              <Plus className="h-4 w-4 mr-1.5" />
              Tambah Unit / Bidang
            </Button>
          </div>
        </div>

        {/* UPLOAD DOKUMEN RESMI SEKRETARIAT (ORG_SHARED) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-extrabold">
              2. Registrasi Dokumen Resmi Sekretariat (ORG_SHARED)
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Dokumen resmi yang diunggah di sini (LKPJ, RPJMD, RKPD, APBD, Tata Tertib) otomatis dapat diakses oleh AI di seluruh Bidang dalam Instansi ini.
          </p>
          <div className="space-y-3 text-xs">
            <input
              type="text"
              placeholder="Judul Dokumen Resmi (misal: LKPJ Tahun Anggaran 2025)"
              value={officialDocTitle}
              onChange={(e) => setOfficialDocTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
            <select
              value={officialDocCategory}
              onChange={(e) => setOfficialDocCategory(e.target.value as DatahubCategory)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            >
              {Object.values(DatahubCategory).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              ref={officialFileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md,.csv"
              onChange={handleUploadOfficialDoc}
              className="hidden"
            />
            <Button
              onClick={() => officialFileInputRef.current?.click()}
              disabled={officialUploading}
              className="w-full"
            >
              <UploadCloud className="h-4 w-4 mr-1.5" />
              {officialUploading
                ? 'Mengekstrak & Mengindeks Vektor...'
                : 'Pilih & Unggah Dokumen Resmi Instansi'}
            </Button>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-xs font-extrabold text-slate-500 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-emerald-500" />
              Dokumen Resmi ORG_SHARED Terpublikasi ({officialDocs.length})
            </div>
            {officialDocs.length === 0 ? (
              <p className="text-[11px] text-slate-400">
                Belum ada dokumen resmi Instansi yang diunggah Sekretariat.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {officialDocs.map((doc) => (
                  <div
                    key={doc.refId}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-0.5"
                  >
                    <div className="font-bold truncate">{doc.title}</div>
                    <div className="text-slate-400">
                      {doc.categoryTag} &bull; {doc.chunkCount} chunk &bull;{' '}
                      {(doc.fileSizeBytes / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KOLOM 2 & 3: POHON HIERARKI UNIT/BIDANG & PENUGASAN USER */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-4">
          <h3 className="text-sm font-extrabold flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-500" />
            Struktur Hierarki Kelompok (Banggar, Fraksi, Komisi, Panja &rarr; Bidang)
          </h3>
          {unitTree.length === 0 ? (
            <p className="text-xs text-slate-500">
              Belum ada Unit/Bidang. Buat kelompok pertama di panel kiri.
            </p>
          ) : (
            <div className="space-y-3">
              {unitTree.map((rootNode) => (
                <div
                  key={rootNode.id}
                  className={`rounded-xl border p-3.5 ${
                    rootNode.isActive
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40'
                      : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 opacity-75'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 mr-2">
                        {rootNode.unitType}
                      </span>
                      <span className="font-extrabold text-sm">{rootNode.name}</span>
                      <span className="text-xs text-slate-400 ml-2">({rootNode.code})</span>
                      {!rootNode.isActive && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800">
                          DIARSIPKAN
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                      <span>
                        {rootNode.memberCount} Anggota &bull; {rootNode.documentCount} Dokumen
                      </span>
                      <button
                        onClick={() => handleToggleUnitActive(rootNode)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold cursor-pointer"
                        title={rootNode.isActive ? 'Arsipkan unit ini' : 'Aktifkan kembali unit ini'}
                      >
                        {rootNode.isActive ? (
                          <>
                            <Archive className="h-3 w-3 text-amber-600" /> Arsipkan
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-3 w-3 text-emerald-600" /> Pulihkan
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {rootNode.children && rootNode.children.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-indigo-300 dark:border-indigo-800 space-y-2">
                      {rootNode.children.map((child) => (
                        <div
                          key={child.id}
                          className={`flex flex-wrap items-center justify-between gap-2 text-xs p-2.5 rounded-lg border ${
                            child.isActive
                              ? 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800'
                              : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 opacity-75'
                          }`}
                        >
                          <div>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mr-2">
                              {child.unitType}
                            </span>
                            <span className="font-bold">{child.name}</span>
                            <span className="text-slate-400 ml-1.5">({child.code})</span>
                            {!child.isActive && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800">
                                ARSIP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>
                              {child.memberCount} Anggota &bull; {child.documentCount} Dokumen
                            </span>
                            <button
                              onClick={() => handleToggleUnitActive(child)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                            >
                              {child.isActive ? 'Arsipkan' : 'Pulihkan'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* KELOLA ANGGOTA INSTANSI & PENUGASAN KE BIDANG */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-4">
          <h3 className="text-sm font-extrabold flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-indigo-500" />
            Registrasi Anggota ke Instansi & Penugasan ke Bidang
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="font-extrabold">A. Daftarkan Akun Pengguna ke Instansi</div>
              <input
                type="email"
                placeholder="Email Akun Polaris (misal: anggota@dprd.go.id)"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
              <select
                value={newMemberOrgRole}
                onChange={(e) => setNewMemberOrgRole(e.target.value as OrganizationMemberRole)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                {Object.values(OrganizationMemberRole).map((r) => (
                  <option key={r} value={r}>
                    Peran Instansi: {r}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Jabatan (misal: Anggota Komisi III / Tenaga Ahli)"
                value={newMemberPosition}
                onChange={(e) => setNewMemberPosition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
              <Button onClick={handleAddOrgMember} className="w-full">
                Daftarkan ke Instansi
              </Button>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="font-extrabold">B. Tugaskan Anggota ke Unit / Bidang</div>
              <select
                value={assignTenantId}
                onChange={(e) => setAssignTenantId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                <option value="">-- Pilih Anggota Instansi --</option>
                {orgMembers.map((m) => (
                  <option key={m.tenantId} value={m.tenantId}>
                    {m.fullName} ({m.email})
                  </option>
                ))}
              </select>
              <select
                value={assignTargetUnitId}
                onChange={(e) => setAssignTargetUnitId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                <option value="">-- Pilih Target Unit / Bidang --</option>
                {flatUnitOptions
                  .filter((u) => u.isActive)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.unitType}] {u.name} ({u.code})
                    </option>
                  ))}
              </select>
              <select
                value={assignUnitRole}
                onChange={(e) =>
                  setAssignUnitRole(e.target.value as OrganizationUnitMemberRole)
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                {Object.values(OrganizationUnitMemberRole).map((r) => (
                  <option key={r} value={r}>
                    Peran Bidang: {r}
                  </option>
                ))}
              </select>
              <Button onClick={handleAssignMemberToUnit} className="w-full">
                Tugaskan ke Bidang
              </Button>
            </div>
          </div>

          <div className="pt-3 space-y-2">
            <div className="text-xs font-extrabold text-slate-500">
              Daftar Anggota Instansi & Akses Bidang ({orgMembers.length})
            </div>
            {orgMembers.map((m) => (
              <div
                key={m.membershipId}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-bold">
                    {m.fullName} <span className="text-slate-400 font-normal">({m.email})</span>
                    <span className="ml-2 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold">
                      {m.orgRole}
                    </span>
                  </div>
                  {m.titleOrPosition && (
                    <div className="text-[11px] text-slate-500">{m.titleOrPosition}</div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {m.assignedUnits.map((au) => (
                    <span
                      key={au.unitId}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold"
                    >
                      {au.parentUnitName ? `${au.parentUnitName} → ` : ''}
                      {au.unitName} ({au.unitRole})
                      <button
                        onClick={() => handleRevokeUnitMember(au.unitId, m.tenantId)}
                        title="Cabut dari Bidang ini"
                        className="ml-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
