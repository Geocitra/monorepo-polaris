'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Sparkles } from 'lucide-react';

import { ExecutiveHeroBanner } from '@/components/dashboard/ExecutiveHeroBanner';
import { SentimentPulseRadar } from '@/components/dashboard/SentimentPulseRadar';
import { PriorityFocusCard } from '@/components/dashboard/PriorityFocusCard';
import { StrategicPolicyFeed } from '@/components/dashboard/StrategicPolicyFeed';

export default function DashboardHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [briefing, setBriefing] = useState<any>(null);
  const [briefingError, setBriefingError] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await ApiClient.request<any>('/auth/me');
        const billingStatus = await ApiClient.request<any>('/billing/status').catch(() => null);
        let morningData = null;
        try {
          morningData = await ApiClient.request<any>('/studio/morning-briefing');
        } catch {
          setBriefingError(true);
        }

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0D14]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            Memuat Ruang Kerja POLARIS...
          </p>
        </div>
      </div>
    );
  }

  const isUnpaid = billing?.subscriptionStatus !== 'ACTIVE';

  return (
    <div className="flex min-h-screen bg-slate-100/70 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar subdomain={profile?.subdomain} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          fullName={profile?.fullName}
          party={profile?.partyAffiliation}
          subdomain={profile?.subdomain}
          subscriptionStatus={billing?.subscriptionStatus}
          currentPeriodEnd={billing?.currentPeriodEnd}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto transition-all duration-300">
          {/* BANNER NOTIFIKASI JIKA BELUM MENYELESAIKAN PEMBAYARAN */}
          {isUnpaid && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-amber-400/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                    Akun POLARIS Anda Belum Aktif
                  </h4>
                  <p className="text-xs text-amber-100 mt-0.5">
                    Selesaikan aktivasi akun untuk membuka akses penuh ke pembuatan artikel, infografis AI, dan analisis isu.
                  </p>
                </div>
              </div>

              <Link href="/billing">
                <Button variant="secondary" size="sm" className="bg-white text-slate-900 shadow-md font-bold shrink-0 hover:bg-slate-100">
                  Aktivasi Sekarang
                </Button>
              </Link>
            </div>
          )}

          {briefingError && (
            <div
              role="alert"
              className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-300"
            >
              Kabar pagi sedang memperbarui data wilayah dan informasi terbaru. Silakan muat ulang beberapa saat lagi.
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* BENTO GRID ROW 1: EXECUTIVE HERO (LEFT) + RADAR & FOCUS (RIGHT) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left 8 Cols: Executive Representative Presence + Frosted KPI Bar */}
            <div className="lg:col-span-8 flex flex-col">
              <ExecutiveHeroBanner profile={profile} briefing={briefing} />
            </div>

            {/* Right 4 Cols: Sentiment Pulse Radar & Priority Constituents Focus Card */}
            <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
              <SentimentPulseRadar metrics={briefing?.metrics} />
              <PriorityFocusCard priorityIssues={briefing?.priorityIssues} />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* BENTO GRID ROW 2: STRATEGIC POLICY RELEASES & REGIONAL FEED      */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="w-full">
            <StrategicPolicyFeed
              news={briefing?.briefingNews}
              agendas={briefing?.todayAgenda}
              recommendation={briefing?.recommendation}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
