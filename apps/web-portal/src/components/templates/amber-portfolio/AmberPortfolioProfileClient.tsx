'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  GraduationCap,
  Briefcase,
  FileCheck,
  Send,
  Calendar,
  MapPin,
  Building2,
  Users,
} from 'lucide-react';

interface AmberPortfolioProfileClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function AmberPortfolioProfileClient({
  member,
  theme,
  subdomain,
}: AmberPortfolioProfileClientProps) {
  const primaryColor = theme?.primaryHexColor || '#EA580C';
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/default-avatar.png';

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B';
  const party = member?.partyAffiliation || 'Fraksi Parlemen';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I';
  const legislativeLevel = member?.legislativeLevel || 'DPRD PROVINSI';
  const commissionName = member?.commissionName || 'KOMISI I (PEMERINTAHAN & HUKUM)';

  const bio =
    theme?.bioBiography ||
    member?.bio ||
    `${officialFullName} adalah wakil rakyat yang mendedikasikan pengabdiannya untuk memperjuangkan aspirasi dan hak-hak masyarakat di ${dapil}. Mengawal kebijakan anggaran daerah, pengawasan birokrasi, dan regulasi perlindungan sosial secara transparan dan berkeadilan.`;

  return (
    <div className="py-12 sm:py-16 bg-[#0A0908] text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ROW 1: HERO OVERVIEW (PHOTO CUTOUT WITH AMBER GLOW & OFFICIAL MANDATE) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Portrait Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[3/4] rounded-3xl overflow-hidden bg-[#141210] border border-white/10 shadow-2xl flex items-end justify-center group">
              <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[70px] pointer-events-none opacity-40"
                style={{ backgroundColor: primaryColor }}
              />

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={officialFullName}
                className="w-full h-auto max-h-[92%] object-contain object-bottom filter contrast-105 select-none relative z-10"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/images/default-avatar.png')) {
                    target.src = '/images/default-avatar.png';
                  }
                }}
              />

              {/* Verified Badge */}
              <div
                className="absolute top-4 right-4 p-2.5 rounded-2xl text-white shadow-xl z-20 border border-white/20"
                style={{ backgroundColor: primaryColor }}
                title="Pejabat Publik Terverifikasi"
              >
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-400">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>Mandat Konstitusional</span>
              </div>
              <h2 className="font-bebas text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight">
                {officialFullName}
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  {legislativeLevel}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-stone-300 border border-white/10">
                  {party}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-stone-300 border border-white/10">
                  {dapil}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-sans">
              {bio}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="p-4 rounded-2xl bg-[#141210] border border-white/10">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Penugasan Komisi</span>
                <span className="font-bold text-xs sm:text-sm text-white mt-1 block">{commissionName}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#141210] border border-white/10">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Masa Jabatan</span>
                <span className="font-bold text-xs sm:text-sm text-white mt-1 block">Periode 2024 – 2029</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#141210] border border-white/10 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Status Konstituensi</span>
                <span className="font-bold text-xs sm:text-sm text-emerald-400 mt-1 block">Aktif Bertugas</span>
              </div>
            </div>
          </div>

        </div>

        {/* ROW 2: 3 PILAR KOMITMEN & FUNGSI PARLEMEN */}
        <div className="space-y-6 text-left">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Trifungsi Parlemen</span>
            <h3 className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-tight">
              Pilar Pengabdian Konstitusi
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#12100E] border border-white/10 hover:border-orange-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Fungsi Legislasi</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Menyusun dan mengawal rancangan peraturan daerah yang berpihak pada keadilan ekonomi rakyat, kemudahan usaha UMKM, dan perlindungan lingkungan hidup.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#12100E] border border-white/10 hover:border-orange-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Fungsi Anggaran (Budgeting)</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Memastikan setiap rupiah APBD teralokasi transparan untuk kebutuhan mendesak: sekolah gratis bermutu, peningkatan fasilitas puskesmas, dan jalan mantap daerah.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#12100E] border border-white/10 hover:border-orange-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Fungsi Pengawasan</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Mengawasi ketat implementasi proyek pembangunan agar bebas dari kebocoran anggaran dan tepat sasaran dinikmati langsung oleh warga akar rumput.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
