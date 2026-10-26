-- Update tenant profiles for rich demonstration
UPDATE tenant_members 
SET party_affiliation = 'PDI Perjuangan', custom_dapil_name = 'Jawa Barat I' 
WHERE id = '051d3db8-eb2a-4cc9-a630-17b7ee272b02';

UPDATE tenant_members 
SET party_affiliation = 'Golkar', custom_dapil_name = 'Jawa Barat I' 
WHERE id = 'a28b7732-8960-4dff-a3c9-be70c15492b6';

-- Bersihkan data dummy lama
DELETE FROM datahub_files WHERE original_file_name LIKE '%_202%' OR original_file_name LIKE '%_Jabar%';

DO $BODY$
DECLARE
  v_tenant_pdip UUID := '051d3db8-eb2a-4cc9-a630-17b7ee272b02';
  v_tenant_golkar UUID := 'a28b7732-8960-4dff-a3c9-be70c15492b6';
  v_file1_id UUID;
  v_file2_id UUID;
  v_file3_id UUID;
  v_file4_id UUID;
  v_file5_id UUID;
  dummy_vec vector(1536);
BEGIN
  -- Buat vektor dummy 1536 dimensi
  SELECT ('[' || array_to_string(array_agg((sin(i) * 0.05)::numeric(8,6)), ',') || ']')::vector(1536)
  INTO dummy_vec
  FROM generate_series(1, 1536) i;

  -- 1. BERKAS 1: Draf APBD Perubahan 2026 (DEDUPLIKASI GOLKAR & PDIP)
  INSERT INTO datahub_files (
    content_sha256, original_file_name, mime_type, file_size_bytes, storage_path, extraction_status, total_pages, extracted_raw_text
  ) VALUES (
    'a3f5c7198e3b2a149021e847cd6bfa912847291a84fbe720a473918237492104',
    'Draf_Raperda_APBD_Perubahan_2026_Provinsi_Jabar.pdf',
    'application/pdf',
    14820000,
    '/uploads/datahub/a3f5c7198e3b2a149021e847cd6bfa912847291a84fbe720a473918237492104.pdf',
    'COMPLETED',
    142,
    '# BAB I KETENTUAN ANGGARAN\nPasal 1: Anggaran Pendapatan dan Belanja Daerah Provinsi Jawa Barat Tahun Anggaran 2026 mengalami penyesuaian belanja modal infrastruktur dan subsidi pupuk organik.'
  ) RETURNING id INTO v_file1_id;

  -- Referensi 1A: Diunggah oleh Golkar (Reno S Nugraha)
  INSERT INTO datahub_document_refs (
    file_id, uploaded_by_tenant_id, custom_title, dapil_code, party_affiliation, branch_type, legislative_level, privacy_scope, category_tag
  ) VALUES (
    v_file1_id,
    v_tenant_golkar,
    'Draf APBD Perubahan 2026 - Analisis Fraksi Golkar',
    'Jawa Barat I',
    'Golkar',
    'LEGISLATIF',
    'DPRD_PROVINSI',
    'PARTY_CONFIDENTIAL',
    'ANGGARAN_APBD'
  );

  -- Referensi 1B: Diunggah oleh PDIP (Naufal Fadhil Aziz) -> DEDUPLIKASI AKTIF!
  INSERT INTO datahub_document_refs (
    file_id, uploaded_by_tenant_id, custom_title, dapil_code, party_affiliation, branch_type, legislative_level, privacy_scope, category_tag
  ) VALUES (
    v_file1_id,
    v_tenant_pdip,
    'Draf APBD-P 2026 - Kajian Prioritas Kerakyatan PDIP',
    'Jawa Barat I',
    'PDI Perjuangan',
    'LEGISLATIF',
    'DPRD_PROVINSI',
    'PARTY_CONFIDENTIAL',
    'ANGGARAN_APBD'
  );

  -- Chunks untuk Berkas 1
  INSERT INTO datahub_document_chunks (
    file_id, chunk_index, section_title, chunk_content, contextual_header, token_count, vector_embedding
  ) VALUES 
  (
    v_file1_id,
    0,
    'BAB I: Penyesuaian Pendapatan Asli Daerah (PAD)',
    'Total pendapatan daerah direncanakan sebesar Rp 36,4 Triliun dengan target kenaikan pajak kendaraan bermotor sebesar 8% pada kuartal III.',
    '[DOKUMEN: Draf APBD Perubahan 2026 | KATEGORI: ANGGARAN_APBD | BAGIAN: BAB I PAD]',
    120,
    dummy_vec
  ),
  (
    v_file1_id,
    1,
    'BAB II: Alokasi Belanja Subsidi Pangan & Pupuk',
    'Belanja subsidi sektor pertanian dialokasikan Rp 420 Miliar dengan fokus pengadaan pupuk hayati cair di 18 kabupaten sentra padi.',
    '[DOKUMEN: Draf APBD Perubahan 2026 | KATEGORI: ANGGARAN_APBD | BAGIAN: BAB II Pangan]',
    145,
    dummy_vec
  );

  -- 2. BERKAS 2: Perda Sampah Citarum (PUBLIK BERSAMA DAPIL)
  INSERT INTO datahub_files (
    content_sha256, original_file_name, mime_type, file_size_bytes, storage_path, extraction_status, total_pages, extracted_raw_text
  ) VALUES (
    'c8d1920384710293847102938471029384710293847102938471029384710293',
    'Perda_No_9_Tahun_2025_Pengelolaan_Sampah_Citarum.pdf',
    'application/pdf',
    4200000,
    '/uploads/datahub/c8d1920384710293847102938471029384710293847102938471029384710293.pdf',
    'COMPLETED',
    38,
    '# PERATURAN DAERAH PROVINSI JAWA BARAT NOMOR 9 TAHUN 2025 TENTANG PENGELOLAAN SAMPAH DAN SANITASI DAERAH ALIRAN SUNGAI CITARUM'
  ) RETURNING id INTO v_file2_id;

  INSERT INTO datahub_document_refs (
    file_id, uploaded_by_tenant_id, custom_title, dapil_code, party_affiliation, branch_type, legislative_level, privacy_scope, category_tag
  ) VALUES (
    v_file2_id,
    v_tenant_golkar,
    'Perda 9/2025 Sanitasi Citarum Harum',
    'Jawa Barat I',
    'Golkar',
    'LEGISLATIF',
    'DPRD_PROVINSI',
    'DAPIL_SHARED',
    'REGULASI_DAERAH'
  );

  INSERT INTO datahub_document_chunks (
    file_id, chunk_index, section_title, chunk_content, contextual_header, token_count, vector_embedding
  ) VALUES (
    v_file2_id,
    0,
    'Pasal 14: Sanksi Administratif Limbah Industri',
    'Setiap pelaku usaha manufaktur di bantaran Citarum yang membuang limbah B3 tanpa IPAL terstandarisasi dikenakan denda administratif maksimal Rp 500 Juta.',
    '[DOKUMEN: Perda 9/2025 Citarum | KATEGORI: REGULASI_DAERAH | BAGIAN: Pasal 14 Sanksi]',
    110,
    dummy_vec
  );

  -- 3. BERKAS 3: Notula Tertutup RDP Komisi XI DPR RI (PUSAT TERTUTUP)
  INSERT INTO datahub_files (
    content_sha256, original_file_name, mime_type, file_size_bytes, storage_path, extraction_status, total_pages, extracted_raw_text
  ) VALUES (
    'e981273948120938401928304918203948102938401928304918203948102938',
    'Notula_Tertutup_RDP_Komisi_XI_DPR_RI_Subsidi_Fiskal.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    1850000,
    '/uploads/datahub/e981273948120938401928304918203948102938401928304918203948102938.docx',
    'COMPLETED',
    24,
    'NOTULA RAPAT KERJA TERTUTUP KOMISI XI DPR RI DENGAN KEMENTERIAN KEUANGAN MENGENAI FORMULA DANA TRANSFER DAERAH 2026.'
  ) RETURNING id INTO v_file3_id;

  INSERT INTO datahub_document_refs (
    file_id, uploaded_by_tenant_id, custom_title, dapil_code, party_affiliation, branch_type, legislative_level, privacy_scope, category_tag
  ) VALUES (
    v_file3_id,
    v_tenant_pdip,
    'Risalah Internal RDP Komisi XI DPR RI - Skema DAU/DAK',
    'Nasional',
    'PDI Perjuangan',
    'LEGISLATIF',
    'DPR_RI',
    'PARTY_CONFIDENTIAL',
    'NOTULA_SIDANG'
  );

  INSERT INTO datahub_document_chunks (
    file_id, chunk_index, section_title, chunk_content, contextual_header, token_count, vector_embedding
  ) VALUES (
    v_file3_id,
    0,
    'Bagian 3: Pandangan Pokok Fraksi mengenai DAU Spesifik',
    'Fraksi meminta peningkatan alokasi DAU mandatory spending pendidikan di wilayah 3T minimal 22 persen.',
    '[DOKUMEN: Risalah RDP Komisi XI | KATEGORI: NOTULA_SIDANG | BAGIAN: DAU Mandatory]',
    95,
    dummy_vec
  );

  -- 4. BERKAS 4: SK Gubernur Alokasi Pupuk Organik (EKSEKUTIF PEMDA)
  INSERT INTO datahub_files (
    content_sha256, original_file_name, mime_type, file_size_bytes, storage_path, extraction_status, total_pages, extracted_raw_text
  ) VALUES (
    '7b29384719283049182039481029384019283049182039481029384019283049',
    'SK_Gubernur_Jabar_Penetapan_Alokasi_Pupuk_Organik_Musim_Tanam_I.pdf',
    'application/pdf',
    3100000,
    '/uploads/datahub/7b29384719283049182039481029384019283049182039481029384019283049.pdf',
    'COMPLETED',
    18,
    'SURAT KEPUTUSAN GUBERNUR JAWA BARAT TENTANG ALOKASI DAN HARGA ECERAN TERTINGGI PUPUK HAYATI DAERAH'
  ) RETURNING id INTO v_file4_id;

  INSERT INTO datahub_document_refs (
    file_id, uploaded_by_tenant_id, custom_title, dapil_code, party_affiliation, branch_type, legislative_level, privacy_scope, category_tag
  ) VALUES (
    v_file4_id,
    v_tenant_golkar,
    'SK Gubernur: Alokasi HET Pupuk Hayati 2026',
    'Jawa Barat I',
    'Golkar',
    'EKSEKUTIF',
    'KEPALA_DAERAH_GUBERNUR',
    'DAPIL_SHARED',
    'REGULASI_DAERAH'
  );

  INSERT INTO datahub_document_chunks (
    file_id, chunk_index, section_title, chunk_content, contextual_header, token_count, vector_embedding
  ) VALUES (
    v_file4_id,
    0,
    'Lampiran I: Kuota per Kabupaten/Kota',
    'Kabupaten Karawang memperoleh kuota 35.000 ton pupuk organik granul dengan harga eceran tertinggi Rp 1.800 per kilogram.',
    '[DOKUMEN: SK Gubernur Pupuk 2026 | KATEGORI: REGULASI_DAERAH | BAGIAN: HET dan Kuota]',
    105,
    dummy_vec
  );

  -- 5. BERKAS 5: BPS Statistik Kemiskinan Ekstrem & Stunting (MASTER PUBLIK NASIONAL)
  INSERT INTO datahub_files (
    content_sha256, original_file_name, mime_type, file_size_bytes, storage_path, extraction_status, total_pages, extracted_raw_text
  ) VALUES (
    '3344556677889900112233445566778899001122334455667788990011223344',
    'BPS_Statistik_Kemiskinan_Ekstrem_dan_Stunting_Jawa_Barat_2025.pdf',
    'application/pdf',
    8500000,
    '/uploads/datahub/3344556677889900112233445566778899001122334455667788990011223344.pdf',
    'COMPLETED',
    86,
    'LAPORAN RESMI BADAN PUSAT STATISTIK: KAJIAN ANGKA KEMISKINAN EKSTREM DAN PREVALENSI STUNTING JAWA BARAT 2025'
  ) RETURNING id INTO v_file5_id;

  INSERT INTO datahub_document_refs (
    file_id, uploaded_by_tenant_id, custom_title, dapil_code, party_affiliation, branch_type, legislative_level, privacy_scope, category_tag
  ) VALUES (
    v_file5_id,
    v_tenant_pdip,
    'BPS 2025: Data Kemiskinan Ekstrem & Stunting Jabar',
    'Jawa Barat I',
    'PDI Perjuangan',
    'LEGISLATIF',
    'DPRD_PROVINSI',
    'PUBLIC_SYSTEM',
    'KAJIAN_AKADEMIS'
  );

  INSERT INTO datahub_document_chunks (
    file_id, chunk_index, section_title, chunk_content, contextual_header, token_count, vector_embedding
  ) VALUES (
    v_file5_id,
    0,
    'Tabel 4.2: Prevalensi Stunting Wilayah Priangan',
    'Prevalensi stunting di Kabupaten Bandung Barat tercatat turun menjadi 14,2 persen, melampaui target nasional RPJMN.',
    '[DOKUMEN: BPS Stunting 2025 | KATEGORI: KAJIAN_AKADEMIS | BAGIAN: Tabel 4.2]',
    98,
    dummy_vec
  );

END $BODY$;
