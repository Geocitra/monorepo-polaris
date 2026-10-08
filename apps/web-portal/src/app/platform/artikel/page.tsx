'use client';

import Link from 'next/link';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Scale, 
  BookOpen, 
  Database, 
  Share2, 
  ArrowLeft,
  Layers,
  Copy,
  Sliders
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';
import { useState } from 'react';

export default function PlatformArtikelPage() {
  const [copied, setCopied] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'TEKNOKRATIS' | 'ASPIRATIF' | 'KRITIS'>('TEKNOKRATIS');

  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  const sampleExcerpt = {
    TEKNOKRATIS: "Berdasarkan evaluasi alokasi belanja modal APBN 2026 dan perbandingan dengan Perpres No. 59/2024, efisiensi rantai pasok pupuk subsidi menuntut reorientasi skema distribusi langsung ke kelompok tani terverifikasi Simluhtan...",
    ASPIRATIF: "Masyarakat petani di pelosok daerah pemilihan mengeluhkan lambatnya penebusan pupuk saat musim tanam serentak tiba. Kebijakan ini harus berpijak pada keringat petani di sawah, bukan sekadar angka di atas meja birokrasi...",
    KRITIS: "Fraksi memandang adanya ketimpangan tajam antara pagu anggaran subsidi sebesar Rp44 triliun dengan realisasi ketersediaan di tingkat kios pengecer. Penegakan pasal 12 UU Perlindungan Petani harus ditegakkan tanpa kompromi..."
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans">
      <LandingNavbar />

      <main className="flex-1">
        {/* HERO HEADER */}
        <section className="relative pt-12 pb-20 bg-gradient-to-b from-blue-50/50 via-white to-[#fafbfc] border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* BREADCRUMB */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Beranda</span>
              </Link>
              <span>/</span>
              <span className="text-slate-400">Platform</span>
              <span>/</span>
              <span className="text-blue-600 font-bold">Generator Artikel Parlemen</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5" />
              <span>Standar Narasi 3.000 Kata</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl">
              Ubah Catatan Sidang dan Aspirasi Dapil Menjadi Naskah Kebijakan 3.000 Kata Berkelas Dunia.
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              Dirancang khusus untuk ritme kerja Pejabat Publik dan Staf Ahli Parlemen. Mengintegrasikan penomoran pasal undang-undang secara otomatis, statistik BPS, dan gaya bahasa teknokratis yang siap dipublikasikan ke media nasional maupun risalah resmi dewan.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all"
              >
                <span>Lihat Paket Harga</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center px-6 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-extrabold text-sm sm:text-base hover:bg-slate-50 transition-all shadow-xs"
              >
                <span>Konsultasi Lisensi</span>
              </Link>
            </div>

          </div>
        </section>

        {/* 4 CORE CAPABILITIES */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600">Teknologi Penyusunan Khusus</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Mengapa Artikel POLARIS Diakui Otoritatif?
              </h2>
              <p className="text-sm text-slate-500">
                Bukan sekadar teks AI umum, melainkan arsitektur naskah yang dikalibrasi sesuai etika perundang-undangan dan kebutuhan representasi publik.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-blue-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Scale className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Validasi Yuridis JDIH Otomatis</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sistem langsung menautkan rujukan undang-undang nomor dan tahun yang sah. Bebas halusinasi nomor pasal berkat cross-reference basis data hukum nasional.
                </p>
                <div className="text-xs text-blue-600 font-bold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Kompatibel dengan Prolegnas & Lembaran Negara</span>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-blue-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Korelasi Data Statistik BPS & APBD</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Argumen dewan diperkuat angka kemiskinan, laju inflasi daerah pemilihan, serta persentase penyerapan anggaran secara akurat dan relevan.
                </p>
                <div className="text-xs text-indigo-600 font-bold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Terintegrasi API Statistik Satu Data</span>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-blue-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Format Naskah Kebijakan Paripurna</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Menyusun naskah lengkap dari Bab Pengantar, Telaah Sosiologis, Analisis Dampak Fiskal, hingga Matriks Rekomendasi Tindak Lanjut Komisi.
                </p>
                <div className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Struktur baku 2.500 - 3.500 kata</span>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-blue-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Sliders className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Tone Voice Adaptif Sesuai Sikap Fraksi</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sesuaikan gaya bertutur sesuai peran: apakah posisi koalisi pemerintah yang konstruktif, pandangan kritis fraksi oposisi, atau pesan persuasif kepada konstituen.
                </p>
                <div className="text-xs text-amber-600 font-bold flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>3 Pilihan Gaya Tutur Bahasa</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* INTERACTIVE TONE SIMULATOR & SAMPLE ARTICLE */}
        <section className="py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600">Simulasi Output Interaktif</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Pilih Tone Suara Narasi Kebijakan
              </h2>
            </div>

            {/* TONE SWITCHER BUTTONS */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-200/60 rounded-2xl max-w-md mx-auto">
              <button
                onClick={() => setSelectedTone('TEKNOKRATIS')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedTone === 'TEKNOKRATIS'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Teknokratis Objektif
              </button>
              <button
                onClick={() => setSelectedTone('ASPIRATIF')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedTone === 'ASPIRATIF'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aspiratif Kerakyatan
              </button>
              <button
                onClick={() => setSelectedTone('KRITIS')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedTone === 'KRITIS'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kritis Konstruktif
              </button>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-blue-600 text-white text-[10px] font-black uppercase">
                    Hasil Generasi
                  </span>
                  <span className="text-xs font-bold text-slate-500">Topik: Ketahanan Pangan & Pupuk Bersubsidi</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sampleExcerpt[selectedTone]);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copied ? 'Tersalin!' : 'Salin Paragraf'}</span>
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  Optimalisasi Penyaluran Pupuk Subsidi dalam Menopang Swasembada Pangan Nasional TA 2026-2029
                </h3>
                
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/80 text-slate-800 text-sm leading-relaxed italic">
                  &ldquo;{sampleExcerpt[selectedTone]}&rdquo;
                </div>

                <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <p>
                    <strong>Kutipan Regulasi:</strong> Mengacu pada Pasal 7 ayat (2) UU No. 19/2013 tentang Perlindungan dan Pemberdayaan Petani serta Pasal 4 Perpres No. 59/2024.
                  </p>
                  <p>
                    <strong>Indikator BPS:</strong> Tingkat kepemilikan lahan rata-rata petani gurem di Pulau Jawa berada pada angka 0,36 hektar, menuntut intervensi alokasi yang lebih presisi.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-400">
                  Estimasi panjang naskah utuh: 2.850 kata • Waktu generate: 42 detik
                </span>
                <Link
                  href="/pricing"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
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
