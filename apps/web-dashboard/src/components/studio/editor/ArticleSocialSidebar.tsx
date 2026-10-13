'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { ApiClient } from '@/lib/api-client';
import { MessageCircle, Copy, Instagram, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { InstagramPublishProgressModal } from '@/components/studio/InstagramPublishProgressModal';

interface ArticleSocialSidebarProps {
  socialPack: any;
  articleId?: string;
  posterUrl?: string | null;
}

export function ArticleSocialSidebar({ socialPack, articleId, posterUrl }: ArticleSocialSidebarProps) {
  const { toast } = useToast();
  const [connectedAccount, setConnectedAccount] = useState<any>(null);
  const [publishingIg, setPublishingIg] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  useEffect(() => {
    ApiClient.request<any>('/social/instagram/account')
      .then((acc) => setConnectedAccount(acc))
      .catch(() => setConnectedAccount(null));
  }, []);

  if (!socialPack) return null;

  const memoText = socialPack.whatsappBroadcastText || socialPack.whatsappBroadcast || '';
  const igCaption = socialPack.instagramCaption || '';

  async function handleDirectPublishInstagram() {
    if (!connectedAccount) {
      toast({
        type: 'warning',
        title: 'Instagram Belum Terhubung',
        description: 'Tautkan akun Instagram resmi Anda terlebih dahulu di menu Tema & Website.',
      });
      return;
    }

    if (!posterUrl) {
      toast({
        type: 'error',
        title: 'Gambar Poster Belum Siap',
        description: 'Tunggu poster visual selesai dibuat sebelum menerbitkan ke Instagram feed.',
      });
      return;
    }

    setPublishingIg(true);
    try {
      const res = await ApiClient.request<{ success: boolean; jobId: string; publishingJobId: string }>(
        '/social/instagram/publish',
        {
          method: 'POST',
          body: JSON.stringify({
            accountId: connectedAccount.id,
            publicationId: articleId,
            caption: igCaption,
            mediaUrl: posterUrl,
          }),
        }
      );

      const targetJobId = res?.publishingJobId || res?.jobId;
      if (targetJobId) {
        setActiveJobId(targetJobId);
        setIsPublishModalOpen(true);
      }
      setPublishedSuccess(true);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Menerbitkan ke Instagram',
        description: err.message,
      });
    } finally {
      setPublishingIg(false);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase text-slate-400">
          Format Sebaran Media Sosial
        </span>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
          Siap Kirim
        </span>
      </div>

      {/* INSTAGRAM */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-50/60 to-rose-50/40 dark:from-purple-950/30 dark:to-rose-950/20 border border-purple-200 dark:border-purple-800/60 text-xs space-y-2.5">
        <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 text-xs">
            <Instagram className="h-4 w-4" /> Instagram Feed:
          </span>

          {connectedAccount && (
            <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
              @{connectedAccount.accountHandle}
            </span>
          )}
        </div>

        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-purple-100 dark:border-purple-900 text-slate-700 dark:text-slate-300 text-[11px] max-h-36 overflow-y-auto whitespace-pre-line shadow-inner">
          {igCaption}
        </div>

        <div className="pt-1 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(igCaption);
              toast({ type: 'success', title: 'Caption Tersalin!', description: 'Teks siap ditempel.' });
            }}
            className="text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 text-[11px] font-bold cursor-pointer"
          >
            <Copy className="h-3 w-3" /> Salin Teks
          </button>

          {connectedAccount && posterUrl && (
            <button
              type="button"
              disabled={publishingIg || publishedSuccess}
              onClick={handleDirectPublishInstagram}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-rose-600 hover:opacity-90 text-white font-black text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {publishingIg ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Menerbitkan...</span>
                </>
              ) : publishedSuccess ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                  <span>Terkirim</span>
                </>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  <span>Terbitkan ke @{connectedAccount.accountHandle}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* WHATSAPP */}
      <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-2">
        <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400 text-xs">
            <MessageCircle className="h-3.5 w-3.5" /> Memo WhatsApp:
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(memoText);
              toast({ type: 'success', title: 'Memo Tersalin!', description: 'Teks siap ditempel.' });
            }}
            className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5 text-[11px] font-bold cursor-pointer"
          >
            <Copy className="h-3 w-3" /> Salin
          </button>
        </div>
        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-emerald-100 dark:border-emerald-900 text-slate-700 dark:text-slate-300 whitespace-pre-line text-[11px] max-h-36 overflow-y-auto leading-relaxed shadow-inner">
          {memoText}
        </div>
      </div>

      {/* Pop-up Live Progress Modal Penerbitan Instagram */}
      {connectedAccount && (
        <InstagramPublishProgressModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          jobId={activeJobId}
          accountHandle={connectedAccount.accountHandle}
          posterUrl={posterUrl || undefined}
          captionPreview={igCaption}
        />
      )}
    </div>
  );
}
