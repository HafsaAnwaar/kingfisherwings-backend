import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { QuotationsService } from '../quotations/quotations.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly quotationsService: QuotationsService,
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

      this.logger.log(`Quotation expiry cron complete — ${totalExpired} quotation(s) expired across ${tenants.length} tenant(s).`);
    } finally {
      this.running = false;
    }
  }
}
