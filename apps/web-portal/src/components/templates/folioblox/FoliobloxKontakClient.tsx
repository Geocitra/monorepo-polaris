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
  Send,
} from 'lucide-react';

interface FoliobloxKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function FoliobloxKontakClient({
  member,
  theme,
  subdomain,
}: FoliobloxKontakClientProps) {
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
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B';
  const officialEmail = `aspirasi@${subdomain || 'polaris'}.id`;
  const officialPhone = '+62 812-3456-7890';

  const rawDapil = member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I';
  const dapil = rawDapil.replace(/_/g, ' ');

  const rawParty = member?.partyAffiliation || 'Fraksi Parlemen';
  const party = rawParty.replace(/_/g, ' ');

  const rawCommission = member?.commissionName || 'KOMISI I (PEMERINTAHAN & HUKUM)';
  const commissionName = rawCommission.replace(/_/g, ' ');

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
      title: 'Pencatatan & Verifikasi',
      desc: 'Setiap aspirasi konstituen diregistrasi dalam sistem agregasi parlemen dan diverifikasi oleh tim ahli.',
    },
    {
      step: '02',
      title: 'Kajian Yuridis & Anggaran',
      desc: 'Penelaahan aspek hukum perda serta relevansi penganggaran pos APBD daerah.',
    },
    {
      step: '03',
      title: 'Advokasi di Forum Parlemen',
      desc: 'Pengangkatan isu aspirasi dalam rapat kerja komisi dewan dan pembahasan badan anggaran.',
    },
    {
      step: '04',
      title: 'Laporan Tindak Lanjut',
      desc: 'Penyampaian perkembangan realisasi hasil perjuangan kepada pelapor secara transparan.',
    },
  ];

  return (
    <div className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16 max-w-[1600px] mx-auto space-y-16 select-text">
      
      {/* ─── 1. TWO-COLUMN LAYOUT: CONTACT DETAILS & ASPIRATION FORM ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Left Column: Direct Contact & Posko Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121212] rounded-[32px] border border-white/10 p-7 sm:p-9 shadow-xl space-y-6">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block">
              Saluran Aspirasi Langsung
            </span>

            <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white leading-snug">
              Posko Reses &amp; Layanan Konstituen
            </h3>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
              Masyarakat di Daerah Pemilihan {dapil} dapat menyampaikan laporan, usulan perbaikan layanan publik, atau permohonan audiensi melalui kanal resmi fraksi.
            </p>

            <div className="space-y-4 pt-2">
              
              {/* Alamat Posko */}
              <div className="p-4 rounded-2xl bg-[#181818] border border-white/10 flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Posko Reses Konstituen Dapil {dapil}</div>
                  <div className="text-xs text-white/60 mt-0.5 leading-relaxed">
                    Gedung Aspirasi Parlemen, Jl. Perintis Kemerdekaan No. 45, Sentra Layanan Terpadu.
                  </div>
                </div>
              </div>

              {/* WhatsApp Hotline */}
              <div className="p-4 rounded-2xl bg-[#181818] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">WhatsApp Hotline Posko</div>
                    <div className="text-xs text-white/60">{officialPhone}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="p-2 rounded-full hover:bg-white/10 text-orange-400 transition-colors cursor-pointer"
                  title="Salin Nomor"
                >
                  {copiedPhone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Email Resmi */}
              <div className="p-4 rounded-2xl bg-[#181818] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">Surat Elektronik Resmi</div>
                    <div className="text-xs text-white/60 truncate max-w-[200px]">{officialEmail}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-2 rounded-full hover:bg-white/10 text-orange-400 transition-colors cursor-pointer"
                  title="Salin Email"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Jam Operasional */}
              <div className="p-4 rounded-2xl bg-[#181818] border border-white/10 flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Jam Layanan Konstituen</div>
                  <div className="text-xs text-white/60 mt-0.5">
                    Senin – Jumat: 08.30 – 16.00 WIB <br />
                    Portal Aspirasi Digital: Aktif 24/7
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="lg:col-span-7">
          <div className="bg-[#121212] rounded-[32px] border border-white/10 p-7 sm:p-10 shadow-2xl">
            
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block mb-2">
              Formulir Suara Konstituen
            </span>
            <h3 className="font-outfit font-black text-2xl sm:text-3xl lg:text-4xl text-white leading-tight">
              Sampaikan Aspirasi, Keluhan, atau Masukan Daerah
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
              Pesan Anda akan langsung dicatat dalam sistem advokasi dewan untuk diverifikasi dan ditindaklanjuti.
            </p>

            {formSubmitted ? (
              <div className="mt-8 p-8 rounded-2xl bg-[#181818] border border-orange-500/50 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-[#FF4500] text-white flex items-center justify-center mx-auto shadow-lg">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-outfit font-black text-2xl text-white">
                  Aspirasi Berhasil Dikirimkan!
                </h4>
                <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed font-normal">
                  Terima kasih atas partisipasi aktif Anda. Pesan aspirasi telah diteruskan kepada tim staf ahli <strong>{officialFullName}</strong> untuk penelaahan.
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
                  className="mt-4 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Kirim Aspirasi Baru
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      Nama Lengkap Konstituen *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ahmad Faisal"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#181818] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      No. WhatsApp / Telepon Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#181818] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      Alamat Email (Opsional)
                    </label>
                    <input
                      type="email"
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#181818] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">
                      Kategori Isu Aspirasi *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#181818] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                    >
                      <option className="bg-[#181818]">Infrastruktur &amp; Jalan</option>
                      <option className="bg-[#181818]">Pertanian, Irigasi &amp; Pupuk</option>
                      <option className="bg-[#181818]">Pendidikan &amp; Beasiswa</option>
                      <option className="bg-[#181818]">Layanan Kesehatan</option>
                      <option className="bg-[#181818]">UMKM &amp; Bantuan Usaha</option>
                      <option className="bg-[#181818]">Regulasi &amp; Perda Daerah</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Kecamatan / Desa di Wilayah Dapil {dapil} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kec. Cibatu, Desa Kertajaya RT 02/01"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#181818] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Isi Pesan Aspirasi / Uraian Masalah *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Jelaskan secara jelas pokok permasalahan, lokasi kejadian, atau rekomendasi perbaikan yang ingin disampaikan..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#181818] border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 resize-y"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF500A] via-[#EA3604] to-[#BF1E04] text-white text-xs sm:text-sm font-bold hover:brightness-110 transition-all inline-flex items-center justify-center gap-2 shadow-lg group cursor-pointer"
                >
                  <span>Kirimkan Aspirasi Sekarang</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

              </form>
            )}

          </div>
        </div>

      </div>

      {/* ─── 2. 4-STEP ALUR ADVOKASI PARLEMEN ─── */}
      <section className="pt-6 border-t border-white/10">
        <div className="mb-10">
          <span className="text-xs sm:text-sm font-bold text-orange-500 uppercase tracking-wider block mb-2">
            Mekanisme Transparansi
          </span>
          <h3 className="font-outfit font-black text-3xl sm:text-4xl text-white tracking-tight">
            Alur Penanganan Aspirasi Konstituen
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflows.map((wf) => (
            <div
              key={wf.step}
              className="p-6 rounded-[26px] bg-[#141414] border border-white/10 flex flex-col justify-between"
            >
              <div>
                <span className="font-outfit font-black text-2xl text-orange-500 block mb-2">
                  Tahap {wf.step}
                </span>
                <h4 className="font-outfit font-black text-lg text-white mb-1.5">
                  {wf.title}
                </h4>
                <p className="text-xs text-white/60 leading-relaxed font-normal">
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
