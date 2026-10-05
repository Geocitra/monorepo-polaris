# ROADMAP TEKNIS DETAIL: FASE 2
## Grounding AI Otentik, Jalur Asinkron BullMQ, dan Keamanan Data (UU PDP & Domain)

> Disusun menggunakan metodologi Object-Oriented Analysis and Design (OOAD) Craig Larman, prinsip GRASP, dan standar Production-Grade Resilience.

```text
========================================================================================
POLARIS ARCHITECTURE ROADMAP — FASE 2: RESILIENSI AI, ANTRIAN, & KEAMANAN
========================================================================================

[SUB-FASE 2.1: SEMANTIC RAG GROUNDING]
  ├── Eliminasi Vektor Dummy 0.01 ──► Integrasi OpenAI Embeddings (text-embedding-3-small)
  ├── Filter Spasial Wilayah (Dapil/Regional) ──► Query pgvector Cosine Distance HNSW
  └── Fallback Heuristik Regulasi ──► Langfuse RAG Retrieval Trace

[SUB-FASE 2.2: BULLMQ ASYNCHRONOUS DECOUPLING]
  ├── Controller Non-Blocking (HTTP 202 Accepted < 200ms)
  ├── BullMQ Worker Offloading: GPT-4o Synthesis ──► DALL-E 3 Generation ──► R2 Stream
  └── Real-Time Event-Driven Progress (Redis Pub/Sub ──► SSE ──► Browser Dewan)

[SUB-FASE 2.3: UU PDP CRYPTOGRAPHY & VERIFIKASI DOMAIN]
  ├── Tenant-Isolated PII Encryption (HKDF Key Derivation per Tenant)
  └── DNS Ownership Challenge (TXT Token & CNAME Verification untuk Custom Domain)
========================================================================================
```

---

## SUB-FASE 2.1: Semantic RAG Grounding Engine & Real Vector Similarity

### 1. Analisis Masalah & Integritas Hukum
* **Kondisi Eksisting:** 
  Pada `constituent.service.ts::askCivicAssistant`, sistem menggunakan array statis `new Array(1536).fill(0.01)` untuk mencari pasal regulasi. Jawaban yang dihasilkan asisten digital ke warga tidak memiliki relevansi semantik dengan pertanyaan, berisiko tinggi memicu misinformasi hukum daerah.
* **Solusi Arsitektural:** 
  Membangun pipa RAG (*Retrieval-Augmented Generation*) otentik: pertanyaan warga di-vektorisasi secara dinamis, disandingkan dengan basis data perda/regulasi di `knowledge_chunks` menggunakan indeks HNSW pgvector berjarak kosinus (*Cosine Distance*), dengan batasan skor kemiripan minimum (*similarity threshold* $\ge 0.70$).

### 2. Penetapan Tanggung Jawab GRASP
* **Information Expert:** `KnowledgeChunkRepository` / `@polaris/database (findSimilarKnowledgeChunks)` paling mengetahui cara menghitung jarak vektor dan filter yurisdiksi.
* **Pure Fabrication:** `RagRetrievalService` dibuat khusus untuk mengorkestrasi *embedding generation*, *vector matching*, dan *context assembly*, sehingga controller tetap ramping (*Thin Controller*).
* **Protected Variations:** Mengisolasi model embedding (`text-embedding-3-small`) di dalam `@polaris/ai-engine` agar jika kelak bermigrasi ke model lokal (misal: BGE-M3 / HuggingFace), lapisan use-case tidak terpengaruh.

### 3. Berkas yang Terdampak
1. `packages/ai-engine/src/ai-engine.adapter.ts` (tambah metode `generateEmbedding`)
2. `packages/core-domain/src/ports/llm-provider.port.ts` (tambah definisi kontrak embedding)
3. `packages/database/src/vector.ts` (penyempurnaan query pgvector threshold & ranking)
4. `apps/api-core/src/modules/constituent/constituent.service.ts`

### 4. Rincian Milestone Kerja (Step-by-Step)
* **Langkah 2.1.1 (Kontrak Port Embedding):** 
  Tambahkan fungsi `generateEmbedding(text: string): Promise<number[]>` pada interface `ILLMProviderPort` dan implementasikan di `OpenAIAIEngineAdapter` menggunakan `text-embedding-3-small` (1536 dimensi).
* **Langkah 2.1.2 (Penyempurnaan Query HNSW pgvector):**
  Perbarui fungsi `findSimilarKnowledgeChunks` di `@polaris/database` agar menerima parameter `minSimilarityScore: number = 0.65`, dan melakukan pengurutan strictly berbasis operator `<=>` (Cosine Distance) dengan paginasi top-k.
