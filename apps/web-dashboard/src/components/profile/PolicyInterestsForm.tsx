'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, Plus, X, BrainCircuit, Lightbulb } from 'lucide-react';
import { POLICY_INTEREST_SUGGESTIONS } from './profile-constants';

interface PolicyInterestsFormProps {
  issueInterests: string[];
  onToggleInterest: (tag: string) => void;
  onAddCustomInterest: (tag: string) => void;
  onRemoveInterest: (tag: string) => void;
}

export function PolicyInterestsForm({
  issueInterests,
  onToggleInterest,
  onAddCustomInterest,
  onRemoveInterest,
}: PolicyInterestsFormProps) {
  const [customInput, setCustomInput] = useState('');

  function handleAddCustom(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const clean = customInput.trim();
    if (!clean) return;
    onAddCustomInterest(clean);
    setCustomInput('');
  }

  return (
    <Card className="p-3.5 sm:p-4 space-y-3 shadow-2xs border-slate-200 bg-white rounded-xl">
      {/* HEADER */}
      <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <BrainCircuit className="h-4 w-4 text-blue-600" />
            <span>Minat Isu & Fokus Kebijakan (AI Intelligence Grounding)</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Memandu agen AI POLARIS mencari data perda, aspirasi konstituen, dan isu lokal.
          </p>
        </div>

        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/60">
          {issueInterests.length} Dipilih
        </span>
      </div>

      {/* ISU AKTIF CHIPS */}
      {issueInterests.length > 0 && (
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">
            Isu Aktif yang Dipantau AI:
          </span>
          <div className="flex flex-wrap gap-1 p-1.5 bg-slate-50 rounded-lg border border-slate-200/80">
            {issueInterests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-semibold shadow-2xs"
              >
                <Check className="h-2.5 w-2.5" />
                <span>{interest}</span>
                <button
                  type="button"
                  onClick={() => onRemoveInterest(interest)}
                  className="hover:bg-blue-700 rounded-full p-0.5 ml-0.5 transition-colors cursor-pointer"
                  title={`Hapus ${interest}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* GRID REKOMENDASI ISU */}
      <div className="space-y-1.5">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">
          Pilih Topik Prioritas Dewan:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {POLICY_INTEREST_SUGGESTIONS.map((item) => {
            const isSelected = issueInterests.includes(item.label);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleInterest(item.label)}
                className={`text-left p-2 rounded-lg border transition-all flex items-start gap-2 cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`h-3.5 w-3.5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 bg-white text-transparent'
                  }`}
                >
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold truncate leading-tight">{item.label}</div>
                  <div className="text-[9px] text-slate-400 truncate">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* INPUT TAMBAHAN ISU KUSTOM */}
      <div className="pt-1.5 border-t border-slate-100 flex gap-1.5">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustom();
            }
          }}
          placeholder="Ketik topik isu kustom dewan lainnya (misal: Tol Laut, Pupuk Subsidi)..."
          className="block flex-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
        />
        <Button
          type="button"
          size="sm"
          onClick={() => handleAddCustom()}
          variant="outline"
          className="border-slate-300 font-bold gap-1 shrink-0 text-xs px-2.5 h-7 cursor-pointer"
        >
          <Plus className="h-3 w-3 text-blue-600" />
          <span>Tambah</span>
        </Button>
      </div>
    </Card>
  );
}
