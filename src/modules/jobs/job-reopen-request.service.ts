import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobReopenRequestStatus, JobStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import { DEFAULT_REOPEN_STATUS } from "./constants/job-status-catalog.defaults";
import {
  CreateJobReopenRequestDto,
  ListJobReopenRequestsQueryDto,
  ReviewJobReopenRequestDto,
} from "./dto/job-reopen-request.dto";
import { JobDetailService } from "./job-detail.service";
import {
  assertTenantAdmin,
  isJobClosed,
} from "./utils/job-mutability.util";

@Injectable()
export class JobReopenRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly detail: JobDetailService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  async create(
    tenantId: string,
    jobId: string,
    dto: CreateJobReopenRequestDto,
    actor: { userId: string; role?: string | null },
  ) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: { id: true, job_number: true, status: true },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    if (
      !isJobClosed(job.status) &&
      job.status !== JobStatus.COMPLETED &&
      job.status !== JobStatus.CANCELLED &&
      job.status !== JobStatus.DELIVERED
    ) {
      throw new BadRequestException(
        "Reopen requests apply to Closed, Completed, Cancelled, or Delivered jobs.",
      );
    }

    const pending = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobReopenRequest.findFirst({
        where: {
          tenant_id: tenantId,
          job_id: jobId,
          status: JobReopenRequestStatus.PENDING,
        },
      }),
    );
    if (pending) {
      throw new BadRequestException(
        "A pending reopen request already exists for this job.",
      );
    }

    const target =
      dto.target_status ?? (DEFAULT_REOPEN_STATUS as JobStatus);

    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobReopenRequest.create({
        data: {
          tenant_id: tenantId,
          job_id: jobId,
          requested_by: actor.userId,
          reason: dto.reason.trim(),
          target_status: target,
          status: JobReopenRequestStatus.PENDING,
        },
      }),
    );

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actor.userId,
          action: "JOB_REOPEN_REQUESTED",
          entity: "JOB",
          entity_id: jobId,
          metadata: {
            request_id: row.id,
            reason: dto.reason,
            target_status: target,
          } as Prisma.InputJsonValue,
        },
      }),
    );

    const admins = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.user.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          role: "TENANT_ADMIN",
          status: { in: ["ACTIVE", "INVITED"] },
        },
        select: { id: true },
      }),
    );
    for (const admin of admins) {
      void this.notifications.notifyStaffUser(tenantId, admin.id, {
        type: "JOB_MILESTONE_UPDATED",
        title: `Reopen requested: ${job.job_number}`,
        message: dto.reason.trim().slice(0, 500),
        entity_type: "job",
        entity_id: jobId,
        link_path: `/jobs/${jobId}`,
      });
    }

    return { success: true, data: row };
  }

  async list(
    tenantId: string,
    query: ListJobReopenRequestsQueryDto,
    role?: string | null,
  ) {
    assertTenantAdmin(role);
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 50));
    const where: Prisma.JobReopenRequestWhereInput = {
      tenant_id: tenantId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.job_id ? { job_id: query.job_id } : {}),
    };

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const [rows, total] = await Promise.all([
        tx.jobReopenRequest.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            job: {
              select: {
                id: true,
                job_number: true,
                status: true,
                job_type: true,
              },
            },
          },
        }),
        tx.jobReopenRequest.count({ where }),
      ]);
      return {
        success: true,
        data: rows,
        meta: { page, limit, total },
      };
    });
  }

  async approve(
    tenantId: string,
    requestId: string,
    dto: ReviewJobReopenRequestDto,
    actor: { userId: string; role?: string | null },
  ) {
    assertTenantAdmin(actor.role);
    const req = await this.requirePending(tenantId, requestId);

    await this.detail.reopen(
      tenantId,
      req.job_id,
      { status: req.target_status, reason: dto.notes ?? undefined },
      actor.userId,
    );

    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobReopenRequest.update({
        where: { id: requestId },
        data: {
          status: JobReopenRequestStatus.APPROVED,
          reviewed_by: actor.userId,
          review_notes: dto.notes?.trim() || null,
          reviewed_at: new Date(),
        },
      }),
    );

    void this.notifications.notifyStaffUser(tenantId, req.requested_by, {
      type: "JOB_MILESTONE_UPDATED",
      title: "Reopen request approved",
      message:
        dto.notes?.trim() ||
        `Your reopen request for job ${req.job_id} was approved.`,
      entity_type: "job",
      entity_id: req.job_id,
      link_path: `/jobs/${req.job_id}`,
    });

    return { success: true, data: updated };
  }

  async reject(
    tenantId: string,
    requestId: string,
    dto: ReviewJobReopenRequestDto,
    actor: { userId: string; role?: string | null },
  ) {
    assertTenantAdmin(actor.role);
    const reason = dto.reason?.trim() || dto.notes?.trim();
    if (!reason || reason.length < 3) {
      throw new BadRequestException("Reject reason is required.");
    }
    const req = await this.requirePending(tenantId, requestId);

    const updated = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobReopenRequest.update({
        where: { id: requestId },
        data: {
          status: JobReopenRequestStatus.REJECTED,
          reviewed_by: actor.userId,
          review_notes: reason,
          reviewed_at: new Date(),
        },
      }),
    );

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actor.userId,
          action: "JOB_REOPEN_REJECTED",
          entity: "JOB",
          entity_id: req.job_id,
          metadata: {
            request_id: requestId,
            reason,
          } as Prisma.InputJsonValue,
        },
      }),
    );

    void this.notifications.notifyStaffUser(tenantId, req.requested_by, {
      type: "JOB_MILESTONE_UPDATED",
      title: "Reopen request rejected",
      message: reason,
      entity_type: "job",
      entity_id: req.job_id,
      link_path: `/jobs/${req.job_id}`,
    });

    return { success: true, data: updated };
  }

  private async requirePending(tenantId: string, requestId: string) {
    const req = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobReopenRequest.findFirst({
        where: { id: requestId, tenant_id: tenantId },
      }),
    );
    if (!req) throw new NotFoundException("Reopen request not found.");
    if (req.status !== JobReopenRequestStatus.PENDING) {
      throw new BadRequestException(
        `Request is already ${req.status.toLowerCase()}.`,
      );
    }
    return req;
  }
}
