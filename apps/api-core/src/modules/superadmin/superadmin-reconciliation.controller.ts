import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { SuperadminGuard } from '../../common/guards/superadmin.guard.js';
import { ReconciliationEngineService } from '../billing/reconciliation-engine.service.js';
import { MidtransReportAdapter } from '@polaris/payment';
import { db, invoiceTransactions } from '@polaris/database';
import { eq, or } from 'drizzle-orm';
import {
  TriggerReconciliationDto,
  UploadSettlementCsvDto,
  ResolveDiscrepancyDto,
} from './dto/reconciliation-request.dto.js';

@Controller('admin/reconciliation')
@UseGuards(SuperadminGuard)
export class SuperadminReconciliationController {
  private readonly reportAdapter = new MidtransReportAdapter();

  constructor(private readonly reconEngine: ReconciliationEngineService) {}

  @Get('batches')
  @HttpCode(HttpStatus.OK)
  async listBatches(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string
  ) {
    return await this.reconEngine.listBatches({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status,
    });
  }

  @Get('batches/:id')
  @HttpCode(HttpStatus.OK)
  async getBatchDetail(@Param('id') id: string) {
    return await this.reconEngine.getBatchDetail(id);
  }

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  async triggerReconciliation(
    @Body() dto: TriggerReconciliationDto,
    @Req() req: any
  ) {
    const adminUser = req.user;

    // Ambil semua order ID dari invoice yang perlu diverifikasi (UNRECONCILED atau SETTLEMENT)
    const unreconciledInvoices = await db
      .select({ gatewayOrderId: invoiceTransactions.gatewayOrderId })
      .from(invoiceTransactions)
      .where(
        or(
          eq(invoiceTransactions.reconciliationStatus, 'UNRECONCILED'),
          eq(invoiceTransactions.reconciliationStatus, 'DISCREPANCY')
        )
      );

    const orderIds = unreconciledInvoices
      .map((inv) => inv.gatewayOrderId)
      .filter((id): id is string => !!id);

    // Query status setiap order ID ke Midtrans Core API
    const records = await this.reportAdapter.fetchSettlementListByDate(dto.reconDate, orderIds);

    return await this.reconEngine.executeReconciliation({
      reconDate: dto.reconDate,
      gatewayRecords: records,
      sourceGateway: 'MIDTRANS',
      executedBy: adminUser?.email || 'SUPERADMIN_MANUAL',
      notes: dto.notes || 'Dipicu manual melalui Konsol Superadmin',
    });
  }

  @Post('upload-csv')
  @HttpCode(HttpStatus.OK)
  async uploadSettlementCsv(
    @Body() dto: UploadSettlementCsvDto,
    @Req() req: any
  ) {
    const adminUser = req.user;
    const records = await this.reportAdapter.parseSettlementCsv(dto.csvContent);

    return await this.reconEngine.executeReconciliation({
      reconDate: dto.reconDate,
      gatewayRecords: records,
      sourceGateway: 'MIDTRANS_CSV_UPLOAD',
      executedBy: adminUser?.email || 'SUPERADMIN_CSV',
      notes: dto.notes || 'Rekonsiliasi melalui unggah file CSV Midtrans Merchant Portal',
    });
  }

  @Post('discrepancies/:id/resolve')
  @HttpCode(HttpStatus.OK)
  async resolveDiscrepancy(
    @Param('id') id: string,
    @Body() dto: ResolveDiscrepancyDto,
    @Req() req: any
  ) {
    const adminId = req.user?.tenantId || req.user?.sub;
    return await this.reconEngine.resolveDiscrepancy(
      id,
      dto.resolutionStatus,
      dto.resolutionNotes,
      adminId
    );
  }
}
