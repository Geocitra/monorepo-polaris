'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  Briefcase,
  Users,
  MapPin,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Heart,
  Scale,
  GraduationCap,
} from 'lucide-react';
import { TiaraBurgundyShell } from './TiaraBurgundyShell';
import { getTiaraMemberInfo, useTiaraHref, TIARA_THEME } from './utils';

interface TiaraBurgundyProfileClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function TiaraBurgundyProfileClient({
  member,
  theme,
  subdomain,
}: TiaraBurgundyProfileClientProps) {
  const info = getTiaraMemberInfo(member, theme, subdomain);
  const href = useTiaraHref(subdomain);

  const keyMetrics = [
    {
      value: '100%',
      label: 'Kehadiran Sidang Paripurna',
      desc: 'Disiplin dan aktif dalam setiap pengambilan keputusan legislasi nasional maupun daerah.',
    },
    {
      value: '140+',
      label: 'Aspirasi Warga Tuntas',
      desc: 'Diserap melalui reses rutin dan diperjuangkan dalam alokasi program nyata masyarakat.',
    },
    {
      value: '18',
      label: 'Inisiatif Advokasi Kebijakan',
      desc: 'Mengawal regulasi pro-rakyat, perlindungan UMKM, transparansi anggaran, dan pendidikan.',
    },
    {
      value: '24/7',
      label: 'Kanal Layanan Konstituen',
      desc: 'Membuka ruang dialog terbuka tanpa sekat birokrasi bagi seluruh warga daerah pemilihan.',
    },
  ];

  const careerTimeline = [
    {
      period: '2024 - Sekarang',
      role: `Anggota ${info.legislativeLevel}`,
      institution: info.commissionName,
      description: `Menjalankan fungsi legislasi anggaran, pengawasan kebijakan publik daerah, serta mengawal serapan aspirasi masyarakat di wilayah pemilihan ${info.dapil}.`,
    },
    {
      period: '2019 - 2024',
      role: 'Ketua Tim Advokasi Kebijakan Publik & Anggaran',
      institution: 'Lembaga Pengkajian Tata Kelola Daerah',
      description:
        'Melakukan uji publik terhadap efektivitas anggaran daerah serta mendampingi kelompok tani dan pelaku usaha lokal dalam memperoleh akses program pemerintah.',
    },
    {
      period: '2014 - 2019',
      role: 'Tenaga Ahli Fraksi Parlemen',
      institution: 'Dewan Perwakilan Rakyat Daerah',
      description:
        'Menyusun naskah akademis perancangan peraturan daerah dan sinkronisasi regulasi pusat agar implementatif bagi kesejahteraan warga daerah.',
    },
  ];

  const educationList = [
    {
      degree: 'Doktoral (S3) Kebijakan Publik & Tata Kelola Parlemen',
      institution: 'Universitas Indonesia',
      year: '2020',
      note: 'Disertasi: Akuntabilitas Anggaran Partisipatif Berbasis Data Nyata Konstituen Daerah.',
    },
    {
      degree: 'Magister (S2) Manajemen Pembangunan & Administrasi Publik',
      institution: 'Institut Pertanian Bogor',
      year: '2015',
      note: 'Fokus: Kebijakan Distribusi Bantuan Sosial dan Ketahanan Pangan Rakyat.',
    },
    {
      degree: 'Sarjana (S1) Ilmu Pemerintahan & Hukum Tata Negara',
      institution: 'Universitas Padjadjaran',
      year: '2010',
      note: 'Kajian Otonomi Daerah dan Partisipasi Warga dalam Pembuatan Kebijakan.',
    },
  ];

  const coreValues = [
    {
      title: 'INTEGRITAS (AUTHENTICITY)',
      desc: 'Setiap kebijakan harus mencerminkan kejujuran moral dan transparansi utuh, bukan sekadar janji politik retorika.',
    },
    {
      title: 'KEMANDIRIAN (FREEDOM)',
      desc: 'Memperjuangkan kebebasan ekonomi masyarakat dapil melalui akses modal, pelatihan wirausaha, dan keadilan sarana.',
    },
    {
      title: 'SOLUSI NYATA (IMPACT)',
      desc: 'Bekerja bukan untuk formalitas seremonial, melainkan menghadirkan hasil konkret yang dirasakan langsung oleh dapur rakyat.',
    },
    {
      title: 'ADAPTIF & BERKELANJUTAN (GROWTH)',
      desc: 'Terus belajar mendengarkan masukan warga, mengevaluasi efektivitas program, dan berani memperbaiki sistem yang kaku.',
    },
  ];

  return (
    <TiaraBurgundyShell member={member} theme={theme} subdomain={subdomain} activePage="profil">
      {/* Editorial Header Banner */}
      <section className="bg-[#EFEBE4] border-b border-[#E5DED5] py-14 sm:py-20 px-6 sm:px-10 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs font-serif uppercase tracking-[0.2em] text-[#7A6F6A] mb-8">
            <Link href={href('/')} className="hover:text-[#6B1724] transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#B8AEA8]" />
            <span className="font-bold" style={{ color: info.textAccentColor }}>Profil & Rekam Jejak</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Title Column */}
            <div className="lg:col-span-8 space-y-4">
              <span className="font-serif italic text-2xl sm:text-3xl block" style={{ color: info.textAccentColor }}>
                Tentang & Nilai Pengabdian
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-[#6B1724] tracking-tight leading-tight uppercase font-normal">
                {info.fullName}
              </h1>
              <p className="font-serif text-sm sm:text-base uppercase tracking-[0.2em] text-[#7A6F6A] font-semibold pt-1">
                {info.legislativeLevel} • Fraksi {info.party} • Dapil {info.dapil}
              </p>
              <p className="text-base text-[#5A524D] leading-relaxed max-w-2xl pt-2">
                Mengabdi dengan ketulusan hati, menjembatani aspirasi akar rumput menuju keputusan legislasi yang berkeadilan, transparan, dan berdampak nyata bagi seluruh lapisan masyarakat.
              </p>
            </div>

            {/* Profile Polaroid Card */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="relative bg-white p-4 shadow-xl border border-[#E5DED5] rotate-1 hover:rotate-0 transition-transform duration-300 max-w-[280px]">
                {/* Tape Graphic */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#EADCC8]/80 border border-[#D5C6B0] rotate-[-2deg] shadow-sm z-20 backdrop-blur-xs pointer-events-none" />
                <div className="aspect-3/4 overflow-hidden bg-[#EFEBE4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={info.avatarUrl}
                    alt={info.fullName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="pt-3 text-center">
                  <span className="font-serif text-xs font-bold tracking-[0.15em] text-[#6B1724] uppercase block">
                    {info.fullName}
                  </span>
                  <span className="text-[11px] text-[#7A6F6A] font-medium block mt-0.5">
                    {info.roleTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Editorial Metrics Strip */}
      <section className="bg-white border-b border-[#E5DED5] py-12 px-6 sm:px-10 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyMetrics.map((item, idx) => (
              <div
                key={idx}
                className="p-6 bg-[#FBF9F5] border border-[#E5DED5] rounded-xs space-y-2 text-center sm:text-left transition-all duration-300 hover:shadow-md hover:border-[#6B1724]/30"
              >
                <div className="font-serif text-4xl lg:text-5xl font-normal tracking-tight" style={{ color: info.textAccentColor }}>
                  {item.value}
                </div>
                <div className="font-serif text-xs font-bold uppercase tracking-[0.15em] text-[#1E1B18]">
                  {item.label}
                </div>
                <p className="text-xs text-[#7A6F6A] leading-relaxed pt-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story & Biography Section */}
      <section className="bg-[#FBF9F5] py-16 sm:py-24 px-6 sm:px-10 lg:px-12 border-b border-[#E5DED5]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Story Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="font-serif italic text-2xl block" style={{ color: info.textAccentColor }}>
                  Komitmen & Visi Perjuangan
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#1E1B18] uppercase tracking-wide">
                  MENJAGA AMANAH RAKYAT, MEWUJUDKAN KEADILAN SOSIAL
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#5A524D] leading-relaxed">
                <p>
                  Perjalanan dalam parlemen adalah amanah suci yang tidak boleh dinodai oleh kepentingan pribadi maupun kelompok. Sejak awal mula melangkah di ruang legislasi, komitmen saya tetap teguh: menjadi corong suara konstituen yang kerap terabaikan di meja pengambilan keputusan.
                </p>
                <p>
                  Di setiap masa sidang, fokus utama diarahkan pada pengawasan alokasi anggaran agar benar-benar menyentuh kebutuhan mendasar masyarakat—mulai dari perbaikan fasilitas pendidikan, peningkatan sarana kesehatan daerah, stabilitas harga sarana produksi tani, hingga perlindungan bagi pelaku usaha ultra mikro.
                </p>
                <p>
                  Melalui sistem parlemen modern dan kanal digital polaris yang transparan, seluruh catatan kerja, agenda pengawasan, dan alokasi pokok pikiran dewan dibuka secara bertanggung jawab agar masyarakat dapat memantau langsung kinerja wakilnya.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href={href('/kontak')}
                  className="inline-flex items-center space-x-2.5 px-8 py-3.5 bg-[#6B1724] text-white rounded-full font-serif text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#52101B] transition-all shadow-md group"
                >
                  <span>Sampaikan Aspirasi Sekarang</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Side: Commission & Mandate Overview */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#6B1724] text-white p-8 rounded-xs space-y-6 shadow-lg">
                <div className="space-y-1 border-b border-white/20 pb-4">
                  <span className="text-[11px] font-serif uppercase tracking-[0.2em] text-[#EADCC8]">
                    Penugasan Parlemen
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-white">
                    {info.commissionName}
                  </h3>
                </div>

                <div className="space-y-4 text-xs text-white/90 leading-relaxed">
                  <div className="flex items-start space-x-3">
                    <ShieldCheck className="w-5 h-5 text-[#EADCC8] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-serif tracking-wider uppercase text-[11px]">
                        Fungsi Pengawasan Anggaran
                      </strong>
                      Memastikan transparansi setiap rupiah APBD agar terserap efisien tanpa kebocoran anggaran publik.
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Scale className="w-5 h-5 text-[#EADCC8] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-serif tracking-wider uppercase text-[11px]">
                        Fungsi Pembentukan Regulasi
                      </strong>
                      Menginisiasi perda perlindungan tenaga kerja lokal, keadilan tata kelola ruang, dan kemudahan izin UMKM.
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-[#EADCC8] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-serif tracking-wider uppercase text-[11px]">
                        Fungsi Representasi Warga
                      </strong>
                      Menyelenggarakan forum temu konstituen berkala di pelosok dapil untuk mengumpulkan masukan autentik.
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Career & Education Timelines */}
      <section className="bg-white py-16 sm:py-24 px-6 sm:px-10 lg:px-12 border-b border-[#E5DED5]">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-serif italic text-2xl block" style={{ color: info.textAccentColor }}>
              Jejak Langkah & Rekam Jejak
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1E1B18] uppercase tracking-wide">
              PENGALAMAN & LATAR BELAKANG PENDIDIKAN
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Career Timeline */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 border-b border-[#E5DED5] pb-4">
                <Briefcase className="w-5 h-5 text-[#6B1724]" />
                <h3 className="font-serif text-xl text-[#6B1724] uppercase tracking-wider font-semibold">
                  Riwayat Pengabdian & Karier
                </h3>
              </div>

              <div className="space-y-8 pl-4 border-l-2 border-[#E5DED5]">
                {careerTimeline.map((item, idx) => (
                  <div key={idx} className="relative space-y-2 pl-4">
                    <span className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-[#6B1724] border-2 border-white ring-2 ring-[#E5DED5]" />
                    <span className="text-[11px] font-serif font-bold uppercase tracking-[0.18em] text-[#7A6F6A] block">
                      {item.period}
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#1E1B18]">
                      {item.role}
                    </h4>
                    <p className="text-xs font-semibold" style={{ color: info.textAccentColor }}>
                      {item.institution}
                    </p>
                    <p className="text-xs text-[#5A524D] leading-relaxed pt-1">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education Timeline */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 border-b border-[#E5DED5] pb-4">
                <GraduationCap className="w-5 h-5 text-[#6B1724]" />
                <h3 className="font-serif text-xl text-[#6B1724] uppercase tracking-wider font-semibold">
                  Riwayat Pendidikan Formal
                </h3>
              </div>

              <div className="space-y-8 pl-4 border-l-2 border-[#E5DED5]">
                {educationList.map((item, idx) => (
                  <div key={idx} className="relative space-y-2 pl-4">
                    <span className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-2 ring-[#E5DED5]" style={{ backgroundColor: info.textAccentColor }} />
                    <span className="text-[11px] font-serif font-bold uppercase tracking-[0.18em] text-[#7A6F6A] block">
                      Lulus Tahun {item.year}
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#1E1B18]">
                      {item.degree}
                    </h4>
                    <p className="text-xs font-semibold" style={{ color: info.textAccentColor }}>
                      {item.institution}
                    </p>
                    <p className="text-xs text-[#5A524D] leading-relaxed pt-1 italic">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 4: 4 Burgundy Core Value Cards */}
      <section className="bg-[#EFEBE4] py-16 sm:py-24 px-6 sm:px-10 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="font-serif italic text-2xl block" style={{ color: info.textAccentColor }}>
              Prinsip & Integritas Moral
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#6B1724] uppercase tracking-wide">
              EMPAT PILAR NILAI UTAMA
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {coreValues.map((v, i) => (
              <div
                key={i}
                className="bg-[#6B1724] text-white p-8 sm:p-10 rounded-xs shadow-lg space-y-4 hover:translate-y-[-2px] transition-transform duration-300"
              >
                <span className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#EADCC8] block border-b border-white/20 pb-3">
                  {v.title}
                </span>
                <p className="text-xs sm:text-sm text-[#FBF9F5]/90 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </TiaraBurgundyShell>
  );
}
