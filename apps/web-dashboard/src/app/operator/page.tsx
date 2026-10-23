'use client';

import React, { useEffect, useState } from 'react';
import { AdminApiClient } from '@/lib/api-client';
import {
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ArrowRight,
  ShieldAlert,
  Send,
  Eye,
  MessageSquare,
  FileText,
  ThumbsUp,
  Flame,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  User,
  Save,
  Check,
  Building2,
  MapPin,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Filter,
  Download,
  Copy,
  Paperclip,
  Globe,
  Edit3,
  X,
  Plus,
  Share2,
  CheckCheck,
  Image as ImageIcon,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { WRITING_STYLES, type WritingStyle, type LengthTarget } from '@/components/studio/artikel/WritingStyleSelector';

export interface AttachedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  base64: string;
}

export interface GeneratedFullResult {
  publication: {
    id: string;
    title: string;
    bodyContentMarkdown: string;
    excerpt?: string;
    status: string;
    slug?: string;
  };
  posterUrl?: string;
  socialPack?: {
    whatsappBroadcastText?: string;
    whatsappBroadcast?: string;
    instagramCaption?: string;
    twitterThreads?: string[];
  };
  infographicData?: any;
}

const DEFAULT_TOPICS = [
  'Distribusi Pupuk Bersubsidi & Bantuan Petani Daerah',
  'Perbaikan Jalan Rusak & Infrastruktur Desa',
  'Layanan Rujukan BPJS & Kualitas Faskes Daerah',
  'Akses Modal Usaha UMKM & Lapangan Kerja Pemuda',
];

interface AssignedTenant {
  assignmentId: string;
  canDirectPublish: boolean;
  assignmentStatus: string;
  tenantId: string;
  fullName: string;
  photoUrl: string | null;
  partyAffiliation: string | null;
  legislativeLevel: string;
  customDapilName: string | null;
  commissionName: string | null;
  subscriptionStatus?: string | null;
  todayStats: {
    totalToday: number;
    publishedToday: number;
    draftToday: number;
    hasPublishedToday: boolean;
  };
}

interface TenantContextData {
  tenant: {
    id: string;
    fullName: string;
    partyAffiliation: string | null;
    legislativeLevel: string;
    customDapilName: string | null;
    commissionName: string | null;
    photoUrl: string | null;
    issueInterests: string[] | null;
    education: string | null;
  };
  subscriptionStatus?: string | null;
  quota: {
    articleLimit: number;
    articleUsed: number;
    dalleLimit: number;
    dalleUsed: number;
    totalTokensConsumed: number;
    billingCycleMonth: string;
  } | null;
}

function getPartyBranding(party?: string | null) {
  const p = (party || '').toUpperCase();
  if (p.includes('GOLKAR') || p.includes('HANURA')) {
    return {
      accent: 'amber',
      gradient: 'from-amber-500/15 via-yellow-500/5 to-transparent',
      border: 'border-amber-500/40',
      badge: 'bg-amber-100/80 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
      pill: 'bg-amber-500 text-white',
      avatarRing: 'ring-amber-500',
    };
  }
  if (p.includes('PDI') || p.includes('PSI')) {
    return {
      accent: 'rose',
      gradient: 'from-rose-500/15 via-red-500/5 to-transparent',
      border: 'border-rose-500/40',
      badge: 'bg-rose-100/80 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700/60',
      pill: 'bg-rose-600 text-white',
      avatarRing: 'ring-rose-500',
    };
  }
  if (p.includes('GERINDRA') || p.includes('DEMOKRAT')) {
    return {
      accent: 'blue',
      gradient: 'from-blue-600/15 via-indigo-500/5 to-transparent',
      border: 'border-blue-500/40',
      badge: 'bg-blue-100/80 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700/60',
      pill: 'bg-blue-600 text-white',
      avatarRing: 'ring-blue-500',
    };
  }
  if (p.includes('PKB') || p.includes('PPP') || p.includes('PKS')) {
    return {
      accent: 'emerald',
      gradient: 'from-emerald-600/15 via-teal-500/5 to-transparent',
      border: 'border-emerald-500/40',
      badge: 'bg-emerald-100/80 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60',
      pill: 'bg-emerald-600 text-white',
      avatarRing: 'ring-emerald-500',
    };
  }
  if (p.includes('NASDEM')) {
    return {
      accent: 'sky',
      gradient: 'from-sky-500/15 via-blue-600/5 to-transparent',
      border: 'border-sky-500/40',
      badge: 'bg-sky-100/80 text-sky-900 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-700/60',
      pill: 'bg-sky-600 text-white',
      avatarRing: 'ring-sky-500',
    };
  }
  return {
    accent: 'indigo',
    gradient: 'from-indigo-600/15 via-slate-500/5 to-transparent',
    border: 'border-indigo-500/40',
    badge: 'bg-indigo-100/80 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60',
    pill: 'bg-indigo-600 text-white',
    avatarRing: 'ring-indigo-500',
  };
}

