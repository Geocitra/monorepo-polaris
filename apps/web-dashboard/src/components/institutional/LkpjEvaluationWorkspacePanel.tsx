'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  FileText,
  Scale,
  Plus,
  Send,
  Layers,
  PackageCheck,
  ShieldCheck,
  UploadCloud,
  Download,
  Edit3,
  Printer,
  X,
} from 'lucide-react';
import {
  LkpjWorkspaceStatus,
  LkpjMaterialCategory,
  LkpjExtractionVerificationStatus,
  LkpjIndicatorDirection,
  LkpjEvidenceStatus,
  LkpjFindingReviewStatus,
  LkpjFollowupStatus,
  LkpjFactionStance,
  LkpjAiSpecialistRole,
  LkpjMeetingPackageType,
  type LkpjEvaluationWorkspaceDto,
  type LkpjFindingDto,
  type LkpjWorkspaceDashboardDto,
  type LkpjSpecialistAiResponseDto,
  type LkpjMeetingPackageResponseDto,
  type UploadLkpjMaterialResultDto,
} from '@polaris/shared-types';

interface LkpjEvaluationWorkspacePanelProps {
  organizationId: string;
  organizationName: string;
  activeUnitId?: string;
  activeUnitName?: string;
  canManageOrg: boolean;
  availableUnits: Array<{
    unitId: string;
    unitCode: string;
    unitName: string;
    unitType: string;
  }>;
}

const MATERIAL_CATEGORY_LABELS: Record<LkpjMaterialCategory, string> = {
  [LkpjMaterialCategory.LKPJ_PEMDA]: '1. LKPJ Pemerintah Daerah',
  [LkpjMaterialCategory.RPJMD_RKPD_APBD]: '2. RPJMD, RKPD & APBD',
  [LkpjMaterialCategory.ASPIRASI_MASYARAKAT]: '3. Aspirasi Masyarakat (PII Tersamar)',
  [LkpjMaterialCategory.KELUARAN_PANJA]: '4. Keluaran Panja / Alat Pembahas',
  [LkpjMaterialCategory.REKOMENDASI_FRAKSI]: '5. Rekomendasi Fraksi',
  [LkpjMaterialCategory.ANALISIS_TENAGA_AHLI]: '6. Analisis Tenaga Ahli',
  [LkpjMaterialCategory.LAPORAN_PENDUKUNG]: '7. Laporan Lain / Audit / Tahun Lalu',
  [LkpjMaterialCategory.PERATURAN_BERLAKU]: '8. Peraturan & Tata Tertib Berlaku',
};

const SPECIALIST_ROLE_LABELS: Record<LkpjAiSpecialistRole, string> = {
  [LkpjAiSpecialistRole.DOCUMENT_AND_EVIDENCE_MANAGER]: '1. Pengelola Dokumen & Bukti',
  [LkpjAiSpecialistRole.REGIONAL_PERFORMANCE_ANALYST]: '2. Analis Kinerja Daerah',
  [LkpjAiSpecialistRole.ASPIRATION_AND_CLARIFICATION_ANALYST]: '3. Analis Aspirasi & Klarifikasi',
  [LkpjAiSpecialistRole.PANJA_AND_FACTION_ASSISTANT]: '4. Asisten Pembahasan Panja & Fraksi',
  [LkpjAiSpecialistRole.LEGAL_REVIEWER_AND_DRAFTER]: '5. Penelaah Dasar Hukum & Penyusun Draf',
  [LkpjAiSpecialistRole.FOLLOWUP_MONITOR]: '6. Pemantau Tindak Lanjut Pascaparipurna',
};

