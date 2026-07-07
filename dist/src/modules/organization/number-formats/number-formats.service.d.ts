import { DocumentNumberFormat, DocumentNumberType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateNumberFormatDto, UpdateNumberFormatDto } from '../dto/number-format.dto';
export declare class NumberFormatsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateNumberFormatDto, actorId?: string): Promise<DocumentNumberFormat>;
    findAll(tenantId: string): Promise<DocumentNumberFormat[]>;
    findOne(tenantId: string, documentType: DocumentNumberType): Promise<DocumentNumberFormat>;
    update(tenantId: string, documentType: DocumentNumberType, dto: UpdateNumberFormatDto, actorId?: string): Promise<DocumentNumberFormat>;
}
