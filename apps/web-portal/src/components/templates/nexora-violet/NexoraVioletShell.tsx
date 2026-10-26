'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  User,
  Instagram,
  Sparkles,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { getNexoraMemberInfo, useNexoraHref } from './utils';

interface NexoraVioletShellProps {
  member: any;
  theme: any;
  subdomain?: string;
  activePage?: 'beranda' | 'profil' | 'artikel' | 'infografis' | 'kontak';
  children: React.ReactNode;
}

export function NexoraVioletShell({
  member,
  theme,
  subdomain,
  activePage = 'beranda',
  children,
}: NexoraVioletShellProps) {
  const info = getNexoraMemberInfo(member, theme, subdomain);
  const href = useNexoraHref(subdomain);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', href: href('/'), active: activePage === 'beranda' },
    { label: 'Profil', href: href('/profil'), active: activePage === 'profil' },
    { label: 'Artikel', href: href('/artikel'), active: activePage === 'artikel' },
    { label: 'Infografis', href: href('/infografis'), active: activePage === 'infografis' },
    { label: 'Kontak', href: href('/kontak'), active: activePage === 'kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#ECE6FD] text-slate-900 font-sans selection:bg-[#7048E8] selection:text-white p-2 sm:p-4 md:p-6 lg:p-8">
      {/* Outer Rounded Container matching the image mockup card */}
      <div className="max-w-7xl mx-auto bg-white rounded-[28px] sm:rounded-[36px] lg:rounded-[42px] shadow-[0_20px_60px_-15px_rgba(112,72,232,0.12)] border border-purple-100/80 overflow-hidden flex flex-col">
        
        {/* ========================================================= */}
        {/* TOP NAVBAR                                                */}
        {/* ========================================================= */}
        <header className="px-5 sm:px-8 lg:px-12 py-5 sm:py-6 border-b border-purple-50/80 flex items-center justify-between gap-4 relative z-30">
          
          {/* Left: Navigation Links (Desktop) & Brand (Mobile) */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              href={href('/')}
              className="md:hidden flex items-center gap-2 font-black text-sm text-slate-950"
            >
              <span>{info.callName}</span>
              <span className="text-[10px] font-bold text-[#7048E8]">• DPR RI</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs sm:text-sm font-semibold transition-colors duration-200 ${
                    link.active
                      ? 'text-[#7048E8] font-bold'
                      : 'text-slate-800 hover:text-[#7048E8]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Search, Avatar & Instagram Pill Button */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <Link
              href={href('/artikel')}
              className="w-9 h-9 rounded-full bg-slate-50 hover:bg-purple-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-[#7048E8] transition shadow-sm"
              title="Cari Artikel"
            >
              <Search className="w-4 h-4" />
            </Link>

            <Link
              href={href('/profil')}
              className="w-9 h-9 rounded-full bg-purple-100 border-2 border-white overflow-hidden shadow-sm hover:scale-105 transition"
              title="Profil Dewan"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={info.avatar}
                alt={info.fullName}
                className="w-full h-full object-cover object-top"
              />
            </Link>

            {/* Pill Action Button: Instagram */}
            <a
              href={info.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full border border-purple-200 bg-purple-50 hover:bg-[#7048E8] hover:text-white text-[#7048E8] text-xs font-bold transition-all duration-300 shadow-sm group"
            >
              <Instagram className="w-3.5 h-3.5 shrink-0 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Instagram</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 py-4 bg-purple-50/90 border-b border-purple-100 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-bold ${
                  link.active
                    ? 'bg-[#7048E8] text-white'
                    : 'text-slate-800 hover:bg-white/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-purple-200/60">
              <a
                href={info.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#7048E8] text-white text-xs font-bold shadow-sm"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram Resmi Dewan</span>
              </a>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN BODY CONTENT                                         */}
        {/* ========================================================= */}
        <main className="flex-1 w-full">{children}</main>

        {/* ========================================================= */}
        {/* FOOTER (Nexora Violet Aesthetic)                           */}
        {/* ========================================================= */}
        <footer className="bg-slate-950 text-white mt-auto border-t border-purple-900/40">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Col 1: Brand & Bio */}
              <div className="md:col-span-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black tracking-widest text-white uppercase">
                    NEXORA
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#7048E8] text-[10px] font-bold text-white uppercase tracking-wider">
                    POLARIS
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                  Portal transparansi legislasi kenegaraan resmi {info.fullName}. Mengawal aspirasi konstituen Daerah Pemilihan {info.dapil} dengan dedikasi, transparansi, dan integritas.
                </p>
                <div className="text-xs text-purple-300 font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#8262FE]" />
                  <span>Kanal Informasi Resmi Anggota Dewan Terverifikasi</span>
                </div>
              </div>

              {/* Col 2: Navigation Links */}
              <div className="md:col-span-3 space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-purple-400">
                  Navigasi Utama
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>
                    <Link href={href('/')} className="hover:text-[#8262FE] transition">
                      Beranda
                    </Link>
                  </li>
                  <li>
                    <Link href={href('/profil')} className="hover:text-[#8262FE] transition">
                      Profil & Rekam Jejak
                    </Link>
                  </li>
                  <li>
                    <Link href={href('/artikel')} className="hover:text-[#8262FE] transition">
                      Katalog Artikel Kebijakan
                    </Link>
                  </li>
                  <li>
                    <Link href={href('/infografis')} className="hover:text-[#8262FE] transition">
                      Infografis Kinerja APBD
                    </Link>
                  </li>
                  <li>
                    <Link href={href('/kontak')} className="hover:text-[#8262FE] transition">
                      Saluran Aspirasi Warga
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 3: Sekretariat & Posko */}
              <div className="md:col-span-4 space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-purple-400">
                  Sekretariat Dewan
                </div>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 shrink-0 text-[#8262FE] mt-0.5" />
                    <span>{info.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 shrink-0 text-[#8262FE]" />
                    <a href={`mailto:${info.email}`} className="hover:text-[#8262FE] transition">
                      {info.email}
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0 text-[#8262FE]" />
                    <span>{info.phone}</span>
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href={href('/kontak')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7048E8] hover:bg-[#5F3DC4] text-white text-xs font-bold transition shadow-md"
                  >
                    <span>Kirim Aspirasi Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                © {new Date().getFullYear()} {info.fullName}. Hak Cipta Dilindungi Undang-Undang.
              </div>
              <div className="text-[11px] text-purple-400/80 font-mono">
                Didukung oleh POLARIS Dewan System
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
