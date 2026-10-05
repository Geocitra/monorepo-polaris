'use client';

import Link from 'next/link';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Download,
  Share2,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';
import { useState } from 'react';

export default function PlatformInfografisPage() {
  const [activeSector, setActiveSector] = useState<'PENDIDIKAN' | 'KESEHATAN' | 'INFRASTRUKTUR'>('INFRASTRUKTUR');

  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  const sectorData = {
    INFRASTRUKTUR: {
      pagu: 'Rp 4,8 Triliun',
      realisasi: '87,4%',
      fokus: 'Kemantapan jalan provinsi 1.240 km & rehabilitasi saluran irigasi primer di 12 kabupaten.',
      grafik: [65, 78, 87, 92]
    },
    PENDIDIKAN: {
      pagu: 'Rp 6,2 Triliun',
      realisasi: '94,1%',
      fokus: 'Bantuan operasional sekolah daerah (BOSDa), beasiswa vokasi 15.000 siswa, dan ruang kelas baru.',
      grafik: [70, 82, 91, 95]
    },
    KESEHATAN: {
      pagu: 'Rp 3,5 Triliun',
      realisasi: '91,8%',
      fokus: 'Pemberian makanan tambahan balita stunting dan pembiayaan jaminan kesehatan semesta (UHC).',
      grafik: [60, 75, 88, 92]
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans">
      <LandingNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 bg-gradient-to-b from-indigo-50/50 via-white to-[#fafbfc] border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Beranda</span>
              </Link>
              <span>/</span>
              <span className="text-slate-400">Platform</span>
              <span>/</span>
              <span className="text-indigo-600 font-bold">Infografis Data Kebijakan</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Visualisasi Data Anggaran & BPS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl">
              Ubah Ribuan Baris Tabel APBD Menjadi Grafik Kebijakan yang Menancap di Pikiran Publik.
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              Masyarakat dan sejawat parlemen tidak memiliki waktu membaca ratusan halaman dokumen lampiran perda. POLARIS menyaring indikator kunci menjadi infografis data yang estetis, terverifikasi, dan siap dibagikan dalam 1 klik.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 transition-all"
              >
                <span>Lihat Paket Harga</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href={`${DASHBOARD_URL}/register`}
                className="inline-flex items-center px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-extrabold text-sm sm:text-base hover:bg-slate-50 transition-all shadow-xs"
              >
                <span>Daftar Akun Workspace</span>
              </a>
            </div>

          </div>
        </section>

        {/* 4 VALUE PILLARS */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Keunggulan Visualisasi</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Standar Infografis Lembaga Pemerintahan
              </h2>
              <p className="text-sm text-slate-500">
                Setiap chart dirancang agar tahan uji dalam rapat komisi, dengar pendapat, dan sorotan pers daerah.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-indigo-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Parser Anggaran Otomatis</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Cukup unggah berkas PDF atau CSV ringkasan APBD, sistem otomatis mengelompokkan pos Belanja Operasi, Belanja Modal, dan Belanja Transfer.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-indigo-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Komparasi Antar-Tahun (YoY)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Menampilkan grafik tren pertumbuhan penyerapan anggaran dari triwulan ke triwulan untuk membuktikan efektivitas fungsi pengawasan dewan.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-indigo-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Multi-Ukuran Siap Siar</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Ekspor otomatis ke format Slide Presentasi Paripurna (16:9), Infografis Feed Medsos (4:5), serta PDF resolusi cetak brosur sosialisasi dapil.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* INTERACTIVE APBD DASHBOARD PREVIEW */}
        <section className="py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Simulasi Interaktif Visual</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Pilih Sektor Anggaran Daerah
              </h2>
            </div>

            {/* SECTOR SWITCHER */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-200/60 rounded-2xl max-w-md mx-auto">
              <button
                onClick={() => setActiveSector('INFRASTRUKTUR')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSector === 'INFRASTRUKTUR'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Infrastruktur
              </button>
              <button
                onClick={() => setActiveSector('PENDIDIKAN')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSector === 'PENDIDIKAN'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pendidikan
              </button>
              <button
                onClick={() => setActiveSector('KESEHATAN')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSector === 'KESEHATAN'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kesehatan
              </button>
            </div>

            {/* INTERACTIVE CARD */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase">
                    Grafik Sektor Terpilih
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    Laporan Transparansi Realisasi Fiskal TA 2026
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Pagu Anggaran</span>
                  <span className="text-xl font-black text-indigo-600">{sectorData[activeSector].pagu}</span>
                </div>
              </div>

              {/* BAR CHART VISUALIZATION */}
              <div className="space-y-4">
                <div className="h-44 bg-slate-50 rounded-2xl border border-slate-200/80 p-6 flex items-end justify-between gap-4">
                  {sectorData[activeSector].grafik.map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-black text-indigo-600">{val}%</span>
                      <div 
                        className="w-full max-w-[48px] bg-gradient-to-t from-indigo-600 to-blue-500 rounded-t-lg shadow-sm transition-all duration-500"
                        style={{ height: `${val}%` }}
                      />
                      <span className="text-[10px] font-bold text-slate-500">TW {idx + 1}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-slate-700 text-xs sm:text-sm leading-relaxed">
                  <strong>Sorotan Kebijakan:</strong> {sectorData[activeSector].fokus}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-400">
                  Data otomatis tervalidasi dari BPKAD dan BPS Daerah.
                </span>
                <Link
                  href="/pricing"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
                >
                  Pilih Paket Harga →
                </Link>
              </div>

            </div>

          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
