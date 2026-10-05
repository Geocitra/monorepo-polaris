import { describe, expect, it } from 'vitest';
import { PolicySector } from '@polaris/shared-types';
import { CivicRelevanceGatekeeper } from '../src/processors/civic-relevance-gatekeeper.js';

describe('CivicRelevanceGatekeeper', () => {
  it.each([
    {
      sector: PolicySector.FISKAL_ANGGARAN,
      title: 'Pemkab bahas APBD dan belanja modal untuk pembangunan daerah',
      summary: 'Pemerintah daerah membahas anggaran daerah dan prioritas belanja modal.',
    },
    {
      sector: PolicySector.INFRASTRUKTUR_RUANG,
      title: 'Jalan rusak dan jembatan kabupaten segera diperbaiki',
      summary: 'Pemkab mengalokasikan dana untuk infrastruktur publik.',
    },
    {
      sector: PolicySector.PANGAN_PERTANIAN,
      title: 'Pupuk subsidi untuk petani di lahan pertanian',
      summary: 'Program pangan daerah menambah distribusi pupuk bersubsidi.',
    },
    {
      sector: PolicySector.SOSIAL_KEMISKINAN,
      title: 'Penyaluran bansos mengacu pada data DTKS',
      summary: 'Dinas sosial memperbarui bantuan sosial bagi keluarga miskin.',
    },
    {
      sector: PolicySector.LAYANAN_DASAR,
      title: 'RSUD dan puskesmas tingkatkan pelayanan kesehatan',
      summary: 'Tenaga kesehatan memperluas layanan bagi warga.',
    },
    {
      sector: PolicySector.TATA_KELOLA_HUKUM,
      title: 'Inspektorat audit pengadaan pemerintah sesuai perda',
      summary: 'Audit pemerintah dilakukan untuk memperkuat tata kelola.',
    },
    {
      sector: PolicySector.EKONOMI_KETENAGAKERJAAN,
      title: 'UMK naik dan dinas tenaga kerja buka layanan konsultasi',
      summary: 'Kebijakan upah minimum berdampak pada tenaga kerja.',
    },
    {
      sector: PolicySector.LINGKUNGAN_BENCANA,
      title: 'Banjir dan pengelolaan sampah jadi prioritas pemda',
      summary: 'BPBD memperkuat mitigasi bencana serta mencegah pencemaran sungai.',
    },
  ])('classifies civic coverage under $sector', ({ sector, title, summary }) => {
    const assessment = CivicRelevanceGatekeeper.assess(title, summary);

    expect(assessment.accepted).toBe(true);
    expect(assessment.sector).toBe(sector);
  });

  it('accepts and classifies stories with multiple specific policy signals', () => {
    const assessment = CivicRelevanceGatekeeper.assess(
      'Pemkab bahas APBD dan belanja modal untuk pembangunan daerah',
      'Pemerintah daerah membahas anggaran daerah dan prioritas belanja modal.'
    );

    expect(assessment.accepted).toBe(true);
    expect(assessment.sector).toBe(PolicySector.FISKAL_ANGGARAN);
    expect(assessment.relevanceScore).toBeGreaterThanOrEqual(0.65);
    expect(assessment.matchedKeywords).toContain('apbd');
  });

  it('rejects entertainment noise without policy evidence', () => {
    const assessment = CivicRelevanceGatekeeper.assess(
      'Grup K-pop umumkan konser dan album baru',
      'Penggemar menantikan konser musik dan lagu terbaru.'
    );

    expect(assessment.accepted).toBe(false);
    expect(assessment.sector).toBeNull();
    expect(assessment.rejectionReason).toBe('NON_POLICY_NOISE');
  });

  it('does not accept a single ambiguous policy keyword', () => {
    const assessment = CivicRelevanceGatekeeper.assess(
      'Petani tampil dalam acara televisi',
      'Acara hiburan menampilkan kisah petani lokal.'
    );

    expect(assessment.accepted).toBe(false);
    expect(assessment.rejectionReason).toBe('INSUFFICIENT_POLICY_EVIDENCE');
  });

  it('accepts a concrete disaster response report', () => {
    const assessment = CivicRelevanceGatekeeper.assess(
      'Tanggap darurat banjir bandang di Solok diperpanjang selama tujuh hari',
      'Pemerintah kabupaten memperpanjang masa tanggap darurat bencana banjir bandang.'
    );

    expect(assessment.accepted).toBe(true);
    expect(assessment.sector).toBe(PolicySector.LINGKUNGAN_BENCANA);
  });

  it('accepts specific reporting on regional fiscal transfers', () => {
    const assessment = CivicRelevanceGatekeeper.assess(
      'Kemenkeu bahas pemangkasan DBH migas 2027 dengan pemerintah daerah',
      'Pemangkasan dana bagi hasil migas akan berdampak pada pendapatan daerah.'
    );

    expect(assessment.accepted).toBe(true);
    expect(assessment.sector).toBe(PolicySector.FISKAL_ANGGARAN);
  });

  it('does not reject civic policy coverage solely because it mentions entertainment', () => {
    const assessment = CivicRelevanceGatekeeper.assess(
      'Pemda anggarkan APBD untuk fasilitas publik di sekitar lokasi konser',
      'Belanja modal daerah mencakup perbaikan fasilitas publik.'
    );

    expect(assessment.accepted).toBe(true);
    expect(assessment.sector).toBe(PolicySector.FISKAL_ANGGARAN);
  });
});
