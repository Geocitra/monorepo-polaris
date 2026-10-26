'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Instagram,
  Copy,
  Check,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { getBlushMemberInfo } from './utils';

interface BlushEditorialKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

const CATEGORIES = [
  'Infrastruktur & Jalan Rusak',
  'Pendidikan & Beasiswa',
  'Kesehatan & Fasilitas RS',
  'Bantuan Usaha UMKM & Pertanian',
  'Pengawasan Perda & Bantuan Hukum',
  'Lainnya',
];

export function BlushEditorialKontakClient({
  member,
  theme,
  subdomain,
}: BlushEditorialKontakClientProps) {
  const info = getBlushMemberInfo(member, theme, subdomain);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: CATEGORIES[0],
    location: '',
    message: '',
  });

  const handleCopy = (key: string, value: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const channels = [
    {
      key: 'phone',
      icon: Phone,
      label: 'WhatsApp Posko Reses',
      value: info.officialPhone,
      actionText: 'Kirim Pesan',
      href: `https://wa.me/${info.officialPhone.replace(/\D/g, '')}`,
    },
    {
      key: 'email',
      icon: Mail,
      label: 'Email Resmi Aspirasi',
      value: info.officialEmail,
      actionText: 'Kirim Email',
      href: `mailto:${info.officialEmail}`,
    },
    {
      key: 'ig',
      icon: Instagram,
      label: 'Instagram Resmi',
      value: `@${info.instagramUsername}`,
      actionText: 'Buka Profil',
      href: `https://instagram.com/${info.instagramUsername}`,
    },
    {
      key: 'loc',
      icon: MapPin,
      label: 'Daerah Pemilihan',
      value: info.dapil,
      actionText: undefined,
      href: undefined,
    },
    {
      key: 'hours',
      icon: Clock,
      label: 'Jam Operasional Posko',
      value: 'Senin – Jumat, 08.30 – 16.30 WIB',
      actionText: undefined,
      href: undefined,
    },
  ];

  const workflow = [
    {
      step: '01',
      title: 'Pencatatan Aspirasi',
      desc: 'Setiap pengaduan dicatat ke sistem register aspirasi dewan dan diverifikasi tim staf ahli.',
    },
    {
      step: '02',
      title: 'Kajian & Verifikasi Lapangan',
      desc: 'Pengecekan kesesuaian kewenangan perda, telaah anggaran, atau verifikasi kondisi faktual di lapangan.',
    },
    {
      step: '03',
      title: 'Advokasi di Komisi',
      desc: 'Diangkat dalam rapat kerja bersama dinas mitra, rapat dengar pendapat (RDPU), atau pembahasan Banggar.',
    },
    {
      step: '04',
      title: 'Laporan Balik ke Konstituen',
      desc: 'Pemberitahuan hasil tindak lanjut dan perkembangan realisasi disampaikan kembali kepada warga pelapor.',
    },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-6 lg:px-10 py-16 space-y-16">
      
      {/* ─── DUA KOLOM: KANAL KONTAK & FORMULIR ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Kolom Kiri: Informasi Kanal Resmi */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
              KANAL RESMI
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#332A26]">
              Hubungi Posko Aspirasi
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#7A6B63] leading-relaxed">
              Silakan hubungi posko pelayanan kami melalui saluran resmi berikut atau langsung isi formulir di samping.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {channels.map(({ key, icon: Icon, label, value, href: linkHref }) => (
              <div
                key={key}
                className="p-4 rounded-2xl bg-white border border-[#EDE5DA] shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-10 h-10 rounded-xl bg-[#FAF0EC] text-[#D47A6A] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold text-[#8C7D73] tracking-wider">
                      {label}
                    </div>
                    {linkHref ? (
                      <a
                        href={linkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-semibold text-[#332A26] hover:text-[#D47A6A] transition-colors truncate block"
                      >
                        {value}
                      </a>
                    ) : (
                      <div className="text-xs sm:text-sm font-semibold text-[#332A26] truncate">
                        {value}
                      </div>
                    )}
                  </div>
                </div>

                {(key === 'phone' || key === 'email') && (
                  <button
                    type="button"
                    onClick={() => handleCopy(key, value)}
                    className="p-2 rounded-lg bg-[#FAF7F2] hover:bg-[#D47A6A] hover:text-white text-[#6E635C] transition-colors cursor-pointer shrink-0"
                    aria-label={`Salin ${label}`}
                  >
                    {copiedKey === key ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Formulir Pengaduan */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#EDE5DA] shadow-lg">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-14 h-14 text-[#D47A6A] mx-auto animate-bounce" />
                <h3 className="font-serif font-bold text-2xl text-[#332A26]">
                  Aspirasi Berhasil Diterima!
                </h3>
                <p className="text-xs sm:text-sm text-[#6E635C] max-w-md mx-auto leading-relaxed">
                  Terima kasih, <strong>{formData.name || 'Bapak/Ibu'}</strong>. Aspirasi Anda telah dicatat ke dalam buku register posko pengaduan dewan. Tim staf ahli akan menelaah dan mengabari Anda melalui kontak yang diberikan.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ ...formData, message: '' });
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#D47A6A] hover:bg-[#B85E4E] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow"
                  >
                    Kirim Aspirasi Lainnya
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-4"
              >
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
                    SUARA RAKYAT
                  </span>
                  <h3 className="font-serif font-bold text-xl text-[#332A26]">
                    Formulir Aspirasi Konstituen
                  </h3>
                  <p className="text-xs text-[#7A6B63] mt-1">
                    Setiap aspirasi akan diproses dan diinventarisasi untuk bahan sidang komisi.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6E635C] block mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Nama Anda"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EDE5DA] text-xs text-[#332A26] placeholder:text-[#A89D94] focus:outline-none focus:border-[#D47A6A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6E635C] block mb-1">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EDE5DA] text-xs text-[#332A26] placeholder:text-[#A89D94] focus:outline-none focus:border-[#D47A6A] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6E635C] block mb-1">
                      Kategori Aspirasi *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EDE5DA] text-xs text-[#332A26] focus:outline-none focus:border-[#D47A6A] transition-colors"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6E635C] block mb-1">
                      Lokasi / Desa / Kecamatan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Desa Sukamaju, Kec. Waru"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EDE5DA] text-xs text-[#332A26] placeholder:text-[#A89D94] focus:outline-none focus:border-[#D47A6A] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6E635C] block mb-1">
                    Uraian Pokok Aspirasi *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tuliskan pokok persoalan, usulan perbaikan fasilitas umum, atau aspirasi yang ingin Anda sampaikan..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EDE5DA] text-xs text-[#332A26] placeholder:text-[#A89D94] focus:outline-none focus:border-[#D47A6A] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#D47A6A] hover:bg-[#B85E4E] text-white text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Aspirasi Sekarang</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* ─── ALUR TINDAK LANJUT ─── */}
      <section className="bg-white p-8 sm:p-12 rounded-3xl border border-[#EDE5DA] shadow-xs space-y-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8C7D73] block mb-1">
            AKUNTABILITAS PELAYANAN
          </span>
          <h3 className="font-serif font-bold text-2xl text-[#332A26]">
            Alur Pengawalan Aspirasi Rakyat
          </h3>
          <p className="text-xs text-[#7A6B63] mt-1">
            Mekanisme transparan penanganan laporan konstituen dari awal hingga tindak lanjut di komisi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflow.map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#EDE5DA] space-y-2 hover:border-[#D47A6A] transition-colors"
            >
              <div className="font-serif font-black text-2xl text-[#D47A6A]">
                {item.step}
              </div>
              <h4 className="font-serif font-bold text-sm text-[#332A26]">{item.title}</h4>
              <p className="text-xs text-[#7A6B63] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
