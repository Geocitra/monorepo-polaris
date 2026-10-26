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
  Building2,
} from 'lucide-react';
import { getGoldenMemberInfo } from './utils';

interface GoldenSplitKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

const CATEGORIES = [
  'Infrastruktur & Jalan Rusak',
  'Pendidikan & Beasiswa',
  'Kesehatan & Puskesmas',
  'Bantuan Usaha UMKM',
  'Pertanian & Irigasi Sawah',
  'Bantuan Hukum / Regulasi',
  'Lainnya',
];

export function GoldenSplitKontakClient({
  member,
  theme,
  subdomain,
}: GoldenSplitKontakClientProps) {
  const info = getGoldenMemberInfo(member, theme, subdomain);
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
      label: 'Jam Operasional Layanan',
      value: 'Senin – Jumat, 08.30 – 16.30 WIB',
      actionText: undefined,
      href: undefined,
    },
  ];

  const workflow = [
    {
      step: '01',
      title: 'Pencatatan Aspirasi',
      desc: 'Setiap pengaduan dicatat ke sistem inventarisasi aspirasi dewan dan diverifikasi tim staf ahli.',
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
    <div className="max-w-[1140px] mx-auto px-6 lg:px-10 py-16 space-y-16">
      
      {/* ─── DUA KOLOM: KANAL KONTAK & FORMULIR ASPIRASI ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Kolom Kiri: Informasi Kanal Resmi */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl text-white">
              Kanal Resmi Aspirasi
            </h2>
            <div className="w-16 h-1 bg-[#FFA800] mt-2 rounded-full" />
            <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Silakan hubungi posko pelayanan kami melalui saluran resmi berikut atau langsung isi formulir di samping.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {channels.map(({ key, icon: Icon, label, value, href: linkHref }) => (
              <div
                key={key}
                className="p-4 rounded-xl bg-[#262626] border border-white/5 hover:border-[#FFA800]/50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-10 h-10 rounded-lg bg-[#FFA800]/15 text-[#FFA800] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                      {label}
                    </div>
                    {linkHref ? (
                      <a
                        href={linkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-semibold text-white hover:text-[#FFA800] transition-colors truncate block"
                      >
                        {value}
                      </a>
                    ) : (
                      <div className="text-xs sm:text-sm font-semibold text-white truncate">
                        {value}
                      </div>
                    )}
                  </div>
                </div>

                {(key === 'phone' || key === 'email') && (
                  <button
                    type="button"
                    onClick={() => handleCopy(key, value)}
                    className="p-2 rounded bg-white/5 hover:bg-[#FFA800] hover:text-[#1E1E1E] text-neutral-300 transition-colors cursor-pointer shrink-0"
                    aria-label={`Salin ${label}`}
                  >
                    {copiedKey === key ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Formulir Pengaduan / Aspirasi */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-10 rounded-2xl bg-[#262626] border border-white/5 shadow-2xl">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-14 h-14 text-[#FFA800] mx-auto animate-bounce" />
                <h3 className="font-outfit font-extrabold text-2xl text-white">
                  Aspirasi Berhasil Terkirim!
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                  Terima kasih, <strong>{formData.name || 'Bapak/Ibu'}</strong>. Aspirasi Anda telah dicatat ke dalam buku register posko pengaduan dewan. Tim staf ahli akan menelaah dan mengabari Anda melalui nomor kontak yang diberikan.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ ...formData, message: '' });
                    }}
                    className="px-6 py-2.5 rounded bg-[#FFA800] hover:bg-[#E09400] text-[#1E1E1E] text-xs font-bold uppercase tracking-wider transition-colors shadow"
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
                  <h3 className="font-outfit font-extrabold text-xl text-white">
                    Formulir Aspirasi Konstituen
                  </h3>
                  <div className="w-12 h-0.5 bg-[#FFA800] mt-1.5 rounded-full" />
                  <p className="text-xs text-neutral-400 mt-2">
                    Laporan Anda akan ditindaklanjuti secara langsung oleh komisi dewan terkait.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Nama Anda"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#1E1E1E] border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FFA800] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#1E1E1E] border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FFA800] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                      Kategori Isu / Aspirasi *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#1E1E1E] border border-white/10 text-xs text-white focus:outline-none focus:border-[#FFA800] transition-colors"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                      Lokasi / Desa / Kecamatan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Desa Sukamaju, Kec. Waru"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#1E1E1E] border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FFA800] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                    Uraian Pokok Aspirasi / Persoalan *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Jelaskan secara ringkas persoalan, usulan program, atau aspirasi yang ingin Anda sampaikan..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#1E1E1E] border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FFA800] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-[#FFA800] hover:bg-[#E09400] text-[#1E1E1E] text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Aspirasi Resmi Sekarang</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* ─── ALUR KERJA ADVOKASI ASPIRASI ─── */}
      <section className="bg-[#242424] p-8 sm:p-12 rounded-2xl border border-white/5 space-y-8">
        <div>
          <h3 className="font-outfit font-extrabold text-2xl text-white">
            Alur Tindak Lanjut Aspirasi Rakyat
          </h3>
          <div className="w-16 h-1 bg-[#FFA800] mt-2 rounded-full" />
          <p className="text-xs text-neutral-400 mt-2">
            Mekanisme transparan pengawalan pengaduan dari warga hingga persidangan komisi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflow.map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-xl bg-[#1E1E1E] border border-white/5 space-y-2 hover:border-[#FFA800]/50 transition-colors"
            >
              <div className="font-outfit font-black text-3xl text-[#FFA800]">
                {item.step}
              </div>
              <h4 className="font-outfit font-bold text-sm text-white">{item.title}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
