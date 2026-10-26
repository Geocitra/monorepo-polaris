'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { getArikMemberInfo, useArikHref, ARIK_NOIR } from './utils';

export interface ArikNoirShellProps {
  children: React.ReactNode;
  member: any;
  theme?: any;
  subdomain?: string;
  activePage?: 'beranda' | 'profil' | 'artikel' | 'infografis' | 'kontak';
}

export function ArikNoirShell({
  children,
  member,
  theme,
  subdomain,
  activePage = 'beranda',
}: ArikNoirShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const info = getArikMemberInfo(member, theme, subdomain);
  const href = useArikHref(subdomain);

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

  const brandInitial = (info.firstName || info.officialFullName || 'A').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F2EB] selection:bg-[#E8DCC4] selection:text-[#0A0A0A] flex flex-col font-sans antialiased">
      {/* ─── FLOATING PILL NAVBAR (PERSIS GAMBAR REFERENSI ARIK) ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-4 sm:pt-6 px-4 pointer-events-none">
        <div className="max-w-[960px] mx-auto pointer-events-auto">
          <div
            className={`flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 ${
              scrolled
                ? 'bg-[#121212]/95 backdrop-blur-xl border border-[#262626] shadow-2xl shadow-black/80'
                : 'bg-[#141414]/85 backdrop-blur-md border border-[#222222] shadow-xl'
            }`}
          >
            {/* Brand Monogram & Full Name (arik. style with gold dot) */}
            <Link href={href('/')} className="flex items-center gap-2.5 group">
              <span className="text-sm sm:text-base font-bold tracking-tight text-[#F5F2EB] group-hover:text-[#E8DCC4] transition-colors lowercase">
                {info.officialFullName || 'arik'}<span className="text-[#C5A880]">.</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {navItems.map((item) => {
                const isActive = activePage === item.key;
                return (
                  <Link
                    key={item.key}
                    href={href(item.path)}
                    className={`text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors relative py-1 ${
                      isActive
                        ? 'text-[#F5F2EB]'
                        : 'text-[#8E8A83] hover:text-[#F5F2EB]'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C5A880]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action: Instagram Pill Button (Persis LET'S TALK Pill Button pada Gambar) */}
            <div className="flex items-center gap-2">
              <a
                href={info.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E8DCC4] hover:bg-[#F5F2EB] text-[#0A0A0A] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 shadow-xs hover:scale-105 active:scale-95"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full text-[#F5F2EB] hover:bg-[#222222] transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="max-w-[960px] mx-auto mt-2 pointer-events-auto md:hidden">
            <div className="bg-[#121212]/95 backdrop-blur-2xl border border-[#262626] rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
              {navItems.map((item) => {
                const isActive = activePage === item.key;
                return (
                  <Link
                    key={item.key}
                    href={href(item.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all ${
                      isActive
                        ? 'bg-[#1E1E1E] text-[#E8DCC4]'
                        : 'text-[#8E8A83] hover:text-[#F5F2EB] hover:bg-[#181818]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#5C5852]" />
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-[#1E1E1E]">
                <a
                  href={info.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#E8DCC4] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Kunjungi Instagram</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1">{children}</main>

      {/* ─── FOOTER (LUXURY NOIR EDITORIAL FOOTER) ─── */}
      <footer className="bg-[#070707] border-t border-[#1A1A1A] pt-16 pb-12 text-[#8E8A83]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          
          {/* Top Row: Big Statement + Call to Action */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-[#161616]">
            <div className="space-y-3 max-w-xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C5A880] block">
                POLARIS CIVIC ADVOCACY
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif italic text-[#F5F2EB] tracking-tight">
                Mari Bersama Mengawal Kebijakan Publik yang Berdampak Nyata.
              </h2>
              <p className="text-xs text-[#7A7670] leading-relaxed">
                Portal aspirasi dan transparansi kerja legislatif resmi {info.officialFullName}, {info.headlineTagline}.
              </p>
            </div>

            <Link
              href={href('/kontak')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#161616] border border-[#2A2A2A] hover:border-[#C5A880] text-[#F5F2EB] hover:text-[#E8DCC4] text-xs font-bold uppercase tracking-wider transition-all self-start md:self-auto group"
            >
              <span>Hubungi Saya</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Middle Row: Navigation Links + Social Glyphs */}
          <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#141414]">
            
            {/* Brand Logo in Footer */}
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-[#F5F2EB] lowercase">
                {info.officialFullName}<span className="text-[#C5A880]">.</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#5C5852] pl-2 border-l border-[#222]">
                {info.legislativeLevel}
              </span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] uppercase tracking-widest font-semibold">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={href(item.path)}
                  className="hover:text-[#E8DCC4] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href={info.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-[#121212] border border-[#222] flex items-center justify-center text-[#8E8A83] hover:text-[#F5F2EB] hover:border-[#C5A880] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href={href('/kontak')}
                aria-label="Email"
                className="w-8 h-8 rounded-full bg-[#121212] border border-[#222] flex items-center justify-center text-[#8E8A83] hover:text-[#F5F2EB] hover:border-[#C5A880] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5C5852]">
            <p>© 2026 {info.officialFullName}. Seluruh Hak Cipta Dilindungi.</p>
            <p className="flex items-center gap-1.5">
              <span>Didukung oleh</span>
              <span className="font-semibold text-[#8E8A83]">Polaris Parlemen Platform</span>
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
}
