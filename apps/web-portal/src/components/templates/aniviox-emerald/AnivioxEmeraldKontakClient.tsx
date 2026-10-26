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
  ArrowRight,
} from 'lucide-react';
import { AnivioxEmeraldShell } from './AnivioxEmeraldShell';
import { getAnivioxMemberInfo, useAnivioxHref } from './utils';
import { submitAspiration } from '@/lib/api';

interface AnivioxEmeraldKontakClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function AnivioxEmeraldKontakClient({
  member,
  theme,
  subdomain,
}: AnivioxEmeraldKontakClientProps) {
  const info = getAnivioxMemberInfo(member, theme, subdomain);
  const href = useAnivioxHref(subdomain);

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
    <AnivioxEmeraldShell
      member={member}
      theme={theme}
      subdomain={subdomain}
      activePage="kontak"
    >
      {/* ─── KONTAK HERO ─── */}
      <section className="relative px-3 sm:px-6 pt-3 sm:pt-4 pb-12 bg-[#060A08]">
        <div className="relative max-w-[1340px] mx-auto rounded-3xl sm:rounded-[44px] bg-gradient-to-b from-[#0A291A] via-[#071B11] to-[#05110B] border border-[#143B25] p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-25"
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
              Rumah Aspirasi & Kontak
            </h1>
            <p className="text-xs sm:text-sm text-[#A3B8AD] leading-relaxed">
              Sampaikan usulan pembangunan, keluhan layanan publik, atau konsultasi kebijakan secara langsung kepada tim advokasi {info.officialFullName}.
            </p>
          </div>

        </div>
      </section>

      {/* ─── FORM & INFO GRID ─── */}
      <section className="py-12 pb-24 bg-[#060A08]">
        <div className="max-w-[1340px] mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sisi Kiri: Informasi Kantor & Saluran Komunikasi */}
            <div className="lg:col-span-5 space-y-8">
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
                <p className="text-xs sm:text-sm text-[#A3B8AD] leading-relaxed">
                  Kami membuka pintu koordinasi bagi warga daerah pemilihan, komunitas, dan rekan media yang ingin berdialog secara konstruktif demi kemajuan daerah.
                </p>
              </div>

              <div className="space-y-4">
                
                <div className="p-5 rounded-2xl bg-[#0B1410] border border-[#14241B] flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${info.primaryColor}1F`,
                      borderColor: `${info.primaryColor}4D`,
                      color: info.primaryColor,
                    }}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#688073]">Alamat Kantor Parlemen</h4>
                    <p className="text-xs sm:text-sm text-white font-medium">{info.address}</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0B1410] border border-[#14241B] flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${info.primaryColor}1F`,
                      borderColor: `${info.primaryColor}4D`,
                      color: info.primaryColor,
                    }}
                  >
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#688073]">Surat Elektronik (Email)</h4>
                    <a href={`mailto:${info.email}`} className="text-xs sm:text-sm text-white hover:text-[#00F076] font-medium transition-colors">
                      {info.email}
                    </a>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0B1410] border border-[#14241B] flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${info.primaryColor}1F`,
                      borderColor: `${info.primaryColor}4D`,
                      color: info.primaryColor,
                    }}
                  >
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#688073]">Hotline Pengaduan Warga</h4>
                    <a href={`tel:${info.phone}`} className="text-xs sm:text-sm text-white hover:text-[#00F076] font-medium transition-colors">
                      {info.phone}
                    </a>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0B1410] border border-[#14241B] flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${info.primaryColor}1F`,
                      borderColor: `${info.primaryColor}4D`,
                      color: info.primaryColor,
                    }}
                  >
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#688073]">Media Sosial Resmi</h4>
                    <a
                      href={info.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-[#00F076] hover:underline font-medium inline-flex items-center gap-1.5"
                    >
                      <span>@{info.instagramUsername}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

              </div>

              <div
                className="p-5 rounded-2xl border text-xs text-[#A3B8AD] flex items-center gap-3"
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
              <div className="p-8 sm:p-10 rounded-3xl bg-[#0B1410] border border-[#14241B] shadow-2xl">
                
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
                    <h3 className="text-xl font-bold text-white">Aspirasi Anda Berhasil Terkirim!</h3>
                    <p className="text-xs sm:text-sm text-[#A3B8AD] max-w-md mx-auto leading-relaxed">
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
                      className="mt-4 px-6 py-2.5 rounded-full text-black font-bold text-xs hover:bg-white transition-colors"
                      style={{ backgroundColor: info.primaryColor }}
                    >
                      Kirim Aspirasi Lainnya
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Formulir Pokok Pikiran Warga</h3>
                      <p className="text-xs text-[#688073] mt-1">Lengkapi data berikut agar tim dapat menghubungi Anda untuk verifikasi lapangan.</p>
                    </div>

                    {errorMessage && (
                      <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
                        {errorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-[#A3B8AD] block">Nama Lengkap *</label>
                        <input
                          type="text"
                          required
                          value={formData.citizenName}
                          onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                          placeholder="Nama sesuai KTP"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#070D09] border border-[#14241B] text-white text-xs focus:outline-none focus:border-[#00F076] transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-[#A3B8AD] block">Nomor WhatsApp / Telp *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          placeholder="0812xxxxxxx"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#070D09] border border-[#14241B] text-white text-xs focus:outline-none focus:border-[#00F076] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-[#A3B8AD] block">Kabupaten / Kota *</label>
                        <input
                          type="text"
                          required
                          value={formData.regencyName}
                          onChange={(e) => setFormData({ ...formData, regencyName: e.target.value })}
                          placeholder="Kabupaten / Kota domisili"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#070D09] border border-[#14241B] text-white text-xs focus:outline-none focus:border-[#00F076] transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-[#A3B8AD] block">Kecamatan *</label>
                        <input
                          type="text"
                          required
                          value={formData.districtKecamatan}
                          onChange={(e) => setFormData({ ...formData, districtKecamatan: e.target.value })}
                          placeholder="Kecamatan domisili"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#070D09] border border-[#14241B] text-white text-xs focus:outline-none focus:border-[#00F076] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[#A3B8AD] block">Kategori Bidang Aspirasi *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#070D09] border border-[#14241B] text-white text-xs focus:outline-none focus:border-[#00F076] transition-colors"
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
                      <label className="text-xs font-mono text-[#A3B8AD] block">Uraian Aspirasi atau Masalah *</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.aspirationMessage}
                        onChange={(e) => setFormData({ ...formData, aspirationMessage: e.target.value })}
                        placeholder="Jelaskan secara rinci lokasi, kondisi riil di lapangan, dan harapan solusi..."
                        className="w-full px-4 py-3 rounded-xl bg-[#070D09] border border-[#14241B] text-white text-xs focus:outline-none focus:border-[#00F076] transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl text-black font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-xl hover:bg-white flex items-center justify-center gap-2 cursor-pointer"
                      style={{ backgroundColor: info.primaryColor }}
                    >
                      {isSubmitting ? (
                        <span>Mengirimkan Aspirasi...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirimkan Aspirasi ke Dewan</span>
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
    </AnivioxEmeraldShell>
  );
}
