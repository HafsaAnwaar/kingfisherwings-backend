import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../../shared/email/email.service";

@Injectable()
export class NvoccCronService {
  private readonly logger = new Logger(NvoccCronService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /** Daily reminder for voyages with cut-offs in the next 3 days. */
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async processCutoffReminders(): Promise<void> {
    if (this.running) {
      this.logger.warn(
        "NVOCC cutoff cron skipped — previous run still in progress.",
      );
      return;
    }
    this.running = true;
    try {
      const tenants = await this.prisma.tenant.findMany({
        where: { deleted_at: null },
        select: { id: true },
      });
      const horizon = new Date();
      horizon.setDate(horizon.getDate() + 3);
      const now = new Date();
      let sent = 0;

      for (const tenant of tenants) {
        const voyages = await this.prisma.runWithTenant(tenant.id, (tx) =>
          tx.nvoccVoyage.findMany({
            where: {
              tenant_id: tenant.id,
              deleted_at: null,
              voyage_status: { in: ["OPEN", "FULL"] },
              OR: [
                { si_cutoff: { gte: now, lte: horizon } },
                { vgm_cutoff: { gte: now, lte: horizon } },
                { cy_cutoff: { gte: now, lte: horizon } },
                { cargo_cutoff: { gte: now, lte: horizon } },
              ],
            },
            include: {
              bookings: {
                where: {
                  deleted_at: null,
                  booking_status: { in: ["CONFIRMED", "CONVERTED"] },
                },
              },
            },
          }),
        );

        for (const voyage of voyages) {
          if (voyage.bookings.length === 0) continue;
          const lines = [
            `Voyage ${voyage.voyage_number} — upcoming cut-offs:`,
            voyage.si_cutoff ? `SI: ${voyage.si_cutoff.toISOString()}` : null,
            voyage.vgm_cutoff
              ? `VGM: ${voyage.vgm_cutoff.toISOString()}`
              : null,
            voyage.cy_cutoff ? `CY: ${voyage.cy_cutoff.toISOString()}` : null,
            voyage.cargo_cutoff
              ? `Cargo: ${voyage.cargo_cutoff.toISOString()}`
              : null,
          ].filter(Boolean);

          try {
            await this.emailService.send({
              tenantId: tenant.id,
              eventType: "OTHER",
              to: "ops@kingfisher.local",
              subject: `NVOCC cut-off reminder — ${voyage.voyage_number}`,
              body: lines.join("\n"),
            });
            sent++;
          } catch (err) {
            this.logger.error(
              `Cutoff email failed for voyage ${voyage.id}: ${(err as Error).message}`,
            );
          }
        }
      }

      this.logger.log(`NVOCC cutoff cron complete — ${sent} reminder(s) sent.`);
    } finally {
      this.running = false;
    }
  }
}
