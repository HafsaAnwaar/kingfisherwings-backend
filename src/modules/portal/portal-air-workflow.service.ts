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

  async requestDraftHawb(user: CurrentPortalUser, jobId: string) {
    const job = await this.getOwnedAirJob(user, jobId);
    if (job.job_type !== JobType.AIR_EXPORT) {
      throw new BadRequestException(
        "Draft House Air Waybill request applies to air export only.",
      );
    }
    return this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const stage = job.air_details!.workflow_stage;
      const ok =
        stage === "INVOICE_SENT" ||
        stage === "BUILD_UP" ||
        stage === "DRAFT_HAWB_ISSUED" ||
        stage === "PAYMENT_RECEIVED" ||
        stage === "FINAL_HAWB_ISSUED";
      if (!ok) {
        throw new BadRequestException(
          "Invoice must be sent (or build-up started) before requesting draft House Air Waybill.",
        );
      }
      await tx.airJobDetail.update({
        where: { id: job.air_details!.id },
        data: {
          draft_hawb_requested_at: new Date(),
          updated_by: user.id,
        },
      });
      return {
        success: true,
        draft_hawb_requested_at: new Date().toISOString(),
      };
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
