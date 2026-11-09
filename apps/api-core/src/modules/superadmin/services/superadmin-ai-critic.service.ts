import { Injectable, Logger } from '@nestjs/common';
import {
  db,
  studioAiCriticLogs,
  studioAiLearnedMemories,
  eq,
  desc,
  sql,
  and,
} from '@polaris/database';

@Injectable()
export class SuperadminAiCriticService {
  private readonly logger = new Logger(SuperadminAiCriticService.name);

  /**
   * Mengambil daftar log inspeksi AI Self-Critic
   */
  async getLogs(query: { archetype?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.archetype) {
      conditions.push(eq(studioAiCriticLogs.archetype, query.archetype));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [logs, countResult] = await Promise.all([
      db
        .select()
        .from(studioAiCriticLogs)
        .where(whereClause)
        .orderBy(desc(studioAiCriticLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(studioAiCriticLogs)
        .where(whereClause),
    ]);

    const total = countResult[0]?.total || 0;

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mengambil metrik agregat performa AI Self-Critic
   */
  async getStats() {
    const [stats] = await db
      .select({
        totalAudited: sql<number>`count(*)::int`,
        passedCount: sql<number>`count(*) filter (where ${studioAiCriticLogs.passed} = true)::int`,
        autoRepairedCount: sql<number>`count(*) filter (where ${studioAiCriticLogs.autoRepaired} = true)::int`,
        avgScore: sql<number>`round(coalesce(avg(${studioAiCriticLogs.overallScore}), 0)::numeric, 1)::float`,
      })
      .from(studioAiCriticLogs);

    const [memoriesCount] = await db
      .select({
        activeRulesCount: sql<number>`count(*) filter (where ${studioAiLearnedMemories.isActive} = true)::int`,
      })
      .from(studioAiLearnedMemories);

    const total = stats?.totalAudited || 0;
    const passed = stats?.passedCount || 0;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 100;

    return {
      totalAudited: total,
      passedCount: passed,
      autoRepairedCount: stats?.autoRepairedCount || 0,
      avgScore: stats?.avgScore || 0,
      passRate,
      activeRulesCount: memoriesCount?.activeRulesCount || 0,
    };
  }

  /**
   * Mengambil daftar aturan/pelajaran yang telah dipelajari AI
   */
  async getMemories(archetype?: string) {
    const whereClause = archetype
      ? eq(studioAiLearnedMemories.archetype, archetype)
      : undefined;

    const records = await db
      .select()
      .from(studioAiLearnedMemories)
      .where(whereClause)
      .orderBy(desc(studioAiLearnedMemories.triggerCount));

    return records;
  }

  /**
   * Mengaktifkan/menonaktifkan aturan memori
   */
  async toggleMemory(id: string) {
    const [existing] = await db
      .select()
      .from(studioAiLearnedMemories)
      .where(eq(studioAiLearnedMemories.id, id))
      .limit(1);

    if (!existing) {
      throw new Error(`Aturan memori dengan ID ${id} tidak ditemukan.`);
    }

    const nextState = !existing.isActive;

    await db
      .update(studioAiLearnedMemories)
      .set({
        isActive: nextState,
        updatedAt: new Date(),
      })
      .where(eq(studioAiLearnedMemories.id, id));

    return { id, isActive: nextState };
  }
}

