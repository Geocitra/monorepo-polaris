import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import {
  db,
  portalConfigs,
  portalThemeSettings,
  portalDocuments,
  socialLinks,
  tenantMembers,
  subscriptions,
} from '@polaris/database';
import { HexColor } from '@polaris/core-domain';
import { PlanTier } from '@polaris/shared-types';
import { UpdateThemeSettingsDto } from '../dto/cms.dto.js';

@Injectable()
export class CmsPortalConfigService {
  async getMyPortalConfig(tenantId: string) {
    let [portal] = await db
      .select()
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    if (!portal) {
      const [member] = await db
        .select()
        .from(tenantMembers)
        .where(eq(tenantMembers.id, tenantId))
        .limit(1);

      if (member) {
        const rawSlug = (member.fullName || 'wakil-rakyat')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 30);
        const autoSlug = `${rawSlug}-${tenantId.slice(0, 4)}`;

        const [created] = await db
          .insert(portalConfigs)
          .values({
            tenantId,
            subdomainSlug: autoSlug,
            isActive: true,
            metaTitle: `Portal Resmi ${member.fullName}`,
            metaDescription: `Portal transparansi kebijakan dan aspirasi konstituen ${member.fullName}.`,
          })
          .onConflictDoNothing()
          .returning();

        const fetched = await db
          .select()
          .from(portalConfigs)
          .where(eq(portalConfigs.tenantId, tenantId))
          .limit(1);
        portal = created || fetched[0];

        if (portal) {
          await db
            .insert(portalThemeSettings)
            .values({
              portalId: portal.id,
              primaryHexColor: '#1890ff',
              secondaryHexColor: '#001529',
              fontFamily: 'Inter, sans-serif',
            })
            .onConflictDoNothing();
        }
      }
    }

    if (!portal) {
      throw new NotFoundException('Konfigurasi portal belum diinisialisasi.');
    }

    const [theme] = await db
      .select()
      .from(portalThemeSettings)
      .where(eq(portalThemeSettings.portalId, portal.id))
      .limit(1);

    const socials = await db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.portalId, portal.id));

    const documents = await db
      .select()
      .from(portalDocuments)
      .where(eq(portalDocuments.portalId, portal.id))
      .orderBy(desc(portalDocuments.publishedAt));

    return {
      portal,
      theme,
      documents,
      socialLinks: socials,
      dnsInstructions: portal.customDomain
        ? {
            cnameTarget: 'cname.polaris.id',
            txtRecordHost: `_polaris-challenge.${portal.customDomain}`,
            txtRecordValue: portal.dnsVerificationToken,
            expiresAt: portal.dnsVerificationExpiresAt,
          }
        : null,
    };
  }

  async updateThemeSettings(tenantId: string, dto: UpdateThemeSettingsDto) {
    let primary: HexColor;
    let secondary: HexColor;
    try {
      primary = new HexColor(dto.primaryHexColor);
      secondary = new HexColor(dto.secondaryHexColor);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    const [portal] = await db
      .select({ id: portalConfigs.id })
      .from(portalConfigs)
      .where(eq(portalConfigs.tenantId, tenantId))
      .limit(1);

    if (!portal) {
      throw new NotFoundException('Portal konfigurasi tidak ditemukan.');
    }

    const [sub] = await db
      .select({
        planTier: subscriptions.planTier,
      })
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    const isPremium =
      sub?.planTier === PlanTier.PRO ||
      (sub?.planTier as any) === 'VIP' ||
      (sub?.planTier as any) === 'ENTERPRISE';

    await db.transaction(async (tx) => {
      const updateData: Record<string, any> = {
        primaryHexColor: primary.getValue(),
        secondaryHexColor: secondary.getValue(),
        updatedAt: new Date(),
      };
      if (dto.fontFamily !== undefined) updateData.fontFamily = dto.fontFamily;
      if (dto.heroBannerUrl !== undefined) updateData.heroBannerUrl = dto.heroBannerUrl;
      if (dto.officialPhotoUrl !== undefined) updateData.officialPhotoUrl = dto.officialPhotoUrl;
      if (dto.headlineTagline !== undefined) updateData.headlineTagline = dto.headlineTagline;
      if (dto.bioBiography !== undefined) updateData.bioBiography = dto.bioBiography;

      if (dto.layoutTemplateId !== undefined) {
        const cleanLayout = dto.layoutTemplateId.trim().toLowerCase();
        if (cleanLayout !== 'standard-default' && cleanLayout !== 'polaris-insight' && !isPremium) {
          throw new ForbiddenException(
            'Pemilihan template layout tematik eksklusif memerlukan lisensi PRO (Eksekutif Suite). Akun Standar Parlemen hanya mendukung tata letak standar.'
          );
        }
        updateData.layoutTemplateId = cleanLayout;
        if (dto.layoutSchema === undefined) {
          updateData.layoutSchema = {
            templatePreset: cleanLayout,
            updatedAt: new Date().toISOString(),
          };
        }
      }

      if (dto.layoutSchema !== undefined) {
        const preset = (
          dto.layoutSchema?.templatePreset ||
          dto.layoutTemplateId ||
          ''
        )
          .trim()
          .toLowerCase();
        if (preset !== 'standard-default' && preset !== 'polaris-insight' && !isPremium) {
          throw new ForbiddenException(
            'Pemilihan template layout tematik eksklusif memerlukan lisensi PRO (Eksekutif Suite). Akun Standar Parlemen hanya mendukung tata letak standar.'
          );
        }
        updateData.layoutSchema = dto.layoutSchema;
        if (dto.layoutSchema?.templatePreset) {
          updateData.layoutTemplateId = dto.layoutSchema.templatePreset;
        }
      }

      await tx
        .update(portalThemeSettings)
        .set(updateData)
        .where(eq(portalThemeSettings.portalId, portal.id));

      if (dto.socialLinks) {
        await tx.delete(socialLinks).where(eq(socialLinks.portalId, portal.id));
        if (dto.socialLinks.length > 0) {
          await tx.insert(socialLinks).values(
            dto.socialLinks.map((item) => ({
              portalId: portal.id,
              platform: item.platform,
              profileUrl: item.profileUrl,
            }))
          );
        }
      }
    });

    return { message: 'Pengaturan tema dan identitas visual berhasil diperbarui.' };
  }
}
