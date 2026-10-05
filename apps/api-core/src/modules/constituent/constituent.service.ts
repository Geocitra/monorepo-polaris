import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { eq, desc, and } from 'drizzle-orm';
import * as crypto from 'crypto';
import {
  db,
  portalConfigs,
  constituentFeedbacks,
  encryptedPiiVaults,
  tenantMembers,
  electoralDistricts,
  findSimilarKnowledgeChunks,
  withPublicFeedbackTicket,
} from '@polaris/database';
import { OpenAIAIEngineAdapter } from '@polaris/ai-engine';
import { FeedbackStatus } from '@polaris/shared-types';
import { SubmitAspirationDto, UpdateFeedbackStatusDto, AskCivicQuestionDto } from './dto/constituent.dto.js';
import { PiiCryptoService } from './pii-crypto.service.js';

@Injectable()
export class ConstituentService {
  private readonly logger = new Logger(ConstituentService.name);
  private readonly aiEngine = new OpenAIAIEngineAdapter();

  constructor(private readonly cryptoService: PiiCryptoService) { }

  /**
   * Menjawab pertanyaan publik / warga dengan RAG Semantic Grounding Otentik.
   */
  async askCivicAssistant(dto: AskCivicQuestionDto) {
    const cleanSubdomain = dto.subdomainSlug.toLowerCase().trim();
    const cleanQuestion = dto.question.trim();

    if (!cleanQuestion) {
      throw new BadRequestException('Pertanyaan warga tidak boleh kosong.');
    }

    // 1. Cari portal dan data anggota dewan pemilik portal
    const [portal] = await db
      .select({ id: portalConfigs.id, tenantId: portalConfigs.tenantId, isActive: portalConfigs.isActive })
      .from(portalConfigs)
      .where(eq(portalConfigs.subdomainSlug, cleanSubdomain))
      .limit(1);

    if (!portal || !portal.isActive) {
      throw new NotFoundException('Portal dewan tidak ditemukan atau sedang non-aktif.');
    }

    const [member] = await db
      .select({
        fullName: tenantMembers.fullName,
        party: tenantMembers.partyAffiliation,
        level: tenantMembers.legislativeLevel,
        dapilId: tenantMembers.electoralDistrictId,
        customDapil: tenantMembers.customDapilName,
        personalCoverage: tenantMembers.personalCoverage,
      })
      .from(tenantMembers)
      .where(eq(tenantMembers.id, portal.tenantId))
      .limit(1);

    // Resolusi wilayah dan dapil kerja
    let dapilName = member?.customDapil || 'Daerah Pemilihan';
    let regionScope = member?.personalCoverage?.[0] || 'NASIONAL';

    if (member?.dapilId) {
      const [masterDapil] = await db
        .select({
          dapilName: electoralDistricts.dapilName,
          regencyCoverage: electoralDistricts.regencyCoverage,
        })
        .from(electoralDistricts)
        .where(eq(electoralDistricts.id, member.dapilId))
        .limit(1);

      if (masterDapil) {
        if (!member.customDapil) dapilName = masterDapil.dapilName;
        if (!member.personalCoverage || member.personalCoverage.length === 0) {
          regionScope = masterDapil.regencyCoverage?.[0] || 'NASIONAL';
        }
      }
    }

    // 2. RAG PIPELINE: Komputasi Vektor Nyata dari Pertanyaan Warga
    let regulationContext = '';
    try {
      this.logger.log(`[CivicAssistant RAG] Meng-embed pertanyaan warga: "${cleanQuestion.slice(0, 50)}..."`);
      const embedResult = await this.aiEngine.generateEmbedding(cleanQuestion, portal.tenantId);
      const questionEmbedding = embedResult.embedding;

      // Cari potongan pasal yang relevan di pgvector (kemiripan >= 0.60)
      const similarChunks = await findSimilarKnowledgeChunks(questionEmbedding, 3, regionScope, 0.60);

      if (similarChunks && similarChunks.length > 0) {
        this.logger.log(`[CivicAssistant RAG] Ditemukan ${similarChunks.length} regulasi relevan (Top score: ${similarChunks[0].similarityScore.toFixed(3)})`);
        regulationContext = similarChunks
          .map((c, i) => `[Rujukan ${i + 1}] ${c.structuralReference} (Relevansi: ${(c.similarityScore * 100).toFixed(1)}%):\n${c.chunkContent}`)
          .join('\n\n');
      } else {
        this.logger.warn(`[CivicAssistant RAG] Tidak ditemukan regulasi lokal dengan relevansi memadai (threshold 0.60)`);
      }
    } catch (embeddingErr: any) {
      this.logger.warn(`[CivicAssistant RAG-Fallback] Gagal melakukan vector search: ${embeddingErr.message}`);
    }

    // 3. Sintesis Respon Menggunakan Model Port Khusus Civic Answering
    let finalAnswer = '';
    try {
      const civicResult = await this.aiEngine.generateCivicAnswer({
        citizenQuestion: cleanQuestion,
        groundedRegulations: regulationContext,
        representativeName: member?.fullName || 'Anggota Dewan',
        partyAffiliation: member?.party,
        dapilName,
        tenantId: portal.tenantId,
      });
      finalAnswer = civicResult.answer;
    } catch (genErr: any) {
      this.logger.error(`[CivicAssistant Error] Gagal generate jawaban: ${genErr.message}`);
      finalAnswer = `Terima kasih atas aspirasi Anda. Terkait hal tersebut, kami di Fraksi ${member?.party || 'Parlemen'} (${dapilName}) mengawal koordinasi dengan dinas terkait. Silakan gunakan tombol "Kirim Aspirasi" untuk tindak lanjut resmi tim advokasi kami.`;
    }

    return {
      answer: finalAnswer,
      officialName: member?.fullName || 'Anggota Dewan',
      partyAffiliation: member?.party || null,
      dapilName,
      hasLegalGrounding: Boolean(regulationContext),
    };
  }

