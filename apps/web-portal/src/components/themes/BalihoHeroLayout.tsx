'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MessageSquare, ArrowRight, MapPin, Users, HeartHandshake, Sparkles, Megaphone } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';

interface ThemeLayoutProps {
  member: any;
  theme: any;
  recentArticles: any[];
}

export function BalihoHeroLayout({ member, theme, recentArticles }: ThemeLayoutProps) {
  const primaryColor = theme.primaryHexColor || '#2563EB';

  return (
    <div className="space-y-12">
      {/* MASSIVE DIGITAL BALIHO HERO */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-8 border-b-4 border-amber-400">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Kolom Teks Hero & Komitmen Kerakyatan */}
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
              <Megaphone className="w-4 h-4" />
              <span>Bersama Rakyat Membangun Daerah</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight uppercase drop-shadow-md">
                {member.fullName}
              </h1>
              <p className="text-lg sm:text-xl font-bold text-amber-300 flex items-center gap-2">
                <MapPin className="w-5 h-5 shrink-0" />
                <span>Wakil Rakyat Dapil {member.dapilName}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-sm sm:text-base italic leading-relaxed text-slate-100">
              "{theme.headlineTagline || 'Amanah rakyat adalah kehormatan tertinggi. Kami hadir untuk melayani tanpa sekat.'}"
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {theme.bioBiography}
            </p>

            {/* Quick Action Badges */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/lapor"
                className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 transition transform active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Sampaikan Aspirasi Sekarang</span>
              </Link>
              <Link
                href="#kabar"
                className="px-6 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/30 transition flex items-center gap-2"
              >
                <span>Lihat Laporan Kinerja</span>
              </Link>
            </div>
          </div>

          {/* Kolom Foto Baliho Raksasa */}
          <div className="md:col-span-5 flex justify-center">
            {theme.officialPhotoUrl ? (
              <div className="relative w-64 h-80 sm:w-80 sm:h-96 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={theme.officialPhotoUrl}
                  alt={member.fullName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            ) : (
              <div className="w-64 h-80 rounded-3xl border-4 border-amber-400 bg-slate-800 flex items-center justify-center text-slate-400">
                <Users className="w-16 h-16" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STATISTIK & RESES DAPIL */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-8 relative z-10">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center">
            <span className="text-xs font-bold text-slate-400">Fraksi Parlemen</span>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">
              {member.partyAffiliation || 'Non-Fraksi'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center">
            <span className="text-xs font-bold text-slate-400">Komisi Dewan</span>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">
              {member.commissionName || 'Alat Kelengkapan'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center">
            <span className="text-xs font-bold text-slate-400">Provinsi</span>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">
              {member.provinceName}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center">
            <span className="text-xs font-bold text-slate-400">Status Keabsahan</span>
            <div className="text-base sm:text-lg font-black text-emerald-600 mt-0.5 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>KPU Sah</span>
            </div>
          </div>
        </div>

        {/* FEED KABAR KERJA & ADVOKASI */}
        <section id="kabar" className="mt-16 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Kabar Kerja & Advokasi Dapil
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Laporan kegiatan kunjungan dapil, serap aspirasi, dan pembelaan hak warga.
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>

          {recentArticles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
              Belum ada kabar advokasi yang diterbitkan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentArticles.map((article: any) => (
                <article
                  key={article.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-6 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 inline-block">
                      Laporan Reses
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-2 hover:text-amber-600 transition">
                      <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{formatDateIndonesian(article.publishedAt)}</span>
                    <Link
                      href={`/artikel/${article.slug}`}
                      className="font-bold text-amber-600 hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Kegiatan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
