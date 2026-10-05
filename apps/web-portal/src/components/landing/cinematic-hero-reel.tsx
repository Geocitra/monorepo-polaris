'use client';

import { useEffect, useRef } from 'react';
import { getLandingMediaUrl } from '@/lib/landing-media';

const POSTER_SRC = getLandingMediaUrl('/images/concierge/hero-poster.webp');
const WEBM_SRC = getLandingMediaUrl('/videos/hero/reel-1.webm');
const MP4_SRC = getLandingMediaUrl('/videos/hero/reel-1.mp4');

export function CinematicHeroReel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isVisible = false;
    const syncPlayback = () => {
      if (motionPreference.matches) {
        video.pause();
        return;
      }
      if (!isVisible || document.visibilityState !== 'visible') {
        video.pause();
        return;
      }

      void video.play().catch(() => {
        video.pause();
      });
    };

    const observer = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        syncPlayback();
      }, { threshold: [0, 0.15] });

    if (observer) {
      observer.observe(container);
    } else {
      isVisible = true;
      syncPlayback();
    }

    const handleMotionChange = () => syncPlayback();
    const handleVisibilityChange = () => syncPlayback();
    motionPreference.addEventListener('change', handleMotionChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer?.disconnect();
      motionPreference.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      video.pause();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-2xl shadow-slate-950/30"
    >
      <video
        ref={videoRef}
        aria-label="Cuplikan video pengenalan POLARIS"
        muted
        loop
        playsInline
        controls
        preload="none"
        poster={POSTER_SRC}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={WEBM_SRC} type="video/webm" />
        <source src={MP4_SRC} type="video/mp4" />
      </video>
    </div>
  );
}
