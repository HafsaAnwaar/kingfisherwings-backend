import { PrismaService } from '../../prisma/prisma.service';
import { MasterQueryDto } from './dto/master-query.dto';
export interface PaginatedMasterResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare abstract class BaseMasterService<T> {
    protected readonly prisma: PrismaService;
    protected abstract readonly modelName: string;
    protected abstract readonly searchFields: string[];
    protected abstract readonly uniqueKeyLabel: string;
    protected readonly supportsIsActive: boolean;
    constructor(prisma: PrismaService);
    private delegate;
    create(tenantId: string, data: Record<string, unknown>, actorId?: string): Promise<T>;
    findAll(tenantId: string, query: MasterQueryDto): Promise<PaginatedMasterResult<T>>;
    findOne(tenantId: string, id: string): Promise<T>;
    update(tenantId: string, id: string, data: Record<string, unknown>, actorId?: string): Promise<T>;
    softDelete(tenantId: string, id: string, actorId?: string): Promise<void>;
}
