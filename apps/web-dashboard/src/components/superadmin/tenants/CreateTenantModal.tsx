'use client';

import React, { useState } from 'react';
import { X, UserPlus, Copy, Check, ShieldAlert, CreditCard, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import { AdminApiClient } from '@/lib/api-client';

export interface InitialLeadData {
  inquiryId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  partyAffiliation?: string;
  legislativeLevel?: string;
  customDapilName?: string;
  planTier?: string;
  billingCycle?: string;
}

interface CreateTenantModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialLeadData?: InitialLeadData | null;
}

export function CreateTenantModal({ onClose, onSuccess, initialLeadData }: CreateTenantModalProps) {
  const [fullName, setFullName] = useState(initialLeadData?.fullName || '');
  const [email, setEmail] = useState(initialLeadData?.email || '');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(initialLeadData?.phoneNumber || '');
  const [partyAffiliation, setPartyAffiliation] = useState(initialLeadData?.partyAffiliation || '');
  const [legislativeLevel, setLegislativeLevel] = useState(initialLeadData?.legislativeLevel || 'DPRD_PROVINSI');
  const [customDapilName, setCustomDapilName] = useState(initialLeadData?.customDapilName || '');
  const [subdomainSlug, setSubdomainSlug] = useState(() => {
    if (initialLeadData?.fullName) {
      return initialLeadData.fullName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 30);
    }
    return '';
  });
  const [planTier, setPlanTier] = useState(initialLeadData?.planTier || 'PRO');
  const [billingCycle, setBillingCycle] = useState(initialLeadData?.billingCycle || 'SEMESTER');
  const [generatePrepaid, setGeneratePrepaid] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-generate subdomain saat fullName berubah
  const handleNameChange = (val: string) => {
    setFullName(val);
    if (!subdomainSlug || subdomainSlug === '') {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 30);
      setSubdomainSlug(slug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase() || undefined,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        partyAffiliation: partyAffiliation.trim() || undefined,
        legislativeLevel,
        customDapilName: customDapilName.trim() || undefined,
        subdomainSlug: subdomainSlug.trim().toLowerCase(),
        planTier,
        billingCycle,
        generatePrepaidInvoice: generatePrepaid,
        inquiryId: initialLeadData?.inquiryId,
      };

      const res: any = await AdminApiClient.request('/admin/tenants/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setCreatedResult(res.data);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat akun anggota dewan.');
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!createdResult) return;
    const text = `KREDENSIAL RESMI AKUN POLARIS
Nama: ${createdResult.fullName}
Email: ${createdResult.email}
Username: ${createdResult.username}
Kata Sandi Sementara: ${createdResult.temporaryPasswordPlaintext}
Subdomain Portal: https://${createdResult.subdomainSlug}.polaris.id
Tingkat Jabatan: ${createdResult.legislativeLevel}
Status: ${createdResult.accountStatus}

Catatan Keamanan: Silakan login di https://app.polaris.id/login. Anda akan diminta memperbarui kata sandi ini pada saat login pertama kali.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 theme-transition">
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {createdResult ? 'Kredensial Akun Berhasil Diterbitkan' : 'Registrasi & Inisialisasi Akun Dewan Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {createdResult
                  ? 'Salin dan simpan kata sandi sementara sebelum menutup jendela ini.'
                  : 'Kunci wewenang legislatif resmi dan terbitkan sandi sementara otomatis.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (createdResult) onSuccess();
              else onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* JIKA SUDAH SUKSES DIBUAT (CREDENTIAL HANDOVER SCREEN) */}
        {createdResult ? (
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Akun Anggota Dewan Berhasil Dibuat!
                </p>
                <p className="text-emerald-700 dark:text-emerald-400">
                  Sistem telah mengunci tingkat wewenang <strong>{createdResult.legislativeLevel}</strong> dan menetapkan flag wajib ganti sandi pada login perdana.
                </p>
              </div>
            </div>

            {/* KOTAK KREDENSIAL */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Kredensial Akses Perdana
                </span>
                <button
                  type="button"
                  onClick={copyCredentials}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Tersalin ke Clipboard!' : 'Salin Kredensial Lengkap'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Nama Anggota:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{createdResult.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email Login:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{createdResult.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Username Login:</span>
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{createdResult.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Subdomain Portal:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{createdResult.subdomainSlug}.polaris.id</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 block mb-1">
                  Kata Sandi Sementara (One-Time Preview):
                </span>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
                  <code className="text-sm font-mono font-black text-amber-900 dark:text-amber-200 tracking-wider">
                    {createdResult.temporaryPasswordPlaintext}
                  </code>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                    Wajib Ganti Saat Login
                  </span>
                </div>
              </div>
            </div>

            {/* JIKA ADA INVOICE PREPAID MIDTRANS */}
            {createdResult.prepaidInvoice && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" /> Tagihan Pra-Bayar Midtrans Terbit
                  </span>
                  <span className="font-mono font-black text-blue-700 dark:text-blue-300">
                    Rp {createdResult.prepaidInvoice.amountIdr.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Nomor Invoice: <code className="font-mono font-bold">{createdResult.prepaidInvoice.invoiceNumber}</code>
                </p>
                {createdResult.prepaidInvoice.redirectUrl && (
                  <a
                    href={createdResult.prepaidInvoice.redirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-bold"
                  >
                    Buka Tautan Pembayaran Midtrans Snap <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onSuccess}
                className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 rounded-xl transition-opacity"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        ) : (
          /* FORM PEMBUATAN AKUN BARU */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {initialLeadData && (
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Konversi Lead: <strong>{initialLeadData.fullName}</strong> ({initialLeadData.legislativeLevel})
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                  Lead Resmi
                </span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* NAMA LENGKAP */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Nama Lengkap & Gelar Resmi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dr. H. Ahmad Fauzi, S.H., M.Si."
                  value={fullName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Email Dinas / Pribadi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="dewan@dprd.go.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* USERNAME */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Username Login <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="ahmad-fauzi (otomatis jika kosong)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* NOMOR WHATSAPP */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Nomor WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* TINGKAT LEGISLATIF (IMMUTABLE ANCHOR) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Tingkat Jabatan Resmi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={legislativeLevel}
                  onChange={(e) => setLegislativeLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DPR_RI">DPR RI (Parlemen Nasional)</option>
                  <option value="DPD_RI">DPD RI (Senator Daerah)</option>
                  <option value="MPR_RI">MPR RI</option>
                  <option value="DPRD_PROVINSI">DPRD Provinsi</option>
                  <option value="DPRD_KABUPATEN_KOTA">DPRD Kabupaten / Kota</option>
                  <option value="KEPALA_DAERAH_GUBERNUR">Gubernur / Wakil Gubernur</option>
                  <option value="KEPALA_DAERAH_WALIKOTA_BUPATI">Walikota / Bupati</option>
                  <option value="PEJABAT_BIROKRAT_DIRJEN_SEKJEN_OPD">Birokrat / OPD / Sekjen</option>
                  <option value="PIMPINAN_LEMBAGA_REKTOR_SWASTA">Pimpinan Lembaga / Rektor</option>
                </select>
              </div>

              {/* FRAKSI / PARTAI */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Partai / Fraksi Politik
                </label>
                <input
                  type="text"
                  placeholder="Fraksi PDI-P, Golkar, Gerindra, dll"
                  value={partyAffiliation}
                  onChange={(e) => setPartyAffiliation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ASAL DAPIL */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Dapil / Wilayah Kerja
                </label>
                <input
                  type="text"
                  placeholder="Dapil Jabar VII / Kab. Bekasi"
                  value={customDapilName}
                  onChange={(e) => setCustomDapilName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* SUBDOMAIN SLUG */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Subdomain Portal Publik <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="ahmad-fauzi"
                    value={subdomainSlug}
                    onChange={(e) => setSubdomainSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-l-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="px-4 py-2.5 rounded-r-xl bg-slate-200 dark:bg-slate-800 border border-l-0 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-xs">
                    .polaris.id
                  </span>
                </div>
              </div>
            </div>

            {/* SELEKSI MODEL AKTIVASI & PAKET */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                Pilihan Lisensi & Mode Pembayaran
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Tier Lisensi:</label>
                  <select
                    value={planTier}
                    onChange={(e) => setPlanTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="STARTER">STARTER (Standar Parlemen, AI Aktif, Subdomain)</option>
                    <option value="PRO">PRO (Eksekutif Suite: Custom Domain, Bebas Layout, SPK & Pajak)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Siklus Durasi:</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="MONTHLY">1 Bulan (30 Hari)</option>
                    <option value="SEMESTER">6 Bulan (180 Hari)</option>
                    <option value="ANNUAL">1 Tahun (365 Hari)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generatePrepaid}
                    onChange={(e) => setGeneratePrepaid(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Terbitkan Tagihan Pra-Bayar Midtrans (Kirim VA/QRIS ke kantor dinas dulu)
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Jika dicentang, akun dibuat dengan status PENDING_PAYMENT dan sistem otomatis meng-generate invoice resmi Midtrans Snap. Jika tidak, akun langsung ACTIVE dan dewan checkout mandiri di dashboard.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? 'Menerbitkan Akun...' : 'Terbitkan Akun Dewan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
