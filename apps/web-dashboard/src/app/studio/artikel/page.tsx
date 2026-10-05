'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  FileText,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  Share2,
  CheckCircle2,
  Eye,
  Edit3,
  Maximize2,
  Minimize2,
  History,
  RotateCcw,
  MessageSquare,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { WritingStyleSelector, WritingStyle, LengthTarget, WRITING_STYLES } from '@/components/studio/artikel/WritingStyleSelector';
import { VisualDocumentCanvas } from '@/components/studio/artikel/VisualDocumentCanvas';
import { TiptapExecutiveEditor } from '@/components/studio/artikel/TiptapExecutiveEditor';
import type { Editor } from '@tiptap/react';
import { EditorToolbar } from '@/components/studio/artikel/EditorToolbar';
import { ArticleAiRefineBar } from '@/components/studio/artikel/ArticleAiRefineBar';
import { OmnichannelExportModal } from '@/components/studio/artikel/OmnichannelExportModal';
import { LockoutModal } from '@/components/studio/LockoutModal';
import { ArticleVersionHistoryDrawer, ArticleIteration } from '@/components/studio/artikel/ArticleVersionHistoryDrawer';
import { ArticleSessionDrawer, ArticleSession } from '@/components/studio/artikel/ArticleSessionDrawer';

const DEFAULT_ARTICLE_MARKDOWN = `# KAJIAN KEBIJAKAN PUBLIK: REFORMASI TATA KELOLA SUBSIDI PUPUK DAERAH
**Oleh: Tim Advokasi Kebijakan Parlemen**

---

### RINGKASAN EKSEKUTIF
Sektor pertanian merupakan pilar ketahanan ekonomi regional yang menopang penyerapan tenaga kerja di tingkat daerah. Melalui evaluasi regulasi dan audit fakta lapangan, kami mendorong percepatan transparansi alokasi subsidi pupuk dan penguatan sarana produksi tani desa secara terpadu.

:::metric
{
  "value": "84%",
  "label": "Kelompok Tani Terdampak",
  "description": "Mengalami kendala penebusan pupuk bersubsidi pada musim tanam kuartal II 2026."
}
:::

---

### I. LANDASAN ATURAN & REGULASI
1. **Undang-Undang Perlindungan dan Pemberdayaan Petani**.
2. **Peraturan Penyelenggaraan Kemandirian Pangan Daerah**.

---

### II. FAKTA LAPANGAN & DATA ANGGARAN
Berdasarkan data audit sektoral, alokasi anggaran pupuk daerah mengalami pergerakan signifikan namun sumbatan teknis (*bottlenecks*) rantai pasok masih terjadi di tingkat kios pengecer resmi.

:::chart
{
  "type": "bar",
  "title": "Alokasi Anggaran Subsidi Pupuk Daerah (2024–2026)",
  "unit": "Miliar Rupiah",
  "labels": ["Tahun 2024", "Tahun 2025", "Tahun 2026 (Rancangan)"],
  "datasets": [
    { "label": "Realisasi / Usulan", "data": [42.5, 58.1, 74.0] }
  ]
}
:::

| Komoditas & Sektor Wilayah | Kuota Daerah (Ton) | Realisasi Serapan (%) | Status Penyaluran Kios |
|---|---|---|---|
| Padi Sawah (Distrik Mimika Baru) | 1.250 | 92,4% | Penyaluran Lancar |
| Jagung Hibrida (Kuala Kencana) | 840 | 78,1% | Perlu Percepatan |
| Kedelai & Hortikultura (Iwaka) | 420 | 64,5% | Verifikasi Berkas Kelompok |

---

### III. REKOMENDASI AKSI KEBIJAKAN
1. **Penyelarasan Alur Distribusi**: Memastikan ketersediaan kuota pupuk tiba tepat waktu sebelum jadwal tanam serentak.
2. **Keterbukaan Data Digital**: Menyediakan saluran pengaduan langsung bagi kelompok tani berbasis tiket terintegrasi.
3. **Audit Deviasi Kios**: Menertibkan kios resmi yang melanggar harga eceran tertinggi (HET).`;

