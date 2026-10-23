# Audit & Cetak Biru Arsitektur: Adaptive Creative Poster Generation
**Dokumen Referensi Arsitektur Polaris AI Engine & Visual Compositor**

---

## 1. Audit Kritis Kondisi Codebase Saat Ini

Ada **4 temuan krusial** di dalam kode saat ini yang secara langsung menyabotase kualitas dan kesatuan komposisi poster:

### A. Ilusi "Art Director Dinamis" (AI Memutuskan, tapi Satori Mengabaikan!)
Di `packages/ai-engine/src/creative-poster/prompt-compiler.ts` (baris 55–85), sistem sudah menambahkan instruksi agar LLM bertindak sebagai *Art Director* dan mengeluarkan properti JSON dinamis:
- `layoutVariant`: `'TOP_BANNER' | 'BOTTOM_ANCHOR' | 'EDITORIAL_SPLIT' | 'CENTERED_HERO'`
- `headerPlacement`: `'top' | 'bottom' | 'center'`
- `cardArrangement`: `'stacked' | 'horizontal_split' | 'single_hero_card' | 'grid_compact'`

**TETAPI**, di `packages/storage/src/creative-poster/layouts/` (`pop-out-hero.layout.ts`, `street-journalism.layout.ts`, `statement-profile.layout.ts`, `retro-campaign.layout.ts`, `modular-cards.layout.ts`, dll.):
- **Tidak ada satu pun dari file layout Satori tersebut yang membaca `copy.layoutVariant`, `copy.headerPlacement`, atau `copy.cardArrangement`!**
- Semua koordinat, urutan Flexbox (`justifyContent: 'space-between'`), dan posisi kartu di dalam ke-23 file `.layout.ts` tersebut masih **100% statis (hardcoded)**. Akibatnya, meskipun AI sudah susah payah memilih `EDITORIAL_SPLIT` atau `BOTTOM_ANCHOR`, Satori tetap merender tata letak yang sama persis setiap kali template itu terpilih.

### B. Regresi di `PosterBlueprintSelector`: Dari *Semantic Matching* Menjadi "Judi Dadu" (`Math.random`)
Di versi sebelumnya, `selector.ts` memiliki *Domain-Specific Semantic Intent Weighting* (topik anggaran masuk ke grid kartu, topik bencana masuk ke mitigasi, topik tokoh masuk ke gazette).
Namun saat ini di `selector.ts` baris 21–60, logika itu dihapus dan diganti menjadi **True RNG (undian acak buta tanpa membaca topik sama sekali)**:
```typescript
const randomIndex = Math.floor(Math.random() * pool.length);
const chosen = pool[randomIndex];
```
**Risiko Fatalnya:**
Ketika anggota dewan membuat konten serius tentang **"Bencana Banjir & Evakuasi Darurat"**, sistem lempar dadu bisa memilih `TPL-11-CREATIVE-POP-COLLAGE` (*"Komposisi pop modern dengan stiker ceria"*) atau `TPL-22-POP-CULTURE-COMMENTARY` (*"Yeh marketing nahi... gaya pop santai"*) dengan palet warna *Pink/Violet* acak dari `getRandomHarmoniousPalette()`! Ini menghancurkan *content-driven decision*.

### C. *Hard-Maintenance Trap*: 22 File Layout Statis yang Tidak *Scalable*
Saat ini terdapat 22–23 fungsi layout Satori terpisah untuk 22 gambar referensi di folder `uploads/references/poster/`.
Jika nanti ditambah 100 atau 500 referensi poster baru, mustahil membuat 500 file `.layout.ts` secara manual. Lebih buruk lagi, di `catalog.ts`, telah didefinisikan `slotManifest.slots` lengkap dengan koordinat `{ x, y, w, h }`, namun banyak fungsi `.layout.ts` di Satori yang **mengabaikan angka koordinat di `slotManifest` tersebut** dan malah mendefinisikan ukuran `px` sendiri secara manual di dalam Flexbox.

### D. Mengapa Hasilnya Terasa Seperti "Background Ditempeli Komponen"?
Di `prompt-compiler.ts` (baris 263) dan `google-imagen.adapter.ts` (baris 67 & 91):
- Di `zeroMandate`, diperintahkan AI Image: *"Absolutely ZERO human faces, ZERO portraits, ZERO people..."*.
- Lalu di Satori (`pop-out-hero.layout.ts`, `statement-profile.layout.ts`, dll.), hampir semua teks dibungkus dengan **kotak latar gelap/putih tebal (`getProtectiveCardStyle`, `rgba(8, 12, 22, 0.86)`, `border`, `boxShadow`)**.
- **Akar Masalah Visualnya:** Di poster referensi asli (seperti *The Edge*, *Techno Veritas*, *Modern Typography*, atau *Steve Jobs*), teks itu **menyatu langsung dengan ruang kosong (negative space) kanvas atau berinteraksi dengan objek foto**—bukan dikurung di dalam kotak-kotak *card UI web/dashboard*! Ketika Satori menumpuk kotak-kotak `div` ber-border dan ber-shadow di atas gambar Imagen/DALL-E, hasilnya terlihat seperti **"komponen UI web yang ditempel di atas wallpaper"**, bukan sebuah karya poster grafis terpadu.

