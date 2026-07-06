import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { setTenantContextQuery } from '../common/utils/rls.util';

@Injectable()
export class PrismaService extends PrismaClient
implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Runs `callback` inside a single Postgres transaction with
   * `app.tenant_id` set for its entire duration, so every tenant-scoped
   * table's RLS policy (see prisma/migrations/*_enable_row_level_security)
   * evaluates against the right tenant.
   *
   * Deliberately explicit rather than a transparent Prisma Client
   * Extension: extensions' `$allOperations` hooks also fire for calls
   * made through an ALREADY-open `$transaction(async (tx) => {...})`
   * callback, and naively re-wrapping those in a second, independent
   * transaction would silently break the atomicity of the outer one
   * (a partial write could commit even if a later step in the same
   * logical operation fails). This helper avoids that entirely: it
   * simply IS the one transaction, and the caller does all of its
   * tenant-scoped work on the `tx` it's given.
   *
   * Usage: `await this.prisma.runWithTenant(tenantId, (tx) => tx.user.findMany(...))`
   */
  async runWithTenant<T>(
    tenantId: string,
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRaw(setTenantContextQuery(tenantId));
      return callback(tx);
    });
  }
}
