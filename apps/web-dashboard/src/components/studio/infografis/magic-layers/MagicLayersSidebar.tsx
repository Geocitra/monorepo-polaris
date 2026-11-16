'use client';

import type React from 'react';
import { FabricImage, FabricObject, Textbox } from 'fabric';
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Loader2,
  Lock,
  Sparkles,
  Square,
  Type,
  Unlock,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LayerItem } from './magic-layers.types';

interface MagicLayersSidebarProps {
  activeTab: 'layers' | 'text' | 'elements' | 'magic';
  onChangeTab: (tab: 'layers' | 'text' | 'elements' | 'magic') => void;
  layers: LayerItem[];
  selectedLayerId: string | null;
  onSelectLayer: (layer: LayerItem) => void;
  onMoveLayerUp: (layer: LayerItem, e: React.MouseEvent) => void;
  onMoveLayerDown: (layer: LayerItem, e: React.MouseEvent) => void;
  onToggleLayerLock: (layer: LayerItem, e: React.MouseEvent) => void;
  onToggleLayerVisibility: (layer: LayerItem, e: React.MouseEvent) => void;
  selectedObject: FabricObject | null;
  currentTextContent: string;
  onLiveTextChange: (val: string) => void;
  onAddTextHeading: () => void;
  onAddTextBody: () => void;
  onAddDimensiCard: () => void;
  onAddBadgeShape: () => void;
  onMagicCutout: () => void;
  isCuttingOut: boolean;
  cutoutSuccess: boolean;
  onGrabText: () => void;
  hasGrabbedText: boolean;
}

