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
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { resolvePortalMemberData } from '@/lib/template-resolver';

interface PlatinumSlateKontakClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function PlatinumSlateKontakClient({
  member,
  theme,
  subdomain,
}: PlatinumSlateKontakClientProps) {
  const resolved = resolvePortalMemberData({
    member,
    theme,
    subdomain,
    defaultPrimaryColor: '#A0AFB7',
  });

  const officialFullName = resolved.officialFullName;
  const dapil = resolved.dapil || 'Dapil Terkait';
  const legislativeLevel = resolved.legislativeLevel;
  const officialEmail = resolved.officialEmail;
  const officialPhone = resolved.formattedPhoneNumber || resolved.phone || '';
  const instagramUsername = resolved.instagramUsername;
  const instagramUrl = resolved.instagramUrl;

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
    <div className="py-12 sm:py-16 bg-[#0D1117] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Layanan Aspirasi Parlemen
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
                Saluran Pengaduan &amp; Aspirasi Warga
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Setiap aduan dan pokok pikiran konstituen akan ditelaah oleh tim staf ahli {officialFullName} guna diusulkan dalam rapat kerja komisi dan pembahasan anggaran daerah.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#151B23] border border-white/10 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/10 text-white shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Kantor Fraksi &amp; Komisi</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Gedung Parlemen Daerah ({legislativeLevel}), Ruang Fraksi &amp; Komisi
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#151B23] border border-white/10 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/10 text-white shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">WhatsApp Aspirasi Langsung</h4>
                  <p className="text-xs text-white font-mono font-bold mt-1">{officialPhone || 'Hubungi Sekretariat'}</p>
                  <p className="text-[10px] text-slate-500">Senin - Jumat: 08.00 - 16.00 WIB</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#151B23] border border-white/10 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/10 text-white shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Surel Resmi Sekretariat</h4>
                  <p className="text-xs text-slate-300 font-mono mt-1">{officialEmail}</p>
                  <p className="text-[10px] text-slate-500">Pemberitahuan resmi dan undangan audiensi</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#151B23] border border-white/10 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/10 text-white shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Kanal Media Sosial</h4>
                  <a
                    href={instagramUrl || 'https://instagram.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white hover:underline block mt-1"
                  >
                    {instagramUsername ? `@${instagramUsername}` : 'Instagram Resmi'}
                  </a>
                  <p className="text-[10px] text-slate-500">Dokumentasi kegiatan kedewanan dan reses</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#151B23] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="space-y-2 mb-6">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Formulir Daring Advokasi
                </span>
                <h3 className="text-2xl font-bold text-white">Sampaikan Aspirasi Anda</h3>
                <p className="text-xs text-slate-400">
                  Data Anda dijamin kerahasiaannya dan hanya digunakan untuk tindak lanjut kedewanan.
                </p>
              </div>

              {formSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Aspirasi Berhasil Terkirim!</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Terima kasih telah menyalurkan aspirasi. Tim staf ahli akan memverifikasi dan menyertakannya dalam telaah komisi terkait.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Nomor WhatsApp / HP</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Contoh: 081234567890"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Bidang Isu Kebijakan</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0D1117] border border-white/10 text-xs text-white focus:outline-none focus:border-white transition-colors"
                    >
                      <option value="Infrastruktur & Jalan">Infrastruktur &amp; Jalan Poros Antardesa</option>
                      <option value="Pendidikan & Beasiswa">Pendidikan, Beasiswa &amp; Sarana Sekolah</option>
                      <option value="Kesehatan & BPJS">Kesehatan, Fasilitas Puskesmas &amp; BPJS</option>
                      <option value="UMKM & Ekonomi Rakyat">UMKM, Pelatihan Kerja &amp; Pasar Tradisional</option>
                      <option value="Pertanian & Irigasi">Pertanian, Pupuk Subsidi &amp; Irigasi Teknis</option>
                      <option value="Lainnya">Pengaduan Hukum &amp; Aspirasi Lainnya</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Uraian Pokok Pikiran / Aduan</label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Uraikan detail persoalan, lokasi kecamatan/kelurahan, dan harapan solusi..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-white via-slate-200 to-slate-400 text-slate-950 font-bold text-xs tracking-wider shadow-lg hover:shadow-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>KIRIM ASPIRASI PARLEMEN</span>
                    <Send className="w-4 h-4" />
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
