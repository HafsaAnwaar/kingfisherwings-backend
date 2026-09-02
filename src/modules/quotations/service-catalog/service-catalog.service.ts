import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JobType, Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import {
  CreateServiceCatalogItemDto,
  ServiceCatalogQueryDto,
  UpdateServiceCatalogItemDto,
} from "./service-catalog.dto";

@Injectable()
export class ServiceCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: ServiceCatalogQueryDto) {
    const where: Prisma.TenantServiceCatalogItemWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
    };
    if (query.portal_visible !== undefined) {
      where.is_portal_visible = query.portal_visible;
    }
    if (query.active_only !== false) {
      where.is_active = true;
    }
    if (query.job_type) {
      where.OR = [{ job_type: null }, { job_type: query.job_type }];
    }

    const [rows, total] = await this.prisma.runWithTenant(tenantId, (tx) =>
      Promise.all([
        tx.tenantServiceCatalogItem.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: [{ sort_order: "asc" }, { name: "asc" }],
        }),
        tx.tenantServiceCatalogItem.count({ where }),
      ]),
    );

    return {
      success: true,
      data: rows,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async findPortalVisible(tenantId: string, jobType?: JobType) {
    const where: Prisma.TenantServiceCatalogItemWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      is_active: true,
      is_portal_visible: true,
    };
    if (jobType) {
      where.OR = [{ job_type: null }, { job_type: jobType }];
    }

    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantServiceCatalogItem.findMany({
        where,
        orderBy: [{ sort_order: "asc" }, { name: "asc" }],
        select: {
          id: true,
          code: true,
          name: true,
          job_type: true,
          pricing_basis: true,
          unit_price: true,
          currency_code: true,
          min_charge: true,
        },
      }),
    );

    return { success: true, data: rows };
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantServiceCatalogItem.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!row) throw new NotFoundException("Service catalog item not found.");
    return { success: true, data: row };
  }

  async create(
    tenantId: string,
    dto: CreateServiceCatalogItemDto,
    actorId?: string,
  ) {
    if (dto.charge_code_id) {
      await this.assertChargeCode(tenantId, dto.charge_code_id);
    }

    try {
      const row = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.tenantServiceCatalogItem.create({
          data: {
            tenant_id: tenantId,
            code: dto.code.toUpperCase(),
            name: dto.name,
            job_type: dto.job_type,
            charge_code_id: dto.charge_code_id,
            pricing_basis: dto.pricing_basis,
            unit_price: dto.unit_price,
            currency_code: dto.currency_code.toUpperCase(),
            min_charge: dto.min_charge ?? 0,
            is_portal_visible: dto.is_portal_visible ?? true,
            is_active: dto.is_active ?? true,
            sort_order: dto.sort_order ?? 0,
            created_by: actorId,
            updated_by: actorId,
          },
        }),
      );
      return { success: true, data: row };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictException(
          `Service code '${dto.code}' already exists.`,
        );
      }
      throw err;
    }
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateServiceCatalogItemDto,
    actorId?: string,
  ) {
    await this.findOne(tenantId, id);
    if (dto.charge_code_id) {
      await this.assertChargeCode(tenantId, dto.charge_code_id);
    }

    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantServiceCatalogItem.update({
        where: { id },
        data: {
          ...dto,
          ...(dto.code ? { code: dto.code.toUpperCase() } : {}),
          ...(dto.currency_code
            ? { currency_code: dto.currency_code.toUpperCase() }
            : {}),
          updated_by: actorId,
        },
      }),
    );
    return { success: true, data: row };
  }

  async softDelete(tenantId: string, id: string, actorId?: string) {
    await this.findOne(tenantId, id);
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantServiceCatalogItem.update({
        where: { id },
        data: { deleted_at: new Date(), updated_by: actorId },
      }),
    );
    return { success: true, message: "Service catalog item deleted." };
  }

  async findByCodes(tenantId: string, codes: string[], jobType?: JobType) {
    const normalized = codes.map((c) => c.toUpperCase());
    const where: Prisma.TenantServiceCatalogItemWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      is_active: true,
      code: { in: normalized },
    };
    if (jobType) {
      where.OR = [{ job_type: null }, { job_type: jobType }];
    }

    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenantServiceCatalogItem.findMany({ where }),
    );
  }

  private async assertChargeCode(tenantId: string, chargeCodeId: string) {
    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.chargeCode.findFirst({
        where: { id: chargeCodeId, tenant_id: tenantId, deleted_at: null },
      }),
    );
    if (!exists) throw new NotFoundException("Charge code not found.");
  }
}
