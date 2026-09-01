import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CourierLabelFormat,
  CourierServiceType,
  JobType,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { COURIER_SCAN_CHECKPOINTS } from "./constants/courier-milestones";
import {
  ConfirmCourierBookingDto,
  CreateCourierPodDto,
  LinkCourierJobDto,
  ScanCourierCheckpointDto,
  UpdateCourierJobDetailDto,
} from "./dto/courier-job-detail.dto";

@Injectable()
export class CourierService {
  constructor(private readonly prisma: PrismaService) {}

  async updateDetails(
    tenantId: string,
    jobId: string,
    dto: UpdateCourierJobDetailDto,
    actorId?: string,
  ) {
    if (dto.courier_vendor_id) {
      await this.assertVendor(tenantId, dto.courier_vendor_id);
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getCourierDetailOrThrow(tx, tenantId, jobId);

      if (dto.linked_export_job_id) {
        await this.assertLinkedJob(
          tx,
          tenantId,
          jobId,
          dto.linked_export_job_id,
          "COURIER",
        );
      }
      if (dto.linked_import_job_id) {
        await this.assertLinkedJob(
          tx,
          tenantId,
          jobId,
          dto.linked_import_job_id,
          "COURIER",
        );
      }

      const { service_type, label_format, ...rest } = dto;
      return tx.courierJobDetail.update({
        where: { job_id: jobId },
        data: {
          ...rest,
          ...(service_type !== undefined
            ? { service_type: service_type as CourierServiceType }
            : {}),
          ...(label_format !== undefined
            ? { label_format: label_format as CourierLabelFormat }
            : {}),
          updated_by: actorId,
        },
      });
    });
  }

  async confirmBooking(
    tenantId: string,
    jobId: string,
    dto: ConfirmCourierBookingDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getCourierDetailOrThrow(tx, tenantId, jobId);
      const tracking =
        dto.tracking_number?.trim() ||
        detail.tracking_number ||
        `CR${Date.now().toString(36).toUpperCase()}${jobId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

      const updated = await tx.courierJobDetail.update({
        where: { job_id: jobId },
        data: {
          tracking_number: tracking,
          barcode_value: tracking,
          ...(dto.service_type !== undefined
            ? { service_type: dto.service_type as CourierServiceType }
            : {}),
          ...(dto.label_format !== undefined
            ? { label_format: dto.label_format as CourierLabelFormat }
            : {}),
          updated_by: actorId,
        },
      });

      await this.markMilestoneIfPresent(
        tx,
        tenantId,
        jobId,
        "BOOKING_CREATED",
        new Date(),
        actorId,
      );
      return updated;
    });
  }

  async listCheckpoints(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getCourierDetailOrThrow(tx, tenantId, jobId);
      return tx.courierDeliveryCheckpoint.findMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        orderBy: { scanned_at: "asc" },
      });
    });
  }

  async scanCheckpoint(
    tenantId: string,
    jobId: string,
    dto: ScanCourierCheckpointDto,
    actorId?: string,
  ) {
    if (!COURIER_SCAN_CHECKPOINTS.includes(dto.checkpoint)) {
      throw new BadRequestException(
        `Invalid courier checkpoint ${dto.checkpoint}.`,
      );
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const detail = await this.getCourierDetailOrThrow(tx, tenantId, jobId);
      if (
        dto.barcode_scanned &&
        detail.barcode_value &&
        dto.barcode_scanned !== detail.barcode_value
      ) {
        throw new BadRequestException(
          "Scanned barcode does not match this courier job.",
        );
      }

      const scannedAt = dto.scanned_at ? new Date(dto.scanned_at) : new Date();
      const row = await tx.courierDeliveryCheckpoint.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          checkpoint: dto.checkpoint,
          scanned_at: scannedAt,
          barcode_scanned: dto.barcode_scanned ?? detail.barcode_value,
          location: dto.location,
          notes: dto.notes,
          scanned_by: actorId,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      await this.markMilestoneIfPresent(
        tx,
        tenantId,
        jobId,
        dto.checkpoint,
        scannedAt,
        actorId,
      );
      return row;
    });
  }

  async linkExport(
    tenantId: string,
    jobId: string,
    dto: LinkCourierJobDto,
    actorId?: string,
  ) {
    return this.updateDetails(
      tenantId,
      jobId,
      { linked_export_job_id: dto.linked_job_id },
      actorId,
    );
  }

  async linkImport(
    tenantId: string,
    jobId: string,
    dto: LinkCourierJobDto,
    actorId?: string,
  ) {
    return this.updateDetails(
      tenantId,
      jobId,
      { linked_import_job_id: dto.linked_job_id },
      actorId,
    );
  }

  async createPod(
    tenantId: string,
    jobId: string,
    dto: CreateCourierPodDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.getCourierDetailOrThrow(tx, tenantId, jobId);
      const deliveryDate = new Date(dto.actual_delivery_date);

      const pod = await tx.proofOfDelivery.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          actual_delivery_date: deliveryDate,
          delivered_by: dto.delivered_by,
          received_by: dto.received_by,
          signature_image_path: dto.signature_image_path,
          remarks: dto.remarks,
          created_by: actorId,
          updated_by: actorId,
        },
      });

      await this.markMilestoneIfPresent(
        tx,
        tenantId,
        jobId,
        "DELIVERED",
        deliveryDate,
        actorId,
      );
      await this.markMilestoneIfPresent(
        tx,
        tenantId,
        jobId,
        "POD_RECEIVED",
        deliveryDate,
        actorId,
      );
      return pod;
    });
  }

  private async assertVendor(tenantId: string, vendorId: string) {
    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.courierVendor.findFirst({
        where: { id: vendorId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!exists) throw new NotFoundException("Courier vendor not found.");
  }

  private async assertLinkedJob(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
    linkedId: string,
    jobType: JobType,
  ) {
    if (linkedId === jobId)
      throw new BadRequestException("Cannot link a job to itself.");
    const linked = await tx.job.findFirst({
      where: {
        id: linkedId,
        tenant_id: tenantId,
        deleted_at: null,
        job_type: jobType,
      },
    });
    if (!linked) throw new NotFoundException("Linked courier job not found.");
  }

  private async getCourierDetailOrThrow(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
  ) {
    const job = await tx.job.findFirst({
      where: { id: jobId, tenant_id: tenantId, deleted_at: null },
    });
    if (!job) throw new NotFoundException("Job not found.");
    if (job.job_type !== ("COURIER" as JobType)) {
      throw new BadRequestException("This endpoint requires a COURIER job.");
    }
    const detail = await tx.courierJobDetail.findFirst({
      where: { job_id: jobId, tenant_id: tenantId, deleted_at: null },
    });
    if (!detail)
      throw new NotFoundException(
        "Courier job details not found for this job.",
      );
    return detail;
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
      },
    });
    if (!milestone || milestone.actual_date) return;
    await tx.jobMilestone.update({
      where: { id: milestone.id },
      data: {
        actual_date: actualDate,
        completed_by: actorId,
        updated_by: actorId,
      },
    });
  }
}
