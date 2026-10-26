'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { LimeSparkle, LimeStarburst } from './CreatixLimeShell';

interface CreatixLimeKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function CreatixLimeKontakClient({
  member,
  theme,
  subdomain,
}: CreatixLimeKontakClientProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Infrastruktur',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const officialFullName =
    member?.fullName ||
    theme?.officialFullName ||
    'Dr. Ir. Sangsoro Mowo Berkah, M.Sc.';

  const rawDapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Jawa Barat I';
  const dapil = rawDapil.replace(/_/g, ' ');

  const rawLevel = member?.legislativeLevel || 'DPR RI';
  const legislativeLevel = rawLevel.replace(/_/g, ' ');

  const officialEmail = `aspirasi@${subdomain || 'jonandabrahman'}.polaris.id`;
  const officialPhone = '+62 812-3456-7890';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        category: 'Infrastruktur',
        message: '',
      });
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: CONTACT INFORMATION CARDS
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Rumah Aspirasi */}
        <div className="p-6 rounded-3xl bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/60 transition-all space-y-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#84CC16] flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#84CC16] block mb-1">
              Kantor Perwakilan
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Rumah Aspirasi Dapil
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Jl. Raya Parlemen No. 45, Kompleks Perkantoran Daerah Pemilihan {dapil}.
          </p>
        </div>

        {/* Card 2: WhatsApp Posko */}
        <div className="p-6 rounded-3xl bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/60 transition-all space-y-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#84CC16] flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#84CC16] block mb-1">
              Hotline Cepat
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              WhatsApp Layanan
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {officialPhone}
            <span className="block text-[11px] text-slate-500 mt-1">
              Layanan respon cepat verifikasi laporan warga.
            </span>
          </p>
        </div>

        {/* Card 3: Email Parlemen */}
        <div className="p-6 rounded-3xl bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/60 transition-all space-y-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#84CC16] flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#84CC16] block mb-1">
              Surel Resmi
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Surat &amp; Audiensi
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed truncate">
            {officialEmail}
            <span className="block text-[11px] text-slate-500 mt-1">
              Naskah akademik &amp; permohonan audiensi resmi.
            </span>
          </p>
        </div>

        {/* Card 4: Jam Operasional */}
        <div className="p-6 rounded-3xl bg-[#0D120D] border border-white/10 hover:border-[#84CC16]/60 transition-all space-y-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#84CC16] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#84CC16] block mb-1">
              Waktu Layanan
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Senin – Jumat
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            08.30 – 16.30 WIB
            <span className="block text-[11px] text-slate-500 mt-1">
              Sabtu khusus dialog konstituen terjadwal.
            </span>
          </p>
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 2: 4 TAHAP ALUR PENANGANAN ASPIRASI
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="p-8 sm:p-12 rounded-3xl bg-[#0D120D] border border-white/10 shadow-2xl space-y-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-[#84CC16] mb-3">
            <LimeSparkle className="w-3.5 h-3.5 text-[#84CC16]" />
            <span>Standar Layanan Parlemen</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Alur Pengawalan Aspirasi Rakyat
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Setiap aduan dan masukan warga diregistrasi secara terbuka serta dikawal oleh tim ahli dewan hingga ke kementerian/instansi terkait.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/5 space-y-3">
            <span className="text-2xl font-black text-[#84CC16] block">01</span>
            <h4 className="text-base font-bold text-white">
              Registrasi &amp; Verifikasi
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verifikasi keabsahan data kependudukan dan urgensi pokok persoalan warga di Dapil.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/5 space-y-3">
            <span className="text-2xl font-black text-[#84CC16] block">02</span>
            <h4 className="text-base font-bold text-white">
              Kajian Pokok Pikiran
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Penyusunan naskah kajian teknis dan formulasi rekomendasi alokasi anggaran APBD/APBN.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/5 space-y-3">
            <span className="text-2xl font-black text-[#84CC16] block">03</span>
            <h4 className="text-base font-bold text-white">
              Advokasi Komisi
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Penyampaian dalam Rapat Dengar Pendapat (RDP) komisi bersama mitra kementerian dan dinas terkait.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#080B08] border border-white/5 space-y-3">
            <span className="text-2xl font-black text-[#84CC16] block">04</span>
            <h4 className="text-base font-bold text-white">
              Laporan Realisasi
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Notifikasi status penyelesaian dan publikasi dokumen pertanggungjawaban kepada warga pelapor.
            </p>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: FORMULIR ASPIRASI RAKYAT
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Info */}
        <div className="lg:col-span-5 space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-[#84CC16]">
            <LimeSparkle className="w-3.5 h-3.5 text-[#84CC16]" />
            <span>Formulir Pengaduan Digital</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Sampaikan Pokok Aspirasi Anda.
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Laporkan persoalan infrastruktur jalan, usulan beasiswa anak kurang mampu, kelangkaan pupuk subsidi, atau evaluasi peraturan daerah di Daerah Pemilihan {dapil}.
          </p>

          <div className="p-5 rounded-3xl bg-[#0D120D] border border-white/10 text-slate-300 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-[#84CC16]" />
              <span>Jaminan Kerahasiaan Data Konstituen</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Seluruh data pribadi dan kontak yang dikirimkan terlindungi dengan standar keamanan terenkripsi dan hanya digunakan untuk keperluan konfirmasi tim dewan.
            </p>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7 bg-[#0D120D] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#84CC16] text-black flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white">
                Aspirasi Berhasil Diterima
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Terima kasih atas kontribusi aktif Anda. Laporan telah masuk ke antrean staf ahli {officialFullName} dan akan diproses dalam waktu 2x24 jam kerja.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-full bg-[#84CC16] text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-[#74BC12] transition-colors cursor-pointer"
              >
                Kirim Aspirasi Baru
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama sesuai KTP"
                    className="w-full px-4 py-2.5 bg-[#080B08] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#84CC16] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-2.5 bg-[#080B08] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#84CC16] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email Aktif
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-2.5 bg-[#080B08] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#84CC16] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Kategori Pengaduan *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#080B08] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#84CC16] transition-colors"
                  >
                    <option value="Infrastruktur">Infrastruktur &amp; Jalan Rusak</option>
                    <option value="Pendidikan">Pendidikan &amp; Beasiswa</option>
                    <option value="Kesehatan">Kesehatan &amp; BPJS</option>
                    <option value="Pertanian">Pertanian &amp; Pupuk Subsidi</option>
                    <option value="Bantuan Sosial">Bantuan Sosial &amp; UMKM</option>
                    <option value="Regulasi">Kritik Regulasi &amp; Hukum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Uraian Pokok Masukan / Aspirasi *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Jelaskan rincian persoalan, lokasi detail di daerah pemilihan, serta harapan solusi..."
                  className="w-full px-4 py-3 bg-[#080B08] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#84CC16] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-[#84CC16] text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-[#74BC12] transition-all shadow-xl shadow-[#84CC16]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Mengirimkan Aspirasi...</span>
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

      </section>

    </div>
  );
}
