import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { Langfuse } from 'langfuse';
import * as dotenv from 'dotenv';
import * as path from 'path';
import dns from 'node:dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch { }

// Load .env from root or current directory
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.OPENAI_API_KEY || 'sk-mock-key';

export const openaiClient = new OpenAI({
  apiKey,
});

export const isRouterEnabled = process.env.AI_USE_ROUTER === 'true';

export const routerBaseUrl =
  process.env.ROUTER_BASE_URL ||
  (process.env.GEMINI_BASE_URL ? `${process.env.GEMINI_BASE_URL.replace(/\/$/, '')}/v1` : 'http://127.0.0.1:20128/v1');

export const routerApiKey =
  process.env.ROUTER_API_KEY ||
  '';

/**
 * Client 9Router hanya aktif jika `AI_USE_ROUTER=true` (untuk local dev).
 * Di Production (`AI_USE_ROUTER` tidak diset / `false`), bernilai `null` agar selalu
 * menggunakan OpenAI dan Google Gemini resmi secara langsung.
 */
export const routerClient: OpenAI | null = isRouterEnabled
  ? new OpenAI({
    apiKey: routerApiKey || 'sk-local-router',
    baseURL: routerBaseUrl,
    maxRetries: 1,
    timeout: 120000, // 120 detik: generasi gambar difusi dan copy LLM membutuhkan waktu 15-40 detik
  })
  : null;

export const geminiBaseUrl =
  process.env.GEMINI_BASE_URL ||
  (process.env.ROUTER_BASE_URL ? process.env.ROUTER_BASE_URL.replace(/\/v1\/?$/, '') : 'http://127.0.0.1:20128');

export function normalizeGeminiModel(modelName: string): string {
  if (!modelName) return modelName;
  if (!isRouterEnabled) {
    return modelName.startsWith('ag/') ? modelName.slice(3) : modelName;
  }
  if (modelName.startsWith('gemini-') || modelName.startsWith('claude-')) {
    return `ag/${modelName}`;
  }
  return modelName;
}

export function createGoogleGenAiClient(apiKey?: string): GoogleGenAI | null {
  if (isRouterEnabled) {
    const key = apiKey || routerApiKey || process.env.GEMINI_API_KEY || 'sk-local-router';
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        baseUrl: geminiBaseUrl,
        headers: {
          Authorization: `Bearer ${key}`,
        },
      },
    });
  }

  const directKey = apiKey || process.env.GEMINI_API_KEY;
  if (!directKey) return null;
  return new GoogleGenAI({ apiKey: directKey });
}

export const googleGenAiClient = createGoogleGenAiClient();

/**
 * Mengembalikan client untuk narasi/copywriting & vision chat (OpenAI-compatible).
 * - Production (`AI_USE_ROUTER !== 'true'`): menggunakan `openaiClient` resmi.
 * - Local dev (`AI_USE_ROUTER=true`): menggunakan `routerClient` (9Router).
 */
export function getTextCompletionClient(): {
  client: OpenAI;
  isRouter: boolean;
  resolveModel: (preferredOpenAiModel: string, preferredRouterModel?: string) => string;
} {
  if (isRouterEnabled && routerClient) {
    return {
      client: routerClient,
      isRouter: true,
      resolveModel: (preferredOpenAiModel: string, preferredRouterModel?: string) =>
        normalizeGeminiModel(preferredRouterModel || preferredOpenAiModel),
    };
  }
  return {
    client: openaiClient,
    isRouter: false,
    resolveModel: (preferredOpenAiModel: string) => preferredOpenAiModel,
  };
}

export const langfuseClient = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.LANGFUSE_BASE_URL || process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
  flushAt: 1, // Kirim telemetry langsung tanpa menunggu batching
  flushInterval: 500,
});