function AIArticleStudioContent() {
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Core Editor States
  const [articleContent, setArticleContent] = useState(DEFAULT_ARTICLE_MARKDOWN);
  const [promptInput, setPromptInput] = useState('');
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // New Writing Style & Length Target States
  const [selectedLength, setSelectedLength] = useState<LengthTarget>('MEDIUM');
  const [selectedStyle, setSelectedStyle] = useState<WritingStyle>('SOLUTIF');

  // Omnichannel Export Modal
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

  // ─── SESI CHAT & DOKUMEN MULTI-SESI (SESSION MANAGEMENT) ───
  const [sessions, setSessions] = useState<ArticleSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [sessionDrawerOpen, setSessionDrawerOpen] = useState(false);

  // ─── RIWAYAT ITERASI & LOG AKTIVITAS (VERSION HISTORY) ───
  const [iterations, setIterations] = useState<ArticleIteration[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [previewIteration, setPreviewIteration] = useState<ArticleIteration | null>(null);

  // Helper judul sesi dari markdown
  const extractSessionTitle = (content: string, fallback: string = 'Kajian Baru') => {
    const firstLine = content.split('\n').find((l) => l.trim().length > 0) || '';
    const clean = firstLine.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
    return clean.slice(0, 70) || fallback;
  };

  // Inisialisasi Sesi & Riwayat dari localStorage
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem('polaris_article_sessions');
      if (savedSessions) {
        const parsed: ArticleSession[] = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          const savedActiveId = localStorage.getItem('polaris_active_session_id');
          const target = parsed.find((s) => s.id === savedActiveId) || parsed[0];
          setActiveSessionId(target.id);
          setArticleContent(target.content);
          setIterations(target.iterations || []);
          setHistoryIndex((target.iterations?.length || 1) - 1);
          if (target.style) setSelectedStyle(target.style);
          if (target.length) setSelectedLength(target.length);
          return;
        }
      }
    } catch {}

    // Migrasi atau buat sesi awal
    let existingIterations: ArticleIteration[] = [];
    try {
      const savedHist = localStorage.getItem('polaris_article_iterations');
      if (savedHist) existingIterations = JSON.parse(savedHist) || [];
    } catch {}

    const initialWords = DEFAULT_ARTICLE_MARKDOWN.trim().split(/\s+/).filter(Boolean).length;
    const initialIteration: ArticleIteration = {
      id: 'iter-initial-1',
      versionNumber: 1,
      timestamp: new Date().toISOString(),
      source: 'INITIAL',
      actionSummary: 'Draf Awal Kajian Kebijakan Parlemen',
      styleUsed: 'SOLUTIF',
      wordCount: initialWords,
      deltaWords: 0,
      content: DEFAULT_ARTICLE_MARKDOWN,
    };

    const finalIterations = existingIterations.length > 0 ? existingIterations : [initialIteration];

    const initialSession: ArticleSession = {
      id: 'session-main-1',
      title: 'Optimalisasi Tata Kelola Subsidi Pupuk Daerah',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: finalIterations[finalIterations.length - 1]?.content || DEFAULT_ARTICLE_MARKDOWN,
      iterations: finalIterations,
      style: 'SOLUTIF',
      length: 'MEDIUM',
    };

    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
    setArticleContent(initialSession.content);
    setIterations(finalIterations);
    setHistoryIndex(finalIterations.length - 1);

    try {
      localStorage.setItem('polaris_article_sessions', JSON.stringify([initialSession]));
      localStorage.setItem('polaris_active_session_id', initialSession.id);
    } catch {}
  }, []);

  // Simpan perubahan naskah/iterasi ke sesi aktif secara otomatis
  const syncActiveSession = useCallback((
    updatedContent: string,
    updatedIterations: ArticleIteration[],
    style?: WritingStyle,
    length?: LengthTarget
  ) => {
    setSessions((currSessions) => {
      const title = extractSessionTitle(updatedContent);
      const next = currSessions.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: title || s.title,
            content: updatedContent,
            iterations: updatedIterations,
            updatedAt: new Date().toISOString(),
            style: style || s.style,
            length: length || s.length,
          };
        }
        return s;
      });
      try {
        localStorage.setItem('polaris_article_sessions', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [activeSessionId]);

  // Rekam iterasi baru ke state & localStorage
  const recordIteration = useCallback((
    newContent: string,
    source: 'AI' | 'MANUAL' | 'INITIAL' | 'RESTORE',
    actionSummary: string,
    style?: WritingStyle
  ) => {
    setIterations((prev) => {
      const lastIter = prev[prev.length - 1];
      const newWords = newContent.trim().split(/\s+/).filter(Boolean).length;
      const lastWords = lastIter ? lastIter.wordCount : newWords;
      const nextVersionNum = (lastIter?.versionNumber || 0) + 1;

      const newIter: ArticleIteration = {
        id: `iter-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        versionNumber: nextVersionNum,
        timestamp: new Date().toISOString(),
        source,
        actionSummary,
        styleUsed: style || selectedStyle,
        wordCount: newWords,
        deltaWords: newWords - lastWords,
        content: newContent,
      };

      const updated = [...prev, newIter].slice(-50);
      try {
        localStorage.setItem('polaris_article_iterations', JSON.stringify(updated));
      } catch {}
      setHistoryIndex(updated.length - 1);
      syncActiveSession(newContent, updated, style);
      return updated;
    });
  }, [selectedStyle, syncActiveSession]);

  // Debounced auto-save untuk perubahan ketik manual (3 detik)
  const manualTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleContentChange = useCallback((newContent: string) => {
    setArticleContent(newContent);
    if (previewIteration) setPreviewIteration(null);

    if (manualTimerRef.current) clearTimeout(manualTimerRef.current);
    manualTimerRef.current = setTimeout(() => {
      setIterations((curr) => {
        const lastIter = curr[curr.length - 1];
        if (!lastIter || lastIter.content.trim() !== newContent.trim()) {
          const newWords = newContent.trim().split(/\s+/).filter(Boolean).length;
          const lastWords = lastIter ? lastIter.wordCount : newWords;
          const newIter: ArticleIteration = {
            id: `iter-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            versionNumber: (lastIter?.versionNumber || 0) + 1,
            timestamp: new Date().toISOString(),
            source: 'MANUAL',
            actionSummary: 'Penyuntingan teks mandiri oleh staf dewan',
            styleUsed: selectedStyle,
            wordCount: newWords,
            deltaWords: newWords - lastWords,
            content: newContent,
          };
          const updated = [...curr, newIter].slice(-50);
          try {
            localStorage.setItem('polaris_article_iterations', JSON.stringify(updated));
          } catch {}
          setHistoryIndex(updated.length - 1);
          syncActiveSession(newContent, updated);
          return updated;
        }
        return curr;
      });
    }, 2500);
  }, [previewIteration, selectedStyle, syncActiveSession]);

  // Handler Multi-Sesi: Buat Sesi / Chat Baru
  const handleCreateNewSession = useCallback(() => {
    const newId = `session-${Date.now()}`;
    const newContent = `# Topik Kajian Kebijakan Baru\n\nSilakan masukkan arahan atau pertanyaan kebijakan pada bilah AI di atas untuk mulai menyusun naskah dan data bersama AI.`;
    const words = newContent.trim().split(/\s+/).filter(Boolean).length;
    const initialIter: ArticleIteration = {
      id: `iter-${Date.now()}`,
      versionNumber: 1,
      timestamp: new Date().toISOString(),
      source: 'INITIAL',
      actionSummary: 'Sesi naskah baru dimulai',
      styleUsed: selectedStyle,
      wordCount: words,
      deltaWords: 0,
      content: newContent,
    };

    const newSession: ArticleSession = {
      id: newId,
      title: `Kajian Baru #${sessions.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: newContent,
      iterations: [initialIter],
      style: selectedStyle,
      length: selectedLength,
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setActiveSessionId(newId);
    setArticleContent(newContent);
    setIterations([initialIter]);
    setHistoryIndex(0);
    setPreviewIteration(null);

    try {
      localStorage.setItem('polaris_article_sessions', JSON.stringify(updatedSessions));
      localStorage.setItem('polaris_active_session_id', newId);
    } catch {}

    toast({
      title: 'Sesi Chat & Dokumen Baru Dimulai',
      description: 'Ruang naskah bersih telah siap. Sesi sebelumnya tersimpan aman di riwayat.',
      type: 'success',
    });
  }, [sessions, selectedStyle, selectedLength]);

  // Handler Multi-Sesi: Pilih Sesi Lampau
  const handleSelectSession = useCallback((sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;

    setActiveSessionId(target.id);
    setArticleContent(target.content);
    setIterations(target.iterations || []);
    setHistoryIndex((target.iterations?.length || 1) - 1);
    if (target.style) setSelectedStyle(target.style);
    if (target.length) setSelectedLength(target.length);
    setPreviewIteration(null);

    try {
      localStorage.setItem('polaris_active_session_id', target.id);
    } catch {}

    toast({
      title: `Memuat Sesi: ${target.title}`,
      description: `Naskah dan ${target.iterations?.length || 1} iterasi riwayat telah dimuat.`,
      type: 'info',
    });
  }, [sessions]);

  // Handler Multi-Sesi: Hapus Sesi
  const handleDeleteSession = useCallback((sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    if (updated.length === 0) {
      handleCreateNewSession();
      return;
    }
    setSessions(updated);
    try {
      localStorage.setItem('polaris_article_sessions', JSON.stringify(updated));
    } catch {}

    if (activeSessionId === sessionId) {
      handleSelectSession(updated[0].id);
    }

    toast({
      title: 'Sesi Dihapus',
      description: 'Sesi naskah telah dihapus dari riwayat lokal.',
      type: 'info',
    });
  }, [sessions, activeSessionId, handleCreateNewSession, handleSelectSession]);

  // Handler Multi-Sesi: Rename Sesi
  const handleRenameSession = useCallback((sessionId: string, newTitle: string) => {
    setSessions((curr) => {
      const updated = curr.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s));
      try {
        localStorage.setItem('polaris_article_sessions', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Undo / Redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < iterations.length - 1;

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const targetIdx = historyIndex - 1;
    const targetIter = iterations[targetIdx];
    if (targetIter) {
      setHistoryIndex(targetIdx);
      setArticleContent(targetIter.content);
      setPreviewIteration(null);
      toast({
        type: 'info',
        title: `Kembali ke Versi v${targetIter.versionNumber}`,
        description: targetIter.actionSummary,
      });
    }
  }, [historyIndex, iterations, toast]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= iterations.length - 1) return;
    const targetIdx = historyIndex + 1;
    const targetIter = iterations[targetIdx];
    if (targetIter) {
      setHistoryIndex(targetIdx);
      setArticleContent(targetIter.content);
      setPreviewIteration(null);
      toast({
        type: 'info',
        title: `Maju ke Versi v${targetIter.versionNumber}`,
        description: targetIter.actionSummary,
      });
    }
  }, [historyIndex, iterations, toast]);

  function handlePreviewVersion(version: ArticleIteration) {
    setPreviewIteration(version);
  }

  function handleRestoreVersion(version: ArticleIteration) {
    setArticleContent(version.content);
    setPreviewIteration(null);
    recordIteration(
      version.content,
      'RESTORE',
      `Dipulihkan ke snapshot Versi v${version.versionNumber} (${version.actionSummary})`,
      version.styleUsed
    );
    toast({
      type: 'success',
      title: `Versi v${version.versionNumber} Berhasil Dipulihkan!`,
      description: 'Naskah aktif telah digantikan dengan snapshot versi ini.',
    });
  }

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
  }, [handleUndo, handleRedo]);

  const isUnpaid = billing?.subscriptionStatus !== 'ACTIVE';
  const words = articleContent.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Formatting Insertion Helper
  function handleInsertFormatting(prefix: string, suffix: string = '') {
    const nextContent = `${articleContent}\n\n${prefix}Teks Baru${suffix}`;
    setArticleContent(nextContent);
  }

  function handleInsertTableSample() {
    const sampleTable = `\n\n### TABEL PERBANDINGAN ALOKASI
| Sektor | Target Awal | Realisasi Lapangan | Status Deviasi |
| :--- | :--- | :--- | :--- |
| Pupuk Urea | 12.000 Ton | 9.450 Ton | Deviasi -21% |
| Pupuk NPK | 8.500 Ton | 7.800 Ton | Normal (-8%) |
| Pupuk Organik | 4.000 Ton | 2.100 Ton | Kritis (-47%) |\n`;
    setArticleContent(articleContent + sampleTable);
    toast({
      type: 'success',
      title: 'Tabel Disisipkan',
      description: 'Format tabel data telah ditambahkan ke dokumen.',
    });
  }

  function handleInsertChartSample() {
    const sampleChart = `\n\n:::chart
{
  "type": "bar",
  "title": "Evaluasi Penyaluran Sektoral",
  "unit": "Persen (%)",
  "labels": ["Kuartal I", "Kuartal II", "Kuartal III", "Kuartal IV"],
  "datasets": [
    { "label": "Capaian Target", "data": [72, 85, 91, 96] }
  ]
}
:::\n`;
    setArticleContent(articleContent + sampleChart);
    toast({
      type: 'success',
      title: 'Grafik Disisipkan',
      description: 'Grafik data kebijakan otomatis dirender di kanvas.',
    });
  }

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
          generateDalle: false,
        }),
      });

      if (res?.article?.bodyContentMarkdown) {
        const refinedText = res.article.bodyContentMarkdown;
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

      const portalDomain = profile?.subdomain
        ? `http://${profile.subdomain}.localhost:3001`
        : 'http://localhost:3001';
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
      <Sidebar subdomain={profile?.subdomain} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          fullName={profile?.fullName}
          party={profile?.partyAffiliation}
          subdomain={profile?.subdomain}
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
          {/* HEADER NAVIGASI MINIMAL (HEADERLESS) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              {/* BREADCRUMB MINIMAL */}
              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Studio</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="text-slate-700 dark:text-slate-200 font-extrabold">Artikel & Kajian</span>
              </Link>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              {/* SESI CHAT AKTIF & QUICK SWITCH */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSessionDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs transition-all cursor-pointer"
                  title="Klik untuk membuka riwayat sesi / ganti chat"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-slate-400 text-[11px]">Sesi:</span>
                  <span className="font-extrabold max-w-[180px] sm:max-w-[220px] truncate text-slate-900 dark:text-slate-100 text-[11px]">
                    {activeSession?.title || 'Kajian Baru'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={handleCreateNewSession}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 shadow-2xs transition-all cursor-pointer"
                  title="Mulai sesi naskah baru yang bersih"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Baru</span>
                </button>
              </div>
            </div>

            {/* SWITCH VIEW MODE & LEBAR KANVAS */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('DOCS')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    viewMode === 'DOCS'
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Pratinjau Dokumen (A4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('EDIT')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    viewMode === 'EDIT'
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Sunting Naskah Langsung</span>
                </button>
              </div>

              {/* TOGGLE LEBAR KANVAS */}
              <button
                type="button"
                onClick={toggleWide}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs transition-all cursor-pointer"
                title={isWide ? "Ubah ke Lebar Dokumen Standar" : "Perluas Kanvas (Layar Penuh)"}
              >
                {isWide ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5" />
                    <span>Mode Standar</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Kanvas Luas</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* BANNER MODE PRATINJAU VERSI LAMPAU */}
          {previewIteration && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-sm text-amber-900 dark:text-amber-100">
                      Pratinjau Snapshot: Versi v{previewIteration.versionNumber}
                    </span>
                    <span className="text-xs text-amber-800 dark:text-amber-300">
                      • {new Date(previewIteration.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} ({previewIteration.wordCount} kata)
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5 font-medium">
                    {previewIteration.actionSummary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewIteration(null)}
                  className="text-xs font-bold border-amber-400/50 hover:bg-amber-100/50 dark:hover:bg-amber-950/40 text-amber-900 dark:text-amber-200"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Kembali ke Draf Sekarang
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleRestoreVersion(previewIteration)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Pulihkan Versi Ini
                </Button>
              </div>
            </div>
          )}

          {/* WARNING BANNER JIKA UNPAID */}
          {isUnpaid && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                <p className="text-xs">
                  <strong>Mode Pratinjau:</strong> Bantuan AI dan publikasi website memerlukan aktivasi lisensi parlemen.
                </p>
              </div>
              <Link href="/billing">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-xs">
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
