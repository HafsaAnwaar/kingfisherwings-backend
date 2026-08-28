import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  DocumentNumberType,
  LandVehicleType,
  Prisma,
  TransportRequestStatus,
  TransportRequestType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberGeneratorService } from '../organization/number-formats/number-generator.service';
import { DocumentGenerationService } from '../../shared/queue/document-generation.service';
import {
  AssignTransportRequestDto,
  CreateTransportRequestDto,
  RecordTransportCostDto,
  TransportRequestQueryDto,
  TransportTimestampDto,
} from './dto/transport-request.dto';

const NEXT: Record<string, TransportRequestStatus[]> = {
  CREATED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['PICKUP_CONFIRMED', 'CANCELLED'],
  PICKUP_CONFIRMED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class TransportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
    private readonly documentGeneration: DocumentGenerationService,
  ) {}

  async createForJob(tenantId: string, jobId: string, dto: CreateTransportRequestDto, actorId?: string) {
    const requestNumber = await this.numberGenerator.generate(tenantId, DocumentNumberType.TRANSPORT_REQUEST);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });
      if (!job) throw new NotFoundException('Job not found.');

      if (dto.zip_distance_id) {
        const zip = await tx.zipDistance.findFirst({
          where: { id: dto.zip_distance_id, tenant_id: tenantId, deleted_at: null },
        });
        if (!zip) throw new NotFoundException('Zip distance not found.');
      }

      const created = await tx.transportRequest.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          request_number: requestNumber,
          request_type: dto.request_type as TransportRequestType,
          pickup_address: dto.pickup_address,
          delivery_address: dto.delivery_address,
          scheduled_pickup_datetime: dto.scheduled_pickup_datetime
            ? new Date(dto.scheduled_pickup_datetime)
            : undefined,
          scheduled_delivery_datetime: dto.scheduled_delivery_datetime
            ? new Date(dto.scheduled_delivery_datetime)
            : undefined,
          cargo_details: dto.cargo_details,
          zip_distance_id: dto.zip_distance_id,
          distance_km: dto.distance_km,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      if (job.job_type === 'LAND') {
        await this.markJobMilestone(tx, tenantId, jobId, 'PICKUP_SCHEDULED', new Date(), actorId);
      }

      return created;
    });
  }

  async listForJob(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });
      if (!job) throw new NotFoundException('Job not found.');
      return tx.transportRequest.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { created_at: 'desc' },
      });
    });
  }

  async findAll(tenantId: string, query: TransportRequestQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.TransportRequestWhereInput = { tenant_id: tenantId, deleted_at: null };
      if (query.status) where.status = query.status as TransportRequestStatus;
      if (query.trucker_id) where.assigned_trucker_id = query.trucker_id;
      if (query.job_id) where.job_id = query.job_id;
      if (query.from_date || query.to_date) {
        where.created_at = {
          ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
          ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
        };
      }

      const [data, total] = await Promise.all([
        tx.transportRequest.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: 'desc' },
        }),
        tx.transportRequest.count({ where }),
      ]);

      return {
        data,
        meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) || 1 },
      };
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => this.getOrThrow(tx, tenantId, id));
  }

  async assign(tenantId: string, id: string, dto: AssignTransportRequestDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await this.getOrThrow(tx, tenantId, id);
      this.assertTransition(row.status, 'ASSIGNED');

      const trucker = await tx.trucker.findFirst({
        where: { id: dto.trucker_id, tenant_id: tenantId, deleted_at: null },
      });
      if (!trucker) throw new NotFoundException('Trucker not found.');

      return tx.transportRequest.update({
        where: { id },
        data: {
          status: 'ASSIGNED',
          assigned_trucker_id: dto.trucker_id,
          vehicle_type: dto.vehicle_type ? (dto.vehicle_type as LandVehicleType) : undefined,
          vehicle_number: dto.vehicle_number,
          driver_name: dto.driver_name,
          driver_license: dto.driver_license,
          updated_by: actorId,
        },
      });
    });
  }

  async confirmPickup(tenantId: string, id: string, dto: TransportTimestampDto, actorId?: string) {
    return this.advance(tenantId, id, 'PICKUP_CONFIRMED', dto.at, actorId, async (tx, row, at) => {
      await tx.transportRequest.update({
        where: { id },
        data: { actual_pickup_datetime: at, status: 'PICKUP_CONFIRMED', updated_by: actorId },
      });
      const job = await tx.job.findFirst({ where: { id: row.job_id } });
      if (job?.job_type === 'LAND') {
        await this.markJobMilestone(tx, tenantId, row.job_id, 'CARGO_PICKED_UP', at, actorId);
      }
    });
  }

  async markInTransit(tenantId: string, id: string, dto: TransportTimestampDto, actorId?: string) {
    return this.advance(tenantId, id, 'IN_TRANSIT', dto.at, actorId, async (tx, row, at) => {
      await tx.transportRequest.update({
        where: { id },
        data: { status: 'IN_TRANSIT', updated_by: actorId },
      });
      const job = await tx.job.findFirst({ where: { id: row.job_id } });
      if (job?.job_type === 'LAND') {
        await this.markJobMilestone(tx, tenantId, row.job_id, 'IN_TRANSIT', at, actorId);
      }
    });
  }

  async markDelivered(tenantId: string, id: string, dto: TransportTimestampDto, actorId?: string) {
    return this.advance(tenantId, id, 'DELIVERED', dto.at, actorId, async (tx, row, at) => {
      await tx.transportRequest.update({
        where: { id },
        data: { status: 'DELIVERED', actual_delivery_datetime: at, updated_by: actorId },
      });
      const job = await tx.job.findFirst({ where: { id: row.job_id } });
      if (job?.job_type === 'LAND') {
        await this.markJobMilestone(tx, tenantId, row.job_id, 'DELIVERED', at, actorId);
      }
    });
  }

  async cancel(tenantId: string, id: string, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await this.getOrThrow(tx, tenantId, id);
      this.assertTransition(row.status, 'CANCELLED');
      return tx.transportRequest.update({
        where: { id },
        data: { status: 'CANCELLED', updated_by: actorId },
      });
    });
  }

  async recordCost(tenantId: string, id: string, dto: RecordTransportCostDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await this.getOrThrow(tx, tenantId, id);
      if (row.job_charge_id) {
        throw new ConflictException('Transport cost has already been recorded on this request.');
      }

      let chargeCode = dto.charge_code_id
        ? await tx.chargeCode.findFirst({
            where: { id: dto.charge_code_id, tenant_id: tenantId, deleted_at: null },
          })
        : await tx.chargeCode.findFirst({
            where: { tenant_id: tenantId, deleted_at: null, code: { equals: 'TRANSPORT', mode: 'insensitive' } },
          });
      if (!chargeCode) {
        chargeCode = await tx.chargeCode.findFirst({
          where: { tenant_id: tenantId, deleted_at: null, is_active: true },
          orderBy: { created_at: 'asc' },
        });
      }
      if (!chargeCode) throw new BadRequestException('No charge code available for transport cost.');

      const amount = dto.amount;
      const charge = await tx.jobCharge.create({
        data: {
          tenant_id: tenantId,
          job_id: row.job_id,
          charge_code_id: chargeCode.id,
          description: dto.description ?? `Transport ${row.request_number}`,
          quantity: 1,
          unit_price: amount,
          currency_code: dto.currency_code ?? 'AED',
          exchange_rate: 1,
          amount,
          amount_base_currency: amount,
          tax_amount: 0,
          is_cost: true,
          is_billable: false,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      await this.recalculateJobTotals(tx, tenantId, row.job_id);

      return tx.transportRequest.update({
        where: { id },
        data: {
          transport_cost_amount: amount,
          job_charge_id: charge.id,
          updated_by: actorId,
        },
      });
    });
  }

  async generatePdf(tenantId: string, id: string, actorId?: string) {
    const row = await this.findOne(tenantId, id);
    const task = await this.documentGeneration.enqueueJobDocument(
      tenantId,
      row.job_id,
      'TRANSPORT_REQUEST',
      actorId,
      undefined,
      false,
      { transport_request_id: id },
    );
    return {
      task_id: task.id,
      status: task.status,
      document_type: 'TRANSPORT_REQUEST',
      message: 'Document generation queued.',
    };
  }

  private async advance(
    tenantId: string,
    id: string,
    next: TransportRequestStatus,
    atIso: string | undefined,
    actorId: string | undefined,
    apply: (
      tx: Prisma.TransactionClient,
      row: { id: string; job_id: string; status: TransportRequestStatus },
      at: Date,
    ) => Promise<void>,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await this.getOrThrow(tx, tenantId, id);
      this.assertTransition(row.status, next);
      const at = atIso ? new Date(atIso) : new Date();
      await apply(tx, row, at);
      return tx.transportRequest.findFirstOrThrow({ where: { id } });
    });
  }

  private assertTransition(from: TransportRequestStatus, to: TransportRequestStatus) {
    if (!NEXT[from]?.includes(to)) {
      throw new BadRequestException(`Cannot move transport request from ${from} to ${to}.`);
    }
  }

  private async getOrThrow(tx: Prisma.TransactionClient, tenantId: string, id: string) {
    const row = await tx.transportRequest.findFirst({
      where: { id, tenant_id: tenantId, deleted_at: null },
    });
    if (!row) throw new NotFoundException('Transport request not found.');
    return row;
  }

  private async markJobMilestone(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
    milestoneName: string,
    actualDate: Date,
    actorId?: string,
  ) {
    const milestone = await tx.jobMilestone.findFirst({
      where: { tenant_id: tenantId, job_id: jobId, milestone: milestoneName, deleted_at: null },
    });
    if (!milestone || milestone.actual_date) return;
    await tx.jobMilestone.update({
      where: { id: milestone.id },
      data: { actual_date: actualDate, completed_by: actorId, updated_by: actorId },
    });
  }

  private async recalculateJobTotals(tx: Prisma.TransactionClient, tenantId: string, jobId: string) {
    const charges = await tx.jobCharge.findMany({
      where: { tenant_id: tenantId, job_id: jobId, deleted_at: null, is_provisional: false },
    });
    const revenue = charges.filter((c) => !c.is_cost).reduce((s, c) => s + Number(c.amount_base_currency), 0);
    const cost = charges.filter((c) => c.is_cost).reduce((s, c) => s + Number(c.amount_base_currency), 0);
    const gp = revenue - cost;
    const gpPercent = revenue > 0 ? (gp / revenue) * 100 : 0;
    await tx.job.update({
      where: { id: jobId },
      data: {
        revenue_total: revenue,
        cost_total: cost,
        gp_amount: gp,
        gp_percent: Math.round(gpPercent * 10000) / 10000,
      },
    });
  }
}
