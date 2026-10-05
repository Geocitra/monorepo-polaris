import { describe, it, expect, vi } from 'vitest';
import { AiTelemetryService } from '../src/telemetry/ai-telemetry.service.js';

// Mock database to prevent requiring live database connection during unit test
vi.mock('@polaris/database', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(true),
    }),
  },
  aiTraceLogs: {},
}));

describe('AiTelemetryService (Sub-Fase D.1 Dual-Sync Telemetry)', () => {
  it('harus menghasilkan Canonical Trace ID berstandar OpenTelemetry dengan format tr_[timestamp]_[8hex]', () => {
    const traceId = AiTelemetryService.generateCanonicalTraceId();
    expect(traceId).toMatch(/^tr_\d+_[a-f0-9]{8}$/);
  });

  it('harus mengalokasikan Canonical Trace ID unik pada setiap pemanggilan', () => {
    const id1 = AiTelemetryService.generateCanonicalTraceId();
    const id2 = AiTelemetryService.generateCanonicalTraceId();
    expect(id1).not.toBe(id2);
  });

  it('harus menjalankan siklus startTrace dan endTrace dengan sukses tanpa melempar exception', async () => {
    const traceSession = AiTelemetryService.startTrace({
      operation: 'test-article-generation',
      model: 'gpt-4o',
      tenantId: '00000000-0000-0000-0000-000000000001',
      metadata: { topic: 'Pembangunan Jalan Desa' },
    });

    expect(traceSession.canonicalTraceId).toMatch(/^tr_\d+_[a-f0-9]{8}$/);
    expect(typeof traceSession.startTime).toBe('number');
    expect(typeof traceSession.endTrace).toBe('function');

    await expect(
      traceSession.endTrace({
        inputTokens: 1500,
        outputTokens: 800,
        status: 'SUCCESS',
        outputPreview: { title: 'Uji Coba' },
      })
    ).resolves.not.toThrow();
  });

  it('harus mencatat trace status REFUSAL ketika guardrail mendeteksi pelanggaran keamanan', async () => {
    const refusalSession = AiTelemetryService.startTrace({
      operation: 'public-concierge-chat',
      model: 'heuristic-guardrail',
      metadata: { rejectionReason: 'Prompt Injection Detected' },
    });

    await expect(
      refusalSession.endTrace({
        inputTokens: 0,
        outputTokens: 0,
        status: 'REFUSAL',
        errorMessage: 'Prompt Injection Detected',
        outputPreview: 'Pertanyaan tidak dapat diproses.',
      })
    ).resolves.not.toThrow();
  });
});
