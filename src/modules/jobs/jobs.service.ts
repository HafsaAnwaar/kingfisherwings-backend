import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Job, JobType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberGeneratorService } from '../organization/number-formats/number-generator.service';
import { AIR_EXPORT_MILESTONES } from './constants/air-export-milestones';

import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { UpdateAirJobDetailDto } from './dto/air-job-detail.dto';
import { UpdateSeaFclJobDetailDto } from './dto/sea-fcl-job-detail.dto';
import { CreateJobChargeDto, UpdateJobChargeDto } from './dto/job-charge.dto';
import { UpdateJobMilestoneDto, CreateCustomMilestoneDto } from './dto/job-milestone.dto';
import { CreateJobNoteDto, UpdateJobNoteDto } from './dto/job-note.dto';
import { CreateJobDocumentDto, UpdateJobDocumentDto, FinalizeJobDocumentDto } from './dto/job-document.dto';
import { CreateJobContainerDto, UpdateJobContainerDto } from './dto/job-container.dto';
import { SendPreAlertDto } from './dto/pre-alert.dto';
import { JobQueryDto } from './dto/job-query.dto';

const JOB_TYPE_CODE: Record<JobType, string> = {
  AIR_EXPORT: 'AE',
  AIR_IMPORT: 'AI',
  SEA_FCL_EXPORT: 'FE',
  SEA_FCL_IMPORT: 'FI',
  SEA_LCL_EXPORT: 'LE',
  SEA_LCL_IMPORT: 'LI',
  LAND: 'LD',
  COURIER: 'CR',
  CUSTOMS_CLEARANCE: 'CC',
  NVOCC_EXPORT: 'NE',
  NVOCC_IMPORT: 'NI',
  SERVICE_JOB: 'SJ',
  WAREHOUSE: 'WH',
};

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
  ) {}

  // ============================================================
  // CREATE
  // ============================================================

  async create(tenantId: string, dto: CreateJobDto, actorId?: string): Promise<Job> {
    await this.assertPartyExists(tenantId, dto.shipper_id, 'Shipper');
    await this.assertPartyExists(tenantId, dto.consignee_id, 'Consignee');
    await this.assertPartyExists(tenantId, dto.agent_id, 'Agent');
    await this.assertCompanyExists(tenantId, dto.company_id);
    await this.assertBranchExists(tenantId, dto.branch_id);
    await this.assertDepartmentExists(tenantId, dto.department_id);
    await this.assertPortExists(tenantId, dto.origin_port_id, 'Origin port');
    await this.assertPortExists(tenantId, dto.dest_port_id, 'Destination port');

    let parentJob: Job | null = null;

    if (dto.parent_job_id) {
      parentJob = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.job.findFirst({ where: { id: dto.parent_job_id, tenant_id: tenantId, deleted_at: null } }),
      );

      if (!parentJob) {
        throw new NotFoundException('Parent (master) job not found.');
      }

      if (parentJob.parent_job_id) {
        throw new BadRequestException(
          'A house job cannot itself be the parent of another house job — only one level of consolidation is supported.',
        );
      }

      if (parentJob.job_type !== dto.job_type) {
        throw new BadRequestException('A house job must be the same job_type as its master.');
      }
    }

    const branchCode = await this.resolveBranchCode(tenantId, dto.branch_id);
    const jobNumber = await this.numberGenerator.generate(tenantId, 'JOB_NUMBER', {
      extraSegment: JOB_TYPE_CODE[dto.job_type],
      branchCode,
    });

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.create({
        data: {
          tenant_id: tenantId,
          company_id: dto.company_id,
          job_number: jobNumber,
          job_type: dto.job_type,
          status: 'BOOKING_CONFIRMED',
          branch_id: dto.branch_id,
          department_id: dto.department_id,
          parent_job_id: dto.parent_job_id,
          shipper_id: dto.shipper_id,
          consignee_id: dto.consignee_id,
          agent_id: dto.agent_id,
          salesperson_id: dto.salesperson_id,
          ops_user_id: dto.ops_user_id,
          origin_port_id: dto.origin_port_id,
          dest_port_id: dto.dest_port_id,
          commodity: dto.commodity,
          hs_code: dto.hs_code,
          gross_weight: dto.gross_weight,
          chargeable_weight: dto.chargeable_weight,
          volume_cbm: dto.volume_cbm,
          pieces: dto.pieces,
          container_type_id: dto.container_type_id,
          container_count: dto.container_count,
          incoterms: dto.incoterms,
          is_dg: dto.is_dg ?? false,
          dg_class: dto.dg_class,
          notes: dto.notes,
          customer_remarks: dto.customer_remarks,
          tags: dto.tags ?? [],
          etd: dto.etd ? new Date(dto.etd) : undefined,
          eta: dto.eta ? new Date(dto.eta) : undefined,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      // Air Export gets its detail row + the full 15-milestone taxonomy
      // seeded immediately — matches spec Ch.8.5 exactly. Other job
      // types get their own taxonomy + detail table when those
      // modules are built; this is deliberately Air Export-specific.
      if (dto.job_type === 'AIR_EXPORT') {
        await tx.airJobDetail.create({
          data: { tenant_id: tenantId, job_id: job.id, created_by: actorId, updated_by: actorId },
        });

        await tx.jobMilestone.createMany({
          data: AIR_EXPORT_MILESTONES.map((milestone) => ({
            tenant_id: tenantId,
            job_id: job.id,
            milestone,
            created_by: actorId,
            updated_by: actorId,
          })),
        });
      }

      if (dto.job_type === 'SEA_FCL_EXPORT' || dto.job_type === 'SEA_FCL_IMPORT') {
        await tx.seaFclJobDetail.create({
          data: { tenant_id: tenantId, job_id: job.id, created_by: actorId, updated_by: actorId },
        });
      }

      return job;
    });
  }

  // ============================================================
  // READ
  // ============================================================

  async findAll(tenantId: string, query: JobQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = { tenant_id: tenantId, deleted_at: null };

      if (query.status) where.status = query.status;
      if (query.job_type) where.job_type = query.job_type;
      if (query.shipper_id) where.shipper_id = query.shipper_id;
      if (query.salesperson_id) where.salesperson_id = query.salesperson_id;
      if (query.branch_id) where.branch_id = query.branch_id;
      if (query.company_id) where.company_id = query.company_id;
      if (query.origin_port_id) where.origin_port_id = query.origin_port_id;
      if (query.dest_port_id) where.dest_port_id = query.dest_port_id;
      if (query.parent_job_id) where.parent_job_id = query.parent_job_id;
      if (query.masters_only) where.parent_job_id = null;

      if (query.from_date || query.to_date) {
        where.created_at = {
          ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
          ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
        };
      }

      if (query.search) {
        where.OR = [
          { job_number: { contains: query.search, mode: 'insensitive' } },
          { commodity: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      const [data, total] = await Promise.all([
        tx.job.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: query.order },
        }),
        tx.job.count({ where }),
      ]);

      return {
        data,
        meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) || 1 },
      };
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          air_details: true,
          sea_fcl_details: { include: { containers: { where: { deleted_at: null } } } },
          charges: { orderBy: { created_at: 'asc' } },
          milestones: { orderBy: { created_at: 'asc' } },
          notes_list: { where: { deleted_at: null }, orderBy: { created_at: 'desc' } },
          documents: { where: { deleted_at: null }, orderBy: { created_at: 'desc' } },
          house_jobs: {
            where: { deleted_at: null },
            select: { id: true, job_number: true, status: true, shipper_id: true },
          },
        },
      });

      if (!job) {
        throw new NotFoundException('Job not found.');
      }

      return job;
    });
  }

  async getHouseJobs(tenantId: string, masterId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const master = await tx.job.findFirst({ where: { id: masterId, tenant_id: tenantId, deleted_at: null } });

      if (!master) {
        throw new NotFoundException('Job not found.');
      }

      return tx.job.findMany({
        where: { tenant_id: tenantId, parent_job_id: masterId, deleted_at: null },
        orderBy: { created_at: 'asc' },
      });
    });
  }

  async getMilestones(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getOrThrow(tx, tenantId, jobId);

      return tx.jobMilestone.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { created_at: 'asc' },
      });
    });
  }

  async getPnl(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await this.getOrThrow(tx, tenantId, jobId);

      const charges = await tx.jobCharge.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { created_at: 'asc' },
      });

      const revenueLines = charges.filter((c) => !c.is_cost);
      const costLines = charges.filter((c) => c.is_cost);

      return {
        job_id: job.id,
        job_number: job.job_number,
        revenue_total: Number(job.revenue_total),
        cost_total: Number(job.cost_total),
        gp_amount: Number(job.gp_amount),
        gp_percent: Number(job.gp_percent),
        revenue_lines: revenueLines,
        cost_lines: costLines,
      };
    });
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(tenantId: string, id: string, dto: UpdateJobDto, actorId?: string): Promise<Job> {
    await this.assertCompanyExists(tenantId, dto.company_id);
    await this.assertBranchExists(tenantId, dto.branch_id);
    await this.assertDepartmentExists(tenantId, dto.department_id);
    await this.assertPortExists(tenantId, dto.origin_port_id, 'Origin port');
    await this.assertPortExists(tenantId, dto.dest_port_id, 'Destination port');

    if (dto.shipper_id) await this.assertPartyExists(tenantId, dto.shipper_id, 'Shipper');
    if (dto.consignee_id) await this.assertPartyExists(tenantId, dto.consignee_id, 'Consignee');
    if (dto.agent_id) await this.assertPartyExists(tenantId, dto.agent_id, 'Agent');

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await this.getOrThrow(tx, tenantId, id);

      if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
        throw new BadRequestException(`Cannot edit a ${existing.status} job.`);
      }

      const { etd, eta, ...rest } = dto;

      return tx.job.update({
        where: { id },
        data: {
          ...rest,
          ...(etd ? { etd: new Date(etd) } : {}),
          ...(eta ? { eta: new Date(eta) } : {}),
          updated_by: actorId,
        },
      });
    });
  }

  async closeJob(tenantId: string, id: string, actorId?: string): Promise<Job> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await this.getOrThrow(tx, tenantId, id);

      if (job.status === 'COMPLETED') {
        throw new ConflictException('Job is already closed.');
      }

      if (job.status === 'CANCELLED') {
        throw new BadRequestException('Cannot close a cancelled job.');
      }

      return tx.job.update({
        where: { id },
        data: { status: 'COMPLETED', updated_by: actorId },
      });
    });
  }

  async cancelJob(tenantId: string, id: string, actorId?: string): Promise<Job> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await this.getOrThrow(tx, tenantId, id);

      if (job.status === 'COMPLETED') {
        throw new BadRequestException('Cannot cancel a completed job.');
      }

      if (job.status === 'CANCELLED') {
        throw new ConflictException('Job is already cancelled.');
      }

      return tx.job.update({
        where: { id },
        data: { status: 'CANCELLED', updated_by: actorId },
      });
    });
  }

  async softDelete(tenantId: string, id: string, actorId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await this.getOrThrow(tx, tenantId, id);

      if (job.status !== 'CANCELLED' && job.status !== 'COMPLETED') {
        throw new BadRequestException('Only COMPLETED or CANCELLED jobs can be deleted.');
      }

      await tx.job.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }

  // ============================================================
  // AIR EXPORT DETAILS
  // ============================================================

  async updateAirDetails(tenantId: string, jobId: string, dto: UpdateAirJobDetailDto, actorId?: string) {
    if (dto.airline_id) {
      const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.airline.findFirst({ where: { id: dto.airline_id, tenant_id: tenantId, deleted_at: null } }),
      );
      if (!exists) throw new NotFoundException('Airline not found.');
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });

      if (!job) {
        throw new NotFoundException('Job not found.');
      }

      if (job.job_type !== 'AIR_EXPORT') {
        throw new BadRequestException('This job is not an Air Export job.');
      }

      const { flight_date, ...rest } = dto;

      return tx.airJobDetail.update({
        where: { job_id: jobId },
        data: { ...rest, ...(flight_date ? { flight_date: new Date(flight_date) } : {}), updated_by: actorId },
      });
    });
  }

  // ============================================================
  // SEA FCL DETAILS
  // ============================================================

  async updateSeaFclDetails(tenantId: string, jobId: string, dto: UpdateSeaFclJobDetailDto, actorId?: string) {
    if (dto.shipping_line_id) {
      const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.shippingLine.findFirst({ where: { id: dto.shipping_line_id, tenant_id: tenantId, deleted_at: null } }),
      );
      if (!exists) throw new NotFoundException('Shipping line not found.');
    }

    if (dto.vessel_id) {
      const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.vessel.findFirst({ where: { id: dto.vessel_id, tenant_id: tenantId, deleted_at: null } }),
      );
      if (!exists) throw new NotFoundException('Vessel not found.');
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });

      if (!job) {
        throw new NotFoundException('Job not found.');
      }

      if (job.job_type !== 'SEA_FCL_EXPORT' && job.job_type !== 'SEA_FCL_IMPORT') {
        throw new BadRequestException('This job is not a Sea FCL job.');
      }

      const detail = await tx.seaFclJobDetail.findFirst({ where: { job_id: jobId, tenant_id: tenantId } });

      if (!detail) {
        throw new NotFoundException('Sea FCL details not found for this job.');
      }

      const { si_cutoff, vgm_cutoff, cy_cutoff, ...rest } = dto;

      return tx.seaFclJobDetail.update({
        where: { job_id: jobId },
        data: {
          ...rest,
          ...(si_cutoff ? { si_cutoff: new Date(si_cutoff) } : {}),
          ...(vgm_cutoff ? { vgm_cutoff: new Date(vgm_cutoff) } : {}),
          ...(cy_cutoff ? { cy_cutoff: new Date(cy_cutoff) } : {}),
          updated_by: actorId,
        },
      });
    });
  }

  async listContainers(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);

      return tx.jobContainer.findMany({
        where: { tenant_id: tenantId, sea_fcl_detail_id: detail.id, deleted_at: null },
        orderBy: { created_at: 'asc' },
      });
    });
  }

  async addContainer(tenantId: string, jobId: string, dto: CreateJobContainerDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);

      await this.assertContainerTypeExists(tx, tenantId, dto.container_type_id);

      return tx.jobContainer.create({
        data: {
          tenant_id: tenantId,
          sea_fcl_detail_id: detail.id,
          container_type_id: dto.container_type_id,
          container_number: dto.container_number,
          seal_number: dto.seal_number,
          tare_weight: dto.tare_weight,
          gross_weight: dto.gross_weight,
          vgm_weight: dto.vgm_weight,
          cbm: dto.cbm,
          is_soc: dto.is_soc ?? false,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  async updateContainer(
    tenantId: string,
    jobId: string,
    containerId: string,
    dto: UpdateJobContainerDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);

      const container = await tx.jobContainer.findFirst({
        where: { id: containerId, sea_fcl_detail_id: detail.id, tenant_id: tenantId, deleted_at: null },
      });

      if (!container) {
        throw new NotFoundException('Container not found.');
      }

      if (dto.container_type_id) {
        await this.assertContainerTypeExists(tx, tenantId, dto.container_type_id);
      }

      return tx.jobContainer.update({
        where: { id: containerId },
        data: { ...dto, updated_by: actorId },
      });
    });
  }

  async removeContainer(tenantId: string, jobId: string, containerId: string, actorId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);

      const container = await tx.jobContainer.findFirst({
        where: { id: containerId, sea_fcl_detail_id: detail.id, tenant_id: tenantId, deleted_at: null },
      });

      if (!container) {
        throw new NotFoundException('Container not found.');
      }

      await tx.jobContainer.update({
        where: { id: containerId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }

  // ============================================================
  // MILESTONES
  // ============================================================

  async completeMilestone(
    tenantId: string,
    jobId: string,
    milestoneId: string,
    dto: UpdateJobMilestoneDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const milestone = await tx.jobMilestone.findFirst({
        where: { id: milestoneId, job_id: jobId, tenant_id: tenantId },
      });

      if (!milestone) {
        throw new NotFoundException('Milestone not found.');
      }

      const { planned_date, actual_date, ...rest } = dto;

      return tx.jobMilestone.update({
        where: { id: milestoneId },
        data: {
          ...rest,
          ...(planned_date ? { planned_date: new Date(planned_date) } : {}),
          ...(actual_date ? { actual_date: new Date(actual_date), completed_by: actorId } : {}),
          updated_by: actorId,
        },
      });
    });
  }

  async addCustomMilestone(tenantId: string, jobId: string, dto: CreateCustomMilestoneDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });

      if (!job) {
        throw new NotFoundException('Job not found.');
      }

      return tx.jobMilestone.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          milestone: dto.milestone,
          planned_date: dto.planned_date ? new Date(dto.planned_date) : undefined,
          actual_date: dto.actual_date ? new Date(dto.actual_date) : undefined,
          notes: dto.notes,
          completed_by: dto.actual_date ? actorId : undefined,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  // ============================================================
  // CHARGES — same GP-recalculation convention as QuotationLine
  // ============================================================

  async addCharge(tenantId: string, jobId: string, dto: CreateJobChargeDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getOrThrow(tx, tenantId, jobId);

      await this.assertChargeCodeExists(tx, tenantId, dto.charge_code_id);
      const taxAmount = await this.computeTax(tx, tenantId, dto);

      const quantity = dto.quantity ?? 1;
      const exchangeRate = dto.exchange_rate ?? 1;
      const amount = quantity * dto.unit_price;
      const amountBase = amount * exchangeRate;

      const charge = await tx.jobCharge.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          charge_code_id: dto.charge_code_id,
          description: dto.description,
          quantity,
          unit_price: dto.unit_price,
          currency_code: dto.currency_code,
          exchange_rate: exchangeRate,
          amount,
          amount_base_currency: amountBase,
          tax_rate_id: dto.tax_rate_id,
          tax_amount: taxAmount,
          is_cost: dto.is_cost ?? false,
          is_billable: dto.is_billable ?? true,
          party_id: dto.party_id,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      await this.recalculateTotals(tx, tenantId, jobId);

      return charge;
    });
  }

  async updateCharge(tenantId: string, jobId: string, chargeId: string, dto: UpdateJobChargeDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getOrThrow(tx, tenantId, jobId);

      const existing = await tx.jobCharge.findFirst({ where: { id: chargeId, job_id: jobId, tenant_id: tenantId } });

      if (!existing) {
        throw new NotFoundException('Charge line not found.');
      }

      if (dto.charge_code_id) {
        await this.assertChargeCodeExists(tx, tenantId, dto.charge_code_id);
      }

      const quantity = dto.quantity ?? Number(existing.quantity);
      const unitPrice = dto.unit_price ?? Number(existing.unit_price);
      const exchangeRate = dto.exchange_rate ?? Number(existing.exchange_rate);
      const amount = quantity * unitPrice;
      const amountBase = amount * exchangeRate;
      const taxAmount =
        dto.tax_rate_id !== undefined
          ? await this.computeTax(tx, tenantId, { ...dto, unit_price: unitPrice, quantity })
          : Number(existing.tax_amount);

      const charge = await tx.jobCharge.update({
        where: { id: chargeId },
        data: {
          ...dto,
          quantity,
          unit_price: unitPrice,
          exchange_rate: exchangeRate,
          amount,
          amount_base_currency: amountBase,
          tax_amount: taxAmount,
          updated_by: actorId,
        },
      });

      await this.recalculateTotals(tx, tenantId, jobId);

      return charge;
    });
  }

  async removeCharge(tenantId: string, jobId: string, chargeId: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getOrThrow(tx, tenantId, jobId);

      const existing = await tx.jobCharge.findFirst({ where: { id: chargeId, job_id: jobId, tenant_id: tenantId } });

      if (!existing) {
        throw new NotFoundException('Charge line not found.');
      }

      await tx.jobCharge.delete({ where: { id: chargeId } });
      await this.recalculateTotals(tx, tenantId, jobId);
    });
  }

  /**
   * Distributes a master job's cost line to its house jobs
   * proportionally by chargeable weight (falls back to gross weight,
   * then equal split if neither is set) — Ch.8.2 "prorate master cost
   * to house jobs".
   */
  async prorateMasterCost(tenantId: string, masterId: string, chargeCodeId: string, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const master = await tx.job.findFirst({ where: { id: masterId, tenant_id: tenantId, deleted_at: null } });

      if (!master) {
        throw new NotFoundException('Master job not found.');
      }

      const masterCharge = await tx.jobCharge.findFirst({
        where: { job_id: masterId, charge_code_id: chargeCodeId, tenant_id: tenantId, is_cost: true },
      });

      if (!masterCharge) {
        throw new NotFoundException('This charge code has no cost line on the master job to prorate.');
      }

      const houseJobs = await tx.job.findMany({
        where: { tenant_id: tenantId, parent_job_id: masterId, deleted_at: null },
      });

      if (houseJobs.length === 0) {
        throw new BadRequestException('This master job has no house jobs to prorate to.');
      }

      const weights = houseJobs.map((h) => Number(h.chargeable_weight ?? h.gross_weight ?? 0));
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      const totalCost = Number(masterCharge.amount_base_currency);

      const shares =
        totalWeight > 0
          ? weights.map((w) => (w / totalWeight) * totalCost)
          : houseJobs.map(() => totalCost / houseJobs.length);

      const created = [];

      for (let i = 0; i < houseJobs.length; i++) {
        const share = shares[i];

        const line = await tx.jobCharge.create({
          data: {
            tenant_id: tenantId,
            job_id: houseJobs[i].id,
            charge_code_id: chargeCodeId,
            description: `${masterCharge.description} (prorated from master)`,
            quantity: 1,
            unit_price: share,
            currency_code: masterCharge.currency_code,
            exchange_rate: 1,
            amount: share,
            amount_base_currency: share,
            is_cost: true,
            is_billable: false,
            created_by: actorId,
            updated_by: actorId,
          },
        });

        await this.recalculateTotals(tx, tenantId, houseJobs[i].id);
        created.push(line);
      }

      return created;
    });
  }

  // ============================================================
  // NOTES
  // ============================================================

  async listNotes(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getOrThrow(tx, tenantId, jobId);

      return tx.jobNote.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
      });
    });
  }

  async addNote(tenantId: string, jobId: string, dto: CreateJobNoteDto, actorId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getOrThrow(tx, tenantId, jobId);

      return tx.jobNote.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          note: dto.note,
          is_private: dto.is_private ?? false,
          is_pinned: dto.is_pinned ?? false,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  async updateNote(tenantId: string, jobId: string, noteId: string, dto: UpdateJobNoteDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getOrThrow(tx, tenantId, jobId);

      const note = await tx.jobNote.findFirst({
        where: { id: noteId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      if (!note) {
        throw new NotFoundException('Note not found.');
      }

      return tx.jobNote.update({
        where: { id: noteId },
        data: { ...dto, updated_by: actorId },
      });
    });
  }

  async removeNote(tenantId: string, jobId: string, noteId: string, actorId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getOrThrow(tx, tenantId, jobId);

      const note = await tx.jobNote.findFirst({
        where: { id: noteId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      if (!note) {
        throw new NotFoundException('Note not found.');
      }

      await tx.jobNote.update({
        where: { id: noteId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }

  // ============================================================
  // DOCUMENTS
  // ============================================================

  async listDocuments(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getOrThrow(tx, tenantId, jobId);

      return tx.jobDocument.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { created_at: 'desc' },
      });
    });
  }

  async addDocument(tenantId: string, jobId: string, dto: CreateJobDocumentDto, actorId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getOrThrow(tx, tenantId, jobId);

      return tx.jobDocument.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          document_type: dto.document_type,
          file_name: dto.file_name,
          file_url: dto.file_url,
          reference_number: dto.reference_number,
          s3_key: dto.s3_key,
          file_size: dto.file_size,
          mime_type: dto.mime_type,
          uploaded_by: actorId,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  async updateDocument(
    tenantId: string,
    jobId: string,
    documentId: string,
    dto: UpdateJobDocumentDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getOrThrow(tx, tenantId, jobId);

      const document = await tx.jobDocument.findFirst({
        where: { id: documentId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      if (!document) {
        throw new NotFoundException('Document not found.');
      }

      if (document.is_finalized) {
        throw new BadRequestException('Finalized documents cannot be edited.');
      }

      return tx.jobDocument.update({
        where: { id: documentId },
        data: { ...dto, updated_by: actorId },
      });
    });
  }

  async finalizeDocument(
    tenantId: string,
    jobId: string,
    documentId: string,
    dto: FinalizeJobDocumentDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getOrThrow(tx, tenantId, jobId);

      const document = await tx.jobDocument.findFirst({
        where: { id: documentId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      if (!document) {
        throw new NotFoundException('Document not found.');
      }

      if (document.is_finalized) {
        throw new ConflictException('Document is already finalized.');
      }

      const finalize = dto.is_finalized ?? true;

      return tx.jobDocument.update({
        where: { id: documentId },
        data: {
          is_finalized: finalize,
          finalized_at: finalize ? new Date() : null,
          finalized_by: finalize ? actorId : null,
          updated_by: actorId,
        },
      });
    });
  }

  async removeDocument(tenantId: string, jobId: string, documentId: string, actorId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getOrThrow(tx, tenantId, jobId);

      const document = await tx.jobDocument.findFirst({
        where: { id: documentId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      if (!document) {
        throw new NotFoundException('Document not found.');
      }

      if (document.is_finalized) {
        throw new BadRequestException('Finalized documents cannot be deleted.');
      }

      await tx.jobDocument.update({
        where: { id: documentId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }

  // ============================================================
  // PRE-ALERT (Ch.8)
  // ============================================================

  async sendPreAlert(tenantId: string, jobId: string, dto: SendPreAlertDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await this.getOrThrow(tx, tenantId, jobId);

      if (job.job_type !== 'AIR_EXPORT') {
        throw new BadRequestException('Pre-alert is only supported for Air Export jobs.');
      }

      const milestone = await tx.jobMilestone.findFirst({
        where: { tenant_id: tenantId, job_id: jobId, milestone: 'PRE_ALERT_SENT', deleted_at: null },
      });

      if (!milestone) {
        throw new NotFoundException('PRE_ALERT_SENT milestone not found on this job.');
      }

      if (!milestone.actual_date) {
        await tx.jobMilestone.update({
          where: { id: milestone.id },
          data: {
            actual_date: new Date(),
            completed_by: actorId,
            notes: dto.message ?? milestone.notes,
            updated_by: actorId,
          },
        });
      }

      return {
        success: true,
        message: 'Pre-alert recorded. Email dispatch will be wired when the notification service is available.',
        job_id: jobId,
        to_email: dto.to_email,
        milestone: 'PRE_ALERT_SENT',
      };
    });
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private async getOrThrow(tx: Prisma.TransactionClient, tenantId: string, id: string): Promise<Job> {
    const job = await tx.job.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } });

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    return job;
  }

  private async getSeaFclDetailOrThrow(tx: Prisma.TransactionClient, tenantId: string, jobId: string) {
    const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    if (job.job_type !== 'SEA_FCL_EXPORT' && job.job_type !== 'SEA_FCL_IMPORT') {
      throw new BadRequestException('This job is not a Sea FCL job.');
    }

    const detail = await tx.seaFclJobDetail.findFirst({ where: { job_id: jobId, tenant_id: tenantId, deleted_at: null } });

    if (!detail) {
      throw new NotFoundException('Sea FCL details not found for this job.');
    }

    return detail;
  }

  private async assertContainerTypeExists(
    tx: Prisma.TransactionClient,
    tenantId: string,
    containerTypeId: string,
  ): Promise<void> {
    const exists = await tx.containerType.findFirst({
      where: { id: containerTypeId, tenant_id: tenantId, deleted_at: null },
    });

    if (!exists) {
      throw new NotFoundException('Container type not found.');
    }
  }

  private async recalculateTotals(tx: Prisma.TransactionClient, tenantId: string, jobId: string): Promise<void> {
    const charges = await tx.jobCharge.findMany({ where: { tenant_id: tenantId, job_id: jobId } });

    let revenue = 0;
    let cost = 0;

    for (const charge of charges) {
      const amount = Number(charge.amount_base_currency);
      if (charge.is_cost) cost += amount;
      else revenue += amount;
    }

    const gp = revenue - cost;
    const gpPercent = revenue > 0 ? (gp / revenue) * 100 : 0;

    await tx.job.update({
      where: { id: jobId },
      data: { revenue_total: revenue, cost_total: cost, gp_amount: gp, gp_percent: gpPercent },
    });
  }

  private async computeTax(
    tx: Prisma.TransactionClient,
    tenantId: string,
    dto: { tax_rate_id?: string; unit_price: number; quantity?: number },
  ): Promise<number> {
    if (!dto.tax_rate_id) {
      return 0;
    }

    const taxRate = await tx.taxRate.findFirst({ where: { id: dto.tax_rate_id, tenant_id: tenantId } });

    if (!taxRate) {
      throw new NotFoundException('Tax rate not found.');
    }

    return (dto.quantity ?? 1) * dto.unit_price * (Number(taxRate.rate) / 100);
  }

  private async resolveBranchCode(tenantId: string, branchId?: string): Promise<string | undefined> {
    if (!branchId) return undefined;

    const branch = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.branch.findFirst({ where: { id: branchId, tenant_id: tenantId } }),
    );

    return branch?.code;
  }

  private async assertChargeCodeExists(
    tx: Prisma.TransactionClient,
    tenantId: string,
    chargeCodeId: string,
  ): Promise<void> {
    const exists = await tx.chargeCode.findFirst({ where: { id: chargeCodeId, tenant_id: tenantId, deleted_at: null } });

    if (!exists) {
      throw new NotFoundException('Charge code not found.');
    }
  }

  private async assertPartyExists(tenantId: string, partyId: string | undefined, label: string): Promise<void> {
    if (!partyId) return;

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({ where: { id: partyId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException(`${label} not found.`);
    }
  }

  private async assertCompanyExists(tenantId: string, companyId?: string): Promise<void> {
    if (!companyId) return;

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.company.findFirst({ where: { id: companyId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException('Company not found.');
    }
  }

  private async assertBranchExists(tenantId: string, branchId?: string): Promise<void> {
    if (!branchId) return;

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.branch.findFirst({ where: { id: branchId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException('Branch not found.');
    }
  }

  private async assertDepartmentExists(tenantId: string, departmentId?: string): Promise<void> {
    if (!departmentId) return;

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.department.findFirst({ where: { id: departmentId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException('Department not found.');
    }
  }

  private async assertPortExists(tenantId: string, portId: string | undefined, label: string): Promise<void> {
    if (!portId) return;

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.port.findFirst({ where: { id: portId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException(`${label} not found.`);
    }
  }
}
