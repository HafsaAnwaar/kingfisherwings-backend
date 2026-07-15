import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { QuotationsService } from '../quotations/quotations.service';
import { SeaFclImportService } from '../jobs/sea-fcl-import.service';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private running = false;
  private demurrageRunning = false;
  private preAlertRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly quotationsService: QuotationsService,
    private readonly seaFclImport: SeaFclImportService,
    private readonly jobsService: JobsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleQuotationExpiry() {
    if (this.running) {
      this.logger.warn('Quotation expiry cron skipped — previous run still in progress.');
      return;
    }

    this.running = true;
    this.logger.log('Starting daily quotation expiry cron.');

    try {
      const tenants = await this.prisma.tenant.findMany({
        where: { status: { in: ['ACTIVE', 'TRIAL'] }, is_active: true, deleted_at: null },
        select: { id: true, name: true },
      });

      let totalExpired = 0;

      for (const tenant of tenants) {
        try {
          const result = await this.quotationsService.expireDue(tenant.id);
          if (result.expired > 0) {
            this.logger.log(`Tenant ${tenant.name}: expired ${result.expired} quotation(s).`);
            totalExpired += result.expired;
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Quotation expiry failed for tenant ${tenant.id}: ${message}`);
        }
      }

      this.logger.log(
        `Quotation expiry cron complete — ${totalExpired} quotation(s) expired across ${tenants.length} tenant(s).`,
      );
    } finally {
      this.running = false;
    }
  }

  /** Ch.11 — recalculate demurrage/detention accruals daily. */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDemurrageRecalc() {
    if (this.demurrageRunning) {
      this.logger.warn('Demurrage cron skipped — previous run still in progress.');
      return;
    }

    this.demurrageRunning = true;
    this.logger.log('Starting daily demurrage/detention recalculation cron.');

    try {
      const tenants = await this.prisma.tenant.findMany({
        where: { status: { in: ['ACTIVE', 'TRIAL'] }, is_active: true, deleted_at: null },
        select: { id: true, name: true },
      });

      let total = 0;
      for (const tenant of tenants) {
        try {
          const count = await this.seaFclImport.recalculateAllForTenant(tenant.id);
          total += count;
          if (count > 0) {
            this.logger.log(`Tenant ${tenant.name}: recalculated ${count} free-day row(s).`);
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Demurrage recalc failed for tenant ${tenant.id}: ${message}`);
        }
      }

      this.logger.log(`Demurrage cron complete — ${total} container free-day row(s) updated.`);
    } finally {
      this.demurrageRunning = false;
    }
  }

  /** Week 6 — deliver due scheduled pre-alerts every 5 minutes. */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleScheduledPreAlerts() {
    if (this.preAlertRunning) {
      this.logger.warn('Pre-alert cron skipped — previous run still in progress.');
      return;
    }

    this.preAlertRunning = true;

    try {
      const tenants = await this.prisma.tenant.findMany({
        where: { status: { in: ['ACTIVE', 'TRIAL'] }, is_active: true, deleted_at: null },
        select: { id: true, name: true },
      });

      let total = 0;
      for (const tenant of tenants) {
        try {
          const result = await this.jobsService.processScheduledPreAlerts(tenant.id);
          total += result.sent;
          if (result.sent > 0) {
            this.logger.log(`Tenant ${tenant.name}: sent ${result.sent} scheduled pre-alert(s).`);
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Scheduled pre-alert failed for tenant ${tenant.id}: ${message}`);
        }
      }

      if (total > 0) {
        this.logger.log(`Pre-alert scheduler complete — ${total} email(s) sent.`);
      }
    } finally {
      this.preAlertRunning = false;
    }
  }
}
