import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentRequestStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberGeneratorService } from '../organization/number-formats/number-generator.service';
import {
  CreatePaymentRequestDto,
  PaymentRequestQueryDto,
  RejectPaymentRequestDto,
  UpdatePaymentRequestDto,
} from './dto/payment-request.dto';

const EDITABLE_STATUSES: PaymentRequestStatus[] = ['PENDING'];

@Injectable()
export class PaymentRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
  ) {}

  async findAll(tenantId: string, query: PaymentRequestQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.PaymentRequestWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        ...(query.status ? { status: query.status } : {}),
        ...(query.party_id ? { party_id: query.party_id } : {}),
        ...(query.job_id ? { job_id: query.job_id } : {}),
      };

      const [data, total] = await Promise.all([
        tx.paymentRequest.findMany({
          where,
          include: {
            party: { select: { id: true, name: true, code: true } },
            invoice: { select: { id: true, invoice_number: true } },
            job: { select: { id: true, job_number: true } },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        tx.paymentRequest.count({ where }),
      ]);

      return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      };
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const request = await tx.paymentRequest.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          party: { select: { id: true, name: true, code: true, email: true } },
          invoice: { select: { id: true, invoice_number: true, balance_due: true } },
          job: { select: { id: true, job_number: true } },
        },
      });

      if (!request) {
        throw new NotFoundException('Payment request not found.');
      }

      return request;
    });
  }

  async create(tenantId: string, dto: CreatePaymentRequestDto, actorId?: string) {
    await this.assertPartyExists(tenantId, dto.party_id);
    if (dto.invoice_id) await this.assertInvoiceExists(tenantId, dto.invoice_id);
    if (dto.job_id) await this.assertJobExists(tenantId, dto.job_id);

    const requestNumber = await this.numberGenerator.generate(tenantId, 'VOUCHER');

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentRequest.create({
        data: {
          tenant_id: tenantId,
          request_number: requestNumber,
          status: 'PENDING',
          party_id: dto.party_id,
          invoice_id: dto.invoice_id,
          job_id: dto.job_id,
          amount: dto.amount,
          currency_code: dto.currency_code,
          due_date: dto.due_date ? new Date(dto.due_date) : undefined,
          remarks: dto.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
        include: {
          party: { select: { id: true, name: true } },
          invoice: { select: { id: true, invoice_number: true } },
        },
      }),
    );
  }

  async update(tenantId: string, id: string, dto: UpdatePaymentRequestDto, actorId?: string) {
    const request = await this.findOne(tenantId, id);
    this.assertEditable(request.status);

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentRequest.update({
        where: { id },
        data: {
          ...(dto.party_id ? { party_id: dto.party_id } : {}),
          ...(dto.invoice_id !== undefined ? { invoice_id: dto.invoice_id } : {}),
          ...(dto.job_id !== undefined ? { job_id: dto.job_id } : {}),
          ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
          ...(dto.currency_code ? { currency_code: dto.currency_code } : {}),
          ...(dto.due_date !== undefined ? { due_date: dto.due_date ? new Date(dto.due_date) : null } : {}),
          ...(dto.remarks !== undefined ? { remarks: dto.remarks } : {}),
          updated_by: actorId,
        },
      }),
    );
  }

  async approve(tenantId: string, id: string, actorId?: string) {
    const request = await this.findOne(tenantId, id);

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending payment requests can be approved.');
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approved_at: new Date(),
          approved_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async reject(tenantId: string, id: string, dto: RejectPaymentRequestDto, actorId?: string) {
    const request = await this.findOne(tenantId, id);

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending payment requests can be rejected.');
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejected_reason: dto.rejected_reason,
          updated_by: actorId,
        },
      }),
    );
  }

  async markPaid(tenantId: string, id: string, actorId?: string) {
    const request = await this.findOne(tenantId, id);

    if (request.status !== 'APPROVED') {
      throw new BadRequestException('Only approved payment requests can be marked paid.');
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const updated = await tx.paymentRequest.update({
        where: { id },
        data: { status: 'PAID', paid_at: new Date(), updated_by: actorId },
      });

      if (request.invoice_id) {
        const invoice = await tx.invoice.findFirst({ where: { id: request.invoice_id } });
        if (invoice) {
          const amountPaid = Number(invoice.amount_paid) + Number(request.amount);
          const balanceDue = Number(invoice.total_amount) - amountPaid;
          await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              amount_paid: amountPaid,
              balance_due: balanceDue,
              status: balanceDue <= 0 ? 'PAID' : 'PARTIALLY_PAID',
              updated_by: actorId,
            },
          });
        }
      }

      return updated;
    });
  }

  async softDelete(tenantId: string, id: string, actorId?: string) {
    const request = await this.findOne(tenantId, id);
    this.assertEditable(request.status);

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentRequest.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: actorId },
      }),
    );
  }

  private assertEditable(status: PaymentRequestStatus) {
    if (!EDITABLE_STATUSES.includes(status)) {
      throw new BadRequestException('Only pending payment requests can be modified.');
    }
  }

  private async assertPartyExists(tenantId: string, partyId: string) {
    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({ where: { id: partyId, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!exists) throw new NotFoundException('Party not found.');
  }

  private async assertJobExists(tenantId: string, jobId: string) {
    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!exists) throw new NotFoundException('Job not found.');
  }

  private async assertInvoiceExists(tenantId: string, invoiceId: string) {
    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findFirst({ where: { id: invoiceId, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!exists) throw new NotFoundException('Invoice not found.');
  }
}
