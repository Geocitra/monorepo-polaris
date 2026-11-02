'use client';

import { useEffect, useMemo, useState } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import { Image } from '@tiptap/extension-image';
import { cn } from '@/lib/utils';
import { WRITING_STYLES } from './WritingStyleSelector';
import { InsertImageModal } from './InsertImageModal';
import { InsertMetricModal } from './InsertMetricModal';
import { InsertChartModal } from './InsertChartModal';
import {
  TiptapExecutiveEditorProps,
  TableContextMenuState,
  chartBlockToQuickChartUrl,
  markdownToHtml,
  TiptapToolbar,
  TiptapTableRibbon,
  TiptapTableContextMenu,
  TiptapDocumentPaper,
} from './tiptap';

export { chartBlockToQuickChartUrl, markdownToHtml };
export type { TiptapExecutiveEditorProps };

export function TiptapExecutiveEditor({
  content,
  onContentChange,
  selectedStyle = 'SOLUTIF',
  authorName = 'Anggota Dewan',
  partyName = 'Fraksi Parlemen',
  isSaving = false,
  editable = true,
  stickyOffset = 'dashboard',
  compactMode = false,
  aiPosterUrl,
  onEditorReady,
  zoom = 100,
  isWide = false,
}: TiptapExecutiveEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [isInsideTable, setIsInsideTable] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [currentIsWide, setCurrentIsWide] = useState(isWide);

  // Sync internal zoom & isWide when props change
  useEffect(() => {
    setCurrentZoom(zoom);
  }, [zoom]);

  useEffect(() => {
    setCurrentIsWide(isWide);
  }, [isWide]);

    const [contextMenu, setContextMenu] = useState<TableContextMenuState>({
      visible: false,
      x: 0,
      y: 0,
      canMerge: false,
      canSplit: false,
    });

    const [activeSubmenu, setActiveSubmenu] = useState<'insert' | 'delete' | null>(null);

    const cfg = WRITING_STYLES[selectedStyle] || WRITING_STYLES.SOLUTIF;

    // Listeners to dismiss right-click menu on click outside or escape
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

      try {
        const coords = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
        if (coords) {
          editor.chain().focus().setTextSelection(coords.pos).run();
        }
      } catch {
        // Fallback
      }

      const canMerge = editor.can().mergeCells();
      const canSplit = editor.can().splitCell();

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
      onSelectionUpdate: ({ editor: ed }) => {
        const inTable = Boolean(
        ed.isActive('table') ||
          ed.isActive('tableCell') ||
          ed.isActive('tableHeader') ||
          ed.can().deleteTable() ||
          ed.can().addRowAfter()
        );
        setIsInsideTable(inTable);
      },
          onTransaction: ({ editor: ed }) => {
            const inTable = Boolean(
        ed.isActive('table') ||
              ed.isActive('tableCell') ||
              ed.isActive('tableHeader') ||
              ed.can().deleteTable() ||
              ed.can().addRowAfter()
            );
            setIsInsideTable(inTable);
          },
              onUpdate: ({ editor: ed }) => {
                const html = ed.getHTML();
                const text = ed.getText();
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
              <TiptapToolbar
                editor={editor}
                isInsideTable={isInsideTable}
                onOpenImageModal={() => setIsImageModalOpen(true)}
                onOpenMetricModal={() => setIsMetricModalOpen(true)}
                onOpenChartModal={() => setIsChartModalOpen(true)}
                onInsertTable={handleInsertTable}
                currentZoom={currentZoom}
                setCurrentZoom={setCurrentZoom}
                currentIsWide={currentIsWide}
                setCurrentIsWide={setCurrentIsWide}
              />

          <TiptapTableRibbon
            editor={editor}
            isInsideTable={isInsideTable}
          />
        </div>
      )}

      {/* ─── KANVAS DOKUMEN GOOGLE DOCS A4 SHEET (TRUE WYSIWYG) ─── */}
          <TiptapDocumentPaper
            editor={editor}
            currentZoom={currentZoom}
            currentIsWide={currentIsWide}
            compactMode={compactMode}
            isSaving={isSaving}
            wordCount={wordCount}
            readTimeMin={readTimeMin}
            authorName={authorName}
            partyName={partyName}
            writingStyleName={cfg.name}
            editable={editable}
            handleContextMenu={handleContextMenu}
          />

      {/* ─── POPUP CONTEXT MENU KLIK-KANAN TABEL (MICROSOFT WORD STYLE) ─── */}
          <TiptapTableContextMenu
            editor={editor}
            editable={editable}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            activeSubmenu={activeSubmenu}
            setActiveSubmenu={setActiveSubmenu}
          />

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
