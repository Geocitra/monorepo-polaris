'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Building2,
  Compass,
  FileText,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface StudioEditorialKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

export function StudioEditorialKontakClient({
  member,
  theme,
  subdomain,
}: StudioEditorialKontakClientProps) {
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
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
        nik: '',
        phone: '',
        email: '',
        category: 'Infrastruktur',
        message: '',
      });
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 space-y-16">
      
      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 1: CONTACT INFORMATION CARDS
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Rumah Aspirasi */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-300 shadow-2xs space-y-4 hover:border-stone-500 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-1">
              Kantor Perwakilan
            </span>
            <h3 className="font-serif text-lg font-bold text-stone-950">
              Rumah Aspirasi Dapil
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            Jl. Raya Parlemen No. 45, Kompleks Perkantoran Daerah Pemilihan {dapil}.
          </p>
        </div>

        {/* Card 2: WhatsApp Posko */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-300 shadow-2xs space-y-4 hover:border-stone-500 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-1">
              Hotline Cepat
            </span>
            <h3 className="font-serif text-lg font-bold text-stone-950">
              WhatsApp Layanan
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            {officialPhone}
            <span className="block text-[11px] text-stone-500 mt-1">
              Respon cepat tim verifikasi aduan warga.
            </span>
          </p>
        </div>

        {/* Card 3: Email Parlemen */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-300 shadow-2xs space-y-4 hover:border-stone-500 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-1">
              Surel Resmi
            </span>
            <h3 className="font-serif text-lg font-bold text-stone-950">
              Surat &amp; Audiensi
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans truncate">
            {officialEmail}
            <span className="block text-[11px] text-stone-500 mt-1">
              Pengiriman naskah aspirasi formal.
            </span>
          </p>
        </div>

        {/* Card 4: Jam Layanan */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-300 shadow-2xs space-y-4 hover:border-stone-500 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#EDEAE4] text-stone-950 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-1">
              Waktu Operasional
            </span>
            <h3 className="font-serif text-lg font-bold text-stone-950">
              Senin – Jumat
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            Pukul 08.30 – 16.30 WIB
            <span className="block text-[11px] text-stone-500 mt-1">
              Sabtu khusus agenda audiensi terjadwal.
            </span>
          </p>
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 2: 4 TAHAP ALUR PENANGANAN ASPIRASI
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-300 shadow-sm space-y-8">
        <div className="max-w-2xl">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-stone-500 block mb-2">
            STANDAR OPERASIONAL LAYANAN
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight">
            Alur Pengawalan &amp; Tindak Lanjut Aspirasi
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            Setiap laporan masyarakat dicatat dengan nomor registrasi unik dan dikawal langsung oleh staf ahli dewan hingga ke kementerian/dinas teknis terkait.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-[#EDEAE4]/70 border border-stone-300/80 space-y-3">
            <span className="font-serif text-2xl font-bold text-stone-950 block">01</span>
            <h4 className="font-serif text-base font-bold text-stone-950">
              Registrasi &amp; Verifikasi
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Data aspirasi konstituen diverifikasi keabsahan identitas wilayah dan relevansinya terhadap fungsi parlemen.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#EDEAE4]/70 border border-stone-300/80 space-y-3">
            <span className="font-serif text-2xl font-bold text-stone-950 block">02</span>
            <h4 className="font-serif text-base font-bold text-stone-950">
              Telaah Pokok Pikiran
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Staf ahli meneliti aspek regulasi anggaran APBD/APBN dan menyusun naskah rekomendasi kebijakan resmi.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#EDEAE4]/70 border border-stone-300/80 space-y-3">
            <span className="font-serif text-2xl font-bold text-stone-950 block">03</span>
            <h4 className="font-serif text-base font-bold text-stone-950">
              Advokasi Komisi
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Isu diperjuangkan dalam Rapat Dengar Pendapat (RDP) komisi bersama dinas teknis atau kementerian terkait.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#EDEAE4]/70 border border-stone-300/80 space-y-3">
            <span className="font-serif text-2xl font-bold text-stone-950 block">04</span>
            <h4 className="font-serif text-base font-bold text-stone-950">
              Laporan Akuntabilitas
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Warga pelapor menerima notifikasi hasil tindak lanjut serta status realisasi anggaran secara berkala.
            </p>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          SECTION 3: FORMULIR PENYAMPAIAN ASPIRASI
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Side: Statement */}
        <div className="lg:col-span-5 space-y-5">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-stone-500 block">
            FORMULIR RESMI
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 leading-tight">
            Kirimkan Pokok Pikiran &amp; Masukan Anda.
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Gunakan formulir ini untuk menyampaikan usulan perbaikan fasilitas umum, masalah agraria, kebutuhan subsidi tani, beasiswa pendidikan, atau kritik kebijakan publik di Daerah Pemilihan {dapil}.
          </p>

          <div className="p-5 rounded-2xl bg-[#DDD7CD] border border-stone-300 text-stone-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-950">
              <ShieldCheck className="w-4 h-4 text-stone-700" />
              <span>Jaminan Privasi &amp; Perlindungan Data</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed font-sans">
              Identitas NIK dan kontak pengadu dilindungi secara ketat sesuai peraturan perlindungan data pribadi dan hanya digunakan untuk keperluan verifikasi lapangan staf dewan.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-10 border border-stone-300 shadow-sm">
          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-stone-950 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7 text-stone-200" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-950">
                Aspirasi Berhasil Terkirim
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed font-sans">
                Terima kasih atas partisipasi aktif Anda. Laporan telah masuk ke antrean staf ahli {officialFullName} dan akan diproses dalam waktu 2x24 jam kerja.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 bg-stone-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Kirim Aspirasi Baru
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama sesuai KTP"
                    className="w-full px-4 py-2.5 bg-[#EDEAE4]/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-950 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-2.5 bg-[#EDEAE4]/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-950 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Email Aktif
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-2.5 bg-[#EDEAE4]/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-950 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Kategori Aduan *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#EDEAE4]/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-950 transition-colors"
                  >
                    <option value="Infrastruktur">Infrastruktur &amp; Jalan</option>
                    <option value="Pendidikan">Pendidikan &amp; Beasiswa</option>
                    <option value="Kesehatan">Kesehatan &amp; BPJS</option>
                    <option value="Pertanian">Pertanian &amp; Pupuk Subsidi</option>
                    <option value="Bantuan Sosial">Bantuan Sosial &amp; UMKM</option>
                    <option value="Regulasi">Kritik Regulasi Daerah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Uraian Pokok Masukan / Aspirasi *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Jelaskan kronologi, lokasi spesifik, dan usulan tindak lanjut yang diharapkan..."
                  className="w-full px-4 py-3 bg-[#EDEAE4]/50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-950 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-stone-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
