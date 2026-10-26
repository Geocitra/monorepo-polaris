'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Instagram,
  ArrowRight,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { getLailaMemberInfo, useLailaHref, LAILA_SAKURA } from './utils';

interface LailaSakuraShellProps {
  children: React.ReactNode;
  member: any;
  theme: any;
  subdomain?: string;
  activePage?: 'beranda' | 'profil' | 'artikel' | 'infografis' | 'kontak';
  customHeader?: boolean;
}

export function LailaSakuraShell({
  children,
  member,
  theme,
  subdomain,
  activePage = 'beranda',
  customHeader = false,
}: LailaSakuraShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const info = getLailaMemberInfo(member, theme, subdomain);
  const href = useLailaHref(subdomain);

  const navItems = [
    { label: 'HOME', path: '/', id: 'beranda' },
    { label: 'ABOUT', path: '/profil', id: 'profil' },
    { label: 'ARTIKEL', path: '/artikel', id: 'artikel' },
    { label: 'INFOGRAFIS', path: '/infografis', id: 'infografis' },
    { label: 'CONTACT', path: '/kontak', id: 'kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#080D1A] text-[#FFFFFF] font-sans antialiased selection:bg-[#FF4D8D]/30 selection:text-white flex flex-col">
      
      {/* ══════════════════════════════════════════════════════════════════
          NAVBAR: PERSIS FLOATING PINK CAPSULE DI GAMBAR LAILA
      ══════════════════════════════════════════════════════════════════ */}
      {!customHeader && (
        <header className="sticky top-0 z-50 w-full pt-4 pb-2 px-4 sm:px-6 flex justify-center backdrop-blur-md bg-[#080D1A]/80 transition-all">
          <div className="w-full max-w-[920px] rounded-full px-5 sm:px-7 py-2.5 bg-gradient-to-r from-[#FFD1DC] via-[#FFB7C5] to-[#FFAEC9] shadow-[0_8px_30px_rgba(255,77,141,0.25)] border border-white/40 flex items-center justify-between">
            
            {/* Logo / Brand Name (Persis "LAILA" di Gambar) */}
            <Link
              href={href('/')}
              className="flex items-center gap-2 font-black text-base sm:text-lg tracking-wider text-[#7A0E37] hover:text-[#9C1248] transition-colors"
            >
              <span>{info.firstName.toUpperCase() || 'LAILA'}</span>
              <span className="text-[10px] font-mono tracking-widest text-[#FF2E74] font-extrabold uppercase bg-white/70 px-2 py-0.5 rounded-full shadow-2xs">
                POLARIS
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-extrabold tracking-wider text-[#6B1D3E]">
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <Link
                    key={item.id}
                    href={href(item.path)}
                    className={`transition-colors py-1 relative ${
                      isActive
                        ? 'text-[#C2185B]'
                        : 'hover:text-[#C2185B]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#C2185B] rounded-full shadow-[0_0_6px_#FF2E74]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action: Pill Button (Instagram Resmi Dewan) */}
            <div className="hidden sm:flex items-center">
              <a
                href={info.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full bg-[#FF2E74] hover:bg-[#E01E5A] text-white text-xs font-black tracking-wider transition-all duration-300 shadow-[0_2px_12px_rgba(255,46,116,0.4)] hover:shadow-[0_4px_18px_rgba(255,46,116,0.6)] group"
              >
                <span>Instagram</span>
                <Instagram className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              </a>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-[#7A0E37] hover:text-[#9C1248] rounded-full hover:bg-white/40 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-16 inset-x-4 z-40 bg-[#0E1726]/95 backdrop-blur-xl border border-[#263754] rounded-3xl p-5 shadow-2xl space-y-3">
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={href(item.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-bold py-2 px-3 rounded-xl transition-colors ${
                      activePage === item.id
                        ? 'bg-[#FF4D8D]/20 text-[#FF4D8D]'
                        : 'text-[#A0ABC0] hover:bg-[#131F38] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="pt-3 border-t border-[#1E2B42]">
                <a
                  href={info.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#FF2E74] text-white font-bold text-xs shadow-lg"
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
          FOOTER: SAKURA NOIR EDITORIAL
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-[#050811] border-t border-[#1E2B42] text-[#A0ABC0] pt-16 pb-12">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-[#1E2B42]">
            {/* Col 1: Identity & Bio */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF4D8D] text-white font-black flex items-center justify-center text-xs shadow-[0_0_15px_#FF4D8D]">
                  🌸
                </div>
                <span className="font-extrabold text-lg text-white tracking-tight">
                  {info.officialFullName}
                </span>
              </div>
              <p className="text-xs font-mono uppercase tracking-[0.18em]" style={{ color: info.primaryColor }}>
                {info.headlineTagline}
              </p>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-md">
                {info.bio}
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF4D8D]/10 border border-[#FF4D8D]/30 text-[11px] font-mono text-[#FF4D8D]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  PORTAL AKUNTABILITAS PUBLIK
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
                      className="hover:text-[#FF4D8D] transition-colors inline-flex items-center gap-1.5"
                    >
                      <ChevronRight className="w-3 h-3 text-[#FF4D8D]/60" />
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
              <ul className="space-y-2.5 text-xs text-[#A0ABC0]">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#FF4D8D] shrink-0 mt-0.5" />
                  <span>{info.address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#FF4D8D] shrink-0" />
                  <a href={`mailto:${info.email}`} className="hover:text-[#FF4D8D] transition-colors">
                    {info.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#FF4D8D] shrink-0" />
                  <a href={`tel:${info.phone}`} className="hover:text-[#FF4D8D] transition-colors">
                    {info.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-[#FF4D8D] shrink-0" />
                  <a
                    href={info.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF4D8D] transition-colors inline-flex items-center gap-1"
                  >
                    <span>@{info.instagramUsername}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#64748B]">
            <p>© {new Date().getFullYear()} {info.officialFullName}. Seluruh Hak Cipta Dilindungi.</p>
            <p className="flex items-center gap-1">
              Dikelola melalui ekosistem <span className="text-[#FF4D8D] font-semibold">POLARIS Civic Intelligence</span>
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
}