  async submitPublicAspiration(dto: SubmitAspirationDto) {
    const [portal] = await db
      .select({
        id: portalConfigs.id,
        tenantId: portalConfigs.tenantId,
        isActive: portalConfigs.isActive
      })
      .from(portalConfigs)
      .where(eq(portalConfigs.subdomainSlug, dto.subdomainSlug.toLowerCase().trim()))
      .limit(1);

    if (!portal || !portal.isActive) {
      throw new NotFoundException('Portal website dewan tujuan tidak ditemukan atau sedang nonaktif.');
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomCode = crypto.randomBytes(8).toString('hex').toUpperCase();
    const trackingTicketCode = `#CS-${dateStr}-${randomCode}`;

    const encryptedName = this.cryptoService.encryptData(dto.citizenName.trim(), portal.tenantId);
    const encryptedPhone = this.cryptoService.encryptData(dto.phoneNumber.trim(), portal.tenantId);

    const result = await withPublicFeedbackTicket(trackingTicketCode, async (tx) => {
      const [feedback] = await tx
        .insert(constituentFeedbacks)
        .values({
          portalId: portal.id,
          trackingTicketCode,
          regencyName: dto.regencyName.trim(),
          districtKecamatan: dto.districtKecamatan.trim(),
          category: dto.category,
          aspirationMessage: dto.aspirationMessage.trim(),
          status: FeedbackStatus.RECEIVED,
        })
        .returning();

      await tx.insert(encryptedPiiVaults).values({
        feedbackId: feedback.id,
        encryptedCitizenName: encryptedName.encryptedBuffer,
        encryptedPhoneNumber: encryptedPhone.encryptedBuffer,
        ivVector: encryptedName.ivHex,
      });

      return feedback;
    });

    return {
      message: 'Aspirasi Anda berhasil dicatat secara resmi oleh sistem POLARIS.',
      trackingTicketCode: result.trackingTicketCode,
      submittedAt: result.submittedAt,
      status: result.status,
    };
  }

  async trackTicketStatus(ticketCode: string) {
    let cleanCode = ticketCode.trim().toUpperCase();
    if (!cleanCode.startsWith('#')) {
      cleanCode = `#${cleanCode}`;
    }

    const [feedback] = await withPublicFeedbackTicket(cleanCode, async (tx) =>
      tx
        .select({
          trackingTicketCode: constituentFeedbacks.trackingTicketCode,
          category: constituentFeedbacks.category,
          districtKecamatan: constituentFeedbacks.districtKecamatan,
          regencyName: constituentFeedbacks.regencyName,
          aspirationMessage: constituentFeedbacks.aspirationMessage,
          status: constituentFeedbacks.status,
          submittedAt: constituentFeedbacks.submittedAt,
        })
        .from(constituentFeedbacks)
        .where(eq(constituentFeedbacks.trackingTicketCode, cleanCode))
        .limit(1)
    );

    if (!feedback) {
      throw new NotFoundException(`Tiket pengaduan dengan kode '${cleanCode}' tidak ditemukan.`);
    }

    return feedback;
  }

  async listDewanInbox(tenantId: string) {
    const [portal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    if (!portal) {
      throw new NotFoundException('Portal dewan belum terdaftar.');
    }

    const records = await db
      .select({
        id: constituentFeedbacks.id,
        ticket: constituentFeedbacks.trackingTicketCode,
        regency: constituentFeedbacks.regencyName,
        district: constituentFeedbacks.districtKecamatan,
        category: constituentFeedbacks.category,
        message: constituentFeedbacks.aspirationMessage,
        status: constituentFeedbacks.status,
        submittedAt: constituentFeedbacks.submittedAt,
        encryptedName: encryptedPiiVaults.encryptedCitizenName,
        encryptedPhone: encryptedPiiVaults.encryptedPhoneNumber,
        iv: encryptedPiiVaults.ivVector,
      })
      .from(constituentFeedbacks)
      .innerJoin(encryptedPiiVaults, eq(constituentFeedbacks.id, encryptedPiiVaults.feedbackId))
      .where(eq(constituentFeedbacks.portalId, portal.id))
      .orderBy(desc(constituentFeedbacks.submittedAt));

    return records.map((r) => ({
      id: r.id,
      trackingTicketCode: r.ticket,
      regencyName: r.regency,
      districtKecamatan: r.district,
      category: r.category,
      aspirationMessage: r.message,
      status: r.status,
      submittedAt: r.submittedAt,
      citizenName: this.cryptoService.decryptData(r.encryptedName, r.iv, tenantId),
      phoneNumber: this.cryptoService.decryptData(r.encryptedPhone, r.iv, tenantId),
    }));
  }

  async updateFeedbackStatus(tenantId: string, feedbackId: string, status: FeedbackStatus) {
    const [portal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    if (!portal) {
      throw new NotFoundException('Portal dewan tidak ditemukan.');
    }

    const [updated] = await db
      .update(constituentFeedbacks)
      .set({ status })
      .where(
        and(
          eq(constituentFeedbacks.id, feedbackId),
          eq(constituentFeedbacks.portalId, portal.id)
        )
      )
      .returning();

    if (!updated) {
      throw new NotFoundException('Laporan pengaduan tidak ditemukan.');
    }

    return {
      message: `Status laporan berhasil diperbarui menjadi ${status}.`,
      ticket: updated.trackingTicketCode,
      currentStatus: updated.status,
    };
  }
}
