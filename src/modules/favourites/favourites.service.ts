import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateFavouriteDto, FavouriteQueryDto } from "./dto/favourite.dto";

@Injectable()
export class FavouritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, userId: string, query: FavouriteQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where: Prisma.UserFavouriteWhereInput = {
      tenant_id: tenantId,
      user_id: userId,
      ...(query.kind ? { kind: query.kind } : {}),
      ...(query.search
        ? {
            OR: [
              { label: { contains: query.search, mode: "insensitive" } },
              { target_key: { contains: query.search, mode: "insensitive" } },
              { kind: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const [data, total] = await Promise.all([
        tx.userFavourite.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        tx.userFavourite.count({ where }),
      ]);
      return {
        success: true,
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    });
  }

  async create(tenantId: string, userId: string, dto: CreateFavouriteDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      try {
        const row = await tx.userFavourite.create({
          data: {
            tenant_id: tenantId,
            user_id: userId,
            kind: dto.kind.trim(),
            target_key: dto.target_key.trim(),
            label: dto.label?.trim() || null,
          },
        });
        return { success: true, data: row };
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === "P2002"
        ) {
          throw new ConflictException("Favourite already exists.");
        }
        throw error;
      }
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.userFavourite.findFirst({
        where: { id, tenant_id: tenantId, user_id: userId },
      });
      if (!existing) throw new NotFoundException("Favourite not found.");
      await tx.userFavourite.delete({ where: { id } });
      return { success: true, message: "Favourite removed." };
    });
  }
}
