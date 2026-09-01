import { Injectable } from "@nestjs/common";
import { TenantBankAccount } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { BaseMasterService } from "../../masters/base-master.service";

@Injectable()
export class BankAccountsService extends BaseMasterService<TenantBankAccount> {
  protected readonly modelName = "tenantBankAccount";
  protected readonly searchFields = [
    "bank_name",
    "account_name",
    "account_number",
  ];
  protected readonly uniqueKeyLabel = "bank account";

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(
    tenantId: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<TenantBankAccount> {
    if (data.is_default) {
      await this.clearExistingDefault(tenantId);
    }
    return super.create(tenantId, data, actorId);
  }

  async update(
    tenantId: string,
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<TenantBankAccount> {
    if (data.is_default) {
      await this.clearExistingDefault(tenantId, id);
    }
    return super.update(tenantId, id, data, actorId);
  }

  private async clearExistingDefault(
    tenantId: string,
    excludeId?: string,
  ): Promise<void> {
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantBankAccount.updateMany({
        where: {
          tenant_id: tenantId,
          is_default: true,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        data: { is_default: false },
      }),
    );
  }
}
