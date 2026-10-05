'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Table, 
  Check, 
  AlertCircle, 
  Sparkles,
  Info,
  Calendar,
  User,
  Clock,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WritingStyle, WRITING_STYLES } from './WritingStyleSelector';

interface ChartBlockData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  labels: string[];
  unit?: string;
  datasets: { label: string; data: number[] }[];
}

interface MetricBlockData {
  value: string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

// Zero-crash SVG Chart Component (Works in React 19 without any external library)
function SafeSvgBarChart({ data }: { data: ChartBlockData }) {
  const allValues = data.datasets.flatMap((d) => d.data);
  const maxVal = Math.max(...allValues, 1);
  const barColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div className="my-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {data.title}
            </h4>
            {data.unit && (
              <span className="text-[10px] text-slate-400 font-medium">Satuan: {data.unit}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10.5px]">
          {data.datasets.map((ds, idx) => (
            <span key={ds.label} className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
              <span
                className="h-2.5 w-2.5 rounded-full inline-block"
                style={{ backgroundColor: barColors[idx % barColors.length] }}
              />
              {ds.label}
            </span>
          ))}
        </div>
      </div>

      {/* Bar Rendering Canvas */}
      <div className="pt-4 space-y-3">
        {data.labels.map((label, labelIdx) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span>{label}</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">
                {data.datasets.map((d) => `${d.data[labelIdx]} ${data.unit || ''}`).join(' | ')}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {data.datasets.map((ds, dsIdx) => {
                const val = ds.data[labelIdx] || 0;
                const pct = Math.min(100, Math.max(5, (val / maxVal) * 100));
                const col = barColors[dsIdx % barColors.length];

                return (
                  <div key={ds.label} className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden relative">
                    <div
                      className="h-full rounded-md transition-all duration-500 flex items-center px-2"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: col,
                      }}
                    >
                      <span className="text-[9px] font-black text-white drop-shadow-xs">
                        {val}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Zero-crash Metric Card
function SafeMetricCard({ data }: { data: MetricBlockData }) {
  return (
    <div className="my-5 p-4 rounded-2xl border-l-4 border-l-blue-600 border border-slate-200 dark:border-slate-800 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
          {data.label}
        </span>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          {data.description}
        </p>
      </div>
      <div className="text-right shrink-0">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
          {data.value}
        </span>
      </div>
    </div>
  );
}

interface VisualDocumentCanvasProps {
  content: string;
  onContentChange: (newContent: string) => void;
  selectedStyle: WritingStyle;
  wordCount: number;
  authorName?: string;
  partyName?: string;
  isSaving?: boolean;
  isWide?: boolean;
  zoom?: number;
}

export function VisualDocumentCanvas({
  content,
  onContentChange,
  selectedStyle,
  wordCount,
  authorName = 'Anggota Dewan',
  partyName = 'Parlemen',
  isSaving,
  isWide = true,
  zoom = 100,
}: VisualDocumentCanvasProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const cfg = WRITING_STYLES[selectedStyle];

  // Parse custom blocks: chart, metric, tables, images, lists, and headings
  const renderedElements = useMemo(() => {
    // Normalize content: unwrap any accidental HTML wrappers around custom blocks like :::chart
    const cleanContent = content
      .replace(/<p>\s*:::chart([\s\S]*?):::\s*<\/p>/gi, ':::chart$1:::')
      .replace(/<p>\s*:::metric([\s\S]*?):::\s*<\/p>/gi, ':::metric$1:::');

    const lines = cleanContent.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    // Helper to format inline bold, italic, and underline
    function formatInline(text: string): React.ReactNode {
      // If text already has HTML tags like <strong> or <em>, render dangerously or return
      if (/<[a-z][\s\S]*>/i.test(text)) {
        return <span dangerouslySetInnerHTML={{ __html: text }} />;
      }
      // Simple markdown bold/italic replacer
      const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} className="font-extrabold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={idx} className="italic text-slate-800 dark:text-slate-200">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs text-blue-600 dark:text-blue-400">{part.slice(1, -1)}</code>;
        }
        return part;
      });
    }

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1. Chart Block :::chart ... :::
      if (trimmed.startsWith(':::chart')) {
        let jsonStr = '';
        i++;
        while (i < lines.length && !lines[i].trim().startsWith(':::')) {
          jsonStr += lines[i] + '\n';
          i++;
        }
        i++; // skip closing :::
        try {
          // Clean possible HTML entities in json
          const cleanJson = jsonStr.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/<[^>]+>/g, '');
          const chartData: ChartBlockData = JSON.parse(cleanJson);
          elements.push(<SafeSvgBarChart key={`chart-${i}`} data={chartData} />);
        } catch {
          elements.push(
            <div key={`chart-err-${i}`} className="my-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs">
              <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                📊 Data Grafik Kebijakan
              </span>
              <pre className="font-mono text-[10px] text-slate-600 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap">
                {jsonStr}
              </pre>
            </div>
          );
        }
        continue;
      }

      // 2. Metric Block :::metric ... :::
      if (trimmed.startsWith(':::metric')) {
        let jsonStr = '';
        i++;
        while (i < lines.length && !lines[i].trim().startsWith(':::')) {
          jsonStr += lines[i] + '\n';
          i++;
        }
        i++; // skip closing :::
        try {
          const cleanJson = jsonStr.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/<[^>]+>/g, '');
          const metricData: MetricBlockData = JSON.parse(cleanJson);
          elements.push(<SafeMetricCard key={`metric-${i}`} data={metricData} />);
        } catch {}
        continue;
      }

      // 3. Markdown Table: | Col 1 | Col 2 |
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length > 0) {
          const headerLine = tableLines[0];
          const hasSeparator = tableLines.length > 1 && tableLines[1].includes('---');
          const dataLines = hasSeparator ? tableLines.slice(2) : tableLines.slice(1);

          const headers = headerLine
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim());

          elements.push(
            <div key={`table-${i}`} className="my-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="p-3.5 font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">
                        {formatInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
                  {dataLines.map((rowStr, rIdx) => {
                    const cells = rowStr
                      .slice(1, -1)
                      .split('|')
                      .map((c) => c.trim());
                    return (
                      <tr key={rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                        {cells.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3.5 text-slate-700 dark:text-slate-300">
                            {formatInline(cell)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // 4. HTML Table: <table ...>...</table>
      if (trimmed.startsWith('<table')) {
        let tableHtml = '';
        while (i < lines.length) {
          tableHtml += lines[i] + '\n';
          if (lines[i].includes('</table>')) {
            i++;
            break;
          }
          i++;
        }
        elements.push(
          <div
            key={`html-table-${i}`}
            className="my-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs ProseMirror"
            dangerouslySetInnerHTML={{ __html: tableHtml }}
          />
        );
        continue;
      }

      // 5. Images: ![alt](url) or <img ... />
      const imgMdMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
      if (imgMdMatch) {
        const alt = imgMdMatch[1];
        const src = imgMdMatch[2];
        elements.push(
          <div key={`img-${i}`} className="my-6 space-y-2">
            <img
              src={src}
              alt={alt || 'Dokumentasi Kebijakan'}
              className="w-full max-h-[460px] object-cover rounded-2xl shadow-md border border-slate-200 dark:border-slate-800"
            />
            {alt && (
              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 italic">
                {alt}
              </p>
            )}
          </div>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith('<img')) {
        elements.push(
          <div
            key={`html-img-${i}`}
            className="my-6 space-y-2 flex flex-col items-center"
            dangerouslySetInnerHTML={{ __html: trimmed }}
          />
        );
        i++;
        continue;
      }

      // 6. Markdown Headings #, ##, ### or HTML <h1>, <h2>, <h3>
      if (trimmed.startsWith('# ') || trimmed.startsWith('<h1>')) {
        const text = trimmed.replace(/^#\s*/, '').replace(/<\/?h1[^>]*>/gi, '');
        elements.push(
          <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-7 mb-3 leading-snug">
            {formatInline(text)}
          </h1>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith('## ') || trimmed.startsWith('<h2>')) {
        const text = trimmed.replace(/^##\s*/, '').replace(/<\/?h2[^>]*>/gi, '');
        elements.push(
          <h2 key={`h2-${i}`} className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-6 mb-2.5 leading-snug">
            {formatInline(text)}
          </h2>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith('### ') || trimmed.startsWith('<h3>')) {
        const text = trimmed.replace(/^###\s*/, '').replace(/<\/?h3[^>]*>/gi, '');
        elements.push(
          <h3 key={`h3-${i}`} className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 uppercase tracking-wide mt-5 mb-2">
            {formatInline(text)}
          </h3>
        );
        i++;
        continue;
      }

      // 7. Horizontal Separator
      if (trimmed === '---' || trimmed === '***' || trimmed === '<hr>' || trimmed === '<hr/>') {
        elements.push(<hr key={`hr-${i}`} className="my-6 border-slate-200 dark:border-slate-800" />);
        i++;
        continue;
      }

      // 8. Blockquote > or <blockquote>
      if (trimmed.startsWith('> ') || trimmed.startsWith('<blockquote>')) {
        const quoteText = trimmed.replace(/^>\s*/, '').replace(/<\/?blockquote[^>]*>/gi, '').replace(/<\/?p[^>]*>/gi, '');
        elements.push(
          <blockquote key={`quote-${i}`} className="my-4 pl-4 border-l-4 border-l-blue-600 italic text-slate-600 dark:text-slate-300 text-sm leading-relaxed bg-blue-50/20 dark:bg-blue-950/10 py-2 pr-3 rounded-r-xl">
            {formatInline(quoteText)}
          </blockquote>
        );
        i++;
        continue;
      }

      // 9. Bullet list * or - or <li>
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('<li>')) {
        const bulletText = trimmed.replace(/^[*\-]\s+/, '').replace(/<\/?li[^>]*>/gi, '');
        elements.push(
          <li key={`li-${i}`} className="ml-5 list-disc text-sm sm:text-base text-slate-700 dark:text-slate-300 my-1.5 leading-relaxed">
            {formatInline(bulletText)}
          </li>
        );
        i++;
        continue;
      }

      // 10. Numbered list 1. 2.
      if (/^\d+\.\s+/.test(trimmed)) {
        const numText = trimmed.replace(/^\d+\.\s+/, '');
        elements.push(
          <li key={`ol-${i}`} className="ml-5 list-decimal text-sm sm:text-base text-slate-700 dark:text-slate-300 my-1.5 leading-relaxed">
            {formatInline(numText)}
          </li>
        );
        i++;
        continue;
      }

      // 11. Standard Paragraph or HTML <p>
      if (trimmed.length > 0) {
        // Strip outer <p> tag if exists
        const cleanP = trimmed.replace(/^<p[^>]*>/i, '').replace(/<\/p>$/i, '');
        elements.push(
          <p key={`p-${i}`} className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed my-3 font-normal">
            {formatInline(cleanP)}
          </p>
        );
      } else {
        elements.push(<div key={`sp-${i}`} className="h-2" />);
      }

      i++;
    }

    return elements;
  }, [content]);

  // Read Time Calculation
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 220));

  return (
    <div className="flex flex-col items-center w-full overflow-x-auto pb-12">
      {/* ─── KANVAS DOKUMEN GOOGLE DOCS A4 SHEET ─── */}
      <div
        style={{
          zoom: `${zoom}%`,
          transformOrigin: 'top center',
          transition: 'zoom 0.2s ease-in-out',
        }}
        className={cn(
          "w-full min-h-[1100px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl p-6 sm:p-12 md:p-16 transition-all duration-300 relative theme-transition a4-document-paper",
          isWide ? "max-w-5xl xl:max-w-6xl" : "max-w-4xl xl:max-w-5xl"
        )}
      >
        {/* HEADER DOKUMEN RESMI PARLEMEN */}
        <div className="pb-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {isSaving ? 'Menyimpan naskah...' : 'Naskah Tersimpan Otomatis'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {readTimeMin} menit baca
              </span>
              <span>•</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {wordCount} kata
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
              <User className="h-3.5 w-3.5 text-blue-600" /> {authorName} ({partyName})
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-extrabold uppercase text-[10px]">
              Gaya: {cfg.name}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px]">
              Pratinjau Dokumen (A4)
            </span>
          </div>
        </div>

        {/* ─── KONTEN WYSIWYG RENDERED (BEBAS SIMBOL KODING) ─── */}
        <div className="pt-6 font-serif-editorial">
          {renderedElements}
        </div>
      </div>
    </div>
  );
}
