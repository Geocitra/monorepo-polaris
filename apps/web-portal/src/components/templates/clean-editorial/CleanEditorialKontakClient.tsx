'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  Mail,
  Phone,
  Clock,
  Instagram,
  ExternalLink,
  Copy,
  Check,
  MessageCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface CleanEditorialKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CleanEditorialKontakClient({
  member,
  theme,
  subdomain,
}: CleanEditorialKontakClientProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

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
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'ahmadfauzi';

  const officialEmail = `aspirasi@${subdomain || 'dewan'}.polaris.id`;
  const officialPhone = '(021) 5715-999';
  const whatsappNumber = '0812-9876-5432';
  const whatsappLink = `https://wa.me/6281298765432?text=${encodeURIComponent(
    `Halo Tim Staf Ahli ${officialFullName}, saya ingin menyampaikan aspirasi masyarakat daerah pemilihan.`
  )}`;

  const handleCopy = (text: string, type: 'email' | 'phone') => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    }
  };

  return (
    <div className="space-y-12 py-6 sm:py-10">
      {/* ─── 1. TWO MAIN HEADQUARTERS CARDS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kantor Senayan */}
        <div className="rounded-3xl bg-[#F8F9FD] border border-slate-200/90 p-8 sm:p-10 flex flex-col justify-between space-y-8 hover:border-purple-300 transition-all duration-300 shadow-2xs group">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-white text-slate-800 border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-[#6366F1]" />
                SEKRETARIAT UTAMA PARLEMEN
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-600 font-bold tracking-wider">AKTIF</span>
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-editorial-serif font-black text-slate-900 tracking-tight group-hover:text-[#6366F1] transition-colors">
              Gedung Nusantara I DPR RI
            </h3>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-600">
              <p className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Lantai 12, Ruang 1204, Jl. Jenderal Gatot Subroto No. 1, Senayan, Jakarta Pusat 10270
                </span>
              </p>
              <p className="flex items-center gap-3 text-slate-500 font-mono text-xs">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Senin – Jumat : 09:00 – 17:00 WIB</span>
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed pt-3 border-t border-slate-200 font-normal">
              Melayani korespondensi dinas perundang-undangan, koordinasi antarlembaga kementerian, serta audiensi kenegaraan resmi bersama {commission}.
            </p>
          </div>

          <a
            href="https://maps.google.com/?q=DPR+RI+Senayan+Jakarta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-950 text-slate-900 hover:text-white font-bold text-xs uppercase tracking-wider border border-slate-200 transition-all shadow-2xs group/btn"
          >
            <span>PETUNJUK GOOGLE MAPS</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#6366F1] group-hover/btn:text-white" />
          </a>
        </div>

        {/* Rumah Aspirasi Dapil */}
        <div className="rounded-3xl bg-[#F8F9FD] border border-slate-200/90 p-8 sm:p-10 flex flex-col justify-between space-y-8 hover:border-purple-300 transition-all duration-300 shadow-2xs group">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-white text-slate-800 border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-[#6366F1]" />
                POSKO KONSTITUEN DAERAH
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-600 font-bold tracking-wider">TERBUKA</span>
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-editorial-serif font-black text-slate-900 tracking-tight group-hover:text-[#6366F1] transition-colors">
              Rumah Aspirasi Rakyat ({dapil})
            </h3>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-600">
              <p className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Jl. Ir. H. Juanda No. 88, Dago, Coblong, Kota Bandung, Jawa Barat 40132
                </span>
              </p>
              <p className="flex items-center gap-3 text-slate-500 font-mono text-xs">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Senin – Sabtu : 08:30 – 18:00 WIB</span>
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed pt-3 border-t border-slate-200 font-normal">
              Pusat penyerapan aspirasi langsung masyarakat daerah pemilihan, pelaporan kendala program bantuan sosial, advokasi ketenagakerjaan, serta konsultasi konstituen.
            </p>
          </div>

          <a
            href="https://maps.google.com/?q=Bandung+Jawa+Barat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-950 text-slate-900 hover:text-white font-bold text-xs uppercase tracking-wider border border-slate-200 transition-all shadow-2xs group/btn"
          >
            <span>PETUNJUK GOOGLE MAPS</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#6366F1] group-hover/btn:text-white" />
          </a>
        </div>
      </div>

      {/* ─── 2. EMPAT KANAL KOMUNIKASI LANGSUNG (GRID 4 KOLOM) ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
            <BookOpen className="w-4 h-4 text-[#6366F1]" />
            <span>DIRECT COMMUNICATION CHANNELS</span>
          </div>
          <span className="text-[11px] font-mono text-[#6366F1] font-bold">STATUS: RESPONSIVE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. WhatsApp Hotline */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-6 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all shadow-2xs group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Hotline WhatsApp
                </p>
                <p className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                  {whatsappNumber}
                </p>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Layanan pesan cepat konstituen &amp; pengaduan darurat dapil.
              </p>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-emerald-200 group-hover:border-emerald-600"
            >
              <span>CHAT WHATSAPP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 2. Email Resmi */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-6 flex flex-col justify-between space-y-4 hover:border-purple-300 transition-all shadow-2xs group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6366F1] flex items-center justify-center shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Email Korespondensi
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight mt-0.5 truncate" title={officialEmail}>
                  {officialEmail}
                </p>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Naskah akademik, proposal aspirasi kelompok warga, &amp; undangan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(officialEmail, 'email')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8F9FD] hover:bg-slate-950 text-slate-700 hover:text-white font-bold text-xs uppercase tracking-wider border border-slate-200 transition-all cursor-pointer"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">EMAIL TERSALIN</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>SALIN EMAIL</span>
                </>
              )}
            </button>
          </div>

          {/* 3. Telepon Kantor */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-6 flex flex-col justify-between space-y-4 hover:border-purple-300 transition-all shadow-2xs group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6366F1] flex items-center justify-center shadow-xs">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Telepon Kantor
                </p>
                <p className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                  {officialPhone}
                </p>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Panggilan operasional pada jam kerja kantor sekretariat dewan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(officialPhone, 'phone')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F8F9FD] hover:bg-slate-950 text-slate-700 hover:text-white font-bold text-xs uppercase tracking-wider border border-slate-200 transition-all cursor-pointer"
            >
              {copiedPhone ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">NOMOR TERSALIN</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>SALIN NOMOR</span>
                </>
              )}
            </button>
          </div>

          {/* 4. Instagram Resmi */}
          <div className="rounded-2xl bg-white border border-slate-200/90 p-6 flex flex-col justify-between space-y-4 hover:border-pink-300 transition-all shadow-2xs group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-50 to-purple-50 text-pink-600 flex items-center justify-center shadow-xs border border-pink-100">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Instagram Resmi
                </p>
                <p className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                  @{instagramUsername}
                </p>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Dokumentasi visual kegiatan parlemen harian &amp; interaksi publik.
              </p>
            </div>

            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 hover:from-slate-950 hover:to-slate-950 text-pink-700 hover:text-white font-bold text-xs uppercase tracking-wider border border-pink-200 transition-all"
            >
              <span>BUKA INSTAGRAM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
