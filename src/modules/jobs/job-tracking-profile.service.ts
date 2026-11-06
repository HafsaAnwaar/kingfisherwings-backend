import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { UpsertJobTrackingProfileDto } from "./dto/job-tracking-profile.dto";

@Injectable()
export class JobTrackingProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(tenantId: string, jobId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertJob(tx, tenantId, jobId);
      let row = await tx.jobTrackingProfile.findFirst({
        where: { tenant_id: tenantId, job_id: jobId },
      });
      if (!row) {
        row = await tx.jobTrackingProfile.create({
          data: { tenant_id: tenantId, job_id: jobId },
        });
      }
      return { success: true, data: row };
    });
  }

  async upsert(
    tenantId: string,
    jobId: string,
    dto: UpsertJobTrackingProfileDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertJob(tx, tenantId, jobId);
      const data: Prisma.JobTrackingProfileUncheckedUpdateInput = {
        updated_by: actorId,
        ...(dto.origin_label !== undefined
          ? { origin_label: dto.origin_label }
          : {}),
        ...(dto.dest_label !== undefined ? { dest_label: dto.dest_label } : {}),
        ...(dto.at_before !== undefined
          ? {
              at_before: dto.at_before ? new Date(dto.at_before) : null,
            }
          : {}),
        ...(dto.terminal_cutoff_at !== undefined
          ? {
              terminal_cutoff_at: dto.terminal_cutoff_at
                ? new Date(dto.terminal_cutoff_at)
                : null,
            }
          : {}),
        ...(dto.legs !== undefined
          ? { legs: dto.legs as unknown as Prisma.InputJsonValue }
          : {}),
        ...(dto.port_of_call !== undefined
          ? { port_of_call: dto.port_of_call as unknown as Prisma.InputJsonValue }
          : {}),
        ...(dto.container_events !== undefined
          ? {
              container_events:
                dto.container_events as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.arrival_report !== undefined
          ? {
              arrival_report:
                dto.arrival_report as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.customs_status !== undefined
          ? {
              customs_status:
                dto.customs_status as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.detailed_data !== undefined
          ? {
              detailed_data:
                dto.detailed_data as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.pre_manifest !== undefined
          ? {
              pre_manifest: dto.pre_manifest as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.qty_gw_vol !== undefined
          ? { qty_gw_vol: dto.qty_gw_vol as unknown as Prisma.InputJsonValue }
          : {}),
      };

      const row = await tx.jobTrackingProfile.upsert({
        where: { job_id: jobId },
        create: {
          tenant_id: tenantId,
          job_id: jobId,
          origin_label: dto.origin_label ?? null,
          dest_label: dto.dest_label ?? null,
          at_before: dto.at_before ? new Date(dto.at_before) : null,
          terminal_cutoff_at: dto.terminal_cutoff_at
            ? new Date(dto.terminal_cutoff_at)
            : null,
          legs: (dto.legs ?? []) as unknown as Prisma.InputJsonValue,
          port_of_call: (dto.port_of_call ??
            []) as unknown as Prisma.InputJsonValue,
          container_events: (dto.container_events ??
            []) as unknown as Prisma.InputJsonValue,
          arrival_report: (dto.arrival_report ??
            []) as unknown as Prisma.InputJsonValue,
          customs_status: (dto.customs_status ??
            []) as unknown as Prisma.InputJsonValue,
          detailed_data: (dto.detailed_data ??
            {}) as unknown as Prisma.InputJsonValue,
          pre_manifest: (dto.pre_manifest ??
            []) as unknown as Prisma.InputJsonValue,
          qty_gw_vol: (dto.qty_gw_vol ?? {}) as unknown as Prisma.InputJsonValue,
          updated_by: actorId,
        },
        update: data,
      });
      return { success: true, data: row };
    });
  }

  private async assertJob(
    tx: Prisma.TransactionClient,
    tenantId: string,
    jobId: string,
  ) {
    const job = await tx.job.findFirst({
      where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      select: { id: true },
    });
    if (!job) throw new NotFoundException("Job not found.");
  }
}
