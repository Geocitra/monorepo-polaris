import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { Langfuse } from 'langfuse';
import * as dotenv from 'dotenv';
import * as path from 'path';
import dns from 'node:dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

// Load .env from root or current directory
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.OPENAI_API_KEY || 'sk-mock-key';

export const openaiClient = new OpenAI({
  apiKey,
});

export const routerBaseUrl =
  process.env.ROUTER_BASE_URL ||
  (process.env.GEMINI_BASE_URL ? `${process.env.GEMINI_BASE_URL.replace(/\/$/, '')}/v1` : 'http://127.0.0.1:20128/v1');

export const routerApiKey =
  process.env.ROUTER_API_KEY ||
  process.env.GEMINI_API_KEY ||
  'sk-07939b504321369e-o98z03-e6b9ce2e';

export const routerClient = new OpenAI({
  apiKey: routerApiKey,
  baseURL: routerBaseUrl,
  maxRetries: 1,
  timeout: 120000, // 120 detik: generasi gambar difusi dan copy LLM membutuhkan waktu 15-40 detik
});

export const geminiBaseUrl =
  process.env.GEMINI_BASE_URL ||
  (process.env.ROUTER_BASE_URL ? process.env.ROUTER_BASE_URL.replace(/\/v1\/?$/, '') : 'http://127.0.0.1:20128');

export const isRouterEnabled = true;

export function normalizeGeminiModel(modelName: string): string {
  if (!modelName) return modelName;
  if (modelName.startsWith('gemini-') || modelName.startsWith('claude-')) {
    return `ag/${modelName}`;
  }
  return modelName;
}

export function createGoogleGenAiClient(apiKey?: string): GoogleGenAI {
  const key = apiKey || routerApiKey;
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

export const googleGenAiClient = createGoogleGenAiClient(routerApiKey);

export const langfuseClient = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.LANGFUSE_BASE_URL || process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
  flushAt: 1, // Kirim telemetry langsung tanpa menunggu batching
  flushInterval: 500,
});

