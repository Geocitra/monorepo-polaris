export class CitizenUser {
  constructor(
    public readonly id: string,
    public readonly googleId: string,
    public readonly email: string,
    public fullName: string,
    public avatarUrl?: string | null,
    public isBanned: boolean = false,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {
    if (!email || !email.includes('@')) {
      throw new Error('[DomainInvariantError] Email pengguna warga tidak valid.');
    }
    if (!fullName || fullName.trim().length === 0) {
      throw new Error('[DomainInvariantError] Nama lengkap warga tidak boleh kosong.');
    }
  }

  public ban(): void {
    this.isBanned = true;
    this.updatedAt = new Date();
  }

  public unban(): void {
    this.isBanned = false;
    this.updatedAt = new Date();
  }

  public updateProfile(fullName: string, avatarUrl?: string | null): void {
    if (!fullName || fullName.trim().length === 0) {
      throw new Error('[DomainInvariantError] Nama tidak boleh kosong.');
    }
    this.fullName = fullName.trim();
    if (avatarUrl !== undefined) {
      this.avatarUrl = avatarUrl;
    }
    this.updatedAt = new Date();
  }
}
