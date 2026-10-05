'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  ArrowLeft,
  MessageSquare,
  History,
  Plus,
  ChevronDown,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

import {
  InfographicSession,
  InfographicIteration,
  VisualStyle,
  AspectRatio,
} from '@/components/studio/infografis/InfographicTypes';
import { InfographicSessionDrawer } from '@/components/studio/infografis/InfographicSessionDrawer';
import { InfographicVersionDrawer } from '@/components/studio/infografis/InfographicVersionDrawer';
import { IterationStrip } from '@/components/studio/infografis/IterationStrip';
import { InfographicCanvas } from '@/components/studio/infografis/InfographicCanvas';
import { InfographicPromptBar } from '@/components/studio/infografis/InfographicPromptBar';
import { LockoutModal } from '@/components/studio/LockoutModal';

const STORAGE_KEY = 'polaris_infographic_sessions_v1';

// Sesi Awal Bawaan (Default Seed)
const SEED_SESSIONS: InfographicSession[] = [
  {
    id: 'session-internet-desa',
    title: 'Akses Internet & Lab Komputer Desa',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    activeIterationId: 'iter-internet-2',
    iterations: [
      {
        id: 'iter-internet-1',
        versionNumber: 1,
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        prompt: 'Infografis pemerataan akses internet di sekolah 3T dengan data alokasi dana desa',
        imageUrl: '/images/showcase-poster-surya.jpg',
        caption: 'Visual DALL-E 3: Laboratorium Digital Pedesaan',
        title: 'Menjembatani Kesenjangan Digital: Internet untuk Setiap Siswa',
        style: 'infographic',
        aspectRatio: '16:9',
        source: 'INITIAL',
      },
      {
        id: 'iter-internet-2',
        versionNumber: 2,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        prompt: 'Tambahkan data alokasi anggaran APBD dan grafik realisasi belanja publik',
        imageUrl: '/images/showcase-infografis-apbd.jpg',
        caption: 'Visual Infografis: Alokasi Belanja Publik APBD',
        title: 'Transparansi APBD: Alokasi Belanja TIK Sekolah Desa 2026',
        style: 'infographic',
        aspectRatio: '16:9',
        source: 'REFINE',
      },
    ],
  },
  {
    id: 'session-pertanian-desa',
    title: 'Modernisasi Sawah & Irigasi Pertanian',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    activeIterationId: 'iter-tani-1',
    iterations: [
      {
        id: 'iter-tani-1',
        versionNumber: 1,
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        prompt: 'Foto realis panen raya padi organik dengan kelompok tani di pedesaan',
        imageUrl: '/images/showcase-artikel-pertanian.jpg',
        caption: 'Visual Foto Realis: Ketahanan Pangan & Irigasi',
        title: 'Penguatan Ketahanan Pangan & Distribusi Pupuk Subsidi Petani',
        style: 'photo',
        aspectRatio: '16:9',
        source: 'INITIAL',
      },
    ],
  },
];

