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
  Terminal,
  Cpu,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface NeonGlowKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function NeonGlowKontakClient({
  member,
  theme,
  subdomain,
}: NeonGlowKontakClientProps) {
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
    <div className="space-y-12">
      {/* ─── 1. TWO MAIN HEADQUARTERS CARDS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kantor Senayan */}
        <div className="rounded-3xl bg-[#0C1022] border border-purple-900/40 p-8 sm:p-10 flex flex-col justify-between space-y-8 hover:border-purple-500/50 transition-all duration-300 shadow-xl shadow-purple-950/20 group relative overflow-hidden">
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all" />

          <div className="space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 shadow-sm shadow-purple-500/20">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                SEKRETARIAT UTAMA PARLEMEN
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 tracking-wider">ONLINE</span>
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:text-purple-200 transition-colors">
              Gedung Nusantara I DPR RI
            </h3>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-300">
              <p className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Lantai 12, Ruang 1204, Jl. Jenderal Gatot Subroto No. 1, Senayan, Jakarta Pusat 10270
                </span>
              </p>
              <p className="flex items-center gap-3 text-slate-400 font-mono text-xs">
                <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Senin – Jumat : 09:00 – 17:00 WIB</span>
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-3 border-t border-purple-900/30">
              Melayani korespondensi dinas perundang-undangan, koordinasi antarlembaga kementerian, serta audiensi kenegaraan resmi bersama {commission}.
            </p>
          </div>

          <a
            href="https://maps.google.com/?q=DPR+RI+Senayan+Jakarta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-white font-bold text-xs font-mono border border-purple-500/40 hover:border-purple-400 transition-all shadow-md shadow-purple-900/20"
          >
            <span>[NAVIGASI_GOOGLE_MAPS]</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </a>
        </div>

        {/* Rumah Aspirasi Dapil */}
        <div className="rounded-3xl bg-[#0C1022] border border-purple-900/40 p-8 sm:p-10 flex flex-col justify-between space-y-8 hover:border-cyan-500/50 transition-all duration-300 shadow-xl shadow-cyan-950/20 group relative overflow-hidden">
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-600/20 transition-all" />

          <div className="space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm shadow-cyan-500/20">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                POSKO KONSTITUEN DAERAH
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 tracking-wider">AKTIF</span>
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:text-cyan-200 transition-colors">
              Rumah Aspirasi Rakyat ({dapil})
            </h3>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-300">
              <p className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Jl. Ir. H. Juanda No. 88, Dago, Coblong, Kota Bandung, Jawa Barat 40132
                </span>
              </p>
              <p className="flex items-center gap-3 text-slate-400 font-mono text-xs">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Senin – Sabtu : 08:30 – 18:00 WIB</span>
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-3 border-t border-purple-900/30">
              Pusat penyerapan aspirasi langsung masyarakat daerah pemilihan, pelaporan kendala program bantuan sosial, advokasi ketenagakerjaan, serta konsultasi konstituen.
            </p>
          </div>

          <a
            href="https://maps.google.com/?q=Bandung+Jawa+Barat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-600/15 hover:bg-cyan-600/25 text-white font-bold text-xs font-mono border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-md shadow-cyan-900/20"
          >
            <span>[NAVIGASI_GOOGLE_MAPS]</span>
            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
          </a>
        </div>
      </div>

      {/* ─── 2. EMPAT KANAL KOMUNIKASI LANGSUNG (GRID 4 KOLOM) ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>DIRECT COMMUNICATION CHANNELS</span>
          </div>
          <span className="text-[11px] font-mono text-purple-400">STATUS: RESPONSIVE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. WhatsApp Hotline */}
          <div className="rounded-2xl bg-[#0C1022] border border-purple-900/40 p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all shadow-lg group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-md shadow-emerald-950/40">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Hotline WhatsApp
                </p>
                <p className="text-base font-bold text-white tracking-tight mt-0.5">
                  {whatsappNumber}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Layanan pesan cepat konstituen & pengaduan darurat dapil.
              </p>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs font-mono transition-all border border-emerald-500/30"
            >
              <span>[CHAT_WHATSAPP]</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 2. Email Resmi */}
          <div className="rounded-2xl bg-[#0C1022] border border-purple-900/40 p-6 flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition-all shadow-lg group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-md shadow-purple-950/40">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Email Korespondensi
                </p>
                <p className="text-xs sm:text-sm font-bold text-white tracking-tight mt-0.5 truncate" title={officialEmail}>
                  {officialEmail}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Naskah akademik, proposal aspirasi kelompok warga, & undangan.
              </p>
            </div>

            <button
              onClick={() => handleCopy(officialEmail, 'email')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-600/30 text-purple-300 font-bold text-xs font-mono border border-purple-500/30 transition-all"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">[EMAIL_TERSALIN]</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>[SALIN_EMAIL]</span>
                </>
              )}
            </button>
          </div>

          {/* 3. Telepon Kantor */}
          <div className="rounded-2xl bg-[#0C1022] border border-purple-900/40 p-6 flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all shadow-lg group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-md shadow-cyan-950/40">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Telepon Kantor
                </p>
                <p className="text-base font-bold text-white tracking-tight mt-0.5">
                  {officialPhone}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Panggilan operasional pada jam kerja kantor sekretariat dewan.
              </p>
            </div>

            <button
              onClick={() => handleCopy(officialPhone, 'phone')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-600/30 text-cyan-300 font-bold text-xs font-mono border border-cyan-500/30 transition-all"
            >
              {copiedPhone ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">[NOMOR_TERSALIN]</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                  <span>[SALIN_NOMOR]</span>
                </>
              )}
            </button>
          </div>

          {/* 4. Instagram Resmi */}
          <div className="rounded-2xl bg-[#0C1022] border border-purple-900/40 p-6 flex flex-col justify-between space-y-4 hover:border-pink-500/50 transition-all shadow-lg group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center shadow-md shadow-pink-950/40">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Instagram Resmi
                </p>
                <p className="text-base font-bold text-white tracking-tight mt-0.5">
                  @{instagramUsername}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Dokumentasi visual kegiatan parlemen harian & interaksi digital.
              </p>
            </div>

            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-600/20 hover:from-pink-500/30 hover:to-purple-600/30 text-pink-300 font-bold text-xs font-mono border border-pink-500/30 transition-all"
            >
              <span>[BUKA_INSTAGRAM]</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
