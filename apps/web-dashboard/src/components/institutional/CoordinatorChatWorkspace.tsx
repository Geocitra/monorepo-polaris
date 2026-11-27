'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import {
  DatahubCategory,
  InstitutionalNoteVisibility,
  type CoordinatorChatMode,
  type CoordinatorChatResponseDto,
  type CoordinatorGuidedOptionDto,
  type CreativePosterArchetype,
  type InstitutionalChatSessionDetailDto,
  type InstitutionalScopedDocumentDto,
  type InstitutionalUnitOverviewDto,
  type ProactivePromptCardDto,
} from '@polaris/shared-types';
import { ChatComposerBar } from './chat/ChatComposerBar';
import { ChatEmptyState } from './chat/ChatEmptyState';
import { ChatMessageList, type ChatMessageViewItem } from './chat/ChatMessageList';
import { UnitLibraryDrawer } from './chat/UnitLibraryDrawer';

interface CoordinatorChatWorkspaceProps {
  organizationId: string;
  unitId: string;
  orgName?: string;
  userFullName?: string;
  canManageOrg: boolean;
  canManageUnit?: boolean;
  onQuotaUpdated?: (remaining: number, limit: number) => void;
}

function extractCsvFromMarkdown(markdown: string): string | null {
  const lines = markdown.split('\n');
  const tableLines = lines.filter((l) => l.trim().startsWith('|') && l.trim().endsWith('|'));
  if (tableLines.length < 2) return null;
  const rows = tableLines
    .filter((l) => !/^\|[\s\-:|]+\|$/.test(l.trim()))
    .map((l) =>
      l
        .trim()
        .slice(1, -1)
        .split('|')
        .map((cell) => `"${cell.trim().replace(/"/g, '""')}"`)
        .join(',')
    );
  return rows.join('\n');
}

