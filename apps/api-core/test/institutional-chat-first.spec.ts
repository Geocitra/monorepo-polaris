import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSelectLimit, mockDbExecute } = vi.hoisted(() => {
  const mockSelectLimit = vi.fn();
  const mockDbExecute = vi.fn();
  return { mockSelectLimit, mockDbExecute };
});

vi.mock('@polaris/database', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: mockSelectLimit,
        })),
      })),
    })),
    execute: mockDbExecute,
  },
  organizations: { id: 'id', name: 'name', regionName: 'region_name' },
  organizationContracts: {},
  institutionalSharedNotes: {},
  institutionalChatSessions: {},
  institutionalChatMessages: {},
  eq: vi.fn((a, b) => ({ eq: [a, b] })),
  and: vi.fn((...args) => ({ and: args })),
  desc: vi.fn((a) => ({ desc: a })),
  asc: vi.fn((a) => ({ asc: a })),
  sql: vi.fn((strings: TemplateStringsArray, ...vals: any[]) => ({ strings, vals })),
}));

import { InstitutionalKnowledgeService } from '../src/modules/institutional/institutional-knowledge.service.js';

describe('B2B Chat-First Orchestration (Proactive Prompts, Guided Cards & Linked Actions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectLimit.mockReset();
    mockDbExecute.mockReset();
  });

  it('getUnitProactivePrompts menghasilkan 4 kartu rekomendasi kontekstual dari berita & DB unit', async () => {
    mockSelectLimit.mockResolvedValueOnce([{ name: 'DPRD Jawa Barat', regionName: 'Jawa Barat' }]);
    mockDbExecute
      .mockResolvedValueOnce({ rows: [{ name: 'Komisi IV', focusSectors: ['Infrastruktur'] }] })
      .mockResolvedValueOnce({ rows: [{ title: 'Perbaikan Jalan Provinsi Jabar Selatan' }] })
      .mockResolvedValueOnce({ rows: [{ title: 'LKPJ Dinas PU', fiscalYear: 2026 }] })
      .mockResolvedValueOnce({ rows: [{ title: 'Raperda Transportasi Hijau' }] })
      .mockResolvedValueOnce({ rows: [{ title: 'Dokumen APBD Perubahan.pdf' }] });

    const service = new InstitutionalKnowledgeService({} as any, {} as any, {} as any);
    const cards = await service.getUnitProactivePrompts('org-1', 'unit-4');

    expect(cards).toHaveLength(4);
    expect(cards.map((c) => c.category)).toEqual(['NEWS', 'LKPJ', 'LEGISLATION', 'IMAGE']);
    expect(cards[0].title).toContain('Perbaikan Jalan Provinsi Jabar Selatan');
    expect(cards[1].title).toContain('LKPJ Dinas PU');
    expect(cards[2].title).toContain('Raperda Transportasi Hijau');
  });

  it('buildClarificationGuide memunculkan Guided Question Card (Recommended) saat mode LKPJ/LEGISLATION dipicu singkat tanpa file', () => {
    const service = new InstitutionalKnowledgeService({} as any, {} as any, {} as any);
    const lkpjGuide = (service as any).buildClarificationGuide('LKPJ_FINANCE', 'Evaluasi LKPJ', false, [], true, false);

    expect(lkpjGuide).not.toBeNull();
    expect(lkpjGuide.options.some((o: any) => o.recommended)).toBe(true);
    expect(lkpjGuide.options.some((o: any) => o.requiresUpload)).toBe(true);

    // Jika skipClarification = true, langsung eksekusi tanpa bertanya lagi
    const skipped = (service as any).buildClarificationGuide('LKPJ_FINANCE', 'Evaluasi LKPJ', true, [], true, false);
    expect(skipped).toBeNull();
  });

  it('buildLinkedActions menyertakan deep-link LKPJ/Legislasi & Download Visual secara konsisten', () => {
    const service = new InstitutionalKnowledgeService({} as any, {} as any, {} as any);
    expect((service as any).buildLinkedActions('LKPJ_FINANCE', false)).toEqual([
      { label: 'Buka Matriks LKPJ & Cetak PDF', kind: 'OPEN_LKPJ', href: '/institutional/lkpj' },
    ]);
    expect((service as any).buildLinkedActions('LEGISLATION', true)).toEqual([
      { label: 'Buka Workspace Raperda & DIM', kind: 'OPEN_LEGISLATION', href: '/institutional/legislation' },
      { label: 'Unduh Visual', kind: 'DOWNLOAD_IMAGE' },
    ]);
  });
});
