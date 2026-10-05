const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiClient {
  public static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    let token: string | null = null;
    try {
      token = localStorage.getItem('polaris_token');
    } catch {}

    // Fallback: periksa cookie polaris_session jika localStorage kosong
    if (!token) {
      const match = document.cookie.match(/(?:^|;\s*)polaris_session=([^;]+)/);
      if (match && match[1]) {
        token = decodeURIComponent(match[1]);
        try {
          localStorage.setItem('polaris_token', token);
        } catch {}
      }
    } else {
      // Pastikan cookie polaris_session selalu sinkron dan aktif
      const hasCookie = document.cookie.includes('polaris_session=');
      if (!hasCookie) {
        document.cookie = `polaris_session=${encodeURIComponent(token)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
    }

    return token;
  }

  public static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('polaris_token', token);
      } catch {}
      // Simpan cookie sesi bertahan 30 hari untuk Next.js middleware & SSR
      document.cookie = `polaris_session=${encodeURIComponent(token)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    }
  }

  public static removeToken(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('polaris_token');
        localStorage.removeItem('polaris_user');
      } catch {}
      // Hapus cookie sesi
      document.cookie = 'polaris_session=; path=/; max-age=0; SameSite=Lax';
      // PENTING: polaris_theme_mode dan polaris_theme_colors TIDAK dihapus agar tema tetap tersimpan!
    }
  }

  public static isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        this.removeToken();
      }
      throw new Error(data?.error?.message || data?.message || 'Terjadi kesalahan sistem.');
    }

    return data as T;
  }
}

export class AdminApiClient {
  private static readonly TOKEN_KEY = 'polaris_admin_token';
  private static readonly USER_KEY = 'polaris_admin_user';

  public static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    let token: string | null = null;
    try {
      token = localStorage.getItem(this.TOKEN_KEY);
    } catch {}

    if (!token) {
      const match = document.cookie.match(/(?:^|;\s*)polaris_admin_session=([^;]+)/);
      if (match && match[1]) {
        token = decodeURIComponent(match[1]);
        try {
          localStorage.setItem(this.TOKEN_KEY, token);
        } catch {}
      }
    }
    return token;
  }

  public static getUser(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public static setAuth(token: string, adminUser: any): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(adminUser));
      } catch {}
      document.cookie = `polaris_admin_session=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
  }

  public static logout(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
      } catch {}
      document.cookie = 'polaris_admin_session=; path=/; max-age=0; SameSite=Lax';
    }
  }

  public static isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        this.logout();
        window.location.href = '/superadmin/login';
      }
      throw new Error(data?.error?.message || data?.message || 'Terjadi kesalahan sistem.');
    }

    return data as T;
  }
}

