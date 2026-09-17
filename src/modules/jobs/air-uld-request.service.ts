import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobType, UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AirWorkflowService } from "./air-workflow.service";
import {
  AllocateUldDto,
  CreateAirUldRequestDto,
} from "./dto/air-workflow.dto";

@Injectable()
export class AirUldRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflow: AirWorkflowService,
  ) {}

  private async nextRequestNumber(tx: any, tenantId: string) {
    const count = await tx.airUldRequest.count({
      where: { tenant_id: tenantId },
    });
    return `ULD-REQ-${String(count + 1).padStart(6, "0")}`;
  }

  private async nextUldNumbers(
    tx: any,
    tenantId: string,
    count: number,
  ): Promise<string[]> {
    let seq = await tx.tenantUldNumberSequence.findUnique({
      where: { tenant_id: tenantId },
    });
    if (!seq) {
      seq = await tx.tenantUldNumberSequence.create({
        data: { tenant_id: tenantId, prefix: "ULD", next_value: 1 },
      });
    }
    const start = seq.next_value;
    await tx.tenantUldNumberSequence.update({
      where: { tenant_id: tenantId },
      data: { next_value: start + count },
    });
    const numbers: string[] = [];
    for (let i = 0; i < count; i++) {
      numbers.push(`${seq.prefix}${String(start + i).padStart(7, "0")}`);
    }
    return numbers;
  }

  async listForJob(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.airUldRequest.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        include: {
          lines: {
            orderBy: { line_no: "asc" },
            include: { air_pallet_type: true },
          },
        },
        orderBy: { created_at: "desc" },
      }),
    );
  }

  async create(
    tenantId: string,
    jobId: string,
    dto: CreateAirUldRequestDto,
    actor: { id: string; role: UserRole },
  ) {
    this.workflow.assertCanEnterStage(actor.role, "ULD_REQUEST_ISSUED", {
      override: dto.admin_override,
      overrideReason: dto.stage_override_reason,
    });

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const job = await tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
          job_type: JobType.AIR_EXPORT,
        },
        include: { air_details: true },
      });
      if (!job?.air_details) {
        throw new NotFoundException("Air export job not found.");
      }

      const count = dto.uld_count ?? 1;
      const requestNumber = await this.nextRequestNumber(tx, tenantId);
      const created = await tx.airUldRequest.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          air_job_detail_id: job.air_details.id,
          request_number: requestNumber,
          status: "DRAFT",
          airline_name: dto.airline_name,
          flight_number: dto.flight_number,
          flight_date: dto.flight_date ? new Date(dto.flight_date) : null,
          warehouse_cfs: dto.warehouse_cfs,
          cutoff_at: dto.cutoff_at ? new Date(dto.cutoff_at) : null,
          remarks: dto.remarks,
          uld_count: count,
          created_by: actor.id,
          updated_by: actor.id,
          lines: {
            create: Array.from({ length: count }, (_, i) => ({
              tenant_id: tenantId,
              line_no: i + 1,
              air_pallet_type_id: dto.air_pallet_type_id,
            })),
          },
        },
        include: {
          lines: {
            orderBy: { line_no: "asc" },
            include: { air_pallet_type: true },
          },
        },
      });
      return created;
    });
  }

  async issue(
    tenantId: string,
    jobId: string,
    requestId: string,
    actor: { id: string; role: UserRole },
    opts?: { admin_override?: boolean; stage_override_reason?: string },
  ) {
    this.workflow.assertCanEnterStage(actor.role, "ULD_REQUEST_ISSUED", {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
    });

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const req = await tx.airUldRequest.findFirst({
        where: {
          id: requestId,
          job_id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
        },
        include: { lines: true },
      });
      if (!req) throw new NotFoundException("Unit Load Device request not found.");

      const job = await tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        include: { air_details: true },
      });
      if (!job?.air_details) throw new NotFoundException("Air job not found.");

      this.workflow.assertForwardTransition(
        job.job_type,
        job.air_details.workflow_stage,
        "ULD_REQUEST_ISSUED",
        { allowSkip: opts?.admin_override },
      );

      const updated = await tx.airUldRequest.update({
        where: { id: requestId },
        data: {
          status: "ISSUED",
          portal_visible_at: new Date(),
          issued_at: new Date(),
          issued_by: actor.id,
          updated_by: actor.id,
        },
        include: {
          lines: {
            orderBy: { line_no: "asc" },
            include: { air_pallet_type: true },
          },
        },
      });

      await tx.airJobDetail.update({
        where: { id: job.air_details.id },
        data: {
          workflow_stage: "ULD_REQUEST_ISSUED",
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          stage_override_reason: opts?.admin_override
            ? opts.stage_override_reason
            : undefined,
          updated_by: actor.id,
        },
      });

      return updated;
    });
  }

  async allocate(
    tenantId: string,
    jobId: string,
    requestId: string,
    dto: AllocateUldDto,
    actor: { id: string; role: UserRole },
  ) {
    this.workflow.assertCanEnterStage(actor.role, "ULD_ALLOCATED", {
      override: dto.admin_override,
      overrideReason: dto.stage_override_reason,
    });

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const req = await tx.airUldRequest.findFirst({
        where: {
          id: requestId,
          job_id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
        },
        include: { lines: { orderBy: { line_no: "asc" } } },
      });
      if (!req) throw new NotFoundException("Unit Load Device request not found.");

      const job = await tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        include: { air_details: true },
      });
      if (!job?.air_details) throw new NotFoundException("Air job not found.");

      this.workflow.assertForwardTransition(
        job.job_type,
        job.air_details.workflow_stage,
        "ULD_ALLOCATED",
        { allowSkip: dto.admin_override },
      );

      const linesNeeding = req.lines.filter((l) => !l.uld_number);
      const count = dto.count ?? linesNeeding.length;
      if (count <= 0) {
        throw new BadRequestException("No Unit Load Device lines to allocate.");
      }
      const numbers = await this.nextUldNumbers(tx, tenantId, count);
      for (let i = 0; i < count; i++) {
        const line = linesNeeding[i] ?? req.lines[i];
        if (!line) {
          await tx.airUldRequestLine.create({
            data: {
              tenant_id: tenantId,
              uld_request_id: requestId,
              line_no: req.lines.length + i + 1,
              uld_number: numbers[i],
            },
          });
        } else {
          await tx.airUldRequestLine.update({
            where: { id: line.id },
            data: { uld_number: numbers[i] },
          });
        }
      }

      const updated = await tx.airUldRequest.update({
        where: { id: requestId },
        data: {
          status: "ALLOCATED",
          allocated_at: new Date(),
          allocated_by: actor.id,
          portal_visible_at: req.portal_visible_at ?? new Date(),
          updated_by: actor.id,
        },
        include: {
          lines: {
            orderBy: { line_no: "asc" },
            include: { air_pallet_type: true },
          },
        },
      });

      await tx.airJobDetail.update({
        where: { id: job.air_details.id },
        data: {
          workflow_stage: "ULD_ALLOCATED",
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          stage_override_reason: dto.admin_override
            ? dto.stage_override_reason
            : undefined,
          updated_by: actor.id,
        },
      });

      return updated;
    });
  }
}
