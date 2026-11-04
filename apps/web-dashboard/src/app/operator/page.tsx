'use client';

import React, { useEffect, useState } from 'react';
import { AdminApiClient } from '@/lib/api-client';
import {
  Flame,
  LayoutGrid,
  AlertCircle,
  Users,
} from 'lucide-react';
import {
  WritingStyle,
  LengthTarget,
  WRITING_STYLES,
} from '@/components/studio/artikel/WritingStyleSelector';
import { downloadImageFile } from '@/lib/utils';
import {
  AssignedTenant,
  TenantContextData,
  AttachedFileItem,
  GeneratedFullResult,
  ContentBriefItem,
  OperatorTabType,
  OperatorViewMode,
  DEFAULT_TOPICS,
  OperatorDirectoryView,
  OperatorWorkspaceHeader,
  OperatorWorkspaceNav,
  OperatorContentTab,
  OperatorWhatsAppBriefsTab,
  OperatorArticlesTab,
  OperatorKnowledgeTab,
  OperatorProfileTab,
  OperatorAspirasiTab,
  OperatorCommentsTab,
} from '@/components/operator';

export default function OperatorCockpitPage() {
  const [assignments, setAssignments] = useState<AssignedTenant[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  // Mode Tampilan: WORKSPACE (Fokus Tokoh Layar Penuh) vs DIRECTORY (Ikhtisar Grid Semua Binaan)
  const [viewMode, setViewMode] = useState<OperatorViewMode>('WORKSPACE');
  const [directoryFilter, setDirectoryFilter] = useState<'ALL' | 'PENDING' | 'PUBLISHED'>('ALL');

  // Active Context State
  const [tenantContext, setTenantContext] = useState<TenantContextData | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [activeTab, setActiveTab] = useState<OperatorTabType>('CONTENT');
  const [dewanArticles, setDewanArticles] = useState<any[]>([]);
  const [loadingDewanArticles, setLoadingDewanArticles] = useState(false);
  const [articlesFilter, setArticlesFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');
  const [articlesSearch, setArticlesSearch] = useState('');
  const [loadingCanvasArticleId, setLoadingCanvasArticleId] = useState<string | null>(null);

  // Content Factory State
  const [topicInput, setTopicInput] = useState('');
  const [trendingTopics, setTrendingTopics] = useState<string[]>(DEFAULT_TOPICS);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<WritingStyle>('SOLUTIF');
  const [selectedLength, setSelectedLength] = useState<LengthTarget>('MEDIUM');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileItem[]>([]);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [isRefiningPrompt, setIsRefiningPrompt] = useState(false);
  const [originalRawPrompt, setOriginalRawPrompt] = useState<string | null>(null);
  const [promptRefinedSuccess, setPromptRefinedSuccess] = useState(false);

  // Full Results Studio State
  const [generatedResult, setGeneratedResult] = useState<GeneratedFullResult | null>(null);
  const [resultTab, setResultTab] = useState<'article' | 'poster' | 'social'>('article');
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [isWide, setIsWide] = useState(true);
  const [zoom] = useState<number>(100);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishingArticle, setPublishingArticle] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [regeneratingPoster, setRegeneratingPoster] = useState(false);
  const [downloadingPoster, setDownloadingPoster] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedArticle, setCopiedArticle] = useState(false);
  const [copiedIg, setCopiedIg] = useState(false);
  const [, setStatusNotice] = useState<string | null>(null);
  const [activeBrief, setActiveBrief] = useState<ContentBriefItem | null>(null);
  const [submittingBriefReview, setSubmittingBriefReview] = useState(false);

  // Form Edit Profil Publik Tokoh
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    partyAffiliation: '',
    customDapilName: '',
    commissionName: '',
    photoUrl: '',
    education: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  // Auto-polling background: jika naskah artikel selesai (progressive delivery) tetapi poster masih dalam proses render
  useEffect(() => {
    const pubId = generatedResult?.publication?.id;
    const hasPoster = Boolean(generatedResult?.posterUrl && generatedResult.posterUrl.trim().length > 0);

    if (!pubId || hasPoster || generatingContent) {
      return;
    }

    let isSubscribed = true;
    let pollCount = 0;
    const maxPolls = 35; // 35 * 2.5s = ~85 detik pemantauan latar belakang

    const intervalId = setInterval(async () => {
      pollCount++;
      if (pollCount > maxPolls || !isSubscribed) {
        clearInterval(intervalId);
        return;
      }

      try {
        const detail = await AdminApiClient.request<any>(`/studio/articles/${pubId}`);
        const posterUrl = detail?.asset?.cdnPublicUrl || detail?.asset?.r2StorageUrl;
        if (posterUrl && isSubscribed) {
          setGeneratedResult((prev) => {
            if (!prev || prev.publication.id !== pubId) return prev;
            return {
              ...prev,
              posterUrl,
              socialPack: detail?.socialPack || prev.socialPack,
            };
          });
          clearInterval(intervalId);
        }
      } catch {
        // Retry polling diam-diam
      }
    }, 2500);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [generatedResult?.publication?.id, generatedResult?.posterUrl, generatingContent]);

  const loadAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const res = await AdminApiClient.request<AssignedTenant[]>('/operator/my-assignments');
      setAssignments(res || []);

      if (res && res.length > 0 && !selectedTenantId) {
        selectTenant(res[0].tenantId);
      }
    } catch (err: any) {
      console.error('Gagal memuat daftar penugasan dewan:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const selectTenant = async (tenantId: string) => {
    setSelectedTenantId(tenantId);
    AdminApiClient.setActingTenant(tenantId);
    setGeneratedResult(null);
    setActiveBrief(null);
    setStatusNotice(null);
    setProfileSaveSuccess(null);
    setPublishedUrl(null);
    setAttachedFiles([]);
    setIsEditingArticle(false);

    try {
      setLoadingContext(true);
      const res = await AdminApiClient.request<TenantContextData>(`/operator/tenant-context/${tenantId}`);
      setTenantContext(res);
      if (res?.tenant) {
        setProfileForm({
          fullName: res.tenant.fullName || '',
          partyAffiliation: res.tenant.partyAffiliation || '',
          customDapilName: res.tenant.customDapilName || '',
          commissionName: res.tenant.commissionName || '',
          photoUrl: res.tenant.photoUrl || '',
          education: res.tenant.education || '',
        });
      }
      loadTrendingTopics();
      loadDewanArticles();
    } catch (err: any) {
      console.error('Gagal memuat konteks dewan:', err);
    } finally {
      setLoadingContext(false);
    }
  };

  const loadTrendingTopics = async () => {
    try {
      setLoadingTopics(true);
      const res = await AdminApiClient.request<{ topics: string[]; dapilName: string }>(
        '/studio/trending-topics'
      );
      if (res?.topics && Array.isArray(res.topics) && res.topics.length > 0) {
        setTrendingTopics(res.topics);
      }
    } catch (err: any) {
      console.warn('Gagal memuat isu hangat AI, fallback ke default:', err);
    } finally {
      setLoadingTopics(false);
    }
  };

  const loadDewanArticles = async () => {
    try {
      setLoadingDewanArticles(true);
      const list = await AdminApiClient.request<any[]>('/studio/articles');
      setDewanArticles(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.warn('Gagal memuat arsip artikel dewan:', err);
    } finally {
      setLoadingDewanArticles(false);
    }
  };

  const loadArticleToCanvas = async (articleId: string) => {
    try {
      setLoadingCanvasArticleId(articleId);
      const detail = await AdminApiClient.request<any>(`/studio/articles/${articleId}`);
      const art = detail?.article || detail;
      if (!art) throw new Error('Data artikel tidak ditemukan.');

      const rawBody = art.bodyContentMarkdown || '';
      const bodyWithTitle = rawBody.startsWith('# ')
        ? rawBody
        : (art.title ? `# ${art.title}\n\n${rawBody}` : rawBody);

      setGeneratedResult({
        publication: {
          ...art,
          bodyContentMarkdown: bodyWithTitle,
        },
        posterUrl: detail?.asset?.cdnPublicUrl || detail?.asset?.r2StorageUrl || art.posterUrl || '',
        socialPack: detail?.socialPack || art.socialPack,
        infographicData: detail?.infographicData || art.infographicData,
      });

      setEditedTitle(art.title || '');
      setEditedBody(bodyWithTitle);
      setActiveTab('CONTENT');
      setResultTab('article');
      setIsEditingArticle(false);
      setPublishedUrl(art.canonicalUrl || (art.status === 'PUBLISHED' ? `https://polaris.id/p/${art.id}` : null));
    } catch (err: any) {
      alert(`Gagal memuat artikel ke kanvas: ${err.message}`);
    } finally {
      setLoadingCanvasArticleId(null);
    }
  };

  const handleFileSelection = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: AttachedFileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 15 * 1024 * 1024) {
        alert(`Berkas "${file.name}" melebihi batas 15MB.`);
        continue;
      }
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      newItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        base64,
      });
    }
    setAttachedFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRefinePrompt = async () => {
    if (!topicInput.trim() || isRefiningPrompt || !selectedDewan) return;
    try {
      setIsRefiningPrompt(true);
      setOriginalRawPrompt(topicInput);
      const res = await AdminApiClient.request<{ refinedPrompt: string }>('/studio/refine-prompt', {
        method: 'POST',
        body: JSON.stringify({
          prompt: topicInput.trim(),
          style: 'article_agenda',
          dapilName: selectedDewan.customDapilName,
          memberName: selectedDewan.fullName,
          partyAffiliation: selectedDewan.partyAffiliation,
          commissionName: selectedDewan.commissionName,
        }),
      });

      if (res?.refinedPrompt && res.refinedPrompt !== topicInput) {
        setTopicInput(res.refinedPrompt);
        setPromptRefinedSuccess(true);
        setTimeout(() => setPromptRefinedSuccess(false), 8000);
      }
    } catch (err: any) {
      console.warn('Gagal menyempurnakan prompt dengan AI:', err);
    } finally {
      setIsRefiningPrompt(false);
    }
  };

  const handleUndoRefine = () => {
    if (originalRawPrompt !== null) {
      setTopicInput(originalRawPrompt);
      setOriginalRawPrompt(null);
      setPromptRefinedSuccess(false);
    }
  };

  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || !selectedTenantId) return;

    setGeneratingContent(true);
    setStatusNotice(null);
    setPublishedUrl(null);
    setGenerationStep(1);

    const lengthWordMap = { SHORT: '750 kata', MEDIUM: '1.500 kata', LONG: '3.500 kata' };
    const styleCfg = WRITING_STYLES[selectedStyle];

    try {
      const res = await AdminApiClient.request<any>('/studio/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: topicInput.trim(),
          briefId: activeBrief?.id,
          generateDallePoster: true,
          writingStyle: selectedStyle,
          targetAudience: styleCfg.audience,
          toneOverride: styleCfg.tone,
          targetLength: lengthWordMap[selectedLength],
          attachments: attachedFiles.map((f) => ({
            name: f.name,
            type: f.type,
            base64: f.base64,
          })),
        }),
      });

      const jobId = res?.jobId || res?.data?.jobId;
      const publicationId = res?.publicationId || res?.data?.publicationId;

      setGenerationStep(2);

      let finalArticle: any = null;
      let finalPosterUrl = '';
      let finalSocialPack: any = null;

      if (jobId && publicationId) {
        for (let i = 0; i < 60; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          try {
            const statusRes = await AdminApiClient.request<any>(`/studio/jobs/${jobId}`);
            if (statusRes?.percent && statusRes.percent >= 45) {
              setGenerationStep(3);
            }
            if (statusRes?.status === 'COMPLETED' || (statusRes?.percent && statusRes.percent >= 100)) {
              break;
            }
            if (statusRes?.status === 'FAILED') {
              throw new Error(statusRes.failedReason || 'Pemrosesan antrean gagal.');
            }
          } catch {
            // Polling retry
          }
        }

        const detail = await AdminApiClient.request<any>(`/studio/articles/${publicationId}`);
        if (detail?.article) {
          finalArticle = detail.article;
          finalPosterUrl = detail.asset?.cdnPublicUrl || detail.asset?.r2StorageUrl || '';
          finalSocialPack = detail.socialPack;
        }
      }

      if (finalArticle) {
        const rawBody = finalArticle.bodyContentMarkdown || '';
        const bodyWithTitle = rawBody.startsWith('# ')
          ? rawBody
          : (finalArticle.title ? `# ${finalArticle.title}\n\n${rawBody}` : rawBody);

        setGeneratedResult({
          publication: {
            ...finalArticle,
            bodyContentMarkdown: bodyWithTitle,
          },
          posterUrl: finalPosterUrl,
          socialPack: finalSocialPack,
        });
        setEditedTitle(finalArticle.title);
        setEditedBody(bodyWithTitle);
        setResultTab('article');
        setStatusNotice('✅ Naskah Kebijakan & Poster Visual berhasil disintesis!');
      } else {
        const fallbackTitle = res?.title || topicInput.trim();
        const rawFallbackBody = res?.bodyContentMarkdown || res?.excerpt || topicInput.trim();
        const fallbackWithTitle = rawFallbackBody.startsWith('# ')
          ? rawFallbackBody
          : `# ${fallbackTitle}\n\n${rawFallbackBody}`;

        setGeneratedResult({
          publication: {
            id: res?.id || 'res-id',
            title: fallbackTitle,
            bodyContentMarkdown: fallbackWithTitle,
            excerpt: res?.excerpt || topicInput.trim(),
            status: 'DRAFT',
          },
          posterUrl: res?.posterUrl || '',
          socialPack: res?.socialPack,
        });
        setEditedTitle(fallbackTitle);
        setEditedBody(fallbackWithTitle);
        setStatusNotice('✅ Draf awal berhasil disintesis!');
      }

      loadAssignments();
      if (selectedTenantId) {
        loadDewanArticles();
      }
    } catch (err: any) {
      setStatusNotice(`⚠️ Gagal generate: ${err.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setGeneratingContent(false);
      setGenerationStep(0);
    }
  };

  const handleSaveEditedArticle = async () => {
    if (!generatedResult?.publication?.id) return;
    setSavingDraft(true);
    try {
      const derivedTitle =
        editedTitle ||
        editedBody.split('\n')[0].replace(/^#\s*/, '').trim() ||
        generatedResult.publication.title;

      await AdminApiClient.request(`/studio/articles/${generatedResult.publication.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: derivedTitle,
          bodyContentMarkdown: editedBody,
        }),
      });
      setGeneratedResult((prev) =>
        prev
          ? {
              ...prev,
              publication: {
                ...prev.publication,
                title: derivedTitle,
                bodyContentMarkdown: editedBody,
              },
            }
          : null
      );
      setEditedTitle(derivedTitle);
      alert('Perubahan naskah berhasil disimpan.');
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublishArticle = async () => {
    if (!generatedResult?.publication?.id) return;
    setPublishingArticle(true);
    try {
      const res = await AdminApiClient.request<any>(
        `/studio/articles/${generatedResult.publication.id}/publish`,
        { method: 'POST' }
      );
      setPublishedUrl(res?.canonicalUrl || `https://polaris.id/p/${generatedResult.publication.id}`);
      setGeneratedResult((prev) =>
        prev
          ? {
              ...prev,
              publication: {
                ...prev.publication,
                status: 'PUBLISHED',
              },
            }
          : null
      );
      loadAssignments();
      alert('Naskah berhasil diterbitkan langsung ke Portal Resmi Tokoh!');
    } catch (err: any) {
      alert(`Gagal menerbitkan: ${err.message}`);
    } finally {
      setPublishingArticle(false);
    }
  };

  const handleSubmitBriefForWhatsAppReview = async () => {
    if (!activeBrief || !generatedResult?.publication?.id || submittingBriefReview) return;
    setSubmittingBriefReview(true);
    try {
      const res = await AdminApiClient.request<{
        brief: ContentBriefItem;
        reviewUrl: string;
      }>(`/whatsapp/briefs/${activeBrief.id}/submit-review`, {
        method: 'POST',
        body: JSON.stringify({
          publicationId: generatedResult.publication.id,
          directPublishImmediately: false,
        }),
      });

      if (res?.brief) {
        setActiveBrief(res.brief);
      }
      loadAssignments();
      alert(
        `Paket konten berhasil dikirim ke WhatsApp ${selectedDewan?.fullName} untuk ditinjau & disetujui!`
      );
    } catch (err: any) {
      alert(`Gagal mengirim pratinjau ke WhatsApp: ${err.message}`);
    } finally {
      setSubmittingBriefReview(false);
    }
  };

  const handleRegeneratePoster = async () => {
    if (!generatedResult?.publication?.id || regeneratingPoster) return;
    setRegeneratingPoster(true);
    try {
      const res = await AdminApiClient.request<any>(
        `/studio/articles/${generatedResult.publication.id}/poster/regenerate`,
        { method: 'POST' }
      );
      const jobId = res?.jobId;
      if (jobId) {
        for (let i = 0; i < 30; i++) {
          await new Promise((r) => setTimeout(r, 1500));
          const st = await AdminApiClient.request<any>(`/studio/jobs/${jobId}`);
          if (st?.status === 'COMPLETED') {
            const detail = await AdminApiClient.request<any>(`/studio/articles/${generatedResult.publication.id}`);
            const newUrl = detail?.asset?.cdnPublicUrl || detail?.asset?.r2StorageUrl;
            if (newUrl) {
              setGeneratedResult((prev) => (prev ? { ...prev, posterUrl: newUrl } : null));
              alert('Poster visual AI baru berhasil diperbarui!');
              break;
            }
          }
        }
      }
    } catch (err: any) {
      alert(`Gagal regenerasi poster: ${err.message}`);
    } finally {
      setRegeneratingPoster(false);
    }
  };

  const handleDownloadPoster = async () => {
    if (!generatedResult?.posterUrl) return;
    setDownloadingPoster(true);
    const safeName = (selectedDewan?.fullName || 'Tokoh_Polaris').replace(/\s+/g, '_');
    try {
      await downloadImageFile(generatedResult.posterUrl, `${safeName}_Poster_HD.jpg`);
    } catch {
      window.open(generatedResult.posterUrl, '_blank');
    } finally {
      setDownloadingPoster(false);
    }
  };

  const handleCopyWa = () => {
    if (!generatedResult) return;
    const text =
      generatedResult.socialPack?.whatsappBroadcastText ||
      generatedResult.socialPack?.whatsappBroadcast ||
      `*SIARAN PERS RESMI*\n*${generatedResult.publication.title}*\n_${selectedDewan?.fullName || ''} — ${selectedDewan?.partyAffiliation || ''}_\n\n${generatedResult.publication.excerpt || ''}\n\n📌 *Poin Pokok Kebijakan:*\n${(generatedResult.publication.bodyContentMarkdown || '').slice(0, 500)}...\n\nBaca rilis selengkapnya di portal resmi:\n${publishedUrl || `https://polaris.id/p/${generatedResult.publication.id}`}`;

    navigator.clipboard.writeText(text);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2500);
  };

  const handleCopyArticle = () => {
    if (!generatedResult) return;
    const body = editedBody || generatedResult.publication.bodyContentMarkdown || '';
    const full = body.startsWith('# ')
      ? body
      : `# ${editedTitle || generatedResult.publication.title}\n\n${body}`;
    navigator.clipboard.writeText(full);
    setCopiedArticle(true);
    setTimeout(() => setCopiedArticle(false), 2500);
  };

  const handleCopyIg = () => {
    if (!generatedResult) return;
    const cap =
      generatedResult.socialPack?.instagramCaption ||
      `${generatedResult.publication.title}\n\n${generatedResult.publication.excerpt || ''}\n\n#${(selectedDewan?.customDapilName || 'Dapil').replace(/\s+/g, '')} #SuaraRakyat #KerjaNyata #Polaris`;
    navigator.clipboard.writeText(cap);
    setCopiedIg(true);
    setTimeout(() => setCopiedIg(false), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) return;
    setSavingProfile(true);
    setProfileSaveSuccess(null);
    try {
      await AdminApiClient.request(`/operator/tenant-context/${selectedTenantId}/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileForm),
      });
      setProfileSaveSuccess('Profil publik tokoh berhasil diperbarui.');
      setTimeout(() => setProfileSaveSuccess(null), 4000);
      loadAssignments();
    } catch (err: any) {
      alert(`Gagal menyimpan profil tokoh: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const selectedDewan = assignments.find((a) => a.tenantId === selectedTenantId) || assignments[0];
  const publishedCount = assignments.filter((a) => a.todayStats.hasPublishedToday).length;
  const totalAssigned = assignments.length;
  const progressPercent = totalAssigned > 0 ? Math.round((publishedCount / totalAssigned) * 100) : 0;

  const filteredAssignments = assignments.filter((item) => {
    const matchesFilter =
      directoryFilter === 'ALL' ||
      (directoryFilter === 'PUBLISHED' && item.todayStats.hasPublishedToday) ||
      (directoryFilter === 'PENDING' && !item.todayStats.hasPublishedToday);

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.partyAffiliation && item.partyAffiliation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.customDapilName && item.customDapilName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. TOP BAR: RINGKASAN PRODUKSI & TOGGLE VIEW MODE */}
      <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sisi Kiri: Ringkasan Produksi Maraton */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Produksi Harian Tokoh Binaan
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {publishedCount} / {totalAssigned} Tokoh Rilis
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola dan publikasikan konten kampanye &amp; kebijakan parlemen untuk seluruh dewan penugasan Anda.
            </p>
          </div>
        </div>

        {/* Sisi Kanan: Progress Bar & Mode Toggle */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-3 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="w-28 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {progressPercent}%
            </span>
          </div>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'WORKSPACE' ? 'DIRECTORY' : 'WORKSPACE')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              viewMode === 'DIRECTORY'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{viewMode === 'DIRECTORY' ? 'Kembali ke Studio' : `Semua Tokoh (${totalAssigned})`}</span>
          </button>
        </div>
      </div>

      {/* 2. MODE DIRECTORY: IKHTISAR GRID TOKOH BINAAN */}
      {viewMode === 'DIRECTORY' && (
        <OperatorDirectoryView
          assignments={assignments}
          filteredAssignments={filteredAssignments}
          selectedTenantId={selectedTenantId}
          totalAssigned={totalAssigned}
          publishedCount={publishedCount}
          directoryFilter={directoryFilter}
          setDirectoryFilter={setDirectoryFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectTenant={(tenantId) => {
            selectTenant(tenantId);
            setViewMode('WORKSPACE');
          }}
        />
      )}

      {/* 3. MODE WORKSPACE: DEDICATED FULL-WIDTH STUDIO PER TOKOH BINAAN */}
      {viewMode === 'WORKSPACE' && selectedDewan && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* TOKOH PICKER & PERSONA HEADER */}
          <OperatorWorkspaceHeader
            assignments={assignments}
            selectedDewan={selectedDewan}
            selectedTenantId={selectedTenantId}
            tenantContext={tenantContext}
            totalAssigned={totalAssigned}
            publishedCount={publishedCount}
            onSelectTenant={(tenantId) => selectTenant(tenantId)}
          />

          {/* WORKSPACE TAB NAVIGATION */}
          <OperatorWorkspaceNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            articlesCount={dewanArticles.length}
            activeBriefsCount={
              (selectedDewan.briefStats?.pendingBriefs || 0) +
              (selectedDewan.briefStats?.inProgressBriefs || 0) +
              (selectedDewan.briefStats?.revisionRequestedBriefs || 0)
            }
          />

          {/* TAB 1: PABRIK KONTEN & VISUAL AI */}
          {activeTab === 'CONTENT' && (
            <OperatorContentTab
              selectedDewan={selectedDewan}
              tenantContext={tenantContext}
              generatedResult={generatedResult}
              setGeneratedResult={setGeneratedResult}
              topicInput={topicInput}
              setTopicInput={setTopicInput}
              trendingTopics={trendingTopics}
              loadingTopics={loadingTopics}
              onRefreshTrendingTopics={() => loadTrendingTopics()}
              selectedStyle={selectedStyle}
              setSelectedStyle={setSelectedStyle}
              selectedLength={selectedLength}
              setSelectedLength={setSelectedLength}
              attachedFiles={attachedFiles}
              onFileSelection={handleFileSelection}
              onRemoveFile={handleRemoveFile}
              generatingContent={generatingContent}
              generationStep={generationStep}
              isRefiningPrompt={isRefiningPrompt}
              onRefinePrompt={handleRefinePrompt}
              originalRawPrompt={originalRawPrompt}
              onUndoRefine={handleUndoRefine}
              promptRefinedSuccess={promptRefinedSuccess}
              onGenerateContent={handleGenerateContent}
              resultTab={resultTab}
              setResultTab={setResultTab}
              isEditingArticle={isEditingArticle}
              setIsEditingArticle={setIsEditingArticle}
              isWide={isWide}
              setIsWide={setIsWide}
              zoom={zoom}
              editedTitle={editedTitle}
              setEditedTitle={setEditedTitle}
              editedBody={editedBody}
              setEditedBody={setEditedBody}
              savingDraft={savingDraft}
              onSaveEditedArticle={handleSaveEditedArticle}
              onCopyArticle={handleCopyArticle}
              copiedArticle={copiedArticle}
              downloadingPoster={downloadingPoster}
              onDownloadPoster={handleDownloadPoster}
              regeneratingPoster={regeneratingPoster}
              onRegeneratePoster={handleRegeneratePoster}
              copiedWa={copiedWa}
              onCopyWa={handleCopyWa}
              copiedIg={copiedIg}
              onCopyIg={handleCopyIg}
              publishedUrl={publishedUrl}
              publishingArticle={publishingArticle}
              onPublishArticle={handlePublishArticle}
              assignments={assignments}
              totalAssigned={totalAssigned}
              selectedTenantId={selectedTenantId}
              onSelectTenant={(tenantId) => selectTenant(tenantId)}
              activeBrief={activeBrief}
              onClearActiveBrief={() => setActiveBrief(null)}
              submittingBriefReview={submittingBriefReview}
              onSubmitBriefForWhatsAppReview={handleSubmitBriefForWhatsAppReview}
            />
          )}

          {/* TAB 1B: KOTAK MASUK & DISKUSI WHATSAPP (BLIND BROKER) */}
          {activeTab === 'BRIEFS' && (
            <OperatorWhatsAppBriefsTab
              selectedDewan={selectedDewan}
              onHydrateBriefToStudio={({ brief, topicPrompt, attachments }) => {
                setActiveBrief(brief);
                setGeneratedResult(null);
                setTopicInput(topicPrompt);
                setAttachedFiles(attachments);
                setActiveTab('CONTENT');
              }}
              onOpenLinkedArticle={(publicationId, brief) => {
                setActiveBrief(brief);
                loadArticleToCanvas(publicationId);
              }}
              onBriefStatsChanged={() => loadAssignments()}
            />
          )}

          {/* TAB 2: ARSIP NASKAH & DRAF KEBIJAKAN */}
          {activeTab === 'ARTICLES' && (
            <OperatorArticlesTab
              selectedDewan={selectedDewan}
              dewanArticles={dewanArticles}
              loadingDewanArticles={loadingDewanArticles}
              articlesFilter={articlesFilter}
              setArticlesFilter={setArticlesFilter}
              articlesSearch={articlesSearch}
              setArticlesSearch={setArticlesSearch}
              onRefresh={() => loadDewanArticles()}
              onCreateNew={() => {
                setGeneratedResult(null);
                setActiveTab('CONTENT');
              }}
              onLoadArticleToCanvas={loadArticleToCanvas}
              loadingCanvasArticleId={loadingCanvasArticleId}
            />
          )}

          {/* TAB 3: BANK DOKUMEN & PENGETAHUAN AI */}
          {activeTab === 'KNOWLEDGE' && (
            <OperatorKnowledgeTab
              assignedTenants={assignments}
              selectedTenant={selectedDewan || null}
              onSelectTenant={(t) => {
                if (t) selectTenant(t.tenantId);
              }}
            />
          )}

          {/* TAB 4: PROFIL PUBLIK & IDENTITAS TOKOH */}
          {activeTab === 'PROFILE' && (
            <OperatorProfileTab
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              profileSaveSuccess={profileSaveSuccess}
              savingProfile={savingProfile}
              onSaveProfile={handleSaveProfile}
            />
          )}

          {/* TAB 5: TRIAGE ASPIRASI WARGA */}
          {activeTab === 'ASPIRASI' && <OperatorAspirasiTab />}

          {/* TAB 6: MODERASI KOMENTAR PUBLIK */}
          {activeTab === 'COMMENTS' && <OperatorCommentsTab />}
        </div>
      )}

      {/* STATE EMPTY / LOADING */}
      {assignments.length === 0 && !loadingAssignments && (
        <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Belum Ada Tokoh yang Ditugaskan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hubungi administrator superadmin untuk mendapatkan penugasan pengelolaan tokoh dewan.
          </p>
        </div>
      )}
    </div>
  );
}
