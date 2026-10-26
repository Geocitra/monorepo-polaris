'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Instagram, Copy, Check, Send, CheckCircle2 } from 'lucide-react';
import { CrimsonLabel, CrimsonButton } from './CrimsonNoirShell';
import { getCrimsonMemberInfo } from './utils';

interface CrimsonNoirKontakClientProps {
  member: any;
  theme?: any;
  subdomain?: string;
}

const CATEGORIES = [
  'Infrastruktur & Jalan',
  'Pendidikan',
  'Kesehatan',
  'Ekonomi & UMKM',
  'Pertanian & Pangan',
  'Bantuan Hukum',
  'Lainnya',
];

export function CrimsonNoirKontakClient({ member, theme, subdomain }: CrimsonNoirKontakClientProps) {
  const info = getCrimsonMemberInfo(member, theme, subdomain);
  const [copied, setCopied] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', category: CATEGORIES[0], location: '', message: '' });

  const copy = (key: string, value: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const channels = [
    { key: 'email', icon: Mail, label: 'Email Aspirasi', value: info.officialEmail, href: `mailto:${info.officialEmail}` },
    { key: 'phone', icon: Phone, label: 'WhatsApp Posko', value: info.officialPhone, href: `https://wa.me/${info.officialPhone.replace(/\D/g, '')}` },
    { key: 'ig', icon: Instagram, label: 'Instagram', value: `@${info.instagramUsername}`, href: `https://instagram.com/${info.instagramUsername}` },
    { key: 'addr', icon: MapPin, label: 'Posko Aspirasi', value: `Rumah Aspirasi ${info.dapil}`, href: undefined },
    { key: 'hour', icon: Clock, label: 'Jam Layanan', value: 'Senin – Jumat, 09.00 – 16.00', href: undefined },
  ];

  const inputCls =
    'w-full px-3.5 py-2.5 rounded-[3px] bg-[#0F0F0F] border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D62828] transition-colors';

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const steps = [
    { n: '01', t: 'Registrasi', d: 'Aspirasi dicatat dan diverifikasi tim staf ahli.' },
    { n: '02', t: 'Telaah', d: 'Kajian regulasi dan pengecekan kondisi lapangan.' },
    { n: '03', t: 'Advokasi', d: 'Diangkat dalam rapat komisi, RDPU, atau banggar.' },
    { n: '04', t: 'Laporan Balik', d: 'Hasil tindak lanjut dikabarkan kepada pelapor.' },
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-6 lg:px-10 py-14 sm:py-16 space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Channels */}
        <div className="lg:col-span-5 space-y-3">
          <CrimsonLabel>Kanal Resmi</CrimsonLabel>
          <h2 className="font-outfit font-extrabold text-2xl text-white">Hubungi Langsung</h2>
          <div className="pt-3 space-y-3">
            {channels.map(({ key, icon: Icon, label, value, href }) => (
              <div key={key} className="group flex items-center gap-4 p-4 rounded-[4px] bg-[#1A1A1A] border border-white/5 hover:border-[#D62828]/50 transition-colors">
                <span className="w-10 h-10 rounded-[4px] bg-[#D62828]/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#D62828]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-white hover:text-[#E04848] truncate block">{value}</a>
                  ) : (
                    <div className="text-xs font-semibold text-white truncate">{value}</div>
                  )}
                </div>
                {(key === 'email' || key === 'phone') && (
                  <button type="button" onClick={() => copy(key, value)} aria-label={`Salin ${label}`} className="p-2 rounded-[3px] text-white/50 hover:text-white hover:bg-white/5 cursor-pointer">
                    {copied === key ? <Check className="w-3.5 h-3.5 text-[#E04848]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-[4px] bg-[#1A1A1A] border border-white/5">
            {sent ? (
              <div className="py-14 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#D62828] mx-auto" />
                <h3 className="mt-4 font-outfit font-extrabold text-xl text-white">Aspirasi Terkirim!</h3>
                <p className="mt-2 text-xs text-white/60 max-w-sm mx-auto">
                  Terima kasih, {form.name || 'Bapak/Ibu'}. Tim kami akan menindaklanjuti dan menghubungi Anda dalam 3×24 jam.
                </p>
                <CrimsonButton onClick={() => { setSent(false); setForm({ ...form, message: '' }); }} className="mt-6">Kirim Aspirasi Lain</CrimsonButton>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
                <div>
                  <CrimsonLabel>Formulir Aspirasi</CrimsonLabel>
                  <h2 className="mt-1 font-outfit font-extrabold text-2xl text-white">Sampaikan Aspirasi Anda</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input id="crimson-name" required placeholder="Nama lengkap" value={form.name} onChange={set('name')} className={inputCls} />
                  <input id="crimson-phone" required placeholder="No. WhatsApp" value={form.phone} onChange={set('phone')} className={inputCls} />
                  <input id="crimson-email" type="email" placeholder="Email (opsional)" value={form.email} onChange={set('email')} className={inputCls} />
                  <select id="crimson-category" value={form.category} onChange={set('category')} className={inputCls}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <input id="crimson-location" placeholder="Desa / Kecamatan" value={form.location} onChange={set('location')} className={inputCls} />
                <textarea id="crimson-message" required rows={5} placeholder="Ceritakan aspirasi atau keluhan Anda..." value={form.message} onChange={set('message')} className={`${inputCls} resize-none`} />
                <CrimsonButton type="submit" className="w-full py-2.5">
                  <Send className="w-3.5 h-3.5" /> Kirim Aspirasi
                </CrimsonButton>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Workflow */}
      <section>
        <CrimsonLabel>Alur Tindak Lanjut</CrimsonLabel>
        <h2 className="mt-1 font-outfit font-extrabold text-2xl text-white">Bagaimana Aspirasi Anda Diproses</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="p-6 rounded-[4px] bg-[#1A1A1A] border border-white/5 hover:border-[#D62828]/50 transition-colors">
              <div className="font-outfit font-extrabold text-3xl text-[#D62828]">{s.n}</div>
              <h3 className="mt-2 text-xs font-bold text-white">{s.t}</h3>
              <p className="mt-1.5 text-[10px] text-white/55 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
