'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/toast';
import { WritingStyle, LengthTarget } from '../WritingStyleSelector';
import { ArticleIteration } from '../ArticleVersionHistoryDrawer';
import { ArticleSession } from '../ArticleSessionDrawer';
import { DEFAULT_ARTICLE_MARKDOWN } from '../constants';

interface UseArticleSessionManagerProps {
  selectedStyle: WritingStyle;
  selectedLength: LengthTarget;
  setSelectedStyle: (s: WritingStyle) => void;
  setSelectedLength: (l: LengthTarget) => void;
}

export function useArticleSessionManager({
  selectedStyle,
  selectedLength,
  setSelectedStyle,
  setSelectedLength,
}: UseArticleSessionManagerProps) {
  const { toast } = useToast();

  const [articleContent, setArticleContent] = useState(DEFAULT_ARTICLE_MARKDOWN);
  const [sessions, setSessions] = useState<ArticleSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [sessionDrawerOpen, setSessionDrawerOpen] = useState(false);

  const [iterations, setIterations] = useState<ArticleIteration[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [previewIteration, setPreviewIteration] = useState<ArticleIteration | null>(null);

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

  // Debounced auto-save untuk perubahan ketik manual (2.5 detik)
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

  // Handler Multi-Sesi: Buat Sesi Baru
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
  }, [sessions, selectedStyle, selectedLength, toast]);

  // Handler Multi-Sesi: Pilih Sesi
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
  }, [sessions, setSelectedStyle, setSelectedLength, toast]);

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
  }, [sessions, activeSessionId, handleCreateNewSession, handleSelectSession, toast]);

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

  return {
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
  };
}

