'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Instagram,
  Facebook,
  Linkedin,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Send,
  MapPin,
  Mail,
} from 'lucide-react';
import { getBlushMemberInfo, useBlushHref } from './utils';

export interface BlushEditorialShellProps {
  member: any;
  theme?: any;
  subdomain?: string;
  activePage: 'beranda' | 'profil' | 'artikel' | 'infografis' | 'kontak';
  breadcrumbTitle?: string;
  pageBadge?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  children: React.ReactNode;
  showMasthead?: boolean;
}

export function BlushEditorialShell({
  member,
  theme,
  subdomain,
  activePage,
  breadcrumbTitle,
  pageBadge,
  pageTitle,
  pageSubtitle,
  children,
  showMasthead = true,
}: BlushEditorialShellProps) {
  const info = getBlushMemberInfo(member, theme, subdomain);
  const href = useBlushHref(subdomain);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Inisial untuk Monogram Logo (misal: "DA." atau "JP.")
  const initials =
    info.officialFullName
      .replace(/^(Dr\.|Drs\.|H\.|Hj\.|Ir\.|Prof\.)\s*/gi, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0]?.toUpperCase())
      .join('') + '.' || 'DA.';

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '/' },
    { id: 'profil', label: 'Profil', href: '/profil' },
    { id: 'artikel', label: 'Artikel', href: '/artikel' },
    { id: 'infografis', label: 'Infografis', href: '/infografis' },
    { id: 'kontak', label: 'Kontak', href: '/kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#332A26] font-sans antialiased overflow-x-hidden flex flex-col selection:bg-[#D47A6A] selection:text-white">
      
      {/* ─── NAVBAR BERGAYA WARM LINEN EDITORIAL ─── */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#ECE5DC] transition-all">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          
          {/* Logo Monogram Persis Gambar (misal "DA.") */}
          <Link href={href('/')} className="flex items-center gap-3 select-none group">
            <span className="font-serif font-black text-2xl sm:text-3xl tracking-tight text-[#332A26] group-hover:text-[#D47A6A] transition-colors">
              {initials}
            </span>
            <div className="hidden sm:flex flex-col border-l border-[#DCD3C7] pl-3">
              <span className="font-outfit font-extrabold text-xs tracking-wider text-[#332A26] uppercase">
                {info.portalTitle || 'POLARIS'}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#857B74] font-medium">
                ADVOCACY &amp; PARLIAMENT
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items (Beranda, Profil, Artikel, Infografis, Kontak) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#6B615A]">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={href(item.href)}
                  className={`transition-colors py-1 relative ${
                    isActive ? 'font-extrabold' : 'hover:text-[#332A26]'
                  }`}
                  style={isActive ? { color: info.primaryColor } : {}}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: info.primaryColor }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Instagram Pill + CTA Pill "Kontak" */}
          <div className="flex items-center gap-3">
            {/* Instagram Pill Konsisten */}
            <a
              href={`https://instagram.com/${info.instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Resmi"
              className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-white font-bold text-xs shadow-sm hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none"
              style={{
                background:
                  'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)',
              }}
            >
              <Instagram className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="truncate max-w-[90px] xs:max-w-[120px] sm:max-w-none">
                @{info.instagramUsername}
              </span>
            </a>

            {/* CTA Button Terracotta Pill Persis Gambar ("LET'S TALK ➔") */}
            <Link
              href={href('/kontak')}
              className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg hover:brightness-105 transition-all"
              style={{ backgroundColor: info.primaryColor }}
            >
              <span>Kontak</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#332A26] hover:bg-[#EAE2D7] rounded-lg transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#ECE5DC] bg-[#FAF7F2] px-6 py-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={href(item.href)}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 text-xs font-bold uppercase tracking-wider border-b border-[#ECE5DC] ${
                  activePage === item.id ? 'font-extrabold' : 'text-[#6B615A]'
                }`}
                style={activePage === item.id ? { color: info.primaryColor } : {}}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={href('/kontak')}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 w-full text-center py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-105"
              style={{ backgroundColor: info.primaryColor }}
            >
              Hubungi Kami ➔
            </Link>
          </div>
        )}
      </header>

      {/* ─── MASTHEAD (SUB-PAGES) ─── */}
      {showMasthead && pageTitle && (
        <section className="relative bg-[#F4EFE6] border-b border-[#E8DFC0]/40 overflow-hidden">
          <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-[#D47A6A]/10 blur-[130px] pointer-events-none" />
          <div className="relative max-w-[1240px] mx-auto px-6 lg:px-10 py-14 sm:py-20">
            <nav className="flex items-center gap-2 text-xs text-[#80766E] mb-4 font-medium">
              <Link href={href('/')} className="hover:text-[#332A26] transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#B8ACA2]" />
              <span className="text-[#D47A6A] font-bold">{breadcrumbTitle || pageTitle}</span>
            </nav>

            {pageBadge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D47A6A]/15 text-[#B85E4E] text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{pageBadge}</span>
              </div>
            )}

            <h1 className="font-serif font-normal text-3xl sm:text-5xl lg:text-6xl text-[#332A26] tracking-tight leading-tight max-w-3xl">
              {pageTitle}
            </h1>

            {pageSubtitle && (
              <p className="mt-4 text-sm sm:text-base text-[#6B615A] max-w-2xl leading-relaxed">
                {pageSubtitle}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ─── MAIN CHILDREN ─── */}
      <main className="flex-1 w-full">{children}</main>

      {/* ─── FOOTER PERSIS GAMBAR REFERENSI ─── */}
      <footer className="bg-[#F3ECE1] border-t border-[#E5DBCF] text-[#6B615A] pt-12 pb-8">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E3D8CC]">
            {/* Social Icons & Email */}
            <div className="flex items-center gap-6 text-sm">
              <a
                href={`https://instagram.com/${info.instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#D47A6A] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${info.officialEmail}`}
                className="hover:text-[#D47A6A] transition-colors inline-flex items-center gap-2 text-xs font-semibold"
              >
                <Mail className="w-4 h-4 text-[#D47A6A]" />
                <span>{info.officialEmail}</span>
              </a>
            </div>

            {/* Navigasi Footer */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold uppercase tracking-wider">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={href(item.href)}
                  className="hover:text-[#D47A6A] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-xs text-[#80766E]">
              © {new Date().getFullYear()} {info.officialFullName}. All Rights Reserved.
            </p>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8C827A]">
            <p>
              Portal Advokasi Parlemen Resmi · {info.legislativeLevel} {info.party} · {info.dapil}
            </p>
            <p className="flex items-center gap-1 font-semibold">
              <span>Ditenagai Platform</span>
              <strong className="text-[#332A26] font-bold tracking-wider">POLARIS</strong>
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
