import { DocumentNumberType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
export interface GenerateNumberOptions {
    branchCode?: string;
    extraSegment?: string;
}
export declare class NumberGeneratorService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generate(tenantId: string, documentType: DocumentNumberType, options?: GenerateNumberOptions): Promise<string>;
    preview(tenantId: string, documentType: DocumentNumberType, options?: GenerateNumberOptions): Promise<string>;
    private periodKey;
    private assemble;
}
