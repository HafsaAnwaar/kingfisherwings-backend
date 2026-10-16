import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateFavouriteDto,
  FavouriteCheckQueryDto,
  FavouriteQueryDto,
  ToggleFavouriteDto,
  entityFavouriteTargetKey,
} from "./dto/favourite.dto";

@Injectable()
export class FavouritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, userId: string, query: FavouriteQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where: Prisma.UserFavouriteWhereInput = {
      tenant_id: tenantId,
      user_id: userId,
      ...(query.kind ? { kind: query.kind.trim().toLowerCase() } : {}),
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
      const [canonical, totalCanonical] = await Promise.all([
        tx.userFavourite.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        tx.userFavourite.count({ where }),
      ]);

      // One-release dual-read: merge legacy UserFavorite rows not yet in UserFavourite.
      const legacy = await tx.userFavorite.findMany({
        where: {
          tenant_id: tenantId,
          user_id: userId,
          deleted_at: null,
          ...(query.kind
            ? { entity_type: { equals: query.kind, mode: "insensitive" } }
            : {}),
          ...(query.search
            ? {
                OR: [
                  { label: { contains: query.search, mode: "insensitive" } },
                  {
                    entity_type: {
                      contains: query.search,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: { created_at: "desc" },
        take: limit,
      });

      const seen = new Set(
        canonical.map((c) => `${c.kind}:${c.target_key}`.toLowerCase()),
      );
      const mergedLegacy = legacy
        .map((row) => {
          const kind = row.entity_type.toLowerCase();
          const target_key = entityFavouriteTargetKey(kind, row.entity_id);
          return {
            id: row.id,
            tenant_id: row.tenant_id,
            user_id: row.user_id,
            kind,
            target_key,
            label: row.label,
            created_at: row.created_at,
            _legacy: true as const,
          };
        })
        .filter((r) => !seen.has(`${r.kind}:${r.target_key}`.toLowerCase()));

      const data = [...canonical, ...mergedLegacy].slice(0, limit);
      const total = totalCanonical + mergedLegacy.length;

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
            kind: dto.kind.trim().toLowerCase(),
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

  async toggle(tenantId: string, userId: string, dto: ToggleFavouriteDto) {
    const kind = dto.kind.trim().toLowerCase();
    const targetKey = dto.target_key.trim();
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.userFavourite.findFirst({
        where: {
          tenant_id: tenantId,
          user_id: userId,
          kind,
          target_key: targetKey,
        },
      });
      if (existing) {
        await tx.userFavourite.delete({ where: { id: existing.id } });
        return {
          success: true,
          favourited: false,
          data: null,
        };
      }
      const row = await tx.userFavourite.create({
        data: {
          tenant_id: tenantId,
          user_id: userId,
          kind,
          target_key: targetKey,
          label: dto.label?.trim() || null,
        },
      });
      return { success: true, favourited: true, data: row };
    });
  }

  async check(
    tenantId: string,
    userId: string,
    query: FavouriteCheckQueryDto,
  ) {
    const kind = query.kind.trim().toLowerCase();
    const targetKey = query.target_key.trim();
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.userFavourite.findFirst({
        where: {
          tenant_id: tenantId,
          user_id: userId,
          kind,
          target_key: targetKey,
        },
        select: { id: true },
      }),
    );
    if (row) {
      return { success: true, favourited: true, id: row.id };
    }

    // Legacy UserFavorite check for entity-shaped keys
    const colon = targetKey.indexOf(":");
    if (colon > 0) {
      const entityId = targetKey.slice(colon + 1);
      const legacy = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.userFavorite.findFirst({
          where: {
            tenant_id: tenantId,
            user_id: userId,
            deleted_at: null,
            entity_type: { equals: kind, mode: "insensitive" },
            entity_id: entityId,
          },
          select: { id: true },
        }),
      );
      if (legacy) {
        return { success: true, favourited: true, id: legacy.id, legacy: true };
      }
    }

    return { success: true, favourited: false, id: null };
  }

  async remove(tenantId: string, userId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.userFavourite.findFirst({
        where: { id, tenant_id: tenantId, user_id: userId },
      });
      if (existing) {
        await tx.userFavourite.delete({ where: { id } });
        return { success: true, message: "Favourite removed." };
      }
      // Compat: allow deleting legacy UserFavorite id
      const legacy = await tx.userFavorite.findFirst({
        where: {
          id,
          tenant_id: tenantId,
          user_id: userId,
          deleted_at: null,
        },
      });
      if (!legacy) throw new NotFoundException("Favourite not found.");
      await tx.userFavorite.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: userId },
      });
      return { success: true, message: "Favourite removed." };
    });
  }

  /** Compat helper for masters/favorites proxy */
  async createFromEntity(
    tenantId: string,
    userId: string,
    entityType: string,
    entityId: string,
    label?: string,
  ) {
    const raw = entityType.trim().toLowerCase();
    const allowed = new Set([
      "enquiry",
      "quotation",
      "shipment",
      "job",
      "report_template",
      "report",
      "menu",
      "party",
      "other",
    ]);
    const kind = (allowed.has(raw) ? raw : "other") as CreateFavouriteDto["kind"];
    return this.create(tenantId, userId, {
      kind,
      target_key: entityFavouriteTargetKey(raw, entityId),
      label,
    });
  }
}
