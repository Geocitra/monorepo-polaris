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
  ArrowRight,
  FileText,
  Calendar,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { PortalPhotoGallery } from '@/components/profile/PortalPhotoGallery';

interface StudioEditorialProfileClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function StudioEditorialProfileClient({
  member,
  theme,
  subdomain,
}: StudioEditorialProfileClientProps) {
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
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 space-y-16">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: HERO BIOGRAPHY CARD (STUDIO EDITORIAL SPLIT)
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl sm:rounded-3xl bg-white border border-stone-300 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
          
          {/* Kolom Kiri: Foto Resmi dalam Frame Plaster Hangat */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] aspect-[3/4] rounded-2xl overflow-hidden bg-[#DDD7CD] border-2 border-stone-300 shadow-lg group">
              {/* Daylight Soft Radial Highlight */}
              <div className="absolute inset-0 bg-gradient-to-bl from-white/45 via-transparent to-stone-900/10 pointer-events-none" />

              {/* Diagonal Window Shadow Effect */}
              <div
                className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none"
                style={{
                  background:
                    'repeating-linear-gradient(135deg, rgba(65,55,45,0.2) 0px, rgba(65,55,45,0.2) 80px, transparent 80px, transparent 180px)',
                  filter: 'blur(25px)',
                }}
              />

              {/* Foto Dewan */}
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-full object-contain object-bottom filter contrast-[1.03] group-hover:scale-102 transition-transform duration-500 relative z-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                }}
              />

              {/* Badge Pejabat Terverifikasi */}
              <div className="absolute top-4 right-4 z-20 bg-stone-950 text-white p-2 rounded-xl shadow-md">
                <ShieldCheck className="w-5 h-5 text-stone-200" />
              </div>

              {/* Floating Mandat Card */}
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-md border border-white/80">
                <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 block">
                  Mandat Konstituen
                </span>
                <span className="text-xs font-black text-stone-900 truncate block">
                  {legislativeLevel} • Dapil {dapil}
                </span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Identitas & Visi Pernyataan */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200">
                <Award className="w-3.5 h-3.5 text-stone-700" />
                <span>Wakil Rakyat Terpilih • Fraksi {party}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>Dapil {dapil}</span>
              </span>
            </div>

            {/* Nama Lengkap & Gelar */}
            <div className="space-y-1.5">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 tracking-tight leading-tight">
                {officialFullName}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-stone-600 flex items-center gap-2 uppercase tracking-wide">
                <Building2 className="w-4 h-4 shrink-0 text-stone-700" />
                <span>{commissionName}</span>
              </p>
            </div>

            {/* Visi Pengabdian dalam Serif Blockquote */}
            <div className="p-6 rounded-2xl bg-[#F9F8F5] border-l-4 border-stone-950 border-y border-r border-stone-200 text-stone-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-500 block">
                VISI PENGABDIAN KENEGARAAN
              </span>
              <p className="font-serif text-base sm:text-lg italic text-stone-900 leading-relaxed">
                &ldquo;
                {theme?.bioBiography ||
                  'Mendedikasikan seluruh amanah rakyat untuk memperjuangkan keadilan sosial, mendorong pemerataan infrastruktur ekonomi di daerah pemilihan, dan menegakkan fungsi pengawasan anggaran yang transparan dan akuntabel demi kesejahteraan bersama.'}
                &rdquo;
              </p>
            </div>

            {/* Performance Stats Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#EDEAE4]/70 border border-stone-300/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Kehadiran Rapat</div>
                <div className="font-serif text-xl sm:text-2xl font-bold text-stone-950 mt-0.5">100%</div>
                <div className="text-[9px] text-stone-600 font-semibold">Sidang & Komisi</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EDEAE4]/70 border border-stone-300/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Kajian Regulasi</div>
                <div className="font-serif text-xl sm:text-2xl font-bold text-stone-950 mt-0.5">14 Raperda</div>
                <div className="text-[9px] text-stone-600 font-semibold">Naskah Akademik</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EDEAE4]/70 border border-stone-300/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Kunjungan Dapil</div>
                <div className="font-serif text-xl sm:text-2xl font-bold text-stone-950 mt-0.5">48+ Titik</div>
                <div className="text-[9px] text-stone-600 font-semibold">Reses & Dialog</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EDEAE4]/70 border border-stone-300/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Aspirasi Tuntas</div>
                <div className="font-serif text-xl sm:text-2xl font-bold text-stone-950 mt-0.5">1.200+</div>
                <div className="text-[9px] text-stone-600 font-semibold">Tervalidasi</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={getNavLinkHref('/artikel')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-950 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-stone-800 transition-colors shadow-sm"
              >
                <span>Katalog Risalah Kebijakan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={getNavLinkHref('/kontak')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-950 border border-stone-300 text-[11px] font-bold uppercase tracking-wider hover:bg-stone-100 transition-colors"
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
        <div className="flex items-center justify-between border-b border-stone-300 pb-3 flex-wrap gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('pillars')}
              className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
                activeTab === 'pillars'
                  ? 'text-stone-950 font-black border-b-2 border-stone-950 -mb-[13px]'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Fokus Pengabdian
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('experience')}
              className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
                activeTab === 'experience'
                  ? 'text-stone-950 font-black border-b-2 border-stone-950 -mb-[13px]'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Penugasan Parlemen
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('education')}
              className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
                activeTab === 'education'
                  ? 'text-stone-950 font-black border-b-2 border-stone-950 -mb-[13px]'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Pendidikan Formal
            </button>
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
            Arsip Akuntabilitas
          </span>
        </div>

        {/* Tab 1: 4 Pilar Fokus Pengabdian */}
        {activeTab === 'pillars' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pilar 1 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-300 shadow-2xs space-y-4 hover:border-stone-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center font-black">
                <Compass className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                  Fungsi Legislasi
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-950">
                  Regulasi Pro Rakyat
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Mengawal penyusunan peraturan perundang-undangan daerah yang berpihak pada kemudahan izin usaha mikro, perlindungan tenaga kerja lokal, dan kepastian hukum.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-300 shadow-2xs space-y-4 hover:border-stone-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center font-black">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                  Fungsi Anggaran
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-950">
                  Akuntabilitas APBD
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Memastikan setiap pos belanja anggaran daerah dan dana bagi hasil terserap secara transparan, bebas pemborosan, dan fokus pada infrastruktur dasar warga.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-300 shadow-2xs space-y-4 hover:border-stone-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center font-black">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                  Fungsi Representasi
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-950">
                  Advokasi Konstituen
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Menjaga keterhubungan erat dengan warga akar rumput melalui dialog reses terbuka, forum rembug warga, serta penyaluran bantuan sosial tepat sasaran.
              </p>
            </div>

            {/* Pilar 4 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-300 shadow-2xs space-y-4 hover:border-stone-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center font-black">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">
                  Fungsi Pengawasan
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-950">
                  Kinerja Pelayanan Publik
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Inspeksi berkala ke proyek jalan desa, puskesmas pembantu, dan saluran irigasi untuk memastikan mutu pembangunan sesuai naskah kontrak kerja.
              </p>
            </div>

          </div>
        )}

        {/* Tab 2: Penugasan Parlemen & Rekam Jejak Amanah */}
        {activeTab === 'experience' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-300 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
              <div className="w-9 h-9 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-950">
                  Penugasan Alat Kelengkapan Dewan (AKD)
                </h3>
                <p className="text-xs text-stone-500 font-sans">Rekam jejak amanah legislatif kenegaraan</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F9F8F5] border border-stone-200/80">
                <span className="w-2 h-2 rounded-full bg-stone-950 mt-2 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-950">
                    Anggota {legislativeLevel} • Periode 2024 – 2029
                  </h4>
                  <p className="text-xs text-stone-600">
                    Mewakili konstituen di Daerah Pemilihan {dapil} melalui Fraksi {party}.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F9F8F5] border border-stone-200/80">
                <span className="w-2 h-2 rounded-full bg-stone-950 mt-2 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-950">
                    Anggota {commissionName}
                  </h4>
                  <p className="text-xs text-stone-600">
                    Memimpin evaluasi berkala pelaksanaan belanja APBD sektor infrastruktur jalan logistik dan konektivitas antardesa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F9F8F5] border border-stone-200/80">
                <span className="w-2 h-2 rounded-full bg-stone-950 mt-2 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-950">
                    Anggota Badan Anggaran (Banggar)
                  </h4>
                  <p className="text-xs text-stone-600">
                    Mengawal postur alokasi dana transfer daerah, subsidi pupuk tani, dan beasiswa pendidikan vokasi anak nagari.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Pendidikan Formal */}
        {activeTab === 'education' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-300 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
              <div className="w-9 h-9 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-950">
                  Riwayat Pendidikan Formal
                </h3>
                <p className="text-xs text-stone-500 font-sans">Landasan keilmuan perumusan kebijakan publik</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F9F8F5] border border-stone-200/80">
                <span className="w-2 h-2 rounded-full bg-stone-950 mt-2 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-950">
                    Doktor (S3) Ilmu Kebijakan Publik &amp; Manajemen Tata Kelola
                  </h4>
                  <p className="text-xs text-stone-600">
                    Universitas Indonesia • Lulus dengan Predikat Pujian (Cum Laude)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F9F8F5] border border-stone-200/80">
                <span className="w-2 h-2 rounded-full bg-stone-950 mt-2 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-950">
                    Master of Science (M.Sc.) Perencanaan Pembangunan Wilayah
                  </h4>
                  <p className="text-xs text-stone-600">
                    Program Pascasarjana Terakreditasi Unggul
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-[#F9F8F5] border border-stone-200/80">
                <span className="w-2 h-2 rounded-full bg-stone-950 mt-2 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-950">
                    Sarjana Teknik (S.T. / Ir.) Rekayasa Infrastruktur Sipil
                  </h4>
                  <p className="text-xs text-stone-600">
                    Institut Teknologi Terkemuka Indonesia
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: GALERI FOTO KEGIATAN ASPIRASI (JIKA ADA)
          ────────────────────────────────────────────────────────────────────────── */}
      {member?.photoGallery && member.photoGallery.length > 0 && (
        <section className="space-y-6">
          <div className="border-b border-stone-300 pb-3 flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-stone-950 tracking-tight">
              Dokumentasi Kegiatan &amp; Aspirasi
            </h3>
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              Galeri Resmi
            </span>
          </div>
          <PortalPhotoGallery photos={member.photoGallery} memberName={officialFullName} />
        </section>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 4: CALL TO ACTION BANNER (STUDIO EDITORIAL DARK CHARCOAL)
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl sm:rounded-3xl bg-[#252422] text-white p-8 sm:p-12 lg:p-14 shadow-xl border border-stone-800">
        <div className="max-w-3xl space-y-4">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-stone-400 block">
            SALURAN ASPIRASI AKTIF
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
            Sampaikan Masukan &amp; Laporan Wilayah Langsung Kepada Dewan.
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
            Tim sekretariat dan staf ahli dewan senantiasa siap memproses pokok pikiran, telaah permasalahan daerah, dan permohonan audiensi konstituen.
          </p>
          <div className="pt-2">
            <Link
              href={getNavLinkHref('/kontak')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-stone-950 text-xs font-bold uppercase tracking-wider hover:bg-stone-200 transition-colors shadow-sm"
            >
              <span>Buka Formulir Aspirasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
