import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, or, desc } from 'drizzle-orm';
import {
  db,
  portalConfigs,
  portalDocuments,
  portalNewsletterSubscribers,
} from '@polaris/database';
import { CreatePortalDocumentRequestDto } from '../dto/cms.dto.js';

@Injectable()
export class CmsDocumentVaultService {
  async getPortalDocuments(tenantId: string) {
    const [portal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    if (!portal) {
      throw new NotFoundException('Portal konfigurasi tidak ditemukan.');
    }

    return await db
      .select()
      .from(portalDocuments)
      .where(eq(portalDocuments.portalId, portal.id))
      .orderBy(desc(portalDocuments.publishedAt));
  }

  async createPortalDocument(tenantId: string, dto: CreatePortalDocumentRequestDto) {
    const [portal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    if (!portal) {
      throw new NotFoundException('Portal konfigurasi tidak ditemukan.');
    }

    const [doc] = await db
      .insert(portalDocuments)
      .values({
        portalId: portal.id,
        title: dto.title,
        docType: dto.docType || 'REPORT_TRIWULAN',
        description: dto.description || null,
        fileUrl: dto.fileUrl,
        fileSizeBytes: dto.fileSizeBytes || null,
      })
      .returning();

    return { message: 'Dokumen publik berhasil ditambahkan.', document: doc };
  }

  async deletePortalDocument(tenantId: string, id: string) {
    const [portal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    if (!portal) {
      throw new NotFoundException('Portal konfigurasi tidak ditemukan.');
    }

    await db
      .delete(portalDocuments)
      .where(and(eq(portalDocuments.id, id), eq(portalDocuments.portalId, portal.id)));

    return { message: 'Dokumen berhasil dihapus.' };
  }

  async trackDocumentDownload(slugOrDomain: string, docId: string) {
    const cleanIdentifier = slugOrDomain.toLowerCase().trim();
    const isSubdomain = !cleanIdentifier.includes('.');

    const [portal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(
        isSubdomain
          ? eq(portalConfigs.subdomainSlug, cleanIdentifier)
          : eq(portalConfigs.customDomain, cleanIdentifier)
      )
      .limit(1);

    if (!portal) {
      throw new NotFoundException('Portal tidak ditemukan.');
    }

    const [doc] = await db
      .select()
      .from(portalDocuments)
      .where(and(eq(portalDocuments.id, docId), eq(portalDocuments.portalId, portal.id)))
      .limit(1);

    if (!doc) {
      throw new NotFoundException('Dokumen tidak ditemukan.');
    }

    await db
      .update(portalDocuments)
      .set({ downloadCount: (doc.downloadCount || 0) + 1, updatedAt: new Date() })
      .where(eq(portalDocuments.id, doc.id));

    return { success: true, fileUrl: doc.fileUrl };
  }

  async subscribeNewsletter(slug: string, email: string) {
    if (!email || !email.includes('@') || email.length > 255) {
      throw new BadRequestException('Format alamat email tidak valid.');
    }
    const cleanEmail = email.trim().toLowerCase();

    const [portal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(
        or(
          eq(portalConfigs.subdomainSlug, slug.toLowerCase()),
          eq(portalConfigs.customDomain, slug.toLowerCase())
        )
      )
      .limit(1);

    if (!portal) {
      throw new NotFoundException('Portal publik dewan tidak ditemukan.');
    }

    await db
      .insert(portalNewsletterSubscribers)
      .values({
        portalId: portal.id,
        email: cleanEmail,
        isActive: true,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [portalNewsletterSubscribers.portalId, portalNewsletterSubscribers.email],
        set: {
          isActive: true,
          updatedAt: new Date(),
        },
      });

    return {
      success: true,
      message: 'Email Anda berhasil didaftarkan dalam buletin catatan dewan.',
    };
  }

  async getNewsletterSubscribers(tenantId: string) {
    const [portal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    if (!portal) {
      return { total: 0, subscribers: [] };
    }

    const subscribers = await db
      .select({
        id: portalNewsletterSubscribers.id,
        email: portalNewsletterSubscribers.email,
        isActive: portalNewsletterSubscribers.isActive,
        createdAt: portalNewsletterSubscribers.createdAt,
      })
      .from(portalNewsletterSubscribers)
      .where(
        and(
          eq(portalNewsletterSubscribers.portalId, portal.id),
          eq(portalNewsletterSubscribers.isActive, true)
        )
      )
      .orderBy(desc(portalNewsletterSubscribers.createdAt));

    return {
      total: subscribers.length,
      subscribers,
    };
  }
}
