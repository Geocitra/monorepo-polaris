'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, CreditCard } from 'lucide-react';

import { PulseMetrics } from '@/components/dashboard/PulseMetrics';
import { PriorityIssuesSection } from '@/components/dashboard/PriorityIssuesSection';
import { RegionalNewsSection } from '@/components/dashboard/RegionalNewsSection';
import { ParliamentAgendaSection } from '@/components/dashboard/ParliamentAgendaSection';

export default function DashboardHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [briefing, setBriefing] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await ApiClient.request<any>('/auth/me');
        const billingStatus = await ApiClient.request<any>('/billing/status').catch(() => null);
        const morningData = await ApiClient.request<any>('/studio/morning-briefing').catch(() => null);

        setProfile(userProfile);
        setBilling(billingStatus);
        setBriefing(morningData);
      } catch (err: any) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isUnpaid = billing?.subscriptionStatus !== 'ACTIVE';

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

        <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto transition-all duration-300">
          {/* BANNER NOTIFIKASI JIKA BELUM MENYELESAIKAN PEMBAYARAN */}
          {isUnpaid && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                    Lisensi Parlemen Anda Belum Aktif
                  </h4>
                  <p className="text-xs text-amber-100 mt-0.5">
                    Selesaikan aktivasi langganan untuk membuka akses pembuatan artikel AI 3.000 kata dan poster DALL-E.
                  </p>
                </div>
              </div>

              <Link href="/billing">
                <Button variant="secondary" size="sm" className="bg-white text-slate-900 shadow-sm shrink-0">
                  Aktivasi Sekarang
                </Button>
              </Link>
            </div>
          )}

          {/* HEADER EKSEKUTIF UTAMA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-blue-600 text-white">
                  RINGKASAN PAGI
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {briefing?.dateGreeting}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                Selamat Pagi, {profile?.fullName?.split(' ')[0] || 'Anggota Dewan'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Berikut adalah ringkasan situasi wilayah {briefing?.member?.dapilName || 'Dapil'} dan agenda penting hari ini.
              </p>
            </div>

            <Link href="/studio">
              <Button size="md" className="gap-2 shadow-md">
                <Sparkles className="h-4 w-4" />
                <span>Buka Studio Konten AI</span>
              </Button>
            </Link>
          </div>

          {/* 1. PULSE METRICS */}
          <PulseMetrics metrics={briefing?.metrics} />

          {/* 2. TOP 3 ISU WILAYAH PRIORITAS */}
          <PriorityIssuesSection issues={briefing?.priorityIssues} />

          {/* 3. BERITA DAERAH & AGENDA PARLEMEN */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-8 space-y-4">
              <RegionalNewsSection news={briefing?.briefingNews} />
            </div>

            <div className="lg:col-span-4 space-y-4">
              <ParliamentAgendaSection
                agendas={briefing?.todayAgenda}
                recommendation={briefing?.recommendation}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
