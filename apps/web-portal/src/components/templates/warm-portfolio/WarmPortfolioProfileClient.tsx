'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  MapPin,
  Building2,
  BookOpen,
  ArrowRight,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  GraduationCap,
  Briefcase,
  FileText,
  Clock,
  HeartHandshake,
} from 'lucide-react';

interface WarmPortfolioProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function WarmPortfolioProfileClient({
  member,
  theme,
  subdomain,
}: WarmPortfolioProfileClientProps) {
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-ahmad-fauzi-cutout.webp';
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. H. Ahmad Fauzi, M.Si.';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
  const party = member?.partyAffiliation || 'Fraksi Parlemen Republik Indonesia';
  const bio =
    theme?.bioBiography ||
    `${officialFullName} telah mendedikasikan masa baktinya untuk mendampingi masyarakat di Daerah Pemilihan ${dapil}. Dengan integritas, ketulusan mendengar, dan kecermatan merumuskan regulasi, beliau senantiasa hadir mengawal setiap aspirasi konstituen menuju kemakmuran bersama.`;

  const [activeTab, setActiveTab] = useState<'semua' | 'visi' | 'pendidikan' | 'karier' | 'komisi'>('semua');

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewTemplate = searchParams?.get('preview_template');

  const getNavLinkHref = (path: string) => {
    let base = path;
    if (subdomain && pathname?.startsWith(`/${subdomain}`)) {
      base = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
    }
    if (previewTemplate) {
      base += `${base.includes('?') ? '&' : '?'}preview_template=${previewTemplate}`;
    }
    return base;
  };

  const educations = [
    {
      degree: 'Doktor Ilmu Kebijakan Publik (S3)',
      institution: 'Universitas Indonesia (UI)',
      year: '2016 - 2020',
      description: 'Disertasi mengenai efektivitas desentralisasi fiskal dan tata kelola anggaran daerah berbasis kesejahteraan.',
    },
    {
      degree: 'Magister Sains Administrasi Publik (S2)',
      institution: 'Universitas Gadjah Mada (UGM)',
      year: '2008 - 2011',
      description: 'Fokus kajian regulasi pembangunan infrastruktur pedesaan dan pemberdayaan ekonomi komunitas.',
    },
    {
      degree: 'Sarjana Ilmu Sosial & Politik (S1)',
      institution: 'Universitas Padjadjaran (UNPAD)',
      year: '2002 - 2006',
      description: 'Aktif sebagai ketua senat mahasiswa dan penggerak advokasi hukum kerakyatan.',
    },
  ];

  const careers = [
    {
      role: 'Anggota Komisi Keuangan & Perbankan',
      organization: 'Dewan Perwakilan Rakyat RI (DPR RI)',
      period: '2024 - Sekarang',
      description: 'Menyusun regulasi perlindungan konsumen jasa keuangan, perluasan KUR UMKM, dan pengawasan fiskal negara.',
    },
    {
      role: 'Pimpinan Panitia Khusus Tata Ruang & Pangan',
      organization: 'DPR RI',
      period: '2021 - 2024',
      description: 'Mengawal undang-undang ketahanan pangan dan perlindungan lahan pertanian produktif dari alih fungsi.',
    },
    {
      role: 'Tenaga Ahli Utama Bidang Regulasi',
      organization: 'Kementerian Koordinator Perekonomian',
      period: '2015 - 2019',
      description: 'Menganalisis sinkronisasi regulasi investasi padat karya dan insentif industri kerakyatan di daerah.',
    },
  ];

  const commissions = [
    {
      badge: 'Fungsi Legislasi',
      title: 'Penyusunan RUU Pemberdayaan Ekonomi Rakyat',
      detail: 'Mendorong regulasi wajib belanja produk UMKM lokal oleh kementerian dan pemerintah daerah minimal 40%.',
    },
    {
      badge: 'Fungsi Anggaran',
      title: 'Alokasi Infrastruktur Logistik & Internet Desa',
      detail: 'Mengamankan alokasi belanja modal APBN untuk konektivitas jembatan antardesa dan 32 laboratorium sekolah pelosok.',
    },
    {
      badge: 'Fungsi Pengawasan',
      title: 'Pemberantasan Spekulan & Penyelewengan Pupuk',
      detail: 'Sidak berkala di distributor pupuk bersubsidi untuk menjamin ketersediaan kuota tepat musim tanam petani.',
    },
  ];

  const metrics = [
    { label: 'RUU Diperjuangkan', value: '14+', note: 'Regulasi pro-rakyat' },
    { label: 'Kunjungan Dapil', value: '180+', note: 'Titik temu warga' },
    { label: 'Aspirasi Terealisasi', value: '94%', note: 'Audit konstituen' },
    { label: 'Tahun Pengabdian', value: '12+', note: 'Integritas publik' },
  ];

  return (
    <div className="space-y-12">
      
      {/* ─── 1. HERO PROFILE CARD WITH CHAMFERED CORNERS ─── */}
      <div
        className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden p-6 sm:p-10 transition-all"
        style={{
          clipPath: 'polygon(24px 0%, 100% 0%, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0% 100%, 0% 24px)',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
          
          {/* Portrait with Warm Frame */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-3xl overflow-hidden bg-stone-100 border-2 border-stone-200/90 shadow-inner group">
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181311]/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-stone-200 shadow-md">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                  <span>Pejabat Terverifikasi DPR RI</span>
                </div>
                <p className="text-[11px] text-stone-500 truncate mt-0.5">{dapil}</p>
              </div>
            </div>
          </div>

          {/* Identity & Bio */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200/70">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>{party}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-stone-950 tracking-tight leading-tight">
                {officialFullName}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-stone-500 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Mewakili Amanah Rakyat: {dapil}</span>
              </p>
            </div>

            <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
              {bio}
            </p>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 text-center"
                >
                  <p className="font-serif font-black text-xl text-stone-950">{m.value}</p>
                  <p className="text-[11px] font-bold text-stone-700 truncate">{m.label}</p>
                  <p className="text-[10px] text-stone-500 truncate">{m.note}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#181311] text-white font-bold text-xs shadow-md hover:bg-stone-800 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span>Sampaikan Gagasan ke Dewan</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" />
              </Link>
              <Link
                href={getNavLinkHref('/artikel')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#FAF7F2] text-stone-800 font-bold text-xs border border-stone-300 hover:bg-stone-100 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-stone-600" />
                <span>Kajian & Artikel Kebijakan</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. TAB SELECTION BUTTONS ─── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-4">
        {[
          { id: 'semua', label: 'Semua Ikhtisar' },
          { id: 'visi', label: 'Visi & Misi Pengabdian' },
          { id: 'pendidikan', label: 'Riwayat Pendidikan' },
          { id: 'karier', label: 'Karier & Pengalaman' },
          { id: 'komisi', label: 'Mandat & Komisi' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[#181311] text-white shadow-md'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── 3. TAB CONTENT SECTIONS ─── */}
      <div className="space-y-12">
        
        {/* SECTION: VISI & MISI */}
        {(activeTab === 'semua' || activeTab === 'visi') && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <h3 className="text-xl sm:text-2xl font-serif font-black text-stone-950">
                Visi & Prinsip Kerja Kenegaraan
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div
                className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3"
                style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center font-bold">
                  01
                </div>
                <h4 className="font-serif font-bold text-base text-stone-900">
                  Transparansi Anggaran Tanpa Syarat
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Menyajikan rincian dana aspirasi, hasil reses, dan usulan pokok pikiran parlemen secara terbuka melalui kanal digital publik.
                </p>
              </div>

              <div
                className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3"
                style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center font-bold">
                  02
                </div>
                <h4 className="font-serif font-bold text-base text-stone-900">
                  Advokasi Ekonomi Kerakyatan
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Memperjuangkan perlindungan hukum pengrajin, pedagang kecil, dan petani lokal dari monopoli serta regulasi izin yang berbelit.
                </p>
              </div>

              <div
                className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3"
                style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center font-bold">
                  03
                </div>
                <h4 className="font-serif font-bold text-base text-stone-900">
                  Konektivitas & Akses Pendidikan Adil
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Menjamin pemerataan sarana digital, kuota beasiswa tidak mampu, dan jembatan logistik antardesa pelosok tanpa diskriminasi.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* SECTION: RIWAYAT PENDIDIKAN */}
        {(activeTab === 'semua' || activeTab === 'pendidikan') && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <h3 className="text-xl sm:text-2xl font-serif font-black text-stone-950">
                Jejak Pendidikan & Keilmuan
              </h3>
            </div>

            <div className="space-y-4">
              {educations.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-[#F59E0B] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-[#F59E0B] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-base sm:text-lg text-stone-950">
                        {edu.degree}
                      </h4>
                      <p className="text-xs font-semibold text-stone-600">
                        {edu.institution}
                      </p>
                      <p className="text-xs text-stone-500 leading-relaxed pt-1">
                        {edu.description}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-[#FAF7F2] text-stone-700 border border-stone-200 self-start">
                    {edu.year}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: KARIER & PENGALAMAN */}
        {(activeTab === 'semua' || activeTab === 'karier') && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <h3 className="text-xl sm:text-2xl font-serif font-black text-stone-950">
                Pengalaman Karier & Advokasi Publik
              </h3>
            </div>

            <div className="space-y-4">
              {careers.map((car, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-[#F59E0B] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-[#F59E0B] flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-base sm:text-lg text-stone-950">
                        {car.role}
                      </h4>
                      <p className="text-xs font-semibold text-stone-600">
                        {car.organization}
                      </p>
                      <p className="text-xs text-stone-500 leading-relaxed pt-1">
                        {car.description}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-[#FAF7F2] text-stone-700 border border-stone-200 self-start">
                    {car.period}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: MANDAT & KOMISI (DARK ESPRESSO CARDS) */}
        {(activeTab === 'semua' || activeTab === 'komisi') && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <h3 className="text-xl sm:text-2xl font-serif font-black text-stone-950">
                Fokus Pengawalan Parlemen
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {commissions.map((com, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-[#181311] text-white border border-stone-800 shadow-xl space-y-3"
                  style={{
                    clipPath: 'polygon(16px 0%, 100% 0%, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0% 100%, 0% 16px)',
                  }}
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-[#F59E0B] text-stone-950 text-[10px] font-black uppercase tracking-wider">
                    {com.badge}
                  </span>
                  <h4 className="font-serif font-bold text-base text-stone-100">
                    {com.title}
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-light">
                    {com.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

    </div>
  );
}
