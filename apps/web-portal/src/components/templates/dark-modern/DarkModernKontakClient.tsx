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
} from 'lucide-react';

interface DarkModernKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function DarkModernKontakClient({
  member,
  theme,
  subdomain,
}: DarkModernKontakClientProps) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kantor Senayan */}
        <div className="rounded-3xl bg-[#16171b] border border-white/5 p-8 flex flex-col justify-between space-y-6 hover:border-blue-500/30 transition-all duration-300 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Sekretariat Utama Parlemen
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              Gedung Nusantara I DPR RI
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Lantai 12, Ruang 1204, Jl. Jenderal Gatot Subroto No. 1, Senayan, Jakarta Pusat 10270
                </span>
              </p>
              <p className="flex items-center gap-2.5 text-slate-400">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Senin – Jumat : 09:00 – 17:00 WIB</span>
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
              Melayani korespondensi dinas perundang-undangan, koordinasi antarlembaga kementerian, serta audiensi resmi bersama {commission}.
            </p>
          </div>

          <a
            href="https://maps.google.com/?q=DPR+RI+Senayan+Jakarta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/5 transition-all"
          >
            <span>Petunjuk Lokasi Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          </a>
        </div>

        {/* Rumah Aspirasi Dapil */}
        <div className="rounded-3xl bg-[#16171b] border border-white/5 p-8 flex flex-col justify-between space-y-6 hover:border-blue-500/30 transition-all duration-300 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Posko Konstituen Daerah
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              Rumah Aspirasi Rakyat Dapil {dapil}
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Jl. Ir. H. Juanda No. 88, Dago, Kota Bandung, Jawa Barat 40132
                </span>
              </p>
              <p className="flex items-center gap-2.5 text-slate-400">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Setiap Hari Kerja : 08:30 – 16:30 WIB</span>
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
              Pusat advokasi warga, penerimaan pengaduan layanan publik daerah, serta koordinasi reses dan temu konstituen {officialFullName}.
            </p>
          </div>

          <a
            href="https://maps.google.com/?q=Bandung+Jawa+Barat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/5 transition-all"
          >
            <span>Petunjuk Lokasi Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          </a>
        </div>
      </div>

      {/* ─── 2. DIRECT COMMUNICATION CHANNELS ─── */}
      <div className="rounded-3xl bg-[#0e0f11] border border-white/5 p-8 sm:p-10 space-y-8">
        <div className="border-b border-white/5 pb-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">
            / SALURAN KOMUNIKASI LANGSUNG
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
            Kanal Korespondensi &amp; Layanan Cepat
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* WhatsApp Hotline */}
          <div className="p-6 rounded-2xl bg-[#16171b] border border-white/5 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white block">Hotline WhatsApp</span>
              <p className="text-[11px] text-slate-400">
                Pesan aduan dan aspirasi cepat ke staf tim sahabat.
              </p>
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Chat WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Email Resmi */}
          <div className="p-6 rounded-2xl bg-[#16171b] border border-white/5 flex flex-col justify-between space-y-4 hover:border-blue-500/30 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white block">Email Resmi</span>
              <p className="text-[11px] text-slate-400 truncate" title={officialEmail}>
                {officialEmail}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(officialEmail, 'email')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/5 transition-all cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? 'Email Disalin!' : 'Salin Email'}</span>
            </button>
          </div>

          {/* Telepon Sekretariat */}
          <div className="p-6 rounded-2xl bg-[#16171b] border border-white/5 flex flex-col justify-between space-y-4 hover:border-blue-500/30 transition-colors">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white block">Hotline Telepon</span>
              <p className="text-[11px] text-slate-400 font-mono">
                {whatsappNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(whatsappNumber, 'phone')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/5 transition-all cursor-pointer"
            >
              {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPhone ? 'Nomor Disalin!' : 'Salin Nomor'}</span>
            </button>
          </div>

          {/* Instagram Resmi */}
          <div className="p-6 rounded-2xl bg-[#16171b] border border-white/5 flex flex-col justify-between space-y-4 hover:border-pink-500/30 transition-colors">
            <div className="space-y-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                style={{
                  background:
                    'linear-gradient(135deg, #833AB4 0%, #C13584 50%, #F77737 100%)',
                }}
              >
                <Instagram className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white block">Instagram</span>
              <p className="text-[11px] text-slate-400 truncate">
                @{instagramUsername}
              </p>
            </div>
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer"
              style={{
                background:
                  'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <span>Kunjungi Profil</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
