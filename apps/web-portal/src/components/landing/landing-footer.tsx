'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { PolicyType } from './legal-policy-modal';

interface LandingFooterProps {
  onOpenPolicy?: (type: PolicyType) => void;
  onRequestDemo?: (role?: string) => void;
  onSelectCategory?: (category: 'ALL' | 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER') => void;
}

export function LandingFooter({ onOpenPolicy, onRequestDemo, onSelectCategory }: LandingFooterProps) {
  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  const handlePolicyClick = (type: PolicyType) => {
    if (onOpenPolicy) {
      onOpenPolicy(type);
    } else {
      alert(`Informasi ${type}: Seluruh protokol mematuhi standar UU PDP No. 27/2022 dan ISO 27001.`);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* BRAND COLUMN */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                P
              </div>
              <span className="text-xl font-black text-white tracking-tight">POLARIS</span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Platform kecerdasan buatan dan sistem operasi komunikasi untuk membantu Eksekutif, Legislatif, dan Institusi Publik mentransformasikan pemikiran menjadi artikel, infografis, dan poster berkualitas tinggi.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <span>Kepatuhan Standar UU PDP & Regulasi Indonesia</span>
            </div>
          </div>

          {/* COL 1: PLATFORM */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/platform/artikel" className="hover:text-white transition-colors block">
                  Generator Artikel Parlemen
                </Link>
              </li>
              <li>
                <Link href="/platform/infografis" className="hover:text-white transition-colors block">
                  Infografis Data APBD & BPS
                </Link>
              </li>
              <li>
                <Link href="/platform/poster" className="hover:text-white transition-colors block">
                  Poster Kampanye Resmi
                </Link>
              </li>
              <li>
                <Link href="/#contoh-konten" className="hover:text-white transition-colors block">
                  Galeri Contoh Konten
                </Link>
              </li>
              <li>
                <Link href="/#keunggulan" className="hover:text-white transition-colors block">
                  Alur Kerja & Keunggulan
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 2: SOLUSI */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Solusi Parlemen</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/solusi/dpr" className="hover:text-white transition-colors block">
                  Anggota DPR RI & DPD RI
                </Link>
              </li>
              <li>
                <Link href="/solusi/dprd" className="hover:text-white transition-colors block">
                  DPRD Provinsi
                </Link>
              </li>
              <li>
                <Link href="/solusi/dprd" className="hover:text-white transition-colors block">
                  DPRD Kabupaten / Kota
                </Link>
              </li>
              <li>
                <Link href="/solusi/pemda" className="hover:text-white transition-colors block">
                  Kepala Daerah & Pemkab/Pemprov
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors block">
                  Staf Ahli & Tim Komunikasi
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 3: AKSES */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Akses Sistem</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href={`${DASHBOARD_URL}/login`} className="text-blue-400 hover:text-blue-300 transition-colors font-bold block">
                  Masuk Dashboard Eksekutif
                </a>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors block">
                  Permohonan Lisensi Dewan
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors block text-blue-400 font-bold">
                  Paket Harga & Lisensi
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-white transition-colors block">
                  Tentang POLARIS
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} POLARIS Platform Indonesia. Seluruh hak cipta dilindungi undang-undang.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => handlePolicyClick('TERMS')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Ketentuan Layanan
            </button>
            <button
              onClick={() => handlePolicyClick('PRIVACY')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Kebijakan Privasi
            </button>
            <button
              onClick={() => handlePolicyClick('SECURITY')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Protokol Keamanan
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
