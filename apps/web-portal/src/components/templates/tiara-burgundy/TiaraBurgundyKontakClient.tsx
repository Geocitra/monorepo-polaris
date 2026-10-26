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
  ChevronRight,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { TiaraBurgundyShell } from './TiaraBurgundyShell';
import { getTiaraMemberInfo, useTiaraHref } from './utils';
import { submitAspiration } from '@/lib/api';

interface TiaraBurgundyKontakClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function TiaraBurgundyKontakClient({
  member,
  theme,
  subdomain,
}: TiaraBurgundyKontakClientProps) {
  const info = getTiaraMemberInfo(member, theme, subdomain);
  const href = useTiaraHref(subdomain);

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
    <TiaraBurgundyShell member={member} theme={theme} subdomain={subdomain} activePage="kontak">
      {/* Editorial Header */}
      <section className="bg-[#EFEBE4] border-b border-[#E5DED5] py-14 sm:py-20 px-6 sm:px-10 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs font-serif uppercase tracking-[0.2em] text-[#7A6F6A]">
            <Link href={href('/')} className="hover:text-[#6B1724] transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#B8AEA8]" />
            <span className="font-bold" style={{ color: info.textAccentColor }}>Ruang Aspirasi & Kontak</span>
          </div>

          <div className="max-w-3xl space-y-3">
            <span className="font-serif italic text-2xl sm:text-3xl block" style={{ color: info.textAccentColor }}>
              Kanal Terbuka Konstituen
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl text-[#6B1724] tracking-tight leading-none uppercase font-normal">
              HUBUNGI SAYA & KIRIM ASPIRASI
            </h1>
            <p className="text-sm sm:text-base text-[#5A524D] leading-relaxed pt-1">
              Setiap suara warga adalah panduan moral dalam menjalankan tugas kedewanan. Sampaikan keluhan fasilitas umum, usulan bantuan UMKM, maupun masukan regulasi daerah secara langsung.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content: Form & Secretariat Contact Cards */}
      <section className="bg-[#FBF9F5] py-16 sm:py-24 px-6 sm:px-10 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Interactive Form */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-12 border border-[#E5DED5] rounded-xs shadow-md space-y-8">
              <div className="space-y-2 border-b border-[#E5DED5] pb-4">
                <span className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-[#6B1724] block">
                  Formulir Pengaduan & Usulan Warga
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1B18]">
                  Sampaikan Aspirasi Anda
                </h2>
                <p className="text-xs text-[#7A6F6A] leading-relaxed">
                  Data Anda tersimpan aman dan terintegrasi langsung dengan dashboard tim tenaga ahli anggota dewan.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 bg-[#EFEBE4] border border-[#DDD5CA] rounded-xs text-center space-y-4 animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-[#6B1724] text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#6B1724] uppercase">
                    Aspirasi Berhasil Terkirim!
                  </h3>
                  <p className="text-xs text-[#5A524D] leading-relaxed max-w-md mx-auto">
                    Terima kasih telah berpartisipasi aktif dalam pengawasan pembangunan daerah. Tim kesekretariatan fraksi akan menindaklanjuti usulan Anda sesuai dengan mekanisme parlemen.
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
                    className="mt-4 px-6 py-2.5 bg-[#6B1724] text-white rounded-full font-serif text-xs font-semibold uppercase tracking-wider hover:bg-[#52101B] transition-colors"
                  >
                    Kirim Aspirasi Lainnya
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#1E1B18]">
                        Nama Lengkap Warga *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Hendra Gunawan"
                        value={formData.citizenName}
                        onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FBF9F5] border border-[#DDD5CA] rounded-xs text-xs text-[#1E1B18] focus:outline-none focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#1E1B18]">
                        Nomor WhatsApp / HP *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="081234567890"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FBF9F5] border border-[#DDD5CA] rounded-xs text-xs text-[#1E1B18] focus:outline-none focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#1E1B18]">
                        Kabupaten / Kota *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kota Bandung"
                        value={formData.regencyName}
                        onChange={(e) => setFormData({ ...formData, regencyName: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FBF9F5] border border-[#DDD5CA] rounded-xs text-xs text-[#1E1B18] focus:outline-none focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#1E1B18]">
                        Kecamatan / Kelurahan *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kec. Coblong"
                        value={formData.districtKecamatan}
                        onChange={(e) => setFormData({ ...formData, districtKecamatan: e.target.value })}
                        className="w-full px-4 py-3 bg-[#FBF9F5] border border-[#DDD5CA] rounded-xs text-xs text-[#1E1B18] focus:outline-none focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#1E1B18]">
                      Kategori Isu Aspirasi *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FBF9F5] border border-[#DDD5CA] rounded-xs text-xs text-[#1E1B18] focus:outline-none focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724] transition-all"
                    >
                      <option value="INFRASTRUKTUR">Infrastruktur Jalan, Jembatan & Irigasi</option>
                      <option value="PENDIDIKAN">Pendidikan, Beasiswa & Sarana Sekolah</option>
                      <option value="KESEHATAN">Kesehatan, BPJS & Fasilitas Puskesmas</option>
                      <option value="PERTANIAN">Pertanian, Subsidi Pupuk & Alat Tani</option>
                      <option value="UMKM">Pemberdayaan UMKM, Modal Usaha & Pasar</option>
                      <option value="HUKUM">Bantuan Hukum & Pelayanan Publik</option>
                      <option value="LAINNYA">Lain-lain / Saran Umum</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#1E1B18]">
                      Uraian Pesan Aspirasi *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Jelaskan secara rinci permasalahan, lokasi titik masalah, atau rekomendasi perbaikan yang ingin disampaikan..."
                      value={formData.aspirationMessage}
                      onChange={(e) => setFormData({ ...formData, aspirationMessage: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FBF9F5] border border-[#DDD5CA] rounded-xs text-xs text-[#1E1B18] focus:outline-none focus:border-[#6B1724] focus:ring-1 focus:ring-[#6B1724] transition-all leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-10 py-4 bg-[#6B1724] text-white rounded-full font-serif text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#52101B] disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Mengirim Aspirasi...' : 'Kirim Aspirasi Sekarang'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Contact Cards & Office Details */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Rumah Aspirasi Card (Burgundy) */}
              <div className="bg-[#6B1724] text-white p-8 rounded-xs space-y-6 shadow-xl">
                <div className="space-y-1 border-b border-white/20 pb-4">
                  <span className="text-[11px] font-serif uppercase tracking-[0.2em] text-[#EADCC8]">
                    Kantor Pelayanan
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-white">
                    Rumah Aspirasi Rakyat
                  </h3>
                </div>

                <div className="space-y-5 text-xs text-white/90">
                  <div className="flex items-start space-x-3.5">
                    <MapPin className="w-5 h-5 text-[#EADCC8] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-serif tracking-wider uppercase text-[11px]">
                        Alamat Kantor Dapil
                      </strong>
                      Jl. Diponegoro No. 27, Gedung Sekretariat Parlemen, Wilayah Pemilihan {info.dapil}.
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <Clock className="w-5 h-5 text-[#EADCC8] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-serif tracking-wider uppercase text-[11px]">
                        Waktu Pelayanan Warga
                      </strong>
                      Senin – Jumat: 08.30 – 16.30 WIB<br />
                      Sabtu: Agenda Kunjungan Lapangan & Reses
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <Mail className="w-5 h-5 text-[#EADCC8] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-serif tracking-wider uppercase text-[11px]">
                        Surat Elektronik Resmi
                      </strong>
                      kontak@{info.callName.toLowerCase().replace(/\s+/g, '')}.polaris.id
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <Phone className="w-5 h-5 text-[#EADCC8] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-serif tracking-wider uppercase text-[11px]">
                        Hotline WhatsApp Konstituen
                      </strong>
                      +62 811-2345-6789 (Senin - Jumat)
                    </div>
                  </div>
                </div>
              </div>

              {/* Instagram Card */}
              <div className="bg-white p-8 border border-[#E5DED5] rounded-xs space-y-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#6B1724] text-white flex items-center justify-center">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#1E1B18]">
                      Instagram Resmi
                    </h4>
                    <span className="text-xs text-[#7A6F6A]">
                      @{info.callName.toLowerCase().replace(/\s+/g, '')}.official
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#5A524D] leading-relaxed">
                  Ikuti dokumentasi agenda harian parlemen, liputan rapat komisi, dan siaran langsung kegiatan serap aspirasi warga di media sosial.
                </p>

                <a
                  href={`https://instagram.com/${info.callName.toLowerCase().replace(/\s+/g, '')}.official`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-xs font-serif font-bold uppercase tracking-wider hover:opacity-80 transition"
                  style={{ color: info.textAccentColor }}
                >
                  <span>Kunjungi Profil Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>
        </div>
      </section>
    </TiaraBurgundyShell>
  );
}
