'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { TrendingUp, Radio } from 'lucide-react';

interface SentimentPulseRadarProps {
  metrics?: {
    sentimentIndex?: string | null;
    sentimentLabel?: string;
    totalAspirasi?: number;
  };
}

export function SentimentPulseRadar({ metrics }: SentimentPulseRadarProps) {
  const { colors } = useTheme();

  const sentimentPercent = metrics?.sentimentIndex || '54%';
  const numScore = parseFloat(String(sentimentPercent).replace('%', '')) || 54;
  const totalAspirasi = metrics?.totalAspirasi ?? 0;

  const statusColor = numScore >= 70 ? '#10B981' : numScore >= 45 ? '#F59E0B' : '#EF4444';

  // Dual smooth bezier wave points matching executive intelligence telemetry
  const primaryWavePath = 'M 10,75 C 60,25 110,95 160,50 C 210,15 250,80 290,45';
  const secondaryWavePath = 'M 10,90 C 50,70 100,85 150,75 C 200,65 240,25 290,85';

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-gradient-to-br dark:from-[#121622] dark:via-[#0E121B] dark:to-[#0A0D14] shadow-lg dark:shadow-2xl p-5 sm:p-6 flex flex-col justify-between flex-1 min-h-[210px] group transition-all duration-300">
      {/* ─── AMBIENT GLOW ACCENT ─── */}
      <div
        className="absolute top-0 right-0 w-44 h-44 rounded-full pointer-events-none opacity-10 dark:opacity-20 blur-2xl"
        style={{ background: colors.primary }}
      />

      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Pantauan Opini Publik Hari Ini
          </span>
          <span className="text-amber-500 dark:text-amber-400 text-sm">💡</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          <span>Live Pulse</span>
        </div>
      </div>

      {/* ─── NATIVE DUAL-WAVE SVG CHART (SMOOTH BEZIER CURVES) ─── */}
      <div className="relative w-full h-24 my-auto z-10 flex items-center">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between h-18 text-[9px] font-mono text-slate-400 dark:text-slate-500 pr-2 select-none">
          <span>80</span>
          <span>50</span>
          <span>20</span>
          <span>0</span>
        </div>

        {/* SVG Waves Canvas */}
        <div className="relative flex-1 h-full">
          <svg
            viewBox="0 0 300 110"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Peak Milestone Vertical Indicator Line */}
            <line
              x1="240"
              y1="25"
              x2="240"
              y2="105"
              stroke="currentColor"
              className="text-slate-300 dark:text-slate-600"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.6"
            />

            {/* Peak Highlighting Pill Card */}
            <g transform="translate(220, -2)">
              <rect
                width="40"
                height="20"
                rx="8"
                className="fill-white dark:fill-[#0F172A] drop-shadow-md"
                stroke={statusColor}
                strokeWidth="1.2"
              />
              <text
                x="20"
                y="14"
                textAnchor="middle"
                className="fill-slate-900 dark:fill-[#F8FAFC]"
                fontSize="10"
                fontWeight="800"
                fontFamily="sans-serif"
              >
                {numScore}%
              </text>
              <circle cx="20" cy="26" r="3.5" fill={statusColor} />
            </g>

            {/* Wave 2: Dynamic trend curve (Yellow/Amber neon) */}
            <path
              d={secondaryWavePath}
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_6px_rgba(245,158,11,0.35)]"
            />

            {/* Wave 1: Positive sentiment (Primary / Emerald neon) */}
            <path
              d={primaryWavePath}
              stroke={colors.primary}
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]"
            />
          </svg>

          {/* X-Axis Month / Day Labels */}
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500 pt-1 px-2 select-none">
            <span>Sen</span>
            <span>Rab</span>
            <span>Jum</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">Hari Ini</span>
          </div>
        </div>
      </div>

      {/* ─── FOOTER SUBMETRIC ─── */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 relative z-10">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ backgroundColor: statusColor }} />
          <span>{metrics?.sentimentLabel || (numScore >= 70 ? 'Opini publik cenderung positif' : 'Cenderung netral / stabil')}</span>
        </span>
        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
          {totalAspirasi} Pesan Masuk
        </span>
      </div>
    </div>
  );
}
