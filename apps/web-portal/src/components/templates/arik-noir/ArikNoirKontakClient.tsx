'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Instagram,
  Clock,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { ArikNoirShell } from './ArikNoirShell';
import { getArikMemberInfo, useArikHref } from './utils';

export interface ArikNoirKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function ArikNoirKontakClient({
  member,
  theme,
  subdomain,
}: ArikNoirKontakClientProps) {
  const info = getArikMemberInfo(member, theme, subdomain);
  const href = useArikHref(subdomain);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Aspirasi Legislasi',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <ArikNoirShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="kontak"
    >
      <section className="pt-36 pb-24 bg-[#0A0A0A]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          
          {/* Header */}
          <div className="max-w-2xl mb-16">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A880] block mb-2">
              SALURAN RESMI ASPIRASI
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif italic text-[#F5F2EB] tracking-tight">
              Hubungi Saya & Kirim Aspirasi
            </h1>
            <p className="text-xs sm:text-sm text-[#8E8A83] mt-3 leading-relaxed">
              Sampaikan usulan pembangunan wilayah, keluhan pelayanan publik daerah, serta permohonan audiensi langsung kepada {info.officialFullName}.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-7 bg-[#111111] border border-[#1E1E1E] rounded-3xl p-8 sm:p-10 shadow-2xl">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#181818] border border-[#2A2A2A] text-[#C5A880] mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#F5F2EB]">
                    Aspirasi Berhasil Terkirim
                  </h3>
                  <p className="text-xs text-[#8E8A83] max-w-md mx-auto leading-relaxed">
                    Terima kasih atas partisipasi Anda. Tim advokasi Rumah Aspirasi {info.officialFullName} akan meneliti dan menindaklanjuti pesan Anda.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        category: 'Aspirasi Legislasi',
                        subject: '',
                        message: '',
                      });
                    }}
                    className="mt-4 px-6 py-2.5 rounded-full bg-[#E8DCC4] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
                  >
                    Kirim Pesan Lainnya
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E8A83] mb-1.5">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-[#242424] text-xs text-[#F5F2EB] placeholder-[#5C5852] focus:outline-hidden focus:border-[#C5A880] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E8A83] mb-1.5">
                        Nomor WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0812xxxxxxxx"
                        className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-[#242424] text-xs text-[#F5F2EB] placeholder-[#5C5852] focus:outline-hidden focus:border-[#C5A880] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E8A83] mb-1.5">
                        Alamat Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="nama@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-[#242424] text-xs text-[#F5F2EB] placeholder-[#5C5852] focus:outline-hidden focus:border-[#C5A880] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E8A83] mb-1.5">
                        Klasifikasi Isu
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-[#242424] text-xs text-[#F5F2EB] focus:outline-hidden focus:border-[#C5A880] transition-colors"
                      >
                        <option value="Aspirasi Legislasi">Aspirasi Regulasi / Perda</option>
                        <option value="Infrastruktur & Jalan">Infrastruktur & Jalan Daerah</option>
                        <option value="Pertanian & Pupuk">Pertanian & Pupuk Petani</option>
                        <option value="Bansos & UMKM">Permodalan UMKM & Bansos</option>
                        <option value="Pendidikan & Beasiswa">Pendidikan & Beasiswa</option>
                        <option value="Permohonan Audiensi">Permohonan Kunjungan / Audiensi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E8A83] mb-1.5">
                      Judul Aspirasi / Perihal *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Ringkasan inti aspirasi yang ingin disampaikan..."
                      className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-[#242424] text-xs text-[#F5F2EB] placeholder-[#5C5852] focus:outline-hidden focus:border-[#C5A880] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E8A83] mb-1.5">
                      Uraian Pesan / Kronologi Lengkap *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tuliskan detail aspirasi, lokasi desa/kecamatan terkait, serta harapan solusi..."
                      className="w-full px-4 py-3 rounded-xl bg-[#161616] border border-[#242424] text-xs text-[#F5F2EB] placeholder-[#5C5852] focus:outline-hidden focus:border-[#C5A880] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-full bg-[#E8DCC4] hover:bg-white text-[#0A0A0A] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? 'Mengirim Aspirasi...' : 'Kirim Aspirasi ke Parlemen'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Info & Office Details Column */}
            <div className="lg:col-span-5 space-y-8">
              
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-3xl p-8 space-y-6 shadow-xl">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A880] block">
                  KANTOR PERWAKILAN
                </span>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#F5F2EB]">Alamat Parlemen</h4>
                      <p className="text-xs text-[#8E8A83] mt-0.5 leading-relaxed">
                        {info.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Mail className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#F5F2EB]">Surat Elektronik</h4>
                      <p className="text-xs text-[#8E8A83] mt-0.5">
                        {info.officialEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Phone className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#F5F2EB]">Hotline WhatsApp Aspirasi</h4>
                      <p className="text-xs text-[#8E8A83] mt-0.5">
                        {info.officialPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Clock className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#F5F2EB]">Jam Pelayanan</h4>
                      <p className="text-xs text-[#8E8A83] mt-0.5">
                        Senin - Jumat: 08.30 - 16.30 WIB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#1C1C1C]">
                  <a
                    href={info.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#161616] border border-[#242424] hover:border-[#C5A880] text-xs text-[#F5F2EB] group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <Instagram className="w-4 h-4 text-[#C5A880]" />
                      <span>Ikuti Update Harian di Instagram</span>
                    </div>
                    <span className="text-[#C5A880] group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="p-6 rounded-2xl bg-[#121212] border border-[#1C1C1C] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#C5A880]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Kerahasiaan & Advokasi Terjamin</span>
                </div>
                <p className="text-xs text-[#7A7670] leading-relaxed">
                  Setiap data dan identitas pengirim aspirasi dilindungi oleh protokol keamanan informasi parlemen. Kami berkomitmen menjaga kepercayaan Anda.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>
    </ArikNoirShell>
  );
}
