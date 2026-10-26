'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Instagram,
  ArrowRight,
  Shield,
  Sparkles,
  FileText,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { getWashoskiMemberInfo, useWashoskiHref, WASHOSKI_CYAN } from './utils';

export interface WashoskiCyanShellProps {
  member: any;
  theme?: any;
  subdomain?: string;
  activePage?: 'beranda' | 'profil' | 'artikel' | 'infografis' | 'kontak';
  children: React.ReactNode;
}

export function WashoskiCyanShell({
  member,
  theme,
  subdomain,
  activePage = 'beranda',
  children,
}: WashoskiCyanShellProps) {
  const info = getWashoskiMemberInfo(member, theme, subdomain);
  const href = useWashoskiHref(subdomain);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Beranda', path: '/', key: 'beranda' },
    { label: 'Profil', path: '/profil', key: 'profil' },
    { label: 'Artikel', path: '/artikel', key: 'artikel' },
    { label: 'Infografis', path: '/infografis', key: 'infografis' },
    { label: 'Kontak', path: '/kontak', key: 'kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-[#05DFD7] selection:text-black flex flex-col font-sans antialiased">
      {/* ─── NAVBAR ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#070707]/95 backdrop-blur-md border-b border-[#1A1A1A] py-3.5 shadow-xl shadow-black/60'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          
          {/* Logo Brand: Typographic with Cyan Dot & Accent */}
          <Link href={href('/')} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#2A2A2A] flex items-center justify-center transition-all"
              style={{ color: info.primaryColor }}>
              <span className="font-black text-sm tracking-tighter">
                {(info.firstName || info.officialFullName || 'W').charAt(0).toUpperCase()}.
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white group-hover:text-[#05DFD7] transition-colors leading-tight">
                {info.officialFullName} <span style={{ color: info.primaryColor }}>.</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#71717A] mt-0.5">
                {info.legislativeLevel}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = activePage === item.key;
              return (
                <Link
                  key={item.key}
                  href={href(item.path)}
                  style={isActive ? { color: info.primaryColor } : undefined}
                  className={`text-xs uppercase tracking-widest font-bold transition-all relative py-1 ${
                    isActive
                      ? ''
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: info.primaryColor, boxShadow: `0 0 8px ${info.primaryColor}` }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Instagram Button (Consistent with other templates) */}
          <div className="hidden md:flex items-center">
            <a
              href={info.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
              style={{
                background:
                  'linear-gradient(135deg, #FD1D1D 0%, #E1306C 50%, #C13584 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#141414] border border-[#222] text-white hover:text-[#05DFD7] transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0C0C0C] border-b border-[#1E1E1E] px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => {
                const isActive = activePage === item.key;
                return (
                  <Link
                    key={item.key}
                    href={href(item.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    style={isActive ? { backgroundColor: info.primaryColor, color: '#000' } : undefined}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${
                      isActive
                        ? 'text-black font-extrabold'
                        : 'text-[#9CA3AF] hover:bg-[#181818] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#1E1E1E]">
              <a
                href={info.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white shadow-md"
                style={{
                  background:
                    'linear-gradient(135deg, #FD1D1D 0%, #E1306C 50%, #C13584 100%)',
                }}
              >
                <Instagram className="w-4 h-4" />
                <span>Kunjungi Instagram Resmi</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1">{children}</main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#040404] border-t border-[#161616] py-12">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#141414]">
            
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center" style={{ color: info.primaryColor }}>
                <span className="font-black text-xs">
                  {(info.firstName || info.officialFullName || 'W').charAt(0).toUpperCase()}.
                </span>
              </div>
              <span className="text-sm font-bold text-white">
                {info.officialFullName}
              </span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-wider text-[#9CA3AF]">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={href(item.path)}
                  className="hover:text-[#05DFD7] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Social Link */}
            <div className="flex items-center gap-3">
              <a
                href={info.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#111] border border-[#222] flex items-center justify-center text-[#9CA3AF] hover:text-[#05DFD7] hover:border-[#05DFD7] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={href('/kontak')}
                className="w-8 h-8 rounded-full bg-[#111] border border-[#222] flex items-center justify-center text-[#9CA3AF] hover:text-[#05DFD7] hover:border-[#05DFD7] transition-colors"
                aria-label="Kontak"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#52525B]">
            <p>© 2026 {info.officialFullName}. Seluruh Hak Cipta Dilindungi.</p>
            <p className="flex items-center gap-1.5">
              <span>Didukung oleh</span>
              <span className="font-bold tracking-wider" style={{ color: info.primaryColor }}>POLARIS CIVIC ENGINE</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
