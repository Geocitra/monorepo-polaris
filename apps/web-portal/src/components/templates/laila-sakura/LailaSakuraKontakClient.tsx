'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Send,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { LailaSakuraShell } from './LailaSakuraShell';
import { getLailaMemberInfo, useLailaHref } from './utils';
import { submitAspiration } from '@/lib/api';

interface LailaSakuraKontakClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function LailaSakuraKontakClient({
  member,
  theme,
  subdomain,
}: LailaSakuraKontakClientProps) {
  const info = getLailaMemberInfo(member, theme, subdomain);
  const href = useLailaHref(subdomain);

  const [formData, setFormData] = useState({
    citizenName: '',
    phoneNumber: '',
    regencyName: '',
    districtKecamatan: '',
    category: 'INFRASTRUKTUR',
    aspirationMessage: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await submitAspiration({
        subdomainSlug: subdomain || 'polaris',
        ...formData,
      });
      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal mengirimkan aspirasi. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LailaSakuraShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="kontak"
    >
      {/* ─── KONTAK HERO ─── */}
      <section className="relative px-4 sm:px-6 pt-6 pb-12 bg-[#080D1A]">
        <div className="relative max-w-[1320px] mx-auto rounded-3xl sm:rounded-[44px] bg-[#0D1527] border border-[#1E2B42] p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[160px] pointer-events-none opacity-25"
            style={{ backgroundColor: info.primaryColor }}
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span
              className="text-xs font-mono font-bold uppercase tracking-[0.25em] block"
              style={{ color: info.primaryColor }}
            >
              Layanan Partisipasi Warga
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              🌸 Rumah Aspirasi & Kontak 🌸
            </h1>
            <p className="text-xs sm:text-sm text-[#A0ABC0] leading-relaxed">
              Sampaikan usulan pembangunan, keluhan layanan publik, atau konsultasi kebijakan secara langsung kepada tim advokasi {info.officialFullName}.
            </p>
          </div>

        </div>
      </section>

      {/* ─── FORM & INFO GRID ─── */}
      <section className="py-12 pb-24 bg-[#080D1A]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sisi Kiri: Informasi Kantor & Saluran Komunikasi */}
            <div className="lg:col-span-5 space-y-8 text-left">
              <div className="space-y-3">
                <span
                  className="text-xs font-mono font-bold uppercase tracking-widest block"
                  style={{ color: info.primaryColor }}
                >
                  RUANG KERJA & ASPIRASI
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Saluran Komunikasi Resmi
                </h2>
                <p className="text-xs sm:text-sm text-[#A0ABC0] leading-relaxed">
                  Kami membuka pintu koordinasi bagi warga daerah pemilihan, komunitas, dan rekan media yang ingin berdialog secara konstruktif demi kemajuan daerah.
                </p>
              </div>

              <div className="space-y-4">
                
                <div className="p-5 rounded-3xl bg-[#0D1527] border border-[#1E2B42] flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${info.primaryColor}1F`,
                      borderColor: `${info.primaryColor}4D`,
                      color: info.primaryColor,
                    }}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#64748B]">Alamat Kantor Parlemen</h4>
                    <p className="text-xs sm:text-sm text-white font-medium">{info.address}</p>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-[#0D1527] border border-[#1E2B42] flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${info.primaryColor}1F`,
                      borderColor: `${info.primaryColor}4D`,
                      color: info.primaryColor,
                    }}
                  >
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#64748B]">Surat Elektronik (Email)</h4>
                    <a href={`mailto:${info.email}`} className="text-xs sm:text-sm text-white hover:text-[#FF4D8D] font-medium transition-colors">
                      {info.email}
                    </a>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-[#0D1527] border border-[#1E2B42] flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${info.primaryColor}1F`,
                      borderColor: `${info.primaryColor}4D`,
                      color: info.primaryColor,
                    }}
                  >
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#64748B]">Hotline Pengaduan Warga</h4>
                    <a href={`tel:${info.phone}`} className="text-xs sm:text-sm text-white hover:text-[#FF4D8D] font-medium transition-colors">
                      {info.phone}
                    </a>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-[#0D1527] border border-[#1E2B42] flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${info.primaryColor}1F`,
                      borderColor: `${info.primaryColor}4D`,
                      color: info.primaryColor,
                    }}
                  >
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#64748B]">Media Sosial Resmi</h4>
                    <a
                      href={info.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-[#FF4D8D] hover:underline font-medium inline-flex items-center gap-1.5"
                    >
                      <span>@{info.instagramUsername}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

              </div>

              <div
                className="p-5 rounded-3xl border text-xs text-[#A0ABC0] flex items-center gap-3"
                style={{
                  backgroundColor: `${info.primaryColor}14`,
                  borderColor: `${info.primaryColor}40`,
                }}
              >
                <ShieldCheck className="w-5 h-5 shrink-0" style={{ color: info.primaryColor }} />
                <span>Seluruh aspirasi warga dijamin kerahasiaannya dan diverifikasi langsung oleh tim Pokir dewan.</span>
              </div>
            </div>

            {/* Sisi Kanan: Form Pengiriman Aspirasi */}
            <div className="lg:col-span-7">
              <div className="p-8 sm:p-10 rounded-3xl bg-[#0D1527] border border-[#1E2B42] shadow-2xl text-left">
                
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border"
                      style={{
                        backgroundColor: `${info.primaryColor}26`,
                        borderColor: info.primaryColor,
                        color: info.primaryColor,
                      }}
                    >
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white">🌸 Aspirasi Anda Berhasil Terkirim! 🌸</h3>
                    <p className="text-xs sm:text-sm text-[#A0ABC0] max-w-md mx-auto leading-relaxed">
                      Terima kasih atas partisipasi aktif Anda. Tim advokasi kebijakan akan segera menelaah laporan Anda untuk ditindaklanjuti dalam agenda kerja komisi.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          citizenName: '',
                          phoneNumber: '',
                          regencyName: '',
                          districtKecamatan: '',
                          category: 'INFRASTRUKTUR',
                          aspirationMessage: '',
                        });
                      }}
                      className="mt-4 px-6 py-2.5 rounded-full text-white font-bold text-xs hover:bg-[#FF2E74] transition-colors"
                      style={{ backgroundColor: info.primaryColor }}
                    >
                      Kirim Aspirasi Lainnya 🌸
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Formulir Pokok Pikiran Warga</h3>
                      <p className="text-xs text-[#64748B] mt-1">Lengkapi data berikut agar tim dapat menghubungi Anda untuk verifikasi lapangan.</p>
                    </div>

                    {errorMessage && (
                      <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
                        {errorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-[#A0ABC0] block">Nama Lengkap *</label>
                        <input
                          type="text"
                          required
                          value={formData.citizenName}
                          onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                          placeholder="Nama sesuai KTP"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2B42] text-white text-xs focus:outline-none focus:border-[#FF4D8D] transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-[#A0ABC0] block">Nomor WhatsApp / Telp *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          placeholder="0812xxxxxxx"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2B42] text-white text-xs focus:outline-none focus:border-[#FF4D8D] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-[#A0ABC0] block">Kabupaten / Kota *</label>
                        <input
                          type="text"
                          required
                          value={formData.regencyName}
                          onChange={(e) => setFormData({ ...formData, regencyName: e.target.value })}
                          placeholder="Kabupaten / Kota domisili"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2B42] text-white text-xs focus:outline-none focus:border-[#FF4D8D] transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-[#A0ABC0] block">Kecamatan *</label>
                        <input
                          type="text"
                          required
                          value={formData.districtKecamatan}
                          onChange={(e) => setFormData({ ...formData, districtKecamatan: e.target.value })}
                          placeholder="Kecamatan domisili"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2B42] text-white text-xs focus:outline-none focus:border-[#FF4D8D] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#A0ABC0] block">Kategori Bidang Aspirasi *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#080D1A] border border-[#1E2B42] text-white text-xs focus:outline-none focus:border-[#FF4D8D] transition-colors"
                      >
                        <option value="INFRASTRUKTUR">Infrastruktur & Jalan Daerah</option>
                        <option value="PERTANIAN">Pertanian, Irigasi & Pupuk</option>
                        <option value="PENDIDIKAN">Pendidikan & Beasiswa</option>
                        <option value="KESEHATAN">Kesehatan & Fasilitas Medis</option>
                        <option value="BANSOS_UMKM">Bantuan Sosial & Dukungan UMKM</option>
                        <option value="LAINNYA">Lainnya / Advokasi Umum</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#A0ABC0] block">Uraian Aspirasi atau Masalah *</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.aspirationMessage}
                        onChange={(e) => setFormData({ ...formData, aspirationMessage: e.target.value })}
                        placeholder="Jelaskan secara rinci lokasi, kondisi riil di lapangan, dan harapan solusi..."
                        className="w-full px-4 py-3 rounded-xl bg-[#080D1A] border border-[#1E2B42] text-white text-xs focus:outline-none focus:border-[#FF4D8D] transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl text-white font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-xl hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${info.primaryColor}, #FF1493)`,
                      }}
                    >
                      {isSubmitting ? (
                        <span>Mengirimkan Aspirasi...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirimkan Aspirasi ke Dewan 🌸</span>
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
    </LailaSakuraShell>
  );
}
