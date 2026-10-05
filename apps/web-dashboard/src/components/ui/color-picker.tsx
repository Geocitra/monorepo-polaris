'use client';

import { useState, useRef, useCallback, useEffect, type MouseEvent, type TouchEvent } from 'react';
import { Check, Copy } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   Color Math Utilities — Pure TS, no external libraries
   ═══════════════════════════════════════════════════════════ */

interface HSV { h: number; s: number; v: number; }
interface RGB { r: number; g: number; b: number; }

function hsvToRgb({ h, s, v }: HSV): RGB {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;

  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function rgbToHsv({ r, g, b }: RGB): HSV {
  const rN = r / 255, gN = g / 255, bN = b / 255;
  const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    switch (max) {
      case rN: h = 60 * (((gN - bN) / d) % 6); break;
      case gN: h = 60 * (((bN - rN) / d) + 2); break;
      case bN: h = 60 * (((rN - gN) / d) + 4); break;
    }
  }
  if (h < 0) h += 360;

  return { h, s, v };
}

function hexToHsv(hex: string): HSV {
  return rgbToHsv(hexToRgb(hex));
}

function hsvToHex(hsv: HSV): string {
  return rgbToHex(hsvToRgb(hsv));
}

/* ═══════════════════════════════════════════════════════════
   ColorPicker Component — Canva-style visual picker
   ═══════════════════════════════════════════════════════════ */

interface ColorPickerProps {
  value: string;           // Current hex color
  onChange: (hex: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(value || '#3B82F6'));
  const [copied, setCopied] = useState(false);
  const [isDraggingArea, setIsDraggingArea] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  const areaRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => {
    if (value) {
      const newHsv = hexToHsv(value);
      // Only update if significantly different to avoid loops
      if (
        Math.abs(newHsv.h - hsv.h) > 2 ||
        Math.abs(newHsv.s - hsv.s) > 0.02 ||
        Math.abs(newHsv.v - hsv.v) > 0.02
      ) {
        setHsv(newHsv);
      }
    }
  }, [value]);

  // ─── Saturation/Brightness Area Handling ───
  const handleAreaInteraction = useCallback((clientX: number, clientY: number) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

    const s = x / rect.width;
    const v = 1 - (y / rect.height);

    const newHsv = { h: hsv.h, s, v };
    setHsv(newHsv);
    onChange(hsvToHex(newHsv));
  }, [hsv.h, onChange]);

  const handleAreaMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setIsDraggingArea(true);
    handleAreaInteraction(e.clientX, e.clientY);
  };

  const handleAreaTouchStart = (e: TouchEvent) => {
    setIsDraggingArea(true);
    const touch = e.touches[0];
    handleAreaInteraction(touch.clientX, touch.clientY);
  };

  // ─── Hue Slider Handling ───
  const handleHueInteraction = useCallback((clientX: number) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const h = (x / rect.width) * 360;

    const newHsv = { ...hsv, h };
    setHsv(newHsv);
    onChange(hsvToHex(newHsv));
  }, [hsv, onChange]);

  const handleHueMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setIsDraggingHue(true);
    handleHueInteraction(e.clientX);
  };

  const handleHueTouchStart = (e: TouchEvent) => {
    setIsDraggingHue(true);
    const touch = e.touches[0];
    handleHueInteraction(touch.clientX);
  };

  // ─── Global mouse/touch move & up listeners ───
  useEffect(() => {
    function handleMouseMove(e: globalThis.MouseEvent) {
      if (isDraggingArea) handleAreaInteraction(e.clientX, e.clientY);
      if (isDraggingHue) handleHueInteraction(e.clientX);
    }
    function handleTouchMove(e: globalThis.TouchEvent) {
      const touch = e.touches[0];
      if (isDraggingArea) handleAreaInteraction(touch.clientX, touch.clientY);
      if (isDraggingHue) handleHueInteraction(touch.clientX);
    }
    function handleEnd() {
      setIsDraggingArea(false);
      setIsDraggingHue(false);
    }

    if (isDraggingArea || isDraggingHue) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingArea, isDraggingHue, handleAreaInteraction, handleHueInteraction]);

  // ─── Copy Hex ───
  function handleCopy() {
    navigator.clipboard.writeText(hsvToHex(hsv)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const currentHex = hsvToHex(hsv);
  const pureHueHex = hsvToHex({ h: hsv.h, s: 1, v: 1 });

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
          {label}
        </label>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm space-y-3">
        {/* ─── Saturation / Brightness Area ─── */}
        <div
          ref={areaRef}
          className="relative w-full rounded-lg cursor-crosshair overflow-hidden select-none"
          style={{
            height: 160,
            backgroundColor: pureHueHex,
          }}
          onMouseDown={handleAreaMouseDown}
          onTouchStart={handleAreaTouchStart}
        >
          {/* White gradient (left to right = low to high saturation) */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, #FFFFFF, transparent)',
            }}
          />
          {/* Black gradient (top to bottom = high to low brightness) */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, transparent, #000000)',
            }}
          />
          {/* Cursor / Thumb */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${hsv.s * 100}%`,
              top: `${(1 - hsv.v) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="h-5 w-5 rounded-full border-[2.5px] border-white shadow-lg"
              style={{ backgroundColor: currentHex }}
            />
          </div>
        </div>

        {/* ─── Hue Slider ─── */}
        <div
          ref={hueRef}
          className="relative w-full h-4 rounded-full cursor-pointer select-none"
          style={{
            background: 'linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)',
          }}
          onMouseDown={handleHueMouseDown}
          onTouchStart={handleHueTouchStart}
        >
          {/* Hue Thumb */}
          <div
            className="absolute top-1/2 pointer-events-none"
            style={{
              left: `${(hsv.h / 360) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="h-5 w-5 rounded-full border-[2.5px] border-white shadow-lg"
              style={{ backgroundColor: pureHueHex }}
            />
          </div>
        </div>

        {/* ─── Hex Display + Copy ─── */}
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-lg border border-black/10 shadow-inner shrink-0"
            style={{ backgroundColor: currentHex }}
          />
          <div className="flex-1 flex items-center bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
            <span className="px-3 py-1.5 text-xs font-mono font-bold text-slate-700 flex-1">
              {currentHex}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors border-l border-slate-200"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