export function CoordinatorChatWorkspace({
  organizationId,
  unitId,
  orgName,
  userFullName,
  onQuotaUpdated,
}: CoordinatorChatWorkspaceProps) {
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const hiddenUploadRef = useRef<HTMLInputElement | null>(null);

  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [resolvedFullName, setResolvedFullName] = useState<string | undefined>(userFullName);

  const [overview, setOverview] = useState<InstitutionalUnitOverviewDto | null>(null);
  const [documents, setDocuments] = useState<InstitutionalScopedDocumentDto[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [proactiveCards, setProactiveCards] = useState<ProactivePromptCardDto[]>([]);
  const [loadingProactive, setLoadingProactive] = useState(false);

  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessageViewItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatMode, setChatMode] = useState<CoordinatorChatMode>('AUTO');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '4:5' | '16:9' | '9:16'>('4:5');
  const [imageArchetype, setImageArchetype] = useState<CreativePosterArchetype | null>(null);

  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      try {
        const detail = await ApiClient.request<InstitutionalChatSessionDetailDto>(
          `/institutional/orgs/${organizationId}/units/${unitId}/chat-sessions/${sessionId}`
        );
        setActiveSessionId(detail.session.id);
        setMessages(
          (detail.messages || []).map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            routedAgents: m.routedAgents,
            detectedMode: m.detectedMode || undefined,
            generatedImageUrl: m.generatedImageUrl,
            usedCitations: m.usedCitations,
            linkedActions: m.linkedActions,
            createdAt: m.createdAt,
          }))
        );
        window.dispatchEvent(
          new CustomEvent('polaris:b2b-sessions-updated', {
            detail: { orgId: organizationId, unitId, activeSessionId: detail.session.id },
          })
        );
      } catch (err: any) {
        toast({
          title: 'Gagal membuka riwayat chat',
          description: err?.message,
          type: 'error',
        });
      }
    },
    [organizationId, toast, unitId]
  );

  const loadWorkspaceData = useCallback(async () => {
    setLoadingProactive(true);
    try {
      const [ov, docs, prompts] = await Promise.all([
        ApiClient.request<InstitutionalUnitOverviewDto>(
          `/institutional/orgs/${organizationId}/units/${unitId}/overview`
        ),
        ApiClient.request<InstitutionalScopedDocumentDto[]>(
          `/institutional/orgs/${organizationId}/units/${unitId}/documents`
        ),
        ApiClient.request<ProactivePromptCardDto[]>(
          `/institutional/orgs/${organizationId}/units/${unitId}/proactive-prompts`
        ).catch(() => []),
      ]);
      setOverview(ov);
      setDocuments(docs || []);
      setProactiveCards(Array.isArray(prompts) ? prompts : []);
    } catch (err: any) {
      toast({
        title: 'Gagal memuat ruang kerja',
        description: err?.message || 'Tidak dapat memuat konteks Bidang.',
        type: 'error',
      });
    } finally {
      setLoadingProactive(false);
    }
  }, [organizationId, toast, unitId]);

  useEffect(() => {
    if (userFullName) setResolvedFullName(userFullName);
  }, [userFullName]);

  useEffect(() => {
    ApiClient.request<{ fullName?: string; photoUrl?: string | null }>('/auth/me')
      .then((me) => {
        if (me?.fullName) setResolvedFullName(me.fullName);
        if (me?.photoUrl !== undefined) setUserPhotoUrl(me.photoUrl || null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!organizationId || !unitId) return;
    setActiveSessionId('');
    setMessages([]);
    setSelectedFileIds([]);
    loadWorkspaceData();

    if (typeof window !== 'undefined') {
      const pendingId = sessionStorage.getItem('polaris_pending_session_id');
      if (pendingId) {
        sessionStorage.removeItem('polaris_pending_session_id');
        void handleSelectSession(pendingId);
      }
    }
  }, [handleSelectSession, loadWorkspaceData, organizationId, unitId]);

  useEffect(() => {
    const onNewChat = () => {
      setActiveSessionId('');
      setMessages([]);
      setInputMessage('');
      setChatMode('AUTO');
    };
    const onOpenLibrary = () => setLibraryOpen(true);
    const onSelectFromSidebar = (ev: Event) => {
      const sid = (ev as CustomEvent).detail?.sessionId;
      if (sid) void handleSelectSession(sid);
    };

    window.addEventListener('polaris:b2b-new-chat', onNewChat);
    window.addEventListener('polaris:b2b-open-library', onOpenLibrary);
    window.addEventListener('polaris:b2b-select-session', onSelectFromSidebar);
    return () => {
      window.removeEventListener('polaris:b2b-new-chat', onNewChat);
      window.removeEventListener('polaris:b2b-open-library', onOpenLibrary);
      window.removeEventListener('polaris:b2b-select-session', onSelectFromSidebar);
    };
  }, [handleSelectSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function handleUploadFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const inferredCategory =
        chatMode === 'LKPJ_FINANCE'
          ? DatahubCategory.ANGGARAN_APBD
          : chatMode === 'LEGISLATION'
            ? DatahubCategory.REGULASI_DAERAH
            : DatahubCategory.DOKUMEN_INTERNAL;
      formData.append('categoryTag', inferredCategory);

      const created = await ApiClient.uploadFormData<{ fileId?: string }>(
        `/institutional/orgs/${organizationId}/units/${unitId}/documents`,
        formData
      );

      toast({
        title: 'Dokumen Berhasil Diunggah',
        description: `${file.name} telah dilampirkan ke konteks chat Bidang.`,
        type: 'success',
      });

      const docs = await ApiClient.request<InstitutionalScopedDocumentDto[]>(
        `/institutional/orgs/${organizationId}/units/${unitId}/documents`
      );
      setDocuments(docs || []);
      const newId = created?.fileId || docs?.[0]?.fileId;
      if (newId) {
        setSelectedFileIds((prev) => (prev.includes(newId) ? prev : [...prev, newId]));
      }
    } catch (err: any) {
      toast({
        title: 'Gagal Mengunggah Dokumen',
        description: err?.message || 'Pastikan format PDF/Excel/Word valid.',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleSendMessage(
    overridePrompt?: string,
    overrideMode?: CoordinatorChatMode,
    skipClarification = false
  ) {
    const activeMode = overrideMode ?? chatMode;
    const rawText = (overridePrompt ?? inputMessage).trim();
    const text =
      rawText ||
      (activeMode === 'LKPJ_FINANCE'
        ? 'Evaluasi LKPJ'
        : activeMode === 'LEGISLATION'
          ? 'Telaah Legislasi'
          : activeMode === 'BRIEFING'
            ? 'Susun briefing rapat 5 poin untuk agenda bidang ini.'
            : '');
    if (!text || sending) return;

    const userMsg: ChatMessageViewItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMsg]);
    if (!overridePrompt) setInputMessage('');
    setSending(true);

    try {
      const res = await ApiClient.request<CoordinatorChatResponseDto>(
        `/institutional/orgs/${organizationId}/units/${unitId}/coordinator-chat`,
        {
          method: 'POST',
          body: JSON.stringify({
            sessionId: activeSessionId || undefined,
            message: text,
            mode: activeMode,
            history: historyPayload,
            selectedFileIds: selectedFileIds.length > 0 ? selectedFileIds : undefined,
            includeOrgSharedDocuments: true,
            includeNationalAndRegionalRegulations: true,
            imageAspectRatio,
            imageArchetype: activeMode === 'IMAGE' && imageArchetype ? imageArchetype : undefined,
            skipClarification,
          }),
        }
      );

      if (res.sessionId) {
        setActiveSessionId(res.sessionId);
        window.dispatchEvent(
          new CustomEvent('polaris:b2b-sessions-updated', {
            detail: { orgId: organizationId, unitId, activeSessionId: res.sessionId },
          })
        );
      }

      if (typeof res.quotaRemainingWeekly === 'number' && typeof res.quotaWeeklyLimit === 'number') {
        onQuotaUpdated?.(res.quotaRemainingWeekly, res.quotaWeeklyLimit);
      }

      const assistantMsg: ChatMessageViewItem = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: res.assistantMessage,
        routedAgents: res.routedAgents,
        detectedMode: res.detectedMode,
        generatedImageUrl: res.generatedImageUrl,
        usedCitations: res.usedCitations,
        guidedQuestion: res.guidedQuestion,
        linkedActions: res.linkedActions,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      toast({
        title: 'Gagal Memproses Chat',
        description: err?.message || 'Terjadi kendala saat menghubungi Koordinator POLARIS.',
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  }

  function handleSelectGuidedOption(opt: CoordinatorGuidedOptionDto) {
    if (opt.requiresUpload) {
      hiddenUploadRef.current?.click();
      return;
    }
    if (opt.requiresLibraryPick) {
      setLibraryOpen(true);
      return;
    }
    if (opt.nextMessage) {
      void handleSendMessage(opt.nextMessage, opt.mode || chatMode, true);
    }
  }

  async function handleSaveAsNote(msg: ChatMessageViewItem) {
    try {
      const title =
        msg.content.replace(/[#*`]/g, '').trim().split('\n')[0]?.slice(0, 80) ||
        'Catatan Analisis POLARIS';
      await ApiClient.request(`/institutional/orgs/${organizationId}/units/${unitId}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          title,
          contentMarkdown: msg.content,
          visibility: InstitutionalNoteVisibility.UNIT_SHARED,
          sourceFileIds: selectedFileIds,
        }),
      });
      toast({
        title: 'Tersimpan ke Catatan Bidang',
        description: 'Hasil analisis kini dapat dibaca seluruh anggota Bidang.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal menyimpan catatan',
        description: err?.message,
        type: 'error',
      });
    }
  }

  function handleCopyMessage(msg: ChatMessageViewItem) {
    navigator.clipboard
      ?.writeText(msg.content)
      .then(() => toast({ title: 'Teks jawaban disalin', type: 'success' }))
      .catch(() => toast({ title: 'Gagal menyalin teks', type: 'error' }));
  }

  function handleFollowUpAction(msg: ChatMessageViewItem, targetMode: 'ARTICLE' | 'IMAGE') {
    const excerpt = msg.content.replace(/[#*`]/g, '').trim().slice(0, 700);
    setChatMode(targetMode);
    if (targetMode === 'ARTICLE') {
      void handleSendMessage(
        `Ubah hasil analisis berikut menjadi draf artikel opini & rilis media resmi yang siap dibagikan:\n\n${excerpt}`,
        'ARTICLE',
        true
      );
    } else {
      void handleSendMessage(
        `Buatkan poster infografis yang merangkum poin kunci berikut secara ringkas dan mudah dibaca:\n\n${excerpt}`,
        'IMAGE',
        true
      );
    }
  }

  function handleExportCsv(markdown: string) {
    const csv = extractCsvFromMarkdown(markdown);
    if (!csv) {
      toast({ title: 'Tidak ditemukan tabel pada pesan ini', type: 'warning' });
      return;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polaris-tabel-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const selectedDocs = documents.filter((d) => selectedFileIds.includes(d.fileId));

  const composer = (
    <ChatComposerBar
      input={inputMessage}
      onChangeInput={setInputMessage}
      mode={chatMode}
      onChangeMode={setChatMode}
      imageAspectRatio={imageAspectRatio}
      onChangeAspectRatio={setImageAspectRatio}
      imageArchetype={imageArchetype}
      onChangeImageArchetype={setImageArchetype}
      selectedDocs={selectedDocs}
      onRemoveDoc={(fid) => setSelectedFileIds((prev) => prev.filter((id) => id !== fid))}
      onOpenLibrary={() => setLibraryOpen(true)}
      onUploadFile={handleUploadFile}
      uploadingFile={uploading}
      sending={sending}
      autocompleteEndpoint={
        organizationId && unitId
          ? `/institutional/orgs/${organizationId}/units/${unitId}/prompt-autocomplete`
          : null
      }
      onSend={handleSendMessage}
      centered={messages.length === 0}
    />
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <input
        ref={hiddenUploadRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            void handleUploadFile(f);
            e.target.value = '';
          }
        }}
      />

      {messages.length === 0 ? (
        <ChatEmptyState
          userFullName={resolvedFullName}
          userPhotoUrl={userPhotoUrl}
          orgName={orgName}
          unitName={overview?.unit.name}
          activeMode={chatMode}
          proactiveCards={proactiveCards}
          loadingProactive={loadingProactive}
          onSelectProactiveCard={(card) => {
            setChatMode(card.mode);
            void handleSendMessage(card.prompt, card.mode, true);
          }}
          onSelectQuickMode={(mode, prefillPrompt) => {
            setChatMode(mode);
            if (prefillPrompt) {
              setInputMessage(prefillPrompt);
            }
          }}
          composerSlot={composer}
        />
      ) : (
        <>
          <ChatMessageList
            messages={messages}
            sending={sending}
            activeMode={chatMode}
            unitName={overview?.unit.name}
            onSelectGuidedOption={handleSelectGuidedOption}
            onSaveAsNote={handleSaveAsNote}
            onExportCsv={handleExportCsv}
            onCopyMessage={handleCopyMessage}
            onFollowUpAction={handleFollowUpAction}
            bottomRef={bottomRef}
          />
          <div className="shrink-0 pt-2 pb-3 px-3 sm:px-6 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-[#070A12] dark:via-[#070A12]/90">
            {composer}
          </div>
        </>
      )}

      <UnitLibraryDrawer
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        documents={documents}
        selectedFileIds={selectedFileIds}
        onToggleFile={(fid) =>
          setSelectedFileIds((prev) =>
            prev.includes(fid) ? prev.filter((id) => id !== fid) : [...prev, fid]
          )
        }
        onUploadFile={handleUploadFile}
        uploading={uploading}
      />
    </div>
  );
}
