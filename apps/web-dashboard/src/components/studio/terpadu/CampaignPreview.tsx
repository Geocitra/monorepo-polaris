'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  Sparkles,
  Image as ImageIcon,
  Globe,
  Copy,
  MessageCircle,
  FileText,
  Share2,
  ExternalLink,
  Lock,
  Download,
  Edit3,
  Eye,
  CheckCheck,
  Check,
} from 'lucide-react';

interface CampaignPreviewProps {
  generatedResult: any;
  publishedUrl: string | null;
  activeTab: 'article' | 'poster' | 'social';
  onTabChange: (tab: 'article' | 'poster' | 'social') => void;
  isUnpaid: boolean;
  publishing: boolean;
  onPublish: () => void;
  onUpdateArticleContent?: (newTitle: string, newBody: string) => void;
}

export function CampaignPreview({
  generatedResult,
  publishedUrl,
  activeTab,
  onTabChange,
  isUnpaid,
  publishing,
  onPublish,
  onUpdateArticleContent,
}: CampaignPreviewProps) {
  const { toast } = useToast();
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedIg, setCopiedIg] = useState(false);
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(generatedResult?.publication?.title || '');
  const [editedBody, setEditedBody] = useState(generatedResult?.publication?.bodyContentMarkdown || '');

  // Preset Poster
  const POSTER_PRESETS = [
    { id: 'dalle', name: 'Poster AI', url: generatedResult?.posterUrl || '/images/showcase-poster-surya.jpg', desc: 'Poster visual beresolusi tinggi' },
    { id: 'apbd', name: 'Grafik APBD', url: '/images/showcase-infografis-apbd.jpg', desc: 'Infografis data anggaran' },
    { id: 'pertanian', name: 'Foto Lapangan', url: '/images/showcase-artikel-pertanian.jpg', desc: 'Dokumentasi lapangan' },
  ];
  const [selectedPosterUrl, setSelectedPosterUrl] = useState(POSTER_PRESETS[0].url);

  if (!generatedResult) {
    return (
      <Card className="min-h-[500px] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4 rounded-3xl shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h4 className="font-black text-slate-900 dark:text-white text-lg">
            Hasil Konten Akan Muncul di Sini
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Tulis topik atau tempel link berita pada formulir di atas, lalu klik &quot;Buat Sekarang&quot;. AI akan otomatis membuat naskah artikel, poster, dan pesan siaran sekaligus.
          </p>
        </div>
      </Card>
    );
  }

  const currentTitle = editedTitle || generatedResult.publication?.title;
  const currentBody = editedBody || generatedResult.publication?.bodyContentMarkdown;
  const wordCount = (currentBody || '').split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  function handleCopyAllCampaign() {
    const waText =
      generatedResult.socialPack?.whatsappBroadcastText ||
      generatedResult.socialPack?.whatsappBroadcast ||
      '';
    const igText = generatedResult.socialPack?.instagramCaption || '';

    const fullPackageText = `=== PAKET KONTEN LENGKAP ===\n\n` +
      `JUDUL: ${currentTitle}\n` +
      `ESTIMASI BACA: ${readTimeMinutes} Menit (${wordCount} Kata)\n\n` +
      `--- RINGKASAN ---\n${generatedResult.publication?.excerpt || ''}\n\n` +
      `--- PESAN WHATSAPP ---\n${waText}\n\n` +
      `--- CAPTION INSTAGRAM ---\n${igText}\n\n` +
      `==========================`;

    navigator.clipboard.writeText(fullPackageText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
    toast({
      type: 'success',
      title: 'Semua Konten Tersalin!',
      description: 'Naskah, pesan WhatsApp, dan caption Instagram telah disalin ke clipboard.',
    });
  }

  function handleSaveArticleEdit() {
    setIsEditingArticle(false);
    if (onUpdateArticleContent) {
      onUpdateArticleContent(currentTitle, currentBody);
    }
    toast({
      type: 'success',
      title: 'Perubahan Disimpan',
      description: 'Naskah artikel berhasil diperbarui.',
    });
  }

  return (
    <Card className="space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 rounded-3xl">
      {/* HEADER HASIL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="green" className="font-extrabold text-[10px] uppercase">
              Siap Digunakan
            </Badge>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              {wordCount} Kata • {readTimeMinutes} Menit Baca
            </span>
          </div>
          <h4 className="font-black text-slate-900 dark:text-white text-base sm:text-lg mt-1 line-clamp-1">
            {currentTitle}
          </h4>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyAllCampaign}
            className="text-xs font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 gap-1.5 shadow-2xs"
          >
            {copiedAll ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
            <span>{copiedAll ? 'Tersalin!' : 'Salin Semua'}</span>
          </Button>

          {publishedUrl ? (
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white font-extrabold text-xs hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Buka di Website</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : isUnpaid ? (
            <Link href="/billing">
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50 gap-1.5 font-extrabold text-xs">
                <Lock className="h-3.5 w-3.5 text-amber-600" />
                <span>Aktivasi Lisensi</span>
              </Button>
            </Link>
          ) : (
            <Button
              onClick={onPublish}
              disabled={publishing}
              loading={publishing}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs gap-1.5 shadow-xs"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Terbitkan ke Website</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3 TAB OUTPUT */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => onTabChange('article')}
          className={`pb-2.5 px-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'article'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="h-3.5 w-3.5 inline mr-1.5" />
          Naskah Artikel
        </button>
        <button
          onClick={() => onTabChange('poster')}
          className={`pb-2.5 px-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'poster'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5 inline mr-1.5" />
          Poster & Infografis
        </button>
        <button
          onClick={() => onTabChange('social')}
          className={`pb-2.5 px-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'social'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Share2 className="h-3.5 w-3.5 inline mr-1.5" />
          WhatsApp & Instagram
        </button>
      </div>

      {/* TAB 1: NASKAH ARTIKEL */}
      {activeTab === 'article' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Naskah lengkap dengan rujukan peraturan
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingArticle(!isEditingArticle)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
              >
                {isEditingArticle ? <Eye className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
                <span>{isEditingArticle ? 'Tutup Suntingan' : 'Sunting'}</span>
              </button>
              {generatedResult.publication?.id && (
                <Link
                  href={`/studio/${generatedResult.publication.id}`}
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ml-2"
                >
                  Buka di Editor Lengkap &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* RINGKASAN */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed border-l-4 border-l-blue-600 dark:border-l-blue-500 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-1">
              Ringkasan
            </span>
            {generatedResult.publication?.excerpt}
          </div>

          {/* ISI NASKAH */}
          {isEditingArticle ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Judul:</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Isi Naskah:</label>
                <textarea
                  rows={14}
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 font-mono text-xs text-slate-800 dark:text-slate-100 leading-relaxed"
                />
              </div>
              <Button size="sm" onClick={handleSaveArticleEdit} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                Simpan Perubahan
              </Button>
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto pr-3 space-y-3 font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-950/50 shadow-inner">
              {currentBody}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: POSTER & INFOGRAFIS */}
      {activeTab === 'poster' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                Poster & Infografis
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih varian gambar atau unduh berkas resolusi tinggi
              </p>
            </div>

            {/* PRESET SWITCHER */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {POSTER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPosterUrl(preset.url)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedPosterUrl === preset.url
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video max-h-[420px] flex items-center justify-center shadow-md">
            <Image
              src={selectedPosterUrl}
              alt="Poster Visual"
              fill
              unoptimized
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
              <span className="font-semibold text-[11px] bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-slate-700">
                Resolusi Tinggi
              </span>
              <a
                href={selectedPosterUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHATSAPP & INSTAGRAM */}
      {activeTab === 'social' && generatedResult.socialPack && (
        <div className="space-y-4">
          {/* WHATSAPP */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 dark:border-emerald-900/40 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                    Pesan WhatsApp
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Siap dikirim ke grup warga atau relawan
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    const text =
                      generatedResult.socialPack.whatsappBroadcastText ||
                      generatedResult.socialPack.whatsappBroadcast;
                    navigator.clipboard.writeText(text);
                    setCopiedWa(true);
                    setTimeout(() => setCopiedWa(false), 2000);
                    toast({
                      type: 'success',
                      title: 'Pesan WhatsApp Disalin!',
                      description: 'Tinggal tempel di WhatsApp.',
                    });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                >
                  {copiedWa ? <CheckCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedWa ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/50 text-slate-800 dark:text-slate-200 whitespace-pre-line text-xs max-h-56 overflow-y-auto leading-relaxed font-sans shadow-inner border-l-4 border-l-emerald-500">
              {generatedResult.socialPack.whatsappBroadcastText || generatedResult.socialPack.whatsappBroadcast}
            </div>
          </div>

          {/* INSTAGRAM */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-2.5 shadow-2xs">
            <div className="flex justify-between items-center border-b border-purple-200/60 dark:border-purple-900/40 pb-2">
              <span className="flex items-center gap-1.5 text-purple-900 dark:text-purple-200 font-extrabold text-xs">
                <Share2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Caption Instagram</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedResult.socialPack.instagramCaption);
                  setCopiedIg(true);
                  setTimeout(() => setCopiedIg(false), 2000);
                  toast({
                    type: 'success',
                    title: 'Caption Disalin!',
                    description: 'Siap diposting ke Instagram.',
                  });
                }}
                className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-200 font-bold text-xs bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 shadow-2xs"
              >
                {copiedIg ? <CheckCheck className="h-3.5 w-3.5 text-purple-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedIg ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/50 text-slate-700 dark:text-slate-300 whitespace-pre-line text-xs max-h-40 overflow-y-auto leading-relaxed font-sans shadow-inner">
              {generatedResult.socialPack.instagramCaption}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
