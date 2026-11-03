'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Instagram,
  Send,
  Copy,
  CheckCheck,
  Download,
  ExternalLink,
  CheckCircle2,
  Video,
  ArrowUpRight,
  Loader2,
  Phone,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { AssignedTenant, GeneratedFullResult } from './types';

interface OperatorSocialDistributionTabProps {
  selectedDewan: AssignedTenant;
  generatedResult: GeneratedFullResult;
  publishedUrl: string | null;
  downloadingPoster: boolean;
  onDownloadPoster: (customName?: string) => void;
}

type SocialChannel = 'whatsapp' | 'instagram' | 'tiktok' | 'x' | 'threads';

export function OperatorSocialDistributionTab({
  selectedDewan,
  generatedResult,
  publishedUrl,
  downloadingPoster,
  onDownloadPoster,
}: OperatorSocialDistributionTabProps) {
  const [activeChannel, setActiveChannel] = useState<SocialChannel>('whatsapp');

  // Text States
  const [customWaText, setCustomWaText] = useState('');
  const [customIgCaption, setCustomIgCaption] = useState('');
  const [customTiktokCaption, setCustomTiktokCaption] = useState('');
  const [customXText, setCustomXText] = useState('');
  const [customThreadsText, setCustomThreadsText] = useState('');

  // Dispatch Package States
  const [targetPhone, setTargetPhone] = useState('');
  const [showPackagePreview, setShowPackagePreview] = useState(false);
  const [copiedPackage, setCopiedPackage] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState<string | null>(null);

  // Distribution Checklist (Tracking Internal Operator)
  const [checklist, setChecklist] = useState({
    portal: generatedResult.publication.status === 'PUBLISHED',
    whatsapp: false,
    instagram: false,
    tiktok: false,
    x: false,
    threads: false,
  });

  const portalArticleUrl =
    publishedUrl ||
    (generatedResult.publication.slug
      ? `https://polaris.id/p/${generatedResult.publication.slug}`
      : `https://polaris.id/p/${generatedResult.publication.id}`);

  const posterDownloadUrl = generatedResult.posterUrl || '';

  // Inisialisasi teks berdasarkan data yang digenerate
  useEffect(() => {
    const pub = generatedResult.publication;
    const pack = generatedResult.socialPack;
    const dapilTag = (selectedDewan.customDapilName || 'Dapil').replace(/\s+/g, '');
    const partyTag = (selectedDewan.partyAffiliation || 'Aspirasi').replace(/\s+/g, '');
    const namaTokoh = selectedDewan.fullName || 'Tokoh Polaris';

    // 1. WhatsApp Memo
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

    // Sinkronisasi status portal
    if (pub.status === 'PUBLISHED') {
      setChecklist((prev) => ({ ...prev, portal: true }));
    }
  }, [generatedResult, selectedDewan, publishedUrl, portalArticleUrl]);

  // Handler Copy dengan Toast
  const handleCopyText = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSingle(key);
    setTimeout(() => setCopiedSingle(null), 2500);
    toast({
      type: 'success',
      title: `${label} Disalin!`,
      description: 'Teks siap ditempel ke platform yang dituju.',
    });
  };

  // Susun Paket Siap Tayang Lengkap untuk WA Klien
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
📢 *1. FORMAT SIARAN WHATSAPP (Publik & Media):*
${customWaText}

━━━━━━━━━━━━━━━━━━━━━━
📸 *2. CAPTION INSTAGRAM & THREADS:*
${customIgCaption}

━━━━━━━━━━━━━━━━━━━━━━
🎵 *3. CAPTION TIKTOK:*
${customTiktokCaption}

━━━━━━━━━━━━━━━━━━━━━━
🐦 *4. CUITAN X (TWITTER):*
${customXText}

