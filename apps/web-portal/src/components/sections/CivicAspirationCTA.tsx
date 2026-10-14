'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MessageCircle, Building2, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';

interface CivicAspirationCTAProps {
  member: any;
  theme: any;
  config?: Record<string, any>;
  variant?: string;
}

export function CivicAspirationCTA({
  member,
  theme,
  config,
  variant = 'BANNER_COMPACT',
}: CivicAspirationCTAProps) {
  const customTitle = config?.title || 'Ruang Kolaborasi & Audiensi Kebijakan';
  const customSubtitle =
    config?.subtitle ||
    `Pintu kantor perwakilan ${member?.fullName || 'Dewan'} senantiasa terbuka untuk gagasan akademisi, telaah masyarakat sipil, kemitraan media, dan permohonan dialog publik.`;

  const waText = encodeURIComponent(`Halo Sekretariat ${member?.fullName || 'Dewan'}, saya ingin mengajukan permohonan dialog kebijakan.`);

  return (
    <section id="kontak" className="my-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
      {/* Background ambient glow */}
      <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center md:text-left flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Kemitraan Publik & Gagasan Komprehensif</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            {customTitle}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            {customSubtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-300" />
              Sekretariat Fraksi {member?.partyAffiliation || 'DPR RI'}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Dapil {member?.dapilName || 'Indonesia'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto shrink-0">
          <Link
            href="/lapor"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Mail className="w-4 h-4" />
            <span>Kirim Permohonan Audiensi</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white transition-all backdrop-blur-md border border-white/15 hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Staf Ahli</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
