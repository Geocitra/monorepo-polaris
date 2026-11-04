'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Instagram,
  Send,
  Copy,
  CheckCheck,
  Download,
  Video,
  Loader2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { ApiClient } from '@/lib/api-client';
import { AssignedTenant, GeneratedFullResult } from './types';

interface OperatorSocialDistributionTabProps {
  selectedDewan: AssignedTenant;
  generatedResult: GeneratedFullResult;
  publishedUrl: string | null;
  downloadingPoster: boolean;
  onDownloadPoster: (customName?: string) => void;
  regeneratingPoster?: boolean;
}

type SocialChannel = 'whatsapp' | 'instagram' | 'tiktok' | 'x' | 'threads';

export function OperatorSocialDistributionTab({
  selectedDewan,
  generatedResult,
  publishedUrl,
  downloadingPoster,
  onDownloadPoster,
  regeneratingPoster,
}: OperatorSocialDistributionTabProps) {
  const [activeChannel, setActiveChannel] = useState<SocialChannel>('whatsapp');

  // Multi-channel Draft Texts
  const [customWaText, setCustomWaText] = useState('');
  const [customIgCaption, setCustomIgCaption] = useState('');
  const [customTiktokCaption, setCustomTiktokCaption] = useState('');
  const [customXText, setCustomXText] = useState('');
  const [customThreadsText, setCustomThreadsText] = useState('');

  // Dispatch Package States
  const [isDispatching, setIsDispatching] = useState(false);
  const [lastDispatchedAt, setLastDispatchedAt] = useState<string | null>(null);
  const [showPackagePreview, setShowPackagePreview] = useState(false);
  const [copiedPackage, setCopiedPackage] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState<string | null>(null);

  const isPosterReady = Boolean(generatedResult.posterUrl && generatedResult.posterUrl.trim().length > 0);
  const isPosterBusy = Boolean(regeneratingPoster);
  const canDispatch = isPosterReady && !isPosterBusy && !isDispatching;

  const portalArticleUrl =
    publishedUrl ||
    (generatedResult.publication.slug
      ? `https://polaris.id/p/${generatedResult.publication.slug}`
      : `https://polaris.id/p/${generatedResult.publication.id}`);

  const posterDownloadUrl = generatedResult.posterUrl || '';

  // Inisialisasi draf naskah adaptif per kanal
  useEffect(() => {
    const pub = generatedResult.publication;
    const pack = generatedResult.socialPack;
    const dapilTag = (selectedDewan.customDapilName || 'Dapil').replace(/\s+/g, '');
    const partyTag = (selectedDewan.partyAffiliation || 'Aspirasi').replace(/\s+/g, '');
    const namaTokoh = selectedDewan.fullName || 'Tokoh Polaris';

    // 1. WhatsApp Siaran
    const defaultWa =
      pack?.whatsappBroadcastText ||
      pack?.whatsappBroadcast ||
      `*SIARAN PERS RESMI*\n*${pub.title}*\n_${namaTokoh} — ${selectedDewan.partyAffiliation || ''}_\n\n${pub.excerpt || ''}\n\n📌 *Poin Pokok Kebijakan:*\n${(pub.bodyContentMarkdown || '').slice(0, 450)}...\n\nBaca rilis selengkapnya di portal resmi:\n${portalArticleUrl}`;
    setCustomWaText(defaultWa);

    // 2. Instagram
    const defaultIg =
      pack?.instagramCaption ||
      `${pub.title}\n\n${pub.excerpt || ''}\n\nSimak ulasan kebijakan publik selengkapnya melalui portal resmi:\n🔗 ${portalArticleUrl}\n\n#${dapilTag} #${partyTag} #SuaraRakyat #KerjaNyata #PolarisMedia`;
    setCustomIgCaption(defaultIg);

    // 3. TikTok
    const defaultTiktok = `${pub.title}\n\n${(pub.excerpt || '').slice(0, 150)}...\n\nSimak rilis kebijakan lengkap di portal resmi: ${portalArticleUrl}\n\n#fyp #suararakyat #${dapilTag.toLowerCase()} #kebijakanpublik #${partyTag.toLowerCase()} #polaris`;
    setCustomTiktokCaption(defaultTiktok);

    // 4. X (Twitter)
    const twitterThread = pack?.twitterThreads?.[0] || '';
    const defaultX = twitterThread || `${pub.title}\n\n${(pub.excerpt || '').slice(0, 140)}...\n\nBaca selengkapnya di portal: ${portalArticleUrl}`;
    setCustomXText(defaultX);

    // 5. Threads
    const defaultThreads = `${pub.title}\n\n${pub.excerpt || ''}\n\nPortal: ${portalArticleUrl}\n\n#${dapilTag}`;
    setCustomThreadsText(defaultThreads);
  }, [generatedResult, selectedDewan, publishedUrl, portalArticleUrl]);

  // Handler Copy dengan Toast Feedback
  const handleCopyText = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSingle(key);
    setTimeout(() => setCopiedSingle(null), 2500);
    toast({
      type: 'success',
      title: `${label} Disalin!`,
      description: 'Naskah teks siap digunakan.',
    });
  };

  // Kompilasi Paket Siap Tayang Lengkap untuk WhatsApp Dewan
  const compileFullPackage = () => {
    const pub = generatedResult.publication;
    const namaTokoh = selectedDewan.fullName;
    const partai = selectedDewan.partyAffiliation ? `(${selectedDewan.partyAffiliation})` : '';
    const dapil = selectedDewan.customDapilName ? `- Dapil ${selectedDewan.customDapilName}` : '';

    return `📦 *PAKET KONTEN & RILIS RESMI POLARIS*
👤 *Klien:* ${namaTokoh} ${partai} ${dapil}
📰 *Judul:* ${pub.title}

🌐 *Tautan Portal Berita Resmi:*
${portalArticleUrl}
${posterDownloadUrl ? `\n🖼️ *Link Unduh Poster HD:*\n${posterDownloadUrl}` : ''}

━━━━━━━━━━━━━━━━━━━━━━
📢 *1. FORMAT SIARAN WHATSAPP (Warga & Wartawan):*
${customWaText}

━━━━━━━━━━━━━━━━━━━━━━
📸 *2. DRAF CAPTION INSTAGRAM:*
${customIgCaption}

━━━━━━━━━━━━━━━━━━━━━━
🎵 *3. DRAF CAPTION TIKTOK:*
${customTiktokCaption}

━━━━━━━━━━━━━━━━━━━━━━
🐦 *4. DRAF CUITAN X (TWITTER):*
${customXText}

━━━━━━━━━━━━━━━━━━━━━━
🧵 *5. DRAF UTAS THREADS:*
${customThreadsText}

━━━━━━━━━━━━━━━━━━━━━━
_Diproduksi oleh Tim Redaksi Polaris Media Studio via Bot Resmi_`;
  };

  // Kirim Paket Siap Tayang via WhatsApp Cloud API Bot Resmi Polaris (Walled Garden)
  const handleDispatchViaBot = async () => {
    if (isDispatching) return;
    setIsDispatching(true);

    try {
      const packageText = compileFullPackage();

      const response = await ApiClient.request<{
        success: boolean;
        message: string;
        recipientName: string;
      }>('/whatsapp/operator/dispatch-package', {
        method: 'POST',
        body: JSON.stringify({
          tenantId: selectedDewan.tenantId,
          publicationId: generatedResult.publication.id,
          packageText,
          posterUrl: generatedResult.posterUrl || undefined,
        }),
      });

      const nowStr = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastDispatchedAt(nowStr);

      toast({
        type: 'success',
        title: 'Paket Berhasil Dikirim ke Klien!',
        description: response.message || `Materi telah dikirimkan ke WhatsApp ${selectedDewan.fullName} via Bot Resmi Polaris.`,
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Gagal Mengirim ke WhatsApp',
        description: err.message || 'Terjadi kendala saat menghubungi WhatsApp Cloud API.',
      });
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCopyFullPackage = () => {
    const fullText = compileFullPackage();
    navigator.clipboard.writeText(fullText);
    setCopiedPackage(true);
    setTimeout(() => setCopiedPackage(false), 2500);
    toast({
      type: 'success',
      title: 'Seluruh Paket Disalin!',
      description: 'Seluruh kompilasi naskah, caption, dan link poster tersalin ke clipboard.',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. DISPATCH CONTROL CARD: BOT RESMI POLARIS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-indigo-500/10 border-2 border-emerald-500/30 dark:border-emerald-600/40 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Kirim Paket Siap Tayang ke WhatsApp Klien</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                    Bot Resmi Polaris
                  </span>
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    Kepada: {selectedDewan.fullName}
                  </span>
                  {selectedDewan.partyAffiliation && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold">
                      {selectedDewan.partyAffiliation}
                    </span>
                  )}
                  {selectedDewan.customDapilName && (
                    <span className="text-slate-500 text-[11px]">
                      • Dapil {selectedDewan.customDapilName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-300/90 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Terproteksi Walled Garden:</strong> Dikirim otomatis via Bot Cloud API resmi Polaris (+62 831-8022-6507). Nomor pribadi operator dan dewan terisolasi 100% aman.
              </span>
            </div>
          </div>

          {/* Action Buttons: Kirim via Bot & Salin Paket */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDispatchViaBot}
              disabled={!canDispatch}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                canDispatch
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:scale-[1.02]'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-80'
              }`}
            >
              {isDispatching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim via Bot...</span>
                </>
              ) : isPosterBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Merender Ulang Poster...</span>
                </>
              ) : !isPosterReady ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Menunggu Poster Visual...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim ke WhatsApp Dewan</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyFullPackage}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedPackage ? (
                <CheckCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copiedPackage ? 'Tersalin!' : 'Salin Seluruh Paket'}</span>
            </button>
          </div>
        </div>

        {/* Status Kunci Tombol jika Poster Belum Siap */}
        {(!isPosterReady || isPosterBusy) && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
            <span>
              <strong>Poster visual sedang diproses di latar belakang.</strong> Naskah dan caption sudah siap Anda tinjau/edit di tab bawah. Tombol kirim ke WhatsApp Dewan akan aktif otomatis begitu poster selesai dirender.
            </span>
          </div>
        )}

        {/* Live Delivery Status Indicator */}
        {lastDispatchedAt && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Paket konten berhasil dikirim ke WhatsApp Dewan pada pukul <strong>{lastDispatchedAt} WIB</strong> via Bot Resmi Polaris.
            </span>
          </div>
        )}

        {/* Collapsible Pratinjau Format Pesan Paket */}
        <div className="border-t border-emerald-200/60 dark:border-emerald-800/40 pt-3">
          <button
            type="button"
            onClick={() => setShowPackagePreview((prev) => !prev)}
            className="text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <span>{showPackagePreview ? 'Sembunyikan' : 'Lihat'} Format Pesan Paket Lengkap</span>
            {showPackagePreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showPackagePreview && (
            <div className="mt-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed shadow-inner">
              {compileFullPackage()}
            </div>
          )}
        </div>
      </div>

      {/* 2. TAB NAVIGASI FORMAT NASKAH & CAPTION */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveChannel('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            activeChannel === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Siaran Pers WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChannel('instagram')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            activeChannel === 'instagram'
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Instagram className="w-4 h-4" />
          <span>Instagram Caption</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChannel('tiktok')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            activeChannel === 'tiktok'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Video className="w-4 h-4 text-[#fe2c55]" />
          <span>TikTok Caption</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChannel('x')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            activeChannel === 'x'
              ? 'bg-black text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span className="font-mono font-black text-xs">𝕏</span>
          <span>X (Twitter)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChannel('threads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
            activeChannel === 'threads'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span className="font-bold text-xs">@</span>
          <span>Meta Threads</span>
        </button>
      </div>

      {/* 3. DETAIL PANEL PER FORMAT */}

      {/* PANEL WHATSAPP */}
      {activeChannel === 'whatsapp' && (
        <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/60 dark:border-emerald-800/40 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <span>Siaran Pers WhatsApp (Grup Warga & Wartawan)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Format naskah siaran pers dengan sintaks Markdown WhatsApp (*tebal*, _miring_) beserta tautan berita portal resmi.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {generatedResult.posterUrl && (
                <button
                  type="button"
                  onClick={() => onDownloadPoster()}
                  disabled={downloadingPoster}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-60"
                >
                  {downloadingPoster ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Unduh Poster HD</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleCopyText(customWaText, 'Siaran WhatsApp', 'wa')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-50 transition cursor-pointer"
              >
                {copiedSingle === 'wa' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedSingle === 'wa' ? 'Tersalin' : 'Salin Naskah Siaran'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Isi Naskah Siaran (Dapat Disesuaikan):</span>
              <span className="text-[10px] text-slate-400 font-mono">Format Pesan Siaran</span>
            </label>
            <textarea
              value={customWaText}
              onChange={(e) => setCustomWaText(e.target.value)}
              rows={8}
              className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-900 dark:text-white leading-relaxed font-sans shadow-inner focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      {/* PANEL INSTAGRAM */}
      {activeChannel === 'instagram' && (
        <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200/60 dark:border-purple-800/40 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-2">
                <span>Draf Keterangan (Caption Instagram)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Draf caption Instagram lengkap dengan tagar dapil dan tautan kebijakan untuk disalin oleh Dewan/Ajudan.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {generatedResult.posterUrl && (
                <button
                  type="button"
                  onClick={() => onDownloadPoster()}
                  disabled={downloadingPoster}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300 font-bold text-xs hover:bg-purple-50 transition cursor-pointer disabled:opacity-60"
                >
                  {downloadingPoster ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Unduh Poster</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleCopyText(customIgCaption, 'Caption Instagram', 'ig')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer"
              >
                {copiedSingle === 'ig' ? (
                  <CheckCheck className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedSingle === 'ig' ? 'Tersalin' : 'Salin Caption'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Pratinjau Visual Kiri */}
            {generatedResult.posterUrl && (
              <div className="md:col-span-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">Poster Siap Unggah:</span>
                <img
                  src={generatedResult.posterUrl}
                  alt="Poster Visual"
                  className="w-full rounded-lg shadow-sm object-cover aspect-[4/5]"
                />
              </div>
            )}

            {/* Editor Caption Kanan */}
            <div className={generatedResult.posterUrl ? 'md:col-span-8 space-y-2' : 'col-span-12 space-y-2'}>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Isi Caption Instagram:</span>
                <span className="text-[10px] text-purple-600 font-mono">Disertai Tagar Dapil & Link Portal</span>
              </label>
              <textarea
                value={customIgCaption}
                onChange={(e) => setCustomIgCaption(e.target.value)}
                rows={9}
                className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-xs text-slate-900 dark:text-white leading-relaxed font-sans shadow-inner focus:outline-hidden focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* PANEL TIKTOK */}
      {activeChannel === 'tiktok' && (
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/40 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span>Draf Deskripsi TikTok (Slideshow / Foto)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Draf teks TikTok beserta tagar algoritma FYP dan isu daerah.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {generatedResult.posterUrl && (
                <button
                  type="button"
                  onClick={() => onDownloadPoster()}
                  disabled={downloadingPoster}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
                >
                  {downloadingPoster ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Unduh Poster</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleCopyText(customTiktokCaption, 'Caption TikTok', 'tiktok')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
              >
                {copiedSingle === 'tiktok' ? (
                  <CheckCheck className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedSingle === 'tiktok' ? 'Tersalin' : 'Salin Caption'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Isi Deskripsi TikTok:</span>
              <span className="text-[10px] text-rose-500 font-mono">Tagar Algoritma FYP</span>
            </label>
            <textarea
              value={customTiktokCaption}
              onChange={(e) => setCustomTiktokCaption(e.target.value)}
              rows={6}
              className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed font-sans shadow-inner focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>
      )}

      {/* PANEL X (TWITTER) */}
      {activeChannel === 'x' && (
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/40 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span>Draf Cuitan X (Twitter)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cuitan ringkas opini publik yang disesuaikan batas 280 karakter.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {generatedResult.posterUrl && (
                <button
                  type="button"
                  onClick={() => onDownloadPoster()}
                  disabled={downloadingPoster}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
                >
                  {downloadingPoster ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Unduh Poster</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleCopyText(customXText, 'Cuitan X', 'x')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-black text-white font-bold text-xs transition cursor-pointer"
              >
                {copiedSingle === 'x' ? (
                  <CheckCheck className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedSingle === 'x' ? 'Tersalin' : 'Salin Cuitan'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Isi Cuitan:</span>
              <span
                className={`text-[10px] font-mono ${
                  customXText.length > 280 ? 'text-rose-500 font-black' : 'text-slate-400'
                }`}
              >
                {customXText.length} / 280 Karakter
              </span>
            </div>
            <textarea
              value={customXText}
              onChange={(e) => setCustomXText(e.target.value)}
              rows={5}
              className={`w-full p-4 rounded-xl bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white leading-relaxed font-sans shadow-inner focus:outline-hidden ${
                customXText.length > 280
                  ? 'border-rose-400 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-slate-500'
              }`}
            />
          </div>
        </div>
      )}

      {/* PANEL THREADS */}
      {activeChannel === 'threads' && (
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/40 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span>Draf Utas Meta Threads</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Draf naskah opini untuk dipublikasikan ke jejaring Threads.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleCopyText(customThreadsText, 'Naskah Threads', 'threads')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-black text-white font-bold text-xs transition cursor-pointer"
              >
                {copiedSingle === 'threads' ? (
                  <CheckCheck className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedSingle === 'threads' ? 'Tersalin' : 'Salin Teks'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Isi Naskah Threads:
            </label>
            <textarea
              value={customThreadsText}
              onChange={(e) => setCustomThreadsText(e.target.value)}
              rows={6}
              className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed font-sans shadow-inner focus:outline-hidden focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
