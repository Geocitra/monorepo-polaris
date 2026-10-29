'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  Mail,
  Instagram,
  Send,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  User,
  Phone,
  MapPin,
} from 'lucide-react';
import { PortalTemplateId } from '@polaris/shared-types';

interface KontakPageClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function KontakPageClient({ member, theme, subdomain }: KontakPageClientProps) {
  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Anggota Dewan';
  const party = member?.partyAffiliation || 'Fraksi Parlemen';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || '';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.socialMedia?.instagram?.replace(/^@/, '') ||
    '';
  const officialEmail =
    member?.email || (subdomain ? `sekretariat@${subdomain}.polaris.id` : 'sekretariat@polaris.id');

  // Format WhatsApp Number (Standar Internasional 62...)
  const rawDigits = member?.phoneNumber?.replace(/\D/g, '') || '';
  const waNumber = rawDigits.startsWith('0')
    ? `62${rawDigits.slice(1)}`
    : rawDigits.startsWith('62')
    ? rawDigits
    : rawDigits
    ? `62${rawDigits}`
    : '';

  const formattedPhoneNumber = rawDigits
    ? rawDigits.startsWith('0')
      ? `+62 ${rawDigits.slice(1, 4)}-${rawDigits.slice(4, 8)}-${rawDigits.slice(8)}`
      : `+${rawDigits}`
    : 'Hotline Resmi';

  const waHotlineLink = waNumber
    ? `https://wa.me/${waNumber}?text=Halo%20Sekretariat%20Dewan%20${encodeURIComponent(officialFullName)},%20saya%20ingin%20berkomunikasi%20terkait%20agenda%20dan%20informasi%20resmi.`
    : `https://wa.me/?text=Halo%20Sekretariat%20Dewan%20${encodeURIComponent(officialFullName)},%20saya%20ingin%20berkomunikasi%20terkait%20agenda%20dan%20informasi%20resmi.`;

  // Deteksi tema gelap (POLARIS Apex / Platinum Slate, Dark Modern, Neon Glow, dsb)
  const templateId = theme?.layoutTemplateId || '';
  const isDark = [
    PortalTemplateId.PLATINUM_SLATE,
    'platinum-slate',
    PortalTemplateId.DARK_MODERN,
    'dark-modern',
    PortalTemplateId.NEON_GLOW,
    'neon-glow',
    PortalTemplateId.BOLD_TYPOGRAPHY,
    'bold-typography',
    PortalTemplateId.MIDNIGHT_LIME,
    'midnight-lime',
    PortalTemplateId.MIDNIGHT_GOLD,
    'midnight-gold',
    PortalTemplateId.EMERALD_TECH,
    'emerald-tech',
    PortalTemplateId.CRIMSON_NOIR,
    'crimson-noir',
    PortalTemplateId.FOLIOBLOX,
    'folioblox',
    PortalTemplateId.ARIK_NOIR,
    'arik-noir',
    PortalTemplateId.ANIVIOX_EMERALD,
    'aniviox-emerald',
    PortalTemplateId.NEXORA_VIOLET,
    'nexora-violet',
    PortalTemplateId.ORIX_VIOLET,
    'orix-violet',
    PortalTemplateId.WASHOSKI_CYAN,
    'washoski-cyan',
    PortalTemplateId.XENON_MINT,
    'xenon-mint',
  ].includes(templateId as any);

  // State Form Aspirasi Warga Online
  const [formData, setFormData] = useState({
    nama: '',
    whatsapp: '',
    wilayah: '',
    kategori: 'Infrastruktur & Pembangunan',
    pesan: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const kategoriOptions = [
    'Infrastruktur & Pembangunan',
    'Pertanian, Pangan & Lingkungan',
    'Pendidikan & Beasiswa',
    'Kesehatan & Jaminan Sosial',
    'Ekonomi Rakyat & UMKM',
    'Tata Kelola & Pelayanan Publik',
    'Lainnya',
  ];

  const handleSubmitAspirasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.pesan.trim()) return;
    setIsSubmitted(true);
  };

