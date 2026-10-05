'use client';

import { useState, useMemo } from 'react';
import { Check, Sparkles, Eye, X, Paintbrush, Palette, RotateCcw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ColorPicker } from '@/components/ui/color-picker';

/* ═══════════════════════════════════════════════════════════ */

interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
}

const PARTY_PRESETS: ColorPalette[] = [
  { name: 'Golkar', primary: '#F5B800', secondary: '#001529' },
  { name: 'PDI Perjuangan', primary: '#D60000', secondary: '#1A1A1A' },
  { name: 'Gerindra', primary: '#C92A2A', secondary: '#1E293B' },
  { name: 'NasDem', primary: '#0A2558', secondary: '#F26522' },
  { name: 'PKB', primary: '#008242', secondary: '#0D1117' },
  { name: 'PKS', primary: '#FF6600', secondary: '#1A1A1A' },
  { name: 'Demokrat', primary: '#0047AB', secondary: '#0F172A' },
  { name: 'PAN', primary: '#003399', secondary: '#111827' },
];

const CURATED_PALETTES: ColorPalette[] = [
  { name: 'Biru Langit', primary: '#3B82F6', secondary: '#0F172A' },
  { name: 'Biru Laut', primary: '#0EA5E9', secondary: '#0C1222' },
  { name: 'Biru Safir', primary: '#4F46E5', secondary: '#1E1B4B' },
  { name: 'Hijau Zamrud', primary: '#10B981', secondary: '#0D1117' },
  { name: 'Hijau Pinus', primary: '#059669', secondary: '#0A1628' },
  { name: 'Merah Delima', primary: '#EF4444', secondary: '#1A1A2E' },
  { name: 'Oranye Senja', primary: '#F97316', secondary: '#1A1423' },
  { name: 'Ungu Anggur', primary: '#8B5CF6', secondary: '#0F0A1F' },
  { name: 'Magenta', primary: '#D946EF', secondary: '#1A0A2E' },
  { name: 'Rose Pink', primary: '#EC4899', secondary: '#1C0F1A' },
  { name: 'Emas Elegan', primary: '#D4A017', secondary: '#0A0A0A' },
  { name: 'Teal Pro', primary: '#14B8A6', secondary: '#0F1419' },
];

/* ═══════════════════════════════════════════════════════════
   MINI DASHBOARD PREVIEW
   ═══════════════════════════════════════════════════════════ */

