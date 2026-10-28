import { describe, it, expect } from 'vitest';
import { DocumentClassifierService, DocumentExtractorService } from '../src/datahub/index.js';
import { DatahubCategory } from '@polaris/shared-types';

describe('DocumentClassifierService (3-Pass Multi-Domain Classifier)', () => {
  it('Pass 1 Deterministic: harus mengenali Peraturan Daerah (PERDA) sebagai REGULASI_DAERAH dengan confidence tinggi', async () => {
    const result = await DocumentClassifierService.classifyDocument({
      fileName: 'PERDA_NO_4_TAHUN_2024_KOTA_BANDUNG.pdf',
      extractedText: 'Menimbang: bahwa untuk melaksanakan ketentuan Pasal 12... Mengingat: Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah.',
    });

    expect(result.category).toBe(DatahubCategory.REGULASI_DAERAH);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.95);
    expect(result.isDeterministic).toBe(true);
    expect(result.needsReview).toBe(false);
  });

  it('Pass 1 Deterministic: harus mengenali Dokumen Pelaksanaan Anggaran (DPA/APBD) sebagai ANGGARAN_APBD', async () => {
    const result = await DocumentClassifierService.classifyDocument(
      'DPA_SKPD_DINAS_BINA_MARGA_2024.xlsx',
      'RINGKASAN DOKUMEN PELAKSANAAN ANGGARAN SATUAN KERJA PERANGKAT DAERAH TAHUN ANGGARAN 2024. Alokasi Belanja Modal dan Belanja Operasi.'
    );

    expect(result.category).toBe(DatahubCategory.ANGGARAN_APBD);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.95);
    expect(result.isDeterministic).toBe(true);
  });

  it('Pass 1 Deterministic: harus mengenali Risalah/Notula Rapat Paripurna sebagai NOTULA_SIDANG', async () => {
    const result = await DocumentClassifierService.classifyDocument({
      fileName: 'risalah_sidang_paripurna_ke_12.docx',
      extractedText: 'RISALAH RAPAT PARIPURNA DEWAN PERWAKILAN RAKYAT DAERAH. Agenda: Pemandangan Umum Fraksi-Fraksi terhadap Raperda Pertanggungjawaban APBD.',
    });

    expect(result.category).toBe(DatahubCategory.NOTULA_SIDANG);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.95);
    expect(result.isDeterministic).toBe(true);
  });

  it('Pass 1 Deterministic: harus mengenali Pokir & Hasil Reses sebagai ASPIRASI_KONSTITUEN', async () => {
    const result = await DocumentClassifierService.classifyDocument({
      fileName: 'rekap_pokir_dan_aspirasi_reses_dapil_3.xlsx',
      extractedText: 'DAFTAR USULAN POKOK-POKOK PIKIRAN (POKIR) DPRD DARI HASIL RESES MASA SIDANG II TAHUN 2024. Aspirasi warga perbaikan drainase dan bansos.',
    });

    expect(result.category).toBe(DatahubCategory.ASPIRASI_KONSTITUEN);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.95);
    expect(result.isDeterministic).toBe(true);
  });

  it('Pass 1 Deterministic: harus mengenali Naskah Akademik sebagai KAJIAN_AKADEMIS', async () => {
    const result = await DocumentClassifierService.classifyDocument({
      fileName: 'naskah_akademik_penataan_ruang.pdf',
      extractedText: 'NASKAH AKADEMIK RANCANGAN PERATURAN DAERAH TENTANG RENCANA TATA RUANG WILAYAH. Disusun oleh Pusat Studi Kebijakan Publik Universitas.',
    });

    expect(result.category).toBe(DatahubCategory.KAJIAN_AKADEMIS);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.95);
    expect(result.isDeterministic).toBe(true);
  });

  it('Pass 2 Heuristics: harus menggunakan densitas kata kunci jika nama berkas ambigu/generik', async () => {
    const result = await DocumentClassifierService.classifyDocument({
      fileName: 'lampiran_dokumen_final.pdf',
      extractedText: 'dokumen ini memuat laporan realisasi anggaran belanja daerah, pembiayaan silpa tahun berjalan, pagu indikatif belanja pegawai pemda.',
    });

    expect(result.category).toBe(DatahubCategory.ANGGARAN_APBD);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.8);
  });

  it('Format Fleksibel: harus mendukung pemanggilan parameter objek maupun pemanggilan argumen posisi', async () => {
    const viaObject = await DocumentClassifierService.classifyDocument({
      fileName: 'PERWAL_NOMOR_15_2024.pdf',
      extractedText: 'Peraturan Walikota tentang Tata Cara Penyelenggaraan Pelayanan Publik.',
    });

    const viaPositional = await DocumentClassifierService.classifyDocument(
      'PERWAL_NOMOR_15_2024.pdf',
      'Peraturan Walikota tentang Tata Cara Penyelenggaraan Pelayanan Publik.'
    );

    expect(viaObject.category).toBe(DatahubCategory.REGULASI_DAERAH);
    expect(viaPositional.category).toBe(DatahubCategory.REGULASI_DAERAH);
    expect(viaObject.category).toEqual(viaPositional.category);
  });
});

describe('DocumentExtractorService (Tabular & Document Ingestion)', () => {
  it('harus memprofilkan berkas CSV dan menghasilkan preview tabel markdown tanpa ledakan vektor', async () => {
    const csvContent = `id,nama_kecamatan,alokasi_bansos,status_penyaluran
1,Cicendo,150000000,SELESAI
2,Coblong,200000000,PROSES
3,Sukasari,120000000,SELESAI`;

    const buffer = Buffer.from(csvContent, 'utf-8');
    const result = await DocumentExtractorService.extractText(
      buffer,
      'text/csv',
      'rekap_bansos_kecamatan.csv'
    );

    expect(result.extractorUsed).toBe('tabular-csv-tsv-profile');
    expect(result.text).toContain('DATA TABULAR: rekap_bansos_kecamatan.csv');
    expect(result.text).toContain('Total Baris Data: 3 baris');
    expect(result.text).toContain('| id | nama_kecamatan | alokasi_bansos | status_penyaluran |');
    expect(result.text).toContain('| Cicendo | 150000000 | SELESAI |');
  });

  it('harus mengekstrak berkas plaintext / markdown secara rapi', async () => {
    const plainText = 'Notulen internal rapat pimpinan fraksi partai mengenai sikap politik pilkada serentak.';
    const buffer = Buffer.from(plainText, 'utf-8');
    const result = await DocumentExtractorService.extractText(
      buffer,
      'text/plain',
      'notulen_internal.txt'
    );

    expect(result.extractorUsed).toBe('plaintext');
    expect(result.text).toBe(plainText);
  });
});
