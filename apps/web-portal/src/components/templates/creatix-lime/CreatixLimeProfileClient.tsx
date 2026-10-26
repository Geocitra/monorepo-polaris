'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  MapPin,
  GraduationCap,
  Briefcase,
  Compass,
  HeartHandshake,
  BarChart3,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';
import { LimeStarburst, LimeSparkle } from './CreatixLimeShell';

interface CreatixLimeProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CreatixLimeProfileClient({
  member,
  theme,
  subdomain,
}: CreatixLimeProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'pillars' | 'experience' | 'education'>('pillars');

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

  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Dr. Ir. Sangsoro Mowo Berkah, M.Sc.';

  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/dewan-standing-full.png';

  const rawDapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
  const dapil = rawDapil.replace(/_/g, ' ');

  const rawParty = member?.partyAffiliation || 'Fraksi Parlemen';
  const party = rawParty.replace(/_/g, ' ');

  const rawLevel = member?.legislativeLevel || 'DPR RI';
  const legislativeLevel = rawLevel.replace(/_/g, ' ');

  const rawCommission =
    member?.commissionName || 'KOMISI V (INFRASTRUKTUR & PERHUBUNGAN)';
  const commissionName = rawCommission.replace(/_/g, ' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: MONOLITHIC WHITE HERO PROFILE CARD (CREATIX RIGEL SIGNATURE)
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative rounded-3xl bg-white text-slate-900 p-6 sm:p-10 lg:p-14 shadow-2xl border border-white/20 overflow-hidden">
        {/* Top-Right Starburst */}
        <div className="absolute top-6 right-8 hidden sm:block pointer-events-none opacity-90">
          <LimeStarburst className="w-14 h-14 text-[#84CC16]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Kolom Kiri: Foto Resmi di atas Circular Disc */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-[3/4] flex items-end justify-center">
              
              {/* Circular Disc Background */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-[#F3F4F6] border border-slate-200 pointer-events-none z-0" />

              {/* Foto Dewan */}
              <img
                src={photoUrl}
                alt={officialFullName}
                className="max-h-[360px] sm:max-h-[420px] w-auto object-contain object-bottom drop-shadow-2xl relative z-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                }}
              />

              {/* Badge Verifikasi */}
              <div className="absolute top-3 right-3 z-20 bg-slate-950 text-[#84CC16] p-2.5 rounded-2xl shadow-lg border border-slate-800">
                <ShieldCheck className="w-5 h-5" />
              </div>

              {/* Floating Mandat Capsule */}
              <div className="absolute bottom-2 inset-x-2 z-20 bg-slate-950/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/10 text-white text-center">
                <span className="text-[10px] font-bold text-[#84CC16] uppercase tracking-wider block">
                  Mandat Konstituen
                </span>
                <span className="text-xs font-black truncate block">
                  {legislativeLevel} • Dapil {dapil}
                </span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Identitas, Visi Kenegaraan & Ribbon Metrik */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                <Award className="w-3.5 h-3.5 text-[#84CC16]" />
                <span>Wakil Rakyat Terpilih • Fraksi {party}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Dapil {dapil}</span>
              </span>
            </div>

            {/* Nama & Gelar */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#84CC16] rounded-full rotate-[20deg]" />
                <span className="w-1.5 h-4 bg-[#84CC16] rounded-full rotate-[20deg]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Profil Pejabat Publik
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                {officialFullName}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 shrink-0 text-[#84CC16]" />
                <span>{commissionName}</span>
              </p>
            </div>

            {/* Visi Pengabdian dalam Kotak Khusus */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0B0E0B] text-white border border-white/10 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#84CC16]">
                <span>Visi &amp; Komitmen Pengabdian</span>
                <LimeSparkle className="w-3.5 h-3.5 text-[#84CC16]" />
              </div>
              <p className="text-xs sm:text-sm italic leading-relaxed text-slate-300">
                &ldquo;
                {theme?.bioBiography ||
                  'Mendedikasikan seluruh amanah rakyat untuk memperjuangkan keadilan sosial, mendorong pemerataan infrastruktur ekonomi di daerah pemilihan, dan menegakkan fungsi pengawasan anggaran yang transparan dan akuntabel demi kesejahteraan bersama.'}
                &rdquo;
              </p>
            </div>

            {/* Counter Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-500">Kehadiran Rapat</div>
                <div className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5">100%</div>
                <div className="text-[9px] text-[#84CC16] font-extrabold uppercase">Paripurna &amp; Komisi</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-500">Kajian Regulasi</div>
                <div className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5">14 Raperda</div>
                <div className="text-[9px] text-slate-600 font-semibold">Inisiasi &amp; Masukan</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-500">Kunjungan Dapil</div>
                <div className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5">48+ Titik</div>
                <div className="text-[9px] text-slate-600 font-semibold">Reses &amp; Dialog</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-500">Aspirasi Tuntas</div>
                <div className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5">1.200+</div>
                <div className="text-[9px] text-[#84CC16] font-extrabold uppercase">Tervalidasi</div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={getNavLinkHref('/artikel')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span>Lihat Risalah Kebijakan</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#84CC16]" />
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 border border-slate-300 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                <span>Kontak Staf Ahli</span>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 2: TABBED REKAM JEJAK & PILAR PENGABDIAN
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="space-y-8">
        
        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('pillars')}
              className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'pillars'
                  ? 'bg-[#84CC16] text-slate-950 shadow-md font-black'
                  : 'bg-[#0E150E] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              Fokus Pengabdian
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('experience')}
              className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'experience'
                  ? 'bg-[#84CC16] text-slate-950 shadow-md font-black'
                  : 'bg-[#0E150E] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              Penugasan Parlemen
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('education')}
              className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'education'
                  ? 'bg-[#84CC16] text-slate-950 shadow-md font-black'
                  : 'bg-[#0E150E] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              Pendidikan Formal
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#84CC16] font-bold">
            <LimeSparkle className="w-4 h-4 text-[#84CC16]" />
            <span>Arsip Rekam Jejak Terverifikasi</span>
          </div>
        </div>

        {/* Tab 1: 4 Pilar Fokus Pengabdian */}
        {activeTab === 'pillars' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pilar 1 */}
            <div className="p-6 rounded-2xl bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/60 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-[#84CC16] flex items-center justify-center font-black">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#84CC16] block">
                  Fungsi Legislasi
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Regulasi Pro Rakyat
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mengawal penyusunan peraturan perundang-undangan daerah yang berpihak pada kemudahan berusaha UMKM, perlindungan buruh tani, dan kepastian hukum.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="p-6 rounded-2xl bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/60 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-[#84CC16] flex items-center justify-center font-black">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#84CC16] block">
                  Fungsi Anggaran
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Akuntabilitas APBD
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Memastikan setiap alokasi APBD dan dana transfer tepat sasaran, bebas inefisiensi, serta benar-benar dinikmati masyarakat melalui proyek konektivitas jalan desa.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="p-6 rounded-2xl bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/60 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-[#84CC16] flex items-center justify-center font-black">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#84CC16] block">
                  Fungsi Representasi
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Advokasi Konstituen
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Menjaga dialog terbuka bersama warga di akar rumput melalui agenda reses berkala, forum dengar pendapat, dan bantuan kemanusiaan darurat di Dapil {dapil}.
              </p>
            </div>

            {/* Pilar 4 */}
            <div className="p-6 rounded-2xl bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/60 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-[#84CC16] flex items-center justify-center font-black">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#84CC16] block">
                  Fungsi Pengawasan
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Kinerja Pelayanan Publik
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sidak lapangan berkala untuk memastikan mutu konstruksi fasilitas umum, jembatan penyeberangan, serta ketersediaan pasokan pupuk dan layanan kesehatan puskesmas.
              </p>
            </div>

          </div>
        )}

        {/* Tab 2: Penugasan Parlemen (AKD) */}
        {activeTab === 'experience' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0D120D] border border-white/10 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/5 text-[#84CC16] flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Penugasan Alat Kelengkapan Dewan (AKD)
                </h3>
                <p className="text-xs text-slate-400">Rekam jejak amanah keparlemenan kenegaraan</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#080B08] border border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#84CC16] mt-2 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Anggota {legislativeLevel} • Periode 2024 – 2029
                  </h4>
                  <p className="text-xs text-slate-400">
                    Mewakili konstituen di Daerah Pemilihan {dapil} melalui Fraksi {party}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#080B08] border border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#84CC16] mt-2 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Anggota {commissionName}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Memimpin pengawasan proyek pembangunan infrastruktur logistik dan perhubungan antarkabupaten.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#080B08] border border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#84CC16] mt-2 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Anggota Badan Anggaran (Banggar)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Mengawal postur belanja transfer daerah, alokasi subsidi pupuk, dan anggaran penanganan stunting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Pendidikan Formal */}
        {activeTab === 'education' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0D120D] border border-white/10 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/5 text-[#84CC16] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Riwayat Pendidikan Formal
                </h3>
                <p className="text-xs text-slate-400">Landasan keilmuan perumusan kebijakan publik</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#080B08] border border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#84CC16] mt-2 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Doktor (S3) Ilmu Kebijakan Publik &amp; Tata Kelola
                  </h4>
                  <p className="text-xs text-slate-400">
                    Universitas Indonesia • Lulus dengan Predikat Pujian (Cum Laude)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#080B08] border border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#84CC16] mt-2 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Master of Science (M.Sc.) Perencanaan Pembangunan
                  </h4>
                  <p className="text-xs text-slate-400">
                    Program Pascasarjana Terakreditasi Unggul
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#080B08] border border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#84CC16] mt-2 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Sarjana Teknik (S.T. / Ir.) Infrastruktur Sipil
                  </h4>
                  <p className="text-xs text-slate-400">
                    Institut Teknologi Terkemuka Indonesia
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: GALERI DOKUMENTASI KEGIATAN (JIKA ADA)
          ────────────────────────────────────────────────────────────────────────── */}
      {member?.photoGallery && member.photoGallery.length > 0 && (
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Dokumentasi Kegiatan &amp; Aspirasi
            </h3>
            <span className="text-xs font-bold uppercase tracking-wider text-[#84CC16]">
              Galeri Resmi Dewan
            </span>
          </div>
          <PortalPhotoGallery photos={member.photoGallery} memberName={officialFullName} />
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 4: CALL TO ACTION ASPIRASI (DUAL PILL MOTIF)
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="rounded-3xl bg-gradient-to-r from-[#0E150E] via-[#121C12] to-[#0A0F0A] text-white p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none">
          <LimeStarburst className="w-48 h-48 text-[#84CC16]" />
        </div>

        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-[#84CC16]">
            <LimeSparkle className="w-3.5 h-3.5 text-[#84CC16]" />
            <span>Saluran Pengaduan Langsung</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Ingin Menyampaikan Masukan Langsung Kepada {officialFullName}?
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Staf ahli dewan senantiasa menerima telaah persoalan lingkungan, masalah bansos, jalan rusak, pupuk subsidi, dan usulan pokok pikiran masyarakat Daerah Pemilihan {dapil}.
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center p-1 sm:p-1.5 rounded-full bg-black/90 backdrop-blur-md border border-white/20 shadow-2xl">
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 rounded-full bg-[#84CC16] text-slate-950 font-black text-xs sm:text-[13px] hover:bg-[#74BC12] transition-colors shadow-sm"
              >
                <span>Kirim Aspirasi Sekarang</span>
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center px-4 sm:px-5 py-2.5 rounded-full text-white/90 hover:text-[#84CC16] font-semibold text-xs sm:text-[13px] transition-colors"
              >
                <span>Kontak Posko</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
