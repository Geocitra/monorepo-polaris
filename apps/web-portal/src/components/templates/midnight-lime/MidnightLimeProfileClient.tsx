'use client';

import React from 'react';
import {
  ShieldCheck,
  Scale,
  Activity,
  Landmark,
  Briefcase,
  GraduationCap,
  Building,
  HeartHandshake,
  CheckCircle2,
  Calendar,
  MapPin,
} from 'lucide-react';

interface MidnightLimeProfileClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function MidnightLimeProfileClient({
  member,
  theme,
  subdomain,
}: MidnightLimeProfileClientProps) {
  const primaryColor = theme?.primaryHexColor || '#D4F63D';
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
    `${officialFullName} mendedikasikan pengabdian penuh untuk memperjuangkan keadilan sosial, transparansi anggaran APBD, dan penguatan layanan publik bagi masyarakat di ${dapil}.`;

  return (
    <div className="py-12 sm:py-16 bg-[#0C111F] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ROW 1: PROFILE SUMMARY WITH CUTOUT & GLOW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[3/4] rounded-3xl overflow-hidden bg-[#131B2D] border border-white/10 shadow-2xl flex items-end justify-center group">
              <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[70px] pointer-events-none opacity-30"
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

              <div
                className="absolute top-4 right-4 p-2.5 rounded-xl text-black shadow-xl z-20"
                style={{ backgroundColor: primaryColor }}
                title="Pejabat Publik Terverifikasi"
              >
                <ShieldCheck className="w-5 h-5 text-black" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4F63D]">
                Mandat Konstitusi Resmi
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white font-sans">
                {officialFullName}
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#D4F63D]/15 text-[#D4F63D] border border-[#D4F63D]/30">
                  {legislativeLevel}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {party}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {dapil}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
              {bio}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="p-4 rounded-2xl bg-[#131B2D] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Komisi Dewan</span>
                <span className="font-bold text-xs sm:text-sm text-white mt-1 block">{commissionName}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#131B2D] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Periode Tugas</span>
                <span className="font-bold text-xs sm:text-sm text-white mt-1 block">2024 – 2029</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#131B2D] border border-white/5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Status Mandat</span>
                <span className="font-bold text-xs sm:text-sm text-[#D4F63D] mt-1 block">Aktif Bertugas</span>
              </div>
            </div>
          </div>

        </div>

        {/* ROW 2: TRIFUNGSI PARLEMEN */}
        <div className="space-y-6 text-left">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4F63D]">Trifungsi Parlemen</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Pilar Pengabdian Legislatif
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#131B2D] border border-white/5 hover:border-[#D4F63D]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4F63D]/20 text-[#D4F63D] flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Fungsi Legislasi</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Memprakarsai dan mengkaji regulasi perda demi kepastian hukum, transparansi berusaha bagi UMKM, dan jaminan perlindungan sosial warga.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#131B2D] border border-white/5 hover:border-[#D4F63D]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4F63D]/20 text-[#D4F63D] flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Fungsi Penganggaran (Budgeting)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Memastikan pos belanja APBD berpihak pada kebutuhan pokok masyarakat: sekolah gratis berkualitas, puskesmas 24 jam, dan jalan desa mantap.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#131B2D] border border-white/5 hover:border-[#D4F63D]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4F63D]/20 text-[#D4F63D] flex items-center justify-center font-bold">
                <Landmark className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Fungsi Pengawasan</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mengawasi ketepatan realisasi program dinas agar bebas dari kebocoran anggaran dan langsung dirasakan manfaatnya oleh konstituen.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
