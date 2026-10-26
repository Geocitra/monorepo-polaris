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
import { OrixVioletShell } from './OrixVioletShell';
import { getOrixMemberInfo } from './utils';
import { submitAspiration } from '@/lib/api';

export interface OrixVioletKontakClientProps {
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

export function OrixVioletKontakClient({
  member,
  theme,
  subdomain,
}: OrixVioletKontakClientProps) {
  const info = getOrixMemberInfo(member, theme, subdomain);
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
      setErrorMsg('Mohon lengkapi nama, nomor telepon / WhatsApp, dan pesan aspirasi Anda.');
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
      // Even if offline/local dev, show friendly fallback or actual error
      setErrorMsg(
        err?.message || 'Gagal mengirim aspirasi saat ini. Silakan coba kembali sesaat lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrixVioletShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="kontak"
    >
      {/* ─── 1. HEADER SECTION ─── */}
      <section className="relative pt-36 pb-20 bg-gradient-to-br from-[#2D0694] via-[#3B0CB8] to-[#4F12D6] text-white overflow-hidden">
        {/* Geometric Rings & Ornaments */}
        <div className="absolute top-10 right-10 w-44 h-44 rounded-full border-4 border-yellow-400/30 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full border-4 border-white/10 pointer-events-none" />

        <div className="max-w-[1240px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-widest text-violet-200 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Ruang Komunikasi Warga
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white">
              Hubungi & Sampaikan Aspirasi
            </h1>
            <p className="text-violet-100/90 text-base lg:text-lg leading-relaxed">
              Suara dan aspirasi Anda sangat berarti demi pengawalan pembangunan dan perbaikan kebijakan daerah bersama {info.name}.
            </p>
          </div>
        </div>

        {/* Convex bottom white divider */}
        <div className="absolute -bottom-1 left-0 right-0 h-10 bg-white rounded-t-[2.5rem] pointer-events-none" />
      </section>

      {/* ─── 2. CONTACT & ASPIRATIONS FORM ─── */}
      <section className="py-16 bg-white min-h-[60vh]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Contact Info & Office (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs font-bold text-[#3B0CB8] uppercase tracking-wider block mb-2">
                  Informasi Kontak
                </span>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                  Rumah Aspirasi & Sekretariat
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Silakan terhubung langsung melalui kanal resmi berikut atau kirimkan pesan aspirasi melalui formulir di samping.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {/* Office Address */}
                <div className="p-5 rounded-2xl border-2 border-violet-100 bg-violet-50/40 hover:border-[#3B0CB8] transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#3B0CB8] text-white flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Alamat Kantor / Posko
                        </div>
                        <div className="text-sm font-semibold text-slate-900 mt-0.5 leading-snug">
                          {info.address}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy('address', info.address)}
                      className="text-slate-400 hover:text-[#3B0CB8] p-1.5 rounded-lg hover:bg-white transition-colors"
                      title="Salin Alamat"
                    >
                      {copiedKey === 'address' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="p-5 rounded-2xl border-2 border-violet-100 bg-violet-50/40 hover:border-[#3B0CB8] transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#3B0CB8] text-white flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Email Resmi
                        </div>
                        <div className="text-sm font-semibold text-slate-900 mt-0.5">
                          {info.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy('email', info.email)}
                      className="text-slate-400 hover:text-[#3B0CB8] p-1.5 rounded-lg hover:bg-white transition-colors"
                      title="Salin Email"
                    >
                      {copiedKey === 'email' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div className="p-5 rounded-2xl border-2 border-violet-100 bg-violet-50/40 hover:border-[#3B0CB8] transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#3B0CB8] text-white flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Telepon / Hotline
                        </div>
                        <div className="text-sm font-semibold text-slate-900 mt-0.5">
                          {info.phone}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy('phone', info.phone)}
                      className="text-slate-400 hover:text-[#3B0CB8] p-1.5 rounded-lg hover:bg-white transition-colors"
                      title="Salin Nomor"
                    >
                      {copiedKey === 'phone' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
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
                  className="flex items-center justify-between p-5 rounded-2xl border-2 border-pink-200 bg-gradient-to-r from-pink-50 via-purple-50 to-orange-50 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#C13584] text-white flex items-center justify-center shrink-0 shadow-md">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-pink-600">
                        Instagram Resmi
                      </div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                        @{info.instagramHandle}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-pink-600 group-hover:translate-x-1 transition-transform">
                    Kunjungi &rarr;
                  </span>
                </a>
              </div>
            </div>

            {/* Right: Form Aspirasi (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl border-2 border-violet-100 p-8 lg:p-10 shadow-xl shadow-violet-500/5">
                <div className="mb-6">
                  <h3 className="text-xl lg:text-2xl font-black text-slate-900">
                    Formulir Aspirasi Warga
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Setiap masukan dicatat dan diteruskan ke tim kerja fraksi untuk ditindaklanjuti secara berkala.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-4 animate-in fade-in">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">
                      Aspirasi Berhasil Terkirim!
                    </h4>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Terima kasih atas partisipasi Anda. Laporan Anda telah tersimpan dan akan dipelajari dalam agenda kerja perwakilan rakyat.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 rounded-full bg-[#3B0CB8] text-white text-xs font-bold hover:bg-[#4F12D6] transition-colors"
                    >
                      Kirim Aspirasi Lainnya
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {errorMsg && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Nama Lengkap *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="cth. Budi Santoso"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3B0CB8] focus:ring-2 focus:ring-[#3B0CB8]/20 text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Nomor Telepon / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="cth. 0812-3456-7890"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3B0CB8] focus:ring-2 focus:ring-[#3B0CB8]/20 text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Kabupaten / Kota
                        </label>
                        <input
                          type="text"
                          value={formData.regency}
                          onChange={(e) => setFormData({ ...formData, regency: e.target.value })}
                          placeholder="cth. Kota Semarang"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3B0CB8] focus:ring-2 focus:ring-[#3B0CB8]/20 text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Kecamatan / Kelurahan
                        </label>
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          placeholder="cth. Banyumanik"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3B0CB8] focus:ring-2 focus:ring-[#3B0CB8]/20 text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Bidang Aspirasi
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3B0CB8] focus:ring-2 focus:ring-[#3B0CB8]/20 text-sm font-medium bg-white"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Uraian Aspirasi / Masukan *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tuliskan aspirasi, keluhan warga, atau usulan perbaikan secara rinci..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#3B0CB8] focus:ring-2 focus:ring-[#3B0CB8]/20 text-sm font-medium resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#2D0694] via-[#3B0CB8] to-[#4F12D6] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#3B0CB8]/25 hover:shadow-xl hover:shadow-[#3B0CB8]/35 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
    </OrixVioletShell>
  );
}
