import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ContainerStatus, CustomsClearanceStatus, DocumentType, Job, JobType, Prisma, StorageRateBasis, StuffingLocationType, VgmMethod } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberGeneratorService } from '../organization/number-formats/number-generator.service';
import { DocumentGenerationService } from '../../shared/queue/document-generation.service';
import { EmailService } from '../../shared/email/email.service';
import { WhatsAppService } from '../../shared/whatsapp/whatsapp.service';
import { NotificationEmitterService } from '../notifications/notification-emitter.service';
import { assertDocumentAllowedForJobType } from './constants/job-document-allowlist';
import { AIR_IMPORT_MAWB_RECEIVED_MILESTONE } from './constants/air-import-milestones';
import { SEA_LCL_IMPORT_MBL_RECEIVED_MILESTONE } from './constants/sea-lcl-import-milestones';
import { seedJobTypeExtras } from './utils/job-type-seed.util';
import { mintTrackingToken } from './utils/tracking-token.util';
import { markJobMilestoneIfPresent } from './utils/mark-milestone.util';

import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { UpdateAirJobDetailDto } from './dto/air-job-detail.dto';
import { SubmitSiDto, SubmitVgmDto, UpdateSeaFclJobDetailDto } from './dto/sea-fcl-job-detail.dto';
import { SubmitLclSiDto, UpdateSeaLclJobDetailDto } from './dto/sea-lcl-job-detail.dto';
import { CreateJobChargeDto, UpdateJobChargeDto } from './dto/job-charge.dto';
import { UpdateJobMilestoneDto, CreateCustomMilestoneDto } from './dto/job-milestone.dto';
import { CreateJobNoteDto, UpdateJobNoteDto } from './dto/job-note.dto';
import { CreateJobDocumentDto, UpdateJobDocumentDto, FinalizeJobDocumentDto } from './dto/job-document.dto';
import { CreateJobContainerDto, UpdateJobContainerDto } from './dto/job-container.dto';
import {
  AssignCargoToContainerDto,
  CreateJobCargoDto,
  SplitContainerDto,
  UpdateJobCargoDto,
} from './dto/job-cargo.dto';
import { CreateBillOfLadingDto, UpdateBillOfLadingDto } from './dto/bill-of-lading.dto';
import { CreateStuffingRecordDto, UpdateStuffingRecordDto } from './dto/stuffing-record.dto';
import { SendPreAlertDto } from './dto/pre-alert.dto';
import { GenerateJobDocumentDto } from './dto/generate-job-document.dto';
import { JobQueryDto } from './dto/job-query.dto';
import {
  CreatePaymentRequestFromJobDto,
  CreateSubJobDto,
  SchedulePreAlertDto,
  SendWhatsAppStatusDto,
} from './dto/week4-6-ops.dto';

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
    private readonly documentGeneration: DocumentGenerationService,
    private readonly emailService: EmailService,
    private readonly whatsApp: WhatsAppService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  // ============================================================
  // CREATE
  // ============================================================

  async create(tenantId: string, dto: CreateJobDto, actorId?: string): Promise<Job> {
    const branchCode = dto.branch_id
      ? (
          await this.prisma.runWithTenant(tenantId, (tx) =>
            tx.branch.findFirst({
              where: { id: dto.branch_id, tenant_id: tenantId, deleted_at: null },
            }),
          )
        )?.code
      : undefined;

    const jobNumber = await this.numberGenerator.generate(tenantId, 'JOB_NUMBER', {
      extraSegment: JOB_TYPE_CODE[dto.job_type],
      branchCode,
    });

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertPartyExistsTx(tx, tenantId, dto.shipper_id, 'Shipper');
      await this.assertPartyExistsTx(tx, tenantId, dto.consignee_id, 'Consignee');
      await this.assertPartyExistsTx(tx, tenantId, dto.billing_party_id, 'Billing party');
      await this.assertPartyExistsTx(tx, tenantId, dto.agent_id, 'Agent');
      await this.assertCompanyExistsTx(tx, tenantId, dto.company_id);
      await this.assertBranchExistsTx(tx, tenantId, dto.branch_id);
      await this.assertDepartmentExistsTx(tx, tenantId, dto.department_id);
      await this.assertPortExistsTx(tx, tenantId, dto.origin_port_id, 'Origin port');
      await this.assertPortExistsTx(tx, tenantId, dto.dest_port_id, 'Destination port');

      let parentJob: Job | null = null;

      if (dto.parent_job_id) {
        parentJob = await tx.job.findFirst({
          where: { id: dto.parent_job_id, tenant_id: tenantId, deleted_at: null },
        });

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

      const job = await tx.job.create({
        data: {
          tenant_id: tenantId,
          company_id: dto.company_id,
          job_number: jobNumber,
          tracking_token: mintTrackingToken(),
          job_type: dto.job_type,
          status: 'BOOKING_CONFIRMED',
          branch_id: dto.branch_id,
          department_id: dto.department_id,
          parent_job_id: dto.parent_job_id,
          shipper_id: dto.shipper_id,
          consignee_id: dto.consignee_id,
          billing_party_id: dto.billing_party_id,
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

      await seedJobTypeExtras(tx, tenantId, job.id, dto.job_type, actorId);

      return job;
    });
  }

  async findAll(tenantId: string, query: JobQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobWhereInput = { tenant_id: tenantId, deleted_at: null };

      if (query.status) where.status = query.status;
      if (query.job_type) where.job_type = query.job_type;
      if (query.shipper_id) where.shipper_id = query.shipper_id;
      if (query.salesperson_id) where.salesperson_id = query.salesperson_id;
      if (query.branch_id) where.branch_id = query.branch_id;
      if (query.company_id) where.company_id = query.company_id;
      if (query.department_id) where.department_id = query.department_id;
      if (query.created_by) where.created_by = query.created_by;
      if (query.consignee_id) where.consignee_id = query.consignee_id;
      if (query.origin_port_id) where.origin_port_id = query.origin_port_id;
      if (query.dest_port_id) where.dest_port_id = query.dest_port_id;
      if (query.parent_job_id) where.parent_job_id = query.parent_job_id;
      if (query.masters_only) where.parent_job_id = null;

      const andFilters: Prisma.JobWhereInput[] = [];

      if (query.from_date || query.to_date) {
        const range = {
          ...(query.from_date ? { gte: new Date(query.from_date) } : {}),
          ...(query.to_date ? { lte: new Date(query.to_date) } : {}),
        };
        if (query.date_field === 'etd') {
          where.etd = range;
        } else if (query.date_field === 'eta') {
          where.eta = range;
        } else if (query.date_field === 'atd') {
          andFilters.push({
            OR: [
              { sea_fcl_details: { sailed_at: range, deleted_at: null } },
              { sea_lcl_details: { sailed_at: range, deleted_at: null } },
            ],
          });
        } else if (query.date_field === 'ata') {
          andFilters.push({
            air_details: {
              deleted_at: null,
              actual_eta: range,
            },
          });
        } else {
          where.created_at = range;
        }
      }

      if (query.customs_entry_number) {
        andFilters.push({
          OR: [
            {
              air_details: {
                deleted_at: null,
                customs_entry_number: { contains: query.customs_entry_number, mode: 'insensitive' },
              },
            },
            {
              sea_fcl_details: {
                deleted_at: null,
                customs_entry_number: { contains: query.customs_entry_number, mode: 'insensitive' },
              },
            },
            {
              sea_lcl_details: {
                deleted_at: null,
                customs_entry_number: { contains: query.customs_entry_number, mode: 'insensitive' },
              },
            },
          ],
        });
      } else if (query.has_customs_entry) {
        andFilters.push({
          OR: [
            { air_details: { deleted_at: null, customs_entry_number: { not: null } } },
            { sea_fcl_details: { deleted_at: null, customs_entry_number: { not: null } } },
            { sea_lcl_details: { deleted_at: null, customs_entry_number: { not: null } } },
          ],
        });
      }

      if (query.search) {
        andFilters.push({
          OR: [
            { job_number: { contains: query.search, mode: 'insensitive' } },
            { commodity: { contains: query.search, mode: 'insensitive' } },
            { land_details: { vehicle_number: { contains: query.search, mode: 'insensitive' } } },
            { courier_details: { tracking_number: { contains: query.search, mode: 'insensitive' } } },
            { courier_details: { barcode_value: { contains: query.search, mode: 'insensitive' } } },
            { nvocc_details: { hbl_number: { contains: query.search, mode: 'insensitive' } } },
          ],
        });
      }

      if (
        query.container_number ||
        query.vessel_id ||
        query.shipping_line_id ||
        query.voyage_number ||
        query.container_type_id
      ) {
        const seaDetailFilter = {
          deleted_at: null,
          ...(query.vessel_id ? { vessel_id: query.vessel_id } : {}),
          ...(query.shipping_line_id ? { shipping_line_id: query.shipping_line_id } : {}),
          ...(query.voyage_number
            ? { voyage_number: { contains: query.voyage_number, mode: 'insensitive' as const } }
            : {}),
        };

        andFilters.push({
          OR: [
            {
              sea_fcl_details: {
                ...seaDetailFilter,
                ...((query.container_number || query.container_type_id)
                  ? {
                      containers: {
                        some: {
                          deleted_at: null,
                          ...(query.container_number
                            ? { container_number: { contains: query.container_number, mode: 'insensitive' as const } }
                            : {}),
                          ...(query.container_type_id ? { container_type_id: query.container_type_id } : {}),
                        },
                      },
                    }
                  : {}),
              },
            },
            ...(query.container_number || query.container_type_id ? [] : [{ sea_lcl_details: seaDetailFilter }]),
          ],
        });
      }

      if (query.vehicle_number || query.trucker_id) {
        andFilters.push({
          land_details: {
            deleted_at: null,
            ...(query.vehicle_number
              ? { vehicle_number: { contains: query.vehicle_number, mode: 'insensitive' as const } }
              : {}),
            ...(query.trucker_id ? { trucker_id: query.trucker_id } : {}),
          },
        });
      }

      if (query.tracking_number) {
        andFilters.push({
          courier_details: {
            deleted_at: null,
            tracking_number: { contains: query.tracking_number, mode: 'insensitive' },
          },
        });
      }

      if (andFilters.length) {
        where.AND = andFilters;
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
          sea_fcl_details: {
            include: {
              containers: {
                where: { deleted_at: null },
                include: { cargo_lines: { where: { deleted_at: null } } },
              },
            },
          },
          sea_lcl_details: true,
          land_details: true,
          courier_details: true,
          nvocc_details: {
            include: {
              voyage: true,
              booking: true,
            },
          },
          transport_requests: { where: { deleted_at: null }, orderBy: { created_at: 'desc' } },
          charges: { where: { deleted_at: null }, orderBy: { created_at: 'asc' } },
          milestones: { where: { deleted_at: null }, orderBy: { created_at: 'asc' } },
          notes_list: { where: { deleted_at: null }, orderBy: { created_at: 'desc' } },
          documents: { where: { deleted_at: null }, orderBy: { created_at: 'desc' } },
          bills_of_lading: { where: { deleted_at: null }, orderBy: { created_at: 'desc' } },
          cargo_lines: { where: { deleted_at: null }, orderBy: { created_at: 'asc' } },
          stuffing_records: { where: { deleted_at: null }, orderBy: { stuffing_date: 'desc' } },
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

      const confirmed = charges.filter((c) => !c.is_provisional);
      const provisional = charges.filter((c) => c.is_provisional);
      const revenueLines = confirmed.filter((c) => !c.is_cost);
      const costLines = confirmed.filter((c) => c.is_cost);
      const provisionalRevenue = provisional.filter((c) => !c.is_cost);
      const provisionalCost = provisional.filter((c) => c.is_cost);
      const provRev = provisionalRevenue.reduce((s, c) => s + Number(c.amount_base_currency), 0);
      const provCost = provisionalCost.reduce((s, c) => s + Number(c.amount_base_currency), 0);

      return {
        job_id: job.id,
        job_number: job.job_number,
        revenue_total: Number(job.revenue_total),
        cost_total: Number(job.cost_total),
        gp_amount: Number(job.gp_amount),
        gp_percent: Number(job.gp_percent),
        revenue_lines: revenueLines,
        cost_lines: costLines,
        provisional: {
          revenue_total: provRev,
          cost_total: provCost,
          gp_amount: provRev - provCost,
          revenue_lines: provisionalRevenue,
          cost_lines: provisionalCost,
        },
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
    if (dto.billing_party_id) await this.assertPartyExists(tenantId, dto.billing_party_id, 'Billing party');
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

      const updated = await tx.job.update({
        where: { id },
        data: { status: 'COMPLETED', updated_by: actorId },
      });

      if (job.job_type === 'NVOCC_EXPORT' || job.job_type === 'NVOCC_IMPORT') {
        await markJobMilestoneIfPresent(tx, tenantId, id, 'JOB_CLOSED', new Date(), actorId);
      }

      return updated;
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

    for (const partyId of [dto.agent_at_origin_id, dto.notify_party_id, dto.customs_broker_id]) {
      if (partyId) await this.assertPartyExists(tenantId, partyId, 'Party');
    }

    if (dto.origin_airport_id) {
      const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.airport.findFirst({ where: { id: dto.origin_airport_id, tenant_id: tenantId, deleted_at: null } }),
      );
      if (!exists) throw new NotFoundException('Origin airport not found.');
    }

    if (dto.dest_airport_id) {
      const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.airport.findFirst({ where: { id: dto.dest_airport_id, tenant_id: tenantId, deleted_at: null } }),
      );
      if (!exists) throw new NotFoundException('Destination airport not found.');
    }

    if (dto.originating_branch_id) {
      const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.branch.findFirst({ where: { id: dto.originating_branch_id, tenant_id: tenantId, deleted_at: null } }),
      );
      if (!exists) throw new NotFoundException('Originating branch not found.');
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });

      if (!job) {
        throw new NotFoundException('Job not found.');
      }

      if (job.job_type !== 'AIR_EXPORT' && job.job_type !== 'AIR_IMPORT') {
        throw new BadRequestException('This job is not an Air Export or Air Import job.');
      }

      const detail = await tx.airJobDetail.findFirst({ where: { job_id: jobId, tenant_id: tenantId } });
      if (!detail) {
        throw new NotFoundException('Air job details not found.');
      }

      const {
        flight_date,
        actual_eta,
        customs_clearance_date,
        storage_start_date,
        mawb_number_from_origin,
        ...rest
      } = dto;

      const updated = await tx.airJobDetail.update({
        where: { job_id: jobId },
        data: {
          ...rest,
          ...(flight_date ? { flight_date: new Date(flight_date) } : {}),
          ...(actual_eta ? { actual_eta: new Date(actual_eta) } : {}),
          ...(customs_clearance_date ? { customs_clearance_date: new Date(customs_clearance_date) } : {}),
          ...(storage_start_date ? { storage_start_date: new Date(storage_start_date) } : {}),
          updated_by: actorId,
        },
      });

      if (
        job.job_type === 'AIR_IMPORT' &&
        mawb_number_from_origin?.trim() &&
        !detail.mawb_number_from_origin?.trim()
      ) {
        await this.markMilestoneIfPresent(
          tx,
          tenantId,
          jobId,
          AIR_IMPORT_MAWB_RECEIVED_MILESTONE,
          new Date(),
          actorId,
        );
      }

      return updated;
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

      const {
        si_cutoff,
        vgm_cutoff,
        cy_cutoff,
        etd,
        eta,
        stuffing_date,
        si_submitted_at,
        vgm_submitted_at,
        stuffing_location,
        vgm_method,
        sailed_at,
        actual_eta,
        customs_clearance_date,
        cfs_storage_start_date,
        customs_status,
        ...rest
      } = dto;

      return tx.seaFclJobDetail.update({
        where: { job_id: jobId },
        data: {
          ...rest,
          ...(stuffing_location !== undefined
            ? { stuffing_location: stuffing_location as StuffingLocationType }
            : {}),
          ...(vgm_method !== undefined ? { vgm_method: vgm_method as VgmMethod } : {}),
          ...(customs_status !== undefined
            ? { customs_status: customs_status as import('@prisma/client').CustomsClearanceStatus }
            : {}),
          ...(si_cutoff ? { si_cutoff: new Date(si_cutoff) } : {}),
          ...(vgm_cutoff ? { vgm_cutoff: new Date(vgm_cutoff) } : {}),
          ...(cy_cutoff ? { cy_cutoff: new Date(cy_cutoff) } : {}),
          ...(etd ? { etd: new Date(etd) } : {}),
          ...(eta ? { eta: new Date(eta) } : {}),
          ...(stuffing_date ? { stuffing_date: new Date(stuffing_date) } : {}),
          ...(si_submitted_at ? { si_submitted_at: new Date(si_submitted_at) } : {}),
          ...(vgm_submitted_at ? { vgm_submitted_at: new Date(vgm_submitted_at) } : {}),
          ...(sailed_at ? { sailed_at: new Date(sailed_at) } : {}),
          ...(actual_eta ? { actual_eta: new Date(actual_eta) } : {}),
          ...(customs_clearance_date ? { customs_clearance_date: new Date(customs_clearance_date) } : {}),
          ...(cfs_storage_start_date ? { cfs_storage_start_date: new Date(cfs_storage_start_date) } : {}),
          updated_by: actorId,
        },
      });
    });
  }

  async getCutoffStatus(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);
      const now = Date.now();

      const trafficLight = (cutoff: Date | null) => {
        if (!cutoff) return { cutoff: null, hours_remaining: null, status: 'NONE' as const };
        const hours = (cutoff.getTime() - now) / (1000 * 60 * 60);
        let status: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
        if (hours <= 0) status = 'RED';
        else if (hours <= 24) status = 'AMBER';
        return { cutoff: cutoff.toISOString(), hours_remaining: Math.round(hours * 10) / 10, status };
      };

      return {
        job_id: jobId,
        si: trafficLight(detail.si_cutoff),
        vgm: trafficLight(detail.vgm_cutoff),
        cy: trafficLight(detail.cy_cutoff),
        si_submitted_at: detail.si_submitted_at,
        si_version: detail.si_version,
        vgm_submitted_at: detail.vgm_submitted_at,
        vgm_method: detail.vgm_method,
      };
    });
  }

  async submitSi(tenantId: string, jobId: string, dto: SubmitSiDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);
      const submittedAt = dto.si_submitted_at ? new Date(dto.si_submitted_at) : new Date();

      const detail = await tx.seaFclJobDetail.update({
        where: { job_id: jobId },
        data: {
          si_submitted_at: submittedAt,
          si_version: dto.si_version ?? 1,
          updated_by: actorId,
        },
      });

      await this.markMilestoneIfPresent(tx, tenantId, jobId, 'SI_SUBMITTED', submittedAt, actorId);
      return detail;
    });
  }

  async submitVgm(tenantId: string, jobId: string, dto: SubmitVgmDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);
      const submittedAt = dto.vgm_submitted_at ? new Date(dto.vgm_submitted_at) : new Date();

      const detail = await tx.seaFclJobDetail.update({
        where: { job_id: jobId },
        data: {
          vgm_submitted_at: submittedAt,
          vgm_method: (dto.vgm_method as VgmMethod) ?? VgmMethod.SM1,
          updated_by: actorId,
        },
      });

      await this.markMilestoneIfPresent(tx, tenantId, jobId, 'VGM_SUBMITTED', submittedAt, actorId);
      return detail;
    });
  }

  // ============================================================
  // SEA LCL DETAILS (Week 18 — Ch.12–13)
  // ============================================================

  async updateSeaLclDetails(tenantId: string, jobId: string, dto: UpdateSeaLclJobDetailDto, actorId?: string) {
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

    if (dto.cfs_warehouse_id) {
      const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.warehouse.findFirst({ where: { id: dto.cfs_warehouse_id, tenant_id: tenantId, deleted_at: null } }),
      );
      if (!exists) throw new NotFoundException('CFS warehouse not found.');
    }

    if (dto.customs_broker_id) {
      await this.assertPartyExists(tenantId, dto.customs_broker_id, 'Customs broker');
    }

    if (dto.wms_storage_charge_id) {
      const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.wmsStorageCharge.findFirst({
          where: { id: dto.wms_storage_charge_id, tenant_id: tenantId, deleted_at: null },
        }),
      );
      if (!exists) throw new NotFoundException('WMS storage charge not found.');
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });

      if (!job) {
        throw new NotFoundException('Job not found.');
      }

      if (job.job_type !== 'SEA_LCL_EXPORT' && job.job_type !== 'SEA_LCL_IMPORT') {
        throw new BadRequestException('This job is not a Sea LCL job.');
      }

      const detail = await tx.seaLclJobDetail.findFirst({ where: { job_id: jobId, tenant_id: tenantId } });

      if (!detail) {
        throw new NotFoundException('Sea LCL details not found for this job.');
      }

      const {
        si_cutoff,
        etd,
        eta,
        si_submitted_at,
        sailed_at,
        actual_eta,
        customs_clearance_date,
        cfs_storage_start_date,
        customs_status,
        storage_rate_basis,
        ...rest
      } = dto;

      const updated = await tx.seaLclJobDetail.update({
        where: { job_id: jobId },
        data: {
          ...rest,
          ...(customs_status !== undefined ? { customs_status: customs_status as CustomsClearanceStatus } : {}),
          ...(storage_rate_basis !== undefined ? { storage_rate_basis: storage_rate_basis as StorageRateBasis } : {}),
          ...(si_cutoff ? { si_cutoff: new Date(si_cutoff) } : {}),
          ...(etd ? { etd: new Date(etd) } : {}),
          ...(eta ? { eta: new Date(eta) } : {}),
          ...(si_submitted_at ? { si_submitted_at: new Date(si_submitted_at) } : {}),
          ...(sailed_at ? { sailed_at: new Date(sailed_at) } : {}),
          ...(actual_eta ? { actual_eta: new Date(actual_eta) } : {}),
          ...(customs_clearance_date ? { customs_clearance_date: new Date(customs_clearance_date) } : {}),
          ...(cfs_storage_start_date ? { cfs_storage_start_date: new Date(cfs_storage_start_date) } : {}),
          updated_by: actorId,
        },
      });

      if (
        job.job_type === 'SEA_LCL_IMPORT' &&
        dto.mbl_number_from_line?.trim() &&
        !detail.mbl_number_from_line?.trim()
      ) {
        await this.markMilestoneIfPresent(
          tx,
          tenantId,
          jobId,
          SEA_LCL_IMPORT_MBL_RECEIVED_MILESTONE,
          new Date(),
          actorId,
        );
      }

      if (sailed_at && job.job_type === 'SEA_LCL_EXPORT') {
        await this.markMilestoneIfPresent(tx, tenantId, jobId, 'VESSEL_SAILED', new Date(sailed_at), actorId);
      }

      return updated;
    });
  }

  async submitLclSi(tenantId: string, jobId: string, dto: SubmitLclSiDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getSeaLclDetailOrThrow(tx, tenantId, jobId);
      const submittedAt = dto.si_submitted_at ? new Date(dto.si_submitted_at) : new Date();

      const detail = await tx.seaLclJobDetail.update({
        where: { job_id: jobId },
        data: {
          si_submitted_at: submittedAt,
          si_version: dto.si_version ?? 1,
          updated_by: actorId,
        },
      });

      await this.markMilestoneIfPresent(tx, tenantId, jobId, 'SI_SUBMITTED', submittedAt, actorId);
      return detail;
    });
  }

  async listContainers(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);

      return tx.jobContainer.findMany({
        where: { tenant_id: tenantId, sea_fcl_detail_id: detail.id, deleted_at: null },
        include: { cargo_lines: { where: { deleted_at: null } } },
        orderBy: { created_at: 'asc' },
      });
    });
  }

  async getContainerFill(tenantId: string, jobId: string, containerId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);
      const containers = await tx.jobContainer.findMany({
        where: {
          tenant_id: tenantId,
          sea_fcl_detail_id: detail.id,
          deleted_at: null,
          ...(containerId ? { id: containerId } : {}),
        },
        include: { cargo_lines: { where: { deleted_at: null } } },
        orderBy: { created_at: 'asc' },
      });

      if (containerId && containers.length === 0) {
        throw new NotFoundException('Container not found.');
      }

      const fills = await Promise.all(
        containers.map(async (container) => {
          const type = await tx.containerType.findFirst({
            where: { id: container.container_type_id, tenant_id: tenantId, deleted_at: null },
          });

          const cargoWeight = container.cargo_lines.reduce(
            (sum, line) => sum + Number(line.gross_weight ?? 0),
            0,
          );
          const cargoCbm = container.cargo_lines.reduce(
            (sum, line) => sum + Number(line.measurement ?? 0),
            0,
          );

          const maxPayload = Number(container.max_payload ?? type?.max_payload ?? 0);
          const cubicCapacity = Number(container.cubic_capacity ?? type?.volume_cbm ?? 0);
          const assignedWeight = cargoWeight || Number(container.gross_weight ?? 0);
          const assignedCbm = cargoCbm || Number(container.cbm ?? 0);

          return {
            container_id: container.id,
            container_number: container.container_number,
            status: container.status,
            assigned_weight: assignedWeight,
            max_payload: maxPayload || null,
            weight_percent: maxPayload > 0 ? Math.round((assignedWeight / maxPayload) * 1000) / 10 : null,
            assigned_cbm: assignedCbm,
            cubic_capacity: cubicCapacity || null,
            cbm_percent: cubicCapacity > 0 ? Math.round((assignedCbm / cubicCapacity) * 1000) / 10 : null,
            cargo_line_count: container.cargo_lines.length,
          };
        }),
      );

      return containerId ? fills[0] : fills;
    });
  }

  async addContainer(tenantId: string, jobId: string, dto: CreateJobContainerDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);
      const type = await this.assertContainerTypeExists(tx, tenantId, dto.container_type_id);

      const { gate_in_at, status, max_payload, cubic_capacity, ...rest } = dto;

      return tx.jobContainer.create({
        data: {
          tenant_id: tenantId,
          sea_fcl_detail_id: detail.id,
          container_type_id: rest.container_type_id,
          container_number: rest.container_number,
          seal_number: rest.seal_number,
          tare_weight: rest.tare_weight,
          gross_weight: rest.gross_weight,
          vgm_weight: rest.vgm_weight,
          cbm: rest.cbm,
          is_soc: rest.is_soc ?? false,
          max_payload: max_payload ?? (type.max_payload != null ? Number(type.max_payload) : undefined),
          cubic_capacity: cubic_capacity ?? (type.volume_cbm != null ? Number(type.volume_cbm) : undefined),
          status: (status as ContainerStatus) ?? ContainerStatus.EMPTY,
          gate_in_at: gate_in_at ? new Date(gate_in_at) : undefined,
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

      const { gate_in_at, status, ...rest } = dto;
      const nextGateIn = gate_in_at ? new Date(gate_in_at) : undefined;
      const nextStatus = status as ContainerStatus | undefined;

      const updated = await tx.jobContainer.update({
        where: { id: containerId },
        data: {
          ...rest,
          ...(nextStatus ? { status: nextStatus } : {}),
          ...(nextGateIn ? { gate_in_at: nextGateIn } : {}),
          updated_by: actorId,
        },
      });

      if (nextStatus === ContainerStatus.GATED_IN || nextGateIn) {
        await this.markMilestoneIfPresent(
          tx,
          tenantId,
          jobId,
          'CONTAINER_GATED_IN',
          nextGateIn ?? new Date(),
          actorId,
        );
      }

      if (nextStatus === ContainerStatus.STUFFED) {
        await this.markMilestoneIfPresent(tx, tenantId, jobId, 'STUFFING_COMPLETED', new Date(), actorId);
      }

      return updated;
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
  // CARGO
  // ============================================================

  async listCargo(tenantId: string, jobId: string) {
    await this.assertSeaCargoJobInTenant(tenantId, jobId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobCargo.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { created_at: 'asc' },
      }),
    );
  }

  async addCargo(tenantId: string, jobId: string, dto: CreateJobCargoDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await this.assertSeaCargoJob(tx, tenantId, jobId);

      if (this.isSeaLclJobType(job.job_type)) {
        if (dto.container_id) {
          throw new BadRequestException('LCL cargo lines cannot be assigned to containers.');
        }
      } else if (dto.container_id) {
        const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);
        await this.assertContainerOnDetail(tx, tenantId, detail.id, dto.container_id);
      }

      return tx.jobCargo.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          container_id: dto.container_id,
          consignee_id: dto.consignee_id,
          commodity: dto.commodity,
          hs_code: dto.hs_code,
          description: dto.description,
          marks_numbers: dto.marks_numbers,
          packages: dto.packages,
          gross_weight: dto.gross_weight,
          measurement: dto.measurement,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  async updateCargo(
    tenantId: string,
    jobId: string,
    cargoId: string,
    dto: UpdateJobCargoDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await this.assertSeaCargoJob(tx, tenantId, jobId);
      const cargo = await tx.jobCargo.findFirst({
        where: { id: cargoId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      if (!cargo) {
        throw new NotFoundException('Cargo line not found.');
      }

      if (dto.container_id) {
        if (this.isSeaLclJobType(job.job_type)) {
          throw new BadRequestException('LCL cargo lines cannot be assigned to containers.');
        }
        const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);
        await this.assertContainerOnDetail(tx, tenantId, detail.id, dto.container_id);
      }

      return tx.jobCargo.update({
        where: { id: cargoId },
        data: { ...dto, updated_by: actorId },
      });
    });
  }

  async removeCargo(tenantId: string, jobId: string, cargoId: string, actorId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertSeaCargoJob(tx, tenantId, jobId);
      const cargo = await tx.jobCargo.findFirst({
        where: { id: cargoId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      if (!cargo) {
        throw new NotFoundException('Cargo line not found.');
      }

      await tx.jobCargo.update({
        where: { id: cargoId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }

  async assignCargoToContainer(
    tenantId: string,
    jobId: string,
    containerId: string,
    dto: AssignCargoToContainerDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);
      await this.assertContainerOnDetail(tx, tenantId, detail.id, containerId);

      const cargo = await tx.jobCargo.findFirst({
        where: { id: dto.cargo_id, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      if (!cargo) {
        throw new NotFoundException('Cargo line not found.');
      }

      return tx.jobCargo.update({
        where: { id: cargo.id },
        data: { container_id: containerId, updated_by: actorId },
      });
    });
  }

  async splitContainer(
    tenantId: string,
    jobId: string,
    containerId: string,
    dto: SplitContainerDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);
      await this.assertContainerOnDetail(tx, tenantId, detail.id, containerId);

      const created = [];
      for (const portion of dto.portions) {
        created.push(
          await tx.jobCargo.create({
            data: {
              tenant_id: tenantId,
              job_id: jobId,
              container_id: containerId,
              consignee_id: portion.consignee_id,
              commodity: portion.commodity,
              marks_numbers: portion.marks_numbers,
              packages: portion.packages,
              gross_weight: portion.gross_weight,
              measurement: portion.measurement,
              created_by: actorId,
              updated_by: actorId,
            },
          }),
        );
      }

      return created;
    });
  }

  // ============================================================
  // BILLS OF LADING
  // ============================================================

  async listBillsOfLading(tenantId: string, jobId: string) {
    await this.getSeaFclDetailOrThrowInTenant(tenantId, jobId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.billOfLading.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { created_at: 'desc' },
      }),
    );
  }

  async createBillOfLading(tenantId: string, jobId: string, dto: CreateBillOfLadingDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);

      return tx.billOfLading.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          bl_type: dto.bl_type,
          bl_number: dto.bl_number,
          shipper_id: dto.shipper_id,
          consignee_id: dto.consignee_id,
          notify_id: dto.notify_id,
          pol: dto.pol,
          pod: dto.pod,
          place_of_receipt: dto.place_of_receipt,
          place_of_delivery: dto.place_of_delivery,
          vessel_name: dto.vessel_name,
          voyage_number: dto.voyage_number,
          etd: dto.etd ? new Date(dto.etd) : undefined,
          eta: dto.eta ? new Date(dto.eta) : undefined,
          description_of_goods: dto.description_of_goods,
          marks_numbers: dto.marks_numbers,
          packages: dto.packages,
          gross_weight: dto.gross_weight,
          measurement: dto.measurement,
          freight_payable_at: dto.freight_payable_at,
          freight_terms: dto.freight_terms,
          number_of_originals: dto.number_of_originals ?? 3,
          bl_conditions: dto.bl_conditions,
          rider_terms: dto.rider_terms,
          switched_from_bl_number: dto.switched_from_bl_number,
          switch_consignee_id: dto.switch_consignee_id,
          switch_notify_id: dto.switch_notify_id,
          proxy_forwarder_name: dto.proxy_forwarder_name,
          proxy_forwarder_address: dto.proxy_forwarder_address,
          paired_bl_id: dto.paired_bl_id,
          is_draft: dto.is_draft ?? true,
          is_original: dto.is_original ?? false,
          is_surrendered: dto.is_surrendered ?? false,
          is_express_release: dto.is_express_release ?? false,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  async updateBillOfLading(
    tenantId: string,
    jobId: string,
    blId: string,
    dto: UpdateBillOfLadingDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);
      const bl = await tx.billOfLading.findFirst({
        where: { id: blId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      if (!bl) {
        throw new NotFoundException('Bill of lading not found.');
      }

      const { etd, eta, ...rest } = dto;

      const updated = await tx.billOfLading.update({
        where: { id: blId },
        data: {
          ...rest,
          ...(etd ? { etd: new Date(etd) } : {}),
          ...(eta ? { eta: new Date(eta) } : {}),
          updated_by: actorId,
        },
      });

      if (dto.is_draft === false || dto.is_original === true) {
        await this.markMilestoneIfPresent(
          tx,
          tenantId,
          jobId,
          'ORIGINAL_BL_ISSUED_OR_SURRENDERED',
          new Date(),
          actorId,
        );
      }

      return updated;
    });
  }

  async removeBillOfLading(tenantId: string, jobId: string, blId: string, actorId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);
      const bl = await tx.billOfLading.findFirst({
        where: { id: blId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      if (!bl) {
        throw new NotFoundException('Bill of lading not found.');
      }

      await tx.billOfLading.update({
        where: { id: blId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }

  // ============================================================
  // STUFFING RECORDS
  // ============================================================

  async listStuffingRecords(tenantId: string, jobId: string) {
    await this.getSeaFclDetailOrThrowInTenant(tenantId, jobId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.stuffingRecord.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { stuffing_date: 'desc' },
      }),
    );
  }

  async createStuffingRecord(
    tenantId: string,
    jobId: string,
    dto: CreateStuffingRecordDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);

      if (dto.container_id) {
        await this.assertContainerOnDetail(tx, tenantId, detail.id, dto.container_id);
      }

      const record = await tx.stuffingRecord.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          container_id: dto.container_id,
          supervisor_name: dto.supervisor_name,
          stuffing_date: new Date(dto.stuffing_date),
          location: dto.location,
          goods_condition: dto.goods_condition,
          notes: dto.notes,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      if (dto.container_id) {
        await tx.jobContainer.update({
          where: { id: dto.container_id },
          data: { status: ContainerStatus.STUFFED, updated_by: actorId },
        });
      }

      await this.markMilestoneIfPresent(
        tx,
        tenantId,
        jobId,
        'STUFFING_COMPLETED',
        new Date(dto.stuffing_date),
        actorId,
      );

      return record;
    });
  }

  async updateStuffingRecord(
    tenantId: string,
    jobId: string,
    recordId: string,
    dto: UpdateStuffingRecordDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);
      const record = await tx.stuffingRecord.findFirst({
        where: { id: recordId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      if (!record) {
        throw new NotFoundException('Stuffing record not found.');
      }

      if (dto.container_id) {
        await this.assertContainerOnDetail(tx, tenantId, detail.id, dto.container_id);
      }

      const { stuffing_date, ...rest } = dto;

      return tx.stuffingRecord.update({
        where: { id: recordId },
        data: {
          ...rest,
          ...(stuffing_date ? { stuffing_date: new Date(stuffing_date) } : {}),
          updated_by: actorId,
        },
      });
    });
  }

  async removeStuffingRecord(
    tenantId: string,
    jobId: string,
    recordId: string,
    actorId?: string,
  ): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getSeaFclDetailOrThrow(tx, tenantId, jobId);
      const record = await tx.stuffingRecord.findFirst({
        where: { id: recordId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      if (!record) {
        throw new NotFoundException('Stuffing record not found.');
      }

      await tx.stuffingRecord.update({
        where: { id: recordId },
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
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const milestone = await tx.jobMilestone.findFirst({
        where: { id: milestoneId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
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

    if (dto.actual_date) {
      // Fire-and-forget status email (Week 6) — failure must not roll back milestone.
      void this.notifyMilestoneStatus(tenantId, jobId, updated.milestone, actorId);
      void this.notifyPortalMilestoneUpdated(tenantId, jobId, updated.milestone);
    }

    return updated;
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
          is_provisional: dto.is_provisional ?? false,
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

      const existing = await tx.jobCharge.findFirst({
        where: { id: chargeId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

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

      const existing = await tx.jobCharge.findFirst({
        where: { id: chargeId, job_id: jobId, tenant_id: tenantId, deleted_at: null },
      });

      if (!existing) {
        throw new NotFoundException('Charge line not found.');
      }

      await tx.jobCharge.update({
        where: { id: chargeId },
        data: { deleted_at: new Date() },
      });
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
        where: {
          job_id: masterId,
          charge_code_id: chargeCodeId,
          tenant_id: tenantId,
          is_cost: true,
          deleted_at: null,
        },
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

      const weights = houseJobs.map((h) => {
        const chargeable = Number(h.chargeable_weight ?? 0);
        const gross = Number(h.gross_weight ?? 0);
        const cbm = Number(h.volume_cbm ?? 0);
        if (master.job_type === 'SEA_LCL_EXPORT' || master.job_type === 'SEA_LCL_IMPORT') {
          if (cbm > 0) return cbm;
          if (chargeable > 0) return chargeable;
          return gross;
        }
        if (chargeable > 0) return chargeable;
        return gross;
      });
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
    const document = await this.prisma.runWithTenant(tenantId, async (tx) => {
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

    await this.notifications.notifyPortalDocumentReadyForJob(tenantId, jobId, document);
    return document;
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
    const updated = await this.prisma.runWithTenant(tenantId, async (tx) => {
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

      const result = await tx.jobDocument.update({
        where: { id: documentId },
        data: {
          is_finalized: finalize,
          is_original: finalize ? true : document.is_original,
          finalized_at: finalize ? new Date() : null,
          finalized_by: finalize ? actorId : null,
          updated_by: actorId,
        },
      });

      if (finalize && ['HBL', 'HBL_EXPRESS_RELEASE', 'MBL', 'FIATA_BL'].includes(document.document_type)) {
        await tx.billOfLading.updateMany({
          where: {
            tenant_id: tenantId,
            job_id: jobId,
            deleted_at: null,
            is_draft: true,
          },
          data: {
            is_draft: false,
            is_original: true,
            is_express_release: document.document_type === 'HBL_EXPRESS_RELEASE',
            finalized_at: new Date(),
            updated_by: actorId,
          },
        });

        await this.markMilestoneIfPresent(
          tx,
          tenantId,
          jobId,
          'ORIGINAL_BL_ISSUED_OR_SURRENDERED',
          new Date(),
          actorId,
        );
      }

      if (finalize && document.document_type === 'SURRENDER_NOTICE') {
        await tx.billOfLading.updateMany({
          where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
          data: { is_surrendered: true, updated_by: actorId },
        });
      }

      return result;
    });

    if (updated.is_finalized) {
      await this.notifications.notifyPortalDocumentReadyForJob(tenantId, jobId, updated);
    }

    return updated;
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
  // ASYNC DOCUMENT GENERATION (Ch.8)
  // ============================================================

  async generateDocument(
    tenantId: string,
    jobId: string,
    documentType: DocumentType,
    dto: GenerateJobDocumentDto,
    actorId?: string,
  ) {
    const job = await this.findOne(tenantId, jobId);
    assertDocumentAllowedForJobType(job.job_type, documentType);

    const options = {
      bl_id: dto.bl_id,
      number_of_originals: dto.number_of_originals,
      rider_terms: dto.rider_terms,
      switched_from_bl_number: dto.switched_from_bl_number,
      switch_consignee_id: dto.switch_consignee_id,
      switch_notify_id: dto.switch_notify_id,
      proxy_forwarder_name: dto.proxy_forwarder_name,
      proxy_forwarder_address: dto.proxy_forwarder_address,
      transhipment_port: dto.transhipment_port,
      is_express_release: documentType === 'HBL_EXPRESS_RELEASE',
    };

    const task = await this.documentGeneration.enqueueJobDocument(
      tenantId,
      jobId,
      documentType,
      actorId,
      dto.layout_variant,
      dto.is_original ?? false,
      options,
    );

    return {
      task_id: task.id,
      status: task.status,
      document_type: documentType,
      message: 'Document generation queued.',
    };
  }

  /** Import docs that also complete a milestone when queued (CAN / DO). */
  async generateImportDocument(
    tenantId: string,
    jobId: string,
    documentType: DocumentType,
    dto: GenerateJobDocumentDto,
    actorId?: string,
  ) {
    const result = await this.generateDocument(tenantId, jobId, documentType, dto, actorId);

    const milestone =
      documentType === 'CAN'
        ? 'CAN_SENT'
        : documentType === 'DELIVERY_ORDER'
          ? 'DO_ISSUED'
          : null;

    if (milestone) {
      await this.prisma.runWithTenant(tenantId, async (tx) => {
        await this.markMilestoneIfPresent(tx, tenantId, jobId, milestone, new Date(), actorId);
      });
    }

    return result;
  }

  async getDocumentGenerationStatus(tenantId: string, jobId: string) {
    await this.findOne(tenantId, jobId);
    return this.documentGeneration.listTasks(tenantId, { jobId });
  }

  // ============================================================
  // PRE-ALERT (Ch.8)
  // ============================================================

  async sendPreAlert(tenantId: string, jobId: string, dto: SendPreAlertDto, actorId?: string) {
    const job = await this.findOne(tenantId, jobId);

    if (job.job_type !== 'AIR_EXPORT' && job.job_type !== 'SEA_FCL_EXPORT' && job.job_type !== 'SEA_LCL_EXPORT') {
      throw new BadRequestException('Pre-alert is only supported for Air Export and Sea Export jobs.');
    }

    if (!dto.to_email) {
      throw new BadRequestException('to_email is required to send a pre-alert.');
    }

    // Resolve milestone + compose body inside a short transaction; send email OUTSIDE
    // so SMTP latency cannot exhaust Prisma interactive transaction slots (cron errors).
    const prepared = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const milestone = await tx.jobMilestone.findFirst({
        where: { tenant_id: tenantId, job_id: jobId, milestone: 'PRE_ALERT_SENT', deleted_at: null },
      });

      if (!milestone) {
        throw new NotFoundException('PRE_ALERT_SENT milestone not found on this job.');
      }

      const airDetail = job.air_details;
      const seaFclDetail = job.sea_fcl_details;
      const seaLclDetail = job.sea_lcl_details;
      const subject = `Pre-Alert — ${job.job_number}`;
      const body =
        dto.message ??
        `<p>Pre-alert for job <strong>${job.job_number}</strong>.</p>` +
          (airDetail?.hawb_number ? `<p>HAWB: ${airDetail.hawb_number}</p>` : '') +
          (airDetail?.mawb_number ? `<p>MAWB: ${airDetail.mawb_number}</p>` : '') +
          (seaFclDetail?.hbl_number ? `<p>HBL: ${seaFclDetail.hbl_number}</p>` : '') +
          (seaFclDetail?.mbl_number ? `<p>MBL: ${seaFclDetail.mbl_number}</p>` : '') +
          (seaLclDetail?.hbl_number ? `<p>HBL: ${seaLclDetail.hbl_number}</p>` : '') +
          (seaLclDetail?.mbl_number ? `<p>MBL: ${seaLclDetail.mbl_number}</p>` : '') +
          (seaFclDetail?.voyage_number ? `<p>Voyage: ${seaFclDetail.voyage_number}</p>` : '') +
          (seaLclDetail?.voyage_number ? `<p>Voyage: ${seaLclDetail.voyage_number}</p>` : '') +
          (job.commodity ? `<p>Commodity: ${job.commodity}</p>` : '');

      return { milestone, subject, body };
    });

    const emailLog = await this.emailService.send({
      tenantId,
      eventType: 'PRE_ALERT',
      to: dto.to_email,
      subject: prepared.subject,
      body: prepared.body,
      jobId,
      createdBy: actorId,
    });

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      if (!prepared.milestone.actual_date) {
        await tx.jobMilestone.update({
          where: { id: prepared.milestone.id },
          data: {
            actual_date: new Date(),
            completed_by: actorId,
            notes: dto.message ?? prepared.milestone.notes,
            updated_by: actorId,
          },
        });
      }
    });

    return {
      success: emailLog.status === 'SENT',
      email_log_id: emailLog.id,
      status: emailLog.status,
      job_id: jobId,
      to_email: dto.to_email,
      milestone: 'PRE_ALERT_SENT',
    };
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

  private async getSeaFclDetailOrThrowInTenant(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, (tx) => this.getSeaFclDetailOrThrow(tx, tenantId, jobId));
  }

  private async getSeaLclDetailOrThrow(tx: Prisma.TransactionClient, tenantId: string, jobId: string) {
    const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    if (job.job_type !== 'SEA_LCL_EXPORT' && job.job_type !== 'SEA_LCL_IMPORT') {
      throw new BadRequestException('This job is not a Sea LCL job.');
    }

    const detail = await tx.seaLclJobDetail.findFirst({ where: { job_id: jobId, tenant_id: tenantId, deleted_at: null } });

    if (!detail) {
      throw new NotFoundException('Sea LCL details not found for this job.');
    }

    return detail;
  }

  private isSeaLclJobType(jobType: JobType): boolean {
    return jobType === 'SEA_LCL_EXPORT' || jobType === 'SEA_LCL_IMPORT';
  }

  private isSeaCargoJobType(jobType: JobType): boolean {
    return (
      jobType === 'SEA_FCL_EXPORT' ||
      jobType === 'SEA_FCL_IMPORT' ||
      jobType === 'SEA_LCL_EXPORT' ||
      jobType === 'SEA_LCL_IMPORT'
    );
  }

  private async assertSeaCargoJobInTenant(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, (tx) => this.assertSeaCargoJob(tx, tenantId, jobId));
  }

  private async assertSeaCargoJob(tx: Prisma.TransactionClient, tenantId: string, jobId: string) {
    const job = await tx.job.findFirst({ where: { id: jobId, tenant_id: tenantId, deleted_at: null } });

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    if (!this.isSeaCargoJobType(job.job_type)) {
      throw new BadRequestException('This job is not a Sea FCL or Sea LCL job.');
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

  private async assertContainerOnDetail(
    tx: Prisma.TransactionClient,
    tenantId: string,
    seaFclDetailId: string,
    containerId: string,
  ) {
    const container = await tx.jobContainer.findFirst({
      where: {
        id: containerId,
        sea_fcl_detail_id: seaFclDetailId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!container) {
      throw new NotFoundException('Container not found.');
    }

    return container;
  }

  private async markMilestoneIfPresent(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
    milestoneName: string,
    actualDate: Date,
    actorId?: string,
  ) {
    const milestone = await tx.jobMilestone.findFirst({
      where: {
        tenant_id: tenantId,
        job_id: jobId,
        milestone: milestoneName,
        deleted_at: null,
        actual_date: null,
      },
    });

    if (!milestone) {
      return;
    }

    await tx.jobMilestone.update({
      where: { id: milestone.id },
      data: {
        actual_date: actualDate,
        completed_by: actorId,
        updated_by: actorId,
      },
    });

    // Fire-and-forget after row update; portal/staff notify use separate transactions.
    void this.notifyPortalMilestoneUpdated(tenantId, jobId, milestoneName);
  }

  private async assertContainerTypeExists(
    tx: Prisma.TransactionClient,
    tenantId: string,
    containerTypeId: string,
  ) {
    const exists = await tx.containerType.findFirst({
      where: { id: containerTypeId, tenant_id: tenantId, deleted_at: null },
    });

    if (!exists) {
      throw new NotFoundException('Container type not found.');
    }

    return exists;
  }

  private async recalculateTotals(tx: Prisma.TransactionClient, tenantId: string, jobId: string): Promise<void> {
    const charges = await tx.jobCharge.findMany({
      where: { tenant_id: tenantId, job_id: jobId, deleted_at: null, is_provisional: false },
    });

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

  /** Week 6 — email (and optional WhatsApp stub) when a milestone is completed. */
  async notifyMilestoneStatus(tenantId: string, jobId: string, milestoneName: string, actorId?: string) {
    const job = await this.findOne(tenantId, jobId);
    const partyIds = [job.shipper_id, job.consignee_id].filter(Boolean) as string[];
    const parties = partyIds.length
      ? await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.party.findMany({
            where: { tenant_id: tenantId, id: { in: partyIds }, deleted_at: null },
            select: { id: true, email: true, phone: true },
          }),
        )
      : [];
    const consignee = parties.find((p) => p.id === job.consignee_id);
    const shipper = parties.find((p) => p.id === job.shipper_id);
    const to = consignee?.email ?? shipper?.email;
    const body = 'Job ' + job.job_number + ': milestone "' + milestoneName + '" was completed.';

    if (to) {
      await this.emailService.send({
        tenantId,
        eventType: 'MILESTONE_STATUS',
        to,
        subject: '[Status] ' + job.job_number + ' — ' + milestoneName,
        body,
        jobId,
        createdBy: actorId,
      });
    }

    const phone = consignee?.phone ?? shipper?.phone;
    if (phone) {
      await this.whatsApp.sendStatusMessage({
        tenantId,
        toPhoneE164: phone,
        body,
        jobId,
        createdBy: actorId,
      });
    }
  }

  private async notifyPortalMilestoneUpdated(
    tenantId: string,
    jobId: string,
    milestoneName: string,
  ) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: {
          id: true,
          job_number: true,
          shipper_id: true,
          consignee_id: true,
          billing_party_id: true,
          ops_user_id: true,
          salesperson_id: true,
        },
      }),
    );
    if (!job) return;

    const partyIds = [...new Set(
      [job.shipper_id, job.consignee_id, job.billing_party_id].filter(Boolean) as string[],
    )];

    for (const partyId of partyIds) {
      await this.notifications.notifyPartyPortalUsersMilestoneOptIn(tenantId, partyId, {
        type: 'JOB_MILESTONE_UPDATED',
        title: `Milestone updated: ${job.job_number}`,
        message: `Milestone "${milestoneName}" was completed on shipment ${job.job_number}.`,
        entity_type: 'job',
        entity_id: job.id,
        link_path: `/portal/shipments/${job.id}`,
      });
    }

    const staffPayload = {
      type: 'JOB_MILESTONE_UPDATED' as const,
      title: `Milestone updated: ${job.job_number}`,
      message: `Milestone "${milestoneName}" was completed on job ${job.job_number}.`,
      entity_type: 'job',
      entity_id: job.id,
      link_path: `/jobs/${job.id}`,
    };

    await this.notifications.notifyOpsStaff(tenantId, staffPayload);

    if (job.ops_user_id) {
      await this.notifications.notifyStaffUser(tenantId, job.ops_user_id, staffPayload);
    }
    if (job.salesperson_id && job.salesperson_id !== job.ops_user_id) {
      await this.notifications.notifyStaffUser(tenantId, job.salesperson_id, staffPayload);
    }
  }

  async createSubJob(tenantId: string, parentId: string, dto: CreateSubJobDto, actorId?: string) {
    const parent = await this.findOne(tenantId, parentId);
    const shipperId = dto.shipper_id ?? parent.shipper_id;
    if (!shipperId) {
      throw new BadRequestException('shipper_id is required (set on the sub-job or inherit from the parent).');
    }
    return this.create(
      tenantId,
      {
        job_type: dto.job_type ?? parent.job_type,
        parent_job_id: parentId,
        shipper_id: shipperId,
        consignee_id: dto.consignee_id ?? parent.consignee_id ?? undefined,
        agent_id: dto.agent_id ?? parent.agent_id ?? undefined,
        commodity: dto.commodity ?? parent.commodity ?? undefined,
        notes: dto.notes,
        company_id: parent.company_id ?? undefined,
        branch_id: parent.branch_id ?? undefined,
      },
      actorId,
    ).then(async (job) => {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.job.update({ where: { id: job.id }, data: { is_sub_job: true } }),
      );
      return this.findOne(tenantId, job.id);
    });
  }

  async listSubJobs(tenantId: string, parentId: string) {
    await this.findOne(tenantId, parentId);
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findMany({
        where: { tenant_id: tenantId, parent_job_id: parentId, is_sub_job: true, deleted_at: null },
        orderBy: { created_at: 'asc' },
      }),
    );
  }

  async createPaymentRequestFromJob(
    tenantId: string,
    jobId: string,
    dto: CreatePaymentRequestFromJobDto,
    actorId?: string,
  ) {
    const job = await this.findOne(tenantId, jobId);
    const partyId = dto.party_id ?? job.shipper_id ?? job.consignee_id;
    if (!partyId) {
      throw new BadRequestException('party_id is required when the job has no shipper/consignee.');
    }

    const amount = dto.amount ?? Number(job.revenue_total);
    if (amount <= 0) {
      throw new BadRequestException('Payment request amount must be greater than zero.');
    }

    const currency = dto.currency_code ?? 'AED';
    const requestNumber = await this.numberGenerator.generate(tenantId, 'VOUCHER');

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.paymentRequest.create({
        data: {
          tenant_id: tenantId,
          request_number: requestNumber,
          status: 'PENDING',
          party_id: partyId,
          job_id: jobId,
          amount,
          currency_code: currency,
          remarks: dto.remarks ?? `Payment request for job ${job.job_number}`,
          created_by: actorId,
          updated_by: actorId,
        },
      }),
    );
  }

  async schedulePreAlert(tenantId: string, jobId: string, dto: SchedulePreAlertDto, actorId?: string) {
    await this.findOne(tenantId, jobId);
    const at = new Date(dto.scheduled_at);
    if (at.getTime() <= Date.now()) {
      throw new BadRequestException('scheduled_at must be in the future.');
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.update({
        where: { id: jobId },
        data: {
          pre_alert_scheduled_at: at,
          pre_alert_to_email: dto.to_email,
          pre_alert_message: dto.message,
          updated_by: actorId,
        },
        select: {
          id: true,
          job_number: true,
          pre_alert_scheduled_at: true,
          pre_alert_to_email: true,
        },
      }),
    );
  }

  /** Called by scheduler — send due pre-alerts. */
  async processScheduledPreAlerts(tenantId: string) {
    const due = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          pre_alert_scheduled_at: { lte: new Date() },
          pre_alert_sent_at: null,
          pre_alert_to_email: { not: null },
        },
        take: 50,
      }),
    );

    let sent = 0;
    for (const job of due) {
      if (!job.pre_alert_to_email) continue;
      try {
        await this.sendPreAlert(
          tenantId,
          job.id,
          { to_email: job.pre_alert_to_email, message: job.pre_alert_message ?? undefined },
          undefined,
        );
        await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.job.update({
            where: { id: job.id },
            data: { pre_alert_sent_at: new Date(), pre_alert_scheduled_at: null },
          }),
        );
        sent += 1;
      } catch {
        // leave scheduled for retry
      }
    }
    return { sent, checked: due.length };
  }

  async sendWhatsAppStatus(tenantId: string, jobId: string, dto: SendWhatsAppStatusDto, actorId?: string) {
    const job = await this.findOne(tenantId, jobId);
    return this.whatsApp.sendStatusMessage({
      tenantId,
      toPhoneE164: dto.to_phone,
      body: dto.message ?? `Update on shipment ${job.job_number}.`,
      jobId,
      createdBy: actorId,
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

    const taxRate = await tx.taxRate.findFirst({
      where: { id: dto.tax_rate_id, tenant_id: tenantId, deleted_at: null },
    });

    if (!taxRate) {
      throw new NotFoundException('Tax rate not found.');
    }

    return (dto.quantity ?? 1) * dto.unit_price * (Number(taxRate.rate) / 100);
  }

  private async resolveBranchCode(tenantId: string, branchId?: string): Promise<string | undefined> {
    if (!branchId) return undefined;

    const branch = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.branch.findFirst({ where: { id: branchId, tenant_id: tenantId, deleted_at: null } }),
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

  private async assertPartyExistsTx(
    tx: Prisma.TransactionClient,
    tenantId: string,
    partyId: string | undefined,
    label: string,
  ): Promise<void> {
    if (!partyId) return;
    const exists = await tx.party.findFirst({ where: { id: partyId, tenant_id: tenantId, deleted_at: null } });
    if (!exists) throw new NotFoundException(`${label} not found.`);
  }

  private async assertCompanyExistsTx(
    tx: Prisma.TransactionClient,
    tenantId: string,
    companyId?: string,
  ): Promise<void> {
    if (!companyId) return;
    const exists = await tx.company.findFirst({ where: { id: companyId, tenant_id: tenantId, deleted_at: null } });
    if (!exists) throw new NotFoundException('Company not found.');
  }

  private async assertBranchExistsTx(
    tx: Prisma.TransactionClient,
    tenantId: string,
    branchId?: string,
  ): Promise<void> {
    if (!branchId) return;
    const exists = await tx.branch.findFirst({ where: { id: branchId, tenant_id: tenantId, deleted_at: null } });
    if (!exists) throw new NotFoundException('Branch not found.');
  }

  private async assertDepartmentExistsTx(
    tx: Prisma.TransactionClient,
    tenantId: string,
    departmentId?: string,
  ): Promise<void> {
    if (!departmentId) return;
    const exists = await tx.department.findFirst({
      where: { id: departmentId, tenant_id: tenantId, deleted_at: null },
    });
    if (!exists) throw new NotFoundException('Department not found.');
  }

  private async assertPortExistsTx(
    tx: Prisma.TransactionClient,
    tenantId: string,
    portId: string | undefined,
    label: string,
  ): Promise<void> {
    if (!portId) return;
    const exists = await tx.port.findFirst({ where: { id: portId, tenant_id: tenantId, deleted_at: null } });
    if (!exists) throw new NotFoundException(`${label} not found.`);
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
