'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { submitAspiration } from '@/lib/api';
import { Send, CheckCircle2, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LaporPage() {
  const params = useParams();
  const subdomain = params?.subdomain as string;

  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{ ticket: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    citizenName: '',
    phoneNumber: '',
    regencyName: '',
    districtKecamatan: '',
    category: 'INFRASTRUKTUR',
    aspirationMessage: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await submitAspiration({
        subdomainSlug: subdomain,
        ...formData,
      });

      setSuccessResult({ ticket: res.trackingTicketCode });
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-portal-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
        {successResult ? (
          /* TAMPILAN BUKTI TANDA TERIMA TIKET */
          <div className="text-center space-y-4 py-8">
            <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900">Aspirasi Berhasil Diterima</h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Laporan Anda telah tercatat secara resmi di sistem POLARIS dan diteruskan ke tim advokasi dewan.
            </p>

            <div className="my-6 inline-block rounded-xl bg-gray-50 border border-gray-200 p-4">
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nomor Tiket Pelacakan Resmi
              </span>
              <span className="mt-1 block text-2xl font-extrabold text-portal-primary tracking-wider">
                {successResult.ticket}
              </span>
            </div>

            <p className="text-xs text-gray-500">
              Simpan nomor tiket ini untuk memantau status perkembangan tindak lanjut keluhan Anda.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/lapor/lacak"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                Lacak Status Tiket
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg bg-portal-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                Selesai & Kembali
              </Link>
            </div>
          </div>
        ) : (
          /* FORM PENGISIAN ADUAN WARGA */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Layanan Aspirasi & Pengaduan Konstituen</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Sampaikan masalah riil di wilayah Anda langsung kepada anggota dewan dan tim advokasi.
                </p>
              </div>
              <Link
                href="/lapor/lacak"
                className="text-xs font-bold text-portal-primary hover:underline shrink-0"
              >
                Sudah punya tiket? Lacak di sini &rarr;
              </Link>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.citizenName}
                  onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-portal-primary focus:outline-none focus:ring-1 focus:ring-portal-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">No. WhatsApp / HP</label>
                <input
                  type="tel"
                  required
                  placeholder="08123456xxxx"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-portal-primary focus:outline-none focus:ring-1 focus:ring-portal-primary"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Kabupaten / Kota</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kabupaten Cirebon"
                  value={formData.regencyName}
                  onChange={(e) => setFormData({ ...formData, regencyName: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-portal-primary focus:outline-none focus:ring-1 focus:ring-portal-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Kecamatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Waled"
                  value={formData.districtKecamatan}
                  onChange={(e) => setFormData({ ...formData, districtKecamatan: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-portal-primary focus:outline-none focus:ring-1 focus:ring-portal-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Kategori Masalah</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-portal-primary focus:outline-none focus:ring-1 focus:ring-portal-primary"
              >
                <option value="INFRASTRUKTUR">Infrastruktur (Jalan, Jembatan, Irigasi)</option>
                <option value="PERTANIAN">Pertanian & Pupuk Bersubsidi</option>
                <option value="PENDIDIKAN">Pendidikan & Sekolah</option>
                <option value="KESEHATAN">Kesehatan & Fasilitas Medis</option>
                <option value="BANSOS_UMKM">Bantuan Sosial & Dukungan UMKM</option>
                <option value="LAINNYA">Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Isi Aspirasi / Pengaduan</label>
              <textarea
                required
                rows={5}
                placeholder="Ceritakan permasalahan secara jelas dan lokasi titik masalah..."
                value={formData.aspirationMessage}
                onChange={(e) => setFormData({ ...formData, aspirationMessage: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-portal-primary focus:outline-none focus:ring-1 focus:ring-portal-primary"
              />
            </div>

            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 border border-gray-200 flex items-start gap-2">
              <span className="font-bold text-portal-primary">UU PDP:</span>
              <span>
                Identitas nama dan nomor kontak Anda dienkripsi secara otomatis menggunakan standar militer AES-256 untuk melindungi privasi Anda.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-portal-primary py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirimkan Aspirasi...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Kirim Laporan Resmi</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
