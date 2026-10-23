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

const geminiApiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  '';

export const googleGenAiClient = geminiApiKey
  ? new GoogleGenAI({ apiKey: geminiApiKey })
  : null;

export const langfuseClient = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.LANGFUSE_BASE_URL || process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
  flushAt: 1, // Kirim telemetry langsung tanpa menunggu batching
  flushInterval: 500,
});

