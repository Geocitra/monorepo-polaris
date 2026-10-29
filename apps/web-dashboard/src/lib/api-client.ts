const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiClient {
  public static readonly SESSION_DURATION_SEC = 24 * 60 * 60; // 24 jam (1 hari)
  public static readonly EXPIRES_KEY = 'polaris_token_expires_at';

  public static getToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Cek hard expiration timestamp di client
    try {
      const expiresAt = localStorage.getItem(this.EXPIRES_KEY);
      if (expiresAt && Date.now() > Number(expiresAt)) {
        this.removeToken();
        return null;
      }
    } catch {}

    let token: string | null = null;
    try {
      token = localStorage.getItem('polaris_token');
    } catch {}

    if (!token) {
      const match = document.cookie.match(/(?:^|;\s*)polaris_session=([^;]+)/);
      if (match && match[1]) {
        token = decodeURIComponent(match[1]);
        try {
          localStorage.setItem('polaris_token', token);
          if (!localStorage.getItem(this.EXPIRES_KEY)) {
            localStorage.setItem(this.EXPIRES_KEY, String(Date.now() + this.SESSION_DURATION_SEC * 1000));
          }
        } catch {}
      }
    } else {
      const hasCookie = document.cookie.includes('polaris_session=');
      if (!hasCookie) {
        document.cookie = `polaris_session=${encodeURIComponent(token)}; path=/; max-age=${this.SESSION_DURATION_SEC}; SameSite=Lax`;
      }
    }

    return token && token.trim().length > 0 ? token : null;
  }

  public static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('polaris_token', token);
        localStorage.setItem(this.EXPIRES_KEY, String(Date.now() + this.SESSION_DURATION_SEC * 1000));
        localStorage.setItem('polaris_last_activity', String(Date.now()));
        localStorage.removeItem('polaris_acting_tenant_id');
      } catch {}
      document.cookie = `polaris_session=${encodeURIComponent(token)}; path=/; max-age=${this.SESSION_DURATION_SEC}; SameSite=Lax`;
    }
  }

  public static removeToken(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('polaris_token');
        localStorage.removeItem('polaris_user');
        localStorage.removeItem(this.EXPIRES_KEY);
        localStorage.removeItem('polaris_last_activity');
        localStorage.removeItem('polaris_acting_tenant_id');
      } catch {}
      document.cookie = 'polaris_session=; path=/; max-age=0; SameSite=Lax';
    }
  }

  public static isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  private static async parseResponseData(response: Response): Promise<any> {
    if (response.status === 204) return null;

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch {
        return { message: text };
      }
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await this.parseResponseData(response);

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        this.removeToken();
      }
      const message = this.normalizeErrorMessage(data, response.status);
      throw new Error(message);
    }

    return data as T;
  }

  public static async uploadFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await this.parseResponseData(response);

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        this.removeToken();
      }
      const message = this.normalizeErrorMessage(data, response.status);
      throw new Error(message);
    }

    return data as T;
  }

  private static normalizeErrorMessage(data: any, status: number): string {
    let raw = data?.error?.message || data?.message;
    if (Array.isArray(raw)) {
      raw = raw.join(', ');
    }

    if (typeof raw === 'string' && raw.trim().length > 0) {
      if (/^Cannot\s+(GET|POST|PATCH|PUT|DELETE)/i.test(raw) || status === 404) {
        return 'Layanan atau fitur yang diminta sedang tidak tersedia. Silakan coba beberapa saat lagi.';
      }
      if (raw.toLowerCase().includes('internal server error') || status >= 500) {
        return 'Terjadi kendala pada server sistem. Silakan coba beberapa saat lagi.';
      }
      return raw;
    }

    if (status === 404) {
      return 'Data atau layanan yang diminta tidak ditemukan.';
    }
    if (status === 403) {
      return 'Anda tidak memiliki hak akses untuk melakukan tindakan ini.';
    }
    if (status >= 500) {
      return 'Terjadi kendala pada server sistem. Silakan coba beberapa saat lagi.';
    }

    return 'Terjadi kendala sistem. Silakan coba beberapa saat lagi.';
  }
}

