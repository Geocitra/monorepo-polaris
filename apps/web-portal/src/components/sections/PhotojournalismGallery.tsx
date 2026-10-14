'use client';

import React from 'react';
import { Camera, MapPin, Sparkles } from 'lucide-react';

interface PhotojournalismGalleryProps {
  member: any;
  theme?: any;
  config?: Record<string, any>;
  variant?: string;
}

export function PhotojournalismGallery({
  member,
}: PhotojournalismGalleryProps) {
  // Foto kegiatan reses representatif
  const galleryItems = [
    {
      url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=600&auto=format&fit=crop',
      title: 'Dialog Serap Aspirasi Petani',
      location: 'Kecamatan Cikarang Barat',
    },
    {
      url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=600&auto=format&fit=crop',
      title: 'Tinjauan Jembatan Perintis',
      location: 'Dapil Jawa Barat',
    },
    {
      url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop',
      title: 'Kunjungan Sentra UMKM Mandiri',
      location: 'Pusat Usaha Rakyat',
    },
    {
      url: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?q=80&w=600&auto=format&fit=crop',
      title: 'Pemberdayaan Posyandu & Gizi',
      location: 'Balai Warga Daerah',
    },
  ];

  return (
    <section className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1">
            Rekam Jejak Lapangan
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Camera className="w-6 h-6 text-amber-500" />
            <span>Dokumentasi Kerja Nyata</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Liputan visual peninjauan proyek, rembuk warga, dan pengawalan pembangunan di Dapil {member.dapilName}.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Galeri Advokasi
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {galleryItems.map((item, index) => (
          <div
            key={index}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
              <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 shrink-0" />
                <span>{item.location}</span>
              </span>
              <h4 className="text-xs font-bold text-white line-clamp-1 mt-0.5">
                {item.title}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