export function MagicLayersSidebar({
  activeTab,
  onChangeTab,
  layers,
  selectedLayerId,
  onSelectLayer,
  onMoveLayerUp,
  onMoveLayerDown,
  onToggleLayerLock,
  onToggleLayerVisibility,
  selectedObject,
  currentTextContent,
  onLiveTextChange,
  onAddTextHeading,
  onAddTextBody,
  onAddDimensiCard,
  onAddBadgeShape,
  onMagicCutout,
  isCuttingOut,
  cutoutSuccess,
  onGrabText,
  hasGrabbedText,
}: MagicLayersSidebarProps) {
  const isTextEditable =
    Boolean(selectedObject) &&
    (selectedObject instanceof Textbox || Boolean((selectedObject as any)?.customData?.isComponentSlice));

  return (
    <>
      {/* SISI KIRI: TAB ICON NAVIGATOR */}
      <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-3 gap-2 shrink-0 z-10 shadow-2xs">
        <button
          onClick={() => onChangeTab('layers')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeTab === 'layers'
              ? 'bg-purple-50 text-purple-700 font-bold'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
          title="Susunan Lapisan (Z-Index)"
        >
          <Layers className="h-5 w-5" strokeWidth={1.75} />
          <span className="text-[9.5px] mt-0.5">Lapisan</span>
        </button>

        <button
          onClick={() => onChangeTab('text')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeTab === 'text'
              ? 'bg-purple-50 text-purple-700 font-bold'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
          title="Tambah Elemen Teks"
        >
          <Type className="h-5 w-5" strokeWidth={1.75} />
          <span className="text-[9.5px] mt-0.5">Teks</span>
        </button>

        <button
          onClick={() => onChangeTab('elements')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeTab === 'elements'
              ? 'bg-purple-50 text-purple-700 font-bold'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
          title="Tambah Bentuk & Kartu Tonggak"
        >
          <Square className="h-5 w-5" strokeWidth={1.75} />
          <span className="text-[9.5px] mt-0.5">Elemen</span>
        </button>

        <button
          onClick={() => onChangeTab('magic')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${
            activeTab === 'magic'
              ? 'bg-purple-50 text-purple-700 font-bold'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
          title="Fitur AI Magic Layers"
        >
          <Wand2 className="h-5 w-5" strokeWidth={1.75} />
          <span className="text-[9.5px] mt-0.5">Magic AI</span>
        </button>
      </aside>

      {/* DRAWER KONTEN SIDEBAR */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
        {activeTab === 'layers' && (
          <div className="flex flex-col h-full">
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-purple-600" strokeWidth={1.75} />
                <span>Susunan Lapisan ({layers.length})</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Atas ke Bawah</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              {layers.map((layer, index) => {
                const isSelected = selectedLayerId === layer.id;
                const isBg = (layer.object as any).customData?.isBackground;
                const isCutout = (layer.object as any).customData?.isCutout;

                return (
                  <div
                    key={layer.id}
                    onClick={() => onSelectLayer(layer)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-300 text-purple-950 font-bold shadow-2xs'
                        : isCutout
                        ? 'bg-purple-50/40 border-purple-200 text-purple-800 font-semibold'
                        : isBg
                        ? 'bg-slate-50 border-slate-200 text-slate-500'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      {isCutout ? (
                        <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0" strokeWidth={1.75} />
                      ) : layer.object instanceof Textbox ? (
                        <Type className="h-3.5 w-3.5 text-blue-600 shrink-0" strokeWidth={1.75} />
                      ) : layer.object instanceof FabricImage ? (
                        <ImageIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" strokeWidth={1.75} />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
                      )}
                      <span className="truncate text-xs">{layer.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => onMoveLayerUp(layer, e)}
                        disabled={index === 0 || isBg}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20"
                        title="Naikkan Layer (Ke Depan)"
                      >
                        <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>

                      <button
                        onClick={(e) => onMoveLayerDown(layer, e)}
                        disabled={index === layers.length - 1 || isBg}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20"
                        title="Turunkan Layer (Ke Belakang)"
                      >
                        <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>

                      <button
                        onClick={(e) => onToggleLayerLock(layer, e)}
                        className={`p-1 rounded hover:bg-slate-100 ${layer.locked ? 'text-amber-600' : 'text-slate-400'}`}
                        title={layer.locked ? 'Kunci Dibuka' : 'Kunci Posisi'}
                      >
                        {layer.locked ? <Lock className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Unlock className="h-3.5 w-3.5" strokeWidth={1.75} />}
                      </button>

                      <button
                        onClick={(e) => onToggleLayerVisibility(layer, e)}
                        className={`p-1 rounded hover:bg-slate-100 ${layer.visible ? 'text-slate-500' : 'text-slate-300'}`}
                        title={layer.visible ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {layer.visible ? <Eye className="h-3.5 w-3.5" strokeWidth={1.75} /> : <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {isTextEditable && (
              <div className="p-3 bg-purple-50/70 border-t border-purple-200 mt-auto shrink-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-950 flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5 text-purple-600" strokeWidth={1.75} />
                    <span>Ubah Isi Kalimat Kartu</span>
                  </span>
                  <span className="text-[10px] text-purple-700 font-semibold bg-purple-100/80 px-1.5 py-0.5 rounded">
                    Live Sync
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={currentTextContent}
                  onChange={(e) => onLiveTextChange(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-purple-200 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-purple-500 font-medium leading-relaxed resize-none"
                  placeholder="Ketik kalimat atau ubah isi teks kartu di sini..."
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  💡 Anda juga dapat mengklik ganda (double-click) langsung pada kartu di kanvas untuk mengeditnya di tempat.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'text' && (
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Tambahkan Teks</h3>
              <p className="text-[11px] text-slate-400">Klik untuk menyisipkan teks yang dapat digeser bebas</p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={onAddTextHeading}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
              >
                <span className="block font-black text-base text-slate-900 group-hover:text-purple-700">
                  + Tambah Judul Utama
                </span>
                <span className="text-[11px] text-slate-400">Teks judul tegas bergaya poster</span>
              </button>

              <button
                onClick={onAddTextBody}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
              >
                <span className="block font-bold text-sm text-slate-800 group-hover:text-purple-700">
                  + Tambah Poin Narasi
                </span>
                <span className="text-[11px] text-slate-400">Kalimat isi atau paragraf kebijakan</span>
              </button>

              <button
                onClick={onAddDimensiCard}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
              >
                <span className="block font-bold text-sm text-slate-800 group-hover:text-purple-700">
                  + Kartu Tonggak / Dimensi
                </span>
                <span className="text-[11px] text-slate-400">Kotak kartu berlatar putih bersih</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'elements' && (
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Elemen Visual</h3>
              <p className="text-[11px] text-slate-400">Sisipkan lencana dan kartu penegas</p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={onAddBadgeShape}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
              >
                <span className="block font-bold text-xs uppercase text-white bg-orange-600 px-2 py-0.5 rounded inline-block mb-1">
                  TONGGAK 01
                </span>
                <span className="block text-xs font-semibold text-slate-700">Badge oranye penanda poin</span>
              </button>

              <button
                onClick={onAddDimensiCard}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer group"
              >
                <span className="block font-bold text-xs text-slate-800">Kartu Putih Elegan</span>
                <span className="text-[11px] text-slate-400">Untuk menaruh kutipan atau rangkuman data</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'magic' && (
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-600" strokeWidth={1.75} />
                <span>Fitur Cerdas AI</span>
              </h3>
              <p className="text-[11px] text-slate-400">Otomasi pemisahan layer visual seperti di Canva Pro</p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-purple-600" strokeWidth={1.75} />
                  <span className="text-xs font-bold text-purple-900">Pisahkan Objek Depan (Cutout)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Mengekstrak figur orang atau subjek utama menjadi layer terpisah di depan menggunakan AI.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onMagicCutout}
                  disabled={isCuttingOut}
                  className="w-full border-purple-300 bg-white hover:bg-purple-50 text-purple-700 font-bold text-xs"
                >
                  {isCuttingOut ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" strokeWidth={1.75} />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5 mr-1.5 text-purple-600" strokeWidth={1.75} />
                  )}
                  {isCuttingOut ? 'Mengekstrak Subjek AI...' : cutoutSuccess ? 'Objek Terpisah' : 'Pisahkan Objek Depan'}
                </Button>
              </div>

              <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-purple-600" strokeWidth={1.75} />
                  <span className="text-xs font-bold text-purple-900">Urai Teks (Magic Grab Text)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Mengubah judul dan kartu pembahasan pada poster menjadi teks interaktif yang dapat digeser dan diubah kata-katanya.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onGrabText}
                  className="w-full border-purple-300 bg-white hover:bg-purple-50 text-purple-700 font-bold text-xs"
                >
                  <Type className="h-3.5 w-3.5 mr-1.5 text-purple-600" strokeWidth={1.75} />
                  {hasGrabbedText ? 'Teks Terurai' : 'Jalankan Grab Text'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

