'use client';

import { FabricImage, FabricObject, Line, Rect, Textbox } from 'fabric';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Circle,
  Copy,
  Edit3,
  FlipHorizontal2,
  Italic,
  Loader2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { PRESET_BG_COLORS, PRESET_COLORS, PRESET_FONTS } from './magic-layers.types';

interface MagicLayersFormattingBarProps {
  selectedObject: FabricObject | null;
  currentTextContent: string;
  onLiveTextChange: (val: string) => void;
  fontFamily: string;
  onApplyFontFamily: (font: string) => void;
  fontSize: number;
  onApplyFontSize: (size: number) => void;
  isBold: boolean;
  onToggleBold: () => void;
  isItalic: boolean;
  onToggleItalic: () => void;
  textAlign: 'left' | 'center' | 'right';
  onApplyTextAlign: (align: 'left' | 'center' | 'right') => void;
  fillColor: string;
  onApplyFillColor: (col: string) => void;
  bgColor: string;
  onApplyBgColor: (bg: string) => void;
  onMoveLayerToFront: () => void;
  onMoveLayerToBack: () => void;
  onDuplicateSelected: () => void;
  onDeleteSelectedObject: () => void;
  onApplyShapeFill: (color: string) => void;
  onApplyShapeStroke: (color: string) => void;
  onApplyShapeStrokeWidth: (width: number) => void;
  onApplyShapeRadius: (radius: number) => void;
  onApplyObjectOpacity: (opacity: number) => void;
  onToggleFlipHorizontal: () => void;
  onToggleImageCircleMask: () => void;
  isCuttingOut: boolean;
}

