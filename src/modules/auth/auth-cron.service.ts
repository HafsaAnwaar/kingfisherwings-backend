import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthCronService {
  private readonly logger = new Logger(AuthCronService.name);
  private running = false;

  constructor(private readonly prisma: PrismaService) {}

  /** Purge expired and long-revoked sessions to keep auth tables bounded. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeStaleSessions() {
    if (this.running) return;
    this.running = true;

    const now = new Date();
    const revokedCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    try {
      const [staff, superAdmin, portal, vendor] = await Promise.all([
        this.prisma.session.deleteMany({
          where: {
            OR: [{ expires_at: { lt: now } }, { revoked_at: { lt: revokedCutoff } }],
          },
        }),
        this.prisma.superAdminSession.deleteMany({
          where: {
            OR: [{ expires_at: { lt: now } }, { revoked_at: { lt: revokedCutoff } }],
          },
        }),
        this.prisma.portalSession.deleteMany({
          where: {
            OR: [{ expires_at: { lt: now } }, { revoked_at: { lt: revokedCutoff } }],
          },
        }),
        this.prisma.vendorSession.deleteMany({
          where: {
            OR: [{ expires_at: { lt: now } }, { revoked_at: { lt: revokedCutoff } }],
          },
        }),
      ]);

      this.logger.log(
        `Session purge: staff=${staff.count}, superAdmin=${superAdmin.count}, portal=${portal.count}, vendor=${vendor.count}`,
      );
    } catch (err) {
      this.logger.error(`Session purge failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      this.running = false;
    }
  }
}
