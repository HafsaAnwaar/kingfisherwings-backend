import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NvoccWorkflowService } from "./nvocc-workflow.service";
import {
  AllocateContainersDto,
  CreateNvoccContainerRequestDto,
} from "./dto/nvocc-container-request.dto";

@Injectable()
export class NvoccContainerRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflow: NvoccWorkflowService,
  ) {}

  private async nextRequestNumber(tx: any, tenantId: string) {
    const count = await tx.nvoccContainerRequest.count({
      where: { tenant_id: tenantId },
    });
    return `CRO-${String(count + 1).padStart(6, "0")}`;
  }

  private async nextContainerNumbers(
    tx: any,
    tenantId: string,
    count: number,
  ): Promise<string[]> {
    let seq = await tx.tenantContainerNumberSequence.findUnique({
      where: { tenant_id: tenantId },
    });
    if (!seq) {
      seq = await tx.tenantContainerNumberSequence.create({
        data: { tenant_id: tenantId, prefix: "KF", next_value: 1 },
      });
    }
    const start = seq.next_value;
    await tx.tenantContainerNumberSequence.update({
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
      tx.nvoccContainerRequest.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        include: { lines: { orderBy: { line_no: "asc" } } },
        orderBy: { created_at: "desc" },
      }),
    );
  }

  async create(
    tenantId: string,
    jobId: string,
    dto: CreateNvoccContainerRequestDto,
    actor: { id: string; role: UserRole },
  ) {
    this.workflow.assertCanEnterStage(actor.role, "CRO_ISSUED", {
      override: dto.admin_override,
      overrideReason: dto.stage_override_reason,
    });

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await tx.nvoccJobDetail.findFirst({
        where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
        include: { booking: true },
      });
      if (!detail) throw new NotFoundException("NVOCC job not found.");

      const requestNumber = await this.nextRequestNumber(tx, tenantId);
      const created = await tx.nvoccContainerRequest.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          nvocc_job_detail_id: detail.id,
          request_number: requestNumber,
          status: "DRAFT",
          line_agent: dto.line_agent,
          agent_reference_no: dto.agent_reference_no,
          delivery_release_terminal: dto.delivery_release_terminal,
          created_date: new Date(),
          request_date: dto.request_date ? new Date(dto.request_date) : new Date(),
          expiry_date: dto.expiry_date ? new Date(dto.expiry_date) : null,
          dpw_reference_no: dto.dpw_reference_no,
          remarks: dto.remarks,
          vessel_name: dto.vessel_name,
          in_voyage_number: dto.in_voyage_number,
          out_voyage_number: dto.out_voyage_number,
          rotation: dto.rotation,
          eta: dto.eta ? new Date(dto.eta) : null,
          load_cut_off_date: dto.load_cut_off_date
            ? new Date(dto.load_cut_off_date)
            : null,
          instruction_type: dto.instruction_type,
          stuffing_location: dto.stuffing_location,
          port_cfs: dto.port_cfs,
          receive_to_port_location: dto.receive_to_port_location,
          move_type: dto.move_type,
          destination_port: dto.destination_port,
          next_port_of_discharge: dto.next_port_of_discharge,
          iso_code: dto.iso_code,
          imco_code: dto.imco_code,
          category: dto.category,
          container_count: dto.container_count,
          is_oog: dto.is_oog ?? false,
          is_dry: dto.is_dry ?? true,
          temperature: dto.temperature,
          ventilation: dto.ventilation,
          consignee_name: dto.consignee_name,
          haulier_name: dto.haulier_name,
          created_by: actor.id,
          updated_by: actor.id,
          lines: {
            create: Array.from({ length: dto.container_count }, (_, i) => ({
              tenant_id: tenantId,
              line_no: i + 1,
              container_type_id: dto.container_type_id,
            })),
          },
        },
        include: { lines: true },
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
    this.workflow.assertCanEnterStage(actor.role, "CRO_ISSUED", {
      override: opts?.admin_override,
      overrideReason: opts?.stage_override_reason,
    });

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const req = await tx.nvoccContainerRequest.findFirst({
        where: {
          id: requestId,
          job_id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
        },
        include: { lines: true },
      });
      if (!req) throw new NotFoundException("Container request not found.");
      if (req.status === "CANCELLED") {
        throw new BadRequestException("Request is cancelled.");
      }

      const updated = await tx.nvoccContainerRequest.update({
        where: { id: requestId },
        data: {
          status: "ISSUED",
          issued_at: new Date(),
          issued_by: actor.id,
          portal_visible_at: new Date(),
          updated_by: actor.id,
        },
        include: { lines: true },
      });

      await tx.nvoccJobDetail.updateMany({
        where: { job_id: jobId, tenant_id: tenantId },
        data: {
          workflow_stage: "CRO_ISSUED",
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          updated_by: actor.id,
        },
      });

      const detail = await tx.nvoccJobDetail.findFirst({
        where: { job_id: jobId, tenant_id: tenantId },
      });
      if (detail?.booking_id) {
        await tx.nvoccBooking.update({
          where: { id: detail.booking_id },
          data: {
            workflow_stage: "CRO_ISSUED",
            stage_changed_at: new Date(),
            stage_changed_by: actor.id,
            updated_by: actor.id,
          },
        });
      }

      return updated;
    });
  }

  async allocate(
    tenantId: string,
    jobId: string,
    requestId: string,
    dto: AllocateContainersDto,
    actor: { id: string; role: UserRole },
  ) {
    this.workflow.assertCanEnterStage(actor.role, "CONTAINER_ALLOCATED", {
      override: dto.admin_override,
      overrideReason: dto.stage_override_reason,
    });

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const req = await tx.nvoccContainerRequest.findFirst({
        where: {
          id: requestId,
          job_id: jobId,
          tenant_id: tenantId,
          deleted_at: null,
        },
        include: { lines: { orderBy: { line_no: "asc" } } },
      });
      if (!req) throw new NotFoundException("Container request not found.");
      if (req.status === "DRAFT") {
        throw new BadRequestException("Issue CRO before allocating numbers.");
      }

      const numbers = await this.nextContainerNumbers(
        tx,
        tenantId,
        req.lines.length,
      );
      for (let i = 0; i < req.lines.length; i++) {
        const line = req.lines[i]!;
        await tx.nvoccContainerRequestLine.update({
          where: { id: line.id },
          data: {
            container_number: numbers[i],
            container_type_id: dto.container_type_id ?? line.container_type_id,
          },
        });
      }

      const updated = await tx.nvoccContainerRequest.update({
        where: { id: requestId },
        data: {
          status: "ALLOCATED",
          allocated_at: new Date(),
          allocated_by: actor.id,
          portal_visible_at: req.portal_visible_at ?? new Date(),
          updated_by: actor.id,
        },
        include: { lines: { orderBy: { line_no: "asc" } } },
      });

      await tx.nvoccJobDetail.updateMany({
        where: { job_id: jobId, tenant_id: tenantId },
        data: {
          workflow_stage: "CONTAINER_ALLOCATED",
          stage_changed_at: new Date(),
          stage_changed_by: actor.id,
          updated_by: actor.id,
        },
      });

      const detail = await tx.nvoccJobDetail.findFirst({
        where: { job_id: jobId, tenant_id: tenantId },
      });
      if (detail?.booking_id) {
        await tx.nvoccBooking.update({
          where: { id: detail.booking_id },
          data: {
            workflow_stage: "CONTAINER_ALLOCATED",
            stage_changed_at: new Date(),
            stage_changed_by: actor.id,
            updated_by: actor.id,
          },
        });
      }

      return updated;
    });
  }
}
