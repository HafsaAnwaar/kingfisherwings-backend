import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { QuotationsService } from '../quotations/quotations.service';
import { SeaFclImportService } from '../jobs/sea-fcl-import.service';
import { JobsService } from '../jobs/jobs.service';
import { NotificationEmitterService } from '../notifications/notification-emitter.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private running = false;
  private demurrageRunning = false;
  private preAlertRunning = false;
  private invoiceOverdueRunning = false;
  private pdcMaturityRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly quotationsService: QuotationsService,
    private readonly seaFclImport: SeaFclImportService,
    private readonly jobsService: JobsService,
    private readonly notifications: NotificationEmitterService,
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

  /** Week 13 — notify portal users of overdue customer invoices (grouped by party). */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleInvoiceOverdue() {
    if (this.invoiceOverdueRunning) {
      this.logger.warn('Invoice overdue cron skipped — previous run still in progress.');
      return;
    }

    this.invoiceOverdueRunning = true;
    this.logger.log('Starting daily invoice overdue notification cron.');

    try {
      const tenants = await this.prisma.tenant.findMany({
        where: { status: { in: ['ACTIVE', 'TRIAL'] }, is_active: true, deleted_at: null },
        select: { id: true, name: true },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let notified = 0;

      for (const tenant of tenants) {
        try {
          const overdue = await this.prisma.runWithTenant(tenant.id, (tx) =>
            tx.invoice.findMany({
              where: {
                tenant_id: tenant.id,
                deleted_at: null,
                invoice_type: { in: ['CUSTOMER_INVOICE', 'DEBIT_NOTE'] },
                status: { in: ['POSTED', 'SENT', 'PARTIALLY_PAID'] },
                balance_due: { gt: 0 },
                due_date: { lt: today },
              },
              select: { party_id: true },
            }),
          );

          const counts = new Map<string, number>();
          for (const inv of overdue) {
            counts.set(inv.party_id, (counts.get(inv.party_id) ?? 0) + 1);
          }

          for (const [partyId, count] of counts) {
            await this.notifications.notifyPartyPortalUsers(tenant.id, partyId, {
              type: 'INVOICE_OVERDUE',
              title: 'Overdue invoices',
              message:
                count === 1
                  ? 'You have 1 overdue invoice. Please review your account.'
                  : `You have ${count} overdue invoices. Please review your account.`,
              entity_type: 'invoice',
              link_path: '/portal/invoices',
            });
            notified += 1;
          }

          if (counts.size > 0) {
            const totalOverdue = [...counts.values()].reduce((a, b) => a + b, 0);
            await this.notifications.notifyFinanceStaff(tenant.id, {
              type: 'INVOICE_OVERDUE',
              title: 'Customer invoices overdue',
              message: `${totalOverdue} overdue invoice(s) across ${counts.size} customer(s).`,
              entity_type: 'invoice',
              link_path: '/invoices?status=overdue',
            });
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Invoice overdue cron failed for tenant ${tenant.id}: ${message}`);
        }
      }

      this.logger.log(`Invoice overdue cron complete — notified ${notified} party group(s).`);
    } finally {
      this.invoiceOverdueRunning = false;
    }
  }

  /** Week 13 — PDC cheques maturing within 7 days. */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handlePdcMaturity() {
    if (this.pdcMaturityRunning) {
      this.logger.warn('PDC maturity cron skipped — previous run still in progress.');
      return;
    }

    this.pdcMaturityRunning = true;
    this.logger.log('Starting daily PDC maturity notification cron.');

    try {
      const tenants = await this.prisma.tenant.findMany({
        where: { status: { in: ['ACTIVE', 'TRIAL'] }, is_active: true, deleted_at: null },
        select: { id: true, name: true },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inSevenDays = new Date(today);
      inSevenDays.setDate(inSevenDays.getDate() + 7);

      let notified = 0;

      for (const tenant of tenants) {
        try {
          const cheques = await this.prisma.runWithTenant(tenant.id, (tx) =>
            tx.cheque.findMany({
              where: {
                tenant_id: tenant.id,
                deleted_at: null,
                is_pdc: true,
                status: { in: ['PENDING', 'DEPOSITED'] },
                due_date: { gte: today, lte: inSevenDays },
              },
              select: {
                id: true,
                cheque_number: true,
                due_date: true,
                party_id: true,
                amount: true,
                currency_code: true,
              },
            }),
          );

          for (const cheque of cheques) {
            const dueLabel = cheque.due_date
              ? cheque.due_date.toISOString().slice(0, 10)
              : 'soon';
            const msg = `PDC cheque ${cheque.cheque_number} (${cheque.currency_code} ${cheque.amount}) is due on ${dueLabel}.`;

            if (cheque.party_id) {
              await this.notifications.notifyPartyPortalUsers(tenant.id, cheque.party_id, {
                type: 'PDC_MATURITY_APPROACHING',
                title: 'PDC maturity approaching',
                message: msg,
                entity_type: 'cheque',
                entity_id: cheque.id,
                link_path: '/portal/payments',
              });
            }
            await this.notifications.notifyFinanceStaff(tenant.id, {
              type: 'PDC_MATURITY_APPROACHING',
              title: 'PDC maturity approaching',
              message: msg,
              entity_type: 'cheque',
              entity_id: cheque.id,
            });
            notified += 1;
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`PDC maturity cron failed for tenant ${tenant.id}: ${message}`);
        }
      }

      this.logger.log(`PDC maturity cron complete — ${notified} cheque notification(s).`);
    } finally {
      this.pdcMaturityRunning = false;
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
