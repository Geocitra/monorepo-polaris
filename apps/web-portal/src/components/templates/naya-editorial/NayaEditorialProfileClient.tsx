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
  Landmark,
  Scale,
} from 'lucide-react';

interface NayaEditorialProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function NayaEditorialProfileClient({
  member,
  theme,
  subdomain,
}: NayaEditorialProfileClientProps) {
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-ahmad-fauzi-cutout.png';

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B, M.Si.';
  const firstName =
    officialFullName.replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/i, '').split(' ')[0] || 'Jonanda';

  const rawDapil = member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I';
  const dapil = rawDapil.replace(/_/g, ' ');

  const rawParty = member?.partyAffiliation || 'Fraksi Parlemen';
  const party = rawParty.replace(/_/g, ' ');

  const rawLevel = member?.legislativeLevel || 'DPRD PROVINSI';
  const legislativeLevel = rawLevel.replace(/_/g, ' ');

  const rawCommission = member?.commissionName || 'KOMISI I (PEMERINTAHAN & HUKUM)';
  const commissionName = rawCommission.replace(/_/g, ' ');

  const bio =
    theme?.bioBiography ||
    member?.bio ||
    `${officialFullName} telah mendedikasikan masa baktinya untuk mendampingi masyarakat di Daerah Pemilihan ${dapil}. Dengan integritas, ketulusan mendengar, dan kecermatan merumuskan regulasi, beliau senantiasa hadir mengawal setiap aspirasi konstituen menuju keadilan sosial dan kemakmuran bersama.`;

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
      description: 'Disertasi mengenai efektivitas desentralisasi fiskal dan tata kelola anggaran daerah berbasis keadilan sosial.',
    },
    {
      degree: 'Magister Sains Administrasi Publik (S2)',
      institution: 'Universitas Gadjah Mada (UGM)',
      year: '2009 - 2012',
      description: 'Fokus kajian regulasi pembangunan infrastruktur pedesaan dan penguatan kelembagaan publik.',
    },
    {
      degree: 'Sarjana Ilmu Sosial & Ilmu Politik (S1)',
      institution: 'Universitas Padjadjaran (UNPAD)',
      year: '2003 - 2007',
      description: 'Kajian sosiologi politik dan dinamika partisipasi masyarakat sipil dalam formulasi regulasi daerah.',
    },
  ];

  const careers = [
    {
      role: `Anggota ${legislativeLevel}`,
      institution: `${party} - Daerah Pemilihan ${dapil}`,
      period: '2024 - Sekarang',
      description: 'Mengemban amanah sebagai inisiator perda perlindungan lahan pangan berkelanjutan dan anggota Badan Anggaran APBD.',
    },
    {
      role: 'Tenaga Ahli Madya Fraksi & Kebijakan Daerah',
      institution: 'Dewan Perwakilan Rakyat Daerah',
      period: '2019 - 2024',
      description: 'Menyusun puluhan naskah akademik rancangan peraturan daerah dan kajian efisiensi penyerapan belanja modal.',
    },
    {
      role: 'Dosen Kebijakan Publik & Otonomi Daerah',
      institution: 'Fakultas Ilmu Sosial & Ilmu Politik',
      period: '2014 - 2019',
      description: 'Mengajar mata kuliah hukum administrasi negara, tata kelola pemerintahan, dan formulasi kebijakan publik.',
    },
  ];

  const focusPillars = [
    {
      num: '01',
      title: 'Advokasi & Regulasi Pro-Rakyat',
      desc: 'Mendorong perda inisiatif yang menjamin hak akses pendidikan, jaminan kesehatan merata, dan perlindungan lahan pertanian.',
    },
    {
      num: '02',
      title: 'Pengawasan Transparansi APBD',
      desc: 'Memastikan alokasi dana pembangunan daerah tersalurkan tepat sasaran, bebas inefisiensi, dan akuntabel kepada publik.',
    },
    {
      num: '03',
      title: 'Serap Aspirasi Rutin di Dapil',
      desc: 'Membuka kanal komunikasi dua arah langsung ke tingkat desa, posko reses, dan dialog tatap muka berkala.',
    },
    {
      num: '04',
      title: 'Pemberdayaan Ekonomi & UMKM',
      desc: 'Mengawal program bantuan modal usaha rakyat, pelatihan digitalisasi produk lokal, dan subsidi sarana tani.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 px-6 sm:px-10 lg:px-16 max-w-[1520px] mx-auto space-y-16">
      
      {/* ─── 1. TOP PROFILE SHOWCASE: ARCH PORTRAIT & BIOGRAPHY CARD ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Arch Portrait Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[360px] sm:max-w-[420px]">
            <div className="w-full h-[420px] sm:h-[490px] rounded-t-full rounded-b-[40px] overflow-hidden bg-[#ECE8DF] border border-[#DBD6C9] shadow-xl relative">
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-full object-cover object-top filter contrast-[1.03]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#25281E]/30 to-transparent pointer-events-none" />
            </div>

            {/* Floating Dark Olive Badge */}
            <div className="absolute -bottom-4 -right-2 sm:-right-4 bg-[#35382B] text-white p-4 sm:p-5 rounded-[22px] shadow-2xl max-w-[210px] sm:max-w-[230px] border border-white/10 z-20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-[#BFC3B2] uppercase tracking-wider">Amanah Publik</span>
                <Sparkles className="w-3.5 h-3.5 text-[#E0E5D4]" />
              </div>
              <p className="font-cormorant italic text-base text-white/95 leading-tight">
                Advokasi dengan Hati.
              </p>
              <p className="font-cormorant font-bold text-lg text-white leading-tight mt-0.5">
                Hasil Nyata untuk Daerah.
              </p>
            </div>
          </div>
        </div>

        {/* Bio & Identity Column */}
        <div className="lg:col-span-7 select-text">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#D8D3C4] bg-[#EFECE1]/80 text-[#606453] text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>{legislativeLevel} • {party}</span>
          </div>

          <h2 className="font-cormorant text-3xl sm:text-4xl md:text-5xl font-normal text-[#24271D] leading-[1.1] tracking-tight">
            {officialFullName}
          </h2>

          <p className="text-xs sm:text-sm font-semibold text-[#666B57] mt-1.5 uppercase tracking-wider">
            {commissionName} • Daerah Pemilihan {dapil}
          </p>

          <p className="mt-5 text-sm sm:text-base text-[#616556] leading-relaxed font-normal">
            {bio}
          </p>

          {/* Quick Credential Highlights */}
          <div className="mt-8 pt-6 border-t border-[#DFDACB] grid grid-cols-2 sm:grid-cols-3 gap-5">
            <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
              <Award className="w-5 h-5 text-[#4E5340] mb-2" />
              <div className="font-cormorant text-2xl font-bold text-[#24271D]">6+ Tahun</div>
              <div className="text-xs text-[#737768] font-medium">Pengabdian Publik</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs">
              <Users className="w-5 h-5 text-[#4E5340] mb-2" />
              <div className="font-cormorant text-2xl font-bold text-[#24271D]">120+ Aksi</div>
              <div className="text-xs text-[#737768] font-medium">Aspirasi Terwujud</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E5E0D5] shadow-2xs col-span-2 sm:col-span-1">
              <ShieldCheck className="w-5 h-5 text-[#4E5340] mb-2" />
              <div className="font-cormorant text-2xl font-bold text-[#24271D]">Rp 45M+</div>
              <div className="text-xs text-[#737768] font-medium">APBD Terkawal</div>
            </div>
          </div>
        </div>

      </section>

      {/* ─── 2. 4 PARLIAMENTARY FOCUS PILLARS (MATCHING PACKAGES / SERVICE CARDS) ─── */}
      <section className="pt-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#555A47] uppercase tracking-wider block mb-2">
            Fokus Perjuangan Kenegaraan
          </span>
          <h3 className="font-cormorant text-3xl sm:text-4xl font-normal text-[#24271D] leading-tight">
            4 Pilar Komitmen <span className="italic">Parlemen Pro-Rakyat.</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {focusPillars.map((pillar) => (
            <div
              key={pillar.num}
              className="bg-white rounded-[26px] p-6 sm:p-7 border border-[#E5E0D5] hover:border-[#CCD1BF] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="font-cormorant text-3xl font-bold text-[#35382B] block mb-3">
                  #{pillar.num}
                </span>
                <h4 className="font-cormorant text-xl font-bold text-[#24271D] mb-2 leading-snug">
                  {pillar.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#6A6E5F] leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F0ECE1] flex items-center justify-between text-xs text-[#76796A] font-semibold">
                <span>Amanah {dapil}</span>
                <CheckCircle2 className="w-4 h-4 text-[#4E5340]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. INTERACTIVE TABS: PENDIDIKAN, KARIER, & MANDAT ─── */}
      <section className="bg-white rounded-[32px] border border-[#E5E0D5] p-6 sm:p-10 shadow-sm">
        
        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-[#F0ECE1]">
          {[
            { id: 'semua', label: 'Semua Ikhtisar' },
            { id: 'pendidikan', label: 'Riwayat Pendidikan' },
            { id: 'karier', label: 'Rekam Jejak Karier' },
            { id: 'komisi', label: 'Penugasan Komisi' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#272A20] text-white shadow-xs'
                  : 'bg-[#F2EFE8] text-[#555A47] hover:bg-[#EAE6DC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-10">
          
          {/* Riwayat Pendidikan */}
          {(activeTab === 'semua' || activeTab === 'pendidikan') && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap className="w-5 h-5 text-[#4E5340]" />
                <h4 className="font-cormorant text-2xl font-bold text-[#24271D]">
                  Riwayat Pendidikan Formal
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {educations.map((edu, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9]">
                    <span className="text-[11px] font-semibold text-[#767A6B] block mb-1">
                      {edu.year}
                    </span>
                    <h5 className="font-cormorant text-lg font-bold text-[#24271D] leading-snug">
                      {edu.degree}
                    </h5>
                    <p className="text-xs font-semibold text-[#4E5340] mt-0.5">
                      {edu.institution}
                    </p>
                    <p className="text-xs text-[#6A6E5F] mt-2.5 leading-relaxed">
                      {edu.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rekam Jejak Karier */}
          {(activeTab === 'semua' || activeTab === 'karier') && (
            <div className="pt-4 border-t border-[#F0ECE1]">
              <div className="flex items-center gap-2 mb-5">
                <Briefcase className="w-5 h-5 text-[#4E5340]" />
                <h4 className="font-cormorant text-2xl font-bold text-[#24271D]">
                  Rekam Jejak &amp; Pengabdian Karier
                </h4>
              </div>
              <div className="space-y-4">
                {careers.map((car, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div>
                      <h5 className="font-cormorant text-xl font-bold text-[#24271D] leading-snug">
                        {car.role}
                      </h5>
                      <p className="text-xs font-semibold text-[#4E5340] mt-0.5">
                        {car.institution}
                      </p>
                      <p className="text-xs text-[#6A6E5F] mt-2 leading-relaxed max-w-2xl">
                        {car.description}
                      </p>
                    </div>
                    <span className="shrink-0 px-3 py-1 rounded-full bg-white border border-[#DDD8CB] text-xs font-bold text-[#4E5340] self-start">
                      {car.period}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Penugasan Komisi & Alat Kelengkapan */}
          {(activeTab === 'semua' || activeTab === 'komisi') && (
            <div className="pt-4 border-t border-[#F0ECE1]">
              <div className="flex items-center gap-2 mb-5">
                <Landmark className="w-5 h-5 text-[#4E5340]" />
                <h4 className="font-cormorant text-2xl font-bold text-[#24271D]">
                  Penugasan Alat Kelengkapan Dewan (AKD)
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9]">
                  <h5 className="font-cormorant text-lg font-bold text-[#24271D]">
                    {commissionName}
                  </h5>
                  <p className="text-xs text-[#6A6E5F] mt-2 leading-relaxed">
                    Bertanggung jawab mengawasi jalannya roda pemerintahan daerah, penegakan peraturan perundang-undangan, tata kelola kepegawaian ASN, serta ketertiban umum konstituen.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9]">
                  <h5 className="font-cormorant text-lg font-bold text-[#24271D]">
                    Badan Anggaran (Banggar) &amp; Bapemperda
                  </h5>
                  <p className="text-xs text-[#6A6E5F] mt-2 leading-relaxed">
                    Berperan aktif dalam sinkronisasi rencana kerja anggaran daerah, evaluasi pos belanja APBD agar berorientasi kerakyatan, serta harmonisasi penyusunan draf rancangan perda inisiatif.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ─── 4. BOTTOM ACTION BANNER ─── */}
      <section className="rounded-[32px] bg-[#4E5340] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="select-text text-center md:text-left">
          <h3 className="font-cormorant text-2xl sm:text-3xl text-white font-normal leading-snug">
            Ingin Berdiskusi Mengenai <span className="italic text-[#E0E5D4]">Kebijakan Daerah?</span>
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-xl">
            Sampaikan usulan regulasi, gagasan pembangunan, atau permohonan audiensi publik secara langsung melalui posko aspirasi resmi.
          </p>
        </div>
        <Link
          href={getNavLinkHref('/kontak')}
          className="shrink-0 px-7 py-3.5 rounded-full bg-white text-[#272A20] text-xs sm:text-sm font-bold hover:bg-[#F2EFE8] transition-all inline-flex items-center gap-2 shadow-md group cursor-pointer"
        >
          <span>Hubungi Posko Aspirasi</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

    </div>
  );
}
