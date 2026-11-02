'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, ExternalLink } from 'lucide-react';

interface ThemeEducationCardProps {
  profileEducation?: string;
  profileCourses?: string[];
}

export function ThemeEducationCard({
  profileEducation,
  profileCourses,
}: ThemeEducationCardProps) {
  return (
    <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <GraduationCap className="h-4 w-4 text-emerald-500" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            Kredensial Pendidikan Formal & Kursus
          </h4>
        </div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <span>Ubah di Menu Profil</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block">
            Pendidikan Terdaftar
          </span>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
            {profileEducation || (
              <span className="text-slate-400 italic">Belum mengisi riwayat pendidikan resmi.</span>
            )}
          </p>
        </div>

        {profileCourses && profileCourses.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Diklat & Kursus Parlemen
            </span>
            <div className="flex flex-wrap gap-1">
              {profileCourses.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

