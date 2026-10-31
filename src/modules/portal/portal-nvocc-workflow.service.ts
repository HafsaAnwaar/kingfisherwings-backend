import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomBytes } from "crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalShipmentsService } from "./portal-shipments.service";

@Injectable()
export class PortalNvoccWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly portalShipments: PortalShipmentsService,
  ) {}

  /**
   * Resolve portal shipment → job and ensure NvoccJobDetail exists so
   * port-token / draft-BL / CRO endpoints do not 404 on non-seeded jobs.
   */
  private async getOwnedNvoccJob(user: CurrentPortalUser, id: string) {
    const jobId = await this.portalShipments.resolveTrackingJobId(user, id);
    if (!jobId) {
      throw new NotFoundException("Shipment not found.");
    }
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      let job = await tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: user.tenantId,
          deleted_at: null,
        },
        include: { nvocc_details: true },
      });
      if (!job) {
        throw new NotFoundException("Shipment not found.");
      }
      if (job.nvocc_details?.deleted_at) {
        const restored = await tx.nvoccJobDetail.update({
          where: { id: job.nvocc_details.id },
          data: { deleted_at: null, updated_by: user.id },
        });
        job = { ...job, nvocc_details: restored };
      } else if (!job.nvocc_details) {
        try {
          const created = await tx.nvoccJobDetail.create({
            data: {
              tenant_id: user.tenantId,
              job_id: jobId,
              created_by: user.id,
              updated_by: user.id,
            },
          });
          job = { ...job, nvocc_details: created };
        } catch {
          // Unique race — reload
          const detail = await tx.nvoccJobDetail.findFirst({
            where: { job_id: jobId, tenant_id: user.tenantId },
          });
          if (!detail) throw new NotFoundException("Shipment not found.");
          job = { ...job, nvocc_details: detail };
        }
      }
      return job;
    });
  }

  async listContainerRequests(user: CurrentPortalUser, id: string) {
    const job = await this.getOwnedNvoccJob(user, id);
    const jobId = job.id;
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      // Customer-visible: issued/allocated (and any explicitly portal-flagged).
      const requests = await tx.nvoccContainerRequest.findMany({
        where: {
          tenant_id: user.tenantId,
          job_id: jobId,
          deleted_at: null,
          OR: [
            { portal_visible_at: { not: null } },
            { status: { in: ["ISSUED", "ALLOCATED"] } },
          ],
        },
        include: { lines: { orderBy: { line_no: "asc" } } },
        orderBy: { created_at: "desc" },
      });
      if (requests.length > 0) return requests;

      // Fallback: job containers allocated on the job (non-CRO path).
      const jobContainers = await tx.jobContainer.findMany({
        where: {
          tenant_id: user.tenantId,
          job_id: jobId,
          deleted_at: null,
          container_number: { not: null },
        },
        orderBy: [{ line_no: "asc" }, { created_at: "asc" }],
      });
      if (!jobContainers.length) return [];

      return [
        {
          id: `job-containers:${jobId}`,
          tenant_id: user.tenantId,
          job_id: jobId,
          status: "ALLOCATED",
          portal_visible_at: new Date(),
          lines: jobContainers.map((c, i) => ({
            id: c.id,
            line_no: c.line_no ?? i + 1,
            container_number: c.container_number,
            container_type_id: c.container_type_id,
            picked_at: null,
          })),
          synthetic: true,
          source: "job_containers",
        },
      ];
    });
  }

  async confirmPick(user: CurrentPortalUser, id: string, lineId: string) {
    const job = await this.getOwnedNvoccJob(user, id);
    const jobId = job.id;
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const line = await tx.nvoccContainerRequestLine.findFirst({
        where: {
          id: lineId,
          tenant_id: user.tenantId,
          container_request: {
            job_id: jobId,
            OR: [
              { portal_visible_at: { not: null } },
              { status: { in: ["ISSUED", "ALLOCATED"] } },
            ],
          },
        },
      });
      if (line?.container_number) {
        await tx.nvoccContainerRequestLine.update({
          where: { id: lineId },
          data: { picked_at: new Date() },
        });
        await tx.nvoccJobDetail.updateMany({
          where: { job_id: jobId, tenant_id: user.tenantId },
          data: {
            workflow_stage: "PICKED",
            stage_changed_at: new Date(),
          },
        });
        return {
          ok: true,
          container_number: line.container_number,
          picked_at: new Date(),
        };
      }

      // Synthetic path: JobContainer id used as lineId
      const jc = await tx.jobContainer.findFirst({
        where: {
          id: lineId,
          tenant_id: user.tenantId,
          job_id: jobId,
          deleted_at: null,
        },
      });
      if (!jc?.container_number) {
        throw new BadRequestException(
          "Container not allocated or not visible yet. Ask ops to Issue CRO / allocate containers.",
        );
      }
      await tx.nvoccJobDetail.updateMany({
        where: { job_id: jobId, tenant_id: user.tenantId },
        data: {
          workflow_stage: "PICKED",
          stage_changed_at: new Date(),
        },
      });
      return {
        ok: true,
        container_number: jc.container_number,
        picked_at: new Date(),
        source: "job_containers",
      };
    });
  }

  async confirmPortToken(user: CurrentPortalUser, id: string) {
    const job = await this.getOwnedNvoccJob(user, id);
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const detail = job.nvocc_details!;
      const token = detail.port_gate_token ?? randomBytes(16).toString("hex");
      const updated = await tx.nvoccJobDetail.update({
        where: { id: detail.id },
        data: {
          port_gate_token: token,
          port_token_obtained_at: new Date(),
          workflow_stage: "PORT_TOKEN",
          stage_changed_at: new Date(),
        },
      });
      return {
        port_gate_token: updated.port_gate_token,
        port_token_obtained_at: updated.port_token_obtained_at,
      };
    });
  }

  async requestDraftBl(user: CurrentPortalUser, id: string) {
    const job = await this.getOwnedNvoccJob(user, id);
    const jobId = job.id;
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const detail = await tx.nvoccJobDetail.findFirst({
        where: { job_id: jobId, tenant_id: user.tenantId, deleted_at: null },
      });
      if (!detail) throw new NotFoundException("Shipment not found.");

      const allocated = await tx.nvoccContainerRequest.count({
        where: {
          job_id: jobId,
          tenant_id: user.tenantId,
          status: "ALLOCATED",
          deleted_at: null,
        },
      });
      const jobContainerCount = await tx.jobContainer.count({
        where: {
          tenant_id: user.tenantId,
          job_id: jobId,
          deleted_at: null,
          container_number: { not: null },
        },
      });
      if (!allocated && !jobContainerCount) {
        throw new BadRequestException(
          "Containers must be allocated before requesting draft BL.",
        );
      }
      if (!detail.port_token_obtained_at) {
        throw new BadRequestException(
          "Confirm port token before requesting draft BL.",
        );
      }
      return tx.nvoccJobDetail.update({
        where: { id: detail.id },
        data: { draft_bl_requested_at: new Date() },
      });
    });
  }
}
