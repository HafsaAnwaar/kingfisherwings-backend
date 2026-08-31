import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class UpsertPartyEdiCodeDto {
  edi_type!: string;
  edi_code!: string;
  is_active?: boolean;
}

export class CreatePartyStandardChargeDto {
  charge_code_id?: string;
  description!: string;
  currency_code!: string;
  default_amount!: number;
  is_cost?: boolean;
  sort_order?: number;
}

@Injectable()
export class PartyExtensionsService {
  constructor(private readonly prisma: PrismaService) {}

  listEdiCodes(tenantId: string, partyId: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partyEdiCode.findMany({
        where: { tenant_id: tenantId, party_id: partyId, deleted_at: null },
        orderBy: { edi_type: 'asc' },
      }),
    );
  }

  async upsertEdiCode(
    tenantId: string,
    partyId: string,
    dto: UpsertPartyEdiCodeDto,
    actorId?: string,
  ) {
    await this.assertParty(tenantId, partyId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partyEdiCode.upsert({
        where: {
          tenant_id_party_id_edi_type: {
            tenant_id: tenantId,
            party_id: partyId,
            edi_type: dto.edi_type,
          },
        },
        create: {
          tenant_id: tenantId,
          party_id: partyId,
          edi_type: dto.edi_type,
          edi_code: dto.edi_code,
          is_active: dto.is_active ?? true,
          created_by: actorId,
        },
        update: {
          edi_code: dto.edi_code,
          is_active: dto.is_active ?? true,
        },
      }),
    );
  }

  listStandardCharges(tenantId: string, partyId: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partyStandardCharge.findMany({
        where: { tenant_id: tenantId, party_id: partyId, deleted_at: null },
        orderBy: { sort_order: 'asc' },
      }),
    );
  }

  async addStandardCharge(
    tenantId: string,
    partyId: string,
    dto: CreatePartyStandardChargeDto,
    actorId?: string,
  ) {
    await this.assertParty(tenantId, partyId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.partyStandardCharge.create({
        data: {
          tenant_id: tenantId,
          party_id: partyId,
          charge_code_id: dto.charge_code_id,
          description: dto.description,
          currency_code: dto.currency_code,
          default_amount: dto.default_amount,
          is_cost: dto.is_cost ?? false,
          sort_order: dto.sort_order ?? 0,
        },
      }),
    );
  }

  private async assertParty(tenantId: string, partyId: string) {
    const party = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({ where: { id: partyId, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!party) throw new NotFoundException('Party not found.');
  }
}
