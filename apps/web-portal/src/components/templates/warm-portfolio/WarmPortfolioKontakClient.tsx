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

interface WarmPortfolioKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function WarmPortfolioKontakClient({
  member,
  theme,
  subdomain,
}: WarmPortfolioKontakClientProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Dr. H. Ahmad Fauzi, M.Si.';
  const officialEmail = `aspirasi@${subdomain || 'dewan'}.polaris.id`;
  const officialPhone = '0812-9876-5432';
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
    <div className="space-y-12">
      
      {/* ─── 1. HEADQUARTERS ADDRESS CARDS (CHAMFERED CORNERS) ─── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-950">
            Pusat Pelayanan & Sekretariat Resmi
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Rumah Aspirasi Dapil */}
          <div
            className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-[#F59E0B] transition-all space-y-4 flex flex-col justify-between"
            style={{
              clipPath: 'polygon(20px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 20px)',
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200/70">
                  Rumah Aspirasi Rakyat
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Buka Senin - Sabtu
                </span>
              </div>

              <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                Pusat Advokasi & Konstituen Dapil {dapil}
              </h3>

              <div className="space-y-2 text-xs sm:text-sm text-stone-600">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
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
              <span className="text-[#F59E0B] font-bold">Terbuka Untuk Umum</span>
            </div>
          </div>

          {/* Card 2: Kantor Parlemen Senayan (Dark Espresso) */}
          <div
            className="p-6 sm:p-8 rounded-3xl bg-[#181311] text-white border border-stone-800 shadow-xl space-y-4 flex flex-col justify-between"
            style={{
              clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#F59E0B] text-stone-950 text-xs font-black">
                  Kantor Parlemen Pusat
                </span>
                <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                  Protokoler DPR RI
                </span>
              </div>

              <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-100">
                Gedung Nusantara I DPR RI Jakarta
              </h3>

              <div className="space-y-2 text-xs sm:text-sm text-stone-400 font-light">
                <p className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <span>Ruang Kerja Anggota Lt. 14, Kompleks Parlemen MPR/DPR RI, Senayan, Jakarta Pusat 10270</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>09.00 – 17.00 WIB (Sesuai Agenda Sidang Parlemen)</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-xs font-semibold text-stone-400">
              <span>Sekretariat Fraksi</span>
              <span className="text-[#F59E0B] font-bold">Resmi Kenegaraan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. FOUR DIRECT CITIZEN CHANNELS ─── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-950">
            Saluran Komunikasi Langsung
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Channel 1: WhatsApp Hotline */}
          <div
            className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-[#F59E0B] transition-all space-y-3 flex flex-col justify-between"
            style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900">
                WhatsApp Call Center
              </h4>
              <p className="text-xs text-stone-500">
                Layanan pengaduan cepat via pesan WhatsApp terverifikasi.
              </p>
            </div>
            <a
              href="https://wa.me/6281298765432"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all"
            >
              <span>Kirim Pesan WA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Channel 2: Official Email */}
          <div
            className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-[#F59E0B] transition-all space-y-3 flex flex-col justify-between"
            style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900">
                Surel Resmi Parlemen
              </h4>
              <p className="text-xs text-stone-500 truncate" title={officialEmail}>
                {officialEmail}
              </p>
            </div>
            <button
              onClick={handleCopyEmail}
              className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#181311] hover:bg-stone-800 text-white font-bold text-xs shadow transition-all"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#F59E0B]" />}
              <span>{copiedEmail ? 'Email Tersalin' : 'Salin Alamat Email'}</span>
            </button>
          </div>

          {/* Channel 3: Telephone Hotline */}
          <div
            className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-[#F59E0B] transition-all space-y-3 flex flex-col justify-between"
            style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900">
                Hotline Suara Warga
              </h4>
              <p className="text-xs text-stone-500 font-mono">
                {officialPhone}
              </p>
            </div>
            <button
              onClick={handleCopyPhone}
              className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#181311] hover:bg-stone-800 text-white font-bold text-xs shadow transition-all"
            >
              {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#F59E0B]" />}
              <span>{copiedPhone ? 'Nomor Tersalin' : 'Salin Nomor Telepon'}</span>
            </button>
          </div>

          {/* Channel 4: Instagram DM */}
          <div
            className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:border-[#F59E0B] transition-all space-y-3 flex flex-col justify-between"
            style={{ clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)' }}
          >
            <div className="space-y-2">
              <div
                className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow"
                style={{
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                }}
              >
                <Instagram className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-stone-900">
                Instagram Resmi
              </h4>
              <p className="text-xs text-stone-500">
                @{instagramUsername}
              </p>
            </div>
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-white font-bold text-xs shadow transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              }}
            >
              <span>Kirim DM Instagram</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* ─── 3. TRANSPARENCY COMMITMENT STRIP ─── */}
      <div
        className="p-8 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{
          clipPath: 'polygon(16px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 16px)',
        }}
      >
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#F59E0B]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Komitmen Bebas Gratifikasi & Akses Tanpa Pungli</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
            Setiap aduan dan aspirasi dari masyarakat diproses secara profesional tanpa dipungut biaya apapun. Kerahasiaan identitas pelapor dijamin secara penuh.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F2] border border-stone-200 text-stone-800 text-xs font-bold shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
          <span>Pengawalan Konstituen 100% Terbuka</span>
        </div>
      </div>

    </div>
  );
}
