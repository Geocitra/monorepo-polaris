import { InquiryStatus, LegislativeLevel, PlanTier, BillingCycle } from '@polaris/shared-types';

export class LicenseInquiry {
  constructor(
    public readonly id: string,
    public fullName: string,
    public phoneNumber: string,
    public officialEmail: string,
    public partyAffiliation: string | null,
    public legislativeLevel: LegislativeLevel,
    public targetRegion: string,
    public preferredCycle: BillingCycle | string = BillingCycle.SEMESTER,
    public preferredTier: PlanTier = PlanTier.PRO,
    public meetingDatetime: Date | null = null,
    public meetingUrl: string | null = null,
    public adminNotes: string | null = null,
    public status: InquiryStatus = InquiryStatus.NEW_LEAD,
    public handledByAdminId: string | null = null,
    public convertedTenantId: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  public scheduleMeeting(datetime: Date, meetingUrl: string, adminId: string, notes?: string): void {
    if (this.status === InquiryStatus.DEAL_CONVERTED || this.status === InquiryStatus.REJECTED_DROPPED) {
      throw new Error(`[InvalidInquiryState] Tidak dapat menjadwalkan meeting untuk lead dengan status ${this.status}.`);
    }
    this.meetingDatetime = datetime;
    this.meetingUrl = meetingUrl;
    this.handledByAdminId = adminId;
    if (notes) this.adminNotes = notes;
    this.status = InquiryStatus.MEETING_SCHEDULED;
    this.updatedAt = new Date();
  }

  public markAsConverted(tenantId: string, adminId: string): void {
    this.status = InquiryStatus.DEAL_CONVERTED;
    this.convertedTenantId = tenantId;
    this.handledByAdminId = adminId;
    this.updatedAt = new Date();
  }

  public rejectLead(reason: string, adminId: string): void {
    this.status = InquiryStatus.REJECTED_DROPPED;
    this.adminNotes = reason;
    this.handledByAdminId = adminId;
    this.updatedAt = new Date();
  }
}
