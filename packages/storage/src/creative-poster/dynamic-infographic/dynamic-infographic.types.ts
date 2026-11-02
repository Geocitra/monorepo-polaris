export interface DynamicInfographicSection {
  id: string;
  phaseTag: string; // e.g. "ERA AWAL", "REGULASI", "MOBILISASI"
  periodLabel?: string; // e.g. "2015-2017"
  title: string;
  bullets: string[];
  visualPrompt?: string;
  badgeColor?: string;
  sectorBg?: string;
}

export interface DynamicInfographicContent {
  mainTitle: string;
  subtitle: string;
  categoryTag?: string;
  sections: DynamicInfographicSection[];
  memberName?: string;
  memberTitle?: string;
  memberAvatarBuffer?: Buffer;
}

export interface DynamicInfographicLayoutSpec {
  styleName: string;
  canvas: {
    backgroundColor: string;
    borderColor?: string;
    borderWidth?: number;
  };
  leftRibbon?: {
    x: number;
    y: number;
    w: number;
    h: number;
    titleLetters: string[];
    fontSize: number;
    color: string;
    hasOpenBookIcon?: boolean;
  };
  motif?: {
    type: 'clock' | 'circle' | 'emblem' | 'none';
    x: number;
    y: number;
    size: number;
    borderRadius?: number;
    sectorsCount?: number;
  };
  wedges?: Array<{
    points: string;
    fill: string;
    opacity: number;
  }>;
  dividerLines?: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke: string;
    strokeWidth: number;
  }>;
  sections: Array<{
    id: string;
    badge?: {
      x: number;
      y: number;
      text?: string;
      color?: string;
    };
    textBox: {
      x: number;
      y: number;
      w: number;
      h?: number;
    };
    imageBox?: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
  }>;
  profileBox?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface DynamicInfographicVisualAssets {
  motifImageBuffer?: Buffer;
  sectionImageBuffers?: Record<string, Buffer>;
  decorations?: Record<string, Buffer>;
}

export interface DynamicInfographicComposeResult {
  buffer: Buffer;
  sizeBytes: number;
  format: 'jpeg' | 'webp';
}

