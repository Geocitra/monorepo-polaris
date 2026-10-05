'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft, Save, Globe, Loader2, EyeOff } from 'lucide-react';
import { ArticleEditorForm } from '@/components/studio/editor/ArticleEditorForm';
import { ArticlePosterSidebar } from '@/components/studio/editor/ArticlePosterSidebar';
import { ArticleSocialSidebar } from '@/components/studio/editor/ArticleSocialSidebar';

export default function ArticleEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const articleId = params?.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [regeneratingPoster, setRegeneratingPoster] = useState(false);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [bodyContentMarkdown, setBodyContentMarkdown] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [socialPack, setSocialPack] = useState<any>(null);

  useEffect(() => {
    async function loadArticle() {
      try {
        const p = await ApiClient.request<any>('/auth/me');
        const b = await ApiClient.request<any>('/billing/status');
        const res = await ApiClient.request<any>(`/studio/articles/${articleId}`);

        setProfile(p);
        setBilling(b);

        if (res?.article) {
          setTitle(res.article.title);
          setExcerpt(res.article.excerpt);
          setBodyContentMarkdown(res.article.bodyContentMarkdown);
          setStatus(res.article.status);
          setCanonicalUrl(res.article.canonicalUrl);
        }

        if (res?.asset) {
          setPosterUrl(res.asset.cdnPublicUrl);
        }

        if (res?.socialPack) {
          setSocialPack(res.socialPack);
        }
      } catch (err: any) {
        toast({ type: 'error', title: 'Gagal Memuat', description: err.message || 'Artikel tidak ditemukan.' });
        router.push('/studio/library');
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [articleId, router, toast]);

  async function handleSaveDraft() {
    setSaving(true);
    try {
      await ApiClient.request<any>(`/studio/articles/${articleId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          excerpt,
          bodyContentMarkdown,
        }),
      });
      toast({ type: 'success', title: 'Tersimpan!', description: 'Perubahan draf artikel berhasil disimpan.' });
    } catch (err: any) {
      toast({ type: 'error', title: 'Gagal Menyimpan', description: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const res = await ApiClient.request<any>(`/studio/articles/${articleId}/publish`, {
        method: 'POST',
      });
      setStatus('PUBLISHED');
      setCanonicalUrl(res.canonicalUrl);
      toast({ type: 'success', title: 'Resmi Terbit!', description: 'Artikel tayang di website publik Anda.' });
    } catch (err: any) {
      toast({ type: 'error', title: 'Gagal Menerbitkan', description: err.message });
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    setPublishing(true);
    try {
      await ApiClient.request<any>(`/studio/articles/${articleId}/unpublish`, {
        method: 'POST',
      });
      setStatus('UNPUBLISHED');
      toast({ type: 'warning', title: 'Ditarik dari Publik', description: 'Status artikel kini UNPUBLISHED.' });
    } catch (err: any) {
      toast({ type: 'error', title: 'Gagal Menarik', description: err.message });
    } finally {
      setPublishing(false);
    }
  }

  async function handleRegeneratePoster() {
    setRegeneratingPoster(true);
    try {
      await ApiClient.request(`/studio/articles/${articleId}/poster/regenerate`, { method: 'POST' });
      toast({
        type: 'success',
        title: 'Poster masuk antrean',
        description: 'Naskah tetap aman. Poster akan diperbarui setelah proses selesai.',
      });
    } catch (err: any) {
      toast({ type: 'error', title: 'Gagal menjadwalkan poster', description: err.message });
    } finally {
      setRegeneratingPoster(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href="/studio/library"
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Kelola Konten & Web</span>
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={saving}
                loading={saving}
              >
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Draf</span>
              </Button>

              {status === 'PUBLISHED' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnpublish}
                  disabled={publishing}
                  loading={publishing}
                  className="bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>Tarik Publikasi</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={publishing}
                  loading={publishing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Terbitkan ke Website</span>
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-8">
              <ArticleEditorForm
                title={title}
                setTitle={setTitle}
                excerpt={excerpt}
                setExcerpt={setExcerpt}
                bodyContentMarkdown={bodyContentMarkdown}
                setBodyContentMarkdown={setBodyContentMarkdown}
              />
            </div>

            <div className="lg:col-span-4 space-y-5 sticky top-24">
              <ArticlePosterSidebar
                posterUrl={posterUrl}
                title={title}
                isRegenerating={regeneratingPoster}
                onRegenerate={handleRegeneratePoster}
              />
              <ArticleSocialSidebar socialPack={socialPack} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