---

## 2. Evaluasi Strategis: Full-Poster AI vs Hybrid Satori untuk Konteks Politik Polaris

Dalam domain spesifik **Polaris (Komunikasi Politik & Parlemen Indonesia)**, kita tidak bisa menggunakan 100% *Full-Poster Generation* untuk seluruh elemen karena **3 kendala hukum & reputasi politik**:
1. **Wajah Anggota Dewan & Logo Partai/DPR:** Tidak boleh digenerate ulang oleh model difusi (Imagen 3 / DALL-E 3) karena pergeseran struktur wajah sedikit saja akan terlihat seperti *deepfake*/kartun, dan distorsi logo partai/lambang negara melanggar aturan atribut resmi.
2. **Ejaan Bahasa Indonesia & Angka APBD:** Model gambar modern memang sudah lebih pintar merender judul pendek 2–3 kata, tetapi untuk **paragraf narasi Bahasa Indonesia (150–250 karakter), gelar akademik panjang (`Dr. Ir. H. ..., S.T., M.Si.`), dan angka statistik spesifik**, tingkat halusinasi ejaannya masih di atas 40%.

### Solusi Terbaik: **Two-Tier Adaptive Hybrid Architecture**

| Lapisan Elemen | Siapa yang Bertanggung Jawab? | Cara Kerjanya agar Menyatu (Tidak Terlihat Seperti Tempelan UI) |
| --- | --- | --- |
| **1. Kanvas, Struktur Grafis, Tekstur & Subjek Ilustrasi** | **Image Model (Imagen 3 / DALL-E)** dipandu oleh *Spatial Prompt* dari *Composition Plan*. | AI Image tidak hanya membuat "pemandangan kosong", melainkan membuat **komposisi poster lengkap tanpa huruf**: sudah termasuk blok warna grafis, robekan kertas, *halftone cutout* objek/masyarakat (jika mode `PUBLIC_ADVOCACY`), dan pencahayaan *negative space* sesuai *Composition Plan*. |
| **2. Tipografi Editorial (Headline, Kolom Koran, Data)** | **Parametric Satori Engine** (Dikendalikan oleh output JSON *Composition Engine*). | **HAPUS gaya "Kotak UI/Card Dashboard"!** Satori hanya merender tipografi murni (*raw editorial typography*), garis tipis (*hairline rules*), dan *grid* koran langsung di atas *negative space* yang sudah disiapkan oleh AI Image. |
| **3. Wajah Tokoh Dewan & Logo Resmi** | **Sharp + Satori Compositor**. | Foto asli dewan di-harmonisasi warnanya (*duotone / B&W halftone / color-grade match*) menggunakan Sharp agar menyatu dengan *grain* kertas Layer 1, bukan sekadar ditempel mentah. |

---

## 3. Redesain Arsitektur 4-Lapisan

### Lapisan 1: Reference Intelligence Pipeline (AI Vision Ingestion)
- Otomasi ekstraksi blueprint dari gambar referensi di `uploads/references/poster/` menggunakan **`PosterReferenceVisionAnalyzer`** (`gpt-4o` Vision / `gemini-2.5-pro` Vision).
- Ekstrak ke skema database:
  - `visualStyleTokens`: Tekstur permukaan, teknik foto, kontras.
  - `structuralPrimitives`: `['MASTHEAD_HEADER', 'THREE_COLUMN_NEWS', 'CENTRAL_CUTOUT', 'CIRCULAR_STAT_BADGES', 'BOTTOM_SOLID_BLOCK']`.
  - `spatialZones`: Koordinat persentase `{ x, y, w, h }` zona visual vs zona teks (*negative space*).
  - `fixedConstraints`: Identitas wajib referensi (latar kertas, robekan vertikal, tipografi Serif klasik).
  - `variationRules`: Bagian yang diizinkan berubah (posisi foto, judul atas/bawah, variasi kolom).

### Lapisan 2: Creative Composition Engine (Otak Pengambil Keputusan Komposisi)
Menerima `DesignBlueprint`, `Topic & Content Density`, dan `User Assets`, lalu menghasilkan **`CompositionPlan` (JSON)** adaptif:
- Konten Padat Data/Anggaran $\rightarrow$ Variasi "Editorial Analytical Grid": Ruang teks 3 kolom + lencana statistik, foto sebagai *supporting cutout*.
- Konten Pernyataan Sikap/Tokoh $\rightarrow$ Variasi "Hero Centerpiece / Asymmetric Split": Foto tokoh mengambil 50% ruang, *headline* masif (`110px`), narasi 1 *pull-quote* tajam.
- Mutasi Layout Geometris untuk referensi yang sama: User A, B, dan C menghasilkan komposisi berbeda sesuai kepadatan isu.

