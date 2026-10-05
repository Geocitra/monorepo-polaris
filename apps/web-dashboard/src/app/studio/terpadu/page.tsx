'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useToast } from '@/components/ui/toast';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';

import { CampaignForm, AttachedFileItem } from '@/components/studio/terpadu/CampaignForm';
import { CampaignPreview } from '@/components/studio/terpadu/CampaignPreview';
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

  const isUnpaid = billing?.subscriptionStatus !== 'ACTIVE';

  // Auto-fill dari query param (misal diklik dari Beranda)
  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      setTopic(decodeURIComponent(topicParam));
    }
  }, [searchParams]);

  // Muat data profil, billing, dan isu prioritas dari cron job briefing
  useEffect(() => {
    async function init() {
      try {
        const [p, b, briefing] = await Promise.all([
          ApiClient.request<any>('/auth/me'),
          ApiClient.request<any>('/billing/status'),
          ApiClient.request<any>('/studio/morning-briefing').catch(() => null),
        ]);
        setProfile(p);
        setBilling(b);

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

      const data = res.data || res;
      setGeneratedResult(data);
      setActiveTab('article');

      toast({
        type: 'success',
        title: 'Konten Siap!',
        description: 'Naskah artikel, poster visual, dan pesan siaran WhatsApp/Instagram telah selesai dibuat.',
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
          {/* BREADCRUMB MINIMAL */}
          <Link
            href="/studio"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Studio</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-600 dark:text-slate-300">Buat Konten Lengkap</span>
          </Link>

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
            />
          </div>
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
