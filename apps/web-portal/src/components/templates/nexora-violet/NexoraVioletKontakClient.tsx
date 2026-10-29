'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Building2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { NexoraVioletShell } from './NexoraVioletShell';
import { getNexoraMemberInfo, useNexoraHref } from './utils';
import { submitAspiration } from '@/lib/api';

interface NexoraVioletKontakClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function NexoraVioletKontakClient({
  member,
  theme,
  subdomain,
}: NexoraVioletKontakClientProps) {
  const info = getNexoraMemberInfo(member, theme, subdomain);
  const href = useNexoraHref(subdomain);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Aspirasi Infrastruktur & Jalan',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitAspiration({
        subdomainSlug: subdomain || 'polaris',
        name: form.name,
        email: form.email,
        phone: form.phone,
        category: form.topic,
        content: `[Topik: ${form.topic}] ${form.message}`,
      } as any);
      setSuccess(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        topic: 'Aspirasi Infrastruktur & Jalan',
        message: '',
      });
    } catch (err: any) {
      setError('Gagal mengirimkan aspirasi. Silakan periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <NexoraVioletShell member={member} theme={theme} subdomain={subdomain} activePage="kontak">
      {/* ========================================================= */}
      {/* HEADER BANNER: SIGNATURE NEXORA VIOLET PALETTE           */}
      {/* ========================================================= */}
      <div className="w-full bg-gradient-to-b from-[#ECE6FD] via-[#F4F0FF] to-white border-b border-purple-100/90 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-sm border border-purple-200/80 text-[#7048E8] text-xs font-bold uppercase tracking-wider shadow-xs">
            <MessageSquare className="w-4 h-4" />
            <span>Kanal Aspirasi &amp; Sekretariat Resmi</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-serif italic text-slate-800 tracking-tight">
                Hubungi Staf Ahli
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#7B61FF] tracking-tight leading-none uppercase">
                KONTAK DEWAN
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-md">
              Sampaikan usulan, laporan masalah lingkungan, serta permohonan audiensi langsung kepada {info.fullName}.
            </p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="px-6 sm:px-10 lg:px-16 py-12 sm:py-16 max-w-6xl mx-auto space-y-16">
        {/* 2-Column Grid: Left Contact Info, Right Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Office & Hotline Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-purple-50/60 border border-purple-100 space-y-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">
                Sekretariat & Posko Perwakilan
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-[#7048E8] shrink-0 shadow-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Kantor Parlemen</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{info.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-[#7048E8] shrink-0 shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Email Resmi</div>
                    <a href={`mailto:${info.email}`} className="font-semibold text-[#7048E8] hover:underline mt-0.5 block">
                      {info.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-[#7048E8] shrink-0 shadow-sm">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Hotline Posko Dapil</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{info.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-[#7048E8] shrink-0 shadow-sm">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Jam Pelayanan</div>
                    <div className="font-semibold text-slate-900 mt-0.5">Senin - Jumat: 08.30 - 17.00 WIB</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-100 flex items-center gap-2 text-xs font-semibold text-[#7048E8]">
                <ShieldCheck className="w-4 h-4" />
                <span>Setiap laporan diproses oleh tim ahli terverifikasi</span>
              </div>
            </div>
          </div>

          {/* Right Column: Citizen Aspiration Submission Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Formulir Aspirasi & Pengaduan Warga
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Kirimkan aspirasi pembangunan, kritik kebijakan, atau permohonan pendampingan.
                </p>
              </div>

              {success && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Aspirasi Anda berhasil dikirimkan ke tim staf dewan. Terima kasih atas partisipasi aktif Anda!</span>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Contoh: Budi Prasetyo"
                      className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/40 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7048E8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nomor Telepon / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/40 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7048E8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Alamat Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="nama@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/40 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7048E8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Topik Aspirasi</label>
                    <select
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/40 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7048E8]"
                    >
                      <option>Aspirasi Infrastruktur & Jalan</option>
                      <option>Bantuan UMKM & Akses Modal</option>
                      <option>Pendidikan & Fasilitas Sekolah</option>
                      <option>Kesehatan & BPJS Warga</option>
                      <option>Pertanian & Irigasi Desa</option>
                      <option>Pengaduan Pelayanan Publik</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Isi Pesan / Aspirasi</label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Jelaskan aspirasi atau persoalan Anda secara detail beserta lokasi/wilayah RT/RW..."
                    className="w-full px-4 py-2.5 rounded-xl border border-purple-100 bg-purple-50/40 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7048E8]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-[#7048E8] hover:bg-[#5F3DC4] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Mengirimkan Aspirasi...' : 'Kirim Aspirasi Sekarang'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </NexoraVioletShell>
  );
}
