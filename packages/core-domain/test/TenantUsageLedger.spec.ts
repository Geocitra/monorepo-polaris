import { describe, it, expect } from 'vitest';
import { TenantUsageLedger, AiCostCalculator } from '../src/entities/TenantQuota.js';

describe('TenantUsageLedger & AiCostCalculator', () => {
  it('harus menghitung biaya estimasi OpenAI USD dan konversi ke Rupiah secara akurat', () => {
    // 100.000 token pada tarif $12/1M = $1.20
    // 2 gambar DALL-E 3 pada tarif $0.08 = $0.16
    // Total USD = $1.36
    const costUsd = AiCostCalculator.calculateCostUsd(100000, 2);
    expect(costUsd).toBe(1.36);

    // Kurs eksplisit 16.250 * 1.36 = 22.100, serta kurs dinamis menghasilkan nilai > 0
    const costIdrFixed = AiCostCalculator.toIdr(costUsd, 16250);
    expect(costIdrFixed).toBe(22100);
    const costIdrDynamic = AiCostCalculator.toIdr(costUsd);
    expect(costIdrDynamic).toBeGreaterThan(20000);
  });

  it('harus memisahkan provider OPENAI vs GEMINI dan mengestimasi token Bahasa Indonesia BPE dengan akurat', () => {
    expect(AiCostCalculator.resolveProvider('gpt-4o')).toBe('OPENAI');
    expect(AiCostCalculator.resolveProvider('gemini-2.5-flash')).toBe('GEMINI');
    expect(AiCostCalculator.resolveProvider('imagen-3.0-generate-002')).toBe('GEMINI');
    expect(AiCostCalculator.resolveProvider('local-guardrail')).toBe('SYSTEM');

    const textId = 'Pemerintah daerah mengalokasikan anggaran infrastruktur pertanian berkelanjutan';
    const bpeTokens = AiCostCalculator.estimateIndonesianTokens(textId);
    const naiveTokens = Math.ceil(textId.length / 4);
    expect(bpeTokens).toBeGreaterThan(naiveTokens);

    const geminiDetail = AiCostCalculator.calculateDetailedModelCostUsd({
      model: 'gemini-2.5-flash',
      inputTokens: 10000,
      outputTokens: 2000,
      fxRateIdr: 16300,
    });
    expect(geminiDetail.provider).toBe('GEMINI');
    expect(geminiDetail.totalCostIdr).toBeGreaterThan(0);
  });

  it('harus menghitung biaya granular per model secara presisi (calculateModelCostUsd)', () => {
    // GPT-4o-mini: 10.000 in ($0.15/1M = 0.0015) + 1.000 out ($0.60/1M = 0.0006) = 0.0021
    const miniCost = AiCostCalculator.calculateModelCostUsd({
      model: 'gpt-4o-mini',
      inputTokens: 10000,
      outputTokens: 1000,
    });
    expect(miniCost).toBe(0.0021);

    // GPT-4o: 2.000 in ($2.50/1M = 0.005) + 1.000 out ($10.00/1M = 0.010) = 0.015
    const gpt4oCost = AiCostCalculator.calculateModelCostUsd({
      model: 'gpt-4o',
      inputTokens: 2000,
      outputTokens: 1000,
    });
    expect(gpt4oCost).toBe(0.015);

    // Embedding: 50.000 tokens ($0.02/1M = 0.001)
    const embeddingCost = AiCostCalculator.calculateModelCostUsd({
      model: 'text-embedding-3-small',
      inputTokens: 50000,
      outputTokens: 0,
    });
    expect(embeddingCost).toBe(0.001);

    // DALL-E 3: 1 gambar = $0.08
    const dalleCost = AiCostCalculator.calculateModelCostUsd({
      model: 'dall-e-3',
      inputTokens: 0,
      outputTokens: 0,
      imageCalls: 1,
    });
    expect(dalleCost).toBe(0.08);
  });

  it('harus mengumpulkan konsumsi token secara inkremental pada ledger tenant', () => {
    const ledger = new TenantUsageLedger('tenant-1', '2026-10');

    ledger.recordArticleGeneration(4000);
    expect(ledger.articleUsed).toBe(1);
    expect(ledger.totalTokensConsumed).toBe(4000);

    ledger.recordDalleGeneration();
    expect(ledger.dalleUsed).toBe(1);
    expect(ledger.estimatedCostUsd).toBeGreaterThan(0);
    expect(ledger.isUnlimited()).toBe(false);
    expect(ledger.getArticleRemaining()).toBe(11);
  });
});