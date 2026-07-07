import { Currency } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class CurrenciesService extends BaseMasterService<Currency> {
    protected readonly modelName = "currency";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "currency code";
    constructor(prisma: PrismaService);
    create(tenantId: string, data: Record<string, unknown>, actorId?: string): Promise<Currency>;
    update(tenantId: string, id: string, data: Record<string, unknown>, actorId?: string): Promise<Currency>;
    private clearExistingBaseCurrency;
}
