import { TenantBankAccount } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../../masters/base-master.service';
export declare class BankAccountsService extends BaseMasterService<TenantBankAccount> {
    protected readonly modelName = "tenantBankAccount";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "bank account";
    constructor(prisma: PrismaService);
    create(tenantId: string, data: Record<string, unknown>, actorId?: string): Promise<TenantBankAccount>;
    update(tenantId: string, id: string, data: Record<string, unknown>, actorId?: string): Promise<TenantBankAccount>;
    private clearExistingDefault;
}
