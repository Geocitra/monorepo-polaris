'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useToast } from '@/components/ui/toast';
import { BookOpen, Plus, Loader2, ArrowLeft } from 'lucide-react';
import { ArticleFilters } from '@/components/studio/library/ArticleFilters';
import { ArticleTable } from '@/components/studio/library/ArticleTable';

export default function ArticleLibraryPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, b, list] = await Promise.all([
          ApiClient.request<any>('/auth/me'),
          ApiClient.request<any>('/billing/status').catch(() => null),
          ApiClient.request<any[]>('/studio/articles').catch(() => []),
        ]);

        setProfile(p);
        setBilling(b);
        setArticles(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load library:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleTogglePublish(articleId: string, currentStatus: string) {
    const isPublished = currentStatus === 'PUBLISHED';
    const endpoint = isPublished
      ? `/studio/articles/${articleId}/unpublish`
      : `/studio/articles/${articleId}/publish`;

    setActionLoadingId(articleId);

    try {
      await ApiClient.request<any>(endpoint, { method: 'POST' });
      setArticles(
        articles.map((a) =>
          a.id === articleId ? { ...a, status: isPublished ? 'UNPUBLISHED' : 'PUBLISHED' } : a
        )
      );
      toast({
        type: isPublished ? 'warning' : 'success',
        title: isPublished ? 'Ditarik dari Website' : 'Berhasil Ditayangkan!',
        description: isPublished 
          ? 'Artikel tidak lagi muncul di website publik.' 
          : 'Artikel resmi tayang di website publik Anda.',
      });
    } catch (err: any) {
      toast({ type: 'error', title: 'Gagal Mengubah Status', description: err.message || 'Terjadi kendala.' });
    } finally {
      setActionLoadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const publishedCount = articles.filter((a) => a.status === 'PUBLISHED').length;
  const draftCount = articles.filter((a) => a.status !== 'PUBLISHED').length;

  const filteredArticles = articles.filter((item) => {
    const matchesFilter =
      activeFilter === 'ALL' ||
      (activeFilter === 'PUBLISHED' && item.status === 'PUBLISHED') ||
      (activeFilter === 'DRAFT' && item.status !== 'PUBLISHED');

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const portalDomain = profile?.subdomain
    ? `http://${profile.subdomain}.localhost:3001`
    : 'http://localhost:3001';

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

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* HEADER NAVIGASI MINIMAL (HEADERLESS) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* BREADCRUMB MINIMAL */}
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Studio</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-700 dark:text-slate-200 font-extrabold">Pustaka Konten</span>
            </Link>

            <Link
              href="/studio"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs shadow-xs hover:opacity-90 transition-opacity shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span> Buat Konten Baru</span>
            </Link>
          </div>

          {/* FILTER & PENCARIAN BAR */}
          <ArticleFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalCount={articles.length}
            publishedCount={publishedCount}
            draftCount={draftCount}
          />

          {/* TABEL KONTEN */}
          <ArticleTable
            articles={filteredArticles}
            portalDomain={portalDomain}
            actionLoadingId={actionLoadingId}
            onTogglePublish={handleTogglePublish}
            totalArticlesCount={articles.length}
          />
        </main>
      </div>
    </div>
  );
}
