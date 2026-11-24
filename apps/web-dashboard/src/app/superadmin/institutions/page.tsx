'use client';

import { useState, useEffect } from 'react';
import { AdminApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  Building2,
  Plus,
  Users,
  Cpu,
  HardDrive,
  FileText,
  Layers,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Edit3,
  FileCheck2,
} from 'lucide-react';
import {
  LegislativeLevel,
  OrganizationStatus,
  OrganizationContractStatus,
  OrganizationMemberRole,
  type SuperadminInstitutionSummaryDto,
  type SuperadminInstitutionDetailDto,
} from '@polaris/shared-types';

export default function SuperadminInstitutionsPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState<SuperadminInstitutionSummaryDto[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [selectedDetail, setSelectedDetail] = useState<SuperadminInstitutionDetailDto | null>(null);

  // Form Create Institution + B2G Contract
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [legislativeLevel, setLegislativeLevel] = useState<LegislativeLevel>(
    LegislativeLevel.DPRD_KABUPATEN_KOTA
  );
  const [regionName, setRegionName] = useState('');
  const [provinceName, setProvinceName] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [fiscalYear, setFiscalYear] = useState<number>(2026);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [maxSeats, setMaxSeats] = useState<number>(60);
  const [annualTokenPoolLimit, setAnnualTokenPoolLimit] = useState<number>(50000000);
  const [contractValueIdr, setContractValueIdr] = useState<number>(250000000);
  const [creating, setCreating] = useState(false);

  // Assign ORG_ADMIN (Sekretariat) Form
  const [adminEmail, setAdminEmail] = useState('');
  const [assigningAdmin, setAssigningAdmin] = useState(false);

  // Edit Institution Form (PATCH /superadmin/institutions/:orgId)
  const [showEditOrg, setShowEditOrg] = useState(false);
  const [editOrgName, setEditOrgName] = useState('');
  const [editOrgRegion, setEditOrgRegion] = useState('');
  const [editOrgProvince, setEditOrgProvince] = useState('');
  const [editOrgStatus, setEditOrgStatus] = useState<OrganizationStatus>(OrganizationStatus.ACTIVE);
  const [savingOrg, setSavingOrg] = useState(false);

  // Upsert / Renew B2G Contract Form (POST /superadmin/institutions/:orgId/contracts)
  const [showContractForm, setShowContractForm] = useState(false);
  const [cNumber, setCNumber] = useState('');
  const [cFiscalYear, setCFiscalYear] = useState<number>(2026);
  const [cStatus, setCStatus] = useState<OrganizationContractStatus>(
    OrganizationContractStatus.ACTIVE
  );
  const [cStartDate, setCStartDate] = useState('2026-01-01');
  const [cEndDate, setCEndDate] = useState('2026-12-31');
  const [cMaxSeats, setCMaxSeats] = useState<number>(60);
  const [cMaxStorageGb, setCMaxStorageGb] = useState<number>(10);
  const [cTokenPool, setCTokenPool] = useState<number>(50000000);
  const [cValueIdr, setCValueIdr] = useState<number>(250000000);
  const [cNotes, setCNotes] = useState('');
  const [savingContract, setSavingContract] = useState(false);

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      loadInstitutionDetail(selectedOrgId);
    }
  }, [selectedOrgId]);

  useEffect(() => {
    if (selectedDetail) {
      setEditOrgName(selectedDetail.organization.name);
      setEditOrgRegion(selectedDetail.organization.regionName);
      setEditOrgProvince(selectedDetail.organization.provinceName);
      setEditOrgStatus(selectedDetail.organization.status);
      if (selectedDetail.activeContract) {
        setCNumber(selectedDetail.activeContract.contractNumber);
        setCFiscalYear(selectedDetail.activeContract.fiscalYear);
        setCStatus(selectedDetail.activeContract.status);
        setCStartDate(selectedDetail.activeContract.startDate.slice(0, 10));
        setCEndDate(selectedDetail.activeContract.endDate.slice(0, 10));
        setCMaxSeats(selectedDetail.activeContract.maxSeats);
        setCMaxStorageGb(
          Math.max(1, Math.round(selectedDetail.activeContract.maxStorageBytes / 1073741824))
        );
        setCTokenPool(selectedDetail.activeContract.annualTokenPoolLimit);
        setCValueIdr(selectedDetail.activeContract.contractValueIdr);
        setCNotes(selectedDetail.activeContract.notes || '');
      }
    }
  }, [selectedDetail]);

  async function loadInstitutions() {
    setLoading(true);
    try {
      const list = await AdminApiClient.request<SuperadminInstitutionSummaryDto[]>(
        '/superadmin/institutions'
      );
      setInstitutions(list || []);
      if (list && list.length > 0 && !selectedOrgId) {
        setSelectedOrgId(list[0].organization.id);
      }
    } catch (err: any) {
      toast({
        title: 'Gagal memuat daftar Instansi',
        description: err?.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadInstitutionDetail(orgId: string) {
    try {
      const detail = await AdminApiClient.request<SuperadminInstitutionDetailDto>(
        `/superadmin/institutions/${orgId}`
      );
      setSelectedDetail(detail);
    } catch (err: any) {
      toast({
        title: 'Gagal memuat detail Instansi',
        description: err?.message,
        type: 'error',
      });
    }
  }

  async function handleCreateInstitution() {
    if (!code.trim() || !name.trim() || !regionName.trim() || !contractNumber.trim()) {
      toast({
        title: 'Data belum lengkap',
        description: 'Harap lengkapi Kode, Nama Instansi, Wilayah, dan Nomor Kontrak B2G.',
        type: 'error',
      });
      return;
    }

    setCreating(true);
    try {
      const created = await AdminApiClient.request<SuperadminInstitutionDetailDto>(
        '/superadmin/institutions',
        {
          method: 'POST',
          body: JSON.stringify({
            code: code.trim(),
            name: name.trim(),
            legislativeLevel,
            regionName: regionName.trim(),
            provinceName: provinceName.trim() || regionName.trim(),
            contractNumber: contractNumber.trim(),
            fiscalYear: Number(fiscalYear),
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            maxSeats: Number(maxSeats),
            annualTokenPoolLimit: Number(annualTokenPoolLimit),
            contractValueIdr: Number(contractValueIdr),
          }),
        }
      );
      setShowCreateForm(false);
      setCode('');
      setName('');
      setContractNumber('');
      await loadInstitutions();
      setSelectedOrgId(created.organization.id);
      setSelectedDetail(created);
      toast({
        title: 'Instansi & Kontrak B2G Berhasil Dibuat',
        description: `${created.organization.name} telah aktif dan siap digunakan.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal membuat Instansi',
        description: err?.message,
        type: 'error',
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleAssignOrgAdmin() {
    if (!selectedOrgId || !adminEmail.trim()) return;
    setAssigningAdmin(true);
    try {
      await AdminApiClient.request(`/superadmin/institutions/${selectedOrgId}/admins`, {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail.trim(),
          orgRole: OrganizationMemberRole.ORG_ADMIN,
          titleOrPosition: 'Admin Instansi / Sekretariat DPRD',
        }),
      });
      setAdminEmail('');
      await Promise.all([loadInstitutionDetail(selectedOrgId), loadInstitutions()]);
      toast({
        title: 'Admin Instansi / Sekretariat Ditetapkan',
        description: 'Akun tersebut kini dapat mengelola struktur AKD, Bidang, dan dokumen resmi instansi.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal menetapkan Admin Instansi',
        description: err?.message,
        type: 'error',
      });
    } finally {
      setAssigningAdmin(false);
    }
  }

  async function handleUpdateInstitution() {
    if (!selectedOrgId || !editOrgName.trim()) return;
    setSavingOrg(true);
    try {
      await AdminApiClient.request(`/superadmin/institutions/${selectedOrgId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editOrgName.trim(),
          regionName: editOrgRegion.trim(),
          provinceName: editOrgProvince.trim(),
          status: editOrgStatus,
        }),
      });
      setShowEditOrg(false);
      await Promise.all([loadInstitutionDetail(selectedOrgId), loadInstitutions()]);
      toast({
        title: 'Profil Instansi Diperbarui',
        description: `Status Instansi saat ini: ${editOrgStatus}.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal memperbarui Instansi',
        description: err?.message,
        type: 'error',
      });
    } finally {
      setSavingOrg(false);
    }
  }

  async function handleUpsertContract() {
    if (!selectedOrgId || !cNumber.trim()) return;
    setSavingContract(true);
    try {
      await AdminApiClient.request(`/superadmin/institutions/${selectedOrgId}/contracts`, {
        method: 'POST',
        body: JSON.stringify({
          contractNumber: cNumber.trim(),
          fiscalYear: Number(cFiscalYear),
          status: cStatus,
          startDate: new Date(cStartDate).toISOString(),
          endDate: new Date(cEndDate).toISOString(),
          maxSeats: Number(cMaxSeats),
          maxStorageBytes: Math.max(1000000, Number(cMaxStorageGb) * 1073741824),
          annualTokenPoolLimit: Number(cTokenPool),
          contractValueIdr: Number(cValueIdr),
          notes: cNotes.trim() || undefined,
        }),
      });
      setShowContractForm(false);
      await Promise.all([loadInstitutionDetail(selectedOrgId), loadInstitutions()]);
      toast({
        title: 'Kontrak Tahunan B2G Diperbarui',
        description: `Kontrak ${cNumber.trim()} (${cStatus}) berhasil disimpan.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal menyimpan kontrak B2G',
        description: err?.message,
        type: 'error',
      });
    } finally {
      setSavingContract(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Building2 className="h-3.5 w-3.5" />
            Superadmin Institutional Control Tower
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            Monitoring Instansi DPRD, Kontrak B2G & Observabilitas AI per Bidang
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola provisioning instansi, pagu kuota token tahunan, penunjukan akun Sekretariat (ORG_ADMIN), dan pantau pemakaian AI per Bidang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadInstitutions}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Muat Ulang
          </Button>
          <Button onClick={() => setShowCreateForm((v) => !v)}>
            <Plus className="h-4 w-4 mr-1.5" />
            {showCreateForm ? 'Tutup Form' : 'Provision Instansi & Kontrak Baru'}
          </Button>
        </div>
      </div>

      {/* FORM PROVISIONING INSTANSI BARU */}
      {showCreateForm && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-[#0D1322] p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-black">
            Provisioning Instansi Baru & Kontrak Tahunan B2G
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold mb-1">Kode Instansi</label>
              <input
                type="text"
                placeholder="DPRD-JABAR / DPRD-KAB-BANDUNG"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Nama Resmi Instansi</label>
              <input
                type="text"
                placeholder="DPRD Kabupaten Bandung"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Tingkat Lembaga</label>
              <select
                value={legislativeLevel}
                onChange={(e) => setLegislativeLevel(e.target.value as LegislativeLevel)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                <option value={LegislativeLevel.DPRD_KABUPATEN_KOTA}>DPRD KABUPATEN/KOTA</option>
                <option value={LegislativeLevel.DPRD_PROVINSI}>DPRD PROVINSI</option>
                <option value={LegislativeLevel.DPR_RI}>DPR RI</option>
                <option value={LegislativeLevel.DPD_RI}>DPD RI</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Wilayah Yurisdiksi (Region)</label>
              <input
                type="text"
                placeholder="Kabupaten Bandung"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Provinsi</label>
              <input
                type="text"
                placeholder="Jawa Barat"
                value={provinceName}
                onChange={(e) => setProvinceName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Nomor Kontrak / SPK Tahunan</label>
              <input
                type="text"
                placeholder="SPK/POLARIS/DPRD-BDG/2026/001"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Tahun Anggaran</label>
              <input
                type="number"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Mulai Kontrak</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Berakhir Kontrak</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Kuota Kursi (Max Seats)</label>
              <input
                type="number"
                value={maxSeats}
                onChange={(e) => setMaxSeats(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Pagu Token AI Tahunan</label>
              <input
                type="number"
                value={annualTokenPoolLimit}
                onChange={(e) => setAnnualTokenPoolLimit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Nilai Kontrak Tahunan (IDR)</label>
              <input
                type="number"
                value={contractValueIdr}
                onChange={(e) => setContractValueIdr(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreateInstitution} disabled={creating}>
              {creating ? 'Membuat Instansi...' : 'Aktifkan Instansi & Kontrak Tahunan'}
            </Button>
          </div>
        </div>
      )}

      {/* DAFTAR INSTANSI & DETAIL MONITORING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DAFTAR KIRI */}
        <div className="space-y-3">
          <div className="text-xs font-extrabold text-slate-500 uppercase">
            Daftar Instansi Terdaftar ({institutions.length})
          </div>
          {loading ? (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              Memuat data instansi...
            </div>
          ) : institutions.length === 0 ? (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              Belum ada instansi terdaftar. Klik tombol Provision di atas.
            </div>
          ) : (
            institutions.map((item) => {
              const isSelected = item.organization.id === selectedOrgId;
              return (
                <div
                  key={item.organization.id}
                  onClick={() => setSelectedOrgId(item.organization.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${isSelected
                      ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {item.organization.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {item.activeContract?.status || 'NO_CONTRACT'}
                    </span>
                  </div>
                  <div className="font-black text-sm">{item.organization.name}</div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-500">
                    <div>
                      Kursi: <strong>{item.activeSeatsUsed}/{item.activeContract?.maxSeats || 0}</strong>
                    </div>
                    <div>
                      Bidang: <strong>{item.totalBidang} ({item.totalUnits} unit)</strong>
                    </div>
                    <div>
                      Dok: <strong>{item.totalDocuments}</strong>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span>
                      Token Bulan Ini:{' '}
                      <strong>{item.monthlyAiUsage.totalTokensConsumed.toLocaleString('id-ID')}</strong>
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      Rp {item.monthlyAiUsage.totalCostIdr.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DETAIL KANAN (2 KOLOM) */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedDetail ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-10 text-center text-xs text-slate-500">
              Pilih salah satu Instansi di sebelah kiri untuk memonitor pemakaian per Bidang dan mengelola akun Sekretariat.
            </div>
          ) : (
            <>
              {/* KARTU METRIK INSTANSI & KONTRAK */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black">{selectedDetail.organization.name}</h2>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${selectedDetail.organization.status === OrganizationStatus.ACTIVE
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                      >
                        {selectedDetail.organization.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {selectedDetail.organization.legislativeLevel} &bull; Wilayah:{' '}
                      {selectedDetail.organization.regionName} ({selectedDetail.organization.provinceName})
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowEditOrg((v) => !v)}
                      className="text-xs"
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1" />
                      {showEditOrg ? 'Tutup Edit Instansi' : 'Edit Profil / Status'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowContractForm((v) => !v)}
                      className="text-xs"
                    >
                      <FileCheck2 className="h-3.5 w-3.5 mr-1" />
                      {showContractForm ? 'Tutup Kontrak' : 'Kelola / Perpanjang Kontrak'}
                    </Button>
                  </div>
                </div>

                {selectedDetail.activeContract && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <div className="text-slate-400 font-bold text-[10px] uppercase">Kontrak B2G Aktif</div>
                      <div className="font-extrabold">{selectedDetail.activeContract.contractNumber}</div>
                      <div className="text-slate-500">
                        TA {selectedDetail.activeContract.fiscalYear} &bull; Rp{' '}
                        {selectedDetail.activeContract.contractValueIdr.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-bold text-[10px] uppercase">Pagu Token Tahunan</div>
                      <div className="font-extrabold">
                        {selectedDetail.activeContract.tokensConsumed.toLocaleString('id-ID')} /{' '}
                        {selectedDetail.activeContract.annualTokenPoolLimit.toLocaleString('id-ID')}
                      </div>
                      <div className="text-slate-500">
                        Kursi: {selectedDetail.activeSeatsUsed}/{selectedDetail.activeContract.maxSeats}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-bold text-[10px] uppercase">Pemakaian Storage Kontrak</div>
                      <div className="font-extrabold">
                        {(selectedDetail.storageUsedBytes / 1048576).toFixed(2)} MB /{' '}
                        {(selectedDetail.activeContract.maxStorageBytes / 1073741824).toFixed(1)} GB
                      </div>
                      <div className="text-slate-500">{selectedDetail.totalDocuments} Referensi Dokumen</div>
                    </div>
                  </div>
                )}

                {showEditOrg && (
                  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-3 text-xs">
                    <div className="font-extrabold">Ubah Profil & Status Instansi</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        placeholder="Nama Instansi"
                        value={editOrgName}
                        onChange={(e) => setEditOrgName(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <select
                        value={editOrgStatus}
                        onChange={(e) => setEditOrgStatus(e.target.value as OrganizationStatus)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        {Object.values(OrganizationStatus).map((st) => (
                          <option key={st} value={st}>
                            Status: {st}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Wilayah (Region)"
                        value={editOrgRegion}
                        onChange={(e) => setEditOrgRegion(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="Provinsi"
                        value={editOrgProvince}
                        onChange={(e) => setEditOrgProvince(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleUpdateInstitution} disabled={savingOrg}>
                        {savingOrg ? 'Menyimpan...' : 'Simpan Perubahan Instansi'}
                      </Button>
                    </div>
                  </div>
                )}

                {showContractForm && (
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3 text-xs">
                    <div className="font-extrabold">Perbarui / Tambah Kontrak Tahunan B2G</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        placeholder="Nomor Kontrak / SPK"
                        value={cNumber}
                        onChange={(e) => setCNumber(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="number"
                        placeholder="Tahun Anggaran"
                        value={cFiscalYear}
                        onChange={(e) => setCFiscalYear(Number(e.target.value))}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <select
                        value={cStatus}
                        onChange={(e) => setCStatus(e.target.value as OrganizationContractStatus)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        {Object.values(OrganizationContractStatus).map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={cStartDate}
                        onChange={(e) => setCStartDate(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="date"
                        value={cEndDate}
                        onChange={(e) => setCEndDate(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="number"
                        placeholder="Max Kursi"
                        value={cMaxSeats}
                        onChange={(e) => setCMaxSeats(Number(e.target.value))}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="number"
                        placeholder="Storage (GB)"
                        value={cMaxStorageGb}
                        onChange={(e) => setCMaxStorageGb(Number(e.target.value))}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="number"
                        placeholder="Pagu Token Tahunan"
                        value={cTokenPool}
                        onChange={(e) => setCTokenPool(Number(e.target.value))}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="number"
                        placeholder="Nilai Kontrak (IDR)"
                        value={cValueIdr}
                        onChange={(e) => setCValueIdr(Number(e.target.value))}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Catatan Kontrak / Adendum (opsional)"
                      value={cNotes}
                      onChange={(e) => setCNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleUpsertContract} disabled={savingContract}>
                        {savingContract ? 'Menyimpan Kontrak...' : 'Simpan Kontrak B2G'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* ASSIGN AKUN ADMIN INSTANSI / SEKRETARIAT */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 space-y-2.5">
                  <div className="text-xs font-extrabold flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                    Tetapkan Akun Admin Instansi / Sekretariat DPRD (ORG_ADMIN)
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Akun ORG_ADMIN bertugas mengelola struktur Banggar/Fraksi/Komisi/Bidang, menugaskan anggota, dan mengunggah dokumen resmi Sekretariat tanpa membebani Superadmin.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      placeholder="Masukkan email akun Polaris untuk dijadikan ORG_ADMIN Sekretariat..."
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <Button
                      onClick={handleAssignOrgAdmin}
                      disabled={assigningAdmin || !adminEmail.trim()}
                    >
                      Tetapkan sebagai ORG_ADMIN
                    </Button>
                  </div>
                </div>
              </div>

              {/* BREAKDOWN PEMAKAIAN AI & BIAYA PER BIDANG / UNIT */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-6 space-y-4">
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  Observabilitas Pemakaian AI & Token per Bidang / Unit
                </h3>
                {selectedDetail.unitUsageBreakdown.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Belum ada transaksi inferensi AI pada bidang-bidang di instansi ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDetail.unitUsageBreakdown.map((u, idx) => (
                      <div
                        key={`${u.unitId || 'general'}-${idx}`}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mr-2">
                            {u.unitType}
                          </span>
                          <span className="font-bold">
                            {u.parentUnitName ? `${u.parentUnitName} → ` : ''}
                            {u.unitName}
                          </span>
                          <span className="text-slate-400 ml-1.5">({u.unitCode})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold">
                            {u.totalTokensConsumed.toLocaleString('id-ID')} token
                          </span>
                          <span className="text-slate-400 mx-1.5">&bull;</span>
                          <span className="text-slate-500">{u.totalRequests} req</span>
                          <span className="text-slate-400 mx-1.5">&bull;</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            Rp {u.totalCostIdr.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* POHON UNIT & BIDANG */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-6 space-y-4">
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  Struktur Kelompok & Bidang ({selectedDetail.totalUnits} Unit / {selectedDetail.totalBidang} Bidang)
                </h3>
                {selectedDetail.unitTree.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Sekretariat belum menambahkan unit/bidang pada instansi ini.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedDetail.unitTree.map((root) => (
                      <div
                        key={root.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 mr-2">
                              {root.unitType}
                            </span>
                            <span className="font-extrabold">{root.name}</span>
                          </div>
                          <div className="text-slate-500">
                            {root.memberCount} Anggota &bull; {root.documentCount} Dokumen
                          </div>
                        </div>
                        {root.children && root.children.length > 0 && (
                          <div className="pl-4 border-l-2 border-indigo-200 dark:border-indigo-900 space-y-1.5">
                            {root.children.map((ch) => (
                              <div
                                key={ch.id}
                                className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-900"
                              >
                                <div>
                                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 mr-1.5">
                                    [{ch.unitType}]
                                  </span>
                                  <span className="font-semibold">{ch.name}</span>
                                </div>
                                <div className="text-slate-400">
                                  {ch.memberCount} Anggota &bull; {ch.documentCount} Dokumen
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
