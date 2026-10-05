'use client';

import { useEffect, useMemo, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import { Image } from '@tiptap/extension-image';
import { cn } from '@/lib/utils';
import { WritingStyle, WRITING_STYLES } from './WritingStyleSelector';
import { Clock, User, Calendar, Plus, Trash2, ArrowDown, ArrowRight } from 'lucide-react';

interface TiptapExecutiveEditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
  selectedStyle: WritingStyle;
  authorName?: string;
  partyName?: string;
  isSaving?: boolean;
  isWide?: boolean;
  zoom?: number;
  onEditorReady?: (editor: Editor) => void;
}

// Convert a structured chart object into a high-DPI QuickChart.io PNG image URL
export function chartBlockToQuickChartUrl(chartData: {
  type?: string;
  title?: string;
  unit?: string;
  labels?: string[];
  datasets?: { label?: string; data: number[] }[];
}): string {
  const chartType = chartData.type === 'line' ? 'line' : chartData.type === 'pie' ? 'pie' : 'bar';
  const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6'];

  const chartConfig = {
    type: chartType,
    data: {
      labels: chartData.labels || ['Tahun 2024', 'Tahun 2025', 'Tahun 2026'],
      datasets: (chartData.datasets || [{ label: 'Data', data: [40, 60, 80] }]).map((ds, idx) => ({
        label: (ds.label || 'Realisasi') + (chartData.unit ? ` (${chartData.unit})` : ''),
        data: ds.data,
        backgroundColor: chartType === 'pie' ? colors : colors[idx % colors.length],
        borderColor: colors[idx % colors.length],
        borderWidth: 1,
        borderRadius: chartType === 'bar' ? 6 : 0,
      })),
    },
    options: {
      plugins: {
        title: {
          display: !!chartData.title,
          text: chartData.title || 'Grafik Kebijakan Daerah',
          font: { size: 14, weight: 'bold' },
          padding: { top: 8, bottom: 12 },
        },
        legend: {
          display: true,
          position: 'bottom',
        },
      },
      scales: chartType === 'pie' ? undefined : {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    },
  };

  const encoded = encodeURIComponent(JSON.stringify(chartConfig));
  return `https://quickchart.io/chart?bkg=white&w=650&h=350&devicePixelRatio=2&v=3&c=${encoded}`;
}

// Helper to convert Markdown syntax to basic HTML for TipTap initialization
export function markdownToHtml(md: string): string {
  if (!md) return '<p></p>';
  // If already pure HTML without any ::: blocks or markdown tables, return directly
  if (md.trim().startsWith('<') && !md.includes(':::chart') && !md.includes(':::metric') && !md.includes('|')) {
    return md;
  }

  // Pre-clean any <p> wrapping around :::chart or :::metric
  const cleaned = md
    .replace(/<p>\s*:::chart([\s\S]*?):::\s*<\/p>/gi, ':::chart$1:::')
    .replace(/<p>\s*:::metric([\s\S]*?):::\s*<\/p>/gi, ':::metric$1:::');

  const lines = cleaned.split('\n');
  const htmlParts: string[] = [];
  let inTable = false;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Chart Block :::chart ... ::: -> QuickChart.io PNG Image
    if (trimmed.startsWith(':::chart')) {
      let json = '';
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        json += lines[i] + ' ';
        i++;
      }
      try {
        const cleanJson = json.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/<[^>]+>/g, '');
        const parsed = JSON.parse(cleanJson);
        const chartUrl = chartBlockToQuickChartUrl(parsed);
        htmlParts.push(`
          <p style="text-align: center; margin: 1.5em 0;">
            <img src="${chartUrl}" alt="${parsed.title || 'Grafik Kebijakan'}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;" />
          </p>
        `);
      } catch {}
      continue;
    }

    // Metric Block :::metric ... ::: -> Styled KPI card
    if (trimmed.startsWith(':::metric')) {
      let json = '';
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        json += lines[i] + ' ';
        i++;
      }
      try {
        const cleanJson = json.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/<[^>]+>/g, '');
        const parsed = JSON.parse(cleanJson);
        htmlParts.push(`
          <blockquote style="border-left: 4px solid #2563EB; background: #F8FAFC; padding: 12px 18px; border-radius: 8px; margin: 1.5em 0;">
            <p><strong>📊 ${parsed.label || 'Indikator Kebijakan'}: ${parsed.value || ''}</strong></p>
            <p style="font-size: 0.9em; color: #475569; margin-top: 4px;">${parsed.description || ''}</p>
          </blockquote>
        `);
      } catch {}
      continue;
    }

    // Table Row detection (Markdown table -> TipTap compliant <table> schema)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) {
        continue; // delimiter row
      }
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      if (!inTable) {
        htmlParts.push('<table><tbody>');
        inTable = true;
        htmlParts.push(
          `<tr>${cells.map((c) => `<th colspan="1" rowspan="1"><p><strong>${c}</strong></p></th>`).join('')}</tr>`
        );
      } else {
        htmlParts.push(
          `<tr>${cells.map((c) => `<td colspan="1" rowspan="1"><p>${c}</p></td>`).join('')}</tr>`
        );
      }
      continue;
    } else if (inTable) {
      htmlParts.push('</tbody></table>');
      inTable = false;
    }

    // Markdown Images: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      htmlParts.push(`
        <p style="text-align: center; margin: 1.5em 0;">
          <img src="${imgMatch[2]}" alt="${imgMatch[1]}" style="max-width: 100%; height: auto; border-radius: 12px;" />
        </p>
      `);
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      htmlParts.push(`<h1>${trimmed.replace(/^#\s*/, '')}</h1>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      htmlParts.push(`<h2>${trimmed.replace(/^##\s*/, '')}</h2>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      htmlParts.push(`<h3>${trimmed.replace(/^###\s*/, '')}</h3>`);
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      htmlParts.push('<hr>');
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      htmlParts.push(`<blockquote><p>${trimmed.replace(/^>\s*/, '')}</p></blockquote>`);
      continue;
    }

    // Bullet lists
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li><p>${trimmed.replace(/^[*\-]\s*/, '')}</p></li>`);
      continue;
    } else if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }

    if (trimmed.length > 0) {
      // Bold / Italic inline replace
      let parsedLine = trimmed
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      htmlParts.push(`<p>${parsedLine}</p>`);
    } else {
      htmlParts.push('<p><br></p>');
    }
  }

  if (inTable) htmlParts.push('</tbody></table>');
  if (inList) htmlParts.push('</ul>');

  return htmlParts.join('');
}

export function TiptapExecutiveEditor({
  content,
  onContentChange,
  selectedStyle,
  authorName = 'Anggota Dewan',
  partyName = 'Parlemen',
  isSaving,
  isWide = true,
  zoom = 100,
  onEditorReady,
}: TiptapExecutiveEditorProps) {
  const cfg = WRITING_STYLES[selectedStyle];
  const [wordCount, setWordCount] = useState(0);

  const initialHtml = useMemo(() => {
    return markdownToHtml(content);
  }, []); // Run once on mount

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      FontSize,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: 'focus:outline-none max-w-none text-slate-800 dark:text-slate-100 font-sans',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
      onContentChange(html);
    },
  });

  // Notify parent of editor ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
      const text = editor.getText();
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    }
  }, [editor, onEditorReady]);

  // Synchronize when external content changes (e.g. AI Refine, Version Restore, Undo/Redo)
  useEffect(() => {
    if (editor && content) {
      const currentHtml = editor.getHTML();
      const nextHtml = content.startsWith('<') ? content : markdownToHtml(content);
      // Only set content if it differs and editor is not actively being typed in by the user
      if (currentHtml !== nextHtml && !editor.isFocused) {
        editor.commands.setContent(nextHtml, { emitUpdate: false });
        const text = editor.getText();
        setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
      }
    }
  }, [content, editor]);

  const readTimeMin = Math.max(1, Math.ceil(wordCount / 220));

  return (
    <div className="flex flex-col items-center w-full overflow-x-auto pb-12">
      {/* ─── KANVAS DOKUMEN GOOGLE DOCS A4 SHEET (TRUE WYSIWYG) ─── */}
      <div
        style={{
          zoom: `${zoom}%`,
          transformOrigin: 'top center',
          transition: 'zoom 0.2s ease-in-out',
        }}
        className={cn(
          'w-full min-h-[1100px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl p-6 sm:p-12 md:p-16 transition-all duration-300 relative theme-transition a4-document-paper',
          isWide ? 'max-w-5xl xl:max-w-6xl' : 'max-w-4xl xl:max-w-5xl'
        )}
      >
        {/* HEADER DOKUMEN RESMI PARLEMEN */}
        <div className="pb-6 mb-8 border-b border-slate-100 dark:border-slate-800 space-y-3 select-none">
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
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold text-[10px]">
              Mode Sunting Naskah Langsung
            </span>
          </div>
        </div>

        {/* FLOATING QUICK TABLE CONTROLS (WHEN CURSOR IS INSIDE TABLE) */}
        {editor && editor.isActive('table') && (
          <div className="sticky top-28 z-20 mb-4 p-2 bg-slate-900/90 dark:bg-slate-800/95 text-white backdrop-blur-md rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs flex-wrap animate-in fade-in duration-150">
            <span className="text-[10px] uppercase font-bold text-blue-400 px-2">Tabel Aktif:</span>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 font-semibold"
            >
              <ArrowDown className="h-3 w-3" />
              <span>Baris</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 font-semibold"
            >
              <ArrowRight className="h-3 w-3" />
              <span>Kolom</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-2 py-1 bg-slate-800 hover:bg-red-950/80 hover:text-red-400 rounded-lg"
              title="Hapus Baris"
            >
              Hapus Baris
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="px-2 py-1 bg-slate-800 hover:bg-red-950/80 hover:text-red-400 rounded-lg"
              title="Hapus Kolom"
            >
              Hapus Kolom
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="px-2.5 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg flex items-center gap-1 ml-auto font-bold"
            >
              <Trash2 className="h-3 w-3" />
              <span>Hapus Tabel</span>
            </button>
          </div>
        )}

        {/* TIPTAP TRUE WYSIWYG EDITOR CONTENT */}
        <div className="tiptap-editor-wrapper">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
