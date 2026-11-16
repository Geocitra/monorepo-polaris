# Polaris Platform — AI & Collaboration Guidelines

Dokumen ini dibaca oleh developer dan AI coding assistant saat bekerja di repository `polaris-platform`.

## 1. Arsitektur Provider AI (`packages/ai-engine`)

### Aturan Utama (Production)
- **Narasi / Copywriting / Text**: WAJIB menggunakan **OpenAI API langsung** (`openaiClient`).
- **Generasi Gambar & Vision**: WAJIB menggunakan **Google Gemini / Imagen API langsung** (`googleGenAiClient`).
- **Telemetry & Billing**: Semua pemanggilan AI (text, vision, image) WAJIB dibungkus `AiTelemetryService.startTrace(...)` dan `telemetry.endTrace(...)`. Jangan pernah menghapus atau melewati `AiTelemetryService`.

### Mode Local Development (9Router)
Jika developer ingin menggunakan **9Router** di mesin lokal:
1. **DILARANG** mengubah kode di `packages/ai-engine/src/` untuk memaksa/hardcode 9Router, `127.0.0.1:20128`, prefix `ag/`, atau menghapus jalur OpenAI/Gemini resmi.
2. Cukup aktifkan lewat `.env` lokal:
   ```env
   AI_USE_ROUTER=true
   ROUTER_BASE_URL="http://127.0.0.1:20128/v1"
   ROUTER_API_KEY="your-local-router-key"
   ```
3. Seluruh routing dikendalikan terpusat di `packages/ai-engine/src/client.ts`:
   - `isRouterEnabled` hanya bernilai `true` jika `process.env.AI_USE_ROUTER === 'true'` (default `false`).
   - Gunakan `getTextCompletionClient()` untuk panggilan OpenAI-compatible chat/narasi.
   - Gunakan `googleGenAiClient` / `createGoogleGenAiClient()` untuk Gemini SDK.
   - Gunakan `normalizeGeminiModel()` untuk nama model (otomatis menambah prefix `ag/` hanya saat `AI_USE_ROUTER=true`, dan menghapusnya di Production).

## 2. Aturan Git & Kolaborasi Tim

- **Sinkronisasi Rutin**: Selalu `git fetch origin && git merge origin/main` (atau `rebase`) sebelum memulai fitur baru dan sebelum membuat PR.
- **Commit Kecil & Fokus**: Hindari menggabungkan perubahan aset/template, layout compositor, dan adapter AI dalam satu commit raksasa.
- **Jangan Commit Rahasia / Config Lokal**: API key dan `AI_USE_ROUTER=true` hanya boleh berada di `.env` lokal (yang di-ignore Git), bukan di source code.

