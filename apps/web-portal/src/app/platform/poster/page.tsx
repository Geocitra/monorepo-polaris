'use client';

import Link from 'next/link';
import { 
  Image as ImageIcon, 
  Palette, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Download,
  Share2,
  Printer,
  Smartphone
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';
import { useState } from 'react';

export default function PlatformPosterPage() {
  const [selectedFormat, setSelectedFormat] = useState<'MEDSOS' | 'CETAK_A3'>('MEDSOS');

  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans">
      <LandingNavbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-12 pb-20 bg-gradient-to-b from-emerald-50/50 via-white to-[#fafbfc] border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Beranda</span>
              </Link>
              <span>/</span>
              <span className="text-slate-400">Platform</span>
              <span>/</span>
              <span className="text-emerald-600 font-bold">Desain Poster Program</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-xs font-extrabold uppercase tracking-wider">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Publikasi Kampanye Visual & Advokasi</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl">
              Kemasan Pesan Kebijakan yang Berwibawa, Menggugah, dan Menjangkau Seluruh Lapisan Warga.
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              Sampaikan pengesahan perda, program bantuan sosial, atau pandangan fraksi melalui desain poster visual yang elegan. Diformat otomatis agar siap cetak baliho maupun tayang di media sosial dalam sekejap.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition-all"
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

        {/* 3 VALUE CARDS */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600">Presisi Estetika Parlemen</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Dirancang Menjaga Martabat Lembaga Publik
              </h2>
              <p className="text-sm text-slate-500">
                Menghindari gaya desain serampangan. POLARIS menerapkan palet warna formal, tata letak proporsional, dan penempatan identitas lembaga yang terhormat.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-emerald-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Palette className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Penyusunan Slogan Bernas</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Mesin AI merangkum puluhan halaman naskah kebijakan menjadi 1 kalimat headline kuat dan 3 butir manfaat langsung bagi konstituen.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-emerald-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Printer className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Format Cetak CMYK 300 DPI</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Siap dikirim langsung ke vendor percetakan daerah untuk poster reses, standing banner di gedung dewan, atau baliho pinggir jalan tanpa pecah.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-emerald-300 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">Optimasi Algoritma Media Sosial</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Rasio kontras teks dan gambar disesuaikan agar mendapatkan impresi maksimal di platform Instagram, Twitter/X, dan grup WhatsApp masyarakat.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* POSTER PREVIEW */}
        <section className="py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600">Pratinjau Hasil Desain</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Karya Visual Siap Terbit
              </h2>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8">
              
              <div className="w-full md:w-1/2 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                <img
                  src="/images/showcase-poster-surya.jpg"
                  alt="Poster Energi Bersih"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="w-full md:w-1/2 space-y-5">
                <div className="space-y-2">
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                    Kampanye Kebijakan
                  </span>
                  <h3 className="text-xl font-black text-slate-900 leading-snug">
                    Akselerasi Pembangkit Surya Atap untuk Kemandirian Energi Komunitas
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Poster resmi advokasi RUU EBT dan subsidi tarif listrik berbasis energi surya untuk kelompok tani dan UMKM daerah.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Format Vektor & Resolusi 300 DPI Siap Cetak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Kustomisasi Foto Dewan & Lambang Komisi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Lisensi Komersial & Hak Cipta Milik Pejabat Penuh</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <span>Pilih Paket Harga Desain</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
