'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  Building2,
  Calendar,
  GraduationCap,
  Briefcase,
  Users,
  Award,
  ArrowRight,
  Download,
  Quote,
  CheckCircle2,
  FileText,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface BoldProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function BoldProfileClient({ member, theme, subdomain }: BoldProfileClientProps) {
  const primaryColor = theme?.primaryHexColor || '#DC2626';
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Ir. Sangsoro Mowo Berkah, M.Sc.';
  const photoUrl =
    theme?.officialPhotoUrl || member?.photoUrl || '/images/dewan-standing-full.png';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
  const commission = member?.commissionName || 'Komisi X DPR RI';
  const party = member?.partyAffiliation || 'Fraksi Polaris';

  // Split name for stacked Bebas Neue style
  function getStackedName(fullName?: string): [string, string] {
    if (!fullName) return ['WAKIL', 'RAKYAT'];
    const clean = fullName
      .replace(/^(dr\.|ir\.|drs\.|dra\.|h\.|hj\.|prof\.)\s+/gi, '')
      .replace(/,\s*(m\.sc|s\.t|s\.e|m\.m|s\.h|m\.h|s\.ip|m\.ip|ph\.d|m\.a).*$/gi, '')
      .trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return [clean, ''];
    if (parts.length === 2) return [parts[0], parts[1]];
    return [parts[0], parts.slice(1).join(' ')];
  }

  const [firstName, lastName] = getStackedName(officialFullName);

  // Active tab for rekam jejak
  const [activeTab, setActiveTab] = useState<'pendidikan' | 'karier' | 'organisasi'>('pendidikan');

  const educationHistory = [
    {
      period: '2015 - 2019',
      institution: 'Universitas Indonesia (UI)',
      degree: 'Doktor Ilmu Kebijakan Publik (S3)',
      thesis: 'Disertasi: Reformasi Anggaran Partisipatif untuk Pemerataan Pembangunan Daerah.',
    },
    {
      period: '2008 - 2010',
      institution: 'Institut Teknologi Bandung (ITB)',
      degree: 'Magister Perencanaan Wilayah & Kota (S2)',
      thesis: 'Tesis: Pemodelan Konektivitas Infrastruktur Logistik Jawa Barat.',
    },
    {
      period: '2002 - 2007',
      institution: 'Universitas Padjadjaran (UNPAD)',
      degree: 'Sarjana Ilmu Pemerintahan (S1)',
      thesis: 'Fokus Tata Kelola Otonomi Daerah dan Advokasi Pelayanan Publik.',
    },
  ];

  const careerHistory = [
    {
      period: '2024 - Sekarang',
      role: `Anggota DPR RI - ${commission}`,
      entity: 'Dewan Perwakilan Rakyat Republik Indonesia (Senayan, Jakarta)',
      desc: 'Mengawal pengawasan legislasi, kebijakan anggaran pendidikan tinggi, kebudayaan, pemuda, olahraga, dan pariwisata nasional.',
    },
    {
      period: '2019 - 2024',
      role: 'Ketua Komisi Riset Kebijakan Publik',
      entity: 'Lembaga Kajian Strategis Daerah Jawa Barat',
      desc: 'Menyusun 18 naskah akademik rekomendasi kebijakan perlindungan buruh tani dan alokasi transfer dana desa.',
    },
    {
      period: '2014 - 2019',
      role: 'Tenaga Ahli Madya Badan Anggaran DPR RI',
      entity: 'Sekretariat Jenderal DPR RI',
      desc: 'Menganalisis sinkronisasi RAPBN kementerian teknis dan efisiensi belanja modal infrastruktur daerah.',
    },
  ];

  const organizationHistory = [
    {
      period: '2021 - Sekarang',
      role: 'Wakil Ketua Bidang Advokasi Kebijakan',
      entity: 'Ikatan Cendekiawan Nasional (ICN)',
      desc: 'Memimpin perumusan draf revisi undang-undang tata ruang dan perlindungan ekologi.',
    },
    {
      period: '2016 - 2021',
      role: 'Dewan Penasihat Pemberdayaan UMKM',
      entity: 'Himpunan Pengusaha Muda & Komunitas Kreatif Jabar',
      desc: 'Menginisiasi 40 program inkubasi wirausaha muda dan sertifikasi halal gratis.',
    },
    {
      period: '2005 - 2007',
      role: 'Ketua Umum Badan Eksekutif Mahasiswa (BEM)',
      entity: 'Universitas Padjadjaran',
      desc: 'Memimpin gerakan advokasi transparansi dana pendidikan dan posko advokasi rakyat miskin kota.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-24">
      {/* ─── SECTION 1: EXECUTIVE BIO CUTOUT HERO ─── */}
      <section className="rounded-3xl bg-[#0C0C0C] border border-white/10 p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Ambient Red Glow in Card */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-25"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Kolom Kiri: Foto Pejabat dengan Ambient Glow */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-[3/4] rounded-2xl overflow-hidden bg-[#161616] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
              {/* Background ambient lighting behind person */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-40"
                style={{ backgroundColor: primaryColor }}
              />

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-full object-cover object-top filter contrast-105 group-hover:scale-105 transition-transform duration-700 relative z-10"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/images/default-avatar.png')) {
                    target.src = '/images/default-avatar.png';
                  }
                }}
              />

              {/* Verified Parliamentary Badge */}
              <div
                className="absolute top-3.5 right-3.5 p-2 rounded-xl text-white shadow-xl z-20 border border-white/20"
                style={{ backgroundColor: primaryColor }}
                title="Pejabat Publik Terverifikasi"
              >
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>

              {/* Bottom Label Overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md border border-white/15 rounded-xl p-3 z-20">
                <div className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">
                  MANDAT KONSTITUSIONAL
                </div>
                <div className="text-xs font-bold text-white truncate">
                  ANGGOTA DPR RI • {dapil}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Identitas, Stacked Name & Narasi */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="font-script text-3xl sm:text-4xl text-rose-200/90 font-normal block leading-tight">
                Hello, I&apos;m
              </span>
              <h2 className="font-bebas text-5xl sm:text-7xl lg:text-8xl font-black text-white uppercase tracking-tight leading-[0.88]">
                <span className="block">{firstName}</span>
                {lastName && <span className="block text-red-500">{lastName}</span>}
              </h2>
            </div>

            {/* Subtitle Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                {commission}
              </span>
              <span
                className="px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {party}
              </span>
              <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{dapil}</span>
              </span>
            </div>

            {/* Biography Paragraphs */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal">
              <p>
                <strong className="text-white font-bold">{officialFullName}</strong> adalah wakil
                rakyat yang mendedikasikan seluruh daya juang di parlemen demi tegaknya keadilan sosial,
                transparansi alokasi anggaran, dan pembelaan hak-hak masyarakat di Daerah Pemilihan {dapil}.
              </p>
              <p>
                Berbekal keahlian akademis doktoral dalam kebijakan publik dan pengalaman satu dekade di
                lingkar legislasi nasional, beliau senantiasa berdiri di garis terdepan menentang regulasi yang
                merugikan rakyat kecil, memperjuangkan anggaran pendidikan berkeadilan, serta mengawal dana
                aspirasi agar tepat sasaran hingga ke pelosok desa.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={subdomain ? `/${subdomain}/kontak` : '/kontak'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <span>KIRIM ASPIRASI RESMI</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#alur-advokasi"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all"
              >
                <span>LIHAT ALUR ADVOKASI</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: 4 MASSIVE STATS COUNTERS ─── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { value: '10+', label: 'TAHUN', sub: 'PENGABDIAN PUBLIK' },
          { value: '42+', label: 'RUU & PERDA', sub: 'TERKAWAL KETAT' },
          { value: '100%', label: 'TINGKAT KEHADIRAN', sub: 'SIDANG PARLEMEN' },
          { value: '15.000+', label: 'ASPIRASI WARGA', sub: 'TERADVOKASI NYATA' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-5 sm:p-6 rounded-2xl bg-[#0D0D0D] border border-white/5 hover:border-red-600/40 transition-colors space-y-2 group"
          >
            <div
              className="font-bebas text-4xl sm:text-6xl font-black leading-none group-hover:scale-105 transition-transform"
              style={{ color: primaryColor }}
            >
              {item.value}
            </div>
            <div className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-white uppercase leading-tight">
              {item.label}
              <br />
              <span className="text-slate-500 font-normal">{item.sub}</span>
            </div>
          </div>
        ))}
      </section>

      {/* ─── SECTION 3: 3 PILAR KOMITMEN KERAKYATAN ─── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono uppercase tracking-widest">
          <span className="font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>TIGA PILAR PERJUANGAN PARLEMEN</span>
          </span>
          <span className="text-red-400 font-mono hidden sm:inline-block">DAPIL {dapil}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              title: 'ADVOKASI TANPA KOMPROMI',
              desc: 'Berpihak teguh pada hak konstitusi buruh, petani, nelayan, guru honorer, dan pelaku UMKM dari tekanan regulasi yang merugikan.',
            },
            {
              num: '02',
              title: 'TRANSPARANSI TOTAL ANGGARAN',
              desc: 'Membuka seluruh rincian pokir dan alokasi transfer APBN ke daerah pemilihan secara digital demi akuntabilitas tanpa cela.',
            },
            {
              num: '03',
              title: 'HADIR NYATA DI AKAR RUMPUT',
              desc: 'Reses bukan sekadar seremonial panggung, melainkan aksi turun langsung meninjau jalan rusak, sekolah roboh, dan posko kesehatan warga.',
            },
          ].map((card) => (
            <div
              key={card.num}
              className="p-6 rounded-2xl bg-[#111111] border border-white/5 hover:border-red-600/50 transition-all duration-300 space-y-4 relative group"
            >
              <div className="text-xs font-mono text-red-500 font-bold flex items-center justify-between">
                <span className="text-2xl font-bebas tracking-normal">{card.num}</span>
                <span className="w-8 h-[2px] bg-red-600/50 group-hover:w-14 transition-all" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-red-400 transition-colors">
                {card.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 4: ALUR ADVOKASI KEBIJAKAN (5 TAHAPAN BRUTALIST) ─── */}
      <section id="alur-advokasi" className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono uppercase tracking-widest">
          <span className="font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>ALUR ADVOKASI KEBIJAKAN PUBLIK</span>
          </span>
          <span className="text-slate-500 font-mono">SOP PENGAWALAN ASPIRASI</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'SERAP ASPIRASI',
              desc: 'Menghimpun keluhan warga melalui reses tatap muka, rumah aspirasi dapil, dan saluran pengaduan online resmi.',
            },
            {
              step: '02',
              title: 'KAJIAN HUKUM',
              desc: 'Penyusunan naskah telaah bersama tim pakar dan akademisi untuk merumuskan landasan yuridis yang solid.',
            },
            {
              step: '03',
              title: 'DEBAT KOMISI',
              desc: 'Memperjuangkan klausul undang-undang dan alokasi anggaran APBN secara gigih dalam rapat kerja menteri terkait.',
            },
            {
              step: '04',
              title: 'SIDAK LAPANGAN',
              desc: 'Pengawasan langsung ke lokasi fisik untuk memastikan program pembangunan berjalan sesuai spesifikasi dan bebas pungli.',
            },
            {
              step: '05',
              title: 'LAPORAN PUBLIK',
              desc: 'Menerbitkan laporan akuntabilitas berkala agar masyarakat dapat menguji hasil kerja yang telah dicapai.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-xl bg-[#0D0D0D] border border-white/5 hover:border-red-600/40 transition-all space-y-3"
            >
              <div className="font-bebas text-3xl font-black text-red-500">{item.step}</div>
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">{item.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 5: TABBED REKAM JEJAK (PENDIDIKAN, KARIER, ORGANISASI) ─── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="text-xs font-mono uppercase tracking-widest font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>REKAM JEJAK &amp; DEDIKASI KENEGARAAN</span>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-[#111111] border border-white/10 self-start">
            {[
              { id: 'pendidikan', label: 'Pendidikan', icon: GraduationCap },
              { id: 'karier', label: 'Karier Parlemen', icon: Briefcase },
              { id: 'organisasi', label: 'Organisasi', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {activeTab === 'pendidikan' &&
            educationHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#111111] border border-white/5 hover:border-red-600/30 transition-colors space-y-3"
              >
                <div className="text-xs font-mono text-red-500 font-bold">{item.period}</div>
                <h4 className="text-sm font-bold text-white uppercase">{item.degree}</h4>
                <div className="text-xs text-slate-300 font-medium">{item.institution}</div>
                <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/5">
                  {item.thesis}
                </p>
              </div>
            ))}

          {activeTab === 'karier' &&
            careerHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#111111] border border-white/5 hover:border-red-600/30 transition-colors space-y-3"
              >
                <div className="text-xs font-mono text-red-500 font-bold">{item.period}</div>
                <h4 className="text-sm font-bold text-white uppercase">{item.role}</h4>
                <div className="text-xs text-slate-300 font-medium">{item.entity}</div>
                <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/5">
                  {item.desc}
                </p>
              </div>
            ))}

          {activeTab === 'organisasi' &&
            organizationHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#111111] border border-white/5 hover:border-red-600/30 transition-colors space-y-3"
              >
                <div className="text-xs font-mono text-red-500 font-bold">{item.period}</div>
                <h4 className="text-sm font-bold text-white uppercase">{item.role}</h4>
                <div className="text-xs text-slate-300 font-medium">{item.entity}</div>
                <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/5">
                  {item.desc}
                </p>
              </div>
            ))}
        </div>
      </section>

      {/* ─── SECTION 6: RED QUOTE CARD (SIGNATURE BOLD TYPOGRAPHY) ─── */}
      <section>
        <div
          className="p-8 sm:p-12 rounded-3xl text-white space-y-6 shadow-2xl relative overflow-hidden"
          style={{ backgroundColor: primaryColor }}
        >
          <Quote className="w-12 h-12 text-white/30" />
          <p className="text-lg sm:text-2xl font-serif italic leading-relaxed font-semibold max-w-4xl">
            &ldquo;Amanah rakyat bukanlah sekadar retorika mimbar, melainkan mandat nyata yang harus diwujudkan
            dalam setiap rupiah alokasi anggaran, setiap butir pasal undang-undang, dan keadilan yang dirasakan
            langsung oleh warga di akar rumput.&rdquo;
          </p>

          <div className="pt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
            <div>
              <span className="font-bold text-sm block uppercase tracking-wider">{officialFullName}</span>
              <span className="text-white/80 text-xs">Anggota DPR RI Fraksi Polaris • Dapil {dapil}</span>
            </div>
            <Link
              href={subdomain ? `/${subdomain}/kontak` : '/kontak'}
              className="px-5 py-2.5 rounded-xl bg-black hover:bg-black/80 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md self-start sm:self-auto"
            >
              SALURKAN ASPIRASI ANDA →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: DOKUMENTASI AKSI NYATA DI LAPANGAN ─── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono uppercase tracking-widest">
          <span className="font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>DOKUMENTASI AKSI NYATA &amp; KUNJUNGAN KERJA</span>
          </span>
          <span className="text-slate-500 font-mono">PARLEMEN BEKERJA</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              img: '/images/ref-gallery-reses.jpg',
              title: 'Serap Aspirasi di Dapil',
              caption: 'Dialog intensif mendengar keluhan petani dan pelaku usaha mikro lokal.',
            },
            {
              img: '/images/ref-gallery-sidak.jpg',
              title: 'Sidak Proyek Infrastruktur',
              caption: 'Meninjau langsung pengaspalan jalan penghubung antardesa.',
            },
            {
              img: '/images/ref-gallery-komisi.jpg',
              title: 'Rapat Kerja Parlemen',
              caption: 'Memperjuangkan pagu alokasi anggaran beasiswa pendidikan tinggi.',
            },
            {
              img: '/images/ref-gallery-santri.jpg',
              title: 'Silaturahmi Tokoh & Santri',
              caption: 'Menjaga persatuan dan sinergi penguatan karakter generasi muda bangsa.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group rounded-2xl bg-[#111111] border border-white/5 hover:border-red-600/50 overflow-hidden transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-4 space-y-1">
                <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors uppercase font-mono">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
