'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  TrendingUp,
  Award,
  GraduationCap,
  Briefcase,
  Building2,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface DarkModernProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function DarkModernProfileClient({
  member,
  theme,
  subdomain,
}: DarkModernProfileClientProps) {
  const primaryColor = theme?.primaryHexColor || '#1877F2';
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-standing-full.png';
  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Dr. H. Ahmad Fauzi, M.Si.';
  const dapil =
    member?.dapilName ||
    member?.customDapilName ||
    member?.customDapil ||
    'Jawa Barat I';
  const commission = member?.commissionName || 'Komisi IX DPR RI';
  const party = member?.partyAffiliation || 'Fraksi Partai Kebangkitan Bangsa';

  const [activeTab, setActiveTab] = useState<'pendidikan' | 'karier'>('pendidikan');

  const educationHistory = [
    {
      degree: 'Doktor Ilmu Pemerintahan & Kebijakan Publik (S3)',
      institution: 'Universitas Indonesia (UI), Jakarta',
      year: '2016 – 2020',
      description:
        'Disertasi mengkaji reformasi tata kelola anggaran publik daerah dan optimalisasi pengawasan partisipatif masyarakat terhadap implementasi APBD.',
    },
    {
      degree: 'Magister Kebijakan Publik (M.Si / S2)',
      institution: 'Universitas Gadjah Mada (UGM), Yogyakarta',
      year: '2010 – 2013',
      description:
        'Fokus telaah regulasi ketenagakerjaan, perlindungan jaminan sosial ketenagakerjaan bagi sektor informal, dan penguatan ekonomi kerakyatan.',
    },
    {
      degree: 'Sarjana Ilmu Sosial & Ilmu Politik (S.IP / S1)',
      institution: 'Universitas Padjadjaran (UNPAD), Bandung',
      year: '2004 – 2008',
      description:
        'Lulus dengan predikat Cum Laude. Aktif dalam organisasi kemahasiswaan Senat Mahasiswa dan Forum Diskusi Kebijakan Publik Regional Jawa Barat.',
    },
  ];

  const careerHistory = [
    {
      role: 'Anggota DPR RI – Komisi IX',
      organization: 'Dewan Perwakilan Rakyat Republik Indonesia',
      period: '2024 – Sekarang',
      description:
        'Mengemban amanah mengawasi kebijakan sektor kesehatan, ketenagakerjaan, kependudukan, serta BPJS Ketenagakerjaan dan Kesehatan.',
    },
    {
      role: 'Wakil Ketua Komisi Kebijakan Publik',
      organization: 'Dewan Perwakilan Rakyat Daerah (DPRD) Provinsi',
      period: '2019 – 2024',
      description:
        'Menginisiasi pembentukan Peraturan Daerah tentang pemberdayaan UMKM lokal dan jaminan keterbukaan informasi publik pembangunan daerah.',
    },
    {
      role: 'Penasihat Kebijakan Strategis & Tenaga Ahli Parlemen',
      organization: 'Pusat Kajian Kebijakan Legislasi Nasional',
      period: '2014 – 2019',
      description:
        'Menyusun naskah akademik dan daftar inventarisasi masalah (DIM) untuk 12 RUU strategis di bidang ketenagakerjaan dan jaminan sosial.',
    },
  ];

  const corePillars = [
    {
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      title: 'Legislasi Berkeadilan & Transparan',
      desc: 'Memastikan setiap penyusunan undang-undang membuka ruang partisipasi publik yang bermakna (meaningful participation) serta berpihak pada kesejahteraan rakyat kecil.',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
      title: 'Advokasi Anggaran Berbasis Kebutuhan',
      desc: 'Mengawal alokasi APBN agar tepat sasaran pada pemenuhan infrastruktur dasar, fasilitas kesehatan desa, serta subsidi perlindungan sosial bagi pekerja informal.',
    },
    {
      icon: <Users className="w-6 h-6 text-blue-400" />,
      title: 'Pelayanan Aspirasi Konstituen',
      desc: 'Membuka posko aduan dan dialog langsung di seluruh pelosok dapil, memastikan setiap keluhan warga ditindaklanjuti secara konkret kepada kementerian terkait.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-10 sm:py-16">
      {/* ─── 1. HERO PROFILE CARD ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-[#16171b] border border-white/5 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl">
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute top-0 right-1/4 w-96 h-96 pointer-events-none rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, #1877F2 0%, transparent 70%)',
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Dewan Portrait Photo */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-64 sm:w-72 lg:w-80 aspect-[4/5] rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={officialFullName}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right: Executive Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                    DPR RI • Fraksi Parlemen
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
                    Dapil: {dapil}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
                    {commission}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                  {officialFullName}
                </h1>
                <p className="text-sm sm:text-base text-blue-400 font-semibold italic">
                  &quot;{theme?.headlineTagline || 'Amanah rakyat adalah kompas utama pengabdian legislasi dan anggaran kenegaraan.'}&quot;
                </p>
              </div>

              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
                <p>
                  {theme?.bioBiography ||
                    `${officialFullName} mengemban amanah suci sebagai wakil rakyat di Dewan Perwakilan Rakyat Republik Indonesia (DPR RI) mewakili aspirasi masyarakat di Daerah Pemilihan ${dapil}. Berbekal latar belakang keilmuan kebijakan publik dan rekam jejak panjang advokasi kerakyatan, beliau berkomitmen menghadirkan tata kelola pemerintahan yang berintegritas, berpihak pada keadilan sosial, serta transparan.`}
                </p>
                <p className="text-slate-400">
                  Dalam menjalankan tugas keparlemenan di {commission}, fokus utama perjuangan diarahkan pada penguatan jaminan sosial, perluasan lapangan kerja berkeadilan bagi generasi muda, serta peningkatan sarana prasarana kesehatan publik di tingkat distrik dan desa.
                </p>
              </div>

              {/* Badges / Highlights */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#0e0f11] border border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Kemitraan</span>
                  <span className="text-xs font-bold text-white">Kemenaker & Kemenkes</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0e0f11] border border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Periode Tugas</span>
                  <span className="text-xs font-bold text-white">2024 – 2029</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0e0f11] border border-white/5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Integritas</span>
                  <span className="text-xs font-bold text-blue-400">LHKPN Terverifikasi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. 4 METRICS CARDS (CONSISTENT WITH DARK MODERN HOME) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            / INDIKATOR KINERJA KENEGARAAN
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Akuntabilitas Tugas Parlemen
          </h2>
          <p className="text-xs text-slate-400">
            Transparansi capaian kerja legislasi, pengawasan, dan advokasi anggaran yang dilaporkan berkala.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#0E1321] border border-slate-800 space-y-3 hover:border-blue-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-white font-mono">98.4%</div>
            <div className="text-xs font-bold text-slate-300 uppercase">Tingkat Kehadiran Sidang</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Konsisten menghadiri rapat paripurna pengambilan keputusan, rapat kerja kementerian, dan pansus.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0E1321] border border-slate-800 space-y-3 hover:border-blue-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-white font-mono">42 Naskah</div>
            <div className="text-xs font-bold text-slate-300 uppercase">RUU & Catatan Kritis</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Menyusun daftar inventarisasi masalah (DIM) pro-rakyat pada regulasi ketenagakerjaan dan kesehatan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0E1321] border border-slate-800 space-y-3 hover:border-blue-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-white font-mono">1,420+</div>
            <div className="text-xs font-bold text-slate-300 uppercase">Aspirasi Dapil Diserap</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pengaduan sarana kesehatan warga dan advokasi upah pekerja yang diteruskan kepada pemangku kebijakan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0E1321] border border-slate-800 space-y-3 hover:border-blue-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-white font-mono">100%</div>
            <div className="text-xs font-bold text-slate-300 uppercase">Transparansi Dana Reses</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Laporan pertanggungjawaban kegiatan kunjungan daerah pemilihan diverifikasi secara akuntabel dan independen.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3. TIGA PILAR KOMITMEN LEGISLASI ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0e0f11] border border-white/5 p-8 sm:p-12 space-y-8">
          <div className="border-b border-white/5 pb-4">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">
              / DOKTRIN PENGABDIAN
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Tiga Pilar Kebijakan Utama Dewan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {corePillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#16171b] border border-white/5 space-y-3 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 w-fit">
                  {pillar.icon}
                </div>
                <h4 className="text-sm font-bold text-white">{pillar.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. REKAM JEJAK: PENDIDIKAN & KARIER PUBLIK ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">
              / RIWAYAT HISTORIS
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Rekam Jejak &amp; Latar Belakang
            </h3>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#16171b] border border-white/5 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('pendidikan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pendidikan'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Riwayat Pendidikan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('karier')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'karier'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Karier & Pengabdian</span>
            </button>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="space-y-4">
          {activeTab === 'pendidikan'
            ? educationHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#16171b] border border-white/5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-blue-500/20 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <span className="text-xs font-semibold text-blue-400">
                      {item.institution}
                    </span>
                    <h4 className="text-base font-bold text-white">{item.degree}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 text-slate-300 text-xs font-mono font-bold shrink-0 self-start border border-white/5">
                    {item.year}
                  </div>
                </div>
              ))
            : careerHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#16171b] border border-white/5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-blue-500/20 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <span className="text-xs font-semibold text-blue-400">
                      {item.organization}
                    </span>
                    <h4 className="text-base font-bold text-white">{item.role}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 text-slate-300 text-xs font-mono font-bold shrink-0 self-start border border-white/5">
                    {item.period}
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* ─── 5. LEMBAGA & MITRA STRATEGIS PARLEMEN ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <span className="text-slate-400">LEMBAGA & MITRA KERJA</span>
          <span>🏛️ DPR RI SENAYAN</span>
          <span>📋 KOMISI {member?.commissionName || 'PARLEMEN'}</span>
          <span>🇮🇩 DAPIL {dapil}</span>
          <span>⚖️ BADAN LEGISLASI NASIONAL</span>
        </div>
      </section>
    </div>
  );
}
