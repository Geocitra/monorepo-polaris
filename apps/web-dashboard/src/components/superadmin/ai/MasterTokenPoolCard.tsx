'use client';

import React, { useState } from 'react';
import { DollarSign, PlusCircle, History, AlertTriangle, ShieldCheck, Zap, Sparkles, Cpu } from 'lucide-react';
import { TopupTokenModal } from './TopupTokenModal';
import { TopupHistoryModal } from './TopupHistoryModal';

export interface MasterPoolData {
  id: string;
  totalBudgetUsd: number;
  totalBudgetIdr: number;
  consumedBudgetUsd: number;
  consumedBudgetIdr: number;
  remainingBudgetUsd: number;
  remainingBudgetIdr: number;
  percentRemaining: number;
  percentConsumed: number;
  totalTokensConsumed: number;
  alertThresholdPercent: number;
  isAlertActive: boolean;
  lastTopupDate: string;
  recentTopups: Array<{
    id: string;
    amountUsd: number;
    amountIdr: number;
    tokensAdded?: number;
    paymentReference: string;
    notes: string;
    createdAt: string;
  }>;
}

interface MasterTokenPoolCardProps {
  pool?: MasterPoolData;
  onRefresh: () => void;
}

export function MasterTokenPoolCard({ pool, onRefresh }: MasterTokenPoolCardProps) {
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Defaults fallback
  const totalUsd = pool?.totalBudgetUsd ?? 150;
  const totalIdr = pool?.totalBudgetIdr ?? Math.round(totalUsd * 16250);
  const consumedUsd = pool?.consumedBudgetUsd ?? 12.25;
  const consumedIdr = pool?.consumedBudgetIdr ?? Math.round(consumedUsd * 16250);
  const remainingUsd = pool?.remainingBudgetUsd ?? Math.max(0, totalUsd - consumedUsd);
  const remainingIdr = pool?.remainingBudgetIdr ?? Math.round(remainingUsd * 16250);
  const percentRemaining = pool?.percentRemaining ?? Math.round((remainingUsd / (totalUsd || 1)) * 100);
  const isAlert = pool?.isAlertActive ?? (percentRemaining <= 20);
  const totalTokensUsed = pool?.totalTokensConsumed ?? 2450000;

  return (
    <>
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm transition-all relative overflow-hidden">
        {/* Glow ambient background decoration */}
        <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-emerald-500/10 via-indigo-500/5 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />

        {/* TOP ROW: Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isAlert 
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' 
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
            }`}>
              {isAlert ? <AlertTriangle className="h-6 w-6 animate-bounce" /> : <ShieldCheck className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Master Credit Vault & Saldo OpenAI
                </h2>
                {isAlert ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                    Peringatan: Saldo Menipis (&le; 20%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Saldo Operasional Aman
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pengawasan sisa deposit saldo kredit OpenAI platform POLARIS secara akurat & realtime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <History className="h-3.5 w-3.5" />
              <span>Riwayat Top Up</span>
            </button>

            <button
              onClick={() => setShowTopupModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Catat Top Up Saldo</span>
            </button>
          </div>
        </div>

        {/* MIDDLE SECTION: Big Visual Balance Gauge & Numbers */}
        <div className="py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Main Visual Progress Gauge */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sisa Saldo Deposit Tersedia
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    ${remainingUsd.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    / ${totalUsd.toFixed(2)} USD ({percentRemaining}% Tersedia)
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mt-0.5">
                  &asymp; Rp {remainingIdr.toLocaleString('id-ID')} tersisa
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Terpakai
                </span>
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                  ${consumedUsd.toFixed(2)} ({100 - percentRemaining}%)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  &asymp; Rp {consumedIdr.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 flex">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isAlert 
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500' 
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500'
                }`}
                style={{ width: `${Math.max(5, percentRemaining)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>$0.00 (Habis)</span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                <Zap className="h-3 w-3 text-amber-500" />
                Peringatan Ambang Batas: {pool?.alertThresholdPercent ?? 20}%
              </span>
              <span>Deposit Penuh (${totalUsd.toFixed(2)})</span>
            </div>
          </div>

          {/* Sub-Metric Cards: Total Modal & Total Token Terpakai */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            {/* Total Modal Deposit */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Total Modal Deposit
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                ${totalUsd.toFixed(2)}
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                &asymp; Rp {totalIdr.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Total Token Yang Sudah Digenerate */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Token Di-consume
                </span>
                <Cpu className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 font-mono">
                {totalTokensUsed.toLocaleString('id-ID')}
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                Akumulasi seluruh dewan
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Footer Insight Banner */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span>
              Saldo berkurang otomatis sesuai pemakaian riil OpenAI (GPT-4o, mini, & DALL-E). Catat setiap kali isi ulang saldo di OpenAI.
            </span>
          </div>
          {pool?.lastTopupDate && (
            <span className="text-[11px] text-slate-400 shrink-0">
              Top Up Terakhir: {new Date(pool.lastTopupDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* MODAL 1: Catat Top Up */}
      <TopupTokenModal
        isOpen={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        onSuccess={() => {
          setShowTopupModal(false);
          onRefresh();
        }}
      />

      {/* MODAL 2: Riwayat Top Up */}
      <TopupHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        histories={pool?.recentTopups || []}
      />
    </>
  );
}
