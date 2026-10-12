import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PutJobGpumDto } from "./dto/job-gpum.dto";

@Injectable()
export class JobGpumService {
  constructor(private readonly prisma: PrismaService) {}

  async get(tenantId: string, jobId: string) {
    await this.assertJob(tenantId, jobId);
    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.jobGpumAllocation.findMany({
        where: { tenant_id: tenantId, job_id: jobId },
        orderBy: { created_at: "asc" },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      }),
    );
    const total = rows.reduce((s, r) => s + Number(r.gp_percent), 0);
    return {
      success: true,
      data: {
        allocations: rows.map((r) => ({
          user_id: r.user_id,
          employee_name: `${r.user.first_name} ${r.user.last_name}`.trim(),
          gp_percent: Number(r.gp_percent),
        })),
        total_gp_percent: Math.round(total * 10000) / 10000,
      },
    };
  }

  async put(tenantId: string, jobId: string, dto: PutJobGpumDto, actorId?: string) {
    await this.assertJob(tenantId, jobId);
    const total = dto.allocations.reduce((s, a) => s + a.gp_percent, 0);
    if (Math.abs(total - 100) > 0.0001) {
      throw new BadRequestException(
        `Total GP percent must equal 100 (got ${total}).`,
      );
    }

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.jobGpumAllocation.deleteMany({
        where: { tenant_id: tenantId, job_id: jobId },
      });
      for (const line of dto.allocations) {
        const user = await tx.user.findFirst({
          where: { id: line.user_id, tenant_id: tenantId, deleted_at: null },
        });
        if (!user) {
          throw new NotFoundException(`User ${line.user_id} not found.`);
        }
        await tx.jobGpumAllocation.create({
          data: {
            tenant_id: tenantId,
            job_id: jobId,
            user_id: line.user_id,
            gp_percent: line.gp_percent,
            created_by: actorId,
            updated_by: actorId,
          },
        });
      }
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: actorId ?? null,
          action: "JOB_GPUM_UPDATE",
          entity: "JOB",
          entity_id: jobId,
          metadata: {
            allocations: dto.allocations,
          } as unknown as Prisma.InputJsonValue,
        },
      });
      return this.get(tenantId, jobId);
    });
  }

  private async assertJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");
    return job;
  }
}
