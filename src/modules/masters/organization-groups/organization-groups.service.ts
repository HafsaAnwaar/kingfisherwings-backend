import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { MasterQueryDto } from "../dto/master-query.dto";
import {
  CreateOrganizationGroupDto,
  UpdateOrganizationGroupDto,
} from "../dto/organization-group.dto";

@Injectable()
export class OrganizationGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapGroup(group: {
    id: string;
    tenant_id: string;
    code: string;
    name: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    created_by: string | null;
    updated_by: string | null;
    deleted_at: Date | null;
    members: { company_id: string }[];
  }) {
    return {
      ...group,
      company_ids: group.members.map((m) => m.company_id),
      members: undefined,
    };
  }

  async findAll(tenantId: string, query: MasterQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Record<string, unknown> = {
        tenant_id: tenantId,
        deleted_at: null,
      };
      if (query.is_active !== undefined) where.is_active = query.is_active;
      if (query.search) {
        where.OR = [
          { code: { contains: query.search, mode: "insensitive" } },
          { name: { contains: query.search, mode: "insensitive" } },
        ];
      }
      const [rows, total] = await Promise.all([
        tx.organizationGroup.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: "desc" },
          include: { members: { select: { company_id: true } } },
        }),
        tx.organizationGroup.count({ where }),
      ]);
      return {
        data: rows.map((r) => this.mapGroup(r)),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit) || 0,
        },
      };
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await tx.organizationGroup.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: { members: { select: { company_id: true } } },
      });
      if (!row) throw new NotFoundException("Organization group not found");
      return this.mapGroup(row);
    });
  }

  async create(
    tenantId: string,
    dto: CreateOrganizationGroupDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      try {
        const created = await tx.organizationGroup.create({
          data: {
            tenant_id: tenantId,
            code: dto.code,
            name: dto.name,
            is_active: dto.is_active ?? true,
            created_by: actorId,
            updated_by: actorId,
            members: dto.company_ids?.length
              ? {
                  create: dto.company_ids.map((company_id) => ({
                    tenant_id: tenantId,
                    company_id,
                  })),
                }
              : undefined,
          },
          include: { members: { select: { company_id: true } } },
        });
        return this.mapGroup(created);
      } catch (error: any) {
        if (error?.code === "P2002") {
          throw new ConflictException(
            "A record with this code already exists.",
          );
        }
        throw error;
      }
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateOrganizationGroupDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.organizationGroup.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });
      if (!existing) throw new NotFoundException("Organization group not found");

      try {
        if (dto.company_ids) {
          await tx.organizationGroupMember.deleteMany({
            where: { tenant_id: tenantId, group_id: id },
          });
          if (dto.company_ids.length) {
            await tx.organizationGroupMember.createMany({
              data: dto.company_ids.map((company_id) => ({
                tenant_id: tenantId,
                group_id: id,
                company_id,
              })),
            });
          }
        }

        const updated = await tx.organizationGroup.update({
          where: { id },
          data: {
            ...(dto.code !== undefined ? { code: dto.code } : {}),
            ...(dto.name !== undefined ? { name: dto.name } : {}),
            ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
            updated_by: actorId,
          },
          include: { members: { select: { company_id: true } } },
        });
        return this.mapGroup(updated);
      } catch (error: any) {
        if (error?.code === "P2002") {
          throw new ConflictException(
            "A record with this code already exists.",
          );
        }
        throw error;
      }
    });
  }

  async softDelete(tenantId: string, id: string, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.organizationGroup.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });
      if (!existing) throw new NotFoundException("Organization group not found");
      await tx.organizationGroup.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }
}
