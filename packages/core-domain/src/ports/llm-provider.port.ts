import { InfographicDataSpecDto } from '@polaris/shared-types';

export interface GenerateArticleParams {
  topic: string;
  regionalContextData: string;
  memberWritingStyleSample?: string;
  targetAudience?: string;
  comparisonContextData?: string;
  tenantId?: string;
}

export interface GeneratedArticleResult {
  title: string;
  excerpt: string;
  contentMarkdown: string;
  wordCount: number;
  totalTokensUsed: number;
  canonicalTraceId: string;
}

export interface GeneratedSocialPackResult {
  instagramCaption: string;
  twitterThreads: string[];
  whatsappBroadcast: string;
}

export interface GenerateCivicAnswerParams {
  citizenQuestion: string;
  groundedRegulations: string;
  representativeName: string;
  partyAffiliation?: string | null;
  dapilName?: string | null;
  tenantId?: string;
}

export interface ConciergeChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeneratePublicConciergeParams {
  userMessage: string;
  history?: ConciergeChatTurn[];
}

export interface GeneratedConciergeResult {
  reply: string;
  suggestedAction: 'VIEW_PRICING' | 'REGISTER' | 'NONE';
  isSafeRefusal: boolean;
  tokensUsed: number;
  canonicalTraceId: string;
}

export interface ILLMProviderPort {
  generateEmbedding(text: string, tenantId?: string): Promise<{ embedding: number[]; canonicalTraceId: string }>;
  generateCivicAnswer(params: GenerateCivicAnswerParams): Promise<{ answer: string; canonicalTraceId: string }>;
  generateArticle(params: GenerateArticleParams): Promise<GeneratedArticleResult>;
  generateInfographicSpec(articleContent: string, tenantId?: string): Promise<InfographicDataSpecDto>;
  generateDallePrompt(infographicSpec: InfographicDataSpecDto): Promise<string>;
  generateDalleImage(englishPrompt: string, tenantId?: string): Promise<{ temporaryImageUrl: string; canonicalTraceId: string }>;
  generateSocialSnippets(articleContent: string): Promise<GeneratedSocialPackResult>;
  generatePublicConcierge(params: GeneratePublicConciergeParams): Promise<GeneratedConciergeResult>;
}
