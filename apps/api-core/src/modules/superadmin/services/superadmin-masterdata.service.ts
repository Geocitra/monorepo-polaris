import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import {
  db,
  masterPoliticalParties,
  electoralDistricts,
  masterCommissions,
  subscriptionPriceMatrices,
} from '@polaris/database';
import { LegislativeLevel } from '@polaris/shared-types';
import {
  CreatePartyDto,
  UpdatePartyDto,
  CreateDapilDto,
  AdminUpdatePricingMatrixDto,
} from '../dto/superadmin.dto.js';

@Injectable()
export class SuperadminMasterDataService {
  /**
   * Master Partai Politik CRUD
   */
  async getParties() {
    return await db
      .select()
      .from(masterPoliticalParties)
      .orderBy(masterPoliticalParties.ballotNumber);
  }

  async createParty(dto: CreatePartyDto) {
    const [created] = await db
      .insert(masterPoliticalParties)
      .values({
        code: dto.code.toUpperCase().trim(),
        name: dto.name.trim(),
        ballotNumber: dto.ballotNumber,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        logoUrl: dto.logoUrl,
        description: dto.description,
        isActive: true,
      })
      .returning();

    return created;
  }

  async updateParty(partyId: string, dto: UpdatePartyDto) {
    const [updated] = await db
      .update(masterPoliticalParties)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(masterPoliticalParties.id, partyId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Partai politik tidak ditemukan.');
    }

    return updated;
  }

  /**
   * Master Dapil KPU CRUD
   */
  async getDapils() {
    return await db
      .select()
      .from(electoralDistricts)
      .orderBy(electoralDistricts.provinceName);
  }

  async createDapil(dto: CreateDapilDto) {
    const [created] = await db
      .insert(electoralDistricts)
      .values({
        dapilCode: dto.dapilCode.toUpperCase().trim(),
        dapilName: dto.dapilName.trim(),
        provinceName: dto.provinceName.trim(),
        regencyCoverage: dto.regencyCoverage,
        totalVoters: dto.totalVoters,
      })
      .returning();

    return created;
  }

  /**
   * Master Komisi Parlemen
   */
  async getCommissions(level?: string) {
    const rows = await db
      .select()
      .from(masterCommissions)
      .orderBy(masterCommissions.code);

    if (level && level !== 'ALL') {
      return rows.filter((r) => r.legislativeLevel === level);
    }
    return rows;
  }

  async createCommission(dto: {
    legislativeLevel: any;
    code: string;
    name: string;
    focusAreas?: string[];
    partnerMinistries?: string[];
  }) {
    const [created] = await db
      .insert(masterCommissions)
      .values({
        legislativeLevel: dto.legislativeLevel,
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        focusAreas: dto.focusAreas || [],
        partnerMinistries: dto.partnerMinistries || [],
      })
      .returning();
    return created;
  }

  async updateCommission(
    id: string,
    dto: {
      legislativeLevel?: any;
      code?: string;
      name?: string;
      focusAreas?: string[];
      partnerMinistries?: string[];
    },
  ) {
    const updates: Record<string, any> = {};
    if (dto.legislativeLevel) updates.legislativeLevel = dto.legislativeLevel;
    if (dto.code) updates.code = dto.code.trim().toUpperCase();
    if (dto.name) updates.name = dto.name.trim();
    if (dto.focusAreas) updates.focusAreas = dto.focusAreas;
    if (dto.partnerMinistries) updates.partnerMinistries = dto.partnerMinistries;

    const [updated] = await db
      .update(masterCommissions)
      .set(updates)
      .where(eq(masterCommissions.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException('Data komisi tidak ditemukan.');
    }
    return updated;
  }

  /**
   * Mengambil seluruh matriks harga resmi POLARIS
   */
  async getPricingMatrices(level?: LegislativeLevel) {
    const conditions = [];
    if (level) conditions.push(eq(subscriptionPriceMatrices.legislativeLevel, level));

    return await db
      .select()
      .from(subscriptionPriceMatrices)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        subscriptionPriceMatrices.legislativeLevel,
        subscriptionPriceMatrices.planTier,
        subscriptionPriceMatrices.durationDays
      );
  }

  /**
   * Memperbarui nominal atau status aktif matriks harga
   */
  async updatePricingMatrix(id: string, dto: AdminUpdatePricingMatrixDto) {
    const updates: Record<string, any> = {
      amountIdr: dto.amountIdr.toString(),
      updatedAt: new Date(),
    };
    if (dto.durationDays !== undefined) updates.durationDays = dto.durationDays;
    if (dto.isActive !== undefined) updates.isActive = dto.isActive;

    const [updated] = await db
      .update(subscriptionPriceMatrices)
      .set(updates)
      .where(eq(subscriptionPriceMatrices.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException('Data tarif matriks harga tidak ditemukan.');
    }

    return {
      success: true,
      message: 'Tarif matriks harga berhasil diperbarui.',
      data: updated,
    };
  }
}
