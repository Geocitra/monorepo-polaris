'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Instagram, Sparkles } from 'lucide-react';

interface NavbarProps {
  subdomain: string;
  officialName: string;
  partyAffiliation: string;
}

export function Navbar({ subdomain, officialName, partyAffiliation }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Beranda', href: '/', exact: true },
    { label: 'Profil', href: '/profil', exact: false },
    { label: 'Artikel', href: '/artikel', exact: false },
    { label: 'Infografis', href: '/infografis', exact: false },
    { label: 'Kontak', href: '/kontak', exact: false },
  ];

  const isActive = (link: typeof navLinks[0]) => {
    if (link.exact) {
      return pathname === '/';
    }
    return pathname.startsWith(link.href);
  };

  const handleUsername = subdomain || 'dewan';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        {/* BRANDING: Lambang Garuda Kenegaraan & Identitas Resmi */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 shadow-xs group-hover:scale-105 transition-transform">
            <svg
              className="w-6 h-6 text-amber-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4zm0 2.18l6 3v4.82c0 4.47-3.08 8.64-6 9.8-2.92-1.16-6-5.33-6-9.8V7.18l6-3z" />
              <path d="M12 6.5l1.5 3.5 3.5.5-2.5 2.5.5 3.5-3-1.8-3 1.8.5-3.5-2.5-2.5 3.5-.5z" />
            </svg>
          </div>
          <div>
            <span className="block text-sm sm:text-base font-black tracking-tight text-slate-900 leading-tight">
              {officialName || 'Dr. Ir. Sangsoro Mowo Berkah, M.Sc.'}
            </span>
            <span className="block text-[11px] font-semibold text-slate-500">
              Fraksi {partyAffiliation || 'DPR RI'}
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS DENGAN HALAMAN KHUSUS (DEDICATED PAGES) */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-xs sm:text-sm font-semibold">
          {navLinks.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-1 transition-all ${
                  active
                    ? 'text-amber-800 font-bold border-b-2 border-amber-600'
                    : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT ACTIONS: Pencarian Cepat & Tautan Akun Resmi Media Sosial */}
        <div className="flex items-center space-x-3">
          <Link
            href="/artikel"
            aria-label="Cari Artikel"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* TAUTAN AKUN RESMI DEWAN (INSTAGRAM & THREADS) */}
          <a
            href={`https://instagram.com/${handleUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:opacity-90 shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <Instagram className="h-3.5 w-3.5" />
            <span>@{handleUsername}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
