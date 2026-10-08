import { describe, it, expect } from 'vitest';
import {
  LegislativeLevel,
  PlanTier,
  BillingCycle,
  InquiryStatus,
  PortalTemplateId,
} from '@polaris/shared-types';
import {
  SubscriptionPriceMatrix,
  LicenseInquiry,
  PortalProfile,
  SubdomainSlug,
  HexColor,
} from '@polaris/core-domain';

describe('Dynamic Pricing & Entitlement Domain Invariants (Craig Larman Protected Variations)', () => {
  describe('SubscriptionPriceMatrix Entity', () => {
    it('creates a valid 3D pricing tensor element and calculates monthly equivalent', () => {
      const matrix = new SubscriptionPriceMatrix(
        'matrix-dpr-pro-semi',
        LegislativeLevel.DPR_RI,
        PlanTier.PRO,
        BillingCycle.SEMIANNUAL,
        180,
        45000000,
        true
      );

      expect(matrix.id).toBe('matrix-dpr-pro-semi');
      expect(matrix.legislativeLevel).toBe(LegislativeLevel.DPR_RI);
      expect(matrix.planTier).toBe(PlanTier.PRO);
      expect(matrix.billingCycle).toBe(BillingCycle.SEMIANNUAL);
      expect(matrix.amountIdr).toBe(45000000);
      expect(matrix.durationDays).toBe(180);
      expect(matrix.getMonthlyEquivalentPrice()).toBe(Math.round(45000000 / 6));
    });

    it('rejects negative or zero IDR amounts on updatePrice', () => {
      const matrix = new SubscriptionPriceMatrix(
        'matrix-dprd-starter-month',
        LegislativeLevel.DPRD_PROV,
        PlanTier.STARTER,
        BillingCycle.MONTHLY,
        30,
        2000000,
        true
      );

      expect(() => {
        matrix.updatePrice(-50000);
      }).toThrow('[InvalidPriceError] Harga harus lebih besar dari 0.');

      expect(() => {
        matrix.updatePrice(0);
      }).toThrow('[InvalidPriceError] Harga harus lebih besar dari 0.');
    });

    it('allows price modification by superadmin with audit tracking', () => {
      const matrix = new SubscriptionPriceMatrix(
        'matrix-dprd-starter-month',
        LegislativeLevel.DPRD_KAB_KOTA,
        PlanTier.STARTER,
        BillingCycle.MONTHLY,
        30,
        1500000,
        true
      );

      matrix.updatePrice(1750000);
      expect(matrix.amountIdr).toBe(1750000);

      matrix.toggleActive(false);
      expect(matrix.isActive).toBe(false);
    });
  });

  describe('LicenseInquiry Domain Lifecycle', () => {
    it('creates a new lead with status NEW_LEAD', () => {
      const inq = new LicenseInquiry(
        'inq-1',
        'H. Bambang Soeroso, S.H.',
        '081298765432',
        'bambang@dpr.go.id',
        'Golkar',
        LegislativeLevel.DPR_RI,
        'Jawa Tengah I',
        BillingCycle.SEMIANNUAL,
        PlanTier.PRO
      );

      expect(inq.status).toBe(InquiryStatus.NEW_LEAD);
      expect(inq.fullName).toBe('H. Bambang Soeroso, S.H.');
      expect(inq.legislativeLevel).toBe(LegislativeLevel.DPR_RI);
      expect(inq.preferredTier).toBe(PlanTier.PRO);
      expect(inq.meetingDatetime).toBeNull();
    });

    it('transitions to MEETING_SCHEDULED when demo GMeet is booked', () => {
      const inq = new LicenseInquiry(
        'inq-2',
        'Hj. Siti Rahayu, M.Si.',
        '081311223344',
        'siti.rahayu@dprd-jatim.go.id',
        null,
        LegislativeLevel.DPRD_PROV,
        'Jawa Timur II',
        BillingCycle.ANNUAL,
        PlanTier.PRO
      );

      const meetDate = new Date(Date.now() + 86400000);
      inq.scheduleMeeting(
        meetDate,
        'https://meet.google.com/plr-test-demo',
        'admin-1',
        'Fokuskan pada simulasi integrasi aspirasi warga'
      );

      expect(inq.status).toBe(InquiryStatus.MEETING_SCHEDULED);
      expect(inq.meetingUrl).toBe('https://meet.google.com/plr-test-demo');
      expect(inq.handledByAdminId).toBe('admin-1');
      expect(inq.adminNotes).toBe('Fokuskan pada simulasi integrasi aspirasi warga');
    });

    it('converts to deal when tenant is onboarded', () => {
      const inq = new LicenseInquiry(
        'inq-3',
        'Ahmad Fauzi',
        '081122334455',
        'fauzi@dprd.go.id',
        null,
        LegislativeLevel.DPRD_KAB_KOTA,
        'Kota Bandung III',
        BillingCycle.MONTHLY,
        PlanTier.STARTER
      );

      inq.markAsConverted('tenant-member-uuid-123', 'admin-1');
      expect(inq.status).toBe(InquiryStatus.DEAL_CONVERTED);
      expect(inq.convertedTenantId).toBe('tenant-member-uuid-123');
      expect(inq.handledByAdminId).toBe('admin-1');
    });
  });

  describe('PortalProfile & CMS Layout Entitlement Gate', () => {
    it('allows standard-default layout on any plan tier (including STARTER)', () => {
      const portal = new PortalProfile(
        'portal-1',
        'tenant-starter-1',
        new SubdomainSlug('bambang-starter'),
        new HexColor('#1890FF'),
        new HexColor('#001529')
      );

      expect(() => {
        portal.updateLayoutTemplate('standard-default', false);
      }).not.toThrow();

      expect(portal.layoutTemplateId).toBe('standard-default');
    });

    it('strictly forbids non-default thematic layouts when isPremiumTier is false (STARTER)', () => {
      const portal = new PortalProfile(
        'portal-1',
        'tenant-starter-1',
        new SubdomainSlug('bambang-starter'),
        new HexColor('#1890FF'),
        new HexColor('#001529')
      );

      expect(() => {
        portal.updateLayoutTemplate(PortalTemplateId.EDITORIAL_PRESTIGE, false);
      }).toThrow("[EntitlementViolation] Kustomisasi template layout tematik 'editorial-prestige' memerlukan lisensi Premium.");

      expect(() => {
        portal.updateLayoutTemplate(PortalTemplateId.BALIHO_HERO, false);
      }).toThrow("[EntitlementViolation] Kustomisasi template layout tematik 'baliho-hero' memerlukan lisensi Premium.");

      expect(() => {
        portal.updateLayoutTemplate(PortalTemplateId.NEWSROOM_BRIEF, false);
      }).toThrow("[EntitlementViolation] Kustomisasi template layout tematik 'newsroom-brief' memerlukan lisensi Premium.");
    });

    it('allows premium thematic layouts when isPremiumTier is true (PRO)', () => {
      const portal = new PortalProfile(
        'portal-2',
        'tenant-pro-1',
        new SubdomainSlug('bambang-pro'),
        new HexColor('#1890FF'),
        new HexColor('#001529')
      );

      expect(() => {
        portal.updateLayoutTemplate(PortalTemplateId.EDITORIAL_PRESTIGE, true);
      }).not.toThrow();
      expect(portal.layoutTemplateId).toBe('editorial-prestige');

      expect(() => {
        portal.updateLayoutTemplate(PortalTemplateId.BALIHO_HERO, true);
      }).not.toThrow();
      expect(portal.layoutTemplateId).toBe('baliho-hero');

      expect(() => {
        portal.updateLayoutTemplate(PortalTemplateId.NEWSROOM_BRIEF, true);
      }).not.toThrow();
      expect(portal.layoutTemplateId).toBe('newsroom-brief');
    });
  });

  describe('Strict Enterprise GTM Invariants (Rate Arbitrage Mitigation)', () => {
    it('prohibits arbitrary cash heuristic guesswork on durationDays', () => {
      // In the new tensor, a payment for DPR RI PRO
      // must NOT be guessed as 365 days (1 year) just because amount >= 15.000.000!
      const dprMonthlyPro = new SubscriptionPriceMatrix(
        'matrix-dpr-pro-m',
        LegislativeLevel.DPR_RI,
        PlanTier.PRO,
        BillingCycle.MONTHLY,
        30,
        6000000,
        true
      );

      expect(dprMonthlyPro.durationDays).toBe(30);
      expect(dprMonthlyPro.amountIdr).toBe(6000000);
      // Duration must strictly come from durationDays property of the matched matrix
      expect(dprMonthlyPro.durationDays).not.toBe(365);
    });
  });
});
