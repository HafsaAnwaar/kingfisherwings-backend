import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentNumberFormat, DocumentNumberType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateNumberFormatDto, UpdateNumberFormatDto } from '../dto/number-format.dto';

@Injectable()
export class NumberFormatsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateNumberFormatDto, actorId?: string): Promise<DocumentNumberFormat> {
    try {
      return await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.documentNumberFormat.create({
          data: {
            tenant_id: tenantId,
            document_type: dto.document_type,
            prefix: dto.prefix,
            include_branch_code: dto.include_branch_code ?? false,
            include_year: dto.include_year ?? true,
            year_digits: dto.year_digits ?? 2,
            include_month: dto.include_month ?? false,
            sequence_length: dto.sequence_length ?? 5,
            separator: dto.separator ?? '/',
            reset_frequency: dto.reset_frequency ?? 'YEARLY',
            is_active: dto.is_active ?? true,
            created_by: actorId,
            updated_by: actorId,
          },
        }),
      );
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('A number format is already configured for this document type.');
      }
      throw error;
    }
  }

  async findAll(tenantId: string): Promise<DocumentNumberFormat[]> {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentNumberFormat.findMany({ where: { tenant_id: tenantId }, orderBy: { document_type: 'asc' } }),
    );
  }

  async findOne(tenantId: string, documentType: DocumentNumberType): Promise<DocumentNumberFormat> {
    const format = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentNumberFormat.findFirst({ where: { tenant_id: tenantId, document_type: documentType } }),
    );

    if (!format) {
      throw new NotFoundException(`No number format configured for ${documentType}.`);
    }

    return format;
  }

  async update(
    tenantId: string,
    documentType: DocumentNumberType,
    dto: UpdateNumberFormatDto,
    actorId?: string,
  ): Promise<DocumentNumberFormat> {
    const existing = await this.findOne(tenantId, documentType);

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentNumberFormat.update({
        where: { id: existing.id },
        data: { ...dto, updated_by: actorId },
      }),
    );
  }
}
