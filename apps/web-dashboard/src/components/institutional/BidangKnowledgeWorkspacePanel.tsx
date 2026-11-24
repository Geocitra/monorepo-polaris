'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Sparkles, Send, BookOpen, FileText, UploadCloud, Users } from 'lucide-react';
import {
  OrganizationUnitMemberRole,
  InstitutionalNoteVisibility,
  DatahubCategory,
  type InstitutionalUnitOverviewDto,
  type InstitutionalScopedDocumentDto,
  type InstitutionalSharedNoteDto,
  type InstitutionalAiAssistResponseDto,
} from '@polaris/shared-types';

interface BidangKnowledgeWorkspacePanelProps {
  organizationId: string;
  unitId: string;
  canManageOrg: boolean;
  onOverviewLoaded?: (overview: InstitutionalUnitOverviewDto) => void;
}

export function BidangKnowledgeWorkspacePanel({
  organizationId,
  unitId,
  canManageOrg,
  onOverviewLoaded,
}: BidangKnowledgeWorkspacePanelProps) {
  const { toast } = useToast();
  const unitFileInputRef = useRef<HTMLInputElement>(null);

  const [unitOverview, setUnitOverview] = useState<InstitutionalUnitOverviewDto | null>(null);
  const [unitDocuments, setUnitDocuments] = useState<InstitutionalScopedDocumentDto[]>([]);
  const [unitNotes, setUnitNotes] = useState<InstitutionalSharedNoteDto[]>([]);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiFocusIssue, setAiFocusIssue] = useState('');
  const [includeOrgShared, setIncludeOrgShared] = useState(true);
  const [includeRegulations, setIncludeRegulations] = useState(true);
  const [saveAsNoteTitle, setSaveAsNoteTitle] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<InstitutionalAiAssistResponseDto | null>(null);

  const [unitUploadTitle, setUnitUploadTitle] = useState('');
  const [unitUploadCategory, setUnitUploadCategory] = useState<DatahubCategory>(
    DatahubCategory.KAJIAN_AKADEMIS
  );
  const [unitUploading, setUnitUploading] = useState(false);

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteVisibility, setNewNoteVisibility] = useState<InstitutionalNoteVisibility>(
    InstitutionalNoteVisibility.UNIT_SHARED
  );
  const [creatingNote, setCreatingNote] = useState(false);

  useEffect(() => {
    if (organizationId && unitId) {
      loadBidangWorkspace();
    }
  }, [organizationId, unitId]);

  async function loadBidangWorkspace() {
    try {
      const [overview, docs, notes] = await Promise.all([
        ApiClient.request<InstitutionalUnitOverviewDto>(
          `/institutional/orgs/${organizationId}/units/${unitId}/overview`
        ),
        ApiClient.request<InstitutionalScopedDocumentDto[]>(
          `/institutional/orgs/${organizationId}/units/${unitId}/documents`
        ),
        ApiClient.request<InstitutionalSharedNoteDto[]>(
          `/institutional/orgs/${organizationId}/units/${unitId}/notes`
        ),
      ]);
      setUnitOverview(overview);
      onOverviewLoaded?.(overview);
      setUnitDocuments(docs || []);
      setUnitNotes(notes || []);
      setAiResponse(null);
    } catch (err: any) {
      toast({
        title: 'Isolasi Akses Bidang',
        description: err?.message || 'Gagal memuat ruang kerja Bidang.',
        type: 'error',
      });
    }
  }

  async function handleExecuteAiAssist() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await ApiClient.request<InstitutionalAiAssistResponseDto>(
        `/institutional/orgs/${organizationId}/units/${unitId}/ai-assist`,
        {
          method: 'POST',
          body: JSON.stringify({
            prompt: aiPrompt.trim(),
            focusIssue: aiFocusIssue.trim() || undefined,
            includeOrgSharedDocuments: includeOrgShared,
            includeNationalAndRegionalRegulations: includeRegulations,
            saveAsSharedNoteTitle: saveAsNoteTitle.trim() || undefined,
          }),
        }
      );
      setAiResponse(res);
      if (res.savedNote) {
        setUnitNotes((prev) => [res.savedNote!, ...prev]);
        setSaveAsNoteTitle('');
      }
      toast({
        title: 'Analisis AI Bidang Selesai',
        description: `Menarik ${res.scopeIsolationSummary.unitChunksRetrieved} sumber Bidang & ${res.scopeIsolationSummary.orgSharedChunksRetrieved} sumber Sekretariat.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal menjalankan AI Bidang',
        description: err?.message,
        type: 'error',
      });
    } finally {
      setAiLoading(false);
    }
  }

  async function handleUploadUnitDocument(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUnitUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (unitUploadTitle.trim()) formData.append('customTitle', unitUploadTitle.trim());
      formData.append('categoryTag', unitUploadCategory);

      await ApiClient.uploadFormData(
        `/institutional/orgs/${organizationId}/units/${unitId}/documents`,
        formData
      );
      setUnitUploadTitle('');
      await loadBidangWorkspace();
      toast({
        title: 'Dokumen Bidang Terindeks',
        description: 'Dokumen berhasil dienkapsulasi ke Knowledge Base Bidang aktif.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal mengunggah dokumen Bidang',
        description: err?.message,
        type: 'error',
      });
    } finally {
      setUnitUploading(false);
      if (unitFileInputRef.current) unitFileInputRef.current.value = '';
    }
  }

  async function handleCreateSharedNote() {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    setCreatingNote(true);
    try {
      const created = await ApiClient.request<InstitutionalSharedNoteDto>(
        `/institutional/orgs/${organizationId}/units/${unitId}/notes`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: newNoteTitle.trim(),
            contentMarkdown: newNoteContent.trim(),
            visibility: newNoteVisibility,
          }),
        }
      );
      setUnitNotes((prev) => [created, ...prev]);
      setNewNoteTitle('');
      setNewNoteContent('');
      toast({
        title: 'Catatan Bidang Tersimpan',
        description: 'Catatan kini dapat diakses oleh AI rekan satu Bidang sesuai visibilitas.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal menyimpan catatan',
        description: err?.message,
        type: 'error',
      });
    } finally {
      setCreatingNote(false);
    }
  }

  async function handlePromoteNote(noteId: string, targetVisibility: InstitutionalNoteVisibility) {
    try {
      const updated = await ApiClient.request<InstitutionalSharedNoteDto>(
        `/institutional/orgs/${organizationId}/units/${unitId}/notes/${noteId}/visibility`,
        {
          method: 'PATCH',
          body: JSON.stringify({ targetVisibility }),
        }
      );
      setUnitNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
      toast({
        title: 'Status Visibilitas Diperbarui',
        description: `Catatan berhasil dipromosikan ke ${targetVisibility}.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal mempromosikan catatan',
        description: err?.message,
        type: 'error',
      });
    }
  }

  if (!unitOverview) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-8 text-center text-xs text-slate-500">
        Memuat konteks ruang kerja Bidang...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            Bidang Aktif Terisolasi
          </div>
          <div className="text-sm font-black mt-1">
            {unitOverview.unit.parentUnitName
              ? `${unitOverview.unit.parentUnitName} → ${unitOverview.unit.name}`
              : unitOverview.unit.name}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-1">
            Peran Anda: {unitOverview.myUnitRole}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            Dokumen Internal Bidang
          </div>
          <div className="text-2xl font-black mt-1">
            {unitOverview.knowledgeStats.unitDocumentsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Hanya diakses AI anggota {unitOverview.unit.name}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            Dokumen Resmi Sekretariat
          </div>
          <div className="text-2xl font-black mt-1">
            {unitOverview.knowledgeStats.orgSharedDocumentsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            LKPJ / RPJMD / APBD ({unitOverview.organization.name})
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase">
            Catatan & Temuan Bidang
          </div>
          <div className="text-2xl font-black mt-1">
            {unitOverview.knowledgeStats.unitNotesCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {unitOverview.members.length} anggota saling terhubung
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-white dark:bg-[#0D1322] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-black">
                  Konsultasi AI Tenaga Ahli Bidang ({unitOverview.unit.name})
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Scope: UNIT_BIDANG + ORG_SHARED + GLOBAL_LEGAL
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                placeholder="Fokus Isu / Urusan (opsional, misal: Layanan Air Minum)"
                value={aiFocusIssue}
                onChange={(e) => setAiFocusIssue(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
              <input
                type="text"
                placeholder="Simpan hasil otomatis sebagai Catatan Bidang (isi judul jika ingin simpan)"
                value={saveAsNoteTitle}
                onChange={(e) => setSaveAsNoteTitle(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <textarea
              rows={4}
              placeholder={`Tanyakan analisis kinerja, perbandingan target RPJMD vs realisasi LKPJ, atau draf rekomendasi untuk ${unitOverview.unit.name}...`}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full p-3.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeOrgShared}
                    onChange={(e) => setIncludeOrgShared(e.target.checked)}
                  />
                  Sertakan Dokumen Resmi Sekretariat (ORG_SHARED)
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRegulations}
                    onChange={(e) => setIncludeRegulations(e.target.checked)}
                  />
                  Sertakan Regulasi Nasional & Perda
                </label>
              </div>

              <Button
                onClick={handleExecuteAiAssist}
                disabled={aiLoading || !aiPrompt.trim()}
              >
                <Send className="h-4 w-4 mr-1.5" />
                {aiLoading ? 'Menganalisis Bukti Bidang...' : 'Analisis dengan AI Bidang'}
              </Button>
            </div>

            {aiResponse && (
              <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl text-[11px]">
                  <div className="font-bold text-slate-700 dark:text-slate-200">
                    Bukti Terverifikasi: {aiResponse.scopeIsolationSummary.unitChunksRetrieved} Dokumen Bidang &bull;{' '}
                    {aiResponse.scopeIsolationSummary.unitNotesRetrieved} Catatan Bidang &bull;{' '}
                    {aiResponse.scopeIsolationSummary.orgSharedChunksRetrieved} Dokumen Sekretariat &bull;{' '}
                    {aiResponse.scopeIsolationSummary.regulationChunksRetrieved} Regulasi
                  </div>
                  <div className="text-slate-400">
                    Trace: {aiResponse.telemetry.traceId} ({aiResponse.telemetry.totalTokens} token)
                  </div>
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-xs sm:text-sm leading-relaxed p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800">
                  {aiResponse.answerMarkdown}
                </div>

                {aiResponse.citations.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-extrabold text-slate-500">
                      Rujukan Bukti & Kutipan Sumber ({aiResponse.citations.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {aiResponse.citations.map((cit, idx) => (
                        <div
                          key={`${cit.sourceId}-${idx}`}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                              [{cit.sourceType}] {cit.title}
                            </span>
                            <span className="text-slate-400">{cit.reference}</span>
                          </div>
                          <p className="text-slate-500 line-clamp-2">{cit.excerpt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-6 space-y-4">
            <h3 className="text-sm font-extrabold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              Catatan Kerja & Temuan Bersama ({unitOverview.unit.name})
            </h3>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Judul Catatan / Temuan Bidang..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <select
                  value={newNoteVisibility}
                  onChange={(e) =>
                    setNewNoteVisibility(e.target.value as InstitutionalNoteVisibility)
                  }
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value={InstitutionalNoteVisibility.UNIT_SHARED}>
                    UNIT_SHARED (Dibagikan ke AI Bidang Ini)
                  </option>
                  <option value={InstitutionalNoteVisibility.PRIVATE_DRAFT}>
                    PRIVATE_DRAFT (Draf Pribadi Saya)
                  </option>
                </select>
              </div>
              <textarea
                rows={3}
                placeholder="Isi analisis, catatan klarifikasi OPD, atau usulan rekomendasi Bidang..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <Button
                onClick={handleCreateSharedNote}
                disabled={creatingNote || !newNoteTitle.trim() || !newNoteContent.trim()}
              >
                Simpan Catatan ke Ruang Kerja Bidang
              </Button>
            </div>

            <div className="space-y-3">
              {unitNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-sm">{note.title}</span>
                      <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {note.visibility}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Oleh: <strong>{note.authorName}</strong>
                      {note.approvedByName && ` • Disahkan: ${note.approvedByName}`}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {note.contentMarkdown}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {note.visibility === InstitutionalNoteVisibility.PRIVATE_DRAFT && (
                      <button
                        onClick={() =>
                          handlePromoteNote(note.id, InstitutionalNoteVisibility.UNIT_SHARED)
                        }
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                      >
                        Bagikan ke Bidang (UNIT_SHARED)
                      </button>
                    )}
                    {(unitOverview.myUnitRole === OrganizationUnitMemberRole.UNIT_LEAD ||
                      unitOverview.myUnitRole === OrganizationUnitMemberRole.REVIEWER ||
                      canManageOrg) &&
                      note.visibility === InstitutionalNoteVisibility.UNIT_SHARED && (
                        <button
                          onClick={() =>
                            handlePromoteNote(
                              note.id,
                              InstitutionalNoteVisibility.PARENT_UNIT_ENDORSED
                            )
                          }
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                        >
                          Sahkan sebagai Sikap Fraksi/Komisi (PARENT_UNIT_ENDORSED)
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-4">
            <h3 className="text-sm font-extrabold flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              Unggah Dokumen Internal Bidang ({unitOverview.unit.code})
            </h3>
            <p className="text-[11px] text-slate-500">
              Dokumen yang diunggah di sini terkunci dengan scope <strong>UNIT_BIDANG</strong> — otomatis dipelajari oleh AI seluruh anggota {unitOverview.unit.name}, namun tertutup bagi Bidang/Fraksi lain.
            </p>
            <div className="space-y-2.5 text-xs">
              <input
                type="text"
                placeholder="Judul Dokumen Bidang (opsional)"
                value={unitUploadTitle}
                onChange={(e) => setUnitUploadTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              />
              <select
                value={unitUploadCategory}
                onChange={(e) => setUnitUploadCategory(e.target.value as DatahubCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                {Object.values(DatahubCategory).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                ref={unitFileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md,.csv,.png,.jpg,.jpeg"
                onChange={handleUploadUnitDocument}
                className="hidden"
              />
              <Button
                onClick={() => unitFileInputRef.current?.click()}
                disabled={unitUploading}
                className="w-full"
              >
                <UploadCloud className="h-4 w-4 mr-1.5" />
                {unitUploading ? 'Mengindeks ke Vektor Bidang...' : 'Unggah Dokumen ke Bidang Ini'}
              </Button>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-xs font-extrabold text-slate-500">
                Repositori Terakses oleh AI Bidang Ini ({unitDocuments.length})
              </div>
              {unitDocuments.map((doc) => (
                <div
                  key={doc.refId}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold truncate">{doc.title}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black shrink-0 ${
                        doc.privacyScope === 'UNIT_BIDANG'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {doc.privacyScope}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Oleh: {doc.uploadedByName} &bull; {doc.chunkCount} chunk ({doc.tokenCount} token)
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-5 space-y-3">
            <h3 className="text-sm font-extrabold flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              Anggota & Tenaga Ahli di Bidang Ini ({unitOverview.members.length})
            </h3>
            <div className="space-y-2">
              {unitOverview.members.map((m) => (
                <div
                  key={m.tenantId}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div>
                    <div className="font-bold">{m.fullName}</div>
                    <div className="text-[11px] text-slate-400">{m.email}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800">
                    {m.unitRole}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
