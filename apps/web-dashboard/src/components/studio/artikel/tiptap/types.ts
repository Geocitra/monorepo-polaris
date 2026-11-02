import { Editor } from '@tiptap/react';
import { WritingStyle } from '../WritingStyleSelector';

export interface TiptapExecutiveEditorProps {
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

export interface TableContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  canMerge: boolean;
  canSplit: boolean;
}

