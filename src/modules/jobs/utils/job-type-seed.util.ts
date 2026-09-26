import { BadRequestException } from "@nestjs/common";
import { CcDirection, JobType, Prisma } from "@prisma/client";
import {
  AIR_IMPORT_CREATE_MILESTONE,
  AIR_IMPORT_MILESTONES,
} from "../constants/air-import-milestones";
import { AIR_EXPORT_MILESTONES } from "../constants/air-export-milestones";
import { SEA_FCL_EXPORT_MILESTONES } from "../constants/sea-fcl-export-milestones";
import { SEA_FCL_IMPORT_MILESTONES } from "../constants/sea-fcl-import-milestones";
import {
  SEA_LCL_EXPORT_CREATE_MILESTONE,
  SEA_LCL_EXPORT_MILESTONES,
} from "../constants/sea-lcl-export-milestones";
import {
  SEA_LCL_IMPORT_CREATE_MILESTONE,
  SEA_LCL_IMPORT_MILESTONES,
} from "../constants/sea-lcl-import-milestones";
import {
  LAND_CREATE_MILESTONE,
  LAND_MILESTONES,
} from "../constants/land-milestones";
import {
  ROAD_FREIGHT_CREATE_MILESTONE,
  ROAD_FREIGHT_MILESTONES,
} from "../constants/road-freight-milestones";
import {
  COURIER_CREATE_MILESTONE,
  COURIER_MILESTONES,
} from "../constants/courier-milestones";
import {
  NVOCC_CREATE_MILESTONE,
  NVOCC_MILESTONES,
} from "../../nvocc/constants/nvocc-milestones";
import {
  CC_CHECKLIST_IMPORT,
  CC_CREATE_MILESTONE,
  CC_MILESTONES,
} from "../customs-clearance/cc-workflow.constants";

/**
 * Seeds mode-specific detail rows and standard milestones after job create / quote convert.
 * Must run inside an existing tenant transaction.
 */
export async function seedJobTypeExtras(
  tx: Prisma.TransactionClient,
  tenantId: string,
  jobId: string,
  jobType: JobType,
  actorId?: string,
): Promise<void> {
  try {
    await seedJobTypeExtrasInner(tx, tenantId, jobId, jobType, actorId);
  } catch (error: unknown) {
    if (isMissingRelationError(error)) {
      throw new BadRequestException(
        `Cannot seed ${jobType} job details — required database migration has not been applied yet. Run prisma migrate deploy.`,
      );
    }
    throw error;
  }
}

function isMissingRelationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code =
    "code" in error ? String((error as { code?: unknown }).code) : "";
  const message = error instanceof Error ? error.message : "";
  return code === "P2021" || /does not exist/i.test(message);
}

