'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Sparkles, Clock, Plus, History, RotateCcw, Eye } from 'lucide-react';

import { CampaignForm, AttachedFileItem } from '@/components/studio/terpadu/CampaignForm';
import { CampaignPreview } from '@/components/studio/terpadu/CampaignPreview';
import { TerpaduSessionDrawer, StudioSessionItem } from '@/components/studio/terpadu/TerpaduSessionDrawer';
import type { StudioChatMessage } from '@/components/studio/terpadu/TerpaduChatCopilot';
import { TerpaduVersionDrawer, StudioIteration } from '@/components/studio/terpadu/TerpaduVersionDrawer';
import { WRITING_STYLES, type WritingStyle, type LengthTarget } from '@/components/studio/artikel/WritingStyleSelector';

const DEFAULT_TOPICS = [
  'Distribusi Pupuk Bersubsidi & Petani Daerah',
  'Perbaikan Jalan Rusak & Infrastruktur Desa',
  'Layanan Rujukan BPJS & Faskes Daerah',
  'Akses Modal Usaha UMKM & Lapangan Kerja',
];

function KampanyeTerpaduContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'article' | 'poster' | 'social'>('article');

  // Form State
  const [topic, setTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<WritingStyle>('SOLUTIF');
  const [selectedLength, setSelectedLength] = useState<LengthTarget>('MEDIUM');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileItem[]>([]);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>(DEFAULT_TOPICS);

  // Hasil
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [isBackgroundRenderingPoster, setIsBackgroundRenderingPoster] = useState(false);

  // Riwayat Sesi AI Studio Terpadu (Lapis 1 - Utas/Topik)
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [sessions, setSessions] = useState<StudioSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  // Riwayat Chat & Iterasi Prompting (Lapis 2 - Turn Chat & Version Snapshot v1, v2, v3...)
  const [chatMessages, setChatMessages] = useState<StudioChatMessage[]>([]);
  const [iterations, setIterations] = useState<StudioIteration[]>([]);
  const [currentVersionNumber, setCurrentVersionNumber] = useState<number>(1);
  const [previewVersion, setPreviewVersion] = useState<StudioIteration | null>(null);
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);
  const [refining, setRefining] = useState(false);

  const isUnpaid = billing?.subscriptionStatus !== 'ACTIVE';

  // Auto-fill dari query param (misal diklik dari Beranda)
  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      setTopic(decodeURIComponent(topicParam));
    }
  }, [searchParams]);

  // Muat data profil, billing, riwayat sesi, dan isu prioritas dari cron job briefing
  useEffect(() => {
    async function init() {
      try {
        const [p, b, briefing, arts] = await Promise.all([
          ApiClient.request<any>('/auth/me'),
          ApiClient.request<any>('/billing/status'),
          ApiClient.request<any>('/studio/morning-briefing').catch(() => null),
          ApiClient.request<any[]>('/studio/articles').catch(() => []),
        ]);
        setProfile(p);
        setBilling(b);
        setSessions(Array.isArray(arts) ? arts : []);

        // Sinkronisasi isu prioritas dari cron job crawler
        if (briefing?.priorityIssues && briefing.priorityIssues.length > 0) {
          const crawledTitles = briefing.priorityIssues.map(
            (issue: any) => `${issue.title} (${issue.location})`
          );
          setSuggestedTopics([...crawledTitles, ...DEFAULT_TOPICS].slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to init profile in kampanye terpadu', err);
      }
    }
    init();
  }, []);

  // Helper untuk sinkronisasi riwayat chat & iterasi versi lokal
  function loadSessionIterations(sessionId: string, fallbackResult?: any, promptTopic?: string) {
    try {
      const savedIters = localStorage.getItem(`polaris_terpadu_iterations_${sessionId}`);
      const savedChat = localStorage.getItem(`polaris_terpadu_chat_${sessionId}`);

      if (savedIters) {
        const parsedIters: StudioIteration[] = JSON.parse(savedIters);
        setIterations(parsedIters);
        const maxVer = parsedIters.reduce((max, it) => Math.max(max, it.versionNumber), 1);
        setCurrentVersionNumber(maxVer);
      } else if (fallbackResult?.publication) {
        const words = (fallbackResult.publication.bodyContentMarkdown || '')
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;
        const initIter: StudioIteration = {
          id: `iter-${sessionId}-1`,
          versionNumber: 1,
          timestamp: fallbackResult.publication.createdAt || new Date().toISOString(),
          promptUsed: promptTopic || fallbackResult.publication.title || '',
          actionSummary: 'Generasi Draf Awal Konten',
          wordCount: words,
          deltaWords: 0,
          articleTitle: fallbackResult.publication.title,
          articleMarkdown: fallbackResult.publication.bodyContentMarkdown,
          posterUrl: fallbackResult.posterUrl,
          socialPack: fallbackResult.socialPack,
        };
        setIterations([initIter]);
        setCurrentVersionNumber(1);
        localStorage.setItem(`polaris_terpadu_iterations_${sessionId}`, JSON.stringify([initIter]));
      } else {
        setIterations([]);
        setCurrentVersionNumber(1);
      }

      if (savedChat) {
        setChatMessages(JSON.parse(savedChat));
      } else if (fallbackResult?.publication) {
        const initChat: StudioChatMessage[] = [
          {
            id: `msg-${sessionId}-1`,
            role: 'user',
            text: `Buatkan draf konten lengkap untuk topik: "${promptTopic || fallbackResult.publication.title}"`,
            timestamp: fallbackResult.publication.createdAt || new Date().toISOString(),
          },
          {
            id: `msg-${sessionId}-2`,
            role: 'assistant',
            text: `Draf konten awal (Versi v1) telah berhasil dibuat! Meliputi naskah kajian artikel, poster visual editorial, dan materi siaran media sosial (WhatsApp & Instagram). Anda dapat memberikan instruksi revisi lanjutan di bilah chat Co-Pilot ini.`,
            timestamp: fallbackResult.publication.createdAt || new Date().toISOString(),
            versionGenerated: 1,
          },
        ];
        setChatMessages(initChat);
        localStorage.setItem(`polaris_terpadu_chat_${sessionId}`, JSON.stringify(initChat));
      } else {
        setChatMessages([]);
      }
    } catch (err) {
      console.error('Failed to load session iterations from localStorage', err);
    }
  }

  function saveSessionIterations(sessionId: string, newIters: StudioIteration[], newChat: StudioChatMessage[]) {
    try {
      localStorage.setItem(`polaris_terpadu_iterations_${sessionId}`, JSON.stringify(newIters));
      localStorage.setItem(`polaris_terpadu_chat_${sessionId}`, JSON.stringify(newChat));
    } catch {}
  }

  async function reloadSessions() {
    try {
      const arts = await ApiClient.request<any[]>('/studio/articles');
      setSessions(Array.isArray(arts) ? arts : []);
    } catch (err) {
      console.error('Failed to reload studio sessions', err);
    }
  }

  async function handleSelectSession(sessionId: string) {
    setLoadingDetailId(sessionId);
    try {
      const detail = await ApiClient.request<any>(`/studio/articles/${sessionId}`);
      if (!detail?.article) throw new Error('Data sesi tidak ditemukan');

      setTopic(detail.article.title);
      setActiveSessionId(sessionId);
      const loadedResult = {
        publication: detail.article,
        posterUrl: detail.asset?.cdnPublicUrl || detail.asset?.r2StorageUrl || '',
        socialPack: detail.socialPack,
        infographicData: detail.infographicData,
      };
      setGeneratedResult(loadedResult);

      if (detail.article.status === 'PUBLISHED' && detail.article.canonicalUrl) {
        setPublishedUrl(detail.article.canonicalUrl);
      } else {
        setPublishedUrl(null);
      }

      loadSessionIterations(sessionId, loadedResult, detail.article.title);

      setHistoryDrawerOpen(false);
      toast({
        type: 'success',
        title: 'Sesi Dimuat',
        description: `Memuat riwayat: "${detail.article.title}"`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memuat Sesi',
        description: err.message || 'Terjadi gangguan saat mengambil data sesi.',
      });
    } finally {
      setLoadingDetailId(null);
    }
  }

  function handleCreateNewSession() {
    setTopic('');
    setAttachedFiles([]);
    setGeneratedResult(null);
    setPublishedUrl(null);
    setActiveSessionId(null);
    setChatMessages([]);
    setIterations([]);
    setCurrentVersionNumber(1);
    setPreviewVersion(null);
    toast({
      type: 'info',
      title: 'Chat Baru Dimulai',
      description: 'Formulir prompt telah dikosongkan. Siap membuat konten baru.',
    });
  }

  async function handleDeleteSession(sessionId: string) {
    try {
      await ApiClient.request(`/studio/articles/${sessionId}`, {
        method: 'DELETE',
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      try {
        localStorage.removeItem(`polaris_terpadu_iterations_${sessionId}`);
        localStorage.removeItem(`polaris_terpadu_chat_${sessionId}`);
      } catch {}

      if (activeSessionId === sessionId) {
        handleCreateNewSession();
      }
      toast({
        type: 'success',
        title: 'Sesi Dihapus',
        description: 'Riwayat pembuatan konten berhasil dihapus.',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menghapus Sesi',
        description: err.message || 'Terjadi kendala saat menghapus sesi.',
      });
    }
  }

  async function handleRefineContent(promptText: string) {
    if (isUnpaid) {
      toast({
        type: 'error',
        title: 'Akses Terkunci',
        description: 'Selesaikan aktivasi lisensi terlebih dahulu untuk menggunakan AI Co-Pilot.',
      });
      return;
    }

    if (!generatedResult?.publication) {
      toast({
        type: 'error',
        title: 'Konten Belum Tersedia',
        description: 'Generate konten terlebih dahulu sebelum melakukan revisi.',
      });
      return;
    }

    const currentDoc = generatedResult.publication.bodyContentMarkdown || '';
    const currentWords = currentDoc.trim().split(/\s+/).filter(Boolean).length;
    const nextVer = currentVersionNumber + 1;
    const userMsgId = `msg-${Date.now()}-u`;
    const userMsg: StudioChatMessage = {
      id: userMsgId,
      role: 'user',
      text: promptText,
      timestamp: new Date().toISOString(),
    };

    const updatedChatWithUser = [...chatMessages, userMsg];
    setChatMessages(updatedChatWithUser);
    setRefining(true);

    try {
      const cfg = WRITING_STYLES[selectedStyle];
      const lengthWordMap = { SHORT: '750 kata', MEDIUM: '1.500 kata', LONG: '3.500 kata' };

      const res = await ApiClient.request<any>('/studio/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: `${promptText}. Instruksi penyempurnaan naskah yang sudah ada: Judul "${generatedResult.publication.title}". Konteks naskah: ${currentDoc.slice(0, 1500)}`,
          targetAudience: cfg.audience,
          toneOverride: cfg.tone,
          targetLength: lengthWordMap[selectedLength],
          writingStyle: selectedStyle,
          generateDallePoster: false,
        }),
      });

      const jobId = res?.jobId || res?.data?.jobId;
      const newPublicationId = res?.publicationId || res?.data?.publicationId;

      let refinedArticle: any = null;
      if (jobId && newPublicationId) {
        for (let i = 0; i < 45; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          try {
            const statusRes = await ApiClient.request<any>(`/studio/jobs/${jobId}`);
            if (statusRes?.status === 'COMPLETED' || (statusRes?.percent && statusRes.percent >= 100)) {
              break;
            }
            if (statusRes?.status === 'FAILED') {
              throw new Error(statusRes.failedReason || statusRes.errorDetails || 'Pemrosesan revisi gagal.');
            }
          } catch (pollErr: any) {
            if (pollErr.message && !pollErr.message.includes('tidak ditemukan')) throw pollErr;
          }
        }

        const detail = await ApiClient.request<any>(`/studio/articles/${newPublicationId}`);
        if (detail?.article) {
          refinedArticle = detail.article;
        }
      }

      if (!refinedArticle) {
        throw new Error('Gagal memuat naskah hasil revisi AI.');
      }

      const newWords = (refinedArticle.bodyContentMarkdown || '').trim().split(/\s+/).filter(Boolean).length;
      const deltaWords = newWords - currentWords;

      const newGeneratedResult = {
        ...generatedResult,
        publication: {
          ...generatedResult.publication,
          title: refinedArticle.title || generatedResult.publication.title,
          bodyContentMarkdown: refinedArticle.bodyContentMarkdown,
          excerpt: refinedArticle.excerpt || generatedResult.publication.excerpt,
        },
      };
      setGeneratedResult(newGeneratedResult);

      if (activeSessionId) {
        ApiClient.request(`/studio/articles/${activeSessionId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: newGeneratedResult.publication.title,
            bodyContentMarkdown: newGeneratedResult.publication.bodyContentMarkdown,
          }),
        }).catch((e) => console.error('Failed to sync updated draft to backend', e));
      }

      const newIter: StudioIteration = {
        id: `iter-${activeSessionId || 'sess'}-${nextVer}`,
        versionNumber: nextVer,
        timestamp: new Date().toISOString(),
        promptUsed: promptText,
        actionSummary: `Revisi AI: "${promptText.slice(0, 50)}${promptText.length > 50 ? '...' : ''}"`,
        wordCount: newWords,
        deltaWords,
        articleTitle: newGeneratedResult.publication.title,
        articleMarkdown: newGeneratedResult.publication.bodyContentMarkdown,
        posterUrl: newGeneratedResult.posterUrl,
        socialPack: newGeneratedResult.socialPack,
      };

      const updatedIters = [...iterations, newIter];
      setIterations(updatedIters);
      setCurrentVersionNumber(nextVer);

      const aiMsg: StudioChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        text: `Draf Versi v${nextVer} berhasil dibuat! Penyesuaian: "${promptText}". Naskah kini memiliki ${newWords.toLocaleString('id-ID')} kata (${deltaWords >= 0 ? `+${deltaWords}` : deltaWords} kata).`,
        timestamp: new Date().toISOString(),
        versionGenerated: nextVer,
        deltaWords,
      };
      const finalChat = [...updatedChatWithUser, aiMsg];
      setChatMessages(finalChat);

      if (activeSessionId) {
        saveSessionIterations(activeSessionId, updatedIters, finalChat);
      }

      toast({
        type: 'success',
        title: `Revisi AI Siap (Versi v${nextVer})`,
        description: `Naskah telah disesuaikan berdasarkan instruksi Anda.`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Memproses Revisi AI',
        description: err.message || 'Terjadi gangguan sistem saat memproses revisi.',
      });
    } finally {
      setRefining(false);
    }
  }

  function handlePreviewVersion(version: StudioIteration) {
    setPreviewVersion(version);
    setGeneratedResult((prev: any) => ({
      ...prev,
      publication: {
        ...prev.publication,
        title: version.articleTitle,
        bodyContentMarkdown: version.articleMarkdown,
      },
    }));
    setVersionDrawerOpen(false);
    toast({
      type: 'info',
      title: `Melihat Snapshot Versi v${version.versionNumber}`,
      description: version.actionSummary,
    });
  }

  function handleExitPreview() {
    setPreviewVersion(null);
    const activeIter = iterations.find((i) => i.versionNumber === currentVersionNumber);
    if (activeIter) {
      setGeneratedResult((prev: any) => ({
        ...prev,
        publication: {
          ...prev.publication,
          title: activeIter.articleTitle,
          bodyContentMarkdown: activeIter.articleMarkdown,
        },
      }));
    }
  }

  function handleRestoreVersion(version: StudioIteration) {
    setPreviewVersion(null);
    const nextVer = currentVersionNumber + 1;

    const restoredResult = {
      ...generatedResult,
      publication: {
        ...generatedResult.publication,
        title: version.articleTitle,
        bodyContentMarkdown: version.articleMarkdown,
      },
    };
    setGeneratedResult(restoredResult);

    if (activeSessionId) {
      ApiClient.request(`/studio/articles/${activeSessionId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: version.articleTitle,
          bodyContentMarkdown: version.articleMarkdown,
        }),
      }).catch((e) => console.error('Failed to sync restored draft to backend', e));
    }

    const restoreIter: StudioIteration = {
      id: `iter-${activeSessionId || 'sess'}-${nextVer}`,
      versionNumber: nextVer,
      timestamp: new Date().toISOString(),
      promptUsed: `Pemulihan ke snapshot v${version.versionNumber}`,
      actionSummary: `Dipulihkan ke Versi v${version.versionNumber} (${version.actionSummary})`,
      wordCount: version.wordCount,
      deltaWords: 0,
      articleTitle: version.articleTitle,
      articleMarkdown: version.articleMarkdown,
      posterUrl: version.posterUrl || generatedResult?.posterUrl,
      socialPack: version.socialPack || generatedResult?.socialPack,
    };

    const updatedIters = [...iterations, restoreIter];
    setIterations(updatedIters);
    setCurrentVersionNumber(nextVer);

    const restoreMsg: StudioChatMessage = {
      id: `msg-${Date.now()}-restore`,
      role: 'assistant',
      text: `Naskah telah dipulihkan kembali ke snapshot Versi v${version.versionNumber} dan disimpan sebagai draf aktif Versi v${nextVer}.`,
      timestamp: new Date().toISOString(),
      versionGenerated: nextVer,
    };
    const updatedChat = [...chatMessages, restoreMsg];
    setChatMessages(updatedChat);

    if (activeSessionId) {
      saveSessionIterations(activeSessionId, updatedIters, updatedChat);
    }

    setVersionDrawerOpen(false);
    toast({
      type: 'success',
      title: `Versi v${version.versionNumber} Dipulihkan!`,
      description: `Naskah aktif kini menggunakan snapshot Versi v${version.versionNumber}.`,
    });
  }

  function handleAddFiles(newFiles: AttachedFileItem[]) {
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  }

  function handleRemoveFile(id: string) {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;

    if (isUnpaid) {
      toast({
        type: 'error',
        title: 'Akses Terkunci',
        description: 'Selesaikan aktivasi lisensi terlebih dahulu untuk membuat konten.',
      });
      return;
    }

    setLoading(true);
    setIsBackgroundRenderingPoster(true);
    setPublishedUrl(null);
    setGeneratedResult(null);
    setGenerationStep(1);

    const timer1 = setTimeout(() => setGenerationStep(2), 2500);
    const timer2 = setTimeout(() => setGenerationStep(3), 5500);
    const timer3 = setTimeout(() => setGenerationStep(4), 8500);

    try {
      const styleCfg = WRITING_STYLES[selectedStyle];
      const lengthWordMap = { SHORT: '750 kata', MEDIUM: '1.500 kata', LONG: '3.500 kata' };

      const res = await ApiClient.request<any>('/studio/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          targetAudience: styleCfg.audience,
          toneOverride: styleCfg.tone,
          targetLength: lengthWordMap[selectedLength],
          writingStyle: selectedStyle,
          generateDallePoster: true,
          attachments: attachedFiles.map((f) => ({
            name: f.name,
            type: f.type,
            base64: f.base64,
          })),
        }),
      });

      const jobId = res?.jobId || res?.data?.jobId;
      const publicationId = res?.publicationId || res?.data?.publicationId;

      let finalResult: any = null;
      if (jobId && publicationId) {
        // Polling status job sampai pemrosesan AI selesai dengan Progressive Instant Delivery
        let textHydrated = false;
        for (let i = 0; i < 60; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          try {
            const statusRes = await ApiClient.request<any>(`/studio/jobs/${jobId}`);
            if (statusRes?.percent) {
              if (statusRes.percent >= 20 && statusRes.percent < 50) setGenerationStep(2);
              else if (statusRes.percent >= 50 && statusRes.percent < 85) setGenerationStep(3);
              else if (statusRes.percent >= 85) setGenerationStep(4);
            }

            // PROGRESSIVE INSTANT DELIVERY (Detik ke-8 s/d 10):
            // Begitu naskah disimpan di database, langsung tampilkan naskah di editor!
            if (!textHydrated && (statusRes?.textReady || (statusRes?.percent && statusRes.percent >= 69))) {
              textHydrated = true;
              try {
                const partialDetail = await ApiClient.request<any>(`/studio/articles/${publicationId}`);
                if (partialDetail?.article) {
                  const partialPosterUrl = partialDetail.asset?.cdnPublicUrl || partialDetail.asset?.r2StorageUrl || '';
                  const partialResult = {
                    publication: partialDetail.article,
                    posterUrl: partialPosterUrl,
                    socialPack: partialDetail.socialPack,
                    infographicData: partialDetail.infographicData,
                  };
                  if (partialPosterUrl) {
                    setIsBackgroundRenderingPoster(false);
                  }
                  setGeneratedResult(partialResult);
                  setActiveTab('article');
                  setActiveSessionId(publicationId);
                  setLoading(false); // Buka layar seketika! User tidak lagi diblokir spinner
                  reloadSessions();
                  loadSessionIterations(publicationId, partialResult, topic);

                  toast({
                    type: 'success',
                    title: '⚡ Naskah Kebijakan Siap Ditinjau!',
                    description: 'Naskah telah terbit di editor. Anda dapat langsung membaca atau mengedit sementara visual diselesaikan.',
                  });
                }
              } catch (partialErr) {
                console.warn('Gagal memuat naskah parsial progresif:', partialErr);
              }
            } else if (textHydrated) {
              // Cek progresif apakah poster visual sudah terbit di database
              try {
                const checkDetail = await ApiClient.request<any>(`/studio/articles/${publicationId}`);
                const foundPoster = checkDetail?.asset?.cdnPublicUrl || checkDetail?.asset?.r2StorageUrl;
                if (foundPoster) {
                  setGeneratedResult((prev: any) => {
                    if (!prev || prev.posterUrl === foundPoster) return prev;
                    return { ...prev, posterUrl: foundPoster };
                  });
                  setIsBackgroundRenderingPoster(false);
                }
              } catch {}
            }

            if (statusRes?.status === 'COMPLETED' || (statusRes?.percent && statusRes.percent >= 100)) {
              break;
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

        // Ambil hasil lengkap artikel, poster DALL-E, dan paket media sosial
        const detail = await ApiClient.request<any>(`/studio/articles/${publicationId}`);
        const resolvedPosterUrl = detail.asset?.cdnPublicUrl || detail.asset?.r2StorageUrl || '';
        finalResult = {
          publication: detail.article,
          posterUrl: resolvedPosterUrl,
          socialPack: detail.socialPack,
          infographicData: detail.infographicData,
        };
        setIsBackgroundRenderingPoster(false);
      }

      if (finalResult) {
        setGeneratedResult({ ...finalResult });
      } else if (res) {
        setGeneratedResult(res);
      }

      if (publicationId) {
        setActiveSessionId(publicationId);
        reloadSessions();
        loadSessionIterations(publicationId, finalResult || res, topic);
      }

      toast({
        type: 'success',
        title: 'Materi Lengkap Siap!',
        description: 'Seluruh naskah artikel, poster visual editorial, dan paket media sosial telah selesai.',
      });

      const updatedBilling = await ApiClient.request<any>('/billing/status');
      setBilling(updatedBilling);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Membuat Konten',
        description: err.message || 'Terjadi gangguan saat menghubungi server.',
      });
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setLoading(false);
      setGenerationStep(0);
    }
  }

  async function handleUpdateArticleContent(newTitle: string, newBody: string) {
    if (!generatedResult?.publication?.id) return;

    setGeneratedResult((prev: any) => ({
      ...prev,
      publication: {
        ...prev.publication,
        title: newTitle,
        bodyContentMarkdown: newBody,
      },
    }));

    try {
      await ApiClient.request(`/studio/articles/${generatedResult.publication.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: newTitle,
          bodyContentMarkdown: newBody,
        }),
      });
    } catch (err) {
      console.error('Failed to sync updated draft to backend', err);
    }
  }

  async function handlePublish() {
    if (!generatedResult?.publication?.id) return;

    if (isUnpaid) {
      toast({
        type: 'error',
        title: 'Publikasi Terkunci',
        description: 'Selesaikan aktivasi lisensi untuk menerbitkan artikel ke website.',
      });
      return;
    }

    setPublishing(true);

    try {
      const res = await ApiClient.request<any>(`/studio/articles/${generatedResult.publication.id}/publish`, {
        method: 'POST',
      });
      setPublishedUrl(res.canonicalUrl);
      toast({
        type: 'success',
        title: 'Artikel Berhasil Tayang!',
        description: 'Artikel telah terbit di website publik resmi Anda.',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menerbitkan',
        description: err.message || 'Terjadi kendala saat menerbitkan artikel.',
      });
    } finally {
      setPublishing(false);
    }
  }

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

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 transition-all duration-300">
          {/* HEADER NAVIGASI & TOMBOL RIWAYAT SESI */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* BREADCRUMB MINIMAL */}
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Studio</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-700 dark:text-slate-200 font-extrabold">Studio AI Terpadu</span>
            </Link>

            {/* ACTION DOCK: RIWAYAT SESI & SESI BARU */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHistoryDrawerOpen(true)}
                className="gap-2 text-xs font-bold rounded-xl h-8 px-3.5 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
              >
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Riwayat Sesi AI</span>
                {sessions.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold">
                    {sessions.length}
                  </span>
                )}
              </Button>

              {generatedResult && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVersionDrawerOpen(true)}
                  className="gap-2 text-xs font-bold rounded-xl h-8 px-3.5 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer shadow-2xs"
                >
                  <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Iterasi Versi (v{currentVersionNumber})</span>
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold">
                    {iterations.length} Snapshot
                  </span>
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                onClick={handleCreateNewSession}
                className="gap-1.5 text-xs font-bold rounded-xl h-8 px-3.5 bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Chat Baru</span>
              </Button>
            </div>
          </div>

          {/* BANNER NOTIFIKASI SAAT PRATINJAU VERSI LAMPAU */}
          {previewVersion && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Sedang melihat pratinjau <strong>Snapshot Versi v{previewVersion.versionNumber}</strong>: {previewVersion.actionSummary}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExitPreview}
                  className="h-7 text-xs font-bold border-amber-400/50 hover:bg-amber-100 dark:hover:bg-amber-950/40 cursor-pointer"
                >
                  Kembali ke Draf Sekarang
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleRestoreVersion(previewVersion)}
                  className="h-7 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs cursor-pointer gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Pulihkan Versi Ini</span>
                </Button>
              </div>
            </div>
          )}

          {/* FORM (ATAS) → HASIL (BAWAH) */}
          <div className="space-y-6">
            <CampaignForm
              topic={topic}
              onTopicChange={setTopic}
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
              selectedLength={selectedLength}
              onLengthChange={setSelectedLength}
              attachedFiles={attachedFiles}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveFile}
              isUnpaid={isUnpaid}
              loading={loading}
              generationStep={generationStep}
              onSubmit={handleGenerate}
              suggestedTopics={suggestedTopics}
              hasResult={!!generatedResult}
              chatMessages={chatMessages}
              onSendRevision={handleRefineContent}
              refining={refining}
              currentVersion={currentVersionNumber}
              iterationsCount={iterations.length}
              onOpenVersionDrawer={() => setVersionDrawerOpen(true)}
              onResetToNewChat={handleCreateNewSession}
              authorName={profile?.fullName || 'Tokoh Publik'}
            />

            <CampaignPreview
              generatedResult={generatedResult}
              publishedUrl={publishedUrl}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isUnpaid={isUnpaid}
              publishing={publishing}
              onPublish={handlePublish}
              onUpdateArticleContent={handleUpdateArticleContent}
              isBackgroundRenderingPoster={isBackgroundRenderingPoster}
              authorName={profile?.fullName || 'Tokoh Publik'}
              partyAffiliation={profile?.commissionName || profile?.politicalParty || ''}
            />
          </div>

          {/* DRAWER RIWAYAT SESI STUDIO AI TERPADU (LAPIS 1: THREADS) */}
          <TerpaduSessionDrawer
            isOpen={historyDrawerOpen}
            onClose={() => setHistoryDrawerOpen(false)}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onCreateNewSession={handleCreateNewSession}
            onDeleteSession={handleDeleteSession}
            loadingDetailId={loadingDetailId}
          />

          {/* DRAWER RIWAYAT ITERASI & SNAPSHOT VERSI (LAPIS 2: PROMPT ITERATIONS) */}
          <TerpaduVersionDrawer
            isOpen={versionDrawerOpen}
            onClose={() => setVersionDrawerOpen(false)}
            iterations={iterations}
            currentVersionNumber={currentVersionNumber}
            previewVersion={previewVersion}
            onPreviewVersion={handlePreviewVersion}
            onRestoreVersion={handleRestoreVersion}
            onExitPreview={handleExitPreview}
          />
        </main>
      </div>
    </div>
  );
}

export default function KampanyeTerpaduPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070A12]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      }
    >
      <KampanyeTerpaduContent />
    </Suspense>
  );
}
