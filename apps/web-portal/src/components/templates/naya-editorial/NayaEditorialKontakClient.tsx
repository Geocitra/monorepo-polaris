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
  Send,
  HelpCircle,
} from 'lucide-react';

interface NayaEditorialKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function NayaEditorialKontakClient({
  member,
  theme,
  subdomain,
}: NayaEditorialKontakClientProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Infrastruktur & Jalan',
    location: '',
    message: '',
  });

  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B, M.Si.';
  const officialEmail = `aspirasi@${subdomain || 'polaris'}.id`;
  const officialPhone = '+62 812-3456-7890';

  const rawDapil = member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I';
  const dapil = rawDapil.replace(/_/g, ' ');

  const rawParty = member?.partyAffiliation || 'Fraksi Parlemen';
  const party = rawParty.replace(/_/g, ' ');

  const rawCommission = member?.commissionName || 'KOMISI I (PEMERINTAHAN & HUKUM)';
  const commissionName = rawCommission.replace(/_/g, ' ');

  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'polaris.advokasi';

  const handleCopyEmail = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(officialEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyPhone = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(officialPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const workflows = [
    {
      step: '01',
      title: 'Registrasi & Verifikasi',
      desc: 'Aspirasi warga dicatat secara terstruktur dan diverifikasi oleh staf ahli sesuai lingkup kewenangan komisi.',
    },
    {
      step: '02',
      title: 'Telaah Regulasi & Lapangan',
      desc: 'Peninjauan aspek legal perda dan pengecekan kondisi faktual di daerah pemilihan bila diperlukan.',
    },
    {
      step: '03',
      title: 'Advokasi di Rapat Parlemen',
      desc: 'Pengangkatan isu dalam rapat kerja, rapat dengar pendapat (RDPU), atau pembahasan badan anggaran.',
    },
    {
      step: '04',
      title: 'Laporan Balik ke Konstituen',
      desc: 'Pemberitahuan hasil tindak lanjut dan perkembangan realisasi kebijakan kepada pelapor aspirasi.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 px-6 sm:px-10 lg:px-16 max-w-[1520px] mx-auto space-y-16">
      
      {/* ─── 1. TWO-COLUMN LAYOUT: CONTACT DETAILS & ASPIRATION FORM ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Left Column: Direct Contact & Posko Cards */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-[32px] border border-[#E5E0D5] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D8D3C4] bg-[#EFECE1]/80 text-[#606453] text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Kantor Resmi &amp; Posko Reses</span>
            </div>

            <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#24271D] leading-snug">
              Saluran Komunikasi Langsung Bersama Dewan
            </h3>

            <p className="text-xs sm:text-sm text-[#6A6E5F] leading-relaxed">
              Masyarakat dapat menyampaikan aspirasi, pengaduan permasalahan layanan publik,
              atau permohonan audiensi melalui kanal resmi yang terintegrasi.
            </p>

            <div className="space-y-4 pt-2">
              
              {/* Posko Reses */}
              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[#4E5340] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#24271D]">Posko Reses Dapil {dapil}</div>
                  <div className="text-xs text-[#6A6E5F] mt-0.5 leading-relaxed">
                    Gedung Aspirasi Parlemen, Jl. Perintis Kemerdekaan No. 45, Sentra Layanan Konstituen.
                  </div>
                </div>
              </div>

              {/* WhatsApp Hotline */}
              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#4E5340] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#24271D]">WhatsApp Hotline Posko</div>
                    <div className="text-xs text-[#6A6E5F]">{officialPhone}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="p-2 rounded-full hover:bg-white text-[#4E5340] transition-colors cursor-pointer"
                  title="Salin Nomor"
                >
                  {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Email Resmi */}
              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#4E5340] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#24271D]">Surat Elektronik Resmi</div>
                    <div className="text-xs text-[#6A6E5F] truncate max-w-[200px]">{officialEmail}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-2 rounded-full hover:bg-white text-[#4E5340] transition-colors cursor-pointer"
                  title="Salin Email"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Jam Operasional */}
              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#EAE5D9] flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-[#4E5340] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#24271D]">Jam Pelayanan Aspirasi Tatap Muka</div>
                  <div className="text-xs text-[#6A6E5F] mt-0.5">
                    Senin – Jumat: 08.30 – 16.00 WIB <br />
                    Kanal Aspirasi Digital: Aktif 24/7
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Interactive Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[32px] border border-[#E5E0D5] p-7 sm:p-10 shadow-sm">
            
            <span className="text-xs font-bold text-[#555A47] uppercase tracking-wider block mb-2">
              Formulir Advokasi Publik
            </span>
            <h3 className="font-cormorant text-2xl sm:text-3xl lg:text-4xl font-normal text-[#24271D] leading-snug">
              Sampaikan Aspirasi, Keluhan, atau <span className="italic">Gagasan Regulasi.</span>
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#6A6E5F] leading-relaxed">
              Setiap pesan yang masuk akan tercatat langsung dalam sistem agregasi aspirasi fraksi dewan untuk ditelaah dan ditindaklanjuti.
            </p>

            {formSubmitted ? (
              <div className="mt-8 p-8 rounded-2xl bg-[#F0F5EC] border border-[#C5D8B8] text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-cormorant text-2xl font-bold text-[#204018]">
                  Aspirasi Berhasil Terkirim!
                </h4>
                <p className="text-xs sm:text-sm text-[#3E5C34] max-w-md mx-auto leading-relaxed">
                  Terima kasih atas partisipasi aktif Anda. Pesan aspirasi telah diteruskan kepada tim staf ahli fraksi <strong>{officialFullName}</strong> untuk verifikasi dan tindak lanjut.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({
                      name: '',
                      phone: '',
                      email: '',
                      category: 'Infrastruktur & Jalan',
                      location: '',
                      message: '',
                    });
                  }}
                  className="mt-4 px-6 py-2.5 rounded-full bg-[#272A20] text-white text-xs font-bold hover:bg-[#3D4231] transition-all cursor-pointer"
                >
                  Kirim Aspirasi Lainnya
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#24271D] mb-1.5">
                      Nama Lengkap Konstituen *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#DFDACB] text-xs sm:text-sm text-[#24271D] focus:outline-none focus:border-[#4E5340]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#24271D] mb-1.5">
                      No. WhatsApp / Telepon Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#DFDACB] text-xs sm:text-sm text-[#24271D] focus:outline-none focus:border-[#4E5340]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#24271D] mb-1.5">
                      Alamat Email (Opsional)
                    </label>
                    <input
                      type="email"
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#DFDACB] text-xs sm:text-sm text-[#24271D] focus:outline-none focus:border-[#4E5340]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#24271D] mb-1.5">
                      Kategori Bidang Aspirasi *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#DFDACB] text-xs sm:text-sm text-[#24271D] focus:outline-none focus:border-[#4E5340]"
                    >
                      <option>Infrastruktur &amp; Jalan</option>
                      <option>Pertanian, Irigasi &amp; Pupuk</option>
                      <option>Pendidikan &amp; Beasiswa</option>
                      <option>Pelayanan Kesehatan</option>
                      <option>Bantuan Sosial &amp; UMKM</option>
                      <option>Regulasi &amp; Perda Daerah</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24271D] mb-1.5">
                    Kecamatan / Desa di Wilayah Dapil {dapil} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kec. Sukamaju, Desa Karanganyar RT 03/02"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#DFDACB] text-xs sm:text-sm text-[#24271D] focus:outline-none focus:border-[#4E5340]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24271D] mb-1.5">
                    Isi Aspirasi / Uraian Masalah *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tuliskan secara jelas pokok masalah, kebutuhan warga, atau saran kebijakan yang ingin disampaikan..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F3] border border-[#DFDACB] text-xs sm:text-sm text-[#24271D] focus:outline-none focus:border-[#4E5340] resize-y"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#272A20] text-white text-xs sm:text-sm font-bold hover:bg-[#3D4231] transition-all inline-flex items-center justify-center gap-2 shadow-md group cursor-pointer"
                >
                  <span>Kirimkan Aspirasi Sekarang</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

              </form>
            )}

          </div>
        </div>

      </div>

      {/* ─── 2. 4-STEP ALUR ADVOKASI ASPIRASI (MATCHING NAYA PROCESS ROW) ─── */}
      <section className="pt-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#555A47] uppercase tracking-wider block mb-2">
            Mekanisme Transparansi
          </span>
          <h3 className="font-cormorant text-3xl sm:text-4xl font-normal text-[#24271D] leading-tight">
            Alur Penanganan <span className="italic">Aspirasi Konstituen.</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflows.map((wf) => (
            <div
              key={wf.step}
              className="bg-white rounded-[26px] p-6 border border-[#E5E0D5] flex flex-col justify-between"
            >
              <div>
                <span className="font-cormorant text-2xl font-bold text-[#4E5340] block mb-2">
                  Tahap {wf.step}
                </span>
                <h4 className="font-cormorant text-lg font-bold text-[#24271D] mb-1.5">
                  {wf.title}
                </h4>
                <p className="text-xs text-[#6A6E5F] leading-relaxed">
                  {wf.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
