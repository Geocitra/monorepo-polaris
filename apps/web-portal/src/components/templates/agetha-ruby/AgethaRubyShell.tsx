'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Instagram,
  ArrowRight,
  Shield,
  FileText,
  PieChart,
  User,
  Mail,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { getAgethaMemberInfo, useAgethaHref, AGETHA_RUBY } from './utils';

export interface AgethaRubyShellProps {
  member: any;
  theme?: any;
  subdomain?: string;
  activePage?: 'beranda' | 'profil' | 'artikel' | 'infografis' | 'kontak';
  children: React.ReactNode;
}

export function AgethaRubyShell({
  member,
  theme,
  subdomain,
  activePage = 'beranda',
  children,
}: AgethaRubyShellProps) {
  const info = getAgethaMemberInfo(member, theme, subdomain);
  const href = useAgethaHref(subdomain);
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
    <div className="min-h-screen bg-[#0F0F0F] text-white selection:bg-[#E50914] selection:text-white flex flex-col font-sans antialiased">
      {/* ─── NAVBAR ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0F0F0F]/95 backdrop-blur-md border-b border-[#262626] py-3.5 shadow-xl shadow-black/40'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo Brand: Red Geometric Icon (matching fox/geometric head in reference) */}
          <Link href={href('/')} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-[#E50914] group-hover:border-[#E50914] transition-colors">
              {/* Geometric Polygon SVG Fox/Mask Icon */}
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"
              >
                <path d="M4 4l4 6h8l4-6-2 10-6 6-6-6-2-10z" />
                <path d="M9 10l3 3 3-3" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white group-hover:text-[#E50914] transition-colors leading-none">
                {info.firstName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#9CA3AF] mt-1">
                {info.party}
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
                  className={`text-xs uppercase tracking-widest font-bold transition-colors ${
                    isActive
                      ? ''
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  {item.label}
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
            className="md:hidden p-2 rounded-lg bg-[#1A1A1A] border border-[#262626] text-white hover:text-[#E50914] transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#141414] border-b border-[#262626] px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => {
                const isActive = activePage === item.key;
                return (
                  <Link
                    key={item.key}
                    href={href(item.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${
                      isActive
                        ? 'bg-[#E50914] text-white'
                        : 'text-[#9CA3AF] hover:bg-[#1E1E1E] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#262626]">
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

      {/* ─── FOOTER (PERSIS GAMBAR REFERENSI: MINIMALIST DARK & MASCOT) ─── */}
      <footer className="bg-[#0A0A0A] border-t border-[#1F1F1F] py-12">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#1A1A1A]">
            {/* Logo Mascot */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#2E2E2E] flex items-center justify-center text-[#E50914]">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 stroke-current fill-none stroke-2 stroke-linecap-round stroke-linejoin-round"
                >
                  <path d="M4 4l4 6h8l4-6-2 10-6 6-6-6-2-10z" />
                  <path d="M9 10l3 3 3-3" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">{info.officialFullName}</span>
            </div>

            {/* Nav Footer Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-wider text-[#9CA3AF]">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={href(item.path)}
                  className="hover:text-white transition-colors"
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
                className="w-8 h-8 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center text-[#9CA3AF] hover:text-[#E50914] hover:border-[#E50914] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={href('/kontak')}
                className="w-8 h-8 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center text-[#9CA3AF] hover:text-[#E50914] hover:border-[#E50914] transition-colors"
                aria-label="Kontak"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
            <p>© 2026 {info.officialFullName}. Seluruh Hak Cipta Dilindungi.</p>
            <p className="flex items-center gap-1.5">
              <span>Didukung oleh</span>
              <span className="text-white font-bold tracking-wider">POLARIS CIVIC ENGINE</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
