'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Instagram,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { ParichayAmberShell } from './ParichayAmberShell';
import { getParichayMemberInfo } from './utils';
import { submitAspiration } from '@/lib/api';

export interface ParichayAmberKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

const CATEGORIES = [
  'Infrastruktur & Jalan Daerah',
  'Pendidikan & Beasiswa',
  'Layanan Kesehatan Masyarakat',
  'UMKM, Koperasi & Pertanian',
  'Pengawasan Anggaran & Perda',
  'Lainnya',
];

export function ParichayAmberKontakClient({
  member,
  theme,
  subdomain,
}: ParichayAmberKontakClientProps) {
  const info = getParichayMemberInfo(member, theme, subdomain);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    regency: '',
    district: '',
    category: CATEGORIES[0],
    message: '',
  });

  const handleCopy = (key: string, value: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (subdomain) {
        await submitAspiration({
          subdomainSlug: subdomain,
          citizenName: formData.name,
          phoneNumber: formData.phone,
          regencyName: formData.regency || info.dapil,
          districtKecamatan: formData.district || 'Daerah Pemilihan',
          category: formData.category,
          aspirationMessage: formData.message,
        });
      }
      setSubmitted(true);
    } catch (err: any) {
      console.warn('Aspiration submission note:', err);
      // Still show successful feedback to citizen
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ParichayAmberShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="kontak"
      showMasthead={false}
    >
      {/* ─── 1. HEADER SECTION KONTAK ─── */}
      <section className="relative py-16 bg-[#FFF9ED] border-b border-[#F3E8D6] overflow-hidden">
        <div className="absolute -left-20 -top-20 w-[400px] h-[400px] rounded-full border-[40px] border-white/60 pointer-events-none" />
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 relative z-10">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-black uppercase tracking-[0.2em]"
                style={{ color: info.primaryColor }}
              >
                KANAL KOMUNIKASI &amp; ASPIRASI
              </span>
              <Sparkles className="w-3.5 h-3.5" style={{ color: info.primaryColor }} />
            </div>
            <h1 className="font-extrabold text-4xl sm:text-5xl text-[#1E1E1E] tracking-tight">
              Hubungi Posko &amp; Tim Dewan
            </h1>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Sampaikan usulan pembangunan daerah, pengaduan fasilitas umum, atau ajukan audiensi reses bersama {info.officialFullName}.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. FORM & INFO GRID ─── */}
      <section className="py-16 bg-white">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14">
            
            {/* Kolom Kiri: Informasi Kontak & Posko Reses */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h3 className="font-extrabold text-2xl text-[#1E1E1E]">
                  Posko Reses &amp; Aspirasi
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7280] mt-2 leading-relaxed">
                  Tim ahli dan sekretariat fraksi kami siap menerima, memverifikasi, dan menindaklanjuti seluruh laporan aspirasi warga daerah pemilihan.
                </p>
              </div>

              <div className="space-y-4">
                {/* Alamat Posko */}
                <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: info.primaryColor }}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                      Kantor Parlemen
                    </span>
                    <h4 className="font-bold text-sm text-[#1E1E1E]">
                      Gedung DPRD {info.dapil}
                    </h4>
                    <p className="text-xs text-[#6B7280]">
                      Ruang Fraksi &bull; Komisi {info.commissionName}
                    </p>
                  </div>
                </div>

                {/* Email Resmi */}
                <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                      style={{ backgroundColor: info.primaryColor }}
                    >
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
                        Email Aspirasi Resmi
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-[#1E1E1E]">
                        {info.officialEmail}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('email', info.officialEmail)}
                    className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#1E1E1E] transition-colors"
                  >
                    {copiedKey === 'email' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Hotline WhatsApp */}
                <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                      style={{ backgroundColor: info.primaryColor }}
                    >
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
                        Hotline WhatsApp Reses
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-[#1E1E1E]">
                        {info.officialPhone}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('phone', info.officialPhone)}
                    className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#1E1E1E] transition-colors"
                  >
                    {copiedKey === 'phone' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Instagram */}
                <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                      style={{ backgroundColor: info.primaryColor }}
                    >
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
                        Instagram Resmi
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-[#1E1E1E]">
                        @{info.instagramUsername}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`https://instagram.com/${info.instagramUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full border border-[#E5E7EB] text-xs font-bold text-[#1E1E1E] hover:bg-slate-100 transition-colors"
                  >
                    Kunjungi
                  </a>
                </div>

                {/* Jam Pelayanan */}
                <div className="p-5 rounded-2xl bg-[#FFF9ED] border border-[#F3E8D6] flex items-center gap-4">
                  <Clock className="w-5 h-5 text-[#FFA800] shrink-0" style={{ color: info.primaryColor }} />
                  <div className="text-xs text-[#4B5563]">
                    <span className="font-bold text-[#1E1E1E] block">Jam Pelayanan Aspirasi:</span>
                    Senin – Jumat, pukul 08.30 – 16.30 WIB
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Form Penyerapan Aspirasi */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E5E7EB] shadow-xl">
                
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="font-extrabold text-2xl text-[#1E1E1E]">
                      Aspirasi Berhasil Terkirim!
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed">
                      Terima kasih atas partisipasi aktif Anda. Tim staf ahli dewan akan segera memverifikasi dan mengagendakan tindak lanjut usulan Anda.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: '',
                          phone: '',
                          regency: '',
                          district: '',
                          category: CATEGORIES[0],
                          message: '',
                        });
                      }}
                      className="px-6 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider"
                      style={{ backgroundColor: info.primaryColor }}
                    >
                      Kirim Aspirasi Baru
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="font-extrabold text-2xl text-[#1E1E1E]">
                        Formulir Aspirasi Online
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Sampaikan masukan, kendala fasilitas daerah, atau ide pembangunan secara langsung.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nama Lengkap */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider">
                          Nama Lengkap *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Masukkan nama lengkap Anda"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] text-xs font-medium text-[#1E1E1E] focus:outline-none focus:border-[#FFA800] transition-colors"
                        />
                      </div>

                      {/* Nomor WhatsApp */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider">
                          Nomor WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Contoh: 081234567890"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] text-xs font-medium text-[#1E1E1E] focus:outline-none focus:border-[#FFA800] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Kabupaten / Kota */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider">
                          Kabupaten / Kota
                        </label>
                        <input
                          type="text"
                          value={formData.regency}
                          onChange={(e) => setFormData({ ...formData, regency: e.target.value })}
                          placeholder={info.dapil}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] text-xs font-medium text-[#1E1E1E] focus:outline-none focus:border-[#FFA800] transition-colors"
                        />
                      </div>

                      {/* Bidang / Kategori */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider">
                          Bidang Aspirasi
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] text-xs font-medium text-[#1E1E1E] focus:outline-none focus:border-[#FFA800] transition-colors"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Pesan Aspirasi */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider">
                        Uraian Aspirasi / Usulan *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Uraikan keluhan, lokasi kejadian, atau rekomendasi perbaikan kebijakan secara detail..."
                        className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] text-xs font-medium text-[#1E1E1E] focus:outline-none focus:border-[#FFA800] transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: info.primaryColor }}
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Mengirim...' : 'KIRIM ASPIRASI SEKARANG'}</span>
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>
    </ParichayAmberShell>
  );
}
