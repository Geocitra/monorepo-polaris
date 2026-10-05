'use client';

import { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  MessageSquare, 
  Share2, 
  FileText, 
  Download, 
  Globe, 
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface OmnichannelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawContent: string;
  title: string;
  authorName?: string;
  partyName?: string;
  onPublishToWeb: () => Promise<void>;
  publishing: boolean;
  publishedUrl: string | null;
}

export function OmnichannelExportModal({
  isOpen,
  onClose,
  rawContent,
  title,
  authorName = 'Anggota Dewan',
  partyName = 'Parlemen',
  onPublishToWeb,
  publishing,
  publishedUrl,
}: OmnichannelExportModalProps) {
  const { toast } = useToast();
  const [activeChannel, setActiveChannel] = useState<'WA' | 'MEDSOS' | 'WORD' | 'PDF'>('WA');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Helper to convert HTML / Markdown to clean WhatsApp broadcast text
  function formatForWhatsApp(content: string, docTitle: string, author: string, party: string): string {
    let text = content;

    // Check if content is HTML (TipTap output)
    const isHtml = /<[a-z][\s\S]*>/i.test(content);

    if (isHtml) {
      text = text
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n📌 *$1*\n')
        .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n👉 *$1*\n')
        .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n🔹 *$1*\n')
        .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '*$1*')
        .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '*$1*')
        .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '_$1_')
        .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '_$1_')
        .replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '$1')
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '• $1\n')
        .replace(/<th[^>]*>([\s\S]*?)<\/th>/gi, ' *$1* |')
        .replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, ' $1 |')
        .replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, '\n$1')
        .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
        .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> _$1_\n')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<hr\s*[\/]?>/gi, '\n---\n')
        .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, '[Gambar: $1]')
        .replace(/<img[^>]*>/gi, '[Gambar]')
        .replace(/<[^>]+>/g, '') // Strip remaining tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
    } else {
      text = text
        .replace(/^#\s+(.*$)/gm, '📌 *$1*')
        .replace(/^##\s+(.*$)/gm, '👉 *$1*')
        .replace(/^###\s+(.*$)/gm, '🔹 *$1*')
        .replace(/\*\*(.*?)\*\*/g, '*$1*')
        .replace(/_(.*?)_/g, '_$1_')
        .replace(/:::chart[\s\S]*?:::/g, '📊 [Data Grafik Kebijakan Terlampir]')
        .replace(/:::metric[\s\S]*?:::/g, '');
    }

    // Clean up excessive blank lines
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    return `📢 *KAJIAN KEBIJAKAN RESMI: ${docTitle.toUpperCase()}*
Oleh: *${author}* (${party})
Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}

${text.slice(0, 3500)}

---
_Diteruskan resmi dari Ruang Kerja Eksekutif POLARIS Parlemen._
Silakan sebarkan ke grup konstituen & pengurus wilayah.`;
  }

  // Helper to extract key bullet points for Medsos Captions
  function formatForMedsos(content: string, docTitle: string, party: string): string {
    let clean = content;
    const isHtml = /<[a-z][\s\S]*>/i.test(content);

    let bulletItems: string[] = [];

    if (isHtml) {
      const liMatches = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
      if (liMatches && liMatches.length > 0) {
        bulletItems = liMatches
          .map((m) => '✅ ' + m.replace(/<[^>]+>/g, '').trim())
          .filter(Boolean)
          .slice(0, 5);
      } else {
        const pMatches = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
        if (pMatches) {
          bulletItems = pMatches
            .map((m) => m.replace(/<[^>]+>/g, '').trim())
            .filter((t) => t.length > 30)
            .slice(0, 3)
            .map((t) => '📌 ' + t.slice(0, 140) + '...');
        }
      }
    } else {
      bulletItems = clean
        .split('\n')
        .filter((l) => l.startsWith('* ') || l.startsWith('- ') || /^\d+\./.test(l))
        .map((l) => '✅ ' + l.replace(/^[\*\-\d\.]+\s*/, '').trim())
        .slice(0, 5);
    }

    const bulletsText = bulletItems.length > 0 
      ? bulletItems.join('\n') 
      : '✅ Komitmen percepatan pembangunan berorientasi pada kesejahteraan masyarakat.\n✅ Pengawalan alokasi anggaran tepat sasaran dan transparan.';

    return `💡 KAJIAN KEBIJAKAN DEWAN: ${docTitle}

Poin-poin penting rekomendasi kebijakan untuk kepentingan masyarakat daerah:

${bulletsText}

Bagaimana pandangan Bapak/Ibu mengenai langkah kebijakan ini? Tuliskan aspirasi Anda di kolom komentar!

#AdvokasiRakyat #Fraksi${party.replace(/[^a-zA-Z0-9]/g, '')} #SuaraDaerah #KawalKebijakan #POLARISParlemen`;
  }

  const waFormattedText = formatForWhatsApp(rawContent, title, authorName, partyName);
  const medsosFormattedText = formatForMedsos(rawContent, title, partyName);

  function handleCopy(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        type: 'success',
        title: 'Berhasil Disalin!',
        description: `Format teks ${label} siap ditempel (*paste*).`,
      });
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadWord() {
    const isHtml = /<[a-z][\s\S]*>/i.test(rawContent);
    const bodyContent = isHtml ? rawContent : rawContent.replace(/\n/g, '<br/>');

    const sourceHTML = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 595.3pt 841.9pt; /* A4 */
      margin: 72pt 72pt 72pt 72pt;
      mso-header-margin: 36pt;
      mso-footer-margin: 36pt;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1e293b;
    }
    h1 { font-size: 20pt; font-weight: bold; color: #0f172a; margin-bottom: 8pt; }
    h2 { font-size: 14pt; font-weight: bold; color: #1e3a8a; margin-top: 14pt; margin-bottom: 6pt; }
    h3 { font-size: 12pt; font-weight: bold; color: #334155; margin-top: 10pt; margin-bottom: 4pt; }
    p { margin-bottom: 8pt; }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 14pt 0;
    }
    th {
      background-color: #f1f5f9;
      border: 1pt solid #cbd5e1;
      padding: 7pt 10pt;
      font-weight: bold;
      text-align: left;
      font-size: 10pt;
      color: #0f172a;
    }
    td {
      border: 1pt solid #cbd5e1;
      padding: 6pt 10pt;
      font-size: 10pt;
      color: #334155;
    }
    blockquote {
      border-left: 3pt solid #2563eb;
      margin: 10pt 0;
      padding: 6pt 12pt;
      background-color: #f8fafc;
      font-style: italic;
      color: #475569;
    }
    ul, ol { margin-left: 18pt; margin-bottom: 8pt; }
    li { margin-bottom: 4pt; }
    img { max-width: 100%; height: auto; margin: 12pt 0; }
  </style>
</head>
<body>
  <div class="Section1">
    <div style="border-bottom: 2pt solid #2563eb; padding-bottom: 12pt; margin-bottom: 16pt;">
      <h1 style="margin: 0; color: #0f172a;">${title}</h1>
      <p style="color: #64748b; font-size: 9.5pt; margin-top: 6pt; margin-bottom: 0;">
        <b>Penulis:</b> ${authorName} (${partyName}) &nbsp;|&nbsp; 
        <b>Tanggal:</b> ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} &nbsp;|&nbsp;
        <b>Format:</b> Dokumen Resmi Parlemen POLARIS
      </p>
    </div>
    ${bodyContent}
  </div>
</body>
</html>`;

    const blob = new Blob(['\ufeff' + sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40)}.doc`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      type: 'success',
      title: 'File Word Diunduh',
      description: 'Dokumen .doc siap dibuka di Microsoft Word / WPS Office dengan tabel & heading utuh.',
    });
  }

  function handleDownloadPdf() {
    onClose();
    setTimeout(() => {
      window.print();
    }, 300);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 block">
              Omnichannel Content Distribution
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              Distribusi Naskah Multi-Kanal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CHANNEL TABS */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveChannel('WA')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeChannel === 'WA'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Format WA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel('MEDSOS')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeChannel === 'MEDSOS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            )}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Caption Medsos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel('WORD')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeChannel === 'WORD'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Word (.doc)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChannel('PDF')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeChannel === 'PDF'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            )}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Cetak PDF</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 space-y-4">
          {activeChannel === 'WA' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pratinjau Pesan Broadcast WhatsApp:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(waFormattedText, 'WhatsApp')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Salin Pesan WA</span>
                </button>
              </div>
              <textarea
                readOnly
                value={waFormattedText}
                rows={10}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 resize-none focus:outline-none"
              />
            </div>
          )}

          {activeChannel === 'MEDSOS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pratinjau Caption Instagram / Twitter:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(medsosFormattedText, 'Media Sosial')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Salin Caption</span>
                </button>
              </div>
              <textarea
                readOnly
                value={medsosFormattedText}
                rows={10}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 font-sans text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 resize-none focus:outline-none"
              />
            </div>
          )}

          {activeChannel === 'WORD' && (
            <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Ekspor Dokumen Microsoft Word
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Diformat otomatis sesuai kaidah penulisan dokumen resmi dengan hierarki heading, penomoran rapi, dan tabel yang siap diedit di MS Word.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadWord}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Unduh File Word (.doc) Sekarang</span>
              </button>
            </div>
          )}

          {activeChannel === 'PDF' && (
            <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Cetak Dokumen / Ekspor PDF Resmi
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Menggunakan tata letak standar A4 siap cetak dengan margin resmi untuk kebutuhan bahan rapat komisi atau arsip pansus.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Buka Dialog Cetak / Simpan PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* FOOTER PUBLIKASI WEB */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Publikasikan ke Portal Resmi:
            </span>
            <span className="text-[11px] text-slate-400">
              Tayangkan langsung sebagai artikel resmi di website publik Anda.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {publishedUrl ? (
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5 shadow-xs"
              >
                <span>Lihat di Web</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onPublishToWeb}
                disabled={publishing}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer bg-blue-600"
              >
                {publishing ? (
                  <>
                    <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mempublikasikan...</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-3.5 w-3.5" />
                    <span>Tayangkan ke Website</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
