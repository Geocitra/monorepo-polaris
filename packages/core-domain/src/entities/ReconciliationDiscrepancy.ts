import { DiscrepancyType, DiscrepancyResolutionStatus } from '@polaris/shared-types';

export interface DiscrepancyProps {
  id: string;
  batchId: string;
  invoiceId?: string | null;
  gatewayOrderId: string;
  discrepancyType: DiscrepancyType;
  internalStatus?: string | null;
  gatewayStatus?: string | null;
  internalAmountIdr: number;
  gatewayAmountIdr: number;
  resolutionStatus?: DiscrepancyResolutionStatus;
  resolutionNotes?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: Date | null;
  createdAt?: Date;
}

export class ReconciliationDiscrepancy {
  public readonly id: string;
  public readonly batchId: string;
  public readonly invoiceId: string | null;
  public readonly gatewayOrderId: string;
  public readonly discrepancyType: DiscrepancyType;
  public readonly internalStatus: string | null;
  public readonly gatewayStatus: string | null;
  public readonly internalAmountIdr: number;
  public readonly gatewayAmountIdr: number;
  public readonly discrepancyAmountIdr: number;
  public resolutionStatus: DiscrepancyResolutionStatus;
  public resolutionNotes: string | null;
  public resolvedBy: string | null;
  public resolvedAt: Date | null;
  public readonly createdAt: Date;

  constructor(props: DiscrepancyProps) {
    this.id = props.id;
    this.batchId = props.batchId;
    this.invoiceId = props.invoiceId || null;
    this.gatewayOrderId = props.gatewayOrderId;
    this.discrepancyType = props.discrepancyType;
    this.internalStatus = props.internalStatus || null;
    this.gatewayStatus = props.gatewayStatus || null;
    this.internalAmountIdr = props.internalAmountIdr;
    this.gatewayAmountIdr = props.gatewayAmountIdr;
    this.discrepancyAmountIdr = Math.abs(props.internalAmountIdr - props.gatewayAmountIdr);
    this.resolutionStatus = props.resolutionStatus || DiscrepancyResolutionStatus.UNRESOLVED;
    this.resolutionNotes = props.resolutionNotes || null;
    this.resolvedBy = props.resolvedBy || null;
    this.resolvedAt = props.resolvedAt || null;
    this.createdAt = props.createdAt || new Date();
  }

  public resolve(
    status: DiscrepancyResolutionStatus.AUTO_RESOLVED | DiscrepancyResolutionStatus.MANUALLY_RESOLVED | DiscrepancyResolutionStatus.IGNORED,
    notes: string,
    resolvedBy?: string | null
  ): void {
    this.resolutionStatus = status;
    this.resolutionNotes = notes;
    this.resolvedBy = resolvedBy || (status === DiscrepancyResolutionStatus.AUTO_RESOLVED ? 'SYSTEM_SELF_HEAL' : null);
    this.resolvedAt = new Date();
  }

  public isResolved(): boolean {
    return this.resolutionStatus !== DiscrepancyResolutionStatus.UNRESOLVED;
  }
}
