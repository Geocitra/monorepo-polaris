export interface ExchangeRateSnapshot {
  rateIdrPerUsd: number;
  source: 'open.er-api.com' | 'frankfurter.app' | 'jsdelivr-currency-api' | 'fallback-emergency';
  fetchedAt: string;
  isLive: boolean;
}

/**
 * DynamicExchangeRate
 * Layanan terpusat konversi kurs real-time USD -> IDR dengan Multi-Provider Failover & In-Memory Cache.
 * Memastikan seluruh perhitungan biaya token OpenAI & Gemini selalu menggunakan Rupiah (IDR) aktual.
 */
export class DynamicExchangeRate {
  public static readonly EMERGENCY_FALLBACK_IDR_PER_USD = 16350;
  public static readonly MIN_SANITY_RATE_IDR = 12000;
  public static readonly MAX_SANITY_RATE_IDR = 30000;
  public static readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 Jam

  private static cachedSnapshot: ExchangeRateSnapshot = {
    rateIdrPerUsd: DynamicExchangeRate.EMERGENCY_FALLBACK_IDR_PER_USD,
    source: 'fallback-emergency',
    fetchedAt: new Date(0).toISOString(),
    isLive: false,
  };

  private static lastFetchedTimestamp = 0;
  private static inflightPromise: Promise<ExchangeRateSnapshot> | null = null;

  /**
   * Mengambil snapshot kurs USD -> IDR secara asynchronous (dengan multi-tier failover & cache 1 jam).
   */
  public static async getLiveUsdToIdrSnapshot(forceRefresh = false): Promise<ExchangeRateSnapshot> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.cachedSnapshot.isLive &&
      now - this.lastFetchedTimestamp < this.CACHE_TTL_MS
    ) {
      return this.cachedSnapshot;
    }

    if (this.inflightPromise) {
      return this.inflightPromise;
    }

    this.inflightPromise = this.fetchFromProviders()
      .then((snapshot) => {
        this.cachedSnapshot = snapshot;
        this.lastFetchedTimestamp = Date.now();
        this.inflightPromise = null;
        return snapshot;
      })
      .catch(() => {
        this.inflightPromise = null;
        return this.cachedSnapshot;
      });

    return this.inflightPromise;
  }

  /**
   * Mengembalikan angka kurs USD -> IDR secara langsung untuk pemanggilan synchronous,
   * sambil memicu pembaruan non-blocking di latar belakang jika cache sudah kedaluwarsa.
   */
  public static getCurrentRateSync(): number {
    const now = Date.now();
    if (now - this.lastFetchedTimestamp >= this.CACHE_TTL_MS && !this.inflightPromise) {
      void this.getLiveUsdToIdrSnapshot();
    }
    return this.cachedSnapshot.rateIdrPerUsd;
  }

  /**
   * Mengembalikan snapshot terakhir yang tersimpan di memori (dan memicu refresh di background bila perlu).
   */
  public static getCurrentSnapshotSync(): ExchangeRateSnapshot {
    const now = Date.now();
    if (now - this.lastFetchedTimestamp >= this.CACHE_TTL_MS && !this.inflightPromise) {
      void this.getLiveUsdToIdrSnapshot();
    }
    return this.cachedSnapshot;
  }

  /**
   * Memungkinkan injeksi kurs dari Redis / eksternal agar semua worker berbagi kurs yang seragam.
   */
  public static hydrateSnapshot(snapshot: ExchangeRateSnapshot): void {
    if (this.isValidRate(snapshot.rateIdrPerUsd)) {
      this.cachedSnapshot = snapshot;
      this.lastFetchedTimestamp = Date.now();
    }
  }

  private static isValidRate(rate: unknown): rate is number {
    return (
      typeof rate === 'number' &&
      Number.isFinite(rate) &&
      rate >= this.MIN_SANITY_RATE_IDR &&
      rate <= this.MAX_SANITY_RATE_IDR
    );
  }

  private static async fetchWithTimeout(url: string, timeoutMs = 3500): Promise<any> {
    const AbortControllerCtor = (globalThis as any).AbortController;
    const controller = AbortControllerCtor ? new AbortControllerCtor() : undefined;
    const setTimer = (globalThis as any).setTimeout as (fn: () => void, ms: number) => any;
    const clearTimer = (globalThis as any).clearTimeout as (id: any) => void;
    const fetchFn = (globalThis as any).fetch as (url: string, init?: any) => Promise<any>;

    const timer = setTimer ? setTimer(() => controller?.abort?.(), timeoutMs) : undefined;
    try {
      if (!fetchFn) {
        throw new Error('Global fetch unavailable');
      }
      const response = await fetchFn(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller?.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } finally {
      if (timer && clearTimer) clearTimer(timer);
    }
  }

  private static async fetchFromProviders(): Promise<ExchangeRateSnapshot> {
    // Provider 1: Open Exchange Rates API (No Key Required, High Reliability)
    try {
      const data = await this.fetchWithTimeout('https://open.er-api.com/v6/latest/USD');
      const idrRate = Number(data?.rates?.IDR);
      if (this.isValidRate(idrRate)) {
        return {
          rateIdrPerUsd: Math.round(idrRate * 100) / 100,
          source: 'open.er-api.com',
          fetchedAt: new Date().toISOString(),
          isLive: true,
        };
      }
    } catch {
      // Lanjut ke Provider 2
    }

    // Provider 2: Frankfurter API (European Central Bank Reference Rate)
    try {
      const data = await this.fetchWithTimeout(
        'https://api.frankfurter.app/latest?from=USD&to=IDR',
      );
      const idrRate = Number(data?.rates?.IDR);
      if (this.isValidRate(idrRate)) {
        return {
          rateIdrPerUsd: Math.round(idrRate * 100) / 100,
          source: 'frankfurter.app',
          fetchedAt: new Date().toISOString(),
          isLive: true,
        };
      }
    } catch {
      // Lanjut ke Provider 3
    }

    // Provider 3: Fawazahmed0 Currency API via jsDelivr CDN
    try {
      const data = await this.fetchWithTimeout(
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
      );
      const idrRate = Number(data?.usd?.idr);
      if (this.isValidRate(idrRate)) {
        return {
          rateIdrPerUsd: Math.round(idrRate * 100) / 100,
          source: 'jsdelivr-currency-api',
          fetchedAt: new Date().toISOString(),
          isLive: true,
        };
      }
    } catch {
      // Semua provider gagal atau tanpa jaringan internet
    }

    if (this.cachedSnapshot.isLive) {
      return this.cachedSnapshot;
    }

    return {
      rateIdrPerUsd: this.EMERGENCY_FALLBACK_IDR_PER_USD,
      source: 'fallback-emergency',
      fetchedAt: new Date().toISOString(),
      isLive: false,
    };
  }
}

