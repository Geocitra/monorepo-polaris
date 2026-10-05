'use client';

import { X, Shield, Lock, FileCheck, Scale, Database } from 'lucide-react';

export type PolicyType = 'TERMS' | 'PRIVACY' | 'SECURITY';

interface LegalPolicyModalProps {
  type: PolicyType | null;
  onClose: () => void;
}

export function LegalPolicyModal({ type, onClose }: LegalPolicyModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              {type === 'TERMS' && <Scale className="h-5 w-5" />}
              {type === 'PRIVACY' && <Lock className="h-5 w-5" />}
              {type === 'SECURITY' && <Shield className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {type === 'TERMS' && 'Ketentuan Layanan Platform POLARIS'}
                {type === 'PRIVACY' && 'Kebijakan Privasi & Kedaulatan Data'}
                {type === 'SECURITY' && 'Protokol Keamanan & Kepatuhan UU PDP'}
              </h3>
              <p className="text-xs text-slate-500">
                Standar Tata Kelola Teknologi Informasi Institusi Publik
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {type === 'TERMS' && (
            <>
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">1. Ruang Lingkup dan Pengguna Resmi</h4>
                <p>
                  POLARIS adalah sistem operasi diseminasi pemikiran dan analisis kebijakan yang disediakan bagi Anggota DPR RI, DPD RI, DPRD Provinsi, DPRD Kabupaten/Kota, Pimpinan Eksekutif, dan Tenaga Ahli resmi. Setiap akun yang terdaftar diverifikasi berdasarkan afiliasi kelembagaan.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">2. Hak Cipta dan Kepemilikan Substansi</h4>
                <p>
                  Seluruh draf pemikiran, narasi artikel, visualisasi infografis, dan materi poster yang diproduksi melalui POLARIS sepenuhnya merupakan hak intelektual dari Pejabat Publik dan Institusi terkait. POLARIS tidak mengklaim kepemilikan atas konten yang diolah pengguna.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">3. Standar Etika & Akurasi Data</h4>
                <p>
                  Pengguna berkomitmen untuk menggunakan data rujukan yang sah (BPS, Satu Data Indonesia, JDIH) serta menjaga netralitas dan objektivitas telaah demi kepentingan edukasi dan transparansi publik.
                </p>
              </div>
            </>
          )}

          {type === 'PRIVACY' && (
            <>
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">1. Kepatuhan Undang-Undang No. 27 Tahun 2022 (UU PDP)</h4>
                <p>
                  POLARIS menerapkan prinsip pemrosesan data pribadi secara sah, transparan, dan terbatas pada tujuan verifikasi identitas kelembagaan. Kami tidak memperjualbelikan atau membagikan data identitas dewan kepada pihak ketiga non-otoritas.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">2. Kedaulatan Penyimpanan Data Nasional</h4>
                <p>
                  Seluruh basis data, rekam log komunikasi, dan berkas analisis disimpan di dalam pusat data (Data Center) yang berlokasi di wilayah hukum Republik Indonesia sesuai ketentuan regulasi penyelenggaraan sistem elektronik pemerintah.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">3. Perlindungan Kerahasiaan Pokok Pikiran</h4>
                <p>
                  Catatan rapat komisi dan draf telaah yang belum dipublikasikan diproteksi dengan enkripsi setingkat perbankan dan tidak digunakan untuk melatih model AI publik secara terbuka.
                </p>
              </div>
            </>
          )}

          {type === 'SECURITY' && (
            <>
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">1. Enkripsi End-to-End & At-Rest</h4>
                <p>
                  Setiap transmisi data diamankan menggunakan protokol TLS 1.3 serta enkripsi penyimpanan AES-256. Autentikasi akun dewan diperkuat dengan verifikasi One-Time Password (OTP) berbasis email resmi berkeamanan tinggi.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">2. Audit Log & Kontrol Hak Akses Berjenjang (RBAC)</h4>
                <p>
                  Sistem mencatat setiap akses modifikasi dokumen oleh staf ahli secara komprehensif (audit trail). Pejabat memiliki kendali penuh untuk menentukan hak sunting, tinjauan, dan persetujuan publikasi.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">3. Ketahanan Terhadap Ancaman Siber</h4>
                <p>
                  Infrastruktur POLARIS dilengkapi perlindungan DDoS multi-lapis, firewall aplikasi web (WAF), dan pengujian penetrasi berkala untuk menjamin kontinuitas operasional lembaga tinggi negara.
                </p>
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Dokumen Kebijakan Resmi Ver. 2026.1
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs"
          >
            Mengerti & Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
