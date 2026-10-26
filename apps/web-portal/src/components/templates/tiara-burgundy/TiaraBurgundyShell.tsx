'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Instagram,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { getTiaraMemberInfo, useTiaraHref, TIARA_THEME } from './utils';

interface TiaraBurgundyShellProps {
  member: any;
  theme: any;
  subdomain?: string;
  activePage?: 'beranda' | 'profil' | 'artikel' | 'infografis' | 'kontak';
  children: React.ReactNode;
}

export function TiaraBurgundyShell({
  member,
  theme,
  subdomain,
  activePage = 'beranda',
  children,
}: TiaraBurgundyShellProps) {
  const info = getTiaraMemberInfo(member, theme, subdomain);
  const href = useTiaraHref(subdomain);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', href: href('/'), active: activePage === 'beranda' },
    { label: 'Profil', href: href('/profil'), active: activePage === 'profil' },
    { label: 'Artikel', href: href('/artikel'), active: activePage === 'artikel' },
    { label: 'Infografis', href: href('/infografis'), active: activePage === 'infografis' },
    { label: 'Kontak', href: href('/kontak'), active: activePage === 'kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2A2220] font-sans selection:bg-[#6B1724] selection:text-white flex flex-col">
      {/* ========================================================= */}
      {/* TOP NAVBAR (Warm Oat Cream with Burgundy Serif Brand)      */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#EFEBE4]/95 backdrop-blur-md border-b border-[#E5DED5] transition-all">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
          
          {/* Left: Serif Brand Name */}
          <Link
            href={href('/')}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="flex flex-col">
              <span className="font-serif text-sm sm:text-base font-bold tracking-[0.2em] text-[#6B1724] uppercase group-hover:text-[#520F1A] transition-colors">
                {info.fullName}
              </span>
              <span className="text-[10px] tracking-[0.15em] font-semibold text-[#7A6F6A] uppercase hidden sm:block">
                DPR RI • DAPIL {info.dapil.toUpperCase()}
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-200 relative py-1 ${
                  link.active
                    ? 'text-[#6B1724]'
                    : 'text-[#6B1724]/70 hover:text-[#6B1724]'
                }`}
              >
                {link.label}
                {link.active && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-[1.5px] rounded-full"
                    style={{ backgroundColor: info.textAccentColor }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right: Instagram Pill Button & Mobile Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={info.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#6B1724] hover:bg-[#520F1A] text-white text-xs font-bold tracking-wider transition-all duration-300 shadow-sm group"
            >
              <span>Instagram</span>
              <Instagram className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            </a>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full bg-white border border-[#E5DED5] flex items-center justify-center text-[#6B1724]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 py-5 bg-[#EFEBE4] border-b border-[#E5DED5] space-y-3 animate-fadeIn">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-xs font-bold tracking-[0.15em] uppercase transition ${
                    link.active
                      ? 'bg-[#6B1724] text-white'
                      : 'text-[#6B1724] hover:bg-white/80'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="pt-3 border-t border-[#E5DED5]">
              <a
                href={info.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#6B1724] text-white text-xs font-bold tracking-wider uppercase shadow-sm"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram Resmi Dewan</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTENT                                              */}
      {/* ========================================================= */}
      <main className="flex-1 w-full">{children}</main>

      {/* ========================================================= */}
      {/* FOOTER (Warm Vintage Cream with Deep Burgundy Typography)  */}
      {/* ========================================================= */}
      <footer className="bg-[#EFEBE4] text-[#2A2220] border-t border-[#E5DED5] mt-auto">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-14 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">
            
            {/* Col 1: Brand & Mandate */}
            <div className="md:col-span-5 space-y-4">
              <div className="font-serif text-2xl font-bold tracking-tight text-[#6B1724] uppercase">
                {info.fullName}
              </div>

              <p className="text-xs sm:text-sm text-[#7A6F6A] leading-relaxed max-w-md font-medium">
                {info.bio}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5DED5] text-[11px] font-bold text-[#6B1724]">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{info.party}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5DED5] text-[11px] font-bold text-[#7A6F6A]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6B1724]" />
                  <span>Dapil {info.dapil}</span>
                </span>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6B1724]">
                Navigasi Portal
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-[#7A6F6A]">
                {navLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="hover:text-[#6B1724] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Contact & Office */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6B1724]">
                Sekretariat Parlemen
              </h4>
              <div className="space-y-3 text-xs sm:text-sm text-[#7A6F6A]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#6B1724] shrink-0 mt-0.5" />
                  <span className="leading-snug">{info.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#6B1724] shrink-0" />
                  <a
                    href={`mailto:${info.email}`}
                    className="hover:text-[#6B1724] transition"
                  >
                    {info.email}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#6B1724] shrink-0" />
                  <span>{info.phone}</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={info.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5DED5] hover:border-[#6B1724] text-xs font-bold text-[#6B1724] transition"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram Resmi</span>
                  <ExternalLink className="w-3 h-3 text-[#7A6F6A]" />
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-[#E5DED5] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7A6F6A] font-medium">
            <p>
              &copy; {new Date().getFullYear()} {info.fullName}. Hak cipta dilindungi undang-undang.
            </p>
            <p className="flex items-center gap-1.5">
              <span>Didukung oleh</span>
              <span className="font-bold" style={{ color: info.textAccentColor }}>POLARIS Parlemen AI</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
