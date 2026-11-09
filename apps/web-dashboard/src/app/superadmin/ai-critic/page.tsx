'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  BrainCircuit,
  Eye,
  RefreshCw,
  Layers,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';

interface CriticChecklist {
  textOnPhotoDetected?: boolean;
  pieChartDetected?: boolean;
  pieChartDuplicateNumbers?: boolean;
  pointDuplicationDetected?: boolean;
  spellingAccurate?: boolean;
  contrastClean?: boolean;
}

interface CriticLogItem {
  id: string;
  tenantId?: string;
  publicationId?: string;
  jobId?: string;
  archetype: string;
  layoutVariant?: number;
  topic: string;
  overallScore: number;
  passed: boolean;
  autoRepaired: boolean;
  checklist: CriticChecklist;
  critiqueNotes: string[];
  remedyInstructions?: string;
  beforeImageUrl?: string;
  finalImageUrl?: string;
  durationMs: number;
  createdAt: string;
}

interface LearnedMemoryItem {
  id: string;
  archetype: string;
  category: string;
  title: string;
  ruleInstruction: string;
  triggerCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CriticStats {
  totalAudited: number;
  passedCount: number;
  autoRepairedCount: number;
  avgScore: number;
  passRate: number;
  activeRulesCount: number;
}

export default function SuperadminAiCriticPage() {
  const [activeTab, setActiveTab] = useState<'logs' | 'memories'>('logs');
  const [stats, setStats] = useState<CriticStats>({
    totalAudited: 0,
    passedCount: 0,
    autoRepairedCount: 0,
    avgScore: 0,
    passRate: 100,
    activeRulesCount: 0,
  });
  const [logs, setLogs] = useState<CriticLogItem[]>([]);
  const [memories, setMemories] = useState<LearnedMemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<CriticLogItem | null>(null);
  const [archetypeFilter, setArchetypeFilter] = useState<string>('INFOGRAPHIC_NARRATIVE_WAVE');

  const loadAll = async () => {
    try {
      setLoading(true);
      const [statsRes, logsRes, memRes] = await Promise.all([
        AdminApiClient.request<CriticStats>('/admin/ai-critic/stats'),
        AdminApiClient.request<{ data: CriticLogItem[] }>(
          `/admin/ai-critic/logs?limit=30${archetypeFilter !== 'ALL' ? `&archetype=${archetypeFilter}` : ''}`
        ),
        AdminApiClient.request<LearnedMemoryItem[]>(
          `/admin/ai-critic/memories${archetypeFilter !== 'ALL' ? `?archetype=${archetypeFilter}` : ''}`
        ),
      ]);

      if (statsRes) setStats(statsRes);
      if (logsRes?.data) setLogs(logsRes.data);
      if (Array.isArray(memRes)) setMemories(memRes);
    } catch (err) {
      console.error('Gagal memuat log AI Critic:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [archetypeFilter]);

  const handleToggleMemory = async (id: string) => {
    try {
      setMemories((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m))
      );
      await AdminApiClient.request(`/admin/ai-critic/memories/${id}/toggle`, {
        method: 'PATCH',
      });
    } catch (err) {
      console.error('Gagal toggle memory:', err);
      loadAll();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              AI Self-Critic, Quality Audit & Learned Memory
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Opsi A: Silent Background
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitoring inspeksi kualitas visual mandiri AI di latar belakang dan akumulasi catatan pelajaran permanen untuk mencegah kesalahan berulang.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <select
            value={archetypeFilter}
            onChange={(e) => setArchetypeFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="INFOGRAPHIC_NARRATIVE_WAVE">Gelombang Naratif Merah (Pilot)</option>
            <option value="ALL">Semua Arketipe Poster</option>
          </select>

          <button
            onClick={loadAll}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* 2. STATS SCORECARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Diaudit</span>
            <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalAudited}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Sesi draf infografis
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tingkat Lolos</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.passRate}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {stats.passedCount} draf memenuhi standar
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Auto-Repaired</span>
            <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats.autoRepairedCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Diperbaiki di background
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Aturan Memori</span>
            <BrainCircuit className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {stats.activeRulesCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Pelajaran aktif disuntikkan
          </div>
        </div>
      </div>

      {/* 3. TABS SWITCH */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Riwayat Log Audit AI Critic ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('memories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'memories'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BrainCircuit className="h-3.5 w-3.5" />
          <span>Bank Memori Pelajaran AI ({memories.length})</span>
        </button>
      </div>

      {/* 4. TAB CONTENT: LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Belum ada log evaluasi AI Critic
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Setiap kali poster Gelombang Naratif Merah di-generate di Studio, AI Vision akan mengaudit draf dan mencatat lognya di sini secara otomatis.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {logs.map((item) => {
                const isWave = item.archetype === 'INFOGRAPHIC_NARRATIVE_WAVE';
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            item.passed
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          Skor {item.overallScore}/100 • {item.passed ? 'LULUS' : 'REPAIR DIPICU'}
                        </span>

                        {item.autoRepaired && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                            <Wrench className="h-2.5 w-2.5" />
                            Auto-Repaired
                          </span>
                        )}

                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {isWave ? 'Gelombang Naratif Merah' : item.archetype}
                        </span>

                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(item.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {item.topic}
                      </h3>

                      {/* CHECKLIST BADGES */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-1 ${
                            !item.checklist.textOnPhotoDetected
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}
                        >
                          {!item.checklist.textOnPhotoDetected ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          Foto Steril Teks
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-1 ${
                            item.checklist.pieChartDetected
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}
                        >
                          {item.checklist.pieChartDetected ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          Donut Chart Hadir
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-1 ${
                            !item.checklist.pieChartDuplicateNumbers
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}
                        >
                          {!item.checklist.pieChartDuplicateNumbers ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          Donut % Unik
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-1 ${
                            !item.checklist.pointDuplicationDetected
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}
                        >
                          {!item.checklist.pointDuplicationDetected ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          Dimensi 01-04 Unik
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {item.finalImageUrl && (
                        <div className="relative h-14 w-11 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                          <Image
                            src={item.finalImageUrl}
                            alt="Poster thumbnail"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <button
                        onClick={() => setSelectedLog(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>Detail Audit</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB CONTENT: MEMORIES */}
      {activeTab === 'memories' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
            <BrainCircuit className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
              <p className="font-extrabold">Cara Kerja Bank Memori Belajar AI:</p>
              <p className="text-blue-800/90 dark:text-blue-300/80 leading-relaxed">
                Setiap kali AI mendeteksi kesalahan pada draf (seperti teks yang menutupi wajah atau donat chart yang terlupakan), sistem secara otomatis merumuskan aturan pencegahan. Aturan berstatus <strong>AKTIF</strong> akan disuntikkan secara dinamis ke prompt AI pada generate berikutnya sehingga kesalahan tersebut tidak pernah terulang.
              </p>
            </div>
          </div>

          {memories.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <BrainCircuit className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Belum ada memori pembelajaran yang tersimpan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Memori akan otomatis bertambah ketika AI Critic menemukan anomali dan merumuskan solusi pencegahan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    mem.isActive
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                      {mem.category}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        Dipicu {mem.triggerCount}x
                      </span>

                      <button
                        onClick={() => handleToggleMemory(mem.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          mem.isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            mem.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1.5">
                    {mem.title}
                  </h4>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 leading-relaxed font-mono">
                    &ldquo;{mem.ruleInstruction}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. MODAL DETAIL AUDIT */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Detail Audit AI Self-Critic
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ID: {selectedLog.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Topik & Arketipe:
                </span>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {selectedLog.topic}
                </p>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                  {selectedLog.archetype} (Varian {selectedLog.layoutVariant})
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Catatan Observasi AI Critic:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  {selectedLog.critiqueNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>

              {selectedLog.remedyInstructions && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5" />
                    Instruksi Koreksi Mandiri (Auto-Repair Pass):
                  </span>
                  <p className="text-amber-900 dark:text-amber-200/90 leading-relaxed font-mono whitespace-pre-line text-xs">
                    {selectedLog.remedyInstructions}
                  </p>
                </div>
              )}

              {/* THUMBNAIL PERBANDINGAN SEBELUM vs SESUDAH */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {selectedLog.beforeImageUrl && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      Sebelum Perbaikan:
                    </span>
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <Image
                        src={selectedLog.beforeImageUrl}
                        alt="Before repair"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                {selectedLog.finalImageUrl && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Hasil Akhir Diserahkan ke User:
                    </span>
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-emerald-400 dark:border-emerald-700 shadow-md">
                      <Image
                        src={selectedLog.finalImageUrl}
                        alt="Final result"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

