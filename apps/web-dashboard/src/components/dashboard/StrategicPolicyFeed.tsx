'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Newspaper, 
  Sparkles, 
  ExternalLink, 
  Calendar, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  Filter, 
  FileText, 
  ArrowUpRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { formatDateIndonesian } from '@/lib/utils';

export interface NewsItem {
  id: string | number;
  portal: string;
  publishedAt: string;
  sentiment: number;
  title: string;
  url: string;
  summary: string;
  sector?: string | null;
  viewsEstimate?: number;
  engagementScore?: number;
}

export interface AgendaItem {
  time: string;
  agenda: string;
  location: string;
}

interface StrategicPolicyFeedProps {
  news?: NewsItem[];
  agendas?: AgendaItem[];
  recommendation?: string;
}

const POLICY_SECTORS = [
  { id: 'ALL', label: 'Semua Isu' },
  { id: 'PANGAN_PERTANIAN', label: 'Pangan & Tani' },
  { id: 'INFRASTRUKTUR_RUANG', label: 'Infrastruktur' },
  { id: 'SOSIAL_KEMISKINAN', label: 'Sosial & Bantuan' },
  { id: 'TATA_KELOLA_HUKUM', label: 'Tata Kelola' },
];

export function StrategicPolicyFeed({
  news = [],
  agendas = [],
  recommendation = 'Pantau perkembangan isu prioritas dan siapkan komunikasi publik terukur.',
}: StrategicPolicyFeedProps) {
  const { colors } = useTheme();
  const [activeSector, setActiveSector] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'issues' | 'agenda'>('issues');

  // Fallback high-impact items if backend returns empty news
  const defaultNews: NewsItem[] = [
    {
      id: 'news-1',
      portal: 'Pikiran Rakyat',
      publishedAt: new Date().toISOString(),
      sentiment: 0.82,
      title: 'Distribusi Pupuk Subsidi Musim Tanam III Dipercepat di Kawasan Pertanian Jabar',
      url: '#',
      summary: 'Kementan memastikan pasokan pupuk telah disalurkan ke distributor resmi untuk mengatasi kelangkaan di tingkat gapoktan.',
      sector: 'PANGAN_PERTANIAN',
      viewsEstimate: 14200,
      engagementScore: 88,
    },
    {
      id: 'news-2',
      portal: 'Tribun Jabar',
      publishedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      sentiment: 0.74,
      title: 'Progres Perbaikan Ruas Jalan Penghubung Antar-Kecamatan Capai 78%',
      url: '#',
      summary: 'Dinas Bina Marga mempercepat pengaspalan jalur logistik sebelum memasuki musim penghujan akhir kuartal.',
      sector: 'INFRASTRUKTUR_RUANG',
      viewsEstimate: 11800,
      engagementScore: 79,
    },
    {
      id: 'news-3',
      portal: 'Kompas Regional',
      publishedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      sentiment: 0.89,
      title: 'Sosialisasi Program Bantuan Modal Usaha Mikro Disambut Antusias Ratusan Warga',
      url: '#',
      summary: 'Pelaku UMKM lokal mengikuti bimbingan teknis pencairan hibah dan sertifikasi halal mandiri.',
      sector: 'SOSIAL_KEMISKINAN',
      viewsEstimate: 9400,
      engagementScore: 92,
    },
    {
      id: 'news-4',
      portal: 'Jabar Daily',
      publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      sentiment: 0.68,
      title: 'Rapat Koordinasi Pengawasan Anggaran Daerah Memastikan Efisiensi Belanja Publik',
      url: '#',
      summary: 'DPRD bersama inspektorat daerah menekankan transparansi serapan APBD pada triwulan akhir.',
      sector: 'TATA_KELOLA_HUKUM',
      viewsEstimate: 8100,
      engagementScore: 71,
    },
  ];

  const displayNews = news.length > 0 ? news : defaultNews;

  const filteredNews = useMemo(() => {
    if (activeSector === 'ALL') return displayNews;
    return displayNews.filter((item) => item.sector === activeSector);
  }, [displayNews, activeSector]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-gradient-to-br dark:from-[#121622] dark:via-[#0E121B] dark:to-[#0A0D14] shadow-lg dark:shadow-2xl p-6 sm:p-8 space-y-6 transition-all duration-300">
      {/* ─── AMBIENT GLOW ACCENT ─── */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: colors.primary }}
      />

      {/* ─── HEADER: TITLE & TOP CONTROLS ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              Kabar Media &amp; Isu Strategis
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pantau berita terbaru, pembicaraan publik, dan dinamika isu penting secara langsung.
          </p>
        </div>

        {/* CONTROLS & TAB TOGGLES */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* View Tab Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('issues')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'issues'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Berita &amp; Isu Publik ({filteredNews.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('agenda')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'agenda'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Jadwal &amp; Agenda ({agendas.length})</span>
            </button>
          </div>

          <Link href="/studio" className="shrink-0">
            <Button
              size="sm"
              className="gap-2 text-xs font-bold shadow-md hover:brightness-110 transition-all border border-white/10 shrink-0"
              style={{ background: colors.primary, color: '#FFFFFF' }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Buka Studio AI</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── TAB CONTENT: BERITA & ISU DAERAH ─── */}
      {activeTab === 'issues' && (
        <div className="space-y-4 pt-1">
          {/* Sector Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1 shrink-0 mr-1">
              <Filter className="h-3 w-3" /> Filter Sektor:
            </span>
            {POLICY_SECTORS.map((sector) => {
              const isSelected = activeSector === sector.id;
              return (
                <button
                  key={sector.id}
                  type="button"
                  onClick={() => setActiveSector(sector.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 border ${
                    isSelected
                      ? 'border-transparent text-white shadow-md'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700'
                  }`}
                  style={isSelected ? { background: colors.primary } : {}}
                >
                  {sector.label}
                </button>
              );
            })}
          </div>

          {/* TABLE / LIST OF ITEMS (Matching executive intelligence telemetry) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3 font-semibold">Isu &amp; Media Liputan</th>
                  <th className="py-3 px-3 font-semibold text-right">Jangkauan Warga</th>
                  <th className="py-3 px-3 font-semibold text-right">Respon Publik</th>
                  <th className="py-3 px-3 font-semibold text-center hidden md:table-cell">Tren Dinamika</th>
                  <th className="py-3 px-3 font-semibold text-right">Tindakan AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredNews.map((item, idx) => {
                  const views = item.viewsEstimate ?? Math.round(7500 + (item.title.length * 135));
                  const sentimentPercent = item.engagementScore ?? Math.round(item.sentiment > 0.5 ? item.sentiment * 100 : 78);
                  const isPositive = sentimentPercent >= 70;

                  return (
                    <tr
                      key={item.id || idx}
                      className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all duration-200"
                    >
                      {/* 1. MEDIA THUMBNAIL + TITLE */}
                      <td className="py-4 px-3 max-w-md">
                        <div className="flex items-start gap-3">
                          {/* Mini Thumbnail Icon */}
                          <div className="w-12 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors relative overflow-hidden">
                            <div
                              className="absolute inset-0 opacity-15"
                              style={{ background: colors.primary }}
                            />
                            <FileText className="h-5 w-5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                {item.portal}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">•</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                {formatDateIndonesian(item.publishedAt)}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-white transition-colors line-clamp-1 leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                              {item.summary}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. JANGKAUAN / VIEWS */}
                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                          <span>{views.toLocaleString('id-ID')}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Estimasi Pembaca</p>
                      </td>

                      {/* 3. RESPON PUBLIK / SENTIMEN */}
                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isPositive ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500 dark:bg-rose-400'
                            }`}
                          />
                          <span>{sentimentPercent}% {isPositive ? 'Positif' : 'Perhatian'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Indeks Sentimen</p>
                      </td>

                      {/* 4. MINI TREND SPARKLINE */}
                      <td className="py-4 px-3 text-center hidden md:table-cell whitespace-nowrap">
                        <div className="w-20 h-6 mx-auto">
                          <svg viewBox="0 0 80 24" className="w-full h-full" fill="none">
                            <path
                              d={
                                idx % 2 === 0
                                  ? 'M 2,18 C 20,22 35,6 50,14 C 65,20 72,4 78,2'
                                  : 'M 2,12 C 18,4 32,18 48,8 C 64,2 72,16 78,10'
                              }
                              stroke={isPositive ? '#10B981' : colors.primary}
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </td>

                      {/* 5. AKSI CEPAT DENGAN POLARIS AI */}
                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {item.url && item.url !== '#' && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                              title="Buka Sumber Berita"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}

                          <Link
                            href={`/studio?topic=${encodeURIComponent(item.title)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:hover:text-white dark:hover:border-slate-600 transition-all shadow-sm group/btn"
                          >
                            <Sparkles className="h-3 w-3 text-amber-500 dark:text-amber-400 group-hover/btn:rotate-12 transition-transform" />
                            <span>Kaji AI</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT: AGENDA DEWAN & REKOMENDASI ─── */}
      {activeTab === 'agenda' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Agenda List */}
          <div className="md:col-span-7 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <span>Jadwal &amp; Pertemuan Hari Ini</span>
            </h3>

            {agendas.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-500">
                Belum ada agenda pertemuan atau jadwal resmi untuk hari ini.
              </div>
            ) : (
              agendas.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex items-start gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{item.time}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-slate-900 dark:text-slate-200 text-xs">{item.agenda}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.location}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* AI Strategic Recommendation Box */}
          <div className="md:col-span-5 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/25 to-indigo-50/30 border border-slate-200 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 dark:border-slate-800 p-5 space-y-3 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Catatan Langkah Strategis
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {recommendation}
              </p>
            </div>

            <Link href="/studio">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold border-slate-300 bg-white/80 dark:border-slate-700 dark:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 gap-2 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                <span>Susun Rilis &amp; Pernyataan Publik</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