  const getWaAspirasiPrefillLink = () => {
    const text = `*ASPIRASI KONSTITUEN - PORTAL RESMI*\n\n` +
      `*Nama:* ${formData.nama}\n` +
      `*No. WhatsApp:* ${formData.whatsapp || '-'}\n` +
      `*Wilayah:* ${formData.wilayah || (dapil ? `Dapil ${dapil}` : '-')}\n` +
      `*Kategori:* ${formData.kategori}\n\n` +
      `*Pesan/Aspirasi:*\n${formData.pesan}\n\n` +
      `_Terkirim via Portal Komunikasi Resmi ${officialFullName}_`;

    return waNumber
      ? `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-12">
      {/* ========================================================= */}
      {/* SECTION 1: TIGA KANAL KOMUNIKASI CEPAT DIGITAL            */}
      {/* ========================================================= */}
      <section className="space-y-5">
        <div className={`border-b ${isDark ? 'border-white/10' : 'border-amber-200/60'} pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2`}>
          <div>
            <div className={`text-[11px] font-bold ${isDark ? 'text-amber-400' : 'text-[#96702c]'} uppercase tracking-widest mb-1`}>
              Layanan Komunikasi Publik Digital
            </div>
            <h2 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight uppercase`}>
              Kanal Komunikasi Langsung
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* KANAL 1: WhatsApp Hotline Staf Ahli */}
          <div className={`rounded-3xl ${isDark ? 'bg-[#181B22] border-white/10 shadow-2xl hover:border-emerald-500/50' : 'bg-white border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-emerald-500/70'} border hover:shadow-lg transition-all p-6 sm:p-7 flex flex-col justify-between space-y-5`}>
            <div className="space-y-3.5">
              <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200/70'} border flex items-center justify-center font-black shadow-xs`}>
                <MessageCircle className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>

              <div>
                <h3 className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                  Hotline WhatsApp Tim Dewan
                </h3>
                <p className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'} mt-0.5`}>
                  Layanan Koordinasi Langsung
                </p>
              </div>

              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                Saluran komunikasi cepat bersama tim sekretariat untuk konfirmasi agenda dinas, audiensi konstituen, serta penyampaian informasi langsung.
              </p>

              {waNumber && (
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'} border text-xs font-semibold flex items-center gap-2`}>
                  <Phone className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'} shrink-0`} />
                  <span>{formattedPhoneNumber}</span>
                </div>
              )}
            </div>

            <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <a
                href={waHotlineLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Mulai Percakapan WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>
          </div>

          {/* KANAL 2: Surat Elektronik (Email Resmi) */}
          <div className={`rounded-3xl ${isDark ? 'bg-[#181B22] border-white/10 shadow-2xl hover:border-amber-400/50' : 'bg-white border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-[#96702c]/70'} border hover:shadow-lg transition-all p-6 sm:p-7 flex flex-col justify-between space-y-5`}>
            <div className="space-y-3.5">
              <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-[#96702c] border-amber-200/70'} border flex items-center justify-center font-black shadow-xs`}>
                <Mail className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-[#96702c]'}`} />
              </div>

              <div>
                <h3 className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                  Surat Elektronik &amp; Administrasi
                </h3>
                <p className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-[#96702c]'} mt-0.5`}>
                  Korespondensi Dokumen Resmi
                </p>
              </div>

              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                Pengiriman berkas proposal kegiatan, undangan audiensi resmi, dokumen kajian akademis, dan risalah permohonan narasumber kenegaraan.
              </p>

              <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'} border text-xs font-semibold flex items-center gap-2 truncate`}>
                <Mail className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-[#96702c]'} shrink-0`} />
                <span className="truncate">{officialEmail}</span>
              </div>
            </div>

            <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <a
                href={`mailto:${officialEmail}?subject=Permohonan%20Resmi%20-%20${encodeURIComponent(officialFullName)}`}
                className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl ${isDark ? 'bg-white hover:bg-slate-200 text-slate-950 font-black' : 'bg-slate-900 hover:bg-slate-800 text-white font-bold'} text-xs transition shadow-xs cursor-pointer`}
              >
                <Mail className={`w-4 h-4 ${isDark ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>Kirim Surat Elektronik</span>
              </a>
            </div>
          </div>

          {/* KANAL 3: Saluran Publikasi Media Sosial */}
          <div className={`rounded-3xl ${isDark ? 'bg-[#181B22] border-white/10 shadow-2xl hover:border-pink-500/50' : 'bg-white border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-pink-500/70'} border hover:shadow-lg transition-all p-6 sm:p-7 flex flex-col justify-between space-y-5`}>
            <div className="space-y-3.5">
              <div className={`w-12 h-12 rounded-2xl ${isDark ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-pink-50 text-pink-700 border-pink-200/70'} border flex items-center justify-center font-black shadow-xs`}>
                <Instagram className={`w-6 h-6 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
              </div>

              <div>
                <h3 className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                  Media Sosial &amp; Publikasi Publik
                </h3>
                <p className={`text-xs font-bold ${isDark ? 'text-pink-400' : 'text-pink-700'} mt-0.5`}>
                  Dokumentasi Lapangan &amp; Rilis Pers
                </p>
              </div>

              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                Pantau langsung kegiatan rapat parlemen, dokumentasi kunjungan kerja lapangan, serta rilis sikap kebijakan kenegaraan secara teratur.
              </p>

              {instagramUsername ? (
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-700'} border text-xs font-semibold flex items-center gap-2`}>
                  <Instagram className={`w-3.5 h-3.5 ${isDark ? 'text-pink-400' : 'text-pink-600'} shrink-0`} />
                  <span>@{instagramUsername}</span>
                </div>
              ) : (
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'} border text-xs italic`}>
                  Akun media sosial terverifikasi dewan
                </div>
              )}
            </div>

            <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-100'} flex items-center gap-2`}>
              {instagramUsername ? (
                <>
                  <a
                    href={`https://instagram.com/${instagramUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>@{instagramUsername}</span>
                  </a>
                  <a
                    href={`https://threads.net/@${instagramUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center p-2.5 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/15 text-white border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'} transition border`}
                    title="Threads"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </>
              ) : (
                <div className={`w-full text-center py-2 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Media sosial resmi aktif di portal
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: FORMULIR ASPIRASI & LAYANAN WARGA ONLINE       */}
      {/* ========================================================= */}
      <section className={`rounded-3xl ${isDark ? 'bg-[#181B22] border-white/10 shadow-2xl' : 'bg-white border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.06)]'} border overflow-hidden`}>
        <div className="p-6 sm:p-8 lg:p-10 space-y-6">
          <div className={`border-b ${isDark ? 'border-white/10' : 'border-slate-100'} pb-4 space-y-1.5`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-amber-400' : 'bg-[#96702c]'}`} />
              <span className={`text-[11px] font-bold ${isDark ? 'text-amber-400' : 'text-[#96702c]'} uppercase tracking-wider`}>
                Layanan Warga &bull; Partisipasi Publik
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
              Sampaikan Aspirasi &amp; Usulan Kebijakan
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed max-w-2xl`}>
              Saluran resmi untuk menyampaikan usulan pembangunan, aspirasi komunitas, atau kebutuhan advokasi kepada {officialFullName}. Setiap naskah aspirasi ditelaah oleh tim riset dan kebijakan dewan.
            </p>
          </div>

          {isSubmitted ? (
            <div className={`p-6 sm:p-8 rounded-2xl ${isDark ? 'bg-[#131518] border-emerald-500/30' : 'bg-[#FBF9F5] border-amber-200/80'} border text-center space-y-4`}>
              <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'} mx-auto flex items-center justify-center font-bold`}>
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Aspirasi Berhasil Disusun!
                </h3>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-md mx-auto leading-relaxed`}>
                  Terima kasih, <strong>{formData.nama}</strong>. Usulan Anda mengenai bidang <em>{formData.kategori}</em> telah dicatat.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={getWaAspirasiPrefillLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim Ringkasan Langsung ke WhatsApp Tim Dewan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      nama: '',
                      whatsapp: '',
                      wilayah: '',
                      kategori: 'Infrastruktur & Pembangunan',
                      pesan: '',
                    });
                    setIsSubmitted(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl border ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'} text-xs font-bold transition`}
                >
                  Tulis Aspirasi Baru
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitAspirasi} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nama Lengkap */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'} flex items-center gap-1.5`}>
                    <User className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-[#96702c]'}`} />
                    <span>Nama Lengkap Warga / Perwakilan Komunitas <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Budi Prasetyo"
                    className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'border-white/10 bg-white/5 text-white placeholder-slate-500 focus:ring-amber-500' : 'border-slate-200 text-slate-900 bg-white focus:ring-[#96702c]'} text-xs sm:text-sm focus:outline-hidden focus:ring-2`}
                  />
                </div>

                {/* Nomor WhatsApp */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'} flex items-center gap-1.5`}>
                    <Phone className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-[#96702c]'}`} />
                    <span>Nomor WhatsApp Aktif</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Contoh: 0812-3456-7890"
                    className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'border-white/10 bg-white/5 text-white placeholder-slate-500 focus:ring-amber-500' : 'border-slate-200 text-slate-900 bg-white focus:ring-[#96702c]'} text-xs sm:text-sm focus:outline-hidden focus:ring-2`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Wilayah / Asal Daerah */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'} flex items-center gap-1.5`}>
                    <MapPin className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-[#96702c]'}`} />
                    <span>Kecamatan / Kabupaten / Daerah Asal</span>
                  </label>
                  <input
                    type="text"
                    value={formData.wilayah}
                    onChange={(e) => setFormData({ ...formData, wilayah: e.target.value })}
                    placeholder={dapil ? `Contoh: Kecamatan di Dapil ${dapil}` : 'Contoh: Nama kecamatan atau komunitas'}
                    className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'border-white/10 bg-white/5 text-white placeholder-slate-500 focus:ring-amber-500' : 'border-slate-200 text-slate-900 bg-white focus:ring-[#96702c]'} text-xs sm:text-sm focus:outline-hidden focus:ring-2`}
                  />
                </div>

                {/* Kategori Usulan */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Kategori Bidang Aspirasi
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'border-white/10 bg-[#131518] text-white focus:ring-amber-500' : 'border-slate-200 text-slate-900 bg-white focus:ring-[#96702c]'} text-xs sm:text-sm focus:outline-hidden focus:ring-2`}
                  >
                    {kategoriOptions.map((opt) => (
                      <option key={opt} value={opt} className={isDark ? "bg-[#181B22] text-white" : ""}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Isi Aspirasi */}
              <div className="space-y-1.5">
                <label className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Uraian Aspirasi, Usulan Kebijakan, atau Keluhan Warga <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.pesan}
                  onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                  placeholder="Tuliskan secara jelas pokok aspirasi, lokasi usulan, atau kebutuhan advokasi yang ingin disampaikan kepada anggota dewan..."
                  className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'border-white/10 bg-white/5 text-white placeholder-slate-500 focus:ring-amber-500' : 'border-slate-200 text-slate-900 bg-white focus:ring-[#96702c]'} text-xs sm:text-sm focus:outline-hidden focus:ring-2 leading-relaxed`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'} shrink-0`} />
                  <span className="hidden sm:inline">Data dan identitas warga dilindungi untuk keperluan penyerapan aspirasi resmi.</span>
                </div>

                <button
                  type="submit"
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl ${isDark ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg hover:shadow-amber-500/20' : 'bg-[#96702c] hover:bg-[#805f24] text-white font-bold shadow-xs'} text-xs transition cursor-pointer`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirimkan Aspirasi</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