* **Langkah 2.1.3 (Grounding Asisten Warga Real-Time):**
  Refaktor `ConstituentService::askCivicAssistant`:
  1. Hasilkan vektor asli dari teks aduan warga.
  2. Cari dokumen regulasi terdekat di wilayah dapil terkait.
  3. Jika skor kemiripan di bawah batas toleransi, gunakan *safe fallback prompt* ("Menunggu telaah regulasi resmi komisi").
  4. Catat trace retrieval ke Langfuse untuk pemantauan akurasi jawaban publik.

---

## SUB-FASE 2.2: Asynchronous BullMQ Orchestration & Non-Blocking HTTP Controller

### 1. Analisis Masalah & Latensi Sistem
* **Kondisi Eksisting:** 
  Pada `studio.service.ts::generateNewContentPackage`, seluruh rangkaian proses (GPT-4o 3.000 kata $\sim$ 15 detik, ekstraksi infografis $\sim$ 3 detik, DALL-E 3 $\sim$ 10 detik, Sharp WebP compression $\sim$ 2 detik, upload Cloudflare R2 $\sim$ 3 detik) dieksekusi secara **sinkron di thread HTTP NestJS**.
  * **Risiko Fatal:** Total latensi 30–45 detik menyebabkan koneksi HTTP rawan terkena *Cloudflare Error 524 (A timeout occurred)*, thread Node.js terblokir, dan UI browser dewan rentan *crash*.
* **Solusi Arsitektural:** 
  Terapkan pola **Asynchronous Job Pattern (Queue-Worker-PubSub)**. Permintaan dari dewan langsung dijawab dalam $< 200\text{ ms}$ dengan HTTP 202 Accepted dan tiket `jobId`. Eksekusi berat dialihkan ke worker BullMQ di `apps/worker-crawler`, dengan pembaruan progres bertahap via Server-Sent Events (SSE).

### 2. Penetapan Tanggung Jawab GRASP
* **Controller:** `StudioController` hanya bertugas menerima payload, memvalidasi input, mencatat *initial placeholder* ke database, dan mendisposisikan job ke antrean BullMQ.
* **Indirection:** Antrean Redis `studioGenerationQueue` menjadi perantara pemisah antara web server API dengan daemon background worker.
* **Low Coupling:** Modul `api-core` tidak lagi bergantung langsung pada pustaka pengolah gambar berat (`sharp`) atau SDK Cloudflare R2 untuk DALL-E; seluruh dependensi tersebut diisolasi di `worker-crawler`.

### 3. Berkas yang Terdampak
1. `apps/worker-crawler/src/queues/studio.queue.ts` *(Berkas Baru)*
2. `apps/worker-crawler/src/processors/studio-generation.processor.ts` *(Berkas Baru)*
3. `apps/worker-crawler/src/worker.ts` (Registrasi worker baru)
4. `apps/api-core/src/modules/studio/studio.controller.ts` (Ubah status response HTTP 202)
5. `apps/api-core/src/modules/studio/studio.service.ts` (Refaktor ke Producer BullMQ)
6. `packages/database/src/schema/content.ts` (Tambahkan status `GENERATING` pada publikasi)

### 4. Rincian Milestone Kerja (Step-by-Step)
* **Langkah 2.2.1 (Pembaruan Status Konten):**
  Tambahkan nilai `'GENERATING'` pada `content_status_enum` di basis data, agar artikel yang sedang diproses AI dapat memiliki status transisi yang jelas sebelum menjadi `DRAFT`.
* **Langkah 2.2.2 (Pembuatan Producer Antrean di `api-core`):**
  Di `StudioService`, buat method `enqueueContentGenerationJob()` yang:
  1. Menyimpan record publikasi awal dengan status `GENERATING`.
  2. Mendorong job ke Redis BullMQ (`studio-content-generation-queue`).
  3. Mengembalikan respons instan berisi `{ jobId, publicationId, status: 'GENERATING' }`.
* **Langkah 2.2.3 (Pembuatan Consumer Processor di `worker-crawler`):**
  Buat `StudioGenerationProcessor` yang berjalan di daemon worker terpisah:
  1. *Step 1 (20%):* Scraping web dan OCR attachment.
  2. *Step 2 (50%):* Sintesis naskah 3.000 kata via OpenAI GPT-4o.
  3. *Step 3 (75%):* Generate poster via DALL-E 3 & konversi WebP via Sharp langsung ke Cloudflare R2.
  4. *Step 4 (90%):* Generate varian media sosial (WA, IG, X).
  5. *Step 5 (100%):* Update status publikasi menjadi `DRAFT`, catat konsumsi token/biaya ke `tenant_quota_ledgers`, lalu picu notifikasi selesai via Redis Pub/Sub ke browser dewan.

---

## SUB-FASE 2.3: Kriptografi PII Terisolasi (UU PDP) & Verifikasi Kepemilikan Custom Domain

