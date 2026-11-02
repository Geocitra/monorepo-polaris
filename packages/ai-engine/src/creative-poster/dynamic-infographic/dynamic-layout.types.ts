export interface DynamicInfographicSectionSpec {
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
  sections: DynamicInfographicSectionSpec[];
  profileBox?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

