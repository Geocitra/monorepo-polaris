'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

export default function TrackTicketPage() {
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setTicketData(null);

    // Normalisasi: Pastikan tiket selalu berawalan '#'
    let rawTicket = ticketInput.trim().toUpperCase();
    if (!rawTicket.startsWith('#')) {
      rawTicket = `#${rawTicket}`;
    }

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.INTERNAL_API_URL ||
      'http://localhost:4000/api/v1';

    try {
      const res = await fetch(`${API_BASE_URL}/constituent/track/${encodeURIComponent(rawTicket)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || 'Nomor tiket tidak ditemukan.');
      }

      setTicketData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Tiket pengaduan tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/lapor"
        className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-portal-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Kembali ke Form Aduan</span>
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Pelacakan Status Aspirasi Warga</h1>
          <p className="mt-1 text-sm text-gray-500">
            Masukkan Nomor Tiket resmi (#CS-YYYYMMDD-XXXX) yang Anda dapatkan saat mengirimkan laporan.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="#CS-20260928-XXXX"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
            className="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-mono font-bold focus:border-portal-primary focus:outline-none focus:ring-1 focus:ring-portal-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-portal-primary text-white font-bold text-sm shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5 shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>Lacak</span>
          </button>
        </form>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        {ticketData && (
          <div className="mt-6 border-t border-gray-100 pt-6 space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Nomor Tiket Terverifikasi
                </span>
                <span className="text-lg font-mono font-extrabold text-portal-primary">
                  {ticketData.trackingTicketCode}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold">
                {ticketData.status}
              </span>
            </div>

            {/* TIMELINE STEPPER PROGRES */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-green-50 border border-green-200 text-green-700 font-bold">
                ✓ Diterima
              </div>
              <div
                className={`p-2.5 rounded-lg border font-bold ${
                  ticketData.status === 'VERIFIED' || ticketData.status === 'RESPONDED'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                {ticketData.status === 'VERIFIED' || ticketData.status === 'RESPONDED' ? '✓ ' : ''}Diverifikasi
              </div>
              <div
                className={`p-2.5 rounded-lg border font-bold ${
                  ticketData.status === 'RESPONDED'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                {ticketData.status === 'RESPONDED' ? '✓ ' : ''}Ditindaklanjuti
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2 text-gray-700">
              <div><strong>Kategori Masalah:</strong> {ticketData.category}</div>
              <div><strong>Kecamatan:</strong> {ticketData.districtKecamatan}</div>
              <div><strong>Waktu Masuk:</strong> {formatDateIndonesian(ticketData.submittedAt || ticketData.createdAt)}</div>
              <div className="pt-2 border-t border-gray-200 font-medium italic text-slate-800">
                &ldquo;{ticketData.aspirationMessage}&rdquo;
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
