'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getLandingMediaUrl } from '@/lib/landing-media';

export interface HeroReelItem {
  id: string;
  reelNumber: number;
  label: string;
  title: string;
  description: string;
  thumbnail: string;
  webmSrc: string;
  mp4Src: string;
}

export const HERO_REELS: HeroReelItem[] = [
  {
    id: 'reel-1',
    reelNumber: 1,
    label: 'Aspirasi & Kebutuhan Warga',
    title: 'Mendengar Denyut Suara Masyarakat',
    description: 'Serap isu dan aspirasi daerah langsung dari lapangan menjadi gagasan kebijakan nyata.',
    thumbnail: getLandingMediaUrl('/images/showcase-artikel-pertanian.jpg'),
    webmSrc: getLandingMediaUrl('/videos/hero/reel-1.webm'),
    mp4Src: getLandingMediaUrl('/videos/hero/reel-1.mp4'),
  },
  {
    id: 'reel-2',
    reelNumber: 2,
    label: 'Parlemen & Ruang Sidang',
    title: 'Transparansi Parlemen & Musyawarah',
    description: 'Rangkum risalah rapat komisi dan pembahasan anggaran APBD secara terstruktur.',
    thumbnail: getLandingMediaUrl('/images/showcase-infografis-apbd.jpg'),
    webmSrc: getLandingMediaUrl('/videos/hero/reel-2.webm'),
    mp4Src: getLandingMediaUrl('/videos/hero/reel-2.mp4'),
  },
  {
    id: 'reel-3',
    reelNumber: 3,
    label: 'Analisis & Kampanye Kebijakan',
    title: 'Sintesis Data & Narasi Berbobot',
    description: 'Desain infografis, rilis pers, dan orkestrasi konten publikasi multi-kanal dalam sekejap.',
    thumbnail: getLandingMediaUrl('/images/showcase-poster-surya.jpg'),
    webmSrc: getLandingMediaUrl('/videos/hero/reel-3.webm'),
    mp4Src: getLandingMediaUrl('/videos/hero/reel-3.mp4'),
  },
];

const POSTER_FALLBACK = getLandingMediaUrl('/images/concierge/hero-poster.webp');

interface HeroVideoBackgroundProps {
  onReelChange?: (activeReel: HeroReelItem, index: number) => void;
  activeReelIndex?: number;
  onActiveIndexChange?: (newIndex: number) => void;
  onProgressChange?: (progressPct: number) => void;
}

export function HeroVideoBackground({
  onReelChange,
  activeReelIndex: controlledIndex,
  onActiveIndexChange,
  onProgressChange,
}: HeroVideoBackgroundProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const [isPlaying, setIsPlaying] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Update active index
  const changeIndex = useCallback(
    (newIndex: number) => {
      const sanitized = (newIndex + HERO_REELS.length) % HERO_REELS.length;
      if (onActiveIndexChange) {
        onActiveIndexChange(sanitized);
      } else {
        setInternalIndex(sanitized);
      }
      if (onReelChange) {
        onReelChange(HERO_REELS[sanitized], sanitized);
      }
      if (onProgressChange) {
        onProgressChange(0);
      }
    },
    [onActiveIndexChange, onProgressChange, onReelChange]
  );

  // Next video handler
  const handleNextVideo = useCallback(() => {
    changeIndex(activeIndex + 1);
  }, [activeIndex, changeIndex]);

  // Handle motion preference and visibility
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      if (e.matches) {
        setIsPlaying(false);
      }
    };

    motionQuery.addEventListener('change', handleMotionChange);

    let isIntersecting = true;
    const syncPlayback = () => {
      const activeVideo = videoRefs.current[activeIndex];
      if (!activeVideo) return;

      if (
        document.visibilityState === 'visible' &&
        isIntersecting &&
        isPlaying &&
        !motionQuery.matches
      ) {
        activeVideo.play().catch(() => {});
      } else {
        activeVideo.pause();
      }
    };

    const handleVisibility = () => syncPlayback();
    document.addEventListener('visibilitychange', handleVisibility);

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              isIntersecting = entry.isIntersecting && entry.intersectionRatio > 0.1;
              syncPlayback();
            },
            { threshold: [0, 0.1] }
          )
        : null;

    if (containerRef.current && observer) {
      observer.observe(containerRef.current);
    }

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer?.disconnect();
    };
  }, [activeIndex, isPlaying]);

  // Synchronize active video playback on index change
  useEffect(() => {
    if (isReducedMotion) return;

    videoRefs.current.forEach((video, idx) => {
      if (!video) return;

      if (idx === activeIndex) {
        video.currentTime = 0;
        if (isPlaying) {
          video.play().catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, [activeIndex, isPlaying, isReducedMotion]);

  // Progress update listener for the active video
  useEffect(() => {
    const activeVideo = videoRefs.current[activeIndex];
    if (!activeVideo) return;

    const handleTimeUpdate = () => {
      if (activeVideo.duration && onProgressChange) {
        const pct = (activeVideo.currentTime / activeVideo.duration) * 100;
        onProgressChange(pct);
      }
    };

    const handleEnded = () => {
      handleNextVideo();
    };

    activeVideo.addEventListener('timeupdate', handleTimeUpdate);
    activeVideo.addEventListener('ended', handleEnded);

    return () => {
      activeVideo.removeEventListener('timeupdate', handleTimeUpdate);
      activeVideo.removeEventListener('ended', handleEnded);
    };
  }, [activeIndex, handleNextVideo, onProgressChange]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 h-full w-full overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. STACKED VIDEO ELEMENTS FOR SEAMLESS CROSS-FADE */}
      {HERO_REELS.map((reel, idx) => {
        const isActive = idx === activeIndex;

        return (
          <div
            key={reel.id}
            className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <video
              ref={(el) => {
                videoRefs.current[idx] = el;
              }}
              muted
              playsInline
              preload={idx === 0 ? 'auto' : 'metadata'}
              poster={POSTER_FALLBACK}
              className="h-full w-full object-cover object-center transform-gpu"
            >
              <source src={reel.webmSrc} type="video/webm" />
              <source src={reel.mp4Src} type="video/mp4" />
            </video>
          </div>
        );
      })}

      {/* 2. CRYSTAL-CLEAR NATURAL OVERLAYS (Light & Subtle for maximum video visibility) */}
      {/* Soft gradient from top (for navbar/title readability) and bottom (for cards readability) */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/55 via-transparent to-black/60 pointer-events-none" />

      {/* Very subtle lateral vignette so video shines in the center */}
      <div className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(0,0,0,0.45)_100%)] pointer-events-none" />
    </div>
  );
}
