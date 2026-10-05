'use client';

import { useState } from 'react';
import { X, CheckCircle2, Loader2, Sparkles, Building, Mail, Phone, Calendar } from 'lucide-react';

interface RequestDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: string;
}

export function RequestDemoModal({ isOpen, onClose, initialRole }: RequestDemoModalProps) {
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState(() => {
    if (initialRole?.includes('DPRD')) return 'DPRD_PROVINSI';
    if (initialRole?.includes('Daerah') || initialRole?.includes('Dinas')) return 'KEPALA_DAERAH';
    if (initialRole?.includes('Staf')) return 'STAF_AHLI';
    return 'DPR_RI';
  });
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Simulate sending request or saving lead
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  }

  function handleReset() {
    setSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setNotes('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* CLOSE BUTTON */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Permintaan Demo Berhasil Dikirim!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Tim spesialis POLARIS akan menghubungi Anda atau staf perwakilan melalui WhatsApp/Email dalam 1x24 jam untuk menjadwalkan presentasi langsung.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
            >
              Tutup Jendela
            </button>
          </div>
        ) : (
          <div className="p-7 sm:p-8 space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                <Sparkles className="h-3 w-3" />
                <span>Presentasi Eksklusif</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Jadwalkan Demo Platform POLARIS
              </h3>
              <p className="text-xs text-slate-500">
                Saksikan demonstrasi bagaimana POLARIS menyusun artikel teknokratis dan infografis kebijakan secara langsung.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dr. H. Ahmad Fauzi, M.Si."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Lembaga / Jabatan
                  </label>
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none bg-white"
                  >
                    <option value="DPR_RI">DPR RI</option>
                    <option value="DPD_RI">DPD RI</option>
                    <option value="DPRD_PROVINSI">DPRD Provinsi</option>
                    <option value="DPRD_KAB_KOTA">DPRD Kabupaten / Kota</option>
                    <option value="KEPALA_DAERAH">Kepala Daerah / Pemda</option>
                    <option value="KEMENTERIAN_OPD">Kementerian / Dinas / OPD</option>
                    <option value="STAF_AHLI">Staf Ahli / Tim Fraksi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Nomor WhatsApp Aktif
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0812xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Email Dinas / Resmi
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@dpr.go.id atau email resmi"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Fokus Topik / Daerah Pemilihan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Fokus isu ketahanan pangan & alokasi APBD Dapil Jabar VII..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !fullName || !phone || !email}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>Kirim Permintaan Presentasi Demo</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