export class AdminApiClient {
  private static readonly TOKEN_KEY = 'polaris_admin_token';
  private static readonly USER_KEY = 'polaris_admin_user';
  public static readonly ADMIN_SESSION_DURATION_SEC = 12 * 60 * 60; // 12 jam (Superadmin Control Tower)
  public static readonly ADMIN_EXPIRES_KEY = 'polaris_admin_token_expires_at';

  public static getToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Cek hard expiration timestamp di client
    try {
      const expiresAt = localStorage.getItem(this.ADMIN_EXPIRES_KEY);
      if (expiresAt && Date.now() > Number(expiresAt)) {
        this.logout();
        return null;
      }
    } catch {}

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
          if (!localStorage.getItem(this.ADMIN_EXPIRES_KEY)) {
            localStorage.setItem(this.ADMIN_EXPIRES_KEY, String(Date.now() + this.ADMIN_SESSION_DURATION_SEC * 1000));
          }
        } catch {}
      }
    }

    return token && token.trim().length > 0 ? token : null;
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
        localStorage.setItem(this.ADMIN_EXPIRES_KEY, String(Date.now() + this.ADMIN_SESSION_DURATION_SEC * 1000));
        localStorage.setItem('polaris_last_activity', String(Date.now()));
        localStorage.removeItem('polaris_acting_tenant_id');
      } catch {}
      document.cookie = `polaris_admin_session=${encodeURIComponent(token)}; path=/; max-age=${this.ADMIN_SESSION_DURATION_SEC}; SameSite=Lax`;
    }
  }

  public static logout(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.ADMIN_EXPIRES_KEY);
        localStorage.removeItem('polaris_last_activity');
        localStorage.removeItem('polaris_acting_tenant_id');
      } catch {}
      document.cookie = 'polaris_admin_session=; path=/; max-age=0; SameSite=Lax';
    }
  }

  public static isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  private static async parseResponseData(response: Response): Promise<any> {
    if (response.status === 204) return null;

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch {
        return { message: text };
      }
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  private static actingTenantId: string | null = null;

  public static setActingTenant(tenantId: string | null): void {
    this.actingTenantId = tenantId;
    if (typeof window !== 'undefined') {
      if (tenantId) {
        localStorage.setItem('polaris_acting_tenant_id', tenantId);
      } else {
        localStorage.removeItem('polaris_acting_tenant_id');
      }
    }
  }

  public static getActingTenant(): string | null {

    if (typeof window !== 'undefined') {
      try {
        this.actingTenantId = localStorage.getItem('polaris_acting_tenant_id');
      } catch {}
    }
    return this.actingTenantId;
  }

  public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const actingTenant = this.getActingTenant();
    if (actingTenant) {
      headers['X-Acting-Tenant-Id'] = actingTenant;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await this.parseResponseData(response);

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        this.logout();
        window.location.href = '/superadmin/login';
      } else if (response.status === 403 && typeof window !== 'undefined') {
        const user = this.getUser();
        if (user?.role === 'CONTENT_OPERATOR' || user?.role === 'SUPPORT_OPERATOR') {
          // Jika akun adalah operator, arahkan ke cockpit operator
          window.location.href = '/operator';
        } else {
          // Jika forbidden dan bukan operator yang valid, bersihkan sesi agar tidak terjebak loop
          this.logout();
          window.location.href = '/superadmin/login';
        }
      }
      const message = ApiClient['normalizeErrorMessage'](data, response.status);
      throw new Error(message);
    }

    return data as T;
  }

  public static async uploadFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const actingTenant = this.getActingTenant();
    if (actingTenant) {
      headers['X-Acting-Tenant-Id'] = actingTenant;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await this.parseResponseData(response);

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        this.logout();
        window.location.href = '/superadmin/login';
      }
      const message = ApiClient['normalizeErrorMessage'](data, response.status);
      throw new Error(message);
    }

    return data as T;
  }
}
