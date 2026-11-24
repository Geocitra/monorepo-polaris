import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({
  text: JSON.stringify({
    category: 'REGULASI_DAERAH',
    confidenceScore: 0.96,
    reasoningSnippet: 'Dokumen LKPJ Resmi',
    suggestedTitle: 'LKPJ Tahun Anggaran 2025',
  }),
  usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 30, totalTokenCount: 150 },
});

vi.mock('../src/client.js', () => ({
  googleGenAiClient: {
    models: {
      generateContent: (...args: any[]) => mockGenerateContent(...args),
    },
  },
  normalizeGeminiModel: (m: string) => m,
  openaiClient: null,
  getTextCompletionClient: () => null,
}));

import { AiTelemetryService } from '../src/telemetry/ai-telemetry.service.js';
import { DocumentClassifierService } from '../src/datahub/document-classifier.service.js';
import { DocumentExtractorService } from '../src/datahub/document-extractor.service.js';

describe('Institutional Upload Billing Telemetry Propagation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('DocumentClassifierService meneruskan organizationId & organizationUnitId ke AiTelemetryService.startTrace', async () => {
    const startTraceSpy = vi.spyOn(AiTelemetryService, 'startTrace').mockReturnValue({
      traceId: 'tr_cls_mock',
      endTrace: vi.fn().mockResolvedValue(undefined),
    } as any);

    await (DocumentClassifierService as any).classifyWithGemini(
      'lkpj_2025.pdf',
      'Laporan Keterangan Pertanggungjawaban Kepala Daerah TA 2025',
      'LKPJ 2025',
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333'
    );

    expect(startTraceSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'datahub-document-classifier',
        tenantId: '11111111-1111-4111-8111-111111111111',
        organizationId: '22222222-2222-4222-8222-222222222222',
        organizationUnitId: '33333333-3333-4333-8333-333333333333',
      })
    );

    const detResult = await DocumentClassifierService.classifyDocument({
      fileName: 'risalah_rapat_komisi.txt',
      extractedText: 'Risalah Rapat Paripurna DPRD tentang LKPJ Tahun Anggaran 2025.',
      tenantId: '11111111-1111-4111-8111-111111111111',
      organizationId: '22222222-2222-4222-8222-222222222222',
      organizationUnitId: '33333333-3333-4333-8333-333333333333',
    });
    expect(detResult.category).toBe('NOTULA_SIDANG');
  });

  it('DocumentExtractorService meneruskan organizationId & organizationUnitId ke AiTelemetryService.startTrace saat OCR Vision', async () => {
    const startTraceSpy = vi.spyOn(AiTelemetryService, 'startTrace').mockReturnValue({
      traceId: 'tr_ocr_mock',
      endTrace: vi.fn().mockResolvedValue(undefined),
    } as any);

    mockGenerateContent.mockResolvedValueOnce({
      text: 'Transkrip Tabel LKPJ',
      usageMetadata: { promptTokenCount: 250, candidatesTokenCount: 40, totalTokenCount: 290 },
    });

    const imgBuf = Buffer.from('fake-png-bytes', 'utf-8');
    const result = await DocumentExtractorService.extractText(
      imgBuf,
      'image/png',
      'scan_lkpj.png',
      '11111111-1111-4111-8111-111111111111',
      {
        organizationId: '22222222-2222-4222-8222-222222222222',
        organizationUnitId: '33333333-3333-4333-8333-333333333333',
      }
    );

    expect(result.extractorUsed).toBe('gemini-vision-ocr');
    expect(startTraceSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'datahub-gemini-vision-ocr',
        tenantId: '11111111-1111-4111-8111-111111111111',
        organizationId: '22222222-2222-4222-8222-222222222222',
        organizationUnitId: '33333333-3333-4333-8333-333333333333',
      })
    );
  });
});
