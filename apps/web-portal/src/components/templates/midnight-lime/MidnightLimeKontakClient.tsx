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
} from 'lucide-react';

interface MidnightLimeKontakClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function MidnightLimeKontakClient({
  member,
  theme,
  subdomain,
}: MidnightLimeKontakClientProps) {
  const primaryColor = theme?.primaryHexColor || '#D4F63D';
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
    <div className="py-12 sm:py-16 bg-[#0C111F] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4F63D]">
                Layanan Aspirasi Parlemen
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Saluran Pengaduan Warga
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Setiap aduan dan aspirasi masyarakat akan diproses oleh staf ahli {officialFullName} guna dibahas dalam agenda rapat kerja komisi.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#131B2D] border border-white/5 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#D4F63D]/20 text-[#D4F63D] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Kantor Fraksi &amp; Komisi</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Gedung Parlemen Daerah, Fraksi DPRD
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#131B2D] border border-white/5 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#D4F63D]/20 text-[#D4F63D] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">WhatsApp Aspirasi</h4>
                  <p className="text-xs text-[#D4F63D] font-mono font-bold mt-1">{officialPhone}</p>
                  <p className="text-[10px] text-slate-500">Senin - Jumat: 08.00 - 16.00 WIB</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#131B2D] border border-white/5 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#D4F63D]/20 text-[#D4F63D] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Email Korespondensi</h4>
                  <p className="text-xs text-slate-300 font-mono mt-1">{officialEmail}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#131B2D] border border-white/10 shadow-2xl">
              {formSubmitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Aspirasi Telah Diterima</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Terima kasih. Pengaduan Anda berhasil dicatat dalam register konstituen {dapil}. Tim advokasi akan menindaklanjuti sesegera mungkin.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Formulir Pengaduan Mandat</h3>
                    <p className="text-xs text-slate-400">
                      Silakan isi formulir ini untuk menyampaikan usulan atau kendala pelayanan publik.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nama sesuai KTP"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4F63D] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Nomor WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0812xxxxxxx"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4F63D] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Kategori Isu</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C263B] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4F63D] transition-colors"
                    >
                      <option value="Infrastruktur & Jalan">Infrastruktur &amp; Jalan Rusak</option>
                      <option value="Kesehatan & BPJS">Kesehatan &amp; Fasilitas BPJS</option>
                      <option value="Pendidikan & Beasiswa">Pendidikan &amp; Beasiswa</option>
                      <option value="Bantuan Sosial">Bantuan Sosial &amp; Bibit Pertanian</option>
                      <option value="UMKM & Ekonomi">UMKM &amp; Izin Usaha</option>
                      <option value="Lainnya">Lainnya / Advokasi Hukum</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Uraian Aspirasi</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Jelaskan secara rinci permasalahan atau usulan Anda..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4F63D] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl text-black font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Kirimkan Aspirasi
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
