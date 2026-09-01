import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { MasterQueryDto } from "./dto/master-query.dto";

export interface PaginatedMasterResult<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * Shared CRUD for tenant-scoped reference master data (Country,
 * Currency, Port, Airport, ContainerType, HsCode, ...). These entities
 * are structurally identical in every way that matters — flat fields,
 * soft delete, `is_active` toggle, tenant-unique natural keys — so one
 * generic implementation replaces 6 near-identical services.
 *
 * Not used for Party or Job: those have real relations and business
 * logic that don't fit this shape.
 */
@Injectable()
export abstract class BaseMasterService<T> {
  /** Prisma model delegate name, e.g. 'port', 'country'. */
  protected abstract readonly modelName: string;

  /** Fields matched (case-insensitive `contains`) by `search`. */
  protected abstract readonly searchFields: string[];

  /** Human-readable natural key, used only in the conflict error message. */
  protected abstract readonly uniqueKeyLabel: string;

  /** Set false for models with no `is_active` column (e.g. Holiday). */
  protected readonly supportsIsActive: boolean = true;

  constructor(protected readonly prisma: PrismaService) {}

  private delegate(tx: Prisma.TransactionClient) {
    return (tx as unknown as Record<string, any>)[this.modelName];
  }

  async create(
    tenantId: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<T> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      try {
        return await this.delegate(tx).create({
          data: {
            ...data,
            tenant_id: tenantId,
            created_by: actorId,
            updated_by: actorId,
          },
        });
      } catch (error: any) {
        if (error?.code === "P2002") {
          throw new ConflictException(
            `A record with this ${this.uniqueKeyLabel} already exists.`,
          );
        }
        throw error;
      }
    });
  }

  async findAll(
    tenantId: string,
    query: MasterQueryDto,
  ): Promise<PaginatedMasterResult<T>> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Record<string, unknown> = {
        tenant_id: tenantId,
        deleted_at: null,
      };

      if (query.is_active !== undefined && this.supportsIsActive) {
        where.is_active = query.is_active;
      }

      if (query.search && this.searchFields.length > 0) {
        where.OR = this.searchFields.map((field) => ({
          [field]: { contains: query.search, mode: "insensitive" },
        }));
      }

      const [data, total] = await Promise.all([
        this.delegate(tx).findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: query.order },
        }),
        this.delegate(tx).count({ where }),
      ]);

      return {
        data,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit) || 1,
        },
      };
    });
  }

  async findOne(tenantId: string, id: string): Promise<T> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const record = await this.delegate(tx).findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });

      if (!record) {
        throw new NotFoundException("Record not found.");
      }

      return record;
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: Record<string, unknown>,
    actorId?: string,
  ): Promise<T> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await this.delegate(tx).findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });

      if (!existing) {
        throw new NotFoundException("Record not found.");
      }

      try {
        return await this.delegate(tx).update({
          where: { id },
          data: { ...data, updated_by: actorId },
        });
      } catch (error: any) {
        if (error?.code === "P2002") {
          throw new ConflictException(
            `A record with this ${this.uniqueKeyLabel} already exists.`,
          );
        }
        throw error;
      }
    });
  }

  async softDelete(
    tenantId: string,
    id: string,
    actorId?: string,
  ): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await this.delegate(tx).findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      });

      if (!existing) {
        throw new NotFoundException("Record not found.");
      }

      await this.delegate(tx).update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }
}