export function MagicLayersFormattingBar({
  selectedObject,
  currentTextContent,
  onLiveTextChange,
  fontFamily,
  onApplyFontFamily,
  fontSize,
  onApplyFontSize,
  isBold,
  onToggleBold,
  isItalic,
  onToggleItalic,
  textAlign,
  onApplyTextAlign,
  fillColor,
  onApplyFillColor,
  bgColor,
  onApplyBgColor,
  onMoveLayerToFront,
  onMoveLayerToBack,
  onDuplicateSelected,
  onDeleteSelectedObject,
  onApplyShapeFill,
  onApplyShapeStroke,
  onApplyShapeStrokeWidth,
  onApplyShapeRadius,
  onApplyObjectOpacity,
  onToggleFlipHorizontal,
  onToggleImageCircleMask,
  isCuttingOut,
}: MagicLayersFormattingBarProps) {
  const isTextEditable =
    Boolean(selectedObject) &&
    (selectedObject instanceof Textbox || Boolean((selectedObject as any)?.customData?.isComponentSlice));

  return (
    <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 gap-3 overflow-x-auto shadow-2xs">
      {isTextEditable ? (
        <div className="flex items-center gap-2.5 shrink-0 w-full animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 flex-1 max-w-sm">
            <Edit3 className="h-3.5 w-3.5 text-purple-600 shrink-0" strokeWidth={1.75} />
            <input
              type="text"
              value={currentTextContent}
              onChange={(e) => onLiveTextChange(e.target.value)}
              placeholder="Ubah isi kalimat di sini..."
              className="bg-transparent border-none text-xs text-slate-800 font-medium focus:outline-hidden w-full"
            />
          </div>

          <div className="h-5 w-px bg-slate-200" />

          <select
            value={fontFamily}
            onChange={(e) => onApplyFontFamily(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-medium outline-hidden hover:border-slate-300"
          >
            {PRESET_FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onApplyFontSize(Math.max(12, fontSize - 4))}
              className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 font-bold"
            >
              -
            </button>
            <span className="text-xs font-mono font-bold text-slate-800 px-2">{fontSize}</span>
            <button
              onClick={() => onApplyFontSize(fontSize + 4)}
              className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 font-bold"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={onToggleBold}
              className={`p-1.5 rounded transition-colors ${isBold ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
              title="Tebal (Bold)"
            >
              <Bold className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              onClick={onToggleItalic}
              className={`p-1.5 rounded transition-colors ${isItalic ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
              title="Miring (Italic)"
            >
              <Italic className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => onApplyTextAlign('left')}
              className={`p-1.5 rounded transition-colors ${textAlign === 'left' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
              title="Rata Kiri"
            >
              <AlignLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => onApplyTextAlign('center')}
              className={`p-1.5 rounded transition-colors ${textAlign === 'center' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
              title="Rata Tengah"
            >
              <AlignCenter className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => onApplyTextAlign('right')}
              className={`p-1.5 rounded transition-colors ${textAlign === 'right' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-white'}`}
              title="Rata Kanan"
            >
              <AlignRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200" title="Warna Teks">
            <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Teks:</span>
            {PRESET_COLORS.map((col) => (
              <button
                key={col}
                onClick={() => onApplyFillColor(col)}
                className={`h-4 w-4 rounded-full border border-slate-300 transition-transform hover:scale-125 ${
                  fillColor === col ? 'ring-2 ring-purple-600 scale-110' : ''
                }`}
                style={{ backgroundColor: col }}
                title={`Warna: ${col}`}
              />
            ))}
          </div>

          <select
            value={bgColor}
            onChange={(e) => onApplyBgColor(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-medium outline-hidden hover:border-slate-300"
            title="Latar Belakang Kotak / Kartu Teks"
          >
            {PRESET_BG_COLORS.map((bg) => (
              <option key={bg.value} value={bg.value}>
                {bg.label}
              </option>
            ))}
          </select>

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-1">
            <button
              onClick={onMoveLayerToFront}
              className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors"
              title="Bawa teks ke lapisan paling depan"
            >
              Paling Depan
            </button>
            <button
              onClick={onMoveLayerToBack}
              className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors"
              title="Kirim teks ke belakang subjek / orang"
            >
              Ke Belakang
            </button>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={onDuplicateSelected}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Gandakan Elemen Ini"
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              onClick={onDeleteSelectedObject}
              className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
              title="Hapus Elemen Ini"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      ) : selectedObject ? (
        <div className="flex items-center gap-2.5 shrink-0 w-full animate-in fade-in duration-150">
          <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">
            {(selectedObject as any).customData?.name || 'Objek Kanvas'}
          </span>

          <div className="h-5 w-px bg-slate-200" />

          {!(selectedObject instanceof FabricImage) ? (
            <>
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200" title="Warna Isi Bentuk">
                <span className="text-[10px] font-bold text-slate-500 uppercase mr-0.5">Isi:</span>
                {PRESET_COLORS.slice(0, 6).map((col) => (
                  <button
                    key={col}
                    onClick={() => onApplyShapeFill(col)}
                    className="h-4 w-4 rounded-full border border-slate-300 transition-transform hover:scale-125"
                    style={{ backgroundColor: col }}
                    title={`Isi: ${col}`}
                  />
                ))}
                <input
                  type="color"
                  value={typeof selectedObject.fill === 'string' && selectedObject.fill.startsWith('#') ? selectedObject.fill : '#7C3AED'}
                  onChange={(e) => onApplyShapeFill(e.target.value)}
                  className="h-4 w-5 p-0 border-0 bg-transparent cursor-pointer"
                  title="Pilih warna kustom"
                />
              </div>

              {!(selectedObject instanceof Line) && (
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Garis:</span>
                  <input
                    type="color"
                    value={typeof selectedObject.stroke === 'string' && selectedObject.stroke.startsWith('#') ? selectedObject.stroke : '#0F172A'}
                    onChange={(e) => onApplyShapeStroke(e.target.value)}
                    className="h-4 w-5 p-0 border-0 bg-transparent cursor-pointer"
                    title="Warna garis tepi"
                  />
                  <select
                    value={selectedObject.strokeWidth || 0}
                    onChange={(e) => onApplyShapeStrokeWidth(Number(e.target.value))}
                    className="bg-white border border-slate-200 text-slate-700 text-[11px] rounded px-1.5 py-0.5 font-semibold"
                    title="Ketebalan garis tepi"
                  >
                    <option value={0}>0px</option>
                    <option value={2}>2px</option>
                    <option value={4}>4px</option>
                    <option value={8}>8px</option>
                  </select>
                </div>
              )}

              {selectedObject instanceof Rect && (
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200" title="Kelengkungan Sudut">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Sudut:</span>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={Math.round(selectedObject.rx || 0)}
                    onChange={(e) => onApplyShapeRadius(Number(e.target.value))}
                    className="w-16 accent-purple-600 cursor-pointer"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <button
                onClick={onToggleFlipHorizontal}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
                title="Balik Horizontal"
              >
                <FlipHorizontal2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Balik</span>
              </button>
              <button
                onClick={onToggleImageCircleMask}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors ${
                  selectedObject.clipPath
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
                title="Potong Bingkai Lingkaran"
              >
                <Circle className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Bingkai Bulat</span>
              </button>
            </>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200" title="Transparansi">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Opasitas:</span>
            <input
              type="range"
              min={10}
              max={100}
              value={Math.round((selectedObject.opacity ?? 1) * 100)}
              onChange={(e) => onApplyObjectOpacity(Number(e.target.value) / 100)}
              className="w-16 accent-purple-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={onMoveLayerToFront}
              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700"
            >
              Ke Depan
            </button>
            <button
              onClick={onMoveLayerToBack}
              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700"
            >
              Ke Belakang
            </button>
            <button
              onClick={onDuplicateSelected}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Gandakan Elemen Ini"
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              onClick={onDeleteSelectedObject}
              className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
              title="Hapus Elemen Ini"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" strokeWidth={1.75} />
            <span>
              <strong>Mode Magic Layers:</strong> Semua elemen telah otomatis diurai menjadi komponen. Klik langsung pada teks atau objek di kanvas untuk menggeser, mengubah ukuran, atau mengedit kalimatnya.
            </span>
          </div>
          {isCuttingOut && (
            <div className="flex items-center gap-1.5 text-purple-700 font-semibold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 text-[11px]">
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.75} />
              <span>Mengekstrak subjek objek depan...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

