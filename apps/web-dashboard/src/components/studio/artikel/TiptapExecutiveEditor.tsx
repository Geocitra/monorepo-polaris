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
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
  Camera,
  Table as TableIcon,
  BarChart3,
  TrendingUp,
  Plus,
  Trash2,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowLeft,
  Combine,
  Split,
  Clock,
  User,
  Calendar,
  ChevronRight,
  Columns,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { InsertImageModal } from './InsertImageModal';
import { InsertMetricModal } from './InsertMetricModal';
import { InsertChartModal } from './InsertChartModal';

interface TiptapExecutiveEditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
  selectedStyle?: WritingStyle;
  authorName?: string;
  partyName?: string;
  isSaving?: boolean;
  isWide?: boolean;
  zoom?: number;
  onEditorReady?: (editor: Editor) => void;
  editable?: boolean;
  compactMode?: boolean;
  aiPosterUrl?: string | null;
  stickyOffset?: 'dashboard' | 'standalone' | 'modal';
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
  let consecutiveEmptyLines = 0;

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
    const isTableLine = trimmed.startsWith('|') || (trimmed.endsWith('|') && trimmed.includes('|'));
    if (isTableLine) {
      if (trimmed.includes('---') || /^\|?[\s\-:|]+\|?$/.test(trimmed)) {
        continue; // delimiter row
      }
      let inner = trimmed;
      if (inner.startsWith('|')) inner = inner.slice(1);
      if (inner.endsWith('|')) inner = inner.slice(0, -1);
      const cells = inner
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

    // Inline Visual Slot Marker: <!-- VISUAL_SLOT: ... -->
    const visualSlotMatch = trimmed.match(/<!--\s*VISUAL_SLOT:\s*({[\s\S]*?})\s*-->/);
    if (visualSlotMatch) {
      try {
        const slotData = JSON.parse(visualSlotMatch[1]);
        const caption = slotData.caption || 'Ilustrasi / Foto Liputan Terkait';
        const prompt = slotData.prompt || caption;
        htmlParts.push(`
          <blockquote style="border: 2px dashed #3B82F6; background: #EFF6FF; padding: 16px 20px; border-radius: 12px; margin: 1.75em 0; text-align: center;">
            <p style="font-weight: 800; color: #1D4ED8; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">🖼️ REKOMENDASI SLOT VISUAL ARTIKEL</p>
            <p style="font-size: 0.95em; color: #1E293B; font-weight: 600; margin-bottom: 4px;">"${caption}"</p>
            <p style="font-size: 0.8em; color: #64748B; font-style: italic; margin-bottom: 0;">Arahan Visual: ${prompt}</p>
          </blockquote>
        `);
      } catch {}
      continue;
    }

    // Markdown Images: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const altText = imgMatch[1];
      const imgSrc = imgMatch[2];
      const captionHtml = altText
        ? `<figcaption style="font-size: 0.85em; color: #64748B; font-style: italic; margin-top: 6px; text-align: center;">📷 ${altText}</figcaption>`
        : '';
      htmlParts.push(`
        <figure class="article-image-block" data-size="full" data-align="center" style="margin: 1.75em auto; text-align: center; max-width: 100%;">
          <img src="${imgSrc}" alt="${altText}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: block; margin: 0 auto;" />
          ${captionHtml}
        </figure>
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
      consecutiveEmptyLines = 0;
    } else {
      consecutiveEmptyLines++;
      // Jangan suntikkan <p><br></p> untuk 1 baris kosong pemisah paragraf standar
      // Hanya suntikkan jika ada 2 atau lebih baris kosong berturut-turut (spacer intensional)
      if (consecutiveEmptyLines > 1) {
        htmlParts.push('<p><br></p>');
      }
    }
  }

  if (inTable) htmlParts.push('</tbody></table>');
  if (inList) htmlParts.push('</ul>');

  return htmlParts.join('');
}

export function TiptapExecutiveEditor({
  content,
  onContentChange,
  selectedStyle = 'SOLUTIF',
  authorName = 'Anggota Dewan',
  partyName = 'Parlemen',
  isSaving,
  isWide = true,
  zoom = 100,
  onEditorReady,
  editable = true,
  compactMode = false,
  aiPosterUrl,
  stickyOffset = 'dashboard',
}: TiptapExecutiveEditorProps) {
  const cfg = WRITING_STYLES[selectedStyle] || WRITING_STYLES.SOLUTIF;
  const [wordCount, setWordCount] = useState(0);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom || 100);
  const [currentIsWide, setCurrentIsWide] = useState<boolean>(isWide);

  useEffect(() => {
    if (zoom) setCurrentZoom(zoom);
  }, [zoom]);

  useEffect(() => {
    setCurrentIsWide(isWide);
  }, [isWide]);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isInsideTable, setIsInsideTable] = useState(false);

  // Microsoft Word-Style Context Menu Popup State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    canMerge: boolean;
    canSplit: boolean;
  }>({
    visible: false,
    x: 0,
    y: 0,
    canMerge: false,
    canSplit: false,
  });
  const [activeSubmenu, setActiveSubmenu] = useState<'insert' | 'delete' | null>(null);

  useEffect(() => {
    if (!contextMenu.visible) return;

    const handleClickOutside = (e: MouseEvent) => {
      const menuEl = document.getElementById('table-context-menu-popup');
      if (menuEl && !menuEl.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
        setActiveSubmenu(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu((prev) => ({ ...prev, visible: false }));
        setActiveSubmenu(null);
      }
    };

    const handleScroll = () => {
      setContextMenu((prev) => ({ ...prev, visible: false }));
      setActiveSubmenu(null);
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [contextMenu.visible]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!editable || !editor) return;

    const target = e.target as HTMLElement | null;
    const cell = target?.closest('td, th');
    if (cell) {
      e.preventDefault();

      // Ensure cursor selection moves to the clicked cell
      try {
        const coords = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
        if (coords) {
          editor.chain().focus().setTextSelection(coords.pos).run();
        }
      } catch (err) {
        // Fallback
      }

      const canMerge = editor.can().mergeCells();
      const canSplit = editor.can().splitCell();

      // Clamp context menu inside window bounds
      const menuWidth = 230;
      const menuHeight = 320;
      const x = Math.min(e.clientX, window.innerWidth - menuWidth - 16);
      const y = Math.min(e.clientY, window.innerHeight - menuHeight - 16);

      setContextMenu({
        visible: true,
        x: Math.max(12, x),
        y: Math.max(12, y),
        canMerge,
        canSplit,
      });
      setActiveSubmenu(null);
    }
  };

  const effectiveStickyClass =
    stickyOffset === 'modal'
      ? 'top-0'
      : stickyOffset === 'standalone' || compactMode
      ? 'top-16'
      : 'top-[112px]';

  const initialHtml = useMemo(() => {
    return markdownToHtml(content);
  }, []); // Run once on mount

  const editor = useEditor({
    immediatelyRender: false,
    editable: editable,
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
        class: cn(
          'focus:outline-none max-w-none text-slate-800 dark:text-slate-100 font-sans',
          !editable && 'cursor-default select-text'
        ),
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const inTable = Boolean(
        editor.isActive('table') ||
        editor.isActive('tableCell') ||
        editor.isActive('tableHeader') ||
        editor.can().deleteTable() ||
        editor.can().addRowAfter()
      );
      setIsInsideTable(inTable);
    },
    onTransaction: ({ editor }) => {
      const inTable = Boolean(
        editor.isActive('table') ||
        editor.isActive('tableCell') ||
        editor.isActive('tableHeader') ||
        editor.can().deleteTable() ||
        editor.can().addRowAfter()
      );
      setIsInsideTable(inTable);
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
      onContentChange(html);
    },
  });

  // Sync editable prop
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  // Notify parent of editor ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
      const text = editor.getText();
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    }
  }, [editor, onEditorReady]);

  // Synchronize when external content changes
  useEffect(() => {
    if (editor && content) {
      const currentHtml = editor.getHTML();
      const nextHtml = content.startsWith('<') ? content : markdownToHtml(content);
      if (currentHtml !== nextHtml && !editor.isFocused) {
        editor.commands.setContent(nextHtml, { emitUpdate: false });
        const text = editor.getText();
        setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
      }
    }
  }, [content, editor]);

  const readTimeMin = Math.max(1, Math.ceil(wordCount / 220));

  function handleInsertTable() {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }

  function handleInsertChart() {
    if (!editor) return;
    const sampleChart = {
      type: 'bar',
      title: 'Evaluasi Alokasi & Capaian Kebijakan',
      unit: 'Persen (%)',
      labels: ['Kuartal I', 'Kuartal II', 'Kuartal III', 'Kuartal IV'],
      datasets: [
        { label: 'Target', data: [70, 80, 90, 100] },
        { label: 'Realisasi Lapangan', data: [68, 79, 92, 97] },
      ],
    };
    const chartUrl = chartBlockToQuickChartUrl(sampleChart);
    editor
      .chain()
      .focus()
      .insertContent(`
        <p style="text-align: center; margin: 1.5em 0;">
          <img src="${chartUrl}" alt="Grafik Kebijakan Daerah" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;" />
        </p>
      `)
      .run();
  }

  function handleInsertMetric() {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent(`
        <blockquote style="border-left: 4px solid #2563EB; background: #F8FAFC; padding: 12px 18px; border-radius: 8px; margin: 1.5em 0;">
          <p><strong>📊 Indikator Utama Kebijakan: 87,4% Target Tercapai</strong></p>
          <p style="font-size: 0.9em; color: #475569; margin-top: 4px;">Evaluasi serapan anggaran dan realisasi program di dapil.</p>
        </blockquote>
      `)
      .run();
  }

  return (
    <div className="flex flex-col items-center w-full pb-8">
      {/* ─── DOCKED STICKY TOOLBAR & TABLE RIBBON (UNIFIED DOCKING ON SCROLL) ─── */}
      {editable && (
        <div
          style={{
            top:
              stickyOffset === 'modal'
                ? '0px'
                : stickyOffset === 'standalone' || compactMode
                ? '4rem'
                : '7rem',
          }}
          className={cn(
            'w-full sticky z-20 mb-3 space-y-2 pointer-events-none',
            currentIsWide ? 'max-w-5xl xl:max-w-6xl' : 'max-w-4xl xl:max-w-5xl'
          )}
        >
          {/* TOOLBAR UTAMA STANDAR TERPADU (SEPERTI GOOGLE DOCS / MICROSOFT WORD) */}
          <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-2 flex items-center justify-between gap-1.5 flex-wrap select-none transition-all pointer-events-auto">
            {/* GRUP FORMAT TEKS */}
            <div className="flex items-center gap-1 flex-wrap">
              {/* UNDO / REDO */}
              <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().undo().run()}
                  disabled={!editor?.can().undo()}
                  title="Batalkan Perubahan (Ctrl+Z)"
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Undo className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={!editor?.can().redo()}
                  title="Ulangi Perubahan (Ctrl+Y)"
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Redo className="h-4 w-4" />
                </button>
              </div>

              {/* HEADING / TIPE TEKS */}
              <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().setParagraph().run()}
                  title="Teks Normal (Paragraf)"
                  className={cn(
                    'px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                    editor?.isActive('paragraph') && !editor?.isActive('heading')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  title="Judul Utama (H1)"
                  className={cn(
                    'px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                    editor?.isActive('heading', { level: 1 })
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  title="Sub-Judul (H2)"
                  className={cn(
                    'px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                    editor?.isActive('heading', { level: 2 })
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  title="Bagian (H3)"
                  className={cn(
                    'px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                    editor?.isActive('heading', { level: 3 })
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  H3
                </button>
              </div>

              {/* BOLD, ITALIC, UNDERLINE, STRIKE */}
              <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  title="Tebal (Ctrl+B)"
                  className={cn(
                    'p-1.5 rounded-lg transition-colors cursor-pointer',
                    editor?.isActive('bold')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  title="Miring (Ctrl+I)"
                  className={cn(
                    'p-1.5 rounded-lg transition-colors cursor-pointer',
                    editor?.isActive('italic')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  title="Garis Bawah (Ctrl+U)"
                  className={cn(
                    'p-1.5 rounded-lg transition-colors cursor-pointer',
                    editor?.isActive('underline')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <UnderlineIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  title="Coret Teks (Strikethrough)"
                  className={cn(
                    'p-1.5 rounded-lg transition-colors cursor-pointer',
                    editor?.isActive('strike')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Strikethrough className="h-4 w-4" />
                </button>
              </div>

              {/* LISTS & QUOTE */}
              <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  title="Daftar Poin (Bullet List)"
                  className={cn(
                    'p-1.5 rounded-lg transition-colors cursor-pointer',
                    editor?.isActive('bulletList')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  title="Daftar Nomor (Numbered List)"
                  className={cn(
                    'p-1.5 rounded-lg transition-colors cursor-pointer',
                    editor?.isActive('orderedList')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  title="Kutipan (Quote)"
                  className={cn(
                    'p-1.5 rounded-lg transition-colors cursor-pointer',
                    editor?.isActive('blockquote')
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Quote className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                  title="Garis Pemisah (Divider)"
                  className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* GRUP SISIPKAN ELEMEN (FOTO, TABEL, GRAFIK, METRIK) */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-slate-400 pl-1 hidden sm:inline">
                Sisipkan:
              </span>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Sisipkan Foto Lapangan dengan Caption dan Pengaturan Ukuran/Posisi"
              >
                <Camera className="h-3.5 w-3.5 text-emerald-600" />
                <span>Foto</span>
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer',
                  isInsideTable
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700'
                )}
                title={isInsideTable ? 'Tabel Sedang Aktif' : 'Sisipkan Tabel Baru 3x3'}
              >
                <TableIcon className="h-3.5 w-3.5 text-blue-600" />
                <span>{isInsideTable ? 'Tabel Aktif' : 'Tabel'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsChartModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Buat & Sisipkan Grafik Batang/Garis/Lingkaran"
              >
                <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
                <span>Grafik</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMetricModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Sisipkan Kartu Angka / KPI Utama"
              >
                <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
                <span>Metrik</span>
              </button>

              {/* PEMISAH */}
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-0.5" />

              {/* GRUP ZOOM & SKALA KANVAS DOKUMEN (ALA GOOGLE DOCS / WORD) */}
              <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCurrentZoom((prev) => Math.max(50, prev - 10))}
                  disabled={currentZoom <= 50}
                  className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
                  title="Perkecil Tampilan Kertas (Zoom Out 10%)"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>

                <select
                  value={currentZoom}
                  onChange={(e) => setCurrentZoom(Number(e.target.value))}
                  title="Tingkat Pembesaran Lembar Dokumen (Zoom)"
                  className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer px-1 py-0.5 rounded"
                >
                  <option value={50}>50%</option>
                  <option value={75}>75%</option>
                  <option value={90}>90%</option>
                  <option value={100}>100%</option>
                  <option value={110}>110%</option>
                  <option value={125}>125%</option>
                  <option value={150}>150%</option>
                  <option value={175}>175%</option>
                  <option value={200}>200%</option>
                </select>

                <button
                  type="button"
                  onClick={() => setCurrentZoom((prev) => Math.min(200, prev + 10))}
                  disabled={currentZoom >= 200}
                  className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
                  title="Perbesar Tampilan Kertas (Zoom In 10%)"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentIsWide((prev) => !prev)}
                  className={cn(
                    'p-1 ml-0.5 rounded-lg transition-colors cursor-pointer border border-transparent',
                    currentIsWide
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                  )}
                  title={currentIsWide ? 'Ganti ke Lebar Lembar Standar A4' : 'Ganti ke Lebar Lembar Penuh (Wide Sheet)'}
                >
                  {currentIsWide ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* ─── DOCKED TABLE CONTEXT RIBBON (MICROSOFT WORD "TABLE TOOLS > LAYOUT" STYLE) ─── */}
          {isInsideTable && (
            <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-lg px-3.5 py-2 flex items-center justify-between gap-2.5 text-xs flex-wrap animate-in fade-in slide-in-from-top-1 duration-150 select-none transition-all pointer-events-auto">
              <div className="flex items-center gap-2 flex-wrap">
                {/* BADGE TAB TABLE TOOLS ALA WORD */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 rounded-xl text-blue-700 dark:text-blue-300 font-extrabold text-[11px] shrink-0">
                  <TableIcon className="h-3.5 w-3.5 text-blue-600" />
                  <span>Tabel: Tata Letak</span>
                </div>

                {/* PANEL 1: BARIS & KOLOM (ROWS & COLUMNS) */}
                <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="px-1.5 text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">
                    Baris & Kolom:
                  </div>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().addRowBefore().run()}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Sisipkan Baris di Atas (Word: Insert Rows Above)"
                  >
                    <ArrowUp className="h-3 w-3 text-emerald-600" />
                    <span>+ Atas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().addRowAfter().run()}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Sisipkan Baris di Bawah (Word: Insert Rows Below)"
                  >
                    <ArrowDown className="h-3 w-3 text-emerald-600" />
                    <span>+ Bawah</span>
                  </button>
                  <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().addColumnBefore().run()}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Sisipkan Kolom di Kiri (Word: Insert Columns to the Left)"
                  >
                    <ArrowLeft className="h-3 w-3 text-blue-600" />
                    <span>+ Kiri</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().addColumnAfter().run()}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Sisipkan Kolom di Kanan (Word: Insert Columns to the Right)"
                  >
                    <ArrowRight className="h-3 w-3 text-blue-600" />
                    <span>+ Kanan</span>
                  </button>
                </div>

                {/* PANEL 2: GABUNG & PISAH SEL (MERGE & SPLIT) */}
                <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="px-1.5 text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">
                    Sel:
                  </div>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().mergeCells().run()}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Gabungkan Sel yang Diblok (Word: Merge Cells)"
                  >
                    <Combine className="h-3 w-3 text-amber-500" />
                    <span>Gabung</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().splitCell().run()}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Pisahkan Sel (Word: Split Cells)"
                  >
                    <Split className="h-3 w-3 text-amber-500" />
                    <span>Pisah</span>
                  </button>
                </div>

                {/* PANEL 3: HEADER BARIS / KOLOM */}
                <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeaderRow().run()}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Jadikan baris paling atas sebagai baris judul (Header Row)"
                  >
                    <span>Baris Judul</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleHeaderColumn().run()}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Jadikan kolom pertama sebagai kolom judul (Header Column)"
                  >
                    <span>Kolom Judul</span>
                  </button>
                </div>

                {/* PANEL 4: HAPUS (DELETE GROUP) */}
                <div className="flex items-center gap-0.5 bg-rose-50/70 dark:bg-rose-950/30 p-0.5 rounded-xl border border-rose-200/70 dark:border-rose-900/50">
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().deleteRow().run()}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-700 dark:text-rose-300 hover:bg-white dark:hover:bg-slate-900 transition-colors cursor-pointer"
                    title="Hapus baris saat ini (Word: Delete Rows)"
                  >
                    Hapus Baris
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().deleteColumn().run()}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-700 dark:text-rose-300 hover:bg-white dark:hover:bg-slate-900 transition-colors cursor-pointer"
                    title="Hapus kolom saat ini (Word: Delete Columns)"
                  >
                    Hapus Kolom
                  </button>
                  <button
                    type="button"
                    onClick={() => editor?.chain().focus().deleteTable().run()}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Hapus seluruh tabel (Word: Delete Table)"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Hapus Tabel</span>
                  </button>
                </div>
              </div>

              {/* RIGHT: SHORTCUT / BEST-PRACTICE TIPS */}
              <div className="flex items-center gap-2">
                <span className="hidden xl:inline text-[10.5px] text-slate-400 italic">
                  💡 Klik kanan di sel mana saja untuk Menu Cepat ala Word
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── KANVAS DOKUMEN GOOGLE DOCS A4 SHEET (TRUE WYSIWYG) ─── */}
      <div
        style={{
          zoom: `${currentZoom}%`,
          transformOrigin: 'top center',
          transition: 'all 0.2s ease-in-out',
        }}
        className={cn(
          'w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl transition-all duration-300 relative theme-transition a4-document-paper',
          compactMode ? 'min-h-[420px] p-5 sm:p-8' : 'min-h-[1100px] p-6 sm:p-12 md:p-16',
          currentIsWide ? 'max-w-5xl xl:max-w-6xl' : 'max-w-4xl xl:max-w-5xl'
        )}
      >
        {/* HEADER DOKUMEN RESMI PARLEMEN */}
        <div className="pb-5 mb-6 border-b border-slate-100 dark:border-slate-800 space-y-3 select-none">
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
              {editable ? 'Mode Sunting Langsung' : 'Pratinjau Resmi'}
            </span>
          </div>
        </div>

        {/* TIPTAP TRUE WYSIWYG EDITOR CONTENT */}
        <div className="tiptap-editor-wrapper" onContextMenu={handleContextMenu}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* ─── POPUP CONTEXT MENU KLIK-KANAN TABEL (MICROSOFT WORD STYLE) ─── */}
      {contextMenu.visible && editable && editor && (
        <div
          id="table-context-menu-popup"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          className="fixed z-50 min-w-[215px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 text-xs text-slate-800 dark:text-slate-100 select-none animate-in fade-in zoom-in-95 duration-100"
        >
          {/* MINI QUICK BAR ALA WORD 365 */}
          <div className="flex items-center justify-around gap-1 px-1 py-1 mb-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().addRowBefore().run();
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
              title="Sisipkan Baris ke Atas"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().addRowAfter().run();
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
              title="Sisipkan Baris ke Bawah"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowDown className="h-3.5 w-3.5 text-emerald-600" />
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().addColumnBefore().run();
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
              title="Sisipkan Kolom ke Kiri"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-blue-600" />
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().addColumnAfter().run();
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
              title="Sisipkan Kolom ke Kanan"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().deleteRow().run();
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
              title="Hapus Baris Ini"
              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {/* 1. SISIPKAN (INSERT >) */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('insert')}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu((curr) => (curr === 'insert' ? null : 'insert'))}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium text-[11px] transition-colors cursor-pointer',
                  activeSubmenu === 'insert'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-3.5 w-3.5 text-blue-600" />
                  <span>Sisipkan (Insert)</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* SUBMENU SISIPKAN (WORD STYLE FLYOUT) */}
              {activeSubmenu === 'insert' && (
                <div
                  className={cn(
                    'absolute top-0 w-[205px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 z-50',
                    contextMenu.x + 215 + 205 > (typeof window !== 'undefined' ? window.innerWidth : 1200)
                      ? 'right-full mr-1'
                      : 'left-full ml-1'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addColumnBefore().run();
                      setContextMenu((p) => ({ ...p, visible: false }));
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3 text-blue-600" />
                    <span>Kolom ke Kiri</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addColumnAfter().run();
                      setContextMenu((p) => ({ ...p, visible: false }));
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="h-3 w-3 text-blue-600" />
                    <span>Kolom ke Kanan</span>
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addRowBefore().run();
                      setContextMenu((p) => ({ ...p, visible: false }));
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ArrowUp className="h-3 w-3 text-emerald-600" />
                    <span>Baris ke Atas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addRowAfter().run();
                      setContextMenu((p) => ({ ...p, visible: false }));
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ArrowDown className="h-3 w-3 text-emerald-600" />
                    <span>Baris ke Bawah</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. HAPUS (DELETE >) */}
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('delete')}
            >
              <button
                type="button"
                onClick={() => setActiveSubmenu((curr) => (curr === 'delete' ? null : 'delete'))}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium text-[11px] transition-colors cursor-pointer',
                  activeSubmenu === 'delete'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                    : 'hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600'
                )}
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus (Delete)</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-rose-400" />
              </button>

              {/* SUBMENU HAPUS */}
              {activeSubmenu === 'delete' && (
                <div
                  className={cn(
                    'absolute top-0 w-[190px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 z-50',
                    contextMenu.x + 215 + 190 > (typeof window !== 'undefined' ? window.innerWidth : 1200)
                      ? 'right-full mr-1'
                      : 'left-full ml-1'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteRow().run();
                      setContextMenu((p) => ({ ...p, visible: false }));
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <span>Hapus Baris Ini</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteColumn().run();
                      setContextMenu((p) => ({ ...p, visible: false }));
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <span>Hapus Kolom Ini</span>
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteTable().run();
                      setContextMenu((p) => ({ ...p, visible: false }));
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Hapus Seluruh Tabel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

            {/* 3. GABUNGKAN SEL (MERGE) */}
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().mergeCells().run();
                setContextMenu((p) => ({ ...p, visible: false }));
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Combine className="h-3.5 w-3.5 text-amber-500" />
              <span>Gabungkan Sel (Merge)</span>
            </button>

            {/* 4. PISAHKAN SEL (SPLIT) */}
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().splitCell().run();
                setContextMenu((p) => ({ ...p, visible: false }));
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Split className="h-3.5 w-3.5 text-amber-500" />
              <span>Pisahkan Sel (Split)</span>
            </button>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

            {/* 5. TOGGLE BARIS & KOLOM HEADER */}
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeaderRow().run();
                setContextMenu((p) => ({ ...p, visible: false }));
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <TableIcon className="h-3.5 w-3.5 text-blue-500" />
              <span>Toggle Baris Judul</span>
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeaderColumn().run();
                setContextMenu((p) => ({ ...p, visible: false }));
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Columns className="h-3.5 w-3.5 text-indigo-500" />
              <span>Toggle Kolom Judul</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL SISIPKAN FOTO DENGAN KOMPRESI OTOMATIS */}
      <InsertImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        editor={editor}
        aiPosterUrl={aiPosterUrl}
      />

      {/* MODAL INPUT METRIK ANGKA & GARIS TREN */}
      <InsertMetricModal
        isOpen={isMetricModalOpen}
        onClose={() => setIsMetricModalOpen(false)}
        editor={editor}
      />

      {/* MODAL INPUT DATA & GRAFIK KEBIJAKAN */}
      <InsertChartModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        editor={editor}
      />
    </div>
  );
}
