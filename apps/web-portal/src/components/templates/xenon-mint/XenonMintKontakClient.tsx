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
  Instagram,
  Sparkles,
} from 'lucide-react';
import { XenonMintShell } from './XenonMintShell';
import { getXenonMemberInfo, useXenonHref, XENON_THEME } from './utils';
import { submitAspiration } from '@/lib/api';

interface XenonMintKontakClientProps {
  member: any;
  theme: any;
  subdomain?: string;
}

export function XenonMintKontakClient({
  member,
  theme,
  subdomain,
}: XenonMintKontakClientProps) {
  const info = getXenonMemberInfo(member, theme, subdomain);
  const href = useXenonHref(subdomain);

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
    <XenonMintShell member={member} theme={theme} subdomain={subdomain} activePage="kontak">
      <div className="px-6 sm:px-10 lg:px-12 py-12 sm:py-16 max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-[#00A86B] text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Kanal Aduan & Aspirasi Publik</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Hubungi Sekretariat Dewan & Sampaikan Aspirasi
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Sampaikan masukan pembangunan, permohonan audiensi komisi, atau keluhan layanan publik di Daerah Pemilihan {info.dapil}.
          </p>
        </div>

        {/* Content Grid: Form (Left) & Office Info (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Form Column (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl sm:rounded-[36px] p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                Formulir Aspirasi Warga
              </h2>
              <p className="text-xs text-slate-500">
                Aspirasi Anda akan diverifikasi dan ditindaklanjuti oleh tim staf ahli komisi dewan.
              </p>
            </div>

            {success && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Aspirasi Anda berhasil dikirimkan. Terima kasih atas partisipasi aktif Anda!</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nama sesuai KTP"
                    className="w-full px-4 py-2.5 rounded-2xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#00D084] focus:ring-2 focus:ring-[#00E599]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nomor WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-4 py-2.5 rounded-2xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#00D084] focus:ring-2 focus:ring-[#00E599]/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Alamat Email (Opsional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="alamat@email.com"
                  className="w-full px-4 py-2.5 rounded-2xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#00D084] focus:ring-2 focus:ring-[#00E599]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kategori Aspirasi *</label>
                <select
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#00D084] focus:ring-2 focus:ring-[#00E599]/20"
                >
                  <option>Aspirasi Infrastruktur & Jalan</option>
                  <option>Pertanian, Pupuk & Irigasi</option>
                  <option>Pendidikan & Fasilitas Sekolah</option>
                  <option>Kesehatan & BPJS Warga</option>
                  <option>Bansos & Penguatan UMKM</option>
                  <option>Uji Materi Perda & Regulasi</option>
                  <option>Lainnya</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Isi Aspirasi / Pengaduan *</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Jelaskan aspirasi atau persoalan Anda secara rinci beserta lokasi/wilayah RT/RW..."
                  className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#00D084] focus:ring-2 focus:ring-[#00E599]/20 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#00E599] hover:bg-[#00D084] disabled:opacity-50 text-slate-950 font-black text-xs tracking-wider transition shadow-lg shadow-[#00E599]/25 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Mengirimkan Aspirasi...' : 'Kirim Aspirasi Sekarang'}</span>
              </button>
            </form>
          </div>

          {/* Contact Details & Office (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Office Info Card */}
            <div className="bg-[#081018] rounded-3xl p-6 sm:p-8 border border-slate-800 text-white space-y-6 shadow-xl">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#00E599] uppercase tracking-wider">
                  Alamat Resmi
                </span>
                <h3 className="text-lg font-black text-white">
                  Sekretariat & Rumah Aspirasi
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#00E599] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{info.address}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#00E599] shrink-0" />
                  <a href={`mailto:${info.email}`} className="hover:text-white transition">
                    {info.email}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#00E599] shrink-0" />
                  <span>{info.phone}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#00E599] shrink-0" />
                  <span>Senin - Jumat: 08:00 - 17:00 WIB</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {info.party} • Dapil {info.dapil}
                </span>
                <span className="text-xs font-bold text-[#00E599] flex items-center gap-1">
                  Respon &lt; 24 Jam
                </span>
              </div>
            </div>

            {/* Social Media Card */}
            <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Kanal Media Sosial Resmi
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ikuti liputan kegiatan reses, notula rapat dengar pendapat, dan siaran langsung persidangan komisi.
              </p>
              <div>
                <a
                  href={info.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-full p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#00D084] hover:shadow-md transition text-xs font-bold text-slate-900 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#00A86B] flex items-center justify-center">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <span>@{info.instagramHandle}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#00A86B] transition-colors" />
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </XenonMintShell>
  );
}