async function seedJobTypeExtrasInner(
  tx: Prisma.TransactionClient,
  tenantId: string,
  jobId: string,
  jobType: JobType,
  actorId?: string,
): Promise<void> {
  if (jobType === "AIR_EXPORT" || jobType === "AIR_IMPORT") {
    await tx.airJobDetail.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        created_by: actorId,
        updated_by: actorId,
      },
    });
  }

  if (jobType === "SEA_FCL_EXPORT" || jobType === "SEA_FCL_IMPORT") {
    await tx.seaFclJobDetail.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        created_by: actorId,
        updated_by: actorId,
      },
    });
  }

  if (jobType === "SEA_LCL_EXPORT" || jobType === "SEA_LCL_IMPORT") {
    await tx.seaLclJobDetail.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        created_by: actorId,
        updated_by: actorId,
      },
    });
  }

  if (jobType === "LAND") {
    await tx.landJobDetail.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        created_by: actorId,
        updated_by: actorId,
      },
    });
  }

  if (jobType === "ROAD_FREIGHT") {
    await tx.roadFreightJobDetail.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        created_by: actorId,
        updated_by: actorId,
      },
    });
  }

  if (jobType === "COURIER") {
    await tx.courierJobDetail.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        created_by: actorId,
        updated_by: actorId,
      },
    });
  }

  if (jobType === "NVOCC_EXPORT" || jobType === "NVOCC_IMPORT") {
    await tx.nvoccJobDetail.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        created_by: actorId,
        updated_by: actorId,
      },
    });
  }

  if (jobType === "CUSTOMS_CLEARANCE") {
    const detail = await tx.jobCustomsClearanceDetail.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        direction: CcDirection.IMPORT,
        cc_status: "ACCEPTED",
        created_by: actorId,
        updated_by: actorId,
      },
    });
    for (const item of CC_CHECKLIST_IMPORT) {
      await tx.ccDocumentChecklistItem.create({
        data: {
          tenant_id: tenantId,
          detail_id: detail.id,
          doc_code: item.doc_code,
          label: item.label,
          required: item.required,
          sort_order: item.sort_order,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    }
  }

  const milestoneNames =
    jobType === "AIR_EXPORT"
      ? AIR_EXPORT_MILESTONES
      : jobType === "AIR_IMPORT"
        ? AIR_IMPORT_MILESTONES
        : jobType === "SEA_FCL_EXPORT"
          ? SEA_FCL_EXPORT_MILESTONES
          : jobType === "SEA_FCL_IMPORT"
            ? SEA_FCL_IMPORT_MILESTONES
            : jobType === "SEA_LCL_EXPORT"
              ? SEA_LCL_EXPORT_MILESTONES
              : jobType === "SEA_LCL_IMPORT"
                ? SEA_LCL_IMPORT_MILESTONES
                : jobType === "LAND"
                  ? LAND_MILESTONES
                  : jobType === "ROAD_FREIGHT"
                    ? ROAD_FREIGHT_MILESTONES
                    : jobType === "COURIER"
                      ? COURIER_MILESTONES
                      : jobType === "NVOCC_EXPORT" || jobType === "NVOCC_IMPORT"
                        ? NVOCC_MILESTONES
                        : jobType === "CUSTOMS_CLEARANCE"
                          ? CC_MILESTONES
                          : null;

  if (milestoneNames?.length) {
    await tx.jobMilestone.createMany({
      data: milestoneNames.map((milestone) => ({
        tenant_id: tenantId,
        job_id: jobId,
        milestone,
        created_by: actorId,
        updated_by: actorId,
      })),
    });
  }

  if (jobType === "AIR_IMPORT") {
    await tx.jobMilestone.updateMany({
      where: {
        tenant_id: tenantId,
        job_id: jobId,
        milestone: AIR_IMPORT_CREATE_MILESTONE,
        deleted_at: null,
        actual_date: null,
      },
      data: {
        actual_date: new Date(),
        completed_by: actorId,
        updated_by: actorId,
      },
    });
  }

  if (jobType === "SEA_LCL_EXPORT" || jobType === "SEA_LCL_IMPORT") {
    const createMilestone =
      jobType === "SEA_LCL_EXPORT"
        ? SEA_LCL_EXPORT_CREATE_MILESTONE
        : SEA_LCL_IMPORT_CREATE_MILESTONE;
    await tx.jobMilestone.updateMany({
      where: {
        tenant_id: tenantId,
        job_id: jobId,
        milestone: createMilestone,
        deleted_at: null,
        actual_date: null,
      },
      data: {
        actual_date: new Date(),
        completed_by: actorId,
        updated_by: actorId,
      },
    });
  }

  if (jobType === "LAND" || jobType === "ROAD_FREIGHT" || jobType === "COURIER") {
    const createMilestone =
      jobType === "LAND"
        ? LAND_CREATE_MILESTONE
        : jobType === "ROAD_FREIGHT"
          ? ROAD_FREIGHT_CREATE_MILESTONE
          : COURIER_CREATE_MILESTONE;
    await tx.jobMilestone.updateMany({
      where: {
        tenant_id: tenantId,
        job_id: jobId,
        milestone: createMilestone,
        deleted_at: null,
        actual_date: null,
      },
      data: {
        actual_date: new Date(),
        completed_by: actorId,
        updated_by: actorId,
      },
    });
  }

  // Per-type booking forms (no unified JobBookingForm).
  if (jobType === "SEA_FCL_EXPORT" || jobType === "SEA_FCL_IMPORT") {
    await tx.seaFclBookingForm.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        service_scope: "PORT_TO_PORT",
        created_by: actorId,
        updated_by: actorId,
      },
    });
    await tx.job.updateMany({
      where: { id: jobId, service_scope: null },
      data: { service_scope: "PORT_TO_PORT" },
    });
  } else if (jobType === "SEA_LCL_EXPORT" || jobType === "SEA_LCL_IMPORT") {
    await tx.seaLclBookingForm.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        service_scope: "PORT_TO_PORT",
        created_by: actorId,
        updated_by: actorId,
      },
    });
    await tx.job.updateMany({
      where: { id: jobId, service_scope: null },
      data: { service_scope: "PORT_TO_PORT" },
    });
  } else if (jobType === "LAND") {
    await tx.landBookingForm.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        service_scope: "DOOR_TO_DOOR",
        created_by: actorId,
        updated_by: actorId,
      },
    });
    await tx.job.updateMany({
      where: { id: jobId, service_scope: null },
      data: { service_scope: "DOOR_TO_DOOR" },
    });
  } else if (jobType === "ROAD_FREIGHT") {
    await tx.roadFreightBookingForm.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        service_scope: "DOOR_TO_DOOR",
        created_by: actorId,
        updated_by: actorId,
      },
    });
    await tx.job.updateMany({
      where: { id: jobId, service_scope: null },
      data: { service_scope: "DOOR_TO_DOOR" },
    });
  } else if (jobType === "COURIER") {
    await tx.courierBookingForm.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        service_scope: "DOOR_TO_DOOR",
        created_by: actorId,
        updated_by: actorId,
      },
    });
    await tx.job.updateMany({
      where: { id: jobId, service_scope: null },
      data: { service_scope: "DOOR_TO_DOOR" },
    });
  } else if (jobType === "CUSTOMS_CLEARANCE") {
    await tx.customsClearanceBookingForm.create({
      data: {
        tenant_id: tenantId,
        job_id: jobId,
        service_scope: "PORT_TO_PORT",
        direction: CcDirection.IMPORT,
        created_by: actorId,
        updated_by: actorId,
      },
    });
    await tx.job.updateMany({
      where: { id: jobId, service_scope: null },
      data: { service_scope: "PORT_TO_PORT" },
    });
  } else if (
    jobType === "AIR_EXPORT" ||
    jobType === "AIR_IMPORT" ||
    jobType === "NVOCC_EXPORT" ||
    jobType === "NVOCC_IMPORT"
  ) {
    await tx.job.updateMany({
      where: { id: jobId, service_scope: null },
      data: { service_scope: "PORT_TO_PORT" },
    });
  }

  if (jobType === "NVOCC_EXPORT" || jobType === "NVOCC_IMPORT") {
    await tx.jobMilestone.updateMany({
      where: {
        tenant_id: tenantId,
        job_id: jobId,
        milestone: NVOCC_CREATE_MILESTONE,
        deleted_at: null,
        actual_date: null,
      },
      data: {
        actual_date: new Date(),
        completed_by: actorId,
        updated_by: actorId,
      },
    });
  }

  if (jobType === "CUSTOMS_CLEARANCE") {
    await tx.jobMilestone.updateMany({
      where: {
        tenant_id: tenantId,
        job_id: jobId,
        milestone: CC_CREATE_MILESTONE,
        deleted_at: null,
        actual_date: null,
      },
      data: {
        actual_date: new Date(),
        completed_by: actorId,
        updated_by: actorId,
      },
    });
  }
}
