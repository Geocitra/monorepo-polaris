'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Instagram,
  ArrowRight,
  ShieldCheck,
  User,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { getParichayMemberInfo, useParichayHref } from './utils';

export interface ParichayAmberShellProps {
  member: any;
  theme: any;
  subdomain?: string;
  activePage?: 'beranda' | 'profil' | 'artikel' | 'infografis' | 'kontak';
  children: React.ReactNode;
  showMasthead?: boolean;
}

export function ParichayAmberShell({
  member,
  theme,
  subdomain,
  activePage = 'beranda',
  children,
  showMasthead = false,
}: ParichayAmberShellProps) {
  const info = getParichayMemberInfo(member, theme, subdomain);
  const href = useParichayHref(subdomain);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    if (activePage !== 'beranda') {
      setIsScrolled(true);
      return;
    }

    function handleScroll() {
      setIsScrolled(window.scrollY > 30);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activePage]);

  const isTransparent = activePage === 'beranda' && !isScrolled;

  const navLinks = [
    { key: 'beranda', label: 'Beranda', path: '/' },
    { key: 'profil', label: 'Profil', path: '/profil' },
    { key: 'artikel', label: 'Artikel', path: '/artikel' },
    { key: 'infografis', label: 'Infografis', path: '/infografis' },
    { key: 'kontak', label: 'Kontak', path: '/kontak' },
  ];

  return (
    <div
      className="min-h-screen bg-white text-[#1E1E1E] flex flex-col font-sans selection:bg-[#FFA800]/20 selection:text-[#1E1E1E]"
      style={
        {
          ['--parichay-primary' as any]: info.primaryColor,
        } as React.CSSProperties
      }
    >
      {/* ─── NAVBAR: TRANSPARAN DI ATAS MENGIKUTI BACKGROUND SECTION 1, BERUBAH KETIKA SCROLL ─── */}
      <header
        className={`w-full z-50 transition-all duration-300 ${
          isTransparent
            ? 'absolute top-0 left-0 right-0 bg-transparent border-transparent'
            : activePage === 'beranda'
            ? 'fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-[#F3E8D6] shadow-xs'
            : 'sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#F3E8D6] shadow-xs'
        }`}
      >
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 xl:px-16 h-20 flex items-center justify-between">
          
          {/* Logo Sisi Kiri: Lingkaran Amber + Teks Brand "Parichay" / Nama */}
          <Link href={href('/')} className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
              style={{ backgroundColor: info.primaryColor }}
            >
              <User className="w-5 h-5 fill-white text-transparent" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#1E1E1E] leading-tight">
                {info.officialFullName}
              </span>
              <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider mt-0.5">
                {info.legislativeLevel}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = activePage === link.key;
              return (
                <Link
                  key={link.key}
                  href={href(link.path)}
                  className={`text-sm font-semibold transition-colors relative py-1 ${
                    isActive
                      ? 'text-[#1E1E1E] font-bold'
                      : 'text-[#6B7280] hover:text-[#1E1E1E]'
                  }`}
                  style={isActive ? { color: info.primaryColor } : {}}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: info.primaryColor }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sisi Kanan: Tombol Instagram Resmi Konsisten dengan Template Lain */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`https://instagram.com/${info.instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Resmi"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-xs shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none"
              style={{
                background:
                  'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="truncate max-w-[130px]">
                @{info.instagramUsername}
              </span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#1E1E1E] hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#1E1E1E]" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#F3E8D6] px-6 py-5 space-y-3 shadow-xl animate-in slide-in-from-top-3 duration-300">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive = activePage === link.key;
                return (
                  <Link
                    key={link.key}
                    href={href(link.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#FFF9ED] text-[#1E1E1E]'
                        : 'text-[#6B7280] hover:bg-slate-50'
                    }`}
                    style={isActive ? { color: info.primaryColor } : {}}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#F3E8D6] flex items-center justify-between">
              <a
                href={`https://instagram.com/${info.instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white font-bold text-xs shadow-sm"
                style={{
                  background:
                    'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
                }}
              >
                <Instagram className="w-3.5 h-3.5 text-white" />
                <span>@{info.instagramUsername}</span>
              </a>

              <Link
                href={href('/kontak')}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: info.primaryColor }}
              >
                Kontak
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full">{children}</main>

      {/* ─── FOOTER MODERN PERSIS AESTHETICS AMBER ─── */}
      <footer className="bg-[#1E1E1E] text-white border-t border-black/20 pt-16 pb-12">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            
            {/* Kolom 1: Profil & Brand */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: info.primaryColor }}
                >
                  <User className="w-4 h-4 fill-white text-transparent" />
                </div>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  {info.officialFullName}
                </span>
              </div>
              <p className="text-xs text-white/70 max-w-sm leading-relaxed">
                Portal komunikasi resmi wakil rakyat {info.officialFullName} ({info.legislativeLevel}) – Menyerap, memperjuangkan, dan mewujudkan kebijakan daerah yang transparan serta adil bagi seluruh warga {info.dapil}.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={`https://instagram.com/${info.instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E4405F] text-white flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Kolom 2: Navigasi Cepat */}
            <div className="md:col-span-3 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFA800]" style={{ color: info.primaryColor }}>
                NAVIGASI UTAMA
              </span>
              <ul className="space-y-2 text-xs text-white/75 font-medium">
                <li>
                  <Link href={href('/')} className="hover:text-white transition-colors">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link href={href('/profil')} className="hover:text-white transition-colors">
                    Biografi &amp; Kinerja
                  </Link>
                </li>
                <li>
                  <Link href={href('/artikel')} className="hover:text-white transition-colors">
                    Artikel &amp; Risalah
                  </Link>
                </li>
                <li>
                  <Link href={href('/infografis')} className="hover:text-white transition-colors">
                    Infografis Capaian
                  </Link>
                </li>
                <li>
                  <Link href={href('/kontak')} className="hover:text-white transition-colors">
                    Posko &amp; Aspirasi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kolom 3: Kontak & Jam Layanan */}
            <div className="md:col-span-4 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFA800]" style={{ color: info.primaryColor }}>
                POSKO RESES &amp; ASPIRASI
              </span>
              <div className="space-y-2.5 text-xs text-white/75">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#FFA800] shrink-0 mt-0.5" style={{ color: info.primaryColor }} />
                  <span>Sekretariat Fraksi, Gedung DPRD {info.dapil}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#FFA800] shrink-0" style={{ color: info.primaryColor }} />
                  <span>{info.officialEmail}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#FFA800] shrink-0" style={{ color: info.primaryColor }} />
                  <span>{info.officialPhone}</span>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
            <div>
              &copy; {new Date().getFullYear()} {info.officialFullName}. Seluruh Hak Cipta Dilindungi.
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FFA800]" style={{ color: info.primaryColor }} />
              <span>Didukung oleh POLARIS Civic Engine</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
