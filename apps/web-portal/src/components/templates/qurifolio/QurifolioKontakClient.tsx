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
} from 'lucide-react';

interface QurifolioKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function QurifolioKontakClient({
  member,
  theme,
  subdomain,
}: QurifolioKontakClientProps) {
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
      
      {/* ─── 1. HEADQUARTERS ADDRESS CARDS (2 KANTOR) ─── */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-[#161616] tracking-tight uppercase flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF6B00]" />
          <span>Pusat Pelayanan & Sekretariat Resmi</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Rumah Aspirasi Dapil */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-[#FF6B00] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-md bg-[#FF6B00] text-white text-[10px] font-black uppercase tracking-wider">
                  Rumah Aspirasi Rakyat
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Buka Senin - Sabtu
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#161616]">
                Pusat Advokasi & Konstituen Dapil {dapil}
              </h3>

              <div className="space-y-2 text-xs sm:text-sm text-stone-600">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                  <span>Jl. Ir. H. Juanda No. 128, Dago, Coblong, Kota Bandung, Jawa Barat 40135</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>08.30 – 16.30 WIB (Penerimaan Aspirasi Tatap Muka)</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-500">
              <span>Layanan Bebas Biaya</span>
              <span className="text-[#FF6B00] font-bold">Terbuka Untuk Warga</span>
            </div>
          </div>

          {/* Card 2: Kantor Parlemen Senayan */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-[#FF6B00] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-md bg-[#161616] text-white text-[10px] font-black uppercase tracking-wider">
                  Kantor Parlemen Pusat
                </span>
                <span className="text-xs font-bold text-[#FF6B00] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Protokoler DPR RI
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#161616]">
                Gedung Nusantara I DPR RI Jakarta
              </h3>

              <div className="space-y-2 text-xs sm:text-sm text-stone-600">
                <p className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                  <span>Ruang Kerja Anggota Lt. 14, Kompleks Parlemen MPR/DPR RI, Senayan, Jakarta Pusat 10270</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>09.00 – 17.00 WIB (Sesuai Agenda Sidang Parlemen)</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-500">
              <span>Sekretariat Fraksi</span>
              <span className="text-[#161616] font-bold">Resmi Kenegaraan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. FOUR DIRECT CHANNELS (4 SALURAN LANGSUNG) ─── */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-[#161616] tracking-tight uppercase flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF6B00]" />
          <span>Saluran Komunikasi Langsung</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Channel 1: WhatsApp */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200/90 hover:border-[#FF6B00] transition-all space-y-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-[#161616]">WhatsApp Center</h4>
              <p className="text-xs text-stone-600">
                Layanan pesan pengaduan cepat via WhatsApp resmi tim advokasi.
              </p>
            </div>
            <a
              href="https://wa.me/6281298765432"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow transition-all"
            >
              <span>Kirim Pesan WA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Channel 2: Email */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200/90 hover:border-[#FF6B00] transition-all space-y-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-[#161616]">Surel Parlemen</h4>
              <p className="text-xs text-stone-600 truncate" title={officialEmail}>
                {officialEmail}
              </p>
            </div>
            <button
              onClick={handleCopyEmail}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-[#161616] hover:bg-stone-200 text-xs font-bold uppercase tracking-wider transition-all"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#FF6B00]" />}
              <span>{copiedEmail ? 'Email Tersalin' : 'Salin Email'}</span>
            </button>
          </div>

          {/* Channel 3: Phone */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200/90 hover:border-[#FF6B00] transition-all space-y-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-[#161616] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-[#161616]">Telepon Kantor</h4>
              <p className="text-xs text-stone-600">
                {officialPhone}
              </p>
            </div>
            <button
              onClick={handleCopyPhone}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-[#161616] hover:bg-stone-200 text-xs font-bold uppercase tracking-wider transition-all"
            >
              {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#FF6B00]" />}
              <span>{copiedPhone ? 'Nomor Tersalin' : 'Salin Telepon'}</span>
            </button>
          </div>

          {/* Channel 4: Instagram */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200/90 hover:border-[#FF6B00] transition-all space-y-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center">
                <Instagram className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <h4 className="font-bold text-base text-[#161616]">Instagram Resmi</h4>
              <p className="text-xs text-stone-600 truncate">
                @{instagramUsername}
              </p>
            </div>
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#161616] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow transition-all"
            >
              <span>Buka Profil IG</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF6B00]" />
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}
