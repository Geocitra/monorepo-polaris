'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { subscribeNewsletter } from '@/lib/api';

interface NewsletterSubscriptionBoxProps {
  member: any;
  theme?: any;
  subdomain?: string;
  config?: Record<string, any>;
  variant?: string;
}

export function NewsletterSubscriptionBox({
  member,
  subdomain,
}: NewsletterSubscriptionBoxProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    if (!subdomain) {
      setIsSubmitted(true);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await subscribeNewsletter(subdomain, email);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftar buletin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-900 bg-slate-950 text-white p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Buletin Konstituen Digital</span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-white">
          Langganan Catatan Dewan
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Dapatkan ringkasan opini berkala, telaah regulasi daerah, dan laporan kerja nyata {member.fullName} langsung di kotak masuk email Anda.
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Terima kasih! Email Anda telah terdaftar dalam buletin resmi dewan.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              disabled={loading}
              placeholder="Masukkan alamat email Anda..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Ikuti Sekarang</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="text-[10px] text-slate-500">
        Bebas berhenti langganan kapan saja. Privasi data Anda dilindungi UU No. 27/2022 (PDP).
      </div>
    </div>
  );
}