━━━━━━━━━━━━━━━━━━━━━━
_Diproduksi oleh Tim Operator Polaris Media Studio_`;
  };

  const handleSendToWhatsApp = () => {
    const packageText = compileFullPackage();
    let waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(packageText)}`;
    if (targetPhone.trim()) {
      const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.startsWith('0')
        ? `62${cleanPhone.slice(1)}`
        : cleanPhone.startsWith('62')
        ? cleanPhone
        : `62${cleanPhone}`;
      waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(packageText)}`;
    }
    window.open(waUrl, '_blank');
    setChecklist((prev) => ({ ...prev, whatsapp: true }));
    toast({
      type: 'success',
      title: 'WhatsApp Terbuka',
      description: 'Paket konten lengkap siap dikirim ke Klien.',
    });
  };

  const handleCopyFullPackage = () => {
    const fullText = compileFullPackage();
    navigator.clipboard.writeText(fullText);
    setCopiedPackage(true);
    setTimeout(() => setCopiedPackage(false), 2500);
    toast({
      type: 'success',
      title: 'Seluruh Paket Disalin!',
      description: 'Seluruh teks naskah, caption, dan link aset tersalin ke clipboard.',
    });
  };

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* 1. DISPATCH BANNER: KIRIM PAKET KE WHATSAPP KLIEN */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-indigo-500/10 border-2 border-emerald-500/30 dark:border-emerald-600/40 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Kirim Paket Siap Tayang ke WhatsApp Klien</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                    Alur Opsi 1 (Dispatcher)
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Kompilasi artikel portal, siaran pers WA, caption Instagram/TikTok/X, dan tautan poster visual HD ke dalam 1 pesan WhatsApp terstruktur.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Input Nomor Tujuan & Tombol Kirim */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="No. WhatsApp Klien (Opsional: 08xx)"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                className="w-full sm:w-64 pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={handleSendToWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              <span>Kirim ke WA Sekarang</span>
            </button>

            <button
              type="button"
              onClick={handleCopyFullPackage}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedPackage ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPackage ? 'Tersalin!' : 'Salin Paket'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Pratinjau Pesan Paket WhatsApp */}
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

      {/* 2. CHECKLIST DISTRIBUSI OPERATOR (PELACAK STATUS PER KANAL) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Pelacak Status Distribusi ({completedCount}/5 Selesai)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Tandai kanal yang sudah disebarkan agar tidak tertukar antar akun Klien
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Portal */}
          <button
            type="button"
            onClick={() => toggleChecklist('portal')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
              checklist.portal
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${checklist.portal ? 'text-emerald-600' : 'text-slate-300'}`} />
            <div className="min-w-0">
              <div className="text-[11px] font-bold truncate">Portal Publik</div>
              <div className="text-[9px] opacity-75">{checklist.portal ? 'Sudah Terbit' : 'Belum Terbit'}</div>
            </div>
          </button>

          {/* WhatsApp */}
          <button
            type="button"
            onClick={() => toggleChecklist('whatsapp')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
              checklist.whatsapp
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${checklist.whatsapp ? 'text-emerald-600' : 'text-slate-300'}`} />
            <div className="min-w-0">
              <div className="text-[11px] font-bold truncate">WhatsApp Blast</div>
              <div className="text-[9px] opacity-75">{checklist.whatsapp ? 'Sudah Dikirim' : 'Belum Dikirim'}</div>
            </div>
          </button>

          {/* Instagram */}
          <button
            type="button"
            onClick={() => toggleChecklist('instagram')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
              checklist.instagram
                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${checklist.instagram ? 'text-purple-600' : 'text-slate-300'}`} />
            <div className="min-w-0">
              <div className="text-[11px] font-bold truncate">Instagram Feed</div>
              <div className="text-[9px] opacity-75">{checklist.instagram ? 'Sudah Diunggah' : 'Belum Diunggah'}</div>
            </div>
          </button>

          {/* TikTok */}
          <button
            type="button"
            onClick={() => toggleChecklist('tiktok')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
              checklist.tiktok
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${checklist.tiktok ? 'text-rose-600' : 'text-slate-300'}`} />
            <div className="min-w-0">
              <div className="text-[11px] font-bold truncate">TikTok Feed</div>
              <div className="text-[9px] opacity-75">{checklist.tiktok ? 'Sudah Diunggah' : 'Belum Diunggah'}</div>
            </div>
          </button>

          {/* X (Twitter) */}
          <button
            type="button"
            onClick={() => toggleChecklist('x')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
              checklist.x
                ? 'bg-slate-200 dark:bg-slate-800 border-slate-400 text-slate-900 dark:text-white'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 shrink-0 ${checklist.x ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`} />
            <div className="min-w-0">
              <div className="text-[11px] font-bold truncate">X (Twitter)</div>
              <div className="text-[9px] opacity-75">{checklist.x ? 'Sudah Cuit' : 'Belum Cuit'}</div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. CHANNEL NAVIGATION TABS */}
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
          <span>WhatsApp Memo</span>
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
          <span>Instagram Feed & Karusel</span>
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
          <span>TikTok Feed</span>
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

      {/* 4. DETAIL PANEL PER KANAL */}

      {/* PANEL WHATSAPP */}
      {activeChannel === 'whatsapp' && (
        <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/60 dark:border-emerald-800/40 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <span>Siaran Pers WhatsApp (Grup Warga & Wartawan)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Disesuaikan dengan sintaks Markdown WhatsApp (*tebal*, _miring_) dan menyertakan tautan resmi portal.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(customWaText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <span>Buka WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => handleCopyText(customWaText, 'Siaran WhatsApp', 'wa')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-50 transition cursor-pointer"
              >
                {copiedSingle === 'wa' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSingle === 'wa' ? 'Tersalin' : 'Salin Pesan'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Isi Naskah Siaran (Dapat Diedit Bebas):</span>
              <span className="text-[10px] text-slate-400 font-mono">Format Pesan Siaran</span>
            </label>
            <textarea
              value={customWaText}
              onChange={(e) => setCustomWaText(e.target.value)}
              rows={8}
              className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-900 dark:text-white leading-relaxed font-sans shadow-inner focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {generatedResult.posterUrl && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Lampirkan poster dokumen resolusi tinggi ke grup chat:
              </span>
              <button
                type="button"
                onClick={() => onDownloadPoster()}
                disabled={downloadingPoster}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-60"
              >
                {downloadingPoster ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>{downloadingPoster ? 'Mengunduh...' : 'Unduh Poster HD'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* PANEL INSTAGRAM */}
      {activeChannel === 'instagram' && (
        <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200/60 dark:border-purple-800/40 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-2">
                <span>Feed & Karusel Instagram</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Unduh poster HD dan salin caption untuk diunggah ke Instagram akun Klien.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <span>Buka Instagram Web</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => onDownloadPoster()}
                disabled={downloadingPoster}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300 font-bold text-xs hover:bg-purple-50 transition cursor-pointer disabled:opacity-60"
              >
                {downloadingPoster ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Unduh Gambar</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyText(customIgCaption, 'Caption Instagram', 'ig')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer"
              >
                {copiedSingle === 'ig' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
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
                <span>Draf Keterangan (Caption Instagram):</span>
                <span className="text-[10px] text-purple-600 font-mono">Disertai Tagar Dapil & Link</span>
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
                <span>TikTok Content Posting (Slideshow / Foto)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Unduh poster resolusi penuh lalu unggah di portal creator TikTok bersama naskah caption.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="https://www.tiktok.com/upload"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <span>Buka TikTok Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => onDownloadPoster()}
                disabled={downloadingPoster}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
              >
                {downloadingPoster ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Unduh Gambar</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyText(customTiktokCaption, 'Caption TikTok', 'tiktok')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
              >
                {copiedSingle === 'tiktok' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSingle === 'tiktok' ? 'Tersalin' : 'Salin Caption'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Draf Deskripsi TikTok (Maksimal 2.200 Karakter):</span>
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
                <span>X (Twitter) — Cuitan Opini & Utas</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cuitan ringkas dengan batas 280 karakter untuk diunggah langsung ke akun X tokoh.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`https://x.com/compose/post?text=${encodeURIComponent(customXText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <span>Buka & Cuit di X</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => onDownloadPoster()}
                disabled={downloadingPoster}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
              >
                {downloadingPoster ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Unduh Gambar</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyText(customXText, 'Cuitan X', 'x')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-black text-white font-bold text-xs transition cursor-pointer"
              >
                {copiedSingle === 'x' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSingle === 'x' ? 'Tersalin' : 'Salin Cuitan'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Isi Cuitan:</span>
              <span className={`text-[10px] font-mono ${customXText.length > 280 ? 'text-rose-500 font-black' : 'text-slate-400'}`}>
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
                <span>Meta Threads — Opini Utas</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Salin naskah opini dan buka threads.net untuk dipublikasikan ke jejaring Meta.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="https://threads.net"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <span>Buka Threads.net</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => handleCopyText(customThreadsText, 'Naskah Threads', 'threads')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-black text-white font-bold text-xs transition cursor-pointer"
              >
                {copiedSingle === 'threads' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
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

