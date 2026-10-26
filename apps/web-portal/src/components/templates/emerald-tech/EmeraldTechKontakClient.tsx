'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  Mail,
  Phone,
  Clock,
  Instagram,
  Copy,
  Check,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface EmeraldTechKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function EmeraldTechKontakClient({
  member,
  theme,
  subdomain,
}: EmeraldTechKontakClientProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Dr. H. Ahmad Fauzi, M.Si.';
  const officialEmail = `aspirasi@${subdomain || 'ahmadfauzi'}.polaris.id`;
  const officialPhone = '+62 812-9876-5432';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
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

  return (
    <div className="space-y-16">
      
      {/* ─── 1. HEADQUARTERS ADDRESS CARDS ─── */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#00DF82]" />
          <span>Pusat Pelayanan & Sekretariat Resmi</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Rumah Aspirasi Dapil */}
          <div className="p-6 sm:p-8 rounded-xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xs bg-[#00DF82] text-black text-[10px] font-black uppercase tracking-wider">
                  Rumah Aspirasi Rakyat
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Buka Senin - Sabtu
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white">
                Pusat Advokasi & Konstituen Dapil {dapil}
              </h3>

              <div className="space-y-2 text-xs sm:text-sm text-stone-400">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#00DF82] shrink-0 mt-0.5" />
                  <span>Jl. Ir. H. Juanda No. 128, Dago, Coblong, Kota Bandung, Jawa Barat 40135</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>08.30 – 16.30 WIB (Penerimaan Aspirasi Tatap Muka)</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold text-stone-400">
              <span>Layanan Bebas Biaya</span>
              <span className="text-[#00DF82] font-bold">Terbuka Untuk Warga</span>
            </div>
          </div>

          {/* Card 2: Kantor Parlemen Senayan */}
          <div className="p-6 sm:p-8 rounded-xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xs bg-white/[0.1] text-white text-[10px] font-black uppercase tracking-wider border border-white/[0.1]">
                  Kantor Parlemen Pusat
                </span>
                <span className="text-xs font-bold text-[#00DF82] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Protokoler DPR RI
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white">
                Gedung Nusantara I DPR RI Jakarta
              </h3>

              <div className="space-y-2 text-xs sm:text-sm text-stone-400">
                <p className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-[#00DF82] shrink-0 mt-0.5" />
                  <span>Ruang Kerja Anggota Lt. 14, Kompleks Parlemen MPR/DPR RI, Senayan, Jakarta Pusat 10270</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>09.00 – 17.00 WIB (Sesuai Agenda Sidang Parlemen)</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold text-stone-400">
              <span>Sekretariat Fraksi</span>
              <span className="text-[#00DF82] font-bold">Resmi Kenegaraan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. FOUR DIRECT CHANNELS ─── */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#00DF82]" />
          <span>Saluran Komunikasi Langsung</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Channel 1: WhatsApp */}
          <div className="p-6 rounded-xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">WhatsApp Center</h4>
              <p className="text-xs text-stone-400">
                Layanan pesan pengaduan cepat via WhatsApp resmi.
              </p>
            </div>
            <a
              href="https://wa.me/6281298765432"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow transition-all"
            >
              <span>Kirim Pesan WA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Channel 2: Email */}
          <div className="p-6 rounded-xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-black border border-white/[0.1] text-[#00DF82] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">Surel Parlemen</h4>
              <p className="text-xs text-stone-400 truncate" title={officialEmail}>
                {officialEmail}
              </p>
            </div>
            <button
              onClick={handleCopyEmail}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xs bg-black border border-white/[0.1] text-white hover:border-[#00DF82] text-xs font-bold uppercase tracking-wider transition-all"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00DF82]" />}
              <span>{copiedEmail ? 'Email Tersalin' : 'Salin Email'}</span>
            </button>
          </div>

          {/* Channel 3: Phone */}
          <div className="p-6 rounded-xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-black border border-white/[0.1] text-[#00DF82] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">Hotline Warga</h4>
              <p className="text-xs text-stone-400 font-mono">
                {officialPhone}
              </p>
            </div>
            <button
              onClick={handleCopyPhone}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xs bg-black border border-white/[0.1] text-white hover:border-[#00DF82] text-xs font-bold uppercase tracking-wider transition-all"
            >
              {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00DF82]" />}
              <span>{copiedPhone ? 'Nomor Tersalin' : 'Salin Telepon'}</span>
            </button>
          </div>

          {/* Channel 4: Instagram */}
          <div className="p-6 rounded-xl bg-[#161616] border border-white/[0.08] hover:border-[#00DF82] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div
                className="w-10 h-10 rounded-lg text-white flex items-center justify-center shadow"
                style={{
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                }}
              >
                <Instagram className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-white">Instagram Resmi</h4>
              <p className="text-xs text-stone-400">
                @{instagramUsername}
              </p>
            </div>
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xs text-white font-bold text-xs uppercase tracking-wider shadow transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              }}
            >
              <span>Buka Instagram</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* ─── 3. TRANSPARENCY COMMITMENT STRIP ─── */}
      <div className="p-8 rounded-xl bg-[#161616] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00DF82]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Komitmen Bebas Gratifikasi & Pelayanan 100% Terbuka</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xl">
            Setiap aduan dan aspirasi dari masyarakat diproses secara profesional tanpa dipungut biaya apapun. Kerahasiaan identitas pelapor dijamin secara penuh.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xs bg-black border border-white/[0.1] text-white text-xs font-bold uppercase tracking-wider shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#00DF82]" />
          <span>Pengawalan Aspirasi Parlemen</span>
        </div>
      </div>

    </div>
  );
}
