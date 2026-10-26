'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Linkedin, Menu, X, ChevronRight, Landmark } from 'lucide-react';
import { getCrimsonMemberInfo, useCrimsonHref } from './utils';

/* ─── Small shared primitives ─── */

export function CrimsonLabel({
  children,
  color = '#D62828',
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[12px] font-bold text-white">
      <span
        className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[7px]"
        style={{ borderLeftColor: color }}
      />
      <span>{children}</span>
    </div>
  );
}

export function CrimsonButton({
  href,
  children,
  className = '',
  onClick,
  type,
  color = '#D62828',
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  color?: string;
}) {
  const cls = `inline-flex items-center justify-center gap-2 px-5 py-2 rounded-[3px] text-white text-xs font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer hover:brightness-110 ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} style={{ backgroundColor: color }}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type || 'button'} onClick={onClick} className={cls} style={{ backgroundColor: color }}>
      {children}
    </button>
  );
}

/** Portrait frame with ambient aura/backdrop and natural photo colors. */
export function CrimsonPortrait({
  src,
  alt,
  className = '',
  color = '#D62828',
}: {
  src: string;
  alt: string;
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[4px] bg-[#141414] border shadow-2xl group ${className}`}
      style={{ borderColor: `${color}66` }}
    >
      {/* Ambient aura backlight behind photo using user's primaryColor */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(ellipse at center, ${color} 0%, rgba(15,15,15,0.95) 75%)`,
        }}
      />

      {/* Natural Color Photo */}
      <img
        src={src}
        alt={alt}
        className="relative z-10 w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-700"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/images/dewan-ahmad-fauzi-cutout.png';
        }}
      />

      {/* Subtle bottom vignette for depth */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0B0B0B]/80 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

export function CrimsonLogo({ title, color = '#D62828' }: { title: string; color?: string }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <span
        className="w-8 h-8 rounded-md flex items-center justify-center shadow-md transition-colors"
        style={{ backgroundColor: color }}
      >
        <Landmark className="w-4 h-4 text-white" />
      </span>
      <span className="font-outfit font-black text-sm tracking-[0.18em] text-white uppercase hidden sm:inline">
        {title}
      </span>
    </span>
  );
}

/* ─── Shell ─── */

export interface CrimsonNoirShellProps {
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
  showCta?: boolean;
}

export function CrimsonNoirShell({
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
  showCta = true,
}: CrimsonNoirShellProps) {
  const info = getCrimsonMemberInfo(member, theme, subdomain);
  const href = useCrimsonHref(subdomain);
  const [open, setOpen] = useState(false);

  const navItems = [
    { id: 'beranda', label: 'Beranda', href: '/' },
    { id: 'profil', label: 'Profil', href: '/profil' },
    { id: 'artikel', label: 'Artikel', href: '/artikel' },
    { id: 'infografis', label: 'Infografis', href: '/infografis' },
    { id: 'kontak', label: 'Kontak', href: '/kontak' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#D4D4D4] font-sans antialiased overflow-x-hidden flex flex-col selection:bg-[#D62828] selection:text-white">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href={href('/')} aria-label="Beranda">
            <CrimsonLogo title={info.portalTitle} color={info.primaryColor} />
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => {
              const active = activePage === item.id;
              return (
                <Link
                  key={item.id}
                  href={href(item.href)}
                  className={`relative text-[11px] font-bold uppercase tracking-[0.08em] py-1 transition-colors ${
                    active ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      className="absolute left-0 -bottom-0.5 h-[2px] w-full"
                      style={{ backgroundColor: info.primaryColor }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`https://instagram.com/${info.instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white font-bold text-[11px] sm:text-xs shadow-md hover:opacity-95 hover:scale-105 active:scale-95 transition-all select-none"
              style={{ background: 'linear-gradient(90deg, #833AB4 0%, #C13584 35%, #E1306C 65%, #F77737 100%)' }}
            >
              <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate max-w-[110px] sm:max-w-none">@{info.instagramUsername}</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-md"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-white/5 bg-[#0B0B0B] px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={href(item.href)}
                onClick={() => setOpen(false)}
                className={`py-2.5 text-xs font-bold uppercase tracking-wider border-b border-white/5 ${
                  activePage === item.id ? 'font-black' : 'text-white/80'
                }`}
                style={activePage === item.id ? { color: info.primaryColor } : {}}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ─── MASTHEAD (sub pages) ─── */}
      {showMasthead && pageTitle && (
        <section className="relative bg-[#0E0E0E] border-b border-white/5 overflow-hidden">
          <div
            className="absolute -top-32 right-0 w-[420px] h-[420px] rounded-full blur-[120px] pointer-events-none opacity-20"
            style={{ backgroundColor: info.primaryColor }}
          />
          <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10 py-14 sm:py-20">
            <nav className="flex items-center gap-1.5 text-[11px] text-white/50 mb-6">
              <Link href={href('/')} className="hover:text-white">
                Beranda
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">{breadcrumbTitle || pageTitle}</span>
            </nav>
            {pageBadge && (
              <p className="font-bold text-sm mb-2" style={{ color: info.primaryColor }}>
                {pageBadge}
              </p>
            )}
            <h1 className="font-outfit font-extrabold text-3xl sm:text-5xl text-white uppercase tracking-tight leading-tight max-w-3xl">
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p className="mt-4 text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed">{pageSubtitle}</p>
            )}
          </div>
        </section>
      )}

      <main className="flex-1 w-full">{children}</main>

      {/* ─── CTA: "Lets work together" ─── */}
      {showCta && (
        <section className="bg-[#0B0B0B] border-t border-white/5">
          <div className="max-w-[1000px] mx-auto px-6 lg:px-10 py-16 sm:py-20 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="font-outfit font-extrabold text-3xl sm:text-[40px] leading-[1.2] text-white">
                Mari bersama wujudkan aspirasi untuk daerah kita
              </h2>
              <p className="mt-4 text-[11px] sm:text-xs text-white/55 max-w-sm leading-relaxed">
                Kolaborasi adalah kunci. Sampaikan gagasan dan keluhan Anda, kita kawal bersama hingga menjadi
                kebijakan nyata di {info.dapil}.
              </p>
            </div>
            <CrimsonButton href={href('/kontak')} className="self-start md:self-center px-7">
              Kontak
            </CrimsonButton>
          </div>
        </section>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0B0B0B] border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-5 flex items-center justify-between gap-4">
          <Link href={href('/')} aria-label="Beranda">
            <CrimsonLogo title={info.portalTitle} />
          </Link>
          <p className="hidden sm:block text-[10px] text-white/35">
            © {new Date().getFullYear()} {info.officialFullName} · Ditenagai POLARIS
          </p>
          <div className="flex items-center gap-5 text-white">
            <a
              href={`https://instagram.com/${info.instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-[#D62828] transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-[#D62828] transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-[#D62828] transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
