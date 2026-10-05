'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Map, Plus, X, ListFilter, ShieldCheck } from 'lucide-react';
import { PROVINSI_LIST, PROVINCE_PRESETS } from './profile-constants';

interface ElectoralDistrictFormProps {
  provinceName: string;
  setProvinceName: (val: string) => void;
  dapilName: string;
  onDapilNameChange: (val: string) => void;
  dapilCode: string;
  setDapilCode: (val: string) => void;
  regencyCoverage: string[];
  newRegencyInput: string;
  setNewRegencyInput: (val: string) => void;
  onAddRegency: (e?: React.FormEvent) => void;
  onRemoveRegency: (area: string) => void;
  onQuickAddRegency: (area: string) => void;
}

export function ElectoralDistrictForm({
  provinceName,
  setProvinceName,
  dapilName,
  onDapilNameChange,
  dapilCode,
  setDapilCode,
  regencyCoverage,
  newRegencyInput,
  setNewRegencyInput,
  onAddRegency,
  onRemoveRegency,
  onQuickAddRegency,
}: ElectoralDistrictFormProps) {
  const currentProvincePresets = PROVINCE_PRESETS[provinceName] || {
    dapils: [`Dapil 1 ${provinceName}`, `Dapil 2 ${provinceName}`],
    sampleRegencies: [],
  };

  const [isManualInput, setIsManualInput] = useState(false);

  function handleSelectDapilPreset(val: string) {
    if (val === '__MANUAL__') {
      setIsManualInput(true);
      return;
    }
    setIsManualInput(false);
    onDapilNameChange(val);
  }

  return (
    <Card className="p-3.5 sm:p-4 space-y-3 shadow-2xs border-slate-200 bg-white rounded-xl">
      {/* Header Form Wilayah */}
      <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span>Wilayah Kerja Representasi & Fokus Konstituen</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Menentukan cakupan penyerapan aspirasi, intelijen berita daerah, dan rujukan naskah kebijakan AI.
          </p>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          <span>Isolasi Wilayah Personal</span>
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        {/* Provinsi */}
        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
            Provinsi
          </label>
          <select
            value={provinceName}
            onChange={(e) => {
              const newProv = e.target.value;
              setProvinceName(newProv);
              const presets = PROVINCE_PRESETS[newProv];
              if (presets && presets.dapils.length > 0) {
                onDapilNameChange(presets.dapils[0]);
                setIsManualInput(false);
              }
            }}
            className="block w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
          >
            {PROVINSI_LIST.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>

        {/* Pilihan Dapil / Nama Wilayah Kerja */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label className="block text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
              <ListFilter className="h-3 w-3 text-blue-600" />
              <span>Nama Dapil / Wilayah Tugas</span>
            </label>
            <button
              type="button"
              onClick={() => setIsManualInput(!isManualInput)}
              className="text-[9px] text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              {isManualInput ? 'Pilih Preset' : 'Ketik Manual'}
            </button>
          </div>

          {!isManualInput ? (
            <select
              value={dapilName}
              onChange={(e) => handleSelectDapilPreset(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none bg-white"
            >
              {dapilName && !currentProvincePresets.dapils.includes(dapilName) && (
                <option value={dapilName}>{dapilName} (Kustom Personal)</option>
              )}
              {currentProvincePresets.dapils.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
              <option value="__MANUAL__">✏️ Ketik Manual...</option>
            </select>
          ) : (
            <input
              type="text"
              required
              value={dapilName}
              onChange={(e) => onDapilNameChange(e.target.value)}
              placeholder="Contoh: Jawa Barat I atau Wilayah Kerja I"
              className="block w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          )}
        </div>

        {/* Kode Dapil Referensi */}
        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
            Kode Wilayah / Dapil
          </label>
          <input
            type="text"
            required
            value={dapilCode}
            onChange={(e) => setDapilCode(e.target.value.toUpperCase())}
            placeholder="DAPIL-JABAR-1"
            className="block w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono font-bold text-blue-700 bg-slate-50 focus:border-blue-600 focus:outline-none uppercase"
          />
        </div>
      </div>

      {/* Cakupan Wilayah Personal / Kabupaten Binaan */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
            <Map className="h-3 w-3 text-blue-600" />
            <span>Kabupaten / Kota Fokus Advokasi</span>
          </label>
          <span className="text-[10px] text-slate-400 font-semibold">
            {regencyCoverage.length} Wilayah Terdaftar
          </span>
        </div>

        {/* List Tag Wilayah */}
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 min-h-[38px] flex flex-wrap items-center gap-1">
          {regencyCoverage.map((area) => (
            <span
              key={area}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-[11px] font-medium shadow-2xs"
            >
              <MapPin className="h-2.5 w-2.5 text-blue-600" />
              <span>{area}</span>
              <button
                type="button"
                onClick={() => onRemoveRegency(area)}
                className="hover:text-red-600 rounded-full p-0.5 text-slate-400 ml-0.5 transition-colors cursor-pointer"
                title={`Hapus ${area}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}

          {regencyCoverage.length === 0 && (
            <span className="text-xs text-slate-400 italic">Belum ada wilayah terdaftar.</span>
          )}
        </div>

        {/* Input Tambah Wilayah */}
        <div className="flex gap-1.5">
          <input
            type="text"
            value={newRegencyInput}
            onChange={(e) => setNewRegencyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddRegency();
              }
            }}
            placeholder="Ketik nama Kabupaten / Kota / Kecamatan..."
            className="block flex-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => onAddRegency()}
            variant="outline"
            className="border-slate-300 font-bold gap-1 shrink-0 text-xs px-2.5 h-7 cursor-pointer"
          >
            <Plus className="h-3 w-3 text-blue-600" />
            <span>Tambah</span>
          </Button>
        </div>

        {/* Rekomendasi Cepat */}
        {currentProvincePresets.sampleRegencies.length > 0 && (
          <div className="pt-0.5 flex flex-wrap items-center gap-1">
            <span className="text-[9px] text-slate-400 font-bold uppercase mr-1">Saran di {provinceName}:</span>
            {currentProvincePresets.sampleRegencies.slice(0, 7).map((reg) => {
              const isAdded = regencyCoverage.includes(reg);
              return (
                <button
                  key={reg}
                  type="button"
                  onClick={() => onQuickAddRegency(reg)}
                  disabled={isAdded}
                  className={`text-[10px] px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                    isAdded
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600 shadow-2xs'
                  }`}
                >
                  + {reg}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
