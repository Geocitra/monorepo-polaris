'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { ApiClient } from '@/lib/api-client';

/* ─────────────────────────── Types ─────────────────────────── */

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  secondary: string;
}

interface ThemeContextValue {
  colors: ThemeColors;
  setColors: (c: ThemeColors) => void;
  refreshTheme: () => Promise<void>;
  isLoaded: boolean;
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (m: ThemeMode) => void;
}

/* ─────────── Premium Default Palette (Dark Navy) ─────────── */

const DEFAULT_COLORS: ThemeColors = {
  primary: '#3B82F6',   // Vibrant blue
  secondary: '#0F172A', // Deep slate/navy
};

const LS_KEY = 'polaris_theme_colors';
const LS_MODE_KEY = 'polaris_theme_mode';

/* ────────── Color Utility: hex → HSL components ─────────── */

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  }
  r /= 255; g /= 255; b /= 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/** Generate a lighter tint of a hex color for hover/50 shades */
function hexLighten(hex: string, amount: number): string {
  const { h, s, l } = hexToHSL(hex);
  const newL = Math.min(97, l + amount);
  return `hsl(${h}, ${s}%, ${newL}%)`;
}

/** Generate a slightly darker shade */
function hexDarken(hex: string, amount: number): string {
  const { h, s, l } = hexToHSL(hex);
  const newL = Math.max(5, l - amount);
  return `hsl(${h}, ${s}%, ${newL}%)`;
}

/** Check if a color is "light" (for contrast decisions) */
function isLight(hex: string): boolean {
  const { l } = hexToHSL(hex);
  return l > 55;
}

/* ───────────── Inject CSS Custom Properties ────────────── */

function injectCSSVariables(colors: ThemeColors) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const { h: ph, s: ps, l: pl } = hexToHSL(colors.primary);
  const { h: sh, s: ss, l: sl } = hexToHSL(colors.secondary);

  // Primary palette
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-h', String(ph));
  root.style.setProperty('--color-primary-s', `${ps}%`);
  root.style.setProperty('--color-primary-l', `${pl}%`);
  root.style.setProperty('--color-primary-50', hexLighten(colors.primary, 42));
  root.style.setProperty('--color-primary-100', hexLighten(colors.primary, 35));
  root.style.setProperty('--color-primary-200', hexLighten(colors.primary, 25));
  root.style.setProperty('--color-primary-hover', hexDarken(colors.primary, 8));
  root.style.setProperty('--color-primary-foreground', isLight(colors.primary) ? '#0F172A' : '#FFFFFF');

  // Secondary palette
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-secondary-h', String(sh));
  root.style.setProperty('--color-secondary-s', `${ss}%`);
  root.style.setProperty('--color-secondary-l', `${sl}%`);
  root.style.setProperty('--color-secondary-50', hexLighten(colors.secondary, 45));
  root.style.setProperty('--color-secondary-foreground', isLight(colors.secondary) ? '#0F172A' : '#FFFFFF');

  // Derived semantic tokens
  root.style.setProperty('--sidebar-bg', colors.secondary);
  root.style.setProperty('--sidebar-fg', isLight(colors.secondary) ? '#334155' : '#E2E8F0');
  root.style.setProperty('--sidebar-fg-muted', isLight(colors.secondary) ? '#64748B' : '#94A3B8');
  root.style.setProperty('--sidebar-active-bg', isLight(colors.secondary)
    ? hexLighten(colors.primary, 38)
    : `hsla(${ph}, ${ps}%, ${pl}%, 0.15)`
  );
  root.style.setProperty('--sidebar-active-fg', isLight(colors.secondary)
    ? colors.primary
    : hexLighten(colors.primary, 20)
  );
  root.style.setProperty('--sidebar-hover-bg', isLight(colors.secondary)
    ? '#F1F5F9'
    : 'rgba(255,255,255,0.06)'
  );
  root.style.setProperty('--sidebar-border', isLight(colors.secondary)
    ? '#E2E8F0'
    : 'rgba(255,255,255,0.08)'
  );
  root.style.setProperty('--sidebar-logo-bg', colors.primary);
  root.style.setProperty('--sidebar-logo-fg', isLight(colors.primary) ? '#0F172A' : '#FFFFFF');
  root.style.setProperty('--sidebar-brand-accent', colors.primary);
}

/* ─────────────────── Context ──────────────────────────── */

const ThemeContext = createContext<ThemeContextValue>({
  colors: DEFAULT_COLORS,
  setColors: () => {},
  refreshTheme: async () => {},
  isLoaded: false,
  mode: 'system',
  resolvedMode: 'light',
  setMode: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/* ─────────────────── Provider ──────────────────────────── */

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColorsState] = useState<ThemeColors>(DEFAULT_COLORS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');

  // Load theme mode from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(LS_MODE_KEY) as ThemeMode | null;
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setModeState(savedMode);
      }
    } catch {}
  }, []);

  // Sync resolvedMode with mode and system preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function computeResolved(m: ThemeMode): 'light' | 'dark' {
      if (m === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return m;
    }

    const currentResolved = computeResolved(mode);
    setResolvedMode(currentResolved);

    const root = document.documentElement;
    if (currentResolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        const nextResolved = e.matches ? 'dark' : 'light';
        setResolvedMode(nextResolved);
        if (nextResolved === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [mode]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(LS_MODE_KEY, newMode);
    } catch {}
  }, []);

  // Load from localStorage first (instant), then hydrate from API
  useEffect(() => {
    // 1. Instant restore from cache
    try {
      const cached = localStorage.getItem(LS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as ThemeColors;
        if (parsed.primary && parsed.secondary) {
          setColorsState(parsed);
          injectCSSVariables(parsed);
        }
      }
    } catch {}

    // 2. Async fetch from API (fresh data)
    fetchThemeFromAPI().finally(() => setIsLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchThemeFromAPI = useCallback(async () => {
    if (!ApiClient.isAuthenticated()) {
      injectCSSVariables(DEFAULT_COLORS);
      return;
    }

    try {
      const portalData = await ApiClient.request<any>('/cms/my-portal').catch(() => null);
      if (portalData?.theme) {
        const fresh: ThemeColors = {
          primary: portalData.theme.primaryHexColor || DEFAULT_COLORS.primary,
          secondary: portalData.theme.secondaryHexColor || DEFAULT_COLORS.secondary,
        };
        setColorsState(fresh);
        injectCSSVariables(fresh);
        localStorage.setItem(LS_KEY, JSON.stringify(fresh));
      } else {
        // No portal data — apply defaults
        injectCSSVariables(DEFAULT_COLORS);
      }
    } catch {
      // Offline or not logged in — apply whatever is in state
      injectCSSVariables(colors);
    }
  }, [colors]);

  const setColors = useCallback((c: ThemeColors) => {
    setColorsState(c);
    injectCSSVariables(c);
    localStorage.setItem(LS_KEY, JSON.stringify(c));
  }, []);

  const refreshTheme = useCallback(async () => {
    await fetchThemeFromAPI();
  }, [fetchThemeFromAPI]);

  // Ensure variables are injected on first render even before API responds
  useEffect(() => {
    injectCSSVariables(colors);
  }, [colors]);

  return (
    <ThemeContext.Provider value={{ colors, setColors, refreshTheme, isLoaded, mode, resolvedMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
