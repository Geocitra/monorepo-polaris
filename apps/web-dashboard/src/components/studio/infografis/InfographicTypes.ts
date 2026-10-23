export type VisualStyle = 'infographic' | 'poster' | 'photo' | 'illustration';
export type AspectRatio = '4:5' | '1:1' | '9:16' | '16:9' | '4:3' | '3:4';

export interface InfographicIteration {
  id: string;
  versionNumber: number;
  timestamp: string;
  prompt: string;
  imageUrl: string;
  caption: string;
  title: string;
  style: VisualStyle;
  aspectRatio: AspectRatio;
  source: 'INITIAL' | 'REFINE' | 'RESTORE';
}

export interface InfographicSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  activeIterationId: string;
  iterations: InfographicIteration[];
}
