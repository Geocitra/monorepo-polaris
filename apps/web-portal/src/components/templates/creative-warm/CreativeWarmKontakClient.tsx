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
  ShieldCheck,
} from 'lucide-react';

interface CreativeWarmKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CreativeWarmKontakClient({
  member,
  theme,
  subdomain,
}: CreativeWarmKontakClientProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Dr. H. Ahmad Fauzi, M.Si.';
  const officialEmail = `aspirasi@${subdomain || 'dewan'}.polaris.id`;
  const officialPhone = '0812-9876-5432';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'ahmadfauzi';

  const handleCopyEmail = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(officialEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyPhone = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(officialPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const whatsappLink = `https://wa.me/6281298765432?text=${encodeURIComponent(
    `Salam hangat, saya warga Daerah Pemilihan ${
      member?.dapilName || 'Jawa Barat'
    } ingin menyampaikan aspirasi/konsultasi kepada Bapak ${officialFullName}.`
  )}`;

  return (
    <div className="space-y-14">
      
      {/* ─── 1. TOP INTRO BANNER ─── */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#1A382B] text-white space-y-4 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500 text-stone-950 font-mono text-xs font-bold uppercase tracking-wider">
            <span>[ JALUR KOORDINASI &amp; ASPIRASI WARGA ]</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-white">
            Pintu Komunikasi Selalu Terbuka Bagi Warga
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
            Kami siap menerima pengaduan, konsultasi program kerakyatan, dan permohonan audiensi masyarakat. Silakan gunakan saluran resmi di bawah ini.
          </p>
        </div>
      </div>

      {/* ─── 2. TWO HEADQUARTERS CARDS ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Kantor &amp; Posko Layanan Resmi
          </h3>
          <span className="text-xs font-mono text-stone-400">
            2 Lokasi Pelayanan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Headquarters 1: Senayan Jakarta */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-amber-500/80 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-md text-[10.5px] font-mono font-bold uppercase tracking-wider bg-stone-100 text-stone-800 border border-stone-200">
                  [ KANTOR PARLEMEN PUSAT ]
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Operasional
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                  Gedung DPR RI Senayan Jakarta
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                  Kompleks Parlemen Republik Indonesia, Gedung Nusantara I Lantai 12, Jl. Jenderal Gatot Subroto, Senayan, Jakarta Pusat 10270.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-600 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Senin – Jumat: 08.30 – 17.00 WIB</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sekretariat Komisi &amp; Ruang Fraksi</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=DPR+RI+Senayan+Jakarta"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl border border-stone-300 hover:border-stone-900 text-stone-800 hover:text-stone-950 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 bg-stone-50 hover:bg-stone-100 cursor-pointer"
              >
                <span>Buka Petunjuk Arah Peta</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Headquarters 2: Rumah Aspirasi Dapil */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-amber-500/80 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-md text-[10.5px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                  [ RUMAH ASPIRASI RAKYAT DAPIL ]
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Posko Buka
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                  Posko Konstituen Dapil {member?.dapilName || 'Jawa Barat I'}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                  Jl. Pelajar Pejuang 45 No. 88, Kota Bandung, Jawa Barat 40263 (Pusat Advokasi Kerakyatan &amp; Layanan Pengaduan Warga).
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-600 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Senin – Sabtu: 09.00 – 18.00 WIB</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Pusat Audiensi Komunitas &amp; Konstituen</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=Bandung+Jawa+Barat"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl border border-stone-300 hover:border-stone-900 text-stone-800 hover:text-stone-950 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 bg-stone-50 hover:bg-stone-100 cursor-pointer"
              >
                <span>Buka Petunjuk Arah Posko</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ─── 3. 4 DIRECT COMMUNICATION CHANNELS ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Saluran Komunikasi Langsung
          </h3>
          <span className="text-xs font-mono text-stone-400">
            Respon Cepat
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          
          {/* Channel 1: WhatsApp Hotline */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-500/80 transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-emerald-700" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900">
                WhatsApp Hotline
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed font-normal">
                Sampaikan aspirasi cepat melalui pesan WhatsApp resmi staf dewan.
              </p>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Chat WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Channel 2: Official Email */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-500/80 transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Mail className="w-5 h-5 text-amber-800" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900">
                Surat Elektronik
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed font-normal truncate" title={officialEmail}>
                {officialEmail}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="py-2.5 px-4 rounded-xl border border-stone-300 hover:border-stone-900 text-stone-800 hover:text-stone-950 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 bg-stone-50 hover:bg-stone-100 cursor-pointer"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Email</span>
                </>
              )}
            </button>
          </div>

          {/* Channel 3: Telephone Line */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-500/80 transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
                <Phone className="w-5 h-5 text-stone-700" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900">
                Saluran Telepon
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed font-normal">
                {officialPhone} (Senin–Jumat)
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyPhone}
              className="py-2.5 px-4 rounded-xl border border-stone-300 hover:border-stone-900 text-stone-800 hover:text-stone-950 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 bg-stone-50 hover:bg-stone-100 cursor-pointer"
            >
              {copiedPhone ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin No Telp</span>
                </>
              )}
            </button>
          </div>

          {/* Channel 4: Instagram */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-500/80 transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <Instagram className="w-5 h-5 text-purple-700" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900">
                Instagram Resmi
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed font-normal">
                @{instagramUsername}
              </p>
            </div>

            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 shadow-xs hover:opacity-95"
              style={{
                background: 'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <span>Buka Profil IG</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
