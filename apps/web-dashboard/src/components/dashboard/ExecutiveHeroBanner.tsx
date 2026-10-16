'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, TrendingUp, Users, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

interface ExecutiveHeroBannerProps {
  profile?: {
    fullName?: string;
    partyAffiliation?: string;
    avatarUrl?: string;
    photoUrl?: string;
    officialPhotoUrl?: string;
    subdomain?: string;
  } | null;
  briefing?: {
    dateGreeting?: string;
    member?: {
      fullName?: string;
      partyAffiliation?: string;
      dapilName?: string;
      commissionName?: string;
      photoUrl?: string;
    };
    metrics?: {
      totalAspirasi?: number;
      pendingFollowUp?: number;
      resolvedAspirasi?: number;
      sentimentIndex?: string | null;
      sentimentLabel?: string;
    };
  } | null;
}

export function ExecutiveHeroBanner({ profile, briefing }: ExecutiveHeroBannerProps) {
  const { colors } = useTheme();

  const memberName = profile?.fullName || briefing?.member?.fullName || 'Pimpinan';
  const partyName = profile?.partyAffiliation || briefing?.member?.partyAffiliation || 'Institusi';
  const dapilName = briefing?.member?.dapilName || 'Wilayah Kerja';
  const commissionName = briefing?.member?.commissionName || 'Bidang Terkait';

  // Dynamic Dewan Official Photo (from upload or fallback cutout transparent image)
  const defaultCutout = '/images/avatar-dewan-cutout.webp';
  const initialResolved =
    profile?.photoUrl ||
    profile?.officialPhotoUrl ||
    profile?.avatarUrl ||
    briefing?.member?.photoUrl ||
    defaultCutout;

  const [imageSrc, setImageSrc] = useState<string>(initialResolved);

  useEffect(() => {
    const nextPhoto =
      profile?.photoUrl ||
      profile?.officialPhotoUrl ||
      profile?.avatarUrl ||
      briefing?.member?.photoUrl ||
      defaultCutout;
    setImageSrc(nextPhoto);
  }, [profile?.photoUrl, profile?.officialPhotoUrl, profile?.avatarUrl, briefing?.member?.photoUrl]);

  const totalAspirasi = briefing?.metrics?.totalAspirasi ?? 0;
  const pendingCount = briefing?.metrics?.pendingFollowUp ?? 0;
  const resolvedCount = briefing?.metrics?.resolvedAspirasi ?? 0;

  // Sentiment scoring & tone color
  const rawSentiment = briefing?.metrics?.sentimentIndex || '54%';
  const numSentiment = parseFloat(String(rawSentiment).replace('%', '')) || 54;
  const sentimentTone = numSentiment >= 70 ? 'positive' : numSentiment >= 45 ? 'moderate' : 'critical';
  const sentimentColor = sentimentTone === 'positive' ? '#10B981' : sentimentTone === 'moderate' ? '#F59E0B' : '#EF4444';
  const sentimentText = sentimentTone === 'positive' ? 'Positif' : sentimentTone === 'moderate' ? 'Netral' : 'Kritis';

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800/80 bg-gradient-to-br from-white via-slate-50/80 to-blue-50/30 dark:from-[#121622] dark:via-[#0E121B] dark:to-[#0A0D14] shadow-xl dark:shadow-2xl p-6 sm:p-7 md:p-8 flex flex-col justify-between min-h-[440px] group transition-all duration-300">
      {/* ─── DYNAMIC RADIAL AURA BEHIND THE REPRESENTATIVE ─── */}
      <div
        className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full pointer-events-none opacity-15 dark:opacity-35 blur-3xl transition-all duration-700 -mr-16 -mt-16"
        style={{
          background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none opacity-10 dark:opacity-20 blur-3xl transition-all duration-700 -ml-20 -mb-20"
        style={{
          background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
        }}
      />

      {/* ─── AMBIENT GEOMETRIC GRID OVERLAY ─── */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none text-slate-900 dark:text-white"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* ─── TOP HEADER / TAGLINE IN HERO ─── */}
      <div className="relative z-10 space-y-3 max-w-md sm:max-w-lg md:max-w-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm flex items-center gap-1.5"
            style={{
              backgroundColor: `${colors.primary}18`,
              borderColor: `${colors.primary}40`,
              color: colors.primary,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }} />
            Kabar Hari Ini
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {briefing?.dateGreeting || 'Pantauan Pagi Hari Ini'}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="text-slate-800 dark:text-slate-200">{partyName}</span>
            <span>•</span>
            <span className="font-extrabold text-blue-600 dark:text-blue-400">{dapilName}</span>
            <span>•</span>
            <span className="text-slate-600 dark:text-slate-400">{commissionName}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2]">
            Dengar Suara Publik,{' '}
            <span
              className="bg-clip-text text-transparent bg-gradient-to-r"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, #D97706, #F59E0B)`,
              }}
            >
              Ambil Langkah Tepat
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/80 leading-relaxed max-w-md pt-0.5">
            Selamat pagi, <strong className="text-slate-900 dark:text-white font-extrabold">{memberName}</strong>. POLARIS telah merangkum apa saja yang ramai dibicarakan publik dan pesan masuk yang perlu perhatian Anda hari ini.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link href="/studio">
            <Button
              size="sm"
              className="font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
              style={{
                backgroundColor: colors.primary,
                color: '#FFFFFF',
                boxShadow: `0 10px 25px -5px ${colors.primary}40`,
              }}
            >
              <Sparkles className="h-4 w-4" />
              <span>Buka Studio Konten AI</span>
            </Button>
          </Link>

          <Link href="/aspirasi">
            <Button
              variant="outline"
              size="sm"
              className="font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 shadow-sm transition-all cursor-pointer"
            >
              <span>Tinjau {pendingCount} Pesan &amp; Aspirasi Masuk</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── PERSON CUT-OUT PORTRAIT (ANCHOR VISUAL) ─── */}
      <div className="absolute right-0 sm:right-4 md:right-8 bottom-0 w-64 sm:w-72 md:w-80 lg:w-[360px] h-[85%] max-h-[400px] pointer-events-none select-none flex items-end justify-end">
        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt={memberName}
            fill
            sizes="(max-width: 768px) 260px, 360px"
            priority
            onError={() => setImageSrc(defaultCutout)}
            className="object-contain object-bottom transition-all duration-500 group-hover:scale-[1.02]"
            style={{
              maskImage: 'linear-gradient(to bottom, black 75%, transparent 98%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 98%)',
            }}
          />
        </div>
      </div>

      {/* ─── FLOATING FROSTED GLASS KPI PILL (OVERLAPPING AT BOTTOM) ─── */}
      <div className="relative z-20 mt-6 pt-2">
        <div className="w-full max-w-3xl backdrop-blur-2xl bg-white/85 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-700/60 rounded-2xl shadow-lg dark:shadow-2xl p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 items-center">
          {/* KPI 1: ASPIRASI & SUARA MASUK */}
          <div className="space-y-1 pl-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              <span>Aspirasi &amp; Suara Masuk</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{totalAspirasi}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">+18 minggu ini</span>
            </div>
            <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[70%]" />
            </div>
          </div>

          {/* KPI 2: JANGKAUAN PUBLIK */}
          <div className="space-y-1 pl-2 border-l border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
              <span>Jangkauan Publik</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">485k</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Impresi</span>
            </div>
            <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full w-[85%]" />
            </div>
          </div>

          {/* KPI 3: KASUS TERSELESAIKAN */}
          <div className="space-y-1 pl-2 border-l border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
              <span>Terselesaikan</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{resolvedCount}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Disposisi</span>
            </div>
            <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-[60%]" />
            </div>
          </div>

          {/* KPI 4: INDEKS SENTIMEN POSITIF */}
          <div className="space-y-1 pl-2 border-l border-slate-200/80 dark:border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: sentimentColor }} />
                <span>Sentimen Publik</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{rawSentiment}</span>
                <span className="text-[10px] font-bold" style={{ color: sentimentColor }}>{sentimentText}</span>
              </div>
              <div className="w-24 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full w-[54%]" style={{ backgroundColor: sentimentColor }} />
              </div>
            </div>

            <Link
              href="/aspirasi"
              className="h-8 w-8 rounded-xl flex items-center justify-center transition-all bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white shrink-0 shadow-sm border border-slate-200 dark:border-transparent"
              title="Lihat Rincian Seluruh Aspirasi"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