### 1. Analisis Masalah & Kepatuhan Regulasi
* **Masalah PII (UU PDP):** 
  Saat ini, enkripsi data nama & nomor HP warga di `pii-crypto.service.ts` menggunakan satu *symmetric key* statis global. Jika kunci tersebut bocor, seluruh database warga dari ratusan anggota dewan dapat didekripsi secara massal.
* **Masalah Custom Domain:** 
  Pada `cms.service.ts::updateDomainConfig`, anggota dewan dapat memasukkan domain institusi manapun (misal: `dpr.go.id` atau `jabarprov.go.id`) dan langsung terikat di database tanpa verifikasi kepemilikan DNS.
* **Solusi Arsitektural:**
  1. **Enkripsi PII Bertingkat (*Envelope / Key Derivation*):** Turunkan kunci enkripsi unik per tenant menggunakan algoritma **HKDF (HMAC-based Extract-and-Expand Key Derivation Function)** dengan master secret + tenant ID sebagai salt.
  2. **Tantangan Kepemilikan DNS (*DNS Ownership Challenge*):** Terapkan siklus verifikasi: saat dewan mendaftarkan domain, sistem menerbitkan verifikasi CNAME (mengarahkan ke `cname.polaris.id`) atau token TXT. Domain hanya diaktifkan jika DNS record telah tervalidasi via DNS resolver.

### 2. Penetapan Tanggung Jawab GRASP
* **Protected Variations:** Algoritma enkripsi PII diproteksi dalam `PiiCryptoService` dengan kunci dinamis berbasis tenant context.
* **High Cohesion:** Modul domain verification memegang tanggung jawab tunggal untuk validasi jaringan DNS sebelum mengizinkan rute trafik di proxy web publik.

### 3. Berkas yang Terdampak
1. `apps/api-core/src/modules/constituent/pii-crypto.service.ts`
2. `packages/database/src/schema/cms.ts` (Tambah kolom verifikasi custom domain)
3. `apps/api-core/src/modules/cms/cms.service.ts` & `cms.controller.ts`
4. `packages/database/src/migrations/0004_domain_verification_and_pii.sql` *(Berkas Baru)*

### 4. Rincian Milestone Kerja (Step-by-Step)
* **Langkah 2.3.1 (Refaktorisasi Kriptografi HKDF Per-Tenant):**
  Perbarui `PiiCryptoService` agar method enkripsi dan dekripsi mewajibkan parameter `tenantId`. Kunci enkripsi diturunkan secara deterministik via `crypto.hkdfSync('sha256', MASTER_KEY, tenantId, 'polaris-citizen-pii', 32)`. Kebocoran satu tenant tidak akan membahayakan data tenant lain.
* **Langkah 2.3.2 (Skema Verifikasi Custom Domain):**
  Tambahkan kolom ke tabel `portal_configs`:
  * `custom_domain_status VARCHAR(30) DEFAULT 'UNVERIFIED'`
  * `dns_verification_token VARCHAR(64)`
  * `domain_verified_at TIMESTAMPTZ`
* **Langkah 2.3.3 (Endpoint Cek DNS Resolver):**
  Di `CmsService`, buat method `verifyCustomDomainDns(tenantId)` yang memanggil Node.js `dns.promises.resolveCname` untuk memastikan domain mengarah ke target CNAME resmi POLARIS sebelum mengaktifkan perutean publik.

---

# DEFINITION OF DONE (DoD) FASE 2

Fase 2 dinyatakan tuntas apabila memenuhi kriteria pengujian berikut:

1. **Uji Relevansi RAG:**
   * Pertanyaan warga mengenai "bantuan pupuk" diuji pada sistem, menghasilkan embedding vektor riil yang terbukti menarik chunk perda pertanian, terekam valid di dashboard Langfuse dengan skor relevansi $> 0.70$.
2. **Uji Asinkron & Ketahanan Server:**
   * Panggilan ke endpoint `POST /api/v1/studio/generate` merespons dalam waktu $< 300\text{ ms}$ dengan HTTP status `202 Accepted`.
   * Worker `worker-crawler` mengambil antrean job, memproses naskah, merender poster, dan mengunggah ke R2 tanpa memblokir thread HTTP utama.
   * Progres pemrosesan ($25\% \rightarrow 50\% \rightarrow 75\% \rightarrow 100\%$) terpancar mulus secara real-time ke antarmuka dashboard dewan via SSE.
3. **Uji Kompartemen Kriptografi PII:**
   * Ciphertext data warga yang dienkripsi untuk Dewan A tidak dapat didekripsi menggunakan konteks kunci Dewan B.
4. **Uji Validasi Custom Domain:**
   * Upaya menghubungkan custom domain sembarang tanpa konfigurasi DNS CNAME yang valid akan ditolak dengan status `UNVERIFIED` dan tidak akan diarahkan oleh proxy.
