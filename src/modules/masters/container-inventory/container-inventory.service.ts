import { Injectable } from "@nestjs/common";
import { ContainerStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";

export type ContainerInventoryQuery = {
  page?: number;
  limit?: number;
  status?: ContainerStatus;
  container_type_id?: string;
  q?: string;
};

@Injectable()
export class ContainerInventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: ContainerInventoryQuery) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.JobContainerWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
      };
      if (query.status) where.status = query.status;
      if (query.container_type_id) {
        where.container_type_id = query.container_type_id;
      }
      if (query.q?.trim()) {
        where.OR = [
          { container_number: { contains: query.q.trim(), mode: "insensitive" } },
          { seal_number: { contains: query.q.trim(), mode: "insensitive" } },
        ];
      }

      const [data, total] = await Promise.all([
        tx.jobContainer.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            free_days: true,
            sea_fcl_detail: {
              select: {
                id: true,
                job_id: true,
                voyage_number: true,
              },
            },
          },
        }),
        tx.jobContainer.count({ where }),
      ]);

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 0,
        },
      };
    });
  }
}
