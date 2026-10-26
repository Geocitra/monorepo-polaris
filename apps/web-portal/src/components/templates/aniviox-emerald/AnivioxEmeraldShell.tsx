'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Instagram,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { getAnivioxMemberInfo, useAnivioxHref, ANIVIOX_EMERALD } from './utils';

interface AnivioxEmeraldShellProps {
  children: React.ReactNode;
  member: any;
  theme: any;
  subdomain?: string;
  activePage?: 'beranda' | 'profil' | 'artikel' | 'infografis' | 'kontak';
  customHeader?: boolean;
}

export function AnivioxEmeraldShell({
  children,
  member,
  theme,
  subdomain,
  activePage = 'beranda',
  customHeader = false,
}: AnivioxEmeraldShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const info = getAnivioxMemberInfo(member, theme, subdomain);
  const href = useAnivioxHref(subdomain);

  const navItems = [
    { label: 'Beranda', path: '/', id: 'beranda' },
    { label: 'Profil', path: '/profil', id: 'profil' },
    { label: 'Artikel', path: '/artikel', id: 'artikel' },
    { label: 'Infografis', path: '/infografis', id: 'infografis' },
    { label: 'Kontak', path: '/kontak', id: 'kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#060A08] text-[#FFFFFF] font-sans antialiased selection:bg-[#00F076]/30 selection:text-white flex flex-col">
      {/* ══════════════════════════════════════════════════════════════════
          NAVBAR: PERSIS REFERENSI ANIVIOX (CLEAN BRAND + LINKS + PILL BUTTON)
      ══════════════════════════════════════════════════════════════════ */}
      {!customHeader && (
        <header className="sticky top-0 z-50 w-full bg-[#060A08]/90 backdrop-blur-xl border-b border-[#14241B] transition-all">
          <div className="max-w-[1320px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
            
            {/* Logo / Brand Name */}
            <Link
              href={href('/')}
              className="group flex items-center gap-3 tracking-tight transition-transform hover:scale-[1.02]"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F076] to-[#0B5C35] p-[1.5px] shadow-[0_0_20px_rgba(0,240,118,0.3)]">
                <div className="w-full h-full bg-[#08120C] rounded-[10px] flex items-center justify-center font-black text-sm text-[#00F076] group-hover:bg-[#00F076] group-hover:text-black transition-colors">
                  {info.firstName.charAt(0) || 'P'}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-white group-hover:text-[#00F076] transition-colors leading-tight">
                  {info.officialFullName}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A3B8AD]">
                  POLARIS CIVIC PORTAL
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Items */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <Link
                    key={item.id}
                    href={href(item.path)}
                    className={`text-sm font-medium transition-colors duration-200 relative py-1 ${
                      isActive
                        ? 'text-[#00F076] font-semibold'
                        : 'text-[#A3B8AD] hover:text-white'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00F076] rounded-full shadow-[0_0_8px_#00F076]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action: Instagram Pill Button */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href={info.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 pl-5 pr-2 py-2 rounded-full bg-white hover:bg-[#00F076] text-[#05120B] font-bold text-xs tracking-wide transition-all duration-300 shadow-lg hover:shadow-[0_0_24px_rgba(0,240,118,0.4)] group"
              >
                <span>Instagram</span>
                <div className="w-7 h-7 rounded-full bg-[#00F076] group-hover:bg-black text-black group-hover:text-[#00F076] flex items-center justify-center transition-colors">
                  <Instagram className="w-3.5 h-3.5" />
                </div>
              </a>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-white/80 hover:text-white rounded-lg bg-[#0C1510] border border-[#15241C]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-[#080E0B] border-b border-[#15241C] px-6 py-6 space-y-4">
              <nav className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={href(item.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-medium py-2 px-3 rounded-lg transition-colors ${
                      activePage === item.id
                        ? 'bg-[#00F076]/15 text-[#00F076] font-bold'
                        : 'text-[#A3B8AD] hover:bg-[#0C1510] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="pt-4 border-t border-[#15241C]">
                <a
                  href={info.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#00F076] text-black font-bold text-sm tracking-wide shadow-lg"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Kunjungi Instagram Resmi</span>
                </a>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER: LUXURY EMERALD NOIR
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-[#050806] border-t border-[#14241B] text-[#A3B8AD] pt-16 pb-12">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-[#14241B]">
            {/* Col 1: Identity & Bio */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00F076] text-black font-black flex items-center justify-center text-xs shadow-[0_0_15px_#00F076]">
                  {info.firstName.charAt(0) || 'P'}
                </div>
                <span className="font-extrabold text-lg text-white tracking-tight">
                  {info.officialFullName}
                </span>
              </div>
              <p className="text-xs text-[#00F076] font-mono uppercase tracking-[0.18em]">
                {info.headlineTagline}
              </p>
              <p className="text-xs text-[#688073] leading-relaxed max-w-md">
                {info.bio}
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F076]/10 border border-[#00F076]/30 text-[11px] font-mono text-[#00F076]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  PORTAL RESMI TERVERIFIKASI
                </span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-[0.25em] text-white font-bold">
                Navigasi Publik
              </h4>
              <ul className="space-y-2 text-xs">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={href(item.path)}
                      className="hover:text-[#00F076] transition-colors inline-flex items-center gap-1.5"
                    >
                      <ChevronRight className="w-3 h-3 text-[#00F076]/60" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Contact & Civic Office */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-[0.25em] text-white font-bold">
                Rumah Aspirasi & Kontak
              </h4>
              <ul className="space-y-2.5 text-xs text-[#A3B8AD]">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#00F076] shrink-0 mt-0.5" />
                  <span>{info.address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#00F076] shrink-0" />
                  <a href={`mailto:${info.email}`} className="hover:text-[#00F076] transition-colors">
                    {info.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#00F076] shrink-0" />
                  <a href={`tel:${info.phone}`} className="hover:text-[#00F076] transition-colors">
                    {info.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-[#00F076] shrink-0" />
                  <a
                    href={info.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#00F076] transition-colors inline-flex items-center gap-1"
                  >
                    <span>@{info.instagramUsername}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright & Disclaimer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#688073]">
            <p>© {new Date().getFullYear()} {info.officialFullName}. Seluruh Hak Cipta Dilindungi.</p>
            <p className="flex items-center gap-1">
              Dikelola melalui ekosistem <span className="text-[#00F076] font-semibold">POLARIS Civic Intelligence</span>
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
}
