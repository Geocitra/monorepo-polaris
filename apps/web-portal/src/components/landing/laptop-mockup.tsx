'use client';

import { useState } from 'react';
import { 
  Search, 
  Bell, 
  Home, 
  Sparkles, 
  FileText, 
  BarChart3, 
  Image as ImageIcon, 
  FolderArchive, 
  LayoutTemplate, 
  Settings, 
  ArrowRight,
  ChevronDown,
  CheckCircle,
  ExternalLink,
  X
} from 'lucide-react';

interface LaptopMockupProps {
  onSelectType?: (type: 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER') => void;
  onRequestDemo?: () => void;
}

export function LaptopMockup({ onSelectType, onRequestDemo }: LaptopMockupProps) {
  const [activeNav, setActiveNav] = useState<'beranda' | 'artikel' | 'infografis' | 'poster'>('beranda');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBellNotice, setShowBellNotice] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCardClick = (type: 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER') => {
    setActiveNav(type.toLowerCase() as any);
    if (onSelectType) {
      onSelectType(type);
    }
  };

  return (
    <div className="relative w-full max-w-[620px] lg:max-w-[700px] mx-auto select-none">
      {/* SOFT AMBIENT DESK GLOW & SHADOW */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-slate-500/10 rounded-[3rem] blur-2xl -z-10" />

      {/* MACBOOK DISPLAY BEZEL */}
      <div className="relative rounded-[22px] p-3 sm:p-3.5 bg-gradient-to-b from-[#2d3139] to-[#1a1d24] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-[#4a505e]/60">
        {/* CAMERA DOT */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#0c0d10] border border-[#2b2e38]" />
          <div className="h-1 w-1 rounded-full bg-[#1e2330]" />
        </div>

        {/* SCREEN INNER CONTENT (16:10 RATIO) */}
        <div className="relative overflow-hidden rounded-xl bg-white border border-slate-900/10 aspect-[16/10.2] flex text-[10px] sm:text-[11px] font-sans antialiased text-slate-800">
          
          {/* TOAST POPUP INSIDE SCREEN */}
          {toastMessage && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 text-white text-[9px] px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-md flex items-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* 1. LEFT SIDEBAR (DARK NAVY LIKE SCREENSHOT)              */}
          {/* ======================================================== */}
          <div className="w-[26%] bg-[#0e1626] text-slate-400 p-2 sm:p-3 flex flex-col justify-between shrink-0 border-r border-slate-800/60">
            <div className="space-y-3">
              {/* BRAND LOGO */}
              <button 
                onClick={() => {
                  setActiveNav('beranda');
                  showToast('Kembali ke Dashboard Utama');
                }}
                className="flex items-center gap-1.5 px-1 py-0.5 w-full text-left"
              >
                <div className="h-4 w-4 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-[9px]">
                  P
                </div>
                <span className="font-extrabold text-white text-[11px] sm:text-xs tracking-tight">
                  POLARIS
                </span>
              </button>

              {/* NAV ITEMS */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveNav('beranda');
                    showToast('Tampilan Beranda Workspace');
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                    activeNav === 'beranda'
                      ? 'bg-blue-600/20 text-blue-400 font-bold'
                      : 'hover:text-white text-slate-300 font-semibold'
                  }`}
                >
                  <Home className="h-3 w-3 shrink-0" />
                  <span>Beranda</span>
                </button>

                <button
                  onClick={() => {
                    setActiveNav('beranda');
                    showToast('Mode Pembuatan Konten Aktif');
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded-lg hover:text-white transition-colors text-slate-300 font-semibold text-left"
                >
                  <Sparkles className="h-3 w-3 shrink-0 text-blue-400" />
                  <span>Buat Konten</span>
                </button>

                <button
                  onClick={() => handleCardClick('ARTIKEL')}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg transition-colors pl-4 text-left ${
                    activeNav === 'artikel'
                      ? 'bg-blue-600/20 text-blue-400 font-bold'
                      : 'hover:text-white text-slate-400'
                  }`}
                >
                  <FileText className="h-2.5 w-2.5 shrink-0" />
                  <span>Artikel</span>
                </button>

                <button
                  onClick={() => handleCardClick('INFOGRAFIS')}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg transition-colors pl-4 text-left ${
                    activeNav === 'infografis'
                      ? 'bg-blue-600/20 text-blue-400 font-bold'
                      : 'hover:text-white text-slate-400'
                  }`}
                >
                  <BarChart3 className="h-2.5 w-2.5 shrink-0" />
                  <span>Infografis</span>
                </button>

                <button
                  onClick={() => handleCardClick('POSTER')}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg transition-colors pl-4 text-left ${
                    activeNav === 'poster'
                      ? 'bg-blue-600/20 text-blue-400 font-bold'
                      : 'hover:text-white text-slate-400'
                  }`}
                >
                  <ImageIcon className="h-2.5 w-2.5 shrink-0" />
                  <span>Poster</span>
                </button>

                <button
                  onClick={() => showToast('Koleksi Saya: Arsip 24 draf dan dokumen tersimpan')}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded-lg hover:text-white transition-colors text-left"
                >
                  <FolderArchive className="h-3 w-3 shrink-0" />
                  <span>Koleksi Saya</span>
                </button>

                <button
                  onClick={() => showToast('Template Parlemen: 45 format baku komisi & fraksi')}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded-lg hover:text-white transition-colors text-left"
                >
                  <LayoutTemplate className="h-3 w-3 shrink-0" />
                  <span>Template</span>
                </button>

                <button
                  onClick={() => showToast('Pengaturan Akun & Integrasi Basis Data Dewan')}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded-lg hover:text-white transition-colors text-left"
                >
                  <Settings className="h-3 w-3 shrink-0" />
                  <span>Pengaturan</span>
                </button>
              </div>
            </div>

            <div className="px-1 py-1 text-[8px] text-slate-500 font-medium">
              v2.4 Parlemen Pro
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. MAIN APPLICATION CANVAS                               */}
          {/* ======================================================== */}
          <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden relative">
            
