'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Award, Plus, X, BookOpen, Sparkles, School } from 'lucide-react';
import { EDUCATION_LEVEL_OPTIONS, POPULAR_COURSES_SUGGESTIONS } from './profile-constants';

interface CredentialsEducationFormProps {
  education: string;
  setEducation: (val: string) => void;
  courses: string[];
  onAddCourse: (course: string) => void;
  onRemoveCourse: (course: string) => void;
}

export function CredentialsEducationForm({
  education,
  setEducation,
  courses,
  onAddCourse,
  onRemoveCourse,
}: CredentialsEducationFormProps) {
  const [newCourseInput, setNewCourseInput] = useState('');
  const [eduLevel, setEduLevel] = useState('S1 (Sarjana)');

  function handleAddCourse(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const clean = newCourseInput.trim();
    if (!clean) return;
    onAddCourse(clean);
    setNewCourseInput('');
  }

  return (
    <Card className="p-3.5 sm:p-4 space-y-3 shadow-2xs border-slate-200 bg-white rounded-xl">
      {/* HEADER */}
      <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <span>Kredensial Pendidikan & Kursus Parlemen</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Riwayat pendidikan resmi dan pelatihan kepemimpinan dewan.
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
          Kredensial
        </span>
      </div>

      {/* PENDIDIKAN */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
          <School className="h-3 w-3 text-blue-600" />
          <span>Riwayat Pendidikan Resmi</span>
        </label>

        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <span className="text-[9px] text-slate-400 font-semibold block mb-0.5">
              Jenjang Terakhir
            </span>
            <select
              value={eduLevel}
              onChange={(e) => {
                setEduLevel(e.target.value);
                if (!education.includes(e.target.value)) {
                  setEducation(education ? `${e.target.value}, ${education}` : e.target.value);
                }
              }}
              className="block w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
            >
              {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[9px] text-slate-400 font-semibold block mb-0.5">
              Almamater, Jurusan & Tahun
            </span>
            <textarea
              rows={2}
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="Contoh: S2 Magister Kebijakan Publik (UI, 2018), S1 Ilmu Hukum (UGM, 2012)"
              className="block w-full rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* KURSUS-KURSUS */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
            <Award className="h-3 w-3 text-blue-600" />
            <span>Kursus & Pelatihan Parlemen</span>
          </label>
          <span className="text-[10px] text-slate-400">
            {courses.length} Kursus
          </span>
        </div>

        {/* CONTAINER DAFTAR KURSUS */}
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 min-h-[38px] flex flex-wrap items-center gap-1">
          {courses.map((course) => (
            <span
              key={course}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-[11px] font-medium shadow-2xs"
            >
              <BookOpen className="h-2.5 w-2.5 text-blue-600" />
              <span>{course}</span>
              <button
                type="button"
                onClick={() => onRemoveCourse(course)}
                className="hover:text-red-600 rounded-full p-0.5 ml-0.5 text-slate-400 transition-colors cursor-pointer"
                title={`Hapus ${course}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}

          {courses.length === 0 && (
            <span className="text-xs text-slate-400 italic">
              Belum ada kursus atau diklat terdaftar.
            </span>
          )}
        </div>

        {/* INPUT TAMBAH KURSUS */}
        <div className="flex gap-1.5">
          <input
            type="text"
            value={newCourseInput}
            onChange={(e) => setNewCourseInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCourse();
              }
            }}
            placeholder="Nama kursus (contoh: Lemhannas PPRA LXV, Kursus Pimpinan Dewan)..."
            className="block flex-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handleAddCourse()}
            variant="outline"
            className="border-slate-300 font-bold gap-1 shrink-0 text-xs px-2.5 h-7 cursor-pointer"
          >
            <Plus className="h-3 w-3 text-blue-600" />
            <span>Tambah</span>
          </Button>
        </div>

        {/* QUICK SUGGESTIONS */}
        <div className="pt-0.5">
          <div className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-amber-500" />
            <span>Saran Diklat Populer:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {POPULAR_COURSES_SUGGESTIONS.slice(0, 6).map((preset) => {
              const isAdded = courses.includes(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onAddCourse(preset)}
                  disabled={isAdded}
                  className={`text-[10px] px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                    isAdded
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600 shadow-2xs'
                  }`}
                >
                  + {preset}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
