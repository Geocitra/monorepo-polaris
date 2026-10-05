'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Landmark, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  BarChart3, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

interface SolutionSectionProps {
  activeTab?: 'DPR' | 'DPRD' | 'PEMDA';
  onTabChange?: (tab: 'DPR' | 'DPRD' | 'PEMDA') => void;
  onRequestDemo?: (role?: string) => void;
}

export function SolutionSection({ activeTab: externalTab, onTabChange, onRequestDemo }: SolutionSectionProps) {
  const [internalTab, setInternalTab] = useState<'DPR' | 'DPRD' | 'PEMDA'>('DPR');
  const activeTab = externalTab ?? internalTab;
  const setActiveTab = (tab: 'DPR' | 'DPRD' | 'PEMDA') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };
  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  return (
    <section id="solusi" className="py-24 bg-white border-t border-slate-200/70 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
            <Landmark className="h-3.5 w-3.5" />
            <span>Solusi Institusional Terarah</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Dirancang Presisi untuk Setiap Tingkatan Kepemimpinan Publik
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Kebutuhan diseminasi gagasan anggota parlemen nasional berbeda dengan pimpinan daerah. POLARIS menghadirkan mesin telaah yang secara otomatis menyesuaikan yurisdiksi, rujukan hukum, dan gaya narasi.
          </p>

          {/* TAB BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              id="solusi-dpr"
              onClick={() => setActiveTab('DPR')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'DPR'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-102'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Anggota DPR RI & DPD RI</span>
            </button>

            <button
              id="solusi-dprd"
              onClick={() => setActiveTab('DPRD')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'DPRD'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-102'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Landmark className="h-4 w-4" />
              <span>DPRD Provinsi & Kab/Kota</span>
            </button>

            <button
              id="solusi-pemda"
              onClick={() => setActiveTab('PEMDA')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'PEMDA'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-102'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Kepala Daerah & OPD Pemda</span>
            </button>
          </div>
        </div>

        {/* TAB PANELS */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-10 lg:p-12">
          {activeTab === 'DPR' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-block px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-xs uppercase">
                  Tingkat Nasional & Legislasi Makro
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  Kajian RUU, Kebijakan Fiskal APBN, dan Pandangan Fraksi Berkelas Akademik
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed">
                  Bantu Anggota Komisi dan Badan Legislasi menyusun telaah komparasi undang-undang, menyuarakan sikap fraksi atas isu nasional, dan mempublikasikan pandangan resmi dalam artikel 3.000 kata berbobot tinggi.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Sinkronisasi JDIH & Prolegnas</span>
                      <span className="text-xs text-slate-500">Kutipan nomor pasal undang-undang dan peraturan perundang-undangan otomatis tervalidasi.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Diseminasi Multi-Dapil</span>
                      <span className="text-xs text-slate-500">Materi rilis pers dan ringkasan media sosial dikemas instan untuk konstituen daerah pemilihan.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Visualisasi Tren Makroekonomi</span>
                      <span className="text-xs text-slate-500">Infografis inflasi, asumsi makro APBN, dan postur transfer ke daerah siap pakai.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`${DASHBOARD_URL}/register?role=dpr`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-extrabold text-sm hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-95 transition-all text-center"
                  >
                    <span>Daftar Akun DPR / DPD RI</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <button
                    onClick={() => {
                      const el = document.getElementById('pricing');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-extrabold text-sm hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <span>Lihat Paket Harga</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD PREVIEW */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase">Output Unggulan DPR</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">Standardized</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="text-xs font-bold text-slate-800">Telaah Kritis RUU Energi Baru Terbarukan (3.200 Kata)</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <div className="text-xs font-bold text-slate-800">Infografis Postur Anggaran Pendidikan APBN 2026</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-emerald-600" />
                    <div className="text-xs font-bold text-slate-800">Poster Sosialisasi Aspirasi Dapil Masa Reses</div>
                  </div>
                </div>
                <div className="pt-2 text-[11px] text-slate-400 text-center italic">
                  &ldquo;Menghemat waktu perumusan narasi komisi hingga 80% dengan akurasi hukum terjaga.&rdquo;
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DPRD' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-block px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold text-xs uppercase">
                  Tingkat Daerah Provinsi & Kabupaten/Kota
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  Advokasi Perda Inisiatif, Pengawasan APBD, dan Akuntabilitas Perwakilan
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed">
                  Bantu pimpinan dan anggota DPRD menghasilkan bahan pandangan umum fraksi, telaah pertanggungjawaban APBD, serta materi visual transparansi penyerapan anggaran yang mudah dimengerti warga daerah.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Korelasi Indikator BPS Daerah</span>
                      <span className="text-xs text-slate-500">Mengkoneksikan argumen pembangunan dengan IPM, angka stunting, dan kemiskinan per kecamatan.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Naskah Penjelasan Perda Inisiatif</span>
                      <span className="text-xs text-slate-500">Format runtut berisi latar belakang sosiologis, filosofis, dan yuridis lokal.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Komunikasi Hasil Reses Efektif</span>
                      <span className="text-xs text-slate-500">Ubah tumpukan lembar aspirasi warga menjadi peta laporan visual yang elegan.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`${DASHBOARD_URL}/register?role=dprd`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-extrabold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-95 transition-all text-center"
                  >
                    <span>Daftar Akun DPRD</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <button
                    onClick={() => {
                      const el = document.getElementById('pricing');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-extrabold text-sm hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <span>Lihat Paket Harga</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD PREVIEW */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase">Output Unggulan DPRD</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">Daerah Friendly</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <div className="text-xs font-bold text-slate-800">Pandangan Fraksi terhadap LKPJ Kepala Daerah TA 2025</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div className="text-xs font-bold text-slate-800">Infografis Distribusi Alokasi Pokir per Dapil</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-emerald-600" />
                    <div className="text-xs font-bold text-slate-800">Poster Laporan Pertanggungjawaban Reses Tahap II</div>
                  </div>
                </div>
                <div className="pt-2 text-[11px] text-slate-400 text-center italic">
                  &ldquo;Membantu konstituen memahami kerja legislasi secara transparan dan berwibawa.&rdquo;
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PEMDA' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-block px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-extrabold text-xs uppercase">
                  Tingkat Eksekutif Daerah & Dinas / Badan
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  Sosialisasi Program Unggulan, Edukasi Kebijakan, dan Laporan Kinerja
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed">
                  Menjembatani program teknis Dinas/OPD agar dapat dipahami masyarakat luas secara simpatik, menangkis disinformasi pembangunan, dan memperkuat narasi kepemimpinan daerah.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Narasi Populer Program Strategis Daerah</span>
                      <span className="text-xs text-slate-500">Menerjemahkan bahasa birokrasi RPJMD menjadi artikel inspiratif yang menggugah partisipasi.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Infografis Capaian Target Pembangunan</span>
                      <span className="text-xs text-slate-500">Paparan visual kemantapan jalan, penanganan banjir, dan indeks kesehatan masyarakat.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Poster Panduan Layanan Publik</span>
                      <span className="text-xs text-slate-500">Grafis informatif tentang pengurusan perizinan, beasiswa pemda, dan fasilitas kesehatan.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`${DASHBOARD_URL}/register?role=pemda`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-center"
                  >
                    <span>Daftar Akun Eksekutif Pemda</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <button
                    onClick={() => {
                      const el = document.getElementById('pricing');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-extrabold text-sm hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <span>Lihat Paket Harga</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD PREVIEW */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-400 uppercase">Output Unggulan Pemda</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">Publik-Centric</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <div className="text-xs font-bold text-slate-800">Opini Gubernur: Arah Transformasi Digital Layanan Satu Atap</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <div className="text-xs font-bold text-slate-800">Infografis Penurunan Angka Pengangguran Terbuka 2026</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                    <div className="text-xs font-bold text-slate-800">Poster Peluncuran Puskesmas Keliling 24 Jam</div>
                  </div>
                </div>
                <div className="pt-2 text-[11px] text-slate-400 text-center italic">
                  &ldquo;Meningkatkan kepercayaan publik terhadap kinerja program pemerintah daerah.&rdquo;
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
