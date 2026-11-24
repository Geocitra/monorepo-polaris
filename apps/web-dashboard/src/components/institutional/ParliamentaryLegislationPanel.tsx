'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  Scale,
  BookOpenCheck,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Send,
  Sparkles,
  FileCheck2,
  Newspaper,
  CalendarClock,
  MessageSquarePlus,
} from 'lucide-react';
import {
  ParliamentaryDocumentCategory,
  LegislationStage,
  ClauseInspectionStatus,
  LegalRuleVerificationStatus,
  DimEntryStatus,
  PerformanceAchievementLevel,
  PerformanceContributionScope,
  type LegalKnowledgeVersionDto,
  type LegislationDraftDto,
  type ClauseComplianceCriticResponseDto,
  type DailyMemberBriefingResponseDto,
  type PerformanceEvidenceRegisterDto,
  type PerformancePublicationDraftResponseDto,
  type LkpjEvaluationWorkspaceDto,
  type LkpjWorkspaceDashboardDto,
  type LkpjFindingDto,
} from '@polaris/shared-types';

interface ParliamentaryLegislationPanelProps {
  organizationId: string;
  organizationName: string;
  activeUnitId?: string;
  activeUnitName?: string;
}

export function ParliamentaryLegislationPanel({
  organizationId,
  organizationName,
  activeUnitId,
  activeUnitName,
}: ParliamentaryLegislationPanelProps) {
  const { toast } = useToast();

  const [legalRules, setLegalRules] = useState<LegalKnowledgeVersionDto[]>([]);
  const [drafts, setDrafts] = useState<LegislationDraftDto[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const [selectedDraftDetail, setSelectedDraftDetail] = useState<LegislationDraftDto | null>(null);
  const [evidences, setEvidences] = useState<PerformanceEvidenceRegisterDto[]>([]);

  // Basis Pengetahuan Hukum Form (Perda / Tata Tertib)
  const [showLegalRuleForm, setShowLegalRuleForm] = useState(false);
  const [ruleCode, setRuleCode] = useState('');
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleHierarchyLayer, setRuleHierarchyLayer] = useState('PERDA');
  const [ruleJurisdictionRegion, setRuleJurisdictionRegion] = useState(organizationName);
  const [ruleEffectiveDate, setRuleEffectiveDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [ruleVerificationStatus, setRuleVerificationStatus] = useState<LegalRuleVerificationStatus>(
    LegalRuleVerificationStatus.VERIFIED_ACTIVE
  );
  const [ruleAmendmentSummary, setRuleAmendmentSummary] = useState('');
  const [savingRule, setSavingRule] = useState(false);

  // Inline DIM Status & Tindak Lanjut Editor
  const [dimStatusDrafts, setDimStatusDrafts] = useState<Record<string, DimEntryStatus>>({});
  const [dimResponseDrafts, setDimResponseDrafts] = useState<Record<string, string>>({});
  const [savingDimId, setSavingDimId] = useState<string | null>(null);

  // LKPJ Finding -> Performance Evidence Shortcut
  const [lkpjFindings, setLkpjFindings] = useState<LkpjFindingDto[]>([]);
  const [loadingLkpjFindings, setLoadingLkpjFindings] = useState(false);
  const [evLkpjFindingId, setEvLkpjFindingId] = useState('');

  // Create Legislation Draft Form
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCategory, setDraftCategory] = useState<ParliamentaryDocumentCategory>(
    ParliamentaryDocumentCategory.PRODUK_HUKUM
  );
  const [problemStatement, setProblemStatement] = useState('');

  // Add Clause + Inspection Sheet Form
  const [clauseNumber, setClauseNumber] = useState('Pasal 12');
  const [clauseTitle, setClauseTitle] = useState('Kewajiban Pelayanan & Sanksi Administratif');
  const [clauseText, setClauseText] = useState('');
  const [legalAuthoritySource, setLegalAuthoritySource] = useState(
    'UU-12-2011-JO-UU-1-2026 & Permendagri 80/2015'
  );
  const [regulatedSubjects, setRegulatedSubjects] = useState('Dinas Teknis Terkait & Pelaku Usaha');
  const [impactAssessment, setImpactAssessment] = useState('');
  const [supervisionMechanism, setSupervisionMechanism] = useState('');

  // Compliance Critic Result
  const [criticResult, setCriticResult] = useState<ClauseComplianceCriticResponseDto | null>(null);

  // DIM & Public Participation Form
  const [dimSource, setDimSource] = useState('Fraksi / Konsultasi Publik Warga');
  const [dimIsPublic, setDimIsPublic] = useState(true);
  const [dimTargetClause, setDimTargetClause] = useState('Pasal 12');
  const [dimIssue, setDimIssue] = useState('');
  const [dimAmendment, setDimAmendment] = useState('');

  // Daily Member Briefing Form
  const [briefingAgenda, setBriefingAgenda] = useState(
    'Rapat Kerja Pembahasan Evaluasi Layanan Publik & Rancangan Peraturan Daerah'
  );
  const [briefingResult, setBriefingResult] = useState<DailyMemberBriefingResponseDto | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  // Performance Evidence Register Form
  const [evTitle, setEvTitle] = useState('');
  const [evLevel, setEvLevel] = useState<PerformanceAchievementLevel>(
    PerformanceAchievementLevel.DIREKOMENDASIKAN
  );
  const [evScope, setEvScope] = useState<PerformanceContributionScope>(
    PerformanceContributionScope.KONTRIBUSI_INDIVIDU
  );
  const [evSourceRef, setEvSourceRef] = useState('');
  const [evSummary, setEvSummary] = useState('');
  const [pubDraftResult, setPubDraftResult] =
    useState<PerformancePublicationDraftResponseDto | null>(null);

  useEffect(() => {
    if (organizationId) {
      loadAllParliamentaryData(organizationId);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId && selectedDraftId) {
      loadDraftDetail(organizationId, selectedDraftId);
    }
  }, [organizationId, selectedDraftId]);

  async function loadAllParliamentaryData(orgId: string) {
    try {
      const [rules, draftList, evidenceList] = await Promise.all([
        ApiClient.request<LegalKnowledgeVersionDto[]>(
          `/institutional/orgs/${orgId}/parliamentary/legal-rules`
        ),
        ApiClient.request<LegislationDraftDto[]>(
          `/institutional/orgs/${orgId}/parliamentary/drafts`
        ),
        ApiClient.request<PerformanceEvidenceRegisterDto[]>(
          `/institutional/orgs/${orgId}/parliamentary/performance-evidences`
        ),
      ]);
      setLegalRules(rules || []);
      setDrafts(draftList || []);
      setEvidences(evidenceList || []);
      if (draftList && draftList.length > 0 && !selectedDraftId) {
        setSelectedDraftId(draftList[0].id);
      }
    } catch (err: any) {
      toast({
        title: 'Gagal memuat modul Legislasi & Publikasi',
        description: err?.message,
        type: 'error',
      });
    }
  }

  async function loadDraftDetail(orgId: string, draftId: string) {
    try {
      const detail = await ApiClient.request<LegislationDraftDto>(
        `/institutional/orgs/${orgId}/parliamentary/drafts/${draftId}`
      );
      setSelectedDraftDetail(detail);
    } catch (err: any) {
      toast({ title: 'Gagal memuat detail rancangan', description: err?.message, type: 'error' });
    }
  }

  async function handleCreateDraft() {
    if (!draftTitle.trim()) return;
    try {
      const created = await ApiClient.request<LegislationDraftDto>(
        `/institutional/orgs/${organizationId}/parliamentary/drafts`,
        {
          method: 'POST',
          body: JSON.stringify({
            originUnitId: activeUnitId || null,
            title: draftTitle.trim(),
            documentCategory: draftCategory,
            problemStatement: problemStatement.trim() || undefined,
          }),
        }
      );
      setDraftTitle('');
      setProblemStatement('');
      await loadAllParliamentaryData(organizationId);
      setSelectedDraftId(created.id);
      toast({
        title: 'Rancangan Produk Parlemen Dibuat',
        description: `${created.title} [${created.documentCategory}]`,
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal membuat rancangan', description: err?.message, type: 'error' });
    }
  }

  async function handleStageChange(nextStage: LegislationStage) {
    if (!selectedDraftId) return;
    try {
      const updated = await ApiClient.request<LegislationDraftDto>(
        `/institutional/orgs/${organizationId}/parliamentary/drafts/${selectedDraftId}/stage`,
        {
          method: 'PATCH',
          body: JSON.stringify({ currentStage: nextStage }),
        }
      );
      setSelectedDraftDetail(updated);
      toast({
        title: 'Tahap Penyusunan Diperbarui',
        description: `Tahap saat ini: ${nextStage}`,
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal mengubah tahap penyusunan', description: err?.message, type: 'error' });
    }
  }

  async function handleAddClause() {
    if (!selectedDraftId || !clauseNumber.trim() || !clauseText.trim()) return;
    try {
      await ApiClient.request(
        `/institutional/orgs/${organizationId}/parliamentary/drafts/${selectedDraftId}/clauses`,
        {
          method: 'POST',
          body: JSON.stringify({
            clauseNumber: clauseNumber.trim(),
            clauseTitle: clauseTitle.trim() || undefined,
            clauseText: clauseText.trim(),
            legalAuthoritySource: legalAuthoritySource.trim() || undefined,
            regulatedSubjects: regulatedSubjects.trim() || undefined,
            impactAssessment: impactAssessment.trim() || undefined,
            implementationSupervision: supervisionMechanism.trim() || undefined,
          }),
        }
      );
      setClauseText('');
      await loadDraftDetail(organizationId, selectedDraftId);
      toast({
        title: 'Pasal & Lembar Pemeriksaan Disimpan',
        description: `${clauseNumber} berhasil ditambahkan ke rancangan.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal menyimpan pasal', description: err?.message, type: 'error' });
    }
  }

  async function handleRunComplianceCritic(clauseId: string) {
    if (!selectedDraftId) return;
    try {
      const res = await ApiClient.request<ClauseComplianceCriticResponseDto>(
        `/institutional/orgs/${organizationId}/parliamentary/drafts/${selectedDraftId}/clauses/${clauseId}/compliance-critic`,
        { method: 'POST' }
      );
      setCriticResult(res);
      await loadDraftDetail(organizationId, selectedDraftId);
      toast({
        title: 'Pemeriksa Kepatuhan (Maker-Checker) Selesai',
        description: `Status rekomendasi: ${res.recommendedInspectionStatus} (${res.warnings.length} peringatan)`,
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal menjalankan Compliance Critic', description: err?.message, type: 'error' });
    }
  }

  async function handleAddDimEntry() {
    if (!selectedDraftId || !dimIssue.trim() || !dimAmendment.trim()) return;
    try {
      await ApiClient.request(
        `/institutional/orgs/${organizationId}/parliamentary/drafts/${selectedDraftId}/dim`,
        {
          method: 'POST',
          body: JSON.stringify({
            sourcePartyName: dimSource.trim(),
            isPublicConsultation: dimIsPublic,
            targetClauseRef: dimTargetClause.trim(),
            issueSummary: dimIssue.trim(),
            proposedAmendment: dimAmendment.trim(),
          }),
        }
      );
      setDimIssue('');
      setDimAmendment('');
      await loadDraftDetail(organizationId, selectedDraftId);
      toast({
        title: 'Entri DIM / Partisipasi Masyarakat Tercatat',
        description: 'Masukan telah didokumentasikan sesuai Pasal 96 UU 13/2022.',
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal mencatat DIM', description: err?.message, type: 'error' });
    }
  }

  async function handleRegisterLegalRule() {
    if (!ruleCode.trim() || !ruleTitle.trim() || !ruleJurisdictionRegion.trim()) return;
    setSavingRule(true);
    try {
      await ApiClient.request(
        `/institutional/orgs/${organizationId}/parliamentary/legal-rules`,
        {
          method: 'POST',
          body: JSON.stringify({
            ruleCode: ruleCode.trim(),
            title: ruleTitle.trim(),
            hierarchyLayer: ruleHierarchyLayer,
            jurisdictionRegion: ruleJurisdictionRegion.trim(),
            effectiveDate: ruleEffectiveDate,
            verificationStatus: ruleVerificationStatus,
            amendmentSummary: ruleAmendmentSummary.trim() || undefined,
          }),
        }
      );
      const updatedRules = await ApiClient.request<LegalKnowledgeVersionDto[]>(
        `/institutional/orgs/${organizationId}/parliamentary/legal-rules`
      );
      setLegalRules(updatedRules || []);
      setRuleCode('');
      setRuleTitle('');
      setRuleAmendmentSummary('');
      setShowLegalRuleForm(false);
      toast({
        title: 'Aturan Hukum Lembaga Terdaftar',
        description: 'Peraturan daerah / tata tertib tersimpan di basis pengetahuan hukum terversi.',
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal mendaftarkan aturan hukum', description: err?.message, type: 'error' });
    } finally {
      setSavingRule(false);
    }
  }

  async function handleUpdateDimEntry(dimId: string, currentStatus: DimEntryStatus, currentResponse?: string | null) {
    if (!selectedDraftId) return;
    setSavingDimId(dimId);
    try {
      const nextStatus = dimStatusDrafts[dimId] ?? currentStatus;
      const nextResponse = (dimResponseDrafts[dimId] ?? currentResponse ?? '').trim();
      await ApiClient.request(
        `/institutional/orgs/${organizationId}/parliamentary/drafts/${selectedDraftId}/dim/${dimId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: nextStatus,
            responseAndFollowup: nextResponse || undefined,
          }),
        }
      );
      await loadDraftDetail(organizationId, selectedDraftId);
      toast({
        title: 'Status DIM Diperbarui',
        description: 'Tanggapan & tindak lanjut masukan telah dicatat.',
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal memperbarui DIM', description: err?.message, type: 'error' });
    } finally {
      setSavingDimId(null);
    }
  }

  async function handleLoadLkpjFindings() {
    setLoadingLkpjFindings(true);
    try {
      const workspaces = await ApiClient.request<LkpjEvaluationWorkspaceDto[]>(
        `/institutional/orgs/${organizationId}/lkpj/workspaces`
      );
      if (!workspaces || workspaces.length === 0) {
        setLkpjFindings([]);
        toast({ title: 'Belum ada workspace LKPJ', type: 'info' });
        return;
      }
      const dashboard = await ApiClient.request<LkpjWorkspaceDashboardDto>(
        `/institutional/orgs/${organizationId}/lkpj/workspaces/${workspaces[0].id}/dashboard`
      );
      setLkpjFindings(dashboard?.findings || []);
    } catch (err: any) {
      toast({ title: 'Gagal memuat temuan LKPJ', description: err?.message, type: 'error' });
    } finally {
      setLoadingLkpjFindings(false);
    }
  }

  function handleSelectLkpjFinding(findingId: string) {
    setEvLkpjFindingId(findingId);
    const found = lkpjFindings.find((f) => f.id === findingId);
    if (!found) return;
    setEvTitle(found.indicatorOrIssue.slice(0, 120));
    setEvSourceRef(`LKPJ ${found.fiscalYear} — ${found.opdName} (${found.sourceEvidenceRef})`);
    setEvSummary(
      found.proposedRecommendation?.trim() ||
        `${found.governmentAffair} / ${found.opdName}: ${found.indicatorOrIssue} (Realisasi ${found.realizationValue ?? '-'} ${found.indicatorUnit} vs Target ${found.targetValue ?? '-'}).`
    );
  }

  async function handleGenerateBriefing() {
    if (!activeUnitId || !briefingAgenda.trim()) return;
    setBriefingLoading(true);
    try {
      const res = await ApiClient.request<DailyMemberBriefingResponseDto>(
        `/institutional/orgs/${organizationId}/parliamentary/daily-briefing`,
        {
          method: 'POST',
          body: JSON.stringify({
            unitId: activeUnitId,
            agendaTitle: briefingAgenda.trim(),
          }),
        }
      );
      setBriefingResult(res);
      toast({
        title: 'Briefing Harian Anggota Siap',
        description: `Disusun untuk ${res.unitName} per tanggal ${res.generatedForDate}.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal menyusun briefing harian', description: err?.message, type: 'error' });
    } finally {
      setBriefingLoading(false);
    }
  }

  async function handleRegisterEvidence() {
    if (!evTitle.trim() || !evSourceRef.trim() || !evSummary.trim()) return;
    try {
      await ApiClient.request(
        `/institutional/orgs/${organizationId}/parliamentary/performance-evidences`,
        {
          method: 'POST',
          body: JSON.stringify({
            unitId: activeUnitId || null,
            lkpjFindingId: evLkpjFindingId || undefined,
            title: evTitle.trim(),
            achievementLevel: evLevel,
            contributionScope: evScope,
            evidenceSourceRef: evSourceRef.trim(),
            summaryText: evSummary.trim(),
          }),
        }
      );
      setEvTitle('');
      setEvSourceRef('');
      setEvSummary('');
      await loadAllParliamentaryData(organizationId);
      toast({
        title: 'Bukti Kinerja Terdaftar',
        description: 'Silakan verifikasi bukti sebelum menyusun draf ke Studio Publikasi.',
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal mendaftarkan bukti kinerja', description: err?.message, type: 'error' });
    }
  }

  async function handleVerifyEvidence(evidenceId: string) {
    try {
      await ApiClient.request(
        `/institutional/orgs/${organizationId}/parliamentary/performance-evidences/${evidenceId}/verify`,
        { method: 'PATCH' }
      );
      await loadAllParliamentaryData(organizationId);
      toast({
        title: 'Bukti Kinerja Terverifikasi',
        description: 'Claim Guardrail aktif: Siap dibuatkan draf ke Studio Publikasi.',
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Gagal memverifikasi bukti', description: err?.message, type: 'error' });
    }
  }

  async function handleDraftPublication(evidenceId: string) {
    try {
      const res = await ApiClient.request<PerformancePublicationDraftResponseDto>(
        `/institutional/orgs/${organizationId}/parliamentary/performance-evidences/${evidenceId}/draft-publication`,
        {
          method: 'POST',
          body: JSON.stringify({ createStudioDraft: true }),
        }
      );
      setPubDraftResult(res);
      await loadAllParliamentaryData(organizationId);
      toast({
        title: 'Draf Publikasi Terhubung ke Studio Konten',
        description: `Tingkat klaim: ${res.enforcedAchievementLevel} (${res.enforcedContributionScope})`,
        type: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Claim Guardrail Menolak', description: err?.message, type: 'error' });
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. BASIS PENGETAHUAN HUKUM TERVERSI & BRIEFING HARIAN ANGGOTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BASIS PENGETAHUAN HUKUM TERVERSI */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-black flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-indigo-600" />
              Basis Pengetahuan Hukum Terversi ({organizationName})
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Termasuk UU 1/2026 (Pasal 15)
              </span>
              <button
                type="button"
                onClick={() => setShowLegalRuleForm((prev) => !prev)}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold"
              >
                {showLegalRuleForm ? 'Tutup Form' : '+ Daftarkan Perda / Tatib'}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Setiap penugasan memeriksa status berlaku peraturan pada tanggal pengerjaan. Aturan berstatus <code>UNVERIFIED_NEEDS_CHECK</code> dilarang dijadikan dasar hukum final.
          </p>
          {showLegalRuleForm && (
            <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <input
                type="text"
                placeholder="Kode Aturan (misal: PERDA-04-2026)"
                value={ruleCode}
                onChange={(e) => setRuleCode(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                placeholder="Judul Peraturan / Tata Tertib"
                value={ruleTitle}
                onChange={(e) => setRuleTitle(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <select
                value={ruleHierarchyLayer}
                onChange={(e) => setRuleHierarchyLayer(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="PERDA">PERDA (Peraturan Daerah)</option>
                <option value="PERKADA">PERKADA (Peraturan Kepala Daerah)</option>
                <option value="TATA_TERTIB">TATA TERTIB DPRD</option>
                <option value="KEPUTUSAN_DPRD">KEPUTUSAN DPRD</option>
              </select>
              <input
                type="text"
                placeholder="Yurisdiksi / Daerah"
                value={ruleJurisdictionRegion}
                onChange={(e) => setRuleJurisdictionRegion(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <input
                type="date"
                value={ruleEffectiveDate}
                onChange={(e) => setRuleEffectiveDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <select
                value={ruleVerificationStatus}
                onChange={(e) =>
                  setRuleVerificationStatus(e.target.value as LegalRuleVerificationStatus)
                }
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value={LegalRuleVerificationStatus.VERIFIED_ACTIVE}>VERIFIED_ACTIVE</option>
                <option value={LegalRuleVerificationStatus.AMENDED}>AMENDED</option>
                <option value={LegalRuleVerificationStatus.REVOKED}>REVOKED</option>
                <option value={LegalRuleVerificationStatus.UNVERIFIED_NEEDS_CHECK}>
                  UNVERIFIED_NEEDS_CHECK
                </option>
              </select>
              <input
                type="text"
                placeholder="Ringkasan Perubahan / Catatan Berlaku (opsional)"
                value={ruleAmendmentSummary}
                onChange={(e) => setRuleAmendmentSummary(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="button"
                  disabled={savingRule || !ruleCode.trim() || !ruleTitle.trim()}
                  onClick={handleRegisterLegalRule}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold"
                >
                  {savingRule ? 'Menyimpan...' : 'Simpan Aturan Lembaga'}
                </button>
              </div>
            </div>
          )}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {legalRules.map((rule) => (
              <div
                key={rule.id}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold">{rule.ruleCode}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      rule.verificationStatus === LegalRuleVerificationStatus.VERIFIED_ACTIVE
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {rule.verificationStatus}
                  </span>
                </div>
                <div className="font-semibold text-slate-700 dark:text-slate-200">
                  {rule.title}
                </div>
                {rule.amendmentSummary && (
                  <div className="text-[11px] text-slate-500">{rule.amendmentSummary}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BRIEFING HARIAN & MENJELANG RAPAT ANGGOTA */}
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-[#0D1322] p-5 space-y-3">
          <h3 className="text-sm font-black flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-indigo-600" />
            Briefing Kerja Harian & Menjelang Rapat ({activeUnitName || 'Pilih Bidang'})
          </h3>
          <p className="text-[11px] text-slate-500">
            Menyusun 5 poin siap pakai: Agenda & Keputusan, Pokok Masalah & Data Terbaru, Dasar Hukum Relevan, Pilihan Sikap & Konsekuensi, serta Pertanyaan Kunci.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 text-xs">
            <input
              type="text"
              value={briefingAgenda}
              onChange={(e) => setBriefingAgenda(e.target.value)}
              placeholder="Judul Agenda Rapat / Raker OPD..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
            <Button
              onClick={handleGenerateBriefing}
              disabled={briefingLoading || !activeUnitId}
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              {briefingLoading ? 'Menyusun...' : 'Susun Briefing 5 Poin'}
            </Button>
          </div>
          {briefingResult && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-xs whitespace-pre-wrap max-h-56 overflow-y-auto">
              {briefingResult.briefingMarkdown}
            </div>
          )}
        </div>
      </div>

      {/* 2. RUANG KERJA LEGISLASI (9 TAHAP, EDITOR PASAL, MAKER-CHECKER CRITIC & DIM) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-base font-black flex items-center gap-2">
              <Scale className="h-5 w-5 text-indigo-600" />
              Ruang Kerja Legislasi (RUU / Raperda), Lembar Pemeriksaan Pasal & Maker-Checker Critic
            </h3>
            <p className="text-xs text-slate-500">
              Membedakan produk hukum, keputusan kelembagaan, dokumen pembahasan, dan bahan komunikasi — dilengkapi Pemeriksa Kepatuhan terpisah dari Perancang.
            </p>
          </div>

          {drafts.length > 0 && (
            <select
              value={selectedDraftId}
              onChange={(e) => setSelectedDraftId(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/40"
            >
              {drafts.map((d) => (
                <option key={d.id} value={d.id}>
                  [{d.documentCategory}] {d.title} — Tahap: {d.currentStage}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* BUAT RANCANGAN BARU */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          <input
            type="text"
            placeholder="Judul Raperda / Produk Parlemen..."
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
          <select
            value={draftCategory}
            onChange={(e) => setDraftCategory(e.target.value as ParliamentaryDocumentCategory)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            {Object.values(ParliamentaryDocumentCategory).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Button onClick={handleCreateDraft}>
            <Plus className="h-4 w-4 mr-1" />
            Buat Rancangan
          </Button>
          <input
            type="text"
            placeholder="Rumusan Masalah & Kelompok Terdampak (Tahap 1: Identifikasi Masalah)"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            className="sm:col-span-4 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        {selectedDraftDetail && (
          <div className="space-y-5 pt-2">
            {/* STAGE BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="font-extrabold">Tahap Penyusunan Aktif:</span>{' '}
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-black">
                  {selectedDraftDetail.currentStage}
                </span>
                {selectedDraftDetail.hasCriminalSanctionProvision && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-black">
                    Memuat Ketentuan Pidana (Wajib Uji UU 1/2026 Pasal 15)
                  </span>
                )}
              </div>
              <select
                value={selectedDraftDetail.currentStage}
                onChange={(e) => handleStageChange(e.target.value as LegislationStage)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
              >
                {Object.values(LegislationStage).map((st) => (
                  <option key={st} value={st}>
                    Pindah ke Tahap: {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* EDITOR PASAL & LEMBAR PEMERIKSAAN */}
              <div className="space-y-3 text-xs">
                <div className="font-extrabold">
                  Editor Pasal & Lembar Pemeriksaan Kualitas Rancangan
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nomor Pasal"
                    value={clauseNumber}
                    onChange={(e) => setClauseNumber(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Judul/Substansi Pasal"
                    value={clauseTitle}
                    onChange={(e) => setClauseTitle(e.target.value)}
                    className="col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Rumusan Norma Pasal (misal: Setiap penyelenggara wajib ... atau barangsiapa melanggar dipidana ...)"
                  value={clauseText}
                  onChange={(e) => setClauseText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Dasar Kewenangan & Sumber Hukum"
                    value={legalAuthoritySource}
                    onChange={(e) => setLegalAuthoritySource(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Subjek yang Diatur & Pelaksana"
                    value={regulatedSubjects}
                    onChange={(e) => setRegulatedSubjects(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Dampak (Masyarakat/Pelayanan/Anggaran)"
                    value={impactAssessment}
                    onChange={(e) => setImpactAssessment(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Mekanisme Pelaksanaan & Pengawasan"
                    value={supervisionMechanism}
                    onChange={(e) => setSupervisionMechanism(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <Button onClick={handleAddClause} className="w-full">
                  Simpan Pasal & Lembar Pemeriksaan
                </Button>

                {/* DAFTAR PASAL + TOMBOL MAKER-CHECKER */}
                <div className="space-y-2 pt-2">
                  {(selectedDraftDetail.clauses || []).map((cl) => (
                    <div
                      key={cl.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold">
                          {cl.clauseNumber} {cl.clauseTitle ? `— ${cl.clauseTitle}` : ''}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {cl.inspectionStatus}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{cl.clauseText}</p>
                      {cl.complianceCriticWarnings.length > 0 && (
                        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-[11px] space-y-0.5">
                          {cl.complianceCriticWarnings.map((w, i) => (
                            <div key={i}>&bull; {w}</div>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleRunComplianceCritic(cl.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                        >
                          Jalankan Pemeriksa Kepatuhan (Maker-Checker)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {criticResult && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-indigo-200 dark:border-indigo-900/50 text-xs whitespace-pre-wrap">
                    {criticResult.criticNarrativeMarkdown}
                  </div>
                )}
              </div>

              {/* DIM & PARTISIPASI MASYARAKAT (PASAL 96 UU 13/2022) */}
              <div className="space-y-3 text-xs">
                <div className="font-extrabold flex items-center gap-1.5">
                  <MessageSquarePlus className="h-4 w-4 text-indigo-500" />
                  Daftar Inventarisasi Masalah (DIM) & Partisipasi Masyarakat (Pasal 96 UU 13/2022)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Pengusul / Kelompok Masyarakat"
                    value={dimSource}
                    onChange={(e) => setDimSource(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Pasal Sasaran (misal: Pasal 12)"
                    value={dimTargetClause}
                    onChange={(e) => setDimTargetClause(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <label className="inline-flex items-center gap-1.5 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dimIsPublic}
                    onChange={(e) => setDimIsPublic(e.target.checked)}
                  />
                  Berasal dari Konsultasi Publik / Partisipasi Masyarakat (Pasal 96 UU 13/2022)
                </label>
                <input
                  type="text"
                  placeholder="Pokok Masukan / Masalah yang Diangkat..."
                  value={dimIssue}
                  onChange={(e) => setDimIssue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
                <textarea
                  rows={2}
                  placeholder="Usulan Perubahan Redaksi / Tindak Lanjut..."
                  value={dimAmendment}
                  onChange={(e) => setDimAmendment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
                <Button onClick={handleAddDimEntry} className="w-full">
                  Catat ke Matriks DIM & Partisipasi
                </Button>

                <div className="space-y-2 pt-2">
                  {(selectedDraftDetail.dimEntries || []).map((dim) => (
                    <div
                      key={dim.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold">
                          [{dim.targetClauseRef}] {dim.sourcePartyName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 dark:bg-slate-800">
                          {dim.isPublicConsultation ? 'KONSULTASI PUBLIK' : 'DIM FRAKSI/OPD'} &bull;{' '}
                          {dim.status}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300">{dim.issueSummary}</div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
                        Usulan: {dim.proposedAmendment}
                      </div>
                      {dim.responseAndFollowup && (
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 px-2.5 py-1.5 rounded-lg">
                          Tanggapan / Tindak Lanjut: {dim.responseAndFollowup}
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                        <select
                          value={dimStatusDrafts[dim.id] ?? dim.status}
                          onChange={(e) =>
                            setDimStatusDrafts((prev) => ({
                              ...prev,
                              [dim.id]: e.target.value as DimEntryStatus,
                            }))
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px]"
                        >
                          <option value={DimEntryStatus.OPEN}>OPEN</option>
                          <option value={DimEntryStatus.DISCUSSED}>DISCUSSED</option>
                          <option value={DimEntryStatus.AGREED}>AGREED</option>
                          <option value={DimEntryStatus.DEFERRED}>DEFERRED</option>
                          <option value={DimEntryStatus.REJECTED}>REJECTED</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Tanggapan rapat / tindak lanjut DIM..."
                          value={dimResponseDrafts[dim.id] ?? dim.responseAndFollowup ?? ''}
                          onChange={(e) =>
                            setDimResponseDrafts((prev) => ({
                              ...prev,
                              [dim.id]: e.target.value,
                            }))
                          }
                          className="sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px]"
                        />
                        <button
                          type="button"
                          disabled={savingDimId === dim.id}
                          onClick={() =>
                            handleUpdateDimEntry(dim.id, dim.status, dim.responseAndFollowup)
                          }
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-50 text-white text-[11px] font-bold"
                        >
                          {savingDimId === dim.id ? 'Menyimpan...' : 'Simpan DIM'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. REGISTER BUKTI KINERJA & CLAIM GUARDRAIL -> STUDIO PUBLIKASI */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-6 space-y-4">
        <div>
          <h3 className="text-base font-black flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-emerald-600" />
            Register Bukti Kinerja & Claim Guardrail &rarr; Studio Publikasi
          </h3>
          <p className="text-xs text-slate-500">
            Setiap klaim publikasi wajib terhubung ke bukti pekerjaan, mencantumkan tingkat pencapaian (diusulkan s/d menunjukkan hasil), dan membedakan kontribusi individu dari keputusan kolektif maupun pelaksanaan pemerintah.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="sm:col-span-3 flex flex-wrap items-center gap-2 pb-1">
            <button
              type="button"
              disabled={loadingLkpjFindings}
              onClick={handleLoadLkpjFindings}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold hover:bg-indigo-50"
            >
              {loadingLkpjFindings
                ? 'Memuat Temuan LKPJ...'
                : 'Ambil Shortcut dari Temuan LKPJ'}
            </button>
            {lkpjFindings.length > 0 && (
              <select
                value={evLkpjFindingId}
                onChange={(e) => handleSelectLkpjFinding(e.target.value)}
                className="flex-1 min-w-[220px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px]"
              >
                <option value="">-- Pilih Temuan LKPJ untuk prefill bukti --</option>
                {lkpjFindings.map((f) => (
                  <option key={f.id} value={f.id}>
                    [{f.fiscalYear}] {f.opdName} — {f.indicatorOrIssue.slice(0, 70)}
                  </option>
                ))}
              </select>
            )}
          </div>
          <input
            type="text"
            placeholder="Judul Bukti Kinerja (misal: Rekomendasi Perbaikan Layanan Air Minum 14 Desa)"
            value={evTitle}
            onChange={(e) => setEvTitle(e.target.value)}
            className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
          <input
            type="text"
            placeholder="Rujukan Sumber (Surat/Risalah/Nomor Rekomendasi)"
            value={evSourceRef}
            onChange={(e) => setEvSourceRef(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
          <select
            value={evLevel}
            onChange={(e) => setEvLevel(e.target.value as PerformanceAchievementLevel)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            {Object.values(PerformanceAchievementLevel).map((lv) => (
              <option key={lv} value={lv}>
                Tingkat Pencapaian: {lv}
              </option>
            ))}
          </select>
          <select
            value={evScope}
            onChange={(e) => setEvScope(e.target.value as PerformanceContributionScope)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            {Object.values(PerformanceContributionScope).map((sc) => (
              <option key={sc} value={sc}>
                Lingkup Kontribusi: {sc}
              </option>
            ))}
          </select>
          <Button onClick={handleRegisterEvidence}>
            <Plus className="h-4 w-4 mr-1" />
            Daftarkan ke Register Bukti
          </Button>
          <textarea
            rows={2}
            placeholder="Ringkasan fakta pekerjaan & hasil yang dapat dibuktikan..."
            value={evSummary}
            onChange={(e) => setEvSummary(e.target.value)}
            className="sm:col-span-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div className="space-y-2.5 text-xs">
          {evidences.map((ev) => (
            <div
              key={ev.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="font-extrabold text-sm">{ev.title}</div>
                <div className="text-[11px] text-slate-500">
                  Sumber: <strong>{ev.evidenceSourceRef}</strong> &bull; Capaian:{' '}
                  <span className="font-bold text-indigo-600">{ev.achievementLevel}</span> &bull;
                  Lingkup: <span className="font-bold">{ev.contributionScope}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-300">{ev.summaryText}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {!ev.isVerified ? (
                  <button
                    onClick={() => handleVerifyEvidence(ev.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
                  >
                    Verifikasi Fakta Bukti
                  </button>
                ) : (
                  <>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      TERVERIFIKASI
                    </span>
                    <button
                      onClick={() => handleDraftPublication(ev.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                    >
                      Kirim ke Studio Publikasi (Claim Guardrail)
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {pubDraftResult && (
          <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-xs space-y-2">
            <div className="font-black text-emerald-700 dark:text-emerald-300">
              Draf Publikasi Akuntabilitas Siap Review di Studio Konten (Tingkat: {pubDraftResult.enforcedAchievementLevel})
            </div>
            <div className="whitespace-pre-wrap">{pubDraftResult.pressReleaseMarkdown}</div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold">
              Caption Sosmed: {pubDraftResult.socialCaptionDraft}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
