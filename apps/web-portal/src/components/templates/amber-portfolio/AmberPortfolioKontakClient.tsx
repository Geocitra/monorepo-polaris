'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

interface AmberPortfolioKontakClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function AmberPortfolioKontakClient({
  member,
  theme,
  subdomain,
}: AmberPortfolioKontakClientProps) {
  const primaryColor = theme?.primaryHexColor || '#EA580C';
  const officialFullName =
    member?.fullName || theme?.officialFullName || 'Dr. Jonanda P. A. B';
  const dapil =
    member?.dapilName || member?.customDapilName || member?.customDapil || 'Dapil I';
  const officialEmail = `aspirasi@${subdomain || 'jonandabrahman'}.polaris.id`;
  const officialPhone = '+62 812-3456-7890';
  const instagramUsername =
    member?.instagramHandle?.replace(/^@/, '') ||
    member?.username ||
    subdomain ||
    'jonandabrahman';

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'Infrastruktur & Jalan',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        name: '',
        phone: '',
        category: 'Infrastruktur & Jalan',
        message: '',
      });
    }, 3000);
  };

  return (
    <div className="py-12 sm:py-16 bg-[#0A0908] text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Office Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
                Pusat Layanan Aspirasi
              </span>
              <h2 className="font-bebas text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight">
                Salurkan Aspirasi &amp; Aduan Warga
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-sans">
                Setiap laporan masyarakat diverifikasi secara akuntabel oleh tim advokasi {officialFullName} untuk diteruskan ke rapat komisi dan dinas terkait.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#141210] border border-white/10 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Kantor Aspirasi Dapil</h4>
                  <p className="text-xs text-stone-400 mt-1">
                    Gedung Fraksi DPRD, Jl. Medan Merdeka / Parlemen Daerah
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#141210] border border-white/10 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hotline WhatsApp Dewan</h4>
                  <p className="text-xs text-orange-400 font-bold mt-1">{officialPhone}</p>
                  <p className="text-[10px] text-stone-500">Senin - Jumat: 08.00 - 16.00 WIB</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#141210] border border-white/10 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Surat Elektronik Resmi</h4>
                  <p className="text-xs text-stone-300 font-mono mt-1">{officialEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Submission Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141210] border border-white/10 shadow-2xl">
              {formSubmitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Aspirasi Telah Diterima</h3>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                    Terima kasih. Laporan Anda berhasil dicatat dalam register konstituen {dapil}. Kami akan menindaklanjuti sesegera mungkin.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Formulir Pengaduan &amp; Aspirasi</h3>
                    <p className="text-xs text-stone-400">
                      Silakan isi formulir resmi ini untuk menyampaikan kendala atau usulan kebijakan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-300">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nama sesuai KTP"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-300">Nomor Telepon / WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0812xxxxxxx"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">Kategori Isu</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1815] border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="Infrastruktur & Jalan">Infrastruktur &amp; Jalan Lingkungan</option>
                      <option value="Pendidikan & Beasiswa">Pendidikan &amp; Fasilitas Sekolah</option>
                      <option value="Kesehatan & BPJS">Kesehatan &amp; Pelayanan Rumah Sakit</option>
                      <option value="Bantuan Sosial">Bantuan Sosial &amp; Program Keluarga Harapan</option>
                      <option value="UMKM & Ekonomi">Perizinan &amp; Modal UMKM</option>
                      <option value="Lainnya">Lainnya / Advokasi Hukum</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-300">Uraian Aspirasi Lengkap</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Jelaskan secara rinci lokasi, kronologi, atau usulan kebijakan Anda..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Kirim Aspirasi ke Parlemen
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
