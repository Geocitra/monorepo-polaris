'use client';

import React, { useState } from 'react';
import {
  PlusCircle,
  History,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Sparkles,
  Cpu,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { TopupTokenModal } from './TopupTokenModal';
import { TopupHistoryModal } from './TopupHistoryModal';

export interface SingleProviderVaultData {
  id: string;
  provider: 'OPENAI' | 'GEMINI';
  totalBudgetIdr: number;
  consumedBudgetIdr: number;
  remainingBudgetIdr: number;
  percentRemaining: number;
  percentConsumed: number;
  totalTokensConsumed: number;
  totalImagesGenerated: number;
  alertThresholdPercent: number;
  isAlertActive: boolean;
  lastTopupDate: string | null;
}

export interface MasterPoolData {
  id: string;
  liveFxRateIdr?: number;
  totalBudgetIdr: number;
  consumedBudgetIdr: number;
  remainingBudgetIdr: number;
  percentRemaining: number;
  percentConsumed: number;
  totalTokensConsumed: number;
  totalImagesGenerated?: number;
  alertThresholdPercent: number;
  isAlertActive: boolean;
  lastTopupDate: string | null;
  openaiPool?: SingleProviderVaultData;
  geminiPool?: SingleProviderVaultData;
  recentTopups: Array<{
    id: string;
    provider?: 'OPENAI' | 'GEMINI';
    amountIdr: number;
    amountUsd?: number;
    fxRateApplied?: number;
    tokensAdded?: number;
    paymentReference: string;
    notes: string;
    createdAt: string;
  }>;
}

interface MasterTokenPoolCardProps {
  pool?: MasterPoolData;
  liveFxRateIdr?: number;
  onRefresh: () => void;
}

export function MasterTokenPoolCard({ pool, liveFxRateIdr, onRefresh }: MasterTokenPoolCardProps) {
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedTopupProvider, setSelectedTopupProvider] = useState<'OPENAI' | 'GEMINI'>('OPENAI');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const fxRate = liveFxRateIdr || pool?.liveFxRateIdr || 16300;

  const openaiVault: SingleProviderVaultData = pool?.openaiPool || {
    id: 'openai-vault',
    provider: 'OPENAI',
    totalBudgetIdr: 0,
    consumedBudgetIdr: 0,
    remainingBudgetIdr: 0,
    percentRemaining: 100,
    percentConsumed: 0,
    totalTokensConsumed: 0,
    totalImagesGenerated: 0,
    alertThresholdPercent: 20,
    isAlertActive: false,
    lastTopupDate: null,
  };

  const geminiVault: SingleProviderVaultData = pool?.geminiPool || {
    id: 'gemini-vault',
    provider: 'GEMINI',
    totalBudgetIdr: 0,
    consumedBudgetIdr: 0,
    remainingBudgetIdr: 0,
    percentRemaining: 100,
    percentConsumed: 0,
    totalTokensConsumed: 0,
    totalImagesGenerated: 0,
    alertThresholdPercent: 20,
    isAlertActive: false,
    lastTopupDate: null,
  };

  const combinedRemainingIdr =
    pool?.remainingBudgetIdr ?? openaiVault.remainingBudgetIdr + geminiVault.remainingBudgetIdr;
  const combinedTotalIdr =
    pool?.totalBudgetIdr ?? openaiVault.totalBudgetIdr + geminiVault.totalBudgetIdr;
  const combinedConsumedIdr =
    pool?.consumedBudgetIdr ?? openaiVault.consumedBudgetIdr + geminiVault.consumedBudgetIdr;
  const anyAlert = Boolean(openaiVault.isAlertActive || geminiVault.isAlertActive);

  const openTopupFor = (provider: 'OPENAI' | 'GEMINI') => {
    setSelectedTopupProvider(provider);
    setShowTopupModal(true);
  };

  const renderVaultCard = (
    vault: SingleProviderVaultData,
    title: string,
    subtitle: string,
    accentTheme: 'emerald' | 'indigo'
  ) => {
    const isAlert = vault.isAlertActive;
    const pctRemaining = Math.max(0, Math.min(100, vault.percentRemaining ?? 0));

    return (
      <div
        key={vault.provider}
        className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  accentTheme === 'emerald'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300/60 dark:border-indigo-800'
                }`}
              >
                {vault.provider}
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {title}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={() => openTopupFor(vault.provider)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shrink-0 ${
              accentTheme === 'emerald'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-xs shadow-emerald-600/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-600/20'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Top Up {vault.provider}</span>
          </button>
        </div>

        {/* Balance in Rupiah */}
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Sisa Saldo Tersedia ({vault.provider})
              </span>
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tight mt-0.5 ${
                  isAlert
                    ? 'text-rose-600 dark:text-rose-400'
                    : accentTheme === 'emerald'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                }`}
              >
                Rp {Math.round(vault.remainingBudgetIdr || 0).toLocaleString('id-ID')}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                dari total deposit Rp {Math.round(vault.totalBudgetIdr || 0).toLocaleString('id-ID')} (
                {pctRemaining}% tersisa)
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Terpakai
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                Rp {Math.round(vault.consumedBudgetIdr || 0).toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-slate-400 block">
                ({vault.percentConsumed ?? 100 - pctRemaining}% digunakan)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden p-0.5 flex">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isAlert
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                  : accentTheme === 'emerald'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-indigo-500 to-blue-500'
              }`}
              style={{ width: `${Math.max(4, pctRemaining)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
            <span>Rp 0 (Habis)</span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              Ambang Peringatan: {vault.alertThresholdPercent ?? 20}%
            </span>
            <span>Rp {Math.round(vault.totalBudgetIdr || 0).toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Token & Image Counters */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase">Token {vault.provider}</span>
              <Cpu className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-1">
              {(vault.totalTokensConsumed || 0).toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-slate-400 block">Akumulasi teks & vision</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-[#0B0F17] border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase">Render Gambar</span>
              <ImageIcon className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-1">
              {(vault.totalImagesGenerated || 0).toLocaleString('id-ID')} visual
            </div>
            <span className="text-[10px] text-slate-400 block">
              {vault.provider === 'OPENAI' ? 'DALL-E 3 HD' : 'Imagen 3 & Relayout'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 shadow-sm transition-all relative overflow-hidden space-y-5">
        {/* TOP ROW: Title, Combined Summary & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
                anyAlert
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}
            >
              {anyAlert ? (
                <AlertTriangle className="h-6 w-6 animate-bounce" />
              ) : (
                <ShieldCheck className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Master Credit Vault Terpisah: OpenAI & Google Gemini (Rupiah)
                </h2>
                {anyAlert ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                    Peringatan: Salah Satu Saldo Menipis (&le; 20%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Kedua Vault AI Berstatus Aman
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total Sisa Gabungan:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  Rp {Math.round(combinedRemainingIdr).toLocaleString('id-ID')}
                </strong>{' '}
                / Rp {Math.round(combinedTotalIdr).toLocaleString('id-ID')} (Terpakai Rp{' '}
                {Math.round(combinedConsumedIdr).toLocaleString('id-ID')})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <History className="h-3.5 w-3.5" />
              <span>Riwayat Top Up</span>
            </button>

            <button
              type="button"
              onClick={() => openTopupFor('OPENAI')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Catat Top Up Saldo (Rp)</span>
            </button>
          </div>
        </div>

        {/* DUAL PROVIDER VAULTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 relative z-10">
          {renderVaultCard(
            openaiVault,
            'Vault OpenAI API',
            'Naskah Kebijakan 5-Bab (GPT-4o), Perencana Riset (GPT-4o-mini), RAG Embedding & Poster DALL-E 3',
            'emerald'
          )}
          {renderVaultCard(
            geminiVault,
            'Vault Google Gemini & Imagen',
            'Ekstraksi Bukti (Gemini 2.5 Flash), OCR Dokumen, Kanvas Imagen 3, Vision Critic & Img2Img Relayout',
            'indigo'
          )}
        </div>

        {/* BOTTOM ROW: Footer Insight Banner */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span>
              Seluruh tarif token dan generasi gambar dikonversi otomatis ke Rupiah menggunakan kurs API dinamis saat transaksi berlangsung (Rp {Math.round(fxRate).toLocaleString('id-ID')}/USD).
            </span>
          </div>
          {pool?.lastTopupDate && (
            <span className="text-[11px] text-slate-400 shrink-0">
              Top Up Terakhir:{' '}
              {new Date(pool.lastTopupDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      {/* MODAL 1: Catat Top Up */}
      <TopupTokenModal
        isOpen={showTopupModal}
        defaultProvider={selectedTopupProvider}
        liveFxRateIdr={fxRate}
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
