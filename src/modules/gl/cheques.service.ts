import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BounceChequeDto,
  ChequeQueryDto,
  CreateChequeDto,
  UpdateChequeDto,
} from './dto/ar-ap.dto';

@Injectable()
export class ChequesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: ChequeQueryDto) {
    const where: Prisma.ChequeWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
    };
    if (query.cheque_type) where.cheque_type = query.cheque_type;
    if (query.status) where.status = query.status;
    if (query.party_id) where.party_id = query.party_id;
    if (query.is_pdc !== undefined) where.is_pdc = query.is_pdc;
    if (query.due_before) {
      where.due_date = { lte: new Date(query.due_before) };
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.cheque.findMany({
        where,
        include: {
          party: { select: { id: true, code: true, name: true } },
          payment: { select: { id: true, payment_number: true, status: true } },
        },
        orderBy: [{ due_date: 'asc' }, { cheque_date: 'desc' }],
      }),
    );
  }

  async findOne(tenantId: string, id: string) {
    const cheque = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.cheque.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          party: { select: { id: true, code: true, name: true } },
          payment: true,
        },
      }),
    );
    if (!cheque) throw new NotFoundException('Cheque not found.');
    return cheque;
  }

  async pdcDue(tenantId: string, withinDays = 30) {
    const until = new Date();
    until.setDate(until.getDate() + withinDays);
    return this.findAll(tenantId, {
      is_pdc: true,
      status: 'PENDING',
      due_before: until.toISOString().slice(0, 10),
    });
  }

  async create(tenantId: string, dto: CreateChequeDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const party = await tx.party.findFirst({
        where: { id: dto.party_id, tenant_id: tenantId, deleted_at: null },
      });
      if (!party) throw new NotFoundException('Party not found.');

      return tx.cheque.create({
        data: {
          tenant_id: tenantId,
          cheque_number: dto.cheque_number,
          cheque_type: dto.cheque_type,
          party_id: dto.party_id,
          company_id: dto.company_id,
          bank_account_id: dto.bank_account_id,
          bank_name: dto.bank_name,
          amount: dto.amount,
          currency_code: dto.currency_code,
          cheque_date: new Date(dto.cheque_date),
          due_date: dto.due_date ? new Date(dto.due_date) : undefined,
          is_pdc: dto.is_pdc ?? Boolean(dto.due_date && dto.due_date > dto.cheque_date),
          remarks: dto.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  async update(tenantId: string, id: string, dto: UpdateChequeDto, actorId?: string) {
    const existing = await this.findOne(tenantId, id);
    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending cheques can be updated.');
    }
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.cheque.update({
        where: { id },
        data: {
          ...(dto.cheque_number !== undefined ? { cheque_number: dto.cheque_number } : {}),
          ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
          ...(dto.currency_code !== undefined ? { currency_code: dto.currency_code } : {}),
          ...(dto.cheque_date !== undefined ? { cheque_date: new Date(dto.cheque_date) } : {}),
          ...(dto.due_date !== undefined ? { due_date: new Date(dto.due_date) } : {}),
          ...(dto.is_pdc !== undefined ? { is_pdc: dto.is_pdc } : {}),
          ...(dto.bank_account_id !== undefined ? { bank_account_id: dto.bank_account_id } : {}),
          ...(dto.bank_name !== undefined ? { bank_name: dto.bank_name } : {}),
          ...(dto.remarks !== undefined ? { remarks: dto.remarks } : {}),
          updated_by: actorId,
        },
      }),
    );
  }

  async deposit(tenantId: string, id: string, actorId?: string) {
    const cheque = await this.findOne(tenantId, id);
    if (cheque.status !== 'PENDING') {
      throw new BadRequestException('Only pending cheques can be deposited.');
    }
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.cheque.update({
        where: { id },
        data: { status: 'DEPOSITED', deposited_at: new Date(), updated_by: actorId },
      }),
    );
  }

  async clear(tenantId: string, id: string, actorId?: string) {
    const cheque = await this.findOne(tenantId, id);
    if (!['PENDING', 'DEPOSITED'].includes(cheque.status)) {
      throw new BadRequestException('Only pending/deposited cheques can be cleared.');
    }
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.cheque.update({
        where: { id },
        data: {
          status: 'CLEARED',
          cleared_at: new Date(),
          deposited_at: cheque.deposited_at ?? new Date(),
          updated_by: actorId,
        },
      }),
    );
  }

  async bounce(tenantId: string, id: string, dto: BounceChequeDto, actorId?: string) {
    const cheque = await this.findOne(tenantId, id);
    if (!['PENDING', 'DEPOSITED'].includes(cheque.status)) {
      throw new BadRequestException('Only pending/deposited cheques can bounce.');
    }
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.cheque.update({
        where: { id },
        data: {
          status: 'BOUNCED',
          bounced_at: new Date(),
          bounce_reason: dto.reason,
          updated_by: actorId,
        },
      }),
    );
  }

  async cancel(tenantId: string, id: string, actorId?: string) {
    const cheque = await this.findOne(tenantId, id);
    if (cheque.status === 'CLEARED') {
      throw new BadRequestException('Cleared cheques cannot be cancelled.');
    }
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.cheque.update({
        where: { id },
        data: { status: 'CANCELLED', deleted_at: new Date(), updated_by: actorId },
      }),
    );
  }
}
