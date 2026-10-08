'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  Menu, 
  X, 
  FileText, 
  BarChart3, 
  Image as ImageIcon, 
  Building2,
  Landmark,
  MapPin,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface LandingNavbarProps {
  onSelectCategory?: (category: 'ALL' | 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER') => void;
  onSelectSolutionTab?: (tab: 'DPR' | 'DPRD' | 'PEMDA') => void;
}

export function LandingNavbar({ onSelectCategory, onSelectSolutionTab }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  const scrollTo = (
    id: string, 
    category?: 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER',
    solutionTab?: 'DPR' | 'DPRD' | 'PEMDA'
  ) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    if (category && onSelectCategory) {
      onSelectCategory(category);
    }
    if (solutionTab && onSelectSolutionTab) {
      onSelectSolutionTab(solutionTab);
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  const handlePricingClick = (e: React.MouseEvent) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    const el = document.getElementById('pricing');
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.8L18 8.5v7l-6 3.75-6-3.75v-7l6-3.7z" />
                  <path d="M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 2.5a2 2 0 110 4 2 2 0 010-4z" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                POLARIS
              </span>
            </Link>
          </div>

          {/* DESKTOP NAVIGATION MENU */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            
            {/* PLATFORM DROPDOWN (SCROLLS DOWN KE FITUR / CONTOH KONTEN) */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('platform')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                onClick={() => scrollTo('fitur')}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors py-2 cursor-pointer"
              >
                <span>Platform</span>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              {activeDropdown === 'platform' && (
                <div className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 grid gap-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <button 
                    onClick={() => scrollTo('contoh-konten', 'ARTIKEL')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left w-full cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Generator Artikel Parlemen</div>
                      <div className="text-[11px] text-slate-500 font-normal">Kajian narasi 3.000 kata berbasis regulasi JDIH.</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => scrollTo('contoh-konten', 'INFOGRAFIS')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left w-full cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Infografis Data Kebijakan</div>
                      <div className="text-[11px] text-slate-500 font-normal">Visualisasi data fiskal APBD & statistik BPS.</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => scrollTo('contoh-konten', 'POSTER')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left w-full cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Desain Poster Program</div>
                      <div className="text-[11px] text-slate-500 font-normal">Publikasi kampanye visual siap cetak & medsos.</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* SOLUSI DROPDOWN (SCROLLS DOWN KE SOLUSI-DPR/DPRD/PEMDA) */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('solusi')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                onClick={() => scrollTo('solusi')}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors py-2 cursor-pointer"
              >
                <span>Solusi</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {activeDropdown === 'solusi' && (
                <div className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 grid gap-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <button 
                    onClick={() => scrollTo('solusi', undefined, 'DPR')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left w-full cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Anggota DPR RI & DPD RI</div>
                      <div className="text-[11px] text-slate-500 font-normal">Kajian RUU, fiskal APBN & sikap fraksi nasional.</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => scrollTo('solusi', undefined, 'DPRD')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left w-full cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">DPRD Provinsi & Kab/Kota</div>
                      <div className="text-[11px] text-slate-500 font-normal">Advokasi perda inisiatif & pengawasan APBD.</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => scrollTo('solusi', undefined, 'PEMDA')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left w-full cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Kepala Daerah & OPD</div>
                      <div className="text-[11px] text-slate-500 font-normal">Komunikasi program prioritas & edukasi publik.</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => scrollTo('contoh-konten')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Contoh Konten
            </button>

            <button 
              onClick={() => scrollTo('keunggulan')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Keunggulan
            </button>

            {/* HARGA / PRICING MENU BUTTON */}
            <Link 
              href="/pricing"
              onClick={handlePricingClick}
              className="hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1 text-blue-600 font-bold"
            >
              <span>Harga</span>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            </Link>

            <button 
              onClick={() => scrollTo('tentang')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Tentang Kami
            </button>
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="hidden sm:flex items-center gap-4">
            <a
              href={`${DASHBOARD_URL}/login`}
              className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-2 py-2"
            >
              Masuk
            </a>

            <a
              href="/pricing"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <span>Ajukan Lisensi</span>
            </a>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href="/pricing"
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
            >
              Ajukan
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-5 py-4 space-y-3">
          <button
            onClick={() => scrollTo('fitur')}
            className="block py-1.5 text-sm font-bold text-slate-700 hover:text-blue-600 w-full text-left"
          >
            Platform Fitur
          </button>
          <button
            onClick={() => scrollTo('solusi')}
            className="block py-1.5 text-sm font-bold text-slate-700 hover:text-blue-600 w-full text-left"
          >
            Solusi Parlemen
          </button>
          <button
            onClick={() => scrollTo('contoh-konten')}
            className="block py-1.5 text-sm font-bold text-slate-700 hover:text-blue-600 w-full text-left"
          >
            Contoh Konten
          </button>
          <button
            onClick={() => scrollTo('keunggulan')}
            className="block py-1.5 text-sm font-bold text-slate-700 hover:text-blue-600 w-full text-left"
          >
            Alur Keunggulan
          </button>
          <Link
            href="/pricing"
            onClick={handlePricingClick}
            className="block py-1.5 text-sm font-extrabold text-blue-600 hover:text-blue-700 w-full text-left"
          >
            Paket Harga & Lisensi
          </Link>
          <button
            onClick={() => scrollTo('tentang')}
            className="block py-1.5 text-sm font-bold text-slate-700 hover:text-blue-600 w-full text-left"
          >
            Tentang Kami
          </button>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <a
              href={`${DASHBOARD_URL}/login`}
              className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700"
            >
              Masuk ke Workspace
            </a>
            <a
              href="/pricing"
              className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-600/20"
            >
              Ajukan Lisensi Resmi
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
