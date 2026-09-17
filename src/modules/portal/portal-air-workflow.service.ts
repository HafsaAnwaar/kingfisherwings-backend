import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { portalJobOwnershipWhere } from "./helpers/portal-ownership.helper";

@Injectable()
export class PortalAirWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOwnedAirJob(user: CurrentPortalUser, jobId: string) {
    const job = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          id: jobId,
          tenant_id: user.tenantId,
          deleted_at: null,
          job_type: { in: [JobType.AIR_EXPORT, JobType.AIR_IMPORT] },
          ...portalJobOwnershipWhere(user.partyId),
        },
        include: { air_details: true },
      }),
    );
    if (!job?.air_details) {
      throw new NotFoundException("Shipment not found.");
    }
    return job;
  }

  async listUldRequests(user: CurrentPortalUser, jobId: string) {
    await this.getOwnedAirJob(user, jobId);
    return this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.airUldRequest.findMany({
        where: {
          tenant_id: user.tenantId,
          job_id: jobId,
          deleted_at: null,
          portal_visible_at: { not: null },
        },
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

  async confirmDropoff(
    user: CurrentPortalUser,
    jobId: string,
    lineId: string,
  ) {
    const job = await this.getOwnedAirJob(user, jobId);
    if (job.job_type !== JobType.AIR_EXPORT) {
      throw new BadRequestException("Drop-off applies to air export only.");
    }
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const line = await tx.airUldRequestLine.findFirst({
        where: {
          id: lineId,
          tenant_id: user.tenantId,
          uld_request: {
            job_id: jobId,
            portal_visible_at: { not: null },
            deleted_at: null,
          },
        },
        include: { uld_request: true },
      });
      if (!line) throw new NotFoundException("Unit Load Device line not found.");
      if (!line.uld_number) {
        throw new BadRequestException(
          "Unit Load Device number not allocated yet.",
        );
      }

      await tx.airUldRequestLine.update({
        where: { id: lineId },
        data: { dropped_off_at: new Date() },
      });

      await tx.airJobDetail.update({
        where: { id: job.air_details!.id },
        data: {
          cargo_dropped_off_at: new Date(),
          workflow_stage: "CARGO_DROPPED_OFF",
          stage_changed_at: new Date(),
          updated_by: user.id,
        },
      });

      return { success: true, workflow_stage: "CARGO_DROPPED_OFF" };
    });
  }

  async requestDraftHawb(user: CurrentPortalUser, jobId: string) {
    const job = await this.getOwnedAirJob(user, jobId);
    if (job.job_type !== JobType.AIR_EXPORT) {
      throw new BadRequestException(
        "Draft House Air Waybill request applies to air export only.",
      );
    }
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      if (!job.air_details!.cargo_dropped_off_at &&
          job.air_details!.workflow_stage !== "BUILD_UP" &&
          job.air_details!.workflow_stage !== "CARGO_DROPPED_OFF") {
        throw new BadRequestException(
          "Cargo drop-off must be confirmed before requesting draft House Air Waybill.",
        );
      }
      await tx.airJobDetail.update({
        where: { id: job.air_details!.id },
        data: {
          draft_hawb_requested_at: new Date(),
          updated_by: user.id,
        },
      });
      return { success: true, draft_hawb_requested_at: new Date().toISOString() };
    });
  }

  async requestDeliveryOrder(user: CurrentPortalUser, jobId: string) {
    const job = await this.getOwnedAirJob(user, jobId);
    if (job.job_type !== JobType.AIR_IMPORT) {
      throw new BadRequestException(
        "Delivery Order request applies to air import only.",
      );
    }
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const stage = job.air_details!.workflow_stage;
      if (
        stage !== "CAN_ISSUED" &&
        stage !== "PAYMENT_RECEIVED" &&
        stage !== "DELIVERY_ORDER_ISSUED"
      ) {
        throw new BadRequestException(
          "Cargo Arrival Notice must be issued before requesting Delivery Order.",
        );
      }
      await tx.airJobDetail.update({
        where: { id: job.air_details!.id },
        data: {
          delivery_order_requested_at: new Date(),
          updated_by: user.id,
        },
      });
      return {
        success: true,
        delivery_order_requested_at: new Date().toISOString(),
      };
    });
  }
}
