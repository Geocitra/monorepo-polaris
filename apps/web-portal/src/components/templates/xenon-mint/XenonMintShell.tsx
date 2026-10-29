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
  Search,
} from 'lucide-react';
import { getXenonMemberInfo, useXenonHref, XENON_THEME } from './utils';

interface XenonMintShellProps {
  member: any;
  theme: any;
  subdomain?: string;
  activePage?: 'beranda' | 'profil' | 'artikel' | 'infografis' | 'kontak';
  children: React.ReactNode;
}

export function XenonMintShell({
  member,
  theme,
  subdomain,
  activePage = 'beranda',
  children,
}: XenonMintShellProps) {
  const info = getXenonMemberInfo(member, theme, subdomain);
  const href = useXenonHref(subdomain);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', href: href('/'), active: activePage === 'beranda' },
    { label: 'Profil', href: href('/profil'), active: activePage === 'profil' },
    { label: 'Artikel', href: href('/artikel'), active: activePage === 'artikel' },
    { label: 'Infografis', href: href('/infografis'), active: activePage === 'infografis' },
    { label: 'Kontak', href: href('/kontak'), active: activePage === 'kontak' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00E599] selection:text-slate-950 flex flex-col">
      {/* ========================================================= */}
      {/* TOP NAVBAR (Obsidian Dark with Neon Mint Accents)         */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#081018]/95 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity */}
          <Link
            href={href('/')}
            className="flex items-center group focus:outline-none"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white uppercase group-hover:text-[#00E599] transition-colors">
                  {info.fullName}
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-bold text-[#00E599] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00E599]/10 border border-[#00E599]/25">
                  {(info.legislativeLevel || 'DPR RI').replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide hidden sm:block">
                Dapil {info.dapil}
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 relative py-1 ${
                  link.active
                    ? 'text-[#00E599]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
                {link.active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#00E599] rounded-full shadow-[0_0_8px_#00E599]" />
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
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-[#00E599] hover:bg-[#00D084] text-slate-950 text-xs font-black tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(0,229,153,0.3)] hover:shadow-[0_0_28px_rgba(0,229,153,0.55)] group"
            >
              <span>Instagram</span>
              <Instagram className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            </a>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center text-white hover:text-[#00E599] transition"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 py-5 bg-[#081018] border-b border-slate-800 space-y-3 animate-fadeIn">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide transition ${
                    link.active
                      ? 'bg-[#00E599] text-slate-950'
                      : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="pt-3 border-t border-slate-800">
              <a
                href={info.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#00E599] text-slate-950 text-xs font-black uppercase tracking-wider shadow-md"
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
      {/* FOOTER (Obsidian Dark with Mint Highlights)               */}
      {/* ========================================================= */}
      <footer className="bg-[#081018] text-white border-t border-slate-800/80 mt-auto">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-14 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">
            
            {/* Col 1: Brand & Mandate */}
            <div className="md:col-span-5 space-y-5">
              <div className="flex items-center">
                <span className="text-xl font-black tracking-wider text-white uppercase">
                  {info.fullName}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
                {info.bio}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-bold text-[#00E599]">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{info.party}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-bold text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00E599]" />
                  <span>Dapil {info.dapil}</span>
                </span>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#00E599]">
                Menu Portal
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-400">
                {navLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="hover:text-[#00E599] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Contact & Office */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#00E599]">
                Sekretariat Parlemen
              </h4>
              <div className="space-y-3 text-xs sm:text-sm text-slate-400">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#00E599] shrink-0 mt-0.5" />
                  <span className="leading-snug">{info.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#00E599] shrink-0" />
                  <a
                    href={`mailto:${info.email}`}
                    className="hover:text-white transition"
                  >
                    {info.email}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#00E599] shrink-0" />
                  <span>{info.phone}</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={info.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-[#00E599] text-xs font-bold text-white hover:text-[#00E599] transition"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#00E599]" />
                  <span>Ikuti di Instagram</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
            <p>
              &copy; {new Date().getFullYear()} {info.fullName}. Hak cipta dilindungi undang-undang.
            </p>
            <p className="flex items-center gap-1.5">
              <span>Didukung oleh</span>
              <span className="font-bold text-[#00E599]">POLARIS Parlemen AI</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
