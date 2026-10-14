'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, ShieldCheck } from 'lucide-react';

interface HeroParliamentStandProps {
  member: any;
  theme: any;
  config?: Record<string, any>;
  variant?: string;
}

export function HeroParliamentStand({
  member,
  theme,
}: HeroParliamentStandProps) {
  const photoUrl =
    theme?.officialPhotoUrl ||
    member?.photoUrl ||
    '/images/avatar-dewan-budi.jpg';

  const fullName = member?.fullName || 'Dr. Ir. Sangsoro Mowo Berkah, M.Sc.';
  const party = member?.partyAffiliation || 'Golkar';
  const dapil = member?.dapilName || member?.customDapilName || 'Jawa Barat I';

  return (
    <section id="profil" className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#ebf3f9] via-[#f5f8fa] to-white border border-slate-200 shadow-sm">
      {/* BACKGROUND GRAPHIC: Siluet Gedung Parlemen DPR RI di sebelah kanan */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 pointer-events-none flex items-center justify-end overflow-hidden opacity-80">
        <svg
          viewBox="0 0 800 450"
          className="w-full h-full object-cover object-right opacity-80"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="domeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#759c87" />
              <stop offset="100%" stopColor="#4f7360" />
            </linearGradient>
            <linearGradient id="pillarGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f3f4f6" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>

          {/* Tiang & Bendera Merah Putih */}
          <g transform="translate(490, 45)">
            <line x1="0" y1="0" x2="0" y2="70" stroke="#71717a" strokeWidth="3" />
            <path d="M0,0 Q18,-5 32,3 Q42,9 50,2 L50,16 Q42,23 32,17 Q18,9 0,14 Z" fill="#dc2626" />
            <path d="M0,14 Q18,9 32,17 Q42,23 50,16 L50,30 Q42,37 32,31 Q18,23 0,28 Z" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" />
          </g>

          {/* Kubah Kura-Kura Khas Gedung Nusantara DPR RI */}
          <g>
            <path
              d="M260,150 C330,85 650,85 720,150 C710,135 630,95 490,95 C350,95 270,135 260,150 Z"
              fill="url(#domeGrad)"
            />
            <path
              d="M230,155 C320,110 660,110 750,155 L740,165 C650,125 330,125 240,165 Z"
              fill="#3e5c4d"
            />
          </g>

          {/* Struktur Balok Atap & Fasad Megah Parlemen */}
          <g>
            <rect x="230" y="165" width="520" height="24" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            <rect x="245" y="189" width="490" height="12" fill="#e2e8f0" />
            
            {/* Pilar-Pilar Kolonade Parlemen */}
            {Array.from({ length: 22 }).map((_, i) => (
              <rect
                key={i}
                x={255 + i * 21.5}
                y="201"
                width="11"
                height="115"
                rx="1"
                fill="url(#pillarGrad)"
                stroke="#cbd5e1"
                strokeWidth="0.8"
              />
            ))}

            {/* Lambang Garuda di Fasad */}
            <g transform="translate(485, 240)">
              <circle cx="15" cy="15" r="16" fill="#f59e0b" opacity="0.9" />
              <circle cx="15" cy="15" r="13" fill="#ffffff" />
              <path
                d="M15,5 L18,12 L25,12 L19,16 L22,23 L15,18 L8,23 L11,16 L5,12 L12,12 Z"
                fill="#d97706"
              />
            </g>

            {/* Podium Tangga Utama Parlemen */}
            <polygon points="210,316 770,316 790,360 190,360" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="205" y1="330" x2="775" y2="330" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="198" y1="345" x2="782" y2="345" stroke="#cbd5e1" strokeWidth="1" />
          </g>
        </svg>
      </div>

      {/* FOREGROUND CONTENT: 2 Kolom Persis Gambar 1 */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-8 pb-0 flex flex-col md:flex-row items-end justify-between gap-8 md:gap-12 min-h-[440px]">
        {/* Kolom Kiri: Foto Formal Berdiri Tegak Berwibawa */}
        <div className="shrink-0 w-full sm:w-auto flex justify-center md:justify-start">
          <div className="relative h-72 sm:h-84 md:h-96 lg:h-[420px] w-56 sm:w-64 md:w-72 rounded-t-2xl overflow-hidden shadow-2xl border-x-4 border-t-4 border-white bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={fullName}
              className="h-full w-full object-cover object-top filter brightness-[1.02] contrast-[1.03]"
            />
            {/* Pin Parlemen di foto */}
            <div className="absolute top-3 right-3 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Headline Kenegaraan Gambar 1 */}
        <div className="flex-1 pb-10 md:pb-14 space-y-4 text-center md:text-left">
          {/* Nama Gelar Dewan */}
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-600 block tracking-wide">
              {fullName}
            </span>
          </div>

          {/* Headline Utama Kenegaraan */}
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.18] uppercase">
            MELAYANI DENGAN INTEGRITAS.{' '}
            <span className="block text-[#96702c]">
              MENGABDI UNTUK RAKYAT.
            </span>
          </h1>

          {/* Link: Pelajari Lebih Lanjut Tentang Pekerjaan Saya */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <Link
              href="/artikel"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 hover:text-[#96702c] transition-colors group"
            >
              <span>Pelajari Lebih Lanjut Tentang Pekerjaan Saya</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-[#96702c]" />
            </Link>

            <span className="hidden sm:inline text-slate-300">•</span>

            <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                Fraksi {party} • Dapil {dapil}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