export default function OperatorCockpitPage() {
  const [assignments, setAssignments] = useState<AssignedTenant[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  // Mode Tampilan: WORKSPACE (Fokus Tokoh Layar Penuh) vs DIRECTORY (Ikhtisar Grid Semua Binaan)
  const [viewMode, setViewMode] = useState<'WORKSPACE' | 'DIRECTORY'>('WORKSPACE');
  const [directoryFilter, setDirectoryFilter] = useState<'ALL' | 'PENDING' | 'PUBLISHED'>('ALL');
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // Active Context State
  const [tenantContext, setTenantContext] = useState<TenantContextData | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'ARTICLES' | 'PROFILE' | 'ASPIRASI' | 'COMMENTS'>('CONTENT');
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Full Results Studio State
  const [generatedResult, setGeneratedResult] = useState<GeneratedFullResult | null>(null);
  const [resultTab, setResultTab] = useState<'article' | 'poster' | 'social'>('article');
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishingArticle, setPublishingArticle] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [regeneratingPoster, setRegeneratingPoster] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedArticle, setCopiedArticle] = useState(false);
  const [copiedIg, setCopiedIg] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

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

  const filteredDewanArticles = dewanArticles.filter((item) => {
    const matchesFilter =
      articlesFilter === 'ALL' ||
      (articlesFilter === 'PUBLISHED' && item.status === 'PUBLISHED') ||
      (articlesFilter === 'DRAFT' && item.status !== 'PUBLISHED');

    const matchesSearch =
      articlesSearch.trim() === '' ||
      item.title?.toLowerCase().includes(articlesSearch.toLowerCase()) ||
      item.excerpt?.toLowerCase().includes(articlesSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const res = await AdminApiClient.request<AssignedTenant[]>('/operator/my-assignments');
      setAssignments(res || []);

      // Auto-select dewan pertama jika belum ada yang dipilih
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
    setStatusNotice(null);
    setProfileSaveSuccess(null);
    setPublishedUrl(null);
    setSwitcherOpen(false);
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
      loadTrendingTopics(tenantId);
      loadDewanArticles(tenantId);
    } catch (err: any) {
      console.error('Gagal memuat konteks dewan:', err);
    } finally {
      setLoadingContext(false);
    }
  };

  const loadTrendingTopics = async (targetTenantId?: string) => {
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

  const loadDewanArticles = async (targetTenantId?: string) => {
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
      if (detail?.article) {
        setGeneratedResult({
          publication: detail.article,
          posterUrl: detail.asset?.cdnPublicUrl || detail.asset?.r2StorageUrl || '',
          socialPack: detail.socialPack,
        });
        setEditedTitle(detail.article.title);
        setEditedBody(detail.article.bodyContentMarkdown || '');
        setResultTab('article');
        setActiveTab('CONTENT');
        setStatusNotice(`✅ Naskah "${detail.article.title}" berhasil dimuat ke Kanvas.`);
      }
    } catch (err: any) {
      alert('Gagal memuat artikel: ' + (err.message || 'Terjadi kendala.'));
    } finally {
      setLoadingCanvasArticleId(null);
    }
  };

  // Navigasi Tokoh Berikutnya (Auto Skip Yang Sudah Rilis Hari Ini)
  const handleNextPendingTenant = () => {
    const currentIndex = assignments.findIndex((a) => a.tenantId === selectedTenantId);
    const nextItem =
      assignments.find((a, idx) => idx > currentIndex && !a.todayStats.hasPublishedToday) ||
      assignments.find((a) => !a.todayStats.hasPublishedToday && a.tenantId !== selectedTenantId);

    if (nextItem) {
      selectTenant(nextItem.tenantId);
      setTopicInput('');
      setViewMode('WORKSPACE');
    } else {
      alert('Selamat! Seluruh tokoh binaan Anda telah memiliki konten hari ini.');
    }
  };

  // Handler Lampiran Berkas
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

  // Handler Bantuan AI untuk Menyempurnakan Prompt Kasar Menjadi Rumusan Kebijakan
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

  // Handler Generate Naskah & Poster Visual Lengkap
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
        for (let i = 0; i < 40; i++) {
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
          } catch (pollErr: any) {
            // Abaikan kesalahan polling sesaat
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
        setGeneratedResult({
          publication: finalArticle,
          posterUrl: finalPosterUrl,
          socialPack: finalSocialPack,
        });
        setEditedTitle(finalArticle.title);
        setEditedBody(finalArticle.bodyContentMarkdown || '');
        setResultTab('article');
        setStatusNotice('✅ Naskah Berita & Poster Visual AI berhasil disintesis!');
      } else {
        setGeneratedResult({
          publication: {
            id: res?.id || 'res-id',
            title: res?.title || topicInput.trim(),
            bodyContentMarkdown: res?.bodyContentMarkdown || res?.excerpt || topicInput.trim(),
            excerpt: res?.excerpt || topicInput.trim(),
            status: 'DRAFT',
          },
          posterUrl: res?.posterUrl || '',
          socialPack: res?.socialPack,
        });
        setEditedTitle(res?.title || topicInput.trim());
        setEditedBody(res?.bodyContentMarkdown || res?.excerpt || topicInput.trim());
        setStatusNotice('✅ Draf awal berhasil disintesis!');
      }

      loadAssignments();
      if (selectedTenantId) {
        loadDewanArticles(selectedTenantId);
      }
    } catch (err: any) {
      setStatusNotice(`⚠️ Gagal generate: ${err.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setGeneratingContent(false);
      setGenerationStep(0);
    }
  };

  // Handler Simpan Perubahan Naskah (Edit Mode)
  const handleSaveEditedArticle = async () => {
    if (!generatedResult?.publication?.id) return;
    setSavingDraft(true);
    try {
      await AdminApiClient.request(`/studio/articles/${generatedResult.publication.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editedTitle,
          bodyContentMarkdown: editedBody,
        }),
      });
      setGeneratedResult((prev) =>
        prev
          ? {
              ...prev,
              publication: {
                ...prev.publication,
                title: editedTitle,
                bodyContentMarkdown: editedBody,
              },
            }
          : null
      );
      setIsEditingArticle(false);
      alert('Perubahan naskah berhasil disimpan.');
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setSavingDraft(false);
    }
  };

  // Handler Terbitkan Artikel Langsung ke Portal
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
      alert('Artikel berhasil diterbitkan langsung ke Portal Berita Publik!');
    } catch (err: any) {
      alert(`Gagal menerbitkan: ${err.message}`);
    } finally {
      setPublishingArticle(false);
    }
  };

  // Handler Buat Ulang Poster Visual AI
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

  // Handler Salin WhatsApp, Artikel, dan Instagram
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
    const full = `# ${editedTitle || generatedResult.publication.title}\n\n${editedBody || generatedResult.publication.bodyContentMarkdown}`;
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

  // Handler Simpan Profil Publik Tokoh
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) return;

    setSavingProfile(true);
    setProfileSaveSuccess(null);

    try {
      await AdminApiClient.request(`/operator/tenant-profile/${selectedTenantId}`, {
        method: 'PATCH',
        body: JSON.stringify(profileForm),
      });

      setProfileSaveSuccess('Profil publik tokoh berhasil diperbarui.');
      loadAssignments();
      selectTenant(selectedTenantId);
    } catch (err: any) {
      alert(`Gagal menyimpan profil: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setSavingProfile(false);
    }
  };

  // Filter antrean direktori
  const filteredAssignments = assignments.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.fullName.toLowerCase().includes(q) ||
      (item.partyAffiliation && item.partyAffiliation.toLowerCase().includes(q)) ||
      (item.customDapilName && item.customDapilName.toLowerCase().includes(q));

    if (!matchSearch) return false;
    if (directoryFilter === 'PENDING') return !item.todayStats.hasPublishedToday;
    if (directoryFilter === 'PUBLISHED') return item.todayStats.hasPublishedToday;
    return true;
  });

  const totalAssigned = assignments.length;
  const publishedCount = assignments.filter((a) => a.todayStats.hasPublishedToday).length;
  const progressPercent = totalAssigned > 0 ? Math.round((publishedCount / totalAssigned) * 100) : 0;

  const selectedDewan = assignments.find((a) => a.tenantId === selectedTenantId);
  const branding = getPartyBranding(selectedDewan?.partyAffiliation);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. TOP PIPELINE MONITOR & COMMAND BAR                                    */}
      {/* ========================================================================= */}
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
              Kelola dan publikasikan konten kampanye & kebijakan parlemen untuk seluruh dewan penugasan Anda.
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

          {/* Toggle View Mode */}
          <button
            onClick={() => setViewMode(viewMode === 'WORKSPACE' ? 'DIRECTORY' : 'WORKSPACE')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
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

      {/* ========================================================================= */}
      {/* 2. MODE DIRECTORY: IKHTISAR GRID TOKOH BINAAN (10+ SCALEABLE)            */}
      {/* ========================================================================= */}
      {viewMode === 'DIRECTORY' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header Filter & Pencarian */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0B0F19] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-xs">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              {(['ALL', 'PENDING', 'PUBLISHED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setDirectoryFilter(f)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                    directoryFilter === f
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {f === 'ALL' && `Semua (${totalAssigned})`}
                  {f === 'PENDING' && `Belum Rilis (${totalAssigned - publishedCount})`}
                  {f === 'PUBLISHED' && `Sudah Terbit (${publishedCount})`}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari tokoh, partai, dapil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Grid Tokoh Binaan */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((dewan) => {
              const isSelected = dewan.tenantId === selectedTenantId;
              const isPublishedToday = dewan.todayStats.hasPublishedToday;
              const partyCard = getPartyBranding(dewan.partyAffiliation);

              return (
                <div
                  key={dewan.tenantId}
                  className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 bg-white dark:bg-[#0B0F19] hover:shadow-md ${
                    isSelected ? 'ring-2 ring-indigo-500 border-indigo-400' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-base text-slate-600 dark:text-slate-300 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                      {dewan.photoUrl ? (
                        <img src={dewan.photoUrl} alt={dewan.fullName} className="w-full h-full object-cover" />
                      ) : (
                        dewan.fullName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {dewan.fullName}
                        </h4>
                        {isPublishedToday ? (
                          <span className="shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Terbit</span>
                          </span>
                        ) : (
                          <span className="shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            <span>Perlu Rilis</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {dewan.partyAffiliation || 'Independen'} • {dewan.customDapilName || dewan.legislativeLevel}
                      </p>
                      {dewan.commissionName && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {dewan.commissionName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer Card */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Izin: <strong>{dewan.canDirectPublish ? 'Terbit Langsung' : 'Approval'}</strong>
                    </span>
                    <button
                      onClick={() => {
                        selectTenant(dewan.tenantId);
                        setViewMode('WORKSPACE');
                      }}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition"
                    >
                      <span>Buka Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODE WORKSPACE: DEDICATED FULL-WIDTH STUDIO PER TOKOH BINAAN          */}
      {/* ========================================================================= */}
      {viewMode === 'WORKSPACE' && selectedDewan && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* STEP 1: HORIZONTAL TOKOH PICKER (INTUITIF & MUDAH UNTUK OPERATOR) */}
          <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 text-[11px]">
                  Pilih Tokoh Binaan ({assignments.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  — Klik nama/foto tokoh untuk langsung berpindah
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-500">
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{publishedCount}</span> dari {totalAssigned} tokoh sudah rilis hari ini
              </div>
            </div>

            {/* Pita Kontak Tokoh (Horizontal Scroll) */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-1">
              {assignments.map((item) => {
                const isSelected = item.tenantId === selectedTenantId;
                const isDone = item.todayStats.hasPublishedToday;

                return (
                  <button
                    key={item.tenantId}
                    type="button"
                    onClick={() => selectTenant(item.tenantId)}
                    className={`shrink-0 flex items-center gap-2.5 p-2 pr-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/40'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Foto / Inisial Tokoh */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs overflow-hidden ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {item.photoUrl ? (
                          <img src={item.photoUrl} alt={item.fullName} className="w-full h-full object-cover" />
                        ) : (
                          item.fullName.charAt(0)
                        )}
                      </div>
                      {/* Dot Indikator Status */}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
                          isSelected ? 'border-indigo-600' : 'border-slate-50 dark:border-slate-900'
                        } ${isDone ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        title={isDone ? 'Sudah rilis hari ini' : 'Belum rilis hari ini'}
                      />
                    </div>

                    <div className="min-w-0 max-w-[140px]">
                      <div className="font-bold text-xs truncate">
                        {item.fullName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-1 py-0.2 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.partyAffiliation || 'INDEP'}
                        </span>
                        <span
                          className={`text-[9.5px] font-bold truncate ${
                            isSelected
                              ? 'text-indigo-100'
                              : isDone
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isDone ? '✓ Rilis' : '• Butuh'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PERSONA HEADER TOKOH AKTIF */}
          <div
            className={`rounded-2xl p-5 border bg-gradient-to-r ${branding.gradient} bg-white dark:bg-[#0B0F19] ${branding.border} shadow-sm space-y-4`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Profil Tokoh Aktif */}
              <div className="flex items-center space-x-4">
                <div
                  className={`w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xl text-slate-700 dark:text-slate-200 overflow-hidden ring-2 ${branding.avatarRing} shadow-md shrink-0`}
                >
                  {selectedDewan.photoUrl ? (
                    <img src={selectedDewan.photoUrl} alt={selectedDewan.fullName} className="w-full h-full object-cover" />
                  ) : (
                    selectedDewan.fullName.charAt(0)
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedDewan.fullName}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${branding.badge}`}>
                      {selectedDewan.partyAffiliation || 'INDEPENDEN'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                    <span>{selectedDewan.legislativeLevel}</span>
                    <span>•</span>
                    <span>{selectedDewan.customDapilName || 'Dapil Terdaftar'}</span>
                    {selectedDewan.commissionName && (
                      <>
                        <span>•</span>
                        <span>{selectedDewan.commissionName}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Status Produksi & Izin */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Total Generate Counter */}
                <div className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">
                    Total Generate Bulan Ini: <strong className="text-slate-900 dark:text-white">{tenantContext?.quota?.articleUsed || 0} kali</strong>
                  </span>
                </div>

                {/* Direct Publish Permission */}
                {selectedDewan.canDirectPublish ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Izin Terbit Langsung</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Approval Draf</span>
                  </span>
                )}

                {/* Subscription Status Badge */}
                <span
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                    (tenantContext?.subscriptionStatus || selectedDewan.subscriptionStatus) === 'ACTIVE'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    Paket:{' '}
                    {(tenantContext?.subscriptionStatus || selectedDewan.subscriptionStatus) === 'ACTIVE'
                      ? 'Aktif'
                      : tenantContext?.subscriptionStatus || selectedDewan.subscriptionStatus || 'Non-Aktif'}
                  </span>
                </span>
              </div>
            </div>

            {/* B. WORKSPACE TAB NAVIGATION */}
            <div className="flex items-center space-x-2 border-t border-slate-200/80 dark:border-slate-800/80 pt-3">
              <button
                onClick={() => setActiveTab('CONTENT')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'CONTENT'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pabrik Konten & Visual AI</span>
              </button>

              <button
                onClick={() => setActiveTab('ARTICLES')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'ARTICLES'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Arsip & Draf Naskah ({dewanArticles.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('PROFILE')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'PROFILE'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profil & Branding Tokoh</span>
              </button>

              <button
                onClick={() => setActiveTab('ASPIRASI')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'ASPIRASI'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Aspirasi Warga</span>
              </button>

              <button
                onClick={() => setActiveTab('COMMENTS')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'COMMENTS'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Moderasi Komentar</span>
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* TAB 1: PABRIK KONTEN & VISUAL AI LENGKAP (BEST PRACTICES WORKFLOW)    */}
          {/* ===================================================================== */}
          {activeTab === 'CONTENT' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* JIKA BELUM ADA HASIL: TAMPILKAN FORM PERACIK LENGKAP */}
              {!generatedResult ? (
                <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  {/* Alert Jika Langganan Tokoh Belum Aktif */}
                  {(tenantContext?.subscriptionStatus || selectedDewan.subscriptionStatus) &&
                    (tenantContext?.subscriptionStatus || selectedDewan.subscriptionStatus) !== 'ACTIVE' && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold">
                            Status Paket Tokoh: {tenantContext?.subscriptionStatus || selectedDewan.subscriptionStatus}
                          </p>
                          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                            Fitur pembuatan konten & poster visual AI memerlukan status paket langganan yang aktif. Mohon pastikan aktivasi paket dewan ini telah diselesaikan oleh administrator atau bagian penagihan.
                          </p>
                        </div>
                      </div>
                    )}

                  <form onSubmit={handleGenerateContent} className="space-y-6">
                    {/* 1. INPUT AGENDA / ISU HARI INI */}
                    <div className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            1. Agenda, Isu Lapangan, atau Pernyataan Pers {selectedDewan.fullName} Hari Ini
                          </label>
                          <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2">
                            (Disesuaikan otomatis dengan konstituen {selectedDewan.customDapilName || 'Dapil'})
                          </span>
                        </div>

                        {/* TOMBOL AI PROMPT ENHANCER (BANTUAN PENYEMPURNA PROMPT) */}
                        <button
                          type="button"
                          disabled={isRefiningPrompt || !topicInput.trim()}
                          onClick={handleRefinePrompt}
                          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white text-[11px] font-black shadow-xs disabled:opacity-40 transition cursor-pointer"
                          title="Klik agar AI menyempurnakan catatan kasar Anda menjadi rumusan agenda kebijakan yang terstruktur & berwibawa"
                        >
                          {isRefiningPrompt ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>AI Menyempurnakan...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Sempurnakan Prompt dengan AI</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="relative">
                        <textarea
                          required
                          rows={4}
                          value={topicInput}
                          onChange={(e) => setTopicInput(e.target.value)}
                          placeholder={`Ketik catatan kasar kegiatan reses, keluhan warga, atau ide pokok di sini... Contoh: 'tadi pagi bagi bantuan pupuk di desa ciwidey bareng petani ngeluh soal air'. Lalu klik tombol [Sempurnakan Prompt dengan AI] di atas.`}
                          className="w-full p-4 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
                        />
                      </div>

                      {/* BANNER NOTIFIKASI PROMPT BERHASIL DI-REFINE OLEH AI */}
                      {promptRefinedSuccess && (
                        <div className="p-3 rounded-xl bg-violet-50/90 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-violet-900 dark:text-violet-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                            <span className="text-[11px] font-bold">
                              ✨ Rumusan agenda lapangan berhasil disempurnakan oleh AI Polaris menjadi kalimat kebijakan resmi yang berwibawa.
                            </span>
                          </div>
                          {originalRawPrompt && (
                            <button
                              type="button"
                              onClick={handleUndoRefine}
                              className="text-[11px] font-bold text-violet-700 dark:text-violet-300 hover:underline shrink-0 cursor-pointer self-end sm:self-auto"
                            >
                              Urungkan (Kembalikan Teks Asli)
                            </button>
                          )}
                        </div>
                      )}

                      {/* DETEKSI LINK WEB OTOMATIS */}
                      {topicInput.match(/(https?:\/\/[^\s]+)/gi) && (
                        <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="text-[11px] font-bold">
                            Tautan web berita terdeteksi — Polaris AI akan otomatis menyerap isi berita sebagai rujukan faktual.
                          </span>
                        </div>
                      )}

                      {/* REKOMENDASI ISU HANGAT DAPIL (AI-GENERATED DYNAMIC RADAR) */}
                      <div className="pt-1.5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            <span>Rekomendasi Isu Hangat di {selectedDewan.customDapilName || 'Dapil'} (AI Radar):</span>
                          </span>
                          <button
                            type="button"
                            disabled={loadingTopics}
                            onClick={() => loadTrendingTopics()}
                            className="text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                            title="Generate rekomendasi isu baru dengan AI"
                          >
                            <RefreshCw className={`w-3 h-3 ${loadingTopics ? 'animate-spin' : ''}`} />
                            <span>{loadingTopics ? 'Menganalisis Isu...' : 'Segarkan Isu AI'}</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {trendingTopics.map((top) => (
                            <button
                              key={top}
                              type="button"
                              onClick={() => setTopicInput(top)}
                              className="text-[11px] px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer text-left border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 shadow-2xs"
                            >
                              + {top}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 2. LAMPIRKAN BERKAS LAPANGAN (DROPZONE ATTACHMENTS) */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                          <span>2. Lampirkan Berkas Lapangan / Dokumen Pendukung (Opsional)</span>
                        </label>
                        <span className="text-[10px] text-slate-400">
                          Foto Reses, PDF Nota Dinas, Perda, atau Excel APBD
                        </span>
                      </div>

                      {/* Dropzone Box */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-900/40 p-4 text-center transition-all"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleFileSelection(e.target.files)}
                          multiple
                          accept="image/*,.pdf,.docx,.doc,.xlsx,.xls,.csv,.txt"
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Klik atau seret foto kegiatan reses & dokumen ke sini
                          </div>
                          <p className="text-[10px] text-slate-400">
                            AI otomatis menyerap foto lapangan dan membaca data statistik berkas untuk naskah & visual poster.
                          </p>
                        </div>
                      </div>

                      {/* Daftar Berkas Terlampir */}
                      {attachedFiles.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {attachedFiles.map((file) => {
                            const isImg = file.type.startsWith('image/') || file.name.match(/\.(png|jpg|jpeg|webp)$/i);
                            const isPdf = file.name.toLowerCase().endsWith('.pdf');
                            const isSpreadsheet = file.name.match(/\.(xlsx|xls|csv)$/i);
                            const isDocx = file.name.match(/\.(docx|doc)$/i);

                            let badgeLabel = '📄 Dokumen Pendukung';
                            let badgeStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                            if (isImg) {
                              badgeLabel = '📷 Foto Lapangan (Vision OCR)';
                              badgeStyle = 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                            } else if (isPdf) {
                              badgeLabel = '📑 Dokumen PDF (RAG Chunking Semantik)';
                              badgeStyle = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
                            } else if (isSpreadsheet) {
                              badgeLabel = '📊 Data Anggaran (Tabular)';
                              badgeStyle = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                            } else if (isDocx) {
                              badgeLabel = '📝 Nota Dinas / Word';
                              badgeStyle = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
                            }

                            return (
                              <div
                                key={file.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 gap-2"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                                        {file.name}
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                        ({(file.size / 1024).toFixed(1)} KB)
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${badgeStyle}`}>
                                        {badgeLabel}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        Aset Milik: <strong className="text-slate-600 dark:text-slate-300">{selectedDewan.fullName}</strong>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                    <span>SHA-256 Deduplikasi Aktif</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(file.id)}
                                    className="p-1 rounded-md text-slate-400 hover:text-red-600 transition cursor-pointer"
                                    title="Hapus berkas"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {/* Info Banner Tata Kelola Dokumen */}
                          <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[10.5px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>Tata Kelola Aset & Isolasi Multi-Tenant:</strong> Setiap berkas otomatis tersinkronisasi sebagai basis pengetahuan milik <strong>{selectedDewan.fullName}</strong>. Jika Anda mengunggah berkas yang sama untuk tokoh lain, sistem otomatis mendeduplikasi (SHA-256) secara instan tanpa biaya pemrosesan ganda.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. TARGET PANJANG NASKAH & 4 GAYA BAHASA RESMI POLARIS */}
                    <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {/* Pilihan Panjang Naskah */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                          3. Target Kedalaman Naskah Berita
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              { id: 'SHORT', name: 'Ringkas', words: '~750 kata', desc: 'Rilis pers cepat & padat' },
                              { id: 'MEDIUM', name: 'Standar', words: '~1.500 kata', desc: 'Artikel opini kebijakan berbobot' },
                              { id: 'LONG', name: 'Policy Paper', words: '~3.000 kata', desc: 'Kajian mendalam regulasi & APBD' },
                            ] as const
                          ).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedLength(item.id)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                                selectedLength === item.id
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              <span>{item.name}</span>
                              <span className={`text-[10px] font-normal ${selectedLength === item.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                                ({item.words})
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 4 Gaya Bahasa Resmi POLARIS */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            4. Pilih Gaya Bahasa Kebijakan (4 Gaya Resmi POLARIS)
                          </label>
                          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                            Gaya Terpilih: {WRITING_STYLES[selectedStyle].name}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {(Object.keys(WRITING_STYLES) as WritingStyle[]).map((styleKey) => {
                            const cfg = WRITING_STYLES[styleKey];
                            const Icon = cfg.icon;
                            const isSelected = selectedStyle === styleKey;

                            return (
                              <button
                                key={styleKey}
                                type="button"
                                onClick={() => setSelectedStyle(styleKey)}
                                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                                  isSelected
                                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30 text-indigo-950 dark:text-indigo-200 shadow-sm'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                      }`}
                                    >
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-black">{cfg.name}</span>
                                  </div>
                                  <span
                                    className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                                      isSelected
                                        ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-200'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                    }`}
                                  >
                                    {cfg.badge}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {cfg.focus}
                                </p>

                                <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80 truncate">
                                  Tone: {cfg.tone.split(',')[0]}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 4. TOMBOL GENERATE UTAMA DENGAN INDIKATOR LANGKAH */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {generatingContent ? (
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                          <span>
                            {generationStep === 1 && 'Tahap 1/3: Menganalisis konstituen & isu daerah...'}
                            {generationStep === 2 && 'Tahap 2/3: Menyintesis naskah berita & bukti kebijakan...'}
                            {generationStep >= 3 && 'Tahap 3/3: Merender poster visual AI HD (DALL-E 3)...'}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span>AI Engine otomatis mematuhi batas wilayah dapil & branding partai tokoh.</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={
                          generatingContent ||
                          !topicInput.trim() ||
                          ((tenantContext?.subscriptionStatus || selectedDewan?.subscriptionStatus) !== 'ACTIVE' &&
                            Boolean(tenantContext?.subscriptionStatus || selectedDewan?.subscriptionStatus))
                        }
                        className="flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition cursor-pointer"
                      >
                        {generatingContent ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Sedang Memproses...</span>
                          </>
                        ) : (tenantContext?.subscriptionStatus || selectedDewan?.subscriptionStatus) &&
                          (tenantContext?.subscriptionStatus || selectedDewan?.subscriptionStatus) !== 'ACTIVE' ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-amber-300" />
                            <span>Paket Belum Aktif</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Buat Berita & Poster Visual Otomatis</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* ========================================================================= */
                /* KANVAS HASIL LENGKAP: INSPECT, EDIT, POSTER DALL-E & FORMAT WHATSAPP    */
                /* ========================================================================= */
                <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in slide-in-from-bottom-2">
                  {/* HEADER KANVAS HASIL */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {generatedResult.publication.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ~{(generatedResult.publication.bodyContentMarkdown || '').split(/\s+/).filter(Boolean).length} kata
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                        {editedTitle || generatedResult.publication.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setGeneratedResult(null);
                          setTopicInput('');
                          setAttachedFiles([]);
                        }}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Buat Konten Baru untuk Tokoh Ini</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 SUB-TAB KANVAS: NASKAH BERITA, POSTER VISUAL, & WHATSAPP/MEDSOS */}
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <button
                      type="button"
                      onClick={() => setResultTab('article')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        resultTab === 'article'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Naskah Berita Utuh</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setResultTab('poster')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        resultTab === 'poster'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Visual AI Poster (DALL-E 3)</span>
                      {generatedResult.posterUrl && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setResultTab('social')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        resultTab === 'social'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Siaran Pers WhatsApp & Medsos</span>
                    </button>
                  </div>

                  {/* SUB-TAB 1: NASKAH BERITA UTUH (PREVIEW & EDIT MODE) */}
                  {resultTab === 'article' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <BookOpen className="w-4 h-4 text-indigo-500" />
                          <span>Format Berita Resmi Siap Tayang</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingArticle(!isEditingArticle)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isEditingArticle ? 'Batal Edit' : 'Edit Naskah'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCopyArticle}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedArticle ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedArticle ? 'Tersalin!' : 'Salin Naskah'}</span>
                          </button>
                        </div>
                      </div>

                      {/* KONTEN NASKAH */}
                      {!isEditingArticle ? (
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                            {editedTitle || generatedResult.publication.title}
                          </h2>
                          <div className="text-xs font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-3">
                            Rilis Media • {selectedDewan.fullName} ({selectedDewan.partyAffiliation || 'Fraksi Parlemen'}) • Dapil {selectedDewan.customDapilName || 'Terdaftar'}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-3 whitespace-pre-line font-serif">
                            {editedBody || generatedResult.publication.bodyContentMarkdown}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                          <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              Judul Berita
                            </label>
                            <input
                              type="text"
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              className="w-full p-3 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              Isi Naskah Berita (Markdown)
                            </label>
                            <textarea
                              rows={12}
                              value={editedBody}
                              onChange={(e) => setEditedBody(e.target.value)}
                              className="w-full p-3.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono leading-relaxed"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setIsEditingArticle(false)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              disabled={savingDraft}
                              onClick={handleSaveEditedArticle}
                              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              {savingDraft ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                              <span>Simpan Perubahan</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 2: POSTER VISUAL AI (DALL-E 3) */}
                  {resultTab === 'poster' && (
                    <div className="space-y-4">
                      {generatedResult.posterUrl ? (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-500" />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Poster Visual AI Beresolusi Tinggi • Branding {selectedDewan.fullName}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={generatedResult.posterUrl}
                                download={`${selectedDewan.fullName.replace(/\s+/g, '_')}_Poster.jpg`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Unduh Gambar HD</span>
                              </a>

                              <button
                                type="button"
                                disabled={regeneratingPoster}
                                onClick={handleRegeneratePoster}
                                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                              >
                                {regeneratingPoster ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                                ) : (
                                  <RotateCcw className="w-3.5 h-3.5" />
                                )}
                                <span>{regeneratingPoster ? 'Merender...' : 'Buat Ulang Poster'}</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-center p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <img
                              src={generatedResult.posterUrl}
                              alt="Poster Kebijakan Visual"
                              className="max-h-[500px] w-auto rounded-xl shadow-lg object-contain"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                          <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Poster Visual AI Sedang Diproses
                          </h4>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            DALL-E 3 sedang merender poster visual di antrean latar belakang. Anda dapat mengklik tombol di bawah untuk menyegarkan tampilan.
                          </p>
                          <button
                            type="button"
                            onClick={handleRegeneratePoster}
                            disabled={regeneratingPoster}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${regeneratingPoster ? 'animate-spin' : ''}`} />
                            <span>Cek & Render Poster</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 3: FORMAT WHATSAPP & MEDSOS */}
                  {resultTab === 'social' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Kartu Format WhatsApp */}
                      <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                              <span>💬 Siaran Pers WhatsApp (Grup Warga & Wartawan)</span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                              Format Siap Sebar
                            </span>
                          </div>

                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed whitespace-pre-line border border-emerald-100 dark:border-emerald-900/40 max-h-72 overflow-y-auto">
                            {generatedResult.socialPack?.whatsappBroadcastText ||
                              generatedResult.socialPack?.whatsappBroadcast ||
                              `*SIARAN PERS RESMI*\n*${generatedResult.publication.title}*\n_${selectedDewan.fullName} — ${selectedDewan.partyAffiliation || ''}_\n\n${generatedResult.publication.excerpt || ''}\n\n📌 *Poin Pokok Kebijakan:*\n${(generatedResult.publication.bodyContentMarkdown || '').slice(0, 450)}...\n\nBaca rilis selengkapnya di portal resmi:\n${publishedUrl || `https://polaris.id/p/${generatedResult.publication.id}`}`}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyWa}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          {copiedWa ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedWa ? 'Tersalin ke Clipboard!' : 'Salin Pesan Siaran WhatsApp (1-Klik)'}</span>
                        </button>
                      </div>

                      {/* Kartu Format Instagram & Threads */}
                      <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                              <span>📸 Keterangan Instagram & Threads</span>
                            </span>
                            <span className="text-[10px] font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded">
                              Kanal Visual
                            </span>
                          </div>

                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed whitespace-pre-line border border-purple-100 dark:border-purple-900/40 max-h-72 overflow-y-auto">
                            {generatedResult.socialPack?.instagramCaption ||
                              `${generatedResult.publication.title}\n\n${generatedResult.publication.excerpt || ''}\n\n#${(selectedDewan.customDapilName || 'Dapil').replace(/\s+/g, '')} #SuaraRakyat #KerjaNyata #Polaris`}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopyIg}
                          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          {copiedIg ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedIg ? 'Tersalin!' : 'Salin Keterangan Instagram'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AKSI PENERBITAN RESMI PORTAL & REKOMENDASI TOKOH BERIKUTNYA */}
                  <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Status Penerbitan Resmi: {generatedResult.publication.status}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {selectedDewan.canDirectPublish
                            ? 'Akun Anda memiliki izin Terbit Langsung tanpa menunggu persetujuan dewan.'
                            : 'Akun Anda memerlukan persetujuan dewan sebelum artikel tayang live.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedDewan.canDirectPublish ? (
                          generatedResult.publication.status !== 'PUBLISHED' ? (
                            <button
                              type="button"
                              disabled={publishingArticle}
                              onClick={handlePublishArticle}
                              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm"
                            >
                              {publishingArticle ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              <span>Terbitkan Langsung ke Portal Publik</span>
                            </button>
                          ) : (
                            <span className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Telah Terbit Live di Portal</span>
                            </span>
                          )
                        ) : (
                          <span className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-300">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span>Draf Siap Diajukan ke Tokoh</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* REKOMENDASI TOKOH BINAAN SELANJUTNYA */}
                    {assignments.filter((a) => !a.todayStats.hasPublishedToday && a.tenantId !== selectedTenantId).length > 0 ? (
                      <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
                        <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 block">
                          Lanjut buatkan untuk tokoh binaan berikutnya yang belum rilis hari ini:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {assignments
                            .filter((a) => !a.todayStats.hasPublishedToday && a.tenantId !== selectedTenantId)
                            .map((nextA) => (
                              <button
                                key={nextA.tenantId}
                                type="button"
                                onClick={() => {
                                  selectTenant(nextA.tenantId);
                                  setTopicInput('');
                                  setAttachedFiles([]);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                              >
                                <span>{nextA.fullName}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Luar biasa! Seluruh tokoh binaan Anda ({totalAssigned}) telah memiliki konten rilis hari ini.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB: ARSIP NASKAH & DRAF BERITA TOKOH (KATALOG LENGKAP)               */}
          {/* ===================================================================== */}
          {activeTab === 'ARTICLES' && (
            <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Arsip & Draf Naskah: {selectedDewan.fullName}</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Daftar seluruh karya berita, draf, dan publikasi AI yang tersimpan di profil dewan ini.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedResult(null);
                      setActiveTab('CONTENT');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Naskah Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadDewanArticles(selectedTenantId || undefined)}
                    disabled={loadingDewanArticles}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingDewanArticles ? 'animate-spin' : ''}`} />
                    <span>Segarkan</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {(['ALL', 'DRAFT', 'PUBLISHED'] as const).map((mode) => {
                    const count =
                      mode === 'ALL'
                        ? dewanArticles.length
                        : mode === 'DRAFT'
                        ? dewanArticles.filter((a) => a.status !== 'PUBLISHED').length
                        : dewanArticles.filter((a) => a.status === 'PUBLISHED').length;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setArticlesFilter(mode)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          articlesFilter === mode
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {mode === 'ALL' ? 'Semua' : mode === 'DRAFT' ? 'Draf' : 'Tayang'}{' '}
                        <span className="opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari judul naskah..."
                    value={articlesSearch}
                    onChange={(e) => setArticlesSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* List of Articles */}
              {loadingDewanArticles ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                  <span className="text-xs">Memuat arsip naskah dewan...</span>
                </div>
              ) : filteredDewanArticles.length === 0 ? (
                <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Belum ada naskah untuk filter ini
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Gunakan tab "Pabrik Konten & Visual AI" untuk membuat naskah pertama.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDewanArticles.map((art) => {
                    const isPublished = art.status === 'PUBLISHED';
                    const isLoadingCanvas = loadingCanvasArticleId === art.id;

                    return (
                      <div
                        key={art.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-900/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isPublished
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {isPublished ? '✓ TAYANG' : '• DRAF'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {art.createdAt ? new Date(art.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {art.title}
                          </h5>
                          {art.excerpt && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {art.excerpt}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => loadArticleToCanvas(art.id)}
                            disabled={isLoadingCanvas}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition cursor-pointer"
                          >
                            {isLoadingCanvas ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Edit3 className="w-3.5 h-3.5" />
                            )}
                            <span>Buka di Kanvas Editor</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: PROFIL PUBLIK & IDENTITAS TOKOH (DELEGASI OPERATOR RESMI)      */}
          {/* ===================================================================== */}
          {activeTab === 'PROFILE' && (
            <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Manajemen Profil & Portofolio Publik Dewan
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Perbarui nama resmi, komisi, partai, bio, dan foto yang ditampilkan di Portal Publik Tokoh.
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Kredensial & Sandi Dewan Aman Terisolasi</span>
                </div>
              </div>

              {profileSaveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{profileSaveSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Lengkap & Gelar */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nama Lengkap & Gelar Resmi
                    </label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      placeholder="Contoh: H. Ahmad Fauzi, S.E., M.M."
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Partai Politik */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Partai Politik / Fraksi
                    </label>
                    <input
                      type="text"
                      value={profileForm.partyAffiliation}
                      onChange={(e) => setProfileForm({ ...profileForm, partyAffiliation: e.target.value })}
                      placeholder="Contoh: Golkar, PDI Perjuangan, Gerindra..."
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Nama Dapil Kustom */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Daerah Pemilihan (Dapil)
                    </label>
                    <input
                      type="text"
                      value={profileForm.customDapilName}
                      onChange={(e) => setProfileForm({ ...profileForm, customDapilName: e.target.value })}
                      placeholder="Contoh: Jawa Barat I (Kota Bandung & Cimahi)"
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Komisi & Tugas Parlemen */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Komisi / Alat Kelengkapan Dewan (AKD)
                    </label>
                    <input
                      type="text"
                      value={profileForm.commissionName}
                      onChange={(e) => setProfileForm({ ...profileForm, commissionName: e.target.value })}
                      placeholder="Contoh: Komisi IV (Pertanian, Pangan, Maritim)"
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Foto Profil URL */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      URL Foto Resmi Tokoh
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={profileForm.photoUrl}
                        onChange={(e) => setProfileForm({ ...profileForm, photoUrl: e.target.value })}
                        placeholder="https://... URL foto resolusi tinggi berlatar formal"
                        className="flex-1 p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {profileForm.photoUrl && (
                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border">
                          <img src={profileForm.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Riwayat Pendidikan & Bio Ringkas */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Profil & Pernyataan Visi Tokoh
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.education}
                      onChange={(e) => setProfileForm({ ...profileForm, education: e.target.value })}
                      placeholder="Pernyataan komitmen pelayanan publik, rekam jejak, atau pendidikan tokoh."
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Perubahan Profil</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: TRIAGE ASPIRASI WARGA                                         */}
          {/* ===================================================================== */}
          {activeTab === 'ASPIRASI' && (
            <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Aspirasi & Suara Warga Dapil Masuk
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Klasifikasikan dan verifikasi aduan warga yang masuk melalui portal publik resmi dewan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Warga Konstituen (NIK Terproteksi: 3204*********441)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    RECEIVED
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  "Pak Dewan, jalan poros desa di perbatasan rusak parah kena longsor minggu lalu. Truk pengangkut hasil tani terpaksa memutar 15 km. Mohon dibantu advokasi ke dinas PU provinsi."
                </p>
                <div className="flex items-center space-x-2 pt-2 text-xs">
                  <span className="text-[11px] text-slate-400">Kategori:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 font-bold">
                    INFRASTRUKTUR
                  </span>
                  <button className="ml-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm">
                    Verifikasi & Masukkan ke Risalah
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: MODERASI KOMENTAR PUBLIK                                      */}
          {/* ===================================================================== */}
          {activeTab === 'COMMENTS' && (
            <div className="bg-white dark:bg-[#0B0F19] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Moderasi Komentar Portal Publik
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Saring dan setujui komentar warga sebelum ditampilkan di portal resmi dewan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Budi Santoso (Komentator Terverifikasi Google)
                  </span>
                  <span className="text-[11px] text-slate-400">10 menit yang lalu</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  "Aspirasi yang sangat bagus bapak, semoga pupuk bersubsidi benar-benar merata sampai ke petani gurem di desa kami."
                </p>
                <div className="flex items-center justify-end space-x-2 pt-2 text-xs">
                  <button className="px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold transition">
                    Sembunyikan / Spam
                  </button>
                  <button className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-sm">
                    Setujui Tampil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
