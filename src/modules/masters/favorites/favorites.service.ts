import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { CreateUserFavoriteDto } from "../dto/user-favorite.dto";
import { MasterQueryDto } from "../dto/master-query.dto";

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, userId: string, query: MasterQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where = {
        tenant_id: tenantId,
        user_id: userId,
        deleted_at: null,
        ...(query.search
          ? {
              OR: [
                { label: { contains: query.search, mode: "insensitive" as const } },
                {
                  entity_type: {
                    contains: query.search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
      };
      const [data, total] = await Promise.all([
        tx.userFavorite.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: "desc" },
        }),
        tx.userFavorite.count({ where }),
      ]);
      return {
        data,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit) || 0,
        },
      };
    });
  }

  async create(
    tenantId: string,
    userId: string,
    dto: CreateUserFavoriteDto,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      try {
        return await tx.userFavorite.create({
          data: {
            tenant_id: tenantId,
            user_id: userId,
            entity_type: dto.entity_type,
            entity_id: dto.entity_id,
            label: dto.label,
            created_by: userId,
            updated_by: userId,
          },
        });
      } catch (error: any) {
        if (error?.code === "P2002") {
          throw new ConflictException("Favorite already exists.");
        }
        throw error;
      }
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.userFavorite.findFirst({
        where: {
          id,
          tenant_id: tenantId,
          user_id: userId,
          deleted_at: null,
        },
      });
      if (!existing) throw new NotFoundException("Favorite not found");
      await tx.userFavorite.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: userId },
      });
    });
  }
}
