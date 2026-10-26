export type VisualStyle = 'infographic' | 'photo' | 'illustration';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

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
  publicationId?: string;
  isPublished?: boolean;
  publishedUrl?: string;
}

export interface InfographicSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  activeIterationId: string;
  iterations: InfographicIteration[];
}