export function LkpjEvaluationWorkspacePanel({
  organizationId,
  organizationName,
  activeUnitId,
  canManageOrg,
  availableUnits,
}: LkpjEvaluationWorkspacePanelProps) {
  const { toast } = useToast();
  const matUploadInputRef = useRef<HTMLInputElement>(null);

  const [workspaces, setWorkspaces] = useState<LkpjEvaluationWorkspaceDto[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [dashboard, setDashboard] = useState<LkpjWorkspaceDashboardDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [autoExtractCsv, setAutoExtractCsv] = useState(true);

  // Edit Finding State
  const [editingFindingId, setEditingFindingId] = useState<string | null>(null);

  // Followup pascaparipurna editing state
  const [followupDrafts, setFollowupDrafts] = useState<
    Record<string, { status: LkpjFollowupStatus; response: string; proof: string }>
  >({});

  // Create Workspace Form
  const [newFiscalYear, setNewFiscalYear] = useState<number>(2025);
  const [newSubmittedDate, setNewSubmittedDate] = useState<string>('2026-03-25');

  // Register 8 Materials Form
  const [matCategory, setMatCategory] = useState<LkpjMaterialCategory>(
    LkpjMaterialCategory.LKPJ_PEMDA
  );
  const [matTitle, setMatTitle] = useState('');
  const [matVersion, setMatVersion] = useState('FINAL-V1');
  const [matYear, setMatYear] = useState<number>(2025);
  const [matPageRange, setMatPageRange] = useState('');
  const [matConfidence, setMatConfidence] = useState<number>(0.95);
  const [matExcerpt, setMatExcerpt] = useState('');

  // Upsert Finding (Matriks Temuan) Form
  const [affair, setAffair] = useState('Pekerjaan Umum & Layanan Air Minum');
  const [opdName, setOpdName] = useState('Dinas PUPR & PDAM');
  const [indicator, setIndicator] = useState('Cakupan Desa Terlayani Air Minum Layak');
  const [unitLabel, setUnitLabel] = useState('%');
  const [direction, setDirection] = useState<LkpjIndicatorDirection>(
    LkpjIndicatorDirection.HIGHER_IS_BETTER
  );
  const [targetVal, setTargetVal] = useState<string>('85');
  const [realVal, setRealVal] = useState<string>('72.5');
  const [budgetCeiling, setBudgetCeiling] = useState<string>('20000000000');
  const [budgetReal, setBudgetReal] = useState<string>('18500000000');
  const [locationCov, setLocationCov] = useState('14 Desa Wilayah Selatan');
  const [evidenceRef, setEvidenceRef] = useState('LKPJ Bab III Hal. 114 & Tabel RPJMD 4.2');
  const [aspirationText, setAspirationText] = useState('');
  const [clarificationQ, setClarificationQ] = useState('');
  const [opdResp, setOpdResp] = useState('');
  const [evidenceStatus, setEvidenceStatus] = useState<LkpjEvidenceStatus>(
    LkpjEvidenceStatus.INSUFFICIENT_OPEN
  );
  const [proposedRec, setProposedRec] = useState('');

  // Faction Proposal Form
  const [selectedFindingForFaction, setSelectedFindingForFaction] = useState<string>('');
  const [factionUnitId, setFactionUnitId] = useState<string>(activeUnitId || '');
  const [factionStance, setFactionStance] = useState<LkpjFactionStance>(
    LkpjFactionStance.CONCUR_WITH_PANJA
  );
  const [factionRedaction, setFactionRedaction] = useState('');

  // Specialist AI & Meeting Packages
  const [selectedSpecialist, setSelectedSpecialist] = useState<LkpjAiSpecialistRole>(
    LkpjAiSpecialistRole.REGIONAL_PERFORMANCE_ANALYST
  );
  const [specialistInstruction, setSpecialistInstruction] = useState('');
  const [specialistLoading, setSpecialistLoading] = useState(false);
  const [specialistResult, setSpecialistResult] = useState<LkpjSpecialistAiResponseDto | null>(
    null
  );

  const [selectedPackageType, setSelectedPackageType] = useState<LkpjMeetingPackageType>(
    LkpjMeetingPackageType.PRE_PLENARY_MEETING
  );
  const [meetingPackage, setMeetingPackage] = useState<LkpjMeetingPackageResponseDto | null>(null);

  useEffect(() => {
    if (organizationId) {
      loadWorkspaces(organizationId);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId && selectedWorkspaceId) {
      loadDashboard(organizationId, selectedWorkspaceId);
    }
  }, [organizationId, selectedWorkspaceId]);

  useEffect(() => {
    if (activeUnitId) setFactionUnitId(activeUnitId);
  }, [activeUnitId]);

  async function loadWorkspaces(orgId: string) {
    setLoading(true);
    try {
      const list = await ApiClient.request<LkpjEvaluationWorkspaceDto[]>(
        `/institutional/orgs/${orgId}/lkpj/workspaces`
      );
      setWorkspaces(list || []);
      if (list && list.length > 0) {
        setSelectedWorkspaceId(list[0].id);
      } else {
        setSelectedWorkspaceId('');
        setDashboard(null);
      }
    } catch (err: any) {
      toast({
        title: 'Gagal memuat ruang kerja LKPJ',
        description: err?.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard(orgId: string, wsId: string) {
    try {
      const data = await ApiClient.request<LkpjWorkspaceDashboardDto>(
        `/institutional/orgs/${orgId}/lkpj/workspaces/${wsId}/dashboard`
      );
      setDashboard(data);
      if (data.findings.length > 0 && !selectedFindingForFaction) {
        setSelectedFindingForFaction(data.findings[0].id);
      }
    } catch (err: any) {
      toast({
        title: 'Gagal memuat Matriks Temuan LKPJ',
        description: err?.message,
        type: 'error',
      });
    }
  }

  async function handleCreateWorkspace() {
    try {
      const created = await ApiClient.request<LkpjEvaluationWorkspaceDto>(
        `/institutional/orgs/${organizationId}/lkpj/workspaces`,
        {
          method: 'POST',
          body: JSON.stringify({
            fiscalYear: Number(newFiscalYear),
            lkpjSubmittedAt: new Date(newSubmittedDate).toISOString(),
            assignedDiscussionUnitId: activeUnitId || null,
          }),
        }
      );
      await loadWorkspaces(organizationId);
      setSelectedWorkspaceId(created.id);
      toast({
        title: 'Ruang Kerja Evaluasi LKPJ Siap',
        description: `${created.title} berhasil diinisialisasi dengan tenggat pembahasan 30 hari.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal membuat ruang kerja LKPJ', description: err?.message, type: 'error' });
    }
  }

  async function handleUpdateWorkspaceStatus(nextStatus: LkpjWorkspaceStatus) {
    if (!selectedWorkspaceId) return;
    try {
      await ApiClient.request(
        `/institutional/orgs/${organizationId}/lkpj/workspaces/${selectedWorkspaceId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      await loadDashboard(organizationId, selectedWorkspaceId);
      toast({
        title: 'Tahapan Siklus LKPJ Diperbarui',
        description: `Status ruang kerja kini: ${nextStatus}`,
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal mengubah tahapan siklus', description: err?.message, type: 'error' });
    }
  }

  async function handleRegisterMaterial() {
    if (!selectedWorkspaceId || !matTitle.trim()) return;
    try {
      await ApiClient.request(
        `/institutional/orgs/${organizationId}/lkpj/workspaces/${selectedWorkspaceId}/materials`,
        {
          method: 'POST',
          body: JSON.stringify({
            materialCategory: matCategory,
            title: matTitle.trim(),
            documentVersion: matVersion.trim() || 'FINAL-V1',
            sourceYear: Number(matYear),
            pageOrArticleRange: matPageRange.trim() || undefined,
            originUnitId: activeUnitId || null,
            extractionConfidence: Number(matConfidence),
            summaryExcerpt: matExcerpt.trim() || undefined,
          }),
        }
      );
      setMatTitle('');
      setMatPageRange('');
      setMatExcerpt('');
      await loadDashboard(organizationId, selectedWorkspaceId);
      toast({
        title: 'Bahan Evaluasi Terdaftar',
        description: 'Sumber evaluasi dan indeks rujukan berhasil dicatat.',
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal mendaftarkan bahan', description: err?.message, type: 'error' });
    }
  }

  async function handleVerifyMaterial(
    materialId: string,
    status: LkpjExtractionVerificationStatus
  ) {
    if (!selectedWorkspaceId) return;
    try {
      await ApiClient.request(
        `/institutional/orgs/${organizationId}/lkpj/workspaces/${selectedWorkspaceId}/materials/${materialId}/verify`,
        {
          method: 'PATCH',
          body: JSON.stringify({ verificationStatus: status }),
        }
      );
      await loadDashboard(organizationId, selectedWorkspaceId);
      toast({
        title: 'Status Pemeriksaan Bukti Diperbarui',
        description: `Bahan evaluasi ditandai sebagai ${status}.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal memverifikasi bahan', description: err?.message, type: 'error' });
    }
  }

  async function handleUploadMaterialFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedWorkspaceId) return;
    setUploadingMaterial(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('materialCategory', matCategory);
      if (matTitle.trim()) formData.append('title', matTitle.trim());
      if (matVersion.trim()) formData.append('documentVersion', matVersion.trim());
      if (matPageRange.trim()) formData.append('pageOrArticleRange', matPageRange.trim());
      formData.append('sourceYear', String(matYear));
      if (activeUnitId) formData.append('originUnitId', activeUnitId);
      formData.append('autoExtractFindings', String(autoExtractCsv));

      const res = await ApiClient.uploadFormData<UploadLkpjMaterialResultDto>(
        `/institutional/orgs/${organizationId}/lkpj/workspaces/${selectedWorkspaceId}/materials/upload`,
        formData
      );
      setMatTitle('');
      setMatPageRange('');
      await loadDashboard(organizationId, selectedWorkspaceId);
      toast({
        title: res.queuedForVerification
          ? 'Bahan Masuk Antrean Verifikasi Penelaah'
          : 'Bahan Evaluasi Berhasil Diunggah & Terverifikasi',
        description: `Confidence: ${Math.round(res.extractionConfidence * 100)}% • ${res.extractedFindingsCount} baris kandidat ditambahkan ke Matriks.`,
        type: res.queuedForVerification ? 'warning' : 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal mengunggah berkas bahan', description: err?.message, type: 'error' });
    } finally {
      setUploadingMaterial(false);
      if (matUploadInputRef.current) matUploadInputRef.current.value = '';
    }
  }

  function startEditingFinding(f: LkpjFindingDto) {
    setEditingFindingId(f.id);
    setAffair(f.governmentAffair);
    setOpdName(f.opdName);
    setIndicator(f.indicatorOrIssue);
    setUnitLabel(f.indicatorUnit || '%');
    setDirection(f.indicatorDirection);
    setTargetVal(f.targetValue !== null ? String(f.targetValue) : '');
    setRealVal(f.realizationValue !== null ? String(f.realizationValue) : '');
    setBudgetCeiling(f.budgetCeilingIdr !== null ? String(f.budgetCeilingIdr) : '');
    setBudgetReal(f.budgetRealizationIdr !== null ? String(f.budgetRealizationIdr) : '');
    setLocationCov(f.locationCoverage || '');
    setEvidenceRef(f.sourceEvidenceRef || '');
    setAspirationText(f.citizenAspirationSummary || '');
    setClarificationQ(f.opdClarificationQuestion || '');
    setOpdResp(f.opdResponse || '');
    setEvidenceStatus(f.evidenceStatus);
    setProposedRec(f.proposedRecommendation || '');
  }

  function cancelEditingFinding() {
    setEditingFindingId(null);
  }

  async function handleAddFinding() {
    if (!selectedWorkspaceId || !affair.trim() || !opdName.trim() || !indicator.trim()) return;
    try {
      await ApiClient.request(
        `/institutional/orgs/${organizationId}/lkpj/workspaces/${selectedWorkspaceId}/findings`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...(editingFindingId ? { id: editingFindingId } : {}),
            originUnitId: activeUnitId || null,
            governmentAffair: affair.trim(),
            opdName: opdName.trim(),
            indicatorOrIssue: indicator.trim(),
            indicatorUnit: unitLabel.trim() || '%',
            indicatorDirection: direction,
            targetValue: targetVal !== '' ? Number(targetVal) : null,
            realizationValue: realVal !== '' ? Number(realVal) : null,
            budgetCeilingIdr: budgetCeiling !== '' ? Number(budgetCeiling) : null,
            budgetRealizationIdr: budgetReal !== '' ? Number(budgetReal) : null,
            locationCoverage: locationCov.trim() || undefined,
            sourceEvidenceRef: evidenceRef.trim(),
            citizenAspirationSummary: aspirationText.trim() || undefined,
            opdClarificationQuestion: clarificationQ.trim() || undefined,
            opdResponse: opdResp.trim() || undefined,
            evidenceStatus,
            proposedRecommendation: proposedRec.trim() || undefined,
          }),
        }
      );
      const wasEdit = Boolean(editingFindingId);
      setEditingFindingId(null);
      await loadDashboard(organizationId, selectedWorkspaceId);
      toast({
        title: wasEdit ? 'Baris Temuan Diperbarui' : 'Temuan Ditambahkan ke Matriks',
        description: 'Selisih kinerja dan persentase serapan anggaran telah dihitung secara deterministik.',
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal menyimpan temuan', description: err?.message, type: 'error' });
    }
  }

  async function handleUpdateFollowup(findingId: string, existing: LkpjFindingDto) {
    if (!selectedWorkspaceId) return;
    const draft = followupDrafts[findingId] || {
      status: existing.followupStatus,
      response: existing.followupResponsePemda || '',
      proof: existing.followupProofRef || '',
    };
    try {
      await ApiClient.request(
        `/institutional/orgs/${organizationId}/lkpj/workspaces/${selectedWorkspaceId}/findings/${findingId}/followup`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            followupStatus: draft.status,
            followupResponsePemda: draft.response.trim() || undefined,
            followupProofRef: draft.proof.trim() || undefined,
          }),
        }
      );
      await loadDashboard(organizationId, selectedWorkspaceId);
      toast({
        title: 'Tindak Lanjut Pascaparipurna Disimpan',
        description: `Status tindak lanjut kini: ${draft.status}.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal memperbarui tindak lanjut',
        description: err?.message,
        type: 'error',
      });
    }
  }

  function handleDownloadMeetingPackageMarkdown() {
    if (!meetingPackage) return;
    const lines: string[] = [
      `# ${meetingPackage.packageTitle}`,
      `Instansi: ${meetingPackage.organizationName} | Tahun Anggaran: ${meetingPackage.fiscalYear}`,
      `Dibuat: ${new Date(meetingPackage.generatedAt).toLocaleString('id-ID')}`,
      '',
      meetingPackage.executiveSummaryMarkdown,
      '',
      `## Matriks Temuan (${meetingPackage.includedFindings.length} Baris)`,
      ...meetingPackage.includedFindings.map(
        (f, i) =>
          `${i + 1}. **${f.governmentAffair} — ${f.opdName}** | Indikator: ${f.indicatorOrIssue} | Target: ${f.targetValue ?? '-'} ${f.indicatorUnit} | Realisasi: ${f.realizationValue ?? '-'} ${f.indicatorUnit} | Selisih: ${f.achievementGap ?? '-'} (${f.achievementPercentage ?? '-'}%) | Serapan APBD: ${f.budgetAbsorptionPercentage ?? '-'}% | Rekomendasi: ${f.proposedRecommendation || '-'}`
      ),
      '',
      `## Register Rekomendasi Resmi (${meetingPackage.officialRecommendationsRegister.length})`,
      ...meetingPackage.officialRecommendationsRegister.map(
        (r, i) =>
          `${i + 1}. [${r.responsibleOpd}] (${r.followupStatus}) — ${r.recommendationText} (Dasar Hukum: ${r.legalBasisRef})`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meetingPackage.packageType.toLowerCase()}-ta-${meetingPackage.fiscalYear}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleReviewFinding(
    findingId: string,
    reviewStatus: LkpjFindingReviewStatus,
    nextEvidenceStatus?: LkpjEvidenceStatus
  ) {
    if (!selectedWorkspaceId) return;
    try {
      await ApiClient.request(
        `/institutional/orgs/${organizationId}/lkpj/workspaces/${selectedWorkspaceId}/findings/${findingId}/review`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            reviewStatus,
            ...(nextEvidenceStatus ? { evidenceStatus: nextEvidenceStatus } : {}),
          }),
        }
      );
      await loadDashboard(organizationId, selectedWorkspaceId);
      toast({
        title: 'Status Telaah Temuan Diperbarui',
        description: `Temuan kini berstatus ${reviewStatus}.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal memperbarui status telaah', description: err?.message, type: 'error' });
    }
  }

  async function handleSubmitFactionProposal() {
    if (
      !selectedWorkspaceId ||
      !selectedFindingForFaction ||
      !factionUnitId ||
      !factionRedaction.trim()
    ) {
      return;
    }
    try {
      await ApiClient.request(
        `/institutional/orgs/${organizationId}/lkpj/workspaces/${selectedWorkspaceId}/faction-proposals`,
        {
          method: 'POST',
          body: JSON.stringify({
            findingId: selectedFindingForFaction,
            factionUnitId,
            stancePosition: factionStance,
            proposedRedaction: factionRedaction.trim(),
          }),
        }
      );
      setFactionRedaction('');
      await loadDashboard(organizationId, selectedWorkspaceId);
      toast({
        title: 'Usulan Fraksi Tercatat di Matriks Konsolidasi',
        description: 'Titik temu dan perbedaan pandangan antar-fraksi telah diperbarui.',
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal mengirim usulan fraksi', description: err?.message, type: 'error' });
    }
  }

  async function handleRunSpecialistAi() {
    if (!selectedWorkspaceId) return;
    setSpecialistLoading(true);
    try {
      const res = await ApiClient.request<LkpjSpecialistAiResponseDto>(
        `/institutional/orgs/${organizationId}/lkpj/workspaces/${selectedWorkspaceId}/specialist-ai`,
        {
          method: 'POST',
          body: JSON.stringify({
            specialistRole: selectedSpecialist,
            activeUnitId: activeUnitId || undefined,
            customInstruction: specialistInstruction.trim() || undefined,
          }),
        }
      );
      setSpecialistResult(res);
      toast({
        title: `${res.specialistLabel} Selesai`,
        description: `Menganalisis ${res.deterministicMetricsUsed.findingsAnalyzedCount} baris matriks temuan.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal menjalankan Agen Spesialis', description: err?.message, type: 'error' });
    } finally {
      setSpecialistLoading(false);
    }
  }

  async function handleGenerateMeetingPackage(pkgType: LkpjMeetingPackageType) {
    if (!selectedWorkspaceId) return;
    setSelectedPackageType(pkgType);
    try {
      const pkg = await ApiClient.request<LkpjMeetingPackageResponseDto>(
        `/institutional/orgs/${organizationId}/lkpj/workspaces/${selectedWorkspaceId}/meeting-packages?packageType=${pkgType}`
      );
      setMeetingPackage(pkg);
      toast({
        title: 'Paket Rapat Berhasil Disusun',
        description: pkg.packageTitle,
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal menyusun paket rapat', description: err?.message, type: 'error' });
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. PEMILIH / INISIALISASI RUANG KERJA LKPJ PER TAHUN ANGGARAN */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-base font-black flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Ruang Kerja Evaluasi LKPJ & Matriks Temuan ({organizationName})
            </h2>
            <p className="text-xs text-slate-500">
              Satu ruang kerja evaluasi per pemerintah daerah dan tahun anggaran sesuai PP Nomor 13 Tahun 2019 (pembahasan maksimal 30 hari sejak Paripurna Penyampaian LKPJ).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {workspaces.length > 0 && (
              <select
                value={selectedWorkspaceId}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="px-3.5 py-2 rounded-xl font-bold border border-indigo-300 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/50"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    TA {ws.fiscalYear} — {ws.title} [{ws.status}]
                  </option>
                ))}
              </select>
            )}

            <input
              type="number"
              value={newFiscalYear}
              onChange={(e) => setNewFiscalYear(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              placeholder="TA"
            />
            <input
              type="date"
              value={newSubmittedDate}
              onChange={(e) => setNewSubmittedDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              title="Tanggal Paripurna Penyampaian LKPJ"
            />
            <Button onClick={handleCreateWorkspace}>
              <Plus className="h-4 w-4 mr-1" />
              Buka Siklus LKPJ TA {newFiscalYear}
            </Button>
          </div>
        </div>

        {dashboard && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Tenggat 30 Hari Pembahasan
              </div>
              <div className="text-sm font-black mt-0.5 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-500" />
                {dashboard.workspace.daysRemainingForDiscussion} Hari Tersisa
              </div>
              <div className="text-[11px] text-slate-500">
                Batas: {new Date(dashboard.workspace.discussionDeadlineAt).toLocaleDateString('id-ID')}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Matriks Temuan Terstruktur
              </div>
              <div className="text-lg font-black mt-0.5">
                {dashboard.findingsSummary.totalFindings} Baris Temuan
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold">
                {dashboard.findingsSummary.sufficientVerifiedCount} Bukti Cukup &bull;{' '}
                {dashboard.findingsSummary.insufficientEvidenceCount +
                  dashboard.findingsSummary.stillOpenAtClosingCount}{' '}
                Bukti Terbuka
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Antrean Pemeriksaan Bukti
              </div>
              <div className="text-lg font-black mt-0.5">
                {dashboard.verificationQueueCount} Bahan Meragukan
              </div>
              <div className="text-[11px] text-slate-500">
                Total {dashboard.materials.length} dokumen pada 8 bahan evaluasi
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Rumusan Rekomendasi DPRD
              </div>
              <div className="text-lg font-black mt-0.5">
                {dashboard.findingsSummary.approvedForDiscussionCount} Disetujui
              </div>
              <div className="text-[11px] text-indigo-600 font-semibold">
                {dashboard.findingsSummary.officialRecommendationCount} Rekomendasi Resmi Paripurna
              </div>
            </div>

            {canManageOrg && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Tahapan Siklus (Sekretariat)
                </div>
                <select
                  value={dashboard.workspace.status}
                  onChange={(e) =>
                    handleUpdateWorkspaceStatus(e.target.value as LkpjWorkspaceStatus)
                  }
                  className="mt-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {Object.values(LkpjWorkspaceStatus).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {dashboard && (
        <>
          {/* 2. PUSAT APLIKASI: MATRIKS TEMUAN TERSTRUKTUR (TARGET vs REALISASI vs ANGGARAN vs BUKTI vs KLARIFIKASI OPD) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black">
                  Matriks Temuan Kinerja & Serapan Anggaran Berdampingan (Perhitungan Deterministik)
                </h3>
                <p className="text-xs text-slate-500">
                  Dari satu baris, anggota DPRD dapat melihat apa yang dijanjikan (RPJMD/RKPD), apa yang tercapai (LKPJ), serapan APBD, di mana buktinya, apa jawaban OPD, dan rumusan rekomendasi yang sedang disusun.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Zero-Hallucination Deterministic Math
              </span>
            </div>

            {/* FORM TAMBAH / EDIT BARIS TEMUAN */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-slate-700 dark:text-slate-200">
                  {editingFindingId
                    ? 'Edit Baris Temuan & Lengkapi Klarifikasi OPD'
                    : '+ Tambah Baris Temuan ke Matriks Evaluasi'}
                </div>
                {editingFindingId && (
                  <button
                    onClick={cancelEditingFinding}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-[11px] font-bold cursor-pointer"
                  >
                    <X className="h-3 w-3" /> Batal Edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  placeholder="Urusan Pemerintahan"
                  value={affair}
                  onChange={(e) => setAffair(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Perangkat Daerah (OPD)"
                  value={opdName}
                  onChange={(e) => setOpdName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Indikator Kinerja atau Isu Layanan"
                  value={indicator}
                  onChange={(e) => setIndicator(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Target RPJMD/RKPD (angka)"
                  value={targetVal}
                  onChange={(e) => setTargetVal(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Realisasi LKPJ (angka)"
                  value={realVal}
                  onChange={(e) => setRealVal(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Satuan (%, Desa, Km)"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as LkpjIndicatorDirection)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value={LkpjIndicatorDirection.HIGHER_IS_BETTER}>
                    Arah: Makin Tinggi Makin Baik
                  </option>
                  <option value={LkpjIndicatorDirection.LOWER_IS_BETTER}>
                    Arah: Makin Rendah Makin Baik (Kemiskinan/Stunting)
                  </option>
                </select>
                <input
                  type="text"
                  placeholder="Pagu APBD (Rp)"
                  value={budgetCeiling}
                  onChange={(e) => setBudgetCeiling(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Realisasi APBD (Rp)"
                  value={budgetReal}
                  onChange={(e) => setBudgetReal(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Lokasi / Cakupan Wilayah"
                  value={locationCov}
                  onChange={(e) => setLocationCov(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Rujukan Bukti (Halaman LKPJ / Tabel RPJMD)"
                  value={evidenceRef}
                  onChange={(e) => setEvidenceRef(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Aspirasi Warga Terkait (NIK/No Telp otomatis disamarkan)"
                  value={aspirationText}
                  onChange={(e) => setAspirationText(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Pertanyaan Klarifikasi untuk OPD"
                  value={clarificationQ}
                  onChange={(e) => setClarificationQ(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Jawaban / Tanggapan OPD"
                  value={opdResp}
                  onChange={(e) => setOpdResp(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <select
                  value={evidenceStatus}
                  onChange={(e) => setEvidenceStatus(e.target.value as LkpjEvidenceStatus)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value={LkpjEvidenceStatus.INSUFFICIENT_OPEN}>
                    Bukti: Belum Cukup (Minta Klarifikasi)
                  </option>
                  <option value={LkpjEvidenceStatus.STILL_OPEN_AT_CLOSING}>
                    Bukti: Masih Terbuka Saat Pembahasan Ditutup
                  </option>
                  <option value={LkpjEvidenceStatus.SUFFICIENT_VERIFIED}>
                    Bukti: Cukup & Terverifikasi
                  </option>
                </select>
                <input
                  type="text"
                  placeholder="Draf Rumusan Rekomendasi DPRD (Tindakan, Lokasi, Target, Jadwal, Penanggung Jawab)"
                  value={proposedRec}
                  onChange={(e) => setProposedRec(e.target.value)}
                  className="sm:col-span-3 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddFinding}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  {editingFindingId ? 'Simpan Perubahan Baris Temuan' : 'Simpan Baris ke Matriks Temuan'}
                </Button>
              </div>
            </div>

            {/* TABEL MATRIKS TEMUAN */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-400">
                    <th className="py-3 px-2.5">Urusan & OPD</th>
                    <th className="py-3 px-2.5">Indikator / Isu & Lokasi</th>
                    <th className="py-3 px-2.5">Target vs Realisasi (Deterministik)</th>
                    <th className="py-3 px-2.5">Serapan Anggaran APBD</th>
                    <th className="py-3 px-2.5">Bukti, Aspirasi & Jawaban OPD</th>
                    <th className="py-3 px-2.5">Rumusan Rekomendasi & Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {dashboard.findings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Belum ada baris temuan. Tambahkan temuan pertama di form atas.
                      </td>
                    </tr>
                  ) : (
                    dashboard.findings.map((f) => (
                      <tr key={f.id} className="align-top hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                        <td className="py-3 px-2.5">
                          <div className="font-extrabold text-slate-800 dark:text-slate-100">
                            {f.governmentAffair}
                          </div>
                          <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                            {f.opdName}
                          </div>
                          {f.originUnitName && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800">
                              Oleh: {f.originUnitName}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-2.5">
                          <div className="font-bold">{f.indicatorOrIssue}</div>
                          {f.locationCoverage && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Lokasi: {f.locationCoverage}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Arah: {f.indicatorDirection}
                          </div>
                        </td>

                        <td className="py-3 px-2.5">
                          <div>
                            Target: <strong>{f.targetValue ?? '-'} {f.indicatorUnit}</strong>
                          </div>
                          <div>
                            Realisasi: <strong>{f.realizationValue ?? '-'} {f.indicatorUnit}</strong>
                          </div>
                          <div
                            className={`font-black mt-0.5 ${
                              (f.achievementGap ?? 0) < 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            Selisih: {f.achievementGap ?? '-'} {f.indicatorUnit} ({f.achievementPercentage ?? '-'}%)
                          </div>
                        </td>

                        <td className="py-3 px-2.5">
                          {f.budgetCeilingIdr ? (
                            <>
                              <div>Pagu: Rp {f.budgetCeilingIdr.toLocaleString('id-ID')}</div>
                              <div>
                                Real: Rp {(f.budgetRealizationIdr || 0).toLocaleString('id-ID')}
                              </div>
                              <div className="font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                                Serapan: {f.budgetAbsorptionPercentage ?? '-'}%
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3 px-2.5 space-y-1 max-w-xs">
                          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                            Sumber: {f.sourceEvidenceRef}
                          </div>
                          {f.citizenAspirationSummary && (
                            <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/40 p-1.5 rounded">
                              Aspirasi: {f.citizenAspirationSummary}
                            </div>
                          )}
                          {f.opdResponse && (
                            <div className="text-[11px] text-slate-500">
                              Jawaban OPD: {f.opdResponse}
                            </div>
                          )}
                          <div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                                f.evidenceStatus === LkpjEvidenceStatus.SUFFICIENT_VERIFIED
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {f.evidenceStatus}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-2.5 space-y-2 max-w-sm">
                          <div className="text-[11px] text-slate-700 dark:text-slate-200">
                            {f.proposedRecommendation || (
                              <span className="italic text-slate-400">
                                Belum ada rumusan rekomendasi
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                              {f.reviewStatus}
                            </span>
                            <button
                              onClick={() => startEditingFinding(f)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
                            >
                              <Edit3 className="h-2.5 w-2.5" /> Edit / Jawaban OPD
                            </button>
                            {f.evidenceStatus !== LkpjEvidenceStatus.SUFFICIENT_VERIFIED && (
                              <button
                                onClick={() =>
                                  handleReviewFinding(
                                    f.id,
                                    f.reviewStatus,
                                    LkpjEvidenceStatus.SUFFICIENT_VERIFIED
                                  )
                                }
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                              >
                                Tandai Bukti Cukup
                              </button>
                            )}
                            {f.reviewStatus === LkpjFindingReviewStatus.DRAFT &&
                              f.proposedRecommendation && (
                                <button
                                  onClick={() =>
                                    handleReviewFinding(
                                      f.id,
                                      LkpjFindingReviewStatus.APPROVED_FOR_DISCUSSION
                                    )
                                  }
                                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                                >
                                  Setujui untuk Dibahas
                                </button>
                              )}
                            {f.reviewStatus === LkpjFindingReviewStatus.APPROVED_FOR_DISCUSSION && (
                              <button
                                onClick={() =>
                                  handleReviewFinding(
                                    f.id,
                                    LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION
                                  )
                                }
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                              >
                                Sahkan Rekomendasi Paripurna
                              </button>
                            )}
                          </div>

                          {/* Tindak Lanjut Pascaparipurna (PATCH .../findings/:findingId/followup) */}
                          {(f.reviewStatus === LkpjFindingReviewStatus.OFFICIAL_RECOMMENDATION ||
                            f.proposedRecommendation) && (
                            <div className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5 text-[10px]">
                              <div className="font-extrabold text-slate-500">
                                Tindak Lanjut Pascaparipurna ({f.followupStatus})
                              </div>
                              <div className="grid grid-cols-1 gap-1">
                                <select
                                  value={followupDrafts[f.id]?.status || f.followupStatus}
                                  onChange={(e) =>
                                    setFollowupDrafts((prev) => ({
                                      ...prev,
                                      [f.id]: {
                                        status: e.target.value as LkpjFollowupStatus,
                                        response:
                                          prev[f.id]?.response ?? f.followupResponsePemda ?? '',
                                        proof: prev[f.id]?.proof ?? f.followupProofRef ?? '',
                                      },
                                    }))
                                  }
                                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                >
                                  {Object.values(LkpjFollowupStatus).map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  placeholder="Tanggapan Pemda / OPD..."
                                  value={
                                    followupDrafts[f.id]?.response ?? f.followupResponsePemda ?? ''
                                  }
                                  onChange={(e) =>
                                    setFollowupDrafts((prev) => ({
                                      ...prev,
                                      [f.id]: {
                                        status: prev[f.id]?.status ?? f.followupStatus,
                                        response: e.target.value,
                                        proof: prev[f.id]?.proof ?? f.followupProofRef ?? '',
                                      },
                                    }))
                                  }
                                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                />
                                <input
                                  type="text"
                                  placeholder="Rujukan Bukti Penyelesaian (No. Berita Acara/Dok)"
                                  value={followupDrafts[f.id]?.proof ?? f.followupProofRef ?? ''}
                                  onChange={(e) =>
                                    setFollowupDrafts((prev) => ({
                                      ...prev,
                                      [f.id]: {
                                        status: prev[f.id]?.status ?? f.followupStatus,
                                        response:
                                          prev[f.id]?.response ?? f.followupResponsePemda ?? '',
                                        proof: e.target.value,
                                      },
                                    }))
                                  }
                                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                />
                                <button
                                  onClick={() => handleUpdateFollowup(f.id, f)}
                                  className="px-2 py-1 rounded font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                                >
                                  Simpan Tindak Lanjut
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. DELAPAN BAHAN EVALUASI & ANTREAN PEMERIKSAAN BUKTI + MATRIKS USULAN FRAKSI */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KIRI: 8 BAHAN EVALUASI & ANTREAN VERIFIKASI */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-4">
              <h3 className="text-sm font-black flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                Delapan Bahan Evaluasi & Antrean Pemeriksaan Bukti
              </h3>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {Object.entries(MATERIAL_CATEGORY_LABELS).map(([catKey, label]) => (
                  <div
                    key={catKey}
                    className="p-2 rounded-lg border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
                  >
                    <span className="truncate font-semibold">{label}</span>
                    <span className="px-1.5 py-0.5 rounded font-black bg-slate-100 dark:bg-slate-800">
                      {dashboard.materialsByCategoryCount[catKey as LkpjMaterialCategory] || 0}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="font-extrabold">Registrasi Bahan Evaluasi & Indeks Halaman/Pasal</div>
                <select
                  value={matCategory}
                  onChange={(e) => setMatCategory(e.target.value as LkpjMaterialCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                >
                  {Object.entries(MATERIAL_CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Judul Dokumen / Risalah"
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Halaman / Pasal (misal: Hal. 110-125)"
                    value={matPageRange}
                    onChange={(e) => setMatPageRange(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Versi (FINAL-V1)"
                    value={matVersion}
                    onChange={(e) => setMatVersion(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                  <input
                    type="number"
                    placeholder="Tahun"
                    value={matYear}
                    onChange={(e) => setMatYear(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    placeholder="Confidence (0.0-1.0)"
                    value={matConfidence}
                    onChange={(e) => setMatConfidence(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    title="Jika < 0.85 otomatis masuk Antrean Pemeriksaan Penelaah"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleRegisterMaterial} variant="outline" className="flex-1">
                    Catat Manual ke Indeks Bahan
                  </Button>
                  <input
                    ref={matUploadInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.md,.csv"
                    onChange={handleUploadMaterialFile}
                    className="hidden"
                  />
                  <Button
                    onClick={() => matUploadInputRef.current?.click()}
                    disabled={uploadingMaterial}
                    className="flex-1"
                  >
                    <UploadCloud className="h-4 w-4 mr-1.5" />
                    {uploadingMaterial
                      ? 'Mengekstrak File & Vektor...'
                      : 'Unggah File PDF/CSV Otomatis'}
                  </Button>
                </div>
                <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoExtractCsv}
                    onChange={(e) => setAutoExtractCsv(e.target.checked)}
                  />
                  Ekstrak baris tabel CSV/LKPJ otomatis menjadi draf Matriks Temuan
                </label>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {dashboard.materials.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold">
                        [{m.materialCategory}] {m.title} ({m.documentVersion})
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Rujukan: {m.pageOrArticleRange || '-'} &bull; Kualitas Ekstraksi:{' '}
                        {Math.round(m.extractionConfidence * 100)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          m.verificationStatus === LkpjExtractionVerificationStatus.VERIFIED
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {m.verificationStatus}
                      </span>
                      {m.verificationStatus !== LkpjExtractionVerificationStatus.VERIFIED && (
                        <button
                          onClick={() =>
                            handleVerifyMaterial(m.id, LkpjExtractionVerificationStatus.VERIFIED)
                          }
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white cursor-pointer"
                        >
                          Verifikasi
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KANAN: MATRIKS USULAN FRAKSI, TITIK TEMU & PERBEDAAN PANDANGAN */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-4">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Scale className="h-4 w-4 text-indigo-500" />
                Matriks Usulan per Fraksi, Titik Temu, & Perbedaan Pandangan
              </h3>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="font-extrabold">Input Usulan / Sikap Resmi Fraksi terhadap Temuan</div>
                <select
                  value={selectedFindingForFaction}
                  onChange={(e) => setSelectedFindingForFaction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                >
                  <option value="">-- Pilih Baris Temuan --</option>
                  {dashboard.findings.map((f) => (
                    <option key={f.id} value={f.id}>
                      [{f.opdName}] {f.indicatorOrIssue}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={factionUnitId}
                    onChange={(e) => setFactionUnitId(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="">-- Pilih Unit / Fraksi Pengusul --</option>
                    {availableUnits.map((u) => (
                      <option key={u.unitId} value={u.unitId}>
                        {u.unitName} [{u.unitType}]
                      </option>
                    ))}
                  </select>
                  <select
                    value={factionStance}
                    onChange={(e) => setFactionStance(e.target.value as LkpjFactionStance)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value={LkpjFactionStance.CONCUR_WITH_PANJA}>
                      Setuju Rumusan Panja (Titik Temu)
                    </option>
                    <option value={LkpjFactionStance.PROPOSE_AMENDMENT}>
                      Usul Penyempurnaan Redaksi
                    </option>
                    <option value={LkpjFactionStance.DISSENT_NEED_DECISION}>
                      Perbedaan Sikap (Perlu Keputusan Rapat)
                    </option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  placeholder="Rumusan usulan rekomendasi dari Fraksi..."
                  value={factionRedaction}
                  onChange={(e) => setFactionRedaction(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
                <Button onClick={handleSubmitFactionProposal} className="w-full">
                  Simpan Sikap Fraksi ke Matriks Konsolidasi
                </Button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {dashboard.factionConsolidationMatrix
                  .filter((fc) => fc.totalFactionsResponded > 0)
                  .map((fc) => (
                    <div
                      key={fc.findingId}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          {fc.indicatorOrIssue} ({fc.opdName})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            fc.consensusStatus === 'UNANIMOUS_CONSENSUS'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : fc.consensusStatus === 'HAS_AMENDMENTS'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {fc.consensusStatus}
                        </span>
                      </div>
                      {fc.factionProposals.map((fp) => (
                        <div
                          key={fp.id}
                          className="text-[11px] pl-2.5 border-l-2 border-indigo-300 dark:border-indigo-700"
                        >
                          <strong>{fp.factionUnitName}</strong> [{fp.stancePosition}]: &ldquo;
                          {fp.proposedRedaction}&rdquo;
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 4. ENAM AGEN SPESIALIS AI LKPJ & GENERATOR 4 PAKET RAPAT PARIPURNA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 6 AGEN SPESIALIS AI LKPJ */}
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-[#0D1322] p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-black">
                  Enam Fungsi Agen AI Evaluasi LKPJ (Bekerja di Atas Matriks Temuan yang Sama)
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <select
                  value={selectedSpecialist}
                  onChange={(e) => setSelectedSpecialist(e.target.value as LkpjAiSpecialistRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl font-bold border border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/40"
                >
                  {Object.entries(SPECIALIST_ROLE_LABELS).map(([roleKey, label]) => (
                    <option key={roleKey} value={roleKey}>
                      {label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Instruksi tambahan untuk Agen Spesialis (opsional)..."
                  value={specialistInstruction}
                  onChange={(e) => setSpecialistInstruction(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />

                <Button
                  onClick={handleRunSpecialistAi}
                  disabled={specialistLoading}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  {specialistLoading
                    ? 'Menjalankan Agen Spesialis LKPJ...'
                    : `Jalankan ${SPECIALIST_ROLE_LABELS[selectedSpecialist]}`}
                </Button>
              </div>

              {specialistResult && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {specialistResult.specialistLabel}
                    </span>
                    <span>
                      Trace: {specialistResult.telemetry.traceId} ({specialistResult.telemetry.totalTokens} token)
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-xs whitespace-pre-wrap leading-relaxed">
                    {specialistResult.analysisMarkdown}
                  </div>
                </div>
              )}
            </div>

            {/* GENERATOR 4 PAKET RAPAT & REGISTER TINDAK LANJUT PASCAPARIPURNA */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-4">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-black">
                  Generator 4 Paket Rapat DPRD & Register Tindak Lanjut Pascaparipurna
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Button
                  variant={
                    selectedPackageType === LkpjMeetingPackageType.CLARIFICATION_MEETING
                      ? 'primary'
                      : 'outline'
                  }
                  onClick={() =>
                    handleGenerateMeetingPackage(LkpjMeetingPackageType.CLARIFICATION_MEETING)
                  }
                >
                  1. Paket Rapat Klarifikasi OPD
                </Button>
                <Button
                  variant={
                    selectedPackageType === LkpjMeetingPackageType.PRE_PLENARY_MEETING
                      ? 'primary'
                      : 'outline'
                  }
                  onClick={() =>
                    handleGenerateMeetingPackage(LkpjMeetingPackageType.PRE_PLENARY_MEETING)
                  }
                >
                  2. Paket Persiapan Paripurna
                </Button>
                <Button
                  variant={
                    selectedPackageType === LkpjMeetingPackageType.PLENARY_DECISION_PACKAGE
                      ? 'primary'
                      : 'outline'
                  }
                  onClick={() =>
                    handleGenerateMeetingPackage(LkpjMeetingPackageType.PLENARY_DECISION_PACKAGE)
                  }
                >
                  3. Paket Paripurna Hasil Pembahasan
                </Button>
                <Button
                  variant={
                    selectedPackageType === LkpjMeetingPackageType.POST_PLENARY_REGISTER
                      ? 'primary'
                      : 'outline'
                  }
                  onClick={() =>
                    handleGenerateMeetingPackage(LkpjMeetingPackageType.POST_PLENARY_REGISTER)
                  }
                >
                  4. Register Pascaparipurna
                </Button>
              </div>

              {meetingPackage && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-black text-sm">{meetingPackage.packageTitle}</div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        onClick={handleDownloadMeetingPackageMarkdown}
                        className="text-[11px] px-2.5 py-1 h-auto"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Unduh Paket (.md)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="text-[11px] px-2.5 py-1 h-auto"
                      >
                        <Printer className="h-3.5 w-3.5 mr-1" />
                        Cetak / PDF
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 whitespace-pre-wrap">
                    {meetingPackage.executiveSummaryMarkdown}
                  </div>

                  {meetingPackage.openDataRequests.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-extrabold text-amber-600 dark:text-amber-400">
                        Daftar Permintaan Verifikasi & Pemenuhan Data (Bukti Masih Terbuka: {meetingPackage.openDataRequests.length})
                      </div>
                      {meetingPackage.openDataRequests.map((req) => (
                        <div
                          key={req.findingId}
                          className="p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 text-[11px]"
                        >
                          <strong>{req.opdName}</strong> — {req.indicatorOrIssue} [{req.evidenceStatus}]:{' '}
                          {req.opdClarificationQuestion}
                        </div>
                      ))}
                    </div>
                  )}

                  {meetingPackage.officialRecommendationsRegister.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-extrabold text-indigo-600 dark:text-indigo-400">
                        Register Rumusan Rekomendasi DPRD ({meetingPackage.officialRecommendationsRegister.length})
                      </div>
                      {meetingPackage.officialRecommendationsRegister.map((rec) => (
                        <div
                          key={rec.findingId}
                          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] space-y-1"
                        >
                          <div className="font-bold">
                            [{rec.governmentAffair} &rarr; {rec.responsibleOpd}] Status Tindak Lanjut:{' '}
                            <span className="text-indigo-600">{rec.followupStatus}</span>
                          </div>
                          <div>&ldquo;{rec.recommendationText}&rdquo;</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