### Lapisan 3: Parametric Satori Renderer (Menggantikan 22 File Layout Statis)
Membangun **1 Mesin Renderer Parametrik (`ParametricSatoriRenderer`)** dengan **Editorial Primitives**:
1. `MastheadPrimitive` (Header koran/majalah/garis edisi)
2. `HeadlinePrimitive` (Judul masif tipografi murni, *interlocking*, atau *solid band*—tanpa kotak *card*)
3. `EditorialColumnsPrimitive` (1, 2, atau 3 kolom koran dengan garis pemisah vertikal *hairline*)
4. `StatBadgesPrimitive` (Lingkaran statistik / kartu bernomor `01-05`)
5. `PhotoFramePrimitive` (Bingkai polaroid, torn-paper, circular inset, cutout)
6. `MemberSignaturePrimitive` (Atribusi nama dewan, jabatan, logo partai di sudut aman)

*Manfaat:* Menambah 500 referensi di masa depan cukup via Vision Ingestor (menambah row JSON di DB), tanpa menulis kode `.layout.ts` baru.

### Lapisan 4: Visual Quality Evaluation & Targeted Revision Loop
Setelah Sharp + Satori merakit poster menjadi buffer gambar:
- Multimodal Vision Auditor (`gpt-4o-mini` Vision / `gemini-2.5-flash` Vision) mengecek:
  1. **Readability & Contrast Check:** Jika teks tidak terbaca $\rightarrow$ *Revisi Komposisi*: sesuaikan warna teks / aktifkan scrim halus di Satori (< 500ms) tanpa regenerasi gambar AI.
  2. **Overlap / Collision Check:** Jika teks menabrak objek gambar $\rightarrow$ *Revisi Komposisi*: ubah penempatan elemen di Satori.
  3. **Style & Atmosphere Fidelity:** Jika kanvas tidak sesuai $\rightarrow$ *Revisi Aset*: baru memicu regenerasi Layer 1 dengan penyesuaian prompt.

---

## 4. Peta Perbandingan: Kondisi Sekarang vs Target Arsitektur

| Komponen | Status Saat Ini | Perubahan Arsitektural yang Diperlukan |
| --- | --- | --- |
| **Pemilihan Referensi (`selector.ts`)** | `Math.random()` murni (buta topik) & menimpa warna referensi secara acak. | Kembalikan **Semantic Intent Matching**, pertahankan **`fixedConstraints` warna asli referensi** kecuali pengguna meminta warna partai. |
| **Representasi Referensi (`catalog.ts`)** | 22 item dengan `scenePromptHint` statis, tanpa `variationRules` / `fixedConstraints`. | Tambahkan skema `fixedConstraints` dan `allowedVariations`, siapkan fondasi untuk AI Vision ingestion. |
| **Perencanaan Komposisi (`prompt-compiler.ts`)** | Menghasilkan `layoutVariant`, `headerPlacement`, `cardArrangement`, tapi diabaikan Satori. | Evolusi menjadi **`CreativeCompositionEngine`**: menghasilkan `CompositionPlan` sinkron untuk ruang spasial Imagen dan penataan Satori. |
| **Eksekusi Satori (`layouts/*.layout.ts`)** | 23 file statis; membungkus teks dengan kotak UI gelap ber-border (`getProtectiveCardStyle`). | 1. Layout membaca & mematuhi `layoutVariant` secara nyata.<br>2. Ganti kotak card UI dengan **integrasi tipografi editorial murni** (negative space, blend, hairline grid). |
| **Evaluasi Hasil (`VisualQA`)** | Belum ada (langsung simpan ke R2). | Tambahkan modul ringan `PosterVisualQAGate` untuk audit kontras/tabrakan pasca-render dan trigger *re-layout* cepat jika perlu. |

---

## 5. Rencana Fase Eksekusi Bertahap

1. **Fase 1: Menyambungkan "Otak Komposisi" ke Satori & Menghilangkan Kesan Tempelan UI**
   - Kembalikan semantic matching di `selector.ts`.
   - Hubungkan output `layoutVariant`, `headerPlacement`, dan `cardArrangement` ke renderer Satori.
   - Bersihkan styling "Kotak Card UI Dashboard" menjadi tipografi editorial murni di atas negative space.
2. **Fase 2: Membangun `VisionReferenceAnalyzer` untuk Katalog Dinamis**
   - Ingestion otomatis referensi poster baru menjadi blueprint JSON tanpa coding manual.
3. **Fase 3: Menambahkan `VisualQualityAssurance` Loop**
   - Audit kontras dan layout pasca-komposisi dengan re-layout sub-detik jika terdeteksi tabrakan.
