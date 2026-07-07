import { TaxRate } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseMasterService } from '../base-master.service';
export declare class TaxRatesService extends BaseMasterService<TaxRate> {
    protected readonly modelName = "taxRate";
    protected readonly searchFields: string[];
    protected readonly uniqueKeyLabel = "tax rate code";
    constructor(prisma: PrismaService);
    create(tenantId: string, data: Record<string, unknown>, actorId?: string): Promise<TaxRate>;
    update(tenantId: string, id: string, data: Record<string, unknown>, actorId?: string): Promise<TaxRate>;
    private clearExistingDefault;
}