export default function InfografisStudioPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [lockoutModalOpen, setLockoutModalOpen] = useState(false);

  // Multi-Sesi & Multi-Iterasi States
  const [sessions, setSessions] = useState<InfographicSession[]>(SEED_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>(SEED_SESSIONS[0].id);

  // Drawer States
  const [sessionDrawerOpen, setSessionDrawerOpen] = useState(false);
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);

  // Prompt Form States
  const [promptInput, setPromptInput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle>('infographic');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('16:9');

  // Load sessions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
        }
      }
    } catch {
      // fallback to seed
    }
  }, []);

  // Save sessions to localStorage
  function persistSessions(newSessions: InfographicSession[]) {
    setSessions(newSessions);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
    } catch {
      // ignore
    }
  }

  // Load user profile & billing status
  useEffect(() => {
    async function loadData() {
      try {
        const p = await ApiClient.request<any>('/auth/me');
        const b = await ApiClient.request<any>('/billing/status').catch(() => null);
        setProfile(p);
        setBilling(b);
      } catch {
        router.push('/login');
      }
    }
    loadData();
  }, [router]);

  const isUnpaid = billing?.subscriptionStatus !== 'ACTIVE';

  // Active Session and Active Iteration
  const currentSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const currentIteration =
    currentSession?.iterations.find((it) => it.id === currentSession.activeIterationId) ||
    currentSession?.iterations[currentSession.iterations.length - 1];

  // Buat Sesi Baru (+ Chat Baru)
  function handleCreateNewSession() {
    const newSessionId = `session-${Date.now()}`;
    const newSession: InfographicSession = {
      id: newSessionId,
      title: 'Desain Infografis Baru',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeIterationId: `iter-${Date.now()}-1`,
      iterations: [
        {
          id: `iter-${Date.now()}-1`,
          versionNumber: 1,
          timestamp: new Date().toISOString(),
          prompt: 'Konsep awal poster kebijakan publik',
          imageUrl: '/images/showcase-poster-surya.jpg',
          caption: 'Visual Awal: Laboratorium Digital',
          title: 'Gagasan Desain Kebijakan Publik',
          style: 'infographic',
          aspectRatio: '16:9',
          source: 'INITIAL',
        },
      ],
    };

    const updated = [newSession, ...sessions];
    persistSessions(updated);
    setActiveSessionId(newSessionId);
    setPromptInput('');
    toast({
      type: 'success',
      title: 'Sesi Baru Dibuat',
      description: 'Silakan ketik prompt atau instruksi visual yang ingin Anda rancang.',
    });
  }

  // Ganti Sesi
  function handleSelectSession(sessionId: string) {
    setActiveSessionId(sessionId);
    setPromptInput('');
  }

  // Ubah Nama Sesi
  function handleRenameSession(sessionId: string, newTitle: string) {
    const updated = sessions.map((s) =>
      s.id === sessionId ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s
    );
    persistSessions(updated);
  }

  // Hapus Sesi
  function handleDeleteSession(sessionId: string) {
    if (sessions.length <= 1) return;
    const filtered = sessions.filter((s) => s.id !== sessionId);
    persistSessions(filtered);
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0].id);
    }
  }

  // Ganti Iterasi Aktif
  function handleSelectIteration(iterationId: string) {
    const updated = sessions.map((s) =>
      s.id === activeSessionId ? { ...s, activeIterationId: iterationId } : s
    );
    persistSessions(updated);
  }

  // Restore Iterasi
  function handleRestoreIteration(targetIter: InfographicIteration) {
    const newIterId = `iter-${Date.now()}`;
    const restoredIteration: InfographicIteration = {
      ...targetIter,
      id: newIterId,
      versionNumber: currentSession.iterations.length + 1,
      timestamp: new Date().toISOString(),
      source: 'RESTORE',
    };

    const updated = sessions.map((s) => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          activeIterationId: newIterId,
          iterations: [...s.iterations, restoredIteration],
        };
      }
      return s;
    });

    persistSessions(updated);
    toast({
      type: 'success',
      title: `Dikembalikan ke Versi ${targetIter.versionNumber}`,
      description: `Iterasi baru (Versi ${currentSession.iterations.length + 1}) berhasil dibuat dari Versi ${targetIter.versionNumber}.`,
    });
  }

  // Eksekusi Prompting / Refine
  async function handleAIPromptSubmit(e?: React.FormEvent, customSuggestion?: string) {
    if (e) e.preventDefault();
    const promptText = (customSuggestion || promptInput).trim();
    if (!promptText) return;

    if (isUnpaid) {
      setLockoutModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await ApiClient.request<any>('/studio/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: `Infografis Publik: ${promptText}. STRICT CONSTRAINT: DO NOT generate any institutional logos, government emblems, regional seals, party logos, coat of arms, badges, or watermark symbols.`,
          comparisonRegion: profile?.electoralDistrict?.dapilName || 'Dapil Anda',
          generateDallePoster: true,
          aspectRatio: selectedAspectRatio,
          style: selectedStyle,
        }),
      });

      const jobId = res?.jobId || res?.data?.jobId;
      const publicationId = res?.publicationId || res?.data?.publicationId;

      let newImageUrl = currentIteration?.imageUrl || '/images/showcase-poster-surya.jpg';
      let newTitle = promptText.slice(0, 50);

      if (jobId && publicationId) {
        for (let i = 0; i < 60; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          try {
            const statusRes = await ApiClient.request<any>(`/studio/jobs/${jobId}`);
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

        const detail = await ApiClient.request<any>(`/studio/articles/${publicationId}`);
        if (detail?.asset?.cdnPublicUrl || detail?.asset?.r2StorageUrl) {
          newImageUrl = detail.asset.cdnPublicUrl || detail.asset.r2StorageUrl;
        }
        if (detail?.article?.title) {
          newTitle = detail.article.title;
        }
      } else if (res?.dalleImageUrl || res?.imageUrl) {
        newImageUrl = res.dalleImageUrl || res.imageUrl;
      }

      const nextVersionNumber = (currentSession?.iterations.length || 0) + 1;
      const newIterationId = `iter-${Date.now()}`;

      const newIteration: InfographicIteration = {
        id: newIterationId,
        versionNumber: nextVersionNumber,
        timestamp: new Date().toISOString(),
        prompt: promptText,
        imageUrl: newImageUrl,
        caption: `Visual AI: ${promptText}`,
        title: newTitle,
        style: selectedStyle,
        aspectRatio: selectedAspectRatio,
        source: currentSession?.iterations.length === 0 ? 'INITIAL' : 'REFINE',
      };

      const updated = sessions.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: s.title === 'Desain Infografis Baru' ? newTitle.slice(0, 35) : s.title,
            updatedAt: new Date().toISOString(),
            activeIterationId: newIterationId,
            iterations: [...s.iterations, newIteration],
          };
        }
        return s;
      });

      persistSessions(updated);
      setPromptInput('');

      toast({
        type: 'success',
        title: `Versi ${nextVersionNumber} Berhasil Dibuat!`,
        description: 'Visual baru telah dirender dan ditambahkan ke linimasa iterasi.',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menghasilkan Gambar',
        description: err.message || 'Terjadi kendala pada mesin AI visual.',
      });
    } finally {
      setLoading(false);
    }
  }

  // Unduh Gambar HD
  async function handleDownloadHD() {
    if (!currentIteration) return;
    setDownloading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const link = document.createElement('a');
      link.href = currentIteration.imageUrl;
      link.download = `Infografis-V${currentIteration.versionNumber}-${currentIteration.title.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30)}-300DPI.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        type: 'success',
        title: 'Berkas Siap Cetak Diunduh',
        description: 'Format resolusi tinggi siap dipublikasikan di media cetak atau digital.',
      });
    } finally {
      setDownloading(false);
    }
  }

  // Publikasi ke Website Publik
  async function handlePublish() {
    if (!currentIteration) return;
    if (isUnpaid) {
      setLockoutModalOpen(true);
      return;
    }

    setPublishing(true);
    try {
      await ApiClient.request<any>('/studio/articles/publish', {
        method: 'POST',
        body: JSON.stringify({
          title: currentIteration.title,
          bodyContentMarkdown: `# ${currentIteration.title}\n\n![${currentIteration.title}](${currentIteration.imageUrl})\n\n*Dipublikasikan melalui Studio Infografis Polaris Gov.*`,
        }),
      });

      const portalDomain = profile?.subdomain
        ? `http://${profile.subdomain}.localhost:3001`
        : 'http://localhost:3001';
      setPublishedUrl(`${portalDomain}/artikel/kesenjangan-digital`);

      toast({
        type: 'success',
        title: 'Infografis Diterbitkan!',
        description: 'Telah tayang di galeri publik website resmi dewan.',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Mempublikasikan',
        description: err.message || 'Terjadi kendala saat menerbitkan.',
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

        <main className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl w-full mx-auto transition-all duration-300">
          {/* HEADER NAVIGASI MINIMAL DENGAN SELECTOR SESI & RIWAYAT VERSI */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* SISI KIRI: BREADCRUMB & SELECTOR SESI */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Studio</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="text-slate-700 dark:text-slate-200 font-extrabold">Poster & Infografis</span>
              </Link>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              {/* PEMILIH SESI CHAT AKTIF */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSessionDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs transition-all cursor-pointer"
                  title="Klik untuk membuka daftar sesi chat"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-slate-400 text-[11px]">Sesi:</span>
                  <span className="font-extrabold max-w-[180px] sm:max-w-[220px] truncate text-slate-900 dark:text-slate-100 text-[11px]">
                    {currentSession?.title || 'Desain Baru'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={handleCreateNewSession}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 shadow-2xs transition-all cursor-pointer"
                  title="Buka sesi chat visual baru yang bersih"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Baru</span>
                </button>
              </div>
            </div>

            {/* SISI KANAN: TOMBOL RIWAYAT VERSI */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setVersionDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs transition-all cursor-pointer"
                title="Buka linimasa semua iterasi visual"
              >
                <History className="h-3.5 w-3.5 text-purple-500" />
                <span>Riwayat Iterasi ({currentSession?.iterations.length || 0})</span>
              </button>
            </div>
          </div>

          {/* WARNING BANNER LISENSI */}
          {isUnpaid && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-xs font-medium">
                  <strong>Mode Pratinjau:</strong> Generator visual AI dan publikasi website resmi memerlukan lisensi aktif.
                </p>
              </div>
              <Link href="/billing">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shrink-0 shadow-xs">
                  Aktivasi Lisensi
                </Button>
              </Link>
            </div>
          )}

          {/* KANVAS VISUAL UTAMA */}
          {currentIteration && (
            <div className="space-y-3">
              <InfographicCanvas
                iteration={currentIteration}
                authorName={profile?.fullName}
                partyAffiliation={profile?.partyAffiliation}
                onDownload={handleDownloadHD}
                downloading={downloading}
                onPublish={handlePublish}
                publishing={publishing}
                publishedUrl={publishedUrl}
                isUnpaid={isUnpaid}
              />

              {/* STRIP ITERASI CEPAT (DI BAWAH KANVAS) */}
              {currentSession && currentSession.iterations.length > 1 && (
                <IterationStrip
                  iterations={currentSession.iterations}
                  activeIterationId={currentSession.activeIterationId}
                  onSelectIteration={handleSelectIteration}
                  onOpenHistoryDrawer={() => setVersionDrawerOpen(true)}
                />
              )}
            </div>
          )}

          {/* PROMPT & REFINE BAR (DI BAWAH KANVAS) */}
          <InfographicPromptBar
            prompt={promptInput}
            onPromptChange={setPromptInput}
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
            selectedAspectRatio={selectedAspectRatio}
            onAspectRatioChange={setSelectedAspectRatio}
            onSubmit={handleAIPromptSubmit}
            loading={loading}
            isUnpaid={isUnpaid}
            hasExistingIteration={Boolean(currentIteration)}
          />
        </main>
      </div>

      {/* DRAWER SESI CHAT */}
      <InfographicSessionDrawer
        isOpen={sessionDrawerOpen}
        onClose={() => setSessionDrawerOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onCreateNewSession={handleCreateNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
      />

      {/* DRAWER RIWAYAT VERSI / ITERASI */}
      {currentSession && (
        <InfographicVersionDrawer
          isOpen={versionDrawerOpen}
          onClose={() => setVersionDrawerOpen(false)}
          iterations={currentSession.iterations}
          activeIterationId={currentSession.activeIterationId}
          onSelectIteration={handleSelectIteration}
          onRestoreIteration={handleRestoreIteration}
        />
      )}

      {/* MODAL LISENSI */}
      <LockoutModal
        isOpen={lockoutModalOpen}
        onClose={() => setLockoutModalOpen(false)}
        featureTitle="Akses AI Infografis Terkunci"
        featureDescription="Fitur desain visual AI dan publikasi website resmi hanya dapat digunakan setelah lisensi akun Anda diaktifkan."
      />
    </div>
  );
}
