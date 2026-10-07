import { BadRequestException, Injectable } from "@nestjs/common";
import { JobType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * True when the job's mode/compliance booking form is marked complete.
 * Used to gate quotation → CONVERTED until the customer submits the form.
 */
@Injectable()
export class BookingFormGateService {
  constructor(private readonly prisma: PrismaService) {}

  async isComplete(
    tenantId: string,
    jobId: string,
    jobType: JobType,
  ): Promise<{ complete: boolean; formKind: string }> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const check = async (
        kind: string,
        finder: () => Promise<{ is_complete: boolean } | null>,
      ) => {
        const form = await finder();
        return { complete: !!form?.is_complete, formKind: kind };
      };

      if (jobType === "AIR_EXPORT" || jobType === "AIR_IMPORT") {
        return check("air_compliance", () =>
          tx.airComplianceBookingForm.findFirst({
            where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
            select: { is_complete: true },
          }),
        );
      }
      if (jobType === "SEA_FCL_EXPORT" || jobType === "SEA_FCL_IMPORT") {
        return check("sea_fcl", () =>
          tx.seaFclBookingForm.findFirst({
            where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
            select: { is_complete: true },
          }),
        );
      }
      if (jobType === "SEA_LCL_EXPORT" || jobType === "SEA_LCL_IMPORT") {
        return check("sea_lcl", () =>
          tx.seaLclBookingForm.findFirst({
            where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
            select: { is_complete: true },
          }),
        );
      }
      if (jobType === "LAND") {
        return check("land", () =>
          tx.landBookingForm.findFirst({
            where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
            select: { is_complete: true },
          }),
        );
      }
      if (jobType === "ROAD_FREIGHT") {
        return check("road_freight", () =>
          tx.roadFreightBookingForm.findFirst({
            where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
            select: { is_complete: true },
          }),
        );
      }
      if (jobType === "COURIER") {
        return check("courier", () =>
          tx.courierBookingForm.findFirst({
            where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
            select: { is_complete: true },
          }),
        );
      }
      if (jobType === "CUSTOMS_CLEARANCE") {
        return check("customs_clearance", () =>
          tx.customsClearanceBookingForm.findFirst({
            where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
            select: { is_complete: true },
          }),
        );
      }
      if (jobType === "WAREHOUSE") {
        return check("warehouse", () =>
          tx.warehouseBookingForm.findFirst({
            where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
            select: { is_complete: true },
          }),
        );
      }
      if (jobType === "NVOCC_EXPORT" || jobType === "NVOCC_IMPORT") {
        // Prefer job-linked NVOCC booking form via booking on the job detail.
        const detail = await tx.nvoccJobDetail.findFirst({
          where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
          select: { booking_id: true },
        });
        if (detail?.booking_id) {
          return check("nvocc_compliance", () =>
            tx.nvoccBookingForm.findFirst({
              where: {
                booking_id: detail.booking_id!,
                tenant_id: tenantId,
                deleted_at: null,
              },
              select: { is_complete: true },
            }),
          );
        }
        // No booking linked yet — treat as incomplete.
        return { complete: false, formKind: "nvocc_compliance" };
      }

      // Unknown / no dedicated form — allow conversion.
      return { complete: true, formKind: "none" };
    });
  }

  assertComplete(result: { complete: boolean; formKind: string }) {
    if (!result.complete) {
      throw new BadRequestException(
        `Booking form must be submitted before converting the quotation to a job (${result.formKind}).`,
      );
    }
  }
}
