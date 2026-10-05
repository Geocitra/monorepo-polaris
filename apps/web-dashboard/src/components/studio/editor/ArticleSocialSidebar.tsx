'use client';

import { useToast } from '@/components/ui/toast';
import { MessageCircle, Copy } from 'lucide-react';

interface ArticleSocialSidebarProps {
  socialPack: any;
}

export function ArticleSocialSidebar({ socialPack }: ArticleSocialSidebarProps) {
  const { toast } = useToast();

  if (!socialPack) return null;

  const memoText = socialPack.whatsappBroadcastText || socialPack.whatsappBroadcast || '';

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase text-slate-400">
          Format WhatsApp & Sosmed
        </span>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Siap Kirim
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
        <div className="flex justify-between items-center font-bold text-slate-800">
          <span className="flex items-center gap-1.5 text-green-700 text-xs">
            <MessageCircle className="h-3.5 w-3.5" /> Memo WhatsApp:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(memoText);
                toast({
                  type: 'success',
                  title: 'Memo Tersalin!',
                  description: 'Teks siap ditempel di grup WhatsApp atau aplikasi chat.',
                });
              }}
              className="text-emerald-700 hover:underline flex items-center gap-0.5 text-[11px] font-bold cursor-pointer"
            >
              <Copy className="h-3 w-3" /> Salin
            </button>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(memoText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline flex items-center gap-0.5 text-[11px] font-bold ml-1"
            >
              <MessageCircle className="h-3 w-3" /> Kirim
            </a>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 italic">
          Format ringkas untuk pesan grup atau broadcast konstituen.
        </p>
        <div className="p-2.5 bg-white rounded-lg border border-emerald-100 text-slate-700 whitespace-pre-line text-[11px] max-h-40 overflow-y-auto leading-relaxed font-sans shadow-inner">
          {memoText}
        </div>
      </div>
    </div>
  );
}
