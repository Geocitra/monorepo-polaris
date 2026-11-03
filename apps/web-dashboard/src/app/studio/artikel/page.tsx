'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { getPortalUrl } from '@/lib/urls';
import { useToast } from '@/components/ui/toast';
import { ShieldAlert, Loader2 } from 'lucide-react';
import type { Editor } from '@tiptap/react';

import { WritingStyleSelector, WritingStyle, LengthTarget, WRITING_STYLES } from '@/components/studio/artikel/WritingStyleSelector';
import { VisualDocumentCanvas } from '@/components/studio/artikel/VisualDocumentCanvas';
import { TiptapExecutiveEditor } from '@/components/studio/artikel/TiptapExecutiveEditor';
import { EditorToolbar } from '@/components/studio/artikel/EditorToolbar';
import { ArticleAiRefineBar } from '@/components/studio/artikel/ArticleAiRefineBar';
import { OmnichannelExportModal } from '@/components/studio/artikel/OmnichannelExportModal';
import { LockoutModal } from '@/components/studio/LockoutModal';
import { ArticleVersionHistoryDrawer } from '@/components/studio/artikel/ArticleVersionHistoryDrawer';
import { ArticleSessionDrawer } from '@/components/studio/artikel/ArticleSessionDrawer';
import { ArticleReferencesCard } from '@/components/studio/artikel/ArticleReferencesCard';
import { ArticleStudioHeader } from '@/components/studio/artikel/ArticleStudioHeader';
import { ArticleIterationBanner } from '@/components/studio/artikel/ArticleIterationBanner';
import { useArticleSessionManager } from '@/components/studio/artikel/hooks/useArticleSessionManager';

function AIArticleStudioContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // New Writing Style & Length Target States
  const [selectedLength, setSelectedLength] = useState<LengthTarget>('MEDIUM');
  const [selectedStyle, setSelectedStyle] = useState<WritingStyle>('SOLUTIF');

  // Multi-session & History Manager Hook
  const {
    articleContent,
    setArticleContent,
    sessions,
    activeSessionId,
    sessionDrawerOpen,
    setSessionDrawerOpen,
    iterations,
    historyIndex,
    historyOpen,
    setHistoryOpen,
    previewIteration,
    setPreviewIteration,
    handleContentChange,
    handleCreateNewSession,
    handleSelectSession,
    handleDeleteSession,
    handleRenameSession,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    handlePreviewVersion,
    handleRestoreVersion,
    recordIteration,
  } = useArticleSessionManager({
    selectedStyle,
    selectedLength,
    setSelectedStyle,
    setSelectedLength,
  });

  const [promptInput, setPromptInput] = useState('');
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // Omnichannel Export & Lockout Modals
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [lockoutModalOpen, setLockoutModalOpen] = useState(false);

  // View Mode: 'DOCS' (Pratinjau Dokumen A4 Resmi) | 'EDIT' (Editor Interaktif TipTap)
  const [viewMode, setViewMode] = useState<'DOCS' | 'EDIT'>('DOCS');
  const [tiptapEditor, setTiptapEditor] = useState<Editor | null>(null);
  const [isWide, setIsWide] = useState(true);
  const [zoom, setZoom] = useState<number>(100);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('polaris_article_wide_canvas');
      if (saved !== null) setIsWide(saved === 'true');
    } catch {}
  }, []);

  function toggleWide() {
    const next = !isWide;
    setIsWide(next);
    try {
      localStorage.setItem('polaris_article_wide_canvas', String(next));
    } catch {}
  }

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await ApiClient.request<any>('/auth/me');
        const billingStatus = await ApiClient.request<any>('/billing/status').catch(() => null);
        setProfile(userProfile);
        setBilling(billingStatus);
      } catch {
        router.push('/login');
      }
    }
    loadData();
  }, [router]);

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y / Ctrl+Shift+Z, Ctrl+H)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!isInput) {
          e.preventDefault();
          handleUndo();
        }
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        if (!isInput) {
          e.preventDefault();
          handleRedo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setHistoryOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, setHistoryOpen]);

  const isUnpaid = billing?.subscriptionStatus !== 'ACTIVE';
  const words = articleContent.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  async function handleAIRefine(customPrompt?: string) {
    if (isUnpaid) {
      setLockoutModalOpen(true);
      return;
    }

    const command = customPrompt || promptInput;
    if (!command.trim()) return;

    setLoading(true);
    try {
      const cfg = WRITING_STYLES[selectedStyle];
      const lengthWordMap = { SHORT: '750 kata', MEDIUM: '1.500 kata', LONG: '3.500 kata' };

      const res = await ApiClient.request<any>('/studio/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: `${command}. Target panjang: ${lengthWordMap[selectedLength]}. Gaya: ${cfg.name}. Konteks: ${articleContent.slice(0, 1000)}`,
          targetAudience: cfg.audience,
          toneOverride: cfg.tone,
          targetLength: lengthWordMap[selectedLength],
          writingStyle: selectedStyle,
          generateDallePoster: false,
        }),
      });

      const jobId = res?.jobId || res?.data?.jobId;
      const publicationId = res?.publicationId || res?.data?.publicationId;

      let refinedText = '';
      if (jobId && publicationId) {
        for (let i = 0; i < 45; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          try {
            const statusRes = await ApiClient.request<any>(`/studio/jobs/${jobId}`);
            if (statusRes?.textReady || (statusRes?.percent && statusRes.percent >= 69) || statusRes?.status === 'COMPLETED') {
              const detail = await ApiClient.request<any>(`/studio/articles/${publicationId}`);
              if (detail?.article?.bodyContentMarkdown) {
                refinedText = detail.article.bodyContentMarkdown;
                break;
              }
            }
            if (statusRes?.status === 'FAILED') {
              throw new Error(statusRes.failedReason || statusRes.errorDetails || 'Pemrosesan AI pada antrean gagal.');
            }
          } catch (pollErr: any) {
            if (pollErr.message && !pollErr.message.includes('tidak ditemukan')) {
              throw pollErr;
            }
          }
        }

        const detail = await ApiClient.request<any>(`/studio/articles/${publicationId}`);
        if (detail?.article?.bodyContentMarkdown) {
          refinedText = detail.article.bodyContentMarkdown;
        }
      } else if (res?.article?.bodyContentMarkdown) {
        refinedText = res.article.bodyContentMarkdown;
      }

      if (refinedText) {
        setArticleContent(refinedText);
        setPreviewIteration(null);
        recordIteration(
          refinedText,
          'AI',
          `AI Refine: "${command.slice(0, 60)}${command.length > 60 ? '...' : ''}" (${cfg.name})`,
          selectedStyle
        );
        toast({
          type: 'success',
          title: 'Naskah Diperbarui oleh AI',
          description: `Diselaraskan dengan gaya ${cfg.name} (${selectedLength}). Tersimpan di log riwayat.`,
        });
        setPromptInput('');
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Akses Dibatasi',
        description: err.message || 'Gagal menyempurnakan naskah.',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handlePublishToWeb() {
    if (isUnpaid) {
      setLockoutModalOpen(true);
      return;
    }

    setPublishing(true);
    try {
      await ApiClient.request<any>('/studio/articles/publish', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Kajian Kebijakan Publik Parlemen',
          bodyContentMarkdown: articleContent,
        }),
      });

      const portalDomain = getPortalUrl(profile?.subdomain, profile?.customDomain);
      const cleanSlug = 'kajian-kebijakan-publik';
      setPublishedUrl(`${portalDomain}/artikel/${cleanSlug}`);

      toast({
        type: 'success',
        title: 'Artikel Tayang di Website!',
        description: 'Telah dipublikasikan resmi di portal publik dewan Anda.',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Mempublikasikan',
        description: err.message || 'Terjadi gangguan sistem.',
      });
    } finally {
      setPublishing(false);
    }
  }

  const documentTitle = articleContent.split('\n')[0].replace(/^#\s*/, '') || 'Kajian Kebijakan Parlemen';
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  return (
    <div className="flex min-h-screen bg-slate-100/70 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans theme-transition">
      <Sidebar subdomain={profile?.subdomain} customDomain={profile?.customDomain} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          fullName={profile?.fullName}
          party={profile?.partyAffiliation}
          subdomain={profile?.subdomain} customDomain={profile?.customDomain}
          subscriptionStatus={billing?.subscriptionStatus}
          currentPeriodEnd={billing?.currentPeriodEnd}
        />

        {/* ─── TOOLBAR GOOGLE DOCS ATAS (TIPTAP WYSIWYG) ─── */}
        <EditorToolbar
          editor={tiptapEditor}
          onOpenDistribute={() => setExportModalOpen(true)}
          onOpenHistory={() => setHistoryOpen(true)}
          historyCount={iterations.length}
          onOpenSessions={() => setSessionDrawerOpen(true)}
          sessionCount={sessions.length}
          onCreateNewSession={handleCreateNewSession}
          onUndo={handleUndo}
          canUndo={canUndo}
          onRedo={handleRedo}
          canRedo={canRedo}
          zoom={zoom}
          onZoomIn={() => setZoom((prev) => Math.min(150, prev + 15))}
          onZoomOut={() => setZoom((prev) => Math.max(50, prev - 15))}
          onZoomChange={(val) => setZoom(val)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto transition-all duration-300">
          {/* HEADER NAVIGASI MINIMAL & VIEW SWITCHER */}
          <ArticleStudioHeader
            activeSession={activeSession}
            onOpenSessionDrawer={() => setSessionDrawerOpen(true)}
            onCreateNewSession={handleCreateNewSession}
            viewMode={viewMode}
            setViewMode={setViewMode}
            isWide={isWide}
            onToggleWide={toggleWide}
          />

          {/* BANNER MODE PRATINJAU VERSI LAMPAU */}
          <ArticleIterationBanner
            previewIteration={previewIteration}
            onExitPreview={() => setPreviewIteration(null)}
            onRestoreVersion={handleRestoreVersion}
          />

          {/* WARNING BANNER JIKA UNPAID */}
          {isUnpaid && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                <p className="text-xs">
                  <strong>Mode Pratinjau:</strong> Bantuan AI dan publikasi artikel memerlukan aktivasi akun POLARIS.
                </p>
              </div>
              <Link href="/billing">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer">
                  Aktivasi Lisensi
                </Button>
              </Link>
            </div>
          )}

          {/* ─── KONTROL PARAMETER: TARGET PANJANG & 4 GAYA TULISAN ─── */}
          <WritingStyleSelector
            selectedLength={selectedLength}
            onLengthChange={setSelectedLength}
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
          />

          {/* ─── AI CO-PILOT ASSISTANT BAR (PROMPT INPUT LANGSUNG DI BAWAH GAYA TULISAN) ─── */}
          <div className="w-full transition-all duration-300">
            <ArticleAiRefineBar
              promptInput={promptInput}
              setPromptInput={setPromptInput}
              onRefine={handleAIRefine}
              loading={loading}
              isUnpaid={isUnpaid}
              selectedStyle={selectedStyle}
            />
          </div>

          {/* ─── KANVAS DOKUMEN: PRATINJAU DOKUMEN (A4) ATAU SUNTING NASKAH (TIPTAP WYSIWYG) ─── */}
          {viewMode === 'DOCS' ? (
            <VisualDocumentCanvas
              content={previewIteration ? previewIteration.content : articleContent}
              onContentChange={handleContentChange}
              selectedStyle={selectedStyle}
              wordCount={wordCount}
              authorName={profile?.fullName}
              partyName={profile?.partyAffiliation}
              isSaving={saving}
              isWide={isWide}
              zoom={zoom}
            />
          ) : (
            <TiptapExecutiveEditor
              content={previewIteration ? previewIteration.content : articleContent}
              onContentChange={handleContentChange}
              selectedStyle={selectedStyle}
              authorName={profile?.fullName}
              partyName={profile?.partyAffiliation}
              isSaving={saving}
              isWide={isWide}
              zoom={zoom}
              onEditorReady={(ed) => setTiptapEditor(ed)}
            />
          )}

          {/* ─── DAFTAR RUJUKAN & BUKTI TERVERIFIKASI (EVIDENCE HUB) ─── */}
          <ArticleReferencesCard articleId={activeSession?.id || ''} />
        </main>
      </div>

      {/* ─── DRAWER RIWAYAT ITERASI & LOG AKTIVITAS ─── */}
      <ArticleVersionHistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        iterations={iterations.slice().reverse()}
        currentVersionId={iterations[historyIndex]?.id || ''}
        previewVersionId={previewIteration?.id || null}
        onPreviewVersion={handlePreviewVersion}
        onRestoreVersion={handleRestoreVersion}
        onExitPreview={() => setPreviewIteration(null)}
      />

      {/* ─── DRAWER RIWAYAT SESI CHAT & DOKUMEN (MULTI-SESSION) ─── */}
      <ArticleSessionDrawer
        isOpen={sessionDrawerOpen}
        onClose={() => setSessionDrawerOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onCreateNewSession={handleCreateNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
      />

      {/* ─── MODAL DISTRIBUSI OMNICHANNEL (WA, MEDSOS, WORD, PDF, WEB) ─── */}
      <OmnichannelExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        rawContent={articleContent}
        title={documentTitle}
        authorName={profile?.fullName}
        partyName={profile?.partyAffiliation}
        onPublishToWeb={handlePublishToWeb}
        publishing={publishing}
        publishedUrl={publishedUrl}
      />

      <LockoutModal
        isOpen={lockoutModalOpen}
        onClose={() => setLockoutModalOpen(false)}
        featureTitle="Akses AI Generator Terkunci"
        featureDescription="Penyusunan naskah otomatis berbasis AI dan publikasi website resmi hanya dapat digunakan setelah lisensi akun Anda diaktifkan."
      />
    </div>
  );
}

export default function AIArticleStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <AIArticleStudioContent />
    </Suspense>
  );
}