            {/* NOTIFICATION POPOVER */}
            {showBellNotice && (
              <div className="absolute top-11 right-12 z-30 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 text-[9px] space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-1">
                  <span>Pemberitahuan Dewan</span>
                  <button onClick={() => setShowBellNotice(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1.5 text-slate-600">
                  <div className="p-1 rounded bg-blue-50/70 border border-blue-100">
                    <span className="font-bold text-blue-700 block">Draf RUU EBT Terupdate</span>
                    <span>Klausul pasal 18 telah diselaraskan dengan aturan Bappenas.</span>
                  </div>
                  <div className="p-1 rounded bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-800 block">Rilis Data BPS Triwulan</span>
                    <span>Angka inflasi wilayah Jabar VII telah siap divisualisasikan.</span>
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE MENU POPOVER */}
            {showProfileMenu && (
              <div className="absolute top-11 right-3 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-[9px] space-y-1.5 animate-in fade-in duration-150">
                <div className="border-b border-slate-100 pb-1.5">
                  <div className="font-bold text-slate-900">Ir. Budi Santoso, M.T.</div>
                  <div className="text-[8px] text-slate-500">Anggota Komisi VII DPR RI</div>
                  <div className="text-[7px] text-blue-600 font-semibold">Fraksi Parlemen RI</div>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onRequestDemo) onRequestDemo();
                  }}
                  className="w-full text-left p-1 rounded hover:bg-slate-50 text-blue-600 font-bold"
                >
                  Ajukan Akses Workspace Penuh
                </button>
              </div>
            )}

