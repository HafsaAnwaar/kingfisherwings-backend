import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentNumberType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberGeneratorService } from '../organization/number-formats/number-generator.service';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import { CreateAsnDto } from './dto/wms.dto';

@Injectable()
export class WmsAsnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
  ) {}

  async create(user: CurrentUser, dto: CreateAsnDto) {
    const number = await this.numberGenerator.generate(user.tenantId, DocumentNumberType.ASN);
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsAsn.create({
        data: {
          tenant_id: user.tenantId,
          asn_number: number,
          warehouse_id: dto.warehouse_id,
          party_id: dto.party_id,
          job_id: dto.job_id,
          expected_at: dto.expected_at ? new Date(dto.expected_at) : null,
          remarks: dto.remarks,
          created_by: user.id,
          updated_by: user.id,
          lines: {
            create: dto.lines.map((line, index) => ({ tenant_id: user.tenantId, ...line, sort_order: index })),
          },
        },
        include: { lines: { include: { item: true }, orderBy: { sort_order: 'asc' } }, warehouse: true },
      }),
    );
  }

  list(user: CurrentUser) {
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsAsn.findMany({
        where: { tenant_id: user.tenantId, deleted_at: null },
        include: { warehouse: true, lines: { include: { item: true } } },
        orderBy: { created_at: 'desc' },
      }),
    );
  }

  get(user: CurrentUser, id: string) {
    return this.require(user.tenantId, id);
  }

  async confirm(user: CurrentUser, id: string) {
    const asn = await this.require(user.tenantId, id);
    if (asn.status !== 'DRAFT') throw new BadRequestException('Only draft ASNs can be confirmed.');
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsAsn.update({ where: { id }, data: { status: 'CONFIRMED', updated_by: user.id } }),
    );
  }

  async cancel(user: CurrentUser, id: string) {
    const asn = await this.require(user.tenantId, id);
    if (!['DRAFT', 'CONFIRMED'].includes(asn.status)) throw new BadRequestException('Received or cancelled ASNs cannot be cancelled.');
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.wmsAsn.update({ where: { id }, data: { status: 'CANCELLED', updated_by: user.id } }),
    );
  }

  private async require(tenantId: string, id: string) {
    const asn = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.wmsAsn.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: { lines: { include: { item: true }, orderBy: { sort_order: 'asc' } }, warehouse: true },
      }),
    );
    if (!asn) throw new NotFoundException('ASN not found.');
    return asn;
  }
}
