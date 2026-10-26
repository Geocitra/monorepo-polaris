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
  ShieldAlert,
} from 'lucide-react';
import { WashoskiCyanShell } from './WashoskiCyanShell';
import { getWashoskiMemberInfo, useWashoskiHref, WASHOSKI_CYAN } from './utils';
import { submitAspiration } from '@/lib/api';

export interface WashoskiCyanKontakClientProps {
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

export function WashoskiCyanKontakClient({
  member,
  theme,
  subdomain,
}: WashoskiCyanKontakClientProps) {
  const info = getWashoskiMemberInfo(member, theme, subdomain);
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
    if (!formData.name || !formData.phone || !formData.message) {
      setErrorMsg('Mohon lengkapi nama, nomor telepon / WhatsApp, dan uraian aspirasi Anda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await submitAspiration({
        subdomainSlug: subdomain || 'portal',
        citizenName: formData.name,
        phoneNumber: formData.phone,
        regencyName: formData.regency || 'Daerah Pemilihan',
        districtKecamatan: formData.district || 'Kecamatan',
        category: formData.category,
        aspirationMessage: formData.message,
      });
      setSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        regency: '',
        district: '',
        category: CATEGORIES[0],
        message: '',
      });
    } catch (err: any) {
      console.error('Error submitting aspiration:', err);
      setErrorMsg(
        err?.message || 'Gagal mengirim aspirasi saat ini. Silakan coba kembali sesaat lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WashoskiCyanShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="kontak"
    >
      {/* ─── 1. HEADER SECTION ─── */}
      <section className="pt-32 pb-16 bg-[#000000] border-b border-[#1A1A1A]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#05DFD7] block">
              SALURAN ASPIRASI WARGA
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
              Hubungi & Sampaikan Aspirasi <span className="text-[#05DFD7]">.</span>
            </h1>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Ruang komunikasi dan pengaduan langsung konstituen bersama anggota dewan perwakilan rakyat {info.name}.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 2. CONTACT DETAILS & FORM ─── */}
      <section className="py-16 bg-[#070707] min-h-[60vh]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left: Contact Info (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs font-extrabold text-[#05DFD7] uppercase tracking-wider block mb-2">
                  INFORMASI KONTAK
                </span>
                <h2 className="text-2xl lg:text-3xl font-black text-white">
                  Sekretariat & Rumah Aspirasi
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
                  Silakan terhubung langsung melalui kanal posko resmi berikut atau kirimkan pesan aspirasi melalui formulir di samping.
                </p>
              </div>

              <div className="space-y-4">
                {/* Office */}
                <div className="p-5 rounded-xl border border-[#1E1E1E] bg-[#0E0E0E] hover:border-[#05DFD7] transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-[#141414] text-[#05DFD7] flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                          Alamat Kantor / Posko
                        </div>
                        <div className="text-xs font-semibold text-white mt-1 leading-snug">
                          {info.address}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy('address', info.address)}
                      className="text-[#71717A] hover:text-[#05DFD7] p-1.5 rounded hover:bg-[#1A1A1A] transition-colors"
                      title="Salin Alamat"
                    >
                      {copiedKey === 'address' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="p-5 rounded-xl border border-[#1E1E1E] bg-[#0E0E0E] hover:border-[#05DFD7] transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-[#141414] text-[#05DFD7] flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                          Email Resmi
                        </div>
                        <div className="text-xs font-semibold text-white mt-1">
                          {info.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy('email', info.email)}
                      className="text-[#71717A] hover:text-[#05DFD7] p-1.5 rounded hover:bg-[#1A1A1A] transition-colors"
                      title="Salin Email"
                    >
                      {copiedKey === 'email' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div className="p-5 rounded-xl border border-[#1E1E1E] bg-[#0E0E0E] hover:border-[#05DFD7] transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-[#141414] text-[#05DFD7] flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                          Telepon / Hotline
                        </div>
                        <div className="text-xs font-semibold text-white mt-1">
                          {info.phone}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy('phone', info.phone)}
                      className="text-[#71717A] hover:text-[#05DFD7] p-1.5 rounded hover:bg-[#1A1A1A] transition-colors"
                      title="Salin Nomor"
                    >
                      {copiedKey === 'phone' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Instagram Direct */}
                <a
                  href={info.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-5 rounded-xl border border-[#222] bg-[#0E0E0E] hover:border-[#05DFD7] transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#C13584] text-white flex items-center justify-center shrink-0 shadow-md">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#05DFD7]">
                        Instagram Resmi
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-[#05DFD7] transition-colors">
                        @{info.instagramHandle}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#05DFD7] group-hover:translate-x-1 transition-transform">
                    Buka Profil &rarr;
                  </span>
                </a>
              </div>
            </div>

            {/* Right: Aspirations Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-[#0C0C0C] rounded-2xl border border-[#1E1E1E] p-8 lg:p-10 shadow-2xl">
                <div className="mb-6">
                  <h3 className="text-xl lg:text-2xl font-black text-white">
                    Formulir Aspirasi Warga
                  </h3>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Setiap masukan tercatat langsung di sistem dan diteruskan ke tim kerja fraksi untuk ditindaklanjuti secara berkala.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-8 text-center bg-[#111] rounded-xl border border-[#05DFD7]/40 space-y-4 animate-in fade-in">
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#05DFD7]/20 text-[#05DFD7] flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-white">
                      Aspirasi Berhasil Terkirim!
                    </h4>
                    <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
                      Terima kasih atas partisipasi Anda. Pesan telah dicatat dan akan dipelajari dalam agenda kerja perwakilan rakyat.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 rounded-lg bg-[#05DFD7] text-black text-xs font-extrabold uppercase hover:bg-[#00F2FE] transition-colors"
                    >
                      Kirim Aspirasi Lainnya
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {errorMsg && (
                      <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-2">
                          Nama Lengkap *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="cth. Budi Santoso"
                          className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#262626] focus:outline-none focus:border-[#05DFD7] text-white text-xs font-medium placeholder-[#71717A]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-2">
                          Nomor Telepon / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="cth. 0812-3456-7890"
                          className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#262626] focus:outline-none focus:border-[#05DFD7] text-white text-xs font-medium placeholder-[#71717A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-2">
                          Kabupaten / Kota
                        </label>
                        <input
                          type="text"
                          value={formData.regency}
                          onChange={(e) => setFormData({ ...formData, regency: e.target.value })}
                          placeholder="cth. Kota Semarang"
                          className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#262626] focus:outline-none focus:border-[#05DFD7] text-white text-xs font-medium placeholder-[#71717A]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-2">
                          Kecamatan / Kelurahan
                        </label>
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          placeholder="cth. Banyumanik"
                          className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#262626] focus:outline-none focus:border-[#05DFD7] text-white text-xs font-medium placeholder-[#71717A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-2">
                        Bidang Aspirasi
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#262626] focus:outline-none focus:border-[#05DFD7] text-white text-xs font-medium"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#E5E7EB] uppercase tracking-wider mb-2">
                        Uraian Aspirasi / Masukan *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tuliskan aspirasi atau masukan Anda..."
                        className="w-full px-4 py-3 rounded-lg bg-[#141414] border border-[#262626] focus:outline-none focus:border-[#05DFD7] text-white text-xs font-medium resize-none placeholder-[#71717A]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-lg bg-[#05DFD7] hover:bg-[#00F2FE] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#05DFD7]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>Mengirim Aspirasi...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirim Aspirasi Sekarang</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </WashoskiCyanShell>
  );
}
