'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, ArrowRight, ShieldCheck, Video as VideoIcon } from 'lucide-react';

interface HeroVideoLoopProps {
  member: any;
  theme: any;
  config?: Record<string, any>;
  variant?: string;
}

export function HeroVideoLoop({ member, theme }: HeroVideoLoopProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDataSaver, setIsDataSaver] = useState(false);

  // Video fallback URL atau dari theme
  const videoUrl =
    theme.heroBannerUrl && theme.heroBannerUrl.match(/\.(mp4|webm)$/i)
      ? theme.heroBannerUrl
      : 'https://assets.mixkit.co/videos/preview/mixkit-crowd-walking-in-a-busy-city-street-4402-large.mp4';

  const posterImage =
    theme.officialPhotoUrl ||
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop';

  useEffect(() => {
    // 1. Deteksi koneksi hemat daya (Save-Data)
    if (typeof navigator !== 'undefined') {
      const conn = (navigator as any).connection;
      if (conn && (conn.saveData || (conn.effectiveType && conn.effectiveType.includes('2g')))) {
        setIsDataSaver(true);
        return;
      }
    }

    // 2. IntersectionObserver: Jeda pemutaran video saat di luar viewport (hemat baterai & CPU)
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[460px] sm:min-h-[520px] shadow-2xl flex flex-col justify-end border border-slate-800">
      {/* Background Video atau Static Poster Fallback */}
      {!isDataSaver ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={posterImage}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-45"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterImage}
          alt={member.fullName}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-45"
        />
      )}

      {/* Dark Ambient Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

      {/* Konten Hero */}
      <div className="relative z-10 p-6 sm:p-12 max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Advokasi Kerakyatan • Dapil {member.dapilName}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black leading-tight uppercase tracking-tight text-white drop-shadow-md">
          {theme.headlineTagline || 'Hadir dan Mendengar: Bekerja Nyata untuk Rakyat'}
        </h1>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
          {theme.bioBiography ||
            `Menyuarakan aspirasi warga wilayah ${member.dapilName} secara konsisten dan memperjuangkan program pemberdayaan masyarakat langsung di lapangan.`}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <Link
            href="#kategori"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-lg active:scale-95"
          >
            <span>Lihat Catatan Kinerja</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {!isDataSaver && (
            <button
              type="button"
              onClick={togglePlayback}
              className="inline-flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-bold text-white transition border border-white/20"
              title={isPlaying ? 'Jeda Video' : 'Putar Video'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Jeda Latar' : 'Putar Latar'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