            {/* TOPBAR */}
            <div className="h-10 sm:h-11 bg-white border-b border-slate-200/80 px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0">
              {/* SEARCH INPUT */}
              <div className="relative flex-1 max-w-[260px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari topik, ide, atau template..."
                  className="w-full pl-7 pr-3 py-1 rounded-lg bg-slate-100/70 border border-slate-200/70 text-[9px] sm:text-[10px] text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              {/* USER PROFILE & NOTIFICATIONS */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={() => setShowBellNotice(!showBellNotice)}
                  className="relative p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Pemberitahuan Parlemen"
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
                </button>

                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1.5 sm:gap-2 pl-2 border-l border-slate-200 hover:opacity-90 transition-opacity text-left"
                >
                  <div className="h-6 w-6 rounded-full bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                    <img
                      src="/images/avatar-dewan-budi.jpg"
                      alt="Budi Santoso"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-left leading-tight hidden xs:block">
                    <span className="font-bold text-slate-900 block text-[9px] sm:text-[10px]">
                      Budi Santoso
                    </span>
                    <span className="text-[8px] text-slate-400 block font-medium">
                      Anggota DPR RI
                    </span>
                  </div>
                  <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* MAIN WORKSPACE CONTENT */}
            <div className="flex-1 p-3 sm:p-4 overflow-hidden flex flex-col justify-between">
              {/* HEADER */}
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Buat Konten
                </h3>
                <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5">
                  Pilih jenis konten dan mulai dari ide Anda.
                </p>
              </div>

              {/* 3 CARDS WORKFLOW (ARTIKEL, INFOGRAFIS, POSTER) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 my-auto">
                {/* 1. KARTU ARTIKEL */}
                <button
                  onClick={() => handleCardClick('ARTIKEL')}
                  className={`bg-white rounded-xl border p-2 sm:p-2.5 shadow-sm text-left transition-all flex flex-col justify-between group active:scale-98 ${
                    activeNav === 'artikel'
                      ? 'border-blue-600 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* THUMBNAIL GEDUNG PARLEMEN */}
                    <div className="h-14 sm:h-16 w-full rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 mb-2 overflow-hidden relative flex items-center justify-center group-hover:scale-102 transition-transform">
                      <div className="w-10 h-7 border-2 border-slate-400/60 rounded-t-md relative flex flex-col items-center justify-end p-0.5">
                        <div className="w-8 h-1 bg-slate-400/60 mb-0.5" />
                        <div className="flex gap-0.5">
                          <div className="w-1 h-3 bg-slate-400/60" />
                          <div className="w-1 h-3 bg-slate-400/60" />
                          <div className="w-1 h-3 bg-slate-400/60" />
                          <div className="w-1 h-3 bg-slate-400/60" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 text-[7px] font-bold bg-blue-600 text-white rounded">3.000 kata</span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-[10px] sm:text-[11px] group-hover:text-blue-600 transition-colors">
                      Artikel
                    </h4>
                    <p className="text-[8px] sm:text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      Ubah ide menjadi artikel yang runtut dan siap dipublikasikan.
                    </p>
                  </div>

                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center text-blue-600 font-extrabold text-[8px] sm:text-[9px]">
                    <span>Buat Artikel</span>
                    <ArrowRight className="h-2.5 w-2.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 2. KARTU INFOGRAFIS */}
                <button
                  onClick={() => handleCardClick('INFOGRAFIS')}
                  className={`bg-white rounded-xl border p-2 sm:p-2.5 shadow-sm text-left transition-all flex flex-col justify-between group active:scale-98 ${
                    activeNav === 'infografis'
                      ? 'border-blue-600 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* THUMBNAIL BAR CHART DATA */}
                    <div className="h-14 sm:h-16 w-full rounded-lg bg-blue-50/70 border border-blue-100 mb-2 overflow-hidden flex items-end justify-center gap-1.5 p-2 pb-1.5 group-hover:scale-102 transition-transform">
                      <div className="w-2.5 h-6 bg-blue-300 rounded-t-sm" />
                      <div className="w-2.5 h-9 bg-blue-500 rounded-t-sm" />
                      <div className="w-2.5 h-12 bg-blue-600 rounded-t-sm shadow-sm" />
                      <div className="w-2.5 h-7 bg-blue-400 rounded-t-sm" />
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-[10px] sm:text-[11px] group-hover:text-blue-600 transition-colors">
                      Infografis
                    </h4>
                    <p className="text-[8px] sm:text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      Visualisasikan data dan gagasan dengan infografis yang jelas.
                    </p>
                  </div>

                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center text-blue-600 font-extrabold text-[8px] sm:text-[9px]">
                    <span>Buat Infografis</span>
                    <ArrowRight className="h-2.5 w-2.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 3. KARTU POSTER */}
                <button
                  onClick={() => handleCardClick('POSTER')}
                  className={`bg-white rounded-xl border p-2 sm:p-2.5 shadow-sm text-left transition-all flex flex-col justify-between group active:scale-98 ${
                    activeNav === 'poster'
                      ? 'border-blue-600 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* THUMBNAIL POSTER KAMPANYE HIJAU */}
                    <div className="h-14 sm:h-16 w-full rounded-lg bg-emerald-800 text-white mb-2 overflow-hidden p-1.5 flex flex-col justify-between relative shadow-inner group-hover:scale-102 transition-transform">
                      <div className="text-[7px] font-black uppercase tracking-tight leading-none text-emerald-200">
                        ENERGI BERSIH
                      </div>
                      <div className="text-[6px] font-semibold text-emerald-100 leading-none">
                        Untuk Daerah Lebih Maju
                      </div>
                      <div className="h-4 w-full rounded bg-emerald-700/80 flex items-center justify-center text-[6px] text-emerald-100">
                        🌱 Program Parlemen
                      </div>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-[10px] sm:text-[11px] group-hover:text-blue-600 transition-colors">
                      Poster
                    </h4>
                    <p className="text-[8px] sm:text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      Sampaikan pesan dan program dengan desain yang menarik.
                    </p>
                  </div>

                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center text-blue-600 font-extrabold text-[8px] sm:text-[9px]">
                    <span>Buat Poster</span>
                    <ArrowRight className="h-2.5 w-2.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>

              {/* STATS STRIP FOOTER */}
              <div className="h-4 flex items-center justify-between text-[8px] text-slate-400 border-t border-slate-100 pt-1">
                <span>Terhubung ke Basis Data BPS & APBD</span>
                <span className="text-emerald-600 font-bold">● AI Model Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LAPTOP KEYBOARD BASE & CHASSIS (ALUMINIUM REFLECTION) */}
      <div className="relative mx-auto w-[106%] -ml-[3%] h-4 sm:h-5 bg-gradient-to-b from-[#d1d5db] via-[#9ca3af] to-[#6b7280] rounded-b-xl sm:rounded-b-2xl shadow-[0_20px_40px_rgba(0,0,0,0.25)] border-t border-white/50 flex items-start justify-center">
        {/* CENTER NOTCH OPENER */}
        <div className="w-16 sm:w-20 h-1.5 sm:h-2 rounded-b-lg bg-[#374151]/40 border-t border-black/10" />
      </div>

      {/* TABLE SURFACE SHADOW */}
      <div className="w-[85%] h-3 mx-auto bg-black/25 blur-md rounded-full mt-0.5" />
    </div>
  );
}
