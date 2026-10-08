'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Video,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  Phone,
  Mail,
  User,
  MapPin,
} from 'lucide-react';
import { submitLicenseInquiry } from '@/lib/api';

interface ConsultationLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTier?: string;
  defaultCycle?: string;
}

export function ConsultationLeadModal({
  isOpen,
  onClose,
  defaultTier = 'PRO',
  defaultCycle = 'SEMIANNUAL',
}: ConsultationLeadModalProps) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [partyAffiliation, setPartyAffiliation] = useState('');
  const [legislativeLevel, setLegislativeLevel] = useState('DPRD_PROV');
  const [targetRegion, setTargetRegion] = useState('');
  const [preferredTier, setPreferredTier] = useState(defaultTier);
  const [preferredCycle, setPreferredCycle] = useState(defaultCycle);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!fullName.trim() || !phoneNumber.trim() || !officialEmail.trim() || !targetRegion.trim()) {
        throw new Error('Mohon lengkapi seluruh kolom bertanda bintang (*).');
      }

      await submitLicenseInquiry({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        officialEmail: officialEmail.trim().toLowerCase(),
        partyAffiliation: partyAffiliation.trim() || undefined,
        legislativeLevel,
        targetRegion: targetRegion.trim(),
        preferredTier,
        preferredCycle,
        notes: notes.trim() || undefined,
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim permohonan lisensi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-8 theme-transition">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Permohonan Lisensi & Sesi Demo Parlemen
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Konsultasikan kebutuhan dapil Anda dan jadwalkan sesi pengenalan platform melalui Google Meet.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-500 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                Permohonan Lisensi & Demo Diterima!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Terima kasih, <strong className="text-slate-900 dark:text-white">{fullName}</strong>. Tim Kemitraan Eksekutif POLARIS akan segera menghubungi kontak resmi Anda melalui WhatsApp/Email untuk konfirmasi jadwal <strong>Google Meet 15-menit</strong> serta penerbitan penawaran resmi sesuai mandat yurisdiksi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1 text-left">
              <div className="flex justify-between">
                <span>Yurisdiksi:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{legislativeLevel.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Dapil / Wilayah:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{targetRegion}</span>
              </div>
              <div className="flex justify-between">
                <span>Paket Minat:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">Tier {preferredTier} ({preferredCycle})</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Tutup Jendela
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Nama Lengkap & Gelar */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Nama Lengkap Anggota Dewan / Pemohon *</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Dr. H. Ahmad Fauzi, S.E., M.M."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Kontak: Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nomor WhatsApp Resmi *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Dinas / Resmi *</span>
                </label>
                <input
                  type="email"
                  required
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  placeholder="dewan@dprd.go.id"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Yurisdiksi & Partai */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tingkat Lembaga Legislatif *</span>
                </label>
                <select
                  value={legislativeLevel}
                  onChange={(e) => setLegislativeLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="DPR_RI">DPR RI (Pusat)</option>
                  <option value="DPD_RI">DPD RI (Senator)</option>
                  <option value="DPRD_PROV">DPRD Provinsi</option>
                  <option value="DPRD_KAB_KOTA">DPRD Kabupaten / Kota</option>
                  <option value="DPRA_ACEH">DPRA (Aceh)</option>
                  <option value="DPRK_ACEH">DPRK (Kab/Kota Aceh)</option>
                  <option value="DPRP_PAPUA">DPRP (Papua)</option>
                  <option value="DPRPB_PAPUA_BARAT">DPRPB (Papua Barat)</option>
                  <option value="DPR_IKN">DPR / Otorita IKN</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Afiliasi Fraksi / Partai Politik</span>
                </label>
                <input
                  type="text"
                  value={partyAffiliation}
                  onChange={(e) => setPartyAffiliation(e.target.value)}
                  placeholder="Contoh: Fraksi Golkar / Non-Partai"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Daerah Pemilihan */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Daerah Pemilihan (Dapil) / Wilayah Konstituen *</span>
              </label>
              <input
                type="text"
                required
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                placeholder="Contoh: Jawa Timur I (Surabaya - Sidoarjo) atau Dapil 3 Kota Bandung"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Paket Tier & Siklus Minat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Paket Lisensi Minat</span>
                </label>
                <select
                  value={preferredTier}
                  onChange={(e) => setPreferredTier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="STARTER">Tier STARTER (Standar Parlemen)</option>
                  <option value="PRO">Tier PRO (Eksekutif Suite & Pengadaan SPK)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Siklus Penagihan</span>
                </label>
                <select
                  value={preferredCycle}
                  onChange={(e) => setPreferredCycle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="MONTHLY">1 Bulan (Evaluasi Sidang Singkat)</option>
                  <option value="SEMIANNUAL">6 Bulan (1 Masa Sidang & Reses Penuh)</option>
                  <option value="ANNUAL">1 Tahun (Investasi Parlemen Penuh)</option>
                </select>
              </div>
            </div>

            {/* Catatan / Jadwal Demo */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Preferensi Waktu Google Meet atau Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Kami senggang hari Selasa pukul 14:00 WIB, mohon sertakan simulasi modul aspirasi reses..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Kirim Permohonan & Jadwalkan Demo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