function MiniDashboardPreview({ primary, secondary }: { primary: string; secondary: string }) {
  const isLight = useMemo(() => {
    const hex = secondary.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 140;
  }, [secondary]);

  const fg = isLight ? '#334155' : '#CBD5E1';
  const muted = isLight ? '#94A3B8' : '#64748B';

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-white" style={{ height: 180 }}>
      <div className="flex h-full">
        <div className="flex flex-col shrink-0" style={{ width: 120, backgroundColor: secondary }}>
          <div className="p-2.5">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="h-5 w-5 rounded-md flex items-center justify-center text-[8px] font-black" style={{ backgroundColor: primary, color: '#FFF' }}>P</div>
              <span className="text-[8px] font-black" style={{ color: fg }}>POLARIS</span>
            </div>
            <div className="space-y-0.5">
              {['Ringkasan', 'Studio AI', 'Aspirasi', 'Tema', 'Paket'].map((name, i) => (
                <div key={name} className="flex items-center px-2 py-1 rounded text-[7px] font-semibold"
                  style={{ backgroundColor: i === 0 ? `${primary}22` : 'transparent', color: i === 0 ? primary : muted }}>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-6 bg-white border-b border-slate-100 flex items-center justify-between px-2.5">
            <span className="text-[7px] font-bold text-slate-700">Dashboard</span>
            <span className="text-[6px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${primary}15`, color: primary }}>● Aktif</span>
          </div>
          <div className="flex-1 bg-slate-50 p-2">
            <div className="space-y-1.5">
              <div className="h-4 rounded bg-white border border-slate-100" />
              <div className="grid grid-cols-3 gap-1">
                <div className="h-7 rounded bg-white border border-slate-100" />
                <div className="h-7 rounded bg-white border border-slate-100" />
                <div className="h-7 rounded bg-white border border-slate-100" />
              </div>
              <div className="h-10 rounded bg-white border border-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PREVIEW MODAL
   ═══════════════════════════════════════════════════════════ */

function ThemePreviewModal({
  isOpen, onClose, onApply, primary, secondary, applying,
}: {
  isOpen: boolean; onClose: () => void; onApply: () => void;
  primary: string; secondary: string; applying: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Eye className="h-4 w-4" style={{ color: primary }} />
              Pratinjau Tema Baru
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Pastikan tampilannya sesuai keinginan Anda sebelum diterapkan.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl shadow-inner border border-black/10" style={{ backgroundColor: primary }} />
              <div><span className="text-[10px] font-bold text-slate-400 uppercase block">Aksen</span><span className="text-xs font-bold text-slate-700">Tombol & Highlight</span></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl shadow-inner border border-black/10" style={{ backgroundColor: secondary }} />
              <div><span className="text-[10px] font-bold text-slate-400 uppercase block">Sidebar</span><span className="text-xs font-bold text-slate-700">Panel Navigasi</span></div>
            </div>
          </div>

          <MiniDashboardPreview primary={primary} secondary={secondary} />

          <div className="flex items-center gap-3 flex-wrap">
            <button className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm" style={{ backgroundColor: primary }}>✨ Tombol Utama</button>
            <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold" style={{ backgroundColor: `${primary}15`, color: primary }}>● Status Aktif</div>
            <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold border" style={{ borderColor: `${primary}30`, color: primary }}>Badge</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          <button
            onClick={onApply} disabled={applying}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: primary }}
          >
            {applying ? (<><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menerapkan...</>)
              : (<><Sparkles className="h-4 w-4" />Terapkan Tema Ini</>)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function DashboardThemeCustomizer() {
  const { colors, setColors } = useTheme();
  const [stagePrimary, setStagePrimary] = useState(colors.primary);
  const [stageSecondary, setStageSecondary] = useState(colors.secondary);
  const [showPreview, setShowPreview] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const hasChanges = stagePrimary.toLowerCase() !== colors.primary.toLowerCase() || stageSecondary.toLowerCase() !== colors.secondary.toLowerCase();

  function applyPreset(p: ColorPalette) {
    setStagePrimary(p.primary);
    setStageSecondary(p.secondary);
    setShowCustomPicker(false);
  }

  async function handleApply() {
    setApplying(true);
    await new Promise((r) => setTimeout(r, 500));
    setColors({ primary: stagePrimary, secondary: stageSecondary });
    try {
      const { ApiClient } = await import('@/lib/api-client');
      await ApiClient.request<any>('/cms/theme', {
        method: 'PUT',
        body: JSON.stringify({ primaryHexColor: stagePrimary, secondaryHexColor: stageSecondary, fontFamily: 'Inter, sans-serif' }),
      });
    } catch {}
    setApplying(false);
    setShowPreview(false);
  }

  function isActive(p: ColorPalette) {
    return p.primary.toLowerCase() === stagePrimary.toLowerCase() && p.secondary.toLowerCase() === stageSecondary.toLowerCase();
  }

  return (
    <>
      <div className="space-y-8">

        {/* ═══════ SECTION 1: LIVE PREVIEW + CURRENT STATUS ═══════ */}
        <div className="grid gap-5 lg:grid-cols-2 items-start">
          {/* Left: current theme info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Palette className="h-4 w-4" style={{ color: stagePrimary }} />
                Warna Tema Dashboard Anda
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih dari palet di bawah, atau buat kombinasi warna sendiri.
              </p>
            </div>

            {/* Current color badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="h-7 w-7 rounded-lg shadow-inner border border-black/10" style={{ backgroundColor: stagePrimary }} />
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Aksen</span>
                  <span className="text-[11px] font-bold text-slate-700">Tombol & highlight</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="h-7 w-7 rounded-lg shadow-inner border border-black/10" style={{ backgroundColor: stageSecondary }} />
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Sidebar</span>
                  <span className="text-[11px] font-bold text-slate-700">Panel navigasi</span>
                </div>
              </div>
            </div>

            {/* Action row */}
            <div className="flex items-center gap-2 pt-1">
              {hasChanges && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-90 transition-all"
                    style={{ backgroundColor: stagePrimary }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Pratinjau & Terapkan
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStagePrimary(colors.primary); setStageSecondary(colors.secondary); }}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right: Mini preview */}
          <MiniDashboardPreview primary={stagePrimary} secondary={stageSecondary} />
        </div>

        {/* ═══════ SECTION 2: CURATED PALETTES ═══════ */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Paintbrush className="h-3.5 w-3.5" />
              Palet Warna Siap Pakai
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Pilih tema instan — klik langsung terapkan ke preview.</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {CURATED_PALETTES.map((p) => {
              const active = isActive(p);
              return (
                <button key={p.name} type="button" onClick={() => applyPreset(p)}
                  className={`group relative flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl border text-center transition-all hover:shadow-md hover:scale-[1.03] ${
                    active ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-0.5">
                    <div className="h-6 w-6 rounded-l-lg shadow-sm border border-black/10" style={{ backgroundColor: p.primary }} />
                    <div className="h-6 w-6 rounded-r-lg shadow-sm border border-black/10" style={{ backgroundColor: p.secondary }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 truncate w-full">{p.name}</span>
                  {active && <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-slate-900 flex items-center justify-center"><Check className="h-2.5 w-2.5 text-white" /></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════ SECTION 3: PARTY PRESETS ═══════ */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">🏛️ Preset Partai Politik</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PARTY_PRESETS.map((p) => {
              const active = isActive(p);
              return (
                <button key={p.name} type="button" onClick={() => applyPreset(p)}
                  className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all hover:shadow-md hover:scale-[1.02] ${
                    active ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-0.5 shrink-0">
                    <div className="h-6 w-6 rounded-l-lg shadow-sm border border-black/10" style={{ backgroundColor: p.primary }} />
                    <div className="h-6 w-4 rounded-r-md shadow-sm border border-black/10" style={{ backgroundColor: p.secondary }} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 truncate">{p.name}</span>
                  {active && <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-slate-900 flex items-center justify-center"><Check className="h-2.5 w-2.5 text-white" /></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════ SECTION 4: CUSTOM COLOR PICKER (Expandable) ═══════ */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 border-dashed transition-all ${
              showCustomPicker
                ? 'border-slate-400 bg-slate-50'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-400 via-violet-500 to-cyan-400 flex items-center justify-center shadow-sm">
                <Palette className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-extrabold text-slate-900">Pilih Warna Sendiri</span>
                <span className="block text-[11px] text-slate-500">Buka color picker untuk memilih warna aksen & sidebar sesuka hati Anda</span>
              </div>
            </div>
            <div className={`h-5 w-5 rounded-full border-2 border-slate-300 flex items-center justify-center transition-transform ${showCustomPicker ? 'rotate-45' : ''}`}>
              <span className="text-slate-400 text-xs font-bold">{showCustomPicker ? '×' : '+'}</span>
            </div>
          </button>

          {/* Expandable color picker panel */}
          {showCustomPicker && (
            <div className="grid gap-5 sm:grid-cols-2 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-in slide-in-from-top-2 duration-200">
              <ColorPicker
                label="🎨 Warna Aksen Utama"
                value={stagePrimary}
                onChange={setStagePrimary}
              />
              <ColorPicker
                label="🌙 Warna Sidebar / Panel"
                value={stageSecondary}
                onChange={setStageSecondary}
              />
            </div>
          )}
        </div>

        {/* ═══════ BOTTOM ACTION (sticky feel) ═══════ */}
        {hasChanges && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 shadow-lg animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-1">
                <div className="h-5 w-5 rounded-md border border-white/20" style={{ backgroundColor: stagePrimary }} />
                <div className="h-5 w-5 rounded-md border border-white/20" style={{ backgroundColor: stageSecondary }} />
              </div>
              <span className="text-xs font-bold text-white/80">Tema baru siap diterapkan</span>
            </div>
            <button
              type="button"
              onClick={() => { setStagePrimary(colors.primary); setStageSecondary(colors.secondary); setShowCustomPicker(false); }}
              className="px-3 py-2 rounded-lg text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-90 transition-all flex items-center gap-2"
              style={{ backgroundColor: stagePrimary }}
            >
              <Eye className="h-3.5 w-3.5" />
              Pratinjau & Terapkan
            </button>
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      <ThemePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onApply={handleApply}
        primary={stagePrimary}
        secondary={stageSecondary}
        applying={applying}
      />
    </>
  );
}
