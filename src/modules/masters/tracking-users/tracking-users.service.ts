import { Injectable } from "@nestjs/common";
import { Prisma, UserStatus } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";

export type TrackingUsersQuery = {
  page?: number;
  limit?: number;
  q?: string;
};

@Injectable()
export class TrackingUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: TrackingUsersQuery) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.UserWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        status: UserStatus.ACTIVE,
        OR: [
          { is_operations: true },
          { is_cs_rep: true },
          { is_salesperson: true },
        ],
      };
      if (query.q?.trim()) {
        const q = query.q.trim();
        where.AND = [
          {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { first_name: { contains: q, mode: "insensitive" } },
              { last_name: { contains: q, mode: "insensitive" } },
            ],
          },
        ];
      }

      const [data, total] = await Promise.all([
        tx.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            phone: true,
            role: true,
            status: true,
            is_salesperson: true,
            is_cs_rep: true,
            is_operations: true,
            is_finance: true,
            branch_id: true,
            department_id: true,
          },
        }),
        tx.user.count({ where }),
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
