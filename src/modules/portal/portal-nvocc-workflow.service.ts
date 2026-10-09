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

  private async getOwnedNvoccJob(user: CurrentPortalUser, id: string) {
    const jobId = await this.portalShipments.resolveTrackingJobId(user, id);
    if (!jobId) {
      throw new NotFoundException("Shipment not found.");
    }
    const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: user.tenantId,
          deleted_at: null,
        },
        include: { nvocc_details: true },
      }),
    );
    if (!job || !job.nvocc_details) {
      throw new NotFoundException("Shipment not found.");
    }
    return job;
  }

  async listContainerRequests(user: CurrentPortalUser, id: string) {
    const job = await this.getOwnedNvoccJob(user, id);
    const jobId = job.id;
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.nvoccContainerRequest.findMany({
        where: {
          tenant_id: user.tenantId,
          job_id: jobId,
          deleted_at: null,
          portal_visible_at: { not: null },
        },
        include: { lines: { orderBy: { line_no: "asc" } } },
        orderBy: { created_at: "desc" },
      }),
    );
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
            portal_visible_at: { not: null },
          },
        },
      });
      if (!line || !line.container_number) {
        throw new BadRequestException(
          "Container not allocated or not visible yet.",
        );
      }
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
          portal_visible_at: { not: null },
          deleted_at: null,
        },
      });
      if (!allocated) {
        throw new BadRequestException(
          "Containers must be allocated and visible before requesting draft BL.",
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
